<div align="center">
  
  <h1>Three.ez - BatchedMesh extensions</h1>
  <p>
    <em>Simplify your <b>three.js</b> application development with <b>three.ez</b>!</em> <br><br>
    <b><a href="https://github.com/agargaro/instanced-mesh">three.ez/instanced-mesh</a></b> - Enhanced <code>InstancedMesh</code> with features for performance and usability
  </p>

  <br>

  [![Discord](https://img.shields.io/badge/chat-discord-blue?style=flat&logo=discord)](https://discord.gg/MVTwrdX3JM)
  [![npm](https://img.shields.io/npm/v/@three.ez/batched-mesh-extensions)](https://www.npmjs.com/package/@three.ez/batched-mesh-extensions)
  [![Stars](https://badgen.net/github/stars/agargaro/batched-mesh-extensions)](https://github.com/agargaro/batched-mesh-extensions)
  [![BundlePhobia](https://badgen.net/bundlephobia/min/@three.ez/batched-mesh-extensions)](https://bundlephobia.com/package/@three.ez/batched-mesh-extensions)
  [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=agargaro_batched-mesh-extensions&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=agargaro_batched-mesh-extensions)
  [![DeepScan grade](https://deepscan.io/api/teams/21196/projects/29481/branches/948373/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=21196&pid=29481&bid=948373)

</div>

This library adds and overrides some `BatchedMesh` methods to improve performance and add new features.

- [**Spatial indexing (dynamic BVH)**](#spatial-indexing-dynamic-bvh): *speed up raycasting and frustum culling.*
- [**Per-instance uniforms**](#per-instance-uniforms-webglrenderer-only): *assign unique shader data to individual instances.* (**WebGLRenderer only)**
- [**Level of Detail (LOD)**](#level-of-detail-lod): *dynamically adjust instance detail based on distance.*

## Live Examples

**Using three.js vanilla**

- Will be added in the future. Or you consider to contribute with a PR.

**Using three.ez/main (WebGLRenderer)**

- [Custom uniforms per instance](https://stackblitz.com/edit/three-ez-batchedmesh-extensions?file=src%2Fmain.ts)
- [Compute a BVH](https://glitch.com/edit/#!/three-ez-batched-mesh-extensions-bvh)
- [Compute a BVH and use three-mesh-bvh](https://glitch.com/edit/#!/three-ez-batched-mesh-extensions-three-mesh-bvh?path=main.js)
- [LOD](https://glitch.com/edit/#!/three-ez-batched-mesh-extensions-lod?path=main.js)

## Need help?

Join us on [Discord](https://discord.gg/MVTwrdX3JM) or open an issue on GitHub.

## Like it?

If you like this project, please leave a star. Thank you! ❤️

## Installation

You can install it via npm using the following command:

```bash
npm install @three.ez/batched-mesh-extensions
```

Or you can import it from CDN:

### WebGLRenderer

```html
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three/examples/jsm/",
    "@three.ez/batched-mesh-extensions": "https://cdn.jsdelivr.net/npm/@three.ez/batched-mesh-extensions/build/webgl.js",
    "bvh.js": "https://cdn.jsdelivr.net/npm/bvh.js/build/index.js",
    "meshoptimizer": "https://cdn.jsdelivr.net/npm/meshoptimizer@0.23.0/+esm"
  }
}
</script>
```


### WebGPURenderer

```html
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three/build/three.webgpu.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three/examples/jsm/",
    "@three.ez/batched-mesh-extensions": "https://cdn.jsdelivr.net/npm/@three.ez/batched-mesh-extensions/build/webgpu.js",
    "bvh.js": "https://cdn.jsdelivr.net/npm/bvh.js/build/index.js",
    "meshoptimizer": "https://cdn.jsdelivr.net/npm/meshoptimizer@0.23.0/+esm"
  }
}
</script>
```

## Features

### Spatial indexing (dynamic BVH)

**To speed up raycasting and frustum culling**, a spatial indexing data structure can be created to contain the bounding boxes of all instances. <br>
This works very well if the instances are **mostly static** (updating a BVH can be expensive) and scattered in world space. <br>

Setting a margin makes BVH updating faster, but may make raycasting and frustum culling slightly slower.

```ts
myBatchedMesh.computeBVH(renderer.coordinateSystem, { margin: 0 }); // margin is optional
```

**It's necessary to manually update the BVH after its creation with the following methods:**

```ts
myBatchedMesh.bvh.insert(instanceId);
myBatchedMesh.bvh.insertRange(instanceIdsArray);
myBatchedMesh.bvh.move(instanceId);
myBatchedMesh.bvh.delete(instanceId);
myBatchedMesh.bvh.clear();
```

### Per-instance uniforms (WebGLRenderer only)

Assign unique shader uniforms to each instance, working with every materials.

```ts
myBatchedMesh.initUniformsPerInstance({ vertex: { noise: 'float' }, fragment: { metalness: 'float', roughness: 'float', emissive: 'vec3' } });

myBatchedMesh.setUniformAt(index, 'noise', 0.5);
myBatchedMesh.setUniformAt(index, 'emissive', new Color('red'));
```

### Level of Detail (LOD)

Improve rendering performance by dynamically adjusting the detail level of instances based on their distance from the camera. <br>
Use simplified geometries for distant objects to optimize resources.

Currently, only LODs that share the same geometry vertex array can be added. This will improve in the future.

```ts
const geometryId = batchedMesh.addGeometry(geometry, -1, reservedIndexCount);
batchedMesh.addGeometryLOD(geometryId, geometryLOD1, distanceLOD1);
batchedMesh.addGeometryLOD(geometryId, geometryLOD2, distanceLOD2);
batchedMesh.addGeometryLOD(geometryId, geometryLOD3, distanceLOD3);
```  

## Special thanks to

- [gkjohnson](https://github.com/gkjohnson)
- [manthrax](https://github.com/manthrax)
- [donmccurdy](https://github.com/donmccurdy)  
- [ctrlmonster](https://github.com/Ctrlmonster)
