const path = require("path");
const mkdirp = require("mkdirp");
const fs = require("fs");
const install = require("../utils/install");

module.exports = function(name) {
  const projectDir = path.join(process.cwd(), name);
  mkdirp(projectDir, function(err) {
    if (err) console.error("创建失败");
    else {
      console.log(`创建${name}文件夹成功`);
      const { template, dir, name: fileName } = require("../generator/package")(name);
      fs.writeFile(path.join(projectDir, dir, fileName), template.trim(), function(err) {
        if (err) console.error(`创建${fileName}文件失败`);
        else {
          console.log(`创建${fileName}文件成功`);
          install({ cwd: projectDir });
        }
      });
    }
  });
};
