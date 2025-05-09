import type { BuildConfig } from 'bun'
import dts from 'bun-plugin-dts'

const defaultBuildConfig: BuildConfig = {
	entrypoints: ['./src/index.ts'],
	outdir: './dist',
}

await Promise.all([
	Bun.build({
		...defaultBuildConfig,
		plugins: [dts()],
		format: 'esm',
		target: 'node',
		naming: '[dir]/[name].js',
	}),
	Bun.build({
		...defaultBuildConfig,
		format: 'cjs',
		target: 'node',
		naming: '[dir]/[name].cjs',
	}),
])
