var Page = {
	ItemId: null,
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.init({
			pullRefresh: {
				container: '#tochange',
				down: {
					contentrefresh: '下拉刷新中...',
					callback: self.pullRefreshDown
				},
				up: {
					contentdown: '上拉加载更多',
					contentrefresh: '正在刷新中...',
					callback: self.pullRefreshUp
				}
			},
			swipeBack: false,
			keyEventBind: {
				backbutton: false
			}

		});
		mui.plusReady(function() {
			E.getStorage("imei") == 1 && (self.vue.hasImei = true);
			self.muiEvent()
		})
	},
	muiEvent: function() {
		var self = this;
		mui("#orderList").on('tap', "a", function() {
			E.fireData(E.preloadPages[0], 'detailShow', {
				orderNumber: this.getAttribute('orderNumber'),
				address: this.getAttribute('address'),
				orderStatus: self.vue.orderStatus
			})

		})
		E.initDataurl("pid", function(pid) {
			mui('#bottomPopover').popover('hide')
			E.showLoading();
			mui('#tochange').pullRefresh().enablePullupToRefresh();
			self.vue.loadData(pid, "", 1)
		})
	},
	pullRefreshDown: function() {
		mui('#tochange').pullRefresh().endPulldownToRefresh();
		Page.vue.loadData(Page.vue.orderStatus, "", 1)
	},
	pullRefreshUp: function() {
		Page.vue.loadData(Page.vue.orderStatus)
	},
	vueObj: {
		el: '#order',
		data: {
			items: [],
			searchtext: "",
			orderStatus: "",
			statusName: "",
			hasImei: false,
			isSelect: false
		},
		methods: {
			loadData: function(status, val, c) {
				var self = this;
				c && (Page.ItemId = null)
				var params, urlPath;
				if (status == "IN_STORE") {
					params = E.systemParam("V5.mobile.order.store.search");
					urlPath = "orderStoreSearch";
				} else {
					params = E.systemParam('V5.mobile.order.info.search');
					urlPath = "orderInfoSearch"
				}
				params = mui.extend(params, {
					orderStatus: status || "",
					orderNumber: val || "",
					orderId: Page.ItemId || "",
					pageSize: 15,
					optype: "up"
				})
				this.isSelect = false
				E.getData(urlPath, params, function(data) {
					console.log(JSON.stringify(data))
					self.orderStatus = status
					E.closeLoading();
					c && (self.items = [])
					self.statusName = status == "UN_ACCPET" ? "未接订单" : status == "ACCPET" ? "已接订单" : status == "SINCE" ? "自提订单" : status == "WAIT_GOOD" ? "待收货订单" : status == "END_ORDER" ? "已完结订单" : status == "IN_STORE" ? "门店订单" : "全部订单"
					if (!data.isSuccess) {
						mui('#tochange').pullRefresh().endPullupToRefresh(true);
						(val || !Page.ItemId) && (self.items = []);
						E.alert(data.map.errorMsg);
						return
					}
					c && (plus.os.name == "Android" ? (window.scrollTo(0, 0)) : (mui('#tochange').pullRefresh().scrollTo(0, 0)));
					var orders = data.orders;
					Page.ItemId == null && (self.items = [])
					self.items = self.items.concat(orders);
					Page.ItemId = val ? 1 : orders[orders.length - 1].orderId;
					mui('#tochange').pullRefresh().endPullupToRefresh(false);
					(orders.length < 15) && (mui('#tochange').pullRefresh().endPullupToRefresh(true))
				}, "get")
			},
			searchItem: function() {
				var val = this.searchtext;
				E.showLoading()
				mui('#tochange').pullRefresh().enablePullupToRefresh();
				Page.ItemId = null
				this.loadData(this.orderStatus, val, 1);
				this.searchtext = ""
			},
			selectAll: function() {
				E.selectAll(!this.isSelect), this.isSelect = !this.isSelect
			},
			sendGoods: function() {
				E.getNumber(function(o) {
					E.showLoading()
					var params = E.systemParam("V5.mobile.order.outsend");
					params = mui.extend(params, {
						orderNumber: o,
						operation: 'STORE_DELIVERY'
					})
					E.getData('orderOutsend', params, function(data) {
						E.closeLoading()
						if (!data.isSuccess) {
							E.alert(data.map.errorMsg)
							return
						}

						E.alert("发货成功");
						Page.ItemId = null;
						Page.pullRefreshDown()
					}, "get")
				})
			},
			getOrder: function() {
				E.getNumber(function(o) {
					E.showLoading()
					var params = E.systemParam("V5.mobile.order.operation");
					params = mui.extend(params, {
						orderNumber: o,
						operation: 'ACCEPET',
						operationReason: ""
					})
					E.getData('orderOperation', params, function(data) {
						E.closeLoading()
						if (!data.isSuccess) {
							E.alert(data.map.errorMsg)
							return
						}
						E.alert("接单成功");
						Page.ItemId = null;
						Page.pullRefreshDown()
					}, "get")
				})
			},
			goToMap: function() {
				var self = this;
				var allMapData = this.items,
					thisMapData = [],
					mapData = [];
				for (var i = 0, len = mui(".ListTag").length; i < len; i++) {
					if (mui(".ListTag")[i].querySelector("[type=checkbox]").checked) {
						thisMapData.push(allMapData[i])
					}
				}
				thisMapData.length == 0 && (thisMapData = allMapData)
				thisMapData.length > 9 && (thisMapData.length = 9)
				for (i in thisMapData) {
					mapData.push([thisMapData[i].address, thisMapData[i].distance + "km", thisMapData[i].orderNumber])
				}

				E.openWindow("../map/map.html", {
					orderStatus: self.orderStatus,
					data: mapData
				})

			},
			goOrderScan: function() {
				E.openWindow("../barcode/orderScan.html")
			}
		}
	}
}
Page.init()