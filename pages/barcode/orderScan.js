var ws = null,
	wo = null;
var scan = null,
	domready = false,
	pageDetail, fiter = null,
	codeAr;
// H5 plus事件处理
function plusReady() {
	if(ws || !window.plus || !domready) {
		return;
	}
	// 获取窗口对象

	ws = plus.webview.currentWebview();
	wo = ws.opener();
	Page.openr = wo
	codeAr = [plus.barcode.EAN13, plus.barcode.EAN8, plus.barcode.AZTEC, plus.barcode.DATAMATRIX, plus.barcode.UPCA, plus.barcode.UPCE, plus.barcode.CODABAR, plus.barcode.CODE39, plus.barcode.CODE93, plus.barcode.CODE128, plus.barcode.ITF, plus.barcode.MAXICODE, plus.barcode.PDF417, plus.barcode.RSS14, plus.barcode.RSSEXPANDED]
		// 开始扫描
	ws.addEventListener('show', function() {
		if(ws.type == 'caserIn') {
			Page.vue.showTips = true
		}
		setBarcode()
		if(fiter) {
			scan = new plus.barcode.Barcode('bcid', fiter);
		} else {
			scan = new plus.barcode.Barcode('bcid');
		}
		scan.onmarked = Page.onmarked;
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

function setBarcode() {
	var codeType = E.getStorage('codeType') || false
	if(codeType) {
		codeType = JSON.parse(E.getStorage('codeType'));
		console.log(codeType)
		fiter = [plus.barcode.QR]
		for(var i = 0; i < codeType.code.length; i++) {
			fiter.push(codeAr[codeType.code[i]])
		}
	}
	console.log(fiter)

}
var Page = {
	onmarked: function(type, result, file) {
		result = result.replace(/\n/g, '');
		console.log(result);
		switch(ws.type) {
			case "sn":
				Page.checkSn(result);
				break;
			case "cart":
				Page.checkCart(result);
				break;
			default:
				break;
		}
	},
	checkSn: function(c) {
		this.openr.evalJS("Page.vue.checkSN('" + c + "')")
		mui.back()
	},
	checkCart: function(c) {
		this.openr.evalJS("Page.vue.loadData('" + c + "',1)")
		mui.back()
	},
	checkItemAction: function(c) {
		this.openr.evalJS("Page.vue.searchItem('" + c + "')")
		mui.back()
	},
	checkCoupon: function(c) {
		this.openr.evalJS("Page.vue.loadCoupon('" + c + "')")
		mui.back()
	},
	vip: function(c) {
		this.openr.evalJS("Page.vue.searchItem('" + c + "')")
		mui.back()
	},
	vipinfo: function(c) {
		this.openr.evalJS("Page.vue.searchItem('" + c + "')")
		mui.back()
	},
	viprechange: function(c) {
		this.openr.evalJS("Page.vue.searchItem('" + c + "')")
		mui.back()
	},
	cashcard: function(c) {
		this.openr.evalJS("Page.vue.getCardNumber('" + c + "')")
		mui.back()
	},
	transfer: function(c) {
		this.openr.evalJS("Page.vue.searchItem('" + c + "',1)")
		mui.back()
	},
	sinceCode: function(c) {
		this.openr.evalJS("Page.vue.sinceScanCode('" + c + "')")
		mui.back()
	},
	gotDetail: function(c, d, j) {
		E.fireData(E.preloadPages[0], "detailShow", {
			orderNumber: c,
			code: d
		})
		setTimeout(function() {
			//			plus.webview.hide(ws, 'none', 0)
			plus.webview.close(ws, 'none', 0)
		}, 100)

	},
	handleWrite: function() {
		E.openPreWindow('enterCoupon')
		setTimeout(function() {
			plus.webview.close(ws, 'none', 0)
		}, 300)
	},
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {},
	vueObj: {
		el: '#vue',
		data: {
			showTips: false
		},
		methods: {

		}
	}

}
Page.init()