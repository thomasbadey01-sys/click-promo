import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login';
import Carte from './pages/Carte';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Favoris from './pages/Favoris';
import Profil from './pages/Profil';
import Admin from './pages/Admin';
import PrivacyPolicy from './pages/PrivacyPolicy';
import OffreDetail from './pages/OffreDetail';
import Abonnement from './pages/Abonnement';
import Feed from './pages/Feed';
import InscriptionCommercant from './pages/InscriptionCommercant';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Carte" element={<Carte />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Favoris" element={<Favoris />} />
        <Route path="/Profil" element={<Profil />} />
        <Route path="/Admin" element={<Admin />} />
        <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/OffreDetail" element={<OffreDetail />} />
        <Route path="/Abonnement" element={<Abonnement />} />
        <Route path="/Feed" element={<Feed />} />
        <Route path="/InscriptionCommercant" element={<InscriptionCommercant />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
