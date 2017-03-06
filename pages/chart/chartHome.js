var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig(), this.muiEvent()
	},
	initConfig: function() {
		var self = this;
		mui.plusReady(function() {
			self.vue.op = E.getStorage("op")
			self.vue.storeName = E.getStorage("storeName")
			self.vue.loadData()
		});
	},
	muiEvent: function() {
		var self = this;
		mui(".mui-scroll").on('tap', "a", function() {
			var chartId = this.getAttribute('chartId')
			E.openWindow("chart.html", {
				chartId: chartId
			})

		})
	},
	vueObj: {
		el: '#home',
		data: {
			yesData: {},
			op: "",
			storeName: ''
		},
		methods: {
			loadData: function() {
				var self = this;
				var param = E.systemParam("V5.mobile.order.yesterdayCount")
				E.getData('yesterdayCount', param, function(data) {
					console.log(JSON.stringify(data))
					E.closeLoading()
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					self.yesData = data.yesterdays;
				}, "get");

			}
		}
	}

}
Page.init()