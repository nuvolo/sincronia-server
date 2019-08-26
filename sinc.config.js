module.exports = {
  sourceDirectory: "src",
  rules: [
    {
      match: /\.sn\.ts$/,
      plugins: [
        {
          name: "@sincronia/typescript-plugin",
          options: {
            transpile: false
          }
        },
        {
          name: "@sincronia/babel-plugin",
          options: {
            presets: ["@sincronia/servicenow", "@babel/env", "@babel/typescript"],
            plugins: [
              "@sincronia/remove-modules",
              "@babel/proposal-class-properties",
              "@babel/proposal-object-rest-spread"
            ]
          }
        },
        {
          name: "@sincronia/prettier-plugin",
          options: {}
        }
      ]
    }
  ],
  excludes: {},
  includes: {}
};
