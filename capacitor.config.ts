
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a42f1c795b55424b8e725be625a8a058',
  appName: 'bhudi',
  webDir: 'dist',
  server: {
    url: 'https://a42f1c79-5b55-424b-8e72-5be625a8a058.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic'
  },
  android: {
    backgroundColor: "#000000"
  }
};

export default config;
