# 如何写一个自己的脚手架 - 一键初始化项目

## 介绍

脚手架的作用：为减少重复性工作而做的重复性工作

即为了开发中的：编译 es6，js 模块化，压缩代码，热更新等功能，我们使用`webpack`等打包工具，但是又带来了新的问题：初始化工程的麻烦，复杂的`webpack`配置，以及各种配置文件，所以就有了一键生成项目，0 配置开发的脚手架

本系列分 3 篇，详细介绍如何实现一个脚手架：

- 一键初始化项目
- 0 配置开发环境与打包
- 一键上传服务器

首先说一下个人的开发习惯

在写功能前我会先把调用方式写出了，然后一步一步的从使用者的角度写，现将基础功能写好后，慢慢完善

例如一键初始化项目功能

我期望的就是 在命令行执行输入 `my-cli create text-project`，回车后直接创建项目并生成模板，还会把依赖都下载好

我们下面就从命令行开始入手

创建项目 `my-cli`，执行 `npm init -y`快速初始化

## bin

**`my-cli`**：

在 `package.json` 中加入：

```json
{
  "bin": {
    "my-cli": "bin.js"
  }
}
```

`bin.js`：

```javascript
#!/usr/bin/env node

console.log(process.argv);
```

`#!/usr/bin/env node`，**这一行是必须加的**，就是让系统动态的去`PATH`目录中查找`node`来执行你的脚本文件。

命令行执行 `npm link` ，创建软链接至全局，这样我们就可以全局使用`my-cli`命令了，在开发 `npm` 包的前期都会使用`link`方式在其他项目中测试来开发，后期再发布到`npm`上

命令行执行 `my-cli 1 2 3`

输出：`[ '/usr/local/bin/node', '/usr/local/bin/my-cli', '1', '2', '3' ]`

这样我们就可以获取到用户的输入参数

例如`my-cli create test-project`

我们就可以通过数组第 [2] 位判断命令类型`create`，通过第 [3] 位拿到项目名称`test-project`

## commander

`node`的命令行解析最常用的就是`commander`库，来简化复杂`cli`参数操作

（我们现在的参数简单可以不使用`commander`，直接用`process.argv[3]`获取名称，但是为了之后会复杂的命令行，这里也先使用`commander`）

```javascript
#!/usr/bin/env node

const program = require("commander");
const version = require("./package.json").version;

program.version(version, "-v, --version");

program
  .command("create <app-name>")
  .description("使用 my-cli 创建一个新的项目")
  .option("-d --dir <dir>", "创建目录")
  .action((name, command) => {
    const create = require("./create/index");
    create(name, command);
  });

program.parse(process.argv);
```

`commander` 解析完成后会触发`action`回调方法

命令行执行：`my-cli -v`

输出：`1.0.0`

命令行执行： `my-cli create test-project`

输出：`test-project`

## 创建项目

拿到了用户传入的名称，就可以用这么名字创建项目
我们的代码尽量保持`bin.js`整洁，将接下来的代码写在`bin.js`里，创建`create`文件夹，创建`index.js`文件

`create/index.js`中：

```javascript
const path = require("path");
const mkdirp = require("mkdirp");

module.exports = function(name) {
  mkdirp(path.join(process.cwd(), name), function(err) {
    if (err) console.error("创建失败");
    else console.log("创建成功");
  });
};
```

`process.cwd()`获取工作区目录，和用户传入项目名称拼接起来

（创建文件夹我们使用`mkdirp`包，可以避免我们一级一级的创建目录）

修改`bin.js`的`action`方法：

```javascript
// bin.js
.action(name => {
    const create = require("./create")
    create(name)
  });
```

命令行执行： `my-cli create test-project`

输出：`创建成功`

并在命令行所在目录创建了一个`test-project`文件夹

## 模板

首先需要先列出我们的模板包含哪些文件

一个最基础版的`vue`项目模板：

```
|- src
  |- main.js
  |- App.vue
  |- components
    |- HelloWorld.vue
|- index.html
|- package.json
```

这些文件就不一一介绍了

我们需要的就是生成这些文件，并写入到目录中去

模板的写法后很多种，下面是我的写法：

模板目录：

```
|- generator
  |- index-html.js
  |- package-json.js
  |- main.js
  |- App-vue.js
  |- HelloWorld-vue.js
```

`generator/index-html.js` 模板示例：

```javascript
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
```

`dir`就是目录，例如`main.js`的`dir`就是`src`

`create/index.js`在`mkdirp`中新增：

```javascript
const path = require("path");
const mkdirp = require("mkdirp");
const fs = require("fs");

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
        }
      });
    }
  });
};
```

这里只写了一个模板的创建，我们可以用`readdir`来获取目录下所有文件来遍历执行

## 下载依赖

我们平常下载`npm`包都是使用命令行 `npm install / yarn install`
这时就需要用到 `node` 的 `child_process.spawn` api 来调用系统命令

因为考虑到跨平台兼容处理，所以使用 [cross-spawn](https://www.npmjs.com/package/cross-spawn) 库，来帮我们兼容的操作命令

我们创建`utils`文件夹，创建`install.js`

`utils/install.js`：

```javascript
const spawn = require("cross-spawn");

module.exports = function install(options) {
  const cwd = options.cwd || process.cwd();
  return new Promise((resolve, reject) => {
    const command = options.isYarn ? "yarn" : "npm";
    const args = ["install", "--save", "--save-exact", "--loglevel", "error"];
    const child = spawn(command, args, { cwd, stdio: ["pipe", process.stdout, process.stderr] });

    child.once("close", code => {
      if (code !== 0) {
        reject({
          command: `${command} ${args.join(" ")}`
        });
        return;
      }
      resolve();
    });
    child.once("error", reject);
  });
};
```

然后我们就可以在创建完模板后调用`install`方法下载依赖

```javascript
install({ cwd: projectDir });
```

要知道工作区为我们项目的目录

至此，解析 cli，创建目录，创建模板，下载依赖一套流程已经完成

基本功能都跑通之后下面就是要填充剩余代码和优化

## 优化

当代码写的多了之后，我们看上面`create`方法内的回调嵌套回调会非常难受

`node 7`已经支持`async，await`，所以我们将上面代码改成`Promise`

在`utils`目录下创建，`promisify.js`：

```javascript
module.exports = function promisify(fn) {
  return function(...args) {
    return new Promise(function(resolve, reject) {
      fn(...args, function(err, ...res) {
        if (err) return reject(err);
        if (res.length === 1) return resolve(res[0]);
        resolve(res);
      });
    });
  };
};
```

这个方法帮我们把回调形式的`Function`改成`Promise`

在`utils`目录下创建，`fs.js`：

```javascript
const fs = require(fs);
const promisify = require("./promisify");
const mkdirp = require("mkdirp");

exports.writeFile = promisify(fs.writeFile);
exports.readdir = promisify(fs.readdir);
exports.mkdirp = promisify(mkdirp);
```

将`fs`和`mkdirp`方法改造成`promise`

改造后的`create.js`：

```javascript
const path = require("path");
const fs = require("../utils/fs-promise");
const install = require("../utils/install");

module.exports = async function(name) {
  const projectDir = path.join(process.cwd(), name);
  await fs.mkdirp(projectDir);
  console.log(`创建${name}文件夹成功`);
  const { template, dir, name: fileName } = require("../generator/package")(name);
  await fs.writeFile(path.join(projectDir, dir, fileName), template.trim());
  console.log(`创建${fileName}文件成功`);
  install({ cwd: projectDir });
};
```

## 结语

关于进一步优化：

- 更多功能与健壮 例如指定目录创建项目，目录不存在等情况
- `chalk`和`ora`优化`log`，给用户更好的反馈
- 通过`inquirer`问询用户得到更多的选择：模板`vue-router`，`vuex`等更多初始化模板功能，`eslint`

更多的功能：

- 内置 webpack 配置
- 一键发布服务器

其实要学会善用第三方库，你会发现我们上面的每个模块都有第三方库的身影，我们只是将这些功能组装起来，再结合我们的想法进一步封装

虽然有`vue-cli`，`create-react-app`这些已有的脚手架，但是我们还是可能在某些情况下需要自己实现脚手架部分功能，根据公司的业务来封装，减少重复性工作，或者了解一下内部原理

【青团社】招聘前端方面： 高级/资深/技术专家，欢迎投递 `lishixuan@qtshe.com`
