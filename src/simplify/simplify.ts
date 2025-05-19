import { Flags, MeshoptSimplifier } from 'meshoptimizer';

export type SimplifyResult = [Uint32Array | Uint16Array | Uint8Array, number];

export interface SimplifyParams {
  ratio: number;
  error?: number;
  lockBorder?: boolean;
  errorAbsolute?: boolean;
  sparse?: boolean;
  prune?: boolean;
  logAppearanceError?: boolean;
  optimizeMemory?: boolean;
}

export async function simplify(srcIndexArray: Uint32Array, srcPositionArray: Float32Array, params: SimplifyParams): Promise<SimplifyResult> {
  await MeshoptSimplifier.ready;

  const flags: Flags[] = [];
  if (params.lockBorder) flags.push('LockBorder');
  if (params.sparse) flags.push('Sparse');
  if (params.errorAbsolute) flags.push('ErrorAbsolute');
  if (params.prune) flags.push('Prune');

  const error = params.error ?? 1;
  const targetCount = 3 * Math.floor(params.ratio * (srcIndexArray.length / 3));

  const result: SimplifyResult = MeshoptSimplifier.simplify(srcIndexArray, srcPositionArray, 3, targetCount, error, flags);

  if (params.logAppearanceError) {
    console.log(`Simplify: appearance error: ${result[1]}`);
  }

  const verticesCount = srcPositionArray.length / 3;
  if (params.optimizeMemory && verticesCount <= 65535) {
    const dstIndexArray = result[0];
    result[0] = verticesCount <= 255 ? new Uint8Array(dstIndexArray.length) : new Uint16Array(dstIndexArray.length);
    result[0].set(dstIndexArray);
  }

  return result;
}
