import { useState, useEffect } from "react";
import { supabase } from "../supabase";

import emailjs from '@emailjs/browser';

// ========================================================
// CONFIGURAÇÃO DO EMAILJS (Cria conta em emailjs.com)
// ========================================================
const EMAILJS_SERVICE_ID = "service_5hrp9lh";
const EMAILJS_TEMPLATE_ID = "template_26l2nzm";
const EMAILJS_PUBLIC_KEY = "cKbHLkaVafzdPCInj";

const DEPARTMENTS = [
  { id: "it", label: "Departamento de TI" },
  { id: "legal", label: "Apoio Legal" },
  { id: "social", label: "Apoio Social" },
  { id: "recruitment", label: "Recrutamento" },
  { id: "field_agents", label: "Agentes de Campo" },
];

const ROLES_MAP: Record<string, Array<{ id: string, label: string }>> = {
  it: [
    { id: "mobile_dev", label: "Programador Mobile" },
    { id: "cybersecurity", label: "Especialista em Cibersegurança" },
    { id: "data_analyst", label: "Analista de Dados" }
  ],
  legal: [
    { id: "immigration_lawyer", label: "Advogado de Imigração" },
    { id: "human_rights_lawyer", label: "Advogado de Direitos Humanos" }
  ],
  social: [
    { id: "psychologist", label: "Psicólogo" },
    { id: "translator", label: "Tradutor Multilingue" }
  ],
  recruitment: [
    { id: "recruiter", label: "Recrutador (Foco em Ex-Imigrantes)" },
    { id: "hr_manager", label: "Gestor de Talento Social" }
  ],
  field_agents: [
    { id: "field_agent", label: "Agente de Campo" },
    { id: "field_coordinator", label: "Coordenador de Operações" }
  ],
};

export function AdminDashboardPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [nationality, setNationality] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [dept, setDept] = useState("it");
  const [role, setRole] = useState("mobile_dev");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkLoading, setCheckLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
          if (data?.role === "admin") setIsAdmin(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCheckLoading(false);
      }
    }
    checkAdmin();
  }, []);

  const sendEmail = async (userEmail: string, userName: string, passwordGen: string, userRole: string) => {
    try {
      // Usar a forma mais direta do send (com a chave pública como string)
      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          user_name: userName,
          user_email: userEmail,
          password: passwordGen,
          role: userRole,
          login_url: `${window.location.origin}/login`
        },
        EMAILJS_PUBLIC_KEY
      );

      if (result.status === 200) {
        console.log("✅ Convite enviado com sucesso!");
      }
    } catch (error: any) {
      console.error("❌ Falha no EmailJS:", error);

      // Mostrar alerta para o utilizador saber o que aconteceu (ex: 401 Unauthorized)
      const errorMsg = error?.text || error?.message || "Erro desconhecido";
      console.warn(`O EmailJS falhou (${errorMsg}). A abrir mailto como fallback.`);

      // Fallback: se o serviço falhar, abre o mailto como segurança
      const body = `Olá ${userName}, bem-vindo à equipa F.L.A.M.E!\n\nOs teus acessos:\nE-mail: ${userEmail}\nPalavra-passe: ${passwordGen}\nFunção: ${userRole}\n\nLogin: ${window.location.origin}/login`;
      window.open(`mailto:${userEmail}?subject=Convite para Equipa F.L.A.M.E&body=${encodeURIComponent(body)}`);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const generatePassword = () => {
      const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
      return Array.from({ length: 12 }, () => charset[Math.floor(Math.random() * charset.length)]).join('');
    };

    const tempPassword = generatePassword();

    try {
      const { createClient } = await import("@supabase/supabase-js");
      const tempClient = createClient(
        "https://ehnvpqtibyfvljzqazog.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVobnZwcXRpYnlmdmxqenFhem9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMTI5OTAsImV4cCI6MjA4NzU4ODk5MH0.hmeY_gMRMXONjMtR725ojuxfOk3oG9dZ_pjdzOGeFp8",
        { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
      );

      const { data: authData, error: authError } = await tempClient.auth.signUp({
        email,
        password: tempPassword,
        options: {
          data: {
            full_name: fullName,
            username: username,
            nationality: nationality,
            birth_year: parseInt(birthYear),
            role: 'staff',
            password_plaintext: tempPassword
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        await supabase.from("staff_profiles").insert([{
          user_id: authData.user.id,
          department: dept,
          staff_role: role
        }]);
      }

      // Envia o email automaticamente
      await sendEmail(email, fullName, tempPassword, role);

      setMessage({
        type: "success",
        text: `✅ Sucesso! Utilizador criado e convite enviado para ${email}.`
      });

      setEmail("");
      setFullName("");
      setUsername("");
      setNationality("");
      setBirthYear("");
    } catch (err: any) {
      console.error("Erro:", err);
      setMessage({ type: "error", text: `Erro: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  if (checkLoading) {
    return <div className="main">A verificar permissões...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="main" style={{ textAlign: "center", paddingTop: "4rem" }}>
        <h1 style={{ fontSize: "4rem" }}>🚫</h1>
        <h2>Acesso Negado</h2>
        <p>Apenas administradores podem aceder a esta área.</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1>🛠️ Painel de Administração</h1>
        <p>Gestão interna e recrutamento de equipa F.L.A.M.E.</p>
      </div>

      <div className="admin-grid">
        <div className="card">
          <h2 className="card-title">👥 Convidar Novo Staff</h2>
          <form onSubmit={handleInvite} className="login-form">
            <div className="form-group">
              <label className="form-label">Nome Completo</label>
              <input className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Carlos Oliveira" required />
            </div>

            <div className="admin-form-row">
              <div className="form-group">
                <label className="form-label">Username (@)</label>
                <input className="form-input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="utilizador" required />
              </div>
              <div className="form-group">
                <label className="form-label">E-mail Profissional</label>
                <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="colab@flame.org" required />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="form-group">
                <label className="form-label">Nacionalidade</label>
                <input className="form-input" value={nationality} onChange={(e) => setNationality(e.target.value)} placeholder="Portuguesa" required />
              </div>
              <div className="form-group">
                <label className="form-label">Ano Nascimento</label>
                <input type="number" className="form-input" value={birthYear} onChange={(e) => setBirthYear(e.target.value)} placeholder="1990" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Departamento</label>
              <select
                className="form-input"
                value={dept}
                onChange={(e) => {
                  setDept(e.target.value);
                  setRole(ROLES_MAP[e.target.value][0].id);
                }}
              >
                {DEPARTMENTS.map(d => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Função / Cargo</label>
              <select
                className="form-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {ROLES_MAP[dept].map(r => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>

            {message && (
              <p style={{
                padding: "0.75rem",
                borderRadius: "8px",
                fontSize: "0.85rem",
                backgroundColor: message.type === "success" ? "var(--green-soft)" : "var(--accent-soft)",
                color: message.type === "success" ? "var(--green)" : "var(--accent)"
              }}>
                {message.text}
              </p>
            )}

            <button
              type="submit"
              className="btn btn--primary btn--full"
              disabled={loading}
            >
              {loading ? "A enviar convite..." : "Criar Conta & Enviar Email"}
            </button>
          </form>
        </div>

        {/* ESTATÍSTICAS / INFO */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="card card--primary">
            <h2 className="card-title">📂 Resumo do Sistema</h2>
            <div className="stats-grid" style={{ marginTop: "1rem" }}>
              <div style={{ textAlign: "center", padding: "1rem", background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--accent)" }}>12</span>
                <p style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase" }}>Casos Ativos</p>
              </div>
              <div style={{ textAlign: "center", padding: "1rem", background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--blue)" }}>5</span>
                <p style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase" }}>Equipa Online</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">🚨 Alertas Recentes</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
              <div style={{ padding: "0.75rem", background: "var(--bg-soft)", borderRadius: "8px", fontSize: "0.8rem", display: "flex", justifyContent: "space-between" }}>
                <span>Incidente #102 - Zona Sul</span>
                <span className="badge badge--red">Crítico</span>
              </div>
              <div style={{ padding: "0.75rem", background: "var(--bg-soft)", borderRadius: "8px", fontSize: "0.8rem", display: "flex", justifyContent: "space-between" }}>
                <span>Pedido de Apoio Legal</span>
                <span className="badge badge--amber">Pendente</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
