import { BatchedMesh } from 'three';
import { computeBVH } from '../core/feature/ComputeBVH';
import { applyMatrixAtToSphere, getPositionAndMaxScaleOnAxisAt, getPositionAt } from '../core/feature/GetPositionAt';

/**
 * Enhances the BatchedMesh prototype with additional methods.
 */
export function extendBatchedMeshPrototype(): void {
  BatchedMesh.prototype.computeBVH = computeBVH;

  BatchedMesh.prototype.getPositionAt = getPositionAt;
  BatchedMesh.prototype.getPositionAndMaxScaleOnAxisAt = getPositionAndMaxScaleOnAxisAt;
  BatchedMesh.prototype.applyMatrixAtToSphere = applyMatrixAtToSphere;
}
