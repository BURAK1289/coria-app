const https = require('https')
const http = require('http')

const REQUIRED_HEADERS = {
  'x-frame-options': 'DENY',
  'x-content-type-options': 'nosniff',
  'x-xss-protection': '1; mode=block',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'strict-transport-security': 'max-age=31536000; includeSubDomains; preload',
  'content-security-policy': true, // Just check if present
  'permissions-policy': true, // Just check if present
}

const RECOMMENDED_HEADERS = {
  'x-dns-prefetch-control': 'on',
}

function checkHeaders(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http
    
    const req = client.request(url, { method: 'HEAD' }, (res) => {
      const headers = res.headers
      const results = {
        url,
        status: res.statusCode,
        missing: [],
        incorrect: [],
        present: [],
        warnings: []
      }

      // Check required headers
      for (const [headerName, expectedValue] of Object.entries(REQUIRED_HEADERS)) {
        const actualValue = headers[headerName]
        
        if (!actualValue) {
          results.missing.push(headerName)
        } else if (expectedValue === true) {
          results.present.push(headerName)
        } else if (actualValue !== expectedValue) {
          results.incorrect.push({
            header: headerName,
            expected: expectedValue,
            actual: actualValue
          })
        } else {
          results.present.push(headerName)
        }
      }

      // Check recommended headers
      for (const [headerName, expectedValue] of Object.entries(RECOMMENDED_HEADERS)) {
        const actualValue = headers[headerName]
        
        if (!actualValue) {
          results.warnings.push(`Recommended header missing: ${headerName}`)
        } else if (actualValue !== expectedValue) {
          results.warnings.push(`Recommended header value: ${headerName} (expected: ${expectedValue}, got: ${actualValue})`)
        }
      }

      resolve(results)
    })

    req.on('error', reject)
    req.setTimeout(10000, () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })
    
    req.end()
  })
}

async function main() {
  const url = process.argv[2] || 'http://localhost:3000'
  
  console.log(`🔍 Checking security headers for: ${url}`)
  console.log('=' .repeat(50))

  try {
    const results = await checkHeaders(url)
    
    console.log(`📊 Status: ${results.status}`)
    console.log()

    if (results.present.length > 0) {
      console.log('✅ Present headers:')
      results.present.forEach(header => {
        console.log(`   - ${header}`)
      })
      console.log()
    }

    if (results.missing.length > 0) {
      console.log('❌ Missing required headers:')
      results.missing.forEach(header => {
        console.log(`   - ${header}`)
      })
      console.log()
    }

    if (results.incorrect.length > 0) {
      console.log('⚠️  Incorrect header values:')
      results.incorrect.forEach(({ header, expected, actual }) => {
        console.log(`   - ${header}:`)
        console.log(`     Expected: ${expected}`)
        console.log(`     Actual:   ${actual}`)
      })
      console.log()
    }

    if (results.warnings.length > 0) {
      console.log('⚠️  Warnings:')
      results.warnings.forEach(warning => {
        console.log(`   - ${warning}`)
      })
      console.log()
    }

    const score = (results.present.length / Object.keys(REQUIRED_HEADERS).length) * 100
    console.log(`📈 Security Score: ${score.toFixed(1)}%`)
    
    if (results.missing.length === 0 && results.incorrect.length === 0) {
      console.log('🎉 All required security headers are properly configured!')
      process.exit(0)
    } else {
      console.log('🚨 Security headers need attention!')
      process.exit(1)
    }

  } catch (error) {
    console.error('❌ Error checking headers:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { checkHeaders }