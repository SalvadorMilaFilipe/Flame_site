import { Link, useLocation } from "react-router-dom";

export function AboutLayout({ children }: { children: React.ReactNode }) {
    const location = useLocation();

    const tabs = [
        { id: "company", label: "Sobre a Empresa", path: "/about" },
        { id: "hr", label: "Recursos Humanos", path: "/about/hr" },
        { id: "social", label: "Iniciativas Sociais", path: "/about/social" },
        { id: "ethics", label: "Valores Éticos", path: "/about/ethics" },
        { id: "services", label: "Serviços Disponíveis", path: "/about/services" },
        { id: "areas", label: "Áreas de Atuação", path: "/about/areas" },
    ];

    return (
        <div className="about-container">
            {/* Sub-navbar interna da página About */}
            <nav className="about-subnav">
                {tabs.map((tab) => {
                    const isActive = tab.path === "/about"
                        ? location.pathname === "/about"
                        : location.pathname.startsWith(tab.path);

                    return (
                        <Link
                            key={tab.id}
                            to={tab.path}
                            className={`about-subnav-link ${isActive ? "about-subnav-link--active" : ""}`}
                        >
                            {tab.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Conteúdo dinâmico da secção */}
            <div className="about-content">
                {children}
            </div>
        </div>
    );
}

const STAFF_DATA: Record<string, any> = {
    it: {
        title: "Departamento de TI",
        icon: "💻",
        description: "Inovação tecnológica e segurança robusta para proteger cada dado dos nossos utilizadores. Atuamos no desenvolvimento da App F.L.A.M.E e na segurança do Vault.",
        members: [
            { name: "Linus Torvalds", role: "Especialista em Cibersegurança", level: "Senior Staff", desc: "Especialista em segurança de baixo nível e encriptação ponta-a-ponta.", color: "var(--blue)" },
            { name: "Ada Lovelace", role: "Programadora Mobile", level: "Coordenação", desc: "Responsável pela App F.L.A.M.E e pela experiência de utilizador em situações críticas.", color: "var(--accent)" },
            { name: "Alan Turing", role: "Analista de Dados", level: "Especialista", desc: "Analisa padrões de risco e otimiza a resposta de alertas automáticos.", color: "var(--green)" }
        ]
    },
    legal: {
        title: "Apoio Legal",
        icon: "⚖️",
        description: "Defesa intransigente dos direitos humanos e apoio na regularização de processos migratórios. Conectamos advogados certificados a quem precisa de justiça.",
        members: [
            { name: "Harvey Specter", role: "Advogado Especialista em Imigração", level: "Direção", desc: "Responsável pelo contacto com advogados e orientação estratégica de casos complexos.", color: "var(--blue)" },
            { name: "Jessica Pearson", role: "Advogada de Direitos Humanos", level: "Sénior", desc: "Especialista em direito internacional e direitos humanos.", color: "var(--text)" },
            { name: "Mike Ross", role: "Assistente Legal", level: "Operacional", desc: "Análise técnica de legislação migratória e preparação de defesas.", color: "var(--muted)" }
        ]
    },
    social: {
        title: "Apoio Social",
        icon: "🤝",
        description: "Acompanhamento humano, psicológico e linguístico para garantir a dignidade de quem chega. O nosso foco é a saúde mental e a integração comunitária.",
        members: [
            { name: "Terence Fletcher", role: "Coordenador de Apoio Social", level: "Coordenação", desc: "Acompanha diretamente os imigrantes e oferece apoio em situações de vulnerabilidade.", color: "var(--green)" },
            { name: "Sigmund Freud", role: "Psicólogo", level: "Especialista", desc: "Apoio no tratamento de traumas decorrentes de experiências de migração forcada.", color: "#82c91e" },
            { name: "Florence Nightingale", role: "Tradutora Multilingue", level: "Operacional", desc: "Tradução simultânea e acompanhamento em reuniões oficiais.", color: "var(--accent)" }
        ]
    },
    recruitment: {
        title: "Recrutamento",
        icon: "🔍",
        description: "Identificamos talentos com visão social, priorizando quem já viveu a experiência da migração para garantir uma empatia real no atendimento.",
        members: [
            { name: "Tiago Dias", role: "Recrutador (Ex-Imigrante)", level: "Operacional", desc: "Focado em talentos com visão social e experiência de vida.", color: "var(--muted)" },
            { name: "Gabriel Coelho", role: "Gestor de Parcerias Sociais", level: "Relacional", desc: "Desenvolve redes de cooperação com empresas para integração laboral.", color: "var(--text)" }
        ]
    }
};

export function StaffAreaSection({ area }: { area: string }) {
    const data = STAFF_DATA[area];
    if (!data) return <div>Área não encontrada</div>;

    return (
        <div className="hr-section">
            <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                <Link to="/about/hr" className="btn btn--outline" style={{ padding: "0.4rem 0.8rem", height: "fit-content" }}>
                    ← Voltar
                </Link>
                <div>
                    <h2 className="card-title" style={{ margin: 0, fontSize: "1.5rem" }}>{data.icon} {data.title}</h2>
                    <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>{data.description}</p>
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {data.members.map((m: any, index: number) => (
                    <div key={m.name} style={{ position: "relative" }}>
                        <div className="card" style={{
                            borderLeft: `5px solid ${m.color}`,
                            padding: "1.5rem",
                            display: "flex",
                            gap: "1.5rem",
                            alignItems: "center"
                        }}>
                            <div className="avatar" style={{
                                width: "55px",
                                height: "55px",
                                fontSize: "1.1rem",
                                flexShrink: 0
                            }}>
                                {m.name.split(" ").map((n: string) => n[0]).join("")}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                    <h4 style={{ fontSize: "1.05rem", fontWeight: 700 }}>{m.name}</h4>
                                    <span style={{ fontSize: "0.7rem", color: m.color, fontWeight: 800, textTransform: "uppercase" }}>{m.level}</span>
                                </div>
                                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginTop: "0.1rem" }}>{m.role}</p>
                                <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "0.4rem" }}>{m.desc}</p>
                            </div>
                        </div>
                        {index < data.members.length - 1 && (
                            <div style={{
                                height: "1rem",
                                width: "2px",
                                background: "var(--border)",
                                marginLeft: "42px"
                            }}></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// Componentes das secções (Placeholders até o USER mandar o conteúdo)
export function CompanySection() {
    return (
        <div className="about-hero" style={{ padding: "0", background: "none", border: "none", boxShadow: "none" }}>
            <h1 style={{ textAlign: "left", fontSize: "2.5rem" }}>
                <em>F.L.A.M.E</em>
            </h1>
            <p style={{ fontWeight: 700, fontSize: "1.2rem", color: "var(--text-secondary)", marginTop: "0.5rem", marginBottom: "1.5rem" }}>
                Frontline Legal Aid for Migrants & Emergencies
            </p>

            <div className="card" style={{ marginBottom: "2.5rem", borderLeft: "4px solid var(--accent)", background: "var(--surface)" }}>
                <p style={{ fontSize: "1.1rem", lineHeight: "1.8" }}>
                    A <strong>F.L.A.M.E</strong> é uma startup tecnológica de cariz social (ONG) dedicada a proteger e apoiar
                    imigrantes que sofrem perseguição, discriminação ou abusos por parte de entidades abusivas ou redes de
                    exploração (como o sistema "ICE").
                </p>
                <p style={{ marginTop: "1rem", fontSize: "1.1rem", lineHeight: "1.8" }}>
                    Desenvolvemos software seguro de encriptação, linhas de apoio baseadas em Inteligência Artificial
                    e aplicações móveis que conectam os utilizadores a apoio jurídico, psicológico e traduções em tempo real.
                    O nosso compromisso é ser o escudo tecnológico de quem mais precisa na linha da frente.
                </p>
            </div>

            <div className="about-acronym">
                {[
                    { letter: "F", word: "Frontline", def: "Atuação direta na linha da frente" },
                    { letter: "L", word: "Legal", def: "Apoio jurídico especializado e certificado" },
                    { letter: "A", word: "Aid", def: "Ajuda humanitária e tecnológica imediata" },
                    { letter: "M", word: "Migrants", def: "A nossa comunidade e missão central" },
                    { letter: "E", word: "Emergencies", def: "Resposta ultra-rápida em cenários de crise" },
                ].map((item) => (
                    <div key={item.letter} className="acronym-item">
                        <div className="acronym-letter">{item.letter}</div>
                        <div className="acronym-word">{item.word}</div>
                        {item.def && <div className="acronym-def">{item.def}</div>}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function HRSection() {
    const departments = [
        {
            id: "it",
            title: "💻 Departamento de TI",
            desc: "Nós: Programadores Mobile, Especialistas em Cibersegurança e Analistas de Dados.",
            roles: ["Tech", "Segurança"]
        },
        {
            id: "legal",
            title: "⚖️ Apoio Legal",
            desc: "Advogados especializados em imigração e direitos humanos.",
            roles: ["Jurídico"]
        },
        {
            id: "social",
            title: "🤝 Apoio Social",
            desc: "Psicólogos e tradutores multilingues.",
            roles: ["Social", "Saúde"]
        },
        {
            id: "recruitment",
            title: "🔍 Recrutamento",
            desc: "Contratação de profissionais ex-imigrantes para garantir empatia real.",
            roles: ["RH"]
        }
    ];

    const hierarchy = [
        {
            level: "Direção Executiva",
            member: { name: "Salvador Mila", role: "Diretor Executivo", desc: "Coordena todas as operações e define estratégias da F.L.A.M.E." },
            color: "var(--accent)"
        },
        {
            level: "Coordenação Jurídica",
            member: { name: "Harvey Specter", role: "Coordenador Jurídico", desc: "Responsável pelo contacto com advogados, análise de processos legais e orientação jurídica." },
            color: "var(--blue)"
        },
        {
            level: "Assistência Social",
            member: { name: "Terence Fletcher", role: "Assistente Social", desc: "Acompanha diretamente os imigrantes e oferece apoio em situações de vulnerabilidade." },
            color: "var(--green)"
        },
        {
            level: "Linha de Apoio 24/7",
            member: { name: "A.I.", role: "Operadores Inteligentes", desc: "Atendimento multilingue, triagem de casos e encaminhamento automático." },
            color: "#82c91e"
        },
        {
            level: "Parcerias & Captação",
            member: { name: "Gabriel Coelho", role: "Gestor de Parcerias", desc: "Contacta empresas e associações; desenvolve projetos conjuntos." },
            color: "var(--text)"
        },
        {
            level: "Recrutamento",
            member: { name: "Tiago Dias", role: "Recrutador", desc: "Focado em talentos com visão social e experiência de vida." },
            color: "var(--muted)"
        }
    ];

    return (
        <div className="hr-section">
            <h2 className="card-title" style={{ marginBottom: "2rem" }}>👥 Recursos Humanos & Estrutura da Equipa</h2>

            {/* Departamentos */}
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "4rem" }}>
                {departments.map(dept => (
                    <Link
                        key={dept.id}
                        to={`/about/hr/${dept.id}`}
                        className="card qa-card"
                        style={{ padding: "1.25rem", borderTop: "3px solid var(--border)", textDecoration: "none", color: "inherit" }}
                    >
                        <h3 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>{dept.title}</h3>
                        <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{dept.desc}</p>
                        <div style={{ marginTop: "auto", textAlign: "right", fontSize: "0.7rem", fontWeight: 700, color: "var(--accent)" }}>
                            Ver equipa →
                        </div>
                    </Link>
                ))}
            </div>

            {/* Hierarquia Funcional */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {hierarchy.map((h, index) => (
                    <div key={h.member.name} style={{ position: "relative" }}>
                        <div className="card" style={{
                            borderLeft: `5px solid ${h.color}`,
                            padding: "1.5rem",
                            display: "flex",
                            gap: "1.5rem",
                            alignItems: "center"
                        }}>
                            <div className="avatar" style={{
                                width: "55px",
                                height: "55px",
                                fontSize: "1.1rem",
                                flexShrink: 0
                            }}>
                                {h.member.name === "A.I." ? "🤖" : h.member.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                    <h4 style={{ fontSize: "1.05rem", fontWeight: 700 }}>{h.member.name}</h4>
                                    <span style={{ fontSize: "0.7rem", color: h.color, fontWeight: 800, textTransform: "uppercase" }}>{h.level}</span>
                                </div>
                                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginTop: "0.1rem" }}>{h.member.role}</p>
                                <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "0.4rem" }}>{h.member.desc}</p>
                            </div>
                        </div>
                        {index < hierarchy.length - 1 && (
                            <div style={{
                                height: "1rem",
                                width: "2px",
                                background: "var(--border)",
                                marginLeft: "42px"
                            }}></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function SocialSection() {
    const initiatives = [
        {
            title: "🚀 Projeto \"Code Your Future\"",
            subtitle: "Programa o teu Futuro",
            desc: "A F.L.A.M.E. organiza bootcamps online gratuitos para ensinar programação básica a refugiados e imigrantes. O objetivo é dar-lhes ferramentas valiosas para entrarem no mercado de trabalho de forma digna e legal."
        },
        {
            title: "⏱️ Doação de Horas (Pro Bono)",
            subtitle: "Responsabilidade Social Ativa",
            desc: "Todos os nossos programadores e engenheiros informáticos dedicam 10% do seu horário de trabalho mensal para ajudar outras pequenas ONG (como bancos alimentares ou centros de acolhimento locais em Houston, EUA) a melhorar os seus websites e bases de dados gratuitamente."
        }
    ];

    return (
        <div className="social-section">
            <h2 className="card-title" style={{ marginBottom: "2rem" }}>🤝 Iniciativas Sociais</h2>

            <div className="grid">
                {initiatives.map((item, idx) => (
                    <div key={idx} className="card" style={{ borderTop: "4px solid var(--accent)" }}>
                        <h3 style={{ fontSize: "1.2rem", color: "var(--text)" }}>{item.title}</h3>
                        <p style={{
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: "var(--accent)",
                            textTransform: "uppercase",
                            marginTop: "0.25rem",
                            marginBottom: "1rem"
                        }}>
                            {item.subtitle}
                        </p>
                        <p style={{ fontSize: "0.95rem", lineHeight: "1.7", color: "var(--text-secondary)" }}>
                            {item.desc}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function EthicsSection() {
    return (
        <div className="ethics-section">
            <div className="page-header" style={{ borderBottom: 'none', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '2rem' }}>Os Nossos Valores Éticos</h2>
                <p style={{ fontSize: '1.1rem', maxWidth: '800px' }}>
                    O "Código" da Empresa: A tecnologia ao serviço da humanidade, com segurança absoluta e transparência total.
                </p>
            </div>

            <div className="ethics-grid" style={{ marginTop: '2rem' }}>
                <div className="card" style={{ borderTop: '4px solid var(--blue)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ fontSize: '2rem' }}>🛡️</div>
                    <h3 className="card-title" style={{ fontSize: '1.2rem', margin: 0 }}>Privacidade Absoluta (Zero-Knowledge)</h3>
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
                        Como programadores, a nossa ética baseia-se na proteção de dados. Adotamos uma política rigorosa onde nem a própria <strong>F.L.A.M.E.</strong> possui as chaves de desencriptação dos utilizadores. <strong>Nós não vendemos dados.</strong>
                    </p>
                </div>

                <div className="card" style={{ borderTop: '4px solid var(--accent)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ fontSize: '2rem' }}>🔓</div>
                    <h3 className="card-title" style={{ fontSize: '1.2rem', margin: 0 }}>Transparência e Código Aberto</h3>
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
                        O nosso código principal é <strong>Open Source</strong> (código aberto). Isto permite que especialistas de cibersegurança de todo o mundo o auditem gratuitamente, garantindo que não há falhas (<em>"backdoors"</em>) que a ICE possa explorar.
                    </p>
                </div>

                <div className="card" style={{ borderTop: '4px solid var(--green)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ fontSize: '2rem' }}>⚖️</div>
                    <h3 className="card-title" style={{ fontSize: '1.2rem', margin: 0 }}>Imparcialidade Humana</h3>
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
                        Acreditamos que o acesso à justiça e à defesa não depende de onde se nasceu ou de se ter "papéis". A tecnologia deve nivelar as oportunidades e garantir a dignidade universal.
                    </p>
                </div>
            </div>

            <div className="card" style={{ marginTop: '2.5rem', background: 'var(--bg-soft)', border: '1px dashed var(--border)', textAlign: 'center' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 500 }}>
                    "A nossa missão é ser o escudo tecnológico de quem mais precisa."
                </p>
            </div>
        </div>
    );
}

export function ServicesSection() {
    const services = [
        {
            id: "sos",
            title: "F.L.A.M.E. SOS App",
            subtitle: "Aplicação Mobile com Botão de Pânico",
            description: "Uma aplicação desenvolvida em React Native (iOS/Android) com um 'Botão de Pânico' escondido (disfarçado de calculadora ou rádio). Quando ativado, envia um alerta silencioso com localização GPS em tempo real para a nossa rede de advogados parceiros.",
            benefits: [
                "Representação legal imediata em caso de abordagem",
                "Prevenção de detenções arbitrárias ou deportações 'express'",
                "Interface furtiva para segurança acrescida"
            ],
            price: "100% Gratuito para imigrantes",
            image: "/img/flame_sos_app.png"
        },
        {
            id: "vault",
            title: "O \"Vault\"",
            subtitle: "Cofre Digital Encriptado",
            description: "Sistema de armazenamento Cloud com encriptação ponta-a-ponta. Permite digitalizar e guardar passaportes, vistos e certidões com segurança absoluta.",
            benefits: [
                "Proteção contra roubo ou confisco de documentos físicos",
                "Acesso mundial em qualquer dispositivo",
                "Encriptação de nível militar (Zero-Knowledge)"
            ],
            price: "Grátis até 2GB / Org: 50€/mês",
            image: "/img/flame_vault.png"
        },
        {
            id: "voip",
            title: "VoIP Translate",
            subtitle: "Linha Segura de IA",
            description: "Serviço de chamadas e chat com tradução simultânea por IA em mais de 50 idiomas, ideal para interrogatórios ou consultas jurídicas.",
            benefits: [
                "Quebra de barreiras linguísticas imediatas",
                "Impede a assinatura de documentos não compreendidos",
                "Chamadas seguras sem rastreio"
            ],
            price: "Grátis na App / API Custom",
            image: "/img/flame_voip.png"
        }
    ];

    return (
        <div className="services-section">
            <div className="page-header" style={{ borderBottom: 'none', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '2rem' }}>Serviços Disponíveis</h2>
                <div className="card" style={{ background: 'var(--amber-soft)', border: '1px solid var(--amber)', marginTop: '1rem' }}>
                    <p style={{ fontWeight: 600, color: 'var(--text)' }}>
                        🚀 Modelo Freemium Social:
                    </p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        A F.L.A.M.E. opera num modelo único onde a tecnologia é <strong>100% gratuita para imigrantes</strong>,
                        sendo financiada pelo licenciamento corporativo para organizações e escritórios de advogados através da nossa tecnologia B2B.
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {services.map((s) => (
                    <div key={s.id} className="card service-card-grid" style={{
                        overflow: 'hidden',
                        padding: '2rem'
                    }}>
                        <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}>
                            <img src={s.image} alt={s.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>{s.title}</h3>
                                    <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {s.subtitle}
                                    </p>
                                </div>
                                <span className={`badge ${s.price.includes('Gratuito') || s.price.includes('Grátis') ? 'badge--green' : 'badge--blue'}`} style={{ padding: '0.5rem 1rem', flexShrink: 0 }}>
                                    {s.price}
                                </span>
                            </div>

                            <p style={{ fontSize: '1rem', lineHeight: '1.7', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                {s.description}
                            </p>

                            <div style={{ background: 'var(--bg-soft)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-soft)' }}>
                                <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.05em' }}>Principais Benefícios:</p>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.6rem' }}>
                                    {s.benefits.map((b, i) => (
                                        <li key={i} style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                                            <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>✓</span> {b}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function AreasSection() {
    const strategy = [
        { title: "Sede Central", desc: "Albuquerque, New Mexico. Ponto estratégico para coordenação regional e operações de fronteira." },
        { title: "Linhas Regionais", desc: "Criação de centros de apoio locais ligados diretamente à sede para resposta rápida." },
        { title: "Parcerias Locais", desc: "Colaboração estreita com ONGs, associações de imigrantes e escritórios de advocacia locais." },
        { title: "Presença Física", desc: "Escritórios em cidades-chave: Houston, Dallas, Los Angeles, Phoenix e Albuquerque." }
    ];

    return (
        <div className="areas-section">
            <div className="page-header" style={{ borderBottom: 'none', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '2rem' }}>Áreas de Atuação</h2>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                    Focados nos estados com maior necessidade de proteção e suporte jurídico para comunidades migrantes.
                </p>
            </div>

            <div className="areas-grid">
                {/* Lado Esquerdo: Mapa em Imagem */}
                <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--surface)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', fontWeight: 700, color: 'var(--muted)' }}>MAPA DE OPERAÇÕES</h3>

                    <div className="map-container" style={{
                        width: '100%',
                        maxWidth: '800px',
                        overflow: 'hidden',
                        position: 'relative',
                        borderRadius: '12px',
                        background: 'var(--bg-soft)'
                    }}>
                        <img
                            src="/img/Mapa_USA.png"
                            alt="Mapa de Operações USA"
                            style={{
                                width: '100%',
                                height: 'auto',
                                display: 'block',
                                objectFit: 'cover'
                            }}
                        />
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem 2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--green)' }}></div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Sede (Albuquerque)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--amber)' }}></div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Estados de Atuação</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--bg-soft)', border: '1px solid var(--border)' }}></div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Outros Estados</span>
                        </div>
                    </div>
                </div>

                {/* Lado Direito: Detalhes Estratégicos */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="card" style={{ borderLeft: '4px solid var(--green)' }}>
                        <h3 className="card-title" style={{ fontSize: '0.9rem', color: 'var(--green)' }}>SEDE CENTRAL</h3>
                        <p style={{ fontSize: '1.1rem', fontWeight: 800 }}>Albuquerque, NM</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                            A maior cidade do Novo México, escolhida estrategicamente pela sua centralidade e proximidade a corredores migratórios vitais.
                        </p>
                    </div>

                    <div className="card">
                        <h3 className="card-title" style={{ fontSize: '0.9rem' }}>ESTRATÉGIA DE PROTEÇÃO</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                            {strategy.map((item, idx) => (
                                <div key={idx} style={{ paddingLeft: '0.75rem', borderLeft: '2px solid var(--border-soft)' }}>
                                    <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.15rem' }}>{item.title}</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: '1.4' }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card" style={{ background: 'var(--bg-soft)', borderStyle: 'dashed' }}>
                        <h3 className="card-title" style={{ fontSize: '0.85rem' }}>CIDADES ESTRATÉGICAS</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                            {['Houston', 'Dallas', 'Los Angeles', 'Phoenix', 'Albuquerque'].map(city => (
                                <span key={city} className="badge badge--blue" style={{ fontSize: '0.65rem' }}>{city}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// O componente AboutPage principal agora funciona como o entrypoint da secção
export function AboutPage() {
    return (
        <AboutLayout>
            <CompanySection />
        </AboutLayout>
    );
}
