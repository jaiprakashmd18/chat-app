import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/useAuthStore';
import { SocketProvider } from './contexts/SocketContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PageLoader } from './components/common/LoadingSpinner';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import AppLayout from './pages/AppLayout';
import AdminPage from './pages/AdminPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/app" replace />;
  return children;
}

function AppWithSocket({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return children;
  return <SocketProvider>{children}</SocketProvider>;
}

export default function App() {
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (isLoading) return <PageLoader />;

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppWithSocket>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1a202c',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
              },
              success: { iconTheme: { primary: '#7c3aed', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/login" element={<PublicRoute><AuthPage mode="login" /></PublicRoute>} />
            <Route path="/auth/register" element={<PublicRoute><AuthPage mode="register" /></PublicRoute>} />
            <Route path="/auth/forgot-password" element={<AuthPage mode="forgot" />} />
            <Route path="/reset-password/:token" element={<AuthPage mode="reset" />} />
            <Route path="/verify-email/:token" element={<AuthPage mode="verify" />} />
            <Route path="/app/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
            <Route path="/admin/*" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppWithSocket>
      </ThemeProvider>
    </BrowserRouter>
  );
}
