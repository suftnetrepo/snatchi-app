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
import { getJWT } from '../src/store/secure';

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
        status === BackgroundGeolocation.AuthorizationStatus.Always
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
      p => !projects.some(np => (np.scheduleId || np.id) === (p.scheduleId || p.id)),
    );

    const updated = [...filtered, ...projects];
    await store(PROJECT_KEY, updated);
  }

  public async saveProjects(projects: ProjectGeofence[]) {
    await store(PROJECT_KEY, projects);
  }

  async handleState() {
    const state = await BackgroundGeolocation.getState();
    if (state.enabled) return true;

    const provider = await BackgroundGeolocation.getProviderState();
    return (
      provider.status === BackgroundGeolocation.AuthorizationStatus.Always ||
      provider.status === BackgroundGeolocation.AuthorizationStatus.WhenInUse
    );
  }

  async handleClearSchedules() {
    const geofences = await BackgroundGeolocation.getGeofences();
    await this.clearSchedules(geofences);
    const remaining = await BackgroundGeolocation.getGeofences();
    const state = await BackgroundGeolocation.getState();
    if (remaining.length === 0 && state.enabled) {
      await BackgroundGeolocation.stop();
    }
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

        const extras = (event.extras || {}) as Partial<ProjectGeofence>;
        const geofenceEvent: GeofenceEvent = {
          ...extras,
          id: identifier,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          transition,
          timestamp: new Date(location.timestamp || Date.now()).toISOString(),
        };
        this.eventListeners.forEach(listener => listener(geofenceEvent));

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
      const token = await getJWT();
      const config: Config = {
        geolocation: {
          desiredAccuracy: BackgroundGeolocation.DesiredAccuracy.High,
          distanceFilter: 50,
          stopTimeout: 5,
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
          headers: {
            'x-app-route': 'mobile',
            ...(token ? {'x-access-token': `Bearer ${token}`} : {}),
          },
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

      await BackgroundGeolocation.ready(config);
      await BackgroundGeolocation.setConfig({
        http: {
          headers: {
            'x-app-route': 'mobile',
            ...(token ? {'x-access-token': `Bearer ${token}`} : {}),
          },
        },
      });
      await this.handleClearSchedules();
      this.setupEventListeners();
      this.state = {...this.state, isInitialized: true, error: null};
      return true;
    } catch (err) {
      if (__DEV__) console.error('Init failed:', err);
      this.state = {...this.state, isInitialized: false, error: String(err)};
      return false;
    }
  }

  async startBooking(schedule: any): Promise<boolean> {
    try {
      const scheduleId = schedule?._id || schedule?.id;
      const project = schedule?.project;
      const coordinates = project?.location?.coordinates;
      const latitude = Number(project?.latitude ?? coordinates?.[1]);
      const longitude = Number(project?.longitude ?? coordinates?.[0]);

      if (!scheduleId || !project?._id || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error('This booking does not have a valid job-site location.');
      }

      const initialized = await this.initialize(false);
      if (!initialized) return false;

      const endDate = new Date(schedule.endDate || schedule.startDate);
      const [endHour = 23, endMinute = 59] = String(schedule.endTime || '23:59').split(':').map(Number);
      endDate.setHours(endHour, endMinute, 0, 0);
      const remainingMinutes = Math.max(1, Math.ceil((endDate.getTime() - Date.now()) / 60000));
      await BackgroundGeolocation.setConfig({
        geolocation: {stopAfterElapsedMinutes: Math.min(remainingMinutes, 24 * 60)},
      });

      await this.addProjects([{
        scheduleId: String(scheduleId),
        projectId: String(project._id),
        integratorId: String(schedule.integrator?._id || schedule.integrator || project.integrator?._id || project.integrator),
        id: String(scheduleId),
        siteName: project.name || schedule.title || 'Job site',
        latitude,
        longitude,
        radius: Number(schedule.radius) || 200,
        startDate: schedule.startDate,
        endDate: schedule.endDate,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        userId: String(schedule.engineer?._id || schedule.engineer || ''),
        firstName: schedule.engineer?.first_name || '',
        lastName: schedule.engineer?.last_name || '',
        completeAddress: project.completeAddress || '',
        status: 'InProgress',
        priority: project.priority,
        description: project.description || schedule.description,
        action: true,
      }]);
      await BackgroundGeolocation.startGeofences();
      return true;
    } catch (error) {
      if (__DEV__) console.error('Failed to start booking geofence:', error);
      return false;
    }
  }

  async addProjects(projects: ProjectGeofence[]) {

    for (const p of projects) {
      const geofenceId = `${p.scheduleId || p.id}`;

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

    this.storage(projects).catch((error) => {
      console.log(error)
    })
  }

  async clearAllProjects() {
    await BackgroundGeolocation.removeGeofences();
    await BackgroundGeolocation.stopSchedule();
    await BackgroundGeolocation.stop();
    await BackgroundGeolocation.destroyLocations();
    await this.saveProjects([]);
  }

  async stopBooking(scheduleId: string) {
    try {
      await BackgroundGeolocation.removeGeofence(String(scheduleId));
      const remaining = (await this.loadProjects()).filter(
        project => String(project.scheduleId || project.id) !== String(scheduleId),
      );
      await this.saveProjects(remaining);
      await BackgroundGeolocation.sync().catch(() => {});
      const nativeGeofences = await BackgroundGeolocation.getGeofences();
      if (nativeGeofences.length === 0) {
        await BackgroundGeolocation.stop();
      }
      return true;
    } catch (error) {
      if (__DEV__) console.error('Failed to stop booking geofence:', error);
      return false;
    }
  }

   async removeProject(projectId: string) {
    const matches = (await this.loadProjects()).filter(
      project => String(project.projectId) === String(projectId),
    );
    await Promise.all(matches.map(project => this.stopBooking(project.scheduleId || project.id)));
  }

  addEventListener(listener: (event: GeofenceEvent) => void) {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  private async clearSchedules(schedules: RNBGGeofence[]) {
    const now = new Date();

    for (const schedule of schedules) {
      const isBookingFence = Boolean(schedule.extras?.scheduleId);
      const isActiveBooking = schedule.extras?.status === 'InProgress';
      if (!isBookingFence || !isActiveBooking) {
        await BackgroundGeolocation.removeGeofence(schedule.identifier);
        continue;
      }
      if (schedule.extras?.endDate) {
        const endDate = new Date(schedule.extras.endDate as string | number);
        const [hours = 23, minutes = 59] = String(schedule.extras.endTime || '23:59').split(':').map(Number);
        endDate.setHours(hours, minutes, 0, 0);

        if (endDate < now) {
          await BackgroundGeolocation.removeGeofence(schedule.identifier);
        }
      }
    }

    const stored = await this.loadProjects();
    await this.saveProjects(stored.filter(project => project.scheduleId && project.status === 'InProgress'));
  }
}

export const geofencingSingleton =
  GeofencingSingleton.getInstance();
