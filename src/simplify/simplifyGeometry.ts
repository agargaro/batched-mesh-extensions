import { BufferAttribute, BufferGeometry } from 'three';
import { simplify, SimplifyParams } from './simplify.js';

export async function simplifyGeometry(geometry: BufferGeometry, params: SimplifyParams): Promise<BufferGeometry> {
  if (!geometry.index) throw new Error('simplifyGeometry: non-indexed geometries are not currently supported.');
  if (geometry.groups.length > 0) throw new Error('simplifyGeometry: geometry groups are not currently supported.');

  const dstGeometry = geometry.clone();
  const srcIndexArray = geometry.index.array as Uint32Array;
  const srcPositionArray = geometry.attributes.position.array as Float32Array;

  const [dstIndexArray] = await simplify(srcIndexArray, srcPositionArray, params);
  dstGeometry.index = new BufferAttribute(dstIndexArray, 1);

  return dstGeometry;
}

export async function simplifyGeometries(geometries: BufferGeometry[], paramsList: SimplifyParams | SimplifyParams[]): Promise<BufferGeometry[]> {
  const result: BufferGeometry[] = [];

  for (let i = 0; i < geometries.length; i++) {
    const geometry = geometries[i];
    const params = Array.isArray(paramsList) ? paramsList[i] : paramsList;
    result.push(await simplifyGeometry(geometry, params));
  }

  return result;
}
