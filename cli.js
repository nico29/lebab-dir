#!/usr/bin/env node

'use strict';

const meow = require('meow');
const LebabFactory = require('./src/lebab-factory.js');

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

const input = cli.input[0];
const output = cli.flags.output;
const transforms = cli.flags.transform;
const replace = cli.flags.replace;
const verbose = cli.flags.verbose;

new LebabFactory(input, output, transforms, {replace, verbose}).run();

