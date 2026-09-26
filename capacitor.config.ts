import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pasos.familia',
  appName: 'Pasos',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#233d33',
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#416850',
      sound: 'beep.wav',
    },
  },
};

export default config;
