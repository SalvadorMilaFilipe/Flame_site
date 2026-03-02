// Util: formatar hora legível
function formatTime(date = new Date()) {
  return date.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// Estado simples da app
const state = {
  connected: false,
  lastSync: null,
  panicActive: false,
};

// Elementos principais
const panicButton = document.getElementById("panicButton");
const panicStatus = document.getElementById("panicStatus");
const connectionStatus = document.getElementById("connectionStatus");
const lastSync = document.getElementById("lastSync");
const locationText = document.getElementById("locationText");
const yearSpan = document.getElementById("year");
const messagesEl = document.getElementById("messages");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");

if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// ============================
// Simulação de ligação em tempo real
// ============================

// Aqui poderias trocar por WebSocket/SSE real (ex: ws://teu-servidor/realtime)
function simulateRealtimeConnection() {
  // Simula 1) tentativa de conectar e 2) heartbeats periódicos
  setTimeout(() => {
    state.connected = true;
    state.lastSync = new Date();
    updateConnectionUI();
    appendSystemMessage(
      "Ligado ao canal seguro F.L.A.M.E (simulação). Integração real pode usar WebSockets ou SSE."
    );
  }, 800);

  // "Heartbeats" a cada 7s (para mostrar que está vivo)
  setInterval(() => {
    if (!state.connected) return;
    state.lastSync = new Date();
    updateConnectionUI();
  }, 7000);
}

function updateConnectionUI() {
  if (!connectionStatus || !lastSync) return;

  if (state.connected) {
    connectionStatus.textContent = "Online e seguro";
    connectionStatus.classList.remove("status-pill--offline");
    connectionStatus.classList.add("status-pill--online");
  } else {
    connectionStatus.textContent = "Offline";
    connectionStatus.classList.remove("status-pill--online");
    connectionStatus.classList.add("status-pill--offline");
  }

  if (state.lastSync) {
    lastSync.textContent = `Última sincronização: ${formatTime(state.lastSync)}`;
  } else {
    lastSync.textContent = "Última sincronização: —";
  }
}

// ============================
// Localização aproximada
// ============================

function initGeolocation() {
  if (!navigator.geolocation || !locationText) {
    if (locationText) {
      locationText.textContent = "Geolocalização não suportada neste dispositivo.";
    }
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      locationText.textContent = `Lat: ${latitude.toFixed(
        4
      )}, Lng: ${longitude.toFixed(4)} (±${Math.round(accuracy)}m)`;
    },
    () => {
      locationText.textContent =
        "Não foi possível obter a localização (permite o acesso à localização).";
    },
    {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 10000,
    }
  );
}

// ============================
// Botão de pânico (pressão longa)
// ============================

let panicPressTimeout = null;
const PANIC_HOLD_MS = 2000; // 2s de pressão para evitar toques acidentais

function startPanicPress() {
  if (!panicButton || !panicStatus) return;
  panicButton.classList.add("pressed");
  panicStatus.textContent = "A manter pressionado… (continua para enviar alerta)";
  panicStatus.classList.remove("panic-status--sent");
  panicStatus.classList.add("panic-status--active");

  panicPressTimeout = setTimeout(() => {
    triggerPanicAlert();
  }, PANIC_HOLD_MS);
}

function cancelPanicPress() {
  if (!panicButton || !panicStatus) return;
  panicButton.classList.remove("pressed");

  if (!state.panicActive) {
    panicStatus.textContent = "Pronto para emergências.";
    panicStatus.classList.remove("panic-status--active", "panic-status--sent");
  }

  if (panicPressTimeout) {
    clearTimeout(panicPressTimeout);
    panicPressTimeout = null;
  }
}

function triggerPanicAlert() {
  state.panicActive = true;
  panicButton.classList.remove("pressed");
  panicStatus.textContent =
    "Alerta de emergência enviado (simulação). A equipa F.L.A.M.E será notificada.";
  panicStatus.classList.remove("panic-status--active");
  panicStatus.classList.add("panic-status--sent");

  appendSystemMessage(
    "ALERTA DE PÂNICO: o utilizador acionou o botão de emergência. Integração com backend deve criar um incidente em tempo real."
  );

  // Exemplo: chamada real a um endpoint do teu servidor PHP ou Node:
  // fetch('/api/emergency.php', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ triggered_at: new Date().toISOString() })
  // });

  setTimeout(() => {
    state.panicActive = false;
    if (panicStatus) {
      panicStatus.textContent = "Equipa notificada. Mantém-te seguro e disponível.";
    }
  }, 5000);
}

if (panicButton) {
  panicButton.addEventListener("mousedown", startPanicPress);
  panicButton.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startPanicPress();
  });

  ["mouseup", "mouseleave"].forEach((evt) =>
    panicButton.addEventListener(evt, cancelPanicPress)
  );
  panicButton.addEventListener("touchend", (e) => {
    e.preventDefault();
    cancelPanicPress();
  });
}

// ============================
// Painel de mensagens em tempo real (simulado)
// ============================

function appendMessage({ text, from = "me", at = new Date() }) {
  if (!messagesEl) return;
  const wrapper = document.createElement("div");
  wrapper.className =
    "message " +
    (from === "system"
      ? "message--system"
      : from === "me"
        ? "message--me"
        : "");

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.textContent = text;

  const meta = document.createElement("div");
  meta.className = "message-meta";
  meta.textContent =
    from === "system"
      ? formatTime(at)
      : from === "me"
        ? `Tu • ${formatTime(at)}`
        : `Equipa F.L.A.M.E • ${formatTime(at)}`;

  wrapper.appendChild(bubble);
  wrapper.appendChild(meta);
  messagesEl.appendChild(wrapper);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function appendSystemMessage(text) {
  appendMessage({ text, from: "system" });
}

if (messageForm && messageInput) {
  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = messageInput.value.trim();
    if (!value) return;
    appendMessage({ text: value, from: "me" });
    messageInput.value = "";

    // Simula resposta automática da equipa após 1.3s
    setTimeout(() => {
      appendMessage({
        text: "Recebemos a tua mensagem. Esta é uma resposta de demonstração (o servidor em tempo real ainda será integrado).",
        from: "flame",
      });
    }, 1300);
  });
}

// ============================
// Boot da app
// ============================

window.addEventListener("load", () => {
  simulateRealtimeConnection();
  initGeolocation();
  appendSystemMessage(
    "Bem-vindo à F.L.A.M.E. Esta interface HTML/CSS/JS é uma demo pronta para ser ligada a um backend em tempo real."
  );
});

