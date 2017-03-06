var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.init();
		mui.plusReady(function() {
			var ws = plus.webview.currentWebview()
			ws.addEventListener('show', function() {
				self.vue.loadData()
			});
			var oldBack = mui.back;
			mui.back = function() {
				self.vue.tel = ''
				self.vue.name = ''
				self.vue.level = ''
				self.vue.levels = ''
				self.vue.addressAr = []
				oldBack()
			}
		})
	},
	vueObj: {
		el: '#vue',
		data: {
			tel: "",
			name: "",
			level: "",
			levels: "",
			addressAr: [],
		},
		methods: {
			loadData: function() {
				var self = this;
				var params = E.systemParam('V5.mobile.channelMemberLevel.Search');

				E.getData('channelMemberLevelSearch', params, function(data) {
					console.log(JSON.stringify(data))
					E.closeLoading()
					if(!data.isSuccess) {

						E.alert(data.map.errorMsg)
						return
					}
					self.levels = data.channelMemberLevels
				}, "get")
			},
			cancleCreate: function() {
				mui.back()
			},
			saveCreate: function() {
				if(!this.name || !this.tel || !this.level || this.addressAr.length == 0) {
					E.toast("信息不全")
					return
				}
				var memberAddress = [];
				for(var i = 0, len = this.addressAr.length; i < len; i++) {
					memberAddress.push({
						mobilePhone: this.tel,
						consignee: this.addressAr[i].name,
						provinceName: this.addressAr[i].province,
						cityName: this.addressAr[i].city,
						areaName: this.addressAr[i].cityarea,
						address: this.addressAr[i].address
					})
				}
				var memberData = {
					member: {
						userName: this.name,
						mobilePhone: this.tel,
						plat: "门店",
						memberLevelId: this.level,
						memberAddress: memberAddress
					}
				}
				var params = E.systemParam('V5.mobile.platMember.add');
				params.memberData = JSON.stringify(memberData);
				E.showLoading()
				E.getData('platMemberAdd', params, function(data) {
					console.log(JSON.stringify(data))
					E.closeLoading()
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					E.alert("新建会员成功", function() {
						mui.back();
					});
				})
			},
			checkTel: function() {
				var self = this
				var telReg = !!(this.tel).match(/^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/);
				if(telReg == false) {
					E.toast("请输入正确的手机号")
					this.tel = ""
					return
				}
				var params = E.systemParam('V5.mobile.platMember.get');
				params = mui.extend(params, {
					mobilePhone: this.tel,
					type: "memberAdd"
				})
				E.showLoading()
				E.getData('platMemberGet', params, function(data) {
					console.log(JSON.stringify(data))
					E.closeLoading()
					if(!data.isSuccess) {
						if(data.map.errorMsg == "平台会员已经存在") {
							self.tel = ""
						}
						E.alert(data.map.errorMsg)
						return
					}
					var channelMember = data.channelMember;
					var memberAddress = channelMember.memberAddress;
					self.addressAr = self.addressAr.concat(memberAddress);
					self.name = channelMember.userName;
					self.level = channelMember.memberLevelId;
				}, "get")
			},
			goAddress: function() {
				if(!this.tel) {
					E.toast("请输入手机号")
					return
				}
				E.fireData('createAddress.html', "addShow", {
					tel: this.tel
				})
			},
			getAddress: function(c) {
				for(var i = 0; i < this.addressAr.length; i++) {
					if(JSON.stringify(this.addressAr[i]) == c) {
						E.toast("已存在同样的地址")
						return
					}
				}
				c = JSON.parse(c)
				this.addressAr.push(c)
			}
		}
	}
}
Page.init()