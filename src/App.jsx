import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Profil from './pages/Profil';
import Home from './pages/Home';
import Favoris from './pages/Favoris';
import Dashboard from './pages/Dashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Carte from './pages/Carte';
import OffreDetail from './pages/OffreDetail';
import Feed from './pages/Feed';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Profil" element={<Profil />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Favoris" element={<Favoris />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/Carte" element={<Carte />} />
        <Route path="/OffreDetail" element={<OffreDetail />} />
        <Route path="/Feed" element={<Feed />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
