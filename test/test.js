const fs = require('fs');
const test = require('ava');
const LebabFactory = require('../src/lebab-factory');

test('should throw if provided no input and output are provided', t => {
	t.throws(() => new LebabFactory(), Error);
});

test('should throw if replace and output are specified', t => {
	t.throws(() => new LebabFactory('mock', 'mock', 'arrow', {replace: true}), Error);
});

test('should throw if no transform', t => {
	t.throws(() => new LebabFactory('mock', 'mock'), Error);
});

test('should not throw if all input is valid', t => {
	t.notThrows(() => new LebabFactory('mock', 'mock', 'arrow,let'));
});

test('should create output if no replace', t => {
	let factory = new LebabFactory('./test/input', './test/output', 'let,arrow');
	factory.run();
	let files = fs.readdirSync('./test/output');
	t.is(files.length, 2);
});

test('should change file content if replace', t => {
	let factory = new LebabFactory('./test/output/a.js', undefined, 'class', {replace: true});
	factory.run();
	let content = fs.readFileSync('./test/output/a.js');
	t.truthy(content.includes('class'));
});
