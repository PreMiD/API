var parseURL = require('url').parse;

module.exports = (app) => {
	//* Remove unneeded slash
	app.use((req, res, next) => {
		let url = parseURL(req.url),
			pathname = url.pathname,
			search = url.search || '',
			hasSlash = pathname.charAt(pathname.length - 1) === '/';

		if (hasSlash && pathname !== '/') {
			pathname = pathname.slice(0, -1);
			res.redirect(301, pathname + search);
		} else {
			return next();
		}
	});
};
