const { defineConfig } = require("@vue/cli-service");
const marked = require("marked");
const renderer = new marked.Renderer();

renderer.link = function (href, title, text) {
  return `<a target="_blank" href="${href}" title="${title}">${text}</a>`;
};

module.exports = defineConfig({
  transpileDependencies: true,

  pluginOptions: {
    vuetify: {
      // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vuetify-loader
    },
  },
  chainWebpack: (config) => {
    config.module.rules.delete("svg"); // No change needed unless there are specific issues
  },
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.svg$/,
          loader: "vue-html-loader", // 'vue-html-loader' is likely not needed for Vue 3; use asset modules instead
        },
        {
          test: /\.md$/,
          use: [
            {
              loader: "html-loader", // Update to 'html-loader' which is compatible with Webpack 5
            },
            {
              loader: "markdown-loader",
              options: {
                pedantic: true,
                renderer,
              },
            },
          ],
        },
      ],
    },
  },
});
