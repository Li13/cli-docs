const path = require("path");
const fs = require("../utils/fs-promise");
const install = require("../utils/install");

module.exports = async function(name) {
  const projectDir = path.join(process.cwd(), name);
  await fs.mkdirp(projectDir);
  console.log(`创建${name}文件夹成功`);
  const generatorDir = path.resolve(__dirname, "../generator");
  const files = await fs.readdir(generatorDir);
  for (let i = 0; i < files.length; i++) {
    const { template, dir, name: fileName } = require(path.join(generatorDir, files[i]))(name);
    await fs.mkdirp(path.join(projectDir, dir));
    await fs.writeFile(path.join(projectDir, dir, fileName), template.trim());
    console.log(`创建${fileName}文件成功`);
  }
  install({ cwd: projectDir });
};
