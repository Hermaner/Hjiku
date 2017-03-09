var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.init();
		mui.plusReady(function() {
			self.ws = plus.webview.currentWebview();
			self.vue.orderNumber = 'SO-170308-92185';
			self.vue.zAmount.z = '40';
			self.vue.yAmount.z = '200';
			self.vue.aAmount.z = '240';
			self.vue.zAmount.w = '40';
			self.vue.yAmount.w = '200';
			self.vue.aAmount.w = '240';
			self.vue.loadData();
			E.getStorage("vendor") == 1 && (self.vue.registerCashierReceiver())
		})
		var old_back = mui.back;
		mui.back = function() {
			E.confirm("订单未支付，确定退出?",function(){
				old_back()
			})
		}
	},
	vueObj: {
		el: '#vue',
		data: {
			totalPrice: 0,
			orderNumber: "",
			prePrice: 0,
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
			payments: [],
		},
		methods: {
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
					for(var i = 0; i < data.payments.length; i++) {
						self.payments.push({
							paymentName: data.payments[i].paymentName,
							paymentTypeId: data.payments[i].paymentTypeId,
							isPay: false,
							checked: false,
							tabIndex: [],
						})
					}
				})
			},
			payType: function(index) {
				if(this.paymentIndex != null) {
					this.payments[this.paymentIndex].checked = false;
					this.payments[0].checked = false;
				}
				this.payments[index].checked = true;
				this.paymentTypeId = this.payments[index].paymentTypeId;
				this.paymentIndex = index;
			},
			payTabClick: function(index) {
				for(var i = 0; i < this.tabAr.length; i++) {
					this.tabAr[i].checked = false;
				}
				this.tabIndex = index;
				this.tabAr[index].checked = true;
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
					type:"order"
				})
			},
			payMent: function(c) {
				var self = this;
				var params = E.systemParam("V5.mobile.project.jiku.order.mixture.pay");
				params = mui.extend(params, {
					orderNumber: self.orderNumber,
					authCode: c||"",
					amount: self.amount,
					paymentTypeId: self.paymentTypeId,
				})
				E.showLoading()
				E.getData('jikuOrderMixturePay', params, function(data) {
					E.closeLoading()
					console.log(data)
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					self.completePay()
				}, 'post')
			},
			completePay: function() {
				var self = this;
				E.alert("支付成功", function() {
					self.payments[self.paymentIndex].checked = false;
					self.payments[self.paymentIndex].tabIndex.push(self.tabIndex);
					self.payments[self.paymentIndex].isPay = true;
					self.paymentIndex = null;
					self.paymentTypeId = null;
					switch(self.tabIndex) {
						case 0:
							self.aAmount.y += parseFloat(self.amount);
							self.aAmount.w = parseFloat(self.aAmount.z) - parseFloat(self.aAmount.y);
							if(self.aAmount.w == 0) {
								alert('支付完成')
								return;
							}
							break;
						case 1:
							self.zAmount.y += parseFloat(self.amount);
							self.zAmount.w = parseFloat(self.zAmount.z) - parseFloat(self.zAmount.y);
							if(self.zAmount.w == 0 && self.yAmount.w == 0) {
								alert('支付完成')
								return;
							}
							break;
						case 2:
							self.yAmount.y += parseFloat(self.amount);
							self.yAmount.w = parseFloat(self.yAmount.z) - parseFloat(self.yAmount.y);
							if(self.zAmount.w == 0 && self.yAmount.w == 0) {
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
			payPrinter: function() {
				if(E.getStorage("vendor") == 1) {
					var pageDetail = E.getWebview(E.preloadPages[0]);
					var printAr0 = "收款编号:" + this.orderNumber;
					var printAr = [];
					for(i in this.items) {
						printAr.push("商品名称：" + this.items[i].productName);
						printAr.push("商品数量：" + this.items[i].count);
						printAr.push("商品单价：" + this.items[i].price);
						printAr.push("商品规格：" + this.items[i].skuName);
					}
					var printAr1 = ["应付金额：￥" + this.allPrice, "让利金额：￥" + this.coupons, "运费金额：￥" + this.fee, "实收金额：￥" + this.totalPrice, "付款方式：" + this.paymentName, "本次消费赠送积分：--", "会员卡余额：--", "会员可用/累计积分:--/--"];
					if(this.addressObj) {
						printAr1 = ["应付金额：￥" + this.allPrice, "让利金额：￥" + this.coupons, "运费金额：￥" + this.fee, "实收金额：￥" + this.totalPrice, "付款方式：" + this.paymentName, "收货姓名：" + this.addressObj.consignee, "收货电话：" + this.addressObj.mobilePhone, "收货地址：" + this.addressObj.address, "本次消费赠送积分：--", "会员卡余额：--", "会员可用/累计积分:--/--"];

					}
					printAr1 = printAr.concat(printAr1)
					printAr1 = printAr1.join(",");
					var printAr2 = ["收款时间：" + (new Date()).Format("yyyy-MM-dd hh:mm:ss"), "操作人  ：" + E.getStorage("op"), "门店地址：" + E.getStorage("address"), "门店电话：" + E.getStorage("tel")];
					printAr2 = printAr2.join(",");
					pageDetail.evalJS("Page.vue.printerAll('" + E.getStorage("storeName") + "','" + printAr0 + "','" + printAr1 + "','" + printAr2 + "')");
				}
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
							if(isSuccess || 'msg' == '支付成功') {
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

			goOrderDetail: function() {
				E.fireData(E.preloadPages[0], "detailShow", {
					orderNumber: this.orderNumber
				})
				setTimeout(function() {
					plus.webview.close("../cashr/cashrCart.html", 'none', 0)
					plus.webview.close(Page.ws, 'none', 0)
				}, 1000)
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