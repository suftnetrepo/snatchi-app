import BackgroundGeolocation, {
  Geofence as RNBGGeofence,
  GeofenceEvent as RNBGGeofenceEvent,
  Subscription,
  Config,
} from 'react-native-background-geolocation';
import type {
  GeofenceEvent,
  GeofenceTransition,
  ProjectGeofence,
  GeofencingState,
} from '../src/types/types';
import {
  store,
  getStore,
  PROJECT_KEY,
} from '../src/utils/asyncStorage';
import { FENCE } from '../config';

class GeofencingSingleton {
  private static instance: GeofencingSingleton;

  private geofenceSubscription: Subscription | null = null;
  private locationSubscription: Subscription | null = null;
  private providerSubscription: Subscription | null = null;
  private motionSubscription: Subscription | null = null;

  private state: GeofencingState = {
    isInitialized: false,
    isLoading: false,
    error: null,
    geofences: [],
  };

  private eventListeners = new Set<(event: GeofenceEvent) => void>();
  private stateListeners = new Set<(state: GeofencingState) => void>();

  private constructor() { }

  static getInstance(): GeofencingSingleton {
    if (!GeofencingSingleton.instance) {
      GeofencingSingleton.instance = new GeofencingSingleton();
    }
    return GeofencingSingleton.instance;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const status = await BackgroundGeolocation.requestPermission();
      return (
        status === BackgroundGeolocation.AuthorizationStatus.Always ||
        status === BackgroundGeolocation.AuthorizationStatus.WhenInUse
      );
    } catch (error) {
      if (__DEV__) console.error('RequestPermissions failed:', error);
      return false;
    }
  }

  addStateListener(listener: (state: GeofencingState) => void): () => void {
    this.stateListeners.add(listener);
    listener(this.state);
    return () => this.stateListeners.delete(listener);
  }

  getState() {
    return { ...this.state };
  }

  private async loadProjects(): Promise<ProjectGeofence[]> {
    const stored = await getStore(PROJECT_KEY);
    if (!stored) return [];
    return stored;
  }

  public async storage(projects: ProjectGeofence[]) {
    const existing = await this.loadProjects();
    const filtered = existing.filter(
      p => !projects.some(np => np.projectId === p.projectId),
    );

    const updated = [...filtered, ...projects];
    await store(PROJECT_KEY, updated);
  }

  public async saveProjects(projects: ProjectGeofence[]) {
    await store(PROJECT_KEY, projects);
  }

  async handleState() {
    const state = await BackgroundGeolocation.getState()
    return state.enabled
  }

  async handleClearSchedules() {
    const geofences = await BackgroundGeolocation.getGeofences();
    this.clearSchedules(geofences)
  }

  private setupEventListeners() {
    this.geofenceSubscription?.remove();
    this.locationSubscription?.remove();
    this.providerSubscription?.remove();
    this.motionSubscription?.remove();

    this.geofenceSubscription = BackgroundGeolocation.onGeofence(
      async (event: RNBGGeofenceEvent) => {
        const { identifier, action, location } = event;

        let transition: GeofenceTransition = 'ENTER';
        if (action === 'EXIT') transition = 'EXIT';
        if (action === 'DWELL') transition = 'DWELL';

        if (action == "ENTER") {
          // Entering the danger-zone, we want to aggressively track location.
          await BackgroundGeolocation.startGeofences();
        } else if (action == "EXIT") {
          // Exiting the danger-zone, we resume geofences-only tracking.
          await BackgroundGeolocation.startGeofences();
        }
      },
    );

    this.locationSubscription = BackgroundGeolocation.onLocation(
      () => { },
      err => {
        if (__DEV__) console.error('Location error:', err);
      },
    );

    this.providerSubscription = BackgroundGeolocation.onProviderChange(
      () => { },
    );

    this.motionSubscription = BackgroundGeolocation.onMotionChange(() => { });
  }

  async initialize(debug = true) {
    try {


      const config: Config = {
        geolocation: {
          desiredAccuracy: BackgroundGeolocation.DesiredAccuracy.High,
          distanceFilter: 50,
          stopTimeout: 5,
          stopAfterElapsedMinutes: 120,
          showsBackgroundLocationIndicator: true,
          filter: {
            maxImpliedSpeed: 60,
            odometerAccuracyThreshold: 20,
            trackingAccuracyThreshold: 100,
          },
          geofenceProximityRadius: 1000,
          geofenceInitialTriggerEntry: true,
          geofenceModeHighAccuracy: true,
        },
        http: {
          url: FENCE.addOne,
          autoSync: true,
          batchSync: true,
          maxBatchSize: 10,
          method: "POST",
        },
        app: {
          stopOnTerminate: false,
          startOnBoot: true,
          preventSuspend: false,
          enableHeadless: true,
          backgroundPermissionRationale: {
            title: 'Allow background location for geofencing.',
            message:
              'Background location is required for geofence detection.',
            positiveAction: 'Change to option',
            negativeAction: 'Cancel',
          },
          notification: {
            title: 'Geofencing Active',
            text: 'Monitoring geofence regions',
            smallIcon: 'mipmap/ic_launcher',
          },
        },
        logger: {
          debug,
          logLevel: BackgroundGeolocation.LogLevel.Verbose,
        },
      };

      BackgroundGeolocation.ready(config)
        .then(async state => {
          this.handleClearSchedules().catch((error) => {
            if (__DEV__) console.error('Error clearing geofences:', error);
          }
          )
          this.setupEventListeners();

          if (!state.enabled) {
            await BackgroundGeolocation.startGeofences();
          }

          return true;
        })
        .catch(error => {
          if (__DEV__) console.error('Error starting geofences:', error);
        });

      return true
    } catch (err) {
      if (__DEV__) console.error('Init failed:', err);
      return false
    }
  }

  async addProjects(projects: ProjectGeofence[]) {

    for (const p of projects) {
      const geofenceId = `${p.projectId}_${p.userId}`;

      await BackgroundGeolocation.addGeofence({
        identifier: geofenceId,
        latitude: p.latitude,
        longitude: p.longitude,
        radius: p.radius,
        notifyOnEntry: true,
        notifyOnExit: true,
        notifyOnDwell: false,
        extras: {
          ...p
        }
      });
    }

    const schedule = projects.map(p => {
      const days = p.activeDays?.length
        ? p.activeDays.join(',')
        : '1-7';
      return `${days} ${p.startTime}-${p.endTime} geofence`;
    });

    BackgroundGeolocation.setConfig({
      app: {
        schedule,
        scheduleUseAlarmManager: true,
      },
    });

    this.storage(projects).catch((error) => {
      console.log(error)
    })
  }

  async clearAllProjects() {
    await BackgroundGeolocation.removeGeofences();
    await BackgroundGeolocation.stopSchedule();
    await BackgroundGeolocation.stop();
    await BackgroundGeolocation.destroyLocations()
  }

  addEventListener(listener: (event: GeofenceEvent) => void) {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  private async clearSchedules(schedules: RNBGGeofence[]) {
    const now = new Date();

    for (const schedule of schedules) {
      if (schedule.extras && schedule.extras.endDate) {
        const endDate = new Date(schedule.extras.endDate as string | number);

        if (endDate < now) {
          await BackgroundGeolocation.removeGeofence(schedule.identifier);
        }
      }
    }
  }
}

export const geofencingSingleton =
  GeofencingSingleton.getInstance();
