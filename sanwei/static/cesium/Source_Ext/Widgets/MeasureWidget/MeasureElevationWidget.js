(function(Cesium){
    "use strict";
    /**
     * 三维地图高程量算插件类
     *
     * @alias MeasureElevationWidget
     * @constructor
     *
     * @param {Object} [options] 对象具有以下属性:
     * @param {Cesium.Viewer} [options.viewer].
     * @param {Color} [options.color = Cesium.Color.CHARTREUSE.withAlpha(0.5)] 绘制点颜色.
     * @param {Number} [options.pixelSize=2.0] 绘制点大小.
     *
     * @example
     * // 初始化控件.
     * var Cesium.MeasureElevationWidget = new Cesium.MeasureElevationWidget({
     *     viewer：viewr
     * });
     */
    var MeasureElevationWidget = Cesium.MeasureElevationWidget = function(options,callback) {
        this.viewer = options.viewer;
        this.color = options.color?options.color:Cesium.Color.YELLOW;
        this.pixelSize = options.pixelSize?options.pixelSize:10;
        this.scene = this.viewer.scene;
        this.camera = this.viewer.camera;
        this.canvas = this.scene.canvas;
        this.primitives = this.scene.primitives;
        this.ellipsoid = this.scene.globe.ellipsoid;
    };
    /**
     * 激活控件：激活高程量算插件，左键开始绘制，右键结束绘制
     */
    MeasureElevationWidget.prototype.activate = function(){
        if(this.handler) return;
        this.handler = new Cesium.ScreenSpaceEventHandler(this.canvas);
        this.viewer.canvas.style.cursor = "crosshair";
        var that = this;
        var array = [];//点数组
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
                    text : '左键单击开始绘制，右键单击结束绘制',
                    font : '16px sans-serif',
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
            var cartographic = Cesium.Cartographic.fromCartesian(array[0]);
            var elevation = cartographic.height;
            var result = "高程值："+elevation.toFixed(2)+"m";
            createResultLabel(that.primitives,result,array);
        },Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    };
    /**
     * 清除量算结果
     */
    MeasureElevationWidget.prototype.clear = function(){
        this.handler = this.handler && this.handler.destroy();
        this.viewer.canvas.style.cursor = "default";
        //清除 绘制痕迹
        clearPrimitiveByName("result_label",this.primitives);
        clearPrimitiveByName("draw_label",this.primitives);
        clearPrimitiveByName("draw_point",this.primitives);
    };
    //生成结果label
    function createResultLabel(primitives,result,array){
        //生成显示结果的label
        var labels = primitives.add(new Cesium.LabelCollection());
        labels.name = "result_label";
        labels.add({
            text : result,
            font : '16px sans-serif',
            showBackground : true
        });
        labels.get(labels.length-1).position = array[array.length-1];
    }
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