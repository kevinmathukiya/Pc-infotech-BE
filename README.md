# PC Infotech Backend

A backend API for the PC Infotech platform built using Node.js, Express, TypeScript, and MongoDB.

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* MongoDB database
* Cloudinary credentials (for image uploads)

### Setup & Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/pcinfotech
   JWT_ACCESS_SECRET=your_access_token_secret
   JWT_REFRESH_SECRET=your_refresh_token_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ADMIN_EMAIL=admin@pcinfotech.com
   ADMIN_PASSWORD=AdminPassWord123!
   ```

3. **Seed admin account:**
   ```bash
   npm run db:seed
   ```

4. **Run the server:**
   * Development mode:
     ```bash
     npm run dev
     ```
   * Production mode:
     ```bash
     npm run build
     npm start
     ```

## 📁 Key Directories

* `src/modules/` - Auth, product, brand, category, service, and blog modules
* `src/middleware/` - Auth guards, upload handling, and error validation
* `src/helpers/` - Integration helpers for Cloudinary and Geocoding
* `src/config/` - Environment variables configuration
* `src/swagger/` - API documentation files

## 📖 API Documentation

Once the server is running, access the interactive API docs at:
* **Swagger UI:** `http://localhost:5000/api-docs`
* **Health Check:** `http://localhost:5000/health`
