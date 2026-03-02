import { useState } from "react";

type Session = {
    id: number;
    client: string;
    type: "psychological" | "translation";
    lang?: string;
    targetLang?: string;
    date: string;
    time: string;
    status: "open" | "in_progress" | "completed";
    wellbeing?: number;
    notes?: string;
};

const MOCK_SESSIONS: Session[] = [
    { id: 1, client: "Maria S.", type: "psychological", date: "25/02", time: "11:00", status: "in_progress", wellbeing: 4, notes: "Sinais de ansiedade — acompanhamento semanal recomendado." },
    { id: 2, client: "Ahmed K.", type: "translation", lang: "Arabic", targetLang: "Português", date: "25/02", time: "14:00", status: "open" },
    { id: 3, client: "Li Wei", type: "translation", lang: "中文", targetLang: "Português", date: "25/02", time: "16:00", status: "open" },
    { id: 4, client: "Fatima R.", type: "psychological", date: "24/02", time: "10:00", status: "completed", wellbeing: 7, notes: "Melhoria significativa. Próxima sessão daqui a 2 semanas." },
];

const TYPE_LABEL: Record<string, string> = {
    psychological: "🧠 Psicologia",
    translation: "🌍 Tradução",
};

const STAT_BADGE: Record<string, string> = {
    open: "badge--amber", in_progress: "badge--blue", completed: "badge--green",
};

export function SocialPanel() {
    const [sessions, setSessions] = useState(MOCK_SESSIONS);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    function handleStart(id: number) {
        setSessions((prev) =>
            prev.map((s) => (s.id === id ? { ...s, status: "in_progress" as const } : s))
        );
    }

    function handleComplete(id: number) {
        setSessions((prev) =>
            prev.map((s) => (s.id === id ? { ...s, status: "completed" as const } : s))
        );
    }

    function handleWellbeing(id: number, score: number) {
        setSessions((prev) =>
            prev.map((s) => (s.id === id ? { ...s, wellbeing: score } : s))
        );
    }

    return (
        <>
            {/* Summary stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
                {[
                    { label: "Sessões hoje", value: sessions.filter((s) => s.status !== "completed").length, color: "var(--blue)" },
                    { label: "Psicologia", value: sessions.filter((s) => s.type === "psychological").length, color: "var(--accent)" },
                    { label: "Tradução", value: sessions.filter((s) => s.type === "translation").length, color: "var(--green)" },
                    { label: "Concluídas", value: sessions.filter((s) => s.status === "completed").length, color: "var(--green)" },
                ].map((s) => (
                    <div
                        key={s.label}
                        className="card"
                        style={{ textAlign: "center", padding: "1rem" }}
                    >
                        <div style={{ fontSize: "1.6rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Sessions list */}
            <div className="card">
                <p className="card-title">🤝 Sessões de Apoio</p>
                <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: "1rem" }}>
                    Sessões de apoio psicológico e pedidos de tradução atribuídos a si.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {sessions.map((s) => (
                        <div key={s.id}>
                            <div
                                style={{
                                    display: "flex", alignItems: "center", gap: "0.75rem",
                                    padding: "0.85rem 1rem", background: "var(--bg-soft)",
                                    borderRadius: "var(--radius-sm)", border: "1px solid var(--border)",
                                    cursor: "pointer", flexWrap: "wrap",
                                }}
                                onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                            >
                                <div style={{ fontWeight: 700, fontSize: "0.9rem", minWidth: "90px" }}>{s.client}</div>
                                <div style={{ fontSize: "0.82rem" }}>{TYPE_LABEL[s.type]}</div>
                                {s.lang && (
                                    <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                                        {s.lang} → {s.targetLang}
                                    </div>
                                )}
                                <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{s.date} · {s.time}</div>
                                <span className={`badge ${STAT_BADGE[s.status]}`} style={{ marginLeft: "auto" }}>
                                    {s.status === "open" ? "PENDENTE" : s.status === "in_progress" ? "EM CURSO" : "CONCLUÍDA"}
                                </span>
                            </div>

                            {expandedId === s.id && (
                                <div style={{ margin: "0.5rem 0 0 1rem", padding: "1rem", background: "#fff", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                                    {/* Wellbeing score (psychological only) */}
                                    {s.type === "psychological" && (
                                        <div style={{ marginBottom: "0.75rem" }}>
                                            <p style={{ fontWeight: 700, fontSize: "0.82rem", marginBottom: "0.4rem" }}>📊 Escala de Bem-Estar (1-10)</p>
                                            <div style={{ display: "flex", gap: "0.3rem" }}>
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                                    <button
                                                        key={n}
                                                        onClick={() => handleWellbeing(s.id, n)}
                                                        style={{
                                                            width: "30px", height: "30px", borderRadius: "50%",
                                                            border: s.wellbeing === n ? "2px solid var(--blue)" : "1px solid var(--border)",
                                                            background: s.wellbeing === n
                                                                ? n <= 3 ? "var(--accent-soft)" : n <= 6 ? "var(--amber-soft)" : "var(--green-soft)"
                                                                : "var(--bg-soft)",
                                                            cursor: "pointer", fontSize: "0.75rem", fontWeight: 700,
                                                            color: s.wellbeing === n ? "var(--text)" : "var(--muted)",
                                                        }}
                                                    >
                                                        {n}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {/* Notes */}
                                    {s.notes && (
                                        <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
                                            <strong>Notas:</strong> {s.notes}
                                        </p>
                                    )}
                                    {/* Actions */}
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        {s.status === "open" && (
                                            <button className="btn btn--blue" style={{ fontSize: "0.75rem" }} onClick={() => handleStart(s.id)}>
                                                ▶ Iniciar Sessão
                                            </button>
                                        )}
                                        {s.status === "in_progress" && (
                                            <button className="btn btn--green" style={{ fontSize: "0.75rem" }} onClick={() => handleComplete(s.id)}>
                                                ✅ Concluir Sessão
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
