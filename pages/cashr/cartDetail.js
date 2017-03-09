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
				console.log(unsnItems)
				unsnItems.forEach(function(item) {
					if(!mainPd && item.isDeposits == '0') {
						mainPd = item;
					}
					if(!depositPd && item.isDeposits == '1') {
						depositPd = item;
					}
				});
				
				if(snItems.length > 0) {
					mainPd = snItems[0];
				}
				if(mainPd && depositPd) {
					var item0={
							pdname: mainPd.productName,
							isDeposits: 0,
							quantity: mainPd.snAr ? mainPd.snAr.length : mainPd.count,
							price: mainPd.price,
							productItemId: mainPd.productItemId,
							sn: mainPd.snAr ? mainPd.snAr.toString() : '',
							days: self.vue.defaultdays, 
					};
					var item1={
							pdname: depositPd.productName,
							isDeposits: 1,
							quantity: depositPd.count,
							price: depositPd.price,
							productItemId: depositPd.productItemId,
							days: 1,
					};
					self.vue.submitData.items.push(item0);
					self.vue.submitData.items.push(item1);
					if(mainPd.snAr && mainPd.snAr.length > 0) {
						self.vue.hasSNsearch = true;
						self.vue.sndata = mainPd.snAr;
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
			defaultdays: 1,
			hiredays: 1,
			sndata: [],
			spAmount: 0,
			yjAmount: 0,
			hasSNsearch: false,
			createStore:"",
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
			sendFont: "",
			backFont: "",
		},
		ready: function() {
			var date1 = new Date();
			var date2 = new Date(date1);
			date2.setDate(date1.getDate() + this.defaultdays);
			var data1Y = date1.getFullYear();
			var data2Y = date2.getFullYear();
			var data1M = date1.getMonth() + 1;
			var data2M = date2.getMonth() + 1;
			var data1D = date1.getDate();
			var data2D = date2.getDate();
			this.beginText = new Date(data1Y + "/" + data1M + "/" + data1D).getTime();
			this.endText = new Date(data2Y + "/" + data2M + "/" + data2D).getTime();
			this.beginFont = data1Y + "-" + (data1M < 10 ? ("0" + data1M) : data1M) + "-" + (data1D < 10 ? ("0" + data1D) : data1D)
			this.endFont = data2Y + "-" + (data2M < 10 ? ("0" + data2M) : data2M) + "-" + (data2D < 10 ? ("0" + data2D) : data2D)
			this.sendFont = this.beginFont;
			this.backFont = this.endFont;
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
					console.log(data)
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
				if(!this.submitData.mobilePhone || !this.submitData.consignee || this.beginFont == '选择日期' || this.endFont == '选择日期') {
					E.toast("信息不全");
					return;
				}
				if(this.submitData.consignee.length < 2) {
					E.toast("姓名长度不能少于2位");
					return;
				}
				var telReg = !!(this.submitData.mobilePhone).match(/^1[34578]\d{9}$/);
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
					console.log(data)
					E.closeLoading()
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg);
						return;
					}
					E.alert("创建成功", function() {
						E.fireData('listDetail', "", {
							orderNumber: data.orderNumber,
						});
						var curw = plus.webview.currentWebview()
						setTimeout(function() {
							plus.webview.close(curw.opener(), 'none', 0)
							plus.webview.close(curw, 'none', 0)
						}, 1000)
					})
				}, "post")

			},
			optionTime: function(c) {
				var self = this;
				var options = { "type": "date", "beginYear": 2000, "endYear": 2030 }
				switch(c) {
					case 0:
						options.value = this.endFont;
						break;
					case 1:
						options.value = this.beginFont;
						break;
					default:
						break;
				}
				var picker = new mui.DtPicker(options);
				picker.show(function(rs) {
					var rsTime = new Date(rs.text.replace(/-/g, "/")).getTime();
					var beginText, endText;
					if(c == 1) {
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
					c == 1 ? self.beginFont = rs.text : self.endFont = rs.text
					picker.dispose();
				});
			},
			optionTime2: function(c) {
				var self = this;
				var options = { "type": "date", "beginYear": 2000, "endYear": 2030 }
				switch(c) {
					case 2:
						options.value = this.sendFont;
						break;
					case 3:
						options.value = this.backFont;
						break;
					default:
						break;
				}
				var picker = new mui.DtPicker(options);
				picker.show(function(rs) {
					var rsTime = new Date(rs.text.replace(/-/g, "/")).getTime();
					c == 2 ? self.sendFont = rs.text : self.backFont = rs.text
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