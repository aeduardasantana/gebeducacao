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


// Logo institucional incorporado: evita falhas de caminho, FTP e cache das imagens.
(function restoreGebEducacaoLogos() {
  const logoData = 'data:image/webp;base64,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';
  document.querySelectorAll('img').forEach((img) => {
    const source = img.getAttribute('src') || '';
    if (/geb-educacao-logo\.webp(?:\?.*)?$/i.test(source)) {
      img.src = logoData;
      img.loading = 'eager';
      img.decoding = 'async';
    }
  });
})();
