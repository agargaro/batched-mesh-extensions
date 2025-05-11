import { createSimplifiedGeometry, getVertexAndIndexCount } from '@three.ez/batched-mesh-extensions';
import { Main, PerspectiveCameraAuto } from '@three.ez/main';
import { AmbientLight, BatchedMesh, Color, DirectionalLight, Matrix4, MeshLambertMaterial, Quaternion, Scene, SphereGeometry, TorusKnotGeometry, Vector3, WebGLCoordinateSystem } from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

const camera = new PerspectiveCameraAuto().translateZ(10);
const scene = new Scene();
const main = new Main(); // init renderer and other stuff
main.createView({ scene, camera });
const controls = new OrbitControls(camera, main.renderer.domElement);
controls.update();

const geometry1 = new TorusKnotGeometry();
const geometry2 = new SphereGeometry();
const LODGeo1 = await createSimplifiedGeometry(geometry1, { error: 1, ratio: 0.1 });
const LODGeo2 = await createSimplifiedGeometry(geometry1, { error: 1, ratio: 0.2 });

const { vertexCount, indexCount } = getVertexAndIndexCount([geometry1, geometry2]);

const batchedMesh = new BatchedMesh(50000, vertexCount, indexCount + LODGeo1.drawRange.count + LODGeo2.drawRange.count, new MeshLambertMaterial());

const geometryId = batchedMesh.addGeometry(geometry1, -1, geometry1.index.count + LODGeo1.drawRange.count);
const geometryId2 = batchedMesh.addGeometry(geometry2, -1, geometry2.index.count + LODGeo2.drawRange.count);

batchedMesh.addGeometryLOD(geometryId, LODGeo1, 15);
batchedMesh.addGeometryLOD(geometryId2, LODGeo2, 15);

const spawnRange = 1000;
const halfSpawnRange = spawnRange / 2;
const color = new Color();
const matrix = new Matrix4();
const position = new Vector3();
const scale = new Vector3();
const quaternion = new Quaternion();

for (let i = 0; i < 50000; i++) {
  const id = batchedMesh.addInstance(i % 2);
  position.set(Math.random() * spawnRange - halfSpawnRange, Math.random() * spawnRange - halfSpawnRange, Math.random() * spawnRange - halfSpawnRange);
  quaternion.random();
  scale.set(Math.random() * 1.5 + 0.5, Math.random() * 1.5 + 0.5, Math.random() * 1.5 + 0.5);
  batchedMesh.setMatrixAt(id, matrix.compose(position, quaternion, scale));
  batchedMesh.setColorAt(id, color.setHSL(Math.random(), 1, 0.5));
}

batchedMesh.computeBVH(WebGLCoordinateSystem);
batchedMesh.frustumCulled = false;
batchedMesh.sortObjects = false;
scene.add(batchedMesh, new DirectionalLight(), new AmbientLight());
