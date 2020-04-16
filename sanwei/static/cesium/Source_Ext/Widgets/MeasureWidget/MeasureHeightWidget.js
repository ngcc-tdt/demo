(function(Cesium){
    "use strict";
    /**
     * 三维地图高度量算插件类
     *
     * @alias MeasureHeightWidget
     * @constructor
     *
     * @param {Object} [options] 对象具有以下属性:
     * @param {Cesium.Viewer} [options.viewer].
     * @param {Color} [options.color = Cesium.Color.CHARTREUSE.withAlpha(0.5)] 绘制线颜色.
     * @param {Number} [options.lineWidth=2.0] 绘制面边框宽度.
     *
     * @example
     * // 初始化控件.
     * var Cesium.MeasureHeightWidget = new Cesium.MeasureHeightWidget({
     *     viewer：viewr
     * });
     */
    var MeasureHeightWidget = Cesium.MeasureHeightWidget = function(options,callback) {
        this.viewer = options.viewer;
        this.color = options.color?options.color:Cesium.Color.CHARTREUSE.withAlpha(0.5);
        this.lineWidth = options.lineWidth?options.lineWidth:2;
        this.scene = this.viewer.scene;
        this.camera = this.viewer.camera;
        this.canvas = this.scene.canvas;
        this.primitives = this.scene.primitives;
        this.ellipsoid = this.scene.globe.ellipsoid;
    };
    /**
     * 激活控件：激活高度量算插件，左键开始绘制，右键结束绘制
     */
    MeasureHeightWidget.prototype.activate = function(){
        if(this.handler) return;
        this.handler = new Cesium.ScreenSpaceEventHandler(this.canvas);
        this.viewer.canvas.style.cursor = "crosshair";
        var that = this;
        var array = [];//点数组   []
        var polylines,labels;
        this.handler.setInputAction(function(p){
            if(array.length>0) return;
            var ray = that.camera.getPickRay(p.position);
            var cartesian = that.scene.globe.pick(ray,that.scene);
            if(!cartesian) return;
            var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            var lng = Cesium.Math.toDegrees(cartographic.longitude);
            var lat = Cesium.Math.toDegrees(cartographic.latitude);
            var height = cartographic.height;
            if(array.length==0){
                //默认三个点位置相同
                array.push(lng);
                array.push(lat);
                array.push(height);
                array.push(lng);
                array.push(lat);
                array.push(height);
                array.push(lng);
                array.push(lat);
                array.push(height);
                polylines = that.primitives.add(new Cesium.PolylineCollection());
                polylines.name = "draw_polyline";
                polylines.add({
                    polyline:{}
                });
                polylines.get(polylines.length-1).width = that.lineWidth;
                polylines.get(polylines.length-1).loop = true;
                polylines.get(polylines.length-1).material.uniforms.color = that.color;
                polylines.get(polylines.length-1).positions=Cesium.Cartesian3.fromDegreesArrayHeights(array);
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
            var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            var lng = Cesium.Math.toDegrees(cartographic.longitude);
            var lat = Cesium.Math.toDegrees(cartographic.latitude);
            var height = cartographic.height;
            if (array.length==9) {
                //改变第二个点的值
                array[3] = lng;
                array[4] = lat;
                array[5] = height;
                //根据一二两个点的位置判断第三个点的位置（比较高度）
                if(array[2]>=array[5]){
                    array[6] = array[0];
                    array[7] = array[1];
                    array[8] = array[5];
                }else{
                    array[6] = array[3];
                    array[7] = array[4];
                    array[8] = array[2];
                }
                polylines.get(polylines.length-1).positions=Cesium.Cartesian3.fromDegreesArrayHeights(array);
            }
            if(!labels){
                labels = that.primitives.add(new Cesium.LabelCollection());
                labels.name = "draw_label";
                labels.add({
                    text : '左键单击开始绘制，右键单击结束绘制',
                    font : '16px sans-serif',
                    showBackground : true
                });
                labels.get(labels.length-1).position = Cesium.Cartesian3.fromDegrees(lng,lat,height);
            }else{
                labels.get(labels.length-1).position = Cesium.Cartesian3.fromDegrees(lng,lat,height);
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
            //var temp = Cesium.Cartesian3.fromDegreesArrayHeights(array);

            //水平距离(m)
            var horizontalDistance= turf.distance(turf.point([array[0], array[1]]), turf.point([array[3], array[4]]))*1000;
            var temp = [];
            temp.push((array[0]+array[3])/2);
            temp.push((array[1]+array[4])/2);
            if(array[2]>=array[5]){
                temp.push(array[5]);
            }else{
                temp.push(array[2]);
            }
            var result;
            if(horizontalDistance<1000){
                result = "水平距离："+horizontalDistance.toFixed(2)+"m";
            }else{
                result = "水平距离："+(horizontalDistance/1000).toFixed(2)+"km";
            }
            createResultLabel(that.primitives,result,temp);

            //垂直高度(m)
            var verticalHeight =Math.abs(array[2]-array[5]);
            var temp = [];
            if(array[2]>=array[5]){
                temp.push(array[0]);
                temp.push(array[1]);
            }else{
                temp.push(array[3]);
                temp.push(array[4]);
            }
            temp.push((array[2]+array[5])/2);
            var result;
            if(verticalHeight<1000){
                result = "垂直高度："+verticalHeight.toFixed(2)+"m";
            }else{
                result = "垂直高度："+(verticalHeight/1000).toFixed(2)+"km";
            }
            createResultLabel(that.primitives,result,temp);
            //空间距离
            var temp = [];
            temp.push((array[0]+array[3])/2);
            temp.push((array[1]+array[4])/2);
            temp.push((array[2]+array[5])/2);
            var result;
            var spaceDistance = Math.sqrt(Math.pow(horizontalDistance,2)+Math.pow(verticalHeight,2));
            if(spaceDistance<1000){
                result = "空间距离："+spaceDistance.toFixed(2)+"m";
            }else{
                result = "空间距离："+(spaceDistance/1000).toFixed(2)+"km";
            }
            createResultLabel(that.primitives,result,temp);


        },Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    };
    /**
     * 清除量算结果
     */
    MeasureHeightWidget.prototype.clear = function(){
        this.handler = this.handler && this.handler.destroy();
        this.viewer.canvas.style.cursor = "default";
        //清除 绘制痕迹
        clearPrimitiveByName("result_label",this.primitives);
        clearPrimitiveByName("draw_label",this.primitives);
        clearPrimitiveByName("draw_polyline",this.primitives);
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
        labels.get(labels.length-1).position = Cesium.Cartesian3.fromDegrees(array[array.length-3],array[array.length-2],array[array.length-1]);
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