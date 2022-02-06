module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:nuxt/recommended',
    'airbnb',
    // 'prettier',
  ],
  plugins: [],
  // add your custom rules here
  rules: {
    'no-shadow': 'off',
    'import/no-extraneous-dependencies': 'off',
  },
};
