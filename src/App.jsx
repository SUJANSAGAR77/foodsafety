// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./store/AppContext";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import ReportSubmission from "./pages/ReportSubmission";
import UserDashboard from "./pages/UserDashboard";
import HandlerDashboard from "./pages/HandlerDashboard";
import RoutingDashboard from "./pages/RoutingDashboard";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Sidebar />
          <div className="main-content">
            <Navbar />
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/submit"    element={<ReportSubmission />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/handler"   element={<HandlerDashboard />} />
              <Route path="/routing"   element={<RoutingDashboard />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
