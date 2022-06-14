/* eslint-disable */
const pluginTypescript = require('@rollup/plugin-typescript')

/** @type {import('rollup').RollupOptions} */
const config = {
  input: 'src/index.ts',
  output: {
    file: 'dist/server.bundle.js',
    format: 'commonjs',
  },
  external: ['express', 'http', 'socket.io', 'os'],
  plugins: [pluginTypescript()],
}

module.exports = config
