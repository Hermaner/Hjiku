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
				self.vue.storeListData = event.detail.storeListData;
				if(self.vue.storeListData.type == 2) {
					self.vue.title = "收入记录"
				} else {
					self.vue.title = "支出记录"
				}
				self.vue.getStoreListStatistics();

			})
		});
		var oldBack = mui.back;
		mui.back = function() {
			oldBack();
			self.vue.storeListStatistics = {
					loading:false,
					error:'',
					isSuccess: false,
					storeListStatistics: [],
			};
			self.vue.storeListData = {
					type: '',
					paymentTypeId: '',
					orderType: '',
					datetime: '',
			};
		};
	},
	vueObj: {
		el: '#storeFinanceList',
		data: function() {
			return {
				storeListData: {
					type: '',
					paymentTypeId: '',
					orderType: '',
					datetime: '',
				},
				title: "",
				storeListStatistics: {
					loading:false,
					error:'',
					isSuccess: false,
					storeListStatistics: [],
				},
			};
		},
		methods: {
			getStoreListStatistics: function() {
				var self = this;
				self.$set('storeListStatistics.loading', true)

				var params = E.systemParam("V5.mobile.store.list.statistics");
				mui.extend(params, self.storeListData)
				E.getData('storeListStatistics', params, function(data) {
					// console.log(data);
					// if(!data.isSuccess) {
					// 	E.alert(data.map.errorMsg)
					// 	return
					// }
					if(data.storeListStatistics){
						for(var i = 0; i < data.storeListStatistics.length; i++) {
							switch(data.storeListStatistics[i].orderType) {
								case '1':
								data.storeListStatistics[i].orderTypeName = '充值收入';
								break;
								case '2':
								data.storeListStatistics[i].orderTypeName = '订单收入';
								break;
								case '3':
								data.storeListStatistics[i].orderTypeName = '定金收入';
								break;
								case '4':
								data.storeListStatistics[i].orderTypeName = '收银收入';
								break;
								case '5':
								data.storeListStatistics[i].orderTypeName = '定金支出';
								break;
								default:
							}
						}
					}
					self.$set('storeListStatistics', mui.extend({},{
						loading:false,
						error: !data.isSuccess ? data.map.errorMsg : ''
					},data));
					self.$log();
				}, "get");
			},
			goStoreFinanceDetial: function(number) {
				var self = this;
				E.fireData('storeFinanceDetail', '', {
					storeDetailData: {
						number: number,
						type: self.storeListData.type,
					}
				})
			},
		}
	}

}
Page.init();
