// Build alternativo: gera um unico HTML com CSS e JS embutidos, para publicar
// como Artifact. O build normal (vite.config.js) segue gerando dist/ para o
// deploy estatico.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'dist-artifact',
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    rollupOptions: { input: 'index.html' },
  },
})
