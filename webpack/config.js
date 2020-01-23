const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const path = require('path')
const utils = require('./utils')

module.exports = [
  // extension
  utils.createConfig({
    entry: './src/extension/js',
    output: {
      filename: 'index.js',
      path: path.join(__dirname, '/../dist/bundle'),
    },
    plugins: utils.buildPlugins([
      new webpack.ProvidePlugin({
        $: 'jquery',
      }),
      new CopyPlugin([
        {
          from: path.join(__dirname, '/../src/manifest.json'),
          to: path.join(__dirname,'/../dist'),
        },
        {
          from: path.join(__dirname, '/../media/icons/'),
          to: path.join(__dirname,'/../dist/icons'),
          ignore:['*.jsx','*.psd'],
        },
      ]),
    ]),
  }),
  // background
  utils.createConfig({
    entry: './src/extension/background',
    output: {
      filename: 'background.js',
      path: `${__dirname}/../dist/bundle`,
    },
  }),
  // options
  utils.createConfig({
    entry: './src/options',
    output: {
      filename: 'index.js',
      path: `${__dirname}/../dist/options`,
    },
    plugins: utils.buildPlugins([
      new HtmlWebpackPlugin({
        template: 'src/options/template.ejs',
        radioHeaders: utils.getRadioHeaders(),
        radioOptions: utils.getRadioOptions(),
        minify: {
          collapseWhitespace: true,
          removeComments: true,
        },
      }),
    ]),
  }),
]
