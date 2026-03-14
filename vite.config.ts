import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [eslint()],
	build: {
		lib: {
			entry: 'src/givtcp-power-flow-card.ts',
			fileName: () => 'givtcp-power-flow-card.js',
			formats: ['es'],
		},
		rollupOptions: {},
	},
	optimizeDeps: {
		noDiscovery: true,
		include: [],
	},
});
