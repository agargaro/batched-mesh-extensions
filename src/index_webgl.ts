import { Box3, DataTexture, Sphere } from 'three';

export * from './core/feature/ComputeBVH.js';
export * from './core/feature/FrustumCulling.js';
export * from './core/feature/GetPositionAt.js';
export * from './core/feature/Raycasting.js';
export * from './core/feature/Uniforms.js';
export * from './core/BatchedMeshBVH.js';
export * from './core/utils/MultiDrawRenderList.js';
export * from './core/utils/SortingUtils.js';
export * from './core/SquareDataTexture.js';
export * from './core/Patch.js';

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
  start: number;
  count: number;
  boundingSphere: Sphere;
  boundingBox: Box3;
}
