/**
 * Performance monitoring utilities
 */

const isDev = import.meta.env.MODE === 'development'

/**
 * Measure the execution time of an async function
 * @param {string} label - Label for the measurement
 * @param {Function} fn - Async function to measure
 * @returns {Promise} - Result of the function
 */
export async function measureAsync(label, fn) {
  if (!isDev) return fn()

  const start = performance.now()
  try {
    const result = await fn()
    const end = performance.now()
    console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`)
    return result
  } catch (error) {
    const end = performance.now()
    console.error(`⏱️ ${label} (error): ${(end - start).toFixed(2)}ms`)
    throw error
  }
}

/**
 * Measure render time of a component
 * @param {string} componentName - Name of the component
 * @param {number} startTime - Start time from performance.now()
 */
export function measureRender(componentName, startTime) {
  if (!isDev) return

  const endTime = performance.now()
  const renderTime = endTime - startTime

  if (renderTime > 16.67) { // Slower than 60fps
    console.warn(`🐌 Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`)
  }
}

/**
 * Log Web Vitals (for production monitoring)
 */
export function reportWebVitals(metric) {
  if (isDev) {
    console.log(metric)
  }

  // In production, send to analytics service
  // Example: sendToAnalytics(metric)
}

/**
 * Debounce function to limit execution rate
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function to limit execution rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function} - Throttled function
 */
export function throttle(func, limit = 300) {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
