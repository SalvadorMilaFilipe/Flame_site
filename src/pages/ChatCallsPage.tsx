export function ChatCallsPage() {
  return (
    <section className="panel">
      <h1>Chat &amp; Chamadas</h1>
      <p className="subtitle">
        Espaço dedicado a comunicação segura com advogados e equipa F.L.A.M.E,
        incluindo mensagens e chamadas VoIP (simuladas nesta fase).
      </p>
      <div className="card">
        <h2>Chat seguro (demo)</h2>
        <p>
          Aqui podes replicar a mesma lógica de chat em tempo real da página de
          emergência, mas organizada por casos e conversas. Depois, podes
          integrar com serviços como WebRTC/VoIP.
        </p>
      </div>
      <div className="card">
        <h2>Chamadas VoIP (demo)</h2>
        <p>
          Zona para mostrar lista de chamadas, estado (em curso, concluída,
          perdida) e botões para iniciar nova chamada segura.
        </p>
      </div>
    </section>
  );
}

