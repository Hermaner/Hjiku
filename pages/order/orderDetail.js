var Page = {
	outputStream: null,
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig(), this.muiEvent()
	},
	initConfig: function() {
		var self = this;
		mui.init({
			swipeBack: true,
			gestureConfig: {
				longtap: true

			}

		});
		mui.plusReady(function() {
			mui('.mui-scroll-wrapper').scroll();
			self.orderListPage = E.getWebview(E.subpages[2]);
			self.mapPage = E.getWebview(E.preloadPages[3]);
			E.getStorage("imei") == 1 && (self.vue.hasImei = true);
			if(E.getStorage("vendor") == 0) {
				self.vue.registerReceiver()
			}
			window.addEventListener('detailShow', function(event) {
				self.vue.orderNumber = event.detail.orderNumber;
				self.vue.orderStatus = event.detail.orderStatus || "IN_STORE";
				Page.code = event.detail.code;
				self.vue.loadData(self.vue.orderNumber);
			})
			var oldBack = mui.back;
			mui.back = function() {
				var wait = document.getElementsByClassName('sendwaitBtn')[0]
				var since = document.getElementsByClassName('sendsinceBtn')[0]
				if(wait && wait.innerHTML != '发送收货码') {
					clearInterval(self.vue.sendTime)
					wait.removeAttribute("disabled")
					wait.innerHTML = '发送收货码';
					self.vue.sendTime = ''
				}
				if(since && since.innerHTML != '发送自提码') {
					clearInterval(self.vue.sendTime)
					since.removeAttribute("disabled")
					since.innerHTML = '发送自提码'
					self.vue.sendTime = ''
				}
				self.vue.showData = true
				self.vue.goodsDetail = false;
				self.vue.paymentType = "";
				self.vue.showPersonpay = false;
				self.vue.payimg = "";
				plus.webview.currentWebview().hide("pop-out")
			}

		})
	},
	muiEvent: function() {
		var self = this
		mui("#payPopover").on('tap', "li", function() {
			self.vue.pid = this.getAttribute("pid");
			self.vue.paymentType = this.getAttribute("pid");
			self.vue.paySwitch()
			mui('#payPopover').popover('hide');
		})
		mui(".longtab").each(function() {
			this.addEventListener("longtap", function() {
				if(plus.os.name == "Android") {
					var Context = plus.android.importClass("android.content.Context");
					var main = plus.android.runtimeMainActivity();
					var clip = main.getSystemService(Context.CLIPBOARD_SERVICE);
					plus.android.invoke(clip, "setText", this.innerText);
				} else {
					var UIPasteboard = plus.ios.importClass("UIPasteboard");
					//这步会有异常因为UIPasteboard是不允许init的，init的问题会在新版中修改
					var generalPasteboard = UIPasteboard.generalPasteboard();
					// 设置/获取文本内容:
					generalPasteboard.setValueforPasteboardType(this.innerText, "public.utf8-plain-text");
					var value = generalPasteboard.valueForPasteboardType("public.utf8-plain-text");
				}
				E.toast("复制成功")
			});

		})
	},
	vueObj: {
		el: '#orderDetail',
		data: {
			items: [],
			orderNumber: "",
			orderStatus: "",
			statusDic: false,
			pid: "",
			sinceCode: "",
			waitCode: "",
			totalPrice: "",
			kickReasons: [],
			hasPay: "false",
			goodsDetail: false,
			payments: [],
			paymentName: null,
			mixturePays: null,
			mixTrue: false,
			showCardpay: false,
			memberCardNumber: "",
			password: "",
			isApplyForRefund: 0,
			sendTime: '',
			showData: true,
			paymentType: "",
			showPersonpay: false,
			payimg: ""
		},
		methods: {
			loadData: function(e) {
				this.mixTrue = false
				var self = this;
				var params = E.systemParam("V5.mobile.order.info.get");
				params.orderNumber = e;
				self.statusDic = false;
				console.log(e)
				this.showData = true
				E.getData('orderInfoGet', params, function(data) {
					console.log(JSON.stringify(data))
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg);
						return
					}
					self.showData = false
					self.items = data.order;
					self.totalPrice = self.items.totalAmount;
					self.isApplyForRefund = self.items.isApplyForRefund
					switch(self.items.orderStatus) {
						case "未接订单":
							self.orderStatus = "UN_ACCPET";
							break;
						case "自提订单":
							Page.sinceCode = data.order.sendCode
							self.orderStatus = "SINCE";
							if(Page.code) {
								self.sinceCode = Page.code
							}
							break;
						case "待收货订单":
							Page.waitCode = data.order.sendCode
							self.orderStatus = "WAIT_GOOD";
							if(Page.code) {
								self.waitCode = Page.code;
							}
							break;
						case "已接订单":
							self.orderStatus = "ACCPET";
							break;
						default:
							break
					}
					if(self.items.orderPayStatus == "未付款订单") {
						self.loadmixPays(self.orderNumber)
					}

				}, "get")
			},
			loadPaytype: function() {
				var self = this;
				var self = this;
				var params = E.systemParam("V5.mobile.paymentType.search");
				E.showLoading()
				E.getData('paymentTypeSearch', params, function(data) {
					console.log(JSON.stringify(data))
					E.closeLoading()
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					self.payments = data.payments;
				}, "get")
			},
			loadmixPays: function(c) {
				var self = this;
				var params = E.systemParam("V5.mobile.order.mixture.pay.get");
				params.orderNumber = c;
				E.getData('orderMixturePayGet', params, function(data) {
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg);
						self.loadPaytype()
						console.log(data.map.errorMsg)
						return
					}
					self.mixturePays = data.mixturePays;
					console.log(JSON.stringify(self.mixturePays))
					if(self.mixturePays.length > 0) {
						self.mixTrue = true
					} else {
						self.loadPaytype()
					}
				}, "get")
			},
			sendGoods: function() {
				var self = this;
				E.showLoading()
				var params = E.systemParam("V5.mobile.order.outsend");
				params = mui.extend(params, {
					orderNumber: self.orderNumber,
					operation: 'STORE_DELIVERY'
				})
				E.getData('orderOutsend', params, function(data) {
					E.closeLoading()
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					E.alert("发货成功", function() {
						Page.orderListPage.evalJS("Page.vue.loadData('" + self.orderStatus + "','',1)")
						mui.back();
					})
				}, "get")
			},
			getOrder: function() {
				var self = this;
				E.showLoading()
				var params = E.systemParam("V5.mobile.order.operation");
				params = mui.extend(params, {
					orderNumber: self.orderNumber,
					operation: 'ACCEPET',
					operationReason: ""
				})
				E.getData('orderOperation', params, function(data) {
					E.closeLoading()
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					E.alert("接单成功", function() {
						Page.orderListPage.evalJS("Page.vue.loadData('" + self.orderStatus + "','',1)")
						mui.back();
					})
				}, "get")
			},
			sendCode: function(e) {
				var self = this;
				var type, sec = 60;;
				e = mui(e)[0]
				e.setAttribute("disabled", "disabled");
				var params = E.systemParam("V5.mobile.order.code.send");
				var pid = e.getAttribute("pid");
				type = pid == "since" ? 'ZT' : 'FH'
				params.orderNumber = this.orderNumber;
				params.type = type;
				E.showLoading();
				E.getData('orderCodeSend', params, function(data) {
					E.closeLoading();
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					pid == "since" ? Page.sinceCode = data.code : Page.waitCode = data.code
					console.log(data.code);
					E.alert("发送成功");
					var t = setInterval(function() {
						if(sec <= 0) {
							e.innerHTML = "再次发送";
							e.removeAttribute("disabled");
							clearInterval(t)
							sec = 60
						} else {
							e.innerHTML = sec + "秒后可重新发送";
							sec--;
						}

					}, 1000)
					self.sendTime = t

				}, "get")
			},
			getwaitGoods: function(e) {
				var self = this
				if(!this.waitCode) {
					E.alert("请输入收货码");
					return
				}
				if(this.waitCode != Page.waitCode) {
					E.alert("请输入正确收货码")
					return
				}

				var params = E.systemParam("V5.mobile.order.comfirm");
				params = mui.extend(params, {
					orderNumber: self.orderNumber,
					operation: "STORE_DELIVERY",
					storeNo: self.waitCode
				})
				E.showLoading();
				E.getData('orderComfirm', params, function(data) {
					E.closeLoading();
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					self.waitCode = "", Page.waitCode = "";
					E.alert("收货成功", function() {
						Page.orderListPage.evalJS("Page.vue.loadData('" + self.orderStatus + "','',1)")
						mui.back();
					})
				}, "get")
			},
			getsinceGoods: function(e) {
				var self = this
				if(!this.sinceCode) {
					E.alert("请输入提货码");
					return
				}
				if(this.sinceCode != Page.sinceCode) {
					E.alert("请输入正确提货码")
					return
				}
				var params = E.systemParam("V5.mobile.order.outsend");
				params = mui.extend(params, {
					orderNumber: self.orderNumber,
					operation: "SINCE",
					code: self.sinceCode
				})
				E.showLoading();
				E.getData('orderOutsend', params, function(data) {
					E.closeLoading();
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					self.sinceCode = "", Page.sinceCode = "";

					E.alert("自提成功", function() {
						Page.orderListPage.evalJS("Page.vue.loadData('" + self.orderStatus + "','',1)")
						mui.back();
					})

				}, "get")
			},
			scanGetGoods: function() {
				E.openWindow('../barcode/orderScan.html', {
					type: 'since'
				})
			},
			sinceScanCode: function(c) {
				this.sinceCode = c;
				this.getsinceGoods()
			},
			coorDinate: function() {
				var self = this;
				mui.prompt('申请协调：', '请输入申请协调原因', '', ['确定', '取消'], function(e) {
					if(e.index == 0) {
						if(!e.value) {
							E.alert("请输入申请协调原因")
							return
						}
						var params = E.systemParam("V5.mobile.order.operation");
						params = mui.extend(params, {
							orderNumber: self.orderNumber,
							operation: "APPLY",
							operationReason: e.value
						})
						E.showLoading();
						E.getData('orderOperation', params, function(data) {
							E.closeLoading();
							if(!data.isSuccess) {
								E.alert(data.map.errorMsg)
								return
							}
							E.alert("申请协调成功", function() {
								Page.orderListPage.evalJS("Page.vue.loadData('" + self.orderStatus + "','',1)")
								mui.back();
							})
						}, "get")

					}
				})
			},
			getKick: function() {
				var self = this;
				var params = E.systemParam("V5.mobile.order.kickbackreason.search");
				E.showLoading()
				E.getData('orderKickbackreasonSearch', params, function(data) {
					E.closeLoading()
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					self.kickReasons = data.reasons
					setTimeout(function() {
						E.showLayer(0)
					}, 0)
				}, "get")
			},
			kickConfirm: function() {
				var self = this,
					vid;
				mui(".supplierDiv").each(function() {
					if(this.querySelector("[type=radio]").checked) {
						vid = this.querySelector("[type=radio]").getAttribute("vid");
					}
				})
				if(!vid) {
					return
				}
				var params = E.systemParam("V5.mobile.order.operation");
				params = mui.extend(params, {
					orderNumber: self.orderNumber,
					operation: "KICK_BACK",
					operationReason: vid
				})
				E.showLoading();
				E.getData('orderOperation', params, function(data) {
					E.closeLoading();
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					E.alert("成功踢回订单", function() {
						self.closeMask()
						Page.orderListPage.evalJS("Page.vue.loadData('" + self.orderStatus + "','',1)")
						mui.back();
					})
				}, "get")
			},
			closeMask: function() {
				this.kickReasons = []
			},
			printObj: function() {
				var printAr = ["店铺名称：" + this.items.shopName, "订单编号：" + this.orderNumber, "收货姓名：" + this.items.logisticInfo.consignee, "收货电话：" + this.items.logisticInfo.mobile || this.items.logisticInfo.phone, "收货地址：" + this.items.logisticInfo.address];
				for(i in this.items.products) {

					printAr.push("商品名称：" + this.items.products[i].productName);
					printAr.push("商品数量：" + this.items.products[i].count);
					printAr.push("商品单价：" + this.items.products[i].price);
					printAr.push("商品规格：" + this.items.products[i].skuName);
				}
				printAr.push("共计金额：" + this.items.productNum + "件");
				printAr.push("运费金额：" + this.items.postFee + "元");
				printAr.push("应付金额：" + this.items.totalAmount + "元");
				console.log(printAr)
				if(E.getStorage("vendor") == 0) {
					printAr = printAr.join("\n")
					this.printerDesc(printAr)
				} else {
					this.printData(printAr)
				}

			},
			printData: function(printAr, c) {
				var self = this;
				var mac = plus.storage.getItem("mac");
				//				var mac = "8C:DE:52:C5:D1:7C";
				E.closeLoading()
				if(plus.os.name == "iOS") {
					E.alert("苹果手机暂不支持");
					return
				}
				if(!mac) {
					E.alert("打印机尚未设置,点击更多进行设置");
					return
				}
				if(!Page.outputStream) {
					this.getbluetoothStatus()
					Page.outputStream = this.setPrint(mac)
				}
				if(typeof(printAr) == "string") {
					printAr = printAr.split(",")
				}
				for(var i = 0; i < printAr.length; i++) {
					var string = printAr[i];
					var bytes = plus.android.invoke(string, 'getBytes', 'gbk');
					Page.outputStream.write(bytes, 0, bytes.length);
					Page.outputStream.write(0X0D);
				}
				Page.outputStream.write(0X0D);
				Page.outputStream.write(0X0D);
				Page.outputStream.write(0X0A);
				Page.outputStream.flush();
				if(c) {
					c != 1 && c();
					return
				}
				E.showLoading();
				var params = E.systemParam("V5.mobile.order.print");
				params.orderNumber = self.orderNumber;
				E.getData('orderPrint', params, function(data) {
					E.closeLoading();
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}

				}, "get")
			},
			registerReceiver: function() {

				var main = plus.android.runtimeMainActivity(); //获取activity
				//创建关闭示例
				var receiver = plus.android.implements('io.dcloud.feature.internal.reflect.BroadcastReceiver', {
					onReceive: function(context, intent) { //实现onReceiver回调函数
						plus.android.importClass(intent); //通过intent实例引入intent类，方便以后的‘.’操作
						var isSuccess = intent.getExtra("isSuccess");
						var msg = intent.getExtra("msg");
						//						alert("isSuccess = " + isSuccess + " , msg = " + msg);
					}
				});

				var IntentFilter = plus.android.importClass('android.content.IntentFilter');
				var filter = new IntentFilter();

				filter.addAction("io.dcloud.printer.printcallback"); //监听打印回调

				main.registerReceiver(receiver, filter); //注册监听
			},
			printerAll: function(a, b, c, d) {
				var txt = ["第一联：存根联", "第二联：顾客联"]
				for(var i = 0; i < 2; i++) {
					this.printerHead(a)
					this.printerCon(b)
					this.printerLine()
					this.printerCon(c)
					this.printerLine()
					this.printerCon(d)
					this.printer1n()
					this.printerOne(txt[i])
					this.printer4n()
				}
				this.printerEnd()

			},
			printerHead: function(txt) {
				var main_act = plus.android.runtimeMainActivity();
				var Intent = plus.android.importClass('android.content.Intent');
				var intent = new Intent();
				intent.setClassName(main_act, "io.dcloud.printer.PrintService");
				var printContent = txt + "\n";
				intent.putExtra("printContent", printContent); //打印内容，可用\n表示换行
				intent.putExtra("fontSize", 2); //字体大小，0：小号，1：中号，2：大号  默认1中号
				intent.putExtra("gravity", 1); //布局方式，0：居左，1：居中，2：居右 默认0居左
				intent.putExtra("type", 0); //打印类型，0:文本内容；1：二维码；2：条码（content必须为数字字符串）
				intent.putExtra("isLast", false); //是否是最后一条打印
				main_act.startService(intent);

			},
			printerOne: function(txt) {
				var main_act = plus.android.runtimeMainActivity();
				var Intent = plus.android.importClass('android.content.Intent');
				var intent = new Intent();
				intent.setClassName(main_act, "io.dcloud.printer.PrintService");
				var printContent = txt;
				intent.putExtra("printContent", printContent); //打印内容，可用\n表示换行
				intent.putExtra("fontSize", 1); //字体大小，0：小号，1：中号，2：大号  默认1中号
				intent.putExtra("gravity", 1); //布局方式，0：居左，1：居中，2：居右 默认0居左
				intent.putExtra("type", 0); //打印类型，0:文本内容；1：二维码；2：条码（content必须为数字字符串）
				intent.putExtra("isLast", false); //是否是最后一条打印
				main_act.startService(intent);

			},
			printer1n: function() {
				var main_act = plus.android.runtimeMainActivity();
				var Intent = plus.android.importClass('android.content.Intent');
				var intent = new Intent();
				intent.setClassName(main_act, "io.dcloud.printer.PrintService");
				var printContent = "\n";
				intent.putExtra("printContent", printContent); //打印内容，可用\n表示换行
				intent.putExtra("fontSize", 0); //字体大小，0：小号，1：中号，2：大号  默认1中号
				intent.putExtra("gravity", 1); //布局方式，0：居左，1：居中，2：居右 默认0居左
				intent.putExtra("type", 0); //打印类型，0:文本内容；1：二维码；2：条码（content必须为数字字符串）
				intent.putExtra("isLast", false); //是否是最后一条打印
				main_act.startService(intent);

			},
			printer4n: function() {
				var main_act = plus.android.runtimeMainActivity();
				var Intent = plus.android.importClass('android.content.Intent');
				var intent = new Intent();
				intent.setClassName(main_act, "io.dcloud.printer.PrintService");
				var printContent = "\n\n\n\n";
				intent.putExtra("printContent", printContent); //打印内容，可用\n表示换行
				intent.putExtra("fontSize", 1); //字体大小，0：小号，1：中号，2：大号  默认1中号
				intent.putExtra("gravity", 1); //布局方式，0：居左，1：居中，2：居右 默认0居左
				intent.putExtra("type", 0); //打印类型，0:文本内容；1：二维码；2：条码（content必须为数字字符串）
				intent.putExtra("isLast", false); //是否是最后一条打印
				main_act.startService(intent);

			},
			printerEnd: function() {
				var main_act = plus.android.runtimeMainActivity();
				var Intent = plus.android.importClass('android.content.Intent');
				var intent = new Intent();
				intent.setClassName(main_act, "io.dcloud.printer.PrintService");
				var printContent = "\n";
				intent.putExtra("printContent", printContent); //打印内容，可用\n表示换行
				intent.putExtra("fontSize", 1); //字体大小，0：小号，1：中号，2：大号  默认1中号
				intent.putExtra("gravity", 1); //布局方式，0：居左，1：居中，2：居右 默认0居左
				intent.putExtra("type", 0); //打印类型，0:文本内容；1：二维码；2：条码（content必须为数字字符串）
				intent.putExtra("isLast", true); //是否是最后一条打印
				main_act.startService(intent);

			},
			printerLine: function() {
				var main_act = plus.android.runtimeMainActivity();
				var Intent = plus.android.importClass('android.content.Intent');
				var intent = new Intent();
				intent.setClassName(main_act, "io.dcloud.printer.PrintService");
				var printContent = "------------------------------------------------\n------------------------------------------------";
				intent.putExtra("printContent", printContent); //打印内容，可用\n表示换行
				intent.putExtra("fontSize", 0); //字体大小，0：小号，1：中号，2：大号  默认1中号
				intent.putExtra("gravity", 1); //布局方式，0：居左，1：居中，2：居右 默认0居左
				intent.putExtra("type", 0); //打印类型，0:文本内容；1：二维码；2：条码（content必须为数字字符串）
				intent.putExtra("isLast", false); //是否是最后一条打印
				main_act.startService(intent);

			},
			printerDesc: function(txt, c) {
				if('Android' == plus.os.name) {
					if(typeof(txt) == "string") {
						txt = txt.split(",")
						txt = txt.join("\n")
					}
					var main_act = plus.android.runtimeMainActivity();
					var Intent = plus.android.importClass('android.content.Intent');
					var intent = new Intent();
					intent.setClassName(main_act, "io.dcloud.printer.PrintService");
					var printContent = txt + "\n\n\n\n\n\n";
					intent.putExtra("printContent", printContent); //打印内容，可用\n表示换行
					intent.putExtra("fontSize", 1); //字体大小，0：小号，1：中号，2：大号  默认1中号
					intent.putExtra("gravity", 0); //布局方式，0：居左，1：居中，2：居右 默认0居左
					intent.putExtra("type", 0); //打印类型，0:文本内容；1：二维码；2：条码（content必须为数字字符串）
					intent.putExtra("isLast", true); //是否是最后一条打印
					main_act.startService(intent);
					if(c) {
						c != 1 && c();
						return
					}
					var params = E.systemParam("V5.mobile.order.print");
					params.orderNumber = self.orderNumber;
					E.getData('orderPrint', params, function(data) {
						E.closeLoading();
						if(!data.isSuccess) {
							E.alert(data.map.errorMsg)
							return
						}

					}, "get")

				} else {
					plus.nativeUI.alert("此平台不支持！");
				}
			},
			printerCon: function(txt, c) {
				if('Android' == plus.os.name) {
					if(typeof(txt) == "string") {
						txt = txt.split(",")
						txt = txt.join("\n")
					}
					var main_act = plus.android.runtimeMainActivity();
					var Intent = plus.android.importClass('android.content.Intent');
					var intent = new Intent();
					intent.setClassName(main_act, "io.dcloud.printer.PrintService");
					var printContent = txt;
					intent.putExtra("printContent", printContent); //打印内容，可用\n表示换行
					intent.putExtra("fontSize", 1); //字体大小，0：小号，1：中号，2：大号  默认1中号
					intent.putExtra("gravity", 0); //布局方式，0：居左，1：居中，2：居右 默认0居左
					intent.putExtra("type", 0); //打印类型，0:文本内容；1：二维码；2：条码（content必须为数字字符串）
					intent.putExtra("isLast", true); //是否是最后一条打印
					main_act.startService(intent);
					if(c) {
						c != 1 && c();
						return
					}
					var params = E.systemParam("V5.mobile.order.print");
					params.orderNumber = self.orderNumber;
					E.getData('orderPrint', params, function(data) {
						E.closeLoading();
						if(!data.isSuccess) {
							E.alert(data.map.errorMsg)
							return
						}

					}, "get")

				} else {
					plus.nativeUI.alert("此平台不支持！");
				}
			},
			getbluetoothStatus: function() {
				var main = plus.android.runtimeMainActivity();
				var BluetoothAdapter = plus.android.importClass("android.bluetooth.BluetoothAdapter");
				var BAdapter = new BluetoothAdapter.getDefaultAdapter();
				var resultDiv = document.getElementById('output');
				var receiver = plus.android.implements('io.dcloud.android.content.BroadcastReceiver', {
					onReceive: function(context, intent) { //实现onReceiver回调函数
						plus.android.importClass(intent);
						console.log(intent.getAction());
						resultDiv.textContent += '\nAction :' + intent.getAction();
						main.unregisterReceiver(receiver);
					}
				});
				var IntentFilter = plus.android.importClass('android.content.IntentFilter');
				var filter = new IntentFilter();
				filter.addAction(BAdapter.ACTION_STATE_CHANGED); //监听蓝牙开关
				main.registerReceiver(receiver, filter); //注册监听

				if(!BAdapter.isEnabled()) {
					E.toast("蓝牙开启中…");
					BAdapter.enable(); //启动蓝牙
				}
			},
			setPrint: function(c) {
				var main = plus.android.runtimeMainActivity();
				var BluetoothAdapter = plus.android.importClass("android.bluetooth.BluetoothAdapter");
				var UUID = plus.android.importClass("java.util.UUID");
				var uuid = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
				var BAdapter = BluetoothAdapter.getDefaultAdapter();
				BAdapter.cancelDiscovery(); //停止扫描
				var device = BAdapter.getRemoteDevice(c);
				if(!device) {
					canprint = 0
					return
				}
				plus.android.importClass(device);
				var bluetoothSocket = device.createInsecureRfcommSocketToServiceRecord(uuid);
				plus.android.importClass(bluetoothSocket);
				if(!bluetoothSocket.isConnected()) {
					bluetoothSocket.connect();
					var outputStream = bluetoothSocket.getOutputStream();
					plus.android.importClass(outputStream);
					return outputStream
				}
			},
			showGoods: function() {
				this.goodsDetail = true;
				setTimeout(function() {
					mui("#goodsDetail")[0].style.overflow = "hidden";
					mui("#goodsDetail")[0].style.height = (plus.screen.resolutionHeight - 80) + "px";
				}, 0)

			},
			closeGoods: function() {
				this.goodsDetail = false;
				setTimeout(function() {
					mui("#goodsDetail")[0].style.overflow = "auto";
					mui("#goodsDetail")[0].style.height = "auto";
				}, 0)

			},
			goToMap: function() {
				var self = this;
				var mapData = [
					[self.items.logisticInfo.address, self.items.distance + "km", self.orderNumber]
				]
				E.openWindow("../map/map.html", {
					orderStatus: self.orderStatus,
					data: mapData
				})
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
					case "17":
						this.mixPay()
						break;
					case "16":
						this.cardMethod()
						break;
					default:
						this.payMent()
						break;
				}
			},
			barcodePay: function(c) {
				E.openWindow("../barcode/payment.html", {
					orderNumber: this.orderNumber,
					pid: this.pid,
					amount: this.totalPrice,
					type: "detail"
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
			mixPay: function() {
				E.openWindow("mixPay.html", {
					orderNumber: this.orderNumber,
					totalPrice: this.totalPrice,
					prePrice: this.items.initialTotalAmount
				})
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
				var params = E.systemParam("V5.mobile.order.alipay");
				params = mui.extend(params, {
					orderNumber: this.orderNumber,
					authCode: '',
					password: this.password,
					memberCardNumber: this.memberCardNumber,
					paymentType: 16
				})
				E.showLoading()
				this.showCardpay = false;
				E.getData('orderAlipay', params, function(data) {
					console.log(JSON.stringify(data))
					E.closeLoading()
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg);
						return
					}
					self.completePay("支付成功")
				}, "get")
			},
			payMent: function(c) {
				var self = this;
				var params = E.systemParam("V5.mobile.order.alipay");
				params = mui.extend(params, {
					orderNumber: this.orderNumber,
					authCode: '',
					password: "",
					memberCardNumber: "",
					paymentType: parseInt(this.pid)
				})
				E.showLoading()
				E.getData('orderAlipay', params, function(data) {
					console.log(JSON.stringify(data))
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
				intent.putExtra("totalFee", (this.totalPrice * 100).toString()); //订单金额，单位为分
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
				this.showCardpay = false;
			},
			changeOrder: function(c) {
				E.openWindow("changeGoods.html", {
					type: c,
					orderNumber: this.orderNumber,
					items: this.items.products,
				})
			},
			completePay: function(c) {
				var self = this;
				E.alert(c, function() {
					self.loadData(self.orderNumber)
				})

			},
			changePay: function() {
				console.log(this.payments)
				if(this.orderStatus == 'IN_STORE' && this.items.orderPayStatus != '未付款订单') {
					E.openWindow("changePayType.html", {
						initialTotalAmount: this.items.initialTotalAmount,
						orderNumber: this.orderNumber
					})
				}

			}

		}
	}
}
Page.init()