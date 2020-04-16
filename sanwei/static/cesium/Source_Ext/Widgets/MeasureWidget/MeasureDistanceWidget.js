(function(Cesium){
    "use strict";
    /**
     * 三维地图距离量算插件类
     *
     * @alias MeasureDistanceWidget
     * @constructor
     *
     * @param {Object} [options] 对象具有以下属性:
     * @param {Cesium.Viewer} [options.viewer].
     * @param {Color} [options.color = Cesium.Color.CHARTREUSE.withAlpha(0.5)] 绘制线颜色.
     * @param {Number} [options.lineWidth=2.0] 绘制面边框宽度.
     * @param {Number} [options.mode=1] 1：空间量算，2：贴地量算.
     *
     * @example
     * // 初始化控件.
     * var MeasureDistanceWidget = new Cesium.MeasureDistanceWidget({
     *     viewer：viewr
     * });
     */
    var MeasureDistanceWidget = Cesium.MeasureDistanceWidget = function(options,callback) {
        this.viewer = options.viewer;
        this.color = options.color?options.color:Cesium.Color.CHARTREUSE.withAlpha(0.5);
        this.lineWidth = options.lineWidth?options.lineWidth:2;
        this.scene = this.viewer.scene;
        this.camera = this.viewer.camera;
        this.canvas = this.scene.canvas;
        this.primitives = this.scene.primitives;
        this.ellipsoid = this.scene.globe.ellipsoid;
        this.mode = options.mode?options.mode:1;
    };
    /**
     * 激活控件：激活距离量算绘制插件，左键开始绘制，右键结束绘制
     */
    MeasureDistanceWidget.prototype.activate = function(){
        if(this.handler) return;
        this.handler = new Cesium.ScreenSpaceEventHandler(this.canvas);
        this.viewer.canvas.style.cursor = "crosshair";
        var that = this;
        var array = [];//点数组   [lng,lat,height,...]
        var polylines,labels;
        this.handler.setInputAction(function(p){
            var ray = that.camera.getPickRay(p.position);
            var cartesian = that.scene.globe.pick(ray,that.scene);
            if(!cartesian) return;
            var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            var lng = Cesium.Math.toDegrees(cartographic.longitude);
            var lat = Cesium.Math.toDegrees(cartographic.latitude);
            var height = cartographic.height;
            array.push(lng);
            array.push(lat);
            array.push(height);
            if (array.length==3) {
                polylines = that.primitives.add(new Cesium.PolylineCollection());
                polylines.name = "draw_polyline";
                polylines.add({
                    polyline:{}
                });
                polylines.get(polylines.length-1).width = that.lineWidth;
                polylines.get(polylines.length-1).material.uniforms.color = that.color;
                polylines.get(polylines.length-1).positions=Cesium.Cartesian3.fromDegreesArrayHeights(array);
            }
            if (array.length>3) {
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
            if (array.length>=3) {
                var tempArray = array.concat();
                tempArray.push(lng);
                tempArray.push(lat);
                tempArray.push(height);
                polylines.get(polylines.length-1).positions=Cesium.Cartesian3.fromDegreesArrayHeights(tempArray);
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
            var ray = that.camera.getPickRay(p.position);
            var cartesian = that.scene.globe.pick(ray,that.scene);
            if(!cartesian) return;
            var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            var lng = Cesium.Math.toDegrees(cartographic.longitude);
            var lat = Cesium.Math.toDegrees(cartographic.latitude);
            var height = cartographic.height;
            array.push(lng);
            array.push(lat);
            array.push(height);
            var result;
            var mode = that.mode;
            if (that.mode ==2) {//贴地绘制 ，默认mode=1，空间绘制
                that.mode =1;//初始化
                var lerpArray = lerp(array,that.scene);
                polylines.get(polylines.length-1).material.uniforms.color = Cesium.Color.CHARTREUSE.withAlpha(0);
                that.viewer.entities.add({
                    name:"draw_polyline",
                    polyline : {
                        positions : Cesium.Cartesian3.fromDegreesArrayHeights(lerpArray),
                        width : that.lineWidth,
                        material : that.color
                    }
                });
            }
            var tempArray = Cesium.Cartesian3.fromDegreesArrayHeights(array);
            var distance = 0;
            var result;
            var geodesic = new Cesium.EllipsoidGeodesic();
            if(mode==1){
                for(var i=1;i<tempArray.length;i++){
                    var cartographic1 = Cesium.Cartographic.fromCartesian(tempArray[i-1]);
                    var lng1 = Cesium.Math.toDegrees(cartographic1.longitude);
                    var lat1 = Cesium.Math.toDegrees(cartographic1.latitude);
                    var cartographic2 = Cesium.Cartographic.fromCartesian(tempArray[i]);
                    var lng2 = Cesium.Math.toDegrees(cartographic2.longitude);
                    var lat2 = Cesium.Math.toDegrees(cartographic2.latitude);
                    var from = turf.point([lng1, lat1]);
                    var to = turf.point([lng2, lat2]);
                    distance +=turf.distance(from, to);
                }
                if(distance<1){
                    result = "距离："+(distance*1000).toFixed(2)+"m";
                }else{
                    result = "距离："+(distance).toFixed(2)+"km";
                }
            }else if(mode==2){
                for(var i=1;i<tempArray.length;i++){
                    var startCartographic = Cesium.Cartographic.fromCartesian(tempArray[i-1]);
                    var endCartographic = Cesium.Cartographic.fromCartesian(tempArray[i]);
                    geodesic.setEndPoints(startCartographic, endCartographic);
                    var lengthInMeters = Math.round(geodesic.surfaceDistance);
                    distance +=lengthInMeters;
                }
                if(distance<1000){
                    result = "距离："+distance.toFixed(2)+"m";
                }else{
                    result = "距离："+(distance/1000).toFixed(2)+"km";
                }
            }
            createResultLabel(that.primitives,result,tempArray);


        },Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    };
    /**
     * 清除量算结果
     */
    MeasureDistanceWidget.prototype.clear = function(){
        this.handler = this.handler && this.handler.destroy();
        this.viewer.canvas.style.cursor = "default";
        //清除 绘制痕迹
        clearPrimitiveByName("result_label",this.primitives);
        clearPrimitiveByName("draw_label",this.primitives);
        clearPrimitiveByName("draw_polyline",this.primitives);
        clearEntityByName("draw_polyline",this.viewer.entities);
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
    //插值
    function lerp(array,scene) {
        var lerpArray = [];
        //for(var i=0;i<array.length-5;i=i+3){
        for(var i=0;i<array.length/3-1;i++){
            var t = i*3;
            var lng_s = array[t];
            var lat_s = array[t+1];
            var height_s = array[t+2];
            var lng_e = array[t+3];
            var lat_e = array[t+4];
            var height_e = array[t+5];
            //插入起点
            lerpArray.push(lng_s);
            lerpArray.push(lat_s);
            lerpArray.push(height_s);
            //插入插值
            for(var j=0;j<100;j++){//插值数100
                var cartographic_s = {
                    longitude:Cesium.Math.toRadians(lng_s),
                    latitude:Cesium.Math.toRadians(lat_s),
                    height:height_s
                };
                var cartographic_e = {
                    longitude:Cesium.Math.toRadians(lng_e),
                    latitude:Cesium.Math.toRadians(lat_e),
                    height:height_e
                };
                var longitude_lerp = Cesium.Math.lerp(cartographic_s.longitude,cartographic_e.longitude,0.01*(j+1));
                var latitude_lerp = Cesium.Math.lerp(cartographic_s.latitude,cartographic_e.latitude,0.01*(j+1));
                //得到当前地形高度
                var cartographic_lerp ={
                    longitude:longitude_lerp,
                    latitude:latitude_lerp
                }
                var height_lerp = scene.globe.getHeight(cartographic_lerp);

                lerpArray.push(Cesium.Math.toDegrees(longitude_lerp));
                lerpArray.push(Cesium.Math.toDegrees(latitude_lerp));
                lerpArray.push(height_lerp);
            }
            //插入终点
            lerpArray.push(lng_e);
            lerpArray.push(lat_e);
            lerpArray.push(height_e);
        }
        return lerpArray;
    }
})(window.Cesium);