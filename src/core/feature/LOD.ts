import { BatchedMesh, BufferGeometry } from 'three';

// TODO: add optional distance and first load function like InstancedMesh2

export type LODInfo = { start: number; count: number; distance: number; hysteresis: number };

declare module 'three' {
  interface BatchedMesh {
    /**
     * Adds a Level of Detail (LOD) geometry to the BatchedMesh.
     * @param geometryId The ID of the geometry to which the LOD is being added.
     * @param geometry The BufferGeometry to be added as LOD.
     * @param distance The distance at which this LOD should be used.
     * @param hysteresis Optional hysteresis value for LOD transition.
     */
    addGeometryLOD(geometryId: number, geometry: BufferGeometry, distance: number, hysteresis?: number): void;
    /**
     * Retrieves the LOD index for a given distance.
     * @param LOD The array of LOD information.
     * @param distance The distance to check against the LODs.
     * @returns The index of the appropriate LOD
     */
    getLODIndex(LOD: LODInfo[], distance: number): number;
  }
}

export function addGeometryLOD(this: BatchedMesh, geometryId: number, geometry: BufferGeometry, distance: number, hysteresis = 0): void {
  const geometryInfo = this._geometryInfo[geometryId];
  distance = distance ** 2;

  geometryInfo.LOD ??= [{ start: geometryInfo.start, count: geometryInfo.count, distance: 0, hysteresis: 0 }];

  const LOD = geometryInfo.LOD;
  const lastLOD = LOD[LOD.length - 1];
  const start = lastLOD.start + lastLOD.count;
  const count = geometry.index.count;

  if ((start - geometryInfo.start) + count > geometryInfo.reservedIndexCount) {
    throw new Error('BatchedMesh LOD: Reserved space request exceeds the maximum buffer size.');
  }

  LOD.push({ start, count, distance, hysteresis });

  const srcIndexArray = geometry.getIndex().array;
  const dstIndex = this.geometry.getIndex();
  const dstIndexArray = dstIndex.array;
  const vertexStart = geometryInfo.vertexStart;

  for (let i = 0; i < count; i++) {
    dstIndexArray[start + i] = srcIndexArray[i] + vertexStart;
  }

  dstIndex.needsUpdate = true;
}

export function getLODIndex(LODs: LODInfo[], distance: number): number {
  for (let i = LODs.length - 1; i > 0; i--) {
    const level = LODs[i];
    const levelDistance = level.distance - (level.distance * level.hysteresis);
    if (distance >= levelDistance) return i;
  }

  return 0;
}
