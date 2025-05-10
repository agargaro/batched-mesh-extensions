import { BatchedMesh, CoordinateSystem } from 'three';
import { BatchedMeshBVH } from '../BatchedMeshBVH.js';

/**
 * Parameters for configuring the BVH (Bounding Volume Hierarchy).
 */
export interface BVHParams {
  /**
   * Margin applied to accommodate animated or moving objects.
   * Improves BVH update performance but slows down frustum culling and raycasting.
   * For static objects, set to 0 to optimize culling and raycasting efficiency.
   * @default 0
   */
  margin?: number;
  /**
   * Enables accurate frustum culling by checking intersections without applying margin to the bounding box.
   * @default true
   */
  accurateCulling?: boolean;
}

declare module 'three' {
  interface BatchedMesh {
    /**
     * BVH structure for optimized culling and intersection testing.
     * It's possible to create the BVH using the `computeBVH` method. Once created it will be updated automatically.
     */
    bvh: BatchedMeshBVH;
    /**
     * Creates and computes the BVH (Bounding Volume Hierarchy) for the instances.
     * It's recommended to create it when all the instance matrices have been assigned.
     * Once created it will be updated automatically.
     * @param coordinateSystem TODO.
     * @param config Optional configuration parameters object. See `BVHParams` for details.
     */
    computeBVH(coordinateSystem: CoordinateSystem, config?: BVHParams): void;
  }
}

BatchedMesh.prototype.computeBVH = function (coordinateSystem: CoordinateSystem, config: BVHParams = {}): void {
  this.bvh = new BatchedMeshBVH(this, coordinateSystem, config.margin, config.accurateCulling);
  this.bvh.create();
};
