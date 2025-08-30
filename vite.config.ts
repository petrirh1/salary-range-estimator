import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	server: {
		proxy: {
			'/api': {
				target: process.env.VITE_API_PROXY || 'http://localhost:8080',
				secure: process.env.NODE_ENV === 'production',
				changeOrigin: true,
			},
		},
	},
});
