/**
 * Class: Cesium.LayerManager
 * 三维地图图层管理类
 * description: 管理各种图层组
 */
(function(Cesium){
	"use strict";
	
    /**
     * Constructor: Cesium.LayerManager
     *
     * Parameters:
     * map - {Cesium.Map} 3D map Object 
     *
     */
	var LayerManager = Cesium.LayerManager = function(map){
		this.map = map;
		this.serviceLayerGroup = new Cesium.ServiceLayerGroup(map);
		this.modelLayerGroup = new Cesium.ModelLayerGroup(map);
		this.vectorLayerGroup = new Cesium.VectorLayerGroup(map);
		this.terrainLayerGroup = new Cesium.TerrainLayerGroup(map);
		this.basicLayerGroup = new Cesium.BasicLayerGroup(map);
	};
	
	/**
     * Method: getMap
     * 获取三维地图对象
     *
     * returns:
     * map {Cesium.Map} 三维地图对象
     */
	LayerManager.prototype.getMap = function(){
		return this.map;
	};
	
	/**
     * Method: getServiceLayerGroup
     * 获取业务图层组
     *
     * returns:
     * serviceLayerGroup 业务图层组
     */
	LayerManager.prototype.getServiceLayerGroup = function(){
		return this.serviceLayerGroup;
	};
	
	/**
     * Method: getModelLayerGroup
     * 获取模型图层组
     *
     * returns:
     * modelLayerGroup 模型图层组
     */
	LayerManager.prototype.getModelLayerGroup = function(){
		return this.modelLayerGroup;
	};
	
	/**
     * Method: getVectorLayerGroup
     * 获取矢量图层组
     *
     * returns:
     * vectorLayerGroup 矢量图层组
     */
	LayerManager.prototype.getVectorLayerGroup = function(){
		return this.vectorLayerGroup;
	};
	
	/**
     * Method: getTerrainLayerGroup
     * 获取地形图层组
     *
     * returns:
     * terrainLayerGroup 地形图层组
     */
	LayerManager.prototype.getTerrainLayerGroup = function(){
		return this.terrainLayerGroup;
	};
	
	/**
     * Method: getBasicLayerGroup
     * 获取基础图层组
     *
     * returns:
     * basicLayerGroup 基础图层组
     */
	LayerManager.prototype.getBasicLayerGroup = function(){
		return this.basicLayerGroup;
	};
	
	/**
     * Method: remove
     * 移除图层组
     *
     * Parameters:
     * layerGroup 指定图层组对象
     * or default 参数缺省时清空所有图层组
     */
	LayerManager.prototype.remove = function(layerGroup){
		if(!Cesium.defined(layerGroup)){
			this.serviceLayerGroup.removeAll();
			this.modelLayerGroup.removeAll();
			this.vectorLayerGroup.removeAll();
			this.terrainLayerGroup.removeAll();
			this.basicLayerGroup.removeAll();
		}else{
			layerGroup.removeAll();
		}
	};
	
})(window.Cesium);

/**
 * Class: Cesium.ServiceLayerGroup
 * 三维地图业务图层组类
 *
 * Inherits from:
 * - <Cesium.CompositeEntityCollection>
 */
(function(Cesium){
	"use strict";
	
	/**
     * Constructor: Cesium.ServiceLayerGroup
     */
	var ServiceLayerGroup = Cesium.ServiceLayerGroup = function(){
		
	};
	
	/**
     * extend: Cesium.CompositeEntityCollection
     */
	ServiceLayerGroup.prototype = new Cesium.CompositeEntityCollection();
	
	/**
     * Method: addLayer
     * 添加图层
     *
     * Parameters:
     * name 图层名称
     * layer 图层对象
     *
     * returns:
     * id 图层唯一标识码
     */
	ServiceLayerGroup.prototype.addLayer = function(name,layer){
		var callback = ServiceLayerGroup.add(layer);
		var id = "";
		if(callback){
			layer.name = name;
			id = Cesium.createGuid();
			layer.id = id;
		}
		return id;
	};
	
	/**
     * Method: removeLayer
     * 移除图层
     *
     * Parameters:
     * id 图层唯一标识码
     *
     * returns:
     * boolean - {[Boolean]} true移除成功 false移除失败
     */
	ServiceLayerGroup.prototype.removeLayer = function(id){
		var layer = ServiceLayerGroup.getLayer(id);
		var boolean = ServiceLayerGroup.remove(layer);
		return boolean;
	};
	
	/**
     * Method: queryLayerByName
     * 通过图层名称获取图层对象
     *
     * Parameters:
     * name 图层名称
     *
     * returns:
     * targetLayer 图层对象
     */
	ServiceLayerGroup.prototype.queryLayerByName = function(name){
		var targetLayer = null;
		for(var i=0;i<ServiceLayerGroup.length;i++){
			var layer = ServiceLayerGroup.get(i);
			if(name == layer.name){
				targetLayer = layer;
				break;
			}
		}
		return targetLayer;
	};
	
	/**
     * Method: getLayer
     * 通过图层id获取图层对象
     *
     * Parameters:
     * id 图层唯一标识码
     *
     * returns:
     * targetLayer 图层对象
     */
	ServiceLayerGroup.prototype.getLayer = function(id){
		var targetLayer = null;
		for(var i=0;i<ServiceLayerGroup.length;i++){
			var layer = ServiceLayerGroup.get(i);
			if(id == layer.id){
				targetLayer = layer;
				break;
			}
		}
		return targetLayer;
	};
	
	/**
     * Method: showLayer
     * 图层显示
     *
     * Parameters:
     * id 图层唯一标识码
     */
	ServiceLayerGroup.prototype.showLayer = function(id){
		var layer = ServiceLayerGroup.getLayer(id);
		layer.show = true;
	};
	
	/**
     * Method: hideLayer
     * 图层隐藏
     *
     * Parameters:
     * id 图层唯一标识码
     */
	ServiceLayerGroup.prototype.hideLayer = function(id){
		var layer = ServiceLayerGroup.getLayer(id);
		layer.show = false;
	};
	
	/**
     * Method: addChildLayerGroup
     * 创建业务图层组节点
     *
     * Parameters:
     * name 业务图层组节点名称
     */
	ServiceLayerGroup.prototype.addChildLayerGroup = function(name){
		
	};
	
})(window.Cesium);

/**
 * Class: Cesium.ModelLayerGroup
 * 三维地图模型图层组类
 *
 * Inherits from:
 * - <Cesium.PrimitiveCollection>
 */
(function(Cesium){
	"use strict";
	
	/**
     * Constructor: Cesium.ModelLayerGroup
     */
	var ModelLayerGroup = Cesium.ModelLayerGroup = function(map){
		this.map = map;
	};
	
	/**
     * extend: Cesium.PrimitiveCollection
     */
	ModelLayerGroup.prototype = new Cesium.PrimitiveCollection();
	
	/**
     * Method: addLayer
     * 添加图层
     *
     * Parameters:
     * name 图层名称
     * layer 图层对象
     *
     * returns:
     * id 图层唯一标识码
     */
	ModelLayerGroup.prototype.addLayer = function(name,layer){
		var map = this.map;
		var tileset = this.map.scene.primitives.add(layer);
		//如果后台配置模型查询服务，生成单体化图层
		if(tileset.monomerUrl && tileset.monomerProperties){
			ModelLayerGroup.prototype.generateMonomer(tileset,map);
		}
		var id = "";
		if(tileset){
			layer.name = name;
			if($("#model-branch-container .layer-item-title").last()[0] != undefined){
				id = $("#model-branch-container .layer-item-title").last()[0].id;
			}
			layer.id = id;
		}
		return tileset;
	};
	
	/**
     * Method: removeLayer
     * 移除图层
     *
     * Parameters:
     * id 图层唯一标识码
     *
     * returns:
     * boolean - {[Boolean]} true移除成功 false移除失败
     */
	ModelLayerGroup.prototype.removeLayer = function(id){
		for(var i=0;i<this.map.scene.primitives.length;i++){
			var layer = this.map.scene.primitives.get(i);
			if(id == layer.id){
				break;
			}
		}
		var boolean = this.map.scene.primitives.remove(layer);		
		return boolean;
	};
	
	/**
     * Method: queryLayerByName
     * 通过图层名称获取图层对象
     *
     * Parameters:
     * name 图层名称
     *
     * returns:
     * targetLayer 图层对象
     */
	ModelLayerGroup.prototype.queryLayerByName = function(name){
		var targetLayer = null;
		for(var i=0;i<ModelLayerGroup.length;i++){
			var layer = ModelLayerGroup.get(i);
			if(name == layer.name){
				targetLayer = layer;
				break;
			}
		}
		return targetLayer;
	};
	
	/**
     * Method: getLayer
     * 通过图层id获取图层对象
     *
     * Parameters:
     * id 图层唯一标识码
     *
     * returns:
     * targetLayer 图层对象
     */
	ModelLayerGroup.prototype.getLayer = function(id){
		var targetLayer = null;
		if(id){
			for(var i=1;i<this.map.scene.primitives.length;i++){
				var layer = this.map.scene.primitives.get(i);
				if(id == layer.id){
					targetLayer = layer;
					break;
				}
			}
		}else{
			targetLayer = this.map.scene.primitives._primitives;
		}
		
		return targetLayer;
	};
	
	/**
     * Method: showLayer
     * 图层显示
     *
     * Parameters:
     * id 图层唯一标识码
     */
	ModelLayerGroup.prototype.showLayer = function(id){
		var targetLayer = null;
		for(var i=0;i<this.map.scene.primitives.length;i++){
			var layer = this.map.scene.primitives.get(i);
			if(id == layer.id){
				targetLayer = layer;
				break;
			}
		}
		if(targetLayer){
			targetLayer.show = true;
		}
	};
	
	/**
     * Method: hideLayer
     * 图层隐藏
     *
     * Parameters:
     * id 图层唯一标识码
     */
	ModelLayerGroup.prototype.hideLayer = function(id){
		var targetLayer = null;
		for(var i=0;i<this.map.scene.primitives.length;i++){
			var layer = this.map.scene.primitives.get(i);
			if(id == layer.id){
				targetLayer = layer;
				break;
			}
		}
		if(targetLayer){
			targetLayer.show = false;
		}
	};
	
	/**
     * Method: generateMonomer
     * 添加图层
     *
     * Parameters:
     * tileset 3dTiles模型
     * map Cesium.viewer
     *
     */
	ModelLayerGroup.prototype.generateMonomer = function(tileset,map){
		var that = this;
		that.tileset = tileset;
		that.map = map;
        var format = new GeoGlobe.Format.WFSCapabilities();
        GeoGlobe.Request.GET({
            url: that.tileset.monomerUrl,
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
                        var layers = jsonOnj.featureTypeList.featureTypes;
                        // 创建查询实例
                        var wfsQuery = new GeoGlobe.Query.WFSQuery("/proxyHandler?url="+that.tileset.monomerUrl,that.tileset.monomerName,{
                            maxFeatures:5000
                        });
                        wfsQuery.query(null,function(features){
                            var data = features.geojson;
                			//单体化3d tiles
                			var tilesetMonomer = new Cesium.Cesium3DTilesetMonomer({
                				viewer : that.map,
                				tileset : that.tileset,
                				moveColor: Cesium.Color.fromBytes(255, 50, 50, 122),//移动时的颜色，红色
                				selectedColor: Cesium.Color.fromBytes(50, 255, 50, 122),//选中的颜色，绿色
                				showDefaultSelectedEntity: false,//是否显示默认的信息框体
                				autoActivate: false,//默认关闭状态
                				source : {type: "geojson", data: data}
                			});
                			tilesetMonomer.dataSource.show = false;
		                    that.tileset.tilesetMonomer = tilesetMonomer;
		                    
                			//选中事件，回调
                			tilesetMonomer.seletedEvent.addEventListener(function(feature) {
                				//隐藏默认信息框
                				$(".cesium-infoBox").hide();
                				
                				//鼠标左击，通过浮云框显示单体属性
                				$("#popover2018 h3").html(feature.id.properties.name._value);
    		                    var oDescription = "<tr><th style=\"font-size: 14px;font-weight: bold;\">属性名</th><th style=\"font-size: 14px;font-weight: bold;\">属性值</th></tr>";
    		                    var value = feature.id;
    		                    if (value.properties != undefined) {
    		                        //var flag = false;//判断没有自定义属性就不弹出弹框
    		                    	if(value.properties.propertyNames.length > 0){
    		                    		for (var index = 0; index < value.properties.propertyNames.length; index++) {
        		                            var properties = value.properties.propertyNames[index];
        		                            //if($.inArray(properties,this.tileset.monomerProperties) >=0){
        		                            	var values = value.properties[properties]._value;
        		                                oDescription +=
        		                                    "<tr>" +
        		                                    "<td>" + properties + "</td>" +
        		                                    "<td>" + values + "</td>" +
        		                                    "</tr>";
        		                            //}
            		                    }
    		                    	}else{
    		                        	oDescription +=
    	                                    "<tr>" +
    	                                    "<td>暂无</td>" +
    	                                    "<td>暂无</td>" +
    	                                    "</tr>";
    		                    	}
    		                    	var flag = true;
    		                    }
    		                    if (flag) {
    		                    	//填充属性并显示浮云框
       		                        $("#popover2018 .popover-content table tbody").html(oDescription);
	       		                    $("#popover2018").css({
	 		                            "left": this.handler._primaryPosition.x - 136,
	 		                            "top": this.handler._primaryPosition.y - $("#popover2018").height() - 10
	 		                        });
	       		                    $("#popover2018 .popover-content").mCustomScrollbar("destroy");
    		                    	 //激活线路查询滚动条
       		                        $("#popover2018 .popover-content").mCustomScrollbar({
    		             				scrollButtons:{
    		             			   		enable:true
    		             			    },
    		             				theme:"minimal-dark",
    		             				callbacks:{
    		             					onCreate:function(){
    		    		                        $("#popover2018").css("display","block");
    		             			        }
    		             			    }
       		                        });
    		                    }
    		                    return;
                		    }, tilesetMonomer);
                			
		                    var viewer = that.map;
		        			var wheelHandler = viewer.screenSpaceEventHandler.getInputAction(Cesium.ScreenSpaceEventType.WHEEL);
		        			//鼠标滚轮事件时做的操作
		        	        viewer.screenSpaceEventHandler.setInputAction(function onWheel(movement) {
		        				$("#popover2018").css("display","none");
		        	        }, Cesium.ScreenSpaceEventType.WHEEL);
		        	        
		        	        var leftDownHandler = viewer.screenSpaceEventHandler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN);
		        			//鼠标左键按下事件时做的操作
		        	        viewer.screenSpaceEventHandler.setInputAction(function onLeftDown(movement) {
		        				$("#popover2018").css("display","none");
		        	        }, Cesium.ScreenSpaceEventType.LEFT_DOWN );
                        });
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
	};
	
	/**
     * Method: activateMonomer
     * 添加图层
     *
     * Parameters:
     * tileset 3dTiles模型
     * map Cesium.viewer
     *
     */
	ModelLayerGroup.prototype.activateMonomer = function(tileset){
		if(tileset.tilesetMonomer){
			tileset.tilesetMonomer.activateAction();
		}
	};
	
	/**
     * Method: deactivateMonomer
     * 添加图层
     *
     * Parameters:
     * tileset 3dTiles模型
     * map Cesium.viewer
     *
     */
	ModelLayerGroup.prototype.deactivateMonomer = function(tileset,map){
		if(tileset.tilesetMonomer){
			tileset.tilesetMonomer.deactivateAction();
		}
	};
})(window.Cesium);

/**
 * Class: Cesium.VectorLayerGroup
 * 三维地图矢量图层组类
 *
 * Inherits from:
 * - <Cesium.DataSourceCollection>
 */
(function(Cesium){
	"use strict";
	
	/**
     * Constructor: Cesium.VectorLayerGroup
     */
	var VectorLayerGroup = Cesium.VectorLayerGroup = function(map){
		/**
         * @attributes:3d map.
         * @type {Cesium.Map}
         */
		this.map = map;
	};
	
	/**
     * extend: Cesium.DataSourceCollection
     */
	VectorLayerGroup.prototype = new Cesium.DataSourceCollection();
	
	/**
     * Method: addLayer
     * 添加图层
     *
     * Parameters:
     * name 图层名称
     * layer 图层对象
     *
     * returns:
     * id 图层唯一标识码
     */
	VectorLayerGroup.prototype.addLayer = function(name,dataSource){
		if(dataSource){
			if(!dataSource.id){
				dataSource.id = Cesium.createGuid();
			}
			//dataSource._name = name;
		}
		this.map.dataSources.add(dataSource);
		this.map.dataSources.get(this.map.dataSources.length-1).name = name;
		return dataSource.id;
	};
	
	/**
     * Method: removeLayer
     * 移除图层
     *
     * Parameters:
     * id 图层唯一标识码
     *
     * returns:
     * boolean - {[Boolean]} true移除成功 false移除失败
     */
	VectorLayerGroup.prototype.removeLayer = function(id){
		var targetLayer = null;
		for(var i=0;i<this.map.dataSources.length;i++){
				if(id == this.map.dataSources.get(i).id){
					targetLayer = this.map.dataSources.get(i);
					break;
				}
		}
		try{
			this.map.dataSources.remove(targetLayer);
		}catch(DeveloperError ){
			console.log("DeveloperError");
			return;
		}
	};
	
	/**
     * Method: queryLayerByName
     * 通过图层名称获取图层对象
     *
     * Parameters:
     * name 图层名称
     *
     * returns:
     * targetLayer 图层对象
     */
	VectorLayerGroup.prototype.queryLayerByName = function(name){
		var targetLayer = null;
		for(var i=0;i<this.map.dataSources.length;i++){
			var layer = this.map.dataSources.get(i);
			if(name == layer._name){
				targetLayer = layer;
				break;
			}
		}
		return targetLayer;
	};
	
	/**
     * Method: getLayer
     * 通过图层id获取图层对象
     *
     * Parameters:
     * id 图层唯一标识码
     *
     * returns:
     * targetLayer 图层对象
     */
	VectorLayerGroup.prototype.getLayer = function(id){
		var targetLayer = null;
		for(var i=0;i<this.map.dataSources.length;i++){
			var layer = this.map.dataSources.get(i);
			if(id == layer.id){
				targetLayer = layer;
				break;
			}
		}
		return targetLayer;
	};
	
	/**
     * Method: showLayer
     * 图层显示
     *
     * Parameters:
     * id 图层唯一标识码
     */
	VectorLayerGroup.prototype.showLayer = function(id){
		var targetLayer = null;
		for(var i=0;i<this.map.dataSources.length;i++){
			var layer = this.map.dataSources.get(i);
			if(id == layer.id){
				targetLayer = layer;
				break;
			}
		};
		if(targetLayer){
			targetLayer.show = true;
		}
	};
	
	/**
     * Method: hideLayer
     * 图层隐藏
     *
     * Parameters:
     * id 图层唯一标识码
     */
	VectorLayerGroup.prototype.hideLayer = function(id){
		var targetLayer = null;
		for(var i=0;i<this.map.dataSources.length;i++){
			var layer = this.map.dataSources.get(i);
			if(id == layer.id){
				targetLayer = layer;
				break;
			}
		};
		if(targetLayer){
			targetLayer.show = false;
		}
	};

})(window.Cesium);

/**
 * Class: Cesium.TerrainLayerCollection
 * An ordered collection of terrain layers.
 */
(function(Cesium){
	"use strict";
	
	/**
     * Constructor: Cesium.TerrainLayerCollection
     */
	var TerrainLayerCollection = Cesium.TerrainLayerCollection = function(map){
		/**
         * @attributes:layers in this collection.
         * @memberof TerrainLayerCollection.prototype
         * @type {Array}
         */
		this._layers = [];
		/**
         * @attributes:Gets the number of layers in this collection.
         * @memberof TerrainLayerCollection.prototype
         * @type {Number}
         */
		this.length = this._layers.length;
        /**
         * @attributes:3d map.
         * @type {Cesium.Map}
         */
		this.map = map;
	};
	
	/**
     * Method: addTerrainProvider
     * Creates a new layer using the given TerrainProvider and adds it to the collection
     *
     * Parameters:TerrainProvider
     * the terrain provider to create a new layer for
     *
     * returns:
     * The newly created layer
     */
	TerrainLayerCollection.prototype.addTerrainProvider = function(terrainProvider){
		if (!defined(terrainProvider)) {
            throw new Cesium.DeveloperError('terrainProvider is required.');
        }else{
        	this.map.terrainProvider = terrainProvider;
        	this._layers = [];
			this._layers.push(terrainProvider);
        }
		return this.map.terrainProvider;
	};
	
	/**
     * Method: remove
     * 移除图层
     *
     * returns:{Boolean} 
     * true if the layer was in the collection and was removed,
	 * false if the layer was not in the collection.
     */
	TerrainLayerCollection.prototype.remove = function(){
		var defaultTerrainProvider = new Cesium.CesiumTerrainProvider({
		    url : ''
		});
		this.map.terrainProvider = defaultTerrainProvider;
		this._layers = [];
		return this.map.terrainProvider._url_size == 0;
	};
	
	/**
     * Method: get
     * 通过图层标识码获取图层对象
     *
     * Parameters:
     * id 图层名称
     *
     * returns:
     * targetLayer 图层对象
     */
	TerrainLayerCollection.prototype.get = function(id){
		if (!defined(terrainProvider)) {
            throw new Cesium.DeveloperError('id is required.');
            return;
        }else{
        	if(id == this._layers[0].id)
        	return this._layers[0];
        }
	};
	
})(window.Cesium);

/**
 * Class: Cesium.TerrainLayerGroup
 * 三维地图地形图层组类
 *
 * Inherits from:
 * - <Cesium.TerrainLayerCollection>
 */
(function(Cesium){
	"use strict";
	
	/**
     * Constructor: Cesium.TerrainLayerGroup
     */
	var TerrainLayerGroup = Cesium.TerrainLayerGroup = function(map){
		this.map = map;
	};
	
	/**
     * extend: Cesium.TerrainLayerCollection TODO
     */
	TerrainLayerGroup.prototype = new Cesium.TerrainLayerCollection(map);
	
	/**
     * Method: addLayer
     * 添加图层
     *
     * Parameters:
     * name 图层名称
     * terrainProvider 图层数据
     *
     * returns:
     * id 图层唯一标识码
     */
	TerrainLayerGroup.prototype.addLayer = function(name,terrainProvider){
		if(terrainProvider._credit){
			terrainProvider.id = terrainProvider._credit._text;
		}else{
			var id = Cesium.createGuid();
			terrainProvider.id = id;
		}
		terrainProvider.name = name;
		this.map.terrainProvider = terrainProvider;
		return terrainProvider.id;
	};
	
	/**
     * Method: removeLayer
     * 移除图层
     *
     * Parameters:
     * id 图层唯一标识码
     *
     * returns:
     * boolean - {[Boolean]} true移除成功 false移除失败
     */
	TerrainLayerGroup.prototype.removeLayer = function(id){
		if(id == this.map.terrainProvider.id){
			var newTerrainLayer = new Cesium.GeoTerrainProvider({
									proxy: new Cesium.DefaultProxy("/proxyHandler?url="),
									dataType: Cesium.GeoTerrainProvider.FLOAT,
						            urls: [""],
						        });
	        this.map.terrainProvider = newTerrainLayer;
		}
		return this.map.terrainProvider.id?false:true;
	};
	
	/**
     * Method: getLayer
     * 通过图层id获取图层对象
     *
     * Parameters:
     * id 图层唯一标识码,可缺省
     *
     * returns:
     * targetLayer 图层数据
     */
	TerrainLayerGroup.prototype.getLayer = function(id){
		var targetLayer = null;
		if(!Cesium.defined(id)){
			var targetLayer = this.map.terrainProvider;
		}else{
			if(id == this.map.terrainProvider.id){
				targetLayer = this.map.terrainProvider;
			}
		}
		return targetLayer;
	};
	
	/**
     * Method: showLayer
     * 图层显示
     *
     * Parameters:
     * id 图层唯一标识码
     */
	TerrainLayerGroup.prototype.showLayer = function(id){
		if(id == this.map.terrainProvider.options.credit){
			var trueTerrainLayer = new Cesium.GeoTerrainProvider({
											proxy: new Cesium.DefaultProxy("/proxyHandler?url="),
											dataType: Cesium.GeoTerrainProvider.FLOAT,
								            urls: this.map.terrainProvider.options._urls,
								            credit: this.map.terrainProvider.options.credit,
								            name: this.map.terrainProvider.options.name,
								            maxExtent: this.map.terrainProvider.options.maxExtent,
								            opacity: this.map.terrainProvider.options.opacity,
								            topLevel: this.map.terrainProvider.options.topLevel,
								            bottomLevel: this.map.terrainProvider.options.bottomLevel
						       		 });
       		trueTerrainLayer.id = id;
       		trueTerrainLayer.name = this.map.terrainProvider.options.name;
  		 	this.map.terrainProvider = trueTerrainLayer;
		}
	};
	
	/**
     * Method: hideLayer
     * 图层隐藏
     *
     * Parameters:
     * id 图层唯一标识码
     */
	TerrainLayerGroup.prototype.hideLayer = function(id){
		var targetLayer = null;
		if(id == this.map.terrainProvider.id){
			targetLayer = this.map.terrainProvider;
			var options = { _urls: targetLayer._urls,
							credit: targetLayer._credit.text,
							name: targetLayer.name,
							maxExtent: targetLayer._maxExtent,
							opacity: targetLayer._opacity,
							topLevel: targetLayer._topLevel,
							bottomLevel: targetLayer._bottomLevel
						  };
			var newTerrainLayer = new Cesium.GeoTerrainProvider({
										proxy: new Cesium.DefaultProxy("/proxyHandler?url="),
										dataType: Cesium.GeoTerrainProvider.FLOAT,
							            urls: [""],
							        });
	        this.map.terrainProvider = newTerrainLayer;
	        this.map.terrainProvider.options = options;
		}
	};

})(window.Cesium);

/**
 * Class: Cesium.BasicLayerGroup
 * 三维地图基础图层组类
 *
 * Inherits from:
 * - <Cesium.ImageryLayerCollection>
 */
(function(Cesium){
	"use strict";
	
	/**
     * Constructor: Cesium.BasicLayerGroup
     */
	var BasicLayerGroup = Cesium.BasicLayerGroup = function(map){
		this.map = map;
	};
	
	/**
     * extend: Cesium.ImageryLayerCollection
     */
	BasicLayerGroup.prototype = new Cesium.ImageryLayerCollection();
	
	/**
     * Method: addLayer
     * 添加图层
     *
     * Parameters:
     * name 图层名称
     * imageryProvider 图层数据
     *
     * returns:
     * id 图层唯一标识码
     */
	BasicLayerGroup.prototype.addLayer = function(name,imageryProvider){
		var layer = this.map.imageryLayers.addImageryProvider(imageryProvider);
		var id = "";
		if(layer){
			layer.name = name;
			for(var i=0; i<$("#imagery-branch-container .layer-item-content div").length; i++){
				var document = $("#imagery-branch-container .layer-item-content span")[i];
				if(name == document.innerText){
					id = $($("#imagery-branch-container .layer-item-content div")[i]).attr("id");
					break;
				} 
			}
			imageryProvider.id = layer.id = id || name;
		}
		return id || name;
	};
	
	/**
     * Method: removeLayer
     * 移除图层
     *
     * Parameters:
     * id 图层唯一标识码
     *
     * returns:
     * boolean - {[Boolean]} true移除成功 false移除失败
     */
	BasicLayerGroup.prototype.removeLayer = function(id){
		var targetLayer = null;
		for(var i=0;i<this.map.imageryLayers.length;i++){
				if(id == this.map.imageryLayers._layers[i].id){
					targetLayer = this.map.imageryLayers._layers[i];
					break;
				}
		}
		try{
			this.map.imageryLayers.remove(targetLayer);
		}catch(DeveloperError ){
			console.log("DeveloperError");
			return;
		}
	};
	
	/**
     * Method: queryLayerByName
     * 通过图层名称获取图层对象
     *
     * Parameters:
     * name 图层名称
     *
     * returns:
     * targetLayer 图层对象
     */
	BasicLayerGroup.prototype.queryLayerByName = function(name){
		if(!Cesium.defined(name)){return false;}
		var targetLayer = null;
		for(var i=0;i<this.map.imageryLayers.length;i++){
				if(name == this.map.imageryLayers._layers[i].name){
					targetLayer = this.map.imageryLayers._layers[i];
					break;
				}
		}
		return targetLayer;
	};
	
	/**
     * Method: getLayer
     * 通过图层id获取图层对象
     *
     * Parameters:
     * id 图层唯一标识码,可缺省
     *
     * returns:
     * targetLayer 图层对象
     */
	BasicLayerGroup.prototype.getLayer = function(id){
		var targetLayer = null;
		if(id){
			for(var i=0;i<this.map.imageryLayers.length;i++){
				if(id == this.map.imageryLayers._layers[i].id){
					targetLayer = this.map.imageryLayers._layers[i];
					break;
				}
			}
		}else{
			targetLayer = this.map.imageryLayers._layers;
		}
		return targetLayer;
	};
	
	/**
     * Method: showLayer
     * 图层显示
     *
     * Parameters:
     * id 图层唯一标识码
     */
	BasicLayerGroup.prototype.showLayer = function(id){
		var targetLayer = null;
		for(var i=0;i<this.map.imageryLayers.length;i++){
				if(id == this.map.imageryLayers._layers[i].id){
					targetLayer = this.map.imageryLayers._layers[i];
					break;
				}
		}
		targetLayer.show = true;
	};
	
	/**
     * Method: hideLayer
     * 图层隐藏
     *
     * Parameters:
     * id 图层唯一标识码
     */
	BasicLayerGroup.prototype.hideLayer = function(id){
		var targetLayer = null;
		for(var i=0;i<this.map.imageryLayers.length;i++){
				if(id == this.map.imageryLayers._layers[i].id){
					targetLayer = this.map.imageryLayers._layers[i];
					break;
				}
		}
		targetLayer.show = false;
	};
	
	/**
     * Method: moveLayer
     * 将某图层移动到另一图层上
     *
     * Parameters:
     * id1，id2 图层唯一标识码
     *
     * Exception:
     * DeveloperError layer is not in this collection
     */
	BasicLayerGroup.prototype.moveLayer = function(id1,id2){
		var layer1 = null;
		var layer2 = null;
		for(var i=0;i<this.map.imageryLayers.length;i++){
				if(id1 == this.map.imageryLayers._layers[i].id){
					layer1 = this.map.imageryLayers._layers[i];
					break;
				}
		}
		for(var i=0;i<this.map.imageryLayers.length;i++){
				if(id2 == this.map.imageryLayers._layers[i].id){
					layer2 = this.map.imageryLayers._layers[i];
					break;
				}
		}
		var index1 = this.map.imageryLayers.indexOf(layer1);
		var index2 = this.map.imageryLayers.indexOf(layer2);
		var index = index1 - index2;
		if(index > 0){
			for(var i=0;i<index;i++){
				try{
					this.map.imageryLayers.raise(layer1);
				}catch(DeveloperError ){
					console.log(DeveloperError);
					return;
				}
			}
		}else{
			console.log("layer located top");
		}
	};
	
	/**
     * Method: raiseLayer
     * 图层上移
     *
     * Parameters:
     * id 图层唯一标识码
     *
     * Exception:
     * DeveloperError layer is not in this collection
     */
	BasicLayerGroup.prototype.raiseLayer = function(id){
		var targetLayer = null;
		for(var i=0;i<this.map.imageryLayers.length;i++){
				if(id == this.map.imageryLayers._layers[i].id){
					targetLayer = this.map.imageryLayers._layers[i];
					break;
				}
			}
		try{
			this.map.imageryLayers.raise(targetLayer);
		}catch(DeveloperError ){
			console.log("DeveloperError");
			return;
		}
	};
	
	/**
     * Method: lowerLayer
     * 图层下移
     *
     * Parameters:
     * id 图层唯一标识码
     *
     * Exception:
     * DeveloperError layer is not in this collection
     */
	BasicLayerGroup.prototype.lowerLayer = function(id){
		var targetLayer = null;
		for(var i=0;i<this.map.imageryLayers.length;i++){
				if(id == this.map.imageryLayers._layers[i].id){
					targetLayer = this.map.imageryLayers._layers[i];
					break;
				}
			}
		try{
			this.map.imageryLayers.lower(targetLayer);
		}catch(DeveloperError ){
			console.log("DeveloperError");
			return;
		}
	};

})(window.Cesium);