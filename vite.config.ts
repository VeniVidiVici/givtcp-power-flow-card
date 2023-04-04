import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		sourcemap: true,
		lib: {
			entry: 'src/givtcp-power-flow-card.ts',
			formats: ['es'],
		},
		rollupOptions: {
			external: [/^lit-element/, /^lit/],
		},
	},
	optimizeDeps: {
		disabled: true,
	}
})
