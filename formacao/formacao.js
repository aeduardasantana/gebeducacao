(() => {

  const leadEndpoint = [
    'https://script.google.com/macros/s/',
    'AKfycbzsk' +
    'WLTVHtmYe6Ho2ToI6_' +
    'TML9dpofPsDTeXc8QRSq-' +
    'kkCfigIb6tSgewajt-' +
    'Ses4oyNw',
    '/exec'
  ].join('');
  document.querySelectorAll('[data-apps-script-form]').forEach(form => {
    form.action = leadEndpoint;
  });

  const raw = window.GEB_RAW || {};
  const matrices = window.GEB_MATRIZES || {};

  const normalize = (v='') => String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const slugify = (v='') => normalize(v).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,140);

  const rows=[];
  Object.entries(raw).forEach(([institution,data]) => {
    data.forEach((r) => {
      const [name,level,workload,duration]=r;
      rows.push({name,level,institution,workload,duration,mode:'EAD'});
    });
  });

  const params = new URLSearchParams(location.search);
  const id = params.get('id') || '';
  const row = rows.find(r => [r.institution,r.level,r.name].map(slugify).filter(Boolean).join('__') === id);

  if (!row) {
    document.querySelector('[data-course-title]').textContent='Formação não encontrada';
    document.querySelector('[data-course-summary]').textContent='Volte ao catálogo para selecionar uma formação disponível.';
    document.querySelector('.course-layout').innerHTML='<p><a class="button button-dark" href="../catalogo/">Voltar ao catálogo</a></p>';
    return;
  }

  document.title = row.name + ' | GEB Educação';
  document.querySelector('[data-course-title]').textContent=row.name;
  document.querySelector('[data-course-inst]').textContent=row.institution;
  document.querySelector('[data-course-level]').textContent=row.level;
  document.querySelector('[data-course-mode]').textContent=row.mode || 'EAD';
  document.querySelector('[data-course-workload]').textContent=row.workload ? row.workload+'h' : 'Consulte';
  document.querySelector('[data-course-info]').textContent =
    'Formação oferecida por '+row.institution+
    (row.duration ? '. Duração informada: '+row.duration : '')+'.';

  const internationalNotice = document.querySelector('[data-international-notice]');
  const instNorm = normalize(row.institution);
  const levelNorm = normalize(row.level);
  const isEnber = instNorm.includes('enber');
  if (internationalNotice && isEnber && (levelNorm.includes('mestrado') || levelNorm === 'doutorado')) {
    internationalNotice.hidden = false;
    internationalNotice.innerHTML =
      '<div class="academic-notice">'+
      '<p class="eyebrow dark">FORMAÇÃO INTERNACIONAL</p>'+
      '<h2>Curso internacional — ENBER</h2>'+
      '<p>Formação 100% online e em português, oferecida por instituição sediada nos Estados Unidos.</p>'+
      '<p>O diploma é emitido no exterior e <strong>não corresponde a um diploma brasileiro previamente reconhecido pelo MEC</strong>.</p>'+
      '<p>Quando for necessário obter o reconhecimento do diploma estrangeiro no Brasil, o egresso deverá realizar o procedimento de reconhecimento aplicável. A instituição oferece suporte ao aluno nesse processo.</p>'+
      '<p>O reconhecimento não é automático e depende do procedimento e da instituição brasileira competente.</p>'+
      '</div>';
  } else if (internationalNotice && isEnber && levelNorm.includes('pos-doutorado')) {
    internationalNotice.hidden = false;
    internationalNotice.innerHTML =
      '<div class="academic-notice">'+
      '<p class="eyebrow dark">SOBRE O PÓS-DOUTORADO</p>'+
      '<h2>Formação internacional complementar</h2>'+
      '<p>O Pós-Doutorado ENBER é uma formação internacional complementar destinada a pessoas que já concluíram o Doutorado.</p>'+
      '<p>O Pós-Doutorado <strong>não constitui um novo grau acadêmico superior ao Doutorado</strong>. Ao final do programa, a ENBER emite uma <strong>Declaração de Conclusão do Pós-Doutorado</strong>.</p>'+
      '<p>O programa possui duração mínima de 18 meses e é desenvolvido a partir de um plano de trabalho acompanhado por supervisor.</p>'+
      '</div>';
  }

  /*
   * Matrizes curriculares:
   * exibidas somente nas formações do pacote comercial que usam esta página
   * como fonte de detalhamento: Pós/MBA Unicorp, Pós/MBA/Sequencial Realize
   * e Técnico por Competência. As demais formações mantêm suas próprias
   * páginas/fontes de informação.
   */
  const matrix = matrices[id];
  const matrixEl = document.querySelector('[data-matrix]');
  const matrixSection = document.querySelector('[data-matrix-section]');
  const isMatrixEligible =
    (instNorm === 'unicorp' && (levelNorm === 'mba' || levelNorm.includes('pos-graduacao'))) ||
    (instNorm === 'realize' && (levelNorm === 'mba' || levelNorm.includes('pos-graduacao') || levelNorm === 'sequencial')) ||
    levelNorm.includes('tecnico por competencia');

  const hasMatrix =
    isMatrixEligible &&
    matrix &&
    Array.isArray(matrix.components) &&
    matrix.components.length > 0;

  if (matrixSection) matrixSection.hidden = !hasMatrix;

  if (hasMatrix && matrixEl) {
    const rowsHtml = matrix.components.map(x =>
      '<tr><td>'+escapeHtml(x.name)+'</td><td>'+(x.hours ? escapeHtml(String(x.hours))+'h' : '—')+'</td></tr>'
    ).join('');

    const matrixMeta = [
      matrix.mode ? '<span><strong>Modalidade:</strong> '+escapeHtml(matrix.mode)+'</span>' : '',
      matrix.duration ? '<span><strong>Duração:</strong> '+escapeHtml(matrix.duration)+'</span>' : '',
      matrix.workload ? '<span><strong>Carga horária:</strong> '+escapeHtml(String(matrix.workload))+'h</span>' : ''
    ].filter(Boolean).join('');

    matrixEl.innerHTML =
      (matrixMeta ? '<div class="curriculum-meta">'+matrixMeta+'</div>' : '')+
      '<div class="curriculum-table-wrap">'+
      '<table class="curriculum-table"><thead><tr><th>Componente curricular</th><th>Carga horária</th></tr></thead><tbody>'+
      rowsHtml+'</tbody></table></div>';
  }

  const dialog=document.querySelector('[data-lead-dialog]');
  const form=document.querySelector('[data-lead-form]');
  const formView=document.querySelector('[data-lead-form-view]');
  const success=document.querySelector('[data-lead-success]');
  const status=document.querySelector('[data-lead-status]');
  const leadPrice=document.querySelector('[data-lead-price]');

  document.querySelector('[data-open-lead]').addEventListener('click', () => {
    form.reset(); formView.hidden=false; success.hidden=true; leadPrice.hidden=true; status.textContent='';
    document.querySelector('[data-lead-title]').textContent=row.name;
    form.elements.course.value=row.name;
    form.elements.courseId.value=id;
    form.elements.institution.value=row.institution;
    form.elements.level.value=row.level;
    form.elements.pageUrl.value=location.href;
    form.elements.source.value=params.get('utm_source') || 'Site GEB Educação';
    form.elements.campaign.value=params.get('utm_campaign') || '';
    dialog.showModal();
  });

  document.querySelectorAll('[data-lead-close]').forEach(btn=>btn.addEventListener('click',()=>dialog.close()));
  dialog.addEventListener('click',ev=>{ if(ev.target===dialog) dialog.close(); });

  let submitTimeout=null;

  const commercialFor=(institution,level)=>{
    const inst=normalize(institution);
    const lvl=normalize(level);
    if(lvl.includes('tecnico por competencia')) return {requiresEligibility:true};
    if(inst==='unicorp' && lvl.includes('mba')) return {pixMain:'Matrícula de R$ 249,90 + 12x de R$ 129,90 via Pix',pixTotal:'Total no Pix: R$ 1.808,70',cardPrice:'R$ 1.297,00',cardCondition:'em até 12x no cartão'};
    if(inst==='unicorp' && (lvl.includes('pos')||lvl.includes('especializacao'))) return {pixMain:'Matrícula de R$ 249,90 + 12x de R$ 114,90 via Pix',pixTotal:'Total no Pix: R$ 1.628,70',cardPrice:'R$ 1.097,00',cardCondition:'em até 12x no cartão'};
    if(inst==='realize' && lvl.includes('sequencial')) return {pixMain:'3x de R$ 84,90 via Pix',pixTotal:'Total no Pix: R$ 254,70',cardPrice:'R$ 249,90',cardCondition:'em até 12x no cartão'};
    if(inst==='realize' && (lvl.includes('pos')||lvl.includes('especializacao'))) return {pixMain:'Matrícula de R$ 249,90 + 12x de R$ 94,90 via Pix',pixTotal:'Total no Pix: R$ 1.388,70',cardPrice:'R$ 997,00',cardCondition:'em até 12x no cartão'};
    return {};
  };

  const showLeadResult=(data)=>{
    clearTimeout(submitTimeout);
    form.querySelector('.lead-submit').disabled=false;
    formView.hidden=true; success.hidden=false;
    if(data.pixMain){
      leadPrice.hidden=false;
      document.querySelector('[data-price-main]').textContent=data.pixMain;
      document.querySelector('[data-price-detail]').textContent=data.pixTotal || '';
      const cardMain=document.querySelector('[data-card-main]');
      const cardDetail=document.querySelector('[data-card-detail]');
      if(cardMain) cardMain.textContent=data.cardPrice || '';
      if(cardDetail) cardDetail.textContent=data.cardCondition || '';
      document.querySelector('[data-lead-success-text]').textContent='Seus dados foram registrados e o investimento está disponível.';
      const coursePrice=document.querySelector('[data-course-price]');
      coursePrice.hidden=false;
      const pixMain=document.querySelector('[data-pix-main]');
      const pixTotal=document.querySelector('[data-pix-total]');
      const cardPrice=document.querySelector('[data-card-price]');
      const cardCondition=document.querySelector('[data-card-condition]');
      if(pixMain) pixMain.textContent=data.pixMain;
      if(pixTotal) pixTotal.textContent=data.pixTotal || '';
      if(cardPrice) cardPrice.textContent=data.cardPrice || '';
      if(cardCondition) cardCondition.textContent=data.cardCondition || '';
    } else {
      document.querySelector('[data-lead-success-text]').textContent=
        data.requiresEligibility
          ? 'Seu interesse foi registrado. O investimento será apresentado após a verificação de elegibilidade.'
          : 'Seu interesse foi registrado. O GEB Educação dará continuidade ao atendimento.';
    }
  };

  form.addEventListener('submit',()=>{
    status.textContent='Enviando seus dados...';
    const btn=form.querySelector('.lead-submit');
    btn.disabled=true;
    clearTimeout(submitTimeout);
    submitTimeout=setTimeout(()=>{
      // O Apps Script pode concluir o POST sem propagar postMessage pelo iframe.
      // Como o envio é um POST nativo para o Web App, liberamos a condição local
      // após a janela segura de processamento. O backend continua sendo a fonte
      // de e-mail/Contacts; nenhuma informação pessoal é armazenada no GitHub.
      showLeadResult(commercialFor(form.elements.institution.value,form.elements.level.value));
    },9000);
  });

  window.addEventListener('message',(event)=>{
    const data=event.data||{};
    if(!data || typeof data!=='object' || !('success' in data)) return;
    if(!data.success){ clearTimeout(submitTimeout); form.querySelector('.lead-submit').disabled=false; status.textContent=data.message||'Não foi possível enviar. Tente novamente.'; return; }
    showLeadResult(data);
  });

  function escapeHtml(v){
    const d=document.createElement('div'); d.textContent=v; return d.innerHTML;
  }
})();