var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.plusReady(function() {
			var ws = plus.webview.currentWebview()
			self.vue.moreList = ws.moreList;
			console.log(ws.moreList)
			for(var i = 0; i < ws.moreList.length; i++) {
				switch(ws.moreList[i]) {
					case '1':
						self.vue.exit1 = '1'
						break;
					case '2':
						self.vue.exit2 = '1'
						break;
					case '4':
						self.vue.exit4 = '1'
						break;
					case '5':
						self.vue.exit5 = '1'
						break;
					case '7':
						self.vue.exit7 = '1'
						break;
					case '8':
						self.vue.exit8 = '1'
						break;
					case '9':
						self.vue.exit9 = '1'
						break;
					case '10':
						self.vue.exit10 = '1'
						break;
					case '11':
						self.vue.exit11 = '1'
						break;
					case '12':
						self.vue.exit12 = '1'
						break;
					case '13':
						self.vue.exit13 = '1'
						break;
					case '14':
						self.vue.exit14 = '1'
						break;
					case '15':
						self.vue.exit15 = '1'
						break;
					case '16':
						self.vue.exit16 = '1'
						break;
					case '20':
						self.vue.exit20 = '1'
						break;
					case '25':
						self.vue.exit25 = '1'
						break;
					case '26':
						self.vue.exit26 = '1'
						break;
					case '27':
						self.vue.exit27 = '1'
						break;
					case '28':
						self.vue.exit28 = '1'
						break;
					case '29':
						self.vue.exit29 = '1'
						break;
					default:
						break;
				}
			}
		});
	},
	vueObj: {
		el: '#vue',
		data: {
			moreList: [],
			exit1: '',
			exit2: '',
			exit4: '',
			exit5: '',
			exit7: '',
			exit8: '',
			exit9: '',
			exit10: '',
			exit11: '',
			exit12: '',
			exit13: '',
			exit14: '',
			exit15: '',
			exit16: '',
			exit20: '',
			exit25: '',
			exit26: '',
			exit27: '',
			exit28: '',
			exit29: ''
		},
		methods: {
			alertTips: function() {
				E.confirm('您尚未开通此功能，开通请致电4007285858', function() {
					window.location.href = 'tel:4007285858'
				})
			},
		}
	}

}
Page.init()