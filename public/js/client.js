class socket_Control{
    constructor(socket,player){
        this.socket = socket;
        this.player = player;
        this.init();
    }

    // 解决ID问题
    init(){
        this.socket.on('setUserId',function(userId){
            sessionStorage.setItem('userId',userId);
        });
        this.socket.on('transCard',(cardsMsg)=>{
            console.log('********************');
            console.log(sessionStorage.getItem('userId'))
            console.log(cardsMsg);
            console.log('********************');
            this.player.gameCenter.mine = {
                turn:cardsMsg.turn,
                cards:cardsMsg.cards
            };
            this.player.gameCenter.endCards = cardsMsg.endCards;
            this.player.gameCenter.landNum = cardsMsg.landNum;
            this.player.timer._turn = cardsMsg.now_turn;
            this.player.gameCenter.curr ={
                cards:[],
                turn:cardsMsg.curr_turn,
            };
            this.player.gameCenter.last={
                turn:cardsMsg.last_turn,
                card_left:cardsMsg.last_turn == cardsMsg.landNum?20:17
            };
            this.player.gameCenter.next={
                turn:cardsMsg.next_turn,
                card_left:cardsMsg.next_turn == cardsMsg.landNum?20:17
            };
        });
        this.timerUpdate();
        this.pass();
        this.receiveBroadcast();
        this.fetchHistory();
        this.tips();
        this.winOrFail();
        if(sessionStorage.getItem('userId') == null){
            this.socket.emit('register');
        }else{
            this.socket.emit('update',sessionStorage.getItem('userId'));
        };
        this.socket.emit('getHistory',null);
    }

    // 出牌
    playCard(curr,history,cards_left){
        console.log(history);
        var param = {
            'userId':sessionStorage.getItem('userId'),
            'turn':curr.turn,
            'cards_played':curr.cards,
            'cards_left':cards_left,
            'history':history
        };
        this.socket.emit('playCard',param);
    }

    // 接受他人出牌的广播
    receiveBroadcast(){
        this.socket.on('getOtherLeft',(other)=>{
            this.player.gameCenter.last.card_left = other.last_left;
            this.player.gameCenter.next.card_left = other.next_left;
        })
        this.socket.on('currChange',(currMsg)=>{
            console.log(currMsg);
            this.player.history = currMsg.history;
            this.player.timer._turn = currMsg.turn;
            this.player.gameCenter.curr ={
                cards:currMsg.curr_cards,
                turn:currMsg.curr_turn,
            };
            // 获取自己上家和下家的牌数
            this.socket.emit('getMyTurn',sessionStorage.getItem('userId'));
        })
    }

    // 由服务器统一剩余时间
    timerUpdate(){
        this.socket.on('timerUpdate',(second)=>{
            // console.log(second);
            this.player.timer._left = second;
        })
    }

    // 胜负已分
    winOrFail(){
        this.socket.on('winOrFail',(code)=>{
            if(code){
                // win
                this.player.win = true;
                console.log('赢了');
            }else{
                // fail
                this.player.win = false;
                console.log('输了');
            }
            this.player.history.pass = [false,false,false];
            this.player.timer._turn = 3;
            this.player.history.cards[this.player.gameCenter.mine.turn]= [];
            $('.win_fail').fadeIn(800);
        })
    }

    // 获取历史卡牌
    fetchHistory(){
        this.socket.on('sendHistory',(history)=>{
            this.player.history = history;
        })
    }

    // 时间到替用户 pass
    pass(){
        this.socket.on('passTimeout',()=>{
            this.player.pass();
        })
    }

    restart(){
        this.socket.emit('restart',sessionStorage.getItem('userId'));
    }

    // 服务器提示语
    tips(){
        this.socket.on('receiveTips',(msg)=>{
            $('#tips').fadeIn(500).text(msg);
        })
    }

    test (){
        // this.socket.emit('update',this.socket.id)
        // this.socket.on('test',(argu)=>{
        //     console.log(argu);
        // })
        console.log(12)
    }
}

const socket = io.connect();
const client = new socket_Control(socket,player);