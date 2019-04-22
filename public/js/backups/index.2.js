
// 牌组
var cards = [['蜜蜂矿池赞助']];
var people = [[],[],[]];
var landlord = people[2];
var endCard = [];

function initCards(){
    var types = ['diamonds','clubs','hearts','spades'];
    for(var m= 1; m<14;m++){
        var items = [];
        for(var n=0;n<4;n++){
            var item = {'val':m,'type':types[n],'alive':true};
            items.push(item);
        };
        cards.push(items);
    };
    cards.push([{type:'queen',val:14,'alive':true}]);
    cards.push([{type:'king',val:15,'alive':true}]);
}
initCards();
//选底牌
for(;endCard.length < 3;){
    var result = random();
    var item = {};
    if((result.index == 14 || result.index == 15) && noRepeat(result.index)){
        cards.splice(result.index,1,[]);
        item = result.index == 15?{'val':15,'type':'king'}:{'val':14,'type':'queen'};
        endCard.push(item);
    }else if(noRepeat(result.index,result.color)){
        cards[result.index] = cards[result.index].filter(
            item=> item.type == result.color?false:true
        );
        item.val = result.index,
        item.type = result.color;
        endCard.push(item);
    }
    function noRepeat(index,type){
        if(!type){
            for(var key of endCard){
                if(key.val == index ){return false};
            }  
        }
        for(var key of endCard){
            if(key.val == index && key.type == type){return false};
        }
        return true;
    }
}


// 随机花色
function random(){
    var index = parseInt(Math.random()*16);
    while(index == 0){
        index = parseInt(Math.random()*16);
    }
    return {
        index : index,
        color : ['diamonds','clubs','hearts','spades'][parseInt(Math.random()*4)],
        // kingOrQueen : ['king','queen'][parseInt(Math.random()*2)],
    }
}

// 分牌
function distribute(cards){
    for(;people[2].length <17;){
        for(var j=0;j<3;){
            var result = random();
            var item = {};
            if( (result.index == 14 || result.index == 15) && cards[result.index].length != 0){
                cards.splice(result.index,1,[]);
                // var str = JSON.stringify(cards);
                // if(result.kingOrQueen == 'king'){
                //     console.log(JSON.parse(str));
                // }
                item = result.index == 15?{'type':'king','val':15}:{'type':'queen','val':14};
                people[j].push(item);
                j++;
            }else if(cards[result.index].length!=0 && judgeAlive(result.index,result.color)){
                cards[result.index] = cards[result.index].filter(
                    item=> item.type == result.color?false:true
                );
                item.val = result.index,
                item.type = result.color;
                people[j].push(item);
                j++;
            }
        }
    }
}
function judgeAlive(index,color){
    for(var key of cards[index]){
        if(key.type == color){
            return true;
        }
    }
    return false;
}

distribute(cards);


console.log('********************************************************')
console.log('底牌：')
console.log(endCard);
console.log('三家：');
console.log(people);
console.log('********************************************************')

function cardSort(target){
    [].sort.call(target,(a,b)=>b.val-a.val);
}

// 排序
cardSort(landlord);


Vue.component('Card',{
    template:'<li class="card mine_card" :data-val="card.val" :data-type= "card.type" @click="select">'+
                '<font>{{card.val | judge}}</font>'+
                '<img :class="card.type"></img>'+
            '</li>',
    props:['card'],
    data:()=>{
        return{
        }
    },
    filters:{
        judge(val){
            return val<14 && val>10?['J','Q','K'][val-11]:val > 13?['小','大'][val-14]:val;
        }
    },
    methods:{
        select:function(e){
            e.target.classList.toggle('checked');
            // console.log([].indexOf.call(e.target.classList,'checked'))
            // if([].indexOf.call(e.target.classList,this.card) == -1){

            // }
            // if([].indexOf.call(app.selected.list,this.card) == -1){
            //     app.selected.list.push(this.card);
            // }
        },
    }
    
})

var app = new Vue({
    el:'#app',
    data:{
        turn:0, // 0：我 ，1：下家，2：上家
        time_left:'30',
        selected:{start:'',end:'',list:[]},
        gameCards:{
            'curr':[],
            'mine':[],
            'last':17,
            'next':10,
        },
        region:{
            dom:null,
            start:{},
            end:{}
        },
        cardOffset:{
            list:[],
            vertical:{top:'',bottom:''},
            horizontal:{start:'',end:''}
        }
    },
    delimiters:['${','}'],
    methods:{
        confirm(){
            this.selected.list = [].map.call(document.getElementsByClassName('checked'),item=>item.dataset.val);
            this.rules();
        },
        pass(){

        },
        tips(){

        },
        rules(){
            if(app.selected.list.length == 0){
                throw '没有选牌';
            };
            switch(this.selected.list.length){
                case 1:{
                    console.log('laiba')
                    if(this.gameCards.curr[this.gameCards.curr.length-1] == 'Socket.id' && this.turn == 0){
                        this.play();
                    }
                    break;
                };
                case 4:{

                    break;
                };
                case 5:{

                    break;
                };
            }
            return true
        },
        play(){
            this.gameCards.curr = [].map.call(document.getElementsByClassName('checked'),
                item=>{return {val:item.dataset.val,type:item.dataset.val}}
            );
            // 代表这是谁的牌  me表示我  next表示下家  last表示上家
            this.gameCards.curr.push('Socket.id');
            console.log(777)
            var select = [];
            this.gameCards.mine.forEach(
                item=>{
                    console.log(item);
                    var list = this.gameCards.curr;
                    console.log(list);
                    for(var i = 0; i<list.length;i++){
                        if(item.val != list[i].val && item.type != list[i].type){
                            select.push(item); 
                        }
                    }
                }
            )
            console.log(select);
        },
        start(e){
            this.region.start={x : e.pageX,y:e.pageY};
            this.region.dom = document.createElement('div');
            document.getElementById('app').appendChild(this.region.dom);
            this.region.dom.setAttribute('class','region');
            this.cardOffset.horizontal={start:'',end:''};
        },
        // 选择中
        move(e){
            if(this.region.dom == null){
                return
            }
            this.region.dom.setAttribute('style',
                'top:'+Math.min(e.pageY,this.region.start.y)+'px;'+
                'left:'+Math.min(e.pageX,this.region.start.x)+'px;'+
                'width:'+Math.abs(e.pageX - this.region.start.x)+'px;'+
                'height:'+Math.abs(e.pageY - this.region.start.y)+'px;'+
                'background-color: rgba(0,0,0,.2);'+
                'position:absolute;'
            );
        },
        end(e){
            this.region.end={x : e.pageX,y:e.pageY};
            document.querySelectorAll('.region').forEach(item=>{item.remove()});
            if(this.region.end.x != this.region.start.x && this.region.end.y != this.region.start.y ){
                this.fetchSelected();
            }
            this.region.dom = null;
        },
        // 选定区域
        fetchSelected(){
            this.fetchVertical();
            if(
            (this.region.start.y > this.cardOffset.vertical.top 
                && this.region.start.y < this.cardOffset.vertical.bottom)
                ||
            (this.region.end.y > this.cardOffset.vertical.top 
                && this.region.end.y < this.cardOffset.vertical.bottom)){
                    this.filterCard();
            }
        },
        // 选择区域内的卡片
        filterCard(){
            var first = this.cardOffset.list[0].offsetLeft;
            var last = this.cardOffset.list[this.cardOffset.list.length-1].offsetLeft;
            if((this.region.start.x > last && this.region.end.x > last)
                || (this.region.start.x < first && this.region.end.x < first)
                ){
                if(this.region.start.x - last < 70 || this.region.end.x -last <70){
                    this.cardOffset.horizontal.start = this.cardOffset.list.length-1;
                    this.cardOffset.horizontal.end = this.cardOffset.list.length;
                    this.actCard();
                }
                    return false;
            }
            var points = [ this.region.start.x, this.region.end.x, first, last].sort((a,b)=>a-b);
            for(var i = 0; i < this.cardOffset.list.length;i++){
                if(this.cardOffset.list[i].offsetLeft >= points[1] - 20 
                    && this.cardOffset.horizontal.start === ''){
                    this.cardOffset.horizontal.start = i;
                };
                if(points[2] >= this.cardOffset.list[this.cardOffset.list.length-1-i].offsetLeft 
                    && this.cardOffset.horizontal.end === ''){
                    this.cardOffset.horizontal.end = this.cardOffset.list.length-i;
                }
            };
            this.actCard();
        },
        // 获取
        fetchVertical(){
            this.cardOffset.list = document.getElementsByClassName('mine_card');
            this.cardOffset.vertical.top = document.getElementsByClassName('mine_card')[0].offsetTop;
            this.cardOffset.vertical.bottom = this.cardOffset.vertical.top + 115;
        },
        actCard(){
            [].slice.call(
                document.getElementsByClassName('mine_card'),
                this.cardOffset.horizontal.start,
                this.cardOffset.horizontal.end
                ).forEach(item=>item.click());
            this.selected.start = this.cardOffset.horizontal.start;
            this.selected.end = this.cardOffset.horizontal.end;
        },

    },
    mounted:function(){
        this.gameCards.mine = JSON.parse(JSON.stringify(landlord));
        console.log(this.gameCards.mine);
    },
});