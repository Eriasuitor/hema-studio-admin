const config = require('./config')
const configProd = require('./config_prod')
const configTest = require('./config_test')
const configDev = require('./config_dev')
const configLocal = require('./config_local')
const merge = require('deepmerge')
const NodeEnv = {Prod: 'prod', Test: 'test', Dev: 'dev', Local: 'local'}

const env = NodeEnv.Local

const diffEnvAction = {
  [NodeEnv.Local]: configLocal,
  [NodeEnv.Test]: configTest,
  [NodeEnv.Development]: configDev,
  [NodeEnv.Production]: configProd
}

const usedConfig = diffEnvAction[env]
if (!usedConfig) throw new Error(`config file for env ${env} is not found`)

module.exports = (
  /**
   * @return {config}
   */
  () => merge.all([config, usedConfig])
)()
