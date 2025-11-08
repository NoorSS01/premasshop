import { useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

export function usePerformanceMonitoring() {
  const reportMetrics = useCallback((metrics: Partial<PerformanceMetrics>) => {
    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      console.log('Performance metrics:', metrics);
      // Example: Send to analytics service
      // analytics.track('performance_metrics', metrics);
    } else {
      console.log('Performance metrics (dev):', metrics);
    }
  }, []);

  useEffect(() => {
    // Measure page load time
    const measurePageLoad = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
        reportMetrics({ pageLoadTime });
      }
    };

    // Measure Core Web Vitals
    const measureCoreWebVitals = () => {
      // First Contentful Paint
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
      if (fcpEntry) {
        reportMetrics({ firstContentfulPaint: fcpEntry.startTime });
      }

      // Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            reportMetrics({ largestContentfulPaint: lastEntry.startTime });
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

          // Cumulative Layout Shift
          const clsObserver = new PerformanceObserver((list) => {
            let clsValue = 0;
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
            reportMetrics({ cumulativeLayoutShift: clsValue });
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });

          // First Input Delay
          const fidObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              reportMetrics({ firstInputDelay: (entry as any).processingStart - entry.startTime });
            }
          });
          fidObserver.observe({ entryTypes: ['first-input'] });

          // Cleanup observers after 10 seconds
          setTimeout(() => {
            lcpObserver.disconnect();
            clsObserver.disconnect();
            fidObserver.disconnect();
          }, 10000);
        } catch (error) {
          console.warn('Performance monitoring not supported:', error);
        }
      }
    };

    // Wait for page to load before measuring
    if (document.readyState === 'complete') {
      measurePageLoad();
      measureCoreWebVitals();
    } else {
      window.addEventListener('load', () => {
        measurePageLoad();
        measureCoreWebVitals();
      });
    }
  }, [reportMetrics]);

  // Monitor resource loading times
  const monitorResourceTiming = useCallback(() => {
    const resources = performance.getEntriesByType('resource');
    const slowResources = resources.filter(resource => resource.duration > 1000);
    
    if (slowResources.length > 0) {
      console.warn('Slow loading resources detected:', slowResources);
      // In production, report to monitoring service
    }
  }, []);

  // Monitor memory usage (if available)
  const monitorMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      };

      // Warn if memory usage is high
      if (memoryUsage.percentage > 80) {
        console.warn('High memory usage detected:', memoryUsage);
      }

      return memoryUsage;
    }
    return null;
  }, []);

  return {
    monitorResourceTiming,
    monitorMemoryUsage,
    reportMetrics,
  };
}

// Hook for monitoring API performance
export function useAPIPerformanceMonitoring() {
  const measureAPICall = useCallback((url: string, startTime: number, endTime: number, success: boolean) => {
    const duration = endTime - startTime;
    const metrics = {
      url,
      duration,
      success,
      timestamp: new Date().toISOString(),
    };

    // Log slow API calls
    if (duration > 2000) {
      console.warn('Slow API call detected:', metrics);
    }

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // analytics.track('api_performance', metrics);
    }

    return metrics;
  }, []);

  return { measureAPICall };
}

// Hook for user interaction monitoring
export function useUserInteractionMonitoring() {
  useEffect(() => {
    let interactionCount = 0;
    let sessionStartTime = Date.now();

    const trackInteraction = (event: Event) => {
      interactionCount++;
      
      // Track engagement metrics
      if (interactionCount === 1) {
        const timeToFirstInteraction = Date.now() - sessionStartTime;
        console.log('Time to first interaction:', timeToFirstInteraction);
      }
    };

    // Track clicks, taps, and key presses
    document.addEventListener('click', trackInteraction);
    document.addEventListener('touchstart', trackInteraction);
    document.addEventListener('keydown', trackInteraction);

    // Track session duration
    const trackSessionEnd = () => {
      const sessionDuration = Date.now() - sessionStartTime;
      console.log('Session duration:', sessionDuration, 'Interactions:', interactionCount);
    };

    window.addEventListener('beforeunload', trackSessionEnd);

    return () => {
      document.removeEventListener('click', trackInteraction);
      document.removeEventListener('touchstart', trackInteraction);
      document.removeEventListener('keydown', trackInteraction);
      window.removeEventListener('beforeunload', trackSessionEnd);
    };
  }, []);
}
