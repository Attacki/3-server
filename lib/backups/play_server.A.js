const socketio = require('socket.io');
const base64id = require('base64id');

module.exports = class Server{


    constructor(server){
        this._manager = {
            cards:new initGame(),
            turns:[]
        }; //管理员记录牌的情况及不同人的牌
        this._user_list = {}; //用户列表
        this.cardId = 0;
        var io = socketio.listen(server);
        io.sockets.on('connection',(socket)=>{
            this.joinroom(socket,'luck');                //加入房间
            this.handleId(io,socket);                    //初始化id
            
            // handleCardMsgBroadcasting(socket);
            // handleRoomJoin(socket);
            // socket.on('update',function(socket){
            //     socket.emit('update',io.sockets.manger.rooms)
            // });
            // handleClientDisconnection(socket);
        })
    }

    joinroom(socket,room){
        socket.join(room);
    }

    handleId(io,socket){
        socket.on('update',(userId)=>{
            this._user_list[userId] = socket.id
            this.countEqual3(io);
        });
        socket.on('register',()=>{
            var userId = base64id.generateId();
            io.to(socket.id).emit('setUserId',userId);
            this._user_list[userId] = socket.id
            this.countEqual3(io);
        });
    }

    countEqual3(io){
        io.of('/').clients((error,clients)=>{
            if (error) throw error;
            if(clients.length === 3){
                this.sendCard(io,clients);
            }
        })
    }

    sendCard(io,clients){
        // console.log(this._user_list);
        // console.log(clients);
        var land = Math.random()*3;
        for(var key in this._user_list){
            for(var i = 0; i<3;i++){
                if(this._user_list[key] == clients[i]){
                    this._manager.turns.push(key);
                    if(!this._manager[key]){
                        this._manager[key] = this._manager.cards.PLAYERS[this.cardId++];
                        cardSort(this._manager[key]);
                    }
                    io.to(this._user_list[key]).emit('transCard',this._manager[key]);
                    break;
                }
            }
        }
    }

    handleCardMsgBroadcasting(scoket){
    
    }
    
    handleRoomJoin(socket){
    
    }
    
    handleClientDisconnection(socket){
    
    }
}





// 初始化游戏
class initGame{
    // 定义牌组、玩家、底牌

    constructor(){
        this.CARDS = [['蜜蜂矿池赞助']];
        this.PLAYERS = [[],[],[]];
        this.ENDCARD = [];
        this.initCards();
        this.chooseEndcard();
        this.distribute();
    }
    
    // 制作牌组
    initCards(){
        var types = ['diamonds','clubs','hearts','spades'];
        for(var m= 1; m<14;m++){
            var items = [];
            for(var n=0;n<4;n++){
                var item = {'val':m,'type':types[n],'alive':true};
                items.push(item);
            };
            this.CARDS.push(items);
        };
        this.CARDS.push([{type:'queen',val:14,'alive':true}]);
        this.CARDS.push([{type:'king',val:15,'alive':true}]);
    }

    //选底牌
    chooseEndcard(){
        for(;this.ENDCARD.length < 3;){
            var result = this.random();
            var item = {};
            if((result.index == 14 || result.index == 15) && this.noRepeat(result.index)){
                this.CARDS.splice(result.index,1,[]);
                item = result.index == 15?{'val':15,'type':'king'}:{'val':14,'type':'queen'};
                this.ENDCARD.push(item);
            }else if(this.noRepeat(result.index,result.color)){
                this.CARDS[result.index] = this.CARDS[result.index].filter(
                    item=> item.type == result.color?false:true
                );
                item.val = result.index,
                item.type = result.color;
                this.ENDCARD.push(item);
            }
        }
    }

    // 底牌去重
    noRepeat(index,type){
        if(!type){
            for(var key of this.ENDCARD){
                if(key.val == index ){return false};
            }  
        }
        for(var key of this.ENDCARD){
            if(key.val == index && key.type == type){return false};
        }
        return true;
    }

    // 随机花色
    random(){
        var index = parseInt(Math.random()*16);
        while(index == 0){
            index = parseInt(Math.random()*16);
        }
        return {
            index : index,
            color : ['diamonds','clubs','hearts','spades'][parseInt(Math.random()*4)],
        }
    }

    // 发牌
    distribute(){
        for(;this.PLAYERS[2].length <17;){
            for(var j=0;j<3;){
                var result = this.random();
                var item = {};
                if( (result.index == 14 || result.index == 15) && this.CARDS[result.index].length != 0){
                    this.CARDS.splice(result.index,1,[]);
                    item = result.index == 15?{'type':'king','val':15}:{'type':'queen','val':14};
                    this.PLAYERS[j].push(item);
                    j++;
                }else if(this.CARDS[result.index].length!=0 && this.judgeAlive(result.index,result.color)){
                    this.CARDS[result.index] = this.CARDS[result.index].filter(
                        item=> item.type == result.color?false:true
                    );
                    item.val = result.index,
                    item.type = result.color;
                    this.PLAYERS[j].push(item);
                    j++;
                }
            }
        }
    }

    // 判断是否还有这张牌
    judgeAlive(index,color){
        for(var key of this.CARDS[index]){
            if(key.type == color){
                return true;
            }
        }
        return false;
    }
}

// 排序
function cardSort(target){
    [].sort.call(target,(a,b)=>b.val-a.val);
}