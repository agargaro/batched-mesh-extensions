import { box3ToArray, BVH, BVHNode, HybridBuilder, onFrustumIntersectionCallback, onIntersectionCallback, onIntersectionRayCallback, vec3ToArray, WebGLCoordinateSystem, WebGPUCoordinateSystem } from 'bvh.js';
import { BatchedMesh, Box3, CoordinateSystem, Matrix4, Raycaster } from 'three';

// TODO implement getBBoxFromBSphere (add property to geometryInfo)
// TODO implement frustumCullingLOD?

/**
 * Class to manage BVH (Bounding Volume Hierarchy) for `BatchedMesh`.
 * Provides methods for managing bounding volumes, frustum culling, raycasting, and bounding box computation.
 */
export class BatchedMeshBVH {
  /**
   * The target `BatchedMesh` object that the BVH is managing.
   */
  public target: BatchedMesh;
  /**
   * The BVH instance used to organize bounding volumes.
   */
  public bvh: BVH<{}, number>;
  /**
   * A map that stores the BVH nodes for each instance.
   */
  public nodesMap = new Map<number, BVHNode<{}, number>>();
  /**
   * Enables accurate frustum culling by checking intersections without applying margin to the bounding box.
   */
  public accurateCulling: boolean;
  protected _margin: number;
  protected _origin: Float32Array;
  protected _dir: Float32Array;
  protected _boxArray: Float32Array;
  protected _cameraPos: Float32Array;

  /**
   * @param target The target `BatchedMesh`.
   * @param margin The margin applied for bounding box calculations (default is 0).
   * @param accurateCulling Flag to enable accurate frustum culling without considering margin (default is true).
   */
  constructor(target: BatchedMesh, coordinateSystem: CoordinateSystem, margin = 0, accurateCulling = true) {
    this.target = target;
    this.accurateCulling = accurateCulling;
    this._margin = margin;

    this.bvh = new BVH(new HybridBuilder(), coordinateSystem === 2000 ? WebGLCoordinateSystem : WebGPUCoordinateSystem); // TODO fix in BVH.js
    this._origin = new Float32Array(3);
    this._dir = new Float32Array(3);
    this._cameraPos = new Float32Array(3);
  }

  /**
   * Builds the BVH from the target mesh's instances using a top-down construction method.
   * This approach is more efficient and accurate compared to incremental methods, which add one instance at a time.
   */
  public create(): void {
    const count = this.target.instanceCount;
    const instancesArrayCount = this.target._instanceInfo.length; // TODO this may change.. don't like it too much
    const instancesInfo = this.target._instanceInfo;
    const boxes: Float32Array[] = new Array(count); // test if single array and recreation inside node creation is faster due to memory location
    const objects = new Uint32Array(count);
    let index = 0;

    this.clear();

    for (let i = 0; i < instancesArrayCount; i++) {
      if (!instancesInfo[i].active) continue;
      boxes[index] = this.getBox(i, new Float32Array(6));
      objects[index] = i;
      index++;
    }

    this.bvh.createFromArray(objects as unknown as number[], boxes, (node) => {
      this.nodesMap.set(node.object, node);
    }, this._margin);
  }

  /**
   * Inserts an instance into the BVH.
   * @param id The id of the instance to insert.
   */
  public insert(id: number): void {
    const node = this.bvh.insert(id, this.getBox(id, new Float32Array(6)), this._margin);
    this.nodesMap.set(id, node);
  }

  /**
   * Inserts a range of instances into the BVH.
   * @param ids An array of ids to insert.
   */
  public insertRange(ids: number[]): void {
    const count = ids.length;
    const boxes: Float32Array[] = new Array(count);

    for (let i = 0; i < count; i++) {
      boxes[i] = this.getBox(ids[i], new Float32Array(6));
    }

    this.bvh.insertRange(ids, boxes, this._margin, (node) => {
      this.nodesMap.set(node.object, node);
    });
  }

  /**
   * Moves an instance within the BVH.
   * @param id The id of the instance to move.
   */
  public move(id: number): void {
    const node = this.nodesMap.get(id);
    if (!node) return;
    this.getBox(id, node.box as Float32Array); // this also updates box
    this.bvh.move(node, this._margin);
  }

  /**
   * Deletes an instance from the BVH.
   * @param id The id of the instance to delete.
   */
  public delete(id: number): void {
    const node = this.nodesMap.get(id);
    if (!node) return;
    this.bvh.delete(node);
    this.nodesMap.delete(id);
  }

  /**
   * Clears the BVH.
   */
  public clear(): void {
    this.bvh.clear();
    this.nodesMap.clear();
  }

  /**
   * Performs frustum culling to determine which instances are visible based on the provided projection matrix.
   * @param projScreenMatrix The projection screen matrix for frustum culling.
   * @param onFrustumIntersection Callback function invoked when an instance intersects the frustum.
   */
  public frustumCulling(projScreenMatrix: Matrix4, onFrustumIntersection: onFrustumIntersectionCallback<{}, number>): void {
    if (this._margin > 0 && this.accurateCulling) {
      this.bvh.frustumCulling(projScreenMatrix.elements, (node, frustum, mask) => {
        if (frustum.isIntersectedMargin(node.box, mask, this._margin)) {
          onFrustumIntersection(node);
        }
      });
    } else {
      this.bvh.frustumCulling(projScreenMatrix.elements, onFrustumIntersection);
    }
  }

  /**
   * Performs raycasting to check if a ray intersects any instances.
   * @param raycaster The raycaster used for raycasting.
   * @param onIntersection Callback function invoked when a ray intersects an instance.
   */
  public raycast(raycaster: Raycaster, onIntersection: onIntersectionRayCallback<number>): void {
    const ray = raycaster.ray;
    const origin = this._origin;
    const dir = this._dir;

    vec3ToArray(ray.origin, origin);
    vec3ToArray(ray.direction, dir);

    // TODO should we add margin check? maybe is not worth it
    this.bvh.rayIntersections(dir, origin, onIntersection, raycaster.near, raycaster.far);
  }

  /**
   * Checks if a given box intersects with any instance bounding box.
   * @param target The target bounding box.
   * @param onIntersection Callback function invoked when an intersection occurs.
   * @returns `True` if there is an intersection, otherwise `false`.
   */
  public intersectBox(target: Box3, onIntersection: onIntersectionCallback<number>): boolean {
    if (!this._boxArray) this._boxArray = new Float32Array(6);
    const array = this._boxArray;
    box3ToArray(target, array);
    return this.bvh.intersectsBox(array, onIntersection);
  }

  protected getBox(id: number, array: Float32Array): Float32Array {
    const target = this.target;
    const geometryId = target._instanceInfo[id].geometryIndex;
    target.getBoundingBoxAt(geometryId, _box3).applyMatrix4(target.getMatrixAt(id, _matrix));
    box3ToArray(_box3, array);
    return array;
  }
}

const _box3 = new Box3();
const _matrix = new Matrix4();
