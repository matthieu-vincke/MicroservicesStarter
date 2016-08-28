const fs = require('fs')
/*
function readPackage (callback) {
  //as of now we do not have default values in Node.js
  callback = callback || function () {}
  return new Promise((resolve, reject) => {
    fs.readFile('./package.json','utf8', (err, data) => {
      if (err) {
        reject(err)
        return callback(err)
      }
      resolve(data)
      return callback(null, data)
    })
  })
}

readPackage(function(err,res){
  
  console.log(err,res);
})
*/


function readJSON(filename){
  return new Promise(function (fulfill, reject){
    readFile(filename, 'utf8').done(function (res){
      try {
        fulfill(JSON.parse(res));
      } catch (ex) {
        reject(ex);
      }
    }, reject);
  });
}


readJSON('./package.json')