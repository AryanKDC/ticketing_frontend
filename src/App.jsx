import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import { useSelector } from "react-redux";
import TicketsPage from "./pages/tickets/TicketsPage";
import LoginPage from "./pages/login-reg/LoginPage";
import RegisterPage from "./pages/login-reg/RegisterPage";
import UserPage from "./pages/UserPage";
import MainLayout from "./components/layout/MainLayout";
import { Toaster } from 'sonner';

// Private route wrapper
const PrivateRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  return token ? children : <Navigate to="/login" />;
};

// Admin route wrapper
const AdminRoute = ({ children }) => {
  const { token, user } = useSelector((state) => state.auth);
  if (!token) return <Navigate to="/login" />;
  if (user?.type !== 'admin') return <Navigate to="/tickets" />;
  return children;
};

function App() {
  return (
    <Router>
      <Toaster position="top-center" richColors closeButton />
      <CssBaseline />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route path="/tickets" element={
          <PrivateRoute>
            <TicketsPage />
          </PrivateRoute>
        } />
        <Route path="/users" element={
          <AdminRoute>
            <MainLayout>
              <UserPage />
            </MainLayout>
          </AdminRoute>
        } />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/tickets" />} />
        <Route path="*" element={<Navigate to="/tickets" />} />
      </Routes>
    </Router>
  );
}

export default App;