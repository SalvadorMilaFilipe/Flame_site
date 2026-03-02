import { useState, useCallback } from "react";
import {
  encryptText,
  decryptText,
  isCryptoAvailable,
  generateSecurePassword,
  type EncryptedPayload,
} from "../utils/crypto";

type DocItem = {
  id: number;
  icon: string;
  name: string;
  type: string;
  expires: string | null;
  status: "verified" | "pending" | "expired";
  size: string;
  /** Payload encriptado — null se ainda não encriptado */
  encrypted: EncryptedPayload | null;
  /** Conteúdo original (apenas disponível em memória, nunca enviado ao servidor) */
  decryptedContent: string | null;
};

const INITIAL_DOCS: DocItem[] = [
  { id: 1, icon: "🪪", name: "Bilhete de Identidade", type: "Identidade", expires: "12/2030", status: "verified", size: "1.2 MB", encrypted: null, decryptedContent: null },
  { id: 2, icon: "📄", name: "Visto de Residência", type: "Imigração", expires: "06/2025", status: "pending", size: "980 KB", encrypted: null, decryptedContent: null },
  { id: 3, icon: "🏠", name: "Contrato de Arrendamento", type: "Residência", expires: null, status: "verified", size: "2.4 MB", encrypted: null, decryptedContent: null },
  { id: 4, icon: "⚖️", name: "Carta do Advogado", type: "Jurídico", expires: null, status: "verified", size: "450 KB", encrypted: null, decryptedContent: null },
];

const STATUS_LABELS: Record<DocItem["status"], string> = {
  verified: "Verificado",
  pending: "Pendente",
  expired: "Expirado",
};

const STATUS_BADGE: Record<DocItem["status"], string> = {
  verified: "badge--green",
  pending: "badge--amber",
  expired: "badge--red",
};

const cryptoReady = isCryptoAvailable();

export function VaultPage() {
  const [docs, setDocs] = useState<DocItem[]>(INITIAL_DOCS);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("Identidade");
  const [newContent, setNewContent] = useState("");

  // Encryption state
  const [vaultPassword, setVaultPassword] = useState("");
  const [showPassModal, setShowPassModal] = useState(false);
  const [passModalMode, setPassModalMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [cryptoStatus, setCryptoStatus] = useState("");
  const [decryptedView, setDecryptedView] = useState<string | null>(null);

  const filtered = docs.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.type.toLowerCase().includes(search.toLowerCase())
  );

  // ── Add document ──
  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const next: DocItem = {
      id: Date.now(),
      icon: "📎",
      name: newName.trim(),
      type: newType,
      expires: null,
      status: "pending",
      size: newContent ? `${new Blob([newContent]).size} B` : "—",
      encrypted: null,
      decryptedContent: newContent || null,
    };
    setDocs((prev) => [next, ...prev]);
    setNewName("");
    setNewContent("");
    setShowForm(false);
  }

  function handleDelete(id: number) {
    setDocs((prev) => prev.filter((d) => d.id !== id));
  }

  // ── Encryption flow ──
  const openEncryptModal = useCallback((docId: number) => {
    setSelectedDocId(docId);
    setPassModalMode("encrypt");
    setVaultPassword("");
    setCryptoStatus("");
    setDecryptedView(null);
    setShowPassModal(true);
  }, []);

  const openDecryptModal = useCallback((docId: number) => {
    setSelectedDocId(docId);
    setPassModalMode("decrypt");
    setVaultPassword("");
    setCryptoStatus("");
    setDecryptedView(null);
    setShowPassModal(true);
  }, []);

  async function handleEncrypt() {
    if (!vaultPassword || selectedDocId === null) return;
    const doc = docs.find((d) => d.id === selectedDocId);
    if (!doc) return;

    const plaintext = doc.decryptedContent || `[Conteúdo simulado do documento: ${doc.name}]`;

    try {
      setCryptoStatus("⏳ A encriptar com AES-256-GCM…");
      const payload = await encryptText(plaintext, vaultPassword);

      setDocs((prev) =>
        prev.map((d) =>
          d.id === selectedDocId
            ? { ...d, encrypted: payload, decryptedContent: null }
            : d
        )
      );

      setCryptoStatus("✅ Encriptação AES-256-GCM concluída com sucesso!");
      setTimeout(() => setShowPassModal(false), 1500);
    } catch (err) {
      setCryptoStatus("❌ Erro na encriptação: " + String(err));
    }
  }

  async function handleDecrypt() {
    if (!vaultPassword || selectedDocId === null) return;
    const doc = docs.find((d) => d.id === selectedDocId);
    if (!doc?.encrypted) return;

    try {
      setCryptoStatus("⏳ A desencriptar…");
      const plaintext = await decryptText(doc.encrypted, vaultPassword);

      setDocs((prev) =>
        prev.map((d) =>
          d.id === selectedDocId
            ? { ...d, decryptedContent: plaintext }
            : d
        )
      );

      setDecryptedView(plaintext);
      setCryptoStatus("✅ Desencriptação bem-sucedida!");
    } catch {
      setCryptoStatus("❌ Senha incorreta ou dados corrompidos.");
    }
  }

  function suggestPassword() {
    setVaultPassword(generateSecurePassword());
  }

  return (
    <>
      {/* Header */}
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1>🔐 Vault Digital</h1>
          <p>Os teus documentos guardados de forma segura e encriptada com AES-256-GCM.</p>
        </div>
        <button
          className="btn btn--primary"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "✕ Cancelar" : "+ Adicionar Documento"}
        </button>
      </div>

      {/* Crypto availability banner */}
      <div className="card" style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.85rem 1.25rem" }}>
        <span style={{ fontSize: "1.3rem" }}>
          {cryptoReady ? "🛡️" : "⚠️"}
        </span>
        <div>
          <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>
            {cryptoReady
              ? "Web Crypto API disponível — Encriptação AES-256-GCM ativa"
              : "Web Crypto API não disponível neste browser"}
          </span>
          <p style={{ fontSize: "0.78rem", color: "var(--muted)", margin: "0.15rem 0 0" }}>
            {cryptoReady
              ? "PBKDF2 (SHA-256, 100.000 iterações) · AES-256-GCM · IV de 96-bit · Salt de 128-bit"
              : "A encriptação requer um browser moderno com suporte à Web Crypto API."}
          </p>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <p className="card-title">📎 Novo Documento</p>
          <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <div className="form-group" style={{ flex: "2", minWidth: "180px", marginBottom: 0 }}>
                <label className="form-label">Nome do documento</label>
                <input
                  className="form-input"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="ex. Passaporte"
                  required
                />
              </div>
              <div className="form-group" style={{ flex: "1", minWidth: "140px", marginBottom: 0 }}>
                <label className="form-label">Categoria</label>
                <select
                  className="form-input"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  style={{ cursor: "pointer" }}
                >
                  <option>Identidade</option>
                  <option>Imigração</option>
                  <option>Residência</option>
                  <option>Jurídico</option>
                  <option>Saúde</option>
                  <option>Outro</option>
                </select>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Conteúdo (texto a encriptar)</label>
              <textarea
                className="form-input"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Cola aqui o texto do documento, notas ou informações sensíveis…"
                rows={3}
                style={{ resize: "vertical", fontFamily: "inherit" }}
              />
            </div>
            <div>
              <button type="submit" className="btn btn--blue">
                Guardar no Vault
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: "1.25rem" }}>
        <input
          className="form-input"
          style={{ maxWidth: "360px" }}
          placeholder="🔍  Pesquisar documentos…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Documents grid */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "var(--muted)", padding: "3rem" }}>
          Nenhum documento encontrado.
        </div>
      ) : (
        <div className="vault-grid">
          {filtered.map((doc) => (
            <div key={doc.id} className="vault-item">
              <div className="vault-item-icon">{doc.icon}</div>
              <div className="vault-item-name">{doc.name}</div>
              <div className="vault-item-meta">{doc.type} · {doc.size}</div>
              {doc.expires && (
                <div className="vault-item-meta">Validade: {doc.expires}</div>
              )}
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem", flexWrap: "wrap" }}>
                <span className={`badge ${STATUS_BADGE[doc.status]}`}>
                  {STATUS_LABELS[doc.status]}
                </span>
                {doc.encrypted && (
                  <span className="badge badge--blue">🔐 AES-256</span>
                )}
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem", flexWrap: "wrap" }}>
                {/* Encrypt button */}
                {cryptoReady && !doc.encrypted && (
                  <button
                    className="btn btn--blue"
                    style={{ fontSize: "0.75rem", padding: "0.3rem 0.7rem" }}
                    onClick={() => openEncryptModal(doc.id)}
                  >
                    🔒 Encriptar
                  </button>
                )}
                {/* Decrypt button */}
                {cryptoReady && doc.encrypted && (
                  <button
                    className="btn btn--green"
                    style={{ fontSize: "0.75rem", padding: "0.3rem 0.7rem" }}
                    onClick={() => openDecryptModal(doc.id)}
                  >
                    🔓 Desencriptar
                  </button>
                )}
                {/* Delete */}
                <button
                  className="btn btn--outline"
                  style={{ fontSize: "0.75rem", padding: "0.3rem 0.7rem", color: "var(--accent)" }}
                  onClick={() => handleDelete(doc.id)}
                >
                  🗑
                </button>
              </div>
              {/* Show encrypted payload preview */}
              {doc.encrypted && (
                <div style={{ marginTop: "0.5rem", padding: "0.5rem", background: "var(--bg-soft)", borderRadius: "0.3rem", fontSize: "0.68rem", color: "var(--muted)", wordBreak: "break-all", maxHeight: "48px", overflow: "hidden" }}>
                  <strong>Ciphertext:</strong> {doc.encrypted.ciphertext.slice(0, 60)}…
                </div>
              )}
              {/* Show decrypted content if available */}
              {doc.decryptedContent && doc.encrypted && (
                <div style={{ marginTop: "0.4rem", padding: "0.5rem", background: "var(--green-soft)", borderRadius: "0.3rem", fontSize: "0.8rem", color: "var(--green)" }}>
                  ✅ {doc.decryptedContent}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info card */}
      <div className="card" style={{ marginTop: "1.25rem" }}>
        <p className="card-title">🛡️ Segurança do Vault — Encriptação Real AES-256-GCM</p>
        <div style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: "1.7" }}>
          <p>Este vault utiliza <strong style={{ color: "var(--text)" }}>encriptação AES-256-GCM real</strong> via Web Crypto API — o mesmo padrão usado por governos e forças militares.</p>
          <ul style={{ marginTop: "0.5rem", paddingLeft: "1.2rem" }}>
            <li><strong>PBKDF2</strong> — Derivação de chave com SHA-256 e 100.000 iterações</li>
            <li><strong>AES-256-GCM</strong> — Encriptação autenticada com chave de 256 bits</li>
            <li><strong>IV único</strong> — Cada documento tem o seu próprio vetor de inicialização</li>
            <li><strong>Salt aleatório</strong> — Proteção contra ataques de rainbow table</li>
            <li><strong>Zero knowledge</strong> — O servidor nunca vê os dados em texto claro</li>
          </ul>
        </div>
      </div>

      {/* ── Password Modal ── */}
      {showPassModal && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => setShowPassModal(false)}
        >
          <div
            style={{
              background: "#fff", borderRadius: "1.2rem",
              padding: "2rem", maxWidth: "440px", width: "100%",
              boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: "0.25rem" }}>
              {passModalMode === "encrypt" ? "🔒 Encriptar Documento" : "🔓 Desencriptar Documento"}
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "1.25rem" }}>
              {passModalMode === "encrypt"
                ? "Define uma senha para encriptar este documento. Guarda-a em local seguro — sem ela, os dados não são recuperáveis."
                : "Introduz a senha usada para encriptar este documento."}
            </p>

            <div className="form-group">
              <label className="form-label">Senha do Vault</label>
              <input
                className="form-input"
                type="password"
                value={vaultPassword}
                onChange={(e) => setVaultPassword(e.target.value)}
                placeholder="Introduz a tua senha segura…"
                autoFocus
              />
            </div>

            {passModalMode === "encrypt" && (
              <button
                type="button"
                className="btn btn--outline"
                style={{ fontSize: "0.78rem", marginBottom: "1rem" }}
                onClick={suggestPassword}
              >
                🎲 Gerar senha segura
              </button>
            )}

            {vaultPassword && passModalMode === "encrypt" && (
              <div style={{ margin: "0 0 1rem", padding: "0.5rem 0.7rem", background: "var(--bg-soft)", borderRadius: "0.3rem", fontSize: "0.75rem", wordBreak: "break-all", fontFamily: "monospace" }}>
                {vaultPassword}
              </div>
            )}

            {cryptoStatus && (
              <div style={{ margin: "0 0 1rem", fontSize: "0.85rem", fontWeight: 600, color: cryptoStatus.startsWith("✅") ? "var(--green)" : cryptoStatus.startsWith("❌") ? "var(--accent)" : "var(--blue)" }}>
                {cryptoStatus}
              </div>
            )}

            {decryptedView && (
              <div style={{ margin: "0 0 1rem", padding: "0.75rem", background: "var(--green-soft)", borderRadius: "0.5rem", fontSize: "0.875rem", color: "var(--text)" }}>
                <strong>Conteúdo desencriptado:</strong><br />
                {decryptedView}
              </div>
            )}

            <div style={{ display: "flex", gap: "0.6rem", justifyContent: "flex-end" }}>
              <button
                className="btn btn--outline"
                onClick={() => setShowPassModal(false)}
              >
                Cancelar
              </button>
              <button
                className={`btn ${passModalMode === "encrypt" ? "btn--blue" : "btn--green"}`}
                onClick={passModalMode === "encrypt" ? handleEncrypt : handleDecrypt}
                disabled={!vaultPassword}
              >
                {passModalMode === "encrypt" ? "🔒 Encriptar" : "🔓 Desencriptar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
