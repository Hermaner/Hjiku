var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.init({});
		mui.plusReady(function() {
			var ws = plus.webview.currentWebview();
			window.addEventListener('detailShow', function(event) {
				self.vue.storeDetailData = event.detail.storeDetailData;
				if(self.vue.storeDetailData.type == 2) {
					self.vue.title = "收入详情"
				} else {
					self.vue.title = "支出详情"
				}
				self.vue.getStoreDetailStatistics();
			})
		});
		var oldBack = mui.back;
		mui.back = function() {
			oldBack();
			self.vue.storeDetailData = {
				number: '',
				type: '',
			};
			self.vue.storeDetail = {
				isSuccess: false,
				storeDetailStatistic: {},
			};
		};
	},
	vueObj: {
		el: '#storeFinanceDetail',
		data: function() {
			return {
				title: '',
				storeDetailData: {
					number: '',
					type: '',
				},
				storeDetail: {
					isSuccess: false,
					storeDetailStatistic: {},
				},
			};
		},
		methods: {
			getStoreDetailStatistics: function() {
				var self = this;
				var params = E.systemParam("V5.mobile.store.detail.statistics");
				mui.extend(params, {
					number: self.storeDetailData.number
				})
				E.getData('storeDetailStatistics', params, function(data) {
					console.log(data);
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					self.$set('storeDetail', data);
					self.$log();
				}, "get");
			},
		}
	}

}
Page.init();
