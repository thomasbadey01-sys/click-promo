import {Link} from "react-router-dom";
import {ArrowUpRight,Store,MapPin,Tag} from "lucide-react";

export default function HomeMerchantInvite() {
  return <section className="cp-container cp-home-invite" aria-labelledby="merchant-invite-title">
    <div className="cp-home-invite-copy">
      <span className="cp-eyebrow">VOUS FAITES VIVRE LE QUARTIER</span>
      <h2 id="merchant-invite-title" className="font-heading">Derrière chaque vitrine,<br/>une belle histoire.<br/><span className="text-local-accent">Faites découvrir la vôtre.</span></h2>
      <p>Présentez votre savoir-faire, partagez vos offres et donnez aux clients une raison de pousser votre porte.</p>
      <Link to="/InscriptionCommercant" className="cp-button cp-button-primary">Référencer mon commerce <ArrowUpRight size={18} aria-hidden="true"/></Link>
      <Link to="/Dashboard" className="cp-home-merchant-login">Déjà référencé ? Accéder à mon espace <ArrowUpRight size={14} aria-hidden="true"/></Link>
    </div>
    <div className="cp-home-benefits">
      {[[Store,"Une vitrine à votre image","Votre adresse, vos horaires et vos photos."],[MapPin,"La proximité avant tout","Aidez les clients à vous trouver dans leur quartier."],[Tag,"Vos offres, simplement","Publiez et gérez vos bons plans depuis votre espace."]].map(([Icon,title,description])=><div className="cp-home-benefit" key={title}><span className="cp-home-benefit-icon"><Icon size={22} aria-hidden="true"/></span><div><h3 className="font-heading">{title}</h3><p>{description}</p></div></div>)}
    </div>
  </section>;
}