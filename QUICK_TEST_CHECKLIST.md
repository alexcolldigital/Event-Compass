# Quick Test Checklist - Copy & Paste Ready

## ✅ Before Testing

Ensure:
- [ ] All files created/modified (check DETAILED_CHANGES_REFERENCE.md)
- [ ] No compilation errors (checked ✅)
- [ ] Backend running on port 5000
- [ ] Frontend development server running
- [ ] MongoDB connection working
- [ ] You have admin token and user token for testing

---

## 🧪 Test 1: Message Creates ChatSession

### Backend Test
```bash
# Get a valid user ID from your database
db.users.findOne({}, { _id: 1, email: 1 })

# Get another user ID
db.users.find({}, { _id: 1 }).limit(2)

# Copy both IDs for testing below
```

### Frontend Test
1. Open the chat app
2. Send a message to another user
3. Verify: No console errors
4. Check: Dormancy banner appears

### MongoDB Verification
```javascript
// Copy conversationId from browser console or URL
// Should be like: "userId1_userId2"

db.chatsessions.findOne({ conversationId: "userId1_userId2" })

// Expected output:
{
  conversationId: "userId1_userId2",
  lastActivityAt: ISODate("2026-08-30T..."), // Should be NOW
  isActive: true,
  endReason: null
}
```

✅ **Pass Criteria:** ChatSession exists with current timestamp

---

## 🧪 Test 2: Dormancy Banner Displays Correctly

### Test Setup
1. Open chat from Test 1
2. Verify banner is visible above messages

### Check Display
- [ ] Banner text shows "ℹ️ Auto-clear info" or similar
- [ ] Shows "This chat will be automatically cleared in 7 days"
- [ ] Progress bar exists (should be at 0%)
- [ ] Shows: "Inactive for: 0 days", "Auto-clear in: 7 days"
- [ ] Banner can be dismissed with X button

### API Verification
```bash
CONVERSATION_ID="userId1_userId2"
TOKEN="your_auth_token"

curl -X GET http://localhost:5000/api/messages/conversation/${CONVERSATION_ID}/status \
  -H "Authorization: Bearer ${TOKEN}"

# Expected response includes:
# "dormancyWarning": {
#   "daysInactive": 0,
#   "daysUntilClear": 7,
#   "willBeCleared": false,
#   "dormancyDays": 7
# }
```

✅ **Pass Criteria:** Banner displays and matches API data

---

## 🧪 Test 3: Admin Can See End Button

### Setup
- [ ] Login as admin user (or service provider)
- [ ] Open a chat with another user

### Check UI
- [ ] "End" button appears in header (red/primary color)
- [ ] Button text says "End"
- [ ] Button is clickable
- [ ] "Clear" button also visible

### Expected: 
- [ ] Regular users DON'T see "End" button
- [ ] Only admins/service_providers see it

### Check User Role
```javascript
// In browser console while logged in
// This should show your current user's role
const token = localStorage.getItem('authToken');
console.log(token);  // Decode or check server logs
```

✅ **Pass Criteria:** "End" button visible for admin/service provider only

---

## 🧪 Test 4: End Chat Modal Works

### Step 1: Click End Button
1. In chat header, click "End" button
2. Verify: Modal appears (should slide up from bottom)
3. Modal title: "End Chat Session"

### Step 2: Verify Modal Content
- [ ] Shows 3 options with icons:
  - ✓ User is Satisfied
  - ✗ User is Unsatisfied
  - 📞 Want to Follow Up
- [ ] Each option has description text
- [ ] Text field for "Additional Feedback (Optional)"
- [ ] Character count shows "0/500"
- [ ] Cancel and "End Session" buttons at bottom

### Step 3: Test Selection
1. Click first option (User is Satisfied)
2. Verify: Option highlights (background/border changes)
3. Click another option
4. Verify: First deselects, new one selects

### Step 4: Test Feedback
1. Type in feedback text field
2. Type more than one character
3. Verify: Character count updates (shows X/500)
4. Type 500+ characters
5. Verify: Input stops at 500 chars

✅ **Pass Criteria:** Modal displays all elements correctly

---

## 🧪 Test 5: Submit End Chat

### Step 1: Fill and Submit
1. In End Chat Modal, select "User is Satisfied"
2. Add feedback: "Customer was very helpful and satisfied"
3. Click "End Session" button
4. Verify: Button shows loading spinner briefly

### Step 2: Verify Success
- [ ] Modal closes
- [ ] Success alert appears: "✓ Chat ended. User is satisfied."
- [ ] No console errors

### Step 3: Check Backend Update
```bash
# Wait 2 seconds for response, then check MongoDB
db.chatsessions.findOne({ conversationId: "userId1_userId2" })

# Should now show:
{
  isActive: false,
  endedBy: ObjectId("adminUserId"),
  endReason: "user_satisfied",
  satisfactionFeedback: "Customer was very helpful and satisfied"
}
```

### Step 4: Verify UI Updates
1. Return to chat
2. Verify: "End" and "Clear" buttons DISAPPEAR from header
3. Verify: Dormancy banner shows "Chat ended - User satisfied"
4. Verify: Chat messages still visible (not deleted)

✅ **Pass Criteria:** Chat session marked as ended, UI updated, buttons hidden

---

## 🧪 Test 6: Socket.IO Real-Time Update

### Setup Two Browsers
1. Open chat in Browser A (as admin)
2. Open SAME chat in Browser B (as the other participant)
3. Make sure both can see messages

### Test Socket Event
1. In Browser A: Click "End" button → Select reason → Submit
2. Verify Browser A: Modal closes, buttons disappear
3. In Browser B: Without refreshing, wait 2 seconds
4. Verify Browser B: Dormancy banner changes to "Chat ended"

✅ **Pass Criteria:** Browser B updates without refresh via Socket.io

---

## 🧪 Test 7: Dormancy Countdown (Time Travel Test)

### Setup in MongoDB
```javascript
CONVERSATION_ID="userId1_userId2"

// Simulate 4 days of inactivity
db.chatsessions.updateOne(
  { conversationId: CONVERSATION_ID },
  { 
    $set: { 
      lastActivityAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    }
  }
)
```

### Test Display
1. Refresh browser
2. Open same chat
3. Verify dormancy banner changes to WARNING level:
   - Icon: ⏰
   - Title: "Chat will clear soon"
   - Color: Orange (warning)
   - Shows: "Inactive for: 4 days", "Auto-clear in: 3 days"

### Test Critical Level
```javascript
// Simulate 7 days of inactivity
db.chatsessions.updateOne(
  { conversationId: CONVERSATION_ID },
  { 
    $set: { 
      lastActivityAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  }
)
```

1. Refresh browser
2. Verify banner shows CRITICAL:
   - Icon: ⚠️
   - Title: "Chat clearing tomorrow"
   - Color: Red
   - Shows: "Inactive for: 7 days", "Auto-clear in: 0 days"

✅ **Pass Criteria:** Banner shows correct warning level at each stage

---

## 🧪 Test 8: Manual Dormancy Cleanup

### Step 1: Trigger Cleanup
```bash
ADMIN_TOKEN="your_admin_token"

curl -X POST http://localhost:5000/api/admin/maintenance/clear-dormant-chats \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"
```

### Expected Response
```json
{
  "success": true,
  "message": "Dormancy cleaner completed",
  "data": {
    "cleared": 1,
    "failed": 0,
    "conversationIds": ["userId1_userId2"]
  }
}
```

### Step 2: Verify Cleanup
```javascript
// Check messages are marked as deleted
db.messages.find({ conversationId: "userId1_userId2", isDeleted: false }).count()
// Should show: 0

// Check chat session
db.chatsessions.findOne({ conversationId: "userId1_userId2" })
// Should show:
{
  isActive: false,
  endReason: "dormant"
}
```

### Step 3: Test in Frontend
1. Open the cleared chat in browser
2. Verify: Dormancy banner shows "Chat cleared due to inactivity"
3. Verify: No messages visible
4. Verify: "End" button NOT visible

✅ **Pass Criteria:** Dormancy cleaner clears messages and marks session

---

## 🧪 Test 9: Error Handling

### Test Missing Required Field
```bash
CONVERSATION_ID="userId1_userId2"
TOKEN="your_token"

# Missing 'reason'
curl -X POST http://localhost:5000/api/messages/conversation/${CONVERSATION_ID}/end \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"feedback": "test"}'

# Expected: 400 error with message about required reason
```

### Test Invalid Reason
```bash
curl -X POST http://localhost:5000/api/messages/conversation/${CONVERSATION_ID}/end \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"reason": "invalid_reason"}'

# Expected: 400 error about invalid reason
```

### Test Unauthorized User
```bash
# Use regular user token (not admin/service provider)
TOKEN="regular_user_token"

curl -X POST http://localhost:5000/api/messages/conversation/${CONVERSATION_ID}/end \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"reason": "user_satisfied"}'

# Expected: 403 Forbidden error
```

✅ **Pass Criteria:** All errors handled gracefully with appropriate messages

---

## 🧪 Test 10: Integration Test (Full Flow)

### Step 1: Send Message (New Conversation)
1. User A sends message to User B
2. ChatSession created automatically
3. Frontend shows dormancy banner: "7 days remaining"

### Step 2: Check Status
1. Call GET status endpoint
2. Verify returns active session with 7 days

### Step 3: Admin Ends Chat
1. User A (admin) clicks "End" button
2. Selects "User is Satisfied"
3. Adds feedback: "Great service!"
4. Submits
5. Chat marked as ended in database

### Step 4: Verify Updates
1. Buttons disappear
2. Banner shows "Chat ended - User satisfied"
3. Messages still visible
4. Socket.io notifies User B

### Step 5: Trigger Cleanup
1. Manually set lastActivityAt to 7+ days ago
2. Call dormancy cleaner endpoint
3. Messages marked as deleted
4. Session shows endReason: "dormant"
5. Frontend shows "Chat cleared due to inactivity"

✅ **Pass Criteria:** Full flow works end-to-end

---

## 📊 Regression Tests (Ensure No Breakage)

### Existing Features Still Work
- [ ] Send/receive messages (no changes)
- [ ] Message read receipts (no changes)
- [ ] File uploads (no changes)
- [ ] Message delete (no changes)
- [ ] Typing indicators (no changes)
- [ ] Regular chat functionality (no changes)

### Verify No New Errors
- [ ] Browser console: No error messages
- [ ] Server logs: No errors or warnings
- [ ] MongoDB: No connection issues
- [ ] Socket.io: No connection issues

---

## 🔍 Final Verification Checklist

- [ ] All files compiled without errors
- [ ] No console errors in browser
- [ ] No errors in server logs
- [ ] MongoDB collections exist
- [ ] Indexes created (for performance)
- [ ] API endpoints respond correctly
- [ ] Socket.io events fire
- [ ] UI components display properly
- [ ] All 3 satisfaction reasons work
- [ ] Dormancy countdown accurate
- [ ] Auto-clear removes messages
- [ ] Backend auth working
- [ ] Role-based access working
- [ ] Error handling working
- [ ] Integration flow works end-to-end

---

## 📋 Test Results Template

Copy and paste this to document your test results:

```
## Chat Auto-Clear Testing Results
Date: ____________________
Tester: ____________________

### Test Results
- Test 1 (ChatSession Creation): ✅ Pass / ❌ Fail
  Notes: ___________________________________________
  
- Test 2 (Dormancy Banner): ✅ Pass / ❌ Fail
  Notes: ___________________________________________
  
- Test 3 (End Button): ✅ Pass / ❌ Fail
  Notes: ___________________________________________
  
- Test 4 (Modal UI): ✅ Pass / ❌ Fail
  Notes: ___________________________________________
  
- Test 5 (End Submit): ✅ Pass / ❌ Fail
  Notes: ___________________________________________
  
- Test 6 (Socket.io): ✅ Pass / ❌ Fail
  Notes: ___________________________________________
  
- Test 7 (Countdown): ✅ Pass / ❌ Fail
  Notes: ___________________________________________
  
- Test 8 (Auto-Clear): ✅ Pass / ❌ Fail
  Notes: ___________________________________________
  
- Test 9 (Error Handling): ✅ Pass / ❌ Fail
  Notes: ___________________________________________
  
- Test 10 (Integration): ✅ Pass / ❌ Fail
  Notes: ___________________________________________

### Issues Found
1. _________________________________________
2. _________________________________________
3. _________________________________________

### Overall Status
✅ Ready for Production / ⚠️ Needs Fixes / ❌ Major Issues

```

---

## 🚀 If All Tests Pass

Congratulations! 🎉

Your implementation is ready for:
1. Staging deployment
2. User acceptance testing
3. Production deployment

Next steps:
- [ ] Deploy to staging
- [ ] Run full UAT
- [ ] Collect feedback
- [ ] Deploy to production
- [ ] Monitor logs for errors
- [ ] Set up cron job for cleanup

---

**Total Test Coverage:** 10 comprehensive tests
**Estimated Testing Time:** 1-2 hours
**Success Rate Target:** 100% of tests passing

Good luck! 🍀
