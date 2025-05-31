import { BatchedMesh, WebGLProgramParametersWithUniforms, WebGLRenderer } from 'three';

export function patchBatchedMeshMaterial(batchedMesh: BatchedMesh): void {
  const material = batchedMesh.material;
  const onBeforeCompileBase = material.onBeforeCompile.bind(material);

  // TODO edit also the material compile cache key?

  material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms, renderer: WebGLRenderer) => {
    if (batchedMesh.uniformsTexture) {
      shader.uniforms.uniformsTexture = { value: batchedMesh.uniformsTexture };
      const { vertex, fragment } = batchedMesh.uniformsTexture.getUniformsGLSL('uniformsTexture', 'batchIndex', 'float');
      shader.vertexShader = shader.vertexShader.replace('void main() {', vertex);
      shader.fragmentShader = shader.fragmentShader.replace('void main() {', fragment);

      shader.vertexShader = shader.vertexShader.replace('void main() {', 'void main() { float batchIndex = getIndirectIndex( gl_DrawID );');
    }

    onBeforeCompileBase(shader, renderer);
  };
}
