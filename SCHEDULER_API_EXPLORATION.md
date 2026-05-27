# Snatchi Scheduler API & Schema Exploration Report

## Executive Summary

This is a **React Native mobile application** with a **separate backend API** running on `http://192.168.1.74:3000/api/`. The backend files (route handlers, services, models) are **NOT in this workspace** - they're on a separate server. This document provides comprehensive details about the frontend API integration and inferred schema structure based on mobile app usage.

---

## 1. API Endpoint Handlers

### Overview
All scheduler endpoints use the base path: `http://192.168.1.74:3000/api/scheduler`

Query parameters define the action being performed by the backend route handler.

---

### 1.1 Mobile Schedule List Endpoint: `getEngineerSchedules`

**File Reference (Frontend)**:  
- Hook: [src/hooks/useScheduler.jsx](src/hooks/useScheduler.jsx#L306-L330)
- Consumer: [src/components/calender/calendarStripe.jsx](src/components/calender/calendarStripe.jsx#L41-L56)

**API Configuration**:
```javascript
// From config/index.js
SCHEDULER.getEngineerSchedules: `${HOST_API_ADDRESS}scheduler`
```

**Request Details**:
```javascript
// From useScheduler.jsx - handleSchedules function
Method: GET
URL: http://192.168.1.74:3000/api/scheduler
Query Parameters:
  - action: 'getEngineerSchedules'
  - engineerId: {engineer_id}      // Engineer/user ID to filter by
  - date: {YYYY-MM-DD}              // Specific date to fetch
  - status: ['Ready', 'ReadyToStart', 'InProgress', 'Progress', 'Pending', 'Accepted']
```

**Response**: Array of schedule documents
```javascript
[
  {
    _id: ObjectId,
    title: String,
    status: 'Pending|Accepted|Ready|ReadyToStart|InProgress|Progress',
    startDate: ISO8601,
    endDate: ISO8601,
    startTime: 'HH:MM',
    endTime: 'HH:MM',
    project: ObjectId,
    engineer: ObjectId,           // or 'user'
    description: String,
    createdAt: ISO8601,
    updatedAt: ISO8601
  }
]
```

**Usage Pattern**:
- Called when date changes in calendar
- Displays schedules for that specific date
- Transforms response using `schedulesTransformal()` function

---

### 1.2 Engineer Status Aggregate Endpoint: `engineerStatusAggregate`

**File Reference (Frontend)**:
- Hook: [src/hooks/useScheduler.jsx](src/hooks/useScheduler.jsx#L339-L361)
- Consumer: [src/components/dashboard/index.jsx](src/components/dashboard/index.jsx#L32-L36)

**API Configuration**:
```javascript
// From config/index.js
SCHEDULER.engineerStatusAggregate: `${HOST_API_ADDRESS}scheduler`
```

**Request Details**:
```javascript
// From useScheduler.jsx - handleScheduleStatus function
Method: GET
URL: http://192.168.1.74:3000/api/scheduler
Query Parameters:
  - action: 'engineerStatusAggregate'
  - engineerId: {engineer_id}      // Engineer ID to aggregate for
  - status: ['Ready', 'ReadyToStart', 'InProgress', 'Progress', 'Pending', 'Accepted']
```

**Response**: Likely aggregated count/statistics object
```javascript
{
  // Expected format - returns counts grouped by status
  Ready: Number,
  ReadyToStart: Number,
  InProgress: Number,
  Progress: Number,
  Pending: Number,
  Accepted: Number,
  // Or possibly array:
  [
    {status: 'Pending', count: Number},
    {status: 'Accepted', count: Number},
    // ... etc
  ]
}
```

**Usage Pattern**:
- Called once on Dashboard mount with `engineerId`
- Displays status badges (Pending, Progress, Completed, Cancelled)
- Shows count of schedules in each status
- Data used in [Dashboard.jsx](src/components/dashboard/index.jsx#L35-L250) for badge display

---

### 1.3 Get By User Endpoint: `getByUser`

**File Reference (Frontend)**:
- Hook: [src/hooks/useScheduler.jsx](src/hooks/useScheduler.jsx#L160-L180)

**API Configuration**:
```javascript
// From config/index.js
SCHEDULER.getByUser: `${HOST_API_ADDRESS}scheduler`
```

**Request Details**:
```javascript
// From useScheduler.jsx - handleMySchedules and handleMySchedulesByDates
Method: GET
URL: http://192.168.1.74:3000/api/scheduler
Query Parameters (Basic):
  - action: 'getByUser'
  
Query Parameters (With Date Range):
  - action: 'getByUser'
  - startDate: {YYYY-MM-DD}
  - endDate: {YYYY-MM-DD}
```

**Response**: Object with data array
```javascript
{
  data: [
    {
      _id: ObjectId,
      // ... schedule fields (same as getEngineerSchedules)
    }
  ]
}
```

**Usage Pattern**:
- Gets all schedules for authenticated user
- Can filter by date range (month view)
- Transforms to calendar-marked dates using `getMarkedDatesFromEvents()`

---

### 1.4 CRUD Endpoints

**Create**: 
```javascript
Method: POST
URL: http://192.168.1.74:3000/api/scheduler
Body: {title, status, startDate, endDate, description, engineer/user}
```

**Update**:
```javascript
Method: PUT
URL: http://192.168.1.74:3000/api/scheduler
Query: ?id={schedule_id}&action=update
Body: {title, status, startDate, endDate, description}
```

**Delete**:
```javascript
Method: DELETE
URL: http://192.168.1.74:3000/api/scheduler
Query: ?id={schedule_id}
```

**Update Status**:
```javascript
Method: PUT
URL: http://192.168.1.74:3000/api/scheduler
Query: (implicit action: updatestatus)
Body: {status}
```

---

## 2. Service Function

Based on frontend usage patterns, the backend likely has a service like:

### Expected: `getEngineerScheduleStatusAggregate()`

```javascript
// Likely signature in backend service
async function getEngineerScheduleStatusAggregate(engineerId, statusArray) {
  // Query scheduler collection where:
  // - engineer/user field matches engineerId
  // - status field is in statusArray
  // 
  // Returns aggregated counts by status
}
```

**Inferred Location**: `app/api/services/scheduler.js`

**Implementation Pattern** (expected):
- Queries Scheduler model with engineer filter
- Groups/counts by status field
- Returns aggregated results
- Filters applied: `{engineer: engineerId, status: {$in: statusArray}}`

---

## 3. Scheduler Model Definition

### Expected Schema Structure

```javascript
// Expected MongoDB Schema
const SchedulerSchema = {
  _id: ObjectId,
  
  // Reference fields
  engineer: ObjectId,        // Reference to User/Engineer document
  user: ObjectId,            // Alternative or alias for engineer
  project: ObjectId,         // Reference to Project
  integrator: ObjectId,      // Reference to company/organization
  
  // Schedule details
  title: String,             // Required, max 250 chars (from validator)
  description: String,       // Optional
  status: String,            // Required - see status enum below
  
  // Time fields
  startDate: ISODate,        // Start date-time
  endDate: ISODate,          // End date-time
  startTime: String,         // Time portion (HH:MM)
  endTime: String,           // Time portion (HH:MM)
  
  // Location info (inferred from project geofence)
  latitude: Number,          // Optional
  longitude: Number,         // Optional
  siteName: String,          // Optional - project/site name
  completeAddress: String,   // Optional
  radius: Number,            // Optional - geofence radius
  
  // Metadata
  createdAt: ISODate,
  updatedAt: ISODate,
  
  // Possible additional fields
  priority: String,          // Low, Medium, High
  ppe: Array,               // Personal protective equipment
  activeDays: Array,        // 1-7 (Mon-Sun) for recurring schedules
}

// Status Enum
Status Values:
  - 'Pending'       // Awaiting confirmation
  - 'Accepted'      // Accepted by engineer
  - 'Declined'      // Declined by engineer
  - 'Ready'         // Ready to start
  - 'ReadyToStart'  // Variant of ready
  - 'InProgress'    // Currently in progress
  - 'Progress'      // Alternative status during work
  - 'Completed'     // Work completed
  - 'Cancelled'     // Cancelled by system/manager
  - 'Lock'          // Locked status (UI color mapping exists)
```

### Field Usage Patterns

| Field | Usage | Notes |
|-------|-------|-------|
| `engineer` | Filtering in all queries | PRIMARY KEY for engineer filtering |
| `status` | Filtering and aggregation | Used in all list endpoints |
| `startDate` | Filtering, marking, UI display | ISO8601 format |
| `endDate` | Filtering, marking, UI display | ISO8601 format |
| `startTime` | UI display only | HH:MM format |
| `endTime` | UI display only | HH:MM format |
| `project` | Navigation reference | Links to project details |
| `title` | Primary display field | Shows in timeline UI |
| `_id` | Reference, marking | Used as calendar mark ID |

---

## 4. Query Filtering Patterns

### Filter by Engineer

**Query Parameter**: `engineerId`
**Backend Query**:
```javascript
{
  engineer: ObjectId(engineerId)
  // OR
  user: ObjectId(engineerId)
}
```

**Endpoints Using**:
- `getEngineerSchedules` - Required parameter
- `engineerStatusAggregate` - Required parameter

### Filter by Status

**Query Parameter**: `status` (array)
**Backend Query**:
```javascript
{
  status: {$in: ['Ready', 'ReadyToStart', 'InProgress', 'Progress', 'Pending', 'Accepted']}
}
```

**Endpoints Using**:
- All list endpoints
- Predefined set of 6 status values always passed

### Filter by Date

**Query Parameters**: `date` (single) or `startDate`/`endDate` (range)
**Backend Query**:
```javascript
// Single date - likely same day range
{
  startDate: {$gte: '2025-01-15T00:00:00Z'},
  endDate: {$lt: '2025-01-16T00:00:00Z'}
}

// Date range
{
  startDate: {$gte: startDate},
  endDate: {$lte: endDate}
}
```

**Endpoints Using**:
- `getEngineerSchedules` - Required
- `getByUser` - Optional

---

## 5. Frontend Hook Implementation

### useScheduler Hook Location
[src/hooks/useScheduler.jsx](src/hooks/useScheduler.jsx)

### Key Functions

```javascript
// Get schedules for specific date and engineer
handleSchedules({date, engineerId})
  → GET /scheduler?action=getEngineerSchedules&date=YYYY-MM-DD&engineerId=...&status=[...]

// Get status aggregate for engineer
handleScheduleStatus({engineerId})
  → GET /scheduler?action=engineerStatusAggregate&engineerId=...&status=[...]

// Get all user schedules
handleMySchedules()
  → GET /scheduler?action=getByUser

// Get user schedules by date range
handleMySchedulesByDates(months)
  → GET /scheduler?action=getByUser&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD

// Create new schedule
handleSave(body)
  → POST /scheduler with schedule data

// Update existing schedule
handleEdit(body, id)
  → PUT /scheduler?id={id}&action=update

// Delete schedule
handleDelete(id)
  → DELETE /scheduler?id={id}
```

### Transformation Function

```javascript
// From src/utils/help.js
schedulesTransformal(data) {
  // Transforms raw API response to UI-friendly format
  return data.map(item => ({
    id: item._id,
    title: item.title,
    time: item.startTime,
    endTime: item.endTime,
    metta: {
      status: item.status,
      project: item.project
    }
  }))
}
```

---

## 6. Frontend Components Using Scheduler

### Dashboard Component
**File**: [src/components/dashboard/index.jsx](src/components/dashboard/index.jsx)
- Uses: `engineerStatusAggregate` 
- Displays: Status badges (Pending, Progress, Completed, Cancelled counts)
- Data Field: `data` (from handleScheduleStatus)

### Calendar Stripe Component
**File**: [src/components/calender/calendarStripe.jsx](src/components/calender/calendarStripe.jsx)
- Uses: `getEngineerSchedules`
- Displays: Timeline of schedules for selected date
- Data Field: `data` (transformed via schedulesTransformal)

### Validator
**File**: [src/validator/schedulerValidator.js](src/validator/schedulerValidator.js)
```javascript
Fields validated:
  - title: Required, max 250 characters
  - status: Required
  - startDate: YYYY-MM-DD format
  - endDate: YYYY-MM-DD format
  - description: Optional
  - user: Optional engineer reference
```

---

## 7. Status Color Mapping

```javascript
// From useScheduler.jsx
const statusColorMap = {
  Accepted: '#4ade80',      // Green
  Pending: '#b45309',       // Amber/Orange
  Declined: '#f87171',      // Red
  Lock: '#d1d5db',          // Gray
};

// Additional colors from dashboard
Pending → indigo[400]
Progress → orange[300]
Completed → green[500]
Cancelled → pink[500]
```

---

## 8. API Configuration

**File**: [config/index.js](config/index.js)

```javascript
// Base URL (currently staging)
const HOST_API_ADDRESS = "http://192.168.1.74:3000/api/";

// Scheduler endpoints
export const SCHEDULER = {
  createOne: `${HOST_API_ADDRESS}scheduler`,          // POST
  updateOne: `${HOST_API_ADDRESS}scheduler`,          // PUT
  updatestatus: `${HOST_API_ADDRESS}scheduler`,       // PUT (status only)
  removeOne: `${HOST_API_ADDRESS}scheduler`,          // DELETE
  getByUser: `${HOST_API_ADDRESS}scheduler`,          // GET + action
  getEngineerSchedules: `${HOST_API_ADDRESS}scheduler`, // GET + action
  engineerStatusAggregate: `${HOST_API_ADDRESS}scheduler`, // GET + action
};
```

---

## 9. Data Flow Summary

```
┌─────────────────────────────────────────────────────────┐
│                 React Native App                         │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Dashboard Component          Calendar Component         │
│         │                             │                  │
│         ├─→ engineerStatusAggregate ─┤                  │
│         │   (status counts)          │                  │
│         │                            ├─→ getEngineerSchedules
│         │                                (specific date)
│         │                                                 │
│         └────────────────────────────────────────────┐   │
│                                                      │   │
│         ↓ Both use useScheduler hook               │   │
│                                                      │   │
└──────────────────────────────────────────────────────┼───┘
                                                       │
                    HTTP GET/POST/PUT/DELETE           │
                                                       ↓
            ┌─────────────────────────────────────────────┐
            │    Backend API Server                       │
            │   http://192.168.1.74:3000/api/scheduler   │
            ├─────────────────────────────────────────────┤
            │  Route Handler (app/api/scheduler/route.js)│
            │        ↓                                    │
            │  Service (app/api/services/scheduler.js)   │
            │        ↓                                    │
            │  MongoDB Scheduler Collection               │
            │  [documents with engineer, status, dates]  │
            └─────────────────────────────────────────────┘
```

---

## 10. Important Notes

⚠️ **Backend Files NOT in This Workspace**
- Expected Path: `app/api/scheduler/route.js`
- Expected Path: `app/api/services/scheduler.js`
- Expected Model: Scheduler schema definition
- **Actual Location**: Separate backend server at `http://192.168.1.74:3000/`
- **Action Required**: Access backend repository to view actual implementation

✅ **What WAS Found**:
- Complete frontend integration patterns
- API endpoints and query parameters
- Data transformation logic
- Validator rules
- Component integration
- Field usage and relationships
- Status values and color mappings

---

## 11. Quick Reference Table

| Aspect | Value | Reference |
|--------|-------|-----------|
| **Mobile Schedules Endpoint** | `getEngineerSchedules` | [useScheduler.jsx:306](src/hooks/useScheduler.jsx#L306) |
| **Status Aggregate Endpoint** | `engineerStatusAggregate` | [useScheduler.jsx:339](src/hooks/useScheduler.jsx#L339) |
| **Engineer Filter Field** | `engineerId` (query param) | [config/index.js](config/index.js) |
| **Backend Engineer Field** | `engineer` or `user` | Inferred |
| **Primary Status Values** | 6: Ready, ReadyToStart, InProgress, Progress, Pending, Accepted | [useScheduler.jsx:314-319](src/hooks/useScheduler.jsx#L314) |
| **Date Filter Format** | ISO8601: YYYY-MM-DD | [calendarStripe.jsx:45](src/components/calender/calendarStripe.jsx#L45) |
| **Time Format** | HH:MM | [help.js:797](src/utils/help.js#L797) |
| **Validator File** | schedulerValidator.js | [src/validator/](src/validator/schedulerValidator.js) |
| **Hook Consumer** | Dashboard, Calendar, Calendar Stripe | [dashboard/index.jsx](src/components/dashboard/index.jsx), [calendarStripe.jsx](src/components/calender/calendarStripe.jsx) |
| **Transform Function** | schedulesTransformal() | [help.js:795](src/utils/help.js#L795) |
| **Backend API Base** | http://192.168.1.74:3000/api/ | [config/index.js:3](config/index.js#L3) |

---

**Report Generated**: 2026-05-27  
**Workspace**: `/Users/appdev/dev/snatchi`  
**Report Type**: Frontend API Integration Analysis
