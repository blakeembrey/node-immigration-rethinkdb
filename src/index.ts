import { PluginOptions, LockRetryError } from 'immigration'
import rethinkdb = require('rethinkdb')
import { resolve } from 'path'

const LOCK_ID = '__LOCK__'

export interface InitOptions extends PluginOptions {
  host?: string
  port?: number
  db?: string
  user?: string
  password?: string
  timeout?: number
  cert?: string | Buffer
  connectOptions?: {}
  table?: string
  config?: string
}

export function init (initOptions: InitOptions, dir: string) {
  const r: typeof rethinkdb = require('rethinkdb')
  const options = Object.assign({}, initOptions)
  let connection: Promise<rethinkdb.Connection>

  // Attempt to load a configuration file.
  if (options.config) {
    try {
      const path = resolve(dir, options.config)
      const config = require(path)

      if (config == null || config.connectOptions == null) {
        throw new TypeError('Expected `require("${path}").connectOptions` to contain the RethinkDB connect options')
      }

      options.connectOptions = config.connectOptions
    } catch (err) {
      err.message = `Unable to load configuration file.\n${err.message}`
    }
  }

  if (typeof options.table !== 'string') {
    throw new TypeError(`Expected "table" to exist in configuration options`)
  }

  /**
   * Prepare the RethinkDB connection.
   */
  function prepare () {
    if (!connection) {
      connection = Promise.resolve(r.connect(options.connectOptions || {
        host: options.host,
        port: options.port,
        db: options.db,
        user: options.user,
        password: options.password,
        timeout: options.timeout,
        ssl: options.cert ? {
          ca: options.cert
        } : undefined
      }))
        .then(async (connection) => {
          try {
            await r.tableCreate(options.table as string, { primaryKey: 'name' }).run(connection)
          } catch (err) {
            // Handle conflicts with already created tables.
            if (err.name === 'ReqlOpFailedError' && /already exists\.$/.test(err.msg)) {
              return connection
            }

            throw err
          }

          return connection
        })
    }

    return connection
  }

  /**
   * Acquire a lock using a hard-coded atom document insert check.
   */
  async function lock () {
    const connection = await prepare()
    const result = await r.table(options.table as string).insert({ name: LOCK_ID, date: r.now() }).run(connection)

    // Check for a conflicting lock.
    if (result.errors > 0 && /^Duplicate primary key `name`/.test(result.first_error)) {
      throw new LockRetryError()
    }
  }

  /**
   * Remove the lock.
   */
  async function unlock () {
    const connection = await prepare()

    await r.table(options.table as string).get(LOCK_ID).delete().run(connection)
  }

  /**
   * Check for an existing lock.
   */
  async function isLocked () {
    const connection = await prepare()

    return await r.table(options.table as string).get(LOCK_ID).ne(null).run(connection)
  }

  /**
   * List the executed migrations.
   */
  async function executed () {
    const connection = await prepare()
    const migrations = await r.table(options.table as string).filter(r.row('name').ne(LOCK_ID)).run(connection)

    return await migrations.toArray()
  }

  /**
   * Log a migration.
   */
  async function log (name: string, status: string, date: Date) {
    const connection = await prepare()

    return await r.table(options.table as string)
      .insert({ name, status, date }, { conflict: 'replace' })
      .run(connection)
  }

  /**
   * Unlog a migration.
   */
  async function unlog (name: string) {
    const connection = await prepare()

    return await r.table(options.table as string).get(name).delete().run(connection)
  }

  return { lock, unlock, isLocked, executed, log, unlog }
}
