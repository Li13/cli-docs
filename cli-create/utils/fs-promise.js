const fs = require("fs");
const promisify = require("./promisify");
const mkdirp = require("mkdirp");

exports.writeFile = promisify(fs.writeFile);
exports.readdir = promisify(fs.readdir);
exports.mkdirp = promisify(mkdirp);
exports.readdir = promisify(fs.readdir);
