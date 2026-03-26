import { BACKEND_URL } from '../config/config';

class BackendWarmer {
  private warmInterval: NodeJS.Timeout | null = null;
  private isWarming = false;

  start() {
    // Warm immediately on start
    this.warmBackend();
    
    // Then warm every 10 minutes to prevent cold starts
    this.warmInterval = setInterval(() => {
      this.warmBackend();
    }, 10 * 60 * 1000); // 10 minutes
  }

  stop() {
    if (this.warmInterval) {
      clearInterval(this.warmInterval);
      this.warmInterval = null;
    }
  }

  private async warmBackend() {
    if (this.isWarming) return;
    
    this.isWarming = true;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
      
      await fetch(`${BACKEND_URL}/health/warm`, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      clearTimeout(timeoutId);
      console.log('✅ Backend warmed successfully');
    } catch (error) {
      console.warn('⚠️ Backend warming failed:', error);
    } finally {
      this.isWarming = false;
    }
  }

  async warmOnDemand(): Promise<boolean> {
    try {
      const response = await fetch(`${BACKEND_URL}/health/warm`, {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const backendWarmer = new BackendWarmer();

// Auto-start warming in browser environment
if (typeof window !== 'undefined') {
  backendWarmer.start();
}