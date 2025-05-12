import { Flags, MeshoptSimplifier } from 'meshoptimizer';
import { BufferAttribute, BufferGeometry } from 'three';

export interface SimplifyParams {
  ratio: number;
  error: number;
  lockBorder?: boolean;
  errorAbsolute?: boolean;
  sparse?: boolean;
  prune?: boolean;
  logAppearanceError?: boolean;
  optimizeMemory?: boolean;
}

export async function simplify(srcIndexArray: Uint32Array, srcPositionArray: Float32Array, params: SimplifyParams): Promise<[Uint32Array, number]> {
  await MeshoptSimplifier.ready;

  const flags: Flags[] = [];
  if (params.lockBorder) flags.push('LockBorder');
  if (params.sparse) flags.push('Sparse');
  if (params.errorAbsolute) flags.push('ErrorAbsolute');
  if (params.prune) flags.push('Prune');

  const targetCount = 3 * Math.floor(params.ratio * (srcIndexArray.length / 3));

  const result = MeshoptSimplifier.simplify(srcIndexArray, srcPositionArray, 3, targetCount, params.error, flags);

  if (params.logAppearanceError) {
    console.log(`Meshoptimizer simplification error factor: ${result[1]}`);
  }

  if (params.optimizeMemory && (srcPositionArray.length / 3) <= 65535) {
    console.error('optimizeMemory not implemented yet. TODO');
  }

  return result;
}

export async function simplifyGeometries(geometries: BufferGeometry[], paramsList: SimplifyParams[] | SimplifyParams[][]): Promise<BufferGeometry[][]> {
  const result: BufferGeometry[][] = [];

  for (let i = 0; i < geometries.length; i++) {
    const geometry = geometries[i];
    const group: BufferGeometry[] = [geometry];
    const paramsArray = (Array.isArray(paramsList[i]) ? paramsList[i] : paramsList) as SimplifyParams[];

    for (const params of paramsArray) {
      group.push(await simplifyGeometry(geometry, params));
    }

    result.push(group);
  }

  return result;
}

export async function simplifyGeometry(geometry: BufferGeometry, params: SimplifyParams): Promise<BufferGeometry> {
  if (!geometry.index) throw new Error('Non-indexed geometries are not currently supported.');
  if (geometry.groups.length > 0) throw new Error('Geometry groups are not currently supported.');

  const newGeometry = cloneGeometrySharingAttributes(geometry);
  const srcIndexArray = geometry.index.array as Uint32Array;
  const srcPositionArray = geometry.attributes.position.array as Float32Array;

  const [dstIndexArray] = await simplify(srcIndexArray, srcPositionArray, params);

  newGeometry.setIndex(new BufferAttribute(dstIndexArray, 1));

  return newGeometry;
}

function cloneGeometrySharingAttributes(geometry: BufferGeometry): BufferGeometry {
  const newGeometry = new BufferGeometry();

  newGeometry.attributes = geometry.attributes;

  newGeometry.morphAttributes = geometry.morphAttributes;
  newGeometry.morphTargetsRelative = geometry.morphTargetsRelative;

  newGeometry.name = geometry.name;
  newGeometry.boundingBox = geometry.boundingBox;
  newGeometry.boundingSphere = geometry.boundingSphere;
  newGeometry.userData = geometry.userData;

  return newGeometry;
}
