const CopyWebpackPlugin = require('copy-webpack-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const path = require('path')

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /\/node_modules\//,
      },
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  optimization: {
    minimizer: [new TerserPlugin({ parallel: true })],
    splitChunks: {
      chunks: 'all',
    },
    usedExports: true,
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: 'public/assets', to: 'assets' }],
    }),
    new HTMLWebpackPlugin({
      template: 'public/index.html',
      filename: 'index.html',
      hash: true,
      minify: false,
    }),
  ],
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
}
