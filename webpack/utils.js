const webpack = require('webpack')
const merge = require('webpack-merge')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const autoprefixer = require('autoprefixer')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  createConfig(options) {
    const base = {
      mode: 'production',
      devtool: 'eval', // fastest page reload time
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {
              presets: ['env', 'stage-2'],
            },
          },
          {
            test: /\.scss$/,
            use: [
              MiniCssExtractPlugin.loader,
              'css-loader',
              {
                loader: 'postcss-loader',
                options: {
                  ident: 'postcss',
                  plugins: [autoprefixer],
                },
              },
              'sass-loader',
            ],
          },
        ],
      },
      plugins: this.buildPlugins(),
      performance: {
        hints: false
      }
    }
    return merge(base, options)
  },
  buildPlugins(plugins) {
    const basePlugins = [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
        uglifyOptions: {
          compress: {
            warnings: true,
          },
          toplevel: true,
          keep_classnames: true,
        },
      }),
      new webpack.optimize.AggressiveMergingPlugin(),
      new MiniCssExtractPlugin({ filename: 'index.css' }),
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
