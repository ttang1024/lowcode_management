module.exports = function(content) {
  const id = require.resolve('./runtime.js');
  return content + ';require(\'' + id + '\')';
};