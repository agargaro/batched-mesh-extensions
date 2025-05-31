import { extendBatchedMeshPrototype, getBatchedMeshCount, getBatchedMeshLODCount } from '@three.ez/batched-mesh-extensions';
import { Main, PerspectiveCameraAuto } from '@three.ez/main';
import { AmbientLight, BatchedMesh, DirectionalLight, Matrix4, MeshLambertMaterial, Scene, SphereGeometry, TorusKnotGeometry, WebGLCoordinateSystem } from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { simplifyGeometry } from '../src/simplify/simplifyGeometry';

extendBatchedMeshPrototype();

const camera = new PerspectiveCameraAuto().translateZ(10);
const scene = new Scene();
const main = new Main(); // init renderer and other stuff
main.createView({ scene, camera });
const controls = new OrbitControls(camera, main.renderer.domElement);
controls.update();

const sphereGeo = new SphereGeometry();
const torusKnotGeo = new TorusKnotGeometry();

// CREATE SIMPLIFIED GEOMETRIES

const sphereGeoLOD1 = await simplifyGeometry(sphereGeo, { error: 1, ratio: 0.3, lockBorder: true });
const sphereGeoLOD2 = await simplifyGeometry(sphereGeo, { error: 1, ratio: 0.2, lockBorder: true });
const torusKnotGeoLOD1 = await simplifyGeometry(torusKnotGeo, { error: 1, ratio: 0.4, lockBorder: true });
const torusKnotGeoLOD2 = await simplifyGeometry(torusKnotGeo, { error: 1, ratio: 0.2, lockBorder: true });

// CREATE BATCHED MESH

const { vertexCount } = getBatchedMeshCount([sphereGeo, torusKnotGeo]);
const { LODIndexCount, indexCount } = getBatchedMeshLODCount([[sphereGeo, sphereGeoLOD1, sphereGeoLOD2], [torusKnotGeo, torusKnotGeoLOD1, torusKnotGeoLOD2]]);
const batchedMesh = new BatchedMesh(2, vertexCount, indexCount, new MeshLambertMaterial());

// ADD GEOMETRIES

const geometryId = batchedMesh.addGeometry(sphereGeo, -1, LODIndexCount[0]);
const geometryId2 = batchedMesh.addGeometry(torusKnotGeo, -1, LODIndexCount[1]);

// ADD GEOMETRIES LODS

batchedMesh.addGeometryLOD(geometryId, sphereGeoLOD1, 10);
batchedMesh.addGeometryLOD(geometryId, sphereGeoLOD2, 40);
batchedMesh.addGeometryLOD(geometryId2, torusKnotGeoLOD1, 10);
batchedMesh.addGeometryLOD(geometryId2, torusKnotGeoLOD2, 40);

// ADD INSTANCES

const sphereInstancedId1 = batchedMesh.addInstance(geometryId);
const sphereInstancedId2 = batchedMesh.addInstance(geometryId2);
batchedMesh.setMatrixAt(sphereInstancedId1, new Matrix4().makeTranslation(-1, -1, 0));
batchedMesh.setMatrixAt(sphereInstancedId2, new Matrix4().makeTranslation(1, 1, 0));

// COMPUTE TLAS BVH

batchedMesh.computeBVH(WebGLCoordinateSystem);

scene.add(batchedMesh, new DirectionalLight(), new AmbientLight());
