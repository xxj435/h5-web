(function(factory){
    if(typeof define === "function" && define.amd != undefined ){
        // AMDģʽ
        define(["jquery","hammer",'hammer.fake','hammer.showtouch','megapix-image' ], factory);
    } else {
        // ȫ��ģʽ
        factory(jQuery)
    }
})(function($) {
    //2015-08-21  hammer plugin
    ;(function(){
        if(!Hammer.HAS_TOUCHEVENTS && !Hammer.HAS_POINTEREVENTS) {
            Hammer.plugins.showTouches();
        }
        if(!Hammer.HAS_TOUCHEVENTS && !Hammer.HAS_POINTEREVENTS) {
            Hammer.plugins.fakeMultitouch();
        }

        $.fn.hammer = Plugin;
        $.fn.hammer.Constructor = Myhammer;
        $.fn.hammer.noConflict=function(){
            $.fn.hammer=old;
            return this;
        }
        var old= $.fn.hammer;
        function Plugin(opt,params){
            return this.each(function(){
                var $this=$(this);
                //if($this.is("canvas")){
                var data = $this.data("tom.hammer");
                var opts = $.extend({},Myhammer.DEFAULTS,$this.data(),typeof opt=="object" &&opt)
                if(!data) $this.data("tom.hammer",(data=new Myhammer(this,opts)))
                //2016-01-08 update fix opts to opt
                if(typeof opt=="string") data[opt](params)
                /*  }else{
                 console.log("need a  canvas element")
                 }*/
            })
        }
        Myhammer.DEFAULTS={
            transform_always_block: true,
            transform_min_scale: 1,
            drag_block_horizontal: true,
            drag_block_vertical: true,
            drag_min_distance: 0,
            gestureCb:function(){
                console.log('手势回调')
            }
        }

        function Myhammer(canvas,opts){
            //console.log(opts.gestureCb.toString())
            this.rotation=0;
            this.lastPosX=0;
            this.lastPosY=0;
            this.scale=1;
            var posX=0, posY=0,
                bufferX=0, bufferY=0,
                last_scale=1 , last_rotation, dragReady= 0,self=this;
            var hammertime = Hammer(canvas, opts);
            hammertime.on('touch drag dragend transform', function(ev) {
                if(!self.isStop){
                    manageMultitouch(ev);
                }
            });
            if(opts.enableMouseWheel){
                window.addEventListener("mousewheel",function(e){
                    if(self.isStop){return}
                    e.preventDefault();
                    var step = 0.2;
                    if(e.wheelDelta<0){
                        step*=-1;
                    }
                    self.scale+=step;
                    self.scale = Math.max(opts.minScale||0, Math.min(self.scale, 10));
                    opts.gestureCb.call(self,{x:self.lastPosX,y:self.lastPosY,scale:self.scale,rotate:self.rotation})
                })
            }
            function manageMultitouch(ev){
                switch(ev.type) {
                    case 'touch':
                        last_scale = self.scale;
                        last_rotation = self.rotation;
                        break;
                    case 'drag':
                        posX = ev.gesture.deltaX + self.lastPosX;
                        posY = ev.gesture.deltaY + self.lastPosY;
                        opts.gestureCb.call(self,{x:posX,y:posY,scale:last_scale,rotate:last_rotation})
                        break;
                    case 'transform':
                        self.rotation = last_rotation + ev.gesture.rotation;
                        // self.rotation = last_rotation ;
                        self.scale = Math.max(opts.minScale||0, Math.min(last_scale * ev.gesture.scale, 10));
                        opts.gestureCb.call(self,{x:self.lastPosX,y:self.lastPosY,scale:self.scale,rotate:self.rotation})
                        break;
                    case 'dragend':
                        self.lastPosX = posX;
                        self.lastPosY = posY;
                        if(opts.dragendCb){
                            opts.dragendCb.call(self);
                        }
                        break;
                }
            }
            this.reset=function(){
                posX=0;posY=0;
                this.lastPosX=0;this.lastPosY=0;
                bufferX=0; bufferY=0;
                scale=1; last_scale=1 ;this.rotation= 0;last_rotation=0;
            }
        }
        Myhammer.prototype.stop=function(){
            this.isStop=true;
        }
        Myhammer.prototype.start=function(){
            this.isStop=false;
        }
        Myhammer.prototype.setRotate=function(rotation){
            this.rotation=rotation;
        }
        Myhammer.prototype.setLastPos=function(pos){
            this.lastPosX=pos.x;
            this.lastPosY=pos.y;
        }
    })();
})
