#!/usr/bin/env node

'use strict';

const path = require('path');
const fs = require('fs');
const lebab = require('lebab');
const meow = require('meow');
const chalk = require('chalk');
const glob = require('glob');
const mkdirp = require('mkdirp');

const cli = meow(`
    Usage
      $  lebab-dir <input> -o <output> -t transform

    Options
      --transorom, -t  Name a lebab transform to apply
      --output, -o The output directory
      --replace, -r Replaces the input once the transform is applied
			--verbose, -v Prompt lebab warnings

    Examples
      $ lebab-dir . --output code/es2015 --transform arrow
      $ lebab-dir code/es2015 --replace --transform let
`, {
	alias: {
		t: 'transform',
		r: 'replace',
		o: 'output'
	}
});

function transform(opts) {
	let outputPath = opts.output;
	console.log(chalk.cyan(`applying ${opts.transforms} to ${opts.input}`));
	const {code, warnings} = lebab.transform(fs.readFileSync(opts.input, 'utf8'), opts.transforms);
	if (warnings && opts.verbose) {
		warnings.forEach(warning => {
			console.log(chalk.yellow(`⚠︎ ${warning.msg} for transform ${warning.type} at line ${warning.line}`));
		});
	}
	let outputDirectory = path.dirname(outputPath);
	if (!fs.existsSync(outputDirectory)) {
		mkdirp.sync(outputDirectory);
	}
	fs.writeFileSync(outputPath, code, 'utf8');
}

function computeOutputFileName(input, output, inputDirectory) {
	let mainInputDirectory = path.basename(inputDirectory);
	let splittedInput = input.split(path.sep);
	let splittedOutput = output.split(path.sep);

	splittedInput = splittedInput.slice(splittedInput.findIndex(part => part === mainInputDirectory) + 1, splittedInput.length);
	let outputFilePath = splittedOutput.concat(splittedInput);
	return path.resolve(process.cwd(), outputFilePath.join(path.sep));
}

const inputs = cli.input[0];
const replace = cli.flags.replace;
const output = cli.flags.output;
const verbose = cli.flags.verbose;
let transforms = cli.flags.transform;

// replace option and output option are incompatible
if (replace && output) {
	console.log(chalk.red(`✖ replace and output options are not compatible`));
	process.exit(1);
}

if (!inputs) {
	console.log(chalk.red(`✖ input is needed`));
	process.exit(1);
}

if (!transforms) {
	console.log(chalk.red(`✖ transform is needed`));
	process.exit(1);
}
transforms = transforms.split(',');

const inputPath = path.resolve(process.cwd(), inputs);
const inputStats = fs.statSync(inputPath);
const outputPath = replace ? inputPath : path.resolve(process.cwd(), output);
const isDirectory = inputStats.isDirectory();
const isFile = inputStats.isFile();

if (!isFile && !isDirectory) {
	console.log(chalk.red(`✖ input is not valid file or directory`));
	process.exit(1);
}

if (isFile) {
	transform({
		input: inputPath,
		output: outputPath,
		transforms,
		verbose
	});
	console.log(chalk.green('✔︎︎ all done'));
} else {
	glob.sync(`${inputPath}/**/*.js`).forEach(file => {
		transform({
			input: file,
			output: computeOutputFileName(file, outputPath, inputPath),
			transforms,
			verbose
		});
	});
	console.log(chalk.green('✔︎︎ all done'));
}
