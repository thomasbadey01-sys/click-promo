import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Favoris from './pages/Favoris';
import PrivacyPolicy from './pages/PrivacyPolicy';
import InscriptionCommercant from './pages/InscriptionCommercant';
import Dashboard from './pages/Dashboard';
import OffreDetail from './pages/OffreDetail';
import Login from './pages/Login';
import Abonnement from './pages/Abonnement';
import theme from './pages/theme';
import Admin from './pages/Admin';
import Feed from './pages/Feed';
import Profil from './pages/Profil';
import Carte from './pages/Carte';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Favoris" element={<Favoris />} />
        <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/InscriptionCommercant" element={<InscriptionCommercant />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/OffreDetail" element={<OffreDetail />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Abonnement" element={<Abonnement />} />
        <Route path="/theme" element={<theme />} />
        <Route path="/Admin" element={<Admin />} />
        <Route path="/Feed" element={<Feed />} />
        <Route path="/Profil" element={<Profil />} />
        <Route path="/Carte" element={<Carte />} />
        <Route path="/Home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
