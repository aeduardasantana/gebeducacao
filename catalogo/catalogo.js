(() => {
  const raw = window.GEB_RAW || {};

  const normalize = (v='') => String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();

  const areaRules = [
    ['Educação', ['educacao','ensino','alfabet','letramento','docencia','pedagog','escolar','libras','psicopedagog','neuroeduc','tutoria','aprendiz','metodolog']],
    ['Saúde', ['saude','enferm','farmac','nutri','fisioter','hospital','clinica','idoso','geront','oncolog','estetica','cosmet','biomed','radiolog','terapia','psicologia','psicanal','neuropsic','autismo','tea','tdah','fonoaudi','musicoterapia','urgencia','emergencia']],
    ['Direito', ['direito','juridic','arbitragem','mediacao','criminolog','seguranca publica','licitac']],
    ['Tecnologia', ['dados','software','mobile','web','rede','servidor','informat','inteligencia artificial','internet das coisas','tecnologia da informacao','comput','programacao','design grafico','seguranca da informacao']],
    ['Engenharia e Indústria', ['engenharia','industrial','automacao','eletro','mecanica','manutencao','soldagem','metalurg','refrigeracao','quimica','qualidade','producao','suprimentos','construcao','edificac','agrimensura','mineracao']],
    ['Gestão e Negócios', ['gestao','administracao','negocio','marketing','vendas','rh','recursos humanos','logistica','empreendedor','financeir','contab','auditoria','controladoria','supply chain','projetos','processos','lideranca','governanca','startup']],
    ['Meio Ambiente e Agro', ['ambient','sustent','agro','agricultura','aquicultura','veterinaria']],
    ['Comunicação, Artes e Cultura', ['comunicacao','oratoria','arte','musica','historia','literatura','redacao','lingua','teologia','filosofia','cultura']],
    ['Serviços', ['turismo','gastronomia','secretariado','transacoes imobiliarias','interiores','transporte','transito']]
  ];

  function detectArea(name) {
    const n = normalize(name);
    for (const [label, keys] of areaRules) if (keys.some(k => n.includes(k))) return label;
    return 'Outros';
  }

  function access(institution, level) {
    if (level === 'Técnico por Competência') {
      return {channel:'eligibility', url:'../tecnico-por-competencia/'};
    }
    if (institution === 'Grupo Nossa Faculdade') {
      if (level === 'Graduação') return {
        channel:'bolsa',
        url:'https://www.bolsamaisbrasil.com.br/geb/bolsas/pesquisa?content_level=5&course=&city=Trindade&state=GO&school=970'
      };
      return {
        channel:'bolsa',
        url:'https://www.bolsamaisbrasil.com.br/geb/bolsas/pesquisa?content_level=7&course=&city=Trindade&state=GO&school=970'
      };
    }
    if (institution === 'Enber') {
      if (level.startsWith('Mestrado')) return {
        channel:'bolsa',
        url:'https://www.bolsamaisbrasil.com.br/geb/bolsas/pesquisa?content_level=31&city=Trindade&state=GO&course=&school=1003&seller_id=2602'
      };
      if (level === 'Doutorado') return {
        channel:'bolsa',
        url:'https://www.bolsamaisbrasil.com.br/geb/bolsas/pesquisa?content_level=32&course=&city=Trindade&state=GO&school=1003'
      };
      if (level === 'Pós-Doutorado') return {
        channel:'bolsa',
        url:'https://www.bolsamaisbrasil.com.br/geb/bolsas/pesquisa?content_level=35&course=&city=Trindade&state=GO&school=1003'
      };
    }
    return {channel:'direct', url:'https://wa.me/5562992053534'};
  }

  const rows = [];
  Object.entries(raw).forEach(([institution, data]) => {
    data.forEach((r) => {
      const [name, level, workload, duration] = r;
      const route = access(institution, level);
      rows.push({
        id: rows.length + 1,
        name, level, institution,
        area: detectArea(name),
        workload, duration,
        mode: (institution === 'Unicorp' || institution === 'Realize') ? 'EAD' : null,
        channel: route.channel,
        url: route.url
      });
    });
  });

  const $ = (s) => document.querySelector(s);
  const search = $('[data-search]');
  const level = $('[data-level]');
  const institution = $('[data-institution]');
  const area = $('[data-area]');
  const results = $('[data-results]');
  const count = $('[data-count]');
  const total = $('[data-total]');
  const empty = $('[data-empty]');
  const more = $('[data-more]');
  const clear = $('[data-clear]');
  const PAGE = 24;
  let shown = PAGE;

  const unique = (key) => [...new Set(rows.map(x => x[key]).filter(Boolean))]
    .sort((a,b) => a.localeCompare(b,'pt-BR'));

  function fill(select, values) {
    values.forEach(v => {
      const o = document.createElement('option');
      o.value = v;
      o.textContent = v;
      select.appendChild(o);
    });
  }

  fill(level, unique('level'));
  fill(institution, unique('institution'));
  fill(area, unique('area'));
  total.textContent = rows.length.toLocaleString('pt-BR');

  const params = new URLSearchParams(location.search);
  if (params.get('q')) search.value = params.get('q');
  if (params.get('nivel')) level.value = params.get('nivel');
  if (params.get('instituicao')) institution.value = params.get('instituicao');
  if (params.get('area')) area.value = params.get('area');

  function cta(row) {
    if (row.channel === 'eligibility') return 'Verificar elegibilidade';
    if (row.channel === 'bolsa') return 'Consultar bolsa';
    return 'Consultar investimento';
  }

  function slugify(v='') {
    return normalize(v).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,140);
  }

  function courseId(row) {
    return [row.institution,row.level,row.name].map(slugify).filter(Boolean).join('__');
  }

  function meta(row) {
    const bits = [row.level, row.institution, row.area];
    if (row.workload) bits.push(row.workload + 'h');
    if (row.duration) bits.push(row.duration);
    if (row.mode) bits.push(row.mode);
    return bits;
  }

  function filtered() {
    const q = normalize(search.value);
    return rows.filter(r => {
      const hay = normalize([r.name,r.level,r.institution,r.area].join(' '));
      return (!q || hay.includes(q)) &&
        (!level.value || r.level === level.value) &&
        (!institution.value || r.institution === institution.value) &&
        (!area.value || r.area === area.value);
    });
  }

  function escapeHtml(v) {
    const d = document.createElement('div');
    d.textContent = v;
    return d.innerHTML;
  }

  function escapeAttr(v) {
    return String(v).replace(/"/g,'&quot;');
  }

  function card(row) {
    const a = document.createElement('article');
    a.className = 'catalog-card';
    const tags = meta(row).map(x => '<span>'+escapeHtml(String(x))+'</span>').join('');
    const external = /^https?:/.test(row.url || '');

    let action;
    if (row.channel === 'bolsa') {
      action = '<a class="catalog-cta" href="'+escapeAttr(row.url || '#')+'" '+(external?'target="_blank" rel="noopener"':'')+'>'+cta(row)+(external?' ↗':'')+'</a>';
    } else {
      action = '<button class="catalog-cta catalog-lead-button" type="button" data-lead-open data-row-id="'+row.id+'">'+cta(row)+'</button>';
    }

    a.innerHTML =
      '<div class="catalog-card-top"><p class="catalog-inst">'+escapeHtml(row.institution)+'</p>'+
      '<span class="catalog-id">'+String(row.id).padStart(3,'0')+'</span></div>'+
      '<h2>'+escapeHtml(row.name)+'</h2>'+
      '<div class="catalog-meta">'+tags+'</div>'+action;
    return a;
  }

  function syncUrl() {
    const p = new URLSearchParams();
    if (search.value) p.set('q',search.value);
    if (level.value) p.set('nivel',level.value);
    if (institution.value) p.set('instituicao',institution.value);
    if (area.value) p.set('area',area.value);
    history.replaceState(null,'',location.pathname+(p.toString()?'?'+p.toString():''));
  }

  function render(reset=true) {
    if (reset) shown = PAGE;
    const data = filtered();
    count.textContent = data.length.toLocaleString('pt-BR');
    results.innerHTML = '';
    data.slice(0,shown).forEach(r => results.appendChild(card(r)));
    empty.hidden = data.length !== 0;
    more.hidden = data.length <= shown;
    syncUrl();
  }

  [search,level,institution,area].forEach(el =>
    el.addEventListener(el===search ? 'input' : 'change', () => render(true))
  );
  more.addEventListener('click', () => { shown += PAGE; render(false); });
  clear.addEventListener('click', () => {
    search.value = '';
    level.value = '';
    institution.value = '';
    area.value = '';
    render(true);
  });

  render(true);

  const dialog = document.querySelector('[data-lead-dialog]');
  const leadForm = document.querySelector('[data-lead-form]');
  const leadFormView = document.querySelector('[data-lead-form-view]');
  const leadSuccess = document.querySelector('[data-lead-success]');
  const leadTitle = document.querySelector('[data-lead-title]');
  const leadIntro = document.querySelector('[data-lead-intro]');
  const leadStatus = document.querySelector('[data-lead-status]');
  const leadPrice = document.querySelector('[data-lead-price]');
  const priceMain = document.querySelector('[data-price-main]');
  const priceDetail = document.querySelector('[data-price-detail]');
  const successText = document.querySelector('[data-lead-success-text]');

  function openLead(row) {
    if (!dialog || !leadForm) return;
    leadForm.reset();
    leadFormView.hidden = false;
    leadSuccess.hidden = true;
    leadPrice.hidden = true;
    leadStatus.textContent = '';

    leadTitle.textContent = row.name;
    leadIntro.textContent = row.channel === 'eligibility'
      ? 'Preencha seus dados para registrar seu interesse e seguir para a verificação de elegibilidade.'
      : 'Preencha seus dados para consultar a condição comercial desta formação.';

    leadForm.elements.course.value = row.name;
    leadForm.elements.courseId.value = courseId(row);
    leadForm.elements.institution.value = row.institution;
    leadForm.elements.level.value = row.level;
    leadForm.elements.pageUrl.value = location.href;

    const params = new URLSearchParams(location.search);
    leadForm.elements.source.value = params.get('utm_source') || 'Site GEB Educação';
    leadForm.elements.campaign.value = params.get('utm_campaign') || '';

    dialog.showModal();
  }

  results.addEventListener('click', (ev) => {
    const button = ev.target.closest('[data-lead-open]');
    if (!button) return;
    const row = rows.find(r => String(r.id) === String(button.dataset.rowId));
    if (row) openLead(row);
  });

  document.querySelectorAll('[data-lead-close]').forEach(btn => {
    btn.addEventListener('click', () => dialog?.close());
  });

  dialog?.addEventListener('click', (ev) => {
    if (ev.target === dialog) dialog.close();
  });

  leadForm?.addEventListener('submit', () => {
    leadStatus.textContent = 'Enviando seus dados...';
    const submit = leadForm.querySelector('.lead-submit');
    if (submit) submit.disabled = true;
  });

  window.addEventListener('message', (event) => {
    const data = event.data || {};
    if (!data || typeof data !== 'object' || !('success' in data)) return;

    const submit = leadForm?.querySelector('.lead-submit');
    if (submit) submit.disabled = false;

    if (!data.success) {
      leadStatus.textContent = data.message || 'Não foi possível enviar. Tente novamente.';
      return;
    }

    leadFormView.hidden = true;
    leadSuccess.hidden = false;

    if (data.price) {
      leadPrice.hidden = false;
      priceMain.textContent = data.price;
      const details = [data.enrollment ? 'Matrícula: '+data.enrollment : '', data.installment || ''].filter(Boolean);
      priceDetail.textContent = details.join(' • ');
      successText.textContent = 'Seus dados foram registrados e a condição comercial foi liberada.';
    } else {
      successText.textContent = 'Seu interesse foi registrado. Continue pelo atendimento do GEB Educação.';
    }
  });
})();