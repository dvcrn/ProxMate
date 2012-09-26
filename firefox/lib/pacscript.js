function FindProxyForURL(url, host) {
	var pma = url.indexOf('proxmate=active');
	var hulu = url.indexOf('hulu.com');
	if ( pma != -1 || host == 'www.pandora.com' || hulu != -1 || url.indexOf('play.google.com') != -1)
	{
		return 'PROXY proxy.personalitycores.com:8000';
	}
}