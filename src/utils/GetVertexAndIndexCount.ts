import { BufferGeometry } from 'three';

export type VertexIndexCount = { vertexCount: number; indexCount: number };

export function getVertexAndIndexCount(geometries: BufferGeometry[]): VertexIndexCount {
  let vertexCount = 0;
  let indexCount = 0;

  for (const geometry of geometries) {
    vertexCount += geometry.attributes.position.count;
    indexCount += geometry.index.array.length;
  }

  return { vertexCount, indexCount };
}
