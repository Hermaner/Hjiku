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
				self.vue.orderNumber = event.detail.orderNumber;
				self.vue.loadData();
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
			sndata: [],
			order: {},
			products: [],
			orderNumber: '',
			showData: true,
			status: 0,
			Ztcode: "",
			sectext: '获取验证码',
			dissecBtn: false,
			depositsTypes: [],
			depositsTypesShow: false,
			rentTypesShow: false,
			rentLayer: {
				zj_lsn: "",
				zj_ldays: "",
				zj_lprice: "",
				zj_lamount: "",
			},
			yzCode:'',
			depositsAr: [],
			depositsIndex: null,
		},
		methods: {
			loadData: function() {
				var self = this;
				var params = E.systemParam('V5.mobile.project.jiku.order.get');
				params.orderNumber = this.orderNumber;
				//				E.showLoading()
				E.getData('jikuOrderGet', params, function(data) {
					//					E.closeLoading();
					console.log(data);
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					data.order.products.sort(function(a, b) { return a.isDeposits - b.isDeposits });
					self.order = data.order;
					switch(self.order.status) {
						case '待付款':
							self.status = 0;
							break;
						case '待提货':
							self.status = 1;
							break;
						case '待返货':
							self.status = 2;
							self.depositsGet()
							break;
						case '待退押金':
							self.status = 4;
							break;
						case '押金打款中':
							self.status = 3;
							break;
						case '订单完成':
							self.status = 3;
							break;
						default:
							break;
					}
					self.showData = false;
				})
			},
			updateOrder: function() {
				this.resetData();
				this.loadData();
			},
			deliverOrder: function() {
				if(!this.Ztcode) {
					E.alert("请输入自提码");
					return;
				}
				if(this.yzCode!=this.Ztcode){
					E.alert("自提码不匹配");
					return;
				}
				var params = E.systemParam('V5.mobile.project.jiku.order.update');
				params.code =this.Ztcode;
				E.showLoading()
				E.getData('jikuOrderUpdate', params, function(data) {
					E.closeLoading();
					console.log(data);
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					self.updateOrder()
				})
				
				
				var self = this;
				var item0 = this.order.products[0];
				if(this.sndata.length == 0) {
					E.alert("下单失败，请录入设备SN码");
					return;
				}
				if(this.sndata.length != item0.quantity) {
					E.alert("下单失败，SN码个数不匹配");
					return;
				}
				var orderData = {
					orderNumber: this.orderNumber,
					items: [{
						productItemId: item0.productItemId,
						sn: this.sndata.join(',')
					}]
				};
				var params = E.systemParam('V5.mobile.project.jiku.order.update');
				params.orderData = JSON.stringify(orderData);
				E.showLoading()
				E.getData('jikuOrderUpdate', params, function(data) {
					E.closeLoading();
					console.log(data);
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					self.updateOrder()
				})
			},
			gopayPage: function() {
				E.openWindow('mixPay.html', {
					orderNumber: this.orderNumber,
				})
			},
			checkSN: function(sncode) {
				var self = this;
				var item0 = this.order.products[0];
				var params = E.systemParam('V5.mobile.project.jiku.items.get');
				params = mui.extend(params, {
					condition: sncode + ',' + item0.productItemId,
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
				})
			},
			gosnScan: function() {
				E.openWindow("../barcode/orderScan.html", {
					type: "sn"
				})
			},
			gofhsnScan: function() {
				E.openWindow("../barcode/orderScan.html", {
					type: "fhsn"
				})
			},
			enterSn: function() {
				var self = this;
				E.prompt("请输入SN码", "请输入SN码", function(v) {
					self.checkSN(v);
				})
			},
			enterfhSn: function() {
				var self = this;
				E.prompt("请输入返货SN码", "请输入返货码", function(v) {
					self.checkfhSN(v);
				})
			},
			checkfhSN: function(v) {
				var exit = false;
				for(var i = 0; i < this.sndata.length; i++) {
					if(this.sndata[i] == v) {
						E.alert("该返货SN已录入");
						return;
					}
				}
				for(var i = 0; i < this.order.sns.length; i++) {
					if(this.order.sns[i].snCode == v) {
						exit = true;
					}
				}
				if(exit) {
					this.sndata.push(v);
				} else {
					E.alert("SN录入错误");
				}
			},
			deleteSn: function(index) {
				this.sndata.splice(index, 1);
			},
			mandZt: function() {
				E.confirm('选择强制自提?', function() {
					alert(1)
				})
			},
			getZtcode: function() {
				this.dissecBtn = true;
				var self = this;
				var sec = 60;
				tn();
				var t = setInterval(function() {
					tn()
				}, 1000)
				//				var params = E.systemParam('V5.mobile.project.jiku.return.product.create');
				//				E.showLoading()
				//				E.getData('jikuReturnProductCreate', params, function(data) {
				//					E.closeLoading()
				//					if(!data.isSuccess) {
				//						E.alert(data.map.errorMsg)
				//						return
				//					}
				//					self.yzCode = '222';
				//				})
				function tn() {
					if(sec <= 0) {
						self.sectext = "发送验证码";
						self.dissecBtn = false;
						clearInterval(t)
						sec = 60
					} else {
						self.sectext = sec + "秒后可重新发送";
						sec--;
					}
				}
			},
			closerentLayer: function() {
				this.rentTypesShow = false;
			},
			showrentLayer: function() {
				this.rentTypesShow = true;
				setTimeout(function() {
					E.showLayer(1)
				}, 0)
			},
			closeDeposit: function() {
				this.depositsTypesShow = false;
			},
			showDeposit: function() {
				this.depositsTypesShow = true;
				setTimeout(function() {
					E.showLayer(0)
				}, 0)
			},
			clickDeposit: function(index) {
				if(this.depositsIndex != null) {
					this.depositsTypes[this.depositsIndex].checked = false;
				}
				this.depositsTypes[index].checked = true;
				this.depositsIndex = index;
			},
			addDeposit: function() {
				if(this.depositsIndex == null) {
					E.alert("请选择押金类型")
					return;
				}
				this.closeDeposit()
				this.depositId = this.depositsTypes[this.depositsIndex].depositId;
				this.depositsAr.push({amount:this.depositsTypes[this.depositsIndex].amount,depositId: this.depositId, depositName: this.depositsTypes[this.depositsIndex].depositName });
				this.depositsTypes[this.depositsIndex].checked = false;
				this.depositsIndex = null;
			},
			deleteDepositsAr: function(index) {
				this.depositsAr.splice(index, 1);
			},
			createReimburseOrder: function() {
				var self = this;
				if(!this.rentLayer.zj_lsn || !this.rentLayer.zj_ldays || !this.rentLayer.zj_lprice || !this.rentLayer.zj_lamount) {
					E.toast('信息不全');
					return;
				}
				var dayreg = /^[0-9]*[1-9][0-9]*$/;
				if(!dayreg.test(this.rentLayer.zj_ldays)) {
					E.toast('请输入天数');
					return;
				}
				var reg = /^(0|[1-9][0-9]{0,9})(\.[0-9]{1,2})?$/;
				if(!reg.test(this.rentLayer.zj_lprice) || !reg.test(this.rentLayer.zj_lamount)) {
					E.toast('请输入正确金额');
					return;
				}
				this.closerentLayer()
				var orderData = {
					sn: this.rentLayer.zj_lsn,
					days: this.rentLayer.zj_ldays,
					price: this.rentLayer.zj_lprice,
					amount: this.rentLayer.zj_lamount,
					orderNumber: this.orderNumber,
					depositsId: "1"
				}
				var params = E.systemParam('V5.mobile.project.jiku.return.create');
				params.orderData = JSON.stringify(orderData);
				E.showLoading();
				E.getData('jikuReturnCreate', params, function(data) {
					E.closeLoading()
					console.log(data)
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					E.alert("新建成功", function() {
						self.updateOrder();
					});
				}, "post")
			},
			depositsGet: function() {
				var self = this;
				var params = E.systemParam('V5.mobile.project.jiku.deposits.get');
				E.getData('jikuDepositsGet', params, function(data) {
					E.closeLoading()
					console.log(data)
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					data.deposits.forEach(function(item) {
						item.checked = false;
						item.amount = 20;
					})
					self.depositsTypes = data.deposits;
				})
			},
			createReturnOrder: function() {
				var self=this;
				if(this.sndata.length == 0) {
					E.alert("请录入返货SN");
					return;
				}
				if(this.sndata.length != this.order.sns.length) {
					E.alert("录入的SN数量不匹配");
					return;
				}
				var deposits=[];
				if(this.depositsAr.length > 0) {
					for(var i=0;i<this.depositsAr.length;i++){
						deposits.push({
							depositsId: this.depositsAr[i].depositId,
							amount: this.depositsAr[i].amount,
						})
					}
				}
				var orderData = {
					orderNumber: this.orderNumber,
					items: [{
						salesOrderItemId: this.order.products[0].itemId,
						snCode: this.sndata.join(','),
					}],
					deposits: deposits||"",
				}
				var params = E.systemParam('V5.mobile.project.jiku.return.product.create');
				params.orderData = JSON.stringify(orderData);
				E.showLoading()
				E.getData('jikuReturnProductCreate', params, function(data) {
					E.closeLoading()
					console.log(data)
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					self.updateOrder();
				},"post")
			},
			resetData: function() {
				this.sndata = [];
				this.showData = true;
				this.order = {};
				this.products = [];
				this.showData = true;
				this.status = 0;
				this.Ztcode = "";
				this.sectext = '获取验证码';
				this.dissecBtn = false;
			}
		}
	}
}
Page.init()