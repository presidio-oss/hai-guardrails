import type { BuildConfig } from 'bun'
import dts from 'bun-plugin-dts'

const production = process.argv.includes('--production')

const defaultBuildConfig: BuildConfig = {
	entrypoints: ['./src/index.ts'],
	outdir: './dist',
	target: 'node',
	external: ['@langchain/core', 'pino'],
	define: {
		'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
	},
}

await Promise.all([
	Bun.build({
		...defaultBuildConfig,
		plugins: [dts()],
		format: 'esm',
		naming: '[dir]/[name].js',
	}),
	Bun.build({
		...defaultBuildConfig,
		format: 'cjs',
		naming: '[dir]/[name].cjs',
	}),
])
