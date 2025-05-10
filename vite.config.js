import { resolve } from 'path';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { externalizeDeps } from 'vite-plugin-externalize-deps';

export default defineConfig(({ command }) => ({
  publicDir: command === 'build' ? false : 'public',
  resolve: {
    alias: {
      '@three.ez/batched-mesh-extensions': resolve(__dirname, 'src/index_webgl.ts')
    }
  },
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index_webgl.ts'),
      fileName: 'build/webgl',
      formats: ['es', 'cjs']
    }
  },
  plugins: [
    externalizeDeps(),
    viteStaticCopy({
      targets: [{
        src: ['LICENSE', 'package.json', 'README.md'],
        dest: './'
      }]
    })
  ]
}));
