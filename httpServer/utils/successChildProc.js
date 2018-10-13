const { exec } = require('child_process');

function promiseFromChild(child) {
  return new Promise(function (resolve, reject) {
    child.addListener("error", reject);
    child.addListener("exit", resolve);
  });
}

// cmd = global.appRoot + "/../hwInterface/success 2";
cmd = "../hwInterface/success 2";
var child = exec(cmd);

promiseFromChild(child).then(function (result) {
  console.log('promise complete: ' + result);
}, function (err) {
  console.log('promise rejected: ' + err);
});

child.stdout.on('data', function (data) {
  console.log('stdout: ' + data);
});
child.stderr.on('data', function (data) {
  console.log('stderr: ' + data);
});
child.on('close', function (code) {
  console.log('closing code: ' + code);
});
