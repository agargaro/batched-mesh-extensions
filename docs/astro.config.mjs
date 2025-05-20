// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightTypeDoc, { typeDocSidebarGroup } from 'starlight-typedoc';
import AutoImport from 'astro-auto-import';
import { resolve } from 'path';
import mdx from '@astrojs/mdx';
// https://astro.build/config
export default defineConfig({
  site: 'https://agargaro.github.io/batched-mesh-extensions',
  base: 'batched-mesh-extensions',
  output: 'static',
  vite: {
    resolve: {
      alias: { $components: resolve('./src/components') },
    },
  },
  integrations: [
    AutoImport({
      imports: ['./src/components/Example/Example.astro'],
    }),
    starlight({
      plugins: [
        // Generate the documentation.
        starlightTypeDoc({
          entryPoints: ['../src/index_webgl.ts', /** '../src/index_webgpu.ts'*/],
          typeDoc: {
            exclude: ['./examples/**/*'],
            skipErrorChecking: true,
            excludeExternals: true,
          },
          tsconfig: '../tsconfig.json',
        }),
      ],
      title: 'Batched Mesh Extension',
      logo: {
        src: './src/assets/samoyed-mascot.png',
        alt: 'logo-samoyed-mascot',
      },
      favicon: './favicon.ico',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/agargaro/batched-mesh-extensions' },
        { icon: 'discord', label: 'Discord', href: 'https://discord.gg/MVTwrdX3JM' }
      ],
      sidebar: [
        {
          label: 'Getting Started',
          autogenerate: { directory: 'getting-started' },
        },
        // {
        //   label: 'Basics',
        //   autogenerate: { directory: 'basics' },
        // },
        // {
        //   label: 'Advanced',
        //   autogenerate: { directory: 'advanced' },
        // },
        // {
        //   label: 'More',
        //   autogenerate: { directory: 'more' },
        // },
        // {
        //   label: 'Reference',
        //   autogenerate: { directory: 'reference' },
        // },
        // Add the generated sidebar group to the sidebar.
        typeDocSidebarGroup,
      ],
    }),
    // Make sure the MDX integration is included AFTER astro-auto-import
    mdx(),
  ],
});
