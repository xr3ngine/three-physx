import { Object3D, Quaternion, Vector3, Matrix4, BufferGeometry, Box3 } from 'three'
import { PhysXBodyConfig, PhysXModelShapes } from './worker'
import { quickhull } from './quickhull';

const PI_2 = Math.PI / 2;
enum Shape {
  BOX,
  CYLINDER,
  SPHERE,
  HULL,
  MESH,
};

type BodyShape = { size: number[], shape: PhysXModelShapes } | { shape: PhysXModelShapes, vertices: number[], faces?: number[], indices?: number[] };

export const threeToPhysXModelDescription = (object: Object3D, options: { type?: Shape } = {}): BodyShape => {
  let geometry;

  if (options.type === Shape.BOX) {
    return createBoundingBoxShape(object);
  } else if (options.type === Shape.CYLINDER) {
    throw new Error('WARNING: threeToPhysX - Cylinder shape not yet implemented')
    // return createBoundingCylinderShape(object, options);
  } else if (options.type === Shape.SPHERE) {
    return createBoundingSphereShape(object, options);
  } else if (options.type === Shape.HULL) {
    return createConvexPolyhedron(object);
  } else if (options.type === Shape.MESH) {
    geometry = getGeometry(object);
    return geometry ? createTrimeshShape(geometry) : null;
  } else if (options.type) {
    throw new Error(options.type);
  }

  geometry = getGeometry(object);
  if (!geometry) return null;

  const type = geometry.metadata
    ? geometry.metadata.type
    : geometry.type;

  switch (type) {
    case 'BoxGeometry':
    case 'BoxBufferGeometry':
      return createBoxShape(geometry);
    case 'CylinderGeometry':
    case 'CylinderBufferGeometry':
      throw new Error('WARNING: threeToPhysX - Cylinder shape not yet implemented');// createCylinderShape(geometry);
    case 'PlaneGeometry':
    case 'PlaneBufferGeometry':
      return createPlaneShape(geometry);
    case 'SphereGeometry':
    case 'SphereBufferGeometry':
      return createSphereShape(geometry);
    case 'TubeGeometry':
    case 'Geometry':
    case 'BufferGeometry':
      return createBoundingBoxShape(object);
    default:
      console.warn('Unrecognized geometry: "%s". Using bounding box as shape.', geometry.type);
      return createBoxShape(geometry);
  }
}

threeToPhysXModelDescription.Shape = Shape;


/******************************************************************************
 * Shape construction
 */

/**
 * @param  {BufferGeometry} geometry
 * @return {BodyShape}
 */
const createBoxShape = (geometry): BodyShape => {
  const { vertices } = getVerticesIndices(geometry);
  if (!vertices.length) return null;
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  return {
    size: [
      (box.max.x - box.min.x) / 2,
      (box.max.y - box.min.y) / 2,
      (box.max.z - box.min.z) / 2
    ],
    shape: PhysXModelShapes.Box
  }
}

/**
 * Bounding box needs to be computed with the entire mesh, not just geometry.
 * @param  {Object3D} mesh
 * @return {BodyShape}
 */
const createBoundingBoxShape = (object): BodyShape => {
  const box = new Box3();

  const clone = object.clone();
  clone.quaternion.set(0, 0, 0, 1);
  clone.updateMatrixWorld();

  box.setFromObject(clone);

  if (!isFinite(box.min.lengthSq())) return null;
  const localPosition = box.translate(clone.position.negate()).getCenter(new Vector3());
  if (localPosition.lengthSq()) {
    box.translate(localPosition);
  }

  return {
    size: [
      (box.max.x - box.min.x) / 2,
      (box.max.y - box.min.y) / 2,
      (box.max.z - box.min.z) / 2
    ],
    shape: PhysXModelShapes.Box
  }
}

/**
 * Computes 3D convex hull as a CANNON.ConvexPolyhedron.
 * @param  {Object3D} mesh
 * @return {BodyShape}
 */
function createConvexPolyhedron(object): BodyShape {
  let i;
  const eps = 1e-4;
  const geometry = getGeometry(object);

  if (!geometry || !geometry.attributes.position.count) return null;

  for (i = 0; i < geometry.attributes.position.count; i++) {
    geometry.attributes.position[i].x += (Math.random() - 0.5) * eps;
    geometry.attributes.position[i].y += (Math.random() - 0.5) * eps;
    geometry.attributes.position[i].z += (Math.random() - 0.5) * eps;
  }

  const hull = quickhull(geometry);

  const verticesIn = hull.getAttribute('position')
  const vertices = new Array(verticesIn.count);
  const index = hull.getIndex();

  for (i = 0; i < verticesIn.count / 3; i++) {
    vertices[i] = [verticesIn[i * 3], verticesIn[i * 3 + 1], verticesIn[i * 3 + 2]];
  }

  // Convert from Face to Array<number>.
  const faces = new Array(index.count);
  for (i = 0; i < index.count / 3; i++) {
    faces[i] = [index[i * 3], index[i * 3 + 1], index[i * 3 + 2]];
  }

  return { 
    shape: PhysXModelShapes.ConvexMesh,
    vertices,
    faces
  };
}

/**
 * @param  {BufferGeometry} geometry
 * @return {BodyShape}
 */
/* TODO
function createCylinderShape(geometry): BodyShape {
  const params = geometry.metadata ? geometry.metadata.parameters : geometry.parameters;
  const shape: any = new CANNON.Cylinder(
    params.radiusTop,
    params.radiusBottom,
    params.height,
    params.radialSegments
  );

  // Include metadata for serialization.
  shape._type = CANNON.Shape.types.CYLINDER; // Patch schteppe/cannon.js#329.
  shape.radiusTop = params.radiusTop;
  shape.radiusBottom = params.radiusBottom;
  shape.height = params.height;
  shape.numSegments = params.radialSegments;

  shape.orientation = new CANNON.Quaternion();
  shape.orientation.setFromEuler(MathUtils.degToRad(90), 0, 0, 'XYZ').normalize();
  return shape;
}*/

/**
 * @param  {Object3D} object
 * @return {BodyShape}
 */
/* TODO
function createBoundingCylinderShape(object, options): BodyShape {
  const box = new Box3();
  const axes = ['x', 'y', 'z'];
  const majorAxis = options.cylinderAxis || 'y';
  const minorAxes = axes.splice(axes.indexOf(majorAxis), 1) && axes;

  box.setFromObject(object);

  if (!isFinite(box.min.lengthSq())) return null;

  // Compute cylinder dimensions.
  const height = box.max[majorAxis] - box.min[majorAxis];
  const radius = 0.5 * Math.max(
    box.max[minorAxes[0]] - box.min[minorAxes[0]],
    box.max[minorAxes[1]] - box.min[minorAxes[1]]
  );

  // Create shape.
  const shape: any = new CANNON.Cylinder(radius, radius, height, 12);

  // Include metadata for serialization.
  shape._type = CANNON.Shape.types.CYLINDER; // Patch schteppe/cannon.js#329.
  shape.radiusTop = radius;
  shape.radiusBottom = radius;
  shape.height = height;
  shape.numSegments = 12;

  shape.orientation = new CANNON.Quaternion();
  shape.orientation.setFromEuler(
    majorAxis === 'y' ? PI_2 : 0,
    majorAxis === 'z' ? PI_2 : 0,
    0,
    'XYZ'
  ).normalize();
  return shape;
}*/

/**
 * @param  {BufferGeometry} geometry
 * @return {BodyShape}
 */
function createPlaneShape(geometry): BodyShape {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  return {
    shape: PhysXModelShapes.Plane,
    size: [
      (box.max.x - box.min.x) / 2 || 0.1,
      (box.max.y - box.min.y) / 2 || 0.1,
      (box.max.z - box.min.z) / 2 || 0.1
    ]
  };
}

/**
 * @param  {BufferGeometry} geometry
 * @return {BodyShape}
 */
function createSphereShape(geometry): BodyShape {
  const params = geometry.metadata
    ? geometry.metadata.parameters
    : geometry.parameters;
  
  return {
    shape: PhysXModelShapes.Sphere,
    size: [params.radius]
  }
}

/**
 * @param  {Object3D} object
 * @return {BodyShape}
 */
function createBoundingSphereShape(object, options): BodyShape {
  if (options.sphereRadius) {
    return {
      shape: PhysXModelShapes.Sphere,
      size: [options.sphereRadius]
    }
  }
  const geometry = getGeometry(object);
  if (!geometry) return null;
  geometry.computeBoundingSphere();
  return {
    shape: PhysXModelShapes.Sphere,
    size: [geometry.boundingSphere.radius]
  }
}

/**
 * @param  {BufferGeometry} geometry
 * @return {BodyShape}
 */
function createTrimeshShape(geometry): BodyShape {
  const { vertices, indices } = getVerticesIndices(geometry);

  if (!vertices.length) return null;
  return {
    shape: PhysXModelShapes.TriangleMesh,
    vertices,
    indices
  }
}

/******************************************************************************
 * Utils
 */

/**
 * Returns a single geometry for the given object. If the object is compound,
 * its geometries are automatically merged.
 * @param {Object3D} object
 * @return {BufferGeometry}
 */
export function getGeometry(object) {
  let mesh,
    tmp = new BufferGeometry();
  const meshes = getMeshes(object);

  const combined = new BufferGeometry();

  if (meshes.length === 0) return null;

  // Apply scale  – it can't easily be applied to a CANNON.Shape later.
  if (meshes.length === 1) {
    const position = new Vector3(),
      quaternion = new Quaternion(),
      scale = new Vector3();
    if (meshes[0].geometry.isBufferGeometry) {
      if (meshes[0].geometry.attributes.position
        && meshes[0].geometry.attributes.position.itemSize > 2) {
        tmp = meshes[0].geometry;
      }
    } else {
      tmp = meshes[0].geometry.clone();
    }
    //tmp.metadata = meshes[0].geometry.metadata;
    meshes[0].updateMatrixWorld();
    meshes[0].matrixWorld.decompose(position, quaternion, scale);
    return tmp.scale(scale.x, scale.y, scale.z);
  }

  // Recursively merge geometry, preserving local transforms.
  while ((mesh = meshes.pop())) {
    mesh.updateMatrixWorld();
    if (mesh.geometry.isBufferGeometry) {
      if (mesh.geometry.attributes.position
        && mesh.geometry.attributes.position.itemSize > 2) {
        const tmpGeom = mesh.geometry;
        combined.merge(tmpGeom, mesh.matrixWorld);
        tmpGeom.dispose();
      }
    } else {
      combined.merge(mesh.geometry, mesh.matrixWorld);
    }
  }

  const matrix = new Matrix4();
  matrix.scale(object.scale);
  combined.applyMatrix4(matrix);
  return combined;
}

/**
 * @param  {BufferGeometry} geometry
 * @return {Array<number>}
 */
export function getVerticesIndices(geometry) {
  const vertices = (geometry.attributes.position || {}).array || [];
  const indices = geometry.index?.array || Object.keys(vertices).map(Number);
  return { vertices, indices };
}

/**
 * Returns a flat array of Mesh instances from the given object. If
 * nested transformations are found, they are applied to child meshes
 * as mesh.userData.matrix, so that each mesh has its position/rotation/scale
 * independently of all of its parents except the top-level object.
 * @param  {Object3D} object
 * @return {Array<Mesh>}
 */
export function getMeshes(object) {
  const meshes = [];
  object.traverse((o) => {
    if (o.type === 'Mesh') {
      meshes.push(o);
    }
  });
  return meshes;
}
