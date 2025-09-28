#!/usr/bin/env node
import retry from 'async-retry'
import { exec } from 'child_process'
;(async () => {
  process.stdout.write('🔴 Waiting for database service to accept connection!')

  return retry(async () => new Promise((resolve, reject) => runCommand(resolve, reject)), {
    retries: 100,
    maxTimeout: 1000,
  })

  function runCommand(resolve, reject) {
    exec('docker exec comments pg_isready --host localhost', async (_, stdout) => {
      if (stdout.search('accepting connections') === -1) {
        process.stdout.write(' .')
        return reject(new Error(`Database service unavailable to start the test battery.`))
      }
      console.log('\n🟢 Postgres is now available to accept connections!')
      return resolve()
    })
  }
})()
