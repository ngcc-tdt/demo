/**
 * Class: Cesium.Map
 * 三维地图类。
 */
(function(Cesium){
	"use strict";
	
    /**
     * Map类，Cesium的Viewer的扩展类，用法与使用Cesium的Viewer一致。不同的是修改了构造函数的部分参数选项的默认值。
     *
     * @alias Map
     * @constructor
     *
     * @param {Element|String} container 包含三维球的dom元素或id。
     * @param {Object} [options] 参数选项:
     * @param {Boolean} [options.baseLayerPicker=false] 默认为false，Cesium的基础图层组件是否显示。
     * @param {Boolean} [options.timeline=false] 默认为false，Cesium的时间轴组件是否显示。
     * @param {Boolean} [options.animation=false] 默认为false，Cesium的Animation组件是否显示。
     * @param {Boolean} [options.homeButton=false] 默认为false，Cesium的HomeButton组件是否显示。
     * @param {Boolean} [options.navigationHelpButton=false] 默认为false， Cesium的导航帮助按钮是否显示。
     * @param {Boolean} [options.orderIndependentTranslucency=false] 默认为false。
     * @param {SceneMode} [options.sceneMode=SceneMode.SCENE3D] 初始场景模式。
     * @param {Boolean} [options.scene3DOnly=true] 当默认为 <code>true</code>, 几何对象将在3D模式下使用GPU绘制。
     * @param {Number} [options.maxLevel=25] 最大级别数。
     * @param {Boolean} [options.geocoder=false] 默认为false， Cesium的Geocoder组件是否显示。
     * @param {Boolean} [options.fullscreenButton=false] 默认为false，全屏组件是否显示。
     * @param {ImageryProvider} [options.imageryProvider=new SingleTileImageryProvider()] 默认使用一张全球图片的imageryProvider。
     * 
     * @example
     * //初始化三维球
     * var viewer = new Cesium.Map('cesiumContainer');
     */
	Cesium.Map = function(container, options){
		options = options || {};
		options.baseLayerPicker = Cesium.defaultValue(options.baseLayerPicker, false);
		options.timeline = Cesium.defaultValue(options.timeline, false);
		options.animation = Cesium.defaultValue(options.animation, false);
		options.homeButton = Cesium.defaultValue(options.homeButton, false);
		options.navigationHelpButton = Cesium.defaultValue(options.navigationHelpButton, false);
		options.orderIndependentTranslucency = Cesium.defaultValue(options.orderIndependentTranslucency, false);
		options.sceneMode = Cesium.defaultValue(options.sceneMode, Cesium.SceneMode.SCENE3D);//Cesium.SceneMode.SCENE2D,Cesium.SceneMode.SCENE3D
		options.scene3DOnly = Cesium.defaultValue(options.scene3DOnly, true);
		options.maxLevel = Cesium.defaultValue(options.maxLevel, 25);
		options.geocoder = Cesium.defaultValue(options.geocoder, false);
		options.fullscreenButton = Cesium.defaultValue(options.fullscreenButton, false);
		
		//没有传入imageryProvider，则默认使用一张全球图片的imageryProvider
		if (!Cesium.defined(options.imageryProvider)) {
			var scriptSrc = getScriptLocation();//获取"Cesium.js"所在的目录
			var skin_imageryProvider = new Cesium.SingleTileImageryProvider({
				url: scriptSrc + 'Assets/images/Earth.jpg',
				rectangle: Cesium.Rectangle.fromDegrees(-180.0, -90.0, 180, 90.0)
			});
			options.imageryProvider = skin_imageryProvider;
		}
		//options.imageryProvider = Cesium.defaultValue(options.imageryProvider, new Cesium.UrlTemplateImageryProvider({url:''}));
		
        var map = new Cesium.Viewer(container, options);
		//上一步实例化时创建了一个空的图层，现在再删掉
		//保证一个不带图层的球体能够显示
		//if(options.imageryProvider !== undefined){
		//	map.imageryLayers.removeAll();
		//}
		
		return map;
	};
	
//	Cesium.Viewer.prototype._addTest = function(){
//	};

	//获取"Cesium.js"所在的目录
	function getScriptLocation() {
		var scriptName = "Cesium.js";
        var scriptLocation = "";
        var isGV = new RegExp("(^|(.*?\\/))(" + scriptName + ")(\\?|$)");

        var scripts = document.getElementsByTagName('script');
        for (var i=0, len=scripts.length; i<len; i++) {
            var src = scripts[i].getAttribute('src');
            if (src) {
                var match = src.match(isGV);
                if(match) {
                    scriptLocation = match[1];
                    break;
                }
            }
        }
        return scriptLocation;
    }
	
})(window.Cesium);
