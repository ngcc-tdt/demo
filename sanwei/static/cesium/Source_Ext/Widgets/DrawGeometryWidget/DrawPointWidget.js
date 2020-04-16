/**
 * Class: Cesium.DrawPointWidget
 * 三维地图点绘制类。
 * @author sunpei
 */
(function(Cesium){
    "use strict";
    /**
     * 三维地图点绘制插件类
     *
     * @alias DrawPointWidget
     * @constructor
     *
     * @param {Object} [options] 对象具有以下属性:
     * @param {Cesium.Viewer} [options.viewer].
     * @param {Color} [options.color = Cesium.Color.CHARTREUSE.withAlpha(0.5)] 绘制点颜色.
     * @param {Number} [options.pixelSize=10] 绘制点大小.
     * @param {Function(Event)} [callback] 返回绘制点
     *
     * @example
     * // 初始化控件.
     * var DrawPointWidget = new Cesium.DrawPointWidget({
     *     viewer：viewr
     * });
     */
    var DrawPointWidget = Cesium.DrawPointWidget = function(options,callback) {
        this.viewer = options.viewer;
        this.color = options.color?options.color:Cesium.Color.YELLOW;
        this.pixelSize = options.pixelSize?options.pixelSize:10;
        this.scene = this.viewer.scene;
        this.camera = this.viewer.camera;
        this.canvas = this.scene.canvas;
        this.primitives = this.scene.primitives;
        this.ellipsoid = this.scene.globe.ellipsoid;
        this.callback = callback?callback:null;
    };
    /**
     * 激活控件：激活点绘制插件，左键开始绘制，右键结束绘制
     */
    DrawPointWidget.prototype.activate = function(){
        if(this.handler) return;
        this.handler = new Cesium.ScreenSpaceEventHandler(this.canvas);
        this.viewer.canvas.style.cursor = "crosshair";
        var that = this;
        var array = [];//点数组   [lng,lat,height,...]
        var points,labels;
        this.handler.setInputAction(function(p){
            var ray = that.camera.getPickRay(p.position);
            var cartesian = that.scene.globe.pick(ray,that.scene);
            if(!cartesian) return;
            array[0]=cartesian;
            if(points){
                points.removeAll();
            }else{
                points = that.primitives.add(new Cesium.PointPrimitiveCollection());
                points.name = "draw_point";
            }

            points.add({
                position : cartesian,
                color : that.color,
                pixelSize :that.pixelSize
            });
            
            that.handler = that.handler && that.handler.destroy();
            that.viewer.canvas.style.cursor = "default";
            //绘制完成,清除提示
            if(labels){
                that.primitives.remove(labels);
                labels=null;
            }
            if(that.callback){
                var entity = new Cesium.Entity({
                    position:array[0],
                    point:{}
                });
                that.callback(entity);
            }
        },Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.setInputAction(function(p){
            var ray = that.camera.getPickRay(p.endPosition);
            var cartesian = that.scene.globe.pick(ray,that.scene);
            if (!cartesian) {
                if(labels){
                    that.primitives.remove(labels);
                    labels=null;
                }
                return;
            };
            if(!labels){
                labels = that.primitives.add(new Cesium.LabelCollection());
                labels.name = "draw_label";
                labels.add({
                    text : '左键单击进行绘制',
                    font : '15px Microsoft YaHei',
                    showBackground : true
                });
                labels.get(labels.length-1).position = cartesian;
            }else{
                labels.get(labels.length-1).position = cartesian;
            }
        },Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    };
    /**
     * 清除绘制痕迹
     */
    DrawPointWidget.prototype.clear = function(){
        this.handler = this.handler && this.handler.destroy();
        this.viewer.canvas.style.cursor = "default";
        //清除 绘制痕迹
        clearPrimitiveByName("draw_label",this.primitives);
        clearPrimitiveByName("draw_point",this.primitives);
    };
    //清除primitive绘制痕迹
    function clearPrimitiveByName(name,primitives){
        for(var i=0;i<primitives.length;i++){
            if(primitives.get(i).name==name){
                primitives.remove(primitives.get(i));
                i--;
            }
        }
    }
})(window.Cesium);