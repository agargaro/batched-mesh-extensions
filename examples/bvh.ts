import { Main, PerspectiveCameraAuto } from '@three.ez/main';
import { AmbientLight, BatchedMesh, Mesh, BoxGeometry, Color, MeshBasicMaterial, CylinderGeometry, DirectionalLight, Matrix4, MeshLambertMaterial, Quaternion, Scene, SphereGeometry, TorusGeometry, Vector3 } from 'three';
import { FlyControls } from 'three/addons/Addons.js';
import '@three.ez/batched-mesh-extensions';

const camera = new PerspectiveCameraAuto(50, 0.1, 1000).translateZ(10);
const scene = new Scene();
scene.continuousRaycasting = true;
scene.cursor = 'crosshair';
const main = new Main(); // init renderer and other stuff
main.createView({ scene, camera });

const ambientLight = new AmbientLight();
scene.add(ambientLight);
const dirLight = new DirectionalLight('white', 5);
dirLight.position.set(0.5, 0.866, 0);
camera.add(dirLight, dirLight.target);

const controls = new FlyControls(camera, main.renderer.domElement);
controls.movementSpeed = 70;
controls.rollSpeed = 0.2;
scene.on('animate', (e) => controls.update(e.delta));

const count = 1000000;
const spawnRange = 5000;
const halfSpawnRange = spawnRange / 2;
const material = new MeshLambertMaterial();

const box = new BoxGeometry();
const sphere = new SphereGeometry(1, 12, 6);
const cylinder = new CylinderGeometry(1, 1, 1, 16);
const torus = new TorusGeometry(1, 0.4, 6, 12);

const verticesCount = box.attributes.position.count + sphere.attributes.position.count + cylinder.attributes.position.count + torus.attributes.position.count;
const indexesCount = box.index.array.length + sphere.index.array.length + cylinder.index.array.length + torus.index.array.length;

const batchedMesh = new BatchedMesh(count, verticesCount, indexesCount, material);
batchedMesh.sortObjects = false;
batchedMesh.cursor = 'none';

batchedMesh.addGeometry(box);
batchedMesh.addGeometry(sphere);
batchedMesh.addGeometry(cylinder);
batchedMesh.addGeometry(torus);

const color = new Color();
const matrix = new Matrix4();
const position = new Vector3();
const scale = new Vector3();
const quaternion = new Quaternion();

for (let i = 0; i < count; i++) {
  const id = batchedMesh.addInstance(i % 4);
  position.set(Math.random() * spawnRange - halfSpawnRange, Math.random() * spawnRange - halfSpawnRange, Math.random() * spawnRange - halfSpawnRange);
  quaternion.random();
  scale.set(Math.random() * 1.5 + 0.5, Math.random() * 1.5 + 0.5, Math.random() * 1.5 + 0.5);
  batchedMesh.setMatrixAt(id, matrix.compose(position, quaternion, scale));
  batchedMesh.setColorAt(id, color.setHex(Math.random() * 0xffffff));
}

scene.add(batchedMesh);

batchedMesh.computeBVH(main.renderer.coordinateSystem);

const intersectionMesh = new Mesh(new BoxGeometry(0.1, 0.1, 1).translate(0, 0, 0.5), new MeshBasicMaterial({ color: 'white' }));
intersectionMesh.interceptByRaycaster = false;

scene.on('pointerintersection', (e) => {
  const inter = e.intersection;
  if (inter) {
    intersectionMesh.position.copy(inter.point);
    intersectionMesh.scale.setScalar(1 + camera.position.distanceTo(intersectionMesh.position) / 50);

    batchedMesh.getMatrixAt(inter.batchId, matrix);
    inter.normal.transformDirection(matrix).add(inter.point);
    intersectionMesh.lookAt(inter.normal);

    scene.add(intersectionMesh);
  } else {
    intersectionMesh.removeFromParent();
  }
});
