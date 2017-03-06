var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.init({
			preloadPages: [{
				"id": "storeFinanceList",
				"url": "storeFinanceList.html",
			}, {
				"id": "storeFinanceDetail",
				"url": "storeFinanceDetail.html",
			}]
		});
		mui.plusReady(function() {
			self.vue.getEmployeeList();
			self.vue.getPaymentType()
				.then(function() {
					self.vue.getStoreAmountStatistics();
				});
		});
	},
	vueObj: {
		el: '#storeFinace',
		data: {
			//UI数据 scroll高度
			uiData: {
				scrollHeight: window.innerHeight,
			},
			//tab切换数据
			tabtags: [{
				title: '收入',
				type: 2,
			}, {
				title: '支出',
				type: 1,
			}],
			//tab切换当前状态
			checkedtab: {
				title: '收入',
				type: 2,
			},
			//开始时间
			startDate: new Date().Format('yyyy-MM-dd'),
			//截止时间
			endDate: new Date().Format('yyyy-MM-dd'),
			totalPayMentType: null,
			//收入列表数据
			storeAmountStatisticsIncome: {
				loading:false,
				loaded:false,
				isSuccess:false,
				error:'',
				totalAmount: 0,
				listData: [],
			},
			//支出列表数据
			storeAmountStatisticsOutlay: {
				loading:false,
				loaded:false,
				isSuccess:false,
				error:'',
				totalAmount: 0,
				listData: [],
			},
			//加载与否
			loading: {
				show: false,
				text: '加载中'
			},
			//店员数据  调接口取数据后更新
			pickerUserData: [],
			//当前选择店员
			operatorName: '',

		},
		watch: {
			'operatorName': function(val, oldVal) {
				if(val == oldVal) return;
				this.getStoreAmountStatistics();
			},
			//开始时间
			'startDate': function(val, oldVal) {
				if(val == oldVal) return;
				this.getStoreAmountStatistics();
			},
			//截止时间
			'endDate': function(val, oldVal) {
				if(val == oldVal) return;
				this.getStoreAmountStatistics();
			},
		},
		ready: function() {
			mui('.store_finace_scroll2').scroll()
		},
		methods: {
			showloading: function(text) {
				this.$set('loading', {
					show: true,
					text: text ? text : '加载中'
				})
			},
			hideloading: function() {
				this.$set('loading', {
					show: false,
					text: '加载中'
				});
			},
			goStoreFinanceList: function(paymentTypeId) {
				var self = this;
				var StoreFinanceListData = {
					paymentTypeId: paymentTypeId,
					type: self.checkedtab.type,
				}
				E.openWindow(url, {
					StoreFinanceListData: StoreFinanceListData
				});
			},
			getFinanceList: function() {
				var self = this;
				var params = E.systemParam("V5.mobile.store.list.statistics");
				mui.extend(params, {
					type: '',
					paymentTypeId: '',
					paymentTypeId: '',
					datetime: '',
				})
				E.getData('storeListStatistics', params, function(data) {
					// console.log(JSON.stringify(data))
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
				}, "get");
			},
			getEmployeeList: function() {
				var self = this;
				var params = E.systemParam("V5.mobile.user.get");
				E.getData('userGet', params, function(data) {
					//  console.log(data)
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					var userGets = []
					for(var i = 0; i < data.userGets.length; i++) {
						userGets.push(data.userGets[i].userName);
					}
					self.$set('pickerUserData', self.pickerUserData.concat(userGets));

				}, "get", function(error) {
					console.log(error);
				});
			},
			getPaymentType: function() {
				var self = this;
				return new Promise(function(resolve, reject) {
					var params = E.systemParam("V5.mobile.paymentType.search");
					E.getData('paymentTypeSearch', params, function(data) {

						if(!data.isSuccess) {
							E.alert(data.map.errorMsg)
							return
						}
						self.$set('totalPayMentType', data.payments);
						resolve();

					}, "get", function(error) {
						console.log(error);
						reject();
					});
				});
			},
			dealwithPaymentTypeName: function(amountStatistics) {
				if(!amountStatistics) return {};
				var totalPayMentType = this.totalPayMentType.concat();
				var totalAmount = 0;
				if(amountStatistics) {
					for(var i = 0; i < amountStatistics.length; i++) {
						totalAmount += parseFloat(amountStatistics[i].amount);
						for(var j = 0; j < totalPayMentType.length; j++) {
							if(amountStatistics[i].paymentTypeId === totalPayMentType[j].paymentType) {
								totalPayMentType[j] = {
									paymentName: amountStatistics[i].paymentTypeName,
									paymentType: amountStatistics[i].paymentTypeId,
									amount: amountStatistics[i].amount,
									count: amountStatistics[i].count,
								}
							}
						}
					}
				}
				return {
					totalAmount: totalAmount,
					listData: totalPayMentType,
				};
			},
			getStoreAmountStatistics: function() {
				var self = this;
				var params = E.systemParam("V5.mobile.store.amount.statistics");
				mui.extend(params, {
					operatorName: self.operatorName, //[0] === '全员' ? '' : self.operatorName[0],
					type: 2,
					orderType: '',
					datetime: self.startDate + '/' + self.endDate,
				})

				self.$set('storeAmountStatisticsIncome.loading',true);

				E.getData('storeAmountStatistic', params, function(data) {
					if(!data.isSuccess) {
						// E.alert(data.map.errorMsg)
						self.$set('storeAmountStatisticsIncome', {
							loading:false,
							loaded:false,
							isSuccess:false,
							error:'',
							totalAmount: 0,
							listData: [],
						});
						return
					}
					// console.log(data.amountStatistics);
					// 注意！！！
					// 接口取到的数据支付类型不全(只有有数据记录的)，这边会做个处理把数据填入到默认的数据类型列表里
					var storeAmountStatisticsIncome=mui.extend({},
						self.storeAmountStatisticsIncome,
						self.dealwithPaymentTypeName(data.amountStatistics),
						{
							loading:false,
							loaded:true,
							isSuccess:data.isSuccess,
							error: !data.isSuccess ? data.map.errorMsg : ''
						});
					//更新数据
					self.$set('storeAmountStatisticsIncome',storeAmountStatisticsIncome);
					// self.$log()
					// self.hideloading();
				}, "get", function(error) {
					// self.hideloading();
					E.alert(JSON.stringify(error));
					// console.log(error);
				});

				mui.extend(params, {
					type: 1,
				})
				E.getData('storeAmountStatistic', params, function(data) {
					if(!data.isSuccess) {
						// E.alert(data.map.errorMsg)
						self.$set('storeAmountStatisticsOutlay', {
							loading:false,
							loaded:false,
							isSuccess:false,
							error:'',
							totalAmount: 0,
							listData: [],
						});
						return
					}
					var storeAmountStatisticsOutlay=mui.extend({},
						self.storeAmountStatisticsOutlay,
						self.dealwithPaymentTypeName(data.amountStatistics),
						{
							loading:false,
							loaded:true,
							isSuccess:data.isSuccess,
							error: !data.isSuccess ? data.map.errorMsg : ''
						});
					self.$set('storeAmountStatisticsOutlay', storeAmountStatisticsOutlay);
					// self.$log()
				}, "get", function(error) {
					E.alert(JSON.stringify(error));
					// console.log(error);
				});
			},
			goStoreFinanceList: function(objdata) {
				var self = this;
				E.fireData('storeFinanceList', '', {
					storeListData: {
						type: self.checkedtab.type,
						paymentTypeId: objdata.paymentType,
						orderType: '',
						datetime: self.startDate + '/' + self.endDate,
						operatorName: self.operatorName,
					}
				})
			},
			checkTime: function(modelname) {
				var self = this
				var picker = new mui.DtPicker({
					"type": "date"
				});
				picker.show(function(rs) {
					picker.dispose();
					if(modelname==="endDate"){
						var endDate = new Date(rs.value).getTime();
						var startDate = new Date(self.startDate).getTime();
						if(endDate<startDate) {
							E.alert('结束日期不能小于开始日期');
							return;
						}
					}
					self.$set(modelname, rs.value);
					// console.log(modelname);
					// self.$log();
				});
			},
		}
	}

}
Page.init();
