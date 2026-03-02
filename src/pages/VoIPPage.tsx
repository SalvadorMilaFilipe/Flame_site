import { useState, useRef, useEffect } from "react";

const LANGUAGES = [
    "Português", "English", "Español", "Français", "Deutsch",
    "Arabic / عربي", "中文 (Mandarim)", "Русский", "Italiano",
    "Polski", "Română", "Bengali / বাংলা", "Tigrinya / ትግርኛ",
    "Dari / دری", "Pashto / پښتو", "Somali", "Hausa",
    "Swahili", "Amharic / አማርኛ", "Ukrainian / Українська",
];

type Msg = {
    id: number;
    text: string;
    translated?: string;
    from: "me" | "team" | "system";
    at: Date;
};

const DEMO_RESPONSES = [
    "Entendido. Pode repetir mais devagar, por favor?",
    "Vou verificar essa informação com o advogado responsável.",
    "A tradução foi gerada automaticamente pela IA F.L.A.M.E.",
    "Tens o direito de permanecer em silêncio. O advogado será notificado.",
];

export function VoIPPage() {
    const [myLang, setMyLang] = useState("Português");
    const [themLang, setThemLang] = useState("English");
    const [callActive, setCallActive] = useState(false);
    const [messages, setMessages] = useState<Msg[]>([
        {
            id: 0,
            text: "Canal seguro F.L.A.M.E pronto. Seleciona os idiomas e inicia a chamada ou conversa.",
            from: "system",
            at: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState("");
    const messagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
    }, [messages]);

    function fmt(d: Date) {
        return d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
    }

    function pushMsg(msg: Omit<Msg, "id" | "at">) {
        setMessages((prev) => [
            ...prev,
            { ...msg, id: prev.length + 1, at: new Date() },
        ]);
    }

    function handleSend(e: React.FormEvent) {
        e.preventDefault();
        const text = inputText.trim();
        if (!text) return;
        setInputText("");

        pushMsg({
            text,
            translated: `[${themLang}] ${text}`, // Mock IA translation
            from: "me",
        });

        setTimeout(() => {
            const reply =
                DEMO_RESPONSES[Math.floor(Math.random() * DEMO_RESPONSES.length)];
            pushMsg({
                text: reply,
                translated: `[${myLang}] ${reply}`,
                from: "team",
            });
        }, 1500);
    }

    function toggleCall() {
        const next = !callActive;
        setCallActive(next);
        pushMsg({
            text: next
                ? `🎙 Chamada iniciada. IA a traduzir em tempo real: ${myLang} ↔ ${themLang}.`
                : "📵 Chamada terminada. A sessão foi encerrada de forma segura.",
            from: "system",
        });
    }

    return (
        <>
            {/* Header */}
            <div className="page-header">
                <h1>📞 Linha Segura VoIP com IA</h1>
                <p>
                    Comunicação segura com tradução em tempo real em mais de 50 idiomas —
                    ideal para interrogatórios policiais, consultas jurídicas e reuniões
                    com advogados.
                </p>
            </div>

            <div className="voip-layout">
                {/* LEFT: settings panel */}
                <aside>
                    {/* Language selection */}
                    <div className="voip-panel" style={{ marginBottom: "1.25rem" }}>
                        <div className="voip-panel-header">
                            🌐 Idiomas de Tradução
                        </div>

                        <div className="lang-row">
                            <label className="lang-label">Eu falo</label>
                            <select
                                className="lang-select"
                                value={myLang}
                                onChange={(e) => setMyLang(e.target.value)}
                            >
                                {LANGUAGES.map((l) => (
                                    <option key={l}>{l}</option>
                                ))}
                            </select>
                        </div>

                        <div className="lang-arrow">⇅</div>

                        <div className="lang-row">
                            <label className="lang-label">Interlocutor fala</label>
                            <select
                                className="lang-select"
                                value={themLang}
                                onChange={(e) => setThemLang(e.target.value)}
                            >
                                {LANGUAGES.map((l) => (
                                    <option key={l}>{l}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Call controls */}
                    <div className="voip-panel">
                        <div className="voip-panel-header">🎙 Controlo de Chamada</div>
                        <div className="call-box">
                            <div className={`call-status ${callActive ? "call-status--active" : ""}`}>
                                {callActive
                                    ? `🔴 Em chamada — ${myLang} ↔ ${themLang}`
                                    : "Pressiona para iniciar a linha segura"}
                            </div>
                            <button
                                className={`btn btn--full btn--lg ${callActive ? "btn--outline" : "btn--green"}`}
                                onClick={toggleCall}
                            >
                                {callActive ? "📵 Terminar Chamada" : "📞 Iniciar Chamada Segura"}
                            </button>
                        </div>
                    </div>

                    {/* Info */}
                    <div
                        className="card"
                        style={{ marginTop: "1.25rem", fontSize: "0.8rem", color: "var(--muted)", lineHeight: "1.65" }}
                    >
                        <p className="card-title" style={{ fontSize: "0.8rem" }}>ℹ️ Como funciona</p>
                        A IA F.L.A.M.E traduz automaticamente cada frase em tempo real —
                        nunca armazena o áudio. O canal usa encriptação end-to-end.
                        Em produção, integra com WebRTC + motor de tradução (ex. DeepL, Google Cloud).
                    </div>
                </aside>

                {/* RIGHT: chat panel */}
                <div className="chat-box">
                    <div className="chat-header">
                        <span className="chat-title">
                            💬 Chat Seguro com Tradução por IA
                        </span>
                        <span className="ai-badge">✦ IA Ativa</span>
                    </div>

                    <div className="chat-inner" ref={messagesRef}>
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={`message message--${m.from}`}
                            >
                                <div className="message-bubble">{m.text}</div>
                                {m.translated && m.from !== "system" && (
                                    <div className="message-translated">
                                        ✦ {m.translated}
                                    </div>
                                )}
                                <div className="message-meta">
                                    {m.from === "me"
                                        ? `Tu • ${fmt(m.at)}`
                                        : m.from === "team"
                                            ? `Equipa F.L.A.M.E • ${fmt(m.at)}`
                                            : fmt(m.at)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <form className="message-form" onSubmit={handleSend}>
                        <input
                            className="message-input"
                            placeholder={`Escreve em ${myLang}…`}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                        <button type="submit" className="btn btn--blue">
                            Enviar
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
