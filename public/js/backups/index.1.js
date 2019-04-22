Vue.component('Card',{
    template:'<li class="card mine_card"  :key="\'mine\'+card.val + card.type" :data-val="card.val" :data-type= "card.type" @click="select">'+
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
        },
    }
})

var player = new Vue({
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
    filters:{
        judge(val){
            return val<14 && val>10?['J','Q','K'][val-11]:val > 13?['小','大'][val-14]:val;
        }
    },
    methods:{
        confirm(){
            this.selected.list = [].map.call(document.getElementsByClassName('checked'),item=>item.dataset.val);
            this.rules();
        },
        pass(){

        },
        tips(){

        },
        analysis(cards){
            var list = [
                [1,1,1,13],
                [2,2,2,12,12],
                [3,3,3,4,4,4],
                [3,3,3,4,4,4,5,6],
        
                [3,3,3,3],
                [3,3,3,3,4,4],
                [3,3,3,3,4,5],
                [14,15]
            ];
            let result = {
                after:{},       //解析后的对象
                max:0,          //同一张牌最多出现次数
                times:0,        //最大次数有几组
                before_length:0,        //解析对象的长度
                after_length:0        //解析对象的长度
            }
            for(var key of list[3]){
                result.after[key] = result.after[key]?++result.after[key]:1;
                result.before_length++;
            }
            for(var key in result.after){
                result.max = result.max > result.after[key]?result.max:result.after[key]
                result.after_length++;
            }
            for(var key in result.after){
                if(result.after[key] == result.max){
                    result.times++;
                }
            }
            // return result;
            console.log(result);
        },
        rules(){
            /**
             * 1单张
             * 2对子 （王炸）
             * 3三张 
             * 4炸弹 （三带一）
             * 5顺子 （三带二）
             * 6顺子 （四带二） （连对） （飞机不带）
             * 7顺子 （）
             * 8
             */























            // 顺子
            var stri = /^(34567|345678|3456789|345678910|34567891011|3456789101112|345678910111213|1345678910111213|45678|456789|45678910|4567891011|456789101112|45678910111213|145678910111213|56789|5678910|567891011|56789101112|5678910111213|15678910111213|678910|67891011|6789101112|678910111213|1678910111213|7891011|789101112|78910111213|178910111213|89101112|8910111213|18910111213|910111213|1910111213|110111213)$/;
            // 多对
            var stri_double = /^(334455|33445566|3344556677|334455667788|33445566778899|334455667788991010|3344556677889910101111|33445566778899101011111212|334455667788991010111112121313|11334455667788991010111112121313|4455667788|445566778899|4455667788991010|44556677889910101111|445566778899101011111212|4455667788991010111112121313|114455667788991010111112121313|5566778899|55667788991010|556677889910101111|5566778899101011111212|55667788991010111112121313|1155667788991010111112121313|667788991010|6677889910101111|66778899101011111212|667788991010111112121313|11667788991010111112121313|77889910101111|778899101011111212|7788991010111112121313|117788991010111112121313|8899101011111212|88991010111112121313|1188991010111112121313|991010111112121313|11991010111112121313|111010111112121313)$/;
            // 单张
            var single = /^(1|2|3|4|5|6|7|8|9|10|11|12|13|14|15)$/
            // 对子
            var double = /^(11|22|33|44|55|66|77|88|99|1010|1111|1212|1313)$/
            // 炸弹
            var boom = /^(1111|2222|3333|4444|5555|6666|7777|8888|9999|10101010|11111111|12121212|13131313|1415)$/
            // 四带二
            var follow_boom = /^((\d|1[0-3]){4})(\d|1[0-5]){2}$/
            // 三带一
            var one_bind_three = /^(111(\d|1[0-5]){1}|)$/; 


            if(this.selected.list.length == 0){
                throw '没有选牌';
            };
            anl_result = this.analysis(this.selected.list);
            if(this.selected.list == 1){

            }else if (result){

            }
            return true
        },
        straight(){
        },
        play(){
            // this.gameCards.curr = 
            // 代表这是谁的牌  me表示我  next表示下家  last表示上家
            // this.gameCards.curr.push('Socket.id');
            var sel_list = [].map.call(document.getElementsByClassName('checked'),
                item=>{return {val:item.dataset.val,type:item.dataset.val}}
            );
            var other = [];
            this.gameCards.mine.forEach(
                item=>{
                    for(var i = 0; i<sel_list.length;i++){
                        if(item.val != sel_list[i].val && item.type != sel_list[i].type){
                            other.push(item); 
                        }
                    }
                }
            )
            this.gameCards.mine = other;
            // console.log(other);
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
        var that = this;
        
        // console.log(that.gameCards.mine);
    },
});