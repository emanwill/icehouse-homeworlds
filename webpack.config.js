const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const { fileURLToPath } = require('url')

/** @type {import('webpack').Configuration} */
const config = {
  mode: 'development',
  entry: './src/app/index.ts',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist-client'),
  },
  module: {
    rules: [{ test: /\.tsx?$/, use: 'ts-loader', exclude: /\/node_modules\// }],
  },
  plugins: [new HtmlWebpackPlugin({ template: 'src/assets/index.html' })],
  optimization: {
    splitChunks: {
      chunks: 'async',
      minSize: 20000,
      minRemainingSize: 0,
      minChunks: 1,
      cacheGroups: {
        defaultVendors: {
          test: /\/node_modules\//,
          priority: -10,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
}

module.exports = config
