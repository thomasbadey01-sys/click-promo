import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
import theme from './pages/theme';

function App() {
  return (
    <BrowserRouter>
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
        <Route path="/theme" element={<theme />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
