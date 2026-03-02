import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabase";

export function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            // Sync password to profile on login
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase
                    .from("profiles")
                    .update({ password: password })
                    .eq("id", user.id);
            }

            navigate("/");
        } catch (err: any) {
            setError(err.message || "Erro ao entrar. Verifica as tuas credenciais.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <img src="/img/logo_atual.png" alt="F.L.A.M.E" className="login-logo" />
                    <h1 className="login-title">Bem-vindo de volta</h1>
                    <p className="login-subtitle">Acede à tua conta segura F.L.A.M.E</p>
                </div>

                <form className="login-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">E-mail</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="teu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Palavra-passe</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p style={{ color: "var(--accent)", fontSize: "0.85rem", background: "var(--accent-soft)", padding: "0.5rem", borderRadius: "4px" }}>{error}</p>}

                    <button
                        type="submit"
                        className="btn btn--primary btn--full btn--lg"
                        disabled={loading}
                    >
                        {loading ? "A entrar..." : "Entrar"}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Ainda não tens conta? <Link to="/register">Registar como Migrante</Link></p>
                </div>
            </div>
        </div>
    );
}
