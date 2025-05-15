import path, { dirname, resolve } from 'path';
import { readdirSync, mkdirSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const aceDir = path.resolve(__dirname, 'node_modules/ace-builds/src-min-noconflict');
const themeFiles = readdirSync(aceDir).filter((file) => /^theme-.*\.js$/.test(file) && !file.includes('kr_theme.js'));
const themeNames = themeFiles.map((file) => file.replace(/^theme-/, '').replace(/\.js$/, ''));

const generatedThemeModule = `export const themes = ${JSON.stringify(themeNames, null, 2)};\n`;
const generatedDir = path.resolve(__dirname, 'src/generated');
const outputFile = path.join(generatedDir, 'themes.ts');
mkdirSync(generatedDir, { recursive: true });
writeFileSync(outputFile, generatedThemeModule);

export default {
  mode: 'production',
  entry: {
    background: '/src/ts/background.ts',
    popup: '/src/ts/popup.ts',
    content: '/src/ts/content.ts',
    'fetch-override': '/src/ts/fetch-override.ts',
    'ace-override': '/src/ts/ace-override.ts',
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
    usedExports: true,
    sideEffects: false,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
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
    path: resolve(__dirname, 'chrome'),
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
      minify: {
        collapseWhitespace: true,
        removeComments: true,
      },
    }),
  ],
};
