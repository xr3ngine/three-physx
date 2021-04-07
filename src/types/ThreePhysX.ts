import type { Object3D, Quaternion, Vector3 } from 'three';

export interface PhysXConfig {
  jsPath: string;
  wasmPath: string;
  tps?: number;
}

export enum PhysXModelShapes {
  Sphere,
  Plane,
  // Capsule,
  Box,
  ConvexMesh,
  TriangleMesh,
  HeightField,
}

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface Quat {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface PhysXBodyTransform {
  translation: Vec3;
  rotation: Quat;
}

export interface PhysXBodyData {
  translation: Vec3;
  rotation: Quat;
  linearVelocity?: Vec3;
  angularVelocity?: Vec3;
}

export interface PhysXShapeOptions {
  boxExtents?: number[];
  sphereRadius?: number;
}

export enum PhysXBodyType {
  STATIC,
  DYNAMIC,
  KINEMATIC,
}

export interface PhysXShapeConfig {
  shape: PhysXModelShapes;
  vertices?: number[];
  indices?: number[];
  matrix?: number[];
  options?: PhysXShapeOptions;
}

export interface PhysXBodyConfig {
  shapes: PhysXShapeConfig[];
  bodyOptions: {
    type?: PhysXBodyType;
    trigger?: boolean;
  };
}

export interface PhysXUserData {
  type: PhysXBodyType;
  bodyData: PhysXBodyData;
  id: number;
}

export interface PhysXInteface {
  initPhysX: any;
  update: any;
  startPhysX: any;
  addBody: any;
  updateBody: any;
  removeBody: any;
  addConstraint: any;
  removeConstraint: any;
  enableDebug: any;
  resetDynamicBody: any;
  activateBody: any;
}

export interface Object3DBody extends Object3D {
  body: RigidBodyProxy;
}

export interface RigidBodyProxy {
  id: number;
  transform: PhysXBodyData;
  bodyConfig: PhysXBodyConfig;
}
