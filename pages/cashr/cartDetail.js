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
				
				unsnItems.forEach(function(item){
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
							quantity: mainPd.snAr.length || mainPd.count,
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
						}
					];
					if(mainPd.snAr && mainPd.snAr.length > 0) {
						self.vue.hasSNsearch = true;
						self.vue.sndata=mainPd.snAr;
//						mainPd.snAr.forEach((sn) => {
//							self.vue.checkSN(sn);
//						});
					}
				}
			})
		})
		mui.back = function() {
			plus.webview.currentWebview().hide("pop-out");
			setTimeout(function() {
				self.vue.resetData()
			}, 250)
		}
	},
	vueObj: {
		el: '#vue',
		data: {
			defaultdays: 3,
			hiredays: 3,
			sndata: [],
			spAmount: 0,
			yjAmount: 0,
			hasSNsearch: false,
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
			this.beginText = date1.getTime();
			this.endText = date2.getTime();
			this.beginFont = date1.getFullYear() + "-" + (date1.getMonth() + 1) + "-" + date1.getDate()
			this.endFont = date2.getFullYear() + "-" + (date2.getMonth() + 1) + "-" + date2.getDate()
		},
		methods: {
			loadData: function(c) {

			},
			checkSN: function(sncode) {
				var self = this;
				var params = E.systemParam('V5.mobile.project.jiku.items.get');
				params = mui.extend(params, {
					condition: sncode + ',' + this.submitData.items[0].productItemId,
					type: 'productSN',
				})
				E.showLoading()
				E.getData('jikuItemsGet', params, function(data) {
					E.closeLoading()
					if(!data.isSuccess) {
						if(data.map.errorMsg.match('状态为售出')) {
							E.alert('SN码' + sncode + "已售出，不能使用")
						} else if(data.map.errorMsg.match('不存在')) {
							E.alert('SN码' + sncode + "不存在")
						} else {
							E.alert(data.map.errorMsg)
						}
						return
					}
					self.sndata.push(sncode);
					self.submitData.items[0].sn = self.sndata.join(',');
					self.submitData.items[0].quantity= self.sndata.length;
				})
			},
			gosnScan: function() {
				E.openWindow("../barcode/orderScan.html", {
					type: "sn"
				})
			},
			enterSn: function() {
				var self = this;
				E.prompt("请输入SN码", "请输入SN码", function(v) {
					self.checkSN(v);
				})
			},
			deleteSn: function(index) {
				this.sndata.splice(index, 1);
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
				}
				var params = E.systemParam('V5.mobile.project.jiku.order.create');
				params.orderData = JSON.stringify(this.submitData);
				E.showLoading()
				E.getData('jikuOrderCreate', params, function(data) {
					if(!data.isSuccess) {
						alert(data.map.errorMsg);
						return;
					}
					//					e.fireData('pay', {
					//						orderId: json.orderNumber,
					//						orderData,
					//					});
				}, "post")

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
			resetData: function() {
				this.sndata = [];
				this.hasSNsearch = false;
			}
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