# SOF-UMER — Enterprise Multi-Category Marketplace & Property Listing Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000.svg?logo=express)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.1-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_&_Mongoose-47A248.svg?logo=mongodb)](https://www.mongodb.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-Android_8.5-119EFF.svg?logo=capacitor)](https://capacitorjs.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media_CDN-3448C5.svg?logo=cloudinary)](https://cloudinary.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Google_Gemini-8E75B2.svg?logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **SOF-UMER** is a production-grade, full-stack multi-category marketplace and property listing platform engineered with modern web technologies and cross-platform native mobile support. Tailored for Ethiopian and international commercial markets, the application features complete tri-lingual localization (English, Afaan Oromoo, Amharic), high-security authentication (JWT, TOTP 2FA, brute-force mitigation), dual retail & wholesale trading mechanics, wallet & receipt verification engines, and an extensive enterprise administrative control suite.

---

## 🌐 Live Platform & Links

- **Production Domain**: [https://sofumerapp.com](https://sofumerapp.com)
- **GitHub Repository**: [https://github.com/jemsij3/sof-umer](https://github.com/jemsij3/sof-umer)
- **Developer Contact**: Jemal Jima ([jemaljima@gmail.com](mailto:jemaljima@gmail.com))

---

## 🚀 Key Highlights & Architecture

```
                                  +---------------------------------------+
                                  |         CLIENT INTERFACES             |
                                  |  - Responsive Web (React 19 + Vite)   |
                                  |  - Progressive Web App (PWA)          |
                                  |  - Android App (Capacitor 8.5 / TWA)  |
                                  +-------------------+-------------------+
                                                      |
                                                      | HTTPS / REST / JSON
                                                      v
                                  +-------------------+-------------------+
                                  |      NODE.JS / EXPRESS BACKEND        |
                                  |  - JWT Authentication & RBAC Engine   |
                                  |  - TOTP 2FA Verification (otplib)     |
                                  |  - Rate-Limiting & Security Auditing  |
                                  |  - Translation & CMS Dispatcher       |
                                  +---------+---------+---------+---------+
                                            |         |         |
                  +-------------------------+         |         +-------------------------+
                  |                                   |                                   |
                  v                                   v                                   v
+-----------------+-----------------+ +---------------+---------------+ +-----------------+-----------------+
|        PERSISTENCE LAYER          | |      EXTERNAL INTEGRATIONS    | |       AI & EMAIL SERVICES       |
| - MongoDB Atlas (Primary DB)      | | - Cloudinary (Media Assets)   | | - Google Gemini AI SDK          |
| - Mongoose Schemas & Bulk Sync    | | - Local FS / Persistent Disk  | | - Resend API / Nodemailer SMTP  |
| - Fail-Safe Seed & Backup Engine  | | - QR Code Generator           | | - Automated Verification OTPs   |
+-----------------------------------+ +-------------------------------+ +-----------------------------------+
```

---

## 🌟 Core Features & Modules

### 1. 🛍️ Multi-Category Marketplace & Listing Wizard
- **Comprehensive Major Categories**: Properties (Real Estate, Rentals, Commercial Spaces), Vehicles (Cars, Trucks, Motorcycles), Jobs & Careers, Professional Services, Products & Electronics, Local Businesses, and Community Announcements.
- **5-Step Interactive Listing Wizard**: Dynamic category & subcategory selection, detailed specifications (amenities, condition, brand, area, dimensions), multi-currency pricing (ETB, USD, SAR, EUR, AED), media uploader, ad preview, and promotion boost packages.
- **Retail & Wholesale Capabilities**: Native support for wholesale listings with Minimum Order Quantity (MOQ), tiered pricing, bulk supply terms, and business classification (Manufacturer, Wholesaler, Importer, Farmer, Cooperative).
- **Advanced Media Management**: High-speed image and video processing integrated with Cloudinary CDN. Supports drag-and-drop uploads, cover photo assignment, client-side reordering, and video showcase integration.

### 2. 🔐 Enterprise Authentication & Account Security
- **Multi-Credential Login**: Authenticate via Email, Username, or Normalized Phone Number with secure `bcryptjs` password hashing and password history tracking.
- **Two-Factor Authentication (2FA)**: Time-based One-Time Password (TOTP) standard compliant with Google Authenticator and Authy. Generates QR codes and secure downloadable backup recovery codes.
- **Brute-Force & Lockout Safeguards**: Automatic progressive account lockout (15-minute freeze) upon consecutive failed password attempts, paired with dynamic mathematical CAPTCHA challenges.
- **Role-Based Access Control (RBAC)**: Distinct permission matrices for **Super Admins**, **Employee Admins** (with granular per-module delegation), **Verified Sellers**, and **Standard Users**.
- **Audit & Security Logging**: Full traceability with IP address resolution, device type detection, user-agent parsing, and timestamped security event trails.

### 3. 💬 Communication, Offers & Reputation System
- **Direct Real-Time Inquiries**: Integrated messaging engine enabling buyers and sellers to communicate directly on specific listings.
- **Formal Offer & Counter-Offer Negotiation**: Structured bargaining workflow allowing buyers to submit custom price offers, and sellers to Accept, Reject, or Counter-Offer with custom messages.
- **Seller Profile & Trust Badges**: Verified Seller badges, member tenure indicators, active catalog views, and public contact disclosure toggles.
- **Ratings & Reviews**: 5-star customer feedback system with text reviews, sentiment auditing, and administrative moderation controls.
- **Safety & Flagging**: Community safety reporting framework enabling users to report suspicious listings or malicious accounts with automated administrative ticketing.

### 4. 💳 Financial Ecosystem & Ad Promotion
- **In-App Digital Wallet**: Internal balance and credits ledger tracking Top-up, Spend, and Refund transactions.
- **Manual Payment & Bank Receipt Verification Engine**: Multi-bank account instructions (Commercial Bank of Ethiopia, Telebirr, Awash, etc.) with receipt photo/PDF upload and reference number verification workflow for admin approval.
- **Tiered Promotion Packages**: Boost listings to **Top Ad**, **Featured**, **VIP**, or **Premium** badges with dynamic expiration tracking and automated prominence ranking.

### 5. 🛡️ Administrative Control Suite
- **Employee Admin Management**: Create sub-admin staff accounts with dedicated employee IDs, department assignments, temporary passwords, and restricted module permissions (e.g., listings only, receipts only, user moderation only).
- **Listing & User Moderation**: In-line listing review, batch approval, warnings issuance, temporary suspension, or permanent banning with recorded reasons and audit logging.
- **Content & CMS Management**: Live editor for FAQ catalogs, system announcements, promotional hero banners, category taxonomies, and dynamic contact information.
- **System Health & Maintenance Mode**: Toggleable platform maintenance mode with customizable downtime alerts for scheduled system updates.

### 6. 🌐 Multilingual Localization (Tri-Lingual Engine)
- Complete, native localization supporting three major languages:
  1. **English (`en`)**
  2. **Afaan Oromoo (`om`)**
  3. **Amharic (`am` / አማርኛ)**
- Dynamic in-app language switcher, localized UI strings, RTL/LTR layout stability, and a database-backed Translation Key Manager for live hot-reloading of translations without code rebuilds.

### 7. 📱 Cross-Platform Mobile Delivery
- **Progressive Web App (PWA)**: Offline asset caching, service workers, standalone display mode, and installable web manifests.
- **Native Android App (Capacitor 8.5)**: Native Android bridge supporting SDK 21 through SDK 34, native hardware acceleration, and cleartext secure API communication.
- **Trusted Web Activity (TWA)**: Google Play Store ready configuration via `twa-manifest.json` and Bubblewrap tooling.

---

## 🛠️ Technology Stack

| Domain | Technology / Library | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19.0.1** | Reactive user interface and modern component architecture |
| **Build & Bundler** | **Vite 6.2 + esbuild** | Ultra-fast HMR development and optimized production CJS server bundling |
| **Styling & Design** | **Tailwind CSS v4.1** | Responsive, modern utility-first styling with custom dark/light palettes |
| **Animations** | **Motion (Framer Motion 12)** | Fluid micro-interactions, modal transitions, and wizard step animations |
| **Icons** | **Lucide React** | Cohesive, accessible vector iconography |
| **Backend Runtime** | **Node.js + Express 4.21** | High-performance RESTful API endpoints and static SPA serving |
| **TypeScript** | **TypeScript 5.8** | Full-stack end-to-end type safety and strict schema validation |
| **Database & ODM** | **MongoDB Atlas + Mongoose 9.8** | Distributed cloud NoSQL database with auto-reconnecting bulk sync |
| **Storage Fallback** | **Atomic JSON File Store** | Multi-tiered persistence engine with automatic migration & backup snapshots |
| **Media & CDN** | **Cloudinary v2.10** | High-resolution image/video upload, transformation, and HTTPS CDN delivery |
| **Authentication** | **JWT (`jsonwebtoken`) + `bcryptjs`** | Signed token session management and cryptographic password hashing |
| **Two-Factor Auth** | **`otplib` + `qrcode`** | TOTP authentication algorithm and QR code generator for 2FA onboarding |
| **Email Delivery** | **Resend API + Nodemailer 9.0** | Transactional verification codes, password resets, and admin notifications |
| **AI Integration** | **`@google/genai` (Gemini 2.0/2.5)** | Server-side AI intelligence for listing optimization and smart assistance |
| **Mobile Platform** | **Capacitor 8.5 + Android Studio** | Cross-platform native mobile container and APK generation |

---

## 📁 Project Directory Structure

```text
sof-umer/
├── android/                   # Native Android Studio project container (Capacitor)
├── assets/                    # Static branding, logos, and vector assets
├── locales/                   # Tri-lingual localization dictionaries
│   ├── am.json                # Amharic translation catalog
│   ├── en.json                # English translation catalog
│   └── om.json                # Afaan Oromoo translation catalog
├── public/                    # Static public assets (Favicons, PWA icons, manifest)
├── src/                       # React frontend source code
│   ├── components/            # Modular feature components
│   │   ├── AdminDashboard.tsx         # Enterprise admin management panel
│   │   ├── AllCategoriesModal.tsx     # Full category catalog browser
│   │   ├── AuthScreen.tsx             # Login, Registration & OTP verification
│   │   ├── CategorySelectModal.tsx    # Category selection modal
│   │   ├── CreateListingModal.tsx     # Quick listing creation interface
│   │   ├── EmployeeAdminsModule.tsx   # Staff & sub-admin access delegation
│   │   ├── Footer.tsx                 # Universal responsive footer
│   │   ├── HelpCenter.tsx             # Interactive FAQ and user support tickets
│   │   ├── InfoPage.tsx               # Terms, Privacy Policy, and About Us pages
│   │   ├── ListingWizard.tsx          # 5-step property & product posting wizard
│   │   ├── LocationSelectorModal.tsx  # Region, City & Landmark selector
│   │   ├── Marketplace.tsx            # Main search, filter & property feed
│   │   ├── Navbar.tsx                 # Header navigation & notification hub
│   │   ├── PropertyDetails.tsx        # Comprehensive listing view & offer modal
│   │   ├── ReceiptUploadInput.tsx     # Payment proof & bank slip uploader
│   │   ├── SafetyTips.tsx             # Fraud prevention & buyer safety guidelines
│   │   ├── SellerCard.tsx             # Verified seller reputation card
│   │   ├── SubcategorySelectModal.tsx # Subcategory filter modal
│   │   ├── TwoFactorSecurityModule.tsx# TOTP 2FA setup, QR code & recovery keys
│   │   └── UserDashboard.tsx          # User profile, wallet, ads & chat manager
│   ├── lib/                   # Utility helpers and shared library configs
│   ├── utils/                 # Formatting, currency, and validation helpers
│   ├── App.tsx                # Primary application state coordinator & routing
│   ├── index.css              # Tailwind CSS v4 styling rules
│   ├── main.tsx               # Client React DOM entry point
│   └── types.ts               # Universal TypeScript data contracts and interfaces
├── .env.example               # Environment variables specification
├── capacitor.config.json      # Capacitor native mobile runtime configuration
├── metadata.json              # Platform runtime & capability manifest
├── package.json               # Project manifest, dependencies, and build scripts
├── server.ts                  # Production Express API server, MongoDB ODM & Auth
├── tsconfig.json              # TypeScript compilation configuration
├── twa-manifest.json          # Trusted Web Activity manifest for Google Play Store
└── vite.config.ts             # Vite bundler & Tailwind CSS plugin configuration
```

---

## ⚙️ Environment Variables Reference

Create a `.env` file in the root directory (or configure via your cloud provider dashboard, e.g., Render / Cloud Run / Railway / Heroku):

| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Yes | Runtime environment (`production` / `development`) | `production` |
| `PORT` | No | Server port (defaults to `3000`) | `3000` |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/sof_umer_db` |
| `JWT_SECRET` | Yes | 32+ character key for signing JWT tokens | `super_secure_random_production_jwt_key_32chars` |
| `APP_URL` | No | Public production domain URL | `https://sofumerapp.com` |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary account cloud name | `your_cloudinary_name` |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API access key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret | `your_cloudinary_api_secret` |
| `RESEND_API_KEY` | Optional | API key for Resend email dispatching | `re_123456789_abcdef` |
| `RESEND_FROM` | Optional | Verified sender email address | `Sof Umer <noreply@sofumerapp.com>` |
| `SMTP_HOST` | Optional | Fallback SMTP host (e.g., Gmail / SendGrid) | `smtp.gmail.com` |
| `SMTP_PORT` | Optional | SMTP connection port | `587` |
| `SMTP_USER` | Optional | SMTP authentication username | `your-email@gmail.com` |
| `SMTP_PASS` | Optional | SMTP app-specific password | `your-app-password` |
| `GEMINI_API_KEY` | Optional | Google Gemini AI API key for AI features | `AIzaSy...` |

---

## 💻 Local Development Setup

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm** / **bun** / **yarn**
- **MongoDB**: Local MongoDB instance or free [MongoDB Atlas Cluster](https://www.mongodb.com/cloud/atlas)

### 2. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/jemsij3/sof-umer.git

# Navigate to project folder
cd sof-umer

# Install all required dependencies
npm install
```

### 3. Configure Environment Variables
```bash
# Create local .env from example template
cp .env.example .env

# Edit .env with your MongoDB URI, JWT Secret, and Cloudinary keys
```

### 4. Run Development Server
```bash
# Start backend server + Vite frontend with hot-reloading
npm run dev
```
The application will be live at `http://localhost:3000`.

---

## 🏗️ Production Build & Deployment

The build system utilizes a dual-pipeline process: Vite builds optimized static client assets to `dist/`, while `esbuild` compiles `server.ts` into a self-contained CommonJS server at `dist/server.cjs`.

```bash
# Run full production build
npm run build

# Start the compiled production server
npm start
```

### Deploying to Render / Cloud Run / VPS
1. **Build Command**: `npm run build`
2. **Start Command**: `npm start`
3. **Environment**: Set `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_*`.

---

## 📱 Android Native Build (Capacitor)

To compile the native Android APK using Capacitor:

```bash
# 1. Clean previous builds and sync web assets to Android
npm run build:apk

# 2. Open project in Android Studio
npm run cap:open

# 3. Build signed APK or Android App Bundle (AAB) inside Android Studio:
#    Build -> Generate Signed Bundle / APK
```

---

## 📡 RESTful API Overview

### 🔑 Authentication & Security
- `POST /api/auth/register` — Register a new account (email/phone/username) with email verification OTP.
- `POST /api/auth/login` — Login with password, brute-force tracking & 2FA evaluation.
- `POST /api/auth/verify-otp` — Verify registration OTP code.
- `POST /api/auth/resend-otp` — Request fresh verification code.
- `POST /api/auth/forgot-password` & `/api/auth/reset-password` — Password recovery workflow.
- `POST /api/auth/2fa/generate` — Generate TOTP secret and QR code for Google Authenticator.
- `POST /api/auth/2fa/enable` — Confirm 6-digit TOTP code and activate 2FA with recovery codes.
- `POST /api/auth/2fa/disable` — Deactivate 2FA security.

### 🏡 Listings & Catalog
- `GET /api/properties` — Retrieve all active listings with filtering, search, and sorting.
- `GET /api/properties/:id` — Retrieve detailed listing information with seller details.
- `POST /api/properties` — Create a new listing (supports multi-image upload & wholesale options).
- `PUT /api/properties/:id` — Update existing listing.
- `DELETE /api/properties/:id` — Remove listing.
- `POST /api/properties/:id/offers` — Submit negotiation offer on a listing.
- `POST /api/properties/:id/reviews` — Submit buyer review and rating.

### 💼 Wallet & Payments
- `GET /api/wallet/balance` — Fetch user wallet balance and transaction ledger.
- `POST /api/wallet/topup` — Initiate top-up request with payment reference.
- `POST /api/receipts` — Upload bank transfer receipt for administrative approval.
- `GET /api/receipts/my-receipts` — View user submitted receipts and verification status.

### 🛡️ Admin & Moderation
- `GET /api/admin/overview` — Platform KPI metrics, active ads, revenue, and user analytics.
- `GET /api/admin/users` — List and filter all registered platform users.
- `POST /api/admin/users/:id/status` — Modify user status (Active, Suspended, Banned) with reason logs.
- `GET /api/admin/receipts` & `POST /api/admin/receipts/:id/action` — Review and approve/reject bank receipts.
- `GET /api/admin/employees` & `POST /api/admin/employees` — Manage staff accounts and permissions.
- `GET /api/admin/translations` & `PUT /api/admin/translations` — Update system localization strings live.

---

## 👨‍💻 Developer Information

**Jemal Jima**  
*Full-Stack Software Engineer*  
- **Email**: [jemaljima@gmail.com](mailto:jemaljima@gmail.com)  
- **GitHub**: [@jemsij3](https://github.com/jemsij3)  
- **Project Repository**: [https://github.com/jemsij3/sof-umer](https://github.com/jemsij3/sof-umer)  
- **Platform Web**: [https://sofumerapp.com](https://sofumerapp.com)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). All rights reserved.
