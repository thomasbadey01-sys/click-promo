import { useNavigate } from "react-router-dom";
import { DS, Ic, CPLogo } from "./theme";

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight:"100vh", background:DS.bg, fontFamily:DS.fontBase }}>
      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${DS.brand},${DS.brand2})`, padding:"52px 16px 28px" }}>
        <button onClick={()=>navigate(-1)} style={{ background:"rgba(255,255,255,.2)", border:"none", borderRadius:DS.pill, width:38, height:38, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", marginBottom:16 }}>
          {Ic.back(DS.white,20)}
        </button>
        <div style={{ fontSize:24, fontWeight:900, color:DS.white, marginBottom:6 }}>Politique de confidentialité</div>
        <div style={{ fontSize:13, color:"rgba(255,255,255,.7)" }}>Dernière mise à jour : 25 mars 2026</div>
      </div>

      <div style={{ padding:"20px 16px 60px" }}>
        {[
          {
            title:"1. Collecte des données",
            content:"Nous collectons les données que vous nous fournissez directement (nom, email, localisation) ainsi que les données d'utilisation de l'application. La géolocalisation n'est utilisée qu'avec votre consentement explicite pour afficher les offres à proximité."
          },
          {
            title:"2. Utilisation des données",
            content:"Vos données sont utilisées pour : afficher des offres personnalisées, améliorer notre service, envoyer des notifications push (avec consentement), calculer vos économies et points de fidélité, et permettre aux commerçants de mesurer l'efficacité de leurs offres."
          },
          {
            title:"3. Partage des données",
            content:"Nous ne vendons jamais vos données. Elles peuvent être partagées avec nos commerçants partenaires (de façon anonymisée), nos prestataires techniques (hébergement, paiement via Stripe) et les autorités compétentes si requis par la loi."
          },
          {
            title:"4. Paiement & Stripe",
            content:"Les paiements sont traités par Stripe, certifié PCI-DSS. Nous ne stockons jamais vos données bancaires. Stripe peut utiliser vos données conformément à sa propre politique de confidentialité."
          },
          {
            title:"5. Vos droits (RGPD)",
            content:"Conformément au RGPD, vous disposez des droits d'accès, de rectification, d'effacement, de portabilité et d'opposition. Pour exercer vos droits : privacy@clicketpromo.fr. Nous répondons sous 30 jours."
          },
          {
            title:"6. Cookies",
            content:"Nous utilisons uniquement des cookies essentiels au fonctionnement de l'application (session, préférences). Aucun cookie publicitaire tiers n'est utilisé."
          },
          {
            title:"7. Conservation des données",
            content:"Vos données sont conservées pendant la durée de votre compte actif, plus 3 ans après désactivation pour des raisons légales. Les données de paiement sont conservées 5 ans (obligation légale)."
          },
          {
            title:"8. Contact",
            content:"Pour toute question : privacy@clicketpromo.fr\nClick & Promo SAS — Paris, France\nDélégué à la protection des données : dpo@clicketpromo.fr"
          },
        ].map((s,i) => (
          <div key={i} style={{ background:DS.white, borderRadius:DS.xl, padding:"18px 20px", marginBottom:12, boxShadow:DS.e1, border:`1px solid ${DS.ink10}` }}>
            <div style={{ fontSize:15, fontWeight:800, color:DS.brand, marginBottom:10 }}>{s.title}</div>
            <div style={{ fontSize:14, color:DS.ink60, lineHeight:1.85, whiteSpace:"pre-line" }}>{s.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
