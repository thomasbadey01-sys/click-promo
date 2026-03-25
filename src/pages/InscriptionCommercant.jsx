import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InscriptionCommercant() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Inscription Commerçant</h1>
      <p>Formulaire en cours de chargement...</p>
      <button onClick={() => navigate("/Feed")}>Retour au Feed</button>
    </div>
  );
}
