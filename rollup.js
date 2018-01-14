const rollup = require('rollup')
const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const typescript = require('rollup-plugin-typescript2')
const multiEntry = require('rollup-plugin-multi-entry')
const postcss = require('rollup-plugin-transform-postcss')
const cssnext = require('postcss-cssnext')
const precss = require('precss')
const entries = require('./entries.json')

const {BUILD_MODE} = process.env
const [_, __, file] = process.argv
const postcssOptions = {
	plugins: [precss, cssnext]
}
const resolveOptions = {
	browser: true,
	jsnext: true
}
const commonjsOptions = {
	include: 'node_modules/**',
	namedExports: {
		'node_modules/firebase/index.js': [
			'app', 'apps', 'auth', 'database', 'initializeApp', 'messaging', 'storage'
		],
		'node_modules/@firebase/util/dist/cjs/index.js': [
			'deepCopy', 'deepExtend', 'createSubscribe', 'ErrorFactory', 'patchProperty'
		]
	}
}
const typescriptOptions = {
	tsconfigOverride: {
		include: ['src/**/*.ts']
	}
}

const plugins = [
	postcss(postcssOptions),
	resolve(resolveOptions),
	commonjs(commonjsOptions),
	typescript(typescriptOptions)
]

const build = async (rollupOptions, writeOptions) => {
	const bundle = await rollup.rollup(rollupOptions)
	await bundle.write(writeOptions)
}

if (BUILD_MODE === 'TEST') {
	return build({
		input: 'src/**/*.test.ts',
		plugins: plugins.push(multiEntry())
	}, {
		format: 'umd',
		name: 'test',
		file: 'dist/test.js'
	})
}
const filteredEntries = file ? entries.filter(entry => entry.file === file) : entries
Promise.all(filteredEntries.map(entry => {
	return build({
		input: entry.file,
		plugins
	}, {
		format: 'umd',
		name: entry.name,
		file: entry.dest
	})
}))
