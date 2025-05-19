import { BufferGeometry } from 'three';
import { SimplifyParams } from './simplify.js';
import { simplifyGeometry } from './simplifyGeometry.js';

export async function simplifyGeometryLOD(geometry: BufferGeometry, paramsList: SimplifyParams[]): Promise<BufferGeometry[]> {
  const result: BufferGeometry[] = [geometry];

  for (const params of paramsList) {
    result.push(await simplifyGeometry(geometry, params));
  }

  return result;
}

export async function simplifyGeometriesLOD(geometries: BufferGeometry[], paramsList: SimplifyParams[] | SimplifyParams[][]): Promise<BufferGeometry[][]> {
  const result: BufferGeometry[][] = [];

  for (let i = 0; i < geometries.length; i++) {
    const paramsArray = (Array.isArray(paramsList[i]) ? paramsList[i] : paramsList) as SimplifyParams[];
    result.push(await simplifyGeometryLOD(geometries[i], paramsArray));
  }

  return result;
}
