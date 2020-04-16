copy SingleFile.js GeoRes.debug.js
rem copy /b GeoRes.debug.js + jQuery\jquery-1.9.1.min.js
rem copy /b GeoRes.debug.js + jQuery\jquery.json-2.2.js
rem copy /b GeoRes.debug.js + jQuery\jquery-ui-1.12.1.custom.min.js
rem copy /b GeoRes.debug.js + jQuery\jquery-pager.js
rem copy /b GeoRes.debug.js + jQuery\jquery.contextmenu.r2.js
rem copy /b GeoRes.debug.js + jQuery\jquery.easing.1.3.js
rem copy /b GeoRes.debug.js + jQuery\jquery.timeline/jquery.timeline.js
rem copy /b GeoRes.debug.js + jQuery\colpick\js\colpick.js
rem copy /b GeoRes.debug.js + jQuery\jquery.mCustomScrollbar.concat.min.js
rem copy /b GeoRes.debug.js + jQuery\zTree\3.5.29\js\jquery.ztree.all.js
copy /b GeoRes.debug.js + html2canvas\promise.min.js
copy /b GeoRes.debug.js + html2canvas\html2canvas.min.js
copy /b GeoRes.debug.js + artDialog4.1.6\artDialog.js
copy /b GeoRes.debug.js + artTemplate\template.min.js
copy /b GeoRes.debug.js + artTemplate\extensions\template-syntax.min.js
copy /b GeoRes.debug.js + bootstrap-3.3.4\js\bootstrap.min.js
copy /b GeoRes.debug.js + bootstrap-paginator\bootstrap-paginator.min.js
copy /b GeoRes.debug.js + Saber\saber.js
copy /b GeoRes.debug.js + Saber\core\Array.js
copy /b GeoRes.debug.js + Saber\core\Class.js
copy /b GeoRes.debug.js + Saber\mediator\mediator.js
copy /b GeoRes.debug.js + Saber\event\eventdispatcher.js
copy /b GeoRes.debug.js + Saber\model\Model.js
copy /b GeoRes.debug.js + Saber\model\ModelCollection.js
copy /b GeoRes.debug.js + Saber\view\View.js
copy /b GeoRes.debug.js + Saber\compatible\placeHolder.js
copy /b GeoRes.debug.js + seajs\sea-debug.js
copy /b GeoRes.debug.js + seajs\seajs-css.js
copy /b GeoRes.debug.js + seajs\seajs-text.js
copy /b GeoRes.debug.js + seajs\seajs-style.js
rem copy /b GeoRes.debug.js + Geogl.js

java -jar compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js GeoRes.debug.js --js_output_file GeoRes.min.js

pause