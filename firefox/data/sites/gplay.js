/**
 * ProxMate is created and © by David Mohl.
 * It's pretty cool that you're interested in how this extension works but please don't steal what you'll find here.
 *
 * Interested in helping ProxMate and/or licensing? Contact me at proxmate@dave.cx
 */

/*jslint browser: true*/
/*global checkStatus, $, loadBanner*/

var global = checkStatus("global");
var gplay = checkStatus("st_play.google.com");

$.when(global, gplay).done(function () {
	"use strict";
	if (!global.response.enabled || !gplay.response.enabled) {
		return;
	}
	$(document).ready(function () {
		loadBanner();
	});
});