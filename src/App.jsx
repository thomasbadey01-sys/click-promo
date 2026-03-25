import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Abonnement from './pages/Abonnement';
import Dashboard from './pages/Dashboard';
import InscriptionCommercant from './pages/InscriptionCommercant';
import OffreDetail from './pages/OffreDetail';
import Carte from './pages/Carte';
import Login from './pages/Login';
import Home from './pages/Home';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Admin from './pages/Admin';
import Favoris from './pages/Favoris';
import Profil from './pages/Profil';
import Feed from './pages/Feed';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Abonnement" element={<Abonnement />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/InscriptionCommercant" element={<InscriptionCommercant />} />
        <Route path="/OffreDetail" element={<OffreDetail />} />
        <Route path="/Carte" element={<Carte />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/Admin" element={<Admin />} />
        <Route path="/Favoris" element={<Favoris />} />
        <Route path="/Profil" element={<Profil />} />
        <Route path="/Feed" element={<Feed />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
