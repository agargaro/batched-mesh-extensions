import { BatchedMesh } from 'three';
import { getUniformAt, initUniformsPerInstance, setUniformAt } from '../core/feature/Uniforms';
import { extendBatchedMeshPrototypeCommon } from './ExtendsBatchedMeshPrototype.common';

/**
 * Enhances the BatchedMesh prototype with additional methods.
 */
export function extendBatchedMeshPrototype(): void {
  extendBatchedMeshPrototypeCommon();

  BatchedMesh.prototype.getUniformAt = getUniformAt;
  BatchedMesh.prototype.setUniformAt = setUniformAt;
  BatchedMesh.prototype.initUniformsPerInstance = initUniformsPerInstance;
}
