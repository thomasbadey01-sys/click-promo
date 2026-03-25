import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login';
import Feed from './pages/Feed';
import Carte from './pages/Carte';
import Home from './pages/Home';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Profil from './pages/Profil';
import OffreDetail from './pages/OffreDetail';
import Favoris from './pages/Favoris';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import InscriptionCommercant from './pages/InscriptionCommercant';
import Abonnement from './pages/Abonnement';
import theme from './pages/theme';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Feed" element={<Feed />} />
        <Route path="/Carte" element={<Carte />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/Profil" element={<Profil />} />
        <Route path="/OffreDetail" element={<OffreDetail />} />
        <Route path="/Favoris" element={<Favoris />} />
        <Route path="/Admin" element={<Admin />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/InscriptionCommercant" element={<InscriptionCommercant />} />
        <Route path="/Abonnement" element={<Abonnement />} />
        <Route path="/theme" element={<theme />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
