var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.plusReady(function() {
			self.ws = plus.webview.currentWebview();
			window.addEventListener('pageshow', function(event) {
				self.vue.loadData();
			})
		});
	},
	vueObj: {
		el: '#vue',
		data: {
			listData: [],
			shop: {}
		},
		ready: function() {
			this.listData = [{
				name: '下单',
				icon: "icon-accept",
				page: "page",
				type: "4",
				count: '0'
			}, {
				name: '所有订单',
				icon: "icon-accept",
				page: "page",
				type: "1",
				count: '0'
			}, {
				name: '现场订单',
				icon: "icon-accept",
				page: "page",
				type: "3",
				count: '0'
			}, {
				name: '自提订单',
				icon: "icon-accept",
				page: "page",
				type: "2",
				count: '0'
			}, {
				name: '退押金单',
				icon: "icon-accept",
				page: "rentorder",
				type: "5",
				count: '0'
			}, {
				name: '退租金单',
				icon: "icon-accept",
				page: "rentorder",
				type: "6",
				count: '0'
			}]
		},
		methods: {
			loadData: function() {
				var self = this;
				var params = E.systemParam("V5.mobile.project.jiku.statistics.get");
				E.getData('jikuStatisticsGet', params, function(data) {
					console.log(data)
					E.closeLoading()
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					self.listData[1].count = data.statistics.orderCount;
					self.listData[2].count = data.statistics.siteCount;
					self.listData[3].count = data.statistics.fetchCount;
					self.listData[4].count = data.statistics.depositCount;
					self.listData[5].count = data.statistics.rentCount;
					self.shop = data.shop;
				});
			},
			goPage: function(type) {
				switch(type) {
					case '4':
						E.fireData('cashrCart')
						break;
					case '5':
						E.fireData('rentTop', "", {
							type: type
						})
						break;
					case '6':
						E.fireData('rentTop', "", {
							type: type
						})
						break;
					default:
						E.fireData('orderTop', "", {
							type: type
						})
						break;
				}
			},
			exitLogin: function() {
				Page.ws.hide("pop-out");
			},
		}
	}

}
Page.init()