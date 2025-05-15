import { getBatchedMeshLODCount, simplifyGeometries } from '@three.ez/batched-mesh-extensions';
import { Main, PerspectiveCameraAuto } from '@three.ez/main';
import { AmbientLight, BatchedMesh, Color, DirectionalLight, Fog, Matrix4, MeshStandardMaterial, Quaternion, Scene, TorusKnotGeometry, Vector3, WebGLCoordinateSystem } from 'three';
import { MapControls } from 'three/addons/Addons.js';

const instancesCount = 500000;
const camera = new PerspectiveCameraAuto(50, 0.1, 600).translateZ(50).translateY(10);
const scene = new Scene();
scene.fog = new Fog(0x000000, 500, 600);
const main = new Main({showStats: false, rendererParameters: { canvas: document.getElementById("three-canvas") }}); // init renderer and other stuff
main.createView({ scene, camera, enabled: false });

const controls = new MapControls(camera, main.renderer.domElement);
scene.on('animate', (e) => controls.update(e.delta));

const geometries = [
  new TorusKnotGeometry(1, 0.4, 64, 8, 1, 1),
  new TorusKnotGeometry(1, 0.4, 64, 8, 1, 2),
  new TorusKnotGeometry(1, 0.4, 64, 8, 1, 3),
  new TorusKnotGeometry(1, 0.4, 64, 8, 1, 4),
  new TorusKnotGeometry(1, 0.4, 64, 8, 1, 5),
  new TorusKnotGeometry(1, 0.4, 64, 8, 2, 1),
  new TorusKnotGeometry(1, 0.4, 64, 8, 2, 3),
  new TorusKnotGeometry(1, 0.4, 64, 8, 3, 1),
  new TorusKnotGeometry(1, 0.4, 64, 8, 4, 1),
  new TorusKnotGeometry(1, 0.4, 64, 8, 5, 3)
];

// CREATE SIMPLIFIED GEOMETRIES

const params = [
  { error: 1, ratio: 0.5, lockBorder: true },
  { error: 1, ratio: 0.25, lockBorder: true },
  { error: 1, ratio: 0.05 }
];

simplifyGeometries(geometries, params).then((geometriesLODArray) => {
  
  // CREATE BATCHED MESH

  const { vertexCount, indexCount, LODIndexCount } = getBatchedMeshLODCount(geometriesLODArray);
  const batchedMesh = new BatchedMesh(instancesCount, vertexCount, indexCount, new MeshStandardMaterial({ metalness: 0.2, roughness: 0.2 }));
  batchedMesh.sortObjects = false;

  // ADD GEOMETRIES AND LODS

  for (let i = 0; i < geometriesLODArray.length; i++) {
    const geometryLOD = geometriesLODArray[i];
    const geometryId = batchedMesh.addGeometry(geometryLOD[0], -1, LODIndexCount[i]);
    batchedMesh.addGeometryLOD(geometryId, geometryLOD[1], 50);
    batchedMesh.addGeometryLOD(geometryId, geometryLOD[2], 100);
    batchedMesh.addGeometryLOD(geometryId, geometryLOD[3], 250);
  }

  // ADD INSTANCES

  const color = new Color();
  const matrix = new Matrix4();
  const position = new Vector3();
  const quaternion = new Quaternion();
  const scale = new Vector3(1, 1, 1);

  const sqrtCount = Math.ceil(Math.sqrt(instancesCount));
  const size = 5.5;
  const start = (sqrtCount / -2 * size) + (size / 2);

  for (let i = 0; i < instancesCount; i++) {
    const r = Math.floor(i / sqrtCount);
    const c = i % sqrtCount;
    const id = batchedMesh.addInstance(Math.floor(Math.random() * geometriesLODArray.length));
    position.set(c * size + start, 0, r * size + start);
    quaternion.random();
    batchedMesh.setMatrixAt(id, matrix.compose(position, quaternion, scale));
    batchedMesh.setColorAt(id, color.setHSL(Math.random(), 0.6, 0.5));
  }

  // COMPUTE TLAS BVH

  batchedMesh.computeBVH(WebGLCoordinateSystem);

  scene.add(batchedMesh, new AmbientLight());
  const dirLight = new DirectionalLight('white', 2);
  camera.add(dirLight, dirLight.target);
  
});
