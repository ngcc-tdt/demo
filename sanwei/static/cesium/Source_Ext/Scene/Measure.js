(function(Cesium){
    "use strict";
    /**
     * 三维地图量算类
     *
     * @alias Measure
     * @constructor
     *
     * @param {Object} [options] 对象具有以下属性:
     * @param {Cesium.Viewer} [options.viewer=""].
     *
     * @example
     * // 初始化控件.
     * var Measure = new Cesium.Measure({
     *     viewer：viewr
     * });
     */
    var Measure = Cesium.Measure = function (options) {
        this.viewer = options.viewer;
        this.primitives = this.viewer.scene.primitives;
    };
    /**
     * 距离计算：默认单位为米，超过1000米换算成千米.
     *
     * @param {Cesium.Entity} [entity].
     * @param {Number} [mode] 1：空间量算，2：贴地量算.
     * @returns {String} 距离计算结果.
     */
    Measure.prototype.distance = function(entity,mode){
        if(!entity.polyline) return;
        var array = entity.polyline.positions.getValue();
        if(array.length<=1) return;
        var distance = 0;//贴地
        var distance2 = 0;//空间
        var result;
        var geodesic = new Cesium.EllipsoidGeodesic();
        for(var i=1;i<array.length;i++){
            var startCartographic = Cesium.Cartographic.fromCartesian(array[i-1]);
            var endCartographic = Cesium.Cartographic.fromCartesian(array[i]);
            geodesic.setEndPoints(startCartographic, endCartographic);
            var lengthInMeters = Math.round(geodesic.surfaceDistance);
            distance +=lengthInMeters;

            var cartographic1 = Cesium.Cartographic.fromCartesian(array[i-1]);
            var lng1 = Cesium.Math.toDegrees(cartographic1.longitude);
            var lat1 = Cesium.Math.toDegrees(cartographic1.latitude);
            var cartographic2 = Cesium.Cartographic.fromCartesian(array[i]);
            var lng2 = Cesium.Math.toDegrees(cartographic2.longitude);
            var lat2 = Cesium.Math.toDegrees(cartographic2.latitude);
            var from = turf.point([lng1, lat1]);
            var to = turf.point([lng2, lat2]);
            distance2 +=turf.distance(from, to);
        }
        if(mode==2){
            if(distance<1000){
                result = distance.toFixed(2)+"m";
            }else{
                result = (distance/1000).toFixed(2)+"km";
            }
        }else if(mode==1){
            if(distance2<1){
                result = (distance2*1000).toFixed(2)+"m";
            }else{
                result = (distance2).toFixed(2)+"km";
            }
        }
        return result;
    };
    /**
     * 面积计算：默认单位为平方米，超过1000000平方米换算为平方千米.
     *
     * @param {Cesium.Entity} [entity].
     * @returns {String} 面积计算结果.
     */
    Measure.prototype.area = function(entity){
        if(!entity.polygon) return;
        var array = entity.polygon.hierarchy.getValue().positions;
        if(array.length<=2) return;
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
            result = area.toFixed(2)+"m²";
        }else{
            result = (area/1000000).toFixed(2)+"km²";
        }
        return result;
    };
    /**
     * 高度计算：默认单位为米，超过1000米则换算成千米.
     *
     * @param {Cesium.Entity} [entity].
     * @returns {Object} 两点的垂直高度计算结果、水平距离计算结果、空间距离计算结果.
     */
    Measure.prototype.height = function(entity){
        if(!entity.polyline) return;
        var array = entity.polyline.positions.getValue();
        array = [array[0],array[1]];
        if(array.length!=2) return;
        var tempArray = [];
        for(var i=0;i<array.length;i++){
            var cartographic = Cesium.Cartographic.fromCartesian(array[i]);
            var lng = Cesium.Math.toDegrees(cartographic.longitude);
            var lat = Cesium.Math.toDegrees(cartographic.latitude);
            var height = cartographic.height;
            tempArray.push(lng);
            tempArray.push(lat);
            tempArray.push(height);
        }
        //根据两个点的位置判断第三个点的位置（比较高度）
        if(tempArray[2]>=tempArray[5]){
            tempArray.push(tempArray[0]);
            tempArray.push(tempArray[1]);
            tempArray.push(tempArray[5]);
        }else{
            tempArray.push(tempArray[3]);
            tempArray.push(tempArray[4]);
            tempArray.push(tempArray[2]);
        }
        var result = {
            horizontalDistance:null,
            verticalHeight:null,
            spaceDistance:null
        };
        //水平距离(m)
        var horizontalDistance= turf.distance(turf.point([tempArray[0], tempArray[1]]), turf.point([tempArray[3], tempArray[4]]))*1000;
        var temp = [];
        temp.push((tempArray[0]+tempArray[3])/2);
        temp.push((tempArray[1]+tempArray[4])/2);
        if(tempArray[2]>=tempArray[5]){
            temp.push(tempArray[5]);
        }else{
            temp.push(tempArray[2]);
        }
        if(horizontalDistance<1000){
            result.horizontalDistance = "水平距离："+horizontalDistance.toFixed(2)+"m";
        }else{
            result.horizontalDistance = "水平距离："+(horizontalDistance/1000).toFixed(2)+"km";
        }

        //垂直高度(m)
        var verticalHeight =Math.abs(tempArray[2]-tempArray[5]);
        var temp = [];
        if(tempArray[2]>=tempArray[5]){
            temp.push(tempArray[0]);
            temp.push(tempArray[1]);
        }else{
            temp.push(tempArray[3]);
            temp.push(tempArray[4]);
        }
        temp.push((tempArray[2]+tempArray[5])/2);
        if(verticalHeight<1000){
            result.verticalHeight = "垂直高度："+verticalHeight.toFixed(2)+"m";
        }else{
            result.verticalHeight = "垂直高度："+(verticalHeight/1000).toFixed(2)+"km";
        }
        //空间距离(m)
        var spaceDistance = Math.sqrt(Math.pow(horizontalDistance,2)+Math.pow(verticalHeight,2));
        var temp = [];
        temp.push((tempArray[0]+tempArray[3])/2);
        temp.push((tempArray[1]+tempArray[4])/2);
        temp.push((tempArray[2]+tempArray[5])/2);
        if(spaceDistance<1000){
            result.spaceDistance = "空间距离："+spaceDistance.toFixed(2)+"m";
        }else{
            result.spaceDistance = "空间距离："+(spaceDistance/1000).toFixed(2)+"km";
        }
        return result;

    };
    /**
     * 高程计算：默认单位为米.
     *
     * @param {Cesium.Entity} [entity].
     * @returns {String} 当前点的高程值.
     */
    Measure.prototype.elevation = function(entity){
        if(!entity.point) return;
        var array = [entity.position._value];
        if(array.length!=1) return;
        var cartographic = Cesium.Cartographic.fromCartesian(array[0]);
        var elevation = cartographic.height;
        var result = "高程值："+elevation.toFixed(2)+"m";
        createResultLabel2(this.options,this.primitives,array);
    };
})(window.Cesium);