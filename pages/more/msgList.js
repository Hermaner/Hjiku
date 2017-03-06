var msgPage = {
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
					callback: self.vue.loadData
				}
			},
		});
		mui.plusReady(function() {
			self.vue.loadData()
		})
	},
	vueObj: {
		el: '#msgList',
		data: {
			items: [],
		},
		methods: {
			loadData: function() {
				var self = this;
				var param = E.systemParam('V5.mobile.message.search');
				param = mui.extend(param, {
					messageId: msgPage.ItemId || "",
					pageSize: 15,
					optype: "up",
				})
				E.getData('messageSearch', param, function(data) {
					E.closeLoading();
					if (!data.isSuccess) {
						mui('#tochange').pullRefresh().endPullupToRefresh(true);
						E.alert(data.map.errorMsg)
						return
					}
					var messages = data.messages;
					msgPage.ItemId = messages[messages.length - 1].messageId
					self.items = self.items.concat(messages);
					mui('#tochange').pullRefresh().endPullupToRefresh(false);
					(messages.length < 15) && (mui('#tochange').pullRefresh().endPullupToRefresh(true))
				}, "get")
			},
		}
	}
}
msgPage.init()