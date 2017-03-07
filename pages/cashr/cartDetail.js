var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.init();
		mui.plusReady(function() {
			self.ws = plus.webview.currentWebview();
			window.addEventListener('pageshow', function(event) {
				var unsnItems = event.detail.unsnItems;
				var snItems = event.detail.snItems;
				var mainPd = ''; // 主商品
				var depositPd = ''; // 押金商品
				unsnItems.forEach((item) => {
					if(!mainPd && item.isDeposits === '0') {
						mainPd = item;
					}
					if(!depositPd && item.isDeposits === '1') {
						depositPd = item;
					}
				});
				if(snItems.length > 0) {
					mainPd = snItems[0];
				}
				if(mainPd && depositPd) {
					self.vue.submitData.items = [{
							pdname: mainPd.productName,
							isDeposits: 0,
							quantity: mainPd.count,
							price: mainPd.price,
							productItemId: mainPd.productItemId,
							sn: mainPd.snAr ? mainPd.snAr.toString() : '',
							days: self.vue.defaultdays, //默认租用天数，此数据在修改leaveHomeTime，returnHomeTime时实时算出
						},
						{
							pdname: depositPd.productName,
							isDeposits: 1,
							quantity: depositPd.count,
							price: depositPd.price,
							productItemId: depositPd.productItemId,
							days: 1,
						},
					];
					if(mainPd.snAr && mainPd.snAr > 0) {
						mainPd.snAr.forEach((sn) => {
							self.vue.checkSN(sn);
						});
					}
				}
			})
		})
	},
	vueObj: {
		el: '#vue',
		data: {
			searchtext: "",
			items: null,
			defaultdays: 3,
			hiredays: 3,
			sndata: [],
			spAmount: 0,
			yjAmount: 0,
			submitData: {
				consignee: '',
				mobilePhone: '',
				leaveHomeTime: '',
				returnHomeTime: '',
				actualAmount: 0,
				memo: '',
				items: [],
			},
			beginText: "",
			beginFont: "",
			endText: "",
			endFont: "",
		},
		ready: function() {
			var date1 = new Date();
			var date2 = new Date(date1);
			date2.setDate(date1.getDate() + this.defaultdays);
			this.beginText=date1.getTime();
			this.endText=date2.getTime();
			this.beginFont = date1.getFullYear() + "-" + (date1.getMonth() + 1) + "-" + date1.getDate()
			this.endFont = date2.getFullYear() + "-" + (date2.getMonth() + 1) + "-" + date2.getDate()
		},
		methods: {
			loadData: function(c) {

			},
			checkSN: function(sncode) {
				var self = this;
				this.sndata.push({
					sn: sncode,
					status: 0,
				});
				this.submitData.items[0].sn = sndata.map(item => item.sn).toString();
				var params = E.systemParam('V5.mobile.project.jiku.items.get');
				params = mui.extend(params, {
					condition: sncode + ',' + this.submitData.items[0].productItemId,
					type: 'productSN',
				})
				E.showLoading()
				E.getData('jikuItemsGet', params, function(data) {
					console.log(data);
					self.sndata.map((sn) => {
						var newsn = sn;
						if(newsn.sn === sncode) {
							if(data.isSuccess) {
								newsn.status = 1;
							} else {
								newsn.status = 4;
								if(data.map.errorMsg.match('状态为售出')) {
									newsn.status = 3;
								}
							}
						}
						return newsn;
					});
				})
			},
			gosnScan: function() {
				E.openWindow("../barcode/orderScan.html", {
					type: "sn"
				})
			},
			enterSn: function() {
				E.prompt("请输入SN码", "请输入SN码", function(v) {
					alert(v);
				})
			},
			deleteSn:function(){
				
			},
			createOrder: function() {
				if(!this.submitData.mobilephone || !this.submitData.consignee || this.beginFont == '选择日期' || this.endFont == '选择日期') {
					E.toast("信息不全");
					return;
				}
				if(this.submitData.consignee.length < 2) {
					E.toast("姓名长度不能少于2位");
					return;
				}
				var telReg = !!(this.submitData.mobilephone).match(/^1[34578]\d{9}$/);
				if(telReg == false) {
					E.toast("请输入正确的手机号");
					return
				}
				this.submitData.leaveHomeTime = this.beginFont;
				this.submitData.returnHomeTime = this.endFont;
				this.submitData.actualAmount = this.totalAmount;
				var mainProduct = this.submitData.items[0];
				if(mainProduct.sn == '') {
					alert('下单失败，请录入设备SN码');
					return;
				} else if(mainProduct.sn.split(',').length != mainProduct.quantity) {
					alert('下单失败，备SN码数量不正确');
					return;
				} else if(mainProduct.sn.split(',').length == mainProduct.quantity) {
					let alldone = true;
					sndata.forEach((sn) => {
						if(sn.status != 1) {
							alldone = false;
						}
					});
					if(!alldone) {
						alert('下单失败，有不可用的设备SN码');
						return;
					}
				}
				var params = E.systemParam('V5.mobile.project.jiku.order.create');
				params.orderData = JSON.stringify(this.submitData);
				E.showLoading()

				E.getData('jikuOrderCreate', params, function(data) {
					if(!data.isSuccess) {
						alert(json.map.errorMsg);
						return;
					}
					e.fireData('pay', {
						orderId: json.orderNumber,
						orderData,
					});
				})

			},
			optionTime: function(c) {
				var self = this
				var picker = new mui.DtPicker({ "type": "date", "beginYear": 2000, "endYear": 2030 });
				picker.show(function(rs) {
					var rsTime = new Date(rs.text.replace(/-/g, "/")).getTime();
					var beginText, endText;
					if(c) {
						beginText = rsTime;
						if(self.endText < (beginText + self.defaultdays * 86400000)) {
							alert('回国日期应大于出国时间' + self.defaultdays + '天')
							return
						} else {
							self.beginText = rsTime;
						}
					} else {
						endText = rsTime;
						if(endText < (self.beginText + self.defaultdays * 86400000)) {
							alert('回国日期应大于出国时间' + self.defaultdays + '天')
							return
						} else {
							self.endText = rsTime;
						}
					}
					if(self.beginText + 86400000 < new Date().getTime()) {
						alert('不能选择今天以前的时间')
						return
					}
					self.hiredays = (self.endText - self.beginText) / 86400000;
					c ? self.beginFont = rs.text : self.endFont = rs.text
					picker.dispose();
				});
			},
		},
		computed: {
			totalAmount: function() {
				var pd = this.submitData.items[0];
				var yj = this.submitData.items[1];
				var day = this.hiredays;
				this.spAmount = parseFloat(pd.quantity * day * pd.price).toFixed(2);
				this.yjAmount = parseFloat(pd.quantity * yj.price * day).toFixed(2);
				var total = (parseFloat(pd.quantity * day * pd.price) + parseFloat(pd.quantity * yj.price * day)).toFixed(2);
				return total;
			}
		}
	}
}
Page.init()