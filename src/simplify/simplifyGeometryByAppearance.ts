import { BufferAttribute, BufferGeometry } from 'three';
import { simplify, SimplifyParams } from './simplify.js';

export type SimplifyGeometryAuto = { geometry: BufferGeometry; ratio: number; appearanceError: number };

export async function simplifyGeometryByAppearance(geometry: BufferGeometry, appearance: number, start: number, min = 0, threshold = 0.015, maxIteration = 10): Promise<SimplifyGeometryAuto> {
  if (!geometry.index) throw new Error('simplifyGeometry: non-indexed geometries are not currently supported.');
  if (geometry.groups.length > 0) throw new Error('simplifyGeometry: geometry groups are not currently supported.');

  const dstGeometry = geometry.clone();
  const srcIndexArray = geometry.index.array as Uint32Array;
  const srcPositionArray = geometry.attributes.position.array as Float32Array;
  const appearanceThreshold = appearance * threshold;
  const params: SimplifyParams = { ratio: 1 };
  let bestTolerance = Infinity;
  let bestAppearanceError = Infinity;
  let bestRatio = -1;
  let bestArray: Uint32Array = null;

  for (let i = 0; i < maxIteration; i++) {
    if (start - min < 0.0005) break; // TODO check if this is worth

    params.ratio = (min + start) / 2;
    const [dstIndexArray, appearanceError] = await simplify(srcIndexArray, srcPositionArray, params);

    const tolerance = Math.abs(appearanceError - appearance);
    if (tolerance <= bestTolerance) {
      bestTolerance = tolerance;
      bestAppearanceError = appearanceError;
      bestRatio = params.ratio;
      bestArray = dstIndexArray as Uint32Array;
    }

    if (tolerance <= appearanceThreshold) break;

    if (appearanceError > appearance) {
      min = params.ratio;
    } else {
      start = params.ratio;
    }
  }

  if (bestTolerance > appearanceThreshold) {
    console.warn('SimplifyByAppearanceError: simplification failed to converge to the appearance error. The best result is used instead.');
  }

  dstGeometry.index = new BufferAttribute(bestArray, 1);
  return { geometry: dstGeometry, appearanceError: bestAppearanceError, ratio: bestRatio };
}
