/**
 * ProxMate is created and © by David Mohl.
 * It's pretty cool that you're interested in how this extension works but please don't steal what you'll find here.
 *
 * Interested in helping ProxMate and/or licensing? Contact me at proxmate@dave.cx
 */

/*jslint browser: true*/
/*global checkStatus, $, loadBanner, proxifyUri*/

var global = checkStatus("global");
var hulu = checkStatus("st_hulu.com");
var cproxy = checkStatus("status_cproxy");

$.when(global, hulu, cproxy).done(function () {
	"use strict";
	if (!global.response.enabled || !hulu.response.enabled || !cproxy.response.enabled) {
		return;
	}
	$(document).ready(function () {
		loadBanner();
	});
});