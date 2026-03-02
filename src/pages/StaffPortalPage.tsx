import { useState } from "react";
import { FieldAgentsPanel } from "./staff/FieldAgentsPanel";
import { ITPanel } from "./staff/ITPanel";
import { LegalPanel } from "./staff/LegalPanel";
import { SocialPanel } from "./staff/SocialPanel";
import { RecruitmentPanel } from "./staff/RecruitmentPanel";

type Dept = "field" | "it" | "legal" | "social" | "recruitment";

const TABS: { id: Dept; label: string; icon: string }[] = [
    { id: "field", label: "Agentes de Campo", icon: "🚨" },
    { id: "it", label: "Departamento TI", icon: "💻" },
    { id: "legal", label: "Apoio Legal", icon: "⚖️" },
    { id: "social", label: "Apoio Social", icon: "🤝" },
    { id: "recruitment", label: "Recrutamento", icon: "📋" },
];

export function StaffPortalPage() {
    const [active, setActive] = useState<Dept>("field");

    return (
        <>
            <div className="page-header">
                <h1>🏢 Portal de Agentes F.L.A.M.E</h1>
                <p>
                    Ferramentas internas por departamento. Cada equipa vê apenas as
                    funcionalidades necessárias à sua missão.
                </p>
            </div>

            {/* Department tabs */}
            <div className="dept-tabs">
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        className={`dept-tab ${active === t.id ? "dept-tab--active" : ""}`}
                        onClick={() => setActive(t.id)}
                    >
                        <span className="dept-tab-icon">{t.icon}</span>
                        <span className="dept-tab-label">{t.label}</span>
                    </button>
                ))}
            </div>

            {/* Active panel */}
            <div className="dept-content">
                {active === "field" && <FieldAgentsPanel />}
                {active === "it" && <ITPanel />}
                {active === "legal" && <LegalPanel />}
                {active === "social" && <SocialPanel />}
                {active === "recruitment" && <RecruitmentPanel />}
            </div>
        </>
    );
}
