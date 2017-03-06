window.E = {
		//		apiUrl: 'http://sandbox.swapi.hongware.com/openApi/dyncHongware/mobile/',
		//		  apiUrl: 'http://sandbox.o2o.swapi.hongware.com/openApi/dyncHongware/mobile/',
		nick: "O2Omobile",
		apiUrl: 'http://o2oswapi.hongware.com/openApi/dyncHongware/mobile/',
		//		 apiUrl: 'http://192.168.50.215:8089/openApi/dyncHongware/mobile/',
		//		nick: "欧少辉", 
		//		apiUrl: 'http://192.168.50.216:8089/openApi/dyncHongware/mobile/',
		// apiUrl: 'http://192.168.51.103:8089/openApi/dyncHongware/mobile/',

	},
	function(a, b) {
		a.extend(b, {
			vue: function(e) {
				return new Vue(e)
			},
			fireData: function(page, evt, data) {
				a.fire(this.getWebview(page), evt || 'detailShow', data);
				this.openPreWindow(page)
			},
			openPreWindow: function(page) {
				a.openWindow({
					id: page,
					show: {
						aniShow: 'pop-in',
						duration: '250'
					},
					waiting: {
						autoShow: false
					},
				})
			},
			openWindow: function(e, d) {
				!d && (d = {})
				a.openWindow({
					id: e,
					url: e,
					show: {
						aniShow: 'pop-in',
						duration: '250'
					},
					waiting: {
						autoShow: true
					},
					extras: d
				})
			},
			closeWebview: function(c) {
				plus.webview.close(c);
			},
			delscroll: function() {
				plus.webview.currentWebview().setStyle({
					scrollIndicator: 'none',
				});
			}
		})
	}(mui, E),
	function(a, b) {
		a.extend(b, {
			alert: function(b, e, c, d) {
				a.alert(b, c || "提示", d, e)
			},
			prompt: function(b, c, d) {
				a.prompt(b, c, '', ['确定', '取消'], function(e) {
					if(e.index == 0) {
						d(e.value)
					}
				})
			},
			confirm: function(b, d) {
				a.confirm(b, "温馨提示", ["确认", "取消"], function(e) {
					if(e.index == 1) {

					} else {
						d()
					}
				})
			},
			toast: function(b) {
				a.toast(b)
			},
			showLoading: function(b) {
				plus.nativeUI.showWaiting(b || "")
			},
			closeLoading: function(b) {
				setTimeout(function() {
					plus.nativeUI.closeWaiting()
				}, 0)

			},
			getStorage: function(a) {
				return plus.storage.getItem(a);

			},
			setStorage: function(a, b) {
				plus.storage.setItem(a, b);
			},
			removeStorage: function(a) {
				plus.storage.removeItem(a);
			},
		})
	}(mui, E),
	function(a, b, p) {
		a.extend(b, {
			getWebview: function(e) {
				return plus.webview.getWebviewById(e)
			},
			hideWebview: function(e) {
				plus.webview.hide(e);
			},
			closeWebview: function(e) {
				plus.webview.close(e);
			},
			showWebview: function(e) {
				plus.webview.show(e);
			},

		})
	}(mui, E),
	function(a, b) {
		a.extend(b, {
			paramFn: function(e) {
				var param = {
					nick: b.nick,
					name: b.nick,
					format: 'json',
					timestamp: parseInt((new Date()).getTime() / 1000).toString(),
					method: e,
				}
				var sign = b.md5()(b.base64().encoder(param.nick) + b.base64().encoder(param.method) + b.base64().encoder(param.timestamp) + b.base64().encoder(param.name) + b.base64().encoder(param.format));
				param.sign = sign;
				return param;
			},
			systemParam: function(e) {
				var param = b.paramFn(e);
				param.orgCode = b.getStorage("orgCode");
				param.store = b.getStorage("store");
				param.op = b.getStorage("op");
				return param;
			},
			uniqueCode: function() {
				return b.md5()(b.base64().encoder(b.getStorage("op")) + b.base64().encoder(parseInt((new Date()).getTime() / 1000).toString()));
			},
			getData: function(obj, data, callback, type, error, timeout) {
				type = type ? type : "post";
				var url = b.apiUrl + obj;
				mui.ajax(url, {
					data: data,
					dataType: 'application/json',
					type: type,
					timeout: timeout || 10000,
					success: function(data) {
						data = JSON.parse(data)
						callback(data);
					},
					error: function(data) {
						b.alert("网络异常");
						b.closeLoading()
						error && error
					}
				});
			},
			showLayer: function(c) {
				var memCon = mui(".mem-con")[c];
				var memText = memCon.getElementsByClassName("mem-text")[0];
				var height = memText.offsetHeight + 80;
				memCon.style.marginTop = -(height / 2) + "px";
				memCon.style.left = "50%";
			},
			numBtn: function() {
				(function($) {

					var touchSupport = ('ontouchstart' in document);
					var tapEventName = touchSupport ? 'tap' : 'click';
					var changeEventName = 'change';
					var holderClassName = 'mui-numbox';
					var plusClassName = 'mui-numbox-btn-plus';
					var minusClassName = 'mui-numbox-btn-minus';
					var inputClassName = 'mui-numbox-input';

					var Numbox = $.Numbox = $.Class.extend({
						init: function(holder, options) {
							var self = this;
							if(!holder) {
								throw "构造 numbox 时缺少容器元素";
							}
							self.holder = holder;
							//避免重复初始化开始
							if(self.holder.__numbox_inited) return;
							self.holder.__numbox_inited = true;
							//避免重复初始化结束
							options = options || {};
							options.step = parseInt(options.step || 1);
							self.options = options;
							self.input = $.qsa('.' + inputClassName, self.holder)[0];
							self.plus = $.qsa('.' + plusClassName, self.holder)[0];
							self.minus = $.qsa('.' + minusClassName, self.holder)[0];
							self.checkValue();
							self.initEvent();
						},
						initEvent: function() {
							var self = this;
							self.plus.addEventListener(tapEventName, function(event) {
								var val = parseInt(self.input.value) + self.options.step;
								self.input.value = val.toString();
								$.trigger(self.input, changeEventName, null);
							});
							self.minus.addEventListener(tapEventName, function(event) {
								var val = parseInt(self.input.value) - self.options.step;
								self.input.value = val.toString();
								$.trigger(self.input, changeEventName, null);
							});
							self.input.addEventListener(changeEventName, function(event) {
								self.checkValue();
							});
						},
						checkValue: function() {
							var self = this;
							var val = self.input.value;
							if(val == null || val == '' || isNaN(val)) {
								self.input.value = self.options.min || 0;
								self.minus.disabled = self.options.min != null;
							} else {
								var val = parseInt(val);
								if(self.options.max != null && !isNaN(self.options.max) && val >= parseInt(self.options.max)) {
									val = self.options.max;
									self.plus.disabled = true;
								} else {
									self.plus.disabled = false;
								}
								if(self.options.min != null && !isNaN(self.options.min) && val <= parseInt(self.options.min)) {
									val = self.options.min;
									self.minus.disabled = true;
								} else {
									self.minus.disabled = false;
								}
								self.input.value = val;
							}
						}
					});

					$.fn.numbox = function(options) {
						//遍历选择的元素
						this.each(function(i, element) {
							if(options) {
								new Numbox(element, options);
							} else {
								var optionsText = element.getAttribute('data-numbox-options');
								var options = optionsText ? JSON.parse(optionsText) : {};
								options.step = element.getAttribute('data-numbox-step') || options.step;
								options.min = element.getAttribute('data-numbox-min') || options.min;
								options.max = element.getAttribute('data-numbox-max') || options.max;
								new Numbox(element, options);
							}
						});
						return this;
					}

					//自动处理 class='mui-locker' 的 dom
					$.ready(function() {
						$('.' + holderClassName).numbox();
					});
				}(mui))
			}

		})
	}(mui, E),
	function(a, b) {
		a.extend(b, {
			md5: function() {
				var hexcase = 0,
					b64pad = "",
					chrsz = 8;

				function hex_md5(s) {
					return binl2hex(core_md5(str2binl(s), s.length * chrsz));
				}

				function b64_md5(s) {
					return binl2b64(core_md5(str2binl(s), s.length * chrsz));
				}

				function str_md5(s) {
					return binl2str(core_md5(str2binl(s), s.length * chrsz));
				}

				function hex_hmac_md5(key, data) {
					return binl2hex(core_hmac_md5(key, data));
				}

				function b64_hmac_md5(key, data) {
					return binl2b64(core_hmac_md5(key, data));
				}

				function str_hmac_md5(key, data) {
					return binl2str(core_hmac_md5(key, data));
				}

				function md5_vm_test() {
					return hex_md5("abc") == "900150983cd24fb0d6963f7d28e17f72";
				}

				function core_md5(x, len) {
					x[len >> 5] |= 0x80 << ((len) % 32);
					x[(((len + 64) >>> 9) << 4) + 14] = len;

					var a = 1732584193;
					var b = -271733879;
					var c = -1732584194;
					var d = 271733878;

					for(var i = 0; i < x.length; i += 16) {
						var olda = a;
						var oldb = b;
						var oldc = c;
						var oldd = d;

						a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
						d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
						c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
						b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
						a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
						d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
						c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
						b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
						a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
						d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
						c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
						b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
						a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
						d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
						c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
						b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

						a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
						d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
						c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
						b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
						a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
						d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
						c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
						b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
						a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
						d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
						c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
						b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
						a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
						d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
						c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
						b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

						a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
						d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
						c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
						b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
						a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
						d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
						c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
						b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
						a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
						d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
						c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
						b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
						a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
						d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
						c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
						b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

						a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
						d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
						c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
						b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
						a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
						d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
						c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
						b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
						a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
						d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
						c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
						b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
						a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
						d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
						c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
						b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

						a = safe_add(a, olda);
						b = safe_add(b, oldb);
						c = safe_add(c, oldc);
						d = safe_add(d, oldd);
					}
					return Array(a, b, c, d);

				}

				function md5_cmn(q, a, b, x, s, t) {
					return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
				}

				function md5_ff(a, b, c, d, x, s, t) {
					return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
				}

				function md5_gg(a, b, c, d, x, s, t) {
					return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
				}

				function md5_hh(a, b, c, d, x, s, t) {
					return md5_cmn(b ^ c ^ d, a, b, x, s, t);
				}

				function md5_ii(a, b, c, d, x, s, t) {
					return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
				}

				function core_hmac_md5(key, data) {
					var bkey = str2binl(key);
					if(bkey.length > 16) bkey = core_md5(bkey, key.length * chrsz);

					var ipad = Array(16),
						opad = Array(16);
					for(var i = 0; i < 16; i++) {
						ipad[i] = bkey[i] ^ 0x36363636;
						opad[i] = bkey[i] ^ 0x5C5C5C5C;
					}

					var hash = core_md5(ipad.concat(str2binl(data)), 512 + data.length * chrsz);
					return core_md5(opad.concat(hash), 512 + 128);
				}

				function safe_add(x, y) {
					var lsw = (x & 0xFFFF) + (y & 0xFFFF);
					var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
					return(msw << 16) | (lsw & 0xFFFF);
				}

				function bit_rol(num, cnt) {
					return(num << cnt) | (num >>> (32 - cnt));
				}

				function str2binl(str) {
					var bin = Array();
					var mask = (1 << chrsz) - 1;
					for(var i = 0; i < str.length * chrsz; i += chrsz)
						bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (i % 32);
					return bin;
				}

				function binl2str(bin) {
					var str = "";
					var mask = (1 << chrsz) - 1;
					for(var i = 0; i < bin.length * 32; i += chrsz)
						str += String.fromCharCode((bin[i >> 5] >>> (i % 32)) & mask);
					return str;
				}

				function binl2hex(binarray) {
					var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
					var str = "";
					for(var i = 0; i < binarray.length * 4; i++) {
						str += hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) +
							hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xF);
					}
					return str;
				}

				function binl2b64(binarray) {
					var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
					var str = "";
					for(var i = 0; i < binarray.length * 4; i += 3) {
						var triplet = (((binarray[i >> 2] >> 8 * (i % 4)) & 0xFF) << 16) | (((binarray[i + 1 >> 2] >> 8 * ((i + 1) % 4)) & 0xFF) << 8) | ((binarray[i + 2 >> 2] >> 8 * ((i + 2) % 4)) & 0xFF);
						for(var j = 0; j < 4; j++) {
							if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
							else str += tab.charAt((triplet >> 6 * (3 - j)) & 0x3F);
						}
					}
					return str;
				}

				return hex_md5;
			},
			base64: function() {
				var BASE64_MAPPING = [
					'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
					'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
					'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
					'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
					'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
					'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
					'w', 'x', 'y', 'z', '0', '1', '2', '3',
					'4', '5', '6', '7', '8', '9', '+', '/'
				];

				/**
				 *ascii convert to binary
				 */
				var _toBinary = function(ascii) {
					var binary = new Array();
					while(ascii > 0) {
						var b = ascii % 2;
						ascii = Math.floor(ascii / 2);
						binary.push(b);
					}
					/*
					var len = binary.length;
					if(6-len > 0){
						for(var i = 6-len ; i > 0 ; --i){
							binary.push(0);
						}
					}*/
					binary.reverse();
					return binary;
				};

				/**
				 *binary convert to decimal
				 */
				var _toDecimal = function(binary) {
					var dec = 0;
					var p = 0;
					for(var i = binary.length - 1; i >= 0; --i) {
						var b = binary[i];
						if(b == 1) {
							dec += Math.pow(2, p);
						}
						++p;
					}
					return dec;
				};

				/**
				 *unicode convert to utf-8
				 */
				var _toUTF8Binary = function(c, binaryArray) {
					var mustLen = (8 - (c + 1)) + ((c - 1) * 6);
					var fatLen = binaryArray.length;
					var diff = mustLen - fatLen;
					while(--diff >= 0) {
						binaryArray.unshift(0);
					}
					var binary = [];
					var _c = c;
					while(--_c >= 0) {
						binary.push(1);
					}
					binary.push(0);
					var i = 0,
						len = 8 - (c + 1);
					for(; i < len; ++i) {
						binary.push(binaryArray[i]);
					}

					for(var j = 0; j < c - 1; ++j) {
						binary.push(1);
						binary.push(0);
						var sum = 6;
						while(--sum >= 0) {
							binary.push(binaryArray[i++]);
						}
					}
					return binary;
				};

				var __BASE64 = {
					/**
					 *BASE64 Encode
					 */
					encoder: function(str) {
						var base64_Index = [];
						var binaryArray = [];
						for(var i = 0, len = str.length; i < len; ++i) {
							var unicode = str.charCodeAt(i);
							var _tmpBinary = _toBinary(unicode);
							if(unicode < 0x80) {
								var _tmpdiff = 8 - _tmpBinary.length;
								while(--_tmpdiff >= 0) {
									_tmpBinary.unshift(0);
								}
								binaryArray = binaryArray.concat(_tmpBinary);
							} else if(unicode >= 0x80 && unicode <= 0x7FF) {
								binaryArray = binaryArray.concat(_toUTF8Binary(2, _tmpBinary));
							} else if(unicode >= 0x800 && unicode <= 0xFFFF) { //UTF-8 3byte
								binaryArray = binaryArray.concat(_toUTF8Binary(3, _tmpBinary));
							} else if(unicode >= 0x10000 && unicode <= 0x1FFFFF) { //UTF-8 4byte
								binaryArray = binaryArray.concat(_toUTF8Binary(4, _tmpBinary));
							} else if(unicode >= 0x200000 && unicode <= 0x3FFFFFF) { //UTF-8 5byte
								binaryArray = binaryArray.concat(_toUTF8Binary(5, _tmpBinary));
							} else if(unicode >= 4000000 && unicode <= 0x7FFFFFFF) { //UTF-8 6byte
								binaryArray = binaryArray.concat(_toUTF8Binary(6, _tmpBinary));
							}
						}

						var extra_Zero_Count = 0;
						for(var i = 0, len = binaryArray.length; i < len; i += 6) {
							var diff = (i + 6) - len;
							if(diff == 2) {
								extra_Zero_Count = 2;
							} else if(diff == 4) {
								extra_Zero_Count = 4;
							}
							//if(extra_Zero_Count > 0){
							//	len += extra_Zero_Count+1;
							//}
							var _tmpExtra_Zero_Count = extra_Zero_Count;
							while(--_tmpExtra_Zero_Count >= 0) {
								binaryArray.push(0);
							}
							base64_Index.push(_toDecimal(binaryArray.slice(i, i + 6)));
						}

						var base64 = '';
						for(var i = 0, len = base64_Index.length; i < len; ++i) {
							base64 += BASE64_MAPPING[base64_Index[i]];
						}

						for(var i = 0, len = extra_Zero_Count / 2; i < len; ++i) {
							base64 += '=';
						}
						return base64;
					},
					/**
					 *BASE64  Decode for UTF-8
					 */
					decoder: function(_base64Str) {
						var _len = _base64Str.length;
						var extra_Zero_Count = 0;
						/**
						 *计算在进行BASE64编码的时候，补了几个0
						 */
						if(_base64Str.charAt(_len - 1) == '=') {
							//alert(_base64Str.charAt(_len-1));
							//alert(_base64Str.charAt(_len-2));
							if(_base64Str.charAt(_len - 2) == '=') { //两个等号说明补了4个0
								extra_Zero_Count = 4;
								_base64Str = _base64Str.substring(0, _len - 2);
							} else { //一个等号说明补了2个0
								extra_Zero_Count = 2;
								_base64Str = _base64Str.substring(0, _len - 1);
							}
						}

						var binaryArray = [];
						for(var i = 0, len = _base64Str.length; i < len; ++i) {
							var c = _base64Str.charAt(i);
							for(var j = 0, size = BASE64_MAPPING.length; j < size; ++j) {
								if(c == BASE64_MAPPING[j]) {
									var _tmp = _toBinary(j);
									/*不足6位的补0*/
									var _tmpLen = _tmp.length;
									if(6 - _tmpLen > 0) {
										for(var k = 6 - _tmpLen; k > 0; --k) {
											_tmp.unshift(0);
										}
									}
									binaryArray = binaryArray.concat(_tmp);
									break;
								}
							}
						}

						if(extra_Zero_Count > 0) {
							binaryArray = binaryArray.slice(0, binaryArray.length - extra_Zero_Count);
						}

						var unicode = [];
						var unicodeBinary = [];
						for(var i = 0, len = binaryArray.length; i < len;) {
							if(binaryArray[i] == 0) {
								unicode = unicode.concat(_toDecimal(binaryArray.slice(i, i + 8)));
								i += 8;
							} else {
								var sum = 0;
								while(i < len) {
									if(binaryArray[i] == 1) {
										++sum;
									} else {
										break;
									}
									++i;
								}
								unicodeBinary = unicodeBinary.concat(binaryArray.slice(i + 1, i + 8 - sum));
								i += 8 - sum;
								while(sum > 1) {
									unicodeBinary = unicodeBinary.concat(binaryArray.slice(i + 2, i + 8));
									i += 8;
									--sum;
								}
								unicode = unicode.concat(_toDecimal(unicodeBinary));
								unicodeBinary = [];
							}
						}
						return unicode;
					}
				};

				return __BASE64;
			}
		})
	}(mui, E)

Date.prototype.Format = function(fmt) { //author: meizz
	var o = {
		"M+": this.getMonth() + 1, //月份
		"d+": this.getDate(), //日
		"h+": this.getHours(), //小时
		"m+": this.getMinutes(), //分
		"s+": this.getSeconds(), //秒
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度
		"S": this.getMilliseconds() //毫秒
	};
	if(/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for(var k in o)
		if(new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}