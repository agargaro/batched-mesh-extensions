import type { Box3, DataTexture, Sphere } from 'three';
import type { LODInfo } from './core/feature/LOD.js';

export * from './core/BatchedMeshBVH.js';
export * from './core/MultiDrawRenderList.js';
export * from './core/SquareDataTexture.js';

export * from './core/feature/ComputeBVH.js';
export * from './core/feature/FrustumCulling.js';
export * from './core/feature/GetPositionAt.js';
export * from './core/feature/LOD.js';
export * from './core/feature/Raycasting.js';
export * from './core/feature/Uniforms.js';

export * from './patch/ExtendsBatchedMeshPrototype.webgl.js';
export * from './patch/PatchBatchedMeshMaterial.js';

export * from './utils/CountUtils.js';
export * from './utils/SortingUtils.js';

/** @internal */
declare module 'three' {
  interface BatchedMesh {
    _instanceInfo: InstanceInfo[];
    _geometryInfo: GeometryInfo[];
    _indirectTexture: DataTexture;
    _matricesTexture: DataTexture;
    _multiDrawStarts: Float32Array;
    _multiDrawCounts: Float32Array;
    _multiDrawCount: number;
    _visibilityChanged: boolean;
  }
}

/** @internal */
export interface InstanceInfo {
  visible: boolean;
  active: boolean;
  geometryIndex: number;
}

/** @internal */
interface GeometryInfo {
  vertexStart: number;
  vertexCount: number;
  reservedVertexCount: number;

  indexStart: number;
  indexCount: number;
  reservedIndexCount: number;

  // draw range information (ignored if lods present)
  start: number;
  count: number;

  // state
  boundingBox: Box3;
  boundingSphere: Sphere;
  active: boolean;

  // LOD (extends from base)
  LOD: LODInfo[];
}
