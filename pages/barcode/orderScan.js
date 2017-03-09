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
		scan.onmarked = Page.onmarked;
		scan.start({ conserve: true, filename: "_doc/barcode/" });
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

var Page = {
	onmarked: function(type, result, file) {
		result = result.replace(/\n/g, '');
		console.log(result);
		switch(ws.type) {
			case "sn":
				Page.checkSn(result);
				break;
			case "fhsn":
				Page.checkfhSn(result);
				break;
			case "cart":
				Page.checkCart(result);
				break;
			default:
				break;
		}
	},
	checkSn: function(c) {
		wo.evalJS("Page.vue.checkSN('" + c + "')")
		mui.back()
	},
	checkfhSn: function(c) {
		wo.evalJS("Page.vue.checkfhSN('" + c + "')")
		mui.back()
	},
	checkCart: function(c) {
		wo.evalJS("Page.vue.loadData('" + c + "',1)")
		mui.back()
	},

}
