import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import Abonnement from './pages/Abonnement.jsx';
import Accueil from './pages/Accueil.jsx';
import Admin from './pages/Admin.jsx';
import Carte from './pages/Carte.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Favoris from './pages/Favoris.jsx';
import Feed from './pages/Feed.jsx';
import Home from './pages/Home.jsx';
import InscriptionCommercant from './pages/InscriptionCommercant.jsx';
import Login from './pages/Login.jsx';
import OffreDetail from './pages/OffreDetail.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import CommercantProfil from './pages/CommercantProfil.jsx';
import Profil from './pages/Profil.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import FetchResults from './pages/FetchResults.jsx';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError && authError.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }
  // Tous les autres cas (auth_required, unknown, etc.) : on laisse passer les routes normalement

  return (
    <Routes>
      <Route path="/" element={<Accueil />} />
      <Route path="/Accueil" element={<Accueil />} />
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
      <Route path="/CommercantProfil" element={<CommercantProfil />} />
      <Route path="/Profil" element={<Profil />} />
      <Route path="/About" element={<About />} />
      <Route path="/Contact" element={<Contact />} />
      <Route path="/FetchResults" element={<FetchResults />} />
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