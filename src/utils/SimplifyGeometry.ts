import { Flags, MeshoptSimplifier } from 'meshoptimizer';
import { BufferAttribute, BufferGeometry } from 'three';

export type SimplifyGeometryAuto = { ratio: number; geometry: BufferGeometry };

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
    console.log(`Simplify: appearance error: ${result[1]}`);
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

export async function simplifyGeometryAuto(geometry: BufferGeometry, appearanceExpected: number, start: number, min = 0, tolerance = 0.01, maxIteration = 10): Promise<SimplifyGeometryAuto> {
  if (!geometry.index) throw new Error('Non-indexed geometries are not currently supported.');
  if (geometry.groups.length > 0) throw new Error('Geometry groups are not currently supported.');

  const newGeometry = cloneGeometrySharingAttributes(geometry);
  const srcIndexArray = geometry.index.array as Uint32Array;
  const srcPositionArray = geometry.attributes.position.array as Float32Array;
  const params: SimplifyParams = { ratio: 1, error: 1 };

  const rangeTolerance = appearanceExpected * tolerance;

  console.log('appearanceExpected', appearanceExpected); // TODO remove

  for (let i = 0; i < maxIteration; i++) {
    params.ratio = (min + start) / 2;
    const [dstIndexArray, appearanceError] = await simplify(srcIndexArray, srcPositionArray, params);

    console.log('appearanceError', appearanceError); // TODO remove

    if (Math.abs(appearanceError - appearanceExpected) <= rangeTolerance) {
      newGeometry.setIndex(new BufferAttribute(dstIndexArray, 1));
      return { geometry: newGeometry, ratio: params.ratio };
    }

    if (appearanceError > appearanceExpected) {
      min = params.ratio;
    } else {
      start = params.ratio;
    }
  }

  throw new Error('Simplification failed.');
}

export async function simplifyGeometryLODAuto(geometry: BufferGeometry, lodCount: number, range = [0.007, 0.015, 0.025, 0.04]): Promise<BufferGeometry[]> {
  const geometries: BufferGeometry[] = [];
  let startRatio = 1;

  for (let i = 0; i < lodCount; i++) {
    const result = await simplifyGeometryAuto(geometry, range[i], startRatio);
    startRatio = result.ratio;
    geometries.push(result.geometry);
  }

  return geometries;
}

export async function simplifyGeometriesLODAuto(geometries: BufferGeometry[], lodCounts: number | number[], ranges: number[] | number[][] = [0.007, 0.015, 0.025, 0.04]): Promise<BufferGeometry[][]> {
  const result: BufferGeometry[][] = [];

  for (let i = 0; i < geometries.length; i++) {
    const geometry = geometries[i];
    const group: BufferGeometry[] = [geometry];
    const range = (Array.isArray(ranges[i]) ? ranges[i] : ranges) as number[];
    const lodCount = Array.isArray(lodCounts) ? lodCounts[i] : lodCounts;
    group.push(...await simplifyGeometryLODAuto(geometry, lodCount, range));
    console.log("----") // TODO remove and add new check 
    result.push(group);
  }

  return result;
}
