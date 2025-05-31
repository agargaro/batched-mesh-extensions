import { BatchedMesh, Sphere, Vector3 } from 'three';

declare module 'three' {
  interface BatchedMesh {
    /**
     * Retrieves the position of a specific instance.
     * @param index The index of the instance.
     * @param target Optional `Vector3` to store the result.
     * @returns The position of the instance as a `Vector3`.
     */
    getPositionAt(index: number, target?: Vector3): Vector3;
    /**
     * Retrieves the position and maximum scale on any axis of a specific instance.
     * @param index The index of the instance.
     * @param position Optional `Vector3` to store the position result.
     * @returns The maximum scale on any axis.
     */
    getPositionAndMaxScaleOnAxisAt(index: number, position: Vector3): number;
    /**
     * Applies the transformation matrix of a specific instance to a sphere.
     * @param index The index of the instance.
     * @param sphere The sphere to transform.
     * @param center TODO
     * @param radius TODO
     */
    applyMatrixAtToSphere(index: number, sphere: Sphere, center: Vector3, radius: number): void;
  }
}

const _position = new Vector3();

export function getPositionAt(this: BatchedMesh, index: number, target = _position): Vector3 {
  const offset = index * 16;
  const array = this._matricesTexture.image.data as unknown as number[];

  target.x = array[offset + 12];
  target.y = array[offset + 13];
  target.z = array[offset + 14];

  return target;
}

export function getPositionAndMaxScaleOnAxisAt(this: BatchedMesh, index: number, position: Vector3): number {
  const offset = index * 16;
  const array = this._matricesTexture.image.data as unknown as number[];

  const te0 = array[offset + 0];
  const te1 = array[offset + 1];
  const te2 = array[offset + 2];
  const scaleXSq = te0 * te0 + te1 * te1 + te2 * te2;

  const te4 = array[offset + 4];
  const te5 = array[offset + 5];
  const te6 = array[offset + 6];
  const scaleYSq = te4 * te4 + te5 * te5 + te6 * te6;

  const te8 = array[offset + 8];
  const te9 = array[offset + 9];
  const te10 = array[offset + 10];
  const scaleZSq = te8 * te8 + te9 * te9 + te10 * te10;

  position.x = array[offset + 12];
  position.y = array[offset + 13];
  position.z = array[offset + 14];

  return Math.sqrt(Math.max(scaleXSq, scaleYSq, scaleZSq));
}

export function applyMatrixAtToSphere(this: BatchedMesh, index: number, sphere: Sphere, center: Vector3, radius: number): void {
  const offset = index * 16;
  const array = this._matricesTexture.image.data as unknown as number[];

  const te0 = array[offset + 0];
  const te1 = array[offset + 1];
  const te2 = array[offset + 2];
  const te3 = array[offset + 3];
  const te4 = array[offset + 4];
  const te5 = array[offset + 5];
  const te6 = array[offset + 6];
  const te7 = array[offset + 7];
  const te8 = array[offset + 8];
  const te9 = array[offset + 9];
  const te10 = array[offset + 10];
  const te11 = array[offset + 11];
  const te12 = array[offset + 12];
  const te13 = array[offset + 13];
  const te14 = array[offset + 14];
  const te15 = array[offset + 15];

  const position = sphere.center;
  const x = center.x;
  const y = center.y;
  const z = center.z;
  const w = 1 / (te3 * x + te7 * y + te11 * z + te15);

  position.x = (te0 * x + te4 * y + te8 * z + te12) * w;
  position.y = (te1 * x + te5 * y + te9 * z + te13) * w;
  position.z = (te2 * x + te6 * y + te10 * z + te14) * w;

  const scaleXSq = te0 * te0 + te1 * te1 + te2 * te2;
  const scaleYSq = te4 * te4 + te5 * te5 + te6 * te6;
  const scaleZSq = te8 * te8 + te9 * te9 + te10 * te10;

  sphere.radius = radius * Math.sqrt(Math.max(scaleXSq, scaleYSq, scaleZSq));
}
