'use strict';

const path = require('path');
const fs = require('fs');
const thunkify = require("thunkify");
const request = require('request');
const exec = require('child_process').exec;
const ora = require('ora');
const co = require('co');
const moment = require('moment');
const chalk = require('chalk');
const {userInfo, setPackage} = require('./reportInfo/index');
const {getRcFile, getRc, HOST_REGISTRY, HOST_REGISTRY_OUTSIDE,getPckParams, replaceErrMsg, getIPAdress, uploadReadme} = require('./utils');
const help = require('./help');

const IP_Req = thunkify(request);
const Exec = thunkify(exec);

module.exports = (registry) => {
	const argvs = process.argv;
	const ip = getIPAdress();
	const spinner = ora().start();
	spinner.color = 'green';
	co(function* () {
		if (argvs[2] == 'publish') {
			var ynpmConfig = getRc("ynpm");
			ynpmConfig.sshk = ynpmConfig._auth;
			var packOrigin = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json')));
			//validate user rolse
			let data = yield userInfo(packOrigin.name);
			let outside = false
			if(argvs.indexOf('-outside') > -1) {
				outside = true;
				argvs.splice(argvs.indexOf('-outside'), 1)
			} else if(argvs.indexOf('--outside') > -1) {
				outside = true;
				argvs.splice(argvs.indexOf('--outside'), 1)
			}
			if (!data) {
				help.setConfig();
				spinner.stop();
				process.exit(0);
			} else if (data === 'NO PERMISSION') {
				console.log('\n')
				console.log(chalk.red('[ERROR] NO PERMISSION!'))
				console.log(chalk.red('[ERROR] Please contact the package administrator!'))
				spinner.stop();
				process.exit(0);
			}

			if ((ynpmConfig.user || (ynpmConfig.ynpmUser && ynpmConfig.ynpmPassword)) && ynpmConfig.sshk && data) {
				console.log('Available: Pass Validation, Start to Publish...');
				let userconfig = getRcFile('ynpm');
				const arg_publish_inner = `npm --registry=${outside ? HOST_REGISTRY_OUTSIDE : HOST_REGISTRY} --userconfig=${userconfig} publish ` + argvs.slice(3).join(' ');
				spinner.text = 'Publishing your package in Yonyou Local Area Net';
				console.log(arg_publish_inner)
				try {
					let publish_result = yield Exec(arg_publish_inner);
					console.log(publish_result)
				} catch (e) {
					console.error(replaceErrMsg(e, HOST_REGISTRY))
					console.error(chalk.red('\n' + 'please check the package.json\'s version, if had try many time, \n please connect admin\'s email liushld@yonyou.com!'));
					spinner.stop();
					process.exit(0);
				}
				let params = getPckParams(packOrigin);
				let pckMsg = yield setPackage({
					ip,
					userId: data.user_id,
					name: params.name,
					author: ynpmConfig.user,
					version: params.version,
					last_auth: ynpmConfig.user,
					last_time: moment().format('YYYY-MM-DD HH:mm:ss'),
					packageInfo: escape(JSON.stringify(params))
				})
				try {
					let result = yield uploadReadme(params.name);
				} catch (e) {
					console.log('\n')
					console.log(chalk.yellow(`[WARN]publish success, but upload README.md file fail`));
				}
				console.log('\n')
				console.log(chalk.green(`√ Finish, Happy enjoy coding!`));
			} else {
				console.error("Error: Cant Find User, Please Use `npm set user=xxx && npm set email=xxx` or Contact Admin to Create User!");
			}
		}
		spinner.stop();
		process.exit(0);
	}).catch(err => {
		console.error(chalk.red('\n' + replaceErrMsg(err, HOST_REGISTRY)));
	});
}

