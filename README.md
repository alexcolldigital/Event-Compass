# Event Compass - Event Rental & Management Marketplace

A cross-platform mobile application (iOS, Android, and Web) for event rental, planning, and management. Event Compass connects service providers, venues, and event organizers in a seamless marketplace.

## 📱 Features

### For Clients
- Browse and search event services and venues
- Filter by location, price, availability, and ratings
- Create and manage events
- Book services and venues
- Make payments securely via Stripe
- Track booking status in real-time
- Rate and review services

### For Service Providers
- Create and manage service listings
- Manage bookings and schedules
- Track earnings and analytics
- Build reputation with reviews and ratings
- Offer multiple packages and pricing options
- Manage availability

### For Admins
- Complete CRUD operations on all entities
- User management and verification
- Payment and revenue analytics
- Booking management
- System monitoring and reports
- User blocking and account management

## 🏗️ Project Structure

```
Event Compass/
├── backend/                    # Node.js/Express Backend
│   ├── config/               # Configuration files (DB, JWT, constants)
│   ├── models/               # MongoDB models (User, Event, Service, Booking, etc.)
│   ├── controllers/          # Request handlers
│   ├── routes/               # API routes
│   ├── middleware/           # Authentication, validation, error handling
│   ├── utils/                # Email, file upload, payment utilities
│   ├── server.js             # Main server file
│   └── package.json          # Backend dependencies
│
└── frontend/                   # React Native/Expo Frontend
    ├── src/
    │   ├── navigation/        # React Navigation setup
    │   ├── screens/           # All screen components
    │   ├── components/        # Reusable UI components
    │   ├── context/           # Zustand stores (auth, services, bookings)
    │   ├── services/          # API client and requests
    │   ├── utils/             # Helper functions
    │   └── styles/            # Global styles
    ├── App.tsx                # Main app entry point
    ├── app.json               # Expo configuration
    ├── tailwind.config.js     # NativeWind configuration
    └── package.json           # Frontend dependencies
```

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Payment:** Stripe API
- **Email:** Nodemailer
- **File Storage:** Cloudinary
- **Security:** Helmet, CORS, Rate Limiting

### Frontend
- **Framework:** React Native with Expo
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Navigation:** React Navigation
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Authentication:** JWT with AsyncStorage

## 🚀 Installation & Setup

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configurations:
   ```env
   MONGODB_URI=mongodb://localhost:27017/event-compass
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   # ... other configurations
   ```

3. **Install MongoDB**
   - Download from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

4. **Start Backend Server**
   ```bash
   npm run dev  # Development with nodemon
   # or
   npm start    # Production
   ```

   Server runs on `http://localhost:5000`

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:5000/api
   EXPO_PUBLIC_STRIPE_PUBLIC_KEY=your_stripe_public_key
   ```

3. **Install Expo CLI** (if not already installed)
   ```bash
   npm install -g expo-cli
   ```

4. **Start Development Server**
   ```bash
   npm start
   ```

5. **Run on Specific Platform**
   ```bash
   npm run android    # Android emulator/device
   npm run ios        # iOS simulator
   npm run web        # Web browser
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register as client
- `POST /api/auth/register-provider` - Register as service provider
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/profile` - Update profile (protected)
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get specific service
- `GET /api/services/search` - Search services
- `POST /api/services` - Create service (provider only)
- `PUT /api/services/:id` - Update service (provider only)
- `DELETE /api/services/:id` - Delete service (provider only)
- `PATCH /api/services/:id/toggle-availability` - Toggle availability

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get booking details
- `GET /api/bookings/client/my-bookings` - Get client's bookings
- `GET /api/bookings/provider/my-bookings` - Get provider's bookings
- `PATCH /api/bookings/:id/confirm` - Confirm booking (provider)
- `PATCH /api/bookings/:id/cancel` - Cancel booking
- `PATCH /api/bookings/:id/complete` - Complete booking (provider)

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/:id/block` - Block/unblock user
- `PATCH /api/admin/users/:id/verify` - Verify service provider
- `GET /api/admin/bookings` - Get all bookings
- `GET /api/admin/revenue` - Revenue analytics
- `GET /api/admin/users/analytics/breakdown` - User analytics

## 🔐 Security Features

- **JWT Authentication:** Secure token-based authentication
- **Password Hashing:** Bcrypt for secure password storage
- **Rate Limiting:** Protection against brute force attacks
- **CORS:** Cross-origin resource sharing control
- **Helmet:** Security headers middleware
- **Input Validation:** Request validation on all endpoints
- **Error Handling:** Centralized error handling middleware

## 💳 Payment Integration

Event Compass uses Stripe for secure payment processing:

1. **Integration Steps:**
   - Sign up at [stripe.com](https://stripe.com)
   - Get your API keys
   - Add to `.env` file
   - Payment intents are created server-side for security

2. **Payment Flow:**
   - User initiates booking
   - Payment intent created on backend
   - Client-side payment processing
   - Server-side verification
   - Booking confirmation on successful payment

## 📊 Database Schema

### Collections
- **Users:** Client and service provider profiles
- **Services:** Service offerings with pricing and availability
- **Venues:** Venue listings and availability
- **Bookings:** Booking records and status tracking
- **Payments:** Payment transaction records
- **Reviews:** Ratings and reviews
- **Events:** Event planning and details
- **Analytics:** Platform analytics and metrics

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📈 Performance Optimization

- **Database Indexing:** Optimized MongoDB queries
- **Pagination:** Limit API response sizes
- **Caching:** AsyncStorage for client-side caching
- **Image Optimization:** Cloudinary image processing
- **Code Splitting:** Lazy loading of screens and components

## 🐛 Common Issues & Solutions

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** 
- Ensure MongoDB is running: `mongod` (Windows) or check MongoDB Atlas connection

### JWT Token Errors
```
Error: Invalid or expired token
```
**Solution:**
- Clear AsyncStorage and re-login
- Check JWT_SECRET matches in backend .env

### Stripe Payment Issues
```
Error: Invalid API key
```
**Solution:**
- Verify Stripe API keys in .env
- Use test keys for development

### Expo Connection Issues
**Solution:**
- Ensure backend server is running
- Check API_URL in frontend .env
- Use `http://10.0.2.2:5000` for Android emulator

## 📚 Documentation

For detailed documentation:
- Swagger UI: `/api-docs` (when enabled)
- API docs in each route file
- Code comments throughout

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the ISC License - see LICENSE file for details.

## 📞 Support

For support, email:
- support@eventcompass.com
- developer@eventcompass.com

## 👥 Team

- **Developer:** Event Compass Team
- **Version:** 1.0.0
- **Created:** February 2026

## 🚀 Deployment

### Backend Deployment (Heroku)
```bash
# Login to Heroku
heroku login

# Create app
heroku create event-compass-api

# Set environment variables
heroku config:set JWT_SECRET=your_secret_key
heroku config:set MONGODB_URI=your_mongodb_uri

# Deploy
git push heroku main
```

### Frontend Deployment (Expo)
```bash
# Build for production
expo build:android -t app
expo build:ios -t app

# Generate web build
expo export:web
```

## 📋 Checklist for Production

- [ ] Set environment variables securely
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up CD/CI pipeline
- [ ] Enable database backups
- [ ] Configure error logging (Sentry)
- [ ] Set up monitoring (DataDog, New Relic)
- [ ] Configure rate limiting properly
- [ ] Security audit completed
- [ ] Load testing completed
- [ ] DNS configured
- [ ] SSL certificates installed

---

**Happy Booking! 🎉**
