var aboutPage = {
	init: function() {
		this.plusEvent()
	},
	plusEvent: function() {
		mui.plusReady(function() {
			plus.runtime.getProperty(plus.runtime.appid, function(inf) {
				document.getElementById("version").innerText = inf.version;
			});
		})
	}
}
aboutPage.init()