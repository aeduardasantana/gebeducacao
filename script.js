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
