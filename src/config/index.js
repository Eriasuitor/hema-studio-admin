const config = require('./config')
const configProd = require('./config_prod')
const configTest = require('./config_test')
const configAudit = require('./config_audit')
const configDev = require('./config_dev')
const configLocal = require('./config_local')
const merge = require('deepmerge')
const NodeEnv = {Prod: 'prod', Test: 'test', Dev: 'dev', Local: 'local', Audit: 'audit'}

const env = NodeEnv.Audit

const diffEnvAction = {
  [NodeEnv.Local]: configLocal,
  [NodeEnv.Test]: configTest,
  [NodeEnv.Development]: configDev,
  [NodeEnv.Production]: configProd,
  [NodeEnv.Audit]: configAudit
}

const usedConfig = diffEnvAction[env]
if (!usedConfig) throw new Error(`config file for env ${env} is not found`)

export default (
  /**
   * @return {config}
   */
  () => merge.all([config, usedConfig])
)()
