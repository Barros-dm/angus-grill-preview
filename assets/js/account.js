const CUSTOMER_ORDER_STORAGE_KEY = "angus_grill_order_history";

const accountState = {
  session: null,
  localOrders: [],
  supabaseOrders: [],
  passwordRecovery: isPasswordRecoveryRoute()
};

const accountElements = {
  status: document.getElementById("accountStatus"),
  loginForm: document.getElementById("customerLoginForm"),
  resendConfirmation: document.getElementById("resendConfirmation"),
  forgotPasswordForm: document.getElementById("forgotPasswordForm"),
  passwordResetForm: document.getElementById("passwordResetForm"),
  passwordResetCard: document.getElementById("passwordResetCard"),
  registerForm: document.getElementById("customerRegisterForm"),
  authCard: document.getElementById("customerAuthCard"),
  registerCard: document.getElementById("customerRegisterCard"),
  logout: document.getElementById("customerLogout"),
  history: document.getElementById("accountHistory"),
  intro: document.getElementById("accountIntro"),
  orders: document.getElementById("customerOrders")
};

const accountMode = document.body?.dataset.accountMode || "login";
const ACCOUNT_PRODUCTION_ORIGIN = "https://angusgrill.co.uk";

function accountRedirectUrl(path = "account.html") {
  const isLocal = window.location.protocol === "file:" || ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const origin = isLocal ? ACCOUNT_PRODUCTION_ORIGIN : window.location.origin;
  const normalizedPath = path.includes(".") ? path : `${path}.html`;
  return `${origin}/${normalizedPath}`;
}

function isPasswordRecoveryRoute() {
  const queryType = new URLSearchParams(window.location.search).get("type");
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return queryType === "recovery" || hashParams.get("type") === "recovery";
}

function passwordPairFromForm(form) {
  const formData = new FormData(form);
  return {
    password: String(formData.get("password") || ""),
    passwordConfirm: String(formData.get("passwordConfirm") || "")
  };
}

function validatePasswordPair(password, passwordConfirm) {
  if (password.length < 6) return "A senha precisa ter pelo menos 6 caracteres.";
  if (password !== passwordConfirm) return "As senhas não coincidem. Confira e tente novamente.";
  return "";
}

function accountMoney(value) {
  if (value === null || value === undefined || value === "") return "A confirmar";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(value || 0));
}

function setAccountStatus(message, tone = "info") {
  if (!accountElements.status) return;
  accountElements.status.textContent = message;
  accountElements.status.dataset.tone = tone;
  accountElements.status.hidden = !message;
}

function escapeAccountHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadLocalOrders() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOMER_ORDER_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function orderDateLabel(value) {
  if (!value) return "Data não registrada";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function normalizeSupabaseOrder(row) {
  return {
    reference: row.order_reference || row.id,
    status: row.status || "pending_whatsapp_confirmation",
    createdAt: row.created_at,
    total: row.total_estimate,
    deliveryFee: row.delivery_fee,
    fulfilmentType: row.fulfilment_type,
    items: Array.isArray(row.items_snapshot) ? row.items_snapshot : []
  };
}

function normalizeLocalOrder(order) {
  return {
    reference: order.orderReference || order.id,
    status: order.status || "pending_whatsapp_confirmation",
    createdAt: order.createdAt,
    total: order.totalEstimate,
    deliveryFee: order.deliveryFee,
    fulfilmentType: order.fulfilmentType,
    items: Array.isArray(order.items) ? order.items : [],
    localOnly: true
  };
}

function statusLabel(status) {
  const labels = {
    pending_whatsapp_confirmation: "Aguardando confirmação no WhatsApp",
    confirmed: "Confirmado",
    preparing: "Em preparo",
    ready: "Pronto",
    completed: "Concluído",
    cancelled: "Cancelado"
  };
  return labels[status] || status || "A confirmar";
}

function friendlyAuthMessage(message = "") {
  const text = String(message || "");
  const lower = text.toLowerCase();
  if (lower.includes("email not confirmed")) return "Confirme o e-mail antes de fazer login.";
  if (lower.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (lower.includes("user already registered")) return "Este e-mail já tem uma conta. Use o login.";
  if (lower.includes("password should be at least")) return "A senha precisa ter pelo menos 6 caracteres.";
  if (lower.includes("http 504") || lower.includes("gateway timeout") || lower.includes("timeout")) {
    return "O servidor de e-mail demorou a responder. Revise as configurações SMTP e tente novamente.";
  }
  return text || "Não foi possível completar esta ação.";
}

function isExistingSignupResponse(data) {
  // Supabase can return a user-shaped response for an existing address when
  // email confirmation is enabled, so the registration state remains private.
  return Array.isArray(data?.user?.identities) && data.user.identities.length === 0;
}

function renderOrders() {
  if (!accountElements.orders) return;
  const orders = [
    ...accountState.supabaseOrders.map(normalizeSupabaseOrder),
    ...accountState.localOrders.map(normalizeLocalOrder)
  ];

  if (!orders.length) {
    accountElements.orders.innerHTML = `
      <article class="account-empty">
        <h3>Nenhum pedido encontrado</h3>
        <p>Quando o cliente finalizar pedidos com a conta ativa, o histórico aparecerá aqui.</p>
        <a class="primary-button" href="index.html#produtos">Comprar agora</a>
      </article>
    `;
    return;
  }

  accountElements.orders.innerHTML = orders.map((order) => `
    <article class="order-history-card">
      <div>
        <span class="eyebrow">${order.localOnly ? "Rascunho local" : "Pedido"}</span>
        <h3>${escapeAccountHtml(order.reference || "Sem referência")}</h3>
        <p>${orderDateLabel(order.createdAt)}</p>
      </div>
      <div>
        <strong>${accountMoney(order.total)}</strong>
        <span>${statusLabel(order.status)}</span>
      </div>
      <ul>
        ${order.items.slice(0, 4).map((item) => `
          <li>
            <span>${escapeAccountHtml(item.productName || item.name || "Produto")}</span>
            <em>${escapeAccountHtml(item.quantityLabel || item.optionLabel || item.unit || "")}</em>
          </li>
        `).join("")}
      </ul>
      ${order.items.length > 4 ? `<p class="account-muted">+${order.items.length - 4} produto(s)</p>` : ""}
    </article>
  `).join("");
}

async function loadSupabaseOrders() {
  const client = angusSupabase();
  if (!client || !accountState.session) return [];
  const { data, error } = await client
    .from("orders")
    .select("*")
    .eq("customer_user_id", accountState.session.user.id)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw error;
  return data || [];
}

function renderAuthState() {
  const isRecovery = accountState.passwordRecovery || isPasswordRecoveryRoute();
  const signedIn = Boolean(accountState.session) && !isRecovery;
  if (accountElements.authCard) accountElements.authCard.hidden = signedIn || isRecovery;
  if (accountElements.passwordResetCard) accountElements.passwordResetCard.hidden = !isRecovery;
  if (accountElements.registerCard) accountElements.registerCard.hidden = signedIn;
  if (accountElements.logout) accountElements.logout.hidden = !signedIn;
  if (accountElements.history) accountElements.history.hidden = !signedIn;
  if (accountElements.intro) {
    accountElements.intro.textContent = signedIn
      ? `Pedidos salvos para ${accountState.session.user.email}.`
      : "Pedidos salvos na sua conta aparecerão aqui.";
  }
}

async function refreshAccount() {
  accountState.localOrders = loadLocalOrders();
  const client = angusSupabase();

  if (!client) {
    renderAuthState();
    accountState.supabaseOrders = [];
    renderOrders();
    setAccountStatus("");
    return;
  }

  const { data } = await client.auth.getSession();
  accountState.session = data.session?.user?.is_anonymous ? null : data.session;

  if (accountState.session && accountMode === "register") {
    window.location.href = "account.html";
    return;
  }

  renderAuthState();

  const isRecovery = accountState.passwordRecovery || isPasswordRecoveryRoute();

  if (!accountState.session && !isRecovery) {
    accountState.supabaseOrders = [];
    if (accountElements.orders) accountElements.orders.innerHTML = "";
    setAccountStatus("");
    return;
  }

  if (isRecovery) {
    accountState.supabaseOrders = [];
    if (accountElements.orders) accountElements.orders.innerHTML = "";
    setAccountStatus("Digite sua nova senha para concluir a recuperação.", "info");
    return;
  }

  try {
    accountState.supabaseOrders = await loadSupabaseOrders();
    renderOrders();
    setAccountStatus("");
  } catch (error) {
    accountState.supabaseOrders = [];
    renderOrders();
    setAccountStatus(error.message || "Não foi possível carregar pedidos.", "error");
  }
}

function setupAccountEvents() {
  if (accountElements.loginForm) {
    accountElements.loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const client = angusSupabase();
      if (!client) {
        setAccountStatus("Login online ainda não está ativo. Tente novamente mais tarde.", "warning");
        return;
      }
      const formData = new FormData(accountElements.loginForm);
      setAccountStatus("Entrando...", "info");
      const { data, error } = await client.auth.signInWithPassword({
        email: String(formData.get("email") || ""),
        password: String(formData.get("password") || "")
      });
      if (error) {
        setAccountStatus(friendlyAuthMessage(error.message), "error");
        return;
      }
      accountState.session = data.session;
      accountElements.loginForm.reset();
      await refreshAccount();
      setAccountStatus("Login efetuado com sucesso.", "success");
    });
  }

  if (accountElements.resendConfirmation) {
    accountElements.resendConfirmation.addEventListener("click", async () => {
      const client = angusSupabase();
      const email = String(accountElements.loginForm?.elements.email?.value || "").trim();
      if (!client) {
        setAccountStatus("Confirmação de e-mail ainda não está ativa. Tente novamente mais tarde.", "warning");
        return;
      }
      if (!email) {
        setAccountStatus("Digite o e-mail da conta para reenviar a confirmação.", "warning");
        accountElements.loginForm?.elements.email?.focus();
        return;
      }
      accountElements.resendConfirmation.disabled = true;
      setAccountStatus("Reenviando e-mail de confirmação...", "info");
      const { error } = await client.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: accountRedirectUrl("account") }
      });
      accountElements.resendConfirmation.disabled = false;
      if (error) {
        setAccountStatus(friendlyAuthMessage(error.message), "error");
        return;
      }
      setAccountStatus("Solicitação de confirmação enviada. Verifique a caixa de entrada e o spam.", "success");
    });
  }

  if (accountElements.forgotPasswordForm) {
    accountElements.forgotPasswordForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const client = angusSupabase();
      if (!client) {
        setAccountStatus("Recuperação de senha ainda não está ativa. Tente novamente mais tarde.", "warning");
        return;
      }
      const formData = new FormData(accountElements.forgotPasswordForm);
      const email = String(formData.get("email") || "").trim();
      if (!email) {
        setAccountStatus("Digite seu e-mail para receber o link de recuperação.", "warning");
        return;
      }
      const submitButton = accountElements.forgotPasswordForm.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = true;
      setAccountStatus("Enviando link de recuperação...", "info");
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: accountRedirectUrl("account")
      });
      if (submitButton) submitButton.disabled = false;
      if (error) {
        setAccountStatus(friendlyAuthMessage(error.message), "error");
        return;
      }
      accountElements.forgotPasswordForm.reset();
      const recoveryTitle = document.getElementById("forgotPasswordTitle");
      const recoveryHelp = document.getElementById("forgotPasswordHelp");
      if (recoveryTitle) recoveryTitle.textContent = "E-mail enviado";
      if (recoveryHelp) recoveryHelp.textContent = "Verifique sua caixa de entrada e spam para abrir o link de recuperação de senha.";
      if (submitButton) {
        submitButton.textContent = "E-mail enviado";
        submitButton.disabled = true;
      }
      setAccountStatus("E-mail enviado. Verifique sua caixa de entrada.", "success");
    });
  }

  if (accountElements.passwordResetForm) {
    accountElements.passwordResetForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const client = angusSupabase();
      if (!client) {
        setAccountStatus("Atualização de senha ainda não está ativa. Tente novamente mais tarde.", "warning");
        return;
      }
      const { password, passwordConfirm } = passwordPairFromForm(accountElements.passwordResetForm);
      const validationMessage = validatePasswordPair(password, passwordConfirm);
      if (validationMessage) {
        setAccountStatus(validationMessage, "error");
        return;
      }
      const submitButton = accountElements.passwordResetForm.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = true;
      setAccountStatus("Atualizando senha...", "info");
      const { error } = await client.auth.updateUser({ password });
      if (submitButton) submitButton.disabled = false;
      if (error) {
        setAccountStatus(friendlyAuthMessage(error.message), "error");
        return;
      }
      accountElements.passwordResetForm.reset();
      accountState.passwordRecovery = false;
      window.history.replaceState({}, "", "account.html");
      setAccountStatus("Senha atualizada com sucesso. Você já pode fazer login.", "success");
      accountState.session = null;
      await client.auth.signOut();
      renderAuthState();
    });
  }

  if (accountElements.registerForm) {
    accountElements.registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const client = angusSupabase();
      if (!client) {
        setAccountStatus("Criação de conta ainda não está ativa. Tente novamente mais tarde.", "warning");
        return;
      }
      const formData = new FormData(accountElements.registerForm);
      const email = String(formData.get("email") || "").trim();
      const { password, passwordConfirm } = passwordPairFromForm(accountElements.registerForm);
      const validationMessage = validatePasswordPair(password, passwordConfirm);
      if (validationMessage) {
        setAccountStatus(validationMessage, "error");
        return;
      }
      setAccountStatus("Criando conta...", "info");
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: accountRedirectUrl("account"),
          data: { name: String(formData.get("name") || "") }
        }
      });
      if (error) {
        setAccountStatus(friendlyAuthMessage(error.message), "error");
        return;
      }

      if (isExistingSignupResponse(data)) {
        setAccountStatus("Este e-mail já possui uma conta. Faça login ou reenvie a confirmação de e-mail.", "warning");
        return;
      }

      if (!data.user) {
        setAccountStatus("Não foi possível criar a conta. Tente novamente.", "error");
        return;
      }

      accountElements.registerForm.reset();
      if (data.session) {
        accountState.session = data.session;
        setAccountStatus("Conta criada com sucesso. Abrindo sua área do cliente...", "success");
        window.setTimeout(() => {
          window.location.href = "account.html";
        }, 500);
        return;
      }
      setAccountStatus("Conta criada com sucesso. Verifique sua caixa de entrada e spam para confirmar seu e-mail e entrar.", "success");
    });
  }

  if (accountElements.logout) {
    accountElements.logout.addEventListener("click", async () => {
      await angusSupabase()?.auth.signOut();
      accountState.session = null;
      await refreshAccount();
    });
  }
}

function subscribeToRecoveryEvents() {
  const client = angusSupabase();
  if (!client) return;

  client.auth.onAuthStateChange((event, session) => {
    if (event !== "PASSWORD_RECOVERY") return;
    accountState.passwordRecovery = true;
    accountState.session = session?.user?.is_anonymous ? null : session;
    renderAuthState();
    setAccountStatus("Digite sua nova senha para concluir a recuperação.", "info");
  });
}

setupAccountEvents();
subscribeToRecoveryEvents();
refreshAccount();
