(() => {
  const rows = (window.GEB_CATALOG || []).map((r, index) => ({
    id: index + 1, name: r[0], level: r[1], institution: r[2], area: r[3],
    workload: r[4], duration: r[5], mode: r[6], channel: r[7], url: r[8]
  }));
  const $ = (s) => document.querySelector(s);
  const search = $('[data-search]'), level = $('[data-level]'), institution = $('[data-institution]'), area = $('[data-area]');
  const results = $('[data-results]'), count = $('[data-count]'), total = $('[data-total]'), empty = $('[data-empty]'), more = $('[data-more]'), clear = $('[data-clear]');
  const PAGE = 24;
  let shown = PAGE;

  const normalize = (v='') => v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const unique = (key) => [...new Set(rows.map(x => x[key]).filter(Boolean))].sort((a,b) => a.localeCompare(b,'pt-BR'));

  function fill(select, values) {
    values.forEach(v => { const o=document.createElement('option'); o.value=v; o.textContent=v; select.appendChild(o); });
  }
  fill(level, unique('level')); fill(institution, unique('institution')); fill(area, unique('area'));
  total.textContent = rows.length.toLocaleString('pt-BR');

  const params = new URLSearchParams(location.search);
  if (params.get('q')) search.value=params.get('q');
  if (params.get('nivel')) level.value=params.get('nivel');
  if (params.get('instituicao')) institution.value=params.get('instituicao');
  if (params.get('area')) area.value=params.get('area');

  function cta(row) {
    if (row.channel === 'eligibility') return 'Verificar elegibilidade';
    if (row.channel === 'bolsa') return 'Consultar bolsa';
    return 'Falar com o GEB';
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

  function card(row) {
    const a=document.createElement('article'); a.className='catalog-card';
    const tags=meta(row).map(x=>'<span>'+escapeHtml(String(x))+'</span>').join('');
    const external=/^https?:/.test(row.url || '');
    a.innerHTML='<div class="catalog-card-top"><p class="catalog-inst">'+escapeHtml(row.institution)+'</p><span class="catalog-id">'+String(row.id).padStart(3,'0')+'</span></div>'+
      '<h2>'+escapeHtml(row.name)+'</h2><div class="catalog-meta">'+tags+'</div>'+
      '<a class="catalog-cta" href="'+escapeAttr(row.url || '#')+'" '+(external?'target="_blank" rel="noopener"':'')+'>'+cta(row)+(external?' ↗':'')+'</a>';
    return a;
  }

  function escapeHtml(v){ const d=document.createElement('div'); d.textContent=v; return d.innerHTML; }
  function escapeAttr(v){ return String(v).replace(/"/g,'&quot;'); }

  function syncUrl() {
    const p=new URLSearchParams();
    if(search.value) p.set('q',search.value);
    if(level.value) p.set('nivel',level.value);
    if(institution.value) p.set('instituicao',institution.value);
    if(area.value) p.set('area',area.value);
    history.replaceState(null,'',location.pathname+(p.toString()?'?'+p.toString():''));
  }

  function render(reset=true) {
    if(reset) shown=PAGE;
    const data=filtered();
    count.textContent=data.length.toLocaleString('pt-BR');
    results.innerHTML='';
    data.slice(0,shown).forEach(r=>results.appendChild(card(r)));
    empty.hidden=data.length!==0;
    more.hidden=data.length<=shown;
    syncUrl();
  }

  [search,level,institution,area].forEach(el => el.addEventListener(el===search?'input':'change',()=>render(true)));
  more.addEventListener('click',()=>{ shown+=PAGE; render(false); });
  clear.addEventListener('click',()=>{ search.value=''; level.value=''; institution.value=''; area.value=''; render(true); });
  render(true);
})();