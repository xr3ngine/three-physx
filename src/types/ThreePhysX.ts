import type { Object3D } from 'three';

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

export enum PhysXBodyType {
  STATIC,
  DYNAMIC,
  KINEMATIC,
}

export interface PhysXShapeConfig {
  id: number;
  shape: PhysXModelShapes;
  vertices?: number[];
  indices?: number[];
  transform?: PhysXBodyTransform;
  options?: {
    boxExtents?: number[];
    sphereRadius?: number;
  };
}

export interface RigidBodyProxy {
  id: number;
  transform: PhysXBodyData;
  shapes: PhysXShapeConfig[];
  bodyOptions: {
    type?: PhysXBodyType;
    trigger?: boolean;
  };
  addEventListener?: any
  removeEventListener?: any
  hasEventListener?: any
  dispatchEvent?: any
}
export interface PhysXUserData {
  type: PhysXBodyType;
  bodyData: PhysXBodyData;
  id: number;
}

export interface Object3DBody extends Object3D {
  body: RigidBodyProxy;
}

export enum PhysXEvents {
  COLLISION_START = 'COLLISION_START',
  COLLISION_PERSIST = 'COLLISION_PERSIST',
  COLLISION_END = 'COLLISION_END',

  TRIGGER_START = 'TRIGGER_START',
  TRIGGER_END = 'TRIGGER_END',
}
