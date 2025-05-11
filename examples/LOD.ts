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

const geometry1 = new SphereGeometry();
const geometry2 = new TorusKnotGeometry();

const LODGeo1 = await createSimplifiedGeometry(geometry1, { error: 1, ratio: 0.3, lockBorder: true });
const LODGeo2 = await createSimplifiedGeometry(geometry2, { error: 1, ratio: 0.5, lockBorder: true });

const LODGeo11 = await createSimplifiedGeometry(geometry1, { error: 1, ratio: 0.2, lockBorder: true });
const LODGeo12 = await createSimplifiedGeometry(geometry2, { error: 1, ratio: 0.2, lockBorder: true });

const { vertexCount, indexCount } = getVertexAndIndexCount([geometry1, geometry2]);

const batchedMesh = new BatchedMesh(2, vertexCount, indexCount + LODGeo1.drawRange.count + LODGeo2.drawRange.count + LODGeo11.drawRange.count + LODGeo12.drawRange.count, new MeshLambertMaterial());

const geometryId = batchedMesh.addGeometry(geometry1, -1, geometry1.index.count + LODGeo1.drawRange.count + LODGeo11.drawRange.count);
const geometryId2 = batchedMesh.addGeometry(geometry2, -1, geometry2.index.count + LODGeo2.drawRange.count + LODGeo12.drawRange.count);

batchedMesh.addGeometryLOD(geometryId, LODGeo1, 15);
batchedMesh.addGeometryLOD(geometryId, LODGeo11, 30);
batchedMesh.addGeometryLOD(geometryId2, LODGeo2, 15);
batchedMesh.addGeometryLOD(geometryId2, LODGeo12, 30);

const sphereInstancedId1 = batchedMesh.addInstance(geometryId);
batchedMesh.setMatrixAt(sphereInstancedId1, new Matrix4().makeTranslation(-1, -1, 0));
const sphereInstancedId2 = batchedMesh.addInstance(geometryId2);
batchedMesh.setMatrixAt(sphereInstancedId2, new Matrix4().makeTranslation(1, 1, 0));

batchedMesh.computeBVH(WebGLCoordinateSystem);

scene.add(batchedMesh, new DirectionalLight(), new AmbientLight());
