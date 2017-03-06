var ws = null,
	wo = null;
var scan = null,
	domready = false;
// H5 plus事件处理
function plusReady() {
	if(ws || !window.plus || !domready) {
		return;
	}
	// 获取窗口对象
	ws = plus.webview.currentWebview();
	wo = ws.opener();
	// 开始扫描
	ws.addEventListener('show', function() {
		scan = new plus.barcode.Barcode('bcid');
		scan.onmarked = onmarked;
		scan.start({
			conserve: true,
			filename: "_doc/barcode/"
		});
	});
}
if(window.plus) {
	plusReady();
} else {
	document.addEventListener("plusready", plusReady, false);
}
// 监听DOMContentLoaded事件
document.addEventListener("DOMContentLoaded", function() {
	domready = true;
	plusReady();
}, false);
// 二维码扫描成功
function onmarked(type, result, file) {
	checkData(result)
}

function checkData(code) {
	$.ajax({
		url: "http://wx.hwops.cn/app/index.php?i=3&c=entry&do=ConsumeGift&m=hongplus_api&code=" + code,
		timeout: 600000,
		async: true,
		dataType: "text",
		type: "GET",
		success: function(result) {
			console.log(result);
			result=JSON.parse(result);
			if(result.errcode == '0') {
				alert('核销成功，发放礼品');
			} else {
				alert(result.errmsg);
			}
			scan.start();
		},
	});
}