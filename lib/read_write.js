var fs = require('fs');

module.exports = {
    write:(filePath,data)=>{
        return new Promise((resolve,reject)=>{
            fs.writeFile(filePath,JSON.stringify(data),(err)=>{
                if(err){
                    reject(err)
                }
            })
        })
    },
    read:(filePath)=>{
        return new Promise((resolve,reject)=>{
            fs.readFile(filePath,'utf-8',(err,data)=>{
                if(!err){
                    resolve(JSON.parse(data));
                }else{
                    reject(err);
                }
            })
        })
    }
}