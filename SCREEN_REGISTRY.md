/**
 * SCREEN REGISTRY & DEVELOPER GUIDE
 * Quick reference for all screens in Event Compass application
 */

# Event Compass - Screen Registry & Developer Guide

## Quick Status Overview

| Category | Status | Count | Details |
|----------|--------|-------|---------|
| Auth Screens | ✅ Complete | 4 | Login, Register, RegisterProvider, ForgotPassword |
| Main App Screens | ✅ Complete | 8 | Home, Search, Bookings, Profile, ServiceDetail, BookingDetail, EditProfile, ChangePassword |
| Admin Screens | ✅ Partially Complete | 3 | AdminDashboard, ManageUsers, ManageBookings, RevenueAnalytics |
| **Total Complete** | **✅** | **15** | |
| **Planned Screens** | 🔄 Todo | ~12 | See roadmap section |

---

## ✅ IMPLEMENTED SCREENS

### Authentication Stack (`/frontend/src/screens/auth/`)

#### 1. LoginScreen.tsx
**Status:** ✅ Complete

**Location:** `frontend/src/screens/auth/LoginScreen.tsx`

**Features:**
- Email and password form fields
- Form validation with error messages
- Forgot password link
- Sign in button
- Links to register (client and provider)
- Loading state handling
- Error message display

**Dependencies:**
- `useAuthStore` - for login method
- `useNavigation` - for navigation
- Input component
- Button component

**Key Props:** None (uses route and navigation hooks)

**State Management:**
```javascript
const { login, isLoading, error } = useAuthStore();
```

**Error Handling:** Displays error messages from auth store

---

#### 2. RegisterScreen.tsx
**Status:** ✅ Complete

**Location:** `frontend/src/screens/auth/RegisterScreen.tsx`

**Features:**
- First name and last name inputs (side by side)
- Email validation
- Phone number input (supports Nigerian format)
- Password and confirmation password
- Form validation with inline errors
- Create account button
- Link to login

**Dependencies:**
- `useAuthStore` - for register method
- Input component
- Button component
- Validation helpers (isValidEmail, isValidPhoneNumber)

**Form Fields:**
- firstName (required)
- lastName (required)
- email (required, valid email)
- phone (required, valid Nigerian number)
- password (required, min 6 chars)
- passwordConfirm (required, matches password)

---

#### 3. RegisterProviderScreen.tsx
**Status:** ✅ Complete

**Location:** `frontend/src/screens/auth/RegisterProviderScreen.tsx`

**Features:**
- Extended registration for service providers
- Business information fields (name, type, description)
- Service coverage area selection
- Years in business input
- Bank account information (optional)
- Verification documents upload
- Terms acceptance checkbox

**Dependencies:**
- `useAuthStore` - for registerProvider method
- Service type dropdown/picker
- State/LGA selector component (to be implemented)

**Form Fields:**
- All fields from RegisterScreen plus:
- businessName (required)
- serviceProviderType (required)
- businessDescription (required, min 20 chars)
- yearsInBusiness (optional)
- servicesCovered (array)
- bankAccount (optional)
- verificationDocuments (optional)

---

#### 4. ForgotPasswordScreen.tsx
**Status:** ✅ Complete

**Location:** `frontend/src/screens/auth/ForgotPasswordScreen.tsx`

**Features:**
- Email input for password reset
- Submit button to trigger reset
- Success confirmation screen
- Link back to login
- Loading state during submission

**Dependencies:**
- `useAuthStore` - for forgotPassword method
- Input component
- Button component

---

### Main App Stack (`/frontend/src/screens/main/`)

#### 5. HomeScreen.tsx
**Status:** ✅ Complete

**Location:** `frontend/src/screens/main/HomeScreen.tsx`

**Features:**
- User greeting with name
- Search bar (navigates to search)
- Quick action buttons (New Event, Browse, History)
- Featured services carousel (horizontal FlatList)
- Service cards with images, name, rating, price
- Upcoming events section
- Pull-to-refresh capability
- Empty state handling

**Dependencies:**
- `useAuthStore` - for user data
- `useServiceStore` - for featured services
- `useNavigation` - for navigation

**Navigation:**
- Search bar → SearchScreen
- Service card → ServiceDetailScreen
- Browse button → SearchScreen

---

#### 6. SearchScreen.tsx
**Status:** ✅ Complete

**Location:** `frontend/src/screens/main/SearchScreen.tsx`

**Features:**
- Search input field
- Service results as FlatList
- Service cards display (name, category, price, rating)
- No results state
- Basic filtering (can be enhanced)
- Navigate to service details

**Dependencies:**
- `useServiceStore` - for search and filter methods
- `useNavigation` - for navigation

**To Enhance:**
- Add advanced filters (price range, location, rating)
- Add sort options
- Implement recent searches
- Add save to favorites

---

#### 7. BookingsScreen.tsx
**Status:** ✅ Complete

**Location:** `frontend/src/screens/main/BookingsScreen.tsx`

**Features:**
- Tab navigation (Active, Completed, Cancelled)
- Booking cards showing status, date, amount
- Status-specific display based on user role
- Color-coded status badges
- Pull-to-refresh
- Empty state for each tab
- Navigate to booking details

**Dependencies:**
- `useBookingStore` - for client and provider bookings
- `useAuthStore` - for user role
- `useNavigation` - for navigation

**Tabs:**
- Active: Pending, Confirmed
- Completed: Finished bookings
- Cancelled: Cancelled bookings

---

#### 8. ProfileScreen.tsx
**Status:** ✅ Complete

**Location:** `frontend/src/screens/main/ProfileScreen.tsx`

**Features:**
- Profile picture display
- User name and role
- Stats section (for providers): bookings, rating, completed
- Menu items:
  - Edit Profile
  - Change Password
  - Notifications Settings (placeholder)
  - Help & Support (placeholder)
  - About (placeholder)
- Admin Dashboard access (if admin)
- Logout button with confirmation

**Dependencies:**
- `useAuthStore` - for user data and logout
- `useNavigation` - for navigation
- Button component

**Navigation:**
- Edit Profile → EditProfileScreen
- Change Password → ChangePasswordScreen
- Admin Dashboard → AdminDashboardScreen
- Logout → LoginScreen

---

#### 9. ServiceDetailScreen.tsx
**Status:** ✅ Complete

**Location:** `frontend/src/screens/main/ServiceDetailScreen.tsx`

**Features:**
- Service image gallery
- Service name, category, ratings
- Detailed service description
- Provider information card with contact
- Available packages with pricing
- Coverage area display
- Pricing breakdown with quantity selector
- Booking form with date picker
- Call and message buttons
- Add to favorites button
- Share button
- Reviews section (expandable)

**Dependencies:**
- `useServiceStore` - for service details
- `useBookingStore` - for booking creation
- `useAuthStore` - for user auth check
- `useNavigation` - for navigation

**Key Functionality:**
- Quantity adjustment (increment/decrement)
- Real-time price calculation
- Tax calculation (5%)
- Booking creation with validation
- Provider profile access

---

#### 10. BookingDetailScreen.tsx
**Status:** ✅ Complete

**Location:** `frontend/src/screens/main/BookingDetailScreen.tsx`

**Features:**
- Complete booking information
- Booking number and status
- Service/venue details
- Event date and guest count
- Client and provider information
- Pricing breakdown
- Payment status
- Status-specific action buttons:
  - Provider pending: Confirm or Decline
  - Client pending: Cancel
  - Provider confirmed: Mark Complete
  - Client confirmed: Cancel or View Payment
- Cancellation form with reason input
- Timeline of booking progression

**Dependencies:**
- `useBookingStore` - for booking operations
- `useAuthStore` - for user role
- `useNavigation` - for navigation

**Key Features:**
- Role-based action display
- Inline error handling
- Confirmation dialogs
- Cancellation reason collection
- Payment receipt viewing

---

#### 11. EditProfileScreen.tsx
**Status:** ✅ Complete

**Location:** `frontend/src/screens/main/EditProfileScreen.tsx`

**Features:**
- Profile picture section with change button
- Personal information form:
  - First name
  - Last name
  - Email (with validation)
  - Phone (with validation)
- Business information section (providers only):
  - Business name
  - Business description (max 500 chars)
- Account information display:
  - Account type
  - Email verification status
  - Phone verification status
- Form validation
- Inline error messages
- Save button
- Loading state

**Dependencies:**
- `useAuthStore` - for updateProfile method
- Input component
- Button component
- Validation helpers

**Special Features:**
- Conditional business section for providers
- Character counter for description
- Real-time validation
- Verification status indicators

---

#### 12. ChangePasswordScreen.tsx
**Status:** ✅ Complete

**Location:** `frontend/src/screens/main/ChangePasswordScreen.tsx`

**Features:**
- Security information banner
- Three password fields:
  - Current password (toggle visibility)
  - New password (toggle visibility)
  - Confirm password (toggle visibility)
- Password strength indicator:
  - Visual progress bar
  - Strength labels (Weak, Medium, Strong)
- Password requirements checklist
- Password match indicator
- Form validation with specific errors
- Update button
- Cancel button
- Loading state

**Dependencies:**
- `useAuthStore` - for changePassword method
- Input component with visibility toggle
- Button component
- VALIDATION constants

**Password Strength Logic:**
- Weak: Less than 8 chars
- Medium: 8+ chars with mixed case
- Strong: 12+ chars with mixed case, numbers, special chars

---

### Admin Stack (`/frontend/src/screens/admin/`)

#### 13. AdminDashboardScreen.tsx
**Status:** ✅ Complete

**Location:** `frontend/src/screens/admin/AdminDashboardScreen.tsx`

**Features:**
- Dashboard header
- Quick stats cards (4 columns):
  - Total Users (blue)
  - Completed Bookings (green)
  - Pending Bookings (purple)
  - Total Revenue (orange)
- Platform overview section:
  - Service providers count
  - Clients count
  - Today's revenue
  - Today's bookings
- Management menu items (clickable):
  - Users Management
  - Bookings Management
  - Services Management
  - Revenue Analytics
  - Reports (placeholder)
- Recent activity list (optional)

**Dependencies:**
- adminAPI - for dashboard stats
- `useNavigation` - for navigation to management screens

**Navigation:**
- Users → ManageUsersScreen
- Bookings → ManageBookingsScreen
- Services → ManageServicesScreen
- Revenue → RevenueAnalyticsScreen

---

#### 14. ManageUsersScreen.tsx
**Status:** ✅ Complete

**Location:** `frontend/src/screens/admin/ManageUsersScreen.tsx`

**Features:**
- Search input (by name, email, phone)
- Role filter (All, Clients, Service Providers)
- User list with cards showing:
  - Name
  - Email
  - Phone
  - Status (Active/Blocked)
  - Role
  - Total bookings
  - Join date
- Expandable user cards with:
  - Detailed information
  - Block/Unblock action
  - Verification status (for providers)
  - Verify button (for unverified providers)
- Statistics display:
  - Total users
  - Active count
  - Blocked count

**Dependencies:**
- adminAPI - for user list and actions
- Input component
- Button component

**Key Features:**
- Real-time search and filter
- Role-based verification options
- Block/unblock confirmation dialogs
- User statistics overview
- Export functionality (placeholder)

---

#### 15. ManageBookingsScreen.tsx
**Status:** ✅ Complete

**Location:** `frontend/src/screens/admin/ManageBookingsScreen.tsx`

**Features:**
- Search input (by booking number, client, service)
- Status filter buttons (All, Pending, Confirmed, Completed, Cancelled)
- Booking cards showing:
  - Booking number
  - Service name
  - Client name
  - Event date
  - Total amount
  - Status badge
- Expandable booking details:
  - Client information
  - Service provider information
  - Booking details (date, guests, etc.)
  - Payment information
  - Contact buttons
- Statistics cards:
  - Total bookings
  - Pending count
  - Completed count

**Dependencies:**
- adminAPI - for booking list
- Button component

**Key Features:**
- Multi-status filtering
- Real-time search
- Detailed booking inspection
- Contact provider/client buttons
- Status indicators with color coding

---

#### 16. RevenueAnalyticsScreen.tsx
**Status:** ✅ Complete

**Location:** `frontend/src/screens/admin/RevenueAnalyticsScreen.tsx`

**Features:**
- Time period selector (Daily, Weekly, Monthly, Yearly)
- Revenue summary cards:
  - Total revenue (primary)
  - Platform fees
  - Provider payouts
- Revenue chart by period:
  - Bar chart display
  - Amount and booking count
  - Sorted chronologically
- Key metrics display:
  - Average transaction
  - Total bookings
  - Commission rate
- Export options:
  - PDF
  - Excel
  - Share

**Dependencies:**
- adminAPI - for revenue data
- Charts library (to be added for advanced visualization)
- Button component

**Key Features:**
- Dynamic time period selection
- Revenue breakdown visualization
- Percentage calculations
- Metric summaries
- Export functionality

---

## 🔄 PLANNED SCREENS (Priority Order)

### Priority 1: High (Needed for MVP)

#### 17. ProviderProfileScreen
**Location:** `frontend/src/screens/main/ProviderProfileScreen.tsx`
- View complete provider details
- Provider statistics and ratings
- Review listing
- Services offered
- Contact provider
- View portfolio/images

#### 18. ReviewScreen
**Location:** `frontend/src/screens/main/ReviewScreen.tsx`
- Submit ratings and reviews
- Star rating selector
- Category-based ratings (quality, communication, etc.)
- Photo upload for review
- Review submission

#### 19. CheckoutScreen
**Location:** `frontend/src/screens/main/CheckoutScreen.tsx`
- Payment method selection
- Booking summary
- Final price display
- Order confirmation
- Payment processing status

#### 20. ManageServicesScreen (Admin)
**Location:** `frontend/src/screens/admin/ManageServicesScreen.tsx`
- Service listing
- Service approval/rejection
- Service suspension
- Review reports
- Service statistics

---

### Priority 2: Medium (Important Features)

#### 21. ChatScreen
**Location:** `frontend/src/screens/main/ChatScreen.tsx`
- Direct messaging between users
- Conversation list
- Message history
- File sharing
- Typing indicators

#### 22. NotificationsScreen
**Location:** `frontend/src/screens/main/NotificationsScreen.tsx`
- Notification listing
- Mark as read/unread
- Delete notifications
- Notification preferences
- Notification badges

#### 23. ReportsScreen (Admin)
**Location:** `frontend/src/screens/admin/ReportsScreen.tsx`
- System reports
- Financial summaries
- User behavior analytics
- Top performances
- Export reports

#### 24. EventCreationScreen
**Location:** `frontend/src/screens/main/EventCreationScreen.tsx`
- Create new event
- Event details form
- Budget allocation
- Service requirements
- Guest list management
- Timeline planning

---

### Priority 3: Low (Enhancement Features)

#### 25. AnalyticsScreen (Provider)
**Location:** `frontend/src/screens/main/ProviderAnalyticsScreen.tsx`
- Provider earnings dashboard
- Booking statistics
- Revenue tracking
- Customer satisfaction metrics
- Growth trends

#### 26. MapScreen
**Location:** `frontend/src/screens/main/MapScreen.tsx`
- Venue location visualization
- Map-based service search
- Distance calculation
- Directions
- Save locations

#### 27. SettingsScreen
**Location:** `frontend/src/screens/main/SettingsScreen.tsx`
- App preferences
- Language selection
- Theme selection
- Privacy settings
- Account security

---

## Navigation Tree

```
RootNavigator
├─ AuthNavigator (not authenticated)
│  ├─ LoginScreen
│  ├─ RegisterScreen
│  ├─ RegisterProviderScreen
│  └─ ForgotPasswordScreen
└─ BottomTabNavigator (authenticated)
   ├─ Home Stack
   │  ├─ HomeScreen
   │  ├─ ServiceDetailScreen
   │  └─ ReviewScreen
   ├─ Search Stack
   │  ├─ SearchScreen
   │  ├─ ServiceDetailScreen
   │  └─ ProviderProfileScreen
   ├─ Bookings Stack
   │  ├─ BookingsScreen
   │  ├─ BookingDetailScreen
   │  ├─ CheckoutScreen
   │  └─ ReviewScreen
   └─ Profile Stack
      ├─ ProfileScreen
      ├─ EditProfileScreen
      ├─ ChangePasswordScreen
      ├─ ProviderAnalyticsScreen (if provider)
      ├─ AdminDashboardScreen (if admin)
      │  ├─ ManageUsersScreen
      │  ├─ ManageBookingsScreen
      │  ├─ ManageServicesScreen
      │  ├─ RevenueAnalyticsScreen
      │  └─ ReportsScreen
      ├─ NotificationsScreen
      ├─ ChatScreen
      ├─ SettingsScreen
      ├─ HelpScreen
      └─ AboutScreen
```

---

## Component Import Pattern

```typescript
// Standard imports for all screens
import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Alert, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

// Store imports
import { useAuthStore } from '../context/authStore';
import { useBookingStore } from '../context/bookingStore';
import { useServiceStore } from '../context/serviceStore';

// Component imports
import Button from '../components/Button';
import Input from '../components/Input';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';

// Utilities
import { COLORS, BOOKING_STATUS, USER_ROLES } from '../utils/constants';
import { formatCurrency, formatDate, getStatusColor } from '../utils/helpers';
```

---

## Common Patterns

### State Initialization
```typescript
const [formData, setFormData] = useState({
  field1: '',
  field2: '',
});
const [formErrors, setFormErrors] = useState({});
const [isLoading, setIsLoading] = useState(false);
```

### API Call Pattern
```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await apiCall();
      setData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  fetchData();
}, [dependencies]);
```

### Form Validation
```typescript
const validateForm = () => {
  const errors = {};
  if (!field) errors.field = 'Field is required';
  setFormErrors(errors);
  return Object.keys(errors).length === 0;
};
```

---

## Testing Checklist for New Screens

- [ ] Component renders without errors
- [ ] All required props are provided
- [ ] Form inputs accept user input
- [ ] Validation works correctly
- [ ] API calls are made with correct data
- [ ] Loading states display properly
- [ ] Error states display error messages
- [ ] Navigation works correctly
- [ ] Back buttons work
- [ ] Responsive design on different screen sizes
- [ ] Performance is acceptable (no lag)
- [ ] No console errors or warnings
- [ ] Keyboard handling is correct
- [ ] Modal/alert displays work

---

## Development Guidelines

1. **Always use TypeScript** for screen components
2. **Use Zustand stores** for global state
3. **Follow naming conventions**: PascalCase for components
4. **Import from constants** instead of hardcoding values
5. **Use utility functions** for formatting and validation
6. **Handle all error states** with ErrorMessage component
7. **Show loading states** during async operations
8. **Make lists scrollable** with FlatList when needed
9. **Use consistent spacing** with Tailwind classes
10. **Test on multiple devices** before committing

---

## Recent Updates

- ✅ Created constants file for frontend
- ✅ Created ServiceDetailScreen with full booking flow
- ✅ Created BookingDetailScreen with management actions
- ✅ Created EditProfileScreen for profile management
- ✅ Created ChangePasswordScreen for password changes
- ✅ Updated BottomTabNavigator with new detail screens
- ✅ Created ManageUsersScreen for admin user management
- ✅ Created ManageBookingsScreen for admin booking management
- ✅ Created RevenueAnalyticsScreen for financial reporting
- ✅ Created this comprehensive registry

---

## Next Steps

1. Implement Priority 1 screens (Provider Profile, Review, Checkout)
2. Create image picker integration for uploads
3. Add real payment flow for Stripe checkout
4. Implement real-time features (notifications, chat)
5. Add unit and integration tests
6. Performance optimization and profiling
7. Prepare for production deployment

For detailed information about any specific screen, refer to the SCREENS_DOCUMENTATION.md file.
