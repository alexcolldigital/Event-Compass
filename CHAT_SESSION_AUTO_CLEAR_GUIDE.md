# Chat Session Auto-Clear & Satisfaction Check - Implementation Guide

## Overview
This implementation adds automatic chat session clearing after 7 days of dormancy and enables admin/service providers to end chat sessions with satisfaction feedback before messages are cleared.

## Features Implemented

### 1. **7-Day Dormancy Auto-Clear**
- Tracks chat session activity
- Automatically clears all messages after 7 days of inactivity
- Sends system messages indicating dormancy reason
- Can be manually triggered via admin endpoint

### 2. **Admin/Service Provider Chat Ending**
- End button in chat header (visible only to admins/service providers)
- Modal dialog with satisfaction feedback options:
  - ✓ User is Satisfied
  - ✗ User is Unsatisfied
  - 📞 Want to Follow Up
- Optional text feedback for additional notes

### 3. **Frontend Dormancy Banner**
- Shows dormancy countdown in chat
- Warning levels (info, warning, critical)
- Progress bar showing days remaining
- Dismissible placeholder informing users about 7-day auto-clear policy
- Displays chat session status (ended, satisfied, etc.)

---

## Backend Implementation

### New Models

#### ChatSession Schema
```javascript
{
  conversationId: String (unique),
  participantA: ObjectId (User),
  participantB: ObjectId (User),
  booking: ObjectId (Booking),
  lastActivityAt: Date,
  isActive: Boolean,
  endedBy: ObjectId (User),
  endReason: String ('user_satisfied' | 'user_unsatisfied' | 'want_follow_up' | 'dormant'),
  satisfactionFeedback: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Message Model Updates
- Added `lastActivityAt` field to track message timestamps
- Used for dormancy calculations

### New Utilities

#### `backend/utils/chatSession.js`
```javascript
// Initialize or update chat session
initializeChatSession(conversationId, participantA, participantB, bookingId)

// Mark chat session as ended
endChatSession(conversationId, userId, reason, feedback)

// Find and clear dormant sessions (7+ days)
clearDormantSessions()

// Get chat session info with dormancy warning
getChatSessionInfo(conversationId)

// Calculate dormancy warning
calculateDormancyWarning(lastActivityAt)
```

### New Controllers

#### `backend/controllers/dormancyController.js`
- `runDormancyCleaner`: Manually trigger dormancy cleanup (admin only)
- Runs through all dormant sessions and clears messages
- Returns statistics of cleared sessions

#### Updated `backend/controllers/messageController.js`
- `endChatSessionController`: End chat with satisfaction check
- `getChatSessionStatus`: Get session info with dormancy data

### New Routes

#### `POST /api/messages/conversation/:conversationId/end`
End a chat session with satisfaction feedback
```json
{
  "reason": "user_satisfied|user_unsatisfied|want_follow_up",
  "feedback": "Optional feedback text"
}
```

#### `GET /api/messages/conversation/:conversationId/status`
Get chat session status including dormancy info
```json
{
  "conversationId": "...",
  "isActive": boolean,
  "lastActivityAt": Date,
  "endedBy": { user details },
  "endReason": "...",
  "satisfactionFeedback": "...",
  "dormancyWarning": {
    "daysInactive": number,
    "daysUntilClear": number,
    "willBeCleared": boolean,
    "dormancyDays": 7
  }
}
```

#### `POST /api/admin/maintenance/clear-dormant-chats`
Manually trigger dormancy cleaner (admin only)
```json
{
  "cleared": number,
  "failed": number,
  "conversationIds": [...]
}
```

---

## Frontend Implementation

### New Components

#### `frontend/src/components/EndChatModal.tsx`
Modal for ending chat sessions with satisfaction feedback
- Three reason options with descriptions
- Optional feedback text field (500 chars max)
- Character count display
- Submit/Cancel actions
- Loading state while submitting

#### `frontend/src/components/ChatDormancyBanner.tsx`
Banner showing dormancy info in chat
- Dynamic warning levels (info, warning, critical)
- Progress bar showing time remaining
- Days inactive / Days until clear / Policy details
- Dismissible
- Shows final status for ended chats

### Updated Components

#### `frontend/src/screens/main/ChatScreen.tsx`
New state variables:
- `showEndChatModal`: Control modal visibility
- `dormancyInfo`: Dormancy countdown data
- `chatSessionStatus`: Full session status info
- `dismissedDormancyBanner`: Track banner dismissal

New functions:
- `loadChatSessionStatus()`: Fetch session info with dormancy data
- `handleEndChatSession()`: Submit chat ending with feedback

Updates:
- Header now shows "End" button (for admins/service providers when chat is active)
- Dormancy banner displayed above message list
- End Chat Modal integrated at bottom of JSX
- Socket event listener for `chat_session_ended`
- UseEffect loads chat session status on mount

### Updated Services

#### `frontend/src/services/api.js`
New API methods:
```javascript
endChatSession(conversationId, data)
getChatSessionStatus(conversationId)
```

---

## How It Works

### Chat Session Flow

1. **Message Sent**
   - Backend creates/updates ChatSession record
   - `lastActivityAt` timestamp updated
   - Message stored with `lastActivityAt`

2. **User Views Chat**
   - Frontend calls `getChatSessionStatus()`
   - Receives dormancy warning data
   - Displays banner if approaching 7-day limit

3. **Admin/Service Provider Ends Chat** (optional)
   - Clicks "End" button in header
   - EndChatModal displays with reason options
   - Submits with reason + optional feedback
   - Chat marked as inactive
   - Socket event notifies other participant
   - Messages preserved but chat locked

4. **Automatic Dormancy Clearing** (after 7 days)
   - Scheduled job or manual `/admin/maintenance/clear-dormant-chats`
   - Finds all active sessions with `lastActivityAt` > 7 days ago
   - Marks all messages as deleted
   - Chat session marked as inactive with `endReason: 'dormant'`

### Dormancy Warning Timeline
- **Days 0-3**: Info banner (ℹ️ Auto-clear info)
- **Days 4-6**: Warning banner (⏰ Chat will clear soon)
- **Days 7**: Critical banner (⚠️ Chat clearing tomorrow)
- **Day 8+**: Cleared (system message shown)

---

## Configuration

### Dormancy Period
Default: 7 days
File: `backend/utils/chatSession.js`
```javascript
const DORMANCY_PERIOD_DAYS = 7;
```

### Scheduling Dormancy Cleanup
Option 1: Manual trigger via admin endpoint
```bash
curl -X POST http://localhost:5000/api/admin/maintenance/clear-dormant-chats \
  -H "Authorization: Bearer {admin-token}"
```

Option 2: Cron job (recommended for production)
```javascript
// Add to server.js or use a package like node-cron
const cron = require('node-cron');
const { clearDormantSessions } = require('./utils/chatSession');

// Run daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Running dormancy cleaner...');
  const results = await clearDormantSessions();
  console.log('Dormancy cleaner results:', results);
});
```

---

## API Examples

### End a Chat Session
```bash
curl -X POST http://localhost:5000/api/messages/conversation/{conversationId}/end \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "user_satisfied",
    "feedback": "Customer was very satisfied with the resolution"
  }'
```

### Get Chat Session Status
```bash
curl -X GET http://localhost:5000/api/messages/conversation/{conversationId}/status \
  -H "Authorization: Bearer {token}"
```

Response:
```json
{
  "success": true,
  "data": {
    "conversationId": "abc123_def456",
    "isActive": false,
    "lastActivityAt": "2026-08-28T10:30:00Z",
    "endedBy": {
      "_id": "user123",
      "firstName": "John",
      "lastName": "Doe",
      "role": "service_provider"
    },
    "endReason": "user_satisfied",
    "satisfactionFeedback": "Customer satisfied",
    "dormancyWarning": null
  }
}
```

### Trigger Manual Cleanup
```bash
curl -X POST http://localhost:5000/api/admin/maintenance/clear-dormant-chats \
  -H "Authorization: Bearer {admin-token}"
```

Response:
```json
{
  "success": true,
  "message": "Dormancy cleaner completed",
  "data": {
    "cleared": 5,
    "failed": 0,
    "conversationIds": ["conv1", "conv2", "conv3", "conv4", "conv5"]
  }
}
```

---

## Socket.IO Events

### `chat_session_ended`
Emitted when admin/service provider ends chat
```javascript
socket.on('chat_session_ended', ({
  conversationId,
  endedBy,
  reason,
  feedback,
  timestamp
}) => {
  // Handle chat session end
});
```

### `conversation_cleared`
Emitted when messages are cleared (existing)
```javascript
socket.on('conversation_cleared', ({
  conversationId,
  deletedCount
}) => {
  // Handle conversation cleared
});
```

---

## Testing Checklist

### Backend
- [ ] Chat session created on first message
- [ ] `lastActivityAt` updated on each message
- [ ] Dormancy cleaner clears 7+ day old sessions
- [ ] End chat endpoint marks session as inactive
- [ ] Satisfaction feedback stored correctly
- [ ] Admin endpoint works and returns statistics
- [ ] Socket events emit correctly

### Frontend
- [ ] Dormancy banner displays on chat load
- [ ] Banner shows correct days remaining
- [ ] Warning levels change appropriately
- [ ] End button visible for admins/service providers
- [ ] End modal displays with 3 reason options
- [ ] Feedback text field works
- [ ] Submit/Cancel buttons functional
- [ ] Session status loads and displays
- [ ] Chat locks/disables after session ends
- [ ] Socket event updates UI on session end

### Integration
- [ ] Message sent → Chat session created
- [ ] Multiple messages → `lastActivityAt` updates
- [ ] 7 days of no activity → Auto-clear on trigger
- [ ] Admin ends chat → Modal submits → Session marked inactive
- [ ] Other participant notified via socket
- [ ] Dormancy info persists across page refreshes

---

## Troubleshooting

### Chat session not created
- Verify `initializeChatSession()` called in `sendMessage()`
- Check MongoDB connection
- Verify ChatSession model is exported from Message.js

### Dormancy banner not showing
- Call `loadChatSessionStatus()` in useEffect
- Check API response for `dormancyWarning` data
- Verify `dismissedDormancyBanner` state management

### Auto-clear not working
- Verify dormancy cleaner is scheduled/triggered
- Check MongoDB indexes on `lastActivityAt`
- Verify `isActive: true` filter in query
- Check server logs for errors

### End chat modal not submitting
- Verify reason is selected (one of 3 options)
- Check API endpoint is configured correctly
- Check auth token is included in request
- Verify backend imports `endChatSession` utility

---

## Files Modified/Created

### Backend
- ✅ `models/Message.js` - Added ChatSession schema
- ✅ `utils/chatSession.js` - New utility functions
- ✅ `controllers/messageController.js` - New endpoints
- ✅ `controllers/dormancyController.js` - New controller
- ✅ `routes/messageRoutes.js` - New routes
- ✅ `routes/adminRoutes.js` - Admin maintenance route

### Frontend
- ✅ `components/EndChatModal.tsx` - New component
- ✅ `components/ChatDormancyBanner.tsx` - New component
- ✅ `screens/main/ChatScreen.tsx` - Updated with new features
- ✅ `services/api.js` - New API methods

---

## Future Enhancements

1. **User Notifications**
   - Push notification on day 5/6 of dormancy
   - Email reminder before auto-clear

2. **Analytics**
   - Track satisfaction feedback trends
   - Identify common unsatisfaction reasons
   - Monitor auto-clear frequency

3. **Configuration UI**
   - Admin dashboard to adjust dormancy period
   - View/edit past chat sessions
   - See satisfaction feedback statistics

4. **Chat Archiving**
   - Archive inactive chats instead of deleting
   - Searchable archive of old conversations

5. **Retry/Reopen**
   - Allow clients to reopen ended chats
   - Show "reopen" option within X days

---

## Support & Maintenance

For issues or questions:
1. Check troubleshooting section
2. Review server logs and browser console
3. Verify all files were created/updated correctly
4. Test with simple curl requests first
5. Check that auth tokens are valid

---

**Implementation Date:** 2026-08-30
**Status:** Complete and Ready for Testing
