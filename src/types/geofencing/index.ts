import BackgroundGeolocation, {
  Geofence as RNBGGeofence,
  GeofenceEvent as RNBGGeofenceEvent,
  Subscription,
  Location,
  ProviderChangeEvent,
  MotionChangeEvent,
} from 'react-native-background-geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  GeofenceEvent,
  GeofenceTransition,
  ProjectGeofence,
  GeofencingState,
  GeofenceEventBase,
} from './types';

const STORAGE_KEY = 'persisted_projects';

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

  // Track which geofences user is currently inside to prevent duplicate events
  private currentlyInside = new Set<string>();

  private constructor() {
    console.log('🚀 GeofencingSingleton created');
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
      this.stateListeners.delete(listener);
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
  // 🔹 Distance calculation
  // ───────────────────────────────
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
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
  // 🔹 Manual geofence checking
  // ───────────────────────────────
  private async enrichEvent(
    base: GeofenceEventBase
  ): Promise<GeofenceEvent> {
    const projects = await this.loadProjects();
    const project = projects.find(
      (p) => `${p.projectId}-${p.id}` === base.id
    );
    return {
      ...base,
      ...(project ?? {}),
    };
  }

  private async checkExistingGeofences(projects: ProjectGeofence[]) {
    try {
      console.log('🎯 Checking if already inside any geofences...');

      const location = await BackgroundGeolocation.getCurrentPosition({
        samples: 1,
        persist: false,
        desiredAccuracy: 20,
        timeout: 10000,
      });

      const { latitude, longitude } = location.coords;
      console.log(`📍 Current position: ${latitude}, ${longitude}`);

      for (const project of projects) {
        const identifier = `${project.projectId}-${project.id}`;

        // Skip if not within project window
        if (!this.isWithinProjectWindow(project)) {
          console.log(`⏰ Project ${project.siteName} not in active window`);
          continue;
        }

        const distance = this.calculateDistance(
          latitude,
          longitude,
          project.latitude,
          project.longitude
        );

        console.log(`📏 Distance to ${project.siteName}: ${distance.toFixed(0)}m (radius: ${project.radius}m)`);

        if (distance <= project.radius) {
          // Check if we're not already tracking this as "inside"
          if (!this.currentlyInside.has(identifier)) {
            this.currentlyInside.add(identifier);

            // Manually trigger entry event
            const event: GeofenceEventBase = {
              id: identifier,
              transition: 'ENTER',
              latitude,
              longitude,
              timestamp: new Date().toISOString(),
            };

            console.log('🎯 Manual geofence ENTER triggered:', event);
            this.eventListeners.forEach((fn) => fn(event));
          }
        } else {
          // If we were previously inside but now outside, trigger exit
          if (this.currentlyInside.has(identifier)) {
            this.currentlyInside.delete(identifier);

            const event: GeofenceEventBase = {
              id: identifier,
              transition: 'EXIT',
              latitude,
              longitude,
              timestamp: new Date().toISOString(),
            };

            console.log('🎯 Manual geofence EXIT triggered:', event);
            this.eventListeners.forEach((fn) => fn(event));
          }
        }
      }
    } catch (error) {
      console.error('❌ Failed to check existing geofences:', error);
    }
  }

  private async checkLocationAgainstGeofences(location: Location) {
    try {
      const projects = await this.loadProjects();
      if (projects.length === 0) return;

      const { latitude, longitude } = location.coords;

      for (const project of projects) {
        const identifier = `${project.projectId}-${project.id}`;

        // Skip if not within project window
        if (!this.isWithinProjectWindow(project)) continue;

        const distance = this.calculateDistance(
          latitude,
          longitude,
          project.latitude,
          project.longitude
        );

        const wasInside = this.currentlyInside.has(identifier);
        const isInside = distance <= project.radius;

        // Handle state changes
        if (!wasInside && isInside) {
          // Entered geofence
          this.currentlyInside.add(identifier);
          const event: GeofenceEvent = {
            id: identifier,
            transition: 'ENTER',
            latitude,
            longitude,
            timestamp: new Date().toISOString(),
          };
          console.log('🎯 Location-based geofence ENTER:', event);
          this.eventListeners.forEach((fn) => fn(event));
        } else if (wasInside && !isInside) {
          // Exited geofence
          this.currentlyInside.delete(identifier);
          const event: GeofenceEvent = {
            id: identifier,
            transition: 'EXIT',
            latitude,
            longitude,
            timestamp: new Date().toISOString(),
          };
          console.log('🎯 Location-based geofence EXIT:', event);
          this.eventListeners.forEach((fn) => fn(event));
        }
      }
    } catch (error) {
      console.error('❌ Failed to check location against geofences:', error);
    }
  }

  // ───────────────────────────────
  // 🔹 Lifecycle
  // ───────────────────────────────
  async initialize(debug = true): Promise<void> {
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
        geofenceModeHighAccuracy: true,
        debug,
        logLevel: debug
          ? BackgroundGeolocation.LOG_LEVEL_VERBOSE
          : BackgroundGeolocation.LOG_LEVEL_ERROR,
      });

      console.log('✅ RNBG ready', bgState);

      // Attach listeners AFTER ready()
      this.setupEventListeners();

      // Restore geofences + schedule
      await this.restoreProjects();

      // Explicitly start (like working sample)
      await BackgroundGeolocation.start();

      this.updateState({ isInitialized: true, isLoading: false });
    } catch (err) {
      this.updateState({
        isInitialized: false,
        isLoading: false,
        error: String(err),
      });
      console.error('❌ RNBG init failed', err);
    }
  }

  private setupEventListeners() {
    // Prevent duplicate subscriptions
    this.geofenceSubscription?.remove();
    this.locationSubscription?.remove();
    this.providerSubscription?.remove();
    this.motionSubscription?.remove();

    // Geofence events
    this.geofenceSubscription = BackgroundGeolocation.onGeofence(
      async (geofence: RNBGGeofenceEvent) => {
        let transition: GeofenceTransition = 'ENTER';
        if (geofence.action === 'EXIT') transition = 'EXIT';
        if (geofence.action === 'DWELL') transition = 'DWELL';

        const base: GeofenceEventBase = {
          id: geofence.identifier,
          transition,
          latitude: geofence.location.coords.latitude,
          longitude: geofence.location.coords.longitude,
          timestamp: new Date().toISOString(),
        };

        const event = await this.enrichEvent(base);

        if (transition === 'ENTER') this.currentlyInside.add(geofence.identifier);
        if (transition === 'EXIT') this.currentlyInside.delete(geofence.identifier);

        console.log('📍 Geofence event fired:', event);
        this.eventListeners.forEach((fn) => fn(event));
      }
    );

    // Location events - now with manual geofence checking
    this.locationSubscription = BackgroundGeolocation.onLocation(
      (location: Location) => {
        console.log('🛰️ Location update:', location.coords);

        // Check location against geofences manually
        this.checkLocationAgainstGeofences(location);
      },
      (error) => {
        console.error('❌ Location error:', error);
      }
    );

    // Provider changes (debug)
    this.providerSubscription = BackgroundGeolocation.onProviderChange(
      (provider: ProviderChangeEvent) => {
        console.log('⚙️ Provider change:', provider);
      }
    );

    // Motion state (moving/stationary)
    this.motionSubscription = BackgroundGeolocation.onMotionChange(
      (event: MotionChangeEvent) => {
        console.log(
          `🚶 Motion change: now ${event.isMoving ? 'MOVING' : 'STATIONARY'
          } at`,
          event.location.coords
        );
      }
    );
  }

  addEventListener(listener: (event: GeofenceEvent) => void): () => void {
    this.eventListeners.add(listener);
    return () => {
      this.eventListeners.delete(listener);
    };
  }

  // ───────────────────────────────
  // 🔹 Project management
  // ───────────────────────────────
  async addProjects(projects: ProjectGeofence[]) {
    try {
      const existing = await this.loadProjects();
      const filtered = existing.filter(
        (p) => !projects.some((np) => np.projectId === p.projectId)
      );

      const updated = [...filtered, ...projects];
      await this.saveProjects(updated);
      await this.restoreProjects();

      this.updateState({ geofences: updated });
    } catch (err) {
      console.error('❌ Failed to add projects:', err);
    }
  }

  async removeProjects(ids: string[]) {
    const existing = await this.loadProjects();

    // Clean up tracking for removed projects
    for (const id of ids) {
      const project = existing.find(p => p.projectId === id);
      if (project) {
        const identifier = `${project.projectId}-${project.id}`;
        this.currentlyInside.delete(identifier);
      }
    }

    const updated = existing.filter((p) => !ids.includes(p.projectId));
    await this.saveProjects(updated);
    await this.restoreProjects();
  }

  async clearAllProjects() {
    // Clear tracking state
    this.currentlyInside.clear();

    await this.saveProjects([]);
    await BackgroundGeolocation.removeGeofences();
    await BackgroundGeolocation.stopSchedule();
    await BackgroundGeolocation.stop();
    this.updateState({ geofences: [] });
  }

  async restoreProjects() {
    try {
      const projects = await this.loadProjects();

      if (projects.length === 0) {
        await BackgroundGeolocation.stopSchedule();
        await BackgroundGeolocation.removeGeofences();
        this.updateState({ geofences: [] });
        console.log('⏸️ No projects saved — schedule stopped');
        return;
      }

      const currentGeofences = await BackgroundGeolocation.getGeofences();
      const currentIds = new Set(currentGeofences.map((g) => g.identifier));
      const validIds = new Set(projects.map((p) => `${p.projectId}-${p.id}`));

      // 🔹 Remove stale geofences
      for (const g of currentGeofences) {
        if (!validIds.has(g.identifier)) {
          await BackgroundGeolocation.removeGeofence(g.identifier);
          // Clean up tracking
          this.currentlyInside.delete(g.identifier);
        }
      }

      // 🔹 Add missing geofences
      for (const project of projects) {
        const identifier = `${project.projectId}-${project.id}`;
        if (!currentIds.has(identifier)) {
          const fence: RNBGGeofence = {
            identifier,
            latitude: project.latitude,
            longitude: project.longitude,
            radius: project.radius,
            notifyOnEntry: true,
            notifyOnExit: true,
            notifyOnDwell: false,
          };
          await BackgroundGeolocation.addGeofence(fence);
          console.log(`✅ Geofence added for ${project.siteName}`);
        }
      }

      // 🔹 Build schedules (1-7 = all days if none provided)
      const schedule: string[] = projects.map((project) => {
        const days =
          project.activeDays && project.activeDays.length > 0
            ? project.activeDays.join(',')
            : '1-7';
        return `${days} ${project.startTime}-${project.endTime}`;
      });

      await BackgroundGeolocation.setConfig({ schedule });
      await BackgroundGeolocation.startSchedule();

      // 🔹 Update state with ALL projects
      this.updateState({ geofences: projects });
      console.log(`📅 ${projects.length} projects scheduled`, schedule);

      // 🔹 Check if already inside any geofences (NEW!)
      await this.checkExistingGeofences(projects);

    } catch (err) {
      this.updateState({ error: String(err) });
      console.error('❌ Failed to restore projects:', err);
    }
  }

  // ───────────────────────────────
  // 🔹 Utility methods
  // ───────────────────────────────

  /**
   * Force a manual check of all geofences against current location
   */
  async forceGeofenceCheck(): Promise<void> {
    const projects = await this.loadProjects();
    if (projects.length > 0) {
      await this.checkExistingGeofences(projects);
    }
  }

  /**
   * Get current geofence states (which ones user is inside)
   */
  getCurrentGeofenceStates(): string[] {
    return Array.from(this.currentlyInside);
  }

  /**
   * Force location update and geofence re-evaluation
   */
  async triggerGeofenceRefresh(): Promise<void> {
    try {
      console.log('🔄 Triggering geofence refresh...');

      // Request a fresh location with higher accuracy
      await BackgroundGeolocation.getCurrentPosition({
        samples: 3,
        persist: true,
        desiredAccuracy: 10,
        timeout: 15000,
      });

      // Force manual check as backup
      await this.forceGeofenceCheck();

    } catch (error) {
      console.error('❌ Failed to trigger geofence refresh:', error);
    }
  }
}

export const geofencingSingleton = GeofencingSingleton.getInstance();