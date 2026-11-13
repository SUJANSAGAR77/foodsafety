# 🚨 Incident Report Management System (IRMS)

A fully responsive **MERN-style** web application for managing incident reports with smart routing, classification, and analytics.

---

## 📋 Features

### Dashboards
| Page | Route | Description |
|------|-------|-------------|
| Report Submission | `/submit` | File reports with DFA/regex validation and auto-classification |
| User Dashboard | `/dashboard` | KPI cards, search by report ID, full report table |
| Handler Dashboard | `/handler` | Manage assignments, update status, control availability/capacity |
| Routing Management | `/routing` | Routing table, handler loads, escalation log, queue management |
| Analytics | `/analytics` | Zone/category charts, resolved vs unresolved, priority distribution |

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run all 15 test cases
npm run test

# Run tests with interactive UI
npm run test:ui
```

---

## 🧪 Test Coverage (15 Test Cases)

| TC | Category | Coverage |
|----|----------|---------|
| TC-1 | Valid Input | Valid report format passes DFA |
| TC-2 | Invalid Input | Malformed ID rejected with reason |
| TC-3 | Invalid Input | Unknown zone code rejected |
| TC-4 | Field Validation | Name, contact, description validation |
| TC-5 | Form Validation | Full form invalid/valid scenarios |
| TC-6 | Category | All 5 categories detected from description |
| TC-7 | Category | Conflicting patterns resolved by priority |
| TC-8 | Priority | Urgency + category → final priority |
| TC-9 | ID Generation | Sequential, padded report IDs per zone |
| TC-10 | Routing | Known zone routes to correct handler |
| TC-11 | Routing | Unknown zone triggers fallback handler |
| TC-12 | Handler | Capacity overflow → backup dispatch |
| TC-13 | Priority Override | EMERGENCY/CRITICAL gets best handler |
| TC-14 | Queue Ordering | Multiple reports ordered deterministically |
| TC-15 | Load Tracking | Handler load % computed correctly |

---

## 🏗️ Tech Stack

- **Framework**: React 18 + Vite
- **Routing**: React Router v6
- **Charts**: Recharts
- **Testing**: Vitest + React Testing Library
- **State**: React Context + useReducer
- **Styling**: Vanilla CSS (custom design system)

---

## 📁 Project Structure

```
src/
├── store/
│   ├── mockData.js       # Simulated Flask/SQLite backend
│   └── AppContext.jsx    # Global state
├── utils/
│   ├── validator.js      # DFA + regex validation
│   ├── classifier.js     # Category/priority classifier
│   └── routerLogic.js   # Dispatch & routing engine
├── components/
│   ├── Sidebar.jsx
│   ├── Navbar.jsx
│   ├── KPICard.jsx
│   └── StatusBadge.jsx
└── pages/
    ├── ReportSubmission.jsx
    ├── UserDashboard.jsx
    ├── HandlerDashboard.jsx
    ├── RoutingDashboard.jsx
    └── AnalyticsDashboard.jsx
tests/
├── validator.test.js   (TC-1 to TC-5)
├── classifier.test.js  (TC-6 to TC-9)
└── router.test.js      (TC-10 to TC-15)
```
