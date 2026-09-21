(() => {
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
    'Formação comercializada pelo GEB Educação. A instituição responsável é '+row.institution+
    (row.duration ? '. Duração informada: '+row.duration : '')+'.';

  const matrix = matrices[id];
  const matrixEl = document.querySelector('[data-matrix]');
  if (matrix && Array.isArray(matrix.components) && matrix.components.length) {
    const rowsHtml = matrix.components.map(x =>
      '<tr><td>'+escapeHtml(x.name)+'</td><td>'+(x.hours ? escapeHtml(String(x.hours))+'h' : '—')+'</td></tr>'
    ).join('');
    matrixEl.innerHTML =
      '<table class="curriculum-table"><thead><tr><th>Componente curricular</th><th>Carga horária</th></tr></thead><tbody>'+
      rowsHtml+'</tbody></table>';
  } else {
    matrixEl.innerHTML='<div class="course-matrix-empty">Matriz curricular em processamento para publicação nesta página.</div>';
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

  form.addEventListener('submit',()=>{
    status.textContent='Enviando seus dados...';
    form.querySelector('.lead-submit').disabled=true;
  });

  window.addEventListener('message',(event)=>{
    const data=event.data||{};
    if(!data || typeof data!=='object' || !('success' in data)) return;
    form.querySelector('.lead-submit').disabled=false;
    if(!data.success){ status.textContent=data.message||'Não foi possível enviar. Tente novamente.'; return; }
    formView.hidden=true; success.hidden=false;
    if(data.price){
      leadPrice.hidden=false;
      document.querySelector('[data-price-main]').textContent=data.price;
      const details=[data.enrollment?'Matrícula: '+data.enrollment:'',data.installment||''].filter(Boolean);
      document.querySelector('[data-price-detail]').textContent=details.join(' • ');
      document.querySelector('[data-lead-success-text]').textContent='Seus dados foram registrados e a condição comercial foi liberada.';
      document.querySelector('[data-course-price]').hidden=false;
      document.querySelector('[data-card-price]').textContent=data.price;
      document.querySelector('[data-pix-price]').textContent=details.join(' • ');
    } else {
      document.querySelector('[data-lead-success-text]').textContent='Seu interesse foi registrado. O GEB Educação dará continuidade ao atendimento.';
    }
  });

  function escapeHtml(v){
    const d=document.createElement('div'); d.textContent=v; return d.innerHTML;
  }
})();