var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.init();
		mui.plusReady(function() {
			self.ws = plus.webview.currentWebview();
			self.vue.orderNumber = self.ws.orderNumber;
			self.vue.totalPrice = self.ws.totalPrice;
			self.vue.prePrice = self.ws.prePrice
			self.vue.loadData()
			E.getStorage("vendor") == 0 && (self.vue.registerCashierReceiver())
		})
		var old_back = mui.back;
		mui.back = function() {
			if(self.vue.prePrice > 0) {
				E.alert("支付中不能退出")
			} else {
				old_back()
			}

		}
		mui("#payList").on('tap', "button", function() {
			E.IsNum(this.parentNode.querySelector("input"));
			self.vue.pid = this.getAttribute("pid");
			self.vue.paymentType = this.getAttribute("pid");
			self.vue.amount = this.parentNode.querySelector("input").value;
			if(!self.vue.amount || self.vue.amount == 0) {
				E.toast("请输入金额")
				return
			}
			if(parseFloat(self.vue.amount) > parseFloat(self.vue.waitPrice)) {
				E.toast("输入金额不能大于待付金额")
				return
			}
			self.vue.paySwitch()
		})
	},
	vueObj: {
		el: '#vue',
		data: {
			totalPrice: 0,
			orderNumber: "",
			prePrice: 0,
			showCardpay: false,
			amount: 0,
			pid: "",
			paymentType: "",
			payments: [],
			password: "",
			memberCardNumber: "",
			exit6: false,
			exit13: false,
			exit14: false,
			exit15: false,
			exit16: false,
			exit19: false,
			exit20: false,
			showPersonpay: false,
			payimg: "",
		},
		methods: {
			loadData: function() {
				var self = this;
				var params = E.systemParam("V5.mobile.paymentType.search");
				E.showLoading()
				E.getData('paymentTypeSearch', params, function(data) {
					E.closeLoading()
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					console.log(JSON.stringify(data))
					var payments = data.payments;
					for(var i = 0; i < payments.length; i++) {
						switch(payments[i].paymentType) {
							case "6":
								self.exit6 = true
								break;
							case "13":
								self.exit13 = true
								break;
							case "14":
								self.exit14 = true
								break;
							case "15":
								self.exit15 = true
								break;
							case "16":
								self.exit16 = true
								break;
							case "19":
								self.exit19 = true
								break;
							case "20":
								self.exit20 = true
								break;
							default:
								break;
						}
						if(payments[i].paymentType != "6" && payments[i].paymentType != "13" && payments[i].paymentType != "14" && payments[i].paymentType != "15" && payments[i].paymentType != "16" && payments[i].paymentType != "17") {
							self.payments.push(payments[i]);
						}
					}
				}, "get")
			},
			paySwitch: function() {
				if(this.paymentType == "19" || this.paymentType == "20") {
					this.openPersonpay()
					return
				}
				switch(this.pid) {
					case "6":
						this.barcodePay()
						break;
					case "14":
						if(E.getStorage("vendor") == 0) {
							this.doPosCashier();
						} else {
							this.payMent()
						}
						break;
					case "15":
						this.barcodePay()
						break;
					case "16":
						this.cardShow()
						break;
					default:
						this.payMent()
						break;
				}
			},
			barcodePay: function() {
				E.openWindow("../barcode/payment.html", {
					orderNumber: this.orderNumber,
					pid: this.pid,
					amount: this.amount,
					type: "mix"
				})
			},
			openPersonpay: function() {
				this.showPersonpay = true;
				this.payimg = this.paymentType == "19" ? E.getStorage("perzfb") : E.getStorage("perwx")
			},
			closePersonpay: function() {
				this.showPersonpay = false
			},
			personPay: function() {
				this.payMent()
			},
			closeMask: function() {
				this.showCardpay = false;
			},
			cardShow: function() {
				this.showCardpay = true;
				setTimeout(function() {
					E.showLayer(0)
				}, 0)
			},
			cardPay: function() {
				var self = this;
				if(!this.password || !this.memberCardNumber) {
					E.toast("信息不全");
					return
				}
				var params = E.systemParam("V5.mobile.order.mixture.pay");
				params = mui.extend(params, {
					orderNumber: this.orderNumber,
					memberCardNumber: this.memberCardNumber,
					password: this.password,
					authCode: "",
					amount: this.amount,
					paymentType: 16,
					type: "mixture"
				})
				this.showCardpay = false;
				E.showLoading()
				E.getData('orderMixturePay', params, function(data) {
					E.closeLoading()
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					self.completePay(self.amount)

				})
			},
			payMent: function() {
				var self = this;
				E.confirm("确认付款？", function() {
					var params = E.systemParam("V5.mobile.order.mixture.pay");
					params = mui.extend(params, {
						orderNumber: self.orderNumber,
						memberCardNumber: "",
						password: "",
						authCode: "",
						amount: self.amount,
						paymentType: self.pid,
						type: "mixture"
					})
					E.showLoading()
					E.getData('orderMixturePay', params, function(data) {
						if(self.pid=="19"||self.pid=="20"){
						self.closePersonpay()
					}
						E.closeLoading()
						if(!data.isSuccess) {
							E.alert(data.map.errorMsg)
							return
						}
						self.completePay(self.amount)
					})
				})
			},
			registerCashierReceiver: function() {
				var self = this;
				var main = plus.android.runtimeMainActivity(); //获取activity
				//创建自定义广播实例
				var receiver = plus.android.implements(
					'io.dcloud.feature.internal.reflect.BroadcastReceiver', {
						onReceive: function(context, intent) { //实现onReceiver回调函数
							plus.android.importClass(intent); //通过intent实例引入intent类，方便以后的‘.’操作
							var isSuccess = intent.getExtra("isSuccess");
							var msg = intent.getExtra("msg");
							self.payMent()
						}
					});

				var IntentFilter = plus.android
					.importClass('android.content.IntentFilter');
				var filter = new IntentFilter();

				filter.addAction("io.dcloud.pospay.cashiercallback"); //监听收银结果回调，自定义字符串

				main.registerReceiver(receiver, filter); //注册监听
			},
			doPosCashier: function() {
				var main_act = plus.android.runtimeMainActivity();
				var Intent = plus.android.importClass('android.content.Intent');
				var intent = new Intent();
				intent.setClassName(main_act, "io.dcloud.pospay.CashierService");

				var tradeNo = this.createTradeNoString();
				var seqNo = this.createSeqNoString();
				intent.putExtra("tradeNo", this.orderNumber); //商户订单号
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
			completePay: function(c) {
				var self = this;
				E.alert("支付成功", function() {
					mui("#payList button").each(function() {
						var pid = this.getAttribute("pid");
						if(pid == self.pid) {
							this.parentNode.querySelector("input").value = ""
							this.parentNode.querySelector(".payStatus").classList.add("success");
							this.parentNode.querySelector(".payStatus").innerHTML = "<span>已收</span>";
							this.classList.add("success")
							this.setAttribute("disabled", "disabled")
							this.parentNode.querySelector("input").setAttribute("disabled", "disabled")
						}
					})
					self.prePrice = (parseFloat(self.prePrice) + parseFloat(c)).toFixed(2);
					if(self.waitPrice == 0) {
						self.goOrderDetail()
					}
				});

			},
			goOrderDetail: function() {
				Page.ws.opener().evalJS("Page.vue.loadData('" + this.orderNumber + "')");
				plus.webview.close("mixPay.html", "pop-out");
			}
		},
		computed: {
			waitPrice: function() {
				return(parseFloat(this.totalPrice) - parseFloat(this.prePrice)).toFixed(2)
			}
		}
	}
}
Page.init()