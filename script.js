const menuButton = document.querySelector('[data-menu-button]');
const menu = document.querySelector('[data-menu]');

if (menuButton && menu) {
  menuButton.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
}

// catalogo-auto-link: mantém o catálogo acessível em todas as páginas institucionais.
const mainNav = document.querySelector('.main-nav');
if (mainNav && !mainNav.querySelector('a[href*="catalogo/"]')) {
  const formacoesLink = [...mainNav.querySelectorAll('a')].find(a => a.getAttribute('href')?.includes('formacoes/'));
  if (formacoesLink) {
    const catalogLink = document.createElement('a');
    const isInternalPage = formacoesLink.getAttribute('href').startsWith('../');
    catalogLink.href = isInternalPage ? '../catalogo/' : './catalogo/';
    catalogLink.textContent = 'Catálogo';
    formacoesLink.insertAdjacentElement('afterend', catalogLink);
  }
}

// Rodapé institucional padronizado: aproxima o GEB Educação da experiência visual do GEB Inclusão,
// mantendo a autonomia do braço e sem inserir Mapa do Site no menu principal.
(function standardizeGebEducacaoFooter() {
  const footer = document.querySelector('.site-footer');
  if (!footer) return;

  if (!document.getElementById('geb-footer-standard-style')) {
    const style = document.createElement('style');
    style.id = 'geb-footer-standard-style';
    style.textContent = `
      .site-footer {
        background: #0c0d0f;
        color: #ffffff;
        border-top: 4px solid var(--gold, #c5a15a);
        padding: clamp(72px, 9vw, 108px) 0 26px;
      }
      .site-footer .footer-grid {
        display: grid;
        grid-template-columns: minmax(260px, 1.45fr) repeat(3, minmax(180px, .85fr));
        gap: clamp(34px, 6vw, 78px);
        align-items: start;
      }
      .site-footer .footer-brand-logo {
        width: clamp(175px, 16vw, 238px);
        margin: 0 0 28px;
      }
      .site-footer .footer-grid p {
        max-width: 420px;
        margin: 0;
        color: rgba(255,255,255,.74);
        font-size: 1rem;
        line-height: 1.75;
      }
      .site-footer .footer-title {
        margin: 0 0 26px !important;
        color: var(--gold, #c5a15a) !important;
        text-transform: uppercase;
        letter-spacing: .18em;
        font: 800 .74rem/1.2 "Inter", Arial, sans-serif;
      }
      .site-footer .footer-grid a,
      .site-footer .footer-grid address {
        display: block;
        margin: 0 0 16px;
        color: rgba(255,255,255,.92);
        text-decoration: none;
        font-style: normal;
        font-size: .98rem;
        line-height: 1.55;
      }
      .site-footer .footer-grid a:hover,
      .site-footer .footer-grid a:focus {
        color: var(--gold, #c5a15a);
        text-decoration: underline;
        text-underline-offset: 5px;
      }
      .site-footer address strong {
        display: block;
        margin: 28px 0 8px;
        color: var(--gold, #c5a15a);
        text-transform: uppercase;
        letter-spacing: .12em;
        font-size: .72rem;
      }
      .footer-back-top {
        display: inline-block !important;
        margin-top: 34px !important;
        padding-bottom: 6px;
        border-bottom: 1px solid rgba(255,255,255,.68);
        color: #fff !important;
        text-transform: uppercase;
        letter-spacing: .04em;
        font-weight: 800;
        font-size: .78rem !important;
      }
      .site-footer .footer-bottom {
        border-top: 1px solid rgba(255,255,255,.12);
        margin-top: clamp(56px, 7vw, 86px);
        padding-top: 24px;
        display: flex;
        justify-content: space-between;
        gap: 22px;
        color: rgba(255,255,255,.62);
        font-size: .82rem;
      }
      .site-footer .footer-bottom a {
        color: #fff;
        font-weight: 700;
        text-decoration: none;
      }
      .site-footer .footer-bottom a:hover,
      .site-footer .footer-bottom a:focus {
        color: var(--gold, #c5a15a);
        text-decoration: underline;
        text-underline-offset: 4px;
      }
      @media (max-width: 980px) {
        .site-footer .footer-grid { grid-template-columns: 1fr 1fr; }
      }
      @media (max-width: 620px) {
        .site-footer { padding-top: 62px; }
        .site-footer .footer-grid { grid-template-columns: 1fr; gap: 36px; }
        .site-footer .footer-bottom { flex-direction: column; }
      }
    `;
    document.head.appendChild(style);
  }

  footer.innerHTML = `
    <div class="container footer-grid">
      <div>
        <a class="brand brand-logo footer-brand-logo" href="/" aria-label="GEB Educação - início">
          <img src="/assets/geb-educacao-logo.webp" alt="GEB Educação">
        </a>
        <p>Formação profissional, técnica e acadêmica para diferentes momentos da sua trajetória.</p>
        <a class="footer-back-top" href="#topo" data-footer-top>Voltar ao topo ↑</a>
      </div>
      <div>
        <p class="footer-title">GEB Educação</p>
        <a href="/formacoes/">Mapa de formações</a>
        <a href="/catalogo/">Catálogo</a>
        <a href="https://educacao.grupoeduardabispo.com.br/" target="_blank" rel="noopener">Profissionalizantes ↗</a>
        <a href="/tecnicos/">Técnicos</a>
        <a href="/pos-mba/">Pós e MBA</a>
        <a href="/bolsas/">Bolsas</a>
      </div>
      <div>
        <p class="footer-title">Conexões</p>
        <a href="/instituicoes/">Instituições</a>
        <a href="/apoio/">Apoio ao aluno</a>
        <a href="/polo/">Unidade Trindade/GO</a>
        <a href="/sobre/">Sobre o GEB Educação</a>
        <a href="/mapa-do-site/">Mapa do site</a>
        <a href="https://grupoeduardabispo.com.br/" target="_blank" rel="noopener">GEB Institucional ↗</a>
      </div>
      <div>
        <p class="footer-title">Atendimento</p>
        <a href="https://wa.me/5562992053534" target="_blank" rel="noopener">(62) 99205-3534</a>
        <a href="mailto:educacao@grupoeduardabispo.com.br">educacao@grupoeduardabispo.com.br</a>
        <a href="https://www.instagram.com/educacaoeadbrasil/" target="_blank" rel="noopener">@educacaoeadbrasil ↗</a>
        <a href="https://grupoeduardabispo.blogspot.com/" target="_blank" rel="noopener">Blog GEB ↗</a>
        <address><strong>Unidade Trindade/GO</strong>Av. Serra Morena, 254<br>Solar Embaúba — Trindade/GO</address>
      </div>
    </div>
    <div class="container footer-bottom">
      <span>© 2026 GEB Educação. Todos os direitos reservados.</span>
      <span>Desenvolvido por <a href="https://compassrosesystems.com.br/" target="_blank" rel="noopener">Compass Rose Systems · GEB Tecnologia</a></span>
    </div>
  `;

  const body = document.body;
  if (body && !body.id) body.id = 'topo';

  footer.querySelector('[data-footer-top]')?.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
