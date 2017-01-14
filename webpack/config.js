const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const utils = require('./utils');

module.exports = [
  // extension
  utils.createConfig({
    entry: './src/extension/js',
    output: {
      filename: 'index.js',
      path: 'dist/bundle'
    },
    plugins: utils.buildPlugins([
      new webpack.ProvidePlugin({
        $: 'jquery'
      })
    ])
  }),
  // background
  utils.createConfig({
    entry: './src/extension/background',
    output: {
      filename: 'background.js',
      path: 'dist/bundle'
    }
  }),
  // options
  utils.createConfig({
    entry: './src/options',
    output: {
      filename: 'index.js',
      path: 'dist/options'
    },
    plugins: utils.buildPlugins([
      new HtmlWebpackPlugin({
        template: 'src/options/template.ejs',
        data: utils.getTemplateData(),
        minify: {
          collapseWhitespace: true,
          removeComments: true
        }
      })
    ])
  })
];
