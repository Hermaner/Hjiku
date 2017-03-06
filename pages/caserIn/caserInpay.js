var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.plusReady(function() {
			E.getStorage("vendor") == 0 && (self.vue.registerCashierReceiver());
			window.addEventListener('detailShow', function(event) {
				self.vue.getData = event.detail.data
			})
			var oldBack = mui.back;
			mui.back = function() {
				oldBack()
				setTimeout(function() {
					self.vue.resetData()
				})

			}
		});
	},
	vueObj: {
		el: '#vue',
		data: {
			getData: "",
			orderNumber: "",
			payments: [{
				img: "zhifubao",
				paymentName: '支付宝（企业账号）',
				paymentType: '6',
				status: false
			}, {
				img: "perzhifubao",
				paymentName: '支付宝（个人账号）',
				paymentType: '19',
				status: false
			}, {
				img: "weixin2",
				paymentName: '微信（企业账号）',
				paymentType: '15',
				status: false
			}, {
				img: "perweixin",
				paymentName: '微信（个人账号）',
				paymentType: '20',
				status: false
			}, {
				img: "huiyuanka",
				paymentName: '会员卡',
				paymentType: '16',
				status: false
			}, {
				img: "xianjin",
				paymentName: '现金',
				paymentType: '13',
				status: false
			}, {
				img: "shuaka",
				paymentName: '刷卡',
				paymentType: '14',
				status: false
			}],
			password: '',
			memberCardNumber: '',
			showCardpay: false,
			paymentType: "",
			paymentName: "",
			showPersonpay: false,
			payimg: ""

		},
		methods: {
			createOrder: function(callBack) {
				console.log(this.getData)
				var obj = {
					receiptAmount: this.getData.actual,
					discountFee: this.getData.coupon,
					paymentType: this.paymentType,
					memo: this.getData.memo,
					couponCode: this.getData.couponCode
				}
				obj = JSON.stringify(obj)
				var self = this;
				var params = E.systemParam('V5.mobile.receivables.history.add');
				params = mui.extend(params, {
					receivablesData: obj
				})
				E.showLoading()
				console.log(obj)
				E.getData('receivablesHistoryAdd', params, function(data) {
					console.log(JSON.stringify(data))

					if(!data.isSuccess) {
						E.closeLoading()
						E.alert(data.map.errorMsg)
						return
					}
					self.orderNumber = data.number;
					callBack()
				})
			},
			pay: function() {
				var self = this
				mui("input[type=radio]").each(function(index) {
					if(this.checked) {
						self.paymentType = self.payments[index].paymentType
						self.paymentName = self.payments[index].paymentName
					}
				})
				if(!this.paymentType) {
					E.toast("请选择支付方式");
					return
				}
				if(self.paymentType == "19" || self.paymentType == "20") {
					self.openPersonpay()
					return
				}
				this.createOrder(function() {
					switch(self.paymentType) {
						case "6":
							self.barcodePay()
							break;
						case "14":
							if(E.getStorage("vendor") == 0) {
								self.doPosCashier();
							} else {
								self.payMent()
							}
							break;
						case "15":
							self.barcodePay()
							break;
						case "16":
							E.closeLoading()
							self.cardMethod()
							break;
						default:
							self.payMent()
							break;
					}
				})

			},
			personPay: function() {
				var self = this;
				this.createOrder(function() {
					self.payMent()
				})
			},
			barcodePay: function() {
				var self = this;
				E.openWindow("../barcode/payment.html", {
					orderNumber: this.orderNumber,
					pid: this.paymentType,
					type: "pay"
				})

			},
			cardMethod: function() {
				this.showCardpay = true;
				setTimeout(function() {
					E.showLayer(0)
				}, 0)

			},
			closeCardpay: function() {
				this.showCardpay = false;
			},
			openPersonpay: function() {
				this.showPersonpay = true;
				this.payimg = this.paymentType == "19" ? E.getStorage("perzfb") : E.getStorage("perwx")
			},
			closePersonpay: function() {
				this.showPersonpay = false
			},
			cardPay: function() {
				var self = this;
				if(!this.password || !this.memberCardNumber) {
					E.toast("信息不全");
					return
				}
				var params = E.systemParam("V5.mobile.erp.pay");
				params = mui.extend(params, {
					number: this.orderNumber,
					authCode: '',
					password: this.password,
					memberCardNumber: this.memberCardNumber,
					paymentType: 16,
					type: "pay"

				})
				console.log(params)
				E.showLoading()
				E.getData('erpPay', params, function(data) {
					self.closeCardpay()
					console.log(data)
					E.closeLoading()
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg);
						return
					}
					self.payPrinter()
					self.completePay("支付成功")
				}, "get")
			},
			payMent: function() {
				var self = this
				var params = E.systemParam("V5.mobile.erp.pay");
				params = mui.extend(params, {
					number: this.orderNumber,
					authCode: '',
					memberCardNumber: "",
					password: "",
					paymentType: parseInt(this.paymentType),
					type: "pay"
				})
				E.showLoading()
				E.getData('erpPay', params, function(data) {
					console.log(JSON.stringify(data))
					E.closeLoading()
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg);
						return
					}
					self.payPrinter()
					self.completePay("支付成功")
				}, "get")
			},
			completePay: function(c) {
				var self = this
				E.getWebview("caserIn").evalJS("Page.vue.resetData()")
				E.alert(c, function() {
					self.resetData()
					mui.back()
					
				})
			},
			resetData: function() {
				this.getData = '';
				this.orderNumber = '';
				this.password = '';
				this.memberCardNumber = '';
				this.showCardpay = false;
				this.paymentType = "";
				this.showPersonpay = false;
				this.payimg = ""
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
							if(isSuccess) {
								self.payMent()
							} else {
								self.paymentType = ''
								alert(msg);
							}
						}
					});

				var IntentFilter = plus.android
					.importClass('android.content.IntentFilter');
				var filter = new IntentFilter();

				filter.addAction("io.dcloud.pospay.cashiercallback"); //监听收银结果回调，自定义字符串

				main.registerReceiver(receiver, filter); //注册监听
			},
			doPosCashier: function() {
				E.closeLoading()
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
				intent.putExtra("totalFee", (this.getData.actual * 100).toString()); //订单金额，单位为分
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
			payPrinter: function() {
				if(E.getStorage("vendor") == 0) {
					var pageDetail = E.getWebview(E.preloadPages[0]);
					var printAr0 = "收款编号:" + this.orderNumber;
					var printAr1 = ["应付金额：￥" + this.getData.amount, "让利金额：￥" + this.getData.coupon, "实收金额：￥" + this.getData.actual, "付款方式：" + this.paymentName, "本次消费赠送积分：--", "会员卡余额：--", "会员可用/累计积分:--/--"];
					printAr1 = printAr1.join(",");
					var printAr2 = ["收款时间：" + (new Date()).Format("yyyy-MM-dd hh:mm:ss"), "操作人  ：" + E.getStorage("op"), "门店地址：" + E.getStorage("address"), "门店电话：" + E.getStorage("tel")];
					printAr2 = printAr2.join(",");
					pageDetail.evalJS("Page.vue.printerAll('" + E.getStorage("storeName") + "','" + printAr0 + "','" + printAr1 + "','" + printAr2 + "')");
				}
			}
		}

	},

}
Page.init()