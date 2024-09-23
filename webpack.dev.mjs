import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: 'development',
  entry: {
    background: '/src/ts/background.ts',
    popup: '/src/ts/popup.ts',
    content: '/src/ts/content.ts',
    'fetch-override': '/src/ts/fetch-override.ts',
    'ace-override': '/src/ts/ace-override.ts',
  },
  devtool: 'cheap-module-source-map',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    publicPath: '',
    path: path.resolve(__dirname, 'chrome'),
    filename: '[name].js',
    clean: true,
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/images',
        },
        {
          from: 'src/manifest.json',
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/popup.html',
      filename: 'popup.html',
      chunks: ['popup'],
    }),
  ],
};
