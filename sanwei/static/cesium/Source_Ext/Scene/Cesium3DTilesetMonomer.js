(function(Cesium){
	"use strict";
	
	var defaultValue = Cesium.defaultValue;
    var defined = Cesium.defined;
	
	/**
     * 3d tiles单体化类。
     *
     * @alias Cesium3DTilesetMonomer
     * @constructor
     *
     * @param {Object} 参数选项:
     * @param {Viewer} [options.viewer] 三维球对象。
     * @param {Cesium3DTileset} [options.tileset] 3d tiles对象。
     * @param {Object} [options.source] 数据源对象。
     * @param {String} [options.source.type] 数据源类型，值一般为"geojson"。
     * @param {String|Object} [options.source.data] 如果type为"geojson"，则一般设置为一个url, GeoJSON对象或TopoJSON对象。
     *
     * @example
     * var tilesetMonomer = new Cesium.Cesium3DTilesetMonomer({
     *      viewer : viewer,
     *      tileset : tileset,
     *      source : {
     *      	type: "geojson",
     *      	data: "data/fj_geojson/fj.geojson"
     *      }
     * });
     *
     * @example
     * var tilesetMonomer = new Cesium.Cesium3DTilesetMonomer({
     *      viewer : viewer,
     *      tileset : tileset,
     *      source : {
     *      	type: "geojson",
     *      	data: {"type":"FeatureCollection", "features": [{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[108.95908735739037,34.220151116008616],[108.95974335343854,34.22015701200698],[108.95974050128187,34.219553259627006],[108.95908878346874,34.219547363586436],[108.95908735739037,34.220151116008616]]]},"properties":{"Id":0,"minheight":400,"maxheight":490,"desc":"大雁塔","name":"大雁塔"}}]}
     *      }
     * });
     * //选中要素事件回调
     * tilesetMonomer.seletedEvent.addEventListener(function(feature) {
     * }, tilesetMonomer);
     */
	function Cesium3DTilesetMonomer(options){
		options = defaultValue(options, defaultValue.EMPTY_OBJECT);
		this.viewer = options.viewer;
		this.tileset = options.tileset;//this.tileset = new Cesium.Cesium3DTileset(options);
		this.source = options.source;
		this.autoActivate = defaultValue(options.autoActivate, true);
		this.active = defaultValue(options.active, null);
		this.showDefaultSelectedEntity = defaultValue(options.showDefaultSelectedEntity, true);
		//this.onSelect = defaultValue(options.onSelect, function(){});
		this.originalColor = defaultValue(options.originalColor, Cesium.Color.fromBytes(255, 50, 50, 1));//接近透明
		this.moveColor = defaultValue(options.moveColor, Cesium.Color.fromBytes(255, 50, 50, 122));//移动时的颜色
		this.selectedColor = defaultValue(options.selectedColor, Cesium.Color.fromBytes(50, 255, 50, 122));//绿色
		this.selectedFeature = undefined;//点击选中feature
		this.dataSource = undefined;
		this.selectedEntity = new Cesium.Entity();
		
		//geojson数据源
		if(this.source && this.source.type === "geojson"){
			this._loadGeoJSON(this.source.data);
		}
		
		//屏幕空间事件处理器
		this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
		//是否自动激活
		if(this.autoActivate){
			this.activateAction();
		}
		
		this._seletedEvent = new Cesium.Event();
	}
	
	
	Cesium.defineProperties(Cesium3DTilesetMonomer.prototype, {
		/**
         * Cesium球体对象。
         * @name viewer
         * @memberof Cesium3DTilesetMonomer.prototype
         * @type {Viewer}
         */
		
		/**
         * Cesium3DTileset对象。
         * @name tileset
         * @memberof Cesium3DTilesetMonomer.prototype
         * @type {Cesium3DTileset}
         */
		
		/**
         * 是否自动激活。默认true。
         * @name autoActivate
         * @memberof Cesium3DTilesetMonomer.prototype
         * @type {Boolean}
         * @default true
         */
		
		/**
         * 激活状态。
         * @name active
         * @memberof Cesium3DTilesetMonomer.prototype
         * @type {Boolean}
         * @default null
         */
		
		/**
         * 选择某个模型要素时，是否显示默认信息框。
         * @name showDefaultSelectedEntity
         * @memberof Cesium3DTilesetMonomer.prototype
         * @type {Boolean}
         * @default true
         */
		
		/**
         * 移动时，要素的颜色。
         * @name moveColor
         * @memberof Cesium3DTilesetMonomer.prototype
         * @type {Color}
         * @default Cesium.Color.fromBytes(255, 50, 50, 122)
         */
		
		/**
         * 选中时，要素的颜色。
         * @name selectedColor
         * @memberof Cesium3DTilesetMonomer.prototype
         * @type {Color}
         * @default Cesium.Color.fromBytes(50, 255, 50, 122)
         */
		
		/**
         * geojson数据源对象。
         * @name dataSource
         * @memberof Cesium3DTilesetMonomer.prototype
         * @type {GeoJsonDataSource}
         */
		
		/**
         * 获取选中事件。
         * @memberof Cesium3DTilesetMonomer.prototype
         * @type {Event}
         */
        seletedEvent : {
            get : function() {
                return this._seletedEvent;
            }
        }
	});
	
    /**
     * @private
     * 创建一个新的Promise实例，在加载完毕后，提供GeoJSON或TopoJSON数据。然后添加至viewer。
     *
     * @param {String|Object} data 一个url, GeoJSON对象或TopoJSON对象。
     *
     */
	Cesium3DTilesetMonomer.prototype._loadGeoJSON = function(data){
		//@returns {Promise.<GeoJsonDataSource>} 当数据被加载完毕时，一个promise将resolve。
		var pro = Cesium.GeoJsonDataSource.load(data);
		var $this1 = this;
		pro.then(function(dataSource) {
			$this1.dataSource = dataSource;
			$this1.viewer.dataSources.add(dataSource);
			var entities = dataSource.entities.values;
	        for (var i = 0; i < entities.length; i++) {
	            var entity = entities[i];
	            //var name = entity.name;
	            var color = $this1.originalColor;//近乎透明的红色
	            entity.polygon.material = color;
	            entity.polygon.outline = false;
	            entity.polygon.height = entity.properties.minheight;
	            entity.polygon.extrudedHeight = entity.properties.maxheight;
	        }
		});
	};
	
    /**
     * 重新加载GeoJSON或TopoJSON数据。然后添加至viewer。
     *
     * @param {String|Object} data 一个url, GeoJSON对象或TopoJSON对象。
     *
     */
	Cesium3DTilesetMonomer.prototype.reloadGeoJSON = function(data){
		this.dataSource = this.viewer.dataSources.remove(this.dataSource) ? null : this.dataSource;
		this._loadGeoJSON(data);
	};
	
    /**
     * 显示Cesium信息框。
     *
     * @param {Object} pickedFeature 要素对象。
     *
     */
	Cesium3DTilesetMonomer.prototype.showSelectedEntity = function(pickedFeature){
		if (pickedFeature && pickedFeature.id) {
			//显示信息框
			this.selectedEntity.name = pickedFeature.id.name;
			//selectedEntity.description = 'Loading <div class="cesium-infoBox-loading"></div>';
			this.viewer.selectedEntity = this.selectedEntity;
			//pickedFeature.id.properties.getValue(0);
			//字段名称
			var propertyNames = pickedFeature.id.properties.propertyNames;
			var selectedEntity_htmlStr = '<table class="cesium-infoBox-defaultTable"><tbody>';
			for (var i = 0; i < propertyNames.length; i++) {
				selectedEntity_htmlStr += '<tr><th>' + propertyNames[i] + '</th><td>' + pickedFeature.id.properties[propertyNames[i]].getValue() + '</td></tr>';
			}
			selectedEntity_htmlStr += '</tbody></table>';
			this.selectedEntity.description = selectedEntity_htmlStr;
		}
	};
	
	//Cesium3DTilesetMonomer.prototype.onSelect = function(pickedFeature){};
	
    /**
     * dataSource内是否包含模型要素。
     *
     * @param {Object} pickedFeature 模型要素对象。
     *
     */
	Cesium3DTilesetMonomer.prototype.isContaintFeature = function(pickedFeature){
		var entities_values = this.dataSource.entities.values;
		for (var i = 0; i < entities_values.length; i++) {
			if(entities_values[i] === pickedFeature.id){
				return true;
			}
		}
		return false;
	};
	
    /**
     * 激活动作。
     */
	Cesium3DTilesetMonomer.prototype.activateAction = function(){
		if(this.active === true){
			return;
		}
		this.active = true;
		var $this1 = this;
		
		this._showDataSource(true);
		
		//var highlightedFeature = null;//移动高亮feature
		var movedFeature = null;//移动高亮feature
		var selectedFeature = null;//点击选中feature
		//var selectedEntity = new Cesium.Entity();
		
		//鼠标移动时，高亮模型
		$this1.handler.setInputAction(function(e){
			//恢复原色
			if(movedFeature && movedFeature.id){
				if(selectedFeature && selectedFeature.id && movedFeature && movedFeature.id && movedFeature.id.id === selectedFeature.id.id){
					return;
				}
				movedFeature.id.polygon.material = $this1.originalColor;
		        movedFeature = undefined;
			}
			var pickedFeature = $this1.viewer.scene.pick(e.endPosition);
		    if (!Cesium.defined(pickedFeature)) {
		        return;
		    }
			
			//1.没有已选择selectedFeature的时候
			//2.已选择的selectedFeature和点中的pickedFeature不相同时
			if (
			(!selectedFeature && pickedFeature && pickedFeature.id) || 
			(pickedFeature && pickedFeature.id && selectedFeature && selectedFeature.id && (pickedFeature.id.id !== selectedFeature.id.id))
			) {
				//验证dataSource内是否包含pickedFeature
				if(!$this1.isContaintFeature(pickedFeature)){
					return;
				}
				movedFeature = pickedFeature;
				pickedFeature.id.polygon.material = $this1.moveColor;
			}
			
			
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
		
		//高亮选中
		//var clickFn = $this1.handler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
		$this1.handler.setInputAction(function(e){
			//恢复原色
			if(selectedFeature){
				selectedFeature.id.polygon.material = $this1.originalColor;
				selectedFeature = undefined;
				$this1.selectedFeature = selectedFeature;
			}
			var pickedFeature = $this1.viewer.scene.pick(e.position);
			if (!Cesium.defined(pickedFeature)) {
		        //clickFn(e);
				$this1.viewer.selectedEntity = null;
		        return;
		    }
			if (selectedFeature === pickedFeature) {
		        return;
		    }
			if(pickedFeature && pickedFeature.id && (selectedFeature !== pickedFeature)){
				//验证dataSource内是否包含pickedFeature
				if(!$this1.isContaintFeature(pickedFeature)){
					return;
				}
				selectedFeature = pickedFeature;
				pickedFeature.id.polygon.material = $this1.selectedColor;
				$this1.selectedFeature = selectedFeature;
			}
			
			if (pickedFeature && selectedFeature && movedFeature && pickedFeature.id === movedFeature.id) {
		        //Cesium.Color.clone(highlighted.originalColor, selected.originalColor);
		        //movedFeature = undefined;
		        movedFeature = undefined;
		    }
			
			if(pickedFeature && pickedFeature.id){
				//是否显示默认的信息框
				if($this1.showDefaultSelectedEntity){
					$this1.showSelectedEntity(pickedFeature);
				}else{
					$this1.viewer.selectedEntity = null;
				}
				//$this1.onSelect.call($this1, pickedFeature);
				$this1._seletedEvent.raiseEvent(pickedFeature);
			}else{
				$this1.viewer.selectedEntity = null;
			}
			
			
			
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
	};
	
    /**
     * 关闭动作。
     */
	Cesium3DTilesetMonomer.prototype.deactivateAction = function(){
		if(this.active !== true){
			return;
		}
		this.active = false;
		var $this1 = this;
		//$this1.handler.setInputAction(function(e){}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
		//var clickFn = $this1.handler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
		if($this1.selectedFeature && $this1.selectedFeature.id){
			$this1.selectedFeature.id.polygon.material = $this1.originalColor;
			$this1.selectedFeature = null;
			$this1.viewer.selectedEntity = null;
		}
		$this1.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
		$this1.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
		
		this._showDataSource(false);
	};
	
    /**
     * @private
     * 是否显示加载的geojson数据。
     * 
     * @param {Boolean} isshow true或false。是否显示加载的geojson数据。
     */
	Cesium3DTilesetMonomer.prototype._showDataSource = function(isshow){
		if(this.dataSource){
			this.dataSource.show = isshow;
//			var entities = this.dataSource.entities.values;
//	        for (var i = 0; i < entities.length; i++) {
//				var entity = entities[i];
//				entity.show = isshow;
//			}
		}
	};
	
    /**
     * 销毁。
     */
	Cesium3DTilesetMonomer.prototype.destroy = function(){
		this.deactivateAction();
		this.handler = this.handler && this.handler.destroy();
		this.dataSource = this.viewer.dataSources.remove(this.dataSource) ? null : this.dataSource;
		this.viewer = undefined;
		this.tileset = undefined;
		this.source = undefined;
		this.originalColor = undefined;
		this.moveColor = undefined;
		this.selectedColor = undefined;
		this.selectedFeature = undefined;
		this.selectedEntity = undefined;
	};
	
	Cesium.Cesium3DTilesetMonomer = Cesium3DTilesetMonomer;
	
})(window.Cesium);