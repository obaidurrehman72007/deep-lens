import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import VideoCanvas from './pages/VideoCanvas';
import Links from './pages/Links';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoadingScreen from './components/LoadingScreen';
import NotFound from './pages/NotFound';
import HowToPage from './pages/HowToPage';
import Developer from './pages/Developer';

// A wrapper for routes that REQUIRE login
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center"><LoadingScreen/></div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50">
          <Routes>
            {/* Public */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/public/share/:token" element={<VideoCanvas isPublic={true} />} />
            
            {/* Protected */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/links" element={<ProtectedRoute><Links /></ProtectedRoute>} />
            <Route path="/howtouse" element={<ProtectedRoute><HowToPage/></ProtectedRoute>} />
            <Route path="/developer" element={<ProtectedRoute><Developer/></ProtectedRoute>} />
            <Route path="/canvas/:id" element={<ProtectedRoute><VideoCanvas /></ProtectedRoute>} />

            <Route path="*" element={<NotFound/>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );}

export default App;