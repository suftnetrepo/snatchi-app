# Engineer Schedule Aggregate - Fix Action Plan

## 📋 Overview

The engineer schedule status aggregate API returns all zeros while the engineer schedule list endpoint returns correct schedules. This indicates the aggregate query is using a different field or condition.

**Test Engineer ID:** `679735d6e0a110edbc266745`

---

## ⚠️ Important

**The backend code is NOT in this React Native mobile app workspace.**

The backend API running at `http://192.168.1.74:3000/api/` is in a **separate backend repository**.

You need to:
1. Access the backend repository
2. Locate the files mentioned below
3. Follow the fix steps

---

## 🎯 Step-by-Step Fix Plan

### Phase 1: Setup & Investigation

#### Step 1.1: Access Backend Repository
```bash
# Clone or navigate to backend repo
cd ~/path/to/backend-repo
```

#### Step 1.2: Locate Files
Find these files in the backend repo:
```
app/api/scheduler/route.js
app/api/services/scheduler.js
models/Scheduler.js (or app/models/scheduler.js)
```

#### Step 1.3: Verify Node Version
```bash
node --version  # Should be compatible with backend setup
npm --version
```

---

### Phase 2: Debug the Broken Aggregate

#### Step 2.1: Add Comprehensive Logging
Edit `app/api/services/scheduler.js` - find `getEngineerScheduleStatusAggregate()` function:

```javascript
async function getEngineerScheduleStatusAggregate(engineerId, statusArray = [], options = {}) {
  try {
    // ADD THESE LOGS
    console.log('\n=== ENGINEER STATUS AGGREGATE DEBUG ===');
    console.log('1. Input engineerId:', engineerId);
    console.log('2. Input type:', typeof engineerId);
    console.log('3. Is valid ObjectId?', mongoose.Types.ObjectId.isValid(engineerId));
    
    const engineerObjectId = new mongoose.Types.ObjectId(engineerId);
    console.log('4. Converted ObjectId:', engineerObjectId.toString());
    
    // TEST: Find raw documents
    const sampleDocs = await Scheduler.find({ engineer: engineerObjectId }).limit(5);
    console.log('5. Direct find result count:', sampleDocs.length);
    console.log('6. Sample docs:', sampleDocs.map(doc => ({
      id: doc._id,
      engineer: doc.engineer,
      status: doc.status,
      startDate: doc.startDate,
      endDate: doc.endDate
    })));
    
    // Build match query
    const match = {
      engineer: engineerObjectId
    };
    
    // Add status filter if provided
    if (statusArray && statusArray.length > 0) {
      match.status = { $in: statusArray };
      console.log('7. Status filter applied:', statusArray);
    }
    
    console.log('8. Match query:', JSON.stringify(match, null, 2));
    
    // TEST: Run aggregation
    const raw = await Scheduler.aggregate([
      { $match: match },
      { $group: { 
        _id: '$status', 
        count: { $sum: 1 } 
      }}
    ]);
    
    console.log('9. Aggregation raw result:', JSON.stringify(raw, null, 2));
    console.log('10. Total docs in aggregate:', raw.reduce((sum, r) => sum + r.count, 0));
    
    // Continue with rest of implementation...
    
  } catch (error) {
    console.error('ERROR in getEngineerScheduleStatusAggregate:', error);
    throw error;
  }
}
```

#### Step 2.2: Test the Debug Query
```bash
# In your terminal, make a request:
curl "http://192.168.1.74:3000/api/scheduler?action=engineerStatusAggregate&engineerId=679735d6e0a110edbc266745"

# Check backend console for debug logs
# Look specifically at:
# - "Direct find result count" - if 0, field/data issue
# - "Aggregation raw result" - if [], query is wrong
```

#### Step 2.3: Analyze Log Output

**If Direct Find Count = 0 (BUG 1: Field Name Mismatch)**
```
5. Direct find result count: 0
```
→ The `engineer` field doesn't match. Test other field names:

```javascript
// Add these debug lines
const test1 = await Scheduler.find({ user: engineerObjectId }).limit(1);
const test2 = await Scheduler.find({ assignedEngineer: engineerObjectId }).limit(1);
const test3 = await Scheduler.find({ engineerId: engineerObjectId }).limit(1);

console.log('Test with "user" field:', test1.length);
console.log('Test with "assignedEngineer" field:', test2.length);
console.log('Test with "engineerId" field:', test3.length);
```

→ Whichever returns > 0 is the correct field name

**If Direct Find Count > 0 but Aggregation Count = 0 (BUG 2: Status Normalization)**
```
5. Direct find result count: 5
9. Aggregation raw result: []
```
→ Status filter is too restrictive. Check the statuses in the documents:

```javascript
// Add this
const allStatuses = await Scheduler.aggregate([
  { $match: { engineer: engineerObjectId } },
  { $group: { _id: '$status', count: { $sum: 1 } } }
]);

console.log('All statuses in DB for this engineer:', allStatuses);
```

---

### Phase 3: Fix the Implementation

#### Step 3.1: Fix Field Name (if needed)
```javascript
// If the issue is field name, change:
// From: { engineer: engineerObjectId }
// To:   { user: engineerObjectId }        // or assignedEngineer
```

#### Step 3.2: Fix ObjectId Conversion (if needed)
```javascript
// Ensure always converting string to ObjectId:
const engineerObjectId = new mongoose.Types.ObjectId(engineerId);

// NEVER use raw string:
// ❌ const match = { engineer: engineerId };

// ✅ Always:
const match = { engineer: engineerObjectId };
```

#### Step 3.3: Implement Status Normalization
```javascript
// Add this helper function in the file:

function normalizeSchedulerStatus(status) {
  if (!status) return null;
  
  const normalizations = {
    'Progress': 'InProgress',
    'In Progress': 'InProgress',
    'progress': 'InProgress',
    'in progress': 'InProgress',
    'Ready': 'ReadyToStart',
    'ready': 'ReadyToStart',
  };
  
  // Return normalized or original (with proper casing)
  return normalizations[status] || status;
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

#### Step 3.4: Implement Corrected Aggregate Function
```javascript
async function getEngineerScheduleStatusAggregate(engineerId, statusArray = [], options = {}) {
  try {
    // STEP 1: Validate and convert engineerId to ObjectId
    if (!mongoose.Types.ObjectId.isValid(engineerId)) {
      throw new Error(`Invalid engineerId: ${engineerId}`);
    }
    
    const engineerObjectId = new mongoose.Types.ObjectId(engineerId);
    
    // STEP 2: Build match query
    const match = {
      engineer: engineerObjectId  // ← KEY FIX: Correct field name + ObjectId
    };
    
    // STEP 3: Apply status filter if provided
    // Note: Don't filter if statusArray is empty - aggregate ALL statuses
    if (statusArray && Array.isArray(statusArray) && statusArray.length > 0) {
      match.status = { $in: statusArray };
    }
    
    // STEP 4: Apply date filter ONLY if dates provided
    if (options.startDate || options.endDate) {
      if (!match.startDate) match.startDate = {};
      if (options.endDate) {
        match.endDate = { $gte: new Date(options.endDate) };
      }
      if (options.startDate) {
        match.startDate = { $lte: new Date(options.startDate) };
      }
    }
    
    // STEP 5: Run aggregation
    const raw = await Scheduler.aggregate([
      { $match: match },
      { $group: { 
        _id: '$status', 
        count: { $sum: 1 } 
      }}
    ]);
    
    // STEP 6: Initialize response structure
    const byStatus = initializeStatusCounts();
    let total = 0;
    
    // STEP 7: Map aggregation results with normalization
    raw.forEach(row => {
      const normalized = normalizeSchedulerStatus(row._id);
      
      // Only count recognized statuses
      if (byStatus.hasOwnProperty(normalized)) {
        byStatus[normalized] = (byStatus[normalized] || 0) + row.count;
        total += row.count;
      } else {
        // Log unexpected statuses for debugging
        console.warn(`Unexpected status in DB: "${row._id}" (normalized: "${normalized}") with count: ${row.count}`);
      }
    });
    
    // STEP 8: Return formatted response
    return {
      total,
      byStatus
    };
    
  } catch (error) {
    console.error('Error in getEngineerScheduleStatusAggregate:', error.message);
    throw error;
  }
}
```

#### Step 3.5: Update Route Handler (if needed)
In `app/api/scheduler/route.js`, ensure the route handler calls the fixed function:

```javascript
if (req.query.action === 'engineerStatusAggregate') {
  try {
    const engineerId = req.query.engineerId;
    const statusArray = req.query.status ? req.query.status.split(',') : [];
    
    // Optional: add date filters from query params
    const options = {
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };
    
    // Call the fixed service function
    const result = await getEngineerScheduleStatusAggregate(
      engineerId,
      statusArray,
      options
    );
    
    return res.status(200).json(result);
    
  } catch (error) {
    console.error('Error in engineerStatusAggregate:', error);
    return res.status(400).json({ 
      error: error.message,
      total: 0,
      byStatus: initializeStatusCounts()
    });
  }
}
```

---

### Phase 4: Testing

#### Step 4.1: Test with Known Engineer
```bash
# Test request:
curl "http://192.168.1.74:3000/api/scheduler?action=engineerStatusAggregate&engineerId=679735d6e0a110edbc266745"

# Expected response (should have non-zero counts):
{
  "total": 3,
  "byStatus": {
    "Pending": 1,
    "Accepted": 2,
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

#### Step 4.2: Compare with Working Endpoint
```bash
# For same engineer:
curl "http://192.168.1.74:3000/api/scheduler?action=getEngineerSchedules&engineerId=679735d6e0a110edbc266745&date=2026-05-27&status=Pending,Accepted"

# Count the results manually
# Verify the total from aggregate matches or exceeds this count
```

#### Step 4.3: Test Status Normalization
```bash
# If DB has "Progress", it should be counted as "InProgress":
curl "http://192.168.1.74:3000/api/scheduler?action=engineerStatusAggregate&engineerId=679735d6e0a110edbc266745"

# Response should have non-zero InProgress count even if DB stores "Progress"
```

#### Step 4.4: Test Empty Results
```bash
# Test with an engineer that has no schedules:
curl "http://192.168.1.74:3000/api/scheduler?action=engineerStatusAggregate&engineerId=000000000000000000000000"

# Should return:
{
  "total": 0,
  "byStatus": {
    // ... all zeros
  }
}
```

---

### Phase 5: Security & Edge Cases

#### Step 5.1: Verify Security Rules
```javascript
// Ensure these checks exist in route handler:

// Engineer can only query their own schedules
if (req.user.role === 'engineer') {
  const userIdObj = new mongoose.Types.ObjectId(req.user._id);
  const queryIdObj = new mongoose.Types.ObjectId(engineerId);
  
  if (!userIdObj.equals(queryIdObj)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
}

// Integrator can only query their engineers
if (req.user.role === 'integrator') {
  const engineer = await Engineer.findById(engineerId);
  if (engineer.integrator !== req.user._id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
}
```

#### Step 5.2: Handle Edge Cases
```javascript
// Handle invalid ObjectId gracefully:
if (!mongoose.Types.ObjectId.isValid(engineerId)) {
  return res.status(400).json({ 
    error: 'Invalid engineerId format',
    total: 0,
    byStatus: initializeStatusCounts()
  });
}

// Handle null/undefined:
if (!engineerId) {
  return res.status(400).json({ 
    error: 'engineerId is required',
    total: 0,
    byStatus: initializeStatusCounts()
  });
}
```

---

### Phase 6: Add Tests

#### Step 6.1: Add Unit Tests
Create file: `__tests__/services/scheduler.test.js`

```javascript
describe('getEngineerScheduleStatusAggregate', () => {
  
  it('should return counts for existing engineer schedules', async () => {
    const engineerId = '679735d6e0a110edbc266745';
    const result = await getEngineerScheduleStatusAggregate(engineerId);
    
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('byStatus');
    expect(result.total).toBeGreaterThan(0);
    expect(result.byStatus.Pending + result.byStatus.Accepted).toBeGreaterThan(0);
  });
  
  it('should return zero for non-existent engineer', async () => {
    const engineerId = '000000000000000000000000';
    const result = await getEngineerScheduleStatusAggregate(engineerId);
    
    expect(result.total).toBe(0);
    Object.values(result.byStatus).forEach(count => {
      expect(count).toBe(0);
    });
  });
  
  it('should normalize Progress to InProgress', async () => {
    const engineerId = '679735d6e0a110edbc266745';
    const result = await getEngineerScheduleStatusAggregate(engineerId);
    
    // If any Progress statuses exist in DB, they should be in InProgress count
    expect(result.byStatus.InProgress).toBeGreaterThanOrEqual(0);
    expect(result.byStatus.Progress).toBeUndefined();
  });
  
  it('should filter by status array when provided', async () => {
    const engineerId = '679735d6e0a110edbc266745';
    const result = await getEngineerScheduleStatusAggregate(
      engineerId,
      ['Pending', 'Accepted']
    );
    
    // Only these statuses should have counts
    const total = result.byStatus.Pending + result.byStatus.Accepted;
    expect(total).toBe(result.total);
  });
  
  it('should throw error for invalid ObjectId', async () => {
    expect(async () => {
      await getEngineerScheduleStatusAggregate('invalid-id');
    }).rejects.toThrow();
  });
  
});
```

---

## ✅ Checklist

- [ ] **Phase 1: Setup**
  - [ ] Backend repo accessed
  - [ ] Files located: `scheduler.js`, `route.js`, `Scheduler.js`
  - [ ] Node/npm versions compatible

- [ ] **Phase 2: Debug**
  - [ ] Logging added to `getEngineerScheduleStatusAggregate()`
  - [ ] Debug query executed with test engineer ID
  - [ ] Logs analyzed for root cause
  - [ ] Field name identified (engineer vs user vs assignedEngineer)

- [ ] **Phase 3: Fix**
  - [ ] ObjectId conversion verified
  - [ ] Field name corrected
  - [ ] Status normalization added
  - [ ] Function refactored with all fixes
  - [ ] Route handler updated

- [ ] **Phase 4: Test**
  - [ ] Test with known engineer (679735d6e0a110edbc266745)
  - [ ] Response returns non-zero total
  - [ ] Counts compared with working endpoint
  - [ ] Status normalization verified
  - [ ] Empty result case tested

- [ ] **Phase 5: Security**
  - [ ] Engineer can only query own schedules
  - [ ] Integrator scope verified
  - [ ] Error handling for invalid IDs
  - [ ] Null/undefined handling

- [ ] **Phase 6: Tests**
  - [ ] Unit tests added for aggregate function
  - [ ] All test cases passing
  - [ ] Regression tests prevent future issues

---

## 📊 Expected Results

**Before Fix:**
```json
{
  "total": 0,
  "byStatus": {
    "Pending": 0,
    "Accepted": 0,
    // ... all zeros
  }
}
```

**After Fix:**
```json
{
  "total": 5,
  "byStatus": {
    "Pending": 1,
    "Accepted": 2,
    "Approved": 0,
    "AwaitingPayment": 0,
    "ReadyToStart": 1,
    "InProgress": 1,
    "Completed": 0,
    "Cancelled": 0,
    "PaymentFailed": 0,
    "Declined": 0,
    "Paid": 0
  }
}
```

---

## 📝 Documentation

Create final report: `ENGINEER_SCHEDULE_STATUS_AGGREGATE_ZERO_FIX_REPORT.md`

Include:
- Root cause identified
- Field mismatch (if found)
- Before/after API response
- Files modified with line numbers
- Tests added
- Deployment notes

