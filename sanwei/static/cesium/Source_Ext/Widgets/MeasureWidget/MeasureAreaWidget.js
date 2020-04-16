(function(Cesium){
    "use strict";
    /**
     * 三维地图面积量插件算类
     *
     * @alias MeasureAreaWidget
     * @constructor
     *
     * @param {Object} [options] 对象具有以下属性:
     * @param {Cesium.Viewer} [options.viewer].
     * @param {Color} [options.color = Cesium.Color.CHARTREUSE.withAlpha(0.5)] 绘制面颜色.
     * @param {Number} [options.lineWidth=2.0] 绘制面边框宽度.
     *
     *
     * @example
     * // 初始化控件.
     * var MeasureAreaWidget = new Cesium.MeasureAreaWidget({
     *     viewer：viewr
     * });
     */
    var MeasureAreaWidget = Cesium.MeasureAreaWidget = function(options,callback) {
        this.viewer = options.viewer;
        this.color = options.color?options.color:Cesium.Color.CHARTREUSE.withAlpha(0.5);;
        this.lineWidth = options.lineWidth?options.lineWidth:2;
        this.scene = this.viewer.scene;
        this.camera = this.viewer.camera;
        this.canvas = this.scene.canvas;
        this.primitives = this.scene.primitives;
        this.ellipsoid = this.scene.globe.ellipsoid;
    };
    /**
     * 激活控件：激活面积量算插件，左键开始绘制，右键结束绘制
     */
    MeasureAreaWidget.prototype.activate = function() {
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
            $("#measure-content").children().removeClass("active");
            //绘制完成,清除提示
            if(labels){
                that.primitives.remove(labels);
                labels=null;
            }
            var ray = that.camera.getPickRay(p.position);
            var cartesian = that.scene.globe.pick(ray,that.scene);
            if(!cartesian) return;
            array.push(cartesian);
            polylines.get(polylines.length-1).material.uniforms.color = Cesium.Color.CHARTREUSE.withAlpha(0);
            that.viewer.entities.add({
                name:"draw_polygon",
                polygon : {
                    hierarchy : {
                        positions : array
                    },
                    material : that.color
                }
            });
            var tempArray = [];
            for(var i=0;i<array.length;i++){
                var cartographic = Cesium.Cartographic.fromCartesian(array[i]);
                var lng = Cesium.Math.toDegrees(cartographic.longitude);
                var lat = Cesium.Math.toDegrees(cartographic.latitude);
                tempArray.push([lng,lat]);
            }
            //首尾相连
            tempArray.push(tempArray[0]);
            var polygon = turf.polygon([tempArray]);
            var area = turf.area(polygon);
            var result;
            if(area<1000000){
                result = "面积："+area.toFixed(2)+"m²";
            }else{
                result = "面积："+(area/1000000).toFixed(2)+"km²";
            }
            createResultLabel(that.primitives,result,array);

        },Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    };
    /**
     * 清除量算结果
     */
    MeasureAreaWidget.prototype.clear = function() {
        this.handler = this.handler && this.handler.destroy();
        this.viewer.canvas.style.cursor = "default";
        //清除 绘制痕迹
        clearPrimitiveByName("result_label",this.primitives);
        clearPrimitiveByName("draw_label",this.primitives);
        clearPrimitiveByName("draw_polyline",this.primitives);
        clearEntityByName("draw_polygon",this.viewer.entities);
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