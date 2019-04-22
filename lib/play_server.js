const socketio = require('socket.io');
const base64id = require('base64id');

module.exports = class Server{


    constructor(server){
        //管理员记录牌的情况及不同人的牌
        this.init();
        var io = socketio.listen(server);
        io.sockets.on('connection',(socket)=>{
            this.joinroom(socket,'luck');               //加入房间
            this.handleId(io,socket);                   //初始化id
            
            this.pullOtherLeft(socket);                 //监听获取上下家的牌
            this.playCard(io,socket);                   //监听有人出牌
            this.sendHistory(socket);
            this.restart(socket);
        })
    }

    init(){
        this._manager = {
            cards:new initGame(),
            landNum:'',
            landUserId:'',
            timer:{
                _left:20,
                _tag:'',
                _turn:''
            },
            curr_cards:{
                userId:'',
                turn:'',
                cards_played:[],
                cards_left:[]
            },
            history:{
                pass:[false,false,false],
                cards:[[],[],[]]
            },
            ready:{}
        };
        this.cardId = 0;
        this._user_list = {};
    }

    // 不管任何时候创建链接的第一步就是进入房间
    joinroom(socket,room){
        socket.join(room);
    }

    // 房间管理员等待人数够三人就发牌
    countEqual3(io){
        io.of('/').clients((error,clients)=>{
            if (error) throw error;
            if(clients.length === 3){
                this.licensing(io,clients);
            }
        });
    }

    // 管理员发牌给个人
    licensing(io,clients){
        //确定地主序号 一旦确定地主由管理员记录
        if(this._manager.landNum === ''){
            this._manager.landNum = parseInt(Math.random()*3);
            this._manager.cards.PLAYERS[this._manager.landNum] = 
                this._manager.cards.PLAYERS[this._manager.landNum].concat(this._manager.cards.ENDCARD);
            this._manager.curr_cards.turn = this._manager.landNum;
            this._manager.timer._turn = this._manager.landNum;
            console.log('游戏初始化成功！确定地主，确定当前牌是谁，确定出牌序号。\n 只执行一次');
        }
        //告知玩家序号、牌、谁是地主  (就算刷新仍然告诉他当前牌局情况)
        for(var key in this._user_list){
            for(var i = 0; i<3;i++){
                if(this._user_list[key] == clients[i]){
                    if(!this._manager[key]){
                        if(this.cardId == this._manager.landNum){
                            this._manager.landUserId = key;
                            this._manager.curr_cards.userId = key;
                        }
                        var index = [this.cardId,this.cardId];
                        // console.log(this.cardId);
                        this._manager[key] = {
                            now_turn:this._manager.timer._turn,
                            turn:this.cardId,   //序号
                            cards:this._manager.cards.PLAYERS[this.cardId], //序号所在卡牌
                            landNum:this._manager.landNum,    //地主序号
                            endCards:this._manager.cards.ENDCARD,
                            last_turn:this.cardId==0?2:--index[0],
                            next_turn:this.cardId==2?0:++index[1],
                            curr_turn:this._manager.curr_cards.turn
                        };
                        console.log(this._manager.curr_cards.turn);
                        cardSort(this._manager[key]);
                        this.cardId++;
                    }
                    this._manager[key].now_turn = this._manager.timer._turn;
                    this._manager[key].curr_turn = this._manager.curr_cards.turn;
                    io.to(this._user_list[key]).emit('transCard',this._manager[key]);
                    break;
                }
            }
        }
        if(this._manager.timer._tag == ''){
            this.setInter(io,clients); 
        }else{
            clearTimeout(this._manager.timer._tag);
            this.setInter(io,clients); 
        }

    }

    // 服务端来控制时间
    setInter(io,clients){
        if(this._manager.timer._turn == this._manager.curr_cards.turn){
            console.log('轮流：'+this._manager.timer._turn);
            console.log('当前牌：'+this._manager.curr_cards.turn);
            clearTimeout(this._manager.timer._tag);
            for(var i = 0; i<3;i++){
                io.to(clients[i]).emit('timerUpdate','大');
            }
            return 
        }
        var doNotUseInter = ()=>{
            this._manager.timer._tag = setTimeout(()=>{
                if(this._manager.timer._left == -1){
                    clearTimeout(this._manager.timer._tag);
                    this.next(io);
                }else{
                    doNotUseInter();
                }
                for(var i = 0; i<3;i++){
                    io.to(clients[i]).emit('timerUpdate',this._manager.timer._left);
                }
                this._manager.timer._left -= 1;
            },1000)
        }
        doNotUseInter();
    }

    // 下一个人 出牌
    next(io){
        // console.log('下一位')
        // 轮流下一个人
        
        this._manager.timer._turn = this._manager.timer._turn == 2?0:++this._manager.timer._turn;
        this._manager.timer._left = 20;
        // 清空被轮到的人的牌组
        this._manager.history.cards[this._manager.timer._turn] = [];
        this.broadcastCardTo(io,this._manager.curr_cards,this._manager.timer._turn);
    }
    
    // 广播 出的牌
    broadcastCardTo(io,cardMsg,next){
        var res_index = next;         //轮流到下一个人
        var param = {
            turn: res_index,    //当前该谁出牌的序号
            curr_cards:cardMsg.cards_played,
            curr_turn:cardMsg.turn,
            history:this._manager.history
        };
        io.of('/').clients((error,clients)=>{
            if (error) throw error;
            for(var i = 0; i<3;i++){
                    io.to(clients[i]).emit('currChange',param);
            }
            if(this._manager.curr_cards.cards_left.length == 0){
                this.winOrFail(io);
                return 
            };
            this.setInter(io,clients);
        });
    }

    // 宣布胜负
    winOrFail(io){
        var winner = this._manager.curr_cards;
        io.of('/').clients((error,clients)=>{
            if (error) throw error;
            if(winner.turn == this._manager.landNum){
                // 地主赢了
                for(var i = 0; i<3;i++){
                    if(this._user_list[winner.userId] == clients[i]){
                        io.to(clients[i]).emit('winOrFail',true);
                    }else{
                        io.to(clients[i]).emit('winOrFail',false);
                    }
                }
            }else{
                // 农民赢了
                for(var i = 0; i<3;i++){
                    if(this._user_list[this._manager.landUserId] != clients[i]){
                        io.to(clients[i]).emit('winOrFail',true);
                    }else{
                        io.to(clients[i]).emit('winOrFail',false);
                    }
                }
            }
        });
    }
    
    // 展示所剩卡牌
    // showLeftCards(){

    // }

    // 解决页面刷新ID失效问题
    handleId(io,socket){
        socket.on('update',(userId)=>{
            this._user_list[userId] = socket.id
            this.countEqual3(io);
        });
        socket.on('register',()=>{
            var userId = base64id.generateId();
            io.to(socket.id).emit('setUserId',userId);
            this._user_list[userId] = socket.id;
            this.countEqual3(io);
        });
    }

    // 有人 出牌
    playCard(io,socket){
        socket.on('playCard',(cardMsg)=>{
            this._manager.history = JSON.parse(JSON.stringify(cardMsg.history));
            
            //该用户要不起,当前牌局的牌就还是之前出的牌
            if(cardMsg.cards_played.length == 0){
                clearTimeout(this._manager.timer._tag);
                this.next(io);
                return 
            }
            this._manager.curr_cards = JSON.parse(JSON.stringify(cardMsg));
            // console.log(cardMsg);
            this._manager[cardMsg.userId].cards = cardMsg.cards_left; //更新管理所知道的牌
            this._manager.cards.PLAYERS[this._manager[cardMsg.userId].turn] =  cardMsg.cards_left;
            clearTimeout(this._manager.timer._tag);
            this.next(io);
        })
    }

    // 再来一局
    restart(socket){
        socket.on('restart',(userId)=>{
            this._manager.ready[userId] = true;
            for(var key in this._manager.ready){
                if(this._manager.ready[key]){
                    continue
                }else{
                    return
                }
            }
            this.init();
            this.licensing();
        })
    }

    // 获取其他人的内容
    pullOtherLeft(socket){
        socket.on('getMyTurn',(userId)=>{
            var turn = this._manager[userId].turn;
            var turns = [turn,turn];
            var last_index = turn == 0? 2 :--turns[0];    //相对于他而言的上家
            var next_index = turn == 2? 0 :++turns[1];    //相对于他而言的下家
            socket.emit('getOtherLeft',{
                last_left:this._manager.cards.PLAYERS[last_index].length,
                next_left:this._manager.cards.PLAYERS[next_index].length
            })
        })
    }

    // 发送牌局历史给刷新的页面
    sendHistory(socket){
        socket.on('getHistory',()=>{
            socket.emit('sendHistory',this._manager.history);
        })
    }

}





// 初始化游戏
class initGame{
    // 定义牌组、玩家、底牌

    constructor(){
        this.CARDS = [['蜜蜂矿池研发'],['蜜蜂矿池研发'],['蜜蜂矿池研发']];
        this.PLAYERS = [[],[],[]];
        this.ENDCARD = [];
        this.initCards();
        this.chooseEndcard();
        this.distribute();
    }
    
    // 制作牌组
    initCards(){
        var types = ['diamonds','clubs','hearts','spades'];
        for(var m= 3; m<16;m++){
            var items = [];
            for(var n=0;n<4;n++){
                var item = {'val':m,'type':types[n]};
                items.push(item);
            };
            this.CARDS.push(items);
        };
        this.CARDS.push([{type:'queen',val:16}]);
        this.CARDS.push([{type:'king',val:17}]);
    }

    //选底牌
    chooseEndcard(){
        for(;this.ENDCARD.length < 3;){
            var result = this.random();
            var item = {};
            if((result.index == 16 || result.index == 17) && this.noRepeat(result.index)){
                this.CARDS.splice(result.index,1,[]);
                item = result.index == 17?{'val':17,'type':'king'}:{'val':16,'type':'queen'};
                this.ENDCARD.push(item);
            }else if( result.index <16 && this.noRepeat(result.index,result.color)){
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
        if(type === undefined){
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
        return {
            index : parseInt(Math.random()*15+3),
            color : ['diamonds','clubs','hearts','spades'][parseInt(Math.random()*4)],
        }
    }

    // 发牌
    distribute(){
        for(;this.PLAYERS[2].length <17;){
            for(var j=0;j<3;){
                var result = this.random();
                var item = {};
                if( (result.index == 16 || result.index == 17) && this.CARDS[result.index].length != 0){
                    this.CARDS.splice(result.index,1,[]);
                    item = result.index == 17?{'type':'king','val':17}:{'type':'queen','val':16};
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
        this.CARDS = null;
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
    console.log('下面是要排序的牌组');
    console.log(target);
    [].sort.call(target.cards,(a,b)=>b.val-a.val);
}