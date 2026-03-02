import { useState } from "react";

type Ticket = {
    id: number;
    title: string;
    severity: "low" | "medium" | "high" | "critical";
    status: "open" | "investigating" | "resolved";
    category: string;
    date: string;
};

type Metric = {
    label: string;
    value: string;
    unit: string;
    trend: "up" | "down" | "stable";
};

const MOCK_TICKETS: Ticket[] = [
    { id: 1, title: "Tentativa de acesso não autorizado ao Vault", severity: "critical", status: "investigating", category: "Segurança", date: "25/02" },
    { id: 2, title: "Latência elevada na API de tradução", severity: "medium", status: "open", category: "Performance", date: "25/02" },
    { id: 3, title: "Certificado SSL a expirar em 7 dias", severity: "high", status: "open", category: "Infra", date: "24/02" },
    { id: 4, title: "Atualização do SDK React Native concluída", severity: "low", status: "resolved", category: "Mobile", date: "23/02" },
];

const MOCK_METRICS: Metric[] = [
    { label: "Uptime", value: "99.97", unit: "%", trend: "stable" },
    { label: "Encriptações Vault", value: "1.284", unit: "hoje", trend: "up" },
    { label: "Utilizadores ativos", value: "342", unit: "online", trend: "up" },
    { label: "Tempo médio API", value: "48", unit: "ms", trend: "down" },
    { label: "Tickets abertos", value: "3", unit: "pendentes", trend: "stable" },
    { label: "Alertas segurança", value: "1", unit: "crítico", trend: "up" },
];

const SEV_BADGE: Record<string, string> = {
    low: "badge--green", medium: "badge--amber", high: "badge--amber", critical: "badge--red",
};

const STAT_BADGE: Record<string, string> = {
    open: "badge--amber", investigating: "badge--blue", resolved: "badge--green",
};

export function ITPanel() {
    const [tickets, setTickets] = useState(MOCK_TICKETS);

    function handleResolve(id: number) {
        setTickets((prev) =>
            prev.map((t) => (t.id === id ? { ...t, status: "resolved" as const } : t))
        );
    }

    function handleInvestigate(id: number) {
        setTickets((prev) =>
            prev.map((t) => (t.id === id ? { ...t, status: "investigating" as const } : t))
        );
    }

    return (
        <>
            {/* System Metrics */}
            <div className="card" style={{ marginBottom: "1.25rem" }}>
                <p className="card-title">📊 Métricas do Sistema</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem" }}>
                    {MOCK_METRICS.map((m) => (
                        <div
                            key={m.label}
                            style={{
                                padding: "0.9rem", background: "var(--bg-soft)",
                                borderRadius: "var(--radius-sm)", textAlign: "center",
                                border: "1px solid var(--border)",
                            }}
                        >
                            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text)" }}>
                                {m.value}
                                <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--muted)", marginLeft: "0.2rem" }}>
                                    {m.unit}
                                </span>
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.15rem" }}>
                                {m.label} {m.trend === "up" ? "↑" : m.trend === "down" ? "↓" : "→"}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Security Tickets */}
            <div className="card" style={{ marginBottom: "1.25rem" }}>
                <p className="card-title">🛡️ Tickets de Segurança e Infraestrutura</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {tickets.map((t) => (
                        <div
                            key={t.id}
                            style={{
                                display: "flex", alignItems: "center", gap: "0.75rem",
                                padding: "0.8rem 1rem", background: "var(--bg-soft)",
                                borderRadius: "var(--radius-sm)", border: "1px solid var(--border)",
                                flexWrap: "wrap",
                            }}
                        >
                            <div style={{ flex: 1, minWidth: "160px" }}>
                                <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{t.title}</div>
                                <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{t.category} · {t.date}</div>
                            </div>
                            <span className={`badge ${SEV_BADGE[t.severity]}`}>{t.severity.toUpperCase()}</span>
                            <span className={`badge ${STAT_BADGE[t.status]}`}>{t.status.toUpperCase()}</span>
                            {t.status === "open" && (
                                <button className="btn btn--blue" style={{ fontSize: "0.75rem", padding: "0.3rem 0.7rem" }} onClick={() => handleInvestigate(t.id)}>
                                    🔍 Investigar
                                </button>
                            )}
                            {t.status === "investigating" && (
                                <button className="btn btn--green" style={{ fontSize: "0.75rem", padding: "0.3rem 0.7rem" }} onClick={() => handleResolve(t.id)}>
                                    ✅ Resolver
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Audit Log snapshot */}
            <div className="card">
                <p className="card-title">📝 Últimas Entradas de Auditoria</p>
                <div style={{ fontSize: "0.82rem", color: "var(--muted)", fontFamily: "monospace", lineHeight: "1.8" }}>
                    <div><span style={{ color: "var(--green)" }}>[25/02 10:23]</span> vault.encrypt — user:JM — doc:Bilhete_ID</div>
                    <div><span style={{ color: "var(--blue)" }}>[25/02 10:21]</span> auth.login — user:Ahmed_K — provider:google</div>
                    <div><span style={{ color: "var(--amber)" }}>[25/02 10:15]</span> emergency.alert — user:Maria_S — lat:38.7169</div>
                    <div><span style={{ color: "var(--green)" }}>[25/02 09:58]</span> vault.upload — user:Fatima_R — doc:Visto_2025</div>
                    <div><span style={{ color: "var(--accent)" }}>[25/02 09:42]</span> security.failed_login — ip:203.0.113.42 — attempts:3</div>
                </div>
            </div>
        </>
    );
}
