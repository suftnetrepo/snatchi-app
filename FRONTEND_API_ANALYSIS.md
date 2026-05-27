# Frontend API Analysis - Engineer Schedule Aggregate

## Current Issue
`GET /api/scheduler?action=engineerStatusAggregate&engineerId=679735d6e0a110edbc266745` returns all zeros.

---

## API Endpoints

### 1. Working Endpoint: `getEngineerSchedules` ✅
**Location**: [src/hooks/useScheduler.jsx](src/hooks/useScheduler.jsx#L306)

```javascript
const getEngineerSchedules = async (engineerId, date = null, statusArray = []) => {
  const dateStr = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  const statusStr = statusArray.join(',');
  
  return await fetch(`/scheduler?action=getEngineerSchedules&engineerId=${engineerId}&date=${dateStr}&status=${statusStr}`);
};
```

**Query Parameters:**
- `action` = `getEngineerSchedules`
- `engineerId` = ObjectId string (e.g., `679735d6e0a110edbc266745`)
- `date` = YYYY-MM-DD format (e.g., `2026-05-27`)
- `status` = comma-separated status values (e.g., `Pending,Accepted,Ready`)

**Response:** Returns array of schedule objects
```javascript
[
  {
    _id: ObjectId,
    engineer: ObjectId,
    status: String,
    startDate: ISO8601,
    endDate: ISO8601,
    // ... other fields
  }
]
```

**Used By:** [src/components/calender/calendarStripe.jsx](src/components/calender/calendarStripe.jsx)

---

### 2. Broken Endpoint: `engineerStatusAggregate` ❌
**Location**: [src/hooks/useScheduler.jsx](src/hooks/useScheduler.jsx#L339)

```javascript
const getEngineerStatusAggregate = async (engineerId, statusArray = []) => {
  const statusStr = statusArray.join(',');
  
  return await fetch(`/scheduler?action=engineerStatusAggregate&engineerId=${engineerId}&status=${statusStr}`);
};
```

**Query Parameters:**
- `action` = `engineerStatusAggregate`
- `engineerId` = ObjectId string (e.g., `679735d6e0a110edbc266745`)
- `status` = comma-separated status values (optional)

**Expected Response:** Should return status counts
```javascript
{
  total: number,
  byStatus: {
    Pending: number,
    Accepted: number,
    Approved: number,
    AwaitingPayment: number,
    ReadyToStart: number,
    InProgress: number,
    Completed: number,
    Cancelled: number,
    PaymentFailed: number,
    Declined: number,
    Paid: number
  }
}
```

**Actual Response:** All zeros (BUG)
```javascript
{
  total: 0,
  byStatus: {
    Pending: 0,
    Accepted: 0,
    // ... all zeros
  }
}
```

**Used By:** [src/screens/home.jsx](src/screens/home.jsx) - Dashboard status badges

---

## Schema Information

### Scheduler Document Schema (Inferred from Frontend)
```javascript
{
  _id: ObjectId,
  engineer: ObjectId,              // ← KEY FIELD: Should match engineerId
  project: ObjectId,
  status: String,                  // Values: Pending, Accepted, Ready, InProgress, Progress, Completed, Cancelled
  title: String,
  description: String,
  startDate: Date,                 // ISO8601
  endDate: Date,                   // ISO8601
  startTime: String,               // HH:MM
  endTime: String,                 // HH:MM
  latitude: Number,
  longitude: Number,
  siteName: String,
  radius: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Status Values Mapping

### Frontend Status Array (6 values)
Used when calling `getEngineerSchedules`:
```javascript
[
  'Pending',
  'Accepted',
  'Ready',          // ← Note: might be stored as 'ReadyToStart'
  'InProgress',     // ← Note: might be stored as 'Progress' in DB
  'Completed',
  'Cancelled'
]
```

### API Response Status Keys (11 values)
Expected in `engineerStatusAggregate` response:
```javascript
{
  Pending,          // matches frontend 'Pending'
  Accepted,         // matches frontend 'Accepted'
  Approved,         // additional status
  AwaitingPayment,  // additional status
  ReadyToStart,     // might match frontend 'Ready'
  InProgress,       // might match frontend 'InProgress' OR DB 'Progress'
  Completed,        // matches frontend 'Completed'
  Cancelled,        // matches frontend 'Cancelled'
  PaymentFailed,    // additional status
  Declined,         // additional status
  Paid              // additional status
}
```

### Status Normalization Needed
The aggregate function must normalize these variations:
```
'Progress' → 'InProgress'
'In Progress' → 'InProgress'
'Ready' → 'ReadyToStart'
```

---

## Test Engineer ID

**Known Engineer ID with Existing Schedules:**
```
679735d6e0a110edbc266745
```

**Test Queries:**

1. **Verify working endpoint returns schedules:**
   ```
   GET /api/scheduler?action=getEngineerSchedules&engineerId=679735d6e0a110edbc266745&date=2026-05-27&status=Pending,Accepted
   ```
   Expected: Array with at least 3 schedules

2. **Check broken aggregate endpoint:**
   ```
   GET /api/scheduler?action=engineerStatusAggregate&engineerId=679735d6e0a110edbc266745&status=Pending,Accepted
   ```
   Expected: `{ total: 3, byStatus: { Pending: 1, Accepted: 2, ... } }`
   Current: `{ total: 0, byStatus: { all: 0 } }`

---

## Frontend Usage Pattern

### Where Endpoints Are Called

#### 1. Dashboard (home.jsx)
```javascript
// Shows status badges like "2 Pending", "5 Accepted"
// Calls engineerStatusAggregate (BROKEN)
```

#### 2. Calendar (calendarStripe.jsx)  
```javascript
// Shows list of schedules for a specific date
// Calls getEngineerSchedules (WORKING)
// This is what should be aggregated in the other endpoint
```

---

## Backend Files to Check

**Backend Repository Location:** Separate from this frontend repo

### Files in Backend Repository:

1. **API Route Handler**
   ```
   app/api/scheduler/route.js
   ```
   Look for:
   ```javascript
   if (req.query.action === 'engineerStatusAggregate') {
     // ... current broken implementation
   }
   ```

2. **Service Function**
   ```
   app/api/services/scheduler.js
   ```
   Look for:
   ```javascript
   async function getEngineerScheduleStatusAggregate(engineerId, options) {
     // ... current broken implementation
   }
   ```

3. **Scheduler Model**
   ```
   models/Scheduler.js
   or
   app/models/scheduler.js
   ```
   Verify:
   - `engineer` field is ObjectId type
   - `status` field is String type
   - Field names match what's used in queries

---

## Likely Bugs

### Bug #1: Field Name Mismatch (Most Likely)
**Working Query:**
```javascript
{ engineer: ObjectId(engineerId) }
```

**Broken Query Likely Uses:**
```javascript
{ user: ObjectId(engineerId) }           // ❌ Wrong field
{ assignedEngineer: ObjectId(engineerId) }  // ❌ Wrong field
{ engineer: engineerId }                 // ❌ Not converted to ObjectId
```

### Bug #2: Missing ObjectId Conversion
```javascript
// ❌ WRONG - string comparison
const match = { engineer: engineerId };  // "679735d6e0a110edbc266745"

// ✅ CORRECT - ObjectId comparison
const engineerObjectId = new mongoose.Types.ObjectId(engineerId);
const match = { engineer: engineerObjectId };
```

### Bug #3: Status Normalization Missing
If DB has `'Progress'` but response keys expect `'InProgress'`:
```javascript
// Aggregate returns: { _id: 'Progress', count: 5 }
// But response expects: byStatus.InProgress = 5
// Current code likely just passes through: byStatus.Progress = 5
// So byStatus.InProgress = 0 (not found in DB)
```

---

## How to Reproduce

### Current Behavior
```bash
# Request
GET /api/scheduler?action=engineerStatusAggregate&engineerId=679735d6e0a110edbc266745

# Response
{
  "total": 0,
  "byStatus": {
    "Pending": 0,
    "Accepted": 0,
    "Approved": 0,
    "AwaitingPayment": 0,
    "ReadyToStart": 0,
    "InProgress": 0,
    "Completed": 0,
    "Cancelled": 0,
    "PaymentFailed": 0,
    "Declined": 0,
    "Paid": 0
  }
}
```

### But This Works
```bash
# Request (same engineer, same backend)
GET /api/scheduler?action=getEngineerSchedules&engineerId=679735d6e0a110edbc266745&date=2026-05-27&status=Pending,Accepted,Ready

# Response
[
  {
    "_id": "...",
    "engineer": "679735d6e0a110edbc266745",
    "status": "Pending",
    ...
  },
  {
    "_id": "...",
    "engineer": "679735d6e0a110edbc266745",
    "status": "Accepted",
    ...
  },
  ...
]
```

**Conclusion:** The aggregate query is using a different field or condition than the list query.

---

## Quick Reference

| Aspect | Detail |
|--------|--------|
| **Bug Location** | Backend: `app/api/services/scheduler.js` - `getEngineerScheduleStatusAggregate()` |
| **Likely Cause** | Field name mismatch (`engineer` vs `user`) OR missing ObjectId conversion |
| **Test Engineer ID** | `679735d6e0a110edbc266745` |
| **Working Endpoint** | `/scheduler?action=getEngineerSchedules` |
| **Broken Endpoint** | `/scheduler?action=engineerStatusAggregate` |
| **Key Field** | `engineer` (ObjectId type) |
| **Status Variations** | `Progress`/`InProgress`, `Ready`/`ReadyToStart` need normalization |
| **Security** | Engineer can only query own schedules; integrator can query team engineers |

