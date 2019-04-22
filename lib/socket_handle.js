const act_file = require('./read_write');
const filePath = `${__dirname}/db/all.data.json`;

module.exports = class socketHandler{
    /**
     * 为了保持对上一次会话的历史状态
     * @param {type} userId 唯一的用户ID
     * @param {type} socketId 用当前会话ID替换上一次会话ID
     */
    static async upateId(userId,socketId){
        let data = await act_file.read(filePath).catch((err)=>{
            console.log(err);
        });
        data[userId] = socketId;
        act_file.write(filePath,data);
    }

    static async getIdList(callback){
        let data = await act_file.read(filePath).catch((err)=>{
            console.log(err);
        });
        callback(data);
    }
}
