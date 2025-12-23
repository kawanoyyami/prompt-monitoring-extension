const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const browser = env.browser || 'chrome';
  const outputDir = browser === 'firefox' ? 'dist-firefox' : 'dist-chrome';
  const manifestFile = browser === 'firefox' ? 'manifest.firefox.json' : 'manifest.chrome.json';

  console.log(`\nBuilding for: ${browser.toUpperCase()}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Manifest: ${manifestFile}\n`);

  return {
    entry: {
      popup: './src/popup/index.tsx',
      'content-script': './src/content/content-script.ts',
      'injected-script': './src/content/injected-script.ts',
      'service-worker': './src/background/service-worker.ts'
    },
    output: {
      path: path.resolve(__dirname, outputDir),
      filename: '[name].js',
      clean: true
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js']
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/popup.html',
        filename: 'popup.html',
        chunks: ['popup']
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: `public/${manifestFile}`, to: 'manifest.json' }
        ]
      })
    ],
    optimization: {
      splitChunks: false
    }
  };
};
