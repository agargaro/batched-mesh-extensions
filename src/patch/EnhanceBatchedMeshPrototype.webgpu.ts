import { BatchedMesh } from 'three';
import { computeBVH } from '../core/feature/ComputeBVH';
import { applyMatrixAtToSphere, getPositionAndMaxScaleOnAxisAt, getPositionAt } from '../core/feature/GetPositionAt';
import { checkObjectIntersection, raycast } from '../core/feature/Raycasting';
import { addGeometryLOD, getLODIndex } from '../core/feature/LOD';

/**
 * Enhances the BatchedMesh prototype with additional methods.
 */
export function extendBatchedMeshPrototype(): void {
  BatchedMesh.prototype.computeBVH = computeBVH;

  BatchedMesh.prototype.getPositionAt = getPositionAt;
  BatchedMesh.prototype.getPositionAndMaxScaleOnAxisAt = getPositionAndMaxScaleOnAxisAt;
  BatchedMesh.prototype.applyMatrixAtToSphere = applyMatrixAtToSphere;

  BatchedMesh.prototype.addGeometryLOD = addGeometryLOD;
  BatchedMesh.prototype.getLODIndex = getLODIndex;

  BatchedMesh.prototype.raycast = raycast;
  BatchedMesh.prototype.checkObjectIntersection = checkObjectIntersection;
}
