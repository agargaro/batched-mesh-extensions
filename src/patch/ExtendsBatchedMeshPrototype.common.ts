import { BatchedMesh } from 'three';
import { computeBVH } from '../core/feature/ComputeBVH';
import { BVHCulling, frustumCulling, linearCulling, onBeforeRender, updateIndexArray, updateRenderList } from '../core/feature/FrustumCulling';
import { applyMatrixAtToSphere, getPositionAndMaxScaleOnAxisAt, getPositionAt } from '../core/feature/GetPositionAt';
import { addGeometryLOD, getLODIndex } from '../core/feature/LOD';
import { checkInstanceIntersection, raycast } from '../core/feature/Raycasting';

/**
 * @internal
 * Enhances the BatchedMesh prototype with additional methods.
 */
export function extendBatchedMeshPrototypeCommon(): void {
  BatchedMesh.prototype.computeBVH = computeBVH;

  BatchedMesh.prototype.onBeforeRender = onBeforeRender;
  BatchedMesh.prototype.frustumCulling = frustumCulling;
  BatchedMesh.prototype.updateIndexArray = updateIndexArray;
  BatchedMesh.prototype.updateRenderList = updateRenderList;
  BatchedMesh.prototype.BVHCulling = BVHCulling;
  BatchedMesh.prototype.linearCulling = linearCulling;

  BatchedMesh.prototype.getPositionAt = getPositionAt;
  BatchedMesh.prototype.getPositionAndMaxScaleOnAxisAt = getPositionAndMaxScaleOnAxisAt;
  BatchedMesh.prototype.applyMatrixAtToSphere = applyMatrixAtToSphere;

  BatchedMesh.prototype.addGeometryLOD = addGeometryLOD;
  BatchedMesh.prototype.getLODIndex = getLODIndex;

  BatchedMesh.prototype.raycast = raycast;
  BatchedMesh.prototype.checkInstanceIntersection = checkInstanceIntersection;
}
