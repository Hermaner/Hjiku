var mapPage = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.init({});
		mui.plusReady(function() {
			var ws = plus.webview.currentWebview();
			self.openr = ws.opener();
			var maps = new plus.maps.Map("maps");
			maps.getUserLocation(function(state, pos) {
				if (0 == state) {
					self.map = new BMap.Map("map");
					self.map.centerAndZoom(new BMap.Point(116.404, 39.915), 16);
					self.geolocation = new BMap.Geolocation();
					self.geoc = new BMap.Geocoder();
					pos=new BMap.Point(pos.longitude,pos.latitude)
					self.getMap(pos)
				}
			});
			mui("#addressList").on('tap', "li", function() {
				var address = this.getAttribute("address")
				self.openr.opener().evalJS("Page.vue.reloadStore('" + address + "')")
				setTimeout(function(){
					self.openr.close();
					ws.close()
				})
			})

		})
	},
	mapInit: function(c) {
		this.getMap(c)
	},
	getMap: function(mPoint) {
		var self = this
		var map = this.map;
		var mk = new BMap.Marker(mPoint);
		map.addOverlay(mk);
		map.panTo(mPoint);
		this.geoc.getLocation(mPoint, function(rs) {
			var addComp = rs.addressComponents;
			self.vue.address = addComp.province + addComp.city + addComp.district + addComp.street + addComp.streetNumber;
			setTimeout(function() {
				self.openr.evalJS("mapPage.vue.loadAddress('" + self.vue.address + "')")
			}, 100)
		});
		var options = {
			onSearchComplete: function(results) {
				if (local.getStatus() == BMAP_STATUS_SUCCESS) {
					var items = [];
					for (var i = 0; i < results.getCurrentNumPois(); i++) {
						var rss = results.getPoi(i).address;
						if (rss.indexOf("；") > -1) {
							rss = rss.split("；")[0]
						} else if (rss.indexOf("，") > -1) {
							rss = rss.split("，")[0]
						}
						items.push(results.getPoi(i).title + "," + rss);
					}
					self.vue.items = items;
					items = items.join("@")
					setTimeout(function() {
						self.openr.evalJS("mapPage.vue.loadItems('" + items + "')")
					}, 0)
				}
			}
		};
		var local = new BMap.LocalSearch(map, options);
		local.searchNearby("小区", mPoint, 1000);
	},
	vueObj: {
		el: '#mapPage',
		data: {
			items: [],
			address: "",
			searchtext: ""
		},
		methods: {
			searchItem: function() {
				var val = this.searchtext;
				var self = mapPage;
				if (!val) {
					E.alert("请输入查询地址")
					return
				}
				self.geoc.getPoint(val, function(point) {
					if (point) {
						self.map.centerAndZoom(point, 16);
						self.map.addOverlay(new BMap.Marker(point));
						self.getMap(point)
						val = ""
					} else {
						alert("您选择地址没有解析到结果!");
					}
				}, "北京市");
			},
		}
	}
}
mapPage.init()