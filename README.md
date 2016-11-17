# Immigration RethinkDB

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

> RethinkDB adapter for immigration.

## Installation

```
npm install immigration-rethinkdb --save
```

## Usage

```sh
immigration --use [ immigration-rethinkdb --table Migration ] up --new
```

### Options

* `host` _(string)_ The host to connect to
* `port` _(number)_ The port to connect on
* `db` _(string)_ The default database
* `user` _(string)_ The user account to connect as
* `password` _(string)_ The password for the user account to connect as
* `timeout` _(number)_ Timeout period in seconds for the connection to be opened
* `cert` _(string)_ An SSL CA certificate to use
* `connectOptions` _(Object)_ The exact RethinkDB connect options (overrides other options)
* `table` _(string)_ The table name for migrations to be persisted (created automatically)
* `config` _(string)_ An option path to resolve `connectOptions` from (E.g. `require(...).connectOptions`)

## License

MIT

[npm-image]: https://img.shields.io/npm/v/immigration-rethinkdb.svg?style=flat
[npm-url]: https://npmjs.org/package/immigration-rethinkdb
[downloads-image]: https://img.shields.io/npm/dm/immigration-rethinkdb.svg?style=flat
[downloads-url]: https://npmjs.org/package/immigration-rethinkdb
[travis-image]: https://img.shields.io/travis/blakeembrey/node-immigration-rethinkdb.svg?style=flat
[travis-url]: https://travis-ci.org/blakeembrey/node-immigration-rethinkdb
[coveralls-image]: https://img.shields.io/coveralls/blakeembrey/node-immigration-rethinkdb.svg?style=flat
[coveralls-url]: https://coveralls.io/r/blakeembrey/node-immigration-rethinkdb?branch=master
