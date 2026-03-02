import { useState } from "react";

type Job = {
    id: number;
    title: string;
    department: string;
    location: string;
    preferImmigrant: boolean;
    isOpen: boolean;
    applicants: number;
    date: string;
};

type Candidate = {
    id: number;
    name: string;
    jobTitle: string;
    nationality: string;
    isImmigrant: boolean;
    languages: string[];
    status: "applied" | "screening" | "interview" | "offered" | "hired" | "rejected";
    date: string;
};

const MOCK_JOBS: Job[] = [
    { id: 1, title: "Agente de Campo — Lisboa", department: "Campo", location: "Lisboa", preferImmigrant: true, isOpen: true, applicants: 12, date: "20/02" },
    { id: 2, title: "Programador React Native", department: "TI", location: "Remoto", preferImmigrant: false, isOpen: true, applicants: 8, date: "18/02" },
    { id: 3, title: "Advogado — Direito de Imigração", department: "Legal", location: "Porto", preferImmigrant: true, isOpen: true, applicants: 5, date: "15/02" },
    { id: 4, title: "Psicólogo Clínico — Apoio a Refugiados", department: "Social", location: "Lisboa", preferImmigrant: true, isOpen: true, applicants: 7, date: "22/02" },
    { id: 5, title: "Tradutor Árabe-Português", department: "Social", location: "Remoto", preferImmigrant: true, isOpen: false, applicants: 15, date: "10/02" },
];

const MOCK_CANDIDATES: Candidate[] = [
    { id: 1, name: "Hassan M.", jobTitle: "Agente de Campo", nationality: "Síria", isImmigrant: true, languages: ["Arabic", "Português", "English"], status: "interview", date: "23/02" },
    { id: 2, name: "Olena T.", jobTitle: "Tradutor", nationality: "Ucrânia", isImmigrant: true, languages: ["Ukrainian", "Português", "Русский"], status: "screening", date: "24/02" },
    { id: 3, name: "Carlos P.", jobTitle: "Programador", nationality: "Portugal", isImmigrant: false, languages: ["Português", "English"], status: "applied", date: "25/02" },
    { id: 4, name: "Amina D.", jobTitle: "Psicóloga", nationality: "Marrocos", isImmigrant: true, languages: ["Français", "Arabic", "Português"], status: "offered", date: "20/02" },
    { id: 5, name: "Pedro L.", jobTitle: "Advogado Imigração", nationality: "Brasil", isImmigrant: true, languages: ["Português", "English", "Español"], status: "hired", date: "15/02" },
];

const CAND_BADGE: Record<string, string> = {
    applied: "badge--blue", screening: "badge--amber", interview: "badge--amber",
    offered: "badge--green", hired: "badge--green", rejected: "badge--red",
};

const CAND_LABEL: Record<string, string> = {
    applied: "CANDIDATURA", screening: "TRIAGEM", interview: "ENTREVISTA",
    offered: "PROPOSTA", hired: "CONTRATADO", rejected: "REJEITADO",
};

const PIPELINE_STAGES = ["applied", "screening", "interview", "offered", "hired"] as const;

export function RecruitmentPanel() {
    const [candidates, setCandidates] = useState(MOCK_CANDIDATES);

    function advanceCandidate(id: number) {
        setCandidates((prev) =>
            prev.map((c) => {
                if (c.id !== id) return c;
                const idx = PIPELINE_STAGES.indexOf(c.status as any);
                if (idx < 0 || idx >= PIPELINE_STAGES.length - 1) return c;
                return { ...c, status: PIPELINE_STAGES[idx + 1] };
            })
        );
    }

    function rejectCandidate(id: number) {
        setCandidates((prev) =>
            prev.map((c) => (c.id === id ? { ...c, status: "rejected" as const } : c))
        );
    }

    return (
        <>
            {/* Open positions */}
            <div className="card" style={{ marginBottom: "1.25rem" }}>
                <p className="card-title">📋 Vagas Abertas</p>
                <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: "1rem" }}>
                    Prioridade a profissionais que tenham sido imigrantes — empatia real no apoio.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {MOCK_JOBS.map((j) => (
                        <div
                            key={j.id}
                            style={{
                                display: "flex", alignItems: "center", gap: "0.75rem",
                                padding: "0.8rem 1rem", background: "var(--bg-soft)",
                                borderRadius: "var(--radius-sm)", border: "1px solid var(--border)",
                                flexWrap: "wrap", opacity: j.isOpen ? 1 : 0.55,
                            }}
                        >
                            <div style={{ flex: 1, minWidth: "160px" }}>
                                <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{j.title}</div>
                                <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                                    {j.department} · 📍 {j.location} · {j.date}
                                </div>
                            </div>
                            <span className="badge badge--blue">{j.applicants} candidatos</span>
                            {j.preferImmigrant && (
                                <span className="badge badge--amber">🌍 Pref. Imigrante</span>
                            )}
                            <span className={`badge ${j.isOpen ? "badge--green" : "badge--red"}`}>
                                {j.isOpen ? "ABERTA" : "FECHADA"}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Candidates pipeline */}
            <div className="card">
                <p className="card-title">👥 Pipeline de Candidatos</p>
                <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: "1rem" }}>
                    Avança cada candidato pela pipeline: Candidatura → Triagem → Entrevista → Proposta → Contratado.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {candidates.map((c) => (
                        <div
                            key={c.id}
                            style={{
                                display: "flex", alignItems: "center", gap: "0.75rem",
                                padding: "0.85rem 1rem", background: "var(--bg-soft)",
                                borderRadius: "var(--radius-sm)", border: "1px solid var(--border)",
                                flexWrap: "wrap",
                                opacity: c.status === "rejected" ? 0.45 : 1,
                            }}
                        >
                            <div style={{ flex: 1, minWidth: "160px" }}>
                                <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                                    {c.name}
                                    {c.isImmigrant && <span style={{ fontSize: "0.75rem", color: "var(--amber)", marginLeft: "0.4rem" }}>🌍 Ex-imigrante</span>}
                                </div>
                                <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                                    {c.jobTitle} · 🇺🇳 {c.nationality} · 🗣 {c.languages.join(", ")}
                                </div>
                            </div>
                            <span className={`badge ${CAND_BADGE[c.status]}`}>{CAND_LABEL[c.status]}</span>
                            <div style={{ display: "flex", gap: "0.4rem" }}>
                                {c.status !== "hired" && c.status !== "rejected" && (
                                    <>
                                        <button
                                            className="btn btn--green"
                                            style={{ fontSize: "0.72rem", padding: "0.25rem 0.6rem" }}
                                            onClick={() => advanceCandidate(c.id)}
                                        >
                                            ▶ Avançar
                                        </button>
                                        <button
                                            className="btn btn--outline"
                                            style={{ fontSize: "0.72rem", padding: "0.25rem 0.6rem", color: "var(--accent)" }}
                                            onClick={() => rejectCandidate(c.id)}
                                        >
                                            ✕ Rejeitar
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
