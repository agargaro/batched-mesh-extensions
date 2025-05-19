import { Asset, Main, PerspectiveCameraAuto } from '@three.ez/main';
import { AmbientLight, DirectionalLight, Mesh, MeshNormalMaterial, Scene, TorusKnotGeometry } from 'three';
import { GLTF, GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';
import { simplifyGeometryByAppearanceLOD } from '../src/simplify/simplifyGeometryByAppearanceLOD.js';

const main = new Main();

const glb = await Asset.load<GLTF>(GLTFLoader, 'https://threejs.org/examples/models/gltf/Soldier.glb');
const soldierGroup = glb.scene.children[0];
const dummy = soldierGroup.children[0] as Mesh;
const geometry = dummy.geometry.rotateX(Math.PI / -2).rotateY(Math.PI).scale(0.05, 0.05, 0.05);

// const geometry = new TorusKnotGeometry(1, 0.4, 256, 32, 2, 3);

const geometryLOD = await simplifyGeometryByAppearanceLOD(geometry, 4);

const mesh = new Mesh(geometryLOD[0], dummy.material).translateX(-3).translateZ(245); // 0
const meshLOD0 = new Mesh(geometryLOD[1], dummy.material).translateX(-3.5).translateZ(225); // 25
const meshLOD1 = new Mesh(geometryLOD[2], dummy.material).translateX(-3).translateZ(175); // 75
const meshLOD2 = new Mesh(geometryLOD[3], dummy.material).translateX(0).translateZ(100); // 150
const meshLOD3 = new Mesh(geometryLOD[4], dummy.material).translateX(7).translateZ(-50); // 300

const scene = new Scene().add(mesh, meshLOD0, meshLOD1, meshLOD2, meshLOD3).activeSmartRendering();
const camera = new PerspectiveCameraAuto().translateZ(250);
const controls = new OrbitControls(camera, main.renderer.domElement);
controls.update();
main.createView({ scene, camera });

scene.add(new AmbientLight());
const dirLight = new DirectionalLight('white', 2);
camera.add(dirLight, dirLight.target);
