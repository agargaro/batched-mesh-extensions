import { Asset, Main, PerspectiveCameraAuto } from '@three.ez/main';
import { AmbientLight, BufferGeometry, BufferGeometryLoader, DirectionalLight, Mesh, MeshLambertMaterial, Scene } from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { simplifyGeometryByAppearanceLOD } from '../src/simplify/simplifyGeometryByAppearanceLOD.js';
import { extendBatchedMeshPrototype } from '@three.ez/batched-mesh-extensions';

extendBatchedMeshPrototype();

const main = new Main();

// const glb = await Asset.load<GLTF>(GLTFLoader, 'https://threejs.org/examples/models/gltf/Soldier.glb');
// const soldierGroup = glb.scene.children[0];
// const dummy = soldierGroup.children[0] as Mesh;
// const geometry = dummy.geometry.rotateX(Math.PI / -2).rotateY(Math.PI).scale(0.05, 0.05, 0.05);
// const material = dummy.material;

const material = new MeshLambertMaterial();
// const geometry = new TorusKnotGeometry(1, 0.4, 256, 32, 2, 3);

const geometry = await Asset.load<BufferGeometry>(BufferGeometryLoader, 'https://threejs.org/examples/models/json/suzanne_buffergeometry.json');
geometry.computeVertexNormals();

const geometryLOD = await simplifyGeometryByAppearanceLOD(geometry, 4);

const mesh = new Mesh(geometryLOD[0], material).translateX(-3).translateZ(100 - 5);
const meshLOD0 = new Mesh(geometryLOD[1], material).translateX(-3.5).translateZ(100 - 20);
const meshLOD1 = new Mesh(geometryLOD[2], material).translateX(-3).translateZ(100 - 75);
const meshLOD2 = new Mesh(geometryLOD[3], material).translateX(0).translateZ(100 - 125);
const meshLOD3 = new Mesh(geometryLOD[4], material).translateX(7).translateZ(100 - 200);

const scene = new Scene().add(mesh, meshLOD0, meshLOD1, meshLOD2, meshLOD3).activeSmartRendering();
const camera = new PerspectiveCameraAuto().translateZ(100);
const controls = new OrbitControls(camera, main.renderer.domElement);
controls.update();
main.createView({ scene, camera });

scene.add(new AmbientLight());
const dirLight = new DirectionalLight('white', 3);
camera.add(dirLight, dirLight.target);
