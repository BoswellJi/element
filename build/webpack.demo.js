const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const config = require('./config');

// 进程环境变量
const isProd = process.env.NODE_ENV === 'production';
// PLAY_ENV=='true' 获取的是字符串
const isPlay = !!process.env.PLAY_ENV;

const webpackConfig = {
  // webpack的模式，开启对应每个环境下内置的优化
  mode: process.env.NODE_ENV,
  // 模块入口
  entry: isProd ? {
    docs: './examples/entry.js'
  } : (isPlay ? './examples/play.js' : './examples/entry.js'),
  // 打包出口
  output: {
    // 输出路径
    path: path.resolve(process.cwd(), './examples/element-ui/'),
    // 
    publicPath: process.env.CI_ENV || '',
    // 每个输出的bundle的名称
    filename: '[name].[hash:2].js',
    // 提取的公共代码块文件
    chunkFilename: isProd ? '[name].[hash:7].js' : '[name].js'
  },
  // 分解
  resolve: {
    // 尝试解析这些文件后缀
    extensions: ['.js', '.vue', '.json'],
    // 创建模块的别名
    alias: config.alias,
    // 告诉webpack解析模块时，应该搜索的目录
    modules: ['node_modules']
  },
  // 开发服务器
  devServer: {
    // 主机名
    host: '0.0.0.0',
    // 端口
    port: 8085,
    // 打包文件在服务器下的路径
    publicPath: '/',
    // 模块而替换
    hot: true
  },
  // 性能
  performance: {
    // 不展示错误,警告提示
    hints: false
  },
  // 更精确的控制bundle信息的展示
  stats: {
    children: false
  },
  // 模块,规定加载的模块的解析规则
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.(vue|jsx?)$/,
        exclude: /node_modules/,
        loader: 'eslint-loader'
      },
      {
        test: /\.(jsx?|babel|es6)$/,
        include: process.cwd(),
        exclude: config.jsexclude,
        loader: 'babel-loader'
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          compilerOptions: {
            preserveWhitespace: false
          }
        }
      },
      {
        test: /\.(scss|css)$/,
        use: [
          isProd ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.md$/,
        use: [
          {
            loader: 'vue-loader',
            options: {
              compilerOptions: {
                preserveWhitespace: false
              }
            }
          },
          {
            loader: path.resolve(__dirname, './md-loader/index.js')
          }
        ]
      },
      {
        test: /\.(svg|otf|ttf|woff2?|eot|gif|png|jpe?g)(\?\S*)?$/,
        loader: 'url-loader',
        // todo: 这种写法有待调整
        query: {
          limit: 10000,
          name: path.posix.join('static', '[name].[hash:7].[ext]')
        }
      }
    ]
  },
  // 插件
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: './examples/index.tpl',
      filename: './index.html',
      favicon: './examples/favicon.ico'
    }),
    new CopyWebpackPlugin([
      { from: 'examples/versions.json' }
    ]),
    new ProgressBarPlugin(),
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      'process.env.FAAS_ENV': JSON.stringify(process.env.FAAS_ENV)
    }),
    new webpack.LoaderOptionsPlugin({
      vue: {
        compilerOptions: {
          preserveWhitespace: false
        }
      }
    })
  ],
  // 优化,会根据选择的mode来执行不同的优化
  optimization: {
    minimizer: []
  },
  // 控制是否生成,以及如何生成 source-map
  devtool: '#eval-source-map'
};

if (isProd) {
  // 排除bundle中的依赖,外部依赖
  webpackConfig.externals = {
    vue: 'Vue',
    'vue-router': 'VueRouter',
    'highlight.js': 'hljs'
  };
  webpackConfig.plugins.push(
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:7].css'
    })
  );
  webpackConfig.optimization.minimizer.push(
    new UglifyJsPlugin({
      cache: true,
      parallel: true,
      sourceMap: false
    }),
    new OptimizeCSSAssetsPlugin({})
  );
  // https://webpack.js.org/configuration/optimization/#optimizationsplitchunks
  webpackConfig.optimization.splitChunks = {
    cacheGroups: {
      vendor: {
        test: /\/src\//,
        name: 'element-ui',
        chunks: 'all'
      }
    }
  };
  webpackConfig.devtool = false;
}

module.exports = webpackConfig;
