const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    background: ['./src/integrations/chrome/sessionApi.js','./src/service_worker/background.js'],
    content: ['./src/script/util.js','./src/integrations/tab/pageActions.js','./src/integrations/camunda-api/camundaApi.js','./src/integrations/chrome/sessionApi.js', './content.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'manifest.json', to: '.' },
        { from: 'images', to: 'images' },
        { from: 'json', to: 'json' },
        { from: './camunda-tools.html', to: '.' },
        { from: './camunda-tools.css', to: '.'},
        { from: './inserted-style.css', to: '.'}
      ],
    }),
  ],
};
