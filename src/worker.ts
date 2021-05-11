///<reference path="./types/PhysX.d.ts"/>

import { Matrix4 } from 'three';
import { getShape } from './getShape';
import { PhysXConfig, BodyType, RigidBody, Shape, ControllerConfig, SceneQuery, SceneQueryType, RaycastHit, CollisionEvents, ControllerEvents } from './types/ThreePhysX';
import { MessageQueue } from './utils/MessageQueue';
import * as BufferConfig from './BufferConfig';
import { getFromPhysXHeap, putIntoPhysXHeap } from './utils/misc';

let lastSimulationTick = 0;

export class PhysXManager {
  static instance: PhysXManager;

  physxVersion: number;
  defaultErrorCallback: PhysX.PxDefaultErrorCallback;
  allocator: PhysX.PxDefaultAllocator;
  foundation: PhysX.PxFoundation;
  cookingParamas: PhysX.PxCookingParams;
  cooking: PhysX.PxCooking;
  physics: PhysX.PxPhysics;
  scale: PhysX.PxTolerancesScale;
  sceneDesc: PhysX.PxSceneDesc;
  scene: PhysX.PxScene;
  controllerManager: PhysX.PxControllerManager;
  obstacleContext: PhysX.PxObstacleContext;

  updateInterval: any;
  tps: number = 120;
  onUpdate: any;
  onEvent: any;
  transformArray: Float32Array;

  bodies: Map<number, PhysX.PxRigidActor> = new Map<number, PhysX.PxRigidActor>();
  dynamic: Map<number, PhysX.PxRigidActor> = new Map<number, PhysX.PxRigidActor>();
  shapes: Map<number, PhysX.PxShape> = new Map<number, PhysX.PxShape>();
  shapeIDByPointer: Map<number, number> = new Map<number, number>();
  controllerIDByPointer: Map<number, number> = new Map<number, number>();
  bodyIDByShapeID: Map<number, number> = new Map<number, number>();
  matrices: Map<number, Matrix4> = new Map<number, Matrix4>();
  indices: Map<number, number> = new Map<number, number>();
  controllers: Map<number, PhysX.PxController> = new Map<number, PhysX.PxController>();
  raycasts: Map<number, SceneQuery> = new Map<number, SceneQuery>();
  obstacles: Map<number, number> = new Map<number, number>();
  // constraints: // TODO
  physx: any;

  constructor(physx) {
    (globalThis as any).PhysX = physx;
  }

  initPhysX = (config: PhysXConfig = {}): void => {
    if (config.tps) {
      this.tps = config.tps;
    }
    this.physxVersion = PhysX.PX_PHYSICS_VERSION;
    this.defaultErrorCallback = new PhysX.PxDefaultErrorCallback();
    this.allocator = new PhysX.PxDefaultAllocator();
    const tolerance = new PhysX.PxTolerancesScale();
    tolerance.length = 0.01;
    this.foundation = PhysX.PxCreateFoundation(this.physxVersion, this.allocator, this.defaultErrorCallback);
    this.cookingParamas = new PhysX.PxCookingParams(tolerance);
    this.cooking = PhysX.PxCreateCooking(this.physxVersion, this.foundation, this.cookingParamas);
    this.physics = PhysX.PxCreatePhysics(this.physxVersion, this.foundation, tolerance, false, null);

    const triggerCallback = {
      onContactBegin: (shapeA: PhysX.PxShape, shapeB: PhysX.PxShape) => {
        this.onEvent({
          event: CollisionEvents.COLLISION_START,
          idA: this.shapeIDByPointer.get(shapeA.$$.ptr),
          idB: this.shapeIDByPointer.get(shapeB.$$.ptr),
        });
      },
      onContactEnd: (shapeA: PhysX.PxShape, shapeB: PhysX.PxShape) => {
        this.onEvent({
          event: CollisionEvents.COLLISION_END,
          idA: this.shapeIDByPointer.get(shapeA.$$.ptr),
          idB: this.shapeIDByPointer.get(shapeB.$$.ptr),
        });
      },
      onContactPersist: (shapeA: PhysX.PxShape, shapeB: PhysX.PxShape) => {
        this.onEvent({
          event: CollisionEvents.COLLISION_PERSIST,
          idA: this.shapeIDByPointer.get(shapeA.$$.ptr),
          idB: this.shapeIDByPointer.get(shapeB.$$.ptr),
        });
      },
      onTriggerStart: (shapeA: PhysX.PxShape, shapeB: PhysX.PxShape) => {
        console.log(shapeA, shapeB);
        this.onEvent({
          event: CollisionEvents.TRIGGER_START,
          idA: this.shapeIDByPointer.get(shapeA.$$.ptr),
          idB: this.shapeIDByPointer.get(shapeB.$$.ptr),
        });
      },
      onTriggerEnd: (shapeA: PhysX.PxShape, shapeB: PhysX.PxShape) => {
        console.log(shapeA, shapeB);
        this.onEvent({
          event: CollisionEvents.TRIGGER_END,
          idA: this.shapeIDByPointer.get(shapeA.$$.ptr),
          idB: this.shapeIDByPointer.get(shapeB.$$.ptr),
        });
      },
    };

    this.scale = this.physics.getTolerancesScale();
    if (config.lengthScale) {
      this.scale.length = config.lengthScale;
    }
    this.sceneDesc = PhysX.getDefaultSceneDesc(this.scale, 0, PhysX.PxSimulationEventCallback.implement(triggerCallback as any));
    this.sceneDesc.bounceThresholdVelocity = 0.001;

    this.scene = this.physics.createScene(this.sceneDesc);
    this.controllerManager = PhysX.PxCreateControllerManager(this.scene, false);
    this.obstacleContext = this.controllerManager.createObstacleContext();

    if (config.start) {
      this.startPhysX(true);
    }
  };

  simulate = () => {
    const now = Date.now();
    const delta = now - lastSimulationTick;
    lastSimulationTick = now;
    this.scene.simulate(delta / 1000, true);
    this.scene.fetchResults(true);
    const bodyArray = new Float32Array(new ArrayBuffer(4 * BufferConfig.BODY_DATA_SIZE * this.bodies.size));
    let offset = 0;
    this.bodies.forEach((body: PhysX.PxRigidActor, id: number) => {
      bodyArray.set([id], offset);
      if (isDynamicBody(body)) {
        bodyArray.set([...getBodyData(body)], offset + 1);
      } else if (isControllerBody(body)) {
        const controller = this.controllers.get(id);
        const { x, y, z } = controller.getPosition();
        bodyArray.set([x, y, z, ...(controller as any)._collisions], offset + 1);
      }
      offset += BufferConfig.BODY_DATA_SIZE;
    });
    const raycastResults = {};
    this.raycasts.forEach((raycastQuery, id) => {
      const hits = this._getRaycastResults(raycastQuery);
      raycastResults[id] = hits;
    });
    this.onUpdate({ raycastResults, bodyArray }); //, shapeArray);
  };

  update = (kinematicBodiesArray: Float32Array, controllerBodiesArray: Float32Array, raycastQueryArray: Float32Array, deltaTime: number) => {
    let offset = 0;
    while (offset < kinematicBodiesArray.length) {
      const id = kinematicBodiesArray[offset];
      const body = this.bodies.get(id) as PhysX.PxRigidDynamic;
      if (!body) return;

      const currentPose = body.getGlobalPose();
      currentPose.translation.x = kinematicBodiesArray[offset + 1];
      currentPose.translation.y = kinematicBodiesArray[offset + 2];
      currentPose.translation.z = kinematicBodiesArray[offset + 3];
      currentPose.rotation.x = kinematicBodiesArray[offset + 4];
      currentPose.rotation.y = kinematicBodiesArray[offset + 5];
      currentPose.rotation.z = kinematicBodiesArray[offset + 6];
      currentPose.rotation.w = kinematicBodiesArray[offset + 7];
      body.setKinematicTarget(currentPose);
      body.setGlobalPose(currentPose, true);
      offset += BufferConfig.KINEMATIC_DATA_SIZE;
    }
    offset = 0;
    while (offset < controllerBodiesArray.length) {
      const id = controllerBodiesArray[offset];
      const controller = this.controllers.get(id) as PhysX.PxController;
      if (!controller) return;
      (controller as any)._delta.x += controllerBodiesArray[offset + 1];
      (controller as any)._delta.y += controllerBodiesArray[offset + 2];
      (controller as any)._delta.z += controllerBodiesArray[offset + 3];
      const filters = new PhysX.PxControllerFilters((controller as any)._filterData, null, null);
      const collisionFlags = controller.move((controller as any)._delta, 0.001, deltaTime, filters, this.obstacleContext);
      (controller as any)._delta = { x: 0, y: 0, z: 0 };
      (controller as any)._needsUpdate = false;
      const collisions = {
        down: collisionFlags.isSet(PhysX.PxControllerCollisionFlag.eCOLLISION_DOWN) ? 1 : 0,
        sides: collisionFlags.isSet(PhysX.PxControllerCollisionFlag.eCOLLISION_SIDES) ? 1 : 0,
        up: collisionFlags.isSet(PhysX.PxControllerCollisionFlag.eCOLLISION_UP) ? 1 : 0,
      };
      (controller as any)._collisions = [collisions.down, collisions.sides, collisions.up];
      offset += BufferConfig.CONTROLLER_DATA_SIZE;
    }
    offset = 0;
    while (offset < raycastQueryArray.length) {
      const id = raycastQueryArray[offset];
      const raycast = this.raycasts.get(id);
      if (!raycast) return;
      const newOriginPos = {
        x: raycastQueryArray[offset + 1],
        y: raycastQueryArray[offset + 2],
        z: raycastQueryArray[offset + 3],
      };
      const newDir = {
        x: raycastQueryArray[offset + 4],
        y: raycastQueryArray[offset + 5],
        z: raycastQueryArray[offset + 6],
      };
      raycast.origin = newOriginPos;
      raycast.direction = newDir;
      offset += BufferConfig.RAYCAST_DATA_SIZE;
    }
  };

  startPhysX = (start: boolean = true) => {
    if (start) {
      lastSimulationTick = Date.now();
      this.updateInterval = setInterval(this.simulate, 1000 / this.tps);
    } else {
      clearInterval(this.updateInterval);
    }
  };

  addBody = (config: RigidBody) => {
    const { id, transform, shapes, type } = config;

    let rigidBody: PhysX.PxRigidStatic | PhysX.PxRigidDynamic;

    if (type === BodyType.STATIC) {
      rigidBody = this.physics.createRigidStatic(transform);
    } else {
      rigidBody = this.physics.createRigidDynamic(transform);
    }
    (rigidBody as any)._type = type;

    const bodyShapes: PhysX.PxShape[] = [];
    shapes.forEach(({ id: shapeID, shape, transform, options, config }: Shape) => {
      const bodyShape = getShape({
        shape,
        transform,
        options,
        config,
      });
      if (!bodyShape) return;
      bodyShape.setContactOffset(config?.contactOffset ?? 0.0000001);
      let collisionLayer = defaultMask;
      let collisionMask = defaultMask;
      if (typeof config?.collisionLayer !== 'undefined') {
        collisionLayer = config.collisionLayer;
        (bodyShape as any)._collisionLayer = collisionLayer;
      }
      if (typeof config?.collisionMask !== 'undefined') {
        collisionMask = config.collisionMask;
        (bodyShape as any)._collisionMask = collisionMask;
      }
      bodyShape.setSimulationFilterData(new PhysX.PxFilterData(collisionLayer, collisionMask, 0, 0));
      bodyShape.setQueryFilterData(new PhysX.PxFilterData(collisionLayer, collisionMask, 0, 0));
      bodyShapes.push(bodyShape);
      rigidBody.attachShape(bodyShape);
      this.shapeIDByPointer.set(bodyShape.$$.ptr, shapeID);
      this.shapes.set(shapeID, bodyShape);
      this.bodyIDByShapeID.set(shapeID, id);
    });
    this.bodies.set(id, rigidBody);
    this.scene.addActor(rigidBody, null);

    delete config.type;
    this.updateBody(config);
  };

  updateBody = (config: RigidBody) => {
    const body = this.bodies.get(config.id);
    if (!isStaticBody(body)) {
      if (typeof config.type !== 'undefined') {
        const transform = body.getGlobalPose();
        if (config.type === BodyType.KINEMATIC) {
          (body as PhysX.PxRigidDynamic).setRigidBodyFlag(PhysX.PxRigidBodyFlag.eKINEMATIC, true);
          (body as any)._type = BodyType.KINEMATIC;
        } else {
          (body as PhysX.PxRigidDynamic).setRigidBodyFlag(PhysX.PxRigidBodyFlag.eKINEMATIC, false);
          (body as any)._type = BodyType.DYNAMIC;
        }
        body.setGlobalPose(transform, true);
      }
      if (config.mass) {
        (body as PhysX.PxRigidDynamic).setMass(config.mass);
      }
      if (config.linearDamping) {
        (body as PhysX.PxRigidDynamic).setLinearDamping(config.linearDamping);
      }
      if (config.angularDamping) {
        (body as PhysX.PxRigidDynamic).setAngularDamping(config.angularDamping);
      }
    }
    if (config.linearVelocity) {
      const linearVelocity = body.getLinearVelocity();
      body.setLinearVelocity({ x: config.linearVelocity.x ?? linearVelocity.x, y: config.linearVelocity.y ?? linearVelocity.x, z: config.linearVelocity.z ?? linearVelocity.z }, true);
    }
    if (config.angularVelocity) {
      const angularVelocity = body.getAngularVelocity();
      body.setAngularVelocity({ x: config.angularVelocity.x ?? angularVelocity.x, y: config.angularVelocity.y ?? angularVelocity.x, z: config.angularVelocity.z ?? angularVelocity.z }, true);
    }
    if (config.transform) {
      const transform = body.getGlobalPose();
      transform.translation.x = config.transform.translation.x ?? transform.translation.x;
      transform.translation.y = config.transform.translation.y ?? transform.translation.y;
      transform.translation.z = config.transform.translation.z ?? transform.translation.z;
      transform.rotation.x = config.transform.rotation.x ?? transform.rotation.x;
      transform.rotation.y = config.transform.rotation.y ?? transform.rotation.y;
      transform.rotation.z = config.transform.rotation.z ?? transform.rotation.z;
      transform.rotation.w = config.transform.rotation.w ?? transform.rotation.w;
      body.setGlobalPose(transform, true);
    }
    config.shapes?.forEach((shape) => this._updateShape(shape));
  };

  _updateShape({ id, config, options, shape, transform }: Shape) {
    const { isTrigger, contactOffset, collisionLayer, collisionMask, material } = config;
    const shapePx = this.shapes.get(id);
    if (!shapePx) return;
    if (typeof isTrigger !== 'undefined') {
      if (isTrigger) {
        shapePx.setFlag(PhysX.PxShapeFlag.eSIMULATION_SHAPE, !isTrigger);
        shapePx.setFlag(PhysX.PxShapeFlag.eTRIGGER_SHAPE, isTrigger);
      } else {
        shapePx.setFlag(PhysX.PxShapeFlag.eTRIGGER_SHAPE, isTrigger);
        shapePx.setFlag(PhysX.PxShapeFlag.eSIMULATION_SHAPE, !isTrigger);
      }
    }
    if (typeof collisionLayer !== 'undefined') {
      (shapePx as any)._collisionLayer = collisionLayer;
      shapePx.setSimulationFilterData(new PhysX.PxFilterData((shapePx as any)._collisionLayer, (shapePx as any)._collisionMask, 0, 0));
      shapePx.setQueryFilterData(new PhysX.PxFilterData((shapePx as any)._collisionLayer, (shapePx as any)._collisionMask, 0, 0));
    }
    if (typeof collisionMask !== 'undefined') {
      (shapePx as any)._collisionMask = collisionMask;
      shapePx.setSimulationFilterData(new PhysX.PxFilterData((shapePx as any)._collisionLayer, (shapePx as any)._collisionMask, 0, 0));
      shapePx.setQueryFilterData(new PhysX.PxFilterData((shapePx as any)._collisionLayer, (shapePx as any)._collisionMask, 0, 0));
    }
    if (typeof material !== 'undefined') {
      const materials = shapePx.getMaterials() as PhysX.PxMaterial;
      if (typeof material.staticFriction !== 'undefined') {
        materials.setStaticFriction(material.staticFriction);
      }
      if (typeof material.dynamicFriction !== 'undefined') {
        materials.setDynamicFriction(material.dynamicFriction);
      }
      if (typeof material.restitution !== 'undefined') {
        materials.setRestitution(material.restitution);
      }
    }
    if (typeof contactOffset !== 'undefined') {
      shapePx.setContactOffset(contactOffset);
    }
  }

  removeBody = ({ id }) => {
    const body = this.bodies.get(id);
    if (!body) return;
    try {
      this.scene.removeActor(body, false);
      this.bodies.delete(id);
      return true;
    } catch (e) {
      console.log(e, id, body);
    }
  };

  createController = ({ id, config }: { id: number; config: ControllerConfig }) => {
    const controllerDesc = config.isCapsule ? new PhysX.PxCapsuleControllerDesc() : new PhysX.PxBoxControllerDesc();
    controllerDesc.position = { x: config.position?.x ?? 0, y: config.position?.y ?? 0, z: config.position?.z ?? 0 };
    if (config.isCapsule) {
      (controllerDesc as PhysX.PxCapsuleControllerDesc).height = config.height;
      (controllerDesc as PhysX.PxCapsuleControllerDesc).radius = config.radius;
      (controllerDesc as PhysX.PxCapsuleControllerDesc).climbingMode = config.climbingMode ?? PhysX.PxCapsuleClimbingMode.eEASY;
    } else {
      (controllerDesc as PhysX.PxBoxControllerDesc).halfForwardExtent = config.halfForwardExtent;
      (controllerDesc as PhysX.PxBoxControllerDesc).halfHeight = config.halfHeight;
      (controllerDesc as PhysX.PxBoxControllerDesc).halfSideExtent = config.halfSideExtent;
    }
    controllerDesc.stepOffset = config.stepOffset ?? 0.1;
    controllerDesc.maxJumpHeight = config.maxJumpHeight ?? 0.1;
    controllerDesc.contactOffset = config.contactOffset ?? 0.01;
    controllerDesc.invisibleWallHeight = config.invisibleWallHeight ?? 0;
    controllerDesc.slopeLimit = config.slopeLimit ?? Math.cos((45 * Math.PI) / 180);
    controllerDesc.setReportCallback(
      PhysX.PxUserControllerHitReport.implement({
        onShapeHit: (event: PhysX.PxControllerShapeHit) => {
          const shape = event.getShape();
          const shapeID = this.shapeIDByPointer.get(shape.$$.ptr);
          const bodyID = this.bodyIDByShapeID.get(shapeID);
          const position = event.getWorldPos();
          const normal = event.getWorldNormal();
          const length = event.getLength();
          this.onEvent({ event: ControllerEvents.CONTROLLER_SHAPE_HIT, controllerID: id, bodyID, shapeID, position, normal, length });
        },
        onControllerHit: (event: PhysX.PxControllersHit) => {
          const other = event.getOther();
          const bodyID = this.controllerIDByPointer.get(other.$$.ptr);
          const shapeID = this.shapeIDByPointer.get((other.getActor().getShapes() as PhysX.PxShape).$$.ptr);
          const position = event.getWorldPos();
          const normal = event.getWorldNormal();
          const length = event.getLength();
          this.onEvent({ event: ControllerEvents.CONTROLLER_CONTROLLER_HIT, controllerID: id, bodyID, shapeID, position, normal, length });
        },
        onObstacleHit: (event: PhysX.PxControllerObstacleHit) => {
          const obstacleID = event.getUserData();
          // TODO
          // const data = getFromPhysXHeap(PhysX.HEAPU32, ptr, 1);
          const position = event.getWorldPos();
          const normal = event.getWorldNormal();
          const length = event.getLength();
          this.onEvent({ event: ControllerEvents.CONTROLLER_OBSTACLE_HIT, controllerID: id, obstacleID, position, normal, length });
        },
      }),
    );
    controllerDesc.setMaterial(this.physics.createMaterial(config.material?.staticFriction ?? 0, config.material?.dynamicFriction ?? 0, config.material?.restitution ?? 0));
    if (!controllerDesc.isValid()) {
      console.warn('[WARN] Controller Description invalid!');
    }
    const controller = config.isCapsule ? this.controllerManager.createCapsuleController(controllerDesc) : this.controllerManager.createBoxController(controllerDesc);
    this.controllers.set(id, controller);
    this.controllerIDByPointer.set(controller.$$.ptr, id);
    const actor = controller.getActor();
    this.bodies.set(id, actor as any);
    const shapes = actor.getShapes() as PhysX.PxShape;
    this.shapeIDByPointer.set(shapes.$$.ptr, config.id);
    (controller as any)._collisions = [];
    (actor as any)._type = BodyType.CONTROLLER;
    // todo
    shapes.setSimulationFilterData(new PhysX.PxFilterData(config.collisionLayer ?? defaultMask, config.collisionMask ?? defaultMask, 0, 0));
    shapes.setQueryFilterData(new PhysX.PxFilterData(config.collisionLayer ?? defaultMask, config.collisionMask ?? defaultMask, 0, 0));
    (controller as any)._filterData = new PhysX.PxFilterData(config.collisionLayer ?? defaultMask, config.collisionMask ?? defaultMask, 0, 0);
    (controller as any)._delta = { x: 0, y: 0, z: 0 };
  };

  updateController = (config: ControllerConfig) => {
    const controller = this.controllers.get(config.id);
    if (!controller) return;
    if (typeof config.positionDelta !== 'undefined') {
      const currentPos = controller.getPosition();
      controller.setPosition({
        x: currentPos.x + (config.positionDelta.x ?? 0),
        y: currentPos.y + (config.positionDelta.y ?? 0),
        z: currentPos.z + (config.positionDelta.z ?? 0),
      });
    }
    if (typeof config.position !== 'undefined') {
      const currentPos = controller.getPosition();
      controller.setPosition({
        x: config.position.x ?? currentPos.x,
        y: config.position.y ?? currentPos.y,
        z: config.position.z ?? currentPos.z,
      });
    }
    if (typeof config.height !== 'undefined') {
      (controller as PhysX.PxCapsuleController).setHeight(config.height);
    }
    if (typeof config.resize !== 'undefined') {
      (controller as PhysX.PxController).resize(config.resize);
    }
    if (typeof config.radius !== 'undefined') {
      (controller as PhysX.PxCapsuleController).setRadius(config.radius);
    }
    if (typeof config.climbingMode !== 'undefined') {
      (controller as PhysX.PxCapsuleController).setClimbingMode(config.climbingMode);
    }
    if (typeof config.halfForwardExtent !== 'undefined') {
      (controller as PhysX.PxBoxController).setHalfForwardExtent(config.halfForwardExtent);
    }
    if (typeof config.halfHeight !== 'undefined') {
      (controller as PhysX.PxBoxController).setHalfHeight(config.halfHeight);
    }
    if (typeof config.halfSideExtent !== 'undefined') {
      (controller as PhysX.PxBoxController).setHalfSideExtent(config.halfSideExtent);
    }
    // TODO: implement rest of ControllerConfig
  };

  removeController = ({ id }) => {
    const controller = this.controllers.get(id);
    if (!controller) return;
    const actor = controller.getActor();
    const shapes = actor.getShapes() as PhysX.PxShape;
    this.controllerIDByPointer.delete(controller.$$.ptr);
    this.shapeIDByPointer.delete(shapes.$$.ptr);
    this.controllers.delete(id);
    this.bodies.delete(id);
    controller.release();
    // todo
  };

  addRaycastQuery = (query: SceneQuery) => {
    (query as any)._filterData = new PhysX.PxQueryFilterData();
    (query as any)._filterData.setWords(query.collisionMask ?? 1, 0);
    if (typeof query.flags === 'undefined') {
      query.flags = PhysX.PxQueryFlag.eSTATIC.value | PhysX.PxQueryFlag.eDYNAMIC.value | PhysX.PxQueryFlag.eANY_HIT.value;
    }
    (query as any)._filterData.setFlags(query.flags);
    this.raycasts.set(query.id, query);
  };

  updateRaycastQuery = (newArgs: SceneQuery) => {
    const { id, flags, maxDistance, maxHits, collisionMask } = newArgs;
    const raycast = this.raycasts.get(id);
    if (!raycast) return;
    if (typeof flags !== 'undefined') {
      raycast.flags = flags;
    }
    if (typeof maxDistance !== 'undefined') {
      raycast.maxDistance = maxDistance;
    }
    if (typeof maxHits !== 'undefined') {
      raycast.maxHits = maxHits;
    }
    if (typeof collisionMask !== 'undefined') {
      raycast.collisionMask = collisionMask;
      (raycast as any)._filterData.setWords(raycast.collisionMask ?? 1, 1);
    }
  };

  removeRaycastQuery = (id: number) => {
    this.raycasts.delete(id);
  };

  addObstacle = ({ id, isCapsule, position, rotation, halfExtents, halfHeight, radius }) => {
    const obstacle = new (isCapsule ? PhysX.PxCapsuleObstacle : PhysX.PxBoxObstacle)();
    // todo: allow for more than a single int in memory for userData
    obstacle.setUserData(putIntoPhysXHeap(PhysX.HEAPU32, [id]));
    obstacle.setPosition(position);
    obstacle.setRotation(rotation);
    halfExtents && (obstacle as PhysX.PxBoxObstacle).setHalfExtents(halfExtents);
    halfHeight && (obstacle as PhysX.PxCapsuleObstacle).setHalfHeight(halfHeight);
    radius && (obstacle as PhysX.PxCapsuleObstacle).setRadius(radius);
    const handle = this.obstacleContext.addObstacle(obstacle);
    this.obstacles.set(id, handle);
  };

  removeObstacle = (id: number) => {
    const handle = this.obstacles.get(id);
    this.obstacleContext.removeObstacle(handle);
    this.obstacles.delete(id);
  };

  addConstraint = () => {
    // todo
  };

  removeConstraint = () => {
    // todo
  };

  _getRaycastResults = (raycastQuery: SceneQuery) => {
    const hits: RaycastHit[] = [];
    if (raycastQuery.type === SceneQueryType.Closest) {
      const buffer: PhysX.PxRaycastHit = new PhysX.PxRaycastHit();
      const filterData: PhysX.PxQueryFilterData = (raycastQuery as any)._filterData;
      // todo - implement query filter bindings
      // const queryCallback = PhysX.PxQueryFilterCallback.implement({
      //   preFilter: (filterData, shape, actor) => { return PhysX.PxQueryHitType.eBLOCK },
      //   postFilter: (filterData, hit) => { return PhysX.PxQueryHitType.eBLOCK  }
      // });
      const hasHit = this.scene.raycastSingle(raycastQuery.origin, raycastQuery.direction, raycastQuery.maxDistance, raycastQuery.flags, buffer, filterData);
      // console.log(buffer.distance)
      if (hasHit) {
        hits.push({
          distance: buffer.distance,
          normal: buffer.normal,
          position: buffer.position,
          _bodyID: this.bodyIDByShapeID.get(this.shapeIDByPointer.get(buffer.getShape().$$.ptr)),
        });
      }
    }
    // const buffer: PhysX.PxRaycastBuffer = PhysX.allocateRaycastHitBuffers(raycastQuery.maxHits);
    // const hasHit = this.scene.raycast(raycastQuery.origin, raycastQuery.direction, raycastQuery.maxDistance, buffer);
    // if (hasHit) {

    // if(raycastQuery.flags) {
    //   for (let index = 0; index < buffer.getNbTouches(); index++) {

    //   }
    // } else {
    //   for (let index = 0; index < buffer.getNbAnyHits(); index++) {
    //     const touch = buffer.getAnyHit(index);
    //     const shape = this.shapeIDByPointer.get(touch.getShape().$$.ptr);
    //     hits.push({
    //       shape,
    //     });
    //   }
    // }
    // }
    return hits;
  };

  _classFunc = (type, func, id, ...args) => {
    // console.log(this.bodies.get(id), this.bodies.get(id)[func]);
    switch (type) {
      case 'body':
        this.bodies.get(id)[func](...args);
        break;
      case 'obstacle':
        const obstacle = this.obstacleContext.getObstacleByHandle(this.obstacles.get(id));
        obstacle[func](...args);
        break;
    }
  };

  _diagnostic = () => {
    const diagnosticData: any = {};
    diagnosticData.bodies = Array.from(PhysXManager.instance.bodies.values()).map((body) => {
      return {
        body,
        transform: body.getGlobalPose(),
        type: BodyType[(body as any)._type],
      };
    });
    diagnosticData.raycasts = Array.from(PhysXManager.instance.raycasts.values());
    return diagnosticData;
  };
}

const isKinematicBody = (body: PhysX.PxRigidActor) => {
  return (body as any)._type === BodyType.KINEMATIC;
};

const isControllerBody = (body: PhysX.PxRigidActor) => {
  return (body as any)._type === BodyType.CONTROLLER;
};

const isDynamicBody = (body: PhysX.PxRigidActor) => {
  return (body as any)._type === BodyType.DYNAMIC;
};

const isStaticBody = (body: PhysX.PxRigidActor) => {
  return (body as any)._type === BodyType.STATIC;
};

const getBodyData = (body: PhysX.PxRigidActor) => {
  const transform = body.getGlobalPose();
  const linVel = body.getLinearVelocity();
  const angVel = body.getAngularVelocity();
  return [transform.translation.x, transform.translation.y, transform.translation.z, transform.rotation.x, transform.rotation.y, transform.rotation.z, transform.rotation.w, linVel.x, linVel.y, linVel.z, angVel.x, angVel.y, angVel.z];
};

const defaultMask = 1 << 0;

export const receiveWorker = async (physx): Promise<void> => {
  const messageQueue = new MessageQueue(globalThis as any);
  globalThis.messageQueue = messageQueue;
  let latestEvents = [];
  PhysXManager.instance = new PhysXManager(physx);
  messageQueue.sendEvent('init', {});
  messageQueue.sendQueue();
  await new Promise<void>((resolve) => {
    messageQueue.addEventListener('initphysx', ({ detail }) => {
      PhysXManager.instance.initPhysX(detail);
      resolve();
    });
    messageQueue.sendQueue();
  });
  messageQueue.sendEvent('initphysx', {});
  messageQueue.sendQueue();
  globalThis.physXManager = PhysXManager.instance;
  PhysXManager.instance.onUpdate = ({ raycastResults, bodyArray }) => {
    messageQueue.sendEvent('data', { raycastResults, bodyArray }, [bodyArray.buffer]);
    messageQueue.sendEvent('colliderEvent', [...latestEvents]);
    messageQueue.sendQueue();
    latestEvents = [];
  };
  PhysXManager.instance.onEvent = (data) => {
    latestEvents.push(data);
  };
  Object.keys(PhysXManager.instance).forEach((key) => {
    if (typeof PhysXManager.instance[key] === 'function') {
      messageQueue.addEventListener(key, ({ detail }) => {
        PhysXManager.instance[key](...detail.args);
      });
    }
  });

  globalThis.diagnostic = () => {
    console.log('=== PhysXInstance Diagnostic ===');
    console.log(PhysXManager.instance._diagnostic());
    console.log(PhysXManager.instance);
  };
};
