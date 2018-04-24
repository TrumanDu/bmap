export function MP() {
  return new Promise(function (resolve, reject) {
    // 如果已加载直接返回
    if(typeof BMap !== 'undefined') {
      resolve(BMap);
      return true;
    }
    // 百度地图异步加载回调处理
    window.onBMapCallback = function () {
      console.log('百度地图脚本初始化成功...');
      resolve(BMap);
    };
    const script = document.createElement('script');
    script.type = 'text/javascript';
    //script.src = 'http://api.map.baidu.com/api?v=2.0&ak=ZUONbpqGBsYGXNIYHicvbAbM';
    script.src = 'http://api.map.baidu.com/api?v=2.0&ak=ZUONbpqGBsYGXNIYHicvbAbM&s=1&callback=onBMapCallback';
    script.onerror = reject;
    document.head.appendChild(script);
  });
}