var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.plusReady(function() {
			window.addEventListener('detailShow', function(event) {
				self.vue.receivablesNo = event.detail.receivablesNo
				self.vue.loadData()
			})
			var oldBack = mui.back;
			mui.back = function() {
				oldBack()
				self.vue.receivableHistory = ''
				self.vue.showData = true
				
			}
		});
	},
	vueObj: {
		el: '#vue',
		data: {
			receivableHistory: '',
			receivablesNo: '',
			showData:true
		},
		methods: {
			loadData: function() {
				var self = this;
				var params = E.systemParam("V5.mobile.receviables.history.get");
				console.log(this.receivablesNo)
				params = mui.extend(params, {
					receivableNo: this.receivablesNo
				})
				E.getData('receviablesHistoryGet', params, function(data) {
					console.log(JSON.stringify(data))
					
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					self.showData = false
					self.receivableHistory = data.receivable
				}, "get")
			}
		}
	}

}
Page.init()