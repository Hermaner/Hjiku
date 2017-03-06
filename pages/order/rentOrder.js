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
		mui("#listPopover").on("tap", "li", function() {
			var pid = this.getAttribute("pid");
			self.vue.type = pid;
			switch(pid) {
				case "productName":
					self.vue.searchType = "商品名称";
					break;
				case "productNumber":
					self.vue.searchType = "商品编码";
					break;
				case "skuName":
					self.vue.searchType = "规格名称";
					break;
				case "skuNumber":
					self.vue.searchType = "规格编码";
					break;
				case "barcode":
					self.vue.searchType = "商品条码";
					break;
				case "ourPrice":
					self.vue.searchType = "销售价";
					break;
				case "productSN":
					self.vue.searchType = "SN码";
					break;
				default:
					break;
			}
			mui('#listPopover').popover('hide');
		});
		mui.plusReady(function() {

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
		el: '#vue',
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
			goOrderScan: function() {
				E.openWindow("../barcode/orderScan.html")
			}
		}
	}
}
Page.init()