import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://24ce53ab870fa81fdbc08a42e2c33156@o1256799.ingest.us.sentry.io/4510436568465408',
  environment: __DEV__ ? 'development' : 'production',
  enableAutoSessionTracking: true,
  attachStacktrace: true,
  tracesSampleRate: __DEV__ ? 0 : 0.2,
  profilesSampleRate: __DEV__ ? 0 : 0.2,
  // Optional: keep noisy stuff out
  beforeSend(event, hint) {
    return event;
  },
});
