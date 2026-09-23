import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import VerifyOTP from "./pages/VerifyOTP";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Repositories from "./pages/Repositories";
import Analyses from "./pages/Analyses";
import Analysis from "./pages/Analysis";
import Settings from "./pages/Settings";
import ChangePassword from "./pages/ChangePassword";

import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Pages */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/verify-otp"
          element={<VerifyOTP />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />


        {/* Protected Dashboard Pages */}

        <Route
          element={<ProtectedRoute />}
        >
          <Route
            element={<DashboardLayout />}
          >

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/repositories"
              element={<Repositories />}
            />

            <Route
              path="/analyses"
              element={<Analyses />}
            />

            <Route
            path="/analyses/:analysisId"
            element={<Analysis />}
            />

            <Route
              path="/settings"
              element={<Settings />}
            />

<Route path="/change-password" element={<ChangePassword />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;