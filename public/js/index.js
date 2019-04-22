Vue.component('Card',{
    template:'<li class="card mine_card" :style="{\'backgroundImage\':\'url(assets/images/\'+card.val+card.type+\'.png)\'}"  :key="\'mine\'+card.val + card.type" :data-val="card.val" :data-type= "card.type" @click="select">'+
                // '<font>{{card.val | judge}}</font>'+
                // '<img draggable="false" class="card-img" :src="\'assets/images/\'+card.val+card.type+\'.png\'"></img>'+
            '</li>',
    props:['card'],
    data:()=>{
        return{
        }
    },
    filters:{
        judge(val){
            return val<14 && val>10?['J','Q','K'][val-11]:val > 13?['A','2','小','大'][val-14]:val;
        }
    },
    methods:{
        select:function(e){
            var target = e.target;
            while(target.nodeName != 'LI'){
                target = e.target.parentNode;
            }
            target.classList.toggle('checked');
        },
    }
})

var player = new Vue({
    el:'#app',
    data:{
        timer:{
            _left:'',   //剩余时间
            _tag:'',     //定时器标记，便于清除
            _turn:''
        },
        selected:{start:'',end:'',list:[]},
        history:{
            pass:[false,false,false],
            cards:[[],[],[]]
        },
        gameCenter:{
            'curr':{
                cards:[],
                turn:0,
            },
            'mine':{
                cards:[],
                turn:0
            },
            'last':{
                card_left:0,
                turn:0
            },
            'next':{
                card_left:0,
                turn:0
            },
            'endCards':[],
            'landNum':0
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
        },
        win:false
    },
    delimiters:['${','}'],
    computed:{
        who(){return (num)=>{
            return num == this.$data.gameCenter.landNum?'地主':'农民'
        }}
    },
    filters:{
        judge(val){
            return val<14 && val>10?['J','Q','K'][val-11]:val > 13?['小','大'][val-14]:val;
        }
    },
    methods:{
        confirm(){
            this.selected.list = [].map.call(document.getElementsByClassName('checked'),item=>{return {val:item.dataset.val,type:item.dataset.type}});
            if(this.gameCenter.curr.turn == this.gameCenter.mine.turn){
                this.gameCenter.curr.cards = [];
                if(this.rules()){
                    this.play();
                }
            }else if(this.rules()){
                console.log('规则符合。')
                this.play();
            };
        },
        pass(){
            var check_list = document.getElementsByClassName('checked');
            for(; check_list.length!=0;){
                for(var i = 0; i<check_list.length;i++){
                    check_list[i].classList.remove('checked');
                };
            };
            // 更改属于我的pass状态
            this.history.pass[this.gameCenter.mine.turn] = true;
            this.play();
        },
        reSelect(){
            var check_list = document.getElementsByClassName('checked');
            for(; check_list.length!=0;){
                for(var i = 0; i<check_list.length;i++){
                    check_list[i].classList.remove('checked');
                };
            };
        },
        restart(){
            this.gameCenter.mine.cards = [];
            this.gameCenter.last.card_left = 0;
            this.gameCenter.next.card_left = 0;
            $('.win_fail').delay(500).fadeOut(1000);
            client.restart();
        },
        help(){ //自动根据上家的牌来进行判断，是否管的上
            var all_cards = document.getElementsByClassName('mine_card');

        },
        play(){
            this.timer._left = 21;
            var sel_list = [].map.call(document.getElementsByClassName('checked'),
                item=>{return {val:item.dataset.val,type:item.dataset.type}}
            );
            var card_left = [];
            this.gameCenter.curr.cards = [];
            this.gameCenter.mine.cards.forEach(
                item=>{
                    for(var i = 0; i<sel_list.length;i++){
                        if(item.val == Number(sel_list[i].val) && item.type == sel_list[i].type){
                            this.gameCenter.curr.cards.push(item);
                            return false
                        }
                    }
                    card_left.push(item);
                }
            );
            // 更改属于我的历史牌
            this.history.cards[this.gameCenter.mine.turn] = this.gameCenter.curr.cards;
            // 标明出牌人是我
            this.gameCenter.curr.turn = this.gameCenter.mine.turn;
            // 出牌
            client.playCard(this.gameCenter.curr,this.history,card_left);
            this.gameCenter.mine.cards = card_left;
        },
        analysis(cards){

            let result = {
                before:[],
                after:{},               //解析后的对象
                s_max:0,                //同一张牌最多出现次数
                s_max_list:[],          //最大次数有几组
                after_length:0,         //解析对象的长度
                
            };
            console.log(cards);
            if(cards.length == 0){  
                return result;
            }
            for(var key of cards){
                result.after[key.val] = result.after[key.val]?++result.after[key.val]:1;
                result.before.push(key.val);
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
             * 3,4,5,6,7,8,9,10,11,12,13,14（A）,15（2）,16（小王）,17（大王）
             * ❤：代表阶别，阶别高可以管辖阶别低的！
             * s_max：表示同一张牌出现最多次数
             * s_max_list.length：表示出现次数最多的那张牌有几组
             * after_length：总共有几张不同的牌
             * 王炸                        （❤❤❤❤❤）           done
             * s_max：1   |   s_max_list.length：2                |   after_length：2
             * 炸弹                        （❤❤❤）              done
             * s_max：4   |   s_max_list.length：1                |   after_length：1
             * 单张                        （❤）                 done
             * s_max：1   |   s_max_list.length：1                |   after_length：1
             * 对子 或者 多对（连贯）       （❤）               
             * s_max：2   |   s_max_list.length：cards.length/2   |   after_length：cards.length/2
             * 三张 或者 多三张（连贯）     （❤）
             * s_max：3   |   s_max_list.length：cards.length/3   |   after_length：cards.length/3
             * 三带一 或者 多三带一（连贯） （❤）
             * s_max：3   |   s_max_list.length：cards.length/4   |   after_length：2 * cards.length/4
             * 四带二 或者 多四带二（连贯） （❤）
             * s_max：4   |   s_max_list.length：1                |   after_length：2-3
             * 顺子（最低五张且连贯）       （❤）                  done
             * s_max：1   |   s_max_list.length：cards.length     |   after_length：cards.length
             *
             * 判断所选的牌符合哪种规则，如需验证连贯性的需要先验证，然后再判断上家的牌是什么样的，是否与选的牌型一致且长度相同。
             */
            if(this.selected.list.length == 0){
                this.tips('没有选牌');
            };
            sel = this.analysis(this.selected.list);
            cur = this.analysis(this.gameCenter.curr.cards);
            if(sel.s_max == 1 && sel.s_max_list.length == 2 && sel.after_length == 2 && sel.before.indexOf('16') !=-1 && sel.before.indexOf('17')!=-1){
                console.log('这是王炸');
                return true;
            }
            // boom 判断炸弹及是否比上家更大
            if(sel.s_max == 4 && sel.s_max_list.length == 1 && sel.after_length == 1){
                if(cur.s_max == 1 && cur.after_length == 2 && cur.before.indexOf('14') !=-1 && cur.before.indexOf('15')!=-1){
                    this.tips('上家是王炸，炸不过呀！');
                    return false
                }else{
                    if(cur.s_max < 4 || (cur.s_max == 4 && cur.before.length > 4)){
                        console.log('炸弹除了王炸，其他都管！');
                        return true
                    };
                    if(Number(sel.s_max_list[0]) > cur.s_max_list[0]){  
                        console.log('我的炸弹更大！');
                        return true
                    }else{
                        this.tips('炸弹不够大');
                        return false //（选的牌不够大）
                    };
                }
            }
            /**
             * single 判断单张还是顺子 
             *  */ 
            if(sel.s_max == 1){
                if(sel.before.length == 1){ //选的单张
                    if(cur.before.length == 0){ 
                        console.log('上家没出牌');
                        return true 
                    }; //上家没出牌
                    if(cur.s_max == 1 && cur.before.length == 1){ //上家和本家牌型一致
                        if(Number(sel.s_max_list[0]) > cur.s_max_list[0]){
                            console.log('我的单张更大');
                            return true
                        }else{
                            this.tips('选牌没有大过上家');
                            return false    //（选的牌不够大）
                        }
                    }
                }else if(sel.before.length >=5 && sel.before.length == sel.after_length){ //选的可能是顺子
                    for(var i = 0; i<sel.s_max_list.length-1;i++){ // 验证连贯
                        if( sel.s_max_list[i] < 15){
                            if(sel.s_max_list[i+1] == Number(sel.s_max_list[i])+1){
                                continue;
                            }else{
                                this.tips('选牌没有大过上家');
                                return false; //（选的牌不连贯）
                            };
                        }else{
                            this.tips('选的牌不符合规则，顺子最大到A');
                            return false //(选的牌不符合规则，顺子最大到A)
                        }
                    };
                    if(cur.before.length == 0){
                        console.log('上家没出牌');
                        return true 
                    }; //上家没出牌
                    if(cur.s_max == 1 && sel.before.length == cur.before.length){ //上家也是顺子并且和本家长度相同
                        if(Number(sel.s_max_list[0]) > cur.s_max_list[0]){
                            console.log('我的顺子更大');
                            return true
                        }else if(Number(sel.s_max_list[0]) < cur.s_max_list[0]){
                            this.tips('选牌没有大过上家');
                            return false    //(选的牌不够大)
                        }
                    }
                    this.tips('选牌和上家一样');
                    return false //（和上家选的牌一样）
                }else{
                    this.tips('选的牌不符合规则，小于五张还想组顺子，你咋不去飞呢？');
                    return false //(选的牌不符合规则，小于五张还想组顺子，你咋不去飞呢？）
                }
            }
            /**
             * 对子 或 连对 （连贯）
             * s_max：2   |   s_max_list.length：cards.length/2   |   after_length：cards.length/2
             */
            if(sel.s_max == 2){
                if(sel.s_max_list.length == 1 && sel.after_length == 1){
                    if(cur.before.length == 0){
                        console.log('上家没出牌');
                        return true 
                    }; //上家没出牌
                    if(cur.s_max == 2 && cur.s_max_list.length == 1 && cur.after_length == 1){
                        if(Number(sel.s_max_list[0]) > cur.s_max_list[0]){
                            console.log('我的单对更大');
                            return true;
                        }else{
                            this.tips('选牌没有大过上家');
                            return false; //（选的牌不够大）
                        }
                    }
                }else if(sel.s_max_list.length >= 3 && sel.after_length == sel.before.length/2 ){ //选的可能是多对
                    for(var i = 0; i<sel.s_max_list.length-1;i++){ // 验证连贯
                        if(sel.s_max_list[i]<15){
                            if(sel.s_max_list[i+1] == Number(sel.s_max_list[i])+1){
                                continue;
                            }else{
                                this.tips('选牌没有大过上家');
                                return false; //（选的牌不连贯）
                            };
                        }else{
                            this.tips('选的牌不符合规则，连对最大到A');
                            return false;
                        }
                    };
                    if(cur.before.length == 0){ 
                        console.log('上家没出牌');
                        return true 
                    }; //上家没出牌
                    if(cur.s_max ==  2  && cur.s_max_list.length == cur.before.length/2 && cur.after_length == cur.before.length/2 && cur.before.length == sel.before.length){
                        if(Number(sel.s_max_list[0]) > cur.s_max_list[0]){
                            console.log('我的连对更大');
                            return true
                        }else if(Number(sel.s_max_list[0]) < cur.s_max_list[0]){
                            this.tips('选牌没有大过上家');
                            return false    //(选的牌不够大)
                        }
                    }
                }else{
                    this.tips('选牌不符合规则');
                    return false //（选的牌不符合规则，多对至少三对）
                }
            }
            /**
             * 三张 或 多三张 （连贯）
             * s_max：3   |   s_max_list.length：cards.length/3   |   after_length：cards.length/3
             *
             * 三带一二 或 多三带一二 （连贯）
             * s_max：3   |   s_max_list.length：cards.length/4   |   after_length：2 * cards.length/4
             */
            if(sel.s_max == 3){
                if(sel.s_max_list.length == 1 && sel.after_length == 1){ //只有三张
                    if(cur.before.length == 0){ 
                        console.log('上家没出牌');
                        return true 
                    }; //上家没出牌
                    if(cur.s_max == 3 && cur.s_max_list.length == 1 && cur.after_length == 1){
                        if(Number(sel.s_max_list[0]) > cur.s_max_list[0]){
                            console.log('我的三张更大');
                            return true;
                        }else{
                            this.tips('选牌没有大过上家');
                            return false; //（选的牌不够大）
                        }
                    }
                }else if(sel.s_max_list.length>=2 && sel.after_length == sel.before.length/3){ //多三张
                    for(var i = 0; i<sel.s_max_list.length-1;i++){ // 验证连贯
                        if(sel.s_max_list[i]<15){
                            if(sel.s_max_list[i+1] == Number(sel.s_max_list[i])+1){
                                continue;
                            }else{
                                this.tips('选牌没有大过上家');
                                return false; //（选的牌不连贯）
                            };
                        }else{
                            this.tips('选的牌不符合规则，飞机最大到A');
                            return false;
                        }
                    };
                    if(cur.before.length == 0){ 
                        console.log('上家没出牌');
                        return true 
                    }; //上家没出牌
                    if(cur.s_max == 3 && cur.s_max_list.length == cur.before.length/3 && cur.after_length == cur.before.length/3 && cur.before.length == sel.before.length){
                        if(Number(sel.s_max_list[0]) > cur.s_max_list[0]){
                            console.log('我的多三张更大');
                            return true
                        }else if(Number(sel.s_max_list[0]) < cur.s_max_list[0]){
                            this.tips('选牌没有大过上家');
                            return false    //(选的牌不够大)
                        }
                    }
                }else if(sel.s_max_list.length == 1 && sel.after_length == 2){ //三带一或者三带对
                    if(cur.before.length == 0){ 
                        console.log('上家没出牌');
                        return true 
                    }; //上家没出牌
                    if(cur.s_max == 3 && cur.s_max_list.length == 1 && cur.after_length == 2 && sel.before.length == cur.before.length){
                        if(Number(sel.s_max_list[0]) > cur.s_max_list[0]){
                            console.log('我的三带一或者三带对更大');
                            return true;
                        }else{
                            this.tips('选牌没有大过上家');
                            return false; //（选的牌不够大）
                        }
                    }
                }else if(sel.s_max_list.length >= 2 && (sel.after_length == sel.before.length/2 || sel.after_length ==sel.before.length/5*2)){ //
                    for(var i = 0; i<sel.s_max_list.length-1;i++){ // 验证连贯
                        if(sel.s_max_list[i]<15){
                            if(sel.s_max_list[i+1] == Number(sel.s_max_list[i])+1){
                                continue;
                            }else{
                                this.tips('选牌不连贯');
                                return false; //（选的牌不连贯）
                            };
                        }else{
                            this.tips('选的牌不符合规则，飞机最大到A');
                            return false;
                        }
                    };
                    if(cur.before.length == 0){
                        console.log('上家没出牌');
                        return true 
                    }; //上家没出牌
                    if(cur.s_max == 3 && cur.s_max_list.length == cur.before.length/4 && (cur.after_length == cur.before.length/2 || cur.after_length == cur.before.length/5*2)&& cur.before.length == sel.before.length){
                        if(Number(sel.s_max_list[0]) > cur.s_max_list[0]){
                            console.log('我的多三带一或多三带二更大');
                            return true
                        }else if(Number(sel.s_max_list[0]) < cur.s_max_list[0]){
                            this.tips('选牌没有大过上家');
                            return false    //(选的牌不够大)
                        }
                    }
                }else{
                    this.tips('选牌不符合规则');
                    return false; //（选的牌不符合规则，多三带一至少两对）
                }
            }
            /**
             * 四带二
             * s_max：4   |   s_max_list.length：1   |   after_length：2-3
             */
            if(sel.s_max == 4){
                if(sel.s_max_list.length == 1 && (sel.after_length == 2||sel.after_length == 3) && sel.before.length == 6){ //只有三张
                    if(cur.before.length == 0){ 
                        console.log('上家没出牌');
                        return true 
                    }; //上家没出牌
                    if(cur.s_max == 4 && cur.s_max_list.length == 1 && (cur.after_length == 2||cur.after_length == 3)  && cur.before.length == 6){
                        if(Number(sel.s_max_list[0]) > cur.s_max_list[0]){
                            console.log('我的四带二更大');
                            return true;
                        }else{
                            this.tips('选牌没有大过上家');
                            return false; //（选的牌不够大）
                        }
                    }
                }else{
                    this.tips('选的牌不符合规则');
                    return false; //（，四带二最多一对）
                }
            }
            this.tips('选的牌不符合规则');
            return false //（选的牌不符合规则，所有规则不符合）
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
                if(this.region.start.x - last < 90 || this.region.end.x -last <90){
                    this.cardOffset.horizontal.start = this.cardOffset.list.length-1;
                    this.cardOffset.horizontal.end = this.cardOffset.list.length;
                    this.actCard();
                }
                    return false;
            }
            var points = [ this.region.start.x, this.region.end.x, first, last].sort((a,b)=>a-b);
            for(var i = 0; i < this.cardOffset.list.length;i++){
                if(this.cardOffset.list[i].offsetLeft >= points[1] - 25 
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
            this.cardOffset.vertical.bottom = this.cardOffset.vertical.top + 145;
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
        tips(text){
            $('#tips').fadeIn(500).text(text).delay(1000).fadeOut(500);
        }

    },
    mounted:function(){
        // console.log(that.gameCenter.mine);
    },
});