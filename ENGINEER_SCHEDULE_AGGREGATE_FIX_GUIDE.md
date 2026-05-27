# Engineer Schedule Status Aggregate - Zero Count Bug Fix Guide

## Current Issue
API endpoint: `GET /api/scheduler?action=engineerStatusAggregate&engineerId=679735d6e0a110edbc266745`

Returns all zeros despite schedules existing in the database:
```json
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

## Root Cause Analysis - Probable Issues

Based on frontend code analysis, the aggregate query likely has one of these bugs:

### 1. **Field Name Mismatch** (Most Likely)
- **Working endpoint** (`getEngineerSchedules`): Filters by `engineer` field
- **Broken endpoint** (`engineerStatusAggregate`): Possibly queries wrong field like:
  - `user` instead of `engineer`
  - `assignedEngineer` instead of `engineer`
  - Raw string instead of ObjectId conversion

### 2. **Missing ObjectId Conversion**
```javascript
// ❌ WRONG - comparing string to ObjectId
{ engineer: engineerId }  // where engineerId = "679735d6e0a110edbc266745"

// ✅ CORRECT
const engineerObjectId = new mongoose.Types.ObjectId(engineerId);
{ engineer: engineerObjectId }
```

### 3. **Status Normalization Missing**
Frontend sends 6 statuses but DB might contain variations:
- `Progress` vs `InProgress` vs `In Progress`
- `Ready` vs `ReadyToStart`
- Case sensitivity issues

Response expects these 11 statuses:
```
Pending, Accepted, Approved, AwaitingPayment, ReadyToStart,
InProgress, Completed, Cancelled, PaymentFailed, Declined, Paid
```

But actual DB might have only:
```
Pending, Accepted, Ready/ReadyToStart, InProgress/Progress, Completed, Cancelled
```

### 4. **Tenant/Security Filter Blocking Results**
- Aggregate might apply tenant filter that excludes the engineer's schedules
- Security check might be rejecting valid engineer queries

### 5. **Date Filter Incorrectly Applied**
- If aggregate applies default date filter (e.g., only today's schedules)
- When no date parameter provided, it might use current date boundary that excludes all schedules

## Files to Check in Backend

### 1. **Backend API Route** (`app/api/scheduler/route.js`)
Look for the `engineerStatusAggregate` action handler:

```javascript
// Search for:
if (req.query.action === 'engineerStatusAggregate') {
  // Current implementation is here
}
```

**Verify:**
- ✅ `engineerId` parameter is extracted
- ✅ ObjectId conversion: `new mongoose.Types.ObjectId(engineerId)`
- ✅ Query uses correct field: `{ engineer: engineerObjectId }`
- ✅ Tenant filter (if applicable) is correct
- ✅ Date filter is only applied when date param provided

### 2. **Backend Service** (`app/api/services/scheduler.js`)
Look for function:
```javascript
async function getEngineerScheduleStatusAggregate(engineerId, options = {}) {
  // Current implementation is here
}
```

**Verify:**
- ✅ Receives `engineerId` (string from API)
- ✅ Converts to ObjectId
- ✅ Aggregation pipeline uses correct field match
- ✅ Status normalization logic

### 3. **Scheduler Model** (`models/Scheduler.js` or `app/models/scheduler.js`)
Verify field names match:
```javascript
{
  engineer: mongoose.Schema.Types.ObjectId,  // Should be ObjectId, not String
  status: String,  // Should be String
  // ... other fields
}
```

### 4. **Working Endpoint for Reference** (`getEngineerSchedules`)
Compare the aggregate implementation with the working list endpoint:
```javascript
// This one WORKS - returns visible schedules
if (req.query.action === 'getEngineerSchedules') {
  // This query structure is CORRECT - copy this pattern
}
```

## Frontend Evidence - What Should Match

### Frontend Hook Usage
File: `src/hooks/useScheduler.jsx`

**Working endpoint** (line 306):
```javascript
`/scheduler?action=getEngineerSchedules&engineerId=${engineerId}&date=${dateStr}&status=${statusStr}`
```

**Broken endpoint** (line 339):
```javascript
`/scheduler?action=engineerStatusAggregate&engineerId=${engineerId}&status=${statusStr}`
```

### Expected Response Structure
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

## Status Values Used in Frontend
From `src/screens/home.jsx` and dashboard components:
- `Pending`
- `Accepted`
- `Ready` / `ReadyToStart`
- `InProgress` / `Progress`
- `Completed`
- `Cancelled`

## Debug Steps

### Step 1: Add Logging
```javascript
console.log('✓ engineerId input:', engineerId);
console.log('✓ ObjectId valid:', mongoose.Types.ObjectId.isValid(engineerId));
console.log('✓ query match:', JSON.stringify(match));
```

### Step 2: Test Raw Queries
```javascript
const engineerObjectId = new mongoose.Types.ObjectId(engineerId);

// Test 1: With ObjectId
const sample1 = await Scheduler.find({ 
  engineer: engineerObjectId 
}).limit(5);
console.log('Sample with ObjectId:', sample1.length);

// Test 2: With string (if schema stores string)
const sample2 = await Scheduler.find({ 
  engineer: engineerId 
}).limit(5);
console.log('Sample with string:', sample2.length);

// Test 3: Alternative field names
const sample3 = await Scheduler.find({ 
  user: engineerObjectId 
}).limit(5);
console.log('Sample with "user" field:', sample3.length);
```

### Step 3: Verify Aggregation Pipeline
```javascript
const agg = await Scheduler.aggregate([
  { $match: { engineer: engineerObjectId } },
  { $group: { _id: '$status', count: { $sum: 1 } } }
]);
console.log('Aggregate raw result:', agg);
```

## Fix Template

Based on the working `getEngineerSchedules` pattern, the fix should follow this structure:

```javascript
async function getEngineerScheduleStatusAggregate(engineerId, tenant = null) {
  try {
    // Convert to ObjectId
    const engineerObjectId = new mongoose.Types.ObjectId(engineerId);
    
    // Build match query (copy pattern from working endpoint)
    const match = {
      engineer: engineerObjectId,  // ✓ Correct field name
      // Optional: status: { $in: ['Pending', 'Accepted', ...] }
    };
    
    // Add tenant filter if multi-tenant
    if (tenant) {
      match.tenant = tenant;
    }
    
    // Aggregation pipeline
    const raw = await Scheduler.aggregate([
      { $match: match },
      { $group: { 
        _id: '$status', 
        count: { $sum: 1 } 
      }}
    ]);
    
    // Normalize statuses and build response
    const byStatus = initializeStatusCounts();
    let total = 0;
    
    raw.forEach(row => {
      const normalized = normalizeStatus(row._id);
      byStatus[normalized] = (byStatus[normalized] || 0) + row.count;
      total += row.count;
    });
    
    return {
      total,
      byStatus
    };
  } catch (error) {
    console.error('getEngineerScheduleStatusAggregate error:', error);
    throw error;
  }
}

function normalizeStatus(status) {
  // Normalize variations
  const statusMap = {
    'Progress': 'InProgress',
    'In Progress': 'InProgress',
    'Ready': 'ReadyToStart',
    // ... other mappings
  };
  return statusMap[status] || status;
}

function initializeStatusCounts() {
  return {
    Pending: 0,
    Accepted: 0,
    Approved: 0,
    AwaitingPayment: 0,
    ReadyToStart: 0,
    InProgress: 0,
    Completed: 0,
    Cancelled: 0,
    PaymentFailed: 0,
    Declined: 0,
    Paid: 0
  };
}
```

## Testing the Fix

### Test 1: Verify ObjectId Match
```bash
GET /api/scheduler?action=engineerStatusAggregate&engineerId=679735d6e0a110edbc266745
```

Expected: `total > 0`

### Test 2: Compare with Working Endpoint
```bash
GET /api/scheduler?action=getEngineerSchedules&engineerId=679735d6e0a110edbc266745&date=2026-05-27&status=Pending,Accepted
```

The total count from aggregate should be >= the sum of these statuses from the list.

### Test 3: Verify Status Normalization
If DB has mixed case or variants:
- DB status: `"Progress"` → Response: `"InProgress": 5`
- DB status: `"InProgress"` → Response: `"InProgress": 3`
- Total InProgress: `8`

## Security Considerations

### Engineer User
```javascript
// ✅ Allow - engineer can query their own schedules
if (req.user.role === 'engineer' && req.user._id.toString() === engineerId) {
  // Allow
}

// ❌ Deny - engineer cannot query other engineer's schedules
if (req.user.role === 'engineer' && req.user._id.toString() !== engineerId) {
  throw new Error('Unauthorized');
}
```

### Integrator User
```javascript
// ✅ Allow - integrator can query engineers in their team
if (req.user.role === 'integrator') {
  const engineer = await Engineer.findById(engineerId);
  if (engineer.integrator === req.user._id) {
    // Allow
  }
}
```

**Important:** Do NOT reject based on comparing `req.user._id` (ObjectId from session) with `engineerId` (string from query param) - convert both to ObjectId for comparison.

## Next Steps

1. **Access Backend Repository** - Clone the backend code to your local machine
2. **Locate** `app/api/scheduler/route.js` and `app/api/services/scheduler.js`
3. **Add Debug Logs** - Follow "Debug Steps" above
4. **Run Test Query** - Execute the test query with engineerId=679735d6e0a110edbc266745
5. **Compare** - Look at logs to see what field is being queried vs what exists in DB
6. **Fix** - Apply the fix template, focusing on:
   - Correct field name: `engineer` not `user`
   - ObjectId conversion
   - Status normalization
7. **Test Again** - Verify counts now match
8. **Add Regression Tests** - Prevent this issue in future

---

## Quick Checklist

- [ ] Backend files accessed
- [ ] `engineerStatusAggregate` found in route handler
- [ ] Debug logs added and executed
- [ ] Field name verified (should be `engineer`)
- [ ] ObjectId conversion confirmed
- [ ] Aggregate query fixed
- [ ] Status normalization added
- [ ] Security checks reviewed
- [ ] Test with engineerId=679735d6e0a110edbc266745 passes
- [ ] Regression tests added
- [ ] Report created

