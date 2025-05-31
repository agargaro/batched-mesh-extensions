import { BatchedMesh } from 'three';
import { computeBVH } from '../core/feature/ComputeBVH';

/**
 *
 */
export function enhanceBatchedMeshPrototype(): void {
  BatchedMesh.prototype.computeBVH = computeBVH;
}
