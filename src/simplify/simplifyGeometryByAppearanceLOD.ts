import { BufferGeometry } from 'three';
import { simplifyGeometryByAppearance } from './simplifyGeometryByAppearance.js';

const defaultRange = [0.005, 0.01, 0.035, 0.07];
// TODO make more range preset // export const defaultRange = [0.01, 0.02, 0.04, 0.08];
// TODO const defaultRange = [0.005, 0.01, 0.03, 0.06];

export async function simplifyGeometryByAppearanceLOD(geometry: BufferGeometry, LODCount: number, range = defaultRange): Promise<BufferGeometry[]> {
  const geometries: BufferGeometry[] = [geometry];
  let startRatio = 1;

  for (let i = 0; i < LODCount; i++) {
    const result = await simplifyGeometryByAppearance(geometry, range[i], startRatio);
    startRatio = result.ratio;
    console.log(`LOD ${i} - ratio ${result.ratio} - appearanceError ${result.appearanceError} - indexCount: ${result.geometry.index.count}`);
    geometries.push(result.geometry);
  }

  return geometries;
}

export async function simplifyGeometriesByAppearanceLOD(geometries: BufferGeometry[], LODCounts: number | number[], ranges: number[] | number[][] = defaultRange): Promise<BufferGeometry[][]> {
  const result: BufferGeometry[][] = [];

  for (let i = 0; i < geometries.length; i++) {
    console.log(`Geometry ${i} - index count: ${geometries[i].index.count}`);
    const range = (Array.isArray(ranges[i]) ? ranges[i] : ranges) as number[];
    const LODCount = Array.isArray(LODCounts) ? LODCounts[i] : LODCounts;
    result.push(await simplifyGeometryByAppearanceLOD(geometries[i], LODCount, range));
  }

  return result;
}
