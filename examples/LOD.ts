import { createSimplifiedGeometry, getVertexAndIndexCount } from '@three.ez/batched-mesh-extensions';
import { Asset, Main, PerspectiveCameraAuto } from '@three.ez/main';
import { AmbientLight, BatchedMesh, DirectionalLight, Matrix4, Mesh, MeshLambertMaterial, Scene, TorusKnotGeometry, WebGLCoordinateSystem } from 'three';
import { GLTF, GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';

const camera = new PerspectiveCameraAuto().translateZ(10);
const scene = new Scene();
const main = new Main(); // init renderer and other stuff
main.createView({ scene, camera });
const controls = new OrbitControls(camera, main.renderer.domElement);
controls.update();

// const glb = await Asset.load<GLTF>(GLTFLoader, 'https://threejs.org/examples/models/gltf/Soldier.glb');
// const soldierGroup = glb.scene.children[0];
// const dummy = soldierGroup.children[0] as Mesh;
// const geometry = dummy.geometry.scale(0.01, 0.01, 0.01);

const geometry = new TorusKnotGeometry();

const { vertexCount, indexCount } = getVertexAndIndexCount([geometry]);
const batchedMesh = new BatchedMesh(10, vertexCount, indexCount + 100000, new MeshLambertMaterial());
scene.add(batchedMesh, new DirectionalLight(), new AmbientLight());

const geometryId = batchedMesh.addGeometry(geometry, -1, 100000);

const LODGeo = await createSimplifiedGeometry(geometry, { error: 1, ratio: 0.1 });
batchedMesh.addGeometryLOD(geometryId, LODGeo, 15);

const sphereInstancedId1 = batchedMesh.addInstance(geometryId);
// const sphereInstancedId2 = batchedMesh.addInstance(geometryId);

batchedMesh.setMatrixAt(sphereInstancedId1, new Matrix4().makeTranslation(0, 0, 0));
// batchedMesh.setMatrixAt(sphereInstancedId2, new Matrix4().makeTranslation(0, 3, -10));

batchedMesh.computeBVH(WebGLCoordinateSystem);
