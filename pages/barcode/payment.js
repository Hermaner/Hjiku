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
	plusEvent: function() {
		var oldBack = mui.back;
		mui.back = function() {
			E.confirm("订单未支付，确定退出?", function() {
				old_back()
			})

		}
	},
	onmarked: function(type, result, file) {
		result = result.replace(/\n/g, '');
		console.log(result);
		switch(ws.type) {
			case "order":
				Page.barcodePay(result)
				break;
			case "cashr":
				Page.barcodePay(result)
				break;
			default:
				break;
		}
	},
	barcodePay: function(c) {
		wo.evalJS("Page.vue.payMent('" + c + "')")
		mui.back();
	}

}