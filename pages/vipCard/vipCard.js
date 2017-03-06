var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		mui.init();

		mui.plusReady(function() {})
	},
	vueObj: {
		el: '#vipCard',
		data: {
			searchtext: "",
			tel: "",
			name: "",
			level: "",
			cardNum: "",
			password: "",
			discount: "",
			cpassword: "",
			memberNo:""
		},
		methods: {
			saveCard: function() {
				if (!this.cardNum || !this.password || !this.cpassword) {
					E.toast("信息不全")
					return
				}
				if (this.password != this.cpassword) {
					E.toast("两次密码不一致")
					return
				}
				var params = E.systemParam('V5.mobile.channel.member.update');
				params = mui.extend(params, {
					memberNo:this.memberNo,
					memberCardNumber:this.cardNum,
					password: this.password
				})
				E.showLoading()
				E.getData('channelMemberUpdate', params, function(data) {
					console.log(JSON.stringify(data))
					E.closeLoading()
					if (!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					E.alert("会员卡绑定成功",function(){
						mui.back();
					});
				})
			},
			searchItem: function() {
				var self = this;
				if (!this.searchtext) {
					E.toast("请输入要查询的手机号")
					return
				}
				var telReg = !!(this.searchtext).match(/^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/);
				if (telReg == false) {
					E.toast("请输入正确的手机号")
					this.searchtext = ""
					return
				}
				var params = E.systemParam('V5.mobile.channelMember.get');
				params.mobilePhone = this.searchtext;
				var phone=this.searchtext;
				E.showLoading()
				E.getData('channelMemberGet', params, function(data) {
					console.log(JSON.stringify(data))
					E.closeLoading()
					if (!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					self.tel = phone, self.name = data.channelMember.userName, self.level = data.channelMember.memberLevelName, self.discount = data.channelMember.memberDiscount;
					self.memberNo=data.channelMember.memberNo
				},"get")
			}

		}
	}
}
Page.init()