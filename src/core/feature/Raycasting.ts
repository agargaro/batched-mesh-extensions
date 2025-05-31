import { BatchedMesh, Box3, Intersection, Matrix4, Mesh, Ray, Raycaster, Sphere, Vector3 } from 'three';
import { } from 'three-mesh-bvh'; // include only types

declare module 'three' {
  interface BatchedMesh {
    checkInstanceIntersection(raycaster: Raycaster, objectIndex: number, result: Intersection[]): void;
  }
}

const _intersections: Intersection[] = [];
const _mesh = new Mesh();
const _ray = new Ray();
const _direction = new Vector3();
const _worldScale = new Vector3();
const _invMatrixWorld = new Matrix4();

export function raycast(this: BatchedMesh, raycaster: Raycaster, result: Intersection[]): void {
  if (!this.material || this.instanceCount === 0) return;

  _mesh.geometry = this.geometry;
  _mesh.material = this.material;

  _mesh.geometry.boundingBox ??= new Box3();
  _mesh.geometry.boundingSphere ??= new Sphere();

  const originalRay = raycaster.ray;
  const originalNear = raycaster.near;
  const originalFar = raycaster.far;

  _invMatrixWorld.copy(this.matrixWorld).invert();

  _worldScale.setFromMatrixScale(this.matrixWorld);
  _direction.copy(raycaster.ray.direction).multiply(_worldScale);
  const scaleFactor = _direction.length();

  raycaster.ray = _ray.copy(raycaster.ray).applyMatrix4(_invMatrixWorld);
  raycaster.near /= scaleFactor;
  raycaster.far /= scaleFactor;

  if (this.bvh) {
    this.bvh.raycast(raycaster, (instanceId) => this.checkInstanceIntersection(raycaster, instanceId, result));
  } else {
    if (this.boundingSphere === null) this.computeBoundingSphere();

    if (raycaster.ray.intersectsSphere(this.boundingSphere)) {
      for (let i = 0, l = this._instanceInfo.length; i < l; i++) {
        this.checkInstanceIntersection(raycaster, i, result);
      }
    }
  }

  raycaster.ray = originalRay;
  raycaster.near = originalNear;
  raycaster.far = originalFar;
}

export function checkInstanceIntersection(this: BatchedMesh, raycaster: Raycaster, instanceId: number, result: Intersection[]): void {
  const info = this._instanceInfo[instanceId];
  if (!info.active || !info.visible) return;

  const geometryId = info.geometryIndex;
  const geometryInfo = this._geometryInfo[geometryId];

  this.getMatrixAt(instanceId, _mesh.matrixWorld);

  _mesh.geometry.boundsTree = this.boundsTrees ? this.boundsTrees[geometryId] : undefined; // three-mesh-bvh compatibility

  if (!_mesh.geometry.boundsTree) {
    this.getBoundingBoxAt(geometryId, _mesh.geometry.boundingBox);
    this.getBoundingSphereAt(geometryId, _mesh.geometry.boundingSphere);
    _mesh.geometry.setDrawRange(geometryInfo.start, geometryInfo.count);
  }

  _mesh.raycast(raycaster, _intersections);

  for (const intersect of _intersections) {
    intersect.batchId = instanceId;
    intersect.object = this;
    result.push(intersect);
  }

  _intersections.length = 0;
}
