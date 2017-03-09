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
				backbutton: false,
			},
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
			type: "",
			items: [],
			noData: false,
			showData: true,
			searchtext: "",
		},
		methods: {
			loadData: function(val, c) {
				var self = this;
				c && (Page.ItemId = null)
				var params, urlPath;
				var type = this.type;
				if(type == "6") {
					params = E.systemParam("V5.mobile.project.jiku.return.orders.get");
					urlPath = "jikuReturnOrdesGet";
				} else {
					params = E.systemParam('V5.mobile.project.jiku.deposit.orders.get');
					urlPath = "jikuDepositOrdesGet"
				}
				params = mui.extend(params, {
					depositNumber: val || "",
					orderId: Page.ItemId || "",
					pageSize: 5,
					optype: "up"
				})
				E.getData(urlPath, params, function(data) {
					console.log(data)
					E.closeLoading();
					self.showData = false;
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
					(orders.length < 5) && (mui('#tochange').pullRefresh().endPullupToRefresh(true))
				})
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
			resetData: function() {
				var self = this;
				setTimeout(function() {
					self.items = [];
					self.title = "";
					self.searchtext = "";
					self.showData=true;
					Page.ItemId = null
					mui('#tochange').pullRefresh().enablePullupToRefresh();
				}, 250)
			}
		}
	}
}
Page.init()