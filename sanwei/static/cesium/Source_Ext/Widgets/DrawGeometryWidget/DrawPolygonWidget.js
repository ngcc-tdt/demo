/**
 * Class: Cesium.DrawPolygonWidget
 * 三维地图多边形绘制类。
 * @author sunpei
 */
(function(Cesium){
    "use strict";
    /**
     * 三维地图多边形绘制插件类
     *
     * @alias DrawPolygonWidget
     * @constructor
     *
     * @param {Object} [options] 对象具有以下属性:
     * @param {Cesium.Viewer} [options.viewer].
     * @param {Color} [options.color = Cesium.Color.CHARTREUSE.withAlpha(0.5)] 绘制面颜色.
     * @param {Number} [options.lineWidth=2.0] 绘制面边框宽度.
     * @param {Function(Event)} [callback] 返回绘制多边形
     *
     * @example
     * // 初始化控件.
     * var DrawPolygonWidget = new Cesium.DrawPolygonWidget({
     *     viewer：viewr
     * });
     */
    var DrawPolygonWidget = Cesium.DrawPolygonWidget = function(options,callback) {
        this.viewer = options.viewer;
        this.color = options.color?options.color:Cesium.Color.CHARTREUSE.withAlpha(0.5);
        this.lineWidth = options.lineWidth?options.lineWidth:2;
        this.scene = this.viewer.scene;
        this.camera = this.viewer.camera;
        this.canvas = this.scene.canvas;
        this.primitives = this.scene.primitives;
        this.ellipsoid = this.scene.globe.ellipsoid;
        this.callback = callback?callback:null;
    };
    /**
     * 激活控件
     */
    DrawPolygonWidget.prototype.activate = function() {
        if(this.handler) return;
        this.handler = new Cesium.ScreenSpaceEventHandler(this.canvas);
        this.viewer.canvas.style.cursor = "crosshair";
        var that = this;
        var array = [];//点数组   []
        var polylines,labels;
        this.handler.setInputAction(function(p){
            var ray = that.camera.getPickRay(p.position);
            var cartesian = that.scene.globe.pick(ray,that.scene);
            if(!cartesian) return;
            array.push(cartesian);
            if (array.length==1) {
                polylines = that.primitives.add(new Cesium.PolylineCollection());
                polylines.name = "draw_polyline";
                polylines.add({
                    polyline:{}
                });
                polylines.get(polylines.length-1).width = that.lineWidth;
                polylines.get(polylines.length-1).loop = true;
                polylines.get(polylines.length-1).material.uniforms.color = that.color;
                polylines.get(polylines.length-1).positions=array;
            }
            if (array.length>3) {
                polylines.get(polylines.length-1).positions=array;
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
            if (array.length>=1) {
                var tempArray = array.concat();
                tempArray.push(cartesian);
                polylines.get(polylines.length-1).positions=tempArray;
            }
            if(!labels){
                labels = that.primitives.add(new Cesium.LabelCollection());
                labels.name = "draw_label";
                labels.add({
                    text : '左键单击开始绘制，右键单击结束绘制',
                    font : '15px Microsoft YaHei',
                    showBackground : true
                });
                labels.get(labels.length-1).position = cartesian;
            }else{
                labels.get(labels.length-1).position = cartesian;
            }
        },Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.handler.setInputAction(function(p){
            that.handler = that.handler && that.handler.destroy();
            that.viewer.canvas.style.cursor = "default";
            //绘制完成,清除提示
            if(labels){
                that.primitives.remove(labels);
                labels=null;
            }
            var ray = that.camera.getPickRay(p.position);
            var cartesian = that.scene.globe.pick(ray,that.scene);
            if(!cartesian) return;
            array.push(cartesian);
            polylines.get(polylines.length-1).material.uniforms.color = Cesium.Color.DODGERBLUE.withAlpha(1);
            that.viewer.entities.add({
                name:"draw_polygon",
                polygon : {
                    hierarchy : {
                        positions : array
                    },
                    material : that.color
                }
            });
            if(that.callback){
                var entity = new Cesium.Entity({
                    polygon : {
                        hierarchy : {
                            positions : array
                        }
                    }
                });
                that.callback(entity);
            }

        },Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    };
    /**
     * 清除绘制痕迹
     */
    DrawPolygonWidget.prototype.clear = function() {
        this.handler = this.handler && this.handler.destroy();
        this.viewer.canvas.style.cursor = "default";
        //清除 绘制痕迹
        clearPrimitiveByName("draw_label",this.primitives);
        clearPrimitiveByName("draw_polyline",this.primitives);
        clearEntityByName("draw_polygon",this.viewer.entities);
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
    //清除entity绘制痕迹
    function clearEntityByName(name,entities) {
        var temp = entities.values;
        for(var i=0;i<temp.length;i++){
            if(temp[i].name == name){
                entities.remove(temp[i]);
                i--;
            }
        }
    }
})(window.Cesium);