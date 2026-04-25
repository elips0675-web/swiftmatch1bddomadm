
/**
 * Утилиты для работы с Push-уведомлениями (PWA + Capacitor)
 */

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('Этот браузер не поддерживает уведомления');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export async function sendTestNotification(title: string, body: string) {
  if (Notification.permission === 'granted') {
    const registration = await navigator.serviceWorker.ready;
    registration.showNotification(title, {
      body,
      icon: '/icons/icon-192x192.png',
      ...({ vibrate: [200, 100, 200] } as any),
    });
  }
}
