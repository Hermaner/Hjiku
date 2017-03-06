document.addEventListener( "plusready",  function()
{
    
    var _BARCODE = 'pluginprinter',
		B = window.plus.bridge;
    var pluginprinter =
    {
    	PluginPrinterFunction : function (Argus1, Argus2, Argus3, Argus4, successCallback, errorCallback )
		{
			var success = typeof successCallback !== 'function' ? null : function(args) 
			{
				successCallback(args);
			},
			fail = typeof errorCallback !== 'function' ? null : function(code) 
			{
				errorCallback(code);
			};
			callbackID = B.callbackId(success, fail);

			return B.exec(_BARCODE, "PluginPrinterFunction", [callbackID, Argus1, Argus2, Argus3, Argus4]);
		},
		PluginPrinterFunctionArrayArgu : function (Argus, successCallback, errorCallback )
		{
			var success = typeof successCallback !== 'function' ? null : function(args) 
			{
				successCallback(args);
			},
			fail = typeof errorCallback !== 'function' ? null : function(code) 
			{
				errorCallback(code);
			};
			callbackID = B.callbackId(success, fail);
			return B.exec(_BARCODE, "PluginPrinterFunctionArrayArgu", [callbackID, Argus]);
		},		
        PluginPrinterFunctionSync : function (Argus1, Argus2, Argus3, Argus4)
        {                                	
            return B.execSync(_BARCODE, "PluginPrinterFunctionSync", [Argus1, Argus2, Argus3, Argus4]);
        },
        PluginTestFunctionSyncArrayArgu : function (Argus) 
        {                                	
            return B.execSync(_BARCODE, "PluginPrinterFunctionSyncArrayArgu", [Argus]);
        }
    };
    window.plus.pluginprinter = pluginprinter;
}, true );