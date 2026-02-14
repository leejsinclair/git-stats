#!/usr/bin/env node

const https = require('https')
const { readFileSync, writeFileSync } = require('fs')

const DEFAULT_OUTPUT_PATH = './coverage/badge.svg'
const DEFAULT_REPORT_PATH = './coverage/coverage-summary.json'
const DEFAULT_LABEL = 'Coverage'

const getColour = coverage => {
  if (coverage < 80) {
    return 'red'
  }
  if (coverage < 90) {
    return 'yellow'
  }
  return 'brightgreen'
}

const parseArgs = args => {
  const options = {
    label: DEFAULT_LABEL,
    'output-path': DEFAULT_OUTPUT_PATH,
    'report-path': DEFAULT_REPORT_PATH,
    help: false,
  }

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg === '--help' || arg === '-h') {
      options.help = true
      continue
    }
    if (arg.startsWith('--')) {
      const key = arg.slice(2)
      const value = args[i + 1]
      if (typeof value !== 'undefined' && !value.startsWith('--')) {
        options[key] = value
        i += 1
      } else {
        options[key] = true
      }
    }
  }

  return options
}

const printUsage = () => {
  console.log(
    'usage: make-coverage-badge.js [-h,--help] [--label] [--report-path] [--output-path]'
  )
}

const download = (url, cb) => {
  https
    .get(url, res => {
      if (res.statusCode && res.statusCode >= 400) {
        cb(new Error(`Failed to download badge: ${res.statusCode}`))
        return
      }

      let file = ''
      res.on('data', chunk => (file += chunk))
      res.on('end', () => cb(null, file))
    })
    .on('error', err => cb(err))
}

const main = () => {
  const [, , ...args] = process.argv
  const options = parseArgs(args)

  if (options.help) {
    printUsage()
    return
  }

  const report = JSON.parse(readFileSync(options['report-path'], 'utf8'))
  if (!(report && report.total && report.total.statements)) {
    throw new Error('malformed coverage report')
  }

  const coverageValue = Number(report.total.statements.pct)
  const coverageText = Number.isFinite(coverageValue)
    ? coverageValue.toFixed(2)
    : String(report.total.statements.pct)
  const colour = getColour(coverageValue)
  const label = encodeURIComponent(options.label)
  const message = encodeURIComponent(`${coverageText}%`)
  const url = `https://img.shields.io/badge/${label}-${message}-${colour}.svg`

  download(url, (err, svg) => {
    if (err) throw err
    writeFileSync(options['output-path'], svg, 'utf8')
    console.log(`Wrote coverage badge to: ${options['output-path']}`)
  })
}

try {
  main()
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
