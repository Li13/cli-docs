module.exports = function(name) {
  const template = `
{
  "name": "${name}",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {},
  "devDependencies": {
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "vue": "^2.6.10"
  }
}
  `;
  return { template, dir: "", name: "package.json" };
};
