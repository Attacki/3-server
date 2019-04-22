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
            if(this.rules()){
                console.log('进来了？')
                this.play();
            };
        },
        pass(){

        },
        tips(){

        },
        analysis(cards){
            let result = {
                before:cards,
                after:{},               //解析后的对象
                s_max:0,                //同一张牌最多出现次数
                s_max_list:[],          //最大次数有几组
                after_length:0,         //解析对象的长度
                
            }
            for(var key of cards){
                result.after[key] = result.after[key]?++result.after[key]:1;
            }
            for(var key in result.after){
                result.s_max = result.s_max > result.after[key]?result.s_max:result.after[key]
                result.after_length++;
            }
            for(var key in result.after){
                if(result.after[key] == result.s_max){
                    result.s_max_list.push(key);
                }
            }
            result.s_max_list.sort((a,b)=>a-b);
            return result;
        },
        rules(){
            /**
             * 1,2,3,4,5,6,7,8,9,10,11,12,13,14（小王）,15（大王）
             * ❤：代表阶别，阶别高可以管辖阶别低的！
             * s_max：表示同一张牌出现最多次数
             * s_max_list.length：表示出现次数最多的那张牌有几组
             * after_length：总共有几张不同的牌
             * 王炸                        （❤❤❤❤❤）           done
             * s_max：1   |   s_max_list.length：2                |   after_length：2
             * 炸弹                        （❤❤❤）              done
             * s_max：4   |   s_max_list.length：1                |   after_length：1
             * 单张                        （❤）                 
             * s_max：1   |   s_max_list.length：1                |   after_length：1
             * 对子 或者 多对（连贯）       （❤）
             * s_max：2   |   s_max_list.length：cards.length/2   |   after_length：cards.length/2
             * 三张 或者 多三张（连贯）     （❤）
             * s_max：3   |   s_max_list.length：cards.length/3   |   after_length：cards.length/3
             * 三带一 或者 多三带一（连贯） （❤）
             * s_max：3   |   s_max_list.length：cards.length/4   |   after_length：2 * cards.length/4
             * 四带二 或者 多四带二（连贯） （❤）
             * s_max：4   |   s_max_list.length：cards.length/6   |   after_length：2 * cards.length/6  - 3 * cards.length/6
             * 顺子（最低五张且连贯）       （❤）
             * s_max：1   |   s_max_list.length：cards.length     |   after_length：cards.length
             */
            if(this.selected.list.length == 0){
                throw '没有选牌';
            };
            sel = this.analysis(this.selected.list);
            cur = this.analysis(this.gameCards.curr);
            if(sel.s_max == 1 && sel.after_length == 2 && sel.before.indexOf('14') !=-1 && sel.before.indexOf('15')!=-1){
                console.log('这是王炸');
                return true;
            }
            /**
             * 判断出牌时，要先判断上家出的牌是否可能是当前类型最大的牌：
             *      如果是的就没必要再进行类型判断了，如果不是，判断是不是该类型的，如果不是该类型，就跳过
             *      走到这一步，说明上家的牌就是该类型，并且不是最大。
             * 然后，再判断选中的牌是不是最大且是当前类型的牌，
             *      如果是的就没必要再进行类型判断了，如果不是，判断是不是该类型的，如果不是该类型，就返回false
             * 再然后，比较两者中最大的值，
             */
            // boom 判断炸弹及是否比上家更大
            if(sel.s_max == 4 && sel.s_max_list.length == 1 ){
                if(cur.s_max == 1 && cur.after_length == 2 && cur.before.indexOf('14') !=-1 && cur.before.indexOf('15')!=-1){
                    console.log('上家是王炸，炸不过呀！');
                    return false
                }else{
                    if(cur.s_max < 4 || (cur.s_max == 4 && cur.before.length > 4)){return true}
                    if(sel.s_max_list[0] == 2){  return true  } //炸弹
                    if(cur.s_max_list[0] == 2){  return false } //要不起
                    if(cur.s_max_list[0] == 1){  return false }
                    if(sel.s_max_list[0] == 1){  return true  }
                    if(sel.s_max_list[0] > cur.s_max_list[0]){return true}
                }
            }
            /**
             * single 判断单张还是顺子 
             * 顺子里面特别注意 大王小王 还有 A 2
             *  */ 
            if(sel.s_max == 1){
                if(sel.before.length == 1){
                    if(cur.s_max == 1 && sel.before.length == 1){
                        if(cur.s_max_list[0] == 2){return false}
                        if(sel.s_max_list[0] == 2){return true}
                        if(cur.s_max_list[0] == 1){return false}
                        if(sel.s_max_list[0] == 1){return true}
                        if(sel.s_max_list[0] > cur.s_max_list[0]){
                            return 
                        }
                    }
                }else if(sel.before.length >=5){
                    if(cur.s_max == 1 && sel.before.length == cur.before.length){

                    }
                }else{
                    return false //小于五张还想组顺子，你咋不去飞呢？
                }

            }

            return false
        },
        play(){
            // this.gameCards.curr = 
            // 代表这是谁的牌  me表示我  next表示下家  last表示上家
            // this.gameCards.curr.push('Socket.id');
            var sel_list = [].map.call(document.getElementsByClassName('checked'),
                item=>{return {val:item.dataset.val,type:item.dataset.val}}
            );
            // var other = [];
            this.gameCards.mine = this.gameCards.mine.map(
                item=>{
                    for(var i = 0; i<sel_list.length;i++){
                        if(item.val != sel_list[i].val && item.type != sel_list[i].type){
                            // other.push(item); 
                            return item
                        }
                    }
                }
            )
            // this.gameCards.mine = other;
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