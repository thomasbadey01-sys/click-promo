import {Link,NavLink} from "react-router-dom";
import {Compass,Map,Heart,UserRound,Store,ArrowUpRight} from "lucide-react";
import {useAuth} from "@/lib/AuthContext";
import "./local.css";
export default function LocalShell({children}) {
  const {user}=useAuth();
  return <div className="cp-app">
    <a className="cp-skip" href="#main-content">Aller au contenu</a>
    <header className="cp-header"><Link className="cp-brand" to="/" aria-label="Click & Promo, accueil"><span className="cp-logomark">c<span>p</span><i/></span><span>click<span className="cp-brand-amp">&</span>promo<span className="cp-brand-dot">.</span></span></Link>
      <nav className="cp-desktop-nav" aria-label="Navigation principale"><NavLink to="/" end>Découvrir</NavLink><NavLink to="/Feed">Les offres</NavLink><NavLink to="/Carte">La carte</NavLink></nav>
      <div className="cp-header-actions"><Link className="cp-pro-link" to="/Dashboard">Espace commerçant <ArrowUpRight size={15}/></Link><Link className="cp-account" to={user?"/Profil":"/Login"}><UserRound size={18}/><span>{user?"Mon compte":"Se connecter"}</span></Link></div>
    </header>
    <main id="main-content" tabIndex={-1}>{children}</main>
    <footer className="cp-footer"><div><strong>Le meilleur du coin, à portée de clic.</strong><p>Découvrez les commerces et leurs offres près de chez vous.</p></div><nav aria-label="Informations"><Link to="/About">À propos</Link><Link to="/Contact">Contact</Link><Link to="/PrivacyPolicy">Confidentialité</Link>{user?.role==="admin"&&<Link to="/Admin">Administration</Link>}</nav><span>© {new Date().getFullYear()} Click & Promo</span></footer>
    <nav className="cp-mobile-nav" aria-label="Navigation mobile">{[[Compass,"Découvrir","/"],[Map,"Carte","/Carte"],[Heart,"Favoris","/Favoris"],[Store,"Mon commerce","/Dashboard"],[UserRound,"Compte",user?"/Profil":"/Login"]].map(([Icon,label,path])=><NavLink key={label} to={path} end><Icon size={21}/><span>{label}</span></NavLink>)}</nav>
  </div>;
}
