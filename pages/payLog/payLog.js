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
		mui.plusReady(function() {
			mui("#orderList").on('tap', "a", function() {
				var pid = this.getAttribute("payId")
				E.fireData("payDetail.html", "detialShow", {
					payId: pid,
				})
			})
			self.payDetail = mui.preload({
				id: 'payDetail.html',
				url: 'payDetail.html',
			});
			self.pullRefreshdown()
		})
	},
	pullRefreshdown: function() {
		Page.vue.loadData()
	},
	vueObj: {
		el: '#vue',
		data: {
			items: [],
			searchtext: "",
			showData: true,
			noData: false
		},
		methods: {
			loadData: function(val, c) {
				(c || val) && (Page.ItemId = null, this.items = [])

				var self = this;
				var params = E.systemParam('V5.mobile.order.money.search');
				params = mui.extend(params, {
					condition: val || "",
					orderId: Page.ItemId || "",
					pageSize: 15,
					optype: "up",
				})
				if(this.items.length == 0) {
					this.showData = true
				}
				this.noData = false
				E.getData('orderMoneySearch', params, function(data) {
					console.log(JSON.stringify(data))
					self.showData = false
					if(!data.isSuccess) {
						mui('#tochange').pullRefresh().endPullupToRefresh(true);
						if(data.map.errorMsg == '没有更多的数据' && self.items.length == 0) {
							self.noData = true
						} else {
							E.alert(data.map.errorMsg)
						}
						return
					}
					c && (plus.os.name == "Android" ? (window.scrollTo(0, 0)) : (mui('#tochange').pullRefresh().scrollTo(0, 0)));
					var orders = data.orders;
					self.items = self.items.concat(orders);
					Page.ItemId = val ? 1 : orders[orders.length - 1].orderId;
					mui('#tochange').pullRefresh().endPullupToRefresh(false);
					(orders.length < 15) && (mui('#tochange').pullRefresh().endPullupToRefresh(true))
					val && (mui('#tochange').pullRefresh().disablePullupToRefresh())
				}, "get")
			},
			searchItem: function() {
				var val = this.searchtext;
				if(!val) {
					E.toast('请输入手机号')
					return
				}
				var telReg = val.match(/^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/);
				if(!telReg) {
					E.toast("请输入正确的手机号")
					return
				}
				mui("#tochange").pullRefresh().refresh(true);
				mui('#tochange').pullRefresh().enablePullupToRefresh();
				Page.ItemId = null
				this.loadData(val);
				this.searchtext = ""
			},
			addAddress: function() {
				E.fireData("payDetail.html", "detialShow")
			}
		}
	}
}
Page.init()