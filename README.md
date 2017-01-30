## Synopsis

Cli wrapper around [lebab](https://lebab.io) to allow input and output to be a directory.
The `replace` option can still be used.

## Code Example

```
lebab-dir . --output code/es2015 --transform arrow,template
lebab-dir code/es2015 --replace --transform let
```

## Motivation

The lebab cli does not allow input and output to be directory for non replace mode. This could sometimes be quite handy.

## Installation

`npm install -g lebab-dir`

## Tests

`npm run test`


## License

MIT
