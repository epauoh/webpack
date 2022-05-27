const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const globule = require('globule');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const ImageminMozjpeg = require('imagemin-mozjpeg');

const app = {
  // production / development
  mode: 'production',

  // source-mapタイプのソースマップを出力
  // devtool: 'source-map',

  watchOptions: {
    // 正規表現で指定
    ignored: /node_modules/,
  },

  // エントリーポイント
  entry: './src/js/common.js',

  // ファイルの出力設定
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/common.js',
  },

  module: {
    rules: [
      {
        test: /\.sass$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              url: false,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('autoprefixer')({
                    grid: true,
                  }),
                  require('css-declaration-sorter')({
                    order: 'alphabetical',
                  }),
                  require('postcss-sort-media-queries')({
                    sort: 'mobile-first',
                  }),
                ],
              },
            },
          },
          {
            loader: 'sass-loader',
            options: {
              // ローダーにdart-sassを使用することを明示的に指定
              implementation: require('sass'),
              sassOptions: {
                // expanded / compressed
                outputStyle: 'compressed',
              },
            },
          },
        ],
      },
      {
        test: /\.pug$/i,
        use: [
          {
            loader: 'pug-loader',
            options: {
              pretty: true,
              root: path.resolve(__dirname, 'src/pug'),
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/common.css',
      ignoreOrder: true,
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: `${path.resolve(__dirname, 'src')}/image`,
          to: `${path.resolve(__dirname, 'dist')}/image`,
        },
      ],
    }),
    new ImageminPlugin({
      test: /\.(jpe?g|png|gif|svg)$/i,
      plugins: [
        ImageminMozjpeg({
          quality: 70,
          progressive: true,
        }),
      ],
      pngquant: {
        quality: '70',
      },
      gifsicle: {
        interlaced: false,
        optimizationLevel: 10,
        colors: 256,
      },
      svgo: {},
    }),
  ],
};

const documents = globule.find('./src/pug/**/*.pug', {
  ignore: ['./src/pug/**/_*.pug'],
});

documents.forEach((document) => {
  const fileName = document.replace('./src/pug/', '../').replace('.pug', '.html');
  app.plugins.push(
    new HtmlWebpackPlugin({
      template: document,
      filename: `${fileName}`,
      inject: false,
      minify: true,
    })
  );
});

module.exports = app;
