import { createSimplifiedGeometry, getVertexAndIndexCount } from '@three.ez/batched-mesh-extensions';
import { Main, PerspectiveCameraAuto } from '@three.ez/main';
import { AmbientLight, BatchedMesh, DirectionalLight, Matrix4, MeshLambertMaterial, Scene, SphereGeometry, TorusKnotGeometry, WebGLCoordinateSystem } from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

const camera = new PerspectiveCameraAuto().translateZ(10);
const scene = new Scene();
const main = new Main(); // init renderer and other stuff
main.createView({ scene, camera });
const controls = new OrbitControls(camera, main.renderer.domElement);
controls.update();

const geometry1 = new TorusKnotGeometry();
const geometry2 = new SphereGeometry();

const { vertexCount, indexCount } = getVertexAndIndexCount([geometry1, geometry2]);
const batchedMesh = new BatchedMesh(10, vertexCount, indexCount + 10000, new MeshLambertMaterial());
scene.add(batchedMesh, new DirectionalLight(), new AmbientLight());

const geometryId = batchedMesh.addGeometry(geometry1, -1, 5000);
const LODGeo = await createSimplifiedGeometry(geometry1, { error: 1, ratio: 0.1 });
batchedMesh.addGeometryLOD(geometryId, LODGeo, 15);

const geometryId2 = batchedMesh.addGeometry(geometry2, -1, 5000);
const LODGeo2 = await createSimplifiedGeometry(geometry2, { error: 1, ratio: 0.2, lockBorder: true });
batchedMesh.addGeometryLOD(geometryId2, LODGeo2, 15);

const sphereInstancedId1 = batchedMesh.addInstance(geometryId);
batchedMesh.setMatrixAt(sphereInstancedId1, new Matrix4().makeTranslation(-1, -1, 0));
const sphereInstancedId2 = batchedMesh.addInstance(geometryId2);
batchedMesh.setMatrixAt(sphereInstancedId2, new Matrix4().makeTranslation(1, 1, 0));

batchedMesh.computeBVH(WebGLCoordinateSystem);
