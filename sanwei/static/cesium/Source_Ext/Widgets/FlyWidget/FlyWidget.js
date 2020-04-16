/**
 * Class: Cesium.FlyWidget
 * 三维地图飞行浏览视图插件类
 * description: 飞行浏览操作的视图插件(View层)
 */
(function(Cesium){
    "use strict";

    /**
     * Constructor: Cesium.FlyWidget
     *
     * Parameters:
     * map3d - {Cesium.Map} 3D map3d Object
     *
     */
    var FlyWidget = Cesium.FlyWidget = function(map3d,options){
        //创建飞行
    	map3d.fly = new Cesium.Fly(map3d);
    	//自定义飞行浏览按钮
        if(Cesium.defined(options)){
            if(Cesium.defined(options.trigDiv)){
                if($(options.trigDiv)){
                    $("#"+options.trigDiv).addClass("fly-widget-show");
                }else{
                    showFlyWidget(map3d);
                    console('trigDiv does not exist!');
                }
            }else{
            	showFlyWidget(map3d);
                console('trigDiv id not defined!');
            }
            //未定义图层管理按钮，自动弹出
        }else{
        	showFlyWidget(map3d);
        }

        /*******节点操作监听开始*******/
        //点击dom后显示图层管理widget
        $(".fly-widget-show").on("click",$.proxy(showFlyWidget,this,map3d));
    };

    //显示飞行浏览插件
    function showFlyWidget(map3d){
    	var that = this;

    	addPanelContent();
    	this.map3d = map3d;
    	//设置不同分辨率高度
    	var height = "680px";
    	// if(600 < $(".g-map").height() && $(".g-map").height()< 750){
    	// 	height = "580px";
    	// }else if($(".g-map").height()< 600){
    	// 	height = "480px";
    	// }

        var flylayerindex = layer.open({
        	type: 1,
        	shade: 0,
        	title: '飞行浏览',
        	id: 'md-3dFlyPanel',
        	content: $('#flyPanelContent3d'),
        	fixed: false,
        	moveOut: true,
        	skin: 'demo-class',
        	offset: ['60px','3px'],
        	area: ['280px',height],
			cancel: function(){
				$("#md-3dFlyPanel").css("display","none");
				$(".tools .fly").removeClass("active")
			}
        });
        $("#flyPanelContent3d").removeClass("f-dn");
        //激活飞行漫游列表滚动条
      	$("#content2").mCustomScrollbar({
			 scrollButtons:{
		   	 enable:true
		     },
			 theme:"minimal-dark",
	    });
      	//打开钻地
      	map3d.scene.screenSpaceCameraController.minimumZoomDistance = 1;

      	//切换tab页
        $(".fly_tab_title h2").on("click",function(){
            var tabs = document.getElementsByClassName('fly_tab_title')[0].getElementsByTagName('h2'),
            contents = document.getElementsByClassName('fly_tab_page')[0].getElementsByClassName('panel');

            for(var i = 0, len = tabs.length; i < len; i++) {
                if(tabs[i] === this) {
                	$(tabs[i]).addClass('selected');
                	$(contents[i]).addClass('selected');
                } else {
                	$(tabs[i]).removeClass('selected');
                	$(contents[i]).removeClass('selected');
                }
            }
        });

        $("#path_viewing_angle_select").change(function(){
        	if($("#path_model").hasClass("f-dn")){
        		$("#path_model").removeClass("f-dn");
        	}
        	if($(this).val() == "1"||"2"||"3"){
        		if($("#path_viewing_angle_height").hasClass("f-dn")){
        			$("#path_viewing_angle_height").removeClass("f-dn");
        		}
        		if($(this).val() == "1"){//上帝视角
        			$("#path_viewing_angle_height_input").val("500");
            		$("#path_viewing_angle_height_input").attr("disabled",false);
            		$("#path_viewing_angle_height_input").css("background-color","unset");
        		}else if($(this).val() == "2"){//第一视角
        			$("#path_viewing_angle_height_input").val("50");
            		$("#path_viewing_angle_height_input").attr("disabled",false);
            		$("#path_viewing_angle_height_input").css("background-color","unset");
            		//第一视角隐藏模型类型
            		$("#path_model").addClass("f-dn");
            	}else if($(this).val() == "3"){//跟随视角
            		$("#path_viewing_angle_height_input").val("50");
            		$("#path_viewing_angle_height_input").attr("disabled",true);
            		$("#path_viewing_angle_height_input").css("background-color","rgba(255,255,255,0.4)");
            	}
        	}else if($(this).val() == "4"){//无视角
        		$("#path_viewing_angle_height").addClass("f-dn");
        	}
        });

        //站点显示与隐藏（包含批量修改高程）
        $(".path_point_name .arrow").on("click",function(){
            var oNextSib = $(this).parent().next();
            if($(this).hasClass("active")){
                $(this).removeClass("active");
                if (oNextSib.hasClass("path_point_attr")) {
                    oNextSib.hide();
                }
            }else{
                $(this).addClass("active");
                if (oNextSib.hasClass("path_point_attr")) {
                    oNextSib.show();
                }
            }
            return false;
        });
        //站点列表显示与隐藏
        $(".path_point_list_name .arrow").on("click",function(){
            var oNextSib = $(this).parent().next();
            if($(this).hasClass("active")){
                $(this).removeClass("active");
                if (oNextSib.hasClass("path_point_content")) {
                    oNextSib.hide();
                }
            }else{
                $(this).addClass("active");
                if (oNextSib.hasClass("path_point_content")) {
                    oNextSib.show();
                }
            }
            return false;
        });

        //线路-绘制路线
        $(document).on("click","#path_draw",$.proxy(drawFlyPath,this,map3d));
        //线路-导出路线
        $(document).on("click","#path_export",$.proxy(exportFlyPath,this,map3d));
        //线路-快速飞行路线
        $(document).on("click",".fly-start",$.proxy(quickFlyPath,this));
        //线路-编辑飞行设置
        $(document).on("click",".fly-setting",$.proxy(editFlyPath,this));
        //线路-移除路线
        $(document).on("click",".fly-delete",$.proxy(removeFlyPath,this));
        //设置相同高程
        $(document).on("keyup","#path_points_allheight",$.proxy(setPointsHeight,this));
        //增加相同高程
        $(document).on("keyup","#path_points_addheight",$.proxy(addPointsHeight,this));
        //设置相同航速
        $(document).on("keyup","#path_points_allspeed",$.proxy(setPointsSpeed,this));
        //飞行参数-飞行预览
        $(document).on("click","#operation_preview",$.proxy(previewFlyPath,this,map3d));
        //线路-保存线路
        $(document).on("click","#operation_save",$.proxy(saveFlyPath,this,map3d));
        //线路-删除路线
        $(document).on("click","#operation_delete",$.proxy(deleteFlyPath,this,map3d));

        //关闭飞行浏览面板
        $(".layui-layer-setwin").on("click",$.proxy(closeFlyPanel,this,map3d));
    };

    //绘制飞行路线
    function drawFlyPath(map3d){
    	map3d.fly.clearPath();
    	map3d.fly.drawPath();
    }

    //导出飞行路线
    function exportFlyPath(map3d){
    	var itemLen = $("#fly_path_table tbody").children().length;
        if(itemLen == 0){
            layer.open({
                anim: 4,
                skin: 'layui-layer-lan',
                area: ['400px', '160px'],
                shadeClose: true,
                title: "导出路线",
                content: '<div style="position:absolute;margin-left: 20%;margin-top: 0px;"><span>未找到可导出的路线！</span></div>',
                yes: function(index, layer0){
                    layer.close(index);
                }
            });
        }else{
        	//
        }
    }

    //快速飞行路线
    function quickFlyPath(evt){
    	this.map3d.fly.clearPath();
    	var pathName,posOptions,flyOptions;
    	pathName = $(evt.target).parent().parent().prev().html();
    	for(var i=0; i<this.map3d.fly.paths.length; i++){
    		if(this.map3d.fly.paths[i].name == pathName){
    			posOptions = this.map3d.fly.paths[i].pathOptions.posOptions;
    			flyOptions = this.map3d.fly.paths[i].pathOptions.flyOptions;
    		}
    	}
    	this.map3d.fly.createPath(posOptions,pathName);
    	this.map3d.fly.previewPath(posOptions,flyOptions);
    	showFlyMessagePanel(posOptions,flyOptions,this.map3d);
    	$("#md-3dFlyPanel").parent().addClass("f-dn");
    	$("#clearQT3d").addClass("disable");
		$("#md-3d-city").addClass("f-dn");
		$("#md-toolBar3D").addClass("f-dn");
		$("#sole-3dsearchbox-content").addClass("f-dn");
		$("#key_3dsearch_btn").addClass("f-dn");
    }

    //编辑飞行设置
    function editFlyPath(evt){
    	var pathName,posOptions,flyOptions;
    	pathName = $(evt.target).parent().parent().prev().html();
    	for(var i=0; i<this.map3d.fly.paths.length; i++){
    		if(this.map3d.fly.paths[i].name == pathName){
    			posOptions = this.map3d.fly.paths[i].pathOptions.posOptions;
    			flyOptions = this.map3d.fly.paths[i].pathOptions.flyOptions;
    		}
    	}
    	this.map3d.fly.createPath(posOptions,pathName);
    	this.map3d.fly.openParameterPanel(posOptions,flyOptions);
    	//保存编辑名(id)到本地缓存
    	 localStorage.setItem('3dFly', JSON.stringify(pathName));
    }

    //删除飞行设置
    function removeFlyPath(evt){
    	var pathName,posOptions,flyOptions;
    	pathName = $(evt.target).parent().parent().prev().html();
    	for(var i=0; i<this.map3d.fly.paths.length; i++){
    		if(this.map3d.fly.paths[i].name == pathName){
    			this.map3d.fly.paths.splice(i,1);
    			break;
    		}
    	}
    	var pathItem = $(evt.target).parent().parent().parent()[0];
    	var pathTbody = $("#fly_path_table tbody")[0];
    	pathTbody.removeChild(pathItem);
    }

    //预览飞行线路
    function previewFlyPath(map3d){
    	var posOptions,flyOptions;
    	posOptions = getPosParams();
    	flyOptions = getFlyParams();
    	map3d.fly.previewPath(posOptions,flyOptions);
    	showFlyMessagePanel(posOptions,flyOptions,map3d);
    	$("#md-3dFlyPanel").parent().addClass("f-dn");
    	$("#clearQT3d").addClass("disable");
    	$("#md-3d-city").addClass("f-dn");
		$("#md-toolBar3D").addClass("f-dn");
		$("#sole-3dsearchbox-content").addClass("f-dn");
		$("#key_3dsearch_btn").addClass("f-dn");
    }

    //保存线路
    function saveFlyPath(map3d){
    	var posOptions,flyOptions;
    	posOptions = getPosParams();
    	flyOptions = getFlyParams();
    	map3d.fly.savePath(posOptions,flyOptions);

    	//编辑原先的数据 删除原先的飞行数据
    	if($("#operation_save").hasClass("editFly")){
    		var nameObjet =$("#fly_path_table tbody tr").find("td:first");
    		 var flyname = JSON.parse(localStorage.getItem('3dFly'));
    		for(var j=0; j<this.map3d.fly.paths.length;j++){
        		if(this.map3d.fly.paths[j].name == flyname){
        			this.map3d.fly.paths.splice(j,1);
        			break;
        		}
        	}
    		for(var i=0; i<$("#fly_path_table tbody tr").length; i++){
    			if(nameObjet[i].innerHTML == flyname){
    				var pathItem = $("#fly_path_table tbody tr")[i];
    				var pathTbody = $("#fly_path_table tbody")[0];
    				pathTbody.removeChild(pathItem);
    				break;
    			}
    		}
    	}
    }

    //删除路线
    function deleteFlyPath(map3d){
		layer.confirm('您确定要删除吗?',{btn:['确定','取消'],title:"提示"},function(){
			
			map3d.fly.clearPanel();
			map3d.fly.clearPath();

			//编辑原先的数据 删除原先的飞行数据
			if($("#operation_save").hasClass("editFly")){
				var nameObjet =$("#fly_path_table tbody tr").find("td:first");
				 var flyname = JSON.parse(localStorage.getItem('3dFly'));
				for(var j=0; j<this.map3d.fly.paths.length;j++){
					if(this.map3d.fly.paths[j].name == flyname){
						this.map3d.fly.paths.splice(j,1);
						break;
					}
				}
				for(var i=0; i<$("#fly_path_table tbody tr").length; i++){
					if(nameObjet[i].innerHTML == flyname){
						var pathItem = $("#fly_path_table tbody tr")[i];
						var pathTbody = $("#fly_path_table tbody")[0];
						pathTbody.removeChild(pathItem);
						break;
					}
				}
			}
			layer.msg('删除成功!',{icon:1});
		});
		
    }

    //设置相同高程
    function setPointsHeight(evt){
    	var pointNumber = $(".path_point_attr .plot_latlngs").length/3;
    	for(var i=0; i<pointNumber; i++){
    		var allHeight = $(evt.target).val();
    		$($(".path_point_attr .plot_latlngs")[3*i+2]).val(allHeight);
    	}
    }

    //添加相同高程
    function addPointsHeight(evt){
    	var stayHeight = [];
    	var pointNumber = $(".path_point_attr .plot_latlngs").length/3;
    	for(var j=0; j<pointNumber; j++){
    		stayHeight.push(parseFloat($($(".path_point_attr .plot_latlngs")[3*j+2]).val()));
    	}
    	for(var i=0; i<pointNumber; i++){
    		//var currentHeight = parseFloat($($(".path_point_attr .plot_latlngs")[3*i+2]).val());
    		var addHeight = parseFloat($(evt.target).val());
    		var height = stayHeight + addHeight;
    		$($(".path_point_attr .plot_latlngs")[3*i+2]).val(height.toString());
    	}
    }

    //设置相同航速
    function setPointsSpeed(evt){
    	var itemNumber = $(".path_point_attr .plot_speeds").length;
    	for(var i=0; i<itemNumber; i++){
    		var allSpeed = $(evt.target).val();
    		$($(".path_point_attr .plot_speeds")[i]).val(allSpeed);
    	}

    }

    //获取坐标参数
    function getPosParams(){
    	var pathPointPositionArray = [];
    	var pathPointSpeedArray = [];
    	var pointArray = $(".path_point_content").children();
    	for(var i=0; i<pointArray.length; i++){
    		var pointInputValue = pointArray[i].getElementsByTagName("input");
    		if(i<pointArray.length-1){
        		for(var j=0; j<pointInputValue.length-1; j++){
    				pathPointPositionArray.push(parseFloat(pointInputValue[j].value));
        		}
    			pathPointSpeedArray.push(parseFloat(pointInputValue[3].value));
    		}else{
        		for(var j=0; j<pointInputValue.length; j++){
    				pathPointPositionArray.push(parseFloat(pointInputValue[j].value));
        		}
    		}
    	}
    	var options = {
			pathPointPositionArray : pathPointPositionArray,
			pathPointSpeedArray : pathPointSpeedArray
    	}
    	return options;
    }

    //获取飞行参数
    function getFlyParams(){
    	var pathName,modelType,visualMode,visualHeight,showPath,showMark,shouldLoop;
    	var options = {
			pathName : $("#path_name_input").val(),
			visualMode : $("#path_viewing_angle_select").val(),
	    	modelType : $("#path_model_select").val(),
	    	//visualDistance : $("#path_viewing_angle_distance_input").val(),
	    	visualHeight : $("#path_viewing_angle_height_input").val(),
	    	showPath : $("input[name='path_show_path_input']:checked").val(),
	    	showPointMessage : $("input[name='path_show_pointMessage_input']:checked").val(),
	    	showFlyMessage : $("input[name='path_show_flyMessage_input']:checked").val(),
	    	shouldLoop : $("input[name='path_loop_fly_input']:checked").val(),
	    	note : $("#path_note_input").val()
    	}
    	return options;
    }

    //显示飞行信息面板
	function showFlyMessagePanel(posOptions,flyOptions,map3d){
		addMessagePanelContent();

		var layerTopDistance,layerRightDistance;
		layerTopDistance = document.body.clientHeigh-650;
		layerRightDistance = document.body.clientWidth-335;

		var messagelayerindex = layer.open({
        	type: 1,
        	shade: 0,
        	title: '浏览路线',
        	id: 'md-3dFlyMessagePanel',
        	content: $('#flyMessageContent3d'),
        	fixed: false,
        	moveOut: true,
        	closeBtn: 0,
        	skin: 'demo-class',
        	offset: [parseInt(layerTopDistance),parseInt(layerRightDistance)],
        	area: ['220px','421px']
        });
        $("#flyMessageContent3d").removeClass("f-dn");

        //填充飞行信息
        map3d.fly.putMessageToPanel(posOptions,flyOptions,map3d);

        //后退飞行
        $(document).on("click","#operation_backward",$.proxy(backwardFlyPath,this,map3d));
        //暂停飞行
        $(document).on("click","#operation_pause",$.proxy(pauseFlyPath,this,map3d));
        //继续飞行
        $(document).on("click","#operation_continue",$.proxy(continueFlyPath,this,map3d));

        $(".path_message_control botton").on("click",function(){
        	$(this).parent().children().removeClass("active");
        	$(this).addClass("active");
        });

        $("#path_stop").on("click",function(){
        	layer.close(messagelayerindex);
        	$("#md-3dFlyPanel").parent().removeClass("f-dn");
        	map3d.fly.stopPath();
        	$("#clearQT3d").removeClass("disable");
        	$("#md-3d-city").removeClass("f-dn");
    		$("#md-toolBar3D").removeClass("f-dn");
    		$("#sole-3dsearchbox-content").removeClass("f-dn");
    		$("#key_3dsearch_btn").removeClass("f-dn");
        });
	}

	//读取飞行浏览路线面板数据
	function addMessagePanelContent(){
		if($("#flyMessageContent3d").children().length > 0){
            return;
        }
    	// var url = "../lib1/1.58/Cesium/Source_Ext/Widgets/FlyWidget/tmpl/flyMessagePanelTmpl.html";
    	var url = "../../lib1/1.58/Cesium/Source_Ext/Widgets/FlyWidget/tmpl/flyMessagePanelTmpl.html";
    	GeoGlobe.Request.GET({
            url: url,
            async:false,
            success: function(request){
                try {
                    if(request){
                    	var flyMessagePanelTmpl = request.responseText;
                    	$("#flyMessageContent3d").append(flyMessagePanelTmpl);
                    }
                }catch (e) {
                        console.log("service capabilities request error!");
                    }
                },
                failure: function(){
                    console.log("service capabilities request error!");
                }
    	})
	}

    //读取飞行面板数据
    function addPanelContent(){
    	if($("#flyPanelContent3d").children().length > 0){
            return;
        }
    	// var url = "../lib1/1.58/Cesium/Source_Ext/Widgets/FlyWidget/tmpl/flyPanelTmpl.html";
    	var url = "../../lib1/1.58/Cesium/Source_Ext/Widgets/FlyWidget/tmpl/flyPanelTmpl.html";
    	GeoGlobe.Request.GET({
            url: url,
            async:false,
            success: function(request){
                try {
                    if(request){
                    	var flyPanelTmpl = request.responseText;
                    	$("#flyPanelContent3d").append(flyPanelTmpl);
                    }
                }catch (e) {
                        console.log("service capabilities request error!");
                    }
                },
                failure: function(){
                    console.log("service capabilities request error!");
                }
    	})
    }

    //后退飞行
	function backwardFlyPath(map3d){
		map3d.fly.backwardPath();
	}
	//暂停飞行
	function pauseFlyPath(map3d){
		map3d.fly.pausePath();
	}
	//继续飞行
	function continueFlyPath(map3d){
		map3d.fly.continuePath();
	}

	//关闭飞行面板
	function closeFlyPanel(map3d){
		map3d.fly.clearPanel();
		map3d.fly.clearPath();
	}

})(window.Cesium);
