import BackgroundGeolocation, {
  Geofence as RNBGGeofence,
  GeofenceEvent as RNBGGeofenceEvent,
  Subscription,
  Config,
  State,
  Location,
  ProviderChangeEvent,
  MotionChangeEvent,
  LocationFilterPolicy,
} from 'react-native-background-geolocation';
import type {
  GeofenceEvent,
  GeofenceTransition,
  ProjectGeofence,
  GeofencingState,
  GeofenceEventBase,
} from './types';
import {
  add,
  store,
  clear,
  getStore,
  PROJECT_KEY,
} from '../../utils/asyncStorage';
import { toModel } from '../../utils/help';
import { zat } from '../../utils/zap';
import { FENCE, VERBS } from '../../../config';
import { localNotificationService } from '../../../Notification/LocalNotificationService';
import { Vibration } from 'react-native';

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
    console.log('🚀 Clean GeofencingSingleton created');
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
        status === BackgroundGeolocation.AuthorizationStatus.Always ||
        status === BackgroundGeolocation.AuthorizationStatus.WhenInUse
      );
    } catch (error) {
      console.error('❌ RequestPermissions failed:', error);
      return false;
    }
  }

  // ===========================================================================
  // 📌 Helpers
  // ===========================================================================

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

    // DATE RANGE — compare only yyyy-mm-dd (avoid timezone shift)
    const today = now.toISOString().split('T')[0];
    const startDay = project.startDate.split('T')[0];
    const endDay = project.endDate.split('T')[0];

    if (today < startDay || today > endDay) {
      return false;
    }

    // TIME RANGE
    const [sh, sm] = project.startTime.split(':').map(Number);
    const [eh, em] = project.endTime.split(':').map(Number);

    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;

    if (nowMinutes < startMinutes || nowMinutes > endMinutes) {
      return false;
    }

    // ACTIVE DAYS FIX → Map JS Sunday 0 → 7
    const jsDay = now.getDay(); // 0–6
    const localDay = jsDay === 0 ? 7 : jsDay;

    if (project.activeDays?.length) {
      if (!project.activeDays.includes(localDay)) {
        return false;
      }
    }

    return true;
  }

  // ===========================================================================
  // 📌 RNBG EVENT HANDLERS (Source of truth)
  // ===========================================================================

  private async saveFenceEvent(event: GeofenceEvent) {
    console.log('==============================================');
    console.log('📥 saveFenceEvent() TRIGGERED with event:', event);

    try {
      console.log('🔄 Converting event to model...');
      const model = toModel(event);
      console.log('📦 Mapped Model:', model);

      // 🔔 Trigger vibration & notification for BOTH ENTER & EXIT
      console.log(`🔍 Transition type detected: ${event.transition}`);

      if (event.transition === 'ENTER' || event.transition === 'EXIT') {
        console.log('📳 Preparing to vibrate device...');
        Vibration.vibrate(300);
        console.log('✅ Device vibrated (300ms)');

        console.log('🛠 Preparing notification title/message...');
        const title =
          event.transition === 'ENTER' ? 'Entered Geofence' : 'Exited Geofence';

        const message =
          event.transition === 'ENTER'
            ? `You entered ${model.siteName}`
            : `You exited ${model.siteName}`;

        console.log('📨 Notification details:', { title, message });

        console.log('📡 Setting notification channel...');
        localNotificationService.defaultChannel();

        console.log('🚀 Showing local notification...');
        localNotificationService.showNotification(
          Date.now() % 100000, // Unique ID
          title,
          message,
          { eventType: event.transition },
          { playSound: true },
        );

        console.log('✅ Local notification sent');
      } else {
        console.log(
          '⚠️ No vibration/notification triggered (transition not enter/exit)',
        );
      }

      console.log('💾 Saving geofence event to backend API...');
      const response = await this.handleSave(model);

      console.log(
        `🟢 SUCCESS: ${event.transition} event saved to DB. Response:`,
        response,
      );
    } catch (err) {
      console.error(`🔴 ERROR in saveFenceEvent for ${event.transition}:`, err);
    }

    console.log('==============================================');
  }
  private async handleSave(body: any) {
    console.log('📨 handleSave() called with payload:', body);

    try {
      console.log('🌍 Sending API request to FENCE.addOne...');
      const { success } = await zat(FENCE.addOne, body, VERBS.POST);

      console.log('🟢 API success:', success);
      return success;
    } catch (error) {
      console.error('🔴 API SAVE ERROR:', error);
    }
  }

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

        console.log('📡 RNBG RAW GEOFENCE EVENT:', event);
        console.log('📡 Extracted identifier/action/location:', {
          identifier,
          action,
          location,
        });
        console.log('🔄 Resolved transition:', transition);
        console.log('📍 Generated base model:', base);

        //   if (transition === "ENTER" && this.currentlyInside.has(identifier)) {
        //     console.log("⛔ BLOCKED: Duplicate ENTER");
        //     return;
        //   }
        //   if (transition === "EXIT" && !this.currentlyInside.has(identifier)) {
        //     console.log("⛔ BLOCKED: EXIT without being inside");
        //     return;
        // }

        // if (transition === "ENTER") this.currentlyInside.add(identifier);
        // if (transition === "EXIT") this.currentlyInside.delete(identifier);

        console.log('📥 Fetching project enrichment data...');
        const enriched = await this.enrichEvent(base);
        console.log('🟢 ENRICHED EVENT READY:', enriched);

        console.log('💾 Calling saveFenceEvent()...');
        this.saveFenceEvent(enriched);

        // Notify UI if needed
        // this.eventListeners.forEach(cb => cb(enriched));
      },
    );

    /**
     * Only for debugging/movement - NOT used for manual geofencing anymore
     */
    this.locationSubscription = BackgroundGeolocation.onLocation(
      loc => console.log('🛰️ Location update:', loc.coords),
      err => console.log('❌ Location error:', err),
    );

    this.providerSubscription = BackgroundGeolocation.onProviderChange(
      provider => console.log('⚙️ Provider changed:', provider),
    );

    this.motionSubscription = BackgroundGeolocation.onMotionChange(ev =>
      console.log('🚶 Motion:', ev.isMoving ? 'MOVING' : 'STATIONARY'),
    );
  }

  private async enrichEvent(base: GeofenceEventBase): Promise<GeofenceEvent> {
    const projects = await this.loadProjects();
    const project = projects.find(p => p.projectId === base.id);

    return { ...base, ...(project ?? {}) };
  }

  // ===========================================================================
  // 📌 Initialization
  // ===========================================================================

  async initialize(debug = true) {
    console.log('[ready] BackgroundGeolocation is configured and ready to use started');

    try {

      const schedule = await this.restoreProjects();

      const config: Config = {
        geolocation: {

          // High-precision GPS
          desiredAccuracy: BackgroundGeolocation.DesiredAccuracy.High,

          // Move at least 50m before recording next location
          distanceFilter: 50,

          // Consider stationary after 5 minutes with no motion
          stopTimeout: 5,

          // Automatically stop tracking after 120 minutes of continuous operation
          stopAfterElapsedMinutes: 120,

          // iOS: Show blue bar / pill when active in background
          showsBackgroundLocationIndicator: true,

          // Noise-reduction / denoising filter
          filter: {
            maxImpliedSpeed: 60,
            odometerAccuracyThreshold: 20,
            trackingAccuracyThreshold: 100,
          },

          // Geofencing behavior
          geofenceProximityRadius: 1000,
          geofenceInitialTriggerEntry: true,
          geofenceModeHighAccuracy: true,

          // Permissions / alerts (iOS)
          locationAuthorizationRequest: 'Always',
          disableLocationAuthorizationAlert: false,
          locationAuthorizationAlert: {
            titleWhenNotEnabled: "Location Required for Geofencing",
            message:
              "Snatchi needs location access to detect geofence entry and exit events. Please enable location permissions for full functionality.",
            cancelButton: "Cancel",
            settingsButton: "Settings"
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
            title:
              'Allow Snatchi to access your location for geofencing, even when closed.',
            message:
              'Snatchi uses your location to detect when you enter or exit geofenced areas, even when the app is not open.',
            positiveAction: 'Change to "{backgroundPermissionOptionLabel}"',
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
          debug: true,
          logLevel: BackgroundGeolocation.LogLevel.Verbose,
        },
      }
      // Apply the configuration.
      BackgroundGeolocation.ready(config).then(async (state) => {
        this.setupEventListeners();

        // const schedule = await this.restoreProjects();

        // Apply schedule only if we have active projects
        console.log("🟩 Applied schedule:", schedule);
        await BackgroundGeolocation.setConfig({
          app: {
            schedule,
            scheduleUseAlarmManager: true
          }
        });
        console.log("🚀 Scheduler started.");

        // Start scheduler
        // await BackgroundGeolocation.startSchedule();

        if (!state.enabled) {
          await BackgroundGeolocation.startGeofences();
          console.log("🚀 Geofences started.");
        }
        // Check if we're already inside (manual ENTER)

        await this.initialInsideCheck();

        return true
      }).catch((error) => {
        if(__DEV__)
        console.error("🚀 Error starting Geofences.", error);
      })

      console.log('[ready] BackgroundGeolocation is configured and ready to use started');
      // this.updateState({ isInitialized: true, isLoading: false });
    } catch (err) {
      console.log('❌ Init failed:', err);
      // this.updateState({ error: String(err), isLoading: false });
    }
  }

  // ===========================================================================
  // 📌 Project Management
  // ===========================================================================

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
        schedule
      }
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
    // this.updateState({ geofences: [] });
  }

  async restoreProjects() {
    try {
      const projects = await this.loadProjects();

      // Filter down to active-on-calendar projects
      const activeProjects = projects.filter(p =>
        this.isWithinProjectWindow(p)
      );

      console.log("🟦 All projects:", projects.length);
      console.log("🟩 Active:", activeProjects.length);

      // Remove all geofences if no active project
      if (activeProjects.length === 0) {
        await BackgroundGeolocation.removeGeofences();
        this.currentlyInside.clear();
        return [];
      }

      // Get existing geofences
      const existing = await BackgroundGeolocation.getGeofences();
      const existingIds = new Set(existing.map(g => g.identifier));
      const activeIds = new Set(activeProjects.map(p => p.projectId));

      // Add missing
      for (const p of activeProjects) {
        if (!existingIds.has(p.projectId)) {
          await BackgroundGeolocation.addGeofence({
            identifier: p.projectId,
            latitude: p.latitude,
            longitude: p.longitude,
            radius: p.radius,
            notifyOnEntry: true,
            notifyOnExit: true,
            notifyOnDwell: false
          });
        }
      }

      // Remove stale
      for (const g of existing) {
        if (!activeIds.has(g.identifier)) {
          await BackgroundGeolocation.removeGeofence(g.identifier);
          this.currentlyInside.delete(g.identifier);
        }
      }

      // Build RNBG cron schedule
      const schedule = activeProjects.map(p => {
        const days = p.activeDays?.length ? p.activeDays.join(",") : "1-7";
        return `${days} ${p.startTime}-${p.endTime} geofence`;
      });

      console.log("🟦 Generated Schedule:", schedule);

      return schedule;
    } catch (err) {
      console.log("❌ restoreProjects failed:", err);
      return [];
    }
  }

  // ===========================================================================
  // 📌 Initial check only (prevents infinite ENTER loops)
  // ===========================================================================

  private async initialInsideCheck() {
    console.log("🔵 initialInsideCheck() STARTED");

    try {
      console.log("🔹 Loading ALL projects...");
      const allProjects = await this.loadProjects();
      console.log("🔹 Loaded projects:", allProjects);

      if (!allProjects.length) {
        console.log("⚪ No stored projects. EXIT.");
        return;
      }

      console.log("🔹 Filtering ACTIVE WINDOW projects...");
      const projects = allProjects.filter(p => {
        const result = this.isWithinProjectWindow(p);
        console.log(`   ⏰ WindowCheck for ${p.projectId}: ${result}`);
        return result;
      });
      console.log("🔹 After filter, active window projects:", projects);

      if (!projects.length) {
        console.log("⛔ No active projects right now — skipping inside check");
        return;
      }

      console.log("📍 Getting current device position...");
      const loc = await BackgroundGeolocation.getCurrentPosition({
        samples: 1,
        desiredAccuracy: 40,
        persist: false,
      });
      console.log("📍 Device location result:", loc);

      const { latitude, longitude } = loc.coords;
      console.log(`📍 Device coords -> lat: ${latitude}, lon: ${longitude}`);

      console.log(`🔍 Checking ${projects.length} project(s) for INSIDE...`);

      for (const p of projects) {
        const id = p.projectId;
        console.log(`\n🟦 Checking project ${id}`);
        console.log(`   🗺️ Fence coords -> lat: ${p.latitude}, lon: ${p.longitude}, radius: ${p.radius}`);

        const distance = this.getDistance(
          latitude,
          longitude,
          p.latitude,
          p.longitude,
        );

        console.log(`   📏 Distance to fence: ${distance} meters`);

        if (distance <= p.radius) {
          console.log(`   ✅ INSIDE radius for ${id}`);

          // Prevent repeated ENTER
          console.log(`   🔍 Checking if ${id} already inside...`);
          if (this.currentlyInside.has(id)) {
            console.log(`   ⛔ Skipping duplicate ENTER for ${id}`);
            continue;
          }

          console.log(`   ➕ Adding ${id} to currentlyInside`);
          this.currentlyInside.add(id);

          const {
            id: _ignoreId,
            latitude: _ignoreLat,
            longitude: _ignoreLon,
            ...safeProject
          } = p;

          console.log("   📦 Building ENTER event payload...");
          const evt: GeofenceEvent = {
            id,
            transition: 'ENTER',
            latitude,
            longitude,
            timestamp: new Date().toISOString(),
            ...safeProject,
          };

          console.log("🎯 Initial manual ENTER event:", evt);
          console.log("📡 Broadcasting ENTER event to listeners...");

          this.eventListeners.forEach(cb => {
            console.log("   🔔 Calling event listener callback...");
            cb(evt);
          });

        } else {
          console.log(`   ❌ OUTSIDE radius for ${id}, no ENTER.`);
        }
      }

      console.log("🔵 initialInsideCheck() COMPLETED");

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
