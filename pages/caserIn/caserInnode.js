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
					callback: self.pullRefreshUp
				}
			}
		});

		mui.plusReady(function() {
			window.addEventListener('detailShow', function(event) {
				self.vue.loadData()
			})
			mui("#itemList").on('tap', "li", function() {
				var pid = this.getAttribute("pid")
				console.log(pid)
				self.vue.goDetail(pid)
			})
			var oldBack = mui.back;
			mui.back = function() {
				self.ItemId = null;
				self.vue.items = []
				self.vue.showData = true
				oldBack()
			}
		});
	},
	pullRefreshUp: function() {
		Page.vue.loadData()
	},
	vueObj: {
		el: '#vue',
		data: {
			items: [],
			showData: true,
			noData: false,
		},
		methods: {
			loadData: function() {
				var self = this;
				var params = E.systemParam('V5.mobile.receivables.history.search');
				params = mui.extend(params, {
					orderId: Page.ItemId || "",
					pageSize: 15,
					optype: "up",
				})
				E.getData('receivablesHistorySearch', params, function(data) {
					self.showData = false
					console.log(JSON.stringify(data))
					if(!data.isSuccess) {
						mui('#tochange').pullRefresh().endPullupToRefresh(true);
						if(data.map.errorMsg == '没有更多的数据') {
							mui('#tochange').pullRefresh().disablePullupToRefresh()
							if(d) {
								self.noData = true
							} else {
								E.alert(data.map.errorMsg)
							}
						} else {
							E.alert(data.map.errorMsg)
						}
						return
					}
					self.noData = false
					var receivablesHistorys = data.receivablesHistorys;
					self.items = self.items.concat(receivablesHistorys);
					Page.ItemId = receivablesHistorys[receivablesHistorys.length - 1].orderId;
					mui('#tochange').pullRefresh().endPullupToRefresh(false);
					if(receivablesHistorys.length < 15) {
						mui('#tochange').pullRefresh().endPullupToRefresh(true)
					}
				}, "get")
			},
			goDetail: function(id) {
				E.fireData('caserIndetail', '', {
					receivablesNo: id
				})
			}
		}
	}

}
Page.init()