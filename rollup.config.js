const pluginTypescript = require('@rollup/plugin-typescript')

/** @type {import('rollup').RollupOptions} */
const config = {
  input: 'src/server/index.ts',
  output: {
    file: 'dist-server/server.bundle.js',
    format: 'commonjs',
  },
  external: ['express', 'http', 'socket.io', 'os'],
  plugins: [pluginTypescript()],
}

module.exports = config
