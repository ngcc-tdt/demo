/**
* Class: Cesium.Fly
* 三维地图飞行类
* description: 管理飞行层(Model层)
**/
(function(Cesium){
	"use strict"

	/**
	 * Constructor: Cesium.Fly
	 *
	 * Parameters:
	 * map - {Cesium.Map} 3D map Object 
	 *
	 */
	var Fly = Cesium.Fly = function(map){
		this.viewer = map;
        this.scene = this.viewer.scene;
        this.camera = this.viewer.camera;
        this.canvas = this.scene.canvas;
        this.primitives = this.scene.primitives;
        this.ellipsoid = this.scene.globe.ellipsoid;
	};
    /**
     * 激活控件：激活飞行绘制插件，左键开始绘制，右键结束绘制
     */
	Fly.prototype.drawPath = function(){
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
                polylines.name = "fly_path";
                polylines.add({
                    polyline:{}
                });
                polylines.get(polylines.length-1).width = 4;
                polylines.get(polylines.length-1).material.uniforms.color = Cesium.Color.DODGERBLUE;
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
                labels.name = "path_draw_label";
                labels.add({
                    text : '左击开始，右击结束',
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
            var tempArray = Cesium.Cartesian3.fromDegreesArrayHeights(array);
            //填充数据至坐标参数面板
            putPathPointParameter(array);
            //生成站点
            createPathPoint(that.primitives,tempArray);
            //生成显示站点信息的label
            createPathPointLabel(that.primitives,tempArray,that.viewer);
            $(".fly_tab_title h2").removeClass("parameterTab");
            $("#fly_tab_path").removeClass("selected");
            $("#fly_tab_flyParameter").addClass("selected");
            $("#content1").removeClass("selected");
            $("#content3").addClass("selected");
        },Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    };
    /**
     * 创建飞行路线
     */
    Fly.prototype.createPath = function(posOptions,pathName){
    	var pointsPositionArray = posOptions.pathPointPositionArray;
    	var polylines;
    	polylines = this.primitives.add(new Cesium.PolylineCollection());
        polylines.name = "fly_path";
        polylines.pathName = pathName;
        polylines.add({
            polyline:{}
        });
        polylines.get(polylines.length-1).width = 4;
        polylines.get(polylines.length-1).material.uniforms.color = Cesium.Color.DODGERBLUE;
        polylines.get(polylines.length-1).positions=Cesium.Cartesian3.fromDegreesArrayHeights(pointsPositionArray);
        var tempArray = Cesium.Cartesian3.fromDegreesArrayHeights(pointsPositionArray);
        //生成站点
        createPathPoint(this.primitives,tempArray);
        //生成显示站点信息的label
        createPathPointLabel(this.primitives,tempArray,this.viewer);
    };
    /**
     * 打开路线参数设置
     */
    Fly.prototype.openParameterPanel = function(posOptions,flyOptions){
    	putParameterPanelData(posOptions,flyOptions);
        $(".fly_tab_title h2").removeClass("parameterTab");
        $("#fly_tab_path").removeClass("selected");
        $("#fly_tab_flyParameter").addClass("selected");
        $("#content1").removeClass("selected");
        $("#content3").addClass("selected");
    }
    /**
     * 预览飞行路线
     */
    Fly.prototype.previewPath = function(posOptions,flyOptions){
    	var pathPointPositionArray = posOptions.pathPointPositionArray;
    	var pathPointSpeedArray = posOptions.pathPointSpeedArray;
    	var distanceArray = calculateDistanceFromPoints(pathPointPositionArray);
    	var durationArray = calculateDurationFromPoints(distanceArray,pathPointSpeedArray);
    	posOptions.durationArray = durationArray;
    	posOptions.distanceArray = distanceArray;
    	var viewer = this.viewer;
    	clearAirline(viewer);
    	//根据设置显示或隐藏路线
    	showPath(flyOptions,viewer);
    	//沿路线飞行
    	flyPath(posOptions,flyOptions,viewer);
    	return posOptions,flyOptions;
    };
    /**
     * 保存飞行线路
     */
    Fly.prototype.savePath = function(posOptions,flyOptions){
    	if(flyOptions.pathName == ""){
            //获取路线名称，为空时用当前时间表示
            var nowDate = new Date();
            var months,dates,hours,minutes,seconds,milliseconds;
            var pathName;
            months = nowDate.getMonth()+1;
            if(nowDate.getMonth()+1 < 10){
            	months = "0" + months.toString();
            }else{
            	months = months.toString();
            }
            if(nowDate.getDate() < 10){
            	dates = "0" + nowDate.getDate().toString();
            }else{
            	dates = nowDate.getDate().toString();
            }
            if(nowDate.getHours() < 10){
            	hours = "0" + nowDate.getHours().toString();
            }else{
            	hours = nowDate.getHours().toString();
            }
            if(nowDate.getMinutes() < 10){
            	minutes = "0" + nowDate.getMinutes().toString();
            }else{
            	minutes = nowDate.getMinutes().toString();
            }
            if(nowDate.getSeconds() < 10){
            	seconds = "0" + nowDate.getSeconds().toString();
            }else{
            	seconds = nowDate.getSeconds().toString();
            }
        	pathName = "路线" + months + dates + hours + minutes + seconds;
        	$("#path_name_input").val(pathName);
            flyOptions.pathName = pathName;
        }else{
        	pathName = $("#path_name_input").val();
        }
    	var pathPointNameArray = [];
    	for(var i=0;i<$(".path_point_item span").length; i++){
    		pathPointNameArray.push($($(".path_point_item span")[i]).html());
    	}
    	posOptions.pathPointNameArray = pathPointNameArray;
    	if(this.viewer.fly.paths){
    		var pathItemLength = this.viewer.fly.paths.length;
    		this.viewer.fly.paths[pathItemLength] = {
				name: pathName,
    			pathOptions: {
    				posOptions: posOptions,
    				flyOptions: flyOptions
    			}
    		}
    	}else{
    		this.viewer.fly.paths = [];
    		this.viewer.fly.paths[0] = {
    			name: pathName,
    			pathOptions: {
    				posOptions: posOptions,
    				flyOptions: flyOptions
    			}
    		}
    	}
    	var pathNum = $("#fly_path_table tbody tr").length;
    	var pathContent = '<tr data-index="'+ pathNum +'">';
    	pathContent += '<td style="text-align: left; ">'+ pathName +'</td>';
    	pathContent += '<td style="text-align: center; width: 70px; padding: 8px 3px 8px 3px;">';
    	pathContent += '<a class="fly" href="javascript:void(0)" title="飞行"><i class="fa fly-start"></i></a>&nbsp;&nbsp;';
    	pathContent += '<a class="edit" href="javascript:void(0)" title="编辑"><i class="fa fly-setting"></i></a>&nbsp;&nbsp;';
    	pathContent += '<a class="remove" href="javascript:void(0)" title="删除"><i class="fa fly-delete"></i></a></td></tr>';
    	$("#fly_path_table tbody").append(pathContent);

    	this.viewer.fly.clearPanel();
    	this.viewer.fly.clearPath();
    };
    /**
     * 清除面板信息
     */
    Fly.prototype.clearPanel = function(){
    	//清除面板数据
    	clearPosAndFlyPanel();
    	//显示路线面板，隐藏参数面板
    	$("#fly_tab_positionParameter").addClass("parameterTab");
    	$("#fly_tab_flyParameter").addClass("parameterTab");
        $("#fly_tab_path").addClass("selected");
        $("#fly_tab_flyParameter").removeClass("selected");
        $("#content1").addClass("selected");
        $("#content3").removeClass("selected");
    };
    /**
     * 清除飞行路线
     */
    Fly.prototype.clearPath = function(){
        //清除 绘制痕迹
        clearPrimitiveByName("fly_path",this.primitives);
        clearPrimitiveByName("fly_points",this.primitives);
        clearPrimitiveByName("fly_points_label",this.primitives);
        clearEntityByName("airLine",this.viewer.entities);
    };
    /**
     * 停止飞行路线
     */
    Fly.prototype.stopPath = function(){
    	if($("#content1").hasClass("selected")){//如果快速飞行，停止飞行时删除飞行线路
    		this.viewer.fly.clearPath();
    	}
    	this.viewer.scene.postRender.removeEventListener(this.viewer.fly.flyOption);
    	this.viewer.scene.postRender.removeEventListener(this.viewer.fly.panelOption);
    	var flyEntity;
    	for(var i=0; i<this.viewer.entities.values.length; i++){
    		if(this.viewer.entities.values[i].name == "airLine"){
    			flyEntity = this.viewer.entities.values[i];
    			break;
    		}
    	}
    	var flyPrimitive;
    	for(var j=0; j<this.viewer.scene.primitives._primitives.length; j++){
    		if(this.viewer.scene.primitives._primitives[j] instanceof Cesium.Model){
    			this.viewer.scene.primitives.remove(this.viewer.scene.primitives._primitives[j]);
    		}
    	}
    	this.viewer.entities.remove(flyEntity);

    	// 如果为真，则允许用户旋转相机。如果为假，相机将锁定到当前标题。此标志仅适用于2D和3D。
    	this.viewer.scene.screenSpaceCameraController.enableRotate = true;
        // 如果为true，则允许用户平移地图。如果为假，相机将保持锁定在当前位置。此标志仅适用于2D和Columbus视图模式。
    	this.viewer.scene.screenSpaceCameraController.enableTranslate = true;
        // 如果为真，允许用户放大和缩小。如果为假，相机将锁定到距离椭圆体的当前距离
    	this.viewer.scene.screenSpaceCameraController.enableZoom = true;
        // 如果为真，则允许用户倾斜相机。如果为假，相机将锁定到当前标题。这个标志只适用于3D和哥伦布视图。
    	this.viewer.scene.screenSpaceCameraController.enableTilt = true;
    };
    /**
     * 后退飞行
     */
    Fly.prototype.backwardPath = function(){
    	this.viewer.clock.multiplierVal = "-1";
    };
    /**
     * 暂停飞行
     */
    Fly.prototype.pausePath = function(){
    	this.viewer.clock.multiplierVal = "0";
    };
    /**
     * 继续飞行
     */
    Fly.prototype.continuePath = function(){
    	this.viewer.clock.multiplierVal = "1";
    };
    /**
     * 填充飞行信息
     */
    Fly.prototype.putMessageToPanel = function(posOptions,flyOptions,viewer){
    	$("#path_name_message").html(flyOptions.pathName);
    	switch(flyOptions.visualMode){
	  	  case "1" : $("#path_message_viewing_angle_select").html("锁定上帝视角");
	  	  break;
	  	  case "2" : $("#path_message_viewing_angle_select").html("锁定第一视角");
	  	  break;
	  	  case "3" : $("#path_message_viewing_angle_select").html("跟随视角");
	  	  break;
	  	  case "4" : $("#path_message_viewing_angle_select").html("无");
	  	  break;
	  	}
	  	$("#path_message_viewing_height").html(flyOptions.visualHeight);
	  	var totalDistance = 0;
    	var distanceArray = posOptions.distanceArray;
    	for(var i=0; i<distanceArray.length; i++){
    		totalDistance += distanceArray[i];
    	}
    	var total_distance;
    	if(totalDistance>1000){
    		total_distance = totalDistance/1000 +"千米";
    	}else{
    		total_distance = totalDistance + "米";
    	}
    	//总长度
	  	$("#path_message_distance_total").html(total_distance);
	    //已飞行长度
	  	$("#path_message_distance").html("0米");
	  	var totalDuration = 0;
    	var durationArray = posOptions.durationArray;
    	for(var i=0; i<durationArray.length; i++){
    		totalDuration += durationArray[i];
    	}
    	var total_duration;
    	if(totalDuration<60){
    		total_duration = totalDuration +"秒";
    	}else{
    		total_duration =  Math.floor(totalDuration/60) + "分" + (totalDuration-Math.floor(totalDuration/60)*60) + "秒";
    	}
	    //总时间
	  	$("#path_message_duration_total").html(total_duration);
	    //已飞行时间
	  	$("#path_message_duration").html("0秒");
	    //经度
	  	$("#path_message_lng").html(posOptions.pathPointPositionArray[0].toString());
	    //纬度
	  	$("#path_message_lat").html(posOptions.pathPointPositionArray[1].toString());

	  	viewer.fly.panelOption = function(scene,time){
	  	    //取得飞机模型
        	var flyPrimitive,airLineEntity;
        	for(var j=0; j<viewer.scene.primitives._primitives.length; j++){
        		if(viewer.scene.primitives._primitives[j] instanceof Cesium.Model){
        			flyPrimitive = viewer.scene.primitives._primitives[j];
        			break;
        		}
        	}
        	for(var i=0; i<viewer.entities.values.length; i++){
        		if(viewer.entities.values[i].position instanceof Cesium.SampledPositionProperty){
        			airLineEntity = viewer.entities.values[i];
        		}
        	}
            //计算模型的实时坐标
			var cartesian3 = undefined
			if(airLineEntity)
				cartesian3 = airLineEntity.position.getValue(time);
            if(cartesian3==undefined){
                viewer.clock.multiplier =0;
                viewer.scene.postRender.removeEventListener(viewer.fly.panelOption);
            }else{
            	if(viewer.clock.multiplier == 1){
                	var time = viewer.clock.currentTime;
                	var currentPosition,ellipsoid,poiCartographic,poiElevation,cameraCartographic,cameraHeight;
                	var cameraDistance;
                	ellipsoid = viewer.scene.globe.ellipsoid;
                    cameraCartographic = ellipsoid.cartesianToCartographic(cartesian3);
                    var lng = Cesium.Math.toDegrees(cameraCartographic.longitude);
                    var lat = Cesium.Math.toDegrees(cameraCartographic.latitude);
                    //视角高度
                    cameraHeight = cameraCartographic.height;
                    //当前点位的高度
                    poiElevation = viewer.scene.globe.getHeight(cameraCartographic);
                    //离地高度
                    cameraDistance = cameraHeight - poiElevation;
                    $("#path_message_lng").html(lng.toFixed(6));
                    $("#path_message_lat").html(lat.toFixed(6));
                    $("#path_message_alt").html(cameraHeight.toFixed(2)+"米");
                    $("#path_message_height").html(cameraDistance.toFixed(2)+"米");

                    if(!airLineEntity.startTime){
                    	airLineEntity.startTime = time;
                    }else{
                    	if(airLineEntity.startTime != time){
                    		//计算已飞行时间
                    		var timeConsume = Math.round(time.secondsOfDay-airLineEntity.startTime.secondsOfDay);
                    		var timeResult;
                    		if(timeConsume<60){
                    			timeResult = timeConsume +"秒";
                    			$("#path_message_duration").html(timeResult);
                        	}else{
                        		timeResult = Math.floor(timeConsume/60) + "分" + (timeConsume-Math.floor(timeConsume/60)*60) + "秒";
                        		$("#path_message_duration").html(timeResult);
                        	}
                    		//为保证已飞行长度精确性，计算飞行精确时间
                    		var _durationArray = [];
                        	for(var i=0;i<airLineEntity.posOptions.distanceArray.length;i++){
                        		var _duration = airLineEntity.posOptions.distanceArray[i]/airLineEntity.posOptions.pathPointSpeedArray[i]*3.6;
                        		_durationArray.push(_duration);
                        	}
                        	_durationArray.unshift(0);
                    		//计算已飞行长度
                    		var duration = [];
                    		var durationSum = 0;
                    		for(var i=1; i<_durationArray.length; i++){
                    			durationSum = durationSum + _durationArray[i];
                    			duration.push(durationSum);
                    		}
                    		var accurateTimeConsume = time.secondsOfDay-airLineEntity.startTime.secondsOfDay;
                    		var section;
                    		for(var j=0; j<duration.length; j++){
                    			if(accurateTimeConsume<duration[j]){
                    				section = j;
                    				break;
                    			}
                    		}
                    		var distanceConsume = 0;
                    		var pastTime = 0;
                    		for(var i=0; i<_durationArray.length; i++){
                    			var lastTime;
                    			if(i > section){
                    				break;
                    			}else if(i < section){
         							distanceConsume += duration[i]*airLineEntity.posOptions.pathPointSpeedArray[i]*1000/3600;
         							pastTime += duration[i];
             					}else if(i == section){
             						lastTime = accurateTimeConsume - pastTime;
             						distanceConsume += lastTime*airLineEntity.posOptions.pathPointSpeedArray[i]*1000/3600;
             					}
            				}
                    		distanceConsume = Math.floor(distanceConsume);
                    		var distanceResult;
                    		if(distanceConsume>1000){
                    			distanceResult = distanceConsume/1000 +"千米";
                        	}else{
                        		distanceResult = distanceConsume + "米";
                        	}
                    	    //已飞行长度
                    	  	$("#path_message_distance").html(distanceResult);
                    	}
                    }
            	}
            }
	  	}
	  	this.viewer.scene.postRender.addEventListener(viewer.fly.panelOption);
    };

    //填充飞行数据
    function putParameterPanelData(posOptions,flyOptions){
    	//填充路线站点数据
        putPointsData(posOptions);
        //填充路线站点数据
        putFlyData(flyOptions);
    };

    //填充路线坐标信息
    function putPointsData(posOptions){
    	var array = posOptions.pathPointPositionArray;
    	var pointItem;
    	//清除坐标参数面板数据
    	$(".path_point_content").children().remove();
    	var pathPointNumber = array.length/3;
    	for(var i=0; i<pathPointNumber; i++){
    		var pointItem = "";
    		pointItem += '<div class="path_point_item"><div class="path_point_name"><i class="arrow active"></i><span>' + posOptions.pathPointNameArray[i] + '</span><i class="delete"></i><i class="rename"></i></div>';
    		pointItem += '<div class="path_point_attr active"><table><tbody>';
    		pointItem += '<tr><td class="nametd">经度：</td><td><input type="number" class="mp_input plot_latlngs" data-type="jd" data-index="0" value="'+array[i*3].toFixed(6)+'"></td></tr>';
    		pointItem += '<tr><td class="nametd">纬度：</td><td><input type="number" class="mp_input plot_latlngs" data-type="wd" data-index="0" value="'+array[i*3+1].toFixed(6)+'"></td></tr>';
    		pointItem += '<tr><td class="nametd">高程(m)：</td><td><input type="number" class="mp_input plot_latlngs" data-type="height" data-index="0" value="'+array[i*3+2].toFixed(6)+'"></td></tr>';
    		if(i<pathPointNumber-1){
    			pointItem += '<tr><td class="nametd">航速(km/h)：</td><td><input type="number" class="mp_input plot_speeds" title="第1点至第2点之间航速" data-type="speed" data-index="0" value="100"></td></tr>';
    		}
    		pointItem += '</tbody></table></div></div>';
    		$(".path_point_content").append(pointItem);
    	}
    }

    //填充路线飞行信息
    function putFlyData(flyOptions){
    	$("#path_name_input").val(flyOptions.pathName);
    	$("#path_viewing_angle_select").val(flyOptions.visualMode);
    	$("#path_model_select").val(flyOptions.modelType);
    	$("#path_viewing_angle_height_input").val(flyOptions.visualHeight);
    	if(flyOptions.showPath == "1"){
    		$("input[name='path_show_path_input']").get(0).checked=true;
    	}else{
    		$("input[name='path_show_path_input']").get(1).checked=true;
    	}
    	if(flyOptions.showPointMessage == "1"){
    		$("input[name='path_show_pointMessage_input']").get(0).checked=true;
    	}else{
    		$("input[name='path_show_pointMessage_input']").get(1).checked=true;
    	}
		if(flyOptions.showFlyMessage == "1"){
			$("input[name='path_show_flyMessage_input']").get(0).checked=true;
    	}else{
    		$("input[name='path_show_flyMessage_input']").get(1).checked=true;
    	}
		if(flyOptions.shouldLoop == "1"){
			$("input[name='path_loop_fly_input']").get(0).checked=true;
		}else{
			$("input[name='path_loop_fly_input']").get(1).checked=true;
		}
		$("#path_note_input").val(flyOptions.note);
    }

    //填充站点信息参数
    function putPathPointParameter(array){
    	var pointItem;
    	//清除坐标参数面板数据
    	$(".path_point_content").children().remove();
    	var pathPointNumber = array.length/3;
    	for(var i=0; i<pathPointNumber; i++){
    		var pointItem = "";
    		pointItem += '<div class="path_point_item"><div class="path_point_name"><i class="arrow active"></i><span>第'+(i+1)+'点</span><i class="delete"></i><i class="rename"></i></div>';
    		pointItem += '<div class="path_point_attr active"><table><tbody>';
    		pointItem += '<tr><td class="nametd">经度：</td><td><input type="number" class="mp_input plot_latlngs" data-type="jd" data-index="0" value="'+array[i*3].toFixed(6)+'"></td></tr>';
    		pointItem += '<tr><td class="nametd">纬度：</td><td><input type="number" class="mp_input plot_latlngs" data-type="wd" data-index="0" value="'+array[i*3+1].toFixed(6)+'"></td></tr>';
    		pointItem += '<tr><td class="nametd">高程(m)：</td><td><input type="number" class="mp_input plot_latlngs" data-type="height" data-index="0" value="'+array[i*3+2].toFixed(6)+'"></td></tr>';
    		if(i<pathPointNumber-1){
    			pointItem += '<tr><td class="nametd">航速(km/h)：</td><td><input type="number" class="mp_input plot_speeds" title="第1点至第2点之间航速" data-type="speed" data-index="0" value="100"></td></tr>';
    		}
    		pointItem += '</tbody></table></div></div>';
    		$(".path_point_content").append(pointItem);
    	}
    }
    //获取站点之间的飞行距离
    function calculateDistanceFromPoints(pathPointPositionArray){
    	var tempArray = Cesium.Cartesian3.fromDegreesArrayHeights(pathPointPositionArray);
    	var distanceArray = [];
        var geodesic = new Cesium.EllipsoidGeodesic();
        for(var i=1;i<tempArray.length;i++){
            var startCartographic = Cesium.Cartographic.fromCartesian(tempArray[i-1]);
            var endCartographic = Cesium.Cartographic.fromCartesian(tempArray[i]);
            geodesic.setEndPoints(startCartographic, endCartographic);
            var lengthInMeters = Math.round(geodesic.surfaceDistance);
            distanceArray.push(lengthInMeters);
        }
        return distanceArray;
    }
    //获取站点之间的飞行时间
    function calculateDurationFromPoints(distanceArray,pathPointSpeedArray){
    	var durationArray = [];
    	for(var i=0;i<distanceArray.length;i++){
    		var duration = distanceArray[i]/pathPointSpeedArray[i]*3.6;
    		durationArray.push(Math.round(duration));
    	}
        return durationArray;
    }
    //显示路线
	function showPath(flyOptions,viewer){
		var fly_path;
		for(var i=0; i<viewer.scene.primitives.length; i++){
			if(viewer.scene.primitives._primitives[i].name == "fly_path"){
				fly_path = viewer.scene.primitives._primitives[i]._polylines[0];
				break;
			}
		}
		switch(flyOptions.showPath){
			case "1" : fly_path.show = true;
			break;
			case "2" : fly_path.show = false;
			break;
		}
	}
    //路线飞行
    function flyPath(posOptions,flyOptions,viewer){
    	var that = this;
    	var flyModel;
    	switch(flyOptions.modelType){
    	  case "1" : flyModel= '../../images/Cesium_Air.glb';
    	  break;
    	  case "2" : flyModel = '../../images/Cesium_Ground.glb';
    	  break;
    	  case "3" : flyModel = '../../images/Cesium_Man.glb';
    	  break;
    	  case "4" : flyModel = '../../images/Cesium_Balloon.glb';
    	  break;
    	  case "5" : flyModel = null;
    	  break;
    	}

    	var durationArray = posOptions.durationArray;
    	var totalDuration = 0;
    	for(var i=0; i<durationArray.length; i++){
    		totalDuration += durationArray[i];
    	}
    	var start = Cesium.JulianDate.now();
        var stop = Cesium.JulianDate.addSeconds(start, totalDuration, new Cesium.JulianDate());

    	//设置时钟时间
        viewer.clock.startTime = start.clone();
        viewer.clock.stopTime = stop.clone();
        viewer.clock.currentTime = start.clone();
    	switch(flyOptions.shouldLoop){
    	  case "1" : viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //循环漫游
    	  break;
    	  case "2" : viewer.clock.clockRange = Cesium.ClockRange.UNBOUNDED;
    	  break;
    	}

    	//是否显示站点信息
    	var showPointMessage,flyPointLabels;
    	switch(flyOptions.showPointMessage){
	  	   case "1" : showPointMessage = true;
	  	   break;
	  	   case "2" : showPointMessage = false;
	  	   break;
	  	}
    	for(var i=0; i<viewer.scene.primitives.length; i++){
			if(viewer.scene.primitives._primitives[i].name == "fly_points_label"){
				flyPointLabels = viewer.scene.primitives._primitives[i]._labels;
				for(var j=0; j<viewer.scene.primitives._primitives[i]._labels.length; j++){
					viewer.scene.primitives._primitives[i]._labels[j].show = showPointMessage;
				}
				break;
			}
		}

    	//是否显示飞行信息
    	var showFlyMessage;
    	switch(flyOptions.showFlyMessage){
	  	   case "1" : showFlyMessage = true;
	  	   break;
	  	   case "2" : showFlyMessage = false;
	  	   break;
	  	}

        viewer.clock.canAnimate = true;
        var tempArray = Cesium.Cartesian3.fromDegreesArrayHeights(posOptions.pathPointPositionArray);
        durationArray.unshift(0);

        function computeCirclularFlight() {
            var property = new Cesium.SampledPositionProperty();
            var startTime = start;
            for (var i=0; i<tempArray.length; i++) {
                var time = Cesium.JulianDate.addSeconds(startTime, durationArray[i], new Cesium.JulianDate());
                var position = tempArray[i];
                property.addSample(time, position);
                startTime = time;
            }
            return property;
        }

        var endCartographic = new Cesium.Cartographic();
        //计算高度
        function getHeight(time, result) {
        	var currentPosition,ellipsoid,poiCartographic,poiElevation,cameraCartographic,cameraHeight;
        	var cameraDistance;
        	currentPosition = airLine.position.getValue(time, result);
        	ellipsoid = viewer.scene.globe.ellipsoid;
            cameraCartographic = ellipsoid.cartesianToCartographic(currentPosition);
            //视角高度
            cameraHeight = cameraCartographic.height;
            //当前点位的高度
            poiElevation = viewer.scene.globe.getHeight(cameraCartographic);
            cameraDistance = cameraHeight - poiElevation;
            return pathName + "\n漫游高度：" + cameraHeight.toFixed(2) + "(m)" + "\n离地距离：" + cameraDistance.toFixed(2) + "(m)";
        }

        //计算实体位置属性
        var __position = computeCirclularFlight();
        //机身模型的偏移参数
        var hpRoll = new Cesium.HeadingPitchRoll();
        //飞机位置
        var position = tempArray[0];
        //生成一个由两个参考系生成的矩阵
        var fixedFrameTransform = Cesium.Transforms.localFrameToFixedFrameGenerator('north', 'west');
        var isConstant = false;

        if(flyOptions.pathName == ""){
            //获取路线名称，为空时用当前时间表示
            var nowDate = new Date();
            var months,dates,hours,minutes,seconds,milliseconds;
            var pathName;
            months = nowDate.getMonth()+1;
            if(nowDate.getMonth()+1 < 10){
            	months = "0" + months.toString();
            }else{
            	months = months.toString();
            }
            if(nowDate.getDate() < 10){
            	dates = "0" + nowDate.getDate().toString();
            }else{
            	dates = nowDate.getDate().toString();
            }
            if(nowDate.getHours() < 10){
            	hours = "0" + nowDate.getHours().toString();
            }else{
            	hours = nowDate.getHours().toString();
            }
            if(nowDate.getMinutes() < 10){
            	minutes = "0" + nowDate.getMinutes().toString();
            }else{
            	minutes = nowDate.getMinutes().toString();
            }
            if(nowDate.getSeconds() < 10){
            	seconds = "0" + nowDate.getSeconds().toString();
            }else{
            	seconds = nowDate.getSeconds().toString();
            }
        	pathName = "路线" + months + dates + hours + minutes + seconds;
        	$("#path_name_input").val(pathName);
            flyOptions.pathName = pathName;
        }else{
        	pathName = flyOptions.pathName;
        }

        var airLine = viewer.entities.add({
        	name: "airLine",
            availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
                start : start,
                stop : stop
            })]),
            position: __position,
            orientation : new Cesium.VelocityOrientationProperty(__position),
            model: {
                uri : flyModel,
                modelMatrix : Cesium.Transforms.headingPitchRollToFixedFrame(position, hpRoll, Cesium.Ellipsoid.WGS84, fixedFrameTransform),
                minimumPixelSize :  64
            },
            label: {
                text : new Cesium.CallbackProperty(getHeight, isConstant),
                font : '12px Helvetica',
                show : showFlyMessage,
                showBackground : false,
                fillColor : Cesium.Color.WHITE,
                outlineColor : Cesium.Color.BLACK,
                outlineWidth : 2,
                style : Cesium.LabelStyle.FILL_AND_OUTLINE,
                pixelOffset : new Cesium.Cartesian2(100, 0)
            }
        });

        airLine.posOptions = posOptions;
        airLine.flyOptions = flyOptions;

        if(flyOptions.visualMode == "1" || flyOptions.visualMode == "2"){
            //实时监听模型位置，并根据模型位置旋转相机
            //计算方位角
            var point=[],bearing=[],initialHeading=[],differentBearing=[],reduceBearing=[];
            var pointArray=[];
            for(var i=0;i<posOptions.pathPointPositionArray.length/3;i++){
            	var combination=[]
            	combination.push(posOptions.pathPointPositionArray[3*i]);
            	combination.push(posOptions.pathPointPositionArray[3*i+1]);
            	combination.push(posOptions.pathPointPositionArray[3*i+2]);
            	pointArray.push(combination);
            }
            for(var i=0;i<pointArray.length;i++){
                point.push(turf.point(pointArray[i]));
            }
            for(var j=0;j<point.length-1;j++){
                bearing.push(turf.bearing(point[j], point[j+1]));
            }

            for(var i=0;i<bearing.length;i++){
                initialHeading.push(Cesium.Math.toRadians(bearing[i]))
            }
            for(var k=0;k<bearing.length-1;k++){
                if(bearing[k+1]-bearing[k]<-180){
                    differentBearing.push(Cesium.Math.toRadians(360+(bearing[k+1]-bearing[k])));
                    reduceBearing.push(Cesium.Math.toRadians(360+(bearing[k+1]-bearing[k])))
                }else{
                    if(bearing[k+1]-bearing[k]>180){
                        differentBearing.push(Cesium.Math.toRadians((bearing[k+1]-bearing[k])-360));
                        reduceBearing.push(Cesium.Math.toRadians(Math.abs((bearing[k+1]-bearing[k])-360)))
                    }else{
                        differentBearing.push(Cesium.Math.toRadians(bearing[k+1]-bearing[k]));
                        reduceBearing.push(Cesium.Math.toRadians(Math.abs(bearing[k+1]-bearing[k])))
                    }
                }
            }
            var HorizontalRadian=0;
            var VerticalRadians=0;
            if(flyOptions.visualMode == "1"){//上帝视角，角度垂直
            	VerticalRadians = -1.57;
            }
            var i=0;
            viewer.fly.flyOption=function(scene,time){
            	//取得飞机模型
            	var flyPrimitive;
            	for(var j=0; j<viewer.scene.primitives._primitives.length; j++){
            		if(viewer.scene.primitives._primitives[j] instanceof Cesium.Model){
            			flyPrimitive = viewer.scene.primitives._primitives[j];
            			break;
            		}
            	}
                //计算模型的实时坐标
				var cartesian3 = undefined
				if(flyPrimitive)
                 cartesian3 = airLine.position.getValue(viewer.clock.currentTime);
                if(cartesian3==undefined){
                    viewer.clock.multiplier =0;
                    viewer.scene.postRender.removeEventListener(viewer.fly.flyOption);
                }else{
	                flyPrimitive.readyPromise.then(function(plane){
	                	var ellipsoid = viewer.scene.globe.ellipsoid;
	                	var cartographic = ellipsoid.cartesianToCartographic(cartesian3);
	                    var lat = Math.floor(Cesium.Math.toDegrees(cartographic.latitude) * 100000) / 100000;
	                    var lng = Math.floor(Cesium.Math.toDegrees(cartographic.longitude) * 100000) / 100000;
	                    var height = Math.floor(cartographic.height * 100000) / 100000;
	                    var dist=turf.distance(turf.point(pointArray[i+1]),turf.point([lng,lat,0]))*1000;

	                    if((Math.abs(lng-pointArray[pointArray.length-1][0])<=0.00005&&Math.abs(lat-pointArray[pointArray.length-1][1])<=0.00005)){
	                        viewer.clock.multiplier =0;
	                        viewer.scene.postRender.removeEventListener(viewer.fly.flyOption);
	                    }

	                    var deltaHeight;
	                    deltaHeight = parseInt(flyOptions.visualHeight);
	                    if(dist<=5){
	                    		var tempCartographic;
	                    		tempCartographic = ellipsoid.cartesianToCartographic(tempArray[i+1]);
	                            viewer.camera.setView({
	                                destination: Cesium.Cartesian3.fromDegrees(Cesium.Math.toDegrees(tempCartographic.longitude), Cesium.Math.toDegrees(tempCartographic.latitude), deltaHeight),
	                                orientation: {
	                                    heading: initialHeading[i]+HorizontalRadian,
	                                    pitch: Cesium.Math.toRadians(0.0) + VerticalRadians,
	                                    roll: 0
	                                }
	                            });

	                            viewer.clock.multiplier =0;
	                            if(i<reduceBearing.length){
	                                if(reduceBearing[i]<0.00001){
	                                    HorizontalRadian=0;
	                                    i+=1;
	                                    viewer.clock.multiplierVal ? viewer.clock.multiplier=parseInt(viewer.clock.multiplierVal) : viewer.clock.multiplier = 1;
	                                }else{
	                                    HorizontalRadian+=differentBearing[i]/200;
	                                    reduceBearing[i]-=Math.abs(differentBearing[i]/200);
	                                }
	                            }
	                    }else{
	                        viewer.camera.setView({
	                            destination: Cesium.Cartesian3.fromDegrees(Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude), deltaHeight),
	                            orientation: {
	                                heading: initialHeading[i],
	                                pitch: Cesium.Math.toRadians(0.0) + VerticalRadians,
	                                roll: 0
	                            }
	                        });
	                        viewer.clock.multiplierVal ? viewer.clock.multiplier=parseInt(viewer.clock.multiplierVal) : viewer.clock.multiplier = 1;
	                    }
	                });
            	}
            }
            viewer.scene.postRender.addEventListener(viewer.fly.flyOption);
        }else if(flyOptions.visualMode == "3"){//跟随视角
        	viewer.fly.flyOption=function (scene,time,result){
	        	//取得飞机模型
	        	var flyPrimitive;
	        	for(var j=0; j<viewer.scene.primitives._primitives.length; j++){
	        		if(viewer.scene.primitives._primitives[j] instanceof Cesium.Model){
	        			flyPrimitive = viewer.scene.primitives._primitives[j];
	        			break;
	        		}
	        	}
	        	var cartesian3 = airLine.position.getValue(time);
                if(cartesian3==undefined){
                    viewer.clock.multiplier =0;
                    viewer.scene.postRender.removeEventListener(viewer.fly.flyOption);
                }else{
                	flyPrimitive.readyPromise.then(function(plane){
                		viewer.clock.multiplierVal ? viewer.clock.multiplier=parseInt(viewer.clock.multiplierVal) : viewer.clock.multiplier = 1;
    	            	viewer.trackedEntity = airLine;
    	        	});
                }
        	}
        	viewer.scene.postRender.addEventListener(viewer.fly.flyOption);
        }else if(flyOptions.visualMode == "4"){//无视角
        	viewer.clock.multiplierVal ? viewer.clock.multiplier=parseInt(viewer.clock.multiplierVal) : viewer.clock.multiplier = 1;
        	viewer.trackedEntity = undefined;
        }
        return flyOptions;
    }

    //生成站点
    function createPathPoint(primitives,array){
        var points = primitives.add(new Cesium.PointPrimitiveCollection());
        points.name = "fly_points";
        for(var i=0; i<array.length; i++){
            points.add({
            	position : array[i],
                pixelSize : 5,
                color : Cesium.Color.TRANSPARENT,
                outlineColor : Cesium.Color.ALICEBLUE,
                outlineWidth : 3
            });
        }
    };
    //生成站点label
    function createPathPointLabel(primitives,array,viewer){
    	var labels = primitives.add(new Cesium.LabelCollection());
        labels.name = "fly_points_label";
        var polylinePrimitive;
        for(var i=0;i<primitives._primitives.length; i++){
        	if(primitives._primitives[i] instanceof Cesium.PolylineCollection){
        		polylinePrimitive = primitives._primitives[i];
        		break;
        	}
        }
        for(var i=0; i<array.length; i++){
        	var pointContent = "";
    		var cartographic = Cesium.Cartographic.fromCartesian(array[i]);
            var lng = Cesium.Math.toDegrees(cartographic.longitude);
            var lat = Cesium.Math.toDegrees(cartographic.latitude);
            var height = cartographic.height;
        	if(polylinePrimitive.pathName){
        		var path;
        		for(var j=0;j<viewer.fly.paths.length; j++){
        			if(polylinePrimitive.pathName == viewer.fly.paths[j].name){
        				path = viewer.fly.paths[j];
        				break;
        			}
        		}
            	pointContent += path.pathOptions.posOptions.pathPointNameArray[i];
            	pointContent += '\n' + '经度：'+ lng.toFixed(6) + '    纬度：'+ lat.toFixed(6);
            	pointContent += '\n' + '高程：'+ height.toFixed(6) + '(m)';
        		if(path.pathOptions.posOptions.pathPointSpeedArray[i]){
        			pointContent += '\n' + '至下一站航速：'+ path.pathOptions.posOptions.pathPointSpeedArray[i] + '(km/h)';
        		}
        	}else{
            	pointContent += $($(".path_point_item span")[i]).html();
            	pointContent += '\n' + '经度：'+ lng.toFixed(6) + '    纬度：'+ lat.toFixed(6);
            	pointContent += '\n' + '高程：'+ height.toFixed(6) + '(m)';
            	if($($(".path_point_attr .plot_speeds")[i+1]).val() != undefined){
            		pointContent += '\n' + '至下一站航速：'+ $($(".path_point_attr .plot_speeds")[i]).val() + '(km/h)';
            	}
        	}

            labels.add({
                text : pointContent,
                font : '12px Helvetica',
                show : false,
                showBackground : true,
                fillColor : Cesium.Color.SKYBLUE,
                outlineColor : Cesium.Color.BLACK,
                outlineWidth : 2,
                style : Cesium.LabelStyle.FILL_AND_OUTLINE,
                pixelOffset : new Cesium.Cartesian2(5, -5)
            });
            labels.get(labels.length-1).position = array[i];
        }
    }
    //清除坐标参数面板与飞行参数面板数据
    function clearPosAndFlyPanel(){
    	//清除坐标参数面板数据
    	$(".path_point_content").children().remove();
    	//清除飞行参数面板数据并复原
    	$("#path_name_input").val("");
    	$("#path_viewing_angle_select").val("1");
    	$("#path_model_select").val("1");
    	$("#path_viewing_angle_height_input").val("500");
    	$("input[name='path_show_path_input']").get(0).checked=true;
    	$("input[name='path_show_pointMessage_input']").get(0).checked=true;
    	$("input[name='path_show_flyMessage_input']").get(0).checked=true;
    	$("input[name='path_loop_fly_input']").get(1).checked=true;
    	$("#path_note_input").val("");
    }
    //清除飞行
    function clearAirline(viewer){
    	var airlineEntity;
    	//清除飞行进程
    	for(var i=0; i<viewer.entities.values.length; i++){
    		if(viewer.entities.values[i].availability instanceof Cesium.TimeIntervalCollection){
    			airlineEntity = viewer.entities.values[i];
    			viewer.entities.remove(airlineEntity);
    			break;
    		}
    	}
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
