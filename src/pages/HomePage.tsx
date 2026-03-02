import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";

export function HomePage() {
  const [name, setName] = useState("...");
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (data?.full_name) {
          setName(data.full_name.split(" ")[0]); // Apenas o primeiro nome
        }
      }
    }
    getProfile();
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <p className="hero-greeting">{greeting}, {name} 👋</p>
        <h1 className="hero-title">
          Bem-vindo à <span>F.L.A.M.E</span>
        </h1>
        <p className="hero-sub">
          A tua plataforma de apoio jurídico, cofre digital seguro e linha de
          comunicação com tradução por inteligência artificial.
        </p>
      </section>

      {/* Quick Access Cards */}
      <section>
        <div className="qa-grid">
          {/* Vault */}
          <Link to="/vault" className="qa-card qa-card--vault">
            <div className="qa-icon qa-icon--vault">🔐</div>
            <p className="qa-label">Acesso Rápido</p>
            <h2 className="qa-title">Vault Digital</h2>
            <p className="qa-desc">
              Guarda e acede aos teus documentos de identidade, vistos e cartas
              legais de forma segura e encriptada.
            </p>
            <span className="qa-arrow">↗</span>
          </Link>

          {/* VoIP */}
          <Link to="/voip" className="qa-card qa-card--voip">
            <div className="qa-icon qa-icon--voip">📞</div>
            <p className="qa-label">Linha Segura</p>
            <h2 className="qa-title">VoIP com IA</h2>
            <p className="qa-desc">
              Comunicação segura com advogados e tradução em tempo real de
              interrogatórios e consultas jurídicas em mais de 50 idiomas.
            </p>
            <span className="qa-arrow">↗</span>
          </Link>

          {/* About */}
          <Link to="/about" className="qa-card qa-card--about">
            <div className="qa-icon qa-icon--about">ℹ️</div>
            <p className="qa-label">Organização</p>
            <h2 className="qa-title">Sobre a F.L.A.M.E</h2>
            <p className="qa-desc">
              Conhece a missão, os valores e os serviços da Frontline Legal Aid
              for Migrants &amp; Emergencies.
            </p>
            <span className="qa-arrow">↗</span>
          </Link>
        </div>
      </section>

      {/* System Status */}
      <div className="status-bar">
        <div className="status-item">
          <div className="status-dot status-dot--green" />
          <span className="status-label">Vault:</span>
          Operacional
        </div>
        <div className="status-item">
          <div className="status-dot status-dot--blue" />
          <span className="status-label">Linha VoIP:</span>
          Disponível (demo)
        </div>
        <div className="status-item">
          <div className="status-dot status-dot--green" />
          <span className="status-label">Canal de suporte:</span>
          Online
        </div>
        <div className="status-item" style={{ marginLeft: "auto", fontSize: "0.78rem", color: "var(--muted)" }}>
          Atualizado: {new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </>
  );
}
