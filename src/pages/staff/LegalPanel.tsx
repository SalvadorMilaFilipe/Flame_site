import { useState } from "react";

type Case = {
    id: number;
    client: string;
    subject: string;
    category: string;
    status: "pending" | "active" | "closed";
    priority: "low" | "medium" | "high" | "urgent";
    date: string;
    notes: string[];
};

type Consultation = {
    id: number;
    client: string;
    date: string;
    time: string;
    type: string;
    status: "open" | "completed";
};

const MOCK_CASES: Case[] = [
    { id: 1, client: "Maria S.", subject: "Pedido de asilo — recurso", category: "Asilo", status: "active", priority: "urgent", date: "20/02", notes: ["Audiência marcada para 28/02.", "Documentos traduzidos entregues."] },
    { id: 2, client: "Ahmed K.", subject: "Renovação de visto de trabalho", category: "Visto", status: "active", priority: "high", date: "18/02", notes: ["A aguardar resposta do SEF."] },
    { id: 3, client: "Li Wei", subject: "Reunificação familiar", category: "Família", status: "pending", priority: "medium", date: "22/02", notes: [] },
    { id: 4, client: "Fatima R.", subject: "Queixa por discriminação laboral", category: "Trabalho", status: "closed", priority: "low", date: "10/02", notes: ["Caso resolvido — acordo extrajudicial."] },
];

const MOCK_CONSULTS: Consultation[] = [
    { id: 1, client: "Maria S.", date: "28/02/2026", time: "10:00", type: "Audiência", status: "open" },
    { id: 2, client: "Ahmed K.", date: "27/02/2026", time: "14:30", type: "Consulta jurídica", status: "open" },
    { id: 3, client: "Li Wei", date: "26/02/2026", time: "11:00", type: "Primeira consulta", status: "open" },
];

const PRIO_BADGE: Record<string, string> = {
    low: "badge--green", medium: "badge--blue", high: "badge--amber", urgent: "badge--red",
};

const STAT_BADGE: Record<string, string> = {
    pending: "badge--amber", active: "badge--blue", closed: "badge--green", open: "badge--amber", completed: "badge--green",
};

export function LegalPanel() {
    const [cases, setCases] = useState(MOCK_CASES);
    const [expandedCase, setExpandedCase] = useState<number | null>(null);
    const [newNote, setNewNote] = useState("");

    function addNote(caseId: number) {
        if (!newNote.trim()) return;
        setCases((prev) =>
            prev.map((c) =>
                c.id === caseId ? { ...c, notes: [...c.notes, newNote.trim()] } : c
            )
        );
        setNewNote("");
    }

    return (
        <>
            {/* Active cases */}
            <div className="card" style={{ marginBottom: "1.25rem" }}>
                <p className="card-title">📂 Meus Casos Ativos</p>
                <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: "1rem" }}>
                    Casos atribuídos a si. Adicione notas jurídicas confidenciais e acompanhe o estado de cada processo.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {cases.filter((c) => c.status !== "closed").map((c) => (
                        <div key={c.id}>
                            <div
                                style={{
                                    display: "flex", alignItems: "center", gap: "0.75rem",
                                    padding: "0.85rem 1rem", background: "var(--bg-soft)",
                                    borderRadius: "var(--radius-sm)", border: "1px solid var(--border)",
                                    cursor: "pointer", flexWrap: "wrap",
                                }}
                                onClick={() => setExpandedCase(expandedCase === c.id ? null : c.id)}
                            >
                                <div style={{ flex: 1, minWidth: "160px" }}>
                                    <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{c.client}</div>
                                    <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{c.subject} · {c.category}</div>
                                </div>
                                <span className={`badge ${PRIO_BADGE[c.priority]}`}>{c.priority.toUpperCase()}</span>
                                <span className={`badge ${STAT_BADGE[c.status]}`}>{c.status.toUpperCase()}</span>
                                <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{c.date}</span>
                                <span style={{ fontSize: "0.85rem" }}>{expandedCase === c.id ? "▲" : "▼"}</span>
                            </div>

                            {/* Expanded: notes */}
                            {expandedCase === c.id && (
                                <div style={{ margin: "0.5rem 0 0 1rem", padding: "1rem", background: "#fff", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                                    <p style={{ fontWeight: 700, fontSize: "0.82rem", marginBottom: "0.5rem" }}>📝 Notas Jurídicas (confidenciais)</p>
                                    {c.notes.length === 0 ? (
                                        <p style={{ fontSize: "0.82rem", color: "var(--muted)", fontStyle: "italic" }}>Sem notas.</p>
                                    ) : (
                                        <ul style={{ paddingLeft: "1rem", fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: "1.8" }}>
                                            {c.notes.map((n, i) => <li key={i}>{n}</li>)}
                                        </ul>
                                    )}
                                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                                        <input
                                            className="form-input"
                                            style={{ flex: 1, fontSize: "0.82rem" }}
                                            placeholder="Adicionar nota jurídica…"
                                            value={expandedCase === c.id ? newNote : ""}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && addNote(c.id)}
                                        />
                                        <button className="btn btn--blue" style={{ fontSize: "0.75rem" }} onClick={() => addNote(c.id)}>
                                            + Nota
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Upcoming consultations */}
            <div className="card">
                <p className="card-title">📅 Próximas Consultas Agendadas</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {MOCK_CONSULTS.map((c) => (
                        <div
                            key={c.id}
                            style={{
                                display: "flex", alignItems: "center", gap: "1rem",
                                padding: "0.75rem 1rem", background: "var(--bg-soft)",
                                borderRadius: "var(--radius-sm)", flexWrap: "wrap",
                            }}
                        >
                            <div style={{ fontWeight: 600, fontSize: "0.875rem", minWidth: "90px" }}>{c.client}</div>
                            <div style={{ fontSize: "0.82rem" }}>{c.date} · {c.time}</div>
                            <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{c.type}</div>
                            <span className={`badge ${STAT_BADGE[c.status]}`} style={{ marginLeft: "auto" }}>
                                {c.status === "open" ? "AGENDADA" : "CONCLUÍDA"}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
