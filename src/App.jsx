import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home';
import Favoris from './pages/Favoris';
import Admin from './pages/Admin';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Profil from './pages/Profil';
import Carte from './pages/Carte';
import Dashboard from './pages/Dashboard';
import Feed from './pages/Feed';
import Abonnement from './pages/Abonnement';
import OffreDetail from './pages/OffreDetail';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Favoris" element={<Favoris />} />
        <Route path="/Admin" element={<Admin />} />
        <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/Profil" element={<Profil />} />
        <Route path="/Carte" element={<Carte />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Feed" element={<Feed />} />
        <Route path="/Abonnement" element={<Abonnement />} />
        <Route path="/OffreDetail" element={<OffreDetail />} />
        <Route path="/Login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
