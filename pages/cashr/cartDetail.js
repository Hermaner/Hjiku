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
				unsnItems.forEach((item) => {
					if(!mainPd && item.isDeposits === '0') {
						mainPd = item;
					}
					if(!depositPd && item.isDeposits === '1') {
						depositPd = item;
					}
				});
				if(snItems.length > 0) {
					mainPd = snItems[0];
				}
				if(mainPd && depositPd) {
					self.vue.submitData.items = [{
							pdname: mainPd.productName,
							isDeposits: 0,
							quantity: mainPd.count,
							price: mainPd.price,
							productItemId: mainPd.productItemId,
							sn: mainPd.snAr ? mainPd.snAr.toString() : '',
							days: self.vue.defaultdays, //默认租用天数，此数据在修改leaveHomeTime，returnHomeTime时实时算出
						},
						{
							pdname: depositPd.productName,
							isDeposits: 1,
							quantity: mainPd.count,
							price: depositPd.price,
							productItemId: depositPd.productItemId,
							days: 1,
						},
					];
					// 添加SN
					if(mainPd.snAr && mainPd.snAr > 0) {
						mainPd.snAr.forEach((sn) => {
							self.vue.addSN(sn);
						});
					}
				}
			})
		})
	},
	vueObj: {
		el: '#vue',
		data: {
			searchtext: "",
			items: null,
			defaultdays: 3,
			sndata: [],
			submitData: {
				consignee: '',
				mobilePhone: '',
				leaveHomeTime: '',
				returnHomeTime: '',
				actualAmount: 0,
				memo: 'da',
				items: [],
			},
			beginText: "",
			beginFont: "选择日期",
			endText: "",
			endFont: "选择日期",
		},
		methods: {
			loadData: function(c) {

			},
			addSN: function(sncode) {
				this.sndata.push({
					sn: sncode,
					status: 0,
				});
				const { submitData } = this.state;
    MT.showWaiting();
    API.product.list({
      condition: `${sncode},${submitData.items[0].productItemId}`,
      type: 'productSN',
    })
    .then((json) => {
       MT.closeWaiting();
      const newsndata = this.state.sndata.map((sn) => {
        const newsn = Object.assign({}, sn);
        if (newsn.sn === sncode) {
          if (json.isSuccess) {
            newsn.status = 1;
          } else {
            newsn.status = 4;
            if (json.map.errorMsg.match('状态为售出')) {
              newsn.status = 3;
            }
          }
        }
        return newsn;
      });
      this.setState({
        sndata: newsndata,
      });
    });
				this.checkSN(sncode);
			},
			gosnScan: function() {
				E.openWindow("../barcode/orderScan.html", {
					type: "sn"
				})
			},
			enterSn: function() {
				E.prompt("请输入SN码", "请输入SN码", function(v) {
					alert(v);
				})
			},
			createOrder: function() {
				if(!this.submitData.mobilephone || !this.submitData.consignee || this.beginFont == '选择日期' || this.endFont == '选择日期') {
					E.toast("信息不全");
					return;
				}
				if(this.submitData.consignee.length < 2) {
					E.toast("姓名长度不能少于2位");
					return;
				}
				var telReg = !!(this.submitData.mobilephone).match(/^1[34578]\d{9}$/);
				if(telReg == false) {
					E.toast("请输入正确的手机号");
					return
				}
				this.submitData.leaveHomeTime = this.beginFont;
				this.submitData.returnHomeTime = this.endFont;

			},
			optionTime: function(c) {
				var self = this
				var picker = new mui.DtPicker({ "type": "date", "beginYear": 2000, "endYear": 2030 });
				picker.show(function(rs) {
					var rsTime = new Date(rs.text.replace(/-/g, "/")).getTime();
					c ? self.beginText = rsTime : self.endText = rsTime;
					if(self.beginText && self.endText && self.endText < self.beginText) {
						if(c) {
							self.beginText = ''
							self.beginFont = '选择日期'
						} else {
							self.endText = ''
							self.endFont = '选择日期'
						}
						alert('出国日期不能大于回国日期')
						return
					}
					c ? self.beginFont = rs.text : self.endFont = rs.text
					picker.dispose();
				});
			},
		}
	}
}
Page.init()