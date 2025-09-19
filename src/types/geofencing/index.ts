// src/GeofencingSingleton.ts
import BackgroundGeolocation, {
  Geofence as RNBGGeofence,
  GeofenceEvent as RNBGGeofenceEvent,
  Subscription
} from 'react-native-background-geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GeofenceRegion, GeofenceEvent, GeofenceTransition } from './types';

const STORAGE_KEY = 'persisted_geofences';

export interface GeofencingState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  geofences: GeofenceRegion[];
}

type StateListener = (state: GeofencingState) => void;
type GeofenceEventListener = (event: GeofenceEvent) => void;

class GeofencingSingleton {
  private static instance: GeofencingSingleton;
  private subscriptions: Subscription[] = [];
  private stateListeners: Set<StateListener> = new Set();
  private eventListeners: Set<GeofenceEventListener> = new Set();
  private geofenceSubscription: Subscription | null = null;

  private state: GeofencingState = {
    isInitialized: false,
    isLoading: false,
    error: null,
    geofences: []
  };

  private constructor() {
    console.log('🚀 GeofencingSingleton created using RNBG');
    this.setupGeofenceListener();
  }

  static getInstance(): GeofencingSingleton {
    if (!GeofencingSingleton.instance) {
      GeofencingSingleton.instance = new GeofencingSingleton();
    }
    return GeofencingSingleton.instance;
  }

  // State management
  private updateState(updates: Partial<GeofencingState>) {
    this.state = { ...this.state, ...updates };
    this.notifyStateListeners();
  }

  private notifyStateListeners() {
    this.stateListeners.forEach(listener => listener(this.state));
  }

  getState(): GeofencingState {
    return { ...this.state };
  }

  // Listener management
  addStateListener(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    // Immediately call with current state
    listener(this.state);
    
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  addEventListener(listener: GeofenceEventListener): () => void {
    this.eventListeners.add(listener);
    
    return () => {
      this.eventListeners.delete(listener);
    };
  }

  private setupGeofenceListener() {
    if (this.geofenceSubscription) {
      return; // Already set up
    }

    this.geofenceSubscription = BackgroundGeolocation.onGeofence((geofence: RNBGGeofenceEvent) => {
      let transition: GeofenceTransition;
      
      switch (geofence.action) {
        case 'ENTER':
          transition = 'ENTER';
          break;
        case 'EXIT':
          transition = 'EXIT';
          break;
        case 'DWELL':
          transition = 'DWELL';
          break;
        default:
          console.warn('Unknown geofence action:', geofence.action);
          transition = 'ENTER';
      }

      const event: GeofenceEvent = {
        id: geofence.identifier,
        transition: transition,
        latitude: geofence.location.coords.latitude,
        longitude: geofence.location.coords.longitude,
        timestamp: geofence.location.timestamp || Date.now().toLocaleString()
      };
      
      // Notify all event listeners
      this.eventListeners.forEach(listener => listener(event));
    });
  }

  // Storage operations
  private async saveGeofencesToStorage(regions: GeofenceRegion[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(regions));
    } catch (error) {
      console.error('❌ Failed to save geofences to storage:', error);
      throw error;
    }
  }

  private async loadGeofencesFromStorage(): Promise<GeofenceRegion[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Failed to load geofences from storage:', error);
      return [];
    }
  }

  // Core functionality
  async initialize(): Promise<boolean> {
    this.updateState({ isLoading: true, error: null });
    
    try {
      console.log('🔄 Initializing GeofencingSingleton...');
      
      // Check provider state
      const providerState = await BackgroundGeolocation.getProviderState();
      const locationServicesEnabled = providerState.gps || providerState.network;
      
      if (!locationServicesEnabled) {
        const errorMsg = 'Location services are disabled';
        console.warn('⚠️', errorMsg);
        this.updateState({ isLoading: false, error: errorMsg });
        return false;
      }

      // Configure and initialize the background geolocation service
      const bgState = await BackgroundGeolocation.ready({
        desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
        distanceFilter: 50,
        stopOnTerminate: false,
        startOnBoot: true,
        geofenceProximityRadius: 1000,
        geofenceInitialTriggerEntry: true,
        authorization: {
          strategy: 'JWT',
          accessToken: 'your-jwt-access-token-here',
        },
        debug: false,
        logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      });
      
      console.log('✅ RNBG ready:', {
        enabled: bgState.enabled,
        locationServicesEnabled,
        status: bgState.enabled ? 'Enabled' : 'Disabled'
      });

      // Load persisted geofences
      const persistedGeofences = await this.loadGeofencesFromStorage();

      this.updateState({ 
        isInitialized: true, 
        isLoading: false, 
        error: null,
        geofences: persistedGeofences
      });
      
      return bgState.enabled;
    } catch (error) {
      const errorMsg = `Initialize failed: ${error}`;
      console.error('❌', errorMsg);
      this.updateState({ 
        isInitialized: false, 
        isLoading: false, 
        error: errorMsg 
      });
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const status = await BackgroundGeolocation.requestPermission();
      console.log('📍 Permission status:', status);
      
      return status === BackgroundGeolocation.AUTHORIZATION_STATUS_ALWAYS || 
             status === BackgroundGeolocation.AUTHORIZATION_STATUS_WHEN_IN_USE;
    } catch (error) {
      console.error('❌ RequestPermissions failed:', error);
      return false;
    }
  }

  async restorePersistedGeofences(): Promise<void> {
    if (!this.state.isInitialized) {
      console.warn('⚠️ Cannot restore geofences: module not initialized');
      return;
    }

    console.log('🔄 Restoring persisted geofences...');
    try {
      const regions = await this.loadGeofencesFromStorage();
      console.log(`📍 Found ${regions.length} persisted geofences`);

      for (const region of regions) {
        try {
          console.log('🔄 Restoring geofence:', region.id);
          await this.addGeofence(region, false); // Don't update storage again
        } catch (e) {
          console.warn('⚠️ Failed to restore geofence:', region.id, e);
        }
      }
      
      this.updateState({ geofences: regions });
    } catch (error) {
      console.error('❌ Failed to restore persisted geofences:', error);
    }
  }

  async addGeofence(region: GeofenceRegion, updateStorage = true): Promise<boolean> {
    if (!this.state.isInitialized) {
      console.error('❌ GeofencingSingleton not initialized');
      return false;
    }

    console.log('🔄 Adding geofence:', region);
    try {
      const fence: RNBGGeofence = {
        identifier: region.id,
        radius: region.radius,
        latitude: region.latitude,
        longitude: region.longitude,
        notifyOnEntry: true,
        notifyOnExit: true,
        notifyOnDwell: true,
        loiteringDelay: 30000
      };
      
      await BackgroundGeolocation.addGeofence(fence);

      if (updateStorage) {
        const current = await this.loadGeofencesFromStorage();
        const updated = current.filter(r => r.id !== region.id);
        updated.push(region);
        await this.saveGeofencesToStorage(updated);
        this.updateState({ geofences: updated });
      }
      
      console.log('✅ Geofence added');
      return true;
    } catch (error) {
      console.error('❌ Failed to add geofence:', error);
      return false;
    }
  }

  async removeGeofence(id: string): Promise<boolean> {
    if (!this.state.isInitialized) {
      console.error('❌ GeofencingSingleton not initialized');
      return false;
    }

    try {
      await BackgroundGeolocation.removeGeofence(id);
      const current = await this.loadGeofencesFromStorage();
      const updated = current.filter(r => r.id !== id);
      await this.saveGeofencesToStorage(updated);
      
      this.updateState({ geofences: updated });
      console.log('✅ Geofence removed');
      return true;
    } catch (error) {
      console.error('❌ Failed to remove geofence:', error);
      return false;
    }
  }

  async removeAllGeofences(): Promise<boolean> {
    if (!this.state.isInitialized) {
      console.error('❌ GeofencingSingleton not initialized');
      return false;
    }

    try {
      await BackgroundGeolocation.removeGeofences();
      await this.saveGeofencesToStorage([]);
      
      this.updateState({ geofences: [] });
      console.log('✅ All geofences removed');
      return true;
    } catch (error) {
      console.error('❌ Failed to remove all geofences:', error);
      return false;
    }
  }

  async getPersistedGeofences(): Promise<GeofenceRegion[]> {
    return this.loadGeofencesFromStorage();
  }

  async getActiveGeofences(): Promise<GeofenceRegion[]> {
    if (!this.state.isInitialized) {
      console.error('❌ GeofencingSingleton not initialized');
      return [];
    }

    try {
      const fences = await BackgroundGeolocation.getGeofences();
      return fences.map(f => ({
        id: f.identifier,
        latitude: f.latitude,
        longitude: f.longitude,
        radius: f.radius
      }));
    } catch (error) {
      console.error('❌ Failed to get geofences:', error);
      return [];
    }
  }

  async startMonitoring(): Promise<boolean> {
    if (!this.state.isInitialized) {
      console.error('❌ GeofencingSingleton not initialized');
      return false;
    }

    try {
      await BackgroundGeolocation.start();
      console.log('✅ Geofence monitoring started');
      return true;
    } catch (error) {
      console.error('❌ Failed to start monitoring:', error);
      return false;
    }
  }

  async stopMonitoring(): Promise<boolean> {
    if (!this.state.isInitialized) {
      console.error('❌ GeofencingSingleton not initialized');
      return false;
    }

    try {
      await BackgroundGeolocation.stop();
      console.log('✅ Geofence monitoring stopped');
      return true;
    } catch (error) {
      console.error('❌ Failed to stop monitoring:', error);
      return false;
    }
  }

  // Cleanup
  destroy(): void {
    this.subscriptions.forEach(s => s.remove());
    this.subscriptions = [];
    
    if (this.geofenceSubscription) {
      this.geofenceSubscription.remove();
      this.geofenceSubscription = null;
    }
    
    this.stateListeners.clear();
    this.eventListeners.clear();
  }
}

// Export singleton instance
export const geofencingSingleton = GeofencingSingleton.getInstance();

