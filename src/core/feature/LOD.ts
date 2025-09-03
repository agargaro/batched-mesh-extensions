import { BatchedMesh, BufferGeometry, TypedArray } from 'three';

// TODO: add optional distance and first load function like InstancedMesh2

export type LODInfo = { start: number; count: number; distance: number; hysteresis: number; distSquared: number };

declare module 'three' {
  interface BatchedMesh {
    /**
         * Adds a Level of Detail (LOD) geometry to the BatchedMesh.
         * @param geometryId The ID of the geometry to which the LOD is being added.
         * @param geometryOrIndex The BufferGeometry to be added as LOD or the index array.
         * @param distance The screen-space metric (e.g., fraction of screen height) at which this LOD should be used.
         * @param hysteresis Optional hysteresis value for LOD transition.
         */
    addGeometryLOD(geometryId: number, geometryOrIndex: BufferGeometry | TypedArray, distance: number, hysteresis?: number): void;
    /**
         * Retrieves the LOD index for a given screen-space metric.
         * @param LOD The array of LOD information.
         * @param metric The calculated screen-space metric for the object.
         * @param useDistSquared Whether to use the squared distance for LOD calculations.
         * @returns The index of the appropriate LOD
         */
    getLODIndex(LOD: LODInfo[], metric: number, useDistSquared: boolean): number;
  }
}

export function addGeometryLOD(this: BatchedMesh, geometryId: number, geoOrIndex: BufferGeometry | TypedArray, distance: number, hysteresis = 0): void {
  const geometryInfo = this._geometryInfo[geometryId];
  const srcIndexArray = (geoOrIndex as BufferGeometry).isBufferGeometry ? (geoOrIndex as BufferGeometry).index.array : geoOrIndex as TypedArray;
  const distSquared = distance ** 2;

  geometryInfo.LOD ??= [{ start: geometryInfo.start, count: geometryInfo.count, distance: Infinity, hysteresis: 0, distSquared: Infinity }]; // Highest detail LOD has an infinite threshold

  const LOD = geometryInfo.LOD;
  const lastLOD = LOD[LOD.length - 1];
  const start = lastLOD.start + lastLOD.count;
  const count = srcIndexArray.length;

  if ((start - geometryInfo.start) + count > geometryInfo.reservedIndexCount) {
    throw new Error('BatchedMesh LOD: Reserved space request exceeds the maximum buffer size.');
  }

  LOD.push({ start, count, distance, distSquared, hysteresis });

  const dstIndex = this.geometry.getIndex();
  const dstIndexArray = dstIndex.array;
  const vertexStart = geometryInfo.vertexStart;

  for (let i = 0; i < count; i++) {
    dstIndexArray[start + i] = srcIndexArray[i] + vertexStart;
  }

  dstIndex.needsUpdate = true;
}

export function getLODIndex(LODs: LODInfo[], metric: number, useDistSquared: boolean): number {
  for (let i = LODs.length - 1; i > 0; i--) {
    const level = LODs[i];
    const levelDistance = useDistSquared ? level.distSquared - (level.distSquared * level.hysteresis) : level.distance - (level.distance * level.hysteresis);
    if (metric < levelDistance) return i;
  }

  return 0;
}
