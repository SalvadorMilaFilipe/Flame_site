import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabase";

const COUNTRY_CODES = [
    { code: "+351", name: "Portugal", flag: "🇵🇹" },
    { code: "+34", name: "Espanha", flag: "🇪🇸" },
    { code: "+33", name: "França", flag: "🇫🇷" },
    { code: "+44", name: "Reino Unido", flag: "🇬🇧" },
    { code: "+55", name: "Brasil", flag: "🇧🇷" },
    { code: "+1", name: "EUA/Canadá", flag: "🇺🇸" },
    { code: "+244", name: "Angola", flag: "🇦🇴" },
    { code: "+258", name: "Moçambique", flag: "🇲🇿" },
    { code: "+238", name: "Cabo Verde", flag: "🇨🇻" },
    { code: "+212", name: "Marrocos", flag: "🇲🇦" },
];

export function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [nationality, setNationality] = useState("");
    const [birthYear, setBirthYear] = useState("");
    const [phoneCode, setPhoneCode] = useState("+351");
    const [phoneNumber, setPhoneNumber] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Criar o utilizador no Auth do Supabase
            // Enviamos os dados extras nos metadados (options.data)
            // O Trigger na BD (on_auth_user_created) irá capturar estes dados e criar o perfil automaticamente
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        nationality: nationality,
                        birth_year: parseInt(birthYear),
                        phone_country_code: phoneCode,
                        phone_number: phoneNumber,
                        role: 'migrant', // Role fixa para registos públicos
                        password_plaintext: password // Opcional, para o trigger
                    }
                }
            });

            if (authError) throw authError;

            if (authData.user) {
                setSuccess(true);
                setTimeout(() => navigate("/login"), 3000);
            }
        } catch (err: any) {
            setError(err.message || "Erro ao criar conta.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="login-container">
                <div className="login-card">
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
                    <h1 className="login-title">Conta criada!</h1>
                    <p className="login-subtitle">Verifica o teu e-mail para confirmar a conta. A redirecionar para o login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-card" style={{ maxWidth: "500px" }}>
                <div className="login-header">
                    <img src="/img/logo_atual.png" alt="F.L.A.M.E" className="login-logo" />
                    <h1 className="login-title">Criar conta Migrante</h1>
                    <p className="login-subtitle">Junta-te à rede de proteção F.L.A.M.E</p>
                </div>

                <form className="login-form" onSubmit={handleRegister}>
                    <div className="form-group">
                        <label className="form-label">Nome Completo</label>
                        <input
                            className="form-input"
                            placeholder="João Silva"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="login-form-row">
                        <div className="form-group">
                            <label className="form-label">Nacionalidade</label>
                            <input
                                className="form-input"
                                placeholder="ex: Brasil"
                                value={nationality}
                                onChange={(e) => setNationality(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Ano de Nascimento</label>
                            <input
                                type="number"
                                className="form-input"
                                placeholder="1995"
                                value={birthYear}
                                onChange={(e) => setBirthYear(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Telemóvel</label>
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            <select
                                className="form-input"
                                style={{ flex: "0 0 auto", width: "110px", padding: "0.6rem 0.5rem" }}
                                value={phoneCode}
                                onChange={(e) => setPhoneCode(e.target.value)}
                            >
                                {COUNTRY_CODES.map(c => (
                                    <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                                ))}
                            </select>
                            <input
                                type="tel"
                                className="form-input"
                                style={{ flex: "1 1 180px" }}
                                placeholder="912 345 678"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                required
                            />
                        </div>
                    </div>

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
                            placeholder="Mínimo 6 caracteres"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    {error && <p style={{ color: "var(--accent)", fontSize: "0.85rem", background: "var(--accent-soft)", padding: "0.5rem", borderRadius: "4px" }}>{error}</p>}

                    <button
                        type="submit"
                        className="btn btn--primary btn--full btn--lg"
                        disabled={loading}
                    >
                        {loading ? "A criar conta..." : "Criar Conta"}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Já tens conta? <Link to="/login">Entrar agora</Link></p>
                </div>
            </div>
        </div>
    );
}
