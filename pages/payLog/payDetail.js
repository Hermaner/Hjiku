var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.init();
		mui.plusReady(function() {
			window.addEventListener('detialShow', function(event) {
				self.vue.payId = event.detail.payId;
				if(self.vue.payId) {
					self.vue.loadData();
					self.vue.type = "0"
				} else {
					self.vue.type = "1"
					self.vue.showInput = true
					self.vue.showBody = true;
					self.vue.showData = false
					self.vue.$set('store', E.getStorage("store"))
					self.vue.$set('op', E.getStorage("op"))
				}
			})
			self.ws = plus.webview.currentWebview();
			E.getStorage("vendor") == 0 && (self.vue.registerCashierReceiver())
		})
		var oldBack = mui.back;
		mui.back = function() {
			oldBack()
			self.vue.clearData()
			self.vue.showBody = false;
			self.vue.showData = true;
		}
		mui("#payPopover").on('tap', "li", function() {
			self.vue.paymentType = this.getAttribute("sid");
			self.vue.getConform()
			mui('#payPopover').popover('hide');
		})
	},
	vueObj: {
		el: '#vue',
		data: {
			showData: true,
			noData: false,
			type: "0",
			showInput: false,
			showCardpay: false,
			payId: "",
			password: "",
			showBody: false,
			memberCardNumber: "",
			orderNumber: "",
			paymentType: "",
			showPersonpay: false,
			payimg: "",
			items: {
				payer: "",
				mobilephone: "",
				memo: "",
				amount: ""
			}

		},
		methods: {
			loadData: function() {
				var self = this;
				var params = E.systemParam('V5.mobile.order.money.get');
				params.orderNumber = Page.vue.payId;
				this.showData = true
				this.noData = false
				E.getData('orderMoneyGet', params, function(data) {
					self.showData = false
					console.log(JSON.stringify(data))
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					self.showBody = true
					self.items = data.orderMoneyGet;
				}, "get")
			},
			getConform: function(c) {
				if(this.items.status == 1) {
					this.orderNumber = this.items.orderNumber;
					this.paySwitch()
					return
				}
				var self = this;
				if(!this.items.payer || !this.items.mobilephone || !this.items.amount) {
					E.toast("信息不全")
					return
				}
				var telReg = !!(this.items.mobilephone).match(/^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/);
				if(telReg == false) {
					E.toast("请输入正确的手机号")
					this.items.mobilephone = ""
					return
				}
				var orderData = {
					payer: this.items.payer,
					amount: this.items.amount,
					mobilephone: this.items.mobilephone,
					memo: this.items.memo,
					paymentType: this.paymentType
				};
				var params = E.systemParam('V5.mobile.order.money.add');
				params.orderData = JSON.stringify(orderData);
				E.showLoading()
				E.getData('orderMoneyAdd', params, function(data) {
					console.log(JSON.stringify(data))
					E.closeLoading()
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					self.orderNumber = data.orderMoney
					self.paySwitch()
				}, "get")
			},
			getAway: function() {
				var self = this
				var params = E.systemParam('V5.mobile.order.money.hongchong');
				params.orderNumber = Page.vue.payId;
				E.showLoading()
				E.getData('orderMoneyHongChong', params, function(data) {
					console.log(JSON.stringify(data))
					E.closeLoading()
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					self.completePay("红冲成功")

				}, "get")
			},
			paySwitch: function() {
				if(this.paymentType == "19" || this.paymentType == "20") {
					this.openPersonpay()
					return
				}
				switch(this.paymentType) {
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
						this.cardMethod()
						break;
					default:
						this.payMent()
						break;
				}
			},
			barcodePay: function() {
				E.openWindow("../barcode/payment.html", {
					orderNumber: this.orderNumber,
					pid: this.paymentType,
					type: "dingjinpay"
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
			cardMethod: function() {
				this.showCardpay = true;
				setTimeout(function() {
					E.showLayer(0)
				}, 0)

			},
			cardPay: function(c, d) {
				var self = this;
				if(!d && (!this.password || !this.memberCardNumber)) {
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
					type: "dingjinpay"

				})
				E.showLoading()
				E.getData('erpPay', params, function(data) {
					self.closeCardpay()
					E.closeLoading()
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg);
						return
					}
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
					type: "dingjinpay"
				})
				console.log(JSON.stringify(params))
				E.showLoading()
				E.getData('erpPay', params, function(data) {

					E.closeLoading()
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg);
						return
					}
					self.completePay("支付成功")
				}, "get")
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
				intent.putExtra("totalFee", (this.items.amount * 100).toString()); //订单金额，单位为分
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
			closeCardpay: function() {
				this.showCardpay = false
			},
			completePay: function(c) {
				E.alert(c, function() {
					Page.ws.opener().evalJS("Page.vue.loadData('',1)")
					mui.back()
				})
			},
			clearData: function() {
				this.showInput = false, this.showCardpay = false, this.password = "", this.memberCardNumber = "";
				this.showPersonpay = false;
				this.payimg = "";
				this.items = {
					payer: "",
					mobilephone: "",
					memo: "",
					amount: ""
				}
			},
			printEvent: function() {
				E.showLoading()
				var pageDetail = E.getWebview(E.preloadPages[0]);
				var printAr = ["门店名称：" + this.items.payStore, "门店定金凭证", "定金单号：" + this.items.orderNumber, "交易时间：" + this.items.created, "付款人：" + this.items.payer, "付款人手机：" + this.items.mobilephone, "今收到定金（人民币）：" + this.items.amount, "备注：" + this.items.memo, "顾客签名:", "此票为定金唯一凭证，请妥善保管，客服电话：4007285858"];
				if(E.getStorage("vendor") == 0) {
					E.closeLoading()
					printAr = printAr.join(",")

					pageDetail.evalJS("Page.vue.printerDesc('" + printAr + ",第一联：存根联',function(){Page.vue.printerDesc('" + printAr + ",第二联：顾客联',1)})");
				} else {
					printAr = printAr.join(",")
					pageDetail.evalJS("Page.vue.printData('" + printAr + ",第一联：存根联',function(){Page.vue.printData('" + printAr + ",第二联：顾客联',1)})");
				}

			}

		}
	}
}
Page.init()