/**
 * Class: Cesium.GeoTerrainProvider
 * 三维地形类。
 */
(function(Cesium){
	"use strict";
	
	var GeoTerrainProvider = Cesium.GeoTerrainProvider = function(options) {
        options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);
        if (!Cesium.defined(options.urls)) {
            throw new Cesium.DeveloperError('options.urls is required.');
        }
		//dem数据类型，是int还是float。默认为int。
		this._dataType = Cesium.defaultValue(options.dataType, Cesium.GeoTerrainProvider.INT);

        this._urls = options.urls;
        this._urls_length = this._urls.length;
        this._url_i = 0;
        this._url_step = 0;
        this._maxTerrainLevel = options.maxTerrainLevel-1;
        //if (this._url.length > 0 && this._url[this._url.length - 1] !== '/') {
        //    this._url += '/';
        //}

        this._errorEvent = new Cesium.Event();
        this._ready = false;
        this._readyPromise = Cesium.when.defer();

        this._proxy = options.proxy;

        this._terrainDataStructure = {
                heightScale : 1.0 / 1000.0,
                heightOffset : -1000.0,
                elementsPerHeight : 3,
                stride : 4,
                elementMultiplier : 256.0,
                isBigEndian : true
            };

        var credit = options.credit;
        if (typeof credit === 'string') {
            credit = new Cesium.Credit(credit);
        }
        this._credit = credit;

        this._tilingScheme = undefined;
        this._rectangles = [];

        var ellipsoid = Cesium.defaultValue(options.ellipsoid, Cesium.Ellipsoid.WGS84);
		this._tilingScheme = new Cesium.GeographicTilingScheme({ ellipsoid : ellipsoid });
        this._heightmapWidth = 64;//parseInt(tileFormat.getAttribute('width'), 10);
        this._heightmapHeight = 64;//parseInt(tileFormat.getAttribute('height'), 10);
        this._levelZeroMaximumGeometricError = Cesium.TerrainProvider.getEstimatedLevelZeroGeometricErrorForAHeightmap(ellipsoid, Math.min(this._heightmapWidth, this._heightmapHeight), this._tilingScheme.getNumberOfXTilesAtLevel(0));
        this._ready = true;
        this._readyPromise.resolve(true);
        this._name = options.name;
        this._opacity = options.opacity;
        this._maxExtent = options.maxExtent;
        this._topLevel = options.topLevel;
        this._bottomLevel = options.bottomLevel;
	};

	Cesium.defineProperties(GeoTerrainProvider.prototype, {
	    /**
	     * Gets an event that is raised when the terrain provider encounters an asynchronous error.  By subscribing
	     * to the event, you will be notified of the error and can potentially recover from it.  Event listeners
	     * are passed an instance of {@link TileProviderError}.
	     * @memberof GeoTerrainProvider.prototype
	     * @type {Event}
	     */
	    errorEvent : {
	        get : function() {
	            return this._errorEvent;
	        }
	    },
	
	    /**
	     * Gets the credit to display when this terrain provider is active.  Typically this is used to credit
	     * the source of the terrain.  This function should not be called before {@link GeoTerrainProvider#ready} returns true.
	     * @memberof GeoTerrainProvider.prototype
	     * @type {Credit}
	     */
	    credit : {
	        get : function() {
	            return this._credit;
	        }
	    },
	
	    /**
	     * Gets the tiling scheme used by this provider.  This function should
	     * not be called before {@link GeoTerrainProvider#ready} returns true.
	     * @memberof GeoTerrainProvider.prototype
	     * @type {GeographicTilingScheme}
	     */
	    tilingScheme : {
	        get : function() {
	            if (!this.ready) {
	                throw new Cesium.DeveloperError('requestTileGeometry must not be called before ready returns true.');
	            }
	
	            return this._tilingScheme;
	        }
	    },
	
	    /**
	     * Gets a value indicating whether or not the provider is ready for use.
	     * @memberof GeoTerrainProvider.prototype
	     * @type {Boolean}
	     */
	    ready : {
	        get : function() {
	            return this._ready;
	        }
	    },
	
	    /**
	     * Gets a promise that resolves to true when the provider is ready for use.
	     * @memberof GeoTerrainProvider.prototype
	     * @type {Promise.<Boolean>}
	     * @readonly
	     */
	    readyPromise : {
	        get : function() {
	            return this._readyPromise.promise;
	        }
	    },
	
	    /**
	     * Gets a value indicating whether or not the provider includes a water mask.  The water mask
	     * indicates which areas of the globe are water rather than land, so they can be rendered
	     * as a reflective surface with animated waves.  This function should not be
	     * called before {@link GeoTerrainProvider#ready} returns true.
	     * @memberof GeoTerrainProvider.prototype
	     * @type {Boolean}
	     */
	    hasWaterMask : {
	        get : function() {
	            return false;
	        }
	    },
	
	    /**
	     * Gets a value indicating whether or not the requested tiles include vertex normals.
	     * This function should not be called before {@link GeoTerrainProvider#ready} returns true.
	     * @memberof GeoTerrainProvider.prototype
	     * @type {Boolean}
	     */
	    hasVertexNormals : {
	        get : function() {
	            return false;
	        }
	    }
	});
	
	 //zhangli,获取瓦片url
	GeoTerrainProvider.prototype.requestTileGeometry = function(x, y, level, throttleRequests){
	     //console.log("requestTileGeometry  x: %d;   y: %d ;   level: %d", x, y, level);
	     if (!this.ready) {
	         throw new Cesium.DeveloperError('requestTileGeometry must not be called before ready returns true.');
	     }
		 
	     //urls个数大于1时
		 if(this._urls_length > 1){
		 	 //urlToUse = this._urls[0];
		     //一个链接连续发8个请求，然后换下个链接
		     if (this._url_step < 8) {
		         this._url_step++;
		     }
		     else {
		         this._url_step = 0;
		         this._url_i++;
		         if (this._url_i >= this._urls_length) {
		             this._url_i = 0;
		         }
		     }
		 }
	     var urlToUse = this._urls[this._url_i];
	     
	     var yTiles = this._tilingScheme.getNumberOfYTilesAtLevel(level);
	     //var url = urlToUse + level + '/' + x + '/' + (yTiles - y - 1) + '.tif?cesium=true';
	     if (level < 25 && level >= 2)//level === 2 ||level === 6 ||level === this._maxTerrainLevel || ((level>6)&&(level<this._maxTerrainLevel)&&((level-6)%3===0)))
	     {
			var paramSplit = urlToUse.indexOf('?') === -1 ? '?' : '&';
	        var url = urlToUse + paramSplit + 'x=' + x + '&y=' + y + '&l=' + (level + 1);//
	         //console.log(url);
	         
	         //如果有代理，则加上代理地址
	         var proxy = this._proxy;
	         if (Cesium.defined(proxy)) {
	             url = proxy.getURL(url);
	         }
	         //console.log("proxy url:" + url);
	         var promise;
	         
	         throttleRequests = Cesium.defaultValue(throttleRequests, true);
	         if (throttleRequests) {
	         
	             //promise = Cesium.throttleRequestByServer(url, loadZlibTerrain);
				 promise = loadZlibTerrain(url, throttleRequests);
	             if (!Cesium.defined(promise)) {
	                 return undefined;
	             }
	         }
	         else {
	             promise = loadZlibTerrain(url);
	         }
			 
	         var that = this;
	         return Cesium.when(promise, function(zlibData){
	             //转换数据
	             var vhBuffer = that.transformBuffer(zlibData);
	             if (Cesium.defined(vhBuffer)) {
	                 var hmt = new Cesium.HeightmapTerrainData({
	                     buffer: vhBuffer,
	                     width: that._heightmapWidth,
	                     height: that._heightmapHeight,
	                     childTileMask: getChildMask(that, x, y, level),
	                     structure: that._terrainDataStructure
	                 });
	                 hmt._skirtHeight = 6000;
	                 return hmt;
	             }
	             else {
	                 return undefined;
	             }
	         });
	     }
	     else 
	         if (level < 2) {
	             var vWidth = this._heightmapWidth;
	             var vHeight = this._heightmapHeight;
	             
	             var vChildTileMask = getChildMask(this, x, y, level);
	             var vStructure = this._terrainDataStructure;
	             return new Cesium.HeightmapTerrainData({
	                 buffer: this.getvHeightBuffer(),
	                 width: vWidth,
	                 height: vHeight,
	                 childTileMask: vChildTileMask,
	                 structure: vStructure
	             });
	         }
	         else {
	             return undefined;
	         }
	 };
	 
	/**
	 * Gets the maximum geometric error allowed in a tile at a given level.
	 *
	 * @param {Number} level The tile level for which to get the maximum geometric error.
	 * @returns {Number} The maximum geometric error.
	 */
	GeoTerrainProvider.prototype.getLevelMaximumGeometricError = function(level){
	    if (!this.ready) {
	        throw new Cesium.DeveloperError('requestTileGeometry must not be called before ready returns true.');
	    }
	    return this._levelZeroMaximumGeometricError / (1 << level);
	};
	/**
	 * Determines whether data for a tile is available to be loaded.
	 *
	 * @param {Number} x The X coordinate of the tile for which to request geometry.
	 * @param {Number} y The Y coordinate of the tile for which to request geometry.
	 * @param {Number} level The level of the tile for which to request geometry.
	 * @returns {Boolean} Undefined if not supported, otherwise true or false.
	 */
	GeoTerrainProvider.prototype.getTileDataAvailable = function(x, y, level){
	    if (level < 25) {
	        return true;
	    }
	    return undefined;
	};
	
	GeoTerrainProvider.prototype.getvHeightBuffer = function(){
		var vHeightBuffer = this._vHeightBuffer;
		if (!Cesium.defined(vHeightBuffer)) {
	        vHeightBuffer = new Uint8ClampedArray(this._heightmapWidth * this._heightmapHeight * 4);
	        for (var i = 0; i < this._heightmapWidth * this._heightmapHeight * 4;) {
	            vHeightBuffer[i++] = 15;
	            vHeightBuffer[i++] = 66;
	            vHeightBuffer[i++] = 64;
	            vHeightBuffer[i++] = 255;
	        }
			this._vHeightBuffer = vHeightBuffer;
	    }
	    return vHeightBuffer;
	};
	
	//转换buffer数据
	GeoTerrainProvider.prototype.transformBuffer = function(zlibData){
		//this._dataType是int还是float，控制方法交给用户
		//int时  DataSize=2；
		//float时  DataSize=4；
	    var DataSize = 2;
		if(this._dataType === Cesium.GeoTerrainProvider.INT){
			DataSize = 2;
		}else if(this._dataType === Cesium.GeoTerrainProvider.FLOAT){
			DataSize = 4;
		}
		var dZlib = zlibData;
	    if (dZlib.length === 150 * 150 * DataSize) {
	    
	        //创建四字节数组
	        var height_buffer = new ArrayBuffer(DataSize);
	        //创建DateView
	        var height_view = new DataView(height_buffer);
	        
	        var myW = this._heightmapWidth;
	        var myH = this._heightmapHeight;
	        var myBuffer = new Uint8Array(myW * myH * 4);
	        
	        var i_height;
	        var NN, NN_R;
	        var jj_n, ii_n;
	        var jj_f, ii_f;
	        for (var jj = 0; jj < myH; jj++) {
	            for (var ii = 0; ii < myW; ii++) {
	                jj_n = parseInt((149 * jj) / (myH - 1));
	                ii_n = parseInt((149 * ii) / (myW - 1));
	                
	                jj_f = (149.0 * jj) / (myH - 1);
	                ii_f = (149.0 * ii) / (myW - 1);
	                
	                //如果是float型使用dataview帮忙解析
	                if (DataSize === 4) {
	                    NN = DataSize * (jj_n * 150 + ii_n);
	                    height_view.setInt8(0, dZlib[NN]);
	                    height_view.setInt8(1, dZlib[NN + 1]);
	                    height_view.setInt8(2, dZlib[NN + 2]);
	                    height_view.setInt8(3, dZlib[NN + 3]);
	                    i_height = height_view.getFloat32(0, true);
	                    
	                }
	                else //int型也可以使用dataview解析，以后可以改掉
	                {
	                    //NN = DataSize * (jj * 150 + ii);
	                    NN = DataSize * (jj_n * 150 + ii_n);
	                    i_height = dZlib[NN] + (dZlib[NN + 1] * 256);
	                }
	                
	                //定个范围，在地球上高程应都在-1000——10000之间
	                if (i_height > 10000 || i_height < -2000) {
	                    i_height = 0;
	                }
	                /*
	                 NN = 2 * (jj_n * 150 + ii_n);
	                 //NN = 2 * (jj * 150 + ii);
	                 i_height = dZlib[NN] + (dZlib[NN + 1] * 256);
	                 if (i_height > 10000 || i_height < 0) {
	                 i_height = 0;
	                 }
	                 */
	                //数据结果整理成Cesium内部形式
	                NN_R = (jj * myW + ii) * 4;
	                //Cesium内部就是这么表示的
	                var i_height_new = (i_height + 1000) / 0.001;
	                myBuffer[NN_R] = i_height_new / (256 * 256);
	                myBuffer[NN_R + 1] = (i_height_new - myBuffer[NN_R] * 256 * 256) / 256;
	                myBuffer[NN_R + 2] = i_height_new - myBuffer[NN_R] * 256 * 256 - myBuffer[NN_R + 1] * 256;
	                myBuffer[NN_R + 3] = 255;
	            }
	        }
	        //deferred.resolve(myBuffer);
	        return myBuffer;
	    }
	    else {
	        //deferred.reject(undefined);
			return null;
	    }
	};
	
	function loadZlibTerrain(url, request) {
		var request = Cesium.defined(request) ? request : new Cesium.Request();
		request.url = url;
        request.requestFunction = function() {
			var method_new = 'GET';
			//url = "http://t0.tianditu.com/DataServer?T=elv_c&x=418&y=87&l=9";
			var xhr = new XMLHttpRequest();
			xhr.open(method_new, url, true);
			xhr.responseType = 'arraybuffer';
			xhr.async = false;
			xhr.send(null);
			//console.log("-------------------------设置发送x."+x+"  y."+y+"  l."+level);
			return createBuffer(xhr);
		
            //var deferred = when.defer();
            //var xhr = loadWithXhr.load(url, responseType, method, data, headers, deferred, overrideMimeType);
            //if (defined(xhr) && defined(xhr.abort)) {
            //    request.cancelFunction = function() {
            //        xhr.abort();
            //    };
            //}
            //return deferred.promise;
        };
        return Cesium.RequestScheduler.request(request);
	}
	
	function createBuffer(xhr, url, allowCrossOrigin){
	    var deferred = Cesium.when.defer();
	    xhr.onreadystatechange = function(){
	        //console.log('=================return  xhr.status:'+xhr.status);
	        if (xhr.readyState === 4) {
	            //console.log('=================return  xhr.status:'+xhr.status);
	            if (xhr.status === 200) {
	                //console.log(xhr.responseURL + '=================return');
	                
	                if (Cesium.defined(xhr.response)) {
	                    var view = new DataView(xhr.response);
	                    var zBuffer = new Uint8Array(view.byteLength);
	                    var index = 0;
	                    while (index < view.byteLength) {
	                        zBuffer[index] = view.getUint8(index, true);
	                        index++;
	                    }
						//解压数据
	                    var dZlib = decZlibBuffer(zBuffer);
	                    if (!Cesium.defined(dZlib)) {
	                        // console.log(xhr.responseURL + '========bad dzlib return');
	                        deferred.reject(undefined);
	                    }
	                    else {
	                        deferred.resolve(dZlib);
	                    }
	                }
	                else {
	                    /*
	                     // busted old browsers.
	                     if (Cesium.defined(xhr.responseXML) && xhr.responseXML.hasChildNodes()) {
	                     Cesium.deferred.resolve(xhr.responseXML);
	                     } else if (Cesium.defined(xhr.responseText)) {
	                     Cesium.deferred.resolve(xhr.responseText);
	                     } else {
	                     Cesium.deferred.reject(new Cesium.RuntimeError('unknown XMLHttpRequest response type.'));
	                     }*/
	                    //deferred.reject(undefined);
	                }
	            }
	            else {
	                //deferred.reject(undefined);
	            }
	        }
	    };
	    return deferred.promise;
	}
	
	//解压数据
	function decZlibBuffer(zBuffer){
	    if (zBuffer.length < 1000) {
	        return undefined;
	    }
	    var inflate = new Zlib.Inflate(zBuffer);
	    
	    if (Cesium.defined(inflate)) {
	        return inflate.decompress();
	    }
	    else {
	        return undefined;
	    }
	}
	 
	var rectangleScratch = new Cesium.Rectangle();
	function getChildMask(provider, x, y, level){
	    var tilingScheme = provider._tilingScheme;
	    var rectangles = provider._rectangles;
	    var parentRectangle = tilingScheme.tileXYToRectangle(x, y, level);
	    
	    var childMask = 0;
	    
	    for (var i = 0; i < rectangles.length && childMask !== 15; ++i) {
	        var rectangle = rectangles[i];
	        if (rectangle.maxLevel <= level) {
	            continue;
	        }
	        
	        var testRectangle = rectangle.rectangle;
	        
	        var intersection = Cesium.Rectangle.intersection(testRectangle, parentRectangle, rectangleScratch);
	        if (Cesium.defined(intersection)) {
	            // Parent tile is inside this rectangle, so at least one child is, too.
	            if (isTileInRectangle(tilingScheme, testRectangle, x * 2, y * 2, level + 1)) {
	                childMask |= 4; // northwest
	            }
	            if (isTileInRectangle(tilingScheme, testRectangle, x * 2 + 1, y * 2, level + 1)) {
	                childMask |= 8; // northeast
	            }
	            if (isTileInRectangle(tilingScheme, testRectangle, x * 2, y * 2 + 1, level + 1)) {
	                childMask |= 1; // southwest
	            }
	            if (isTileInRectangle(tilingScheme, testRectangle, x * 2 + 1, y * 2 + 1, level + 1)) {
	                childMask |= 2; // southeast
	            }
	        }
	    }
	    return childMask;
	}
	
	function isTileInRectangle(tilingScheme, rectangle, x, y, level) {
	    var tileRectangle = tilingScheme.tileXYToRectangle(x, y, level);
	    return Cesium.defined(Cesium.Rectangle.intersection(tileRectangle, rectangle, rectangleScratch));
	}
	
	GeoTerrainProvider.INT = "int";
	GeoTerrainProvider.FLOAT = "float";

})(window.Cesium);