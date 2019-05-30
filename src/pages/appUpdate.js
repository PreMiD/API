async function get(req, res) {
	if (req.params.os == 'windows.exe') {
		if (req.params.bit == '32bit') res.download('./update_32bit.exe');
		else res.download('./update_64bit.exe');
		return;
	}
	if (req.params.os == 'macos.app') {
		res.download('./update.app');
		return;
	}

	res.setHeader('Content-Type', 'text/xml');
	if (req.params.bit == '32bit') res.send(await require('fs').readFileSync('./updateApp_32bit.xml'));
	else res.send(await require('fs').readFileSync('./updateApp_64bit.xml'));
}
module.exports = get;
