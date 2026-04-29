import esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['server.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/server.cjs',
  external: ['express', 'vite']
}).catch(() => process.exit(1));
