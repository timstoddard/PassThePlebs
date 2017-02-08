const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const autoprefixer = require('autoprefixer')

module.exports = {
  createConfig(options) {
    const base = {
      devtool: 'cheap-module-source-map',
      module: {
        loaders: [
          {
            test: /\.js$/,
            // because uglifyjs can't handle the fact that the
            // url-regex module needs to be a special snowflake
            exclude: /node_modules(?!\/url-regex)/,
            loader: 'babel',
            query: {
              presets: ['es2015', 'stage-0'],
            },
          },
          {
            test: /\.scss$/,
            loader: ExtractTextPlugin.extract('style-loader', ['css-loader', 'postcss-loader', 'sass-loader']),
          },
        ],
      },
      postcss: () => [autoprefixer],
      plugins: this.buildPlugins(),
    }
    return Object.assign(base, options)
  },
  buildPlugins(plugins) {
    const basePlugins = [
      new webpack.optimize.UglifyJsPlugin({
        compress: { warnings: false },
        comments: false,
      }),
      new webpack.optimize.AggressiveMergingPlugin(),
      new webpack.optimize.DedupePlugin(),
      new ExtractTextPlugin('index.css', { allChunks: true }),
    ]
    if (plugins) {
      basePlugins.push(...plugins)
    }
    return basePlugins
  },
  getRadioHeaders: () => ({
    closedClasses: 'Closed Classes',
    cancelledClasses: 'Cancelled Classes',
    conflictingClasses: 'Conflicting Classes',
    staffClasses: 'STAFF Classes',
  }),
  getRadioOptions: () => ['normal', 'gray', 'hidden'],
}
