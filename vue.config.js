const { defineConfig } = require('@vue/cli-service')
const marked = require('marked')
const renderer = new marked.Renderer()

renderer.link = function (href, title, text) {
  return `<a target="_blank" href="${href}" title="${title}">${text}</a>`
}


module.exports = defineConfig({
  transpileDependencies: [
    'vuetify'
  ],
  chainWebpack: config => {
    config.module.rules.delete('svg')
  },
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.svg$/,
          loader: 'vue-html-loader'
        },
        {
          test: /\.md$/,
          use: [
            {
              loader: 'vue-html-loader'
            },
            {
              loader: 'markdown-loader',
              options: {
                pedantic: true,
                renderer
              }
            }
          ]
        }
      ]
    }
  }

})
