self.port.on('init', function(data) {
	if(data.url != 'undefined') {
		$("#proxyServer").val(data.url);
	}
	
	if(data.port != 'undefined') {
		$("#proxyPort").val(data.port);
	}
	
	if(data.checked) {
		$("#checkboxProxy").attr('checked', 'checked');
	}
	else{
		$("#checkboxProxy").attr('checked', 'undefined');
	}
	
});

function toggleSettings() {
	if($("#checkboxProxy").attr('checked') == 'checked') {
			$('#ownProxyPrefs').hide();
		}
	else{
			$('#ownProxyPrefs').show();
		}
}


$(document).ready(function () {
	
	toggleSettings();
	
	$('#save-panel').click(function (event) {
		if($("#checkboxProxy").attr('checked') == 'checked') {
			self.port.emit('setUserProxy', {'userProxy': false});
		}
		else{
			var port = parseInt($("#proxyPort").val())
			if(isNaN(port)) {
				alert('Port Must be a Valid Number!');
				port = 0;
				return;
			}
			self.port.emit('setUserProxy', {'userProxy' : true, 'url' : $("#proxyServer").val(), 'port' : port});
		}	
	});
	
	$("#checkboxProxy").click(function (event) {
		toggleSettings();
    });

});