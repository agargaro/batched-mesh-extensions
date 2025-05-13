import { simplifyGeometryLODAuto } from '@three.ez/batched-mesh-extensions';
import { Asset, Main, OrthographicCameraAuto } from '@three.ez/main';
import { AmbientLight, DirectionalLight, Mesh, Scene } from 'three';
import { GLTF, GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';

const main = new Main();

const glb = await Asset.load<GLTF>(GLTFLoader, 'https://threejs.org/examples/models/gltf/Soldier.glb');
const soldierGroup = glb.scene.children[0];
const dummy = soldierGroup.children[0] as Mesh;
const geometry = dummy.geometry.rotateX(Math.PI / -2).rotateY(Math.PI);

// const geometry = new TorusKnotGeometry(1, 0.4, 256, 32, 2, 3);
const geometryLOD = await simplifyGeometryLODAuto(geometry, 4);

const mesh = new Mesh(geometry, dummy.material).translateX(-40);
const meshLOD0 = new Mesh(geometryLOD[0], dummy.material).translateX(-20);
const meshLOD1 = new Mesh(geometryLOD[1], dummy.material);
const meshLOD2 = new Mesh(geometryLOD[2], dummy.material).translateX(20);
const meshLOD3 = new Mesh(geometryLOD[3], dummy.material).translateX(40);

mesh.scale.setScalar(0.1);
meshLOD0.scale.setScalar(0.1);
meshLOD1.scale.setScalar(0.1);
meshLOD2.scale.setScalar(0.1);
meshLOD3.scale.setScalar(0.1);

const scene = new Scene().add(mesh, meshLOD0, meshLOD1, meshLOD2, meshLOD3).activeSmartRendering();
const camera = new OrthographicCameraAuto(100).translateZ(100);
const controls = new OrbitControls(camera, main.renderer.domElement);
controls.update();
main.createView({ scene, camera });

scene.add(new AmbientLight());
const dirLight = new DirectionalLight('white', 2);
camera.add(dirLight, dirLight.target);
