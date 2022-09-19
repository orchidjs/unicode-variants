import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import path from 'path';

var configs = [];
const banner = `/*! @orchidjs/unicode-variants | https://github.com/orchidjs/unicode-variants | Apache License (v2) */`;

const extensions = [
  '.js', '.jsx', '.ts', '.tsx', '.mjs',
];

var babel_config = babel({
	extensions: extensions,
	babelHelpers: 'bundled',
	configFile: path.resolve(__dirname,'babel.config.json'),
});

var terser_config = terser({
  mangle: true,
  format: {
    semicolons: false,
    comments: function (node, comment) {
      var text = comment.value;
      var type = comment.type;
      if (type == "comment2") {
        // multiline comment
        return /^!/i.test(text);
      }
    },
  },
});


// esm
configs.push({
	input: path.resolve(__dirname,'../lib/index.mjs'),
	output:{
		dir: path.resolve(__dirname,'../dist/esm'),
		format: 'esm',
		preserveModules: true,
		sourcemap: true,
		banner: banner,
		entryFileNames: '[name].js',
	},
	plugins:[babel_config] // resolve_config
});

// cjs
configs.push({
	input: path.resolve(__dirname,'../lib/index.mjs'),
	output:{
		dir: path.resolve(__dirname,'../dist/cjs'),
		format: 'cjs',
		preserveModules: false,
		sourcemap: true,
		banner: banner,
	},
	plugins:[babel_config] //resolve_config
});


// umd
configs.push({
		input: path.resolve(__dirname,'../lib/index.mjs'),
		output: {
			name: 'diacritics',
			file: `dist/umd/index.js`,
			format: 'umd',
			preserveModules: false,
			sourcemap: true,
			banner: banner
		},
		plugins:[
			babel_config,
		]
	});

// umd min
configs.push({
		input: path.resolve(__dirname,'../lib/index.mjs'),
		output: {
			name: 'diacritics',
			file: `dist/umd/index.min.js`,
			format: 'umd',
			sourcemap: true,
			banner: banner
		},
		plugins:[
			babel_config,
			terser_config
		]
	});


export default configs;
