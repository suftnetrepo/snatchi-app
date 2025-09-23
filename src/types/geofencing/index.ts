import BackgroundGeolocation, {
  Geofence as RNBGGeofence,
  GeofenceEvent as RNBGGeofenceEvent,
  Subscription,
} from 'react-native-background-geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  GeofenceEvent,
  GeofenceTransition,
  ProjectGeofence,
  GeofencingState,
} from './types';

const STORAGE_KEY = 'persisted_projects';

class GeofencingSingleton {
  private static instance: GeofencingSingleton;
  private geofenceSubscription: Subscription | null = null;

  private state: GeofencingState = {
    isInitialized: false,
    isLoading: false,
    error: null,
    geofences: [],
  };

  private eventListeners = new Set<(event: GeofenceEvent) => void>();
  private stateListeners = new Set<(state: GeofencingState) => void>();

  private constructor() {
    console.log('🚀 GeofencingSingleton created');
    this.setupGeofenceListener();
  }

  static getInstance(): GeofencingSingleton {
    if (!GeofencingSingleton.instance) {
      GeofencingSingleton.instance = new GeofencingSingleton();
    }
    return GeofencingSingleton.instance;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const status = await BackgroundGeolocation.requestPermission();
      console.log('📍 Permission status:', status);

      return (
        status === BackgroundGeolocation.AUTHORIZATION_STATUS_ALWAYS ||
        status === BackgroundGeolocation.AUTHORIZATION_STATUS_WHEN_IN_USE
      );
    } catch (error) {
      console.error('❌ RequestPermissions failed:', error);
      return false;
    }
  }


  // ───────────────────────────────
  // 🔹 State helpers
  // ───────────────────────────────
  private updateState(partial: Partial<GeofencingState>) {
    this.state = { ...this.state, ...partial };
    this.stateListeners.forEach((listener) => listener(this.state));
  }

  getState(): GeofencingState {
    return { ...this.state };
  }

  addStateListener(listener: (state: GeofencingState) => void): () => void {
    this.stateListeners.add(listener);
    listener(this.state); // immediately notify
    return () => {
      this.stateListeners.delete(listener); // ✅ ignore boolean return
    };
  }

  // ───────────────────────────────
  // 🔹 Storage helpers
  // ───────────────────────────────
  private async loadProjects(): Promise<ProjectGeofence[]> {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.warn('⚠️ Failed to parse stored projects', e);
      return [];
    }
  }

  private async saveProjects(projects: ProjectGeofence[]) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }

  // ───────────────────────────────
  // 🔹 Validation
  // ───────────────────────────────
  private isWithinProjectWindow(project: ProjectGeofence): boolean {
    const now = new Date();

    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    if (now < start || now > end) return false;

    // daily time window
    const [sh, sm] = project.startTime.split(':').map(Number);
    const [eh, em] = project.endTime.split(':').map(Number);
    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    if (nowMinutes < startMinutes || nowMinutes > endMinutes) return false;

    if (project.activeDays && project.activeDays.length > 0) {
      const today = now.getDay(); // 0 = Sunday, 6 = Saturday
      if (!project.activeDays.includes(today)) return false;
    }

    return true;
  }

  // ───────────────────────────────
  // 🔹 Lifecycle
  // ───────────────────────────────
  async initialize(): Promise<void> {
    if (this.state.isInitialized) return;
    this.updateState({ isLoading: true, error: null });

    try {
      const bgState = await BackgroundGeolocation.ready({
        desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
        distanceFilter: 50,
        stopOnTerminate: false,
        startOnBoot: true,
        geofenceProximityRadius: 1000,
        geofenceInitialTriggerEntry: true,
        debug: false,
        logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      });

      this.updateState({ isInitialized: true, isLoading: false });
      console.log('✅ RNBG ready', bgState);

      await this.restoreProjects();
    } catch (err) {
      this.updateState({ isInitialized: false, isLoading: false, error: String(err) });
      console.error('❌ RNBG init failed', err);
    }
  }

  private setupGeofenceListener() {
    if (this.geofenceSubscription) return;
    this.geofenceSubscription = BackgroundGeolocation.onGeofence(
      (geofence: RNBGGeofenceEvent) => {
        let transition: GeofenceTransition = 'ENTER';
        if (geofence.action === 'EXIT') transition = 'EXIT';
        if (geofence.action === 'DWELL') transition = 'DWELL';

        const event: GeofenceEvent = {
          id: geofence.identifier,
          transition,
          latitude: geofence.location.coords.latitude,
          longitude: geofence.location.coords.longitude,
          timestamp: new Date().toISOString(),
        };

        this.eventListeners.forEach((fn) => fn(event));
      }
    );
  }

  addEventListener(listener: (event: GeofenceEvent) => void): () => void {
    this.eventListeners.add(listener);
    return () => {
      this.eventListeners.delete(listener); // ✅ ignore boolean return
    };
  }

  // ───────────────────────────────
  // 🔹 Project management
  // ───────────────────────────────
  async addProjects(projects: ProjectGeofence[]) {
    const existing = await this.loadProjects();
    const updated = [
      ...existing.filter((p) => !projects.some((np) => np.projectId === p.projectId)),
      ...projects,
    ];
    await this.saveProjects(updated);
    await this.restoreProjects();
  }

  async removeProjects(ids: string[]) {
    const existing = await this.loadProjects();
    const updated = existing.filter((p) => !ids.includes(p.projectId));
    await this.saveProjects(updated);
    await this.restoreProjects();
  }

  async clearAllProjects() {
    await this.saveProjects([]);
    await BackgroundGeolocation.removeGeofences();
    await BackgroundGeolocation.stopSchedule();
    this.updateState({ geofences: [] });
  }

  async restoreProjects() {
    try {
      const projects = await this.loadProjects();
      const valid = projects.filter((p) => this.isWithinProjectWindow(p));

      const currentGeofences = await BackgroundGeolocation.getGeofences();
      const currentIds = new Set(currentGeofences.map(g => g.identifier));
      const validIds = new Set(valid.map(p => `${p.projectId}-${p.id}`));

      // Remove stale geofences
      for (const g of currentGeofences) {
        if (!validIds.has(g.identifier)) {
          await BackgroundGeolocation.removeGeofence(g.identifier);
        }
      }

      // Add missing geofences
      for (const project of valid) {
        const identifier = `${project.projectId}-${project.id}`;
        if (!currentIds.has(identifier)) {
          const fence: RNBGGeofence = {
            identifier,
            latitude: project.latitude,
            longitude: project.longitude,
            radius: project.radius,
            notifyOnEntry: true,
            notifyOnExit: true,
          };
          await BackgroundGeolocation.addGeofence(fence);
        }
      }

      if (valid.length > 0) {
        const schedule: string[] = valid.map((project) => {
          const days =
            project.activeDays && project.activeDays.length > 0
              ? project.activeDays.join(',')
              : '1-7';
          return `${days} ${project.startTime}-${project.endTime}`;
        });

        await BackgroundGeolocation.setConfig({ schedule });
        await BackgroundGeolocation.startSchedule();

        this.updateState({ geofences: valid });
        console.log(`✅ ${valid.length} active projects restored`, schedule);
      } else {
        await BackgroundGeolocation.stopSchedule();
        this.updateState({ geofences: [] });
        console.log('⏸️ No active projects — schedule stopped');
      }
    } catch (err) {
      this.updateState({ error: String(err) });
      console.error('❌ Failed to restore projects:', err);
    }
  }
}

export const geofencingSingleton = GeofencingSingleton.getInstance();
