import { getBatchedMeshLODCount, patchBatchedMesh, simplifyGeometries } from '@three.ez/batched-mesh-extensions';
import { Main, PerspectiveCameraAuto } from '@three.ez/main';
import { AmbientLight, BatchedMesh, Color, DirectionalLight, Fog, Matrix4, MeshStandardMaterial, Quaternion, Scene, TorusKnotGeometry, Vector3, WebGLCoordinateSystem } from 'three';
import { FlyControls } from 'three/examples/jsm/Addons.js';

const instancesCount = 1000000;
const camera = new PerspectiveCameraAuto(50, 0.1, 700).translateZ(10).translateY(20);
const scene = new Scene();
scene.fog = new Fog(0x000000, 650, 700);
const main = new Main(); // init renderer and other stuff
main.createView({ scene, camera, enabled: false });

const controls = new FlyControls(camera, main.renderer.domElement);
controls.movementSpeed = 70;
controls.rollSpeed = 0.2;
scene.on('animate', (e) => controls.update(e.delta));

const geoA = new TorusKnotGeometry(1, 0.4, 64, 8, 2, 3);
const geoB = new TorusKnotGeometry(1, 0.4, 64, 8, 5, 3);
const geoC = new TorusKnotGeometry(1, 0.4, 64, 8, 2, 1);
const geoD = new TorusKnotGeometry(1, 0.4, 64, 8, 5, 5);

// CREATE SIMPLIFIED GEOMETRIES

const params = [
  { error: 1, ratio: 0.4, lockBorder: true },
  { error: 1, ratio: 0.2, lockBorder: true },
  { error: 1, ratio: 0.05 }
];
const geometries = await simplifyGeometries([geoA, geoB, geoC, geoD], params);

// CREATE BATCHED MESH

const { vertexCount, indexCount, LODIndexCount } = getBatchedMeshLODCount(geometries);
const batchedMesh = new BatchedMesh(instancesCount, vertexCount, indexCount, new MeshStandardMaterial());
batchedMesh.sortObjects = false;

// ADD GEOMETRIES AND LODS

for (let i = 0; i < geometries.length; i++) {
  const geometryLOD = geometries[i];
  const geometryId = batchedMesh.addGeometry(geometryLOD[0], -1, LODIndexCount[i]);
  batchedMesh.addGeometryLOD(geometryId, geometryLOD[1], 20);
  batchedMesh.addGeometryLOD(geometryId, geometryLOD[2], 150);
  batchedMesh.addGeometryLOD(geometryId, geometryLOD[3], 350);
}

// INIT UNIFORMS PER INSTANCE PATCH

patchBatchedMesh(batchedMesh);
batchedMesh.initUniformsPerInstance({ fragment: { metalness: 'float', roughness: 'float' } });

// ADD INSTANCES

const color = new Color();
const matrix = new Matrix4();
const position = new Vector3();
const quaternion = new Quaternion();
const scale = new Vector3(1, 1, 1);

const sqrtCount = Math.ceil(Math.sqrt(instancesCount));
const size = 5;
const start = (sqrtCount / -2 * size) + (size / 2);

for (let i = 0; i < instancesCount; i++) {
  const r = Math.floor(i / sqrtCount);
  const c = i % sqrtCount;
  const id = batchedMesh.addInstance(i % geometries.length);
  position.set(c * size + start, 0, r * size + start);
  quaternion.random();
  batchedMesh.setMatrixAt(id, matrix.compose(position, quaternion, scale));
  batchedMesh.setColorAt(id, color.setHSL(Math.random(), 1, 0.5));
  batchedMesh.setUniformAt(id, 'metalness', Math.random());
  batchedMesh.setUniformAt(id, 'roughness', Math.random());
}

// // COMPUTE TLAS BVH

batchedMesh.computeBVH(WebGLCoordinateSystem);

scene.add(batchedMesh, new AmbientLight());
const dirLight = new DirectionalLight();
camera.add(dirLight, dirLight.target);
