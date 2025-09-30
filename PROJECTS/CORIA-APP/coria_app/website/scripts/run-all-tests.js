#!/usr/bin/env node

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    log(`\n${colors.blue}Running: ${command} ${args.join(' ')}${colors.reset}`)
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    })
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve(code)
      } else {
        reject(new Error(`Command failed with exit code ${code}`))
      }
    })
    
    child.on('error', reject)
  })
}

async function runTests() {
  const startTime = Date.now()
  const results = {
    passed: [],
    failed: [],
    skipped: []
  }

  log(`${colors.bright}🧪 CORIA Website - Comprehensive Test Suite${colors.reset}`)
  log(`${colors.cyan}Starting test execution at ${new Date().toISOString()}${colors.reset}`)
  log('=' .repeat(60))

  const testSuites = [
    {
      name: 'Type Checking',
      command: 'npm',
      args: ['run', 'type-check'],
      required: true
    },
    {
      name: 'Linting',
      command: 'npm',
      args: ['run', 'lint'],
      required: true
    },
    {
      name: 'Unit Tests',
      command: 'npm',
      args: ['run', 'test'],
      required: true
    },
    {
      name: 'Unit Tests with Coverage',
      command: 'npm',
      args: ['run', 'test:coverage'],
      required: false
    },
    {
      name: 'Build Test',
      command: 'npm',
      args: ['run', 'build'],
      required: true
    },
    {
      name: 'Security Headers Check',
      command: 'npm',
      args: ['run', 'security:headers', 'http://localhost:3000'],
      required: false,
      needsServer: true
    },
    {
      name: 'End-to-End Tests',
      command: 'npm',
      args: ['run', 'test:e2e'],
      required: false,
      needsServer: true
    },
    {
      name: 'Accessibility Tests',
      command: 'npm',
      args: ['run', 'test:a11y'],
      required: false,
      needsServer: true
    },
    {
      name: 'Performance Tests',
      command: 'npm',
      args: ['run', 'lighthouse'],
      required: false,
      needsServer: true
    },
    {
      name: 'Load Tests',
      command: 'npm',
      args: ['run', 'load:test'],
      required: false,
      needsServer: true
    },
    {
      name: 'Security Audit',
      command: 'npm',
      args: ['run', 'security:audit'],
      required: false
    },
    {
      name: 'Bundle Size Check',
      command: 'npm',
      args: ['run', 'size-limit'],
      required: false
    }
  ]

  let serverProcess = null

  try {
    // Start development server for tests that need it
    const needsServer = testSuites.some(suite => suite.needsServer)
    if (needsServer) {
      log(`${colors.yellow}Starting development server...${colors.reset}`)
      serverProcess = spawn('npm', ['run', 'dev'], {
        stdio: 'pipe',
        shell: true
      })

      // Wait for server to be ready
      await new Promise((resolve) => {
        setTimeout(resolve, 10000) // Wait 10 seconds for server to start
      })
      
      log(`${colors.green}Development server started${colors.reset}`)
    }

    // Run each test suite
    for (const suite of testSuites) {
      try {
        log(`\n${colors.magenta}📋 Running ${suite.name}...${colors.reset}`)
        
        if (suite.needsServer && !serverProcess) {
          log(`${colors.yellow}⏭️  Skipping ${suite.name} (no server)${colors.reset}`)
          results.skipped.push(suite.name)
          continue
        }

        await runCommand(suite.command, suite.args)
        log(`${colors.green}✅ ${suite.name} passed${colors.reset}`)
        results.passed.push(suite.name)
        
      } catch (error) {
        log(`${colors.red}❌ ${suite.name} failed: ${error.message}${colors.reset}`)
        results.failed.push(suite.name)
        
        if (suite.required) {
          log(`${colors.red}🚨 Required test failed, stopping execution${colors.reset}`)
          break
        }
      }
    }

  } finally {
    // Clean up server
    if (serverProcess) {
      log(`${colors.yellow}Stopping development server...${colors.reset}`)
      serverProcess.kill('SIGTERM')
      
      // Force kill if it doesn't stop gracefully
      setTimeout(() => {
        if (!serverProcess.killed) {
          serverProcess.kill('SIGKILL')
        }
      }, 5000)
    }
  }

  // Generate report
  const endTime = Date.now()
  const duration = Math.round((endTime - startTime) / 1000)
  
  log('\n' + '=' .repeat(60))
  log(`${colors.bright}📊 Test Results Summary${colors.reset}`)
  log('=' .repeat(60))
  
  log(`${colors.green}✅ Passed: ${results.passed.length}${colors.reset}`)
  results.passed.forEach(test => log(`   - ${test}`))
  
  if (results.failed.length > 0) {
    log(`\n${colors.red}❌ Failed: ${results.failed.length}${colors.reset}`)
    results.failed.forEach(test => log(`   - ${test}`))
  }
  
  if (results.skipped.length > 0) {
    log(`\n${colors.yellow}⏭️  Skipped: ${results.skipped.length}${colors.reset}`)
    results.skipped.forEach(test => log(`   - ${test}`))
  }
  
  log(`\n${colors.cyan}⏱️  Total execution time: ${duration}s${colors.reset}`)
  
  // Generate JSON report
  const report = {
    timestamp: new Date().toISOString(),
    duration: duration,
    results: results,
    summary: {
      total: testSuites.length,
      passed: results.passed.length,
      failed: results.failed.length,
      skipped: results.skipped.length,
      success: results.failed.length === 0
    }
  }
  
  fs.writeFileSync(
    path.join(__dirname, '..', 'test-results', 'summary.json'),
    JSON.stringify(report, null, 2)
  )
  
  if (results.failed.length === 0) {
    log(`\n${colors.green}🎉 All tests completed successfully!${colors.reset}`)
    process.exit(0)
  } else {
    log(`\n${colors.red}🚨 Some tests failed. Please review and fix the issues.${colors.reset}`)
    process.exit(1)
  }
}

// Create test-results directory if it doesn't exist
const testResultsDir = path.join(__dirname, '..', 'test-results')
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true })
}

// Run tests
runTests().catch((error) => {
  log(`${colors.red}💥 Test runner failed: ${error.message}${colors.reset}`)
  process.exit(1)
})