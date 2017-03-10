var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.init();
		mui.plusReady(function() {
			self.ws = plus.webview.currentWebview();
			var products = self.ws.products;
			var zPrice = (products[0].quantity * products[0].days * products[0].price).toFixed(2);
			var yPrice = (products[1].quantity * products[1].days * products[1].price).toFixed(2);
			self.vue.orderNumber = self.ws.orderNumber;
			self.vue.orderId = self.ws.orderId;
			self.vue.zAmount.z = zPrice;
			self.vue.yAmount.z = yPrice;
			self.vue.aAmount.z = parseFloat(zPrice) + parseFloat(yPrice);
			self.vue.zAmount.w = zPrice;
			self.vue.yAmount.w = yPrice;
			self.vue.aAmount.w = self.vue.aAmount.z;
			self.vue.products = products;
			//			self.vue.orderNumber = 'SO-170308-92185';
			//			self.vue.zAmount.z = '40';
			//			self.vue.yAmount.z = '200';
			//			self.vue.aAmount.z = '240';
			//			self.vue.zAmount.w = '40';
			//			self.vue.yAmount.w = '200';
			//			self.vue.aAmount.w = '240';
			self.vue.loadData();
		})
		var old_back = mui.back;
		mui.back = function() {
			if(!self.vue.completePay) {
				E.confirm("订单未支付，确定退出?", function() {
					old_back()
				})
			} else {
				old_back()
			}

		}
	},
	vueObj: {
		el: '#vue',
		data: {
			orderId: '',
			products: [],
			orderNumber: "",
			amount: 0,
			zAmount: {
				z: 0,
				y: 0,
				w: 0,
			},
			yAmount: {
				z: 0,
				y: 0,
				w: 0,
			},
			aAmount: {
				z: 0,
				y: 0,
				w: 0,
			},
			tabAr: [{
				checked: true,
			}, {
				checked: false,
			}, {
				checked: false,
			}],
			tabIndex: 0,
			paymentTypeId: null,
			paymentIndex: null,
			payments: [[],[],[]],
			completePay: false,
		},
		methods: {
			loadPayDetail: function() {
				var self = this;
				var params = E.systemParam("V5.mobile.project.jiku.order.mixture.pay.get");
				params.orderId = this.orderId;
				E.getData('jikuOrderMixturePayGet', params, function(data) {
					E.closeLoading()
					console.log(data) 
					if(!data.isSuccess) {
						if(data.map.errorMsg == "没有支付明细") {

						} else {
							E.alert(data.map.errorMsg);
						}
						return;
					}
					var mixturePays = data.mixturePays;
					var payAr1 = [],
						payAr2 = [],
						payAr3 = [];
					for(var i = 0; i < mixturePays.length; i++) {
						var payType = mixturePays[i].payType;
						var payWay = mixturePays[i].payWay;
						var id = mixturePays[i].id;
						var amount = mixturePays[i].amount;
						switch(payType) {
							case "1":
								payAr1.push({
									id: id,
									payWay: payWay,
									amount: amount,
								})
								break;
							case "2":
								payAr2.push({
									id: id,
									payWay: payWay,
									amount: amount,
								})
								break;
							case "3":
								payAr3.push({
									id: id,
									payWay: payWay,
									amount: amount,
								})
								break;
							default:
								break;
						}
					}
					if(payAr1.length > 0) {
						for(var i = 0; i < self.payments[0].length; i++) {
							for(var j = 0; j < payAr1.length; j++) {
								if(self.payments[0][i].id == payAr1[j].id) {
									self.aAmount.y += parseFloat(payAr1[j].amount);
									self.payments[0][i].isPay = true;
								}
							}
						}
						self.aAmount.w = parseFloat(self.aAmount.z) - parseFloat(self.aAmount.y);
					}
					if(payAr2.length > 0) {
						for(var i = 0; i < self.payments[1].length; i++) {
							for(var j = 0; j < payAr2.length; j++) {
								if(self.payments[1][i].id == payAr2[j].id) {
									self.zAmount.y += parseFloat(payAr2[j].amount);
									self.payments[1][i].isPay = true;
								}
							}
						}
						self.zAmount.w = parseFloat(self.zAmount.z) - parseFloat(self.zAmount.y);
					}
					if(payAr3.length > 0) {
						for(var i = 0; i < self.payments[2].length; i++) {
							for(var j = 0; j < payAr3.length; j++) {
								if(self.payments[i].id == payAr3[j].id) {
									self.yAmount.y += parseFloat(payAr3[j].amount);
									self.payments[i].isPay = true;
								}
							}
						}
						self.yAmount.w = parseFloat(self.yAmount.z) - parseFloat(self.yAmount.y);
					}
				})
			},
			loadData: function() {
				var self = this;
				var params = E.systemParam("V5.mobile.project.jiku.payment.get");
				E.getData('jikuPaymentGet', params, function(data) {
					E.closeLoading()
					console.log(data)
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					var payments = data.payments;
					for(var i = 0; i < payments.length; i++) {
						var payType = payments[i].payType;
						var payWay = payments[i].payWay;
						var id = payments[i].id;
						var obj = {
							id: id,
							payWay: payWay,
							isPay: false,
							checked: false,
						}
						switch(payType) {
							case "1":
								self.payments[0].push(obj)
								break;
							case "Rent":
								self.payments[1].push(obj)
								break;
							case "Deposit":
								self.payments[2].push(obj)
								break;
							default:
								break;
						}
					}
					self.loadPayDetail()
				})
			},
			payType: function(index) {
				var payments=this.payments[this.tabIndex];
				if(this.paymentIndex != null) {
					payments[this.paymentIndex].checked = false;
				}
				payments[index].checked = true;
				this.paymentIndex = index;
				this.paymentTypeId = payments[index].id;
			},
			payTabClick: function(index) {
				if(index == this.tabIndex) {
					retutn;
				}
				var payments=this.payments[this.tabIndex];
				if(this.paymentIndex != null) {
					payments[this.paymentIndex].checked = false;
				}
				this.tabAr[this.tabIndex].checked = false;
				this.tabAr[index].checked = true;
				this.tabIndex = index;
				this.paymentIndex = null;
				this.paymentTypeId = null;

			},
			pay: function() {
				var self = this;
				if(this.amount == 0 || this.amount == '') {
					E.toast('请输入金额');
					return;
				}
				if(!this.paymentTypeId) {
					E.toast('请选择支付方式');
					return;
				}
				var reg = /^(0|[1-9][0-9]{0,9})(\.[0-9]{1,2})?$/;
				if(!reg.test(this.amount)) {
					E.toast('请输入正确金额');
					return;
				}

				switch(self.tabIndex) {
					case 0:
						if(parseFloat(self.aAmount.w) < parseFloat(self.amount)) {
							E.toast('支付金额不能超过未支付金额');
							return;
						}
						break;
					case 1:
						if(parseFloat(self.zAmount.w) < parseFloat(self.amount)) {
							E.toast('支付金额不能超过未支付金额');
							return;
						}
						break;
					case 2:
						if(parseFloat(self.yAmount.w) < parseFloat(self.amount)) {
							E.toast('支付金额不能超过未支付金额');
							return;
						}
						break;
					default:
						break;
				}
				this.paySwitch();
			},
			paySwitch: function() {
				switch(this.paymentTypeId) {
					case "14": //刷卡
						if(E.getStorage("vendor") == 1) {
							this.doPosCashier();
						} else {
							this.payMent();
						}
						break;
					case "6": //支付宝
						this.barcodePay()
						break;
					default:
						this.payMent();
						break;
				}
			},
			barcodePay: function() {
				E.openWindow("../barcode/payment.html", {
					type: "order"
				})
			},
			payMent: function(c) {
				var self = this;
				var params = E.systemParam("V5.mobile.project.jiku.order.mixture.pay");
				params = mui.extend(params, {
					orderNumber: self.orderNumber,
					authCode: c || "",
					amount: self.amount,
					paymentType: self.paymentTypeId,
				})
				E.showLoading()
				E.getData('jikuOrderMixturePay', params, function(data) {
					E.closeLoading()
					console.log(data)
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					self.completePay();
				}, 'post')
			},
			completePay: function() {
				var self = this;
				var payments=this.payments[this.tabIndex];
				E.alert("支付成功", function() {
					payments[self.paymentIndex].checked = false;
					payments[self.paymentIndex].isPay = true;
					self.paymentIndex = null;
					self.paymentTypeId = null;
					switch(self.tabIndex) {
						case 0:
							self.aAmount.y += parseFloat(self.amount);
							self.aAmount.w = parseFloat(self.aAmount.z) - parseFloat(self.aAmount.y);
							if(self.aAmount.w == 0) {
								self.payPrinter();
								alert('支付完成')
								return;
							}
							break;
						case 1:
							self.zAmount.y += parseFloat(self.amount);
							self.zAmount.w = parseFloat(self.zAmount.z) - parseFloat(self.zAmount.y);
							if(self.zAmount.w == 0 && self.yAmount.w == 0) {
								self.payPrinter();
								alert('支付完成')
								return;
							}
							break;
						case 2:
							self.yAmount.y += parseFloat(self.amount);
							self.yAmount.w = parseFloat(self.yAmount.z) - parseFloat(self.yAmount.y);
							if(self.zAmount.w == 0 && self.yAmount.w == 0) {
								self.payPrinter();
								alert('支付完成')
								return;
							}
							break;
						default:
							break;
					}
					self.amount = 0;
				});
			},
			completeOrder: function() {
				this.payPrinter();
				this.completePay = true;
				E.alert('支付完成', function() {
					plus.webview.currentWebview().opener().evalJS("Page.vue.updateOrder()");
					mui.back();
				})
			},
			payPrinter: function() {
				var printAr0 = "订单编号：" + this.orderNumber;
				var printAr1 = ["普通商品：" + this.products[0].productName, "商品参数：" + this.products[0].quantity + "x" + this.products[0].days + "天x单价￥" + this.products[0].price, "押金商品：" + this.products[1].productName, "商品参数：" + this.products[1].quantity + "x" + this.products[1].days + "天x单价￥" + this.products[1].price];
				var printAr2 = ["收款金额：" + this.aAmount.z, "收款时间：" + (new Date()).Format("yyyy-MM-dd hh:mm:ss")];
				printAr1 = printAr1.join(",");
				printAr2 = printAr2.join(",");
				E.getWebview("home").evalJS("Page.vue.printerAll('" + E.getStorage("shopName") + "','" + printAr0 + "','" + printAr1 + "','" + printAr2 + "')");
			},
			doPosCashier: function() {
				var main_act = plus.android.runtimeMainActivity();
				var Intent = plus.android.importClass('android.content.Intent');
				var intent = new Intent();
				intent.setClassName(main_act, "io.dcloud.pospay.CashierService");

				var tradeNo = this.createTradeNoString();
				var seqNo = this.createSeqNoString();
				intent.putExtra("tradeNo", tradeNo); //商户订单号
				intent.putExtra("body", "这个是测试商品信息"); //订单描述
				intent.putExtra("attach", "这里是附加信息"); //附加数据,原样返回
				intent.putExtra("seqNo", seqNo); //订单序列号
				intent.putExtra("totalFee", (this.amount * 100).toString()); //订单金额，单位为分
				//intent.putExtra("pay_type", "1001");//付款方式 收银apk暂时不支持，等待开放, 1001	现金,1003	微信支付,1004	支付宝,1005	百度钱包,1006	银行卡,1007	易付宝,1008	点评闪惠,1009	京东钱包
				main_act.startService(intent);

			},
			createTradeNoString: function() {
				var d = new Date();
				return d.getHours() + d.getMinutes() + d.getSeconds() +
					d.getMilliseconds() + "";
			},
			createSeqNoString: function() {
				var d = new Date();
				return d.getHours() + d.getMinutes() + d.getSeconds() +
					d.getMilliseconds() + "";
			},
		},
	}
}
Page.init()