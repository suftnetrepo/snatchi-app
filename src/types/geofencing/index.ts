import BackgroundGeolocation, {
  Geofence as RNBGGeofence,
  GeofenceEvent as RNBGGeofenceEvent,
  Subscription,
  Location,
  ProviderChangeEvent,
  MotionChangeEvent,
} from 'react-native-background-geolocation';
import type {
  GeofenceEvent,
  GeofenceTransition,
  ProjectGeofence,
  GeofencingState,
  GeofenceEventBase,
} from './types';
import { add, store, clear, getStore, PROJECT_KEY } from '../../utils/asyncStorage';

class GeofencingSingleton {
  private static instance: GeofencingSingleton;

  private geofenceSubscription: Subscription | null = null;
  private locationSubscription: Subscription | null = null;
  private providerSubscription: Subscription | null = null;
  private motionSubscription: Subscription | null = null;

  // PUBLIC STATE (unchanged)
  private state: GeofencingState = {
    isInitialized: false,
    isLoading: false,
    error: null,
    geofences: [],
  };

  private eventListeners = new Set<(event: GeofenceEvent) => void>();
  private stateListeners = new Set<(state: GeofencingState) => void>();

  /**
   * Tracks which geofences user is currently inside
   * This is the ONLY internal memory for preventing repeated ENTER.
   */
  private currentlyInside = new Set<string>();

  private constructor() {
    console.log("🚀 Clean GeofencingSingleton created");
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

  // ===========================================================================
  // 📌 Helpers
  // ===========================================================================

  private updateState(patch: Partial<GeofencingState>) {
    this.state = { ...this.state, ...patch };
    this.stateListeners.forEach((cb) => cb(this.state));
  }

  addStateListener(listener: (state: GeofencingState) => void): () => void {
    this.stateListeners.add(listener);
    listener(this.state);
    return () => this.stateListeners.delete(listener);
  }

  getState() {
    return { ...this.state };
  }

  // ===========================================================================
  // 📌 Storage
  // ===========================================================================

  private async loadProjects(): Promise<ProjectGeofence[]> {
    const stored = await getStore(PROJECT_KEY);
    if (!stored) return [];
    return stored;
  }

  private async saveProjects(projects: ProjectGeofence[]) {
    await store(PROJECT_KEY, projects);
  }

  // ===========================================================================
  // 📌 Validation
  // ===========================================================================

  private isWithinProjectWindow(project: ProjectGeofence): boolean {
    const now = new Date();

    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    if (now < start || now > end) return false;

    const [sh, sm] = project.startTime.split(":").map(Number);
    const [eh, em] = project.endTime.split(":").map(Number);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;

    if (nowMinutes < startMinutes || nowMinutes > endMinutes) return false;

    if (project.activeDays?.length) {
      if (!project.activeDays.includes(now.getDay())) return false;
    }

    return true;
  }

  // ===========================================================================
  // 📌 RNBG EVENT HANDLERS (Source of truth)
  // ===========================================================================

  private setupEventListeners() {
    this.geofenceSubscription?.remove();
    this.locationSubscription?.remove();
    this.providerSubscription?.remove();
    this.motionSubscription?.remove();

    /**
     * Geofence events from RNBG
     */
    this.geofenceSubscription = BackgroundGeolocation.onGeofence(
      async (event: RNBGGeofenceEvent) => {
        const { identifier, action, location } = event;

        let transition: GeofenceTransition = "ENTER";
        if (action === "EXIT") transition = "EXIT";
        if (action === "DWELL") transition = "DWELL";

        const base: GeofenceEventBase = {
          id: identifier,
          transition,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: new Date().toISOString(),
        };

        // Avoid ENTRY loops
        if (transition === "ENTER" && this.currentlyInside.has(identifier)) {
          return;
        }
        if (transition === "EXIT" && !this.currentlyInside.has(identifier)) {
          return;
        }

        // Keep local state in sync
        if (transition === "ENTER") this.currentlyInside.add(identifier);
        if (transition === "EXIT") this.currentlyInside.delete(identifier);

        const enriched = await this.enrichEvent(base);

        console.log("📍 CLEAN GEOFENCE EVENT:", enriched);
        this.eventListeners.forEach((cb) => cb(enriched));
      }
    );

    /**
     * Only for debugging/movement - NOT used for manual geofencing anymore
     */
    this.locationSubscription = BackgroundGeolocation.onLocation(
      (loc) => console.log("🛰️ Location update:", loc.coords),
      (err) => console.log("❌ Location error:", err)
    );

    this.providerSubscription = BackgroundGeolocation.onProviderChange(
      (provider) => console.log("⚙️ Provider changed:", provider)
    );

    this.motionSubscription = BackgroundGeolocation.onMotionChange((ev) =>
      console.log("🚶 Motion:", ev.isMoving ? "MOVING" : "STATIONARY")
    );
  }

  private async enrichEvent(base: GeofenceEventBase): Promise<GeofenceEvent> {
    const projects = await this.loadProjects();
    const project = projects.find(
      (p) => p.projectId === base.id
    );

    return { ...base, ...(project ?? {}) };
  }

  // ===========================================================================
  // 📌 Initialization
  // ===========================================================================

  async initialize(debug = true) {
    if (this.state.isInitialized) return;

    this.updateState({ isLoading: true, error: null });

    try {
      await BackgroundGeolocation.ready({
        desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
        distanceFilter: 50,
        stopOnTerminate: false,
        startOnBoot: true,
        debug,
        geofenceModeHighAccuracy: true,
        geofenceProximityRadius: 1000,
        geofenceInitialTriggerEntry: true,
        logLevel: debug
          ? BackgroundGeolocation.LOG_LEVEL_VERBOSE
          : BackgroundGeolocation.LOG_LEVEL_ERROR,
      });

      this.setupEventListeners();
      await this.restoreProjects();
      await BackgroundGeolocation.start();

      this.updateState({ isInitialized: true, isLoading: false });
    } catch (err) {
      console.log("❌ Init failed:", err);
      this.updateState({ error: String(err), isLoading: false });
    }
  }

  // ===========================================================================
  // 📌 Project Management
  // ===========================================================================

  async addProjects(projects: ProjectGeofence[]) {
    const existing = await this.loadProjects();
    const filtered = existing.filter(
      (p) => !projects.some((np) => np.projectId === p.projectId)
    );

    const updated = [...filtered, ...projects];
    await this.saveProjects(updated);
    await this.restoreProjects();

    this.updateState({ geofences: updated });
  }

  async removeProjects(ids: string[]) {
    const existing = await this.loadProjects();

    for (const id of ids) {
      const project = existing.find((p) => p.projectId === id);
      if (project) {
        this.currentlyInside.delete(project.projectId);
      }
    }

    const updated = existing.filter((p) => !ids.includes(p.projectId));
    await this.saveProjects(updated);
    await this.restoreProjects();
  }

  async clearAllProjects() {
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

      // Filter down to strictly active projects
      const activeProjects = projects.filter(p =>
        this.isWithinProjectWindow(p)
      );

      console.log("🟦 All projects:", projects.length);
      console.log("🟩 Active projects (monitored):", activeProjects.length);

      // If NO active projects
      if (activeProjects.length === 0) {
        await BackgroundGeolocation.removeGeofences();
        await BackgroundGeolocation.stopSchedule();
        this.currentlyInside.clear();
        this.updateState({ geofences: [] });
        return;
      }

      // Load which geofences are currently installed
      const existing = await BackgroundGeolocation.getGeofences();
      const existingIds = new Set(existing.map(g => g.identifier));
      const validIds = new Set(activeProjects.map(p => p.projectId));

      // Remove geofences that are no longer active
      for (const g of existing) {
        if (!validIds.has(g.identifier)) {
          await BackgroundGeolocation.removeGeofence(g.identifier);
          this.currentlyInside.delete(g.identifier);
        }
      }

      // Add new active geofences
      for (const p of activeProjects) {
        const id = p.projectId;
        if (!existingIds.has(id)) {
          await BackgroundGeolocation.addGeofence({
            identifier: id,
            latitude: p.latitude,
            longitude: p.longitude,
            radius: p.radius,
            notifyOnEntry: true,
            notifyOnExit: true,
            notifyOnDwell: false,
          });
        }
      }

      // Build schedule from active projects
      const schedule = activeProjects.map(p => {
        const days = p.activeDays?.length
          ? p.activeDays.join(",")
          : "1-7";
        return `${days} ${p.startTime}-${p.endTime}`;
      });

      await BackgroundGeolocation.setConfig({ schedule });
      await BackgroundGeolocation.startSchedule();

      // Update UI state
      this.updateState({ geofences: activeProjects });

      // Perform initial inside check for *only active* geofences
      this.initialInsideCheck();

    } catch (err) {
      console.log("❌ restoreProjects failed:", err);
      this.updateState({ error: String(err) });
    }
  }


  // ===========================================================================
  // 📌 Initial check only (prevents infinite ENTER loops)
  // ===========================================================================

  private async initialInsideCheck() {
    try {
      const allProjects = await this.loadProjects();
      if (!allProjects.length) return;

      // STRICT MODE: Only check active window projects
      const projects = allProjects.filter(p =>
        this.isWithinProjectWindow(p)
      );

      if (!projects.length) {
        console.log("⛔ No active projects right now — skipping inside check");
        return;
      }

      const loc = await BackgroundGeolocation.getCurrentPosition({
        samples: 1,
        desiredAccuracy: 40,
        persist: false,
      });

      const { latitude, longitude } = loc.coords;

      for (const p of projects) {
        const id = p.projectId;

        const distance = this.getDistance(
          latitude,
          longitude,
          p.latitude,
          p.longitude
        );

        if (distance <= p.radius) {

          // Prevent repeated ENTER
          // if (this.currentlyInside.has(id)) {
          //   console.log(`⛔ Skipping duplicate ENTER for ${id}`);
          //   continue;
          // }

          this.currentlyInside.add(id);

          const {
            id: _ignoreId,
            latitude: _ignoreLat,
            longitude: _ignoreLon,
            ...safeProject
          } = p;

          const evt: GeofenceEvent = {
            id,
            transition: "ENTER",
            latitude,
            longitude,
            timestamp: new Date().toISOString(),
            ...safeProject,
          };

          console.log("🎯 Initial manual ENTER:", evt);
          this.eventListeners.forEach(cb => cb(evt));
        }
      }

    } catch (err) {
      console.log("⚠️ initialInsideCheck failed:", err);
    }
  }


  private getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
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

  // ===========================================================================
  // 📌 Public API (unchanged)
  // ===========================================================================

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


export const geofencingSingleton = GeofencingSingleton.getInstance();