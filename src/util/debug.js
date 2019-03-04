module.exports.info = (message) => {
	if (process.env.NODE_ENV != 'dev') return;
	var chalk = require('chalk');
	console.log(`[${chalk.hex('#596cae')('PreMiD-API')}] ${chalk.hex('#5050ff')(message)}`);
};

module.exports.success = (message) => {
	if (process.env.NODE_ENV != 'dev') return;
	var chalk = require('chalk');
	console.log(`[${chalk.hex('#596cae')('PreMiD-API')}] ${chalk.hex('#50ff50')(message)}`);
};

module.exports.error = (message) => {
	if (process.env.NODE_ENV != 'dev') return;
	var chalk = require('chalk');
	console.log(`[${chalk.hex('#596cae')('PreMiD-API')}] ${chalk.hex('#ff5050')(message)}`);
};
