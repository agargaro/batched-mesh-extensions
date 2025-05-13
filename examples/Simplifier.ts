import { simplifyGeometry, SimplifyParams } from '@three.ez/batched-mesh-extensions';
import { Asset, Main, PerspectiveCameraAuto } from '@three.ez/main';
import { AmbientLight, DirectionalLight, Mesh, MeshNormalMaterial, Scene, TorusKnotGeometry } from 'three';
import { GLTF, GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';

const main = new Main();

const glb = await Asset.load<GLTF>(GLTFLoader, 'https://threejs.org/examples/models/gltf/Soldier.glb');
const soldierGroup = glb.scene.children[0];
const dummy = soldierGroup.children[0] as Mesh;

// const originalGeometry = mesh.geometry.rotateX(Math.PI / -2).rotateY(Math.PI);
const originalGeometry = new TorusKnotGeometry();
const mesh = new Mesh(originalGeometry, new MeshNormalMaterial()); // dummy.material

const params: SimplifyParams = {
  ratio: 1,
  error: 1,
  errorAbsolute: false,
  lockBorder: false,
  prune: false,
  sparse: false,
  logAppearanceError: true
};

const pane = new Pane();
pane.on('change', onChange);
pane.addBinding(params, 'ratio', { min: 0, max: 1, step: 0.001 });
pane.addBinding(params, 'error', { min: 0, max: 1, step: 0.001 });
pane.addBinding(params, 'errorAbsolute');
pane.addBinding(params, 'lockBorder');
pane.addBinding(params, 'prune');
pane.addBinding(params, 'sparse');

const scene = new Scene().add(mesh).activeSmartRendering();
const camera = new PerspectiveCameraAuto(50).translateZ(10);
const controls = new OrbitControls(camera, main.renderer.domElement);
controls.update();
main.createView({ scene, camera });

async function onChange(): Promise<void> {
  mesh.geometry = await simplifyGeometry(originalGeometry, params) as TorusKnotGeometry;
  scene.needsRender = true;
}

scene.add(new AmbientLight());
const dirLight = new DirectionalLight('white', 2);
camera.add(dirLight, dirLight.target);
