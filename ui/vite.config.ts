import { loadEnv, defineConfig } from 'vite';
import analyze from 'rollup-plugin-analyzer';
import { visualizer } from 'rollup-plugin-visualizer';
import reactRefresh from '@vitejs/plugin-react-refresh';
import { urbitPlugin } from '@urbit/vite-plugin-urbit';
import { execSync } from 'child_process';

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env.VITE_STORAGE_VERSION = Date.now().toString();

  Object.assign(process.env, loadEnv(mode, process.cwd()));
  const SHIP_URL = process.env.SHIP_URL || process.env.VITE_SHIP_URL || 'http://localhost:80';
  console.log(SHIP_URL);

  return defineConfig({
    base: mode === 'mock' ? undefined : '/apps/park/',
    server: mode === 'mock' ? undefined : { https: false },
    build:
      mode !== 'profile'
        ? undefined
        : {
            rollupOptions: {
              plugins: [
                analyze({
                  limit: 20
                }),
                visualizer()
              ]
            }
          },
    plugins:
      mode === 'mock'
        ? []
        : [urbitPlugin({ base: 'park', target: SHIP_URL, secure: false }), reactRefresh()]
  });
};
