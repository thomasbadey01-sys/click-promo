import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import Abonnement from './pages/Abonnement';
import Admin from './pages/Admin';
import Carte from './pages/Carte';
import Dashboard from './pages/Dashboard';
import Favoris from './pages/Favoris';
import Feed from './pages/Feed';
import Home from './pages/Home';
import InscriptionCommercant from './pages/InscriptionCommercant';
import Login from './pages/Login';
import OffreDetail from './pages/OffreDetail';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Profil from './pages/Profil';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Home" replace />} />
      <Route path="/Abonnement" element={<Abonnement />} />
      <Route path="/Admin" element={<Admin />} />
      <Route path="/Carte" element={<Carte />} />
      <Route path="/Dashboard" element={<Dashboard />} />
      <Route path="/Favoris" element={<Favoris />} />
      <Route path="/Feed" element={<Feed />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/InscriptionCommercant" element={<InscriptionCommercant />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/OffreDetail" element={<OffreDetail />} />
      <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
      <Route path="/Profil" element={<Profil />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App