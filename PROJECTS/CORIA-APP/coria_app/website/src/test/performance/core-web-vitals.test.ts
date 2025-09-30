import { test, expect } from '@playwright/test'

test.describe('Core Web Vitals', () => {
  test('should meet Core Web Vitals thresholds on homepage', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
    
    // Measure Core Web Vitals
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals: Record<string, number> = {}
        
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          vitals.lcp = lastEntry.startTime
        }).observe({ entryTypes: ['largest-contentful-paint'] })
        
        // First Input Delay (FID) - simulated
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (entry.processingStart && entry.startTime) {
              vitals.fid = entry.processingStart - entry.startTime
            }
          })
        }).observe({ entryTypes: ['first-input'] })
        
        // Cumulative Layout Shift (CLS)
        let clsValue = 0
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          }
          vitals.cls = clsValue
        }).observe({ entryTypes: ['layout-shift'] })
        
        // First Contentful Paint (FCP)
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
          if (fcpEntry) {
            vitals.fcp = fcpEntry.startTime
          }
        }).observe({ entryTypes: ['paint'] })
        
        // Time to Interactive (TTI) - approximated
        const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navigationEntry) {
          vitals.tti = navigationEntry.domInteractive
          vitals.loadTime = navigationEntry.loadEventEnd - navigationEntry.navigationStart
        }
        
        // Wait a bit for all observers to collect data
        setTimeout(() => resolve(vitals), 3000)
      })
    })
    
    console.log('Core Web Vitals:', vitals)
    
    // Assert Core Web Vitals thresholds
    if (vitals.lcp) {
      expect(vitals.lcp).toBeLessThan(2500) // LCP should be < 2.5s (good)
    }
    
    if (vitals.fid) {
      expect(vitals.fid).toBeLessThan(100) // FID should be < 100ms (good)
    }
    
    if (vitals.cls !== undefined) {
      expect(vitals.cls).toBeLessThan(0.1) // CLS should be < 0.1 (good)
    }
    
    if (vitals.fcp) {
      expect(vitals.fcp).toBeLessThan(1800) // FCP should be < 1.8s (good)
    }
    
    if (vitals.tti) {
      expect(vitals.tti).toBeLessThan(3800) // TTI should be < 3.8s (good)
    }
    
    if (vitals.loadTime) {
      expect(vitals.loadTime).toBeLessThan(3000) // Total load time should be < 3s
    }
  })

  test('should have fast image loading', async ({ page }) => {
    await page.goto('/')
    
    // Measure image loading performance
    const imageMetrics = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'))
      const metrics = {
        totalImages: images.length,
        loadedImages: 0,
        failedImages: 0,
        averageLoadTime: 0,
        slowImages: [] as string[]
      }
      
      const loadTimes: number[] = []
      
      images.forEach((img, index) => {
        const startTime = performance.now()
        
        if (img.complete) {
          metrics.loadedImages++
          const loadTime = performance.now() - startTime
          loadTimes.push(loadTime)
        } else {
          img.onload = () => {
            metrics.loadedImages++
            const loadTime = performance.now() - startTime
            loadTimes.push(loadTime)
            
            if (loadTime > 1000) { // Images taking more than 1s
              metrics.slowImages.push(img.src)
            }
          }
          
          img.onerror = () => {
            metrics.failedImages++
          }
        }
      })
      
      if (loadTimes.length > 0) {
        metrics.averageLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length
      }
      
      return metrics
    })
    
    console.log('Image Loading Metrics:', imageMetrics)
    
    // Assert image performance
    expect(imageMetrics.failedImages).toBe(0) // No failed images
    expect(imageMetrics.averageLoadTime).toBeLessThan(500) // Average load time < 500ms
    expect(imageMetrics.slowImages.length).toBeLessThan(2) // Max 1 slow image allowed
  })

  test('should have efficient JavaScript execution', async ({ page }) => {
    await page.goto('/')
    
    // Measure JavaScript performance
    const jsMetrics = await page.evaluate(() => {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      
      const jsResources = resourceEntries.filter(entry => 
        entry.name.includes('.js') || entry.initiatorType === 'script'
      )
      
      const totalJSSize = jsResources.reduce((total, entry) => {
        return total + (entry.transferSize || 0)
      }, 0)
      
      const totalJSTime = jsResources.reduce((total, entry) => {
        return total + (entry.duration || 0)
      }, 0)
      
      return {
        totalJSFiles: jsResources.length,
        totalJSSize: totalJSSize,
        totalJSTime: totalJSTime,
        domContentLoaded: navigationEntry.domContentLoadedEventEnd - navigationEntry.navigationStart,
        domInteractive: navigationEntry.domInteractive - navigationEntry.navigationStart
      }
    })
    
    console.log('JavaScript Performance Metrics:', jsMetrics)
    
    // Assert JavaScript performance
    expect(jsMetrics.totalJSSize).toBeLessThan(1024 * 1024) // Total JS < 1MB
    expect(jsMetrics.totalJSTime).toBeLessThan(1000) // Total JS execution time < 1s
    expect(jsMetrics.domContentLoaded).toBeLessThan(2000) // DOMContentLoaded < 2s
    expect(jsMetrics.domInteractive).toBeLessThan(1500) // DOM Interactive < 1.5s
  })

  test('should have good mobile performance', async ({ page }) => {
    // Simulate mobile device
    await page.emulate({
      viewport: { width: 375, height: 667 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    })
    
    // Throttle network to simulate 3G
    const client = await page.context().newCDPSession(page)
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
      uploadThroughput: 750 * 1024 / 8, // 750 Kbps
      latency: 40 // 40ms latency
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const mobileMetrics = await page.evaluate(() => {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      return {
        loadTime: navigationEntry.loadEventEnd - navigationEntry.navigationStart,
        domContentLoaded: navigationEntry.domContentLoadedEventEnd - navigationEntry.navigationStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      }
    })
    
    console.log('Mobile Performance Metrics:', mobileMetrics)
    
    // Assert mobile performance (more lenient thresholds)
    expect(mobileMetrics.loadTime).toBeLessThan(5000) // Load time < 5s on mobile
    expect(mobileMetrics.domContentLoaded).toBeLessThan(3000) // DOMContentLoaded < 3s
    expect(mobileMetrics.firstContentfulPaint).toBeLessThan(2500) // FCP < 2.5s on mobile
  })
})