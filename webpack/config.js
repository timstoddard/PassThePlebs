const HtmlWebpackPlugin = require('html-webpack-plugin');
const utils = require('./utils');

module.exports = [
  utils.createConfig({
    entry: './src/extension/js',
    output: {
      filename: 'index.js',
      path: 'dist/bundle'
    }
  }),
  utils.createConfig({
    entry: './src/options',
    output: {
      filename: 'index.js',
      path: 'dist/options'
    },
    plugins: utils.buildPlugins([
      new HtmlWebpackPlugin({
        template: 'src/options/template.html'
      })
    ])
  })
];
