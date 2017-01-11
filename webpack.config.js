const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');

module.exports = {
  devtool: 'cheap-module-source-map',
  entry: './js',
  output: {
    filename: 'main.js',
    path: __dirname + '/dist/bundle'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader?presets[]=es2015&presets[]=stage-0',
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract('style-loader', ['css-loader', 'postcss-loader', 'sass-loader'])
      }
    ]
  },
  postcss: function() {
    return [autoprefixer];
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
      comments: false
    }),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.DedupePlugin(),
    new ExtractTextPlugin('main.css', { allChunks: true })
  ]
};
