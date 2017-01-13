const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');

module.exports = {
  createConfig(options) {
    var base = {
      devtool: 'cheap-module-source-map',
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
      plugins: this.buildPlugins()
    };
    for (var option in options) {
      base[option] = options[option];
    }
    return base;
  },
  buildPlugins(plugins) {
    var basePlugins = [
      new webpack.optimize.UglifyJsPlugin({
        compress: { warnings: false },
        comments: false
      }),
      new webpack.optimize.AggressiveMergingPlugin(),
      new webpack.optimize.DedupePlugin(),
      new ExtractTextPlugin('index.css', { allChunks: true })
    ];
    if (plugins) {
      plugins.forEach(function(plugin) {
        basePlugins.push(plugin);
      });
    }
    return basePlugins;
  },
  getTemplateData() {
    return {
      'showBackgroundColors': 'Show Background Colors',
      'grayClosedClasses': 'Gray Closed Classes Text',
      'hideClosedClasses': 'Hide Closed Classes',
      'hideCancelledClasses': 'Hide Cancelled Classes',
      'grayConflictingClasses': 'Gray Conflicting Classes Text',
      'hideConflictingClasses': 'Hide Conflicting Classes',
      'hideStaffClasses': 'Hide STAFF Classes',
    };
  }
};
