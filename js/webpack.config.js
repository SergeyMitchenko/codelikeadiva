const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const projectSettings = require('./project.settings.js');

const pluginHtml = new HtmlWebpackPlugin({
  template: './src/index.html',
  filename: 'index.html',
  title: `${projectSettings.title} | vol. ${projectSettings.vol}`,
  pageTitle: projectSettings.title,
  challengeTitle: `[vol. ${projectSettings.vol}] "${projectSettings.subtitle}"`,
});

const pluginExtractSass = new MiniCssExtractPlugin({
  filename: '[name].css'
});

module.exports = {
  mode: 'development',
  entry: [
    './src/js/index',
    './src/scss/index.scss'
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'challenge.bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
        }
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ],
      },
    ]
  },
  plugins: [
    pluginHtml,
    pluginExtractSass
  ],
  devServer: {
    // contentBase: './dist'
  },
};
