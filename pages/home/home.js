var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.plusReady(function() {
			self.ws = plus.webview.currentWebview();
		});
	},
	vueObj: {
		el: '#vue',
		data: {
			homeData: {},
			accAr: [],
			listData: [],
			op: "",

		},
		ready: function() {
			this.listData = [{
				name: '下单',
				icon: "icon-accept",
				page: "page",
				type: "1",
			}, {
				name: '所有订单',
				icon: "icon-accept",
				page: "page",
				type: "1",
			}, {
				name: '现场订单',
				icon: "icon-accept",
				page: "page",
				type: "1",
			}, {
				name: '自提订单',
				icon: "icon-accept",
				page: "page",
				type: "1",
			}, {
				name: '退押金单',
				icon: "icon-accept",
				page: "page",
				type: "1",
			}, {
				name: '退租金单',
				icon: "icon-accept",
				page: "page",
				type: "1",
			}, ]
		},
		methods: {
			loadData: function() {
				var self = this;
				mui.plusReady(function() {
					var params = E.systemParam("V5.mobile.order.status.count");
					E.getData('orderStatusCount', params, function(data) {
						console.log(JSON.stringify(data))
						if(!data.isSuccess) {
							E.closeLoading()
							E.alert(data.map.errorMsg)
							return
						}
						self.homeData = data;
						self.op = E.getStorage("op");
						E.setStorage("address", data.address);
						(data.unAccpetCount > 0 || data.acceptCount > 0) ? (Page.openr.evalJS("Page.addNavIcon(true)")) : (Page.openr.evalJS("Page.addNavIcon(false)"))

					}, "get");
				})
			},
			goPage: function(url, type) {
				switch(url) {
					case '../createVip/createVip.html':
						E.openPreWindow('createVip')
						break;
					case 'caserIn':
						E.openPreWindow('caserIn')
						break;
					case 'moreList.html':
						E.openWindow('moreList.html', {
							moreList: this.moreList
						})
						break;
					default:
						E.openWindow(url, {
							type: type ? type : ''
						})
						break;
				}
			},
			exitLogin: function() {
				Page.openr.hide("pop-out");
			},
		}
	}

}
Page.init()