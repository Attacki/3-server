// 牌组
var cards = [{'king':true,'queen':true}];
for(var i= 1; i<14;i++){
    var item = {'val':i,'diamonds':true,'clubs':true,'hearts':true,'spades':true};
    cards.push(item);
};
var people = [[],[],[]];
var farmer1 = people[0];
var farmer2 = people[1];
var landlord = people[2];
var endCard = [];

//选底牌
for(;endCard.length < 3;){
    var result = random();
    var item = {};
    if( result.index == 0 && cards[0][result.kingOrQueen]){
        cards[0][result.kingOrQueen] = false;
        if(result.kingOrQueen == 'king'){
            item = {'king':true,'val':15}
        }else{
            item = {'queen':true,'val':14}
        };
        endCard.push(item);
    }else if(cards[result.index][result.color]){
        cards[result.index][result.color] = false;
        item.val = cards[result.index].val,
        item[result.color] = true;
        endCard.push(item);
    }
}

console.log(endCard);

// 随机花色
function random(){
    return {
        index : parseInt(Math.random()*14),
        color : ['diamonds','clubs','hearts','spades'][parseInt(Math.random()*4)],
        kingOrQueen : ['king','queen'][parseInt(Math.random()*2)],
    }
}

// 分牌
function distribute(cards){
    for(;people[2].length <17;){
        for(var j=0;j!=3;){
            var result = random();
            var item = {};
            if( result.index == 0 && cards[0][result.kingOrQueen]){
                cards[0][result.kingOrQueen] = false;
                if(result.kingOrQueen == 'king'){
                    item = {'king':true,'val':15}
                }else{
                    item = {'queen':true,'val':14}
                };
                people[j].push(item);
                j++;
            }else if(cards[result.index][result.color]){
                cards[result.index][result.color] = false;
                item.val = cards[result.index].val,
                item[result.color] = true;
                people[j].push(item);
                j++;
            }
        }
    }
}

distribute(cards);

function cardSort(target){
    [].sort.call(target,(a,b)=>b.val-a.val);
}

// 排序
cardSort(landlord);


Vue.component('Card',{
    template:'<li class="card mine_card" :data-val="card.val" :data-type= "card" @click="select">'+
                '<font>{{card.val | judge}}</font>'+
                '<img class="diamonds" v-if="card.diamonds"></img>'+
                '<img class="clubs" v-if="card.clubs"></img>'+
                '<img class="hearts" v-if="card.hearts"></img>'+
                '<img class="spades" v-if="card.spades"></img>'+
            '</li>',
    props:['card'],
    data:()=>{
        return{
        }
    },
    filters:{
        judge(val){
            return val<14 && val>10?['J','Q','K'][val-11]:val > 13?['大','小'][val-14]:val;
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
        turn:'1',
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
            this.curr = [].map.call(document.getElementsByClassName('checked'),
                item=>{
                    return {val:item.dataset.val,type:item.children[1].classList[0]}
                }
            );
            console.log(this.curr)
            // this.selected.list = [].map.call(document.getElementsByClassName('checked'),item=>item.dataset.val);
            // this.rules();
        },
        pass(){

        },
        tips(){

        },
        rules(){
            if(app.selected.list.length == 0){
                throw '没有选牌';
            };
            console.log(this.selected.list);
            switch(this.selected.list.length){
                case 1:{
                    console.log('laiba')
                    if(this.curr.length == 0){
                        this.curr = 1
                        this.play();
                    }
                    break;
                };
                case 2:{

                    break;
                };
                case 1:{

                    break;
                };
            }
            return true
        },
        play(){
            // this.gameCards.mine.splice(this.selected.start,this.selected.end);
            this.gameCards.mine = this.gameCards.mine.map(
                item=>{
                    var list = this.selected.list;
                    console.log(item);
                    // for(var i = 0; i<list.length;i++){
                    //     if(item.val == list[i].val && item.){

                    //     }
                    // }
                }
            )
            console.log(this.gameCards.mine);
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