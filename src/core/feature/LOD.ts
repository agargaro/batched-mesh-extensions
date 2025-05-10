import { BatchedMesh } from 'three';

export type LODInfo = { start: number; count: number; distance: number; hysteresis: number };

declare module 'three' {
  interface BatchedMesh {
    /**
     * TODO.
     */
    addGeometryLOD(geometryId: number, geometry: BufferGeometry, distance?: number, hysteresis?: number): void;
    /** @internal */ getLODIndex(LOD: LODInfo[], distance: number): number;
  }
}

BatchedMesh.prototype.addGeometryLOD = function (geometryId, geometry, distance, hysteresis?) {
  const geometryInfo = this._geometryInfo[geometryId];
  distance = distance ** 2;

  if (!geometryInfo.LOD) {
    geometryInfo.LOD = [{ start: geometryInfo.start, count: geometryInfo.count, distance: 0, hysteresis: 0 }]; // TODO e se non è primo livello?
  }

  const LOD = geometryInfo.LOD;
  const lastLOD = LOD[LOD.length];
  const start = lastLOD.start + lastLOD.count;
  const count = geometry.index.count;

  if ((start - geometryInfo.start) + count > geometryInfo.reservedIndexCount) {
    throw new Error('BatchedMesh LOD: Reserved space request exceeds the maximum buffer size.');
  }

  LOD.push({ start, count, distance, hysteresis });

  const srcIndex = this.geometry.getIndex();
  const dstIndex = this.geometry.getIndex();
  dstIndex.set(srcIndex.array, start);
  dstIndex.needsUpdate = true;
};

BatchedMesh.prototype.getLODIndex = function (LODs: LODInfo[], distance: number): number {
  for (let i = LODs.length - 1; i > 0; i--) {
    const level = LODs[i];
    const levelDistance = level.distance - (level.distance * level.hysteresis);
    if (distance >= levelDistance) return i;
  }

  return 0;
};
