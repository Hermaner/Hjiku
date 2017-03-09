var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.plusReady(function() {
			self.ws = plus.webview.currentWebview();
			window.addEventListener('pageshow', function(event) {
				self.vue.loadData();
				if(E.getStorage("vendor") == 1) {
					self.vue.registerReceiver()
				}
			})
		});
	},
	vueObj: {
		el: '#vue',
		data: {
			listData: [],
			shop: {}
		},
		ready: function() {
			this.listData = [{
				name: '下单',
				icon: "icon-accept",
				page: "page",
				type: "4",
				count: '0'
			}, {
				name: '所有订单',
				icon: "icon-accept",
				page: "page",
				type: "1",
				count: '0'
			}, {
				name: '现场订单',
				icon: "icon-accept",
				page: "page",
				type: "3",
				count: '0'
			}, {
				name: '自提订单',
				icon: "icon-accept",
				page: "page",
				type: "2",
				count: '0'
			}, {
				name: '退押金单',
				icon: "icon-accept",
				page: "rentorder",
				type: "5",
				count: '0'
			}, {
				name: '退租金单',
				icon: "icon-accept",
				page: "rentorder",
				type: "6",
				count: '0'
			}]
		},
		methods: {
			loadData: function() {
				var self = this;
				var params = E.systemParam("V5.mobile.project.jiku.statistics.get");
				E.getData('jikuStatisticsGet', params, function(data) {
					console.log(data)
					E.closeLoading()
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					self.listData[1].count = data.statistics.orderCount;
					self.listData[2].count = data.statistics.siteCount;
					self.listData[3].count = data.statistics.fetchCount;
					self.listData[4].count = data.statistics.depositCount;
					self.listData[5].count = data.statistics.rentCount;
					self.shop = data.shop;
				});
			},
			goPage: function(type) {
				switch(type) {
					case '4':
						E.openWindow('../cashr/cashrCart.html')
						break;
					case '5':
						E.fireData('rentTop', "", {
							type: type
						})
						E.firesubData('rentOrder', "", {
							type: type
						})
						break;
					case '6':
						E.fireData('rentTop', "", {
							type: type
						})
						E.firesubData('rentOrder', "", {
							type: type
						})

						break;
					default:
						E.fireData('orderTop', "", {
							type: type
						})
						E.firesubData('order', "", {
							type: type
						})
						break;
				}
			},
			exitLogin: function() {
				Page.ws.hide("pop-out");
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
		}
	}

}
Page.init()