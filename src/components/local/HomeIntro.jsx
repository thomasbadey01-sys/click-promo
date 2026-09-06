import {ArrowUpRight,MapPin,Store} from "lucide-react";

export default function HomeIntro() {
  return <section className="cp-container cp-home-intro" aria-labelledby="local-home-title">
    <div className="cp-home-intro-copy">
      <span className="cp-eyebrow"><MapPin size={14} aria-hidden="true"/> VOS COMMERCES. VOTRE QUARTIER.</span>
      <h1 id="local-home-title" className="font-heading">Les belles adresses<br/>sont <span className="text-local-accent">tout près.</span></h1>
      <p>Le café du coin, une boutique pleine d’idées, votre prochain coup de cœur. Découvrez les petits commerces qui font vivre votre quartier.</p>
      <a href="#catalogue" className="cp-button cp-button-primary">Explorer les commerces <ArrowUpRight size={18} aria-hidden="true"/></a>
      <div className="cp-home-intro-note"><Store size={17} aria-hidden="true"/><span>Des adresses locales. De bonnes raisons d’y aller.</span></div>
    </div>
    <div className="cp-home-collage" aria-label="Photographies d’ambiance de commerces">
      <div className="cp-home-photo-main"><img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1000&q=85" alt="Une table de restaurant dressée avec soin" fetchPriority="high"/><span>Le goût de la découverte.</span></div>
      <div className="cp-home-photo-small"><img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=500&q=80" alt="L’intérieur lumineux d’une boutique indépendante" loading="lazy"/><span>Le plaisir de flâner.</span></div>
      <div className="cp-home-photo-note"><MapPin size={18} aria-hidden="true"/><span>Votre prochain coup de cœur<br/><strong>commence au coin de la rue.</strong></span></div>
      <small className="cp-home-photo-credit">Photos d’ambiance</small>
    </div>
  </section>;
}