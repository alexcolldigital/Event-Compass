/**
 * SCREENS DOCUMENTATION
 * Complete guide to all screens in the Event Compass application
 */

# Event Compass - Screens Documentation

## Overview
This document provides a comprehensive guide to all screens in the Event Compass mobile application, including their purpose, navigation flow, and features.

## Screen Hierarchy

### 1. Authentication Stack (Unauthenticated Users)
Located: `frontend/src/screens/auth/`

#### LoginScreen
- **Route:** `AuthNavigator > Login`
- **Purpose:** Enable users to login to their existing accounts
- **Features:**
  - Email and password input fields
  - Form validation
  - "Forgot Password?" link
  - Links to register as client or service provider
  - Error message display
  - Loading state during authentication
- **Dependencies:** authStore.login()
- **Navigation:** 
  - Success → BottomTabNavigator (Home)
  - Forgot Password → ForgotPasswordScreen
  - Register → RegisterScreen
  - Register Provider → RegisterProviderScreen

#### RegisterScreen
- **Route:** `AuthNavigator > Register`
- **Purpose:** Enable new clients to create an account
- **Features:**
  - First name and last name inputs
  - Email input with validation
  - Phone number input with Nigerian format validation
  - Password and password confirmation
  - Form validation
  - Terms and conditions checkbox (optional)
  - Already have account link to LoginScreen
- **Dependencies:** authStore.register()
- **Navigation:** 
  - Success → LoginScreen (auto-login option) → BottomTabNavigator
  - Back → LoginScreen

#### RegisterProviderScreen
- **Route:** `AuthNavigator > RegisterProvider`
- **Purpose:** Enable service providers to create a business account
- **Features:**
  - All basic registration fields (name, email, phone, password)
  - Business name field
  - Service provider type selector (dropdown)
  - Years in business input
  - Business description textarea
  - Service coverage area selection (states/nationwide)
  - Bank account information (optional)
  - Business verification documents upload
  - Extended form validation
- **Dependencies:** authStore.registerProvider()
- **Navigation:** 
  - Success → LoginScreen (auto-login option) → BottomTabNavigator
  - Back → LoginScreen

#### ForgotPasswordScreen
- **Route:** `AuthNavigator > ForgotPassword`
- **Purpose:** Allow users to reset their forgotten password
- **Features:**
  - Email input for password reset request
  - Validation of email existence
  - Submit button to trigger reset email
  - Success screen confirming email sent
  - Link to check inbox
  - Back to login link
- **Dependencies:** authStore.forgotPassword()
- **Navigation:** 
  - Back → LoginScreen

---

### 2. Main App Stack (Authenticated Users)
Located: `frontend/src/screens/main/`

#### HomeScreen
- **Route:** `BottomTabNavigator > Home > HomeScreen`
- **Purpose:** Display dashboard with featured services and quick access
- **Features:**
  - Header with user greeting and notifications
  - Search bar (navigates to SearchScreen)
  - Quick action buttons: New Event, Browse, History
  - Featured services carousel (FlatList horizontal)
  - Service cards showing image, name, rating, price
  - Upcoming events section
  - Promotional banners
  - Pull-to-refresh functionality
  - Empty state when no services available
- **Dependencies:** serviceStore.getAllServices(), authStore.user
- **Navigation:**
  - Search bar → SearchScreen
  - Service card → ServiceDetailScreen (with serviceId param)
  - New Event → (future: EventCreationScreen)
  - Browse → SearchScreen
  - History → BookingsScreen

#### SearchScreen
- **Route:** `BottomTabNavigator > Search > SearchScreen`
- **Purpose:** Enable users to search and filter available services
- **Features:**
  - Search input with magnifying glass icon
  - Filter options:
    - Service category dropdown
    - Price range slider
    - Location/state selector
    - Rating filter
    - Availability filter
  - Results display in FlatList
  - Service cards with image, name, category, price, rating
  - No results screen with suggestions
  - Recent searches (can be implemented from helpers)
  - Advanced filter button
  - Sort options (price, rating, newest)
- **Dependencies:** serviceStore.searchServices(), serviceStore.getServices()
- **Navigation:**
  - Service card → ServiceDetailScreen (with serviceId param)
  - Filters → (modal or custom filter screen)

#### BookingsScreen
- **Route:** `BottomTabNavigator > Bookings > BookingsScreen`
- **Purpose:** View and manage all bookings with status tracking
- **Features:**
  - Tab navigation: Active, Completed, Cancelled
  - Booking cards display:
    - Service/venue name
    - Booking number
    - Event date
    - Status badge (color-coded)
    - Total amount
  - Status-specific content:
    - Active: Actions to confirm, complete, or cancel
    - Completed: Leave review option, view payment receipt
    - Cancelled: View cancellation reason
  - Empty state messages for each tab
  - Booking count indicators
  - Pull-to-refresh
  - Provider vs Client role-aware display
- **Dependencies:** bookingStore.getMyClientBookings(), bookingStore.getMyProviderBookings()
- **Navigation:**
  - Booking card → BookingDetailScreen (with bookingId param)
  - Leave Review → (future: ReviewScreen)

#### ProfileScreen
- **Route:** `BottomTabNavigator > Profile > ProfileScreen`
- **Purpose:** Display user profile and account management options
- **Features:**
  - Profile picture (with change option)
  - User name display
  - User role/business name display
  - Stats section (for providers):
    - Total bookings
    - Average rating
    - Completed bookings
  - Menu items:
    - Edit Profile → EditProfileScreen
    - Change Password → ChangePasswordScreen
    - Notifications Settings
    - Help & Support
    - About → (future: AboutScreen)
  - Admin access link (if user is admin)
    - Admin Dashboard → AdminDashboardScreen
  - Logout button (danger variant)
  - Logout confirmation dialog
  - Account status indicator (verified, blocked, etc.)
- **Dependencies:** authStore.user, authStore.logout()
- **Navigation:**
  - Edit Profile → EditProfileScreen
  - Change Password → ChangePasswordScreen
  - Admin Dashboard → AdminDashboardScreen
  - Logout → Confirmation → LoginScreen
  - Settings items (to be implemented)

#### ServiceDetailScreen
- **Route:** `BottomTabNavigator > [Home|Search] > ServiceDetail`
- **Purpose:** Display complete service information and enable bookings
- **Features:**
  - Service image gallery (can swipe through multiple images)
  - Service name and category
  - Rating and review count
  - Provider information card:
    - Provider name
    - Business type
    - View Provider Profile link
  - Detailed description
  - Available packages with descriptions and pricing
  - Coverage area display (states/nationwide)
  - Key features/specifications
  - Pricing breakdown section:
    - Base price per unit
    - Quantity selector (+/- buttons)
    - Pricing calculation (subtotal, tax, total)
  - Booking form:
    - Quantity selector
    - Event date picker (calendar)
    - Special requirements textarea
  - Action buttons:
    - Continue to Booking (Book Now)
    - Call Provider
    - Message Provider
  - Add to Favorites heart button
  - Share service button
  - Reviews section (expandable list of reviews)
- **Dependencies:** serviceStore.getServiceById(), bookingStore.createBooking()
- **Navigation:**
  - Continue to Booking → Checkout flow (future)
  - View Provider → (future: ProviderProfileScreen)
  - Back → Previous screen
  - Reviews → (future: ReviewDetailScreen)

#### BookingDetailScreen
- **Route:** `BottomTabNavigator > Bookings > BookingDetail`
- **Purpose:** Show complete booking information and enable management
- **Features:**
  - Booking header with status badge
  - Booking number and creation date
  - Booking information section:
    - Service/venue name
    - Event date
    - Number of guests
    - Special requirements
  - Pricing breakdown:
    - Base price
    - Quantity
    - Subtotal
    - Discount (if applicable)
    - Tax
    - Total amount
  - Payment status display
  - Party information:
    - Client/Provider details (depending on user role)
    - Contact number and email
    - Call and Message buttons
  - Status-specific actions:
    - Pending (Provider): Confirm or Decline
    - Pending (Client): Cancel with reason
    - Confirmed (Provider): Mark as Completed
    - Confirmed (Client): Cancel with reason, View Payment
    - Completed: View rating/review (both)
  - Timeline showing booking progression
  - Rating/review section (if completed)
  - Cancellation form (if applicable):
    - Reason input
    - Confirmation buttons
- **Dependencies:** bookingStore.getBookingById(), bookingStore.confirmBooking(), bookingStore.cancelBooking(), bookingStore.completeBooking()
- **Navigation:**
  - Back → BookingsScreen
  - View Payment Details → (future: PaymentDetailScreen)
  - Leave Review → (future: ReviewScreen)

#### EditProfileScreen
- **Route:** `BottomTabNavigator > Profile > EditProfile`
- **Purpose:** Allow users to update their profile information
- **Features:**
  - Profile picture section with change button
  - Personal information form:
    - First name input
    - Last name input
    - Email input (with validation)
    - Phone number input (with Nigerian format validation)
  - Business information section (Service Providers only):
    - Business name input
    - Service provider type (read-only or dropdown)
    - Business description textarea (max 500 chars)
    - Years in business input
  - Account information section:
    - Account type display (read-only)
    - Email verification status with verify link
    - Phone verification status with verify link
  - Form validation with inline error messages
  - Save Changes button (sticky at bottom)
  - Cancel button
  - Loading state during save
  - Success notification after save
- **Dependencies:** authStore.updateProfile()
- **Navigation:**
  - Back → ProfileScreen
  - Save → ProfileScreen (after success)

#### ChangePasswordScreen
- **Route:** `BottomTabNavigator > Profile > ChangePassword`
- **Purpose:** Allow users to change their account password
- **Features:**
  - Security information banner
  - Form with three password fields:
    - Current password (with visibility toggle)
    - New password (with visibility toggle)
    - Confirm new password (with visibility toggle)
  - Real-time password strength indicator
    - Visual progress bar
    - Strength labels: Weak, Medium, Strong
  - Password match indicator:
    - Green checkmark when passwords match
    - Red indicator when they don't match
  - Password tips section:
    - At least 8 characters
    - Uppercase and lowercase mix
    - Include numbers and special characters
    - Don't use personal information
  - Form validation with specific error messages
  - Save/Update Password button
  - Cancel button
  - Loading state during update
- **Dependencies:** authStore.changePassword()
- **Navigation:**
  - Back → ProfileScreen
  - Save → ProfileScreen (after success)

---

### 3. Admin Stack
Located: `frontend/src/screens/admin/`

#### AdminDashboardScreen
- **Route:** `BottomTabNavigator > Profile > AdminDashboard` (role-based)
- **Purpose:** Provide admin overview and access to admin tools
- **Features:**
  - Dashboard header with title
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
  - Management menu (clickable sections):
    - Users Management
    - Bookings Management
    - Services Management
    - Revenue Analytics
    - Reports
  - Recent activity list (optional)
  - System health status indicator
  - Refresh data button
- **Dependencies:** adminAPI.getDashboardStats()
- **Navigation:**
  - Users → (future: ManageUsersScreen)
  - Bookings → (future: ManageBookingsScreen)
  - Services → (future: ManageServicesScreen)
  - Revenue → (future: RevenueAnalyticsScreen)
  - Reports → (future: ReportsScreen)
  - Back → ProfileScreen

---

## Future Screens to Implement

### Detail/Management Screens (Priority: High)
- **ProviderProfileScreen** - View complete provider details and history
- **ReviewDetailScreen** - Full view of a review with images and ratings
- **PaymentDetailScreen** - Payment and receipt information
- **EventCreationScreen** - Create and plan new events

### Admin Screens (Priority: High)
- **ManageUsersScreen** - Block/unblock users, verify providers
- **ManageBookingsScreen** - View all bookings, handle disputes
- **ManageServicesScreen** - Moderate service listings
- **RevenueAnalyticsScreen** - Financial reports and charts
- **ReportsScreen** - System reports and diagnostics

### Feature Screens (Priority: Medium)
- **ReviewScreen** - Submit ratings and reviews
- **ChatScreen** - Direct messaging between users
- **NotificationsScreen** - View all notifications
- **AboutScreen** - App information and privacy policy
- **HelpScreen** - FAQs and support options

### Payment Screens (Priority: Medium)
- **CheckoutScreen** - Payment method selection and confirmation
- **PaymentMethodScreen** - Add/edit payment methods
- **ReceiptScreen** - View and share payment receipts

### Advanced Screens (Priority: Low)
- **AnalyticsScreen** - Provider earnings and statistics
- **MapScreen** - Venue location visualization
- **SettingsScreen** - App preferences and configuration
- **FilterScreen** - Advanced search filters

---

## Navigation Patterns

### Authentication Flow
```
SplashScreen
├─ User not logged in → AuthNavigator
│  ├─ LoginScreen
│  │  ├─ → RegisterScreen
│  │  ├─ → RegisterProviderScreen
│  │  └─ → ForgotPasswordScreen
│  ├─ RegisterScreen
│  │  └─ → LoginScreen
│  ├─ RegisterProviderScreen
│  │  └─ → LoginScreen
│  └─ ForgotPasswordScreen
│     └─ → LoginScreen
└─ User logged in → BottomTabNavigator
```

### Main App Flow
```
BottomTabNavigator (4 tabs)
├─ Home Stack
│  ├─ HomeScreen
│  └─ ServiceDetailScreen
├─ Search Stack
│  ├─ SearchScreen
│  └─ ServiceDetailScreen
├─ Bookings Stack
│  ├─ BookingsScreen
│  └─ BookingDetailScreen
└─ Profile Stack
   ├─ ProfileScreen
   ├─ EditProfileScreen
   ├─ ChangePasswordScreen
   ├─ AdminDashboardScreen
   └─ (other settings screens)
```

---

## State Management

### AuthStore (user authentication)
```javascript
- user: Current user object
- token: JWT token
- isAuthenticated: Boolean
- isLoading: Loading state
- error: Error message
- Methods: login(), register(), logout(), updateProfile(), changePassword()
```

### ServiceStore (service listings)
```javascript
- services: Array of services
- myServices: Provider's own services
- currentService: Selected service details
- isLoading: Loading state
- error: Error message
- Methods: getAllServices(), getServiceById(), createService(), updateService(), deleteService()
```

### BookingStore (bookings management)
```javascript
- bookings: Array of bookings
- currentBooking: Selected booking details
- isLoading: Loading state
- error: Error message
- Methods: createBooking(), getBookingById(), confirmBooking(), cancelBooking(), completeBooking()
```

---

## Component Reusability

### Core Components
- **Button** - For all interactive actions
- **Input** - For all text inputs with validation display
- **Loading** - Inline and full-screen loading states
- **ErrorMessage** - Error display with dismiss option
- **SuccessMessage** - Success feedback presentation

### Usage Examples
```typescript
// Button usage
<Button 
  title="Next"
  onPress={handleNext}
  variant="primary"
  isLoading={isLoading}
  fullWidth
/>

// Input usage
<Input
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
  error={errors.email}
  keyboardType="email-address"
/>

// Loading usage
<Loading fullScreen message="Processing..." />
```

---

## Best Practices

1. **Navigation Props**: Always use `useNavigation()` hook for navigation
2. **Parameters**: Pass required data via route params, not through stores
3. **Error Handling**: Display errors with ErrorMessage component
4. **Loading States**: Show Loading component during async operations
5. **Form Validation**: Use validator functions from helpers.js
6. **Styling**: Use Tailwind classes via NativeWind, no inline styles
7. **State Management**: Use Zustand stores for global state
8. **Type Safety**: Use TypeScript for screen components

---

## Testing Checklist

When implementing or modifying screens:
- [ ] Test on iOS simulator
- [ ] Test on Android emulator
- [ ] Test on web (Expo web)
- [ ] Validate all form inputs
- [ ] Test error states
- [ ] Test loading states
- [ ] Test navigation flows
- [ ] Verify responsive design
- [ ] Check accessibility
- [ ] Test with real data (not mock data)
