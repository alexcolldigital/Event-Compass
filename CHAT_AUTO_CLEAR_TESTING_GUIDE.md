# Chat Session Auto-Clear - Quick Start & Testing Guide

## Quick Setup

### 1. Backend Setup
No additional npm packages needed - uses existing dependencies.

### 2. Database Migration
The MongoDB schema is automatically created when the first chat session is initiated.

### 3. Environment Variables
No new environment variables required. Uses existing settings.

### 4. Optional: Set Up Automatic Dormancy Cleaning

Add to `backend/server.js`:

```javascript
const cron = require('node-cron');
const { clearDormantSessions } = require('./utils/chatSession');

// Run dormancy cleaner daily at 2 AM
if (process.env.NODE_ENV === 'production') {
  cron.schedule('0 2 * * *', async () => {
    console.log('[Dormancy Cleaner] Starting scheduled cleanup...');
    try {
      const results = await clearDormantSessions();
      console.log('[Dormancy Cleaner] Completed:', results);
    } catch (error) {
      console.error('[Dormancy Cleaner] Error:', error);
    }
  });
}
```

If `node-cron` isn't installed:
```bash
npm install node-cron --save
```

---

## Testing Guide

### Test 1: Create Chat Session

**Step 1: Send a message**
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Authorization: Bearer {your-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": "6a9050d530ea6f736d20aae6",
    "content": "Hello, this is a test message"
  }'
```

**Expected Result:**
- Message is sent successfully
- ChatSession document created in MongoDB (check `db.chatsessions.find()`)
- `lastActivityAt` shows current timestamp

**Step 2: In browser/app**
- Open the chat
- Should see dormancy banner showing "7 days remaining"
- Message count should show message sent

---

### Test 2: Verify Dormancy Tracking

**MongoDB Query:**
```javascript
db.chatsessions.findOne({})
```

**Expected Output:**
```javascript
{
  _id: ObjectId("..."),
  conversationId: "user1_user2",
  participantA: ObjectId("..."),
  participantB: ObjectId("..."),
  lastActivityAt: ISODate("2026-08-30T..."),
  isActive: true,
  endReason: null,
  endedBy: null,
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

---

### Test 3: End Chat Session (Admin/Service Provider)

**Step 1: Click "End" button in chat header** (if you're admin/service provider)
- Modal should appear with 3 options

**Step 2: Select reason and add feedback**
- Option 1: "User is Satisfied"
- Option 2: "User is Unsatisfied"
- Option 3: "Want to Follow Up"
- Add optional feedback text

**Step 3: Click "End Session" button**
```bash
curl -X POST http://localhost:5000/api/messages/conversation/{conversationId}/end \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "user_satisfied",
    "feedback": "Customer was very helpful and satisfied"
  }'
```

**Expected Result:**
- Modal closes
- Success alert shown
- Dormancy banner updates (if still visible)
- Chat session marked as inactive in MongoDB
- "End" button disappears from header
- Other participant notified via Socket.io

---

### Test 4: Dormancy Warning Levels

**Test Info Level (Days 0-3):**
- Message sent
- View chat within 3 days
- Banner shows "ℹ️ Auto-clear info"
- Blue progress bar

**Test Warning Level (Days 4-6):**
- Manually update `lastActivityAt` in MongoDB (go back 4 days)
- Refresh browser
- Banner shows "⏰ Chat will clear soon"
- Orange progress bar

**Test Critical Level (Day 7):**
- Manually set `lastActivityAt` to 7+ days ago
- Refresh browser
- Banner shows "⚠️ Chat clearing tomorrow"
- Red progress bar

**Update MongoDB for testing:**
```javascript
db.chatsessions.updateOne(
  { conversationId: "..." },
  { $set: { lastActivityAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) } }
)
```

---

### Test 5: Auto-Clear Dormant Sessions

**Option A: Manual Trigger**
```bash
curl -X POST http://localhost:5000/api/admin/maintenance/clear-dormant-chats \
  -H "Authorization: Bearer {admin-token}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Dormancy cleaner completed",
  "data": {
    "cleared": 1,
    "failed": 0,
    "conversationIds": ["user1_user2"]
  }
}
```

**Option B: Wait for Scheduled Job**
- If cron job configured, runs daily at 2 AM
- Check logs for execution

**MongoDB Verification:**
```javascript
// Before clear
db.messages.find({ conversationId: "..." }).count() // Should show messages

// After clear
db.messages.find({ conversationId: "...", isDeleted: false }).count() // Should be 0

// Check session
db.chatsessions.findOne({ conversationId: "..." })
// endReason should be "dormant"
// isActive should be false
```

---

### Test 6: Chat Session Status API

**Get current session status:**
```bash
curl -X GET http://localhost:5000/api/messages/conversation/{conversationId}/status \
  -H "Authorization: Bearer {token}"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "conversationId": "user1_user2",
    "isActive": true,
    "lastActivityAt": "2026-08-30T14:30:00Z",
    "endedBy": null,
    "endReason": null,
    "satisfactionFeedback": null,
    "dormancyWarning": {
      "daysInactive": 0,
      "daysUntilClear": 7,
      "willBeCleared": false,
      "dormancyDays": 7
    }
  }
}
```

---

### Test 7: Frontend UI Tests

**Test 1: Dormancy Banner Display**
- [ ] Banner appears in chat when dormancy info loads
- [ ] Shows correct days remaining
- [ ] Color changes based on urgency (blue → orange → red)
- [ ] Progress bar visualizes time remaining
- [ ] Can dismiss with X button

**Test 2: End Chat Modal**
- [ ] "End" button visible in header (admin/service provider only)
- [ ] Clicking opens modal
- [ ] Can select each of 3 reasons
- [ ] Selected reason highlights
- [ ] Feedback text field works
- [ ] Character counter displays
- [ ] Cancel button closes modal
- [ ] Submit button sends request

**Test 3: Chat Lock After Ending**
- [ ] After ending chat, "End" button disappears
- [ ] Message input may be disabled (optional)
- [ ] Dormancy banner shows session ended message

**Test 4: Real-Time Updates**
- [ ] Send message → banner updates
- [ ] Open chat in 2 tabs → both show same dormancy status
- [ ] Admin ends chat in one tab → other tab updates via Socket.io

---

## MongoDB Test Data

### Create test conversation manually:
```javascript
// Create two users
db.users.insertMany([
  {
    _id: ObjectId(),
    email: "user1@test.com",
    firstName: "Test",
    lastName: "User1",
    role: "client"
  },
  {
    _id: ObjectId(),
    email: "user2@test.com",
    firstName: "Test",
    lastName: "User2",
    role: "service_provider"
  }
])

// Create messages
db.messages.insertMany([
  {
    conversationId: "user1_user2",
    sender: ObjectId("...user1_id..."),
    receiver: ObjectId("...user2_id..."),
    content: "Test message 1",
    type: "text",
    status: "sent",
    readBy: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    lastActivityAt: new Date()
  }
])

// Create chat session
db.chatsessions.insertOne({
  conversationId: "user1_user2",
  participantA: ObjectId("...user1_id..."),
  participantB: ObjectId("...user2_id..."),
  lastActivityAt: new Date(),
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

---

## Troubleshooting Tests

### Issue: Dormancy banner not showing
1. Check API response: `GET /api/messages/conversation/{id}/status`
2. Verify `dormancyInfo` is not null in ChatScreen state
3. Check browser console for errors
4. Verify ChatSession document exists in MongoDB

### Issue: End chat button not appearing
1. Confirm user role is 'admin' or 'service_provider'
2. Verify `chatSessionStatus.isActive` is true
3. Check user object is loaded correctly
4. Verify you're using correct role string (check User model)

### Issue: Auto-clear not working
1. Verify `lastActivityAt` is older than 7 days
2. Check cron job is running (check server logs)
3. Manually trigger endpoint to test
4. Verify MongoDB indexes on `lastActivityAt`
5. Check for errors in server logs

### Issue: Socket.io events not firing
1. Verify Socket.io is initialized in ChatScreen
2. Check browser console for Socket.io errors
3. Verify event name matches: `chat_session_ended`
4. Check that other client is in same room (conversationId)

---

## Performance Considerations

### Index MongoDB for better performance:
```javascript
db.messages.createIndex({ conversationId: 1 })
db.messages.createIndex({ lastActivityAt: 1 })
db.chatsessions.createIndex({ conversationId: 1 })
db.chatsessions.createIndex({ lastActivityAt: 1, isActive: 1 })
```

### Query Optimization:
- Dormancy cleaner filters for `isActive: true` and `lastActivityAt < 7 days`
- Uses batch updates for performance
- Consider adding pagination for large message histories

---

## Success Criteria Checklist

- [ ] Chat sessions created on first message
- [ ] `lastActivityAt` updates on each message
- [ ] Dormancy banner displays correctly
- [ ] End chat button visible and functional
- [ ] End chat modal works with 3 options
- [ ] Feedback optional but works when provided
- [ ] Auto-clear endpoint works (admin only)
- [ ] Cron job runs (if configured)
- [ ] Socket.io events notify all participants
- [ ] Ended chats show correct status
- [ ] 7-day dormancy period tracked correctly
- [ ] No errors in console or server logs

---

## Next Steps

1. Run all tests above
2. Fix any issues found
3. Deploy to staging environment
4. Perform user acceptance testing
5. Deploy to production
6. Monitor logs and chat session metrics
7. Collect feedback on UX/satisfaction check

---

**Last Updated:** 2026-08-30
