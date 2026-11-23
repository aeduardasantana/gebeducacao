(() => {
  "use strict";

  // Cole aqui a URL /exec do NOVO Apps Script após a implantação.
  // Não reutilize o endpoint do catálogo: ele tem outro esquema de dados.
  const SCRIPT_URL = ""; // Ex.: https://script.google.com/macros/s/AKfy.../exec
  const WHATSAPP = "5562992053534";
  const form = document.getElementById("lp-lead-form");
  const status = document.getElementById("lp-status");
  const stepLabel = document.getElementById("lp-step-label");
  const stepHeading = document.getElementById("lp-step-heading");
  const stepBars = Array.from(document.querySelectorAll(".lp-step-bars i"));
  const stepNodes = Array.from(document.querySelectorAll(".lp-step"));
  const submitBtn = document.getElementById("lp-submit");
  const success = document.getElementById("lp-success");
  const successProtocol = document.getElementById("lp-success-protocol");
  const whatsappLink = document.getElementById("lp-whatsapp-link");
  const honeypot = document.getElementById("lp-trap");
  let currentStep = 1;
  let sending = false;
  let currentRequestId = "";
  let pollStarted = 0;
  let pollTimer = null;
  let lastProtocol = "";

  function setStatus(message, ok = false) {
    status.textContent = message;
    status.classList.toggle("is-success", ok);
  }

  function setStep(n, moveFocus = true) {
    currentStep = n;
    stepNodes.forEach(node => { node.hidden = Number(node.dataset.step) !== n; });
    stepLabel.textContent = "ETAPA " + n + " DE 2";
    stepHeading.textContent = n === 1 ? "Sua formação" : "Seus dados";
    stepBars.forEach((bar, index) => bar.classList.toggle("is-active", index < n));
    setStatus("");
    if (moveFocus) {
      document.getElementById("consulta").scrollIntoView({behavior:"smooth", block:"start"});
    }
  }

  document.getElementById("lp-add-course").addEventListener("click", () => {
    document.getElementById("lp-extra-course-wrap").hidden = false;
    document.getElementById("lp-add-course").hidden = true;
    form.elements.course2.focus();
  });

  function validateFields(step) {
    const group = document.querySelector('.lp-step[data-step="' + step + '"]');
    const inputs = Array.from(group.querySelectorAll("input, select"))
      .filter(el => el.type !== "checkbox" && el.type !== "hidden" && !el.closest("[hidden]"));
    for (const el of inputs) {
      el.classList.remove("is-invalid");
      if (!el.checkValidity()) {
        el.classList.add("is-invalid");
        el.reportValidity();
        el.focus();
        setStatus("Preencha os campos obrigatórios antes de continuar.");
        return false;
      }
    }
    if (step === 2) {
      const phone = String(form.elements.phone.value).replace(/\D/g, "");
      if (!/^\d{10,11}$/.test(phone)) {
        form.elements.phone.classList.add("is-invalid");
        form.elements.phone.focus();
        setStatus("Informe um WhatsApp brasileiro com DDD válido.");
        return false;
      }
      if (!form.elements.consent.checked) {
        form.elements.consent.focus();
        setStatus("Confirme a autorização para registrar e responder sua solicitação.");
        return false;
      }
    }
    setStatus("");
    return true;
  }

  document.getElementById("lp-next").addEventListener("click", () => {
    if (validateFields(1)) setStep(2);
  });
  document.getElementById("lp-back").addEventListener("click", () => setStep(1));
  form.elements.phone.addEventListener("input", e => {
    const d = e.target.value.replace(/\D/g,"").slice(0,11);
    e.target.value = d.length > 6 ? "(" + d.slice(0,2) + ") " + d.slice(2, d.length === 11 ? 7 : 6) + "-" + d.slice(d.length === 11 ? 7 : 6) : d.length > 2 ? "(" + d.slice(0,2) + ") " + d.slice(2) : d;
  });

  function putHidden(key, value) {
    let input = form.querySelector('input[data-virtual="' + key + '"]');
    if (!input) {
      input = document.createElement("input");
      input.type = "hidden";
      input.dataset.virtual = key;
      input.name = key;
      form.appendChild(input);
    }
    input.value = value || "";
  }

  function makeRequestId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return [...bytes].map(x=>x.toString(16).padStart(2,"0")).join("");
  }

  function buildWhatsAppMessage(protocol) {
    const get = key => String(form.elements[key]?.value || "").trim();
    const course1 = get("course1");
    const course2 = get("course2");
    const fields = [
      "Olá! Solicitei uma consulta de bolsas pelo GEB Educação.",
      "",
      "*Protocolo:* " + protocol,
      "*Nome:* " + get("name"),
      "*WhatsApp:* " + get("phone"),
      "*Cidade/UF:* " + get("city") + "/" + get("state"),
      "*Para quem:* " + get("beneficiary"),
      "*Nível de formação:* " + get("level")
    ];
    if (course1) fields.push("*Curso desejado:* " + course1);
    if (course2) fields.push("*Outra opção:* " + course2);
    if (!course1 && !course2) fields.push("*Curso/área:* Preciso de orientação para escolher");
    fields.push("*Modalidade:* " + get("mode"));
    const wantsScholarship = form.elements.scholarshipConsultation.checked;
    fields.push("*Consulta de bolsas de estudo disponíveis:* " + (wantsScholarship ? "Sim" : "Não selecionada"));
    fields.push("", wantsScholarship
      ? "Gostaria de consultar as bolsas de estudo disponíveis e suas condições. Obrigada!"
      : "Gostaria de receber orientação sobre as formações disponíveis. Obrigada!");
    return fields.join("\n");
  }

  function finish(protocol) {
    if (!sending || !protocol || protocol === lastProtocol) return;
    lastProtocol = protocol;
    sending = false;
    clearTimeout(pollTimer);
    submitBtn.disabled = false;
    const waUrl = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(buildWhatsAppMessage(protocol));
    whatsappLink.href = waUrl;
    successProtocol.textContent = "Protocolo: " + protocol;
    form.hidden = true;
    success.hidden = false;
    setStatus("");
    // Navegação na mesma aba evita bloqueio de pop-ups em celulares.
    window.setTimeout(() => { window.location.assign(waUrl); }, 600);
  }

  // A consulta usa apenas o identificador aleatório. Dados pessoais não vão na URL.
  window.__gebBolsasStatus = response => {
    if (!sending || !response || response.requestId !== currentRequestId) return;
    if (response.success && response.protocol) finish(response.protocol);
  };

  function checkStatus() {
    if (!sending) return;
    if (Date.now() - pollStarted > 30000) {
      sending = false;
      submitBtn.disabled = false;
      setStatus("Não foi possível confirmar o registro. Seus dados continuam preenchidos. Tente novamente.");
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_URL + "?action=status&requestId=" + encodeURIComponent(currentRequestId) +
      "&callback=__gebBolsasStatus&v=" + Date.now();
    script.async = true;
    script.onload = () => { script.remove(); };
    script.onerror = () => { script.remove(); };
    document.body.appendChild(script);
    pollTimer = window.setTimeout(checkStatus, 1800);
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    if (sending) return;
    if (!validateFields(1)) { setStep(1); validateFields(1); return; }
    if (!validateFields(2)) { setStep(2, false); return; }
    if (!SCRIPT_URL.startsWith("https://script.google.com/macros/s/") || !SCRIPT_URL.endsWith("/exec")) {
      setStatus("A consulta está em configuração. O atendimento ainda não foi conectado.");
      return;
    }
    if (!currentRequestId) currentRequestId = makeRequestId();
    const q = new URLSearchParams(window.location.search);
    putHidden("requestId", currentRequestId);
    putHidden("source", "LP Bolsas GEB Educação");
    putHidden("pageUrl", window.location.href.slice(0,600));
    for (const key of ["utm_source","utm_medium","utm_campaign","utm_content","utm_term"]) putHidden(key,q.get(key) || "");
    sending = true;
    submitBtn.disabled = true;
    setStatus("Registrando sua solicitação. Você será encaminhado ao WhatsApp após a confirmação.");
    form.method = "POST";
    form.action = SCRIPT_URL;
    form.target = "lp-submit-frame";
    pollStarted = Date.now();
    HTMLFormElement.prototype.submit.call(form);
    pollTimer = window.setTimeout(checkStatus, 1300);
  });

  if (honeypot) honeypot.setAttribute("aria-hidden","true");
  setStep(1, false);
})();