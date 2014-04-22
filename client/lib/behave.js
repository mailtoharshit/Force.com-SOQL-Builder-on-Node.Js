$.browser ={msie:false, version:9} // Fix needed for uniform.js - it crashes due to this removed attribute from new jquery version

/* Datatables shows alerts in case of invalid JSON - JSON cannot be fixed when references are null and its attributes are being accessed */
/* We override the alert - cannot use "throw" since that halts rendering */
__native_alert = window.alert;
window.alert = function(msg) {
	if(typeof(msg)=="string" && msg.toLowerCase().indexOf('requested unknown parameter')!=-1) {
		console.log(arguments);
		return;
	}
	return __native_alert.apply(this, arguments);
}