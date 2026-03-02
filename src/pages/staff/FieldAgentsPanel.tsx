import { useState } from "react";

type Alert = {
    id: number;
    client: string;
    location: string;
    time: string;
    status: "sent" | "dispatched" | "arrived" | "resolved";
    priority: "high" | "critical";
};

type Shift = {
    id: number;
    date: string;
    time: string;
    region: string;
    status: "scheduled" | "active" | "completed";
};

const MOCK_ALERTS: Alert[] = [
    { id: 1, client: "Maria S.", location: "Lisboa, Rossio", time: "10:23", status: "sent", priority: "critical" },
    { id: 2, client: "Ahmed K.", location: "Porto, Campanhã", time: "09:45", status: "dispatched", priority: "high" },
    { id: 3, client: "Fatima R.", location: "Faro, Centro", time: "08:12", status: "resolved", priority: "high" },
];

const MOCK_SHIFTS: Shift[] = [
    { id: 1, date: "25/02/2026", time: "08:00 – 16:00", region: "Lisboa Centro", status: "active" },
    { id: 2, date: "26/02/2026", time: "16:00 – 00:00", region: "Amadora", status: "scheduled" },
    { id: 3, date: "24/02/2026", time: "08:00 – 16:00", region: "Sintra", status: "completed" },
];

const STATUS_COLOR: Record<string, string> = {
    sent: "badge--red",
    dispatched: "badge--amber",
    arrived: "badge--blue",
    resolved: "badge--green",
    scheduled: "badge--blue",
    active: "badge--green",
    completed: "badge--green",
};

export function FieldAgentsPanel() {
    const [alerts, setAlerts] = useState(MOCK_ALERTS);
    const [shifts] = useState(MOCK_SHIFTS);

    function handleDispatch(id: number) {
        setAlerts((prev) =>
            prev.map((a) =>
                a.id === id ? { ...a, status: "dispatched" as const } : a
            )
        );
    }

    function handleArrive(id: number) {
        setAlerts((prev) =>
            prev.map((a) =>
                a.id === id ? { ...a, status: "arrived" as const } : a
            )
        );
    }

    function handleResolve(id: number) {
        setAlerts((prev) =>
            prev.map((a) =>
                a.id === id ? { ...a, status: "resolved" as const } : a
            )
        );
    }

    return (
        <>
            {/* Active Emergencies */}
            <div className="card" style={{ marginBottom: "1.25rem" }}>
                <p className="card-title">🚨 Alertas de Emergência Ativos</p>
                <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: "1rem" }}>
                    Emergências sinalizadas via botão de pânico na app móvel. Aceita o dispatch para te deslocares ao local.
                </p>

                {alerts.length === 0 ? (
                    <p style={{ color: "var(--muted)", textAlign: "center", padding: "2rem" }}>Sem alertas ativos.</p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {alerts.map((a) => (
                            <div
                                key={a.id}
                                style={{
                                    display: "flex", alignItems: "center", gap: "1rem",
                                    padding: "0.85rem 1rem", background: "var(--bg-soft)",
                                    borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
                                    flexWrap: "wrap",
                                }}
                            >
                                <div style={{ flex: "1", minWidth: "140px" }}>
                                    <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{a.client}</div>
                                    <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                                        📍 {a.location} · 🕐 {a.time}
                                    </div>
                                </div>
                                <span className={`badge ${STATUS_COLOR[a.status]}`}>{a.status.toUpperCase()}</span>
                                <span className={`badge ${a.priority === "critical" ? "badge--red" : "badge--amber"}`}>
                                    {a.priority.toUpperCase()}
                                </span>
                                <div style={{ display: "flex", gap: "0.4rem" }}>
                                    {a.status === "sent" && (
                                        <button className="btn btn--primary" style={{ fontSize: "0.75rem", padding: "0.3rem 0.7rem" }} onClick={() => handleDispatch(a.id)}>
                                            📡 Aceitar Dispatch
                                        </button>
                                    )}
                                    {a.status === "dispatched" && (
                                        <button className="btn btn--blue" style={{ fontSize: "0.75rem", padding: "0.3rem 0.7rem" }} onClick={() => handleArrive(a.id)}>
                                            📍 Cheguei ao Local
                                        </button>
                                    )}
                                    {a.status === "arrived" && (
                                        <button className="btn btn--green" style={{ fontSize: "0.75rem", padding: "0.3rem 0.7rem" }} onClick={() => handleResolve(a.id)}>
                                            ✅ Resolver
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Shifts */}
            <div className="card">
                <p className="card-title">📅 Meus Turnos</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {shifts.map((s) => (
                        <div
                            key={s.id}
                            style={{
                                display: "flex", alignItems: "center", gap: "1rem",
                                padding: "0.75rem 1rem", background: "var(--bg-soft)",
                                borderRadius: "var(--radius-sm)", flexWrap: "wrap",
                            }}
                        >
                            <div style={{ fontWeight: 600, fontSize: "0.875rem", minWidth: "90px" }}>{s.date}</div>
                            <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>{s.time}</div>
                            <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>📍 {s.region}</div>
                            <span className={`badge ${STATUS_COLOR[s.status]}`} style={{ marginLeft: "auto" }}>
                                {s.status.toUpperCase()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
