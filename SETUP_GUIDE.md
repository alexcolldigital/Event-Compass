# Event Compass - Complete Setup Guide

## Prerequisites

Before you start, ensure you have installed:

1. **Node.js** (v16 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version` and `npm --version`

2. **MongoDB**
   - Local: https://www.mongodb.com/try/download/community
   - Cloud (Recommended): https://www.mongodb.com/cloud/atlas

3. **Git**
   - Download: https://git-scm.com/

4. **Android Studio** (for Android development)
   - Download: https://developer.android.com/studio
   - Or use Expo Go app on Android device

5. **Xcode** (for iOS development - macOS only)
   - Download from App Store

## Backend Setup

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install all required packages:
- express: Web framework
- mongoose: MongoDB ODM
- jsonwebtoken: Authentication
- bcryptjs: Password hashing
- stripe: Payment processing
- nodemailer: Email sending
- cloudinary: Image storage
- And more...

### Step 3: MongoDB Setup

**Option A: Local MongoDB**
```bash
# Windows
mongod --dbpath "YOUR_PATH_TO_DATA_FOLDER"

# macOS/Linux
mongod
```

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Get connection string
5. Use in `.env` file

### Step 4: Configure Environment Variables
```bash
# Copy example file
cp .env.example .env

# Edit .env file with your configurations
```

**Required .env Variables:**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/event-compass
# or for MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/event-compass

# Server
PORT=5000
NODE_ENV=development
BASE_URL=http://localhost:5000

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password  # Use app password for Gmail
FROM_EMAIL=noreply@eventcompass.com

# Payment (Stripe)
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLIC_KEY=pk_test_your_key_here

# Cloud Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# URLs
FRONTEND_URL=http://localhost:3000
```

### Step 5: Start Backend Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

You should see:
```
✅ Event Compass Server is running on port 5000
📍 Environment: development
🗄️  Database: mongodb://localhost:27017/event-compass
🌐 CORS enabled for: http://localhost:3000
```

## Frontend Setup

### Step 1: Navigate to Frontend Directory
```bash
cd frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
```bash
# Copy example file
cp .env.example .env

# Edit .env file
```

**.env Content:**
```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
EXPO_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_your_key_here
EXPO_PUBLIC_APP_ENV=development
```

**For Android Emulator:**
```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api
```

### Step 4: Install Expo CLI (if not already installed)
```bash
npm install -g expo-cli
```

### Step 5: Start Development Server
```bash
npm start
```

You'll see a menu:
```
› Metro waiting on exp://192.168.x.x:19000
› Press 'a' for Android
› Press 'i' for iOS
› Press 'w' for web
› Press 'r' to restart
```

## Running the Application

### Web Browser
```bash
cd frontend
npm run web
```
- Opens at http://localhost:19006

### Android
```bash
cd frontend

# Option 1: Using Android Emulator
npm run android

# Option 2: Using device with Expo Go
npm start
# Scan QR code with Expo Go app
```

### iOS (macOS only)
```bash
cd frontend

# Option 1: Using iOS Simulator
npm run ios

# Option 2: Using device with Expo Go
npm start
# Scan QR code with Expo Go app
```

## Testing the Application

### Test Login Credentials

**As a Client:**
```
Email: client@test.com
Password: password123
```

**As a Service Provider:**
```
Email: provider@test.com
Password: password123
```

**As an Admin:**
```
Email: admin@eventcompass.com
Password: admin123secure
```

### Create Test Account
1. Click "Register as Client" or "Register as Service Provider"
2. Fill in the form
3. Login with your credentials

## API Testing

### Using Postman/Insomnia

1. **Import Collection**
   - Import the provided `eventcompass-api.postman_collection.json`
   - Or manually create requests

2. **Sample API Calls**

**Register:**
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "08012345678",
  "password": "password123",
  "passwordConfirm": "password123"
}
```

**Login:**
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Get Services:**
```bash
GET http://localhost:5000/api/services
```

**Create Service:**
```bash
POST http://localhost:5000/api/services
Authorization: Bearer {YOUR_TOKEN}
Content-Type: application/json

{
  "name": "DJ Services",
  "description": "Professional DJ services",
  "serviceType": "dj",
  "pricing": {
    "basePrice": 50000,
    "unit": "hourly"
  }
}
```

## Troubleshooting

### Backend Issues

#### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solutions:**
- Check if MongoDB is running
- For local: Run `mongod` in a terminal
- For Atlas: Check connection string in .env
- Verify network access in MongoDB Atlas

#### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solutions:**
```bash
# Kill process on port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Or change PORT in .env
PORT=5001
```

#### JWT/Authentication Errors
**Solutions:**
- Clear localStorage: `localStorage.clear()`
- Clear AsyncStorage in app
- Re-login
- Check JWT_SECRET matches in backend

### Frontend Issues

#### Expo Connection Error
**Solutions:**
- Restart Metro server: `npm start`
- Clear cache: `npm start -- --clear`
- Check backend is running on correct port

#### Android Emulator IP Issue
**Solutions:**
```env
# Use this for Android Emulator
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api
```

#### White/Blank Screen
**Solutions:**
- Clear Expo cache: `expo cache clear`
- Restart Metro server
- Clear node_modules: `rm -rf node_modules && npm install`

#### Module Not Found Error
**Solutions:**
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install

# For Expo specific
expo install
```

## Database Seeding (Optional)

Create some test data:

```bash
cd backend

# Create a seed.js file with test data
node seed.js
```

Sample seed.js:
```javascript
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI);

const seedData = async () => {
  try {
    // Create test user
    const user = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phoneNumber: '08012345678',
      password: 'password123',
      role: 'client'
    });
    
    await user.save();
    console.log('Seed data created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
```

## Development Workflow

### Making Changes

1. **Backend Changes**
   - Edit files in `backend/`
   - Server auto-reloads (with nodemon)
   - Test with API client

2. **Frontend Changes**
   - Edit files in `frontend/src/`
   - App hot-reloads automatically
   - Check device/emulator

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and commit
git add .
git commit -m "Add some feature"

# Push to repository
git push origin feature/amazing-feature
```

## Building for Production

### Backend

```bash
cd backend

# Set NODE_ENV to production
# Edit .env: NODE_ENV=production

# Start server
npm start
```

### Frontend - Web
```bash
cd frontend

# Build web
expo export:web

# Out directory contains PWA-ready files
```

### Frontend - Android APK
```bash
cd frontend

# Build APK
expo build:android

# Download APK from Expo dashboard
```

### Frontend - iOS IPA
```bash
cd frontend

# Build iOS
expo build:ios

# Download IPA from Expo dashboard
```

## Next Steps

1. ✅ Setup complete!
2. 📱 Test the application on different platforms
3. 🔧 Customize colors and branding in `tailwind.config.js`
4. 📊 Set up additional services (Sentry, Analytics)
5. 🚀 Deploy to production

## Important Notes

- **Security:** Never commit `.env` files to git
- **Credentials:** Change all default credentials before production
- **CORS:** Configure properly for your frontend URL
- **Database:** Regular backups recommended
- **Payments:** Test with Stripe test keys first

## Support

For issues or questions:
1. Check troubleshooting section
2. Review error logs
3. Check backend console output
4. Review frontend console (Chrome DevTools)

---

**Happy Coding! 🚀**
