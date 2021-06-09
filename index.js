#!/usr/bin/env node
// 使用node 开发命令行工具所执行的JavaScript 脚本必许在顶部加入 #!/usr/bin/env node
// 2根据不同的命令执行不同的操作功能
const program = require('commander');
const download = require('download-git-repo')
const handlebars = require("handlebars")
const inquirer = require("inquirer")
const fs = require('fs')
const ora = require('ora')
const chalk = require('chalk')
const template = {
  'tpl-a': {
    url: 'https://github.com/MaplesLeaves/template-a.git',
    downloadUrl: 'http://github.com:MaplesLeaves/template-a#master',
    description: 'a模板'
  },
  'tpl-b': {
    url: 'https://github.com/MaplesLeaves/template-b.git',
    downloadUrl: 'http://github.com:MaplesLeaves/template-b#master',
    description: 'b模板'
  },
  'tpl-c': {
    url: 'https://github.com/MaplesLeaves/template-.git',
    downloadUrl: 'http://github.com:MaplesLeaves/template-#master',
    description: 'c模板'
  }
}
program
  .version('0.1.0') // -v 版本号  --version
  .option('-C, --chdir <path>', 'change the working directory')
  .option('-c, --config <path>', 'set config path. defaults to ./deploy.conf')
  .option('-T, --no-tests', 'ignore test hook')
program
  .command('init <template> <project>')
  .description('初始化项目模板')
  .option('-s, --setup_mode [mode]', 'Which setup mode to use')
  .action(function (templateName, projectName) {
    const spinner = ora('正在下载').start()
    // 根据模板名称下载对应的模板到本地并进行起名
    // console.error(templateName, projectName)
    const { downloadUrl } = template[templateName]
    download(downloadUrl, projectName, { clone: true }, (err) => {
      console.error(111)
      if (!err) {
        spinner.fail('下载失败')
        return
      }
      spinner.succeed('下载成功')
      // 把项目当中的package.json 文件进行读取
      // 使用向导的方式采集用户输入的值
      // 使用模板引擎吧用户的数据解析到package.json  文件
      // 解析完毕，把解析之后的结果重新写入package.json 文件中
      inquirer.prompt([{
        type: 'input',
        name: 'name',
        message: '请输入项目名称'
      },
      {
        type: 'input',
        name: 'description',
        message: '请输入项目描述'
      },
      {
        type: 'input',
        name: 'author',
        message: '请输入作者名称'
      }
      ]).then((answers) => {
        const pathName = `${projectName}/package.json`;
        const packageContent = fs.readFileSync(pathName, 'utf8')
        const packageResult = handlebars.compile(packageContent)(answers)
        fs.writeFileSync(pathName, packageResult)
        console.log(chalk.blueBright("初始化成功"));
      })
    })


    // var mode = options.setup_mode || 'normal';
    // env = env || 'all';
    // console.log('setup for %s env(s) with %s mode', env, mode)
  })
program
  .command('list')
  .description('查看所有可用的模板')
  .action(() => {
    for (const key in template) {
      console.log(`
        ${key}  ${template[key].description}
         `);
      console.log(`
        ${key}  ${template[key].url}
        `);
    }
  })

// program
//   .command('exec <cmd>')
//   .alias('ex')
//   .description('execute the given remote cmd')
//   .option('-e, --exec_mode <mode>', 'Which exec mode to use')
//   .action(function(cmd, options) {
//     console.log('exec "%s" using %s mode', cmd, options.exec_mode);
//   }).on('--help', function () {
//       console.log("Examples:");
//       console.log("");
//       console.log("$ deploy exec sequential");
//       console.log(' $ deploy exec async ');
//   })
// program
//   .command("*")
//   .action(function (env) {
//     console.log("deploying '%s'",env);
//   })
program.parse(process.argv)