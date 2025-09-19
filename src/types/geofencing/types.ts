export interface GeofenceRegion {
  id: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  title?: string;
  message?: string;
}

export type GeofenceTransition = 'ENTER' | 'EXIT' | 'DWELL';

export interface GeofenceEvent {
  id: string;
  latitude: number;
  longitude: number;
  transition: "ENTER" | "EXIT" | "DWELL";
  timestamp: string;
}

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