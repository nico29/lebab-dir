'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const lebab = require('lebab');
const mkdirp = require('mkdirp');
const glob = require('glob');

class LebabFactory {
	constructor(input, output, transforms = [], opts) {
		this.input = input;
		this.output = output;
		this.transforms = transforms.split(',');
		this.verbose = opts.verbose;
		this.replace = opts.replace;

		this.validate();
	}

	validate() {
		if (this.replace && this.output) {
			const message = '✖ replace and output options are not compatible';
			console.log(chalk.red(message));
			throw new Error();
		}

		if (!this.input) {
			const message = '✖ input is needed';
			console.log(chalk.red(message));
			throw new Error(message);
		}

		if (this.transforms.length === 0) {
			const message = '✖ transform is needed';
			console.log(chalk.red(message));
			throw new Error(message);
		}
	}

	processFiles(input) {
		glob.sync(input).forEach(file => {
			const output = this.replace ? file : path.resolve(process.cwd(), this.output);
			this.transform(file, this.computeOutputFileName(file, output));
		});
	}

	run() {
		if (glob.hasMagic(this.input)) {
			this.processFiles(this.input);
		} else {
			const inputPath = path.resolve(process.cwd(), this.input);
			const inputStats = fs.statSync(inputPath);
			const outputPath = this.replace ? inputPath : path.resolve(process.cwd(), this.output);
			const isDirectory = inputStats.isDirectory();
			const isFile = inputStats.isFile();

			if (isFile) {
				this.transform(inputPath, outputPath);
			} else if (isDirectory) {
				// if a directory is provided assume all javascript files
				// are to go through lebab
				this.processFiles(`${inputPath}/**/*.js`);
			}
		}
		console.log(chalk.green('✔︎︎ all done'));
	}

	transform(input, output) {
		console.log(chalk.cyan(`applying ${this.transforms} to ${input}`));
		const {code, warnings} = lebab.transform(fs.readFileSync(input, 'utf8'), this.transforms);
		if (warnings && this.verbose) {
			warnings.forEach(warning => {
				console.log(chalk.yellow(`⚠︎ ${warning.msg} for transform ${warning.type} at line ${warning.line}`));
			});
		}
		let outputDirectory = path.dirname(output);
		if (!fs.existsSync(outputDirectory)) {
			mkdirp.sync(outputDirectory);
		}
		fs.writeFileSync(output, code, 'utf8');
	}

	computeOutputFileName(input, output) {
		let splittedInput = input.split(path.sep);
		let inputBaseDir = this.input.split(path.sep).pop();
		let splitIndex = splittedInput.findIndex(part => part === inputBaseDir);
		return output.split(path.sep).concat(splittedInput.slice(splitIndex + 1, splittedInput.length)).join(path.sep);
	}
}

module.exports = LebabFactory;
