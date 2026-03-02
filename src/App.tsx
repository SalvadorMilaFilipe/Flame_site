import { useEffect, useState } from "react";
import { Routes, Route, NavLink, Link, Navigate, useLocation } from "react-router-dom";
import { supabase } from "./supabase";
import { HomePage } from "./pages/HomePage";
import { VaultPage } from "./pages/VaultPage";
import { VoIPPage } from "./pages/VoIPPage";
import { AboutPage, HRSection, SocialSection, EthicsSection, ServicesSection, AreasSection, AboutLayout, StaffAreaSection } from "./pages/AboutPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { Session } from "@supabase/supabase-js";

interface Profile {
  full_name: string;
  role: string;
}

const getInitials = (name: string) => {
  if (!name || name === "Utilizador") return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length > 1) {
    // Pega a primeira letra do primeiro nome e a primeira letra do último nome
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  // Se for apenas um nome, pega as duas primeiras letras
  return name.substring(0, 2).toUpperCase();
};

export function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // 1. Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        updateStatus(session.user.id, 'online');
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session) {
        updateStatus(session.user.id, 'online');
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 3. EFFECT FOR REALTIME UPDATES
  useEffect(() => {
    if (!session?.user.id) return;

    // Escutar mudanças em tempo real na tabela profiles para este utilizador específico
    const channel = supabase
      .channel(`profile-updates-${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${session.user.id}`
        },
        (payload) => {
          console.log("Profile updated in realtime:", payload.new);
          setProfile(payload.new as Profile);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user.id]);

  const updateStatus = async (userId: string, status: 'online' | 'offline') => {
    await supabase
      .from("profiles")
      .update({ status })
      .eq("id", userId);
  };

  const fetchProfile = async (userId: string) => {
    // 1. Tentar ler da base de dados
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setProfile(data);
    } else {
      // 2. Fallback: se falhar (ex: RLS), tentar ler do utilizador autenticado diretamente
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const metadataName = user.user_metadata?.full_name || user.user_metadata?.name || "Utilizador";
        console.log(`[Initials Debug] User: ${user.id} | Metadata Name: ${metadataName}`);
        setProfile({
          full_name: metadataName,
          role: user.app_metadata?.role || user.user_metadata?.role || "migrant"
        });
      }
    }
  };

  const handleLogout = async () => {
    if (session?.user.id) {
      await updateStatus(session.user.id, 'offline');
    }
    await supabase.auth.signOut();
  };

  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [menuOpen]);

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="status-dot status-dot--blue" style={{ width: 20, height: 20 }}></div>
      </div>
    );
  }

  // Redirect logic
  const publicPaths = ["/login", "/register"];
  const isPublicPath = publicPaths.includes(location.pathname);

  if (!session && !isPublicPath) {
    return <Navigate to="/login" replace />;
  }

  const initials = profile?.full_name ? getInitials(profile.full_name) : "?";

  return (
    <div className="app-shell">
      {/* ── TOPBAR ── */}
      {session && (
        <header className="topbar">
          <div className="topbar-inner">
            {/* Burger Menu for Mobile */}
            <button
              className="menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? "✕" : "☰"}
            </button>

            {/* Logo */}
            <Link to="/" className="logo">
              <img src="/img/logo_atual.png" alt="F.L.A.M.E Logo" className="logo-img" />
            </Link>

            {/* Nav links */}
            <nav className={`nav ${menuOpen ? "nav--active" : ""}`}>
              <NavLink to="/vault" className={({ isActive }) => "nav-link" + (isActive ? " nav-link--active" : "")}>
                <span className="nav-icon">🔐</span>
                <span>Vault</span>
              </NavLink>

              <NavLink to="/voip" className={({ isActive }) => "nav-link" + (isActive ? " nav-link--active" : "")}>
                <span className="nav-icon">📞</span>
                <span>Linha Segura VoIP</span>
              </NavLink>

              <NavLink to="/about" className={({ isActive }) => "nav-link" + (isActive ? " nav-link--active" : "")}>
                <span className="nav-icon">ℹ️</span>
                <span>Sobre a F.L.A.M.E</span>
              </NavLink>

              {(profile?.role === 'admin' || session?.user?.app_metadata?.role === 'admin') && (
                <NavLink to="/admin" className={({ isActive }) => "nav-link" + (isActive ? " nav-link--active" : "")}>
                  <span className="nav-icon">🛠️</span>
                  <span>Admin</span>
                </NavLink>
              )}
            </nav>

            {/* User avatar */}
            <div className="topbar-end">
              <button
                onClick={handleLogout}
                className="btn btn--outline"
                style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
              >
                Sair
              </button>
              <div className="avatar" title={`${profile?.full_name} (${profile?.role})`}>
                {initials}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* ── PAGE CONTENT ── */}
      <main className="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/vault" element={<VaultPage />} />
          <Route path="/voip" element={<VoIPPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/about/hr" element={<AboutLayout><HRSection /></AboutLayout>} />
          <Route path="/about/hr/it" element={<AboutLayout><StaffAreaSection area="it" /></AboutLayout>} />
          <Route path="/about/hr/legal" element={<AboutLayout><StaffAreaSection area="legal" /></AboutLayout>} />
          <Route path="/about/hr/social" element={<AboutLayout><StaffAreaSection area="social" /></AboutLayout>} />
          <Route path="/about/hr/recruitment" element={<AboutLayout><StaffAreaSection area="recruitment" /></AboutLayout>} />
          <Route path="/about/social" element={<AboutLayout><SocialSection /></AboutLayout>} />
          <Route path="/about/ethics" element={<AboutLayout><EthicsSection /></AboutLayout>} />
          <Route path="/about/services" element={<AboutLayout><ServicesSection /></AboutLayout>} />
          <Route path="/about/areas" element={<AboutLayout><AreasSection /></AboutLayout>} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <span className="footer-copy">
          © {new Date().getFullYear()} F.L.A.M.E – Frontline Legal Aid for Migrants & Emergencies
        </span>
        <div className="footer-links">
          <a className="footer-link" href="#">Privacidade</a>
          <a className="footer-link" href="#">Termos</a>
          <a className="footer-link" href="#">Contacto</a>
        </div>
      </footer>
    </div>
  );
}
