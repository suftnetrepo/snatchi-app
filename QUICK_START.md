# Engineer Schedule Aggregate Bug - Quick Start

## 🐛 The Problem

**API Endpoint:** `GET /api/scheduler?action=engineerStatusAggregate&engineerId=679735d6e0a110edbc266745`

**Current Response (WRONG):**
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

**Expected Response (CORRECT):**
```json
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

**Why?** While this aggregate returns 0, the mobile app CAN see the same schedules using:
- `GET /api/scheduler?action=getEngineerSchedules&engineerId=679735d6e0a110edbc266745&date=2026-05-27`

---

## 📄 Documentation Files

Four comprehensive documents have been created in this workspace:

### 1. **FIX_ACTION_PLAN.md** ← START HERE
Step-by-step instructions to fix the backend:
- Phase 1: Setup
- Phase 2: Debug with logging
- Phase 3: Implement fix
- Phase 4: Test
- Phase 5: Security
- Phase 6: Add tests

### 2. **ENGINEER_SCHEDULE_AGGREGATE_FIX_GUIDE.md**
Detailed technical guide:
- Root cause analysis
- Probable bugs (field name, ObjectId conversion, status normalization)
- Debug steps with code examples
- Fix template with complete implementation
- Security considerations

### 3. **FRONTEND_API_ANALYSIS.md**
Complete frontend API documentation:
- Working endpoint: `getEngineerSchedules` (✅ returns schedules)
- Broken endpoint: `engineerStatusAggregate` (❌ returns zeros)
- Expected response structure
- Status values mapping
- Test engineer ID: `679735d6e0a110edbc266745`

### 4. **SCHEDULER_API_EXPLORATION.md**
Complete API exploration results:
- Schema structure
- Frontend hooks analysis
- Data flow diagram
- Status and color mappings

---

## 🚀 Quick Start (5 minutes)

### 1. Access Backend Repository
This React Native mobile app calls a **separate backend server**. You need to:
```bash
cd ~/path/to/snatchi-backend
```

The backend runs at: `http://192.168.1.74:3000/api/`

### 2. Find the Broken Code
Look for these files:
```
app/api/services/scheduler.js        ← Main service function
app/api/scheduler/route.js           ← API route handler
models/Scheduler.js (or app/models/) ← Database model
```

### 3. Search for Function
```javascript
// Find this function in scheduler.js:
async function getEngineerScheduleStatusAggregate(engineerId, ...) {
  // This is what returns all zeros
}
```

### 4. Most Likely Bug
In that function, look for a query like:
```javascript
// ❌ WRONG (likely current code)
const match = { user: engineerId };  // Wrong field!

// ✅ CORRECT (should be)
const engineerObjectId = new mongoose.Types.ObjectId(engineerId);
const match = { engineer: engineerObjectId };
```

### 5. Test the Fix
After implementing the fix from `FIX_ACTION_PLAN.md`, test:
```bash
curl "http://192.168.1.74:3000/api/scheduler?action=engineerStatusAggregate&engineerId=679735d6e0a110edbc266745"

# Should return total: 3, Pending: 1, Accepted: 2
```

---

## 🔍 The Debug Process

### If You Get Lost:

1. **Follow FIX_ACTION_PLAN.md Phase 2** - Add debug logs
2. **Run test query** with the test engineer ID
3. **Check logs** for:
   - "Direct find result count: 0?" → Field name is wrong
   - "Aggregation raw result: []?" → Status filter is wrong

### Key Test Engineer ID
```
679735d6e0a110edbc266745
```
This engineer has at least 3 schedules (1 Pending, 2 Accepted)

---

## 🎯 Expected Outcomes

**Phase 2 (Debug) - You'll discover:**
- The field name used (`engineer` vs `user` vs `assignedEngineer`)
- Whether ObjectId conversion is missing
- If status normalization is needed

**Phase 3 (Fix) - You'll implement:**
- Correct field name
- ObjectId conversion
- Status normalization

**Phase 4 (Test) - You'll verify:**
- Test query returns non-zero total
- Counts match working endpoint
- Edge cases handled

---

## ⚙️ Technical Summary

| Issue | Solution |
|-------|----------|
| Returns 0 instead of 3 | Fix aggregate query field name |
| Likely uses `user` field | Change to `engineer` ObjectId |
| No ObjectId conversion | Add: `new mongoose.Types.ObjectId(engineerId)` |
| Status variations not handled | Add normalization: `Progress` → `InProgress` |
| No error handling | Add validation and descriptive errors |

---

## 📋 Checklist

- [ ] Backend repo accessed
- [ ] `getEngineerScheduleStatusAggregate()` function found
- [ ] Debug logs added
- [ ] Test query executed
- [ ] Root cause identified (field name / ObjectId / status)
- [ ] Fix implemented
- [ ] Tests pass
- [ ] Final report created

---

## 💡 Key Insights

1. **Working Endpoint** has the correct query structure - copy its pattern
2. **Field Name Mismatch** is the most likely cause (90% probability)
3. **ObjectId Conversion** is critical - don't compare strings to ObjectIds
4. **Status Normalization** is needed for DB consistency
5. **Test Engineer ID** is your friend - use it to validate every step

---

## 📞 Need Help?

Refer to these docs in order:
1. `FIX_ACTION_PLAN.md` - Follow the phases
2. `ENGINEER_SCHEDULE_AGGREGATE_FIX_GUIDE.md` - For technical details
3. `FRONTEND_API_ANALYSIS.md` - For API contract/expected behavior
4. `SCHEDULER_API_EXPLORATION.md` - For full API documentation

---

## 🔗 Related Files in This Mobile App

- [src/hooks/useScheduler.jsx](src/hooks/useScheduler.jsx) - API calls
- [src/screens/home.jsx](src/screens/home.jsx) - Uses aggregate (dashboard)
- [src/components/calender/calendarStripe.jsx](src/components/calender/calendarStripe.jsx) - Uses working endpoint

(These are just for reference - the actual fix is in the backend)

---

## ✅ Success Criteria

When fixed, running:
```
GET /api/scheduler?action=engineerStatusAggregate&engineerId=679735d6e0a110edbc266745
```

Should return:
- ✅ `total > 0` (not 0)
- ✅ `byStatus.Pending > 0` (not 0)
- ✅ `byStatus.Accepted > 0` (not 0)
- ✅ Status values match all 11 expected keys

