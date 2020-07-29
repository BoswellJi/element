const path = require('path');
const templates = path.resolve(process.cwd(), './examples/pages/template');

const chokidar = require('chokidar');
// 监听模板的改变
// files,dirs目录被递归监听
let watcher = chokidar.watch([templates]);
let count = 0;

watcher.on('ready', function() {
  watcher
    .on('change', function() {
      console.log(count++);
      exec('npm run i18n');
    });
});

function exec(cmd) {
  return require('child_process').execSync(cmd).toString().trim();
}

process.execSync('npm run dev:entry')