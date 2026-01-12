export class PWAService {
  private static registration: ServiceWorkerRegistration | null = null;

  static async register(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        console.log('[PWA] Registering service worker...');
        this.registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('[PWA] Service worker registered successfully');

        // Handle updates
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration!.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, notify user
                this.showUpdateNotification();
              }
            });
          }
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', event => {
          console.log('[PWA] Message from service worker:', event.data);
        });

      } catch (error) {
        console.error('[PWA] Service worker registration failed:', error);
      }
    } else {
      console.log('[PWA] Service workers not supported');
    }
  }

  static async unregister(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
        console.log('[PWA] Service worker unregistered');
      } catch (error) {
        console.error('[PWA] Service worker unregistration failed:', error);
      }
    }
  }

  static async update(): Promise<void> {
    if (this.registration) {
      try {
        await this.registration.update();
        console.log('[PWA] Service worker updated');
      } catch (error) {
        console.error('[PWA] Service worker update failed:', error);
      }
    }
  }

  private static showUpdateNotification(): void {
    // Create a simple update notification
    const updateBanner = document.createElement('div');
    updateBanner.id = 'pwa-update-banner';
    updateBanner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #3b82f6;
      color: white;
      padding: 12px 16px;
      text-align: center;
      z-index: 1000;
      font-family: system-ui, -apple-system, sans-serif;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;
    updateBanner.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; max-width: 1200px; margin: 0 auto;">
        <span>A new version is available!</span>
        <div>
          <button id="update-btn" style="background: white; color: #3b82f6; border: none; padding: 6px 12px; border-radius: 4px; margin-right: 8px; cursor: pointer; font-weight: 500;">Update</button>
          <button id="dismiss-btn" style="background: transparent; color: white; border: 1px solid rgba(255,255,255,0.3); padding: 6px 12px; border-radius: 4px; cursor: pointer;">Later</button>
        </div>
      </div>
    `;

    document.body.appendChild(updateBanner);

    // Handle update button click
    document.getElementById('update-btn')?.addEventListener('click', () => {
      window.location.reload();
    });

    // Handle dismiss button click
    document.getElementById('dismiss-btn')?.addEventListener('click', () => {
      updateBanner.remove();
    });
  }

  static isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  static canInstall(): boolean {
    return 'beforeinstallprompt' in window;
  }

  static async install(): Promise<void> {
    if (this.canInstall()) {
      // Listen for the beforeinstallprompt event
      window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        // Store the event for later use
        (window as any).deferredPrompt = event;

        // Show install button or banner
        this.showInstallPrompt();
      });
    }
  }

  private static showInstallPrompt(): void {
    const installBanner = document.createElement('div');
    installBanner.id = 'pwa-install-banner';
    installBanner.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background: #1e293b;
      color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 1000;
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 400px;
      margin: 0 auto;
    `;
    installBanner.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="flex: 1;">
          <h3 style="margin: 0 0 4px 0; font-size: 16px;">Install Smart Animator</h3>
          <p style="margin: 0; font-size: 14px; opacity: 0.8;">Get the full app experience</p>
        </div>
        <div>
          <button id="install-btn" style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; margin-right: 8px; cursor: pointer; font-weight: 500;">Install</button>
          <button id="install-dismiss-btn" style="background: transparent; color: white; border: 1px solid rgba(255,255,255,0.3); padding: 8px 16px; border-radius: 6px; cursor: pointer;">Not now</button>
        </div>
      </div>
    `;

    document.body.appendChild(installBanner);

    // Handle install button click
    document.getElementById('install-btn')?.addEventListener('click', async () => {
      const promptEvent = (window as any).deferredPrompt;
      if (promptEvent) {
        promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        console.log('[PWA] Install outcome:', outcome);
        (window as any).deferredPrompt = null;
      }
      installBanner.remove();
    });

    // Handle dismiss button click
    document.getElementById('install-dismiss-btn')?.addEventListener('click', () => {
      installBanner.remove();
    });
  }
}