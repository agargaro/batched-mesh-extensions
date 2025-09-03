import { createRadixSort, extendBatchedMeshPrototype, getBatchedMeshLODCount } from '@three.ez/batched-mesh-extensions';
import { Main, PerspectiveCameraAuto } from '@three.ez/main';
import { performanceRangeLOD, simplifyGeometriesByErrorLOD } from '@three.ez/simplify-geometry';
import { AmbientLight, BatchedMesh, Color, DirectionalLight, Fog, Matrix4, MeshStandardMaterial, OrthographicCamera, Quaternion, Scene, SphereGeometry, TorusKnotGeometry, Vector3, WebGLCoordinateSystem } from 'three';
import { MapControls } from 'three/examples/jsm/Addons.js';

// EXTEND BATCHEDMESH PROTOTYPE
extendBatchedMeshPrototype();

const instancesCount = 500000;
// const camera = new PerspectiveCameraAuto(50, 0.1, 600).translateZ(50).translateY(10);
const camera = new OrthographicCamera(-window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, -window.innerHeight / 2, 0.1, 600).translateZ(50).translateY(10);
const scene = new Scene();
scene.fog = new Fog(0x000000, 500, 600);
const main = new Main(); // init renderer and other stuff
main.createView({ scene, camera, enabled: false });

const controls = new MapControls(camera, main.renderer.domElement);
scene.on('animate', (e) => controls.update(e.delta));

const geometries = [
  new TorusKnotGeometry(1, 0.4, 256, 32, 1, 1),
  new TorusKnotGeometry(1, 0.4, 256, 32, 1, 2),
  new TorusKnotGeometry(1, 0.4, 256, 32, 1, 3),
  new TorusKnotGeometry(1, 0.4, 256, 32, 1, 4),
  new TorusKnotGeometry(1, 0.4, 256, 32, 1, 5),
  new TorusKnotGeometry(1, 0.4, 256, 32, 2, 1),
  new TorusKnotGeometry(1, 0.4, 256, 32, 2, 3),
  new TorusKnotGeometry(1, 0.4, 256, 32, 3, 1),
  new TorusKnotGeometry(1, 0.4, 256, 32, 4, 1),
  new TorusKnotGeometry(1, 0.4, 256, 32, 5, 3)
];

// CREATE SIMPLIFIED GEOMETRIES

const geometriesLODArray = await simplifyGeometriesByErrorLOD(geometries, 4, performanceRangeLOD);
console.log('performanceRangeLOD', performanceRangeLOD);

// CREATE BATCHED MESH

const { vertexCount, indexCount, LODIndexCount } = getBatchedMeshLODCount(geometriesLODArray);
const batchedMesh = new BatchedMesh(instancesCount, vertexCount, indexCount, new MeshStandardMaterial({ metalness: 0.2, roughness: 0.2 }));
batchedMesh.customSort = createRadixSort(batchedMesh);

// ADD GEOMETRIES AND LODS

for (let i = 0; i < geometriesLODArray.length; i++) {
  const geometryLOD = geometriesLODArray[i];
  const geometryId = batchedMesh.addGeometry(geometryLOD[0], -1, LODIndexCount[i]);
  batchedMesh.addGeometryLOD(geometryId, geometryLOD[1], 0.50); // use from below 50% of the screen space
  batchedMesh.addGeometryLOD(geometryId, geometryLOD[2], 0.20); // use below 20%
  batchedMesh.addGeometryLOD(geometryId, geometryLOD[3], 0.10); // etc
  batchedMesh.addGeometryLOD(geometryId, geometryLOD[4], 0.05);
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
