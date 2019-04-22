var http = require('http');
var fs = require('fs');
var path = require('path');
var MimeLookup = require('mime-lookup');
var mime = new MimeLookup(require('mime-db'));
var cache = {};

function serverFile(req,res){
    var filepath = '';
    if(req.url == '/'){
        filepath = 'public/index.html';
    }else{
        filepath = 'public'+req.url;
    }
    var absPath = './' + filepath;
    readOrCache(res,cache,absPath);
}

function readOrCache(res,cache,absPath){
    // if(cache[absPath]){
    //     returnData(res,absPath,cache[absPath]);
    // }else{
        fs.exists(absPath,function(exist){
            if(exist){
                fs.readFile(absPath,function(err,fileContents){
                    if(err){
                        send404(res);
                    }else{
                        cache[absPath] = fileContents;
                        returnData(res,absPath,fileContents);
                    }
                })
            }else{
                send404(res);
            }
        })
    // }
}

function send404(res){
    res.writeHead(404,{'Content-Type':'text/plain;charset=utf-8'});
    res.write('文件不存在思密达');
    res.end();
}

function returnData(res,filePath,fileContents){
    res.writeHead(
        200, 
        {"content-type": mime.lookup(path.basename(filePath))}
      );
    res.end(fileContents);
}

var app = http.createServer();
app.on('request',function(req,res){
    serverFile(req,res)
})
app.listen(8000);

var socketServer = require('./lib/play_server');
var listener = new socketServer(app);