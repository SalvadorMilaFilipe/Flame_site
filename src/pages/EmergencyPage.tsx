import { useEffect, useState, useRef } from "react";

const PANIC_HOLD_MS = 2000;

export function EmergencyPage() {
  const [connected, setConnected] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [locationText, setLocationText] = useState("A obter localização…");
  const [panicActive, setPanicActive] = useState(false);
  const [panicStatus, setPanicStatus] = useState("Pronto para emergências.");
  const [messages, setMessages] = useState<
    { id: number; text: string; from: "me" | "system" | "team"; at: Date }[]
  >([]);

  const panicTimer = useRef<number | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setConnected(true);
      const now = new Date();
      setLastSync(now);
      pushMessage(
        "Ligado ao canal seguro F.L.A.M.E (simulação). Integração real pode usar WebSockets/Supabase Realtime.",
        "system"
      );
    }, 800);

    const interval = setInterval(() => {
      setLastSync(new Date());
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationText("Geolocalização não suportada neste dispositivo.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocationText(
          `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(
            4
          )} (±${Math.round(accuracy)}m)`
        );
      },
      () => {
        setLocationText(
          "Não foi possível obter a localização (permite o acesso à localização)."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 10000,
      }
    );
  }, []);

  function formatTime(date: Date) {
    return date.toLocaleTimeString("pt-PT", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  function pushMessage(text: string, from: "me" | "system" | "team") {
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, text, from, at: new Date() },
    ]);
  }

  function handlePanicStart() {
    setPanicStatus("A manter pressionado… (continua para enviar alerta)");
    setPanicActive(false);
    panicTimer.current = window.setTimeout(() => {
      triggerPanic();
    }, PANIC_HOLD_MS);
  }

  function handlePanicEnd() {
    if (panicTimer.current) {
      clearTimeout(panicTimer.current);
      panicTimer.current = null;
    }
    if (!panicActive) {
      setPanicStatus("Pronto para emergências.");
    }
  }

  function triggerPanic() {
    setPanicActive(true);
    setPanicStatus(
      "Alerta de emergência enviado (simulação). A equipa F.L.A.M.E será notificada."
    );
    pushMessage(
      "ALERTA DE PÂNICO: o utilizador acionou o botão de emergência. Backend deverá criar um incidente em tempo real.",
      "system"
    );
  }

  function handleSendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const text = String(formData.get("message") || "").trim();
    if (!text) return;
    pushMessage(text, "me");
    e.currentTarget.reset();
    setTimeout(() => {
      pushMessage(
        "Recebemos a tua mensagem. Esta é uma resposta de demonstração; o canal real usará backend em tempo real.",
        "team"
      );
    }, 1200);
  }

  return (
    <section className="panel emergency-panel">
      <h1>Emergência</h1>
      <p className="subtitle">
        Botão de pânico e canal rápido em contexto de assédio ou abuso por
        autoridades.
      </p>

      <button
        className={`panic-button ${panicActive ? "pressed" : ""}`}
        onMouseDown={handlePanicStart}
        onMouseUp={handlePanicEnd}
        onMouseLeave={handlePanicEnd}
        onTouchStart={(e) => {
          e.preventDefault();
          handlePanicStart();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          handlePanicEnd();
        }}
      >
        MANTÉM PREMIDO PARA PEDIR AJUDA
      </button>
      <p
        className={`panic-status ${panicActive ? "panic-status--sent" : "panic-status--active"
          }`}
      >
        {panicStatus}
      </p>

      <div className="status-row">
        <div className="status-card">
          <h2>Estado em tempo real</h2>
          <p
            className={
              "status-pill " +
              (connected ? "status-pill--online" : "status-pill--offline")
            }
          >
            {connected ? "Online e seguro" : "Offline"}
          </p>
          <p className="status-meta">
            {lastSync
              ? `Última sincronização: ${formatTime(lastSync)}`
              : "Última sincronização: —"}
          </p>
        </div>
        <div className="status-card">
          <h2>Localização aproximada</h2>
          <p>{locationText}</p>
        </div>
      </div>

      <div className="realtime-panel-inner">
        <h2>Canal de Mensagens (demo)</h2>
        <p className="subtitle">
          Esta área mostra como o fluxo em tempo real pode funcionar. Depois,
          podes ligar a um backend em WebSocket/Supabase.
        </p>
        <div className="chat-box">
          <div className="messages">
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  "message " +
                  (m.from === "system"
                    ? "message--system"
                    : m.from === "me"
                      ? "message--me"
                      : m.from === "team"
                        ? "message--team"
                        : "")
                }
              >
                <div className="message-bubble">{m.text}</div>
                <div className="message-meta">
                  {m.from === "system"
                    ? formatTime(m.at)
                    : m.from === "me"
                      ? `Tu • ${formatTime(m.at)}`
                      : `Equipa F.L.A.M.E • ${formatTime(m.at)}`}
                </div>
              </div>
            ))}
          </div>
          <form className="message-form" onSubmit={handleSendMessage}>
            <input
              name="message"
              className="message-input"
              placeholder="Escreve uma mensagem para a equipa F.L.A.M.E…"
              autoComplete="off"
            />
            <button type="submit" className="send-button">
              Enviar
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

