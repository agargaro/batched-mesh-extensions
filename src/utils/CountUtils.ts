import { BufferGeometry } from 'three';

export type VertexIndexCount = { vertexCount: number; indexCount: number };
export type VertexIndexLODCount = { vertexCount: number; indexCount: number; LODIndexCount: number[] };

export function getBatchedMeshCount(geometries: BufferGeometry[]): VertexIndexCount {
  let vertexCount = 0;
  let indexCount = 0;

  for (const geometry of geometries) {
    vertexCount += geometry.attributes.position.count;
    indexCount += geometry.index.count;
  }

  return { vertexCount, indexCount };
}

export function getBatchedMeshLODCount(geometryLOD: BufferGeometry[][]): VertexIndexLODCount {
  const LODIndexCount: number[] = [];
  let vertexCount = 0;
  let indexCount = 0;

  for (const geometries of geometryLOD) {
    let sum = 0;

    for (const geometry of geometries) {
      const count = geometry.index.count;
      indexCount += count;
      sum += count;
      vertexCount += geometry.attributes.position.count;
    }

    LODIndexCount.push(sum);
  }

  return { vertexCount, indexCount, LODIndexCount };
}
