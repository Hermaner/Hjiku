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
			keyEventBind: {
				backbutton: false
			}

		});
		mui.plusReady(function() {
			window.addEventListener('pageshow', function(event) {
				self.vue.type = event.detail.type;
				self.vue.loadData();
			})
			window.addEventListener('reset', function(event) {
				self.vue.resetData();
			})
		})
		mui("#listPopover").on("tap", "li", function() {
			var sincepup = this.getAttribute("pid");
			self.vue.sincepup = sincepup;
			switch(sincepup) {
				case "1":
					self.vue.searchType = "手机号码";
					break;
				case "2":
					self.vue.searchType = "收货人姓名";
					break;
				case "3":
					self.vue.searchType = "订单编号";
					break;
				default:
					break;
			}
			mui('#listPopover').popover('hide');
		});
	},
	pullRefreshDown: function() {
		mui('#tochange').pullRefresh().endPulldownToRefresh();
		Page.vue.loadData("", 1)
	},
	pullRefreshUp: function() {
		Page.vue.loadData()
	},
	vueObj: {
		el: '#vue',
		data: {
			items: [],
			searchType: "手机号码",
			searchtext: "",
			showData: true,
			deliveryStatus: "",
			sincepup: "1",
			status: '1',
			type: '1',
		},
		methods: {
			loadData: function(val, c) {
				var self = this;
				var type = this.type;
				var condition = {};

				switch(type) {
					case "1":
						condition.mobilePhone = val;
						break;
					case "3":
						condition.mobilePhone = val;
						break;
					case "2":
						condition.deliveryStatus = this.deliveryStatus;
						if(val) {
							switch(this.sincepup) {
								case "1":
									condition.mobilePhone = val;
									break;
								case "2":
									condition.consignee = val;
									break;
								case "3":
									condition.orderNumber = val;
									break;
								default:
									break;
							}
						}
						break;
					default:
						break;
				}

				c && (Page.ItemId = null)
				console.log(JSON.stringify(condition))
				var params = E.systemParam('V5.mobile.project.jiku.orders.get');
				params = mui.extend(params, {
					condition: JSON.stringify(condition),
					orderId: Page.ItemId || "",
					pageSize: 15,
					optype: "up",
					type: type,
					status: this.status,
				})
				E.getData("jikuOrdesGet", params, function(data) {
					console.log(data)
					self.showData = false;
					E.closeLoading();
					c && (self.items = [])
					if(!data.isSuccess) {
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
			hidePoper:function(){
				mui('#listPopover').popover('hide');
			},
			searchItem: function() {
				var val = this.searchtext;
				E.showLoading()
				mui('#tochange').pullRefresh().enablePullupToRefresh();
				Page.ItemId = null
				this.showData = true;
				this.loadData(val, 1);
				this.searchtext = ""
			},
			goOrderScan: function() {
				E.openWindow("../barcode/orderScan.html")
			},
			goDetail: function(orderNumber) {
				E.fireData("listDetail", "", {
					orderNumber: orderNumber
				})
			},
			resetData: function() {
				var self = this;
				setTimeout(function() {
					self.items = [];
					self.searchtext = "";
					self.showData = true;
					Page.ItemId = null;
					self.searchType = "手机号码";
					self.deliveryStatus = "";
					self.sincepup = "1";
					self.status = '1';
					self.type = '1';
				}, 250)
			}
		}
	}
}
Page.init()