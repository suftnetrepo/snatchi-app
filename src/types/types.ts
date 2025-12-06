// Basic region definition (still useful for general use)
export interface GeofenceRegion {
  id: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  title?: string;
  message?: string;
}

// 🔹 Full project-aware geofence
export interface ProjectGeofence {
  projectId: string;
  intergatorId: string;       // Integrator system ID
  id: string;                 // Site ID
  siteName: string;
  latitude: number;
  longitude: number;
  radius: number;

  // Active time window
  startDate: string;          // ISO string (full date)
  endDate: string;            // ISO string
  startTime: string;          // "HH:mm"
  endTime: string;            // "HH:mm"

  activeDays?: number[];      // 1=Mon ... 7=Sun (your backend uses 1-7)

  userId: string;
  firstName: string;
  lastName: string;

  completeAddress: string;

  /** Project status from backend (NOT geofence transition) */
  status: string;

  /** Optional fields from backend */
  priority?: string;
  description?: string;
  action?: boolean;
}


// 🔹 State will track project geofences
export interface GeofencingState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  geofences: ProjectGeofence[]; // ✅ updated
}

export type GeofenceTransition = 'ENTER' | 'EXIT' | 'DWELL';

// export interface GeofenceEvent {
//   id: string;
//   latitude: number;
//   longitude: number;
//   transition: GeofenceTransition;
//   timestamp: string;
// }

export interface NotificationPayload {
  title: string;
  message: string;
  data: {
    locationId: string;
    locationName: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    radius: number;
    transition: 'ENTER' | 'EXIT';
    timestamp: number;
    category: string;
  };
}

export interface LocationProfile {
  id: string;
  name: string;
  category: 'home' | 'work' | 'school' | 'gym' | 'store' | 'restaurant' | 'custom';
  geofence: GeofenceRegion;
  isActive: boolean;
  notifications: {
    onEnter: boolean;
    onExit: boolean;
    enterMessage?: string;
    exitMessage?: string;
  };
  schedule?: {
    days: number[];
    startTime?: string;
    endTime?: string;
  };
  visitHistory: {
    timestamp: number;
    transition: 'ENTER' | 'EXIT';
    duration?: number;
  }[];
}

export interface StoredLocationData {
  locations: LocationProfile[];
  notifications: NotificationPayload[];
  settings: {
    enableNotifications: boolean;
    includeCoordinates: boolean;
    enableHistory: boolean;
    maxHistoryItems: number;
  };
  analytics: {
    totalVisits: number;
    totalLocations: number;
    mostVisitedLocation?: string;
    lastActivity: number;
  };
}

export interface GeofenceEventBase {
  id: string;
  latitude: number;
  longitude: number;
  transition: GeofenceTransition;
  timestamp: string;
}
export type GeofenceEvent = GeofenceEventBase & Partial<ProjectGeofence>;