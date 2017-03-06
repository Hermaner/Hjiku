var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		mui.plusReady(function() {
			mui('.mui-scroll-wrapper').scroll({

			});
		});
	},
	vueObj: {
		el: '#vue',
		data: {
			beginText: '',
			endText: '',
			beginFont: '选择时间',
			endFont: '选择时间',
			distype: 0,
			usetype: 0,
			couponval: '',
			couponname: '',
			condition: '',
			count: '',
			disexplain: '',
			discount: ''
		},
		methods: {
			loadData: function(c) {

			},
			resetData: function() {
				this.beginText = ''
				this.endText = ''
				this.beginFont = '选择时间'
				this.endFont = '选择时间'
				this.distype = 0
				this.usetype = 0
				this.couponval = ''
				this.condition = ''
				this.couponname = '',
					this.count = ''
				this.disexplain = ''
				this.discount = ''
			},
			gonext: function() {
				if(this.beginFont == '选择时间' || this.endFont == '选择时间' || !this.distype || !this.usetype|| this.distype==0 || this.usetype==0 || (!this.couponval && this.distype == 1) || (!this.discount && this.distype == 2) || !this.count || !this.couponname) {
					E.toast("信息不全")
					return
				}
				if((this.distype == 1 && this.couponval == 0) || (this.distype == 2 && this.discount == 0) || this.count == 0) {
					E.toast("值不能为0")
					return
				}
				if(this.condition && (parseFloat(this.couponval) > parseFloat(this.condition))) {
					E.toast("优惠面额不能大于订单满额")
					return
				}
				if(this.distype == 2 && parseFloat(this.discount > 10)) {
					E.toast("折扣值为1-9的整数")
					this.discount = ''
					return
				}
				if(this.count > 1000) {
					E.toast("数量不能大于1000")
					this.count = ''
					return
				}
				var couponData = {
					couponType: this.distype,
					useType: this.usetype,
					couponName: this.couponname,
					denomination: this.couponval,
					discount: this.discount,
					orderAmount: this.condition,
					createnumber: this.count,
					startTime: this.beginFont,
					endTime: this.endFont,
					otherSetting: 1,
					memo: this.disexplain,
					stores: []
				}
				E.fireData('getStore', 'detailShow', {
					couponData: couponData
				})
			},
			optionTime: function(options, c) {
				var self = this
				var picker = new mui.DtPicker(options);
				picker.show(function(rs) {
					console.log(rs)
					var rsDate = rs.y.value + '-' + rs.m.value + '-' + rs.d.value + ' ' + rs.h.value + ':' + rs.i.value
					var rsTime = new Date(rsDate.replace(/-/g, "/")).getTime();
					c ? self.beginText = rsTime : self.endText = rsTime;
					if(self.beginText && self.endText && self.endText < self.beginText) {
						if(c) {
							self.beginText = ''
							self.beginFont = '选择日期'
						} else {
							self.endText = ''
							self.endFont = '选择日期'
						}
						alert('开始时间不能大于结束时间')
						return
					}
					c ? self.beginFont = rsDate + ':00' : self.endFont = rsDate + ':59'
					picker.dispose();
				});
			},
			discountMatch: function() {
				var val = this.discount;
				if(isNaN(val)) {
					this.discount = '';
					mui.toast('格式错误')
					return
				}
				if(parseFloat(val) > 10 || parseFloat(val) < 0.1) {
					this.discount = '';
					mui.toast('格式错误')
					return
				}
				if(val.length>3){
					this.discount=val.substr(0,3)
				}
			},
			amountMatch: function() {
				var val = this.couponval;
				if(isNaN(val)) {
					this.couponval = '';
					mui.toast('格式错误')
					return
				}
				this.couponval=new Number(val).toFixed(2)
				
			},
			conditionMatch: function() {
				var val = this.condition;
				if(!val){
					return
				}
				if(isNaN(val)) {
					this.condition = '';
					mui.toast('格式错误')
					return
				}
				this.condition=new Number(val).toFixed(2)
			},
			intNum: function(c) {
				var self = this
				var val;
				switch(c) {
					case 1:
						val = this.couponval
						break;
					case 2:
						val = this.condition
						break;
					case 3:
						val = this.count
						break;
					default:
						break;
				}
				if(val == '') {
					return
				}
				E.IsNumer(val, function() {
					switch(c) {
						case 1:
							self.couponval = parseInt(val)
							break;
						case 2:
							self.condition = parseInt(val)
							break;
						case 3:
							self.count = parseInt(val)
							break;
						default:
							break;
					}
				}, function() {
					switch(c) {
						case 1:
							self.couponval = ''
							break;
						case 2:
							self.condition = ''
							break;
						case 3:
							self.count = ''
							break;
						default:
							break;
					}
					E.toast("请正确输入")
				})
			}
		}
	}

}
Page.init()