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
				up: {
					contentdown: '上拉加载更多',
					contentrefresh: '正在刷新中...',
					callback: self.pullRefreshdown
				}
			}
		});
		mui.plusReady(function() {});
		var oldBack = mui.back;
		mui.back = function() {
			oldBack()
			self.vue.resetData()
		}
	},
	pullRefreshdown: function() {
		Page.vue.loadData()
	},
	vueObj: {
		el: '#vue',
		data: {
			showData: true,
			noData: false,
			items: []
		},
		ready: function() {

		},
		methods: {
			loadData: function(d) {
				var self = this;
				if(d) {
					this.showData = true
					this.noData = false
					Page.ItemId = null;
					this.items = []
				}
				var params = E.systemParam('V5.mobile.allocate.out.search')
				params = mui.extend(params, {
					allocateOutId: Page.ItemId || "",
					pageSize: 15,
					optype: "up",
				})
				E.getData('allocateOutSearch', params, function(data) {
					self.showData = false
					console.log(JSON.stringify(data))
					if(!data.isSuccess) {
						mui('#tochange').pullRefresh().endPullupToRefresh(true);
						if(data.map.errorMsg == '没有相关调货入库单信息') {
							if(d) {
								self.noData = true
							}
						} else {
							E.alert(data.map.errorMsg)
						}
						return
					}
					d && (plus.os.name == "Android" ? (window.scrollTo(0, 0)) : (mui('#tochange').pullRefresh().scrollTo(0, 0)));
					var orders = data.orders;
					for(var i = 0; i < orders.length; i++) {
						orders[i].checked = false
					}
					self.items = self.items.concat(orders);
					Page.ItemId = orders[orders.length - 1].allocateOutId
					mui('#tochange').pullRefresh().endPullupToRefresh(false);
					if(orders.length < 15) {
						mui('#tochange').pullRefresh().endPullupToRefresh(true)
					}
				}, "get")
			},
			resetData: function() {
				this.showData = true;
				this.noData = false;
				this.items = [];
				Page.ItemId=null;
			}
		}
	}

}
Page.init()