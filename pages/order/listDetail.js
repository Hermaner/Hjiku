var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.init();
		mui.plusReady(function() {
			self.ws = plus.webview.currentWebview();
			window.addEventListener('pageshow', function(event) {
				self.vue.orderNumber = event.detail.orderNumber;
			})
		})
		mui.back = function() {
			plus.webview.currentWebview().hide("pop-out");
			setTimeout(function() {
				self.vue.resetData()
			}, 250)
		}
	},
	vueObj: {
		el: '#vue',
		data: {
			sndata: [],
			order: {},
			orderNumber:''
		},
		methods: {
			loadData: function(c) {
				var self = this;
				var params = E.systemParam('V5.mobile.project.jiku.order.get');
				params.orderNumber = c;
				E.showLoading()
				E.getData('jikuOrderGet', params, function(data) {
					E.closeLoading();
					console.log(data);
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					self.order = data.order;
				})
			},
			deliverOrder: function() {
				var self = this;
				var orderData = { orderNumber: this.orderNumber };
				orderData.items=[];
				var params = E.systemParam('V5.mobile.project.jiku.order.update');
				params.orderData = JSON.stringify(orderData);
				E.showLoading()
				E.getData('jikuOrderUpdate', params, function(data) {
					E.closeLoading();
					console.log(data);
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					self.loadData()
				})
			},
			checkSN: function(sncode) {
				var self = this;
				var params = E.systemParam('V5.mobile.project.jiku.items.get');
				params = mui.extend(params, {
					condition: sncode + ',' + this.submitData.items[0].productItemId,
					type: 'productSN',
				})
				E.showLoading()
				E.getData('jikuItemsGet', params, function(data) {
					E.closeLoading()
					if(!data.isSuccess) {
						if(data.map.errorMsg.match('状态为售出')) {
							E.alert('SN码' + sncode + "已售出，不能使用")
						} else if(data.map.errorMsg.match('不存在')) {
							E.alert('SN码' + sncode + "不存在")
						} else {
							E.alert(data.map.errorMsg)
						}
						return
					}
					self.sndata.push(sncode);
					self.submitData.items[0].sn = self.sndata.join(',');
					self.submitData.items[0].quantity = self.sndata.length;
				})
			},
			gosnScan: function() {
				E.openWindow("../barcode/orderScan.html", {
					type: "sn"
				})
			},
			enterSn: function() {
				var self = this;
				E.prompt("请输入SN码", "请输入SN码", function(v) {
					self.checkSN(v);
				})
			},
			deleteSn: function(index) {
				this.sndata.splice(index, 1);
			},
			resetData: function() {
				this.sndata = [];
			}
		}
	}
}
Page.init()