// src/App.jsx

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import SignUp from "./pages/SignUp"; // ✅ Fixed typo
import SignIn from "./pages/SignIn";
import AuthLayout from "./components/AuthLayout"; // ✅ layout
import DigitalId from "./pages/DigitalId";
import Dashboard from "./pages/Dashboard"; // ✅ import Dashboard
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import Feedback from "./pages/Feedback";

function App() {
  return (
    <Router>
      <Routes>
        {/* --- Public-Only Routes (like the landing page) --- */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/" element={<Landing />} />
        </Route>

        {/* --- Public Auth Routes (Sign In / Sign Up) --- */}
        <Route element={<AuthLayout />}>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
        </Route>

        {/* --- Protected App Routes (Dashboard, Digital ID) --- */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}> {/* <-- 2. Use the new AppLayout here */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/digital-id" element={<DigitalId />} />
            <Route path="/feedback" element={<Feedback />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
