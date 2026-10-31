import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {cloudflare} from '@cloudflare/vite-plugin';
export default defineConfig(({mode})=>({plugins:mode==='pages'||mode==='demo'?[react()]:[react(),cloudflare()],base:mode==='pages'?'./':'/',...(mode==='pages'?{build:{outDir:'dist/pages'}}:{})}));
