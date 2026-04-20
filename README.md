# Niramaya - Women's Hormonal Health Screening Platform

A comprehensive women's hormonal health screening web application that helps detect conditions like Hypothyroidism, Anemia, PCOS, and other hormonal imbalances through symptom-based screening and optional lab reports.

![Niramaya](https://img.shields.io/badge/Version-1.0.0-green)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-green)

---

## 📋 Features

- **Symptom-Based Screening** - Comprehensive check-in with 30+ symptoms across physical, emotional, and behavioral categories
- **Multiple Condition Detection** - Screens for 24+ conditions including:
  - Major: Hypothyroidism, Hyperthyroidism, Iron-deficiency Anemia, PCOS, Lifestyle Fatigue
  - Minor: Vitamin D deficiency, B12 deficiency, PMS/PMDD, Stress, Sleep issues, and more
- **Lab Report Integration** - Upload blood test reports (CBC, TSH, Ferritin, etc.) for enhanced accuracy
- **Results Dashboard** - Visual ranking with confidence percentages
- **Disease Descriptions** - Detailed info about each condition with symptoms, descriptions, and food recommendations
- **Timeline Tracking** - Track your health over time
- **AI Chatbot** - Groq-powered health assistant
- **Find Doctors** - Locate nearby healthcare providers
- **PDF Reports** - Download detailed screening reports

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18 + Vite
- Zustand (state management)
- Framer Motion (animations)
- PDFKit (report generation)

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- PDFKit (report generation)
- Groq AI (chatbot insights)

### Project Structure

```
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── common/    # AppShell, etc.
│   │   │   └── HealthChatbot.jsx
│   │   ├── pages/         # Page components
│   │   │   ├── LandingPage.jsx
│   │   │   ├── OnboardingPage.jsx
│   │   │   ├── SymptomCheckinPage.jsx
│   │   │   ├── LabUploadPage.jsx
│   │   │   ├── TimelinePage.jsx
│   │   │   └── ResultDashboardPage.jsx
│   │   ├── services/     # API clients
│   │   ├── stores/       # Zustand stores
│   │   └── constants/   # Symptom definitions
│   └── package.json

├── backend/                 # Express backend
│   ├── src/
│   │   ├── models/      # MongoDB schemas
│   │   ├── routes/     # API routes
│   │   ├── controllers/ # Route handlers
│   │   ├── services/   # Business logic
│   │   │   ├── screeningService.js  # Core algorithm
│   │   │   ├── reportBuilder.js   # PDF generation
│   │   │   └── groqService.js    # AI insights
│   │   └── middlewares/
│   └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/synthera.git
cd synthera
```

2. **Setup Backend**
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your values:
# - MONGODB_URI (your MongoDB connection string)
# - JWT_SECRET (generate a secure random string)
# - GROQ_API_KEY (get from https://console.groq.com/)

# Start development server
npm run dev
```

3. **Setup Frontend**
```bash
cd frontend
npm install

# Create .env file  
cp .env.example .env
# Edit .env:
# - VITE_API_BASE_URL=http://localhost:5000/api

# Start development server
npm run dev
```

4. **Open Browser**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## 📝 Environment Variables

### Backend (.env)

```env
PORT=5000
MONGODB_URI=mongodb+srv://...
NODE_ENV=production
JWT_SECRET=your_secure_random_string_min_32_chars
JWT_EXPIRES_IN=7d
GROQ_API_KEY=gsk_...
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GROQ_API_KEY=gsk_...
```

---

## 🔐 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/profile` | Get user profile |

### Screening
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/screen` | Run screening |
| GET | `/api/screen/history/:userId` | Get user's screening history |
| GET | `/api/screen/progression/:userId` | Get risk progression |
| GET | `/api/screen/report/:sessionId` | Download PDF report |

### Symptoms
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/symptoms` | Save symptom log |
| GET | `/api/symptoms/:userId` | Get symptom history |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/profile` | Update profile |
| GET | `/api/profile/:userId` | Get profile |

---

## 🎯 Core Algorithm

The screening engine (`screeningService.js`) works as follows:

1. **Symptom Normalization** - Parse and weight symptoms
2. **Condition Evaluation** - Score each condition (anemia, hypothyroidism, PCOS, etc.)
3. **Lab Integration** - Factor in blood test values
4. **Minor Tendency Detection** - Identify supporting conditions
5. **Confidence Calculation** - Produce percentage-based results

### Detected Conditions

**Major (5):**
1. Iron-deficiency Anemia
2. Hypothyroidism
3. Hyperthyroidism
4. PCOS/PCOD
5. Lifestyle-related Fatigue

**Minor (19):**
- Vitamin D deficiency, B12 deficiency, PMS/PMDD
- Stress-related fatigue, Sleep disruption
- Endometriosis, Menorrhagia, Amenorrhea
- Uterine Fibroids, Insulin Resistance
- And more...

---

## 📱 User Flow

1. **Sign Up/Login** - Create account or login
2. **Onboarding** - Basic profile (age, height, weight, lifestyle)
3. **Symptom Check-in** - Report symptoms across 3 categories
4. **Lab Upload** - (Optional) Upload blood reports
5. **Screening** - Get results with confidence percentages
6. **Results** - View detailed dashboard with recommendations
7. **Timeline** - Track progress over time

---

## ☁️ Deployment

### Backend → Render

1. Push code to GitHub
2. Create new Web Service on https://render.com
3. Connect repository
4. Set environment variables:
   - `PORT=5000`
   - `MONGODB_URI=your_mongodb_uri`
   - `NODE_ENV=production`
   - `JWT_SECRET=your_secure_secret`
   - `GROQ_API_KEY=your_groq_key`
5. Build Command: `npm install`
6. Start Command: `npm start`

### Frontend → Vercel

1. Push code to GitHub
2. Import project on https://vercel.com
3. Set environment variable:
   - `VITE_API_BASE_URL=https://your-render-backend.onrender.com/api`
4. Deploy!

---

## 📄 License

MIT License - See LICENSE file for details.

---

## 🙏 Acknowledgments

- Built with ❤️ for Indian women
- Health insights powered by Groq AI
- Design system inspired by modern medical UI patterns

---

## 📞 Support

For issues or questions:
- Open a GitHub issue
- Email: support@synthera.com

---

<<<<<<< HEAD
**Note:** This is a screening tool, NOT a medical diagnosis.
=======
**Note:** This is a screening tool, NOT a medical diagnosis. Always consult a healthcare professional for medical advice.
>>>>>>> 4dadb12 (kasndm)
