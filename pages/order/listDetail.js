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
			depositsTypes:[],
			depositsTypesShow:false,
			depositsIndex:null,
			yj_amount:'',
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
							self.status = 3;
							
							break;
						case '押金打款中':
							self.status = 4;
							break;
						case '订单完成':
							self.status = 5;
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
				E.openWindow('mixPay.html',{
					orderNumber:this.orderNumber,
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
			enterSn: function() {
				var self = this;
				E.prompt("请输入SN码", "请输入SN码", function(v) {
					self.checkSN(v);
				})
			},
			deleteSn: function(index) {
				this.sndata.splice(index, 1);
			},
			mandZt:function(){
				E.confirm('选择强制自提?',function(){
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
//					self.Ztcode = '222';
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
			closeDeposit:function(){
				this.depositsTypesShow=false;
			},
			showDeposit:function(){
				this.depositsTypesShow=true;
				setTimeout(function() {
							E.showLayer(0)
						}, 0)
			},
			clickDeposit:function(index){
				if(this.depositsIndex!=null){
					this.depositsTypes[this.depositsIndex].checked=false;
				}
				this.depositsTypes[index].checked=true;
				this.depositsIndex=index;
			},
			addDeposit:function(){
				if(this.yj_amount == 0 || this.yj_amount == '') {
					E.toast('请输入金额');
					return;
				}
				if(this.depositsIndex==null){
					E.alert("请选择押金类型")
					return;
				}
				var reg = /^(0|[1-9][0-9]{0,9})(\.[0-9]{1,2})?$/;
				if(!reg.test(this.yj_amount)) {
					E.toast('请输入正确金额');
					return;
				}
				this.closeDeposit()
				this.depositId=this.depositsTypes[this.depositsIndex].depositId;
				this.depositsTypes[this.depositsIndex].checked=false;
				this.depositsIndex=null;
				var orderData={
					depositsId: this.depositsId,
					amount: this.yj_amount,
					orderNumber:this.orderNumber,
				}
				var params = E.systemParam('V5.mobile.project.jiku.deposits.create');
				params.orderData=JSON.stringify(orderData);
				E.showLoading()
				E.getData('jikuDepositsCreate', params, function(data) {
					E.closeLoading()
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					data.deposits.forEach(function(item){
						item.checked=false;
					})
					self.depositsTypes=data.deposits;
				},"post")
			},
			createReimburseOrder:function(){
				var self=this;
				var orderData={
					sn:'',
					days:'2',
					price:'2',
					amount:'2',
					orderNumber:this.orderNumber,
					depositsId:"1"
				}
				var params = E.systemParam('V5.mobile.project.jiku.return.create');
				params.orderData=JSON.stringify(orderData);
				E.getData('jikuReturnCreate', params, function(data) {
					E.closeLoading()
					console.log(data)
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					data.deposits.forEach(function(item){
						item.checked=false;
					})
					self.depositsTypes=data.deposits;
				})
			},
			depositsGet:function(){
				var self=this;
				var params = E.systemParam('V5.mobile.project.jiku.deposits.get');
				E.getData('jikuDepositsGet', params, function(data) {
					E.closeLoading()
					console.log(data)
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					data.deposits.forEach(function(item){
						item.checked=false;
					})
					self.depositsTypes=data.deposits;
				})
			},
			createReturnOrder: function() {
				var deposits;
				if(this.order.products.length > 1) {
					deposits = [{
						depositsId: '',
						amount: this.order.products[1].price,
					}]
				}
				var orderData = {
					orderNumber: this.orderNumber,
					items: [{
						salesOrderItemId: this.order.products[0].itemId,
						snCode: this.sndata.join(','),
					}],
					deposits: deposits,
				}
				var params = E.systemParam('V5.mobile.project.jiku.return.product.create');
				params.orderData = JSON.stringify(orderData);
				E.showLoading()
				E.getData('jikuReturnProductCreate', params, function(data) {
					E.closeLoading()
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					self.sndata.push(sncode);
				})
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