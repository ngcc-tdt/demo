/**
 * Class: Cesium.LayerManagerWidget
 * 三维地图图层管理视图插件类
 * description: 图层操作的视图插件
 */
(function(Cesium){
    "use strict";

    /**
     * Constructor: Cesium.LayerManagerWidget
     *
     * Parameters:
     * map - {Cesium.Map} 3D map Object
     *
     */
    var LayerManagerWidget = Cesium.LayerManagerWidget = function(map,options){
        this.layerManager = map.layerManager;
        this.showLayerManagerWidget = showLayerManagerWidget;
        //自定义图层管理按钮
        if(Cesium.defined(options)){
            if(Cesium.defined(options.trigDiv)){
                if($(options.trigDiv)){
                    $("#"+options.trigDiv).addClass("lm-widget-show");
                }else{
                    showLayerManagerWidget(map);
                    console('trigDiv does not exist!');
                }
            }else{
                showLayerManagerWidget(map);
                console('trigDiv id not defined!');
            }
            //未定义图层管理按钮，自动弹出
        }else{
            showLayerManagerWidget(map);
        }

        /*******节点操作监听开始*******/
        //点击dom后显示图层管理widget
        $(".lm-widget-show").on("click",$.proxy(showLayerManagerWidget,this,this.layerManager));

        //双击支点
        $(document).on("dblclick", ".layer-item-title", function () {
            var oNextSib = $(this).next();
            if (oNextSib.hasClass("layer-item-content")) {
                if (oNextSib.is(":hidden")) {
                    $(this).find(".arrow").removeClass("active");
                    oNextSib.show();
                } else {
                    $(this).find(".arrow").addClass("active");
                    oNextSib.hide();
                }
            }
        });

        //双击节点
        $(document).on("dblclick",".layer-item-title .arrow,.layer-item-title .checkicon",function(){
            return false;
        });
    };

    /**
     * Method: getServiceLayerGroup
     * 获取业务图层组
     *
     * Parameters:
     * popup - {[popup]} 绑定标记弹框
     *
     * returns:
     * serviceLayerGroup 业务图层组
     */
    LayerManagerWidget.prototype.getServiceLayerGroup = function(){
        return this.serviceLayerGroup;
    };

    //显示图层管理插件
    function showLayerManagerWidget(map){
        //layer.closeAll();
        readScenario(map);

        layer.open({
            type: 1,
            anim: 4,
            shade: 0,
            id: 'md-3dLayermanagerPanel',
            skin: 'layui-layer-lan',
            offset: ['60px', '21px'],
            area: ['260px', '650px'],
            title: "图层管理",
            content: $("#layermanagerPanelContent3d")
        });

        //标题变色
        $(".layui-layer-title").css('background','rgba(0,0,0,0.6)');
        //背景透明
        $(".layui-layer-lan").css('background-color','rgba(0,0,0,0)');
        //边框阴影透明
        $(".layui-layer-lan").css('box-shadow','0px 0px 0px rgba(0,0,0,0)');
        //内容最小高度
        $(".layui-layer-content").css('min-height', '610px;');
    	
        var serviceLayerGroup = this.layerManager.getServiceLayerGroup();
        serviceLayerGroup.removeAllCollections();
        for(var i=0; i<$("#mark-container .layer-item-title").length; i++){
            var entityCollection = new Cesium.EntityCollection();
            entityCollection._owner = $.trim($("#mark-container .layer-item-title")[i].innerText);
            serviceLayerGroup.addCollection(entityCollection,i);
        }

        //基础图层组排序
        loadLayerOrder();
        //添加标绘
        $("#SureProp").off("click").on("click",$.proxy(addMark,this,this.layerManager));
        //标绘图层添加监听
        $(".layer-action-expand").off("click").on("click",$.proxy(addMarkerLayer,this,this.layerManager));
        //标绘图层移除监听
        $(".layer-action-remove").off("click").on("click",$.proxy(removeMarkerLayer,this));
        //标绘图层显示和隐藏监听
        $(document).off("click").on("click",".layer-item-title .checkicon",$.proxy(showMarkerLayer,this));
        //标绘图层组定位
        $(".layer-item-content *[node-guid]").off("click").on("click",$.proxy(positionMarkerCollection,this));
        //标绘图层定位和显示属性框
        $(document).on("click",".marker-title",$.proxy(positionMarkerLayer,this));

        //所有图层单击收起箭头
        $(document).on("click",".layer-item-title .arrow",$.proxy(oneclickLayer,this));
        //所有图层双击收起箭头
        $(document).on("dblclick",".layer-item-title .arrow,.layer-item-title .checkicon",$.proxy(doubleclickLayer,this));
        //验证服务
        $(document).on("click","#checkService",$.proxy(checkService,this));

        //常规图层组中图层添加监听
        $("#layer-action-add-model").on("click",$.proxy(addModelSrv,this,this.layerManager));
        $("#layer-action-add-vector").on("click",$.proxy(addVectorSrv,this,this.layerManager));
        $("#layer-action-add-terrain").on("click",$.proxy(addTerrainSrv,this,this.layerManager));
        $("#layer-action-add-basic").on("click",$.proxy(addBasicSrv,this,this.layerManager));
        //常规图层组中图层移除监听
        $("#layer-action-delete-model").on("click",$.proxy(deleteModelSrv,this,this.layerManager));
        $("#layer-action-delete-vector").on("click",$.proxy(deleteVectorSrv,this,this.layerManager));
        $("#layer-action-delete-terrain").on("click",$.proxy(deleteTerrainSrv,this,this.layerManager));
        $("#layer-action-delete-basic").on("click",$.proxy(deleteBasicSrv,this,this.layerManager));
        //常规图层组中图层显示和隐藏
        $("#model-branch-container .layer-item-content").on("click",".checkicon",$.proxy(showHidemodel,this));
        $("#vector-branch-container .layer-item-content").on("click",".checkicon",$.proxy(showHideVector,this));
        $("#terrain-branch-container .layer-item-content").on("click",".checkicon",$.proxy(showHideTerrain,this));
        $("#imagery-branch-container .layer-item-content").on("click",".checkicon",$.proxy(showHideBasic,this));
        //常规图层组整组显示和隐藏
        $("#model-branch-container").children(":first").on("click",".checkicon",$.proxy(showHidemodelAll,this));
        $("#vector-branch-container").children(":first").on("click",".checkicon",$.proxy(showHideVectorAll,this));
        $("#terrain-branch-container").children(":first").on("click",".checkicon",$.proxy(showHideTerrainAll,this));
        $("#imagery-branch-container").children(":first").on("click",".checkicon",$.proxy(showHideBasicAll,this));
        //基础图层组上移下移监听,动态生成使用document
        $(document).on("click", ".iconup", $.proxy(raiseBasicLayer,this));
        $(document).on("click", ".icondown", $.proxy(lowerBasicLayer,this));
        //常规图层组整组点击图层镜头移动监听
        $(document).on("click","#model-branch-container .layer-item-content .layer-item-title",$.proxy(flytoModelLayer,this));
        $(document).on("click","#vector-branch-container .layer-item-content .layer-item-title",$.proxy(flytoVectorLayer,this));
        $(document).on("click","#terrain-branch-container .layer-item-content .layer-item-title",$.proxy(flytoTerrainLayer,this));
        $(document).on("click","#imagery-branch-container .layer-item-content .layer-item-title",$.proxy(flytoBasicLayer,this));

        //关闭图层管理面板
        $(".layui-layer-setwin").on("click",$.proxy(closeLayerManager,this,this.layerManager));
        //点击清除按钮关闭图层管理面板和清空地图图形
        $("#clearQT3d").on("click",$.proxy(clearAll,this,this.layerManager));
    };

    //添加标绘
    function addMark(layerManager){
        var nodeLen = $('*[node-guid]').length;
        var insertHtml = "";
        for(var i=0;i<nodeLen;i++){
            if($($('*[node-guid]')[i]).parent().attr("id") == "mark-branch-container"){//标绘一级目录
                var currentHtml = $($('*[node-guid]')[i]).html();
                currentHtml = currentHtml.replace('<i class="checkicon active"></i>','');
                currentHtml = currentHtml.replace('<i class="layer-action-expand"></i>	<i class="layer-action-remove"></i>','');
                insertHtml = insertHtml + '<div class="layer-item-title layer-tree-expand"' + currentHtml + '</div>';

            }else if($($('*[node-guid]')[i]).parent().attr("id") == "mark-container"){//标绘二级目录
                var currentHtml = $($('*[node-guid]')[i]).html();
                currentHtml = currentHtml.replace('checkicon active','checkicon');
                currentHtml = currentHtml.replace('<i class="layer-action-remove"></i>','');
                insertHtml = insertHtml + '<div class="layer-item-title layer-tree-expand tree-second-class"' + currentHtml + '</div>';

            }else if($($('*[node-guid]')[i]).parent().attr("id") && $($('*[node-guid]')[i]).parent().attr("id") != "mark-branch-container" && $($('*[node-guid]')[i]).parent().attr("id") != "mark-container"){//标绘三级及以下目录
                var currentHtml = $($('*[node-guid]')[i]).html();
                currentHtml = currentHtml.replace('checkicon active','checkicon');
                currentHtml = currentHtml.replace('<i class="layer-action-expand"></i><i class="layer-action-remove"></i>','');
                insertHtml = insertHtml + '<div class="layer-item-title layer-tree-expand tree-third-class"' + currentHtml + '</div>';
            }
        }
        //$(".lm-tree-node .layer-action-remove").css("display","none");
        layer.open({
            type: 1,
            anim: 4,
            skin: 'layui-layer-lan',
            area: ['450px', '260px'],
            title: "添加标绘",
            btn: ['确认', '取消'],
            closeBtn: 0,
            yes: function(index, layer0){
                $(".lm-tree-node .layer-action-remove").css("display","none");
                var targetDom = null;
                var checkLen = $(".lm-tree-node").children().find(".active").length;
                if(checkLen == 1){
                    var nodeName= $(".lm-tree-node").children().find(".active").parent().find("span").text();
                    for(var i=0;i<$('*[node-guid]').length;i++){
                        if($($('*[node-guid]')[i]).find("span")){
                            if($($('*[node-guid]')[i]).find("span").text() == nodeName){
                                targetDom = $('*[node-guid]')[i];
                                var markerType = i;
                            }
                        }
                    }
                    //向Widget插入标绘要素
                    var strVar = "";
                    //TODO获取marker的id和Guid
                    var markerId=$.trim($("#mpp-polygon-id").val());
                    var oMarkPos=layerManager.map.camera.position;
                    var oMarkDir=layerManager.map.camera.direction;
                    var oMarkUp=layerManager.map.camera.up;
                    strVar += "	<div class=\"layer-item-title marker-title\" marker-guid=\""+markerId+"\"camera-position =\""+oMarkPos.x+","+oMarkPos.y+","+oMarkPos.z+","+oMarkDir.x+","+oMarkDir.y+","+oMarkDir.z+","+oMarkUp.x+","+oMarkUp.y+","+oMarkUp.z+"\" >";
                    strVar += "	<i class=\"\"><\/i>";
                    strVar += "	<i class=\"checkicon active\"><\/i>";
                    var iconStyle="";
                    //TODO获取marker的名称
                    var markerName=$.trim($("#mpp-polygon-name").val());
                    //TODO获取marker的类型
                    if (markerType == "1") {//点
                        iconStyle="iconpointer";
                    } else if (markerType == "2") {//线
                        iconStyle="iconpolyline";
                    } else if (markerType == "3") {//面
                        iconStyle="iconpolygon";
                    }
                    strVar += "		<i class=\"typeicon "+iconStyle+"\"><\/i>";
                    strVar += "		<span>"+markerName+"<\/span>";
                    strVar += "	<\/div>";
                    $(targetDom).next().append($(strVar));
                    //TODO向集合中加入marker
                    layer.close(index);

                    if(layerManager.map.entities.getById(markerId)){
                        var markerEntity = layerManager.map.entities.getById(markerId);
                    }else{
                        for(var j=0;j<layerManager.map.dataSources._dataSources.length;j++){
                            if(layerManager.map.dataSources._dataSources[j].name == "drawDataSource"){
                                var markerEntity = layerManager.map.dataSources._dataSources[j].entities.getById(markerId);
                                if(markerEntity){
                                    break;
                                }
                            }
                        }
                    }
                    var serviceLayerGroup = layerManager.getServiceLayerGroup();
                    var targetServiceLayer = serviceLayerGroup._collectionsCopy[markerType-1];
                    targetServiceLayer.add(markerEntity);
                }else{
                    if(checkLen < 1){
                        layer.tips('未选择图层组，请重新选择！', '#name-span');
                    }else if(checkLen > 1){
                        layer.tips('选择了多个图层组，请重新选择！', '#name-span');
                    }
                }
            },
            btn2: function(index, layer0){
                //取消选择标绘图层，返回编辑属性面板
                $("#mask,#MarkPropPanel").fadeIn();
            },
            content: '<div style="position:absolute; margin-left:20px;margin-top:22px;"><span>将此标绘作为图层添加到以下的哪个图层组中？请点选：</span></br></div>'+'<div class="lm-tree-node">'+insertHtml+'</div><div id="name-span" style="margin-top:48px;width:222px;"></div>'

        });
    }

    //标绘图层添加
    function addMarkerLayer(layerManager){
        $(".layer-action-expand").parent().next().attr("selcetMode","expand");
        layer.prompt({title: '请输入创建图层组名称，并确认',anim: 4, formType: 0}, function(text, index){
            var strVar = "";
            var branchGuid = Cesium.createGuid();
            strVar += "<div class=\"layer-item-title\" node-guid=\""+branchGuid+"\">";
            strVar += "	<i class=\"arrow\"><\/i>";
            strVar += "	<i class=\"checkicon active\"><\/i>";
            strVar += "	<i class=\"typeicon icondirectory\"><\/i>";
            strVar += "	<span>"+text+"<\/span>";
            strVar +="<i class=\"layer-action-remove\"></i>";
            strVar += "<\/div>";
            strVar += "<div class=\"layer-item-content\" id=\""+branchGuid+"\">";
            strVar += "<\/div>";
			/*var expStr = "[selcetMode=expand]";
			 $("#mark-container").find(expStr).append($(strVar));
			 $("#mark-container").find(expStr).removeAttr("selcetMode");*/

            $("#mark-container").append($(strVar));
            $("#mark-container").removeAttr("selcetMode");
            layer.close(index);

            var entityCollection = new Cesium.EntityCollection();
            var serviceLayerGroup = layerManager.getServiceLayerGroup();
            var oIndex = serviceLayerGroup.getCollectionsLength();
            serviceLayerGroup.addCollection(entityCollection,oIndex);
        });
    }

    //标绘图层移除监听
    function removeMarkerLayer(evt){
        var that = this;
        var item = $(evt.target).parent().next().children();
        if(item.length == 0){
            layer.open({
                anim: 4,
                skin: 'layui-layer-lan',
                area: ['400px', '160px'],
                shadeClose: true,
                title: "删除数据",
                content: '<div style="position:absolute;margin-left: 20%;margin-top: 0px;"><span>该图层组下没有加载任何图层数据！</span></div>',
                yes: function(index, layer0){
                    layer.close(index);
                }
            });
        }else{
            var domCollection = {group:[],layer:[]};
            var insertHtml = new String();
            var checkDoms = null;
            if($(evt.target).parent().parent().attr("id") == "mark-branch-container"){//一级节点
                $(evt.target).parent().parent().addClass("click-remove");
                checkDoms = $(".layer-content").find(".click-remove").find(".layer-item-content").find(".checkicon.active");

            }else{//次级节点
                $(evt.target).parent().addClass("click-remove");
                checkDoms = $(".layer-content").find(".click-remove").next().find(".checkicon.active");

            }
            var domNodes = checkDoms.parent();
            for(var i=0;i<domNodes.length;i++){
                var checkDom = domNodes[i];
                if($(checkDom).attr("node-guid")){
                    domCollection.group.push(checkDom);
                }
                if($(checkDom).attr("marker-guid")){
                    domCollection.layer.push(checkDom);
                }
            }
            //组装弹出框图层组
            for(var i=0;i<domCollection.group.length;i++){
                if(i == 0){
                    insertHtml = '<span style="color:#135aa0;font-size:15px;position:relative;left:18%;top:10px;"><b>图层组:</b></span></br>'+'<span style="color:#4476a7;font-size:13px;position:relative;left:42%;top:-8px;background: #eaeaea;">'+$(domCollection.group[i]).find("span").text()+'</span></br>';
                }else{
                    insertHtml = insertHtml+'<span style="color:#4476a7;font-size:13px;position:relative;left:42%;top:-8px;background: #eaeaea;">'+$(domCollection.group[i]).find("span").text()+'</span></br>';
                }
            }
            //组装弹出框图层
            for(var i=0;i<domCollection.layer.length;i++){
                if(i == 0){
                    insertHtml = insertHtml+'<span style="color:#135aa0;font-size:15px;position:relative;left:18%;top:10px;"><b>图&nbsp&nbsp&nbsp层:</b></span></br>'+'<span style="color:#4476a7;font-size:13px;position:relative;left:42%;top:-8px;background: #eaeaea;">'+$(domCollection.layer[i]).find("span").text()+'</span></br>';
                }else{
                    insertHtml = insertHtml+'<span style="color:#4476a7;font-size:13px;position:relative;left:42%;top:-8px;background: #eaeaea;">'+$(domCollection.layer[i]).find("span").text()+'</span></br>';
                }
            }
            var domCollectionLen = domCollection.group.length + domCollection.layer.length;
            if(domCollectionLen>0){
                layer.open({
                    type: 1,
                    anim: 4,
                    skin: 'layui-layer-lan',
                    area: ['450px', '260px'],
                    title: "删除数据",
                    btn: ['确认', '取消'],
                    yes: function(index, layer0){
                        var checkDoms = null;
                        //如果点击主节点，移除选中
                        if($(".layer-content").find(".click-remove").find(".layer-item-content").find(".checkicon.active").length >0){
                            checkDoms = $(".layer-content").find(".click-remove").find(".layer-item-content").find(".checkicon.active");
                            checkDoms.parent().remove();
                        }else{//如果点击次节点，移除选中
                            checkDoms = $(".layer-content").find(".click-remove").next().find(".checkicon.active");
                            checkDoms.parent().remove();
                        }
                        $(".layer-content").find(".click-remove").removeClass("click-remove");
                        layer.close(index);

                        var serviceLayerGroup = that.layerManager.getServiceLayerGroup();
                        var index = 0;
                        var nodeId = $(evt.target).parent().attr("node-guid");
                        for(var i=0;i<$("#mark-container .layer-item-content").length;i++){
                            if(nodeId == $($("#mark-container .layer-item-content")[i]).attr("id")){
                                index = i;
                                break;
                            }
                        }
                        var targetServiceLayer = serviceLayerGroup.getCollection(index);
                        for(var j=0;j<checkDoms.length;j++){
                            var entityId = $(checkDoms[j].parentElement).attr("marker-guid");
                            targetServiceLayer.removeById(entityId);
                            if(that.layerManager.map.entities.getById(entityId)){
                                that.layerManager.map.entities.removeById(entityId);
                            }else{
                                for(var j=0;j<that.layerManager.map.dataSources._dataSources.length;j++){
                                    if(that.layerManager.map.dataSources._dataSources[j].name == "drawDataSource"){
                                        var markerEntity = that.layerManager.map.dataSources._dataSources[j].entities.getById(entityId);
                                        if(markerEntity && entityId){
                                            that.layerManager.map.dataSources._dataSources[j].entities.removeById(entityId);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        $("#popover2018").css("display","none");
                    },
                    btn2: function(index, layer0){
                        $(".layer-content").find(".click-remove").removeClass("click-remove");
                    },
                    content: '<div style="position:absolute; margin-left:20px;margin-top:22px;"><span>确认删除以下选中的图层组和图层数据吗：</span></br>'+insertHtml+'</div>'
                });
            }else{
                $(".layer-content").find(".click-remove").removeClass("click-remove");
                layer.open({
                    anim: 4,
                    skin: 'layui-layer-lan',
                    area: ['400px', '160px'],
                    shadeClose: true,
                    title: "删除数据",
                    content: '<div style="position:absolute;margin-left: 25%;margin-top: 0px;"><span>未选中任何要删除的图层！</span></div>',
                    yes: function(index, layer0){
                        layer.close(index);
                    }
                });
            }
        }
    }

    //单击显示和隐藏标绘图层支点
    function showMarkerLayer(evt){
        var oSibs=$(evt.target).parent().siblings(".layer-item-title");
        var oParentTitle=$(evt.target).parent();
        if($(evt.target).hasClass("disabled")){return;}
        //当前状态是否已经显示
        var isShowed=$(evt.target).hasClass("active")?true:false;
        //有父节点的
        //当前是否有父节点
        var ParentLayerContent=$(evt.target).parents(".layer-item-content");
        if(ParentLayerContent.length>0){
            if(oSibs.length==oSibs.find(".checkicon.active").length){
                ParentLayerContent.prev().find(".checkicon").addClass("active");
                if(isShowed){
                    ParentLayerContent.prev().find(".checkicon").removeClass("active");
                }
            }else{
                ParentLayerContent.prev().find(".checkicon").removeClass("active");
            };
        }

        //已经勾选
        if(isShowed){
            $(evt.target).removeClass("active");
            oParentTitle.next(".layer-item-content").find(".checkicon:not('.disabled')").removeClass("active");

            //有父节点（特殊判断：一种是标注的文件夹，一种是标注,倾斜模型）
            if(ParentLayerContent.length>0){
                //如果父节点是标注文件夹
                if(oParentTitle.attr("node-guid") != undefined){
                    var aTitle=oParentTitle.next().find(".layer-item-title");
                    for(var i=0;i<aTitle.length;i++){
                        var entityId = $(aTitle[i]).attr("marker-guid");
                        if(this.layerManager.map.entities.getById(entityId)){
                            var markerEntity = this.layerManager.map.entities.getById(entityId);
                            markerEntity.billboard.show = false;
                        }else{
                            for(var j=0;j<this.layerManager.map.dataSources._dataSources.length;j++){
                                if(this.layerManager.map.dataSources._dataSources[j].name == "drawDataSource"){
                                    var markerEntity = this.layerManager.map.dataSources._dataSources[j].entities.getById(entityId);
                                    if(markerEntity){
                                        break;
                                    }
                                }
                            }
                            if(markerEntity.polyline){
                                markerEntity.polyline.show = false;
                            }else if(markerEntity.polygon){
                                markerEntity.polygon.show = false;
                            }
                        }
                    }
                }else if(oParentTitle.attr("marker-guid") != undefined){//如果父节点是标注
                    var entityId = oParentTitle.attr("marker-guid");
                    if(this.layerManager.map.entities.getById(entityId)){
                        var markerEntity = this.layerManager.map.entities.getById(entityId);
                        markerEntity.billboard.show = false;
                    }else{
                        for(var j=0;j<this.layerManager.map.dataSources._dataSources.length;j++){
                            if(this.layerManager.map.dataSources._dataSources[j].name == "drawDataSource"){
                                var markerEntity = this.layerManager.map.dataSources._dataSources[j].entities.getById(entityId);
                                if(markerEntity){
                                    break;
                                }
                            }
                        }
                        if(markerEntity.polyline){
                            markerEntity.polyline.show = false;
                        }else if(markerEntity.polygon){
                            markerEntity.polygon.show = false;
                        }
                    }
                }else if(oParentTitle.attr("model-guid") != undefined){
                    //ShowOblique(oParentTitle.attr("model-guid"),false);
                }else if(oParentTitle.attr("terrain-id") != undefined){
                    //ShowStkTerrain(false);
                }else if(oParentTitle.attr("shp-id") != undefined){
                    //ShowVectorData(oParentTitle.attr("shp-id"),false);
                }else if(oParentTitle.attr("lrp-id") != undefined){
                    //ShowLrpData(oParentTitle.attr("lrp-id"),false);
                }
            }else{
				/*var aTitle=oParentTitle.next().find(".layer-item-title");
				 for(var i=0;i<aTitle.length;i++){
				 if(aTitle.eq(i).attr("marker-guid")){
				 showMark(aTitle.eq(i).attr("marker-guid"),false);
				 }else if(aTitle.eq(i).attr("model-guid")){
				 ShowOblique(aTitle.eq(i).attr("model-guid"),false);
				 }else if(aTitle.eq(i).attr("terrain-id")){
				 ShowStkTerrain(false);
				 }else if(aTitle.eq(i).attr("shp-id")){
				 ShowVectorData(aTitle.eq(i).attr("shp-id"),false);
				 }else if(aTitle.eq(i).attr("lrp-id")){
				 ShowLrpData(aTitle.eq(i).attr("lrp-id"),false);
				 }
				 }*/
            }
        }else{
            //未勾选
            $(evt.target).addClass("active");
            oParentTitle.next(".layer-item-content").find(".checkicon").addClass("active");

            //有父节点（一种是标注的文件夹，一种是标注）
            if(ParentLayerContent.length>0){//是标注节点
                //如果父节点是标注文件夹
                if(oParentTitle.attr("node-guid") != undefined){
                    var aTitle=oParentTitle.next().find(".layer-item-title");
                    for(var i=0;i<aTitle.length;i++){
                        var entityId = $(aTitle[i]).attr("marker-guid");
                        if(this.layerManager.map.entities.getById(entityId)){
                            var markerEntity = this.layerManager.map.entities.getById(entityId);
                            markerEntity.billboard.show = true;
                        }else{
                            for(var j=0;j<this.layerManager.map.dataSources._dataSources.length;j++){
                                if(this.layerManager.map.dataSources._dataSources[j].name == "drawDataSource"){
                                    var markerEntity = this.layerManager.map.dataSources._dataSources[j].entities.getById(entityId);
                                    if(markerEntity){
                                        break;
                                    }
                                }
                            }
                            if(markerEntity.polyline){
                                markerEntity.polyline.show = true;
                            }else if(markerEntity.polygon){
                                markerEntity.polygon.show = true;
                            }
                        }
                    }
                }else if(oParentTitle.attr("marker-guid") != undefined){//如果父节点是标注
                    //showMark(oParentTitle.attr("marker-guid"),true);
                    var entityId = oParentTitle.attr("marker-guid");
                    if(this.layerManager.map.entities.getById(entityId)){
                        var markerEntity = this.layerManager.map.entities.getById(entityId);
                        markerEntity.billboard.show = true;
                    }else{
                        for(var j=0;j<this.layerManager.map.dataSources._dataSources.length;j++){
                            if(this.layerManager.map.dataSources._dataSources[j].name == "drawDataSource"){
                                var markerEntity = this.layerManager.map.dataSources._dataSources[j].entities.getById(entityId);
                                if(markerEntity){
                                    break;
                                }
                            }
                        }
                        if(markerEntity.polyline){
                            markerEntity.polyline.show = true;
                        }else if(markerEntity.polygon){
                            markerEntity.polygon.show = true;
                        }
                    }
                }else if(oParentTitle.attr("model-guid") != undefined){
                    //ShowOblique(oParentTitle.attr("model-guid"),true);
                }else if(oParentTitle.attr("terrain-id") != undefined){
                    //ShowStkTerrain(true);
                }else if(oParentTitle.attr("shp-id") != undefined){
                    //ShowVectorData(oParentTitle.attr("shp-id"),true);
                }else if(oParentTitle.attr("lrp-id") != undefined){
                    //ShowLrpData(oParentTitle.attr("lrp-id"),true);
                }

            }else{
				/*var aTitle=oParentTitle.next().find(".layer-item-title");
				 for(var i=0;i<aTitle.length;i++){
				 if(aTitle.eq(i).attr("marker-guid")){
				 showMark(aTitle.eq(i).attr("marker-guid"),true);
				 }else if(aTitle.eq(i).attr("model-guid")){
				 ShowOblique(aTitle.eq(i).attr("model-guid"),true);
				 }else if(aTitle.eq(i).attr("terrain-id")){
				 ShowStkTerrain(true);
				 }else if(aTitle.eq(i).attr("shp-id")){
				 ShowVectorData(aTitle.eq(i).attr("shp-id"),true);
				 }else if(aTitle.eq(i).attr("lrp-id")){
				 ShowLrpData(aTitle.eq(i).attr("lrp-id"),true);
				 }
				 }*/
            }
        }
        return false;
    }

    //单击定位标绘图层组
    function positionMarkerCollection(evt){
        $("#popover2018").css("display","none");
        var oParentTitle=$(evt.target).parent();
        var targetCollectionId = $(oParentTitle[0]).attr("node-guid");
        for(var i=0; i<$(".layer-item-content *[node-guid]").length;i++){
            if(targetCollectionId == $($(".layer-item-content *[node-guid]")[i]).attr("node-guid")){
                var index = i;
                break;
            }
        }
        var serviceLayerGroup = this.layerManager.getServiceLayerGroup();
        var targetServiceLayer = serviceLayerGroup.getCollection(index);
        if(targetServiceLayer._entities._array.length > 0){
            this.layerManager.map.flyTo(targetServiceLayer);
        }
    }

    //单击定位标绘图层支点和显示属性框
    function positionMarkerLayer(evt,selectiontext){
        var that = this;
        var serviceLayerGroup = this.layerManager.getServiceLayerGroup();
        var index = 0;
        var nodeId = $(evt.target).parent().parent().attr("id");
        for(var i=0;i<$("#mark-container .layer-item-content").length;i++){
            if(nodeId == $($("#mark-container .layer-item-content")[i]).attr("id")){
                index = i;
                break;
            }
        }
        var targetServiceLayer = serviceLayerGroup.getCollection(index);
        var entityId = $(evt.target).parent().attr("marker-guid");
        var targetEntity = targetServiceLayer.getById(entityId);
        //if(targetEntity.polyline || targetEntity.polygon){
        this.layerManager.map.flyTo(targetEntity);
        //}

        var oMonomerTimer=null;
        clearTimeout(oMonomerTimer);
        $("#popover2018").hide();
        var value = targetEntity;
        oMonomerTimer=setTimeout(function(){
            $("#popover2018 h3").html(value._name);
            var oDescription = "<tr><th style=\"font-size: 14px;font-weight: bold;\">属性名</th><th style=\"font-size: 14px;font-weight: bold;\">属性值</th></tr>";
            if (value.properties != undefined) {
                for (var index = 0; index < value.properties.propertyNames.length; index++) {
                    var propertie = value.properties.propertyNames[index];
                    var values = value.properties[propertie]._value;

                    if (propertie != "marker-color" &&
                        propertie != "marker-size" &&
                        propertie != "title" &&
                        propertie != "fill" &&
                        propertie != "fill-opacity" &&
                        propertie != "stroke-opacity" &&
                        propertie != "stroke" &&
                        propertie != "stroke-width" &&
                        propertie != "jiaoxuelou" &&
                        propertie != "sushe" &&
                        propertie != "yundong" &&
                        propertie != "hupo" &&
                        propertie != "tushuguan" &&
                        propertie != "shitang"&&
                        propertie != "build"
                    ) {
                        oDescription +=
                            "<tr>" +
                            "<td>" + propertie + "</td>" +
                            "<td>" + values + "</td>" +
                            "</tr>";
                    }
                }
                if(value.properties.propertyNames.length == 0){
                    oDescription +=
                        "<tr>" +
                        "<td>暂无</td>" +
                        "<td>暂无</td>" +
                        "</tr>";
                }
                var flag = true;

            }
            if(targetEntity.billboard){
                var aPos=targetEntity._position._value;
            }else if(targetEntity.polyline){
                var aPos=targetEntity.polyline.positions._value;
            }else if(targetEntity.polygon){
                if(!!targetEntity.polygon.hierarchy._value.positions){
                    var aPos=targetEntity.polygon.hierarchy._value.positions;
                }else{
                    var aPos=targetEntity.polygon.hierarchy._value;
                }
            }

            var iX=0,iY=0,iZ=0;
            if(targetEntity.billboard){
                iX=aPos.x;
                iY=aPos.y;
                iZ=aPos.z;
            }else if(targetEntity.polyline || targetEntity.polygon){
                for(var i=0;i<aPos.length;i++){
                    iX=aPos[i].x+iX;
                    iY=aPos[i].y+iY;
                    iZ=aPos[i].z+iZ;
                }
                iX=iX/aPos.length;
                iY=iY/aPos.length;
                iZ=iZ/aPos.length;
            }
            var WorlsPos=new Cesium.Cartesian3(iX,iY,iZ);
            var ScreenPos=Cesium.SceneTransforms.wgs84ToWindowCoordinates(that.layerManager.map.scene, WorlsPos);
            if (flag) {
                if(!!selectiontext){
                    var reg=new RegExp(selectiontext,'g');
                    oDescription=oDescription.replace(reg,"<span>"+selectiontext+"</span>");
                }

                $("#popover2018 .popover-content table tbody").html(oDescription);
                $("#popover2018").css({
                    "left": ScreenPos.x - 136,
                    "top": ScreenPos.y - $("#popover2018").height() - 10,
                    "display": "block"
                });
            }
            return;
        },3500)
    }

    //所有图层单击收起箭头
    function oneclickLayer(evt){
        var oNextSib = $(evt.target).parent().next();
        if($(evt.target).hasClass("active")){
            $(evt.target).removeClass("active");
            if (oNextSib.hasClass("layer-item-content")) {
                oNextSib.show();
            }
        }else{
            $(evt.target).addClass("active");
            if (oNextSib.hasClass("layer-item-content")) {
                oNextSib.hide();
            }
        }
        return false;
    }

    //所有图层双击收起箭头
    function doubleclickLayer(evt){
        var oNextSib = $(evt.target).next();
        if (oNextSib.hasClass("layer-item-content")) {
            if (oNextSib.is(":hidden")) {
                $(evt.target).find(".arrow").removeClass("active");
                oNextSib.show();
            } else {
                $(evt.target).find(".arrow").addClass("active");
                oNextSib.hide();
            }
        }
        return false;
    }

    //验证服务
    function checkService(evt){
        var srvUrl = $.trim($(".lm-ipt").val());
        $("#srvCheckRes").remove();
        var validator = validateSrv(srvUrl);
        if(validator){
            var srvType = "";
            var srvIptId = $(".lm-ipt").attr("id");
            if(srvIptId == "lm-srvURL-model"){
                srvType = "MODEL_CESIUM";
            }else if(srvIptId == "lm-srvURL-vector"){
                srvType = "WFS";
            }else if(srvIptId == "lm-srvURL-imagery"){
                var serviceType = $("#basicServiceType").val();
                if(serviceType == "WMTS"){
                    srvType = "WMTS";
                }else if(serviceType == "WMS"){
                    srvType = "WMS";
                }else if(serviceType == "TILE"){
                    srvType = "TILE";
                }
            }else if(srvIptId == "lm-srvURL-terrain"){
                srvType = "TERRAIN";
            }
        }
        getServiceOption(srvUrl,srvType);
    }

    //模型图层添加
    function addModelSrv(layerManager){
        layer.open({
            type: 1,
            anim: 4,
            skin: 'layui-layer-lan',
            area: ['400px', '205px'],
            title: "添加模型服务",
            btn: ['添加', '取消'],
            yes: function(index, layero){
                if($("#checkedMark").html() == "unverified"){
                    $("#srvCheckRes span").html("");
                    $("#lm-srvname-model").remove();
                    layer.tips('服务未验证!', '#srv-span');
                }else{
                    var checkRes = $("#lm-srvURL-model").hasClass("check-true");
                    if(checkRes){
                        var srvName = $($(".lm-name")[0]).val(); //$($(".lm-name")[0]).attr("value");
                        if(srvName){
                            var layerId = $(".lm-name").attr("id");
                            var insertStr = '<div class="layer-item-title" style="padding-left:33px;" id='+ layerId +'><i class=""></i><i class="checkicon active"></i><i class="typeicon iconlocal" style="padding-left:19px;"></i><span>'+srvName+'</span></div>';
                            $("#model-branch-container").children().last().append(insertStr);

                            $("#checkedMark").html("verified");
                            //TODO加载osg到地图上
                            layer.close(index);
                        }else{
                            layer.tips('服务名称为空！', '#name-span');
                            $("#checkedMark").html("noName");
                        }
                    }else{
                        layer.tips('服务验证不成功！', '#srv-span');
                    }
                }
            },
            btn2: function(index, layero){
            },
            content: '<div id="srvipt-item" style="position:absolute; margin-left:20px;margin-top:22px;"><span id="srv-span">服务地址：</span><input id="lm-srvURL-model" class="lm-ipt" type="text"><input class="lm-btn" type="button" value="验证服务" id="checkService" style="margin-left: 8px;"><span id="checkedMark" class="f-dn"></span></div>'
        });
        //监听添加模型服务面板url地址改变
        $("#lm-srvURL-model").bind("input porpertychange",function(){
            $("#checkedMark").html("unverified");
        });
        $(".layui-layer-btn0").on("click",$.proxy(generateModelLayer,this,this.layerManager));
    }

    //矢量图层添加
    function addVectorSrv(layerManager){
        layer.open({
            type: 1,
            anim: 4,
            skin: 'layui-layer-lan',
            area: ['425px', '230px'],
            title: "添加矢量要素服务",
            btn: ['添加', '取消'],
            yes: function(index, layero){
                if($("#checkedMark").html() != "verified"){
                    $("#srvCheckRes span").html("");
                    $("#lm-srvname-vector").remove();
                    layer.tips('服务未验证!', '#srv-span');
                }else{
                    //服务校验结果
                    var checkRes = $("#lm-srvURL-vector").hasClass("check-true");
                    if(checkRes){
                        //图层勾选结果
                        var isCheck = $("#lm-srvname-vector").find("input[type='checkbox']:checked").length;
                        if(isCheck >= 1){
                            var layerArray = [];
                            var serviceUrl =  $("#lm-srvURL-vector").val();
                            var url;
                            if(serviceUrl.indexOf("?")>0){
                                url = TDT.getAppPath("")+"proxyHandler?url="+serviceUrl+"&request=describeFeatureType";
                            }else{
                                url = TDT.getAppPath("")+"proxyHandler?url="+serviceUrl+"?request=describeFeatureType";
                            }
                            for(var i=0;i<$("#lm-srvname-vector").find("input[type='checkbox']:checked").length;i++){
                                var layerName = $($("#lm-srvname-vector").find("input[type='checkbox']:checked")[i]).next().html();
                                GeoGlobe.Request.GET({
                                    url: url,
                                    params: {
                                        typename: layerName,
                                        version:"1.0.0"
                                    },
                                    async:false,
                                    success: function(request){
                                        try {
                                            if(request){
                                                var doc = request.responseText;
                                                var parser = new GeoGlobe.Format.WFSDescribeFeatureType({
                                                    version:"1.0.0",
                                                    defaultVersion:"1.0.0"
                                                });
                                                var jsonOnj = parser.read(doc);
                                                for(var j=0; j<jsonOnj.featureTypes[0].properties.length; j++){
                                                    if(jsonOnj.featureTypes[0].properties[j].name == "GEOMETRY"){
                                                        var geometry = jsonOnj.featureTypes[0].properties[j].type;
                                                        var type = jsonOnj.featureTypes[0].properties[1].type.split(":")[1];
                                                        break;
                                                    }
                                                }
                                                var iconStyle="iconpointer";
                                                if(type == "PointPropertyType"){
                                                    iconStyle="iconpointer";
                                                }else if(type == "LineStringPropertyType"){
                                                    iconStyle="iconpolyline";
                                                }else if(type == "PolygonPropertyType"){
                                                    iconStyle="iconpolygon";
                                                }
                                                var layerName = jsonOnj.featureTypes[0].typeName;
                                                var vectorDom = $("#lm-srvname-vector").find("input[type='checkbox']:checked");
                                                for(var i = 0; i < vectorDom.length; i++){
                                                    if(layerName == $($(vectorDom)[i]).next().html()){
                                                        var layerId = $(vectorDom[i]).parent().attr("id");
                                                        break;
                                                    }
                                                }
                                                var insertStr = '<div class="layer-item-title style="padding-left:33px;" id='+ layerId + '><i class=""></i><i class="checkicon active"></i><i style="padding-left:19px;" class=\"typeicon '+ iconStyle +'\"></i><span>'+layerName+'</span></div>';
                                                $($("#vector-branch-container").children()[1]).prepend(insertStr);
                                                $("#"+layerId).css("padding-left","34px");
                                            }
                                        }catch (e) {
                                            console.log("service capabilities test error!");
                                        }
                                    }
                                })
                            }
                            layer.close(index);
                        }else if(isCheck == 0){
                            layer.tips('未勾选任何服务！', '#name-span');
                        }
                    }else{
                        layer.tips('服务验证不成功！', '#srv-span');
                    }
                }
            },
            btn2: function(index, layero){
            },
            content: '<div id="srvipt-item" style="position:absolute; margin-left:20px;margin-top:22px;"><span id="srv-span">服务地址：</span><input id="lm-srvURL-vector" class="lm-ipt" type="text"><input class="lm-btn" type="button" value="验证服务" id="checkService" style="margin-left: 8px;"><span id="checkedMark" class="f-dn"></span></div>'
        });
        //监听添加矢量服务面板url地址改变
        $("#lm-srvURL-vector").bind("input porpertychange",function(){
            $("#checkedMark").html("unverified");
        });
        $(".layui-layer-btn0").on("click",$.proxy(generateWfsLayer,this,this.layerManager));
    }

    //地形图层组添加
    function addTerrainSrv(layerManager){
        if($("#terrain-branch-container .layer-item-content").children().length == 0){
            layer.open({
                type: 1,
                anim: 4,
                skin: 'layui-layer-lan',
                area: ['400px', '200px'],
                title: "添加地形服务",
                btn: ['添加', '取消'],
                yes: function(index, layero){
                    if($("#checkedMark").html() == "unverified"){
                        $("#srvCheckRes span").html("");
                        $("#lm-srvname-terrain").remove();
                        layer.tips('服务未验证!', '#srv-span');
                    }else{
                        var checkRes = $("#lm-srvURL-terrain").hasClass("check-true");
                        if(checkRes){
                            var srvName = $(".lm-name").val();
                            if(srvName){
                                var layerId = $(".lm-name").attr("guid");
                                var insertStr = '<div class="layer-item-title" style="padding-left:33px;" id='+ layerId +'><i class=""></i><i class="checkicon active"></i><i class="typeicon iconlocal" style="padding-left:19px;"></i><span>'+srvName+'</span></div>';
                                $($("#terrain-branch-container").children()[1]).prepend(insertStr);
                                $("#checkedMark").html("verified");
                                //TODO加载terrain到地图上
                                layer.close(index);
                            }else{
                                layer.tips('服务名称为空！', '#name-span');
                                $("#checkedMark").html("noName");
                            }
                        }else{
                            layer.tips('服务验证不成功！', '#srv-span');
                        }
                    }
                },
                btn2: function(index, layero){
                },
                content: '<div id="srvipt-item" style="position:absolute; margin-left:20px;margin-top:22px;"><span id="srv-span">服务地址：</span><input id="lm-srvURL-terrain" class="lm-ipt" type="text"><input class="lm-btn" type="button" value="验证服务" id="checkService" style="margin-left: 8px;"><span id="checkedMark" class="f-dn"></span></div>'
            });
            //监听添加地形服务面板url地址改变
            $("#lm-srvURL-terrain").bind("input porpertychange",function(){
                $("#checkedMark").html("unverified");
            });
            $(".layui-layer-btn0").on("click",$.proxy(generateTerrainLayer,this,this.layerManager));
        }else{
            layer.alert('地形图层组中已存在图层数据，请先移除后再添加！', {anim: 4,skin: 'layui-layer-lan',area: ['400px', '170px'],title: "提示",});
        }
    }

    //基础图层添加
    function addBasicSrv(layerManager){
        var that = this;
        that.layerManager = layerManager;
        layer.open({
            type: 1,
            anim: 4,
            skin: 'layui-layer-lan',
            area: ['425px', '245px'],
            title: "添加基础地图服务",
            btn: ['添加', '取消'],
            yes: function(index, layero){
                if($("#checkedMark").html() != "verified"){
                    $("#srvCheckRes span").html("");
                    $("#lm-srvname-imagery").remove();
                    layer.tips('服务未验证!', '#srv-span');
                }else{
                    //服务校验结果
                    var checkRes = $("#lm-srvURL-imagery").hasClass("check-true");
                    if(checkRes){
                        //图层勾选结果
                        var isCheck = $("#lm-srvname-imagery").find("input[type='checkbox']").is(':checked');
                        if(isCheck){
                            //插入多个图层
                            for(var i=0;i<$("#lm-srvname-imagery").find("input[type='checkbox']:checked").length;i++){
                                var layerName = $($("#lm-srvname-imagery").find("input[type='checkbox']:checked")[i]).next().html();
                                var layerId = $($("#lm-srvname-imagery").find("input[type='checkbox']:checked")[i]).parent().attr("id");
                                var insertStr = '<div class="layer-item-title" style="padding-left:33px;" id='+ layerId + '><i class=""></i><i class="checkicon active"></i><i class="typeicon iconlocal" style="padding-left:19px;"></i><span id="basicServiceName">'+layerName+'</span></div>';
                                //向前插入
                                $($("#imagery-branch-container").children()[1]).prepend(insertStr);
                                //向后插入
                                //$("#imagery-branch-container").children().last().append(insertStr);
                            }

                            //移除原有图层上移下移标识
                            $("#imagery-branch-container").find(".icondown").remove();
                            $("#imagery-branch-container").find(".iconup").remove();
                            //重新插入上移下移图标
                            var layerLen = $("#imagery-branch-container .layer-item-content").children().length;
                            if(layerLen < 2){

                            }else if(layerLen == 2){
                                //最顶层
                                if($("#imagery-branch-container .layer-item-content").children().first()){
                                    $("#imagery-branch-container .layer-item-content").children().first().find("span").append('<i class="icondown"></i>');
                                }
                                //最底层
                                if($("#imagery-branch-container .layer-item-content").children().last()){
                                    $("#imagery-branch-container .layer-item-content").children().last().find("span").append('<i class="iconup"></i>');
                                }
                            }else if(layerLen > 2){
                                //最顶层
                                if($("#imagery-branch-container .layer-item-content").children().first()){
                                    $("#imagery-branch-container .layer-item-content").children().first().find("span").append('<i class="icondown"></i>');
                                }
                                //最底层
                                if($("#imagery-branch-container .layer-item-content").children().last()){
                                    $("#imagery-branch-container .layer-item-content").children().last().find("span").append('<i class="iconup"></i>');
                                }
                                //中间层
                                for(var i=1;i<layerLen-1;i++){
                                    $($("#imagery-branch-container .layer-item-content").children()[i]).find("span").append('<i class="iconup"></i><i style="margin-left: 6px;" class="icondown"></i>');
                                }
                            }
                            layer.close(index);
                        }else{
                            layer.tips('未勾选任何服务！', '#name-span');
                        }
                    }else{
                        layer.tips('服务验证不成功！', '#srv-span');
                    }
                }
            },
            btn2: function(index, layero){

            },
            content: '<div id="srvipt-item" style="position:absolute; margin-left:20px;margin-top:22px;"><span id="srv-span">服务类型：</span><select id="basicServiceType" style="height: 27px;width: 225px;"><option value="WMTS">WMTS</option><option value="WMS">WMS</option><option value="TILE">吉奥瓦片</option></select></div><div id="srvipt-item" style="position:absolute; margin-left:20px;margin-top:65px;"><span id="srv-span">服务地址：</span><input id="lm-srvURL-imagery" class="lm-ipt" style="width: 225px;" type="text"><input class="lm-btn" type="button" value="验证服务" id="checkService" style="margin-left: 8px;"><span id="checkedMark" class="f-dn"></span></div>'
        });
        //监听添加基础服务面板url地址改变
        $("#lm-srvURL-imagery").bind("input porpertychange",function(){
            $("#checkedMark").html("unverified");
        });
        $(".layui-layer-btn0").on("click",$.proxy(generateBasicLayer,this,this.layerManager));
    }

    //移除模型图层组中图层
    function deleteModelSrv(layerManager){
        var itemLen = $("#model-branch-container .layer-item-content").children().length;
        if(itemLen == 0){
            layer.open({
                anim: 4,
                skin: 'layui-layer-lan',
                area: ['400px', '160px'],
                shadeClose: true,
                title: "删除数据",
                content: '<div style="position:absolute;margin-left: 20%;margin-top: 0px;"><span>该图层组下没有加载任何图层数据！</span></div>',
                yes: function(index, layer0){
                    layer.close(index);
                }
            });
        }else{
            var domArray = new Array();
            var insertHtml=new String();
            for(var i=0;i<itemLen;i++){
                var iDom = $($("#layer-action-delete-model").parent().next().children()[i]).find("i")[1];
                var flag = $(iDom).hasClass("active");
                if(flag){
                    domArray.push($("#layer-action-delete-model").parent().next().children()[i]);
                }
            }
            for(var i=0;i<domArray.length;i++){
                if(i < domArray.length-1){
                    insertHtml = insertHtml+'<span class="confirm-delete-model" id=\"'+$(domArray[i]).attr("id")+'\" style="color:#4476a7;font-size:13px;position:relative;left:42%;top:6px;background: #eaeaea;">'+$(domArray[i]).find("span").text()+'</span></br>';
                }else{
                    insertHtml = insertHtml+'<span class="confirm-delete-model" id=\"'+$(domArray[i]).attr("id")+'\" style="color:#4476a7;font-size:13px;position:relative;left:42%;top:6px;background: #eaeaea;">'+$(domArray[i]).find("span").text()+'</span>';
                }
            }
            if(domArray.length>0){
                layer.open({
                    type: 1,
                    anim: 4,
                    skin: 'layui-layer-lan',
                    area: ['400px', '210px'],
                    title: "删除数据",
                    btn: ['确认', '取消'],
                    yes: function(index, layer0){
                        var checkDoms = $("#model-branch-container .layer-item-content").find(".checkicon.active");
                        checkDoms.parent().remove();
                        layer.close(index);
                    },
                    btn2: function(index, layer0){
                    },
                    content: '<div style="position:absolute; margin-left:20px;margin-top:22px;"><span>确认删除以下选中的图层数据吗：</span></br>'+insertHtml+'</div>'
                });
                $(".layui-layer-btn0").on("click",$.proxy(removeModelLayer,this));
            }else{
                layer.open({
                    anim: 4,
                    skin: 'layui-layer-lan',
                    area: ['400px', '160px'],
                    shadeClose: true,
                    title: "删除数据",
                    content: '<div style="position:absolu25%;margin-top: 0px;"><span>未选中任何要删除的图层！</span></div>',
                    yes: function(index, layer0){
                        layer.close(index);
                    }
                });
            }
        }
    }

    //移除矢量图层组中图层
    function deleteVectorSrv(layerManager){
        var itemLen = $("#vector-branch-container .layer-item-content").children().length;
        if(itemLen == 0){
            layer.open({
                anim: 4,
                skin: 'layui-layer-lan',
                area: ['400px', '160px'],
                shadeClose: true,
                title: "删除数据",
                content: '<div style="position:absolute;margin-left: 20%;margin-top: 0px;"><span>该图层组下没有加载任何图层数据！</span></div>',
                yes: function(index, layer0){
                    layer.close(index);
                }
            });
        }else{
            var domArray = new Array();
            var insertHtml=new String();
            for(var i=0;i<itemLen;i++){
                var iDom = $($("#layer-action-delete-vector").parent().next().children()[i]).find("i")[1];
                var flag = $(iDom).hasClass("active");
                if(flag){
                    domArray.push($("#layer-action-delete-vector").parent().next().children()[i]);
                }
            }
            for(var i=0;i<domArray.length;i++){
                if(i < domArray.length-1){
                    insertHtml = insertHtml+'<span class="confirm-delete-vector" id=\"'+$(domArray[i]).attr("id")+'\" style="color:#4476a7;font-size:13px;position:relative;left:42%;top:6px;background: #eaeaea;">'+$(domArray[i]).find("span").text()+'</span></br>';
                }else{
                    insertHtml = insertHtml+'<span class="confirm-delete-vector" id=\"'+$(domArray[i]).attr("id")+'\" style="color:#4476a7;font-size:13px;position:relative;left:42%;top:6px;background: #eaeaea;">'+$(domArray[i]).find("span").text()+'</span>';
                }
            }
            if(domArray.length>0){
                layer.open({
                    type: 1,
                    anim: 4,
                    skin: 'layui-layer-lan',
                    area: ['400px', '210px'],
                    title: "删除数据",
                    btn: ['确认', '取消'],
                    yes: function(index, layer0){
                        var checkDoms = $("#vector-branch-container .layer-item-content").find(".checkicon.active");
                        checkDoms.parent().remove();
                        layer.close(index);
                    },
                    btn2: function(index, layer0){
                    },
                    content: '<div style="position:absolute; margin-left:20px;margin-top:22px;"><span>确认删除以下选中的图层数据吗：</span></br>'+insertHtml+'</div>'
                });
                $(".layui-layer-btn0").on("click",$.proxy(removeWfsLayer,this));
            }else{
                layer.open({
                    anim: 4,
                    skin: 'layui-layer-lan',
                    area: ['400px', '160px'],
                    shadeClose: true,
                    title: "删除数据",
                    content: '<div style="position:absolute;margin-left: 25%;margin-top: 0px;"><span>未选中任何要删除的图层！</span></div>',
                    yes: function(index, layer0){
                        layer.close(index);
                    }
                });
            }
        }
    }

    //移除地形图层组中图层
    function deleteTerrainSrv(layerManager){
        var itemLen = $("#terrain-branch-container .layer-item-content").children().length;
        if(itemLen == 0){
            layer.open({
                anim: 4,
                skin: 'layui-layer-lan',
                area: ['400px', '160px'],
                shadeClose: true,
                title: "删除数据",
                content: '<div style="position:absolute;margin-left: 20%;margin-top: 0px;"><span>该图层组下没有加载任何图层数据！</span></div>',
                yes: function(index, layer0){
                    layer.close(index);
                }
            });
        }else{
            var domArray = new Array();
            var insertHtml=new String();
            for(var i=0;i<itemLen;i++){
                var iDom = $($("#layer-action-delete-terrain").parent().next().children()[i]).find("i")[1];
                var flag = $(iDom).hasClass("active");
                if(flag){
                    domArray.push($("#layer-action-delete-terrain").parent().next().children()[i]);
                }
            }
            for(var i=0;i<domArray.length;i++){
                if(i < domArray.length-1){
                    insertHtml = insertHtml+'<span class="confirm-delete-terrain" id=\"'+$(domArray[i]).attr("id")+'\" style="color:#4476a7;font-size:13px;position:relative;left:42%;top:6px;background: #eaeaea;">'+$(domArray[i]).find("span").text()+'</span></br>';
                }else{
                    insertHtml = insertHtml+'<span class="confirm-delete-terrain" id=\"'+$(domArray[i]).attr("id")+'\" style="color:#4476a7;font-size:13px;position:relative;left:42%;top:6px;background: #eaeaea;">'+$(domArray[i]).find("span").text()+'</span>';
                }
            }
            if(domArray.length>0){
                layer.open({
                    type: 1,
                    anim: 4,
                    skin: 'layui-layer-lan',
                    area: ['400px', '210px'],
                    title: "删除数据",
                    btn: ['确认', '取消'],
                    yes: function(index, layer0){
                        var checkDoms = $("#terrain-branch-container .layer-item-content").find(".checkicon.active");
                        checkDoms.parent().remove();
                        layer.close(index);
                    },
                    btn2: function(index, layer0){
                    },
                    content: '<div style="position:absolute; margin-left:20px;margin-top:22px;"><span>确认删除以下选中的图层数据吗：</span></br>'+insertHtml+'</div>'
                });
                $(".layui-layer-btn0").on("click",$.proxy(removeTerrainLayer,this));
            }else{
                layer.open({
                    anim: 4,
                    skin: 'layui-layer-lan',
                    area: ['400px', '160px'],
                    shadeClose: true,
                    title: "删除数据",
                    content: '<div style="position:absolute;margin-left: 25%;margin-top: 0px;"><span>未选中任何要删除的图层！</span></div>',
                    yes: function(index, layer0){
                        layer.close(index);
                    }
                });
            }
        }
    }

    //移除基础图层组中图层
    function deleteBasicSrv(layerManager){
        var itemLen = $("#imagery-branch-container .layer-item-content").children().length;
        if(itemLen == 0){
            layer.open({
                anim: 4,
                skin: 'layui-layer-lan',
                area: ['400px', '160px'],
                shadeClose: true,
                title: "删除数据",
                content: '<div style="position:absolute;margin-left: 20%;margin-top: 0px;"><span>该图层组下没有加载任何图层数据！</span></div>',
                yes: function(index, layer0){
                    layer.close(index);
                }
            });
        }else{
            var domArray = new Array();
            var insertHtml=new String();
            for(var i=0;i<itemLen;i++){
                var iDom = $($("#layer-action-delete-basic").parent().next().children()[i]).find("i")[1];
                var flag = $(iDom).hasClass("active");
                if(flag){
                    domArray.push($("#layer-action-delete-basic").parent().next().children()[i]);
                }
            }
            for(var i=0;i<domArray.length;i++){
                if(i < domArray.length-1){
                    insertHtml = insertHtml+'<span class="confirm-delete-basic" id=\"'+$(domArray[i]).attr("id")+'\" style="color:#4476a7;font-size:13px;position:relative;left:42%;top:6px;background: #eaeaea;">'+$(domArray[i]).find("span").text()+'</span></br>';
                }else{
                    insertHtml = insertHtml+'<span class="confirm-delete-basic" id=\"'+$(domArray[i]).attr("id")+'\" style="color:#4476a7;font-size:13px;position:relative;left:42%;top:6px;background: #eaeaea;">'+$(domArray[i]).find("span").text()+'</span>';
                }
            }
            if(domArray.length>0){
                layer.open({
                    type: 1,
                    anim: 4,
                    skin: 'layui-layer-lan',
                    area: ['400px', '210px'],
                    title: "删除数据",
                    btn: ['确认', '取消'],
                    yes: function(index, layer0){
                        var checkDoms = $("#imagery-branch-container .layer-item-content").find(".checkicon.active");
                        checkDoms.parent().remove();
                        //基础图层组图层上下关系重排列
                        var currentId = $("#layer-action-delete-basic").parent().parent().attr("id");
                        if(currentId == "imagery-branch-container"){
                            //移除原因图层上移下移标识
                            $("#imagery-branch-container").find(".icondown").remove();
                            $("#imagery-branch-container").find(".iconup").remove();
                            //重新插入上移下移图标
                            var layerLen = $("#imagery-branch-container .layer-item-content").children().length;
                            if(layerLen < 2){

                            }else if(layerLen == 2){
                                //最顶层
                                if($("#imagery-branch-container .layer-item-content").children().first()){
                                    $("#imagery-branch-container .layer-item-content").children().first().find("span").append('<i class="icondown"></i>');
                                }
                                //最底层
                                if($("#imagery-branch-container .layer-item-content").children().last()){
                                    $("#imagery-branch-container .layer-item-content").children().last().find("span").append('<i class="iconup"></i>');
                                }
                            }else if(layerLen > 2){
                                //最顶层
                                if($("#imagery-branch-container .layer-item-content").children().first()){
                                    $("#imagery-branch-container .layer-item-content").children().first().find("span").append('<i class="icondown"></i>');
                                }
                                //最底层
                                if($("#imagery-branch-container .layer-item-content").children().last()){
                                    $("#imagery-branch-container .layer-item-content").children().last().find("span").append('<i class="iconup"></i>');
                                }
                                //中间层
                                for(var i=1;i<layerLen-1;i++){
                                    $($("#imagery-branch-container .layer-item-content").children()[i]).find("span").append('<i class="iconup"></i>');
                                    $($("#imagery-branch-container .layer-item-content").children()[i]).find("span").append('<i style="margin-left: 6px;" class="icondown"></i>');
                                }
                            }
                        }
                        layer.close(index);
                    },
                    btn2: function(index, layer0){
                    },
                    content: '<div style="position:absolute; margin-left:20px;margin-top:22px;"><span>确认删除以下选中的图层数据吗：</span></br>'+insertHtml+'</div>'
                });
                $(".layui-layer-btn0").on("click",$.proxy(removeBasicLayer,this));
            }else{
                layer.open({
                    anim: 4,
                    skin: 'layui-layer-lan',
                    area: ['400px', '160px'],
                    shadeClose: true,
                    title: "删除数据",
                    content: '<div style="position:absolute;margin-left: 25%;margin-top: 0px;"><span>未选中任何要删除的图层！</span></div>',
                    yes: function(index, layer0){
                        layer.close(index);
                    }
                });
            }
        }
    }

    //请求接口生成model图层对象
    function generateModelLayer(layerManager){
        if($("#checkedMark").html() != "verified"){
            return;
        }else{
            var serviceUrl = $("#lm-srvURL-model").val();
            var url = serviceUrl;
            if(serviceUrl.endsWith(".json")){
                url = "/proxyHandler?url="+serviceUrl;
            }
            var format = new GeoGlobe.Format.JSON();
            GeoGlobe.Request.GET({
                url: url,
                async:false,
                success: function(request){
                    try {
                        if(request){
                            var document = format.read(request.responseText);
                            var modelLayerGroup = layerManager.getModelLayerGroup();
                            var modelName = $($("#model-branch-container .layer-item-content span")[0]).html();
                            // 添加三维模型服务
                            var tileset = modelLayerGroup.addLayer(modelName, new Cesium.Cesium3DTileset({
                                url : serviceUrl
                            }));
                            tileset.readyPromise.then(function(tileset) {
                                layerManager.map.camera.viewBoundingSphere(tileset.boundingSphere, new Cesium.HeadingPitchRange(0, -1, 0));
                                layerManager.map.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
                            });
                            layerManager.map.trackedEntity = tileset;
                        }else{
                            console.log("service capabilities request no result!");
                        }
                    }catch (e) {
                        console.log("service capabilities test error!");
                    }
                },
                failure: function(){
                    console.log("service capabilities request error!");
                }
            });
        }
    }

    //请求接口生成wfs图层对象
    function generateWfsLayer(layerManager){
        var that = this;
        var checkRes = $("#lm-srvURL-vector").hasClass("check-true");
        // TODO使用原生js解析documentXML
        var format = new GeoGlobe.Format.WFSCapabilities();
        var layerArray = [];
        if(checkRes){
            var serviceUrl =  $("#lm-srvURL-vector").val();
            var url;
            if(serviceUrl.indexOf("?")>0){
                url = TDT.getAppPath("")+"proxyHandler?url="+serviceUrl+"&service=wfs";
            }else{
                url = TDT.getAppPath("")+"proxyHandler?url="+serviceUrl+"?service=wfs";
            }
            GeoGlobe.Request.GET({
                url: url,
                params: {
                    request: "GetCapabilities",
                    version:"1.1.0"
                },
                async:false,
                success: function(request){
                    try {
                        if(request){
                            var doc = request.responseText;
                            var jsonOnj = new GeoGlobe.Format.WFSCapabilities.v1().read(doc);
                            layerArray = WFSAnalyzer(jsonOnj);

                            var viewer = layerManager.getMap();
                            var vectorLayerGroup = layerManager.getVectorLayerGroup();

                            var layerIdx = 0;//图层索引
                            for(var j=0;j<layerArray.length;j++){
                                // 创建查询实例
                                var wfsQuery = new GeoGlobe.Query.WFSQuery("/proxyHandler?url="+$("#lm-srvURL-vector").val(),layerArray[j].name,{
                                    maxFeatures:5000
                                });
                                wfsQuery.query(null,function(features){
                                    var data = features.geojson;
                                    //点预绘制
                                    if(data.features[0].geometry.type == "Point"){
                                        for(var i=0;i<data.features.length;i++){
                                            data.features[i].properties["marker-color"] = "#FFFE35";
                                            data.features[i].properties["marker-symbol"] = "marker";
                                            data.features[i].properties["marker-size"] = "small";
                                        }
                                    }
                                    //Cesium.Math.setRandomNumberSeed(j);
                                    //服务添加至地图上
                                    var promise=Cesium.GeoJsonDataSource.load(data,{
                                    	clampToGround : true
                                    });
                                    promise.then(function(dataSource) {
                                        var layerName = layerArray[layerIdx].name;
                                        var vectorDom = $("#vector-branch-container .layer-item-content");
                                        for(var i = 0; i < $(vectorDom).find("div").length; i++){
                                            if(layerName == $($(vectorDom).find("span")[i]).html()){
                                                dataSource.id = $($(vectorDom).find("div")[i]).attr("id");
                                                break;
                                            }
                                        }
                                        var layerId = vectorLayerGroup.addLayer(layerName,dataSource);
                                        var entities = dataSource.entities.values;
                                        for (var i = 0; i < entities.length; i++) {
                                            var entity = entities[i];
                                            //线绘制
                                            if(entity.polyline){
                                                entity.polyline.shadows = Cesium.ShadowMode.ENABLED;
                                                entity.polyline.material = Cesium.Color.YELLOW;
                                                entity.polyline.width = 1;
                                                //面绘制
                                            }else if(entity.polygon){
                                                entity.polygon.material = Cesium.Color.fromAlpha(Cesium.Color.YELLOW,0.5);
                                                entity.polygon.outline = true;
                                                entity.polygon.outlineColor = Cesium.Color.YELLOW;
                                                entity.polygon.outlineWidth = 5;
                                                //entity.polygon.extrudedHeight = parseInt(Math.random()*10 + 5, 30);
                                                //点绘制
                                            }else{
                                                entity.point = new 	Cesium.PointGraphics({color:Cesium.Color.YELLOW,outlineColor:Cesium.Color.YELLOW,pixelSize:0})
                                            }
                                        }
                                        layerIdx++;
                                    });
                                    layerManager.getMap().flyTo(promise);
                                });
                            }
                        }else{
                            console.log("service capabilities request no result!");
                        }
                    }catch (e) {
                        console.log("service capabilities test error!");
                    }
                },
                failure: function(){
                    console.log("service capabilities test error!");
                }
            });
        }
    }

    //请求接口生成wmts图层对象
    function generateBasicLayer(layerManager){
        var serviceType = $("#basicServiceType").val();
        if(serviceType == "WMTS"){
            generateWmtsLayer(layerManager);
        }else if(serviceType == "WMS"){
            generateWmsLayer(layerManager);
        }else if(serviceType == "TILE"){
            generateTileLayer(layerManager);
        }
    }

    //请求接口生成wmts图层对象
    function generateWmtsLayer(layerManager){
        var checkRes = $("#lm-srvURL-imagery").hasClass("check-true");
        if(checkRes){
            //请求wmts接口，获取服务参数
            var serviceUrl = $.trim($("#lm-srvURL-imagery").val());
            if(serviceUrl.indexOf("/wmts")>0){
                var url = "/proxyHandler?url="+serviceUrl+"?service=wmts&REQUEST=GetCapabilities";
            }else{
                var url = "/proxyHandler?url="+serviceUrl+"/wmts?service=wmts&REQUEST=GetCapabilities";
            }
            // TODO使用原生js解析documentXML
            var format = new GeoGlobe.Format.WMTSCapabilities();
            var layerArray = [];
            GeoGlobe.Request.GET({
                url: url,
                params: {
                    REQUEST: "GetCapabilities"
                },
                async:false,
                success: function(request){
                    try {
                        if(request){
                            var json = format.read(request.responseText);
                            var layerArray = WMTSAnalyzer(json);

                            var cesiumProxy = new Cesium.DefaultProxy("/proxyHandler?url=");
                            //适配多图层
                            for(var i=0;i<layerArray.length;i++){
                                var options = layerArray[i];
                                var _matrixIds = [];
                                var tileMatrixLabels = [];
                                for(var j=0;j<options.matrixIds.length;j++){
                                    if(!options.matrixIds[j].islevelhidden){
                                        _matrixIds.push(options.matrixIds[j]);
                                        tileMatrixLabels.push((j+1).toString());
                                    }
                                }
                                var boundingBox = options.boundingBox[i].bounds._sw.lng +","+options.boundingBox[i].bounds._sw.lat +","+options.boundingBox[i].bounds._ne.lng +","+options.boundingBox[i].bounds._ne.lat;
                                var extentArray = boundingBox.split(",");
                                var rectangle = Cesium.Rectangle.fromDegrees(extentArray[0],extentArray[1],extentArray[2],extentArray[3]);

                                //创建Cesium的wmts图层
                                var basicLayer = new Cesium.WebMapTileServiceImageryProvider({
                                    url: $("#lm-srvURL-imagery").val(),
                                    layer: options.name,
                                    style: options.style,
                                    format: options.format,
                                    tileMatrixSetID: options.matrixSet,
                                    tilingScheme: new Cesium.GeographicTilingScheme(),
                                    tileMatrixLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'],
                                    maximumLevel: options.matrixIds[options.matrixIds.length-1].identifier-1,
                                    rectangle: rectangle,
                                    proxy: cesiumProxy
                                });

                                //服务添加至地图上
                                var basicLayerGroup = layerManager.getBasicLayerGroup();
                                var layerId = basicLayerGroup.addLayer(options.name,basicLayer);
                            }
                        }else{
                            console.log("service capabilities request no result!");
                        }
                    }catch (e) {
                        console.log("service capabilities request error!");
                    }
                },
                failure: function(){
                    console.log("service capabilities request error!");
                }
            });
        }
    }

    //请求接口生成wms图层对象
    function generateWmsLayer(layerManager){
        var checkRes = $("#lm-srvURL-imagery").hasClass("check-true");
        if(checkRes){
            //请求wmts接口，获取服务参数
            var serviceUrl = $.trim($("#lm-srvURL-imagery").val());
            if(serviceUrl.indexOf("/wms")>0){
                var url = "/proxyHandler?url="+serviceUrl+"?service=wms&REQUEST=GetCapabilities";
            }else{
                var url = "/proxyHandler?url="+serviceUrl+"/wms?service=wms&REQUEST=GetCapabilities";
            }
            // TODO使用原生js解析documentXML
            var format = new GeoGlobe.Format.WMSCapabilities();
            var layerArray = [];
            GeoGlobe.Request.GET({
                url: url,
                params: {
                    REQUEST:"GetCapabilities",
                    version:"1.1.1"
                },
                async:false,
                success: function(request){
                    try {
                        if(request){
                            var json = format.read(request.responseText);
                            var layerArray = WMSAnalyzer(json);

                            var cesiumProxy = new Cesium.DefaultProxy("/proxyHandler?url=");
                            for(var i=0;i<layerArray.length;i++){
                                var options = layerArray[i];
                                var llbbox =  options.llbbox;
                                var rectangle = Cesium.Rectangle.fromDegrees(llbbox[0], llbbox[1], llbbox[2], llbbox[3]);

                                //创建Cesium的wms图层
                                var basicLayer = new Cesium.WebMapServiceImageryProvider({
                                    url: $.trim($("#lm-srvURL-imagery").val()),
                                    layers: layerArray[i].name,
                                    parameters: {
                                        format: "image/png",
                                        transparent: true
                                    },
                                    rectangle: rectangle,
                                    proxy: cesiumProxy
                                });

                                //服务添加至地图上
                                var basicLayerGroup = layerManager.getBasicLayerGroup();
                                var layerId = basicLayerGroup.addLayer(layerArray[i].name,basicLayer);
                            }
                        }else{
                            console.log("service capabilities request no result!");
                        }
                    }catch (e) {
                        console.log("service capabilities request error!");
                    }
                },
                failure: function(){
                    console.log("service capabilities request error!");
                }
            });
        }
    }

    function generateTileLayer(layerManager){
        var checkRes = $("#lm-srvURL-imagery").hasClass("check-true");
        if(checkRes){
            //请求wmts接口，获取服务参数
            var serviceUrl = $.trim($("#lm-srvURL-imagery").val());
            if(serviceUrl.endsWith("services/tile")){
                var url = "/proxyHandler?url="+serviceUrl+"/GetCapabilities";
            }
            var format = new GeoGlobe.Format.XML();
            GeoGlobe.Request.GET({
                url: url,
                async:false,
                success: function(request){
                    try {
                        if(request){
                            var document = format.read(request.responseText);
                            var boundBoxArray = [];
                            if(document.getElementsByTagName("TileData").length>0){
                                var layerName = document.getElementsByTagName("Name")[0].innerHTML;
                                var maximumLevel = document.getElementsByTagName("BottomLevel")[0].innerHTML;
                                var boundBox = document.getElementsByTagName("BoundBox")[0].attributes;
                                for(var i=0;i<boundBox.length;i++){
                                    var singelBound = boundBox[i].value;
                                    boundBoxArray.push(singelBound);
                                }
                                var rectangle = Cesium.Rectangle.fromDegrees(boundBoxArray[0], boundBoxArray[1], boundBoxArray[2], boundBoxArray[3]);
                            }
                            var requestUrl = serviceUrl.split("/services/tile")[0]+"/DataServer?T=tile&x={x}&y={y}&l={z}";
                            var cesiumProxy = new Cesium.DefaultProxy("/proxyHandler?url=");
                            //创建Cesium的tile图层
                            var tileLayer = new Cesium.UrlTemplateImageryProvider({
                                //url: "http://t2.tianditu.com/DataServer?T=vec_c&x={x}&y={y}&l={z}",
                                url: requestUrl,
                                tilingScheme : new Cesium.GeographicTilingScheme(),
                                maximumLevel: maximumLevel,
                                rectangle : rectangle,
                                proxy: cesiumProxy,
                                customTags: {
                                    z: function(imageryProvider, x, y, level) {
                                        return level+1;
                                    }
                                }
                            });
                            //服务添加至地图上
                            var basicLayerGroup = layerManager.getBasicLayerGroup();
                            var layerId = basicLayerGroup.addLayer(layerName,tileLayer);
                        }else{
                            console.log("service capabilities request no result!");
                        }
                    }
                    catch (e) {
                        console.log("service capabilities request error!");
                    }
                },
                failure: function(){
                    console.log("service capabilities request error!");
                }
            });
        }
    }

    //请求接口生成terrain图层对象
    function generateTerrainLayer(layerManager){
        if($("#checkedMark").html() != "verified"){
            return;
        }else{
            var url = $("#lm-srvURL-terrain").val();
            if(url.indexOf("/services/tile") > 0){
                url = "/proxyHandler?url="+url+"/GetCapabilities";
            }else{
                url = "/proxyHandler?url="+url+"/services/tile/GetCapabilities";
            }
            var format = new GeoGlobe.Format.XML();
            GeoGlobe.Request.GET({
                url: url,
                async:false,
                success: function(request){
                    try {
                        var document = format.read(request.responseText);
                        if(document.getElementsByTagName("ServiceCapabilities").length){
                            $("#srvipt-item").after('<div id="srvCheckRes" style="font-size:14px;color:green;position:absolute;margin-top:47px;left:22%;"><span>服务验证成功！</span></div>');
                            $("#srvipt-item").after('<div id="srvipt-name" style="position:absolute; margin-left:20px;margin-top:70px;"><span id="name-span">图层名称：</span><input id="lm-srvname-terrain" class="lm-name" guid='+ Cesium.createGuid() +'></div>');
                            var terrainSrvName= document.getElementsByTagName("Name")[0].childNodes[0].nodeValue;
                            $("#lm-srvname-terrain").val(terrainSrvName);
                            $(".lm-ipt").addClass("check-true");
                            var options = {credit:null,maxExtent:null,opacity:"1",topLevel:null,bottomLevel:null};
                            options.credit = $("#terrain-branch-container .layer-item-content").children(":first").attr("id");
                            var minx = document.getElementsByTagName("BoundBox")[0].getAttribute("minx");
                            var miny = document.getElementsByTagName("BoundBox")[0].getAttribute("miny");
                            var maxx = document.getElementsByTagName("BoundBox")[0].getAttribute("maxx");
                            var maxy = document.getElementsByTagName("BoundBox")[0].getAttribute("maxy");
                            options.maxExtent = minx+','+miny+','+maxx+','+maxy;
                            options.topLevel = document.getElementsByTagName("TopLevel")[0].childNodes[0].nodeValue;
                            options.bottomLevel = document.getElementsByTagName("BottomLevel")[0].childNodes[0].nodeValue;
                            options.dataType = document.getElementsByTagName("DEMDataType")[0].childNodes[0].nodeValue;
                            var dataType = Cesium.GeoTerrainProvider.FLOAT;
                            if(options.dataType.toUpperCase().indexOf("INT") > -1){
                            	dataType = Cesium.GeoTerrainProvider.INT;
                            }
                            var terrainLayer = new Cesium.GeoTerrainProvider({
                                proxy: new Cesium.DefaultProxy("/proxyHandler?url="),
                                dataType: dataType,
                                urls: [$("#lm-srvURL-terrain").val().replace('services/tile','DataServer')],
                                credit: options.credit,
                                name: terrainSrvName,
                                maxExtent: options.maxExtent,
                                opacity: options.opacity,
                                topLevel: options.topLevel,
                                bottomLevel: options.bottomLevel
                            });
                            //服务添加至地图上
                            var terrainLayerGroup = layerManager.getTerrainLayerGroup();
                            var layerId = terrainLayerGroup.addLayer(terrainSrvName,terrainLayer);
                        }else{
                            console.log("service capabilities request no result!");
                        }

                    }catch (e) {
                        console.log("service capabilities test error!");
                    }
                },
                failure: function(){
                    console.log("service capabilities request error!");
                }
            });
        }
    }

    //移除model具体实现
    function removeModelLayer(evt){
        //获取删除图层的id
        var modelLayerGroup = this.layerManager.getModelLayerGroup();
        var deleteDom = $(evt.target).parent().parent().find(".layui-layer-content .confirm-delete-model");
        for(var i=0;i<deleteDom.length;i++){
            if($(deleteDom[i]).attr("id")){
                var currentId = $(deleteDom[i]).attr("id");
                modelLayerGroup.removeLayer(currentId);
            }
        }
    }

    //移除wfs具体实现
    function removeWfsLayer(evt){
        //获取删除图层的id
        var vectorLayerGroup = this.layerManager.getVectorLayerGroup();
        var deleteDom = $(evt.target).parent().parent().find(".layui-layer-content .confirm-delete-vector");
        for(var i=0;i<deleteDom.length;i++){
            if($(deleteDom[i]).attr("id")){
                var currentId = $(deleteDom[i]).attr("id");
                vectorLayerGroup.removeLayer(currentId);
            }
        }
    }

    //移除wmts具体实现
    function removeBasicLayer(evt){
        //获取删除图层的id
        var basicLayerGroup = this.layerManager.getBasicLayerGroup();
        var deleteDom = $(evt.target).parent().parent().find(".layui-layer-content .confirm-delete-basic");
        for(var i=0;i<deleteDom.length;i++){
            if($(deleteDom[i]).attr("id")){
                var currentId = $(deleteDom[i]).attr("id");
                basicLayerGroup.removeLayer(currentId);
            }
        }
    }

    //移除terrain具体实现
    function removeTerrainLayer(evt){
        //获取删除图层的id
        var terrainLayerGroup = this.layerManager.getTerrainLayerGroup();
        var deleteDom = $(evt.target).parent().parent().find(".layui-layer-content .confirm-delete-terrain");
        for(var i=0;i<deleteDom.length;i++){
            if($(deleteDom[i]).attr("id")){
                var currentId = $(deleteDom[i]).attr("id");
                terrainLayerGroup.removeLayer(currentId);
            }
        }
    }

    //显示隐藏模型图层
    function showHidemodel(evt){
        var layerId = $(evt.target).parent().attr("id");
        var modelLayerGroup = this.layerManager.getModelLayerGroup();

        var hideFlag = $(evt.target).hasClass("active");
        // 隐藏图层
        if(hideFlag){
            modelLayerGroup.hideLayer(layerId);
            //显示图层
        }else{
            modelLayerGroup.showLayer(layerId);
        }
    }

    //显示隐藏矢量图层
    function showHideVector(evt){
        var vectorLayerGroup = this.layerManager.getVectorLayerGroup();
        var hideFlag = $(evt.target).hasClass("active");
        var layerId = $(evt.target).parent().attr("id");
        // 隐藏图层
        if(hideFlag){
            vectorLayerGroup.hideLayer(layerId);
            //显示图层
        }else{
            vectorLayerGroup.showLayer(layerId);
        }
    }

    //显示隐藏地形图层
    function showHideTerrain(evt){
        var terrainLayerGroup = this.layerManager.getTerrainLayerGroup();
        var hideFlag = $(evt.target).hasClass("active");
        var layerId = $(evt.target).parent().attr("id");
        // 隐藏图层
        if(hideFlag){
            terrainLayerGroup.hideLayer(layerId);
            //显示图层
        }else{
            terrainLayerGroup.showLayer(layerId);
        }
    }

    //显示隐藏基础图层
    function showHideBasic(evt){
        if($(evt.target).parent().hasClass("tileCoordinates")){
            var hideFlag = $(evt.target).hasClass("active");
            var layerId = $(evt.target).parent().attr("id");
            var gridLayer;
            // 隐藏图层
            if(hideFlag){
                for(var i=0;i<this.layerManager.map.imageryLayers.length; i++){
                    if(this.layerManager.map.imageryLayers._layers[i]._imageryProvider instanceof Cesium.GridImageryProvider){
                        gridLayer = this.layerManager.map.imageryLayers._layers[i];
                        gridLayer.show = false;
                        break;
                    }
                }
                //显示图层
            }else{
                for(var i=0;i<this.layerManager.map.imageryLayers.length; i++){
                    if(this.layerManager.map.imageryLayers._layers[i]._imageryProvider instanceof Cesium.GridImageryProvider){
                        gridLayer = this.layerManager.map.imageryLayers._layers[i];
                        break;
                    }
                }
                if(gridLayer){
                    gridLayer.show = true;
                }else{
                    var gridLayer = new Cesium.GridImageryProvider({
                        tilingScheme: new Cesium.GeographicTilingScheme(),
                        cells: 18,
                        color: Cesium.Color.WHITE,
                        glowColor: Cesium.Color.WHITE,
                        glowWidth: 1.5,
                        tileWidth: 2048,
                        tileHeight: 2048,
                        canvasSize: 2048,
                        backgroundColor: Cesium.Color.WHITE.withAlpha(0.0)
                    });
                    //gridProvider.maximumLevel = 12;
                    //gridProvider.minimumLevel = 1;
                    this.layerManager.map.imageryLayers.addImageryProvider(gridLayer);
                }
            }
        }else{
            var basicLayerGroup = this.layerManager.getBasicLayerGroup();
            var hideFlag = $(evt.target).hasClass("active");
            var layerId = $(evt.target).parent().attr("id");
            // 隐藏图层
            if(hideFlag){
                basicLayerGroup.hideLayer(layerId);
                //显示图层
            }else{
                basicLayerGroup.showLayer(layerId);
            }
        }
    }

    function showTileCoordinates(){
        //创建Cesium的经纬网
        var tileCoordinates = new Cesium.TileCoordinatesImageryProvider({
            tilingScheme: new Cesium.GeographicTilingScheme(),
        });
    }

    //显示隐藏所有的模型图层
    function showHidemodelAll(evt){
        var hideFlag = $(evt.target).hasClass("active");
        var modelLayerGroup = this.layerManager.getModelLayerGroup();

        if($("#model-branch-container .layer-item-content .checkicon").length > 0){
            var modelLayerGroup = this.layerManager.getModelLayerGroup();
            var hideFlag = $(evt.target).hasClass("active");
            // 隐藏图层
            if(hideFlag){
                for(var i=0;i<$("#model-branch-container .layer-item-content .checkicon").length;i++){
                    if($($("#model-branch-container .layer-item-content .checkicon")[i]).hasClass("active")){
                        var layerId = $($("#model-branch-container .layer-item-content .checkicon")[i]).parent().attr("id");
                        modelLayerGroup.hideLayer(layerId);
                    }
                }
                //显示图层
            }else{
                for(var i=0;i<$("#model-branch-container .layer-item-content .checkicon").length;i++){
                    if(!$($("#model-branch-container .layer-item-content .checkicon")[i]).hasClass("active")){
                        var layerId = $($("#model-branch-container .layer-item-content .checkicon")[i]).parent().attr("id");
                        modelLayerGroup.showLayer(layerId);
                    }
                }
            }
        }else{
            layer.open({
                anim: 4,
                skin: 'layui-layer-lan',
                area: ['400px', '160px'],
                shadeClose: true,
                title: "提示",
                content: '<div style="position:absolute;margin-left: 1%;margin-top: 0px;"><span>该图层组下没有加载任何图层数据，请加载图层后操作！</span></div>',
                yes: function(index, layer0){
                    layer.close(index);
                }
            });
        }
    }

    //显示隐藏所有的矢量图层
    function showHideVectorAll(evt){
        if($("#vector-branch-container .layer-item-content .checkicon").length > 0){
            var vectorLayerGroup = this.layerManager.getVectorLayerGroup();
            var hideFlag = $(evt.target).hasClass("active");
            // 隐藏图层
            if(hideFlag){
                for(var i=0;i<$("#vector-branch-container .layer-item-content .checkicon").length;i++){
                    if($($("#vector-branch-container .layer-item-content .checkicon")[i]).hasClass("active")){
                        var layerId = $($("#vector-branch-container .layer-item-content .checkicon")[i]).parent().attr("id");
                        vectorLayerGroup.hideLayer(layerId);
                    }
                }
                //显示图层
            }else{
                for(var i=0;i<$("#vector-branch-container .layer-item-content .checkicon").length;i++){
                    if(!$($("#vector-branch-container .layer-item-content .checkicon")[i]).hasClass("active")){
                        var layerId = $($("#vector-branch-container .layer-item-content .checkicon")[i]).parent().attr("id");
                        vectorLayerGroup.showLayer(layerId);
                    }
                }
            }
        }else{
            layer.open({
                anim: 4,
                skin: 'layui-layer-lan',
                area: ['400px', '160px'],
                shadeClose: true,
                title: "提示",
                content: '<div style="position:absolute;margin-left: 1%;margin-top: 0px;"><span>该图层组下没有加载任何图层数据，请加载图层后操作！</span></div>',
                yes: function(index, layer0){
                    layer.close(index);
                }
            });
        }
    }

    //显示隐藏所有的地形图层
    function showHideTerrainAll(evt){
        if($("#terrain-branch-container .layer-item-content .checkicon").length > 0){
            var terrainLayerGroup = this.layerManager.getTerrainLayerGroup();
            var hideFlag = $(evt.target).hasClass("active");
            var layerId = $("#terrain-branch-container .layer-item-content .checkicon").parent().attr("id");
            // 隐藏图层
            if(hideFlag){
                terrainLayerGroup.hideLayer(layerId);
                //显示图层
            }else{
                terrainLayerGroup.showLayer(layerId);
            }
        }else{
            layer.open({
                anim: 4,
                skin: 'layui-layer-lan',
                area: ['400px', '160px'],
                shadeClose: true,
                title: "提示",
                content: '<div style="position:absolute;margin-left: 1%;margin-top: 0px;"><span>该图层组下没有加载任何图层数据，请加载图层后操作！</span></div>',
                yes: function(index, layer0){
                    layer.close(index);
                }
            });
        }
    }

    //显示隐藏所有的基础图层
    function showHideBasicAll(evt){
        if($("#imagery-branch-container .layer-item-content .checkicon").length > 0){
            var basicLayerGroup = this.layerManager.getBasicLayerGroup();
            var hideFlag = $(evt.target).hasClass("active");
            // 隐藏图层
            if(hideFlag){
                for(var i=0;i<$("#imagery-branch-container .layer-item-content .checkicon").length;i++){
                    if($($("#imagery-branch-container .layer-item-content .checkicon")[i]).hasClass("active")){
                        var layerId = $($("#imagery-branch-container .layer-item-content .checkicon")[i]).parent().attr("id");
                        basicLayerGroup.hideLayer(layerId);
                    }
                }
                //显示图层
            }else{
                for(var i=0;i<$("#imagery-branch-container .layer-item-content .checkicon").length;i++){
                    if(!$($("#imagery-branch-container .layer-item-content .checkicon")[i]).hasClass("active")){
                        var layerId = $($("#imagery-branch-container .layer-item-content .checkicon")[i]).parent().attr("id");
                        basicLayerGroup.showLayer(layerId);
                    }
                }
            }
        }else{
            layer.open({
                anim: 4,
                skin: 'layui-layer-lan',
                area: ['400px', '160px'],
                shadeClose: true,
                title: "提示",
                content: '<div style="position:absolute;margin-left: 1%;margin-top: 0px;"><span>该图层组下没有加载任何图层数据，请加载图层后操作！</span></div>',
                yes: function(index, layer0){
                    layer.close(index);
                }
            });
        }
    }

    //上移基础图层
    function raiseBasicLayer(evt){
        var layerId = $(evt.target).parent().parent().attr("id");
        $(evt.target).parent().parent().insertBefore($(evt.target).parent().parent().prev());
        loadLayerOrder();
        var basicLayerGroup = this.layerManager.getBasicLayerGroup();
        basicLayerGroup.raiseLayer(layerId);
    }

    //下移基础图层
    function lowerBasicLayer(evt){
        var layerId = $(evt.target).parent().parent().attr("id");
        $(evt.target).parent().parent().next().insertBefore($(evt.target).parent().parent());
        loadLayerOrder();
        var basicLayerGroup = this.layerManager.getBasicLayerGroup();
        basicLayerGroup.lowerLayer(layerId);
    }

    //点击模型图层，镜头移动到图层范围
    function flytoModelLayer(evt){
        var checkState = $(evt.target).parent().find(".checkicon").hasClass("active");
        if(checkState){
            var layerId = $(evt.target).parent().attr("id");
            var modelLayerGroup = this.layerManager.getModelLayerGroup();
            var targetLayer = modelLayerGroup.getLayer(layerId);
            var viewer = this.layerManager.getMap();
            if(targetLayer){
                viewer.camera.viewBoundingSphere(targetLayer.boundingSphere, new Cesium.HeadingPitchRange(0, -1, 0));
                viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
                viewer.trackedEntity = targetLayer;
            }
        }
    }

    //点击矢量图层，镜头移动到图层范围
    function flytoVectorLayer(evt){
        var checkState = $(evt.target).parent().find(".checkicon").hasClass("active");
        if(checkState){
            var layerId = $(evt.target).parent().attr("id");
            var vectorLayerGroup = this.layerManager.getVectorLayerGroup();
            var vectorLayer = vectorLayerGroup.getLayer(layerId);
            var viewer = this.layerManager.getMap();
            if(vectorLayer){
                viewer.flyTo(vectorLayer);
            }
        }
    }

    //点击地形图层，镜头移动到图层范围
    function flytoTerrainLayer(evt){
        var checkState = $(evt.target).parent().find(".checkicon").hasClass("active");
        if(checkState){
            var layerId = $(evt.target).parent().attr("id");
            var terrainLayerGroup = this.layerManager.getTerrainLayerGroup();
            var terrainLayer = terrainLayerGroup.getLayer(layerId);
            var viewer = this.layerManager.getMap();
            var extentArray = terrainLayer._maxExtent.split(",");
            var rectangle = Cesium.Rectangle.fromDegrees(extentArray[0],extentArray[1],extentArray[2],extentArray[3]);
            if(terrainLayer){
                viewer.camera.flyTo({
                    destination : rectangle,
                    duration:4,
                    orientation: {
                        heading : Cesium.Math.toRadians(0.0), //默认值
                        pitch : Cesium.Math.toRadians(-90.0), // 默认值
                        roll : 0.0 //默认值
                    }
                });
            }
        }
    }

    //点击基础图层，镜头移动到图层范围
    function flytoBasicLayer(evt){
        var checkState = $(evt.target).parent().find(".checkicon").hasClass("active");
        if(checkState){
            var layerId = $(evt.target).parent().attr("id");
            var basicLayerGroup = this.layerManager.getBasicLayerGroup();
            var basicLayer = basicLayerGroup.getLayer(layerId);
            var viewer = this.layerManager.getMap();
            if(basicLayer){
                viewer.flyTo(basicLayer);
            }
        }
    }

    //读取图层管理model，图层结构
    function readScenario(map3d){
        if($("#layermanagerPanelContent3d").children().length > 0){
            return;
        }
        if(map3d instanceof(Cesium.Viewer)){
            var basicLayerGroup = map3d.layerManager.getBasicLayerGroup();
            var basicLayer = basicLayerGroup.getLayer();
            for(var i=0;i<basicLayer.length;i++){
                if(basicLayer[i].id == "" || basicLayer[i].id == undefined){
                    basicLayer[i].id = Cesium.createGuid();
                }
            }

            var terrainLayerGroup = map3d.layerManager.getTerrainLayerGroup();
            var terrainLayer = terrainLayerGroup.getLayer();

            var modelLayerGroup = map3d.layerManager.getModelLayerGroup();
            var modelLayer = modelLayerGroup.getLayer();
            for(var i=1;i<modelLayer.length;i++){
                if(modelLayer[i] instanceof Cesium.Cesium3DTileset){
                    if(modelLayer[i].id == "" || modelLayer[i].id == undefined){
                        modelLayer[i].id = Cesium.createGuid();
                    }
                }
            }
        }else if(map3d instanceof(Cesium.LayerManager)){
            var basicLayerGroup = map3d.getBasicLayerGroup();
            var basicLayer = basicLayerGroup.getLayer();
            for(var i=0;i<basicLayer.length;i++){
                if(basicLayer[i].id == "" || basicLayer[i].id == undefined){
                    basicLayer[i].id = Cesium.createGuid();
                }
            }

            var terrainLayerGroup = map3d.getTerrainLayerGroup();
            var terrainLayer = terrainLayerGroup.getLayer();

            var modelLayerGroup = map3d.getModelLayerGroup();
            var modelLayer = modelLayerGroup.getLayer();
            for(var i=1;i<modelLayer.length;i++){
                if(modelLayer[i] instanceof Cesium.Cesium3DTileset){
                    if(modelLayer[i].id == "" || modelLayer[i].id == undefined){
                        modelLayer[i].id = Cesium.createGuid();
                    }
                }
            }
        }

        var htmlIst = '';
        htmlIst += "<div class=\"lm-scroll-box\"><div class=\"lm-analysis-panel\" id=\"lm-analysis-panel\" style=\"display: block;\">";
        htmlIst += "<div class=\"lm-analy-body\" id=\"lm-analy-body\"><div class=\"layer-content\">";

        htmlIst += "<div class=\"layer-item active\" id=\"mark-branch-container\">";
        htmlIst += "<div class=\"layer-item-title\"  node-guid=\"d1a84c69-d4a4-47c7-b455-ee19172c9ccc\">	<i class=\"arrow\"></i>	<i class=\"checkicon active\"></i>	<i class=\"typeicon iconmarker\"></i><span>标绘图层</span><i class=\"layer-action-expand\"></i>	<i class=\"layer-action-remove\"></i>";
        htmlIst += "</div>";
        htmlIst += "<div class=\"layer-item-content\" id=\"mark-container\">";
        htmlIst += "<div class=\"layer-item-title\"  node-guid=\"c3c18e21-9759-4d4a-bf0f-ded914a2af3c\">	<i class=\"arrow\"></i>	<i class=\"checkicon active\"></i>	<i class=\"typeicon icondirectory\"></i><span>点标绘</span>   <i class=\"layer-action-remove\"></i></div>";
        htmlIst += "<div class=\"layer-item-content\" id=\"c3c18e21-9759-4d4a-bf0f-ded914a2af3c\"></div>";
        htmlIst += "<div class=\"layer-item-title\"  node-guid=\"8b71e4bc-51a4-48fd-97c9-4812c2410f14\">	<i class=\"arrow\"></i>	<i class=\"checkicon active\"></i>	<i class=\"typeicon icondirectory\"></i><span>线标绘</span>   <i class=\"layer-action-remove\"></i></div>";
        htmlIst += "<div class=\"layer-item-content\" id=\"8b71e4bc-51a4-48fd-97c9-4812c2410f14\"></div>";
        htmlIst += "<div class=\"layer-item-title\"  node-guid=\"223b1047-9386-416b-bfc9-7b87eb144182\">	<i class=\"arrow\"></i>	<i class=\"checkicon active\"></i>	<i class=\"typeicon icondirectory\"></i><span>面标绘</span>   <i class=\"layer-action-remove\"></i></div>";
        htmlIst += "<div class=\"layer-item-content\" id=\"223b1047-9386-416b-bfc9-7b87eb144182\"></div>";
        htmlIst += "</div></div>";

        htmlIst += "<div class=\"layer-item active\" id=\"vector-branch-container\">";
        htmlIst += "<div class=\"layer-item-title\" shp-node=\"shp\">	<i class=\"arrow\"></i>	<i class=\"checkicon active\"></i>	<i class=\"typeicon iconmodel\"></i>	<span>矢量图层</span>	<i id=\"layer-action-add-vector\" class=\"layer-action-add\"></i>	<i id=\"layer-action-delete-vector\" class=\"layer-action-delete\"></i>";
        htmlIst += "</div>";

        htmlIst += "<div class=\"layer-item-content\">";
        htmlIst += "<\/div>	<\/div>";

        //模型图层dom拼接
        var modelStr = '<div class="layer-item active" id="model-branch-container">	<div class="layer-item-title" model-node="oblique">	<i class="arrow"></i>	<i class="checkicon active"></i>	<i class="typeicon icondixing"></i>	<span>模型图层</span>	<i id="layer-action-add-model" class="layer-action-add"></i>	<i id="layer-action-delete-model" class="layer-action-delete"></i>	</div>	<div class="layer-item-content">	';
        for(var i=1;i<modelLayer.length;i++){
            if(modelLayer[i] instanceof Cesium.Cesium3DTileset){
                var modelLayerName = modelLayer[i].name;
                var modelLayerId = modelLayer[i].id;
                modelStr = modelStr + '<div class="layer-item-title" id=\"'+modelLayerId+'\">	<i class=""></i>	<i class="checkicon active"></i>	<i class="typeicon iconlocal"></i>	<span>'+modelLayerName+'</span>	</div>';
            }
        }
        modelStr = modelStr + '</div>	</div>	';
        //地形图层dom拼接
        var terrainStr = '<div class="layer-item active" id="terrain-branch-container">	<div class="layer-item-title" terrain-node="stk">	<i class="arrow"></i>	<i class="checkicon active"></i>	<i class="typeicon icondixing"></i>	<span>地形图层</span>	<i id="layer-action-add-terrain" class="layer-action-add"></i>	<i id="layer-action-delete-terrain" class="layer-action-delete"></i>	</div>	<div class="layer-item-content">	';
        var terrainLayerName = terrainLayer.name;
        var terrainLayerId = terrainLayer.id;
        if(terrainLayerName&&terrainLayerId){
            terrainStr = terrainStr + '<div class="layer-item-title" id=\"'+terrainLayerId+'\">	<i class=""></i>	<i class="checkicon active"></i>	<i class="typeicon iconlocal"></i>	<span>'+terrainLayerName+'</span> </div>  ';
        }
        terrainStr = terrainStr + '</div>	</div>	';
        //基础图层dom拼接
        var basicStr = '<div class="layer-item active" id="imagery-branch-container">	<div class="layer-item-title" lrp-node="lrp">	<i class="arrow"></i>	<i class="checkicon active"></i>	<i class="typeicon iconyingxiang"></i>	<span>基础图层</span>	<i id="layer-action-add-basic" class="layer-action-add"></i>	<i id="layer-action-delete-basic" class="layer-action-delete"></i>	</div>	<div class="layer-item-content">	';
        basicStr = basicStr + '<div class="layer-item-title tileCoordinates" id=\"'+Cesium.createGuid()+'\">	<i class=""></i>	<i class="checkicon"></i>	<i class="typeicon iconlocal"></i>	<span>经纬网</span>	</div>	';

        for(var i=basicLayer.length-1;i>=0;i--){
            if(basicLayer[i]._isBaseLayer == false){
                var basicLayerName = basicLayer[i].name;
                var basicLayerId = basicLayer[i].id;
                basicStr = basicStr + '<div class="layer-item-title" id=\"'+basicLayerId+'\">	<i class=""></i>	<i class="checkicon active"></i>	<i class="typeicon iconlocal"></i>	<span>'+basicLayerName+'</span>	</div>	';
            }
        }
        basicStr = basicStr + '</div>	</div>	';

        htmlIst = htmlIst + modelStr + terrainStr + basicStr +'</div>	</div>	</div>	</div>';
        $("#layermanagerPanelContent3d").append(htmlIst);
    }

    //基础图层上下关系排序
    function loadLayerOrder(){
        //移除原因图层上移下移标识
        $("#imagery-branch-container").find(".icondown").remove();
        $("#imagery-branch-container").find(".iconup").remove();
        var layerLen = $("#imagery-branch-container .layer-item-content").children().length;
        if(layerLen < 2){

        }else if(layerLen == 2){
            //最顶层
            if($("#imagery-branch-container .layer-item-content").children().first()){
                $("#imagery-branch-container .layer-item-content").children().first().find("span").append('<i class="icondown"></i>');
            }
            //最底层
            if($("#imagery-branch-container .layer-item-content").children().last()){
                $("#imagery-branch-container .layer-item-content").children().last().find("span").append('<i class="iconup"></i>');
            }
        }else if(layerLen > 2){
            //最顶层
            if($("#imagery-branch-container .layer-item-content").children().first()){
                $("#imagery-branch-container .layer-item-content").children().first().find("span").append('<i class="icondown"></i>');
            }
            //最底层
            if($("#imagery-branch-container .layer-item-content").children().last()){
                $("#imagery-branch-container .layer-item-content").children().last().find("span").append('<i class="iconup"></i>');
            }
            //中间层
            for(var i=1;i<layerLen-1;i++){
                $($("#imagery-branch-container .layer-item-content").children()[i]).find("span").append('<i class="iconup"></i>');
                $($("#imagery-branch-container .layer-item-content").children()[i]).find("span").append('<i style="margin-left: 6px;" class="icondown"></i>');
            }
        }
    }

    //验证服务长度
    function validateSrv(srvUrl){
        if($(".lm-ipt").hasClass("check-false")){
            $(".lm-ipt").removeClass("check-false");
        }else if($(".lm-ipt").hasClass("check-true")){
            $(".lm-ipt").removeClass("check-true");
        }
        if(srvUrl == ""){
            layer.tips('服务地址为空！', '#srv-span');
            $(".lm-ipt").addClass("check-false");
            return false;
        }else if(srvUrl.length > 256){
            layer.tips('服务地址为空！', '#srv-span');
            $(".lm-ipt").addClass("check-false");
            return false;
        }else{
            return true;
        }
    }

    //验证接口服务
    function getServiceOption(serviceUrl,type){
        var serviceJson = null;
        if(type=="MODEL_CESIUM"){
            if(serviceUrl.endsWith(".json")){
                var url = "/proxyHandler?url="+serviceUrl;
            }else{
                $("#srvipt-item").after('<div id="srvCheckRes" style="font-size:14px;color:red;position:absolute;margin-top:52px;left:22%;"><span>模型服务地址必须为.json后缀！</span></div>');
                $(".lm-ipt").addClass("check-false");
                return;
            }
            var format = new GeoGlobe.Format.JSON();
            GeoGlobe.Request.GET({
                url: url,
                async:false,
                success: function(request){
                    try {
                        if($("#checkedMark").html() == "unverified"){
                            if($("#lm-srvname-model").length > 0){
                                $("#lm-srvname-model").remove();
                            }
                        }
                        if(request){
                            var document = format.read(request.responseText);
                            if(document.root.children.length > 0){
                                $("#srvipt-item").after('<div id="srvCheckRes" style="font-size:14px;color:green;position:absolute;margin-top:47px;left:22%;"><span>服务验证成功！</span></div>');
                                $("#srvipt-item").after('<div id="lm-srvname-model" style="position:absolute; margin-left:20px;margin-top:70px;"><span id="name-span">图层名称：</span><input id="srvipt-name" class="lm-name" guid='+ Cesium.createGuid() +'></div>');
                                var arr = serviceUrl.split("/");
                                var terrainSrvName;
                                if(arr[arr.length-2] == "osgService"){
                                	terrainSrvName = arr[arr.length-3];
                                }else{
                                	terrainSrvName = arr[arr.length-2];
                                }
                                $("#lm-srvname-model #srvipt-name").val(terrainSrvName);
                                $(".lm-ipt").addClass("check-true");
                                //表明当前url已验证
                                $("#checkedMark").html("verified");
                            }else{
                                $("#srvipt-item").after('<div id="srvCheckRes" style="font-size:14px;color:red;position:absolute;margin-top:52px;left:22%;"><span>服务验证失败！</span></div>');
                                $(".lm-ipt").addClass("check-false");
                            }
                        }else{
                            $("#srvipt-item").after('<div id="srvCheckRes" style="font-size:14px;color:red;position:absolute;margin-top:52px;left:22%;"><span>服务验证失败！</span></div>');
                            $(".lm-ipt").addClass("check-false");
                        }
                    }catch (e) {
                        console.log("service capabilities test error!");
                    }
                },
                failure: function(){
                    $("#srvipt-item").after('<div id="srvCheckRes" style="font-size:14px;color:red;position:absolute;margin-top:47px;left:22%;"><span>服务验证失败！</span></div>');
                    $(".lm-ipt").addClass("check-false");
                }
            });
        }else if(type=="WFS"){
            var url;
            if(serviceUrl.indexOf("?")>0){
                url = TDT.getAppPath("")+"proxyHandler?url="+serviceUrl+"&service=wfs";
            }else{
                url = TDT.getAppPath("")+"proxyHandler?url="+serviceUrl+"?service=wfs";
            }
            GeoGlobe.Request.GET({
                url: url,
                params: {
                    request: "GetCapabilities",
                    version:"1.1.0"
                },
                async:false,
                success: function(request){
                    try {
                        if(request){
                            if($("#checkedMark").html() == "unverified"){
                                if($("#lm-srvname-vector").length > 0){
                                    $("#lm-srvname-vector").remove();
                                }
                            }
                            if(!request.responseText || request.responseText.indexOf("Exception") != -1 ){
                                $("#srvipt-item").after('<div id="srvCheckRes" style="font-size:14px;color:red;position:absolute;margin-top:52px;left:21%;"><span>服务验证失败！</span></div>');
                                $(".lm-ipt").addClass("check-false");
                                return;
                            }
                            var doc = request.responseText;
                            var jsonOnj = new GeoGlobe.Format.WFSCapabilities.v1().read(doc);
                            var array = jsonOnj.featureTypeList.featureTypes;
                            if(array){
                                if(array.length ==1){
                                    var insertStr = '<div id="lm-srvname-vector" style="position:absolute; margin-left:20px;margin-top:70px;"><span class="">选择图层：</span><table style="position:relative;top:-21px;margin-left: 70px;font-size:13px;"><tbody><tr>'
                                    var title = array[0].title;
                                    insertStr = insertStr + '<td><span class="lm-name" id=' + Cesium.createGuid() + '><input id="name-span" class="selectLayer" type="checkbox" checked="true"/><label>' + title + '</label></span></td>';
                                }else{
                                    var insertStr = '<div id="lm-srvname-vector" style="position:absolute; margin-left:20px;margin-top:70px;"><span class="">选择图层：</span><table style="position:relative;top:-21px;left: 70px;font-size:13px;"><tbody><tr>'
                                    //解析多图层
                                    for(var i=0;i<array.length;i++){
                                        var title = array[i].title;
                                        if(i == 0){
                                            insertStr = insertStr + '<td style="width:auto;"><span class="lm-name" id=' + Cesium.createGuid() + '><input id="name-span" class="selectLayer" type="checkbox" checked="true"/><label>' + title + '</label></span></td>';
                                        }else{
                                            insertStr = insertStr + '<td style="width:auto;"><span class="lm-name" id=' + Cesium.createGuid() + '><input class="selectLayer" type="checkbox" checked="true"/><label>' + title + '</label></span></td>';
                                        }
                                    }
                                }
                            }else{
                                $("#srvipt-item").after('<div id="srvCheckRes" style="font-size:14px;color:red;position:absolute;margin-top:52px;left:21%;"><span>服务验证失败！</span></div>');
                                $(".lm-ipt").addClass("check-false");
                            }
                            insertStr = insertStr+ '</tr></tbody></table></div>';
                            $("#srvipt-item").after('<div id="srvCheckRes" style="font-size:14px;color:green;position:absolute;margin-top:47px;left:21%;"><span>服务验证成功！</span></div>');
                            //$("#srvipt-item").after('<div id="srvipt-name" style="position:absolute; margin-left:20px;margin-top:70px;"><span id="name-span">图层名称：</span><input id="lm-srvname-vector" class="lm-name"></div>');
                            $("#srvipt-item").after(insertStr);
                            $(".lm-ipt").addClass("check-true");
                            //表明当前url已验证
                            $("#checkedMark").html("verified");
                        }else{
                            $("#srvipt-item").after('<div id="srvCheckRes" style="font-size:14px;color:red;position:absolute;margin-top:52px;left:21%;"><span>服务验证失败！</span></div>');
                            $(".lm-ipt").addClass("check-false");
                        }
                    }catch (e) {
                        console.log("service capabilities test error!");
                    }
                },
                failure: function(){
                    $("#srvipt-item").after('<div id="srvCheckRes" style="font-size:14px;color:red;position:absolute;margin-top:47px;left:21%;"><span>服务验证失败！</span></div>');
                    $(".lm-ipt").addClass("check-false");
                }
            });
        }else if(type=="WMTS"){
            if(serviceUrl.indexOf("/wmts")>0){
                var url = "/proxyHandler?url="+serviceUrl+"?service=wmts&REQUEST=GetCapabilities";
            }else{
                var url = "/proxyHandler?url="+serviceUrl+"/wmts?service=wmts&REQUEST=GetCapabilities";
            }
            var format = new GeoGlobe.Format.WMTSCapabilities();
            GeoGlobe.Request.GET({
                url: url,
                params: {
                    REQUEST: "GetCapabilities"
                },
                async:false,
                success: function(request){
                    try {
                        if($("#checkedMark").html() == "unverified"){
                            if($("#lm-srvname-imagery").length > 0){
                                $("#lm-srvname-imagery").remove();
                            }
                        }
                        if(request){
                            var json = format.read(request.responseText);
                            if(json.contents.layers.length == 1){
                                var insertStr = '<div id="lm-srvname-imagery" style="position:absolute; margin-left:20px;margin-top:107px;"><span class="">选择图层：</span><table style="position:relative;top:-21px;left:71px;font-size:13px;"><tbody><tr>';
                                var title = json.contents.layers[0].title;
                                insertStr = insertStr + '<td><span class="lm-name" id='+Cesium.createGuid()+'><input id="name-span" class="selectLayer" type="checkbox" checked="true"/><label>' + title + '</label></span></td>';
                            }else{
                                var insertStr = '<div id="lm-srvname-imagery" style="position:absolute; margin-left:20px;margin-top:107px;"><span class="">选择图层：</span><table style="position:relative;top:-21px;left:71px;font-size:13px;"><tbody><tr>';
                                //解析多图层
                                for(var i=0;i<json.contents.layers.length;i++){
                                    var title = json.contents.layers[i].title;
                                    if(i == 0){
                                        insertStr = insertStr + '<td style="width:auto;"><span class="lm-name" id=' + Cesium.createGuid() + '><input id="name-span" class="selectLayer" type="checkbox" checked="true"/><label>' + title + '</label></span></td>';
                                    }else{
                                        insertStr = insertStr + '<td style="width:auto;"><span class="lm-name" id=' + Cesium.createGuid() + '><input class="selectLayer" type="checkbox" checked="true"/><label>' + title + '</label></span></td>';
                                    }
                                }
                            }
                            insertStr = insertStr+ '</tr></tbody></table></div>';
                            $("#srvipt-item").after('<div id="srvCheckRes" style="font-size:14px;color:green;position:absolute;margin-top:90px;left:21%;"><span>服务验证成功！</span></div>');
                            //$("#srvipt-item").after('<div id="srvipt-name" style="position:absolute; margin-left:20px;margin-top:70px;"><span id="name-span">图层名称：</span><input id="lm-srvname-imagery" class="lm-name"></div>');
                            $("#srvipt-item").after(insertStr);
                            $(".lm-ipt").addClass("check-true");
                            //表明当前url已验证
                            $("#checkedMark").html("verified");
                        }else{
                            $("#srvipt-item").after('<div id="srvCheckRes" style="font-size:14px;color:red;position:absolute;margin-top:90px;left:21%;"><span>服务验证失败！</span></div>');
                            $(".lm-ipt").addClass("check-false");
                        }
                    }catch (e) {
                        console.log("service capabilities test error!");
                    }
                },
                failure: function(){
                    $("#srvipt-item").after('<div id="srvCheckRes" style="font-size:14px;color:red;position:absolute;margin-top:47px;left:21%;"><span>服务验证失败！</span></div>');
                    $(".lm-ipt").addClass("check-false");
                }
            });
        }else if(type=="WMS"){
            if(serviceUrl.indexOf("/wms")>0){
                var url = "/proxyHandler?url="+serviceUrl+"?service=wms&REQUEST=GetCapabilities";
            }else{
                var url = "/proxyHandler?url="+serviceUrl+"/wms?service=wmts&REQUEST=GetCapabilities";
            }
            var format = new GeoGlobe.Format.WMSCapabilities();
            GeoGlobe.Request.GET({
                url: url,
                params: {
                    REQUEST:"GetCapabilities",
                    version:"1.1.1"
                },
                async:false,
                success: function(request){
                    try {
                        if($("#checkedMark").html() == "unverified"){
                            if($("#lm-srvname-imagery").length > 0){
                                $("#lm-srvname-imagery").remove();
                            }
                        }
                        if(request){
                            var json = format.read(request.responseText);
                            var insertStr = '<div id="lm-srvname-imagery" style="position:absolute; margin-left:20px;margin-top:107px;"><span class="">选择图层：</span><table style="position:relative;top:-21px;left:71px;font-size:13px;"><tbody><tr>';
                            if(json.capability.layers.length >=1){
                                for(var i=0;i<json.capability.layers.length;i++){
                                    var title = json.capability.layers[i].name;
                                    insertStr = insertStr + '<td><span class="lm-name" id='+Cesium.createGuid()+'><input id="name-span" class="selectLayer" type="checkbox" checked="true"/><label>' + title + '</label></span></td>';
                                }
                            }
                            insertStr = insertStr+ '</tr></tbody></table></div>';
                            $("#srvipt-item").after('<div id="srvCheckRes" style="font-size:14px;color:green;position:absolute;margin-top:90px;left:21%;"><span>服务验证成功！</span></div>');
                            //$("#srvipt-item").after('<div id="srvipt-name" style="position:absolute; margin-left:20px;margin-top:70px;"><span id="name-span">图层名称：</span><input id="lm-srvname-imagery" class="lm-name"></div>');
                            $("#srvipt-item").after(insertStr);
                            $(".lm-ipt").addClass("check-true");
                            //表明当前url已验证
                            $("#checkedMark").html("verified");
                        }else{
                            $("#srvipt-item").after('<div id="srvCheckRes" style="font-size:14px;color:red;position:absolute;margin-top:90px;left:21%;"><span>服务验证失败！</span></div>');
                            $(".lm-ipt").addClass("check-false");
                        }
                    }catch (e) {
                        console.log("service capabilities test error!");
                    }
                },
                failure: function(){
                    $("#srvipt-item").after('<div id="srvCheckRes" style="font-size:14px;color:red;position:absolute;margin-top:90px;left:21%;"><span>服务验证失败！</span></div>');
                    $(".lm-ipt").addClass("check-false");
                }
            });
        }else if(type=="TILE"){
            if(serviceUrl.endsWith("services/tile")){
                var url = "/proxyHandler?url="+serviceUrl+"/GetCapabilities";
            }
            var format = new GeoGlobe.Format.XML();
            GeoGlobe.Request.GET({
                url: url,
                async:false,
                success: function(request){
                    try {
                        if($("#checkedMark").html() == "unverified"){
                            if($("#lm-srvname-imagery").length > 0){
                                $("#lm-srvname-imagery").remove();
                            }
                        }
                        if(request){
                            var document = format.read(request.responseText);
                            var insertStr = '<div id="lm-srvname-imagery" style="position:absolute; margin-left:20px;margin-top:107px;"><span class="">选择图层：</span><table style="position:relative;top:-21px;left:71px;font-size:13px;"><tbody><tr>';
                            if(document.getElementsByTagName("TileData").length>0){
                                var title = document.getElementsByTagName("Name")[0].innerHTML;
                                insertStr = insertStr + '<td><span class="lm-name" id='+Cesium.createGuid()+'><input id="name-span" class="selectLayer" type="checkbox" checked="true"/><label>' + title + '</label></span></td>';
                            }
                            insertStr = insertStr+ '</tr></tbody></table></div>';
                            $("#srvipt-item").after('<div id="srvCheckRes" style="font-size:14px;color:green;position:absolute;margin-top:90px;left:21%;"><span>服务验证成功！</span></div>');
                            $("#srvipt-item").after(insertStr);
                            $(".lm-ipt").addClass("check-true");
                            //表明当前url已验证
                            $("#checkedMark").html("verified");
                        }else{
                            $("#srvipt-item").after('<div id="srvCheckRes" style="font-size:14px;color:red;position:absolute;margin-top:90px;left:21%;"><span>服务验证失败！</span></div>');
                            $(".lm-ipt").addClass("check-false");
                        }
                    }
                    catch (e) {
                        console.log("service capabilities test error!");
                    }
                },
                failure: function(){
                    $("#srvipt-item").after('<div id="srvCheckRes" style="font-size:14px;color:red;position:absolute;margin-top:90px;left:21%;"><span>服务验证失败！</span></div>');
                    $(".lm-ipt").addClass("check-false");
                }
            });
        }else if(type=="TERRAIN"){
            if(serviceUrl.indexOf("/services/tile") > 0){
                var url = "/proxyHandler?url="+serviceUrl+"/GetCapabilities";
            }else{
                var url = "/proxyHandler?url="+serviceUrl+"/services/tile/GetCapabilities";
            }
            var format = new GeoGlobe.Format.XML();
            GeoGlobe.Request.GET({
                url: url,
                async:false,
                success: function(request){
                    try {
                        if($("#checkedMark").html() == "unverified"){
                            if($("#lm-srvname-terrain").length > 0){
                                $("#lm-srvname-terrain").remove();
                            }
                        }
                        if(request){
                            var document = format.read(request.responseText);
                            if(document.getElementsByTagName("ServiceCapabilities").length){
                                $("#srvipt-item").after('<div id="srvCheckRes" style="font-size:14px;color:green;position:absolute;margin-top:47px;left:22%;"><span>服务验证成功！</span></div>');
                                $("#srvipt-item").after('<div id="lm-srvname-terrain" style="position:absolute; margin-left:20px;margin-top:70px;"><span id="name-span">图层名称：</span><input id="srvipt-name" class="lm-name" guid='+ Cesium.createGuid() +'></div>');
                                var terrainSrvName= document.getElementsByTagName("Name")[0].childNodes[0].nodeValue;
                                $("#lm-srvname-terrain #srvipt-name").val(terrainSrvName);
                                $(".lm-ipt").addClass("check-true");
                                //表明当前url已验证
                                $("#checkedMark").html("verified");
                            }else{
                                $("#srvipt-item").after('<div id="srvCheckRes" style="font-size:14px;color:red;position:absolute;margin-top:52px;left:22%;"><span>服务验证失败！</span></div>');
                                $(".lm-ipt").addClass("check-false");
                            }
                        }else{
                            $("#srvipt-item").after('<div id="srvCheckRes" style="font-size:14px;color:red;position:absolute;margin-top:52px;left:22%;"><span>服务验证失败！</span></div>');
                            $(".lm-ipt").addClass("check-false");
                        }
                    }catch (e) {
                        console.log("service capabilities test error!");
                    }
                },
                failure: function(){
                    $("#srvipt-item").after('<div id="srvCheckRes" style="font-size:14px;color:red;position:absolute;margin-top:47px;left:22%;"><span>服务验证失败！</span></div>');
                    $(".lm-ipt").addClass("check-false");
                }
            });
        }
    }

    //WMTS类型的服务数据解析
    function WMTSAnalyzer(json){
        var layers = json.contents.layers;
        var tileMatrixSets = json.contents.tileMatrixSets;
        var layerArr = [];
        $(layers).each(function(i,data){
            var layerObj = {};
            if($($(".lm-name input")[i]).prop("checked") == true ){
                layerObj["name"]=data.identifier;
                layerObj["type"] = "WMTS";
                layerObj["alias"]= data.identifier;
                layerObj["opacity"]=1;
                layerObj["visibility"]=true;
                layerObj["transitionEffect"]="resize";
                layerObj["removeBackBufferDelay"]=500;
                layerObj["zoomOffset"]="0";
                layerObj["formats"]=data.formats;
                layerObj["format"]=data.formats[0];//"image/tile";
                layerObj["style"]=data.styles[0].identifier;
                layerObj["boundingBox"]= data.BoundingBox;
                layerObj["matrixSet"]= data.tileMatrixSetLinks[0].tileMatrixSet;
                var matrixIds = [];
                $(tileMatrixSets[data.tileMatrixSetLinks[0].tileMatrixSet].matrixIds).each(function(j,d){
                    var matrixid = {};
                    matrixid.identifier =d.identifier;
                    matrixid.scaleDenominator =d.scaleDenominator;
                    matrixid.tileHeight =d.tileHeight;
                    matrixid.tileWidth =d.tileWidth;
                    matrixIds.push(matrixid);
                });
                layerObj["matrixIds"] = matrixIds;
                layerArr.push(layerObj);
            }
        });
        var json = {};
        json["Layer"] = layerArr;
        $("#usSrvCap").val($.toJSON(json));
        return layerArr;
    }

    //WMS类型的服务数据解析
    function WMSAnalyzer(json){
        var layers = json.capability.layers;
        var layerArr = [];
        $(layers).each(function(i,data){
            var layerObj = {};
            if($($(".lm-name input")[i]).prop("checked") == true ){
                layerObj["name"]=data.name;
                layerObj["llbbox"]= data.llbbox;
                layerArr.push(layerObj);
            }
        });
        var json = {};
        json["Layer"] = layerArr;
        $("#usSrvCap").val($.toJSON(json));
        return layerArr;
    }

    //WMTS类型的服务数据解析
    function WFSAnalyzer(json){
        var layers = json.featureTypeList.featureTypes
        var layerArr = [];
        $(layers).each(function(i,data){
            var layerObj = {};
            if($($(".lm-name input")[i]).prop("checked") == true ){
                layerObj["name"]=data.name;
                layerArr.push(layerObj);
            }
        });
        var json = {};
        json["Layer"] = layerArr;
        $("#usSrvCap").val($.toJSON(json));
        return layerArr;
    }

    //关闭图层管理面板
    function closeLayerManager(layerManager){
        var entityCollection = layerManager.map.entities;
        var entityArray = entityCollection._entities._array;
        if(entityArray.length>0){
            for(var i=0;i<entityArray.length;i++){
                if(entityArray[i].name != undefined && entityArray[i].name != "draw_polygon" && entityArray[i].name != "draw_polyline"){
                    entityCollection.removeById(entityArray[i].id);
                }
            }
        }
        if(layerManager.map.dataSources){
            layerManager.map.dataSources.removeAll();
        }
        layerManager.modelLayerGroup.removeAll();
    }

    //点击界面清除按钮
    function clearAll(layerManager){
        closeLayerManager(layerManager);
        layer.closeAll();
        $("#popover2018").css("display","none");
    }

})(window.Cesium);