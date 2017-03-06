var pushPage = {
	mid:"0",
	oid:"0",
	init: function() {
		this.plusEvent()
	},
	plusEvent: function() {
		var self=this;
		mui.plusReady(function() {
			var m,n;
			mui('.mui-content .mui-switch').each(function(index) { //循环所有toggle
				index == 0 && self.mid == 1 && (this.classList.add('mui-active'))
				index == 1 && self.oid == 1 && (this.classList.add('mui-active'))
				this.addEventListener('toggle', function(event) {
					index == 0 && (event.detail.isActive ? m = "1" : m = "0");
					index == 1 && (event.detail.isActive ? n = "1" : n = "0");
					var params = E.systemParam("V5.mobile.push.set");
					params.noticeMessage = m || "0";
					params.noticeOrder = n || "0";
					E.getData('pushSet', params, function(data) {
						console.log(JSON.stringify(data))
						self.mid == m,self.oid == n
					})
				});
			});
		})

	},
	loadData: function() {
		var self=this;
		var params = E.systemParam("V5.mobile.push.get");
		E.getData('pushGet', params, function(data) {
			console.log(JSON.stringify(data))
			var noticeMessage = data.noticeMessage
			var noticeOrder = data.noticeOrder;
			noticeMessage == 1 ? mui(".mui-switch")[0].setAttribute("class", "mui-switch mui-active") : ""
			noticeOrder == 1 ? mui(".mui-switch")[1].setAttribute("class", "mui-switch mui-active") : ""
			self.mid=noticeMessage,self.oid=noticeOrder
		}, "get")
	}
}
pushPage.init()