var mapPage = {
	index: 0,
	adds: [],
	preMarker: null,
	preIcon: null,
	one: null,
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig();
	},
	initConfig: function() {
		var self = this;
		mui.init({});
		mui.plusReady(function() {
			self.orderListPage = E.getWebview(E.subpages[2]);
			var ws = plus.webview.currentWebview();
			self.vue.orderStatus = ws.orderStatus;
			self.vue.data = ws.data;
			for (i in self.vue.data) {
				self.adds.push(self.vue.data[i][0])
			}
			if (self.vue.data.length == 1) {
				self.one = true;
				self.vue.items = self.vue.data[0];
			}
			self.mapInit()
		})
	},
	mapInit: function() {
		var self = this;
		this.map = new BMap.Map("map");
		this.myGeo = new BMap.Geocoder();
		this.myGeo.getPoint(E.getStorage("address"), function(point) {
			if (point) {
				var address = new BMap.Point(point.lng, point.lat);
				self.map.centerAndZoom(point, 16);
				var marker;
				if (self.one) {
					var myIcon = new BMap.Icon("../../images/iosicon/st.png", new BMap.Size(30, 36));
					marker = new BMap.Marker(address, {
						icon: myIcon
					});
				} else {
					marker = new BMap.Marker(address);
				}
				self.map.addOverlay(marker);
			}
		}, "");
		var rh = plus.screen.resolutionHeight
		document.getElementById("map").style.height = (rh - 109) + "px";
		self.bdGEO();
	},
	bdGEO: function() {
		var add = mapPage.adds[mapPage.index];
		if (add) {
			mapPage.geocodeSearch(add);
			mapPage.index++;
		}
	},
	geocodeSearch: function(add) {
		var self = mapPage;
		if (self.index < self.adds.length) {
			setTimeout(self.bdGEO, 400);
		}
		this.myGeo.getPoint(add, function(point) {
			if (point) {
				var address = new BMap.Point(point.lng, point.lat);
				var myIcon;
				if (self.one) {
					myIcon = new BMap.Icon("../../images/iosicon/ed.png", new BMap.Size(30, 36));
				} else {
					myIcon = new BMap.Icon("../../images/iosicon/c" + (self.index - 1) + ".png", new BMap.Size(22, 36));
				}
				var marker = new BMap.Marker(address, {
					icon: myIcon
				});
				self.map.addOverlay(marker);
				marker.x = mapPage.index - 1;
				if (!self.one) {
					marker.addEventListener("click", function() {
						for (i in self.vue.data) {
							if (self.vue.data[i][0] == add) {
								self.vue.items = self.vue.data[i]
							}
						}
						if (mapPage.preMarker) {
							mapPage.preMarker.setIcon(mapPage.preIcon)
						}
						mapPage.preMarker = this;
						mapPage.preIcon = this.getIcon()
						var nextIcon = new BMap.Icon("../../images/iosicon/d" + (this.x) + ".png", new BMap.Size(22, 36));
						this.setIcon(nextIcon)
					});
				}
			}
		});
	},
	vueObj: {
		el: '#mapPage',
		data: {
			data: [],
			items: [],
			orderStatus: ""
		},
		methods: {
			getOrder: function() {
				var self = this;
				E.showLoading()
				var params = E.systemParam("V5.mobile.order.operation");
				params = mui.extend(params, {
					orderNumber: self.items[2],
					operation: 'ACCEPET',
					operationReason: ""
				})
				E.getData('orderOperation', params, function(data) {
					E.closeLoading()
					if (!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}

					E.alert("接单成功", function() {
						plus.webview.hide("orderDetail")
						mapPage.orderListPage.evalJS("Page.vue.loadData('" + self.orderStatus + "','',1)")
						mui.back();
					});

				}, "get")
			}
		}
	}
}
mapPage.init()