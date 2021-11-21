module.exports = {
  root: true,
  parser: 'babel-eslint',
  env: {
    browser: true,
    node: true
  },
  extends: 'standard',
  // add your custom rules here
  rules: {
    "space-before-function-paren": [0, "never"]
  },
  globals: {}
};
