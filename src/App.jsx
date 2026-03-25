import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Dashboard from './pages/Dashboard';
import InscriptionCommercant from './pages/InscriptionCommercant';
import Favoris from './pages/Favoris';
import Feed from './pages/Feed';
import Profil from './pages/Profil';
import OffreDetail from './pages/OffreDetail';
import theme from './pages/theme';
import Carte from './pages/Carte';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Abonnement from './pages/Abonnement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/InscriptionCommercant" element={<InscriptionCommercant />} />
        <Route path="/Favoris" element={<Favoris />} />
        <Route path="/Feed" element={<Feed />} />
        <Route path="/Profil" element={<Profil />} />
        <Route path="/OffreDetail" element={<OffreDetail />} />
        <Route path="/theme" element={<theme />} />
        <Route path="/Carte" element={<Carte />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Admin" element={<Admin />} />
        <Route path="/Abonnement" element={<Abonnement />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
