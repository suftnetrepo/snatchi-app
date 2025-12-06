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
  GeofenceEventBase,
} from '../src/types/types';
import {
  store,
  getStore,
  PROJECT_KEY,
} from '../src/utils/asyncStorage';
import { toModel } from '../src/utils/help';
import { zat } from '../src/utils/zap';
import { FENCE, VERBS } from '../config';
import { localNotificationService } from '../Notification/LocalNotificationService';
import { Vibration } from 'react-native';
import { getCurrentLocation } from './getReliableLocation';


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
  private currentlyInside = new Set<string>();

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

  private async saveProjects(projects: ProjectGeofence[]) {
    await store(PROJECT_KEY, projects);
  }

  private isWithinProjectWindow(project: ProjectGeofence): boolean {
    const now = new Date();

    const today = now.toISOString().split('T')[0];
    const startDay = project.startDate.split('T')[0];
    const endDay = project.endDate.split('T')[0];

    if (today < startDay || today > endDay) {
      return false;
    }

    const [sh, sm] = project.startTime.split(':').map(Number);
    const [eh, em] = project.endTime.split(':').map(Number);

    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;

    if (nowMinutes < startMinutes || nowMinutes > endMinutes) {
      return false;
    }

    const jsDay = now.getDay();
    const localDay = jsDay === 0 ? 7 : jsDay;

    if (project.activeDays?.length) {
      if (!project.activeDays.includes(localDay)) {
        return false;
      }
    }

    return true;
  }

  private async saveFenceEvent(event: GeofenceEvent) {
    try {
      const model = toModel(event);

      if (event.transition === 'ENTER' || event.transition === 'EXIT') {
        Vibration.vibrate(300);

        const title =
          event.transition === 'ENTER'
            ? 'Entered Geofence'
            : 'Exited Geofence';

        const message =
          event.transition === 'ENTER'
            ? `You entered ${model.siteName}`
            : `You exited ${model.siteName}`;

        localNotificationService.defaultChannel();
        localNotificationService.showNotification(
          Date.now() % 100000,
          title,
          message,
          { eventType: event.transition },
          { playSound: true },
        );
      }

      await this.handleSave(model);
    } catch (err) {
      if (__DEV__) console.error(`saveFenceEvent error:`, err);
    }
  }

  private async handleSave(body: any) {
    try {
      const { success } = await zat(FENCE.addOne, body, VERBS.POST);
      return success;
    } catch (error) {
      if (__DEV__) console.error('API SAVE ERROR:', error);
    }
  }

  async handleState() {
    const state = await BackgroundGeolocation.getState()
    return state.enabled
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

        const base: GeofenceEventBase = {
          id: identifier,
          transition,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: new Date().toISOString(),
        };

        const enriched = await this.enrichEvent(base);
        this.saveFenceEvent(enriched);
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

  private async enrichEvent(
    base: GeofenceEventBase,
  ): Promise<GeofenceEvent> {
    const projects = await this.loadProjects();
    const project = projects.find(p => p.projectId === base.id);
    return { ...base, ...(project ?? {}) };
  }

  async initialize(debug = true) {
    try {

      const schedule = await this.restoreProjects();

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
          locationAuthorizationRequest: 'Always',
          disableLocationAuthorizationAlert: false,
          locationAuthorizationAlert: {
            titleWhenNotEnabled: 'Location Required for Geofencing',
            message:
              'Location access is needed to detect geofence events.',
            cancelButton: 'Cancel',
            settingsButton: 'Settings',
          },
        },
        http: {
          autoSync: true,
        },
        app: {
          stopOnTerminate: false,
          startOnBoot: true,
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
          schedule,
          scheduleUseAlarmManager: true,
        },
        logger: {
          debug,
          logLevel: BackgroundGeolocation.LogLevel.Verbose,
        },
      };

      BackgroundGeolocation.ready(config)
        .then(async state => {
          this.setupEventListeners();

          await BackgroundGeolocation.setConfig({
            app: {
              schedule,
              scheduleUseAlarmManager: true,
            },
          });

          if (!state.enabled) {
            await BackgroundGeolocation.startGeofences();
          }

          await this.initialInsideCheck();
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
    const existing = await this.loadProjects();
    const filtered = existing.filter(
      p => !projects.some(np => np.projectId === p.projectId),
    );

    const updated = [...filtered, ...projects];
    await this.saveProjects(updated);
    const schedule = await this.restoreProjects();

    BackgroundGeolocation.setConfig({
      app: {
        schedule,
      },
    });
  }

  async removeProjects(ids: string[]) {
    const existing = await this.loadProjects();

    for (const id of ids) {
      const project = existing.find(p => p.projectId === id);
      if (project) {
        this.currentlyInside.delete(project.projectId);
      }
    }

    const updated = existing.filter(p => !ids.includes(p.projectId));
    await this.saveProjects(updated);
    await this.restoreProjects();
  }

  async clearAllProjects() {
    this.currentlyInside.clear();
    await this.saveProjects([]);
    await BackgroundGeolocation.removeGeofences();
    await BackgroundGeolocation.stopSchedule();
    await BackgroundGeolocation.stop();
  }

  async restoreProjects() {
    try {
      const projects = await this.loadProjects();

      const activeProjects = projects.filter(p =>
        this.isWithinProjectWindow(p),
      );

      if (activeProjects.length === 0) {
        await BackgroundGeolocation.removeGeofences();
        this.currentlyInside.clear();
        return [];
      }

      const existing = await BackgroundGeolocation.getGeofences();
      const existingIds = new Set(existing.map(g => g.identifier));
      const activeIds = new Set(
        activeProjects.map(p => p.projectId),
      );

      for (const p of activeProjects) {
        if (!existingIds.has(p.projectId)) {
          await BackgroundGeolocation.addGeofence({
            identifier: p.projectId,
            latitude: p.latitude,
            longitude: p.longitude,
            radius: p.radius,
            notifyOnEntry: true,
            notifyOnExit: true,
            notifyOnDwell: false,
          });
        }
      }

      for (const g of existing) {
        if (!activeIds.has(g.identifier)) {
          await BackgroundGeolocation.removeGeofence(g.identifier);
          this.currentlyInside.delete(g.identifier);
        }
      }

      const schedule = activeProjects.map(p => {
        const days = p.activeDays?.length
          ? p.activeDays.join(',')
          : '1-7';
        return `${days} ${p.startTime}-${p.endTime} geofence`;
      });

      return schedule;
    } catch (err) {
      if (__DEV__) console.error('restoreProjects failed:', err);
      return [];
    }
  }

  private async initialInsideCheck() {
    try {
      const allProjects = await this.loadProjects();
      if (!allProjects.length) return;

      const projects = allProjects.filter(p =>
        this.isWithinProjectWindow(p),
      );
      if (!projects.length) return;

      const loc = await getCurrentLocation();

      const { latitude, longitude } = loc;

      for (const p of projects) {
        const id = p.projectId;

         const distance = this.getDistance(
          loc.latitude,
          loc.longitude,
          p.latitude,
          p.longitude,
        );

        if (distance <= p.radius) {
          if (this.currentlyInside.has(id)) {
            continue;
          }

          this.currentlyInside.add(id);

          const {
            id: _ignoreId,
            latitude: _ignoreLat,
            longitude: _ignoreLon,
            ...safeProject
          } = p;

          const evt: GeofenceEvent = {
            id,
            transition: 'ENTER',
              latitude: loc.latitude,
            longitude: loc.longitude,
            timestamp: new Date().toISOString(),
            ...safeProject,
          };

          this.eventListeners.forEach(cb => cb(evt));
        }
      }
    } catch (err) {
      if (__DEV__)
        console.error('initialInsideCheck failed:', err);
    }
  }

  private getDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  addEventListener(listener: (event: GeofenceEvent) => void) {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  async forceGeofenceCheck() {
    this.initialInsideCheck();
  }

  async triggerGeofenceRefresh() {
    await BackgroundGeolocation.getCurrentPosition({
      samples: 2,
      desiredAccuracy: 20,
      persist: true,
      timeout: 10000,
    });
    await this.initialInsideCheck();
  }

  getCurrentGeofenceStates() {
    return Array.from(this.currentlyInside);
  }
}

export const geofencingSingleton =
  GeofencingSingleton.getInstance();
