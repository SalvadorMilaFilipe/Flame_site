import React from 'react';

export function WalletPage() {
  return (
    <section className="panel">
      <h1>Carteira Digital</h1>
      <p className="subtitle">
        Gere a tua identidade digital e acessos rápidos a documentos de identificação.
      </p>

      <div className="grid">
        <div className="card">
          <h3>Documento de Identidade</h3>
          <p className="status-meta">Válido até: 12/2026</p>
          <div className="status-pill status-pill--online">VERIFICADO</div>
        </div>
        
        <div className="card">
          <h3>Visto de Residência</h3>
          <p className="status-meta">Estado: Em renovação</p>
          <div className="status-pill" style={{background: 'rgba(255,193,7,0.1)', color: '#ffc107'}}>PENDENTE</div>
        </div>
      </div>

      <div className="card" style={{marginTop: '1.5rem'}}>
        <h2>Adicionar Novo Documento</h2>
        <p>Digitaliza ou faz upload de novos comprovativos para a tua carteira segura.</p>
        <button className="send-button" style={{marginTop: '0.5rem', width: '100%'}}>
          + ADICIONAR DOCUMENTO
        </button>
      </div>
    </section>
  );
}
