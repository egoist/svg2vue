module.exports = {
  entry: './src/index.js',
  chainWebpack(config) {
    config.plugin('monaco')
      .use(require('monaco-editor-webpack-plugin'), [{
        languages: ['html']
      }])
  }
}