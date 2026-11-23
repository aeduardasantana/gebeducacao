# LP de bolsas — GEB Educação

## Arquitetura

- LP: `/bolsas/consultar/` (sem alterar `/bolsas/`, que mantém finalidade informativa).
- Novo projeto Google Apps Script, independente do endpoint do catálogo.
- Destino: a planilha existente **CRM Central GEB — Cadastro Geral PF e PJ — Estrutura v1.0**, em nova aba isolada **LEADS_BOLSAS_LP**.
- WhatsApp: **+55 62 99205-3534**.
- Registro concluído antes da saída para WhatsApp. A LP faz POST por iframe e consulta o status por ID aleatório, sem enviar dados pessoais pela URL de consulta.

## Preparar Apps Script

1. Abra `https://script.google.com/home/projects/create` na conta que tem permissão de edição no CRM Central GEB.
2. Renomeie para **GEB Educação — LP Bolsas | Captação v1**.
3. No arquivo `Code.gs`, substitua o conteúdo pelo código de `scripts/geb-bolsas-lp.gs` deste repositório.
4. Em **Configurações do projeto → Propriedades do script**, adicione:
   - **Propriedade:** `BOLSAS_SHEET_ID`
   - **Valor:** ID da planilha CRM Central GEB (entre `/d/` e `/edit` no link do Google Sheets).
5. No seletor de funções, execute **configurarBolsas**, autorize o acesso à planilha, e em seguida **verificarBolsas**. Verifique no CRM a nova aba `LEADS_BOLSAS_LP` com os cabeçalhos.
6. Clique em **Implantar → Nova implantação → Aplicativo da Web**.
   - **Executar como:** Eu (proprietário do script).
   - **Quem tem acesso:** Qualquer pessoa.
   - Autorize a implantação e copie a URL terminada em `/exec`.
7. No arquivo `bolsas/consultar/lp.js`, substitua a linha `const SCRIPT_URL = "";` pela URL recebida, entre aspas.
8. Atualize o arquivo no repositório. Só então incorpore a branch ao site publicado.

## Teste obrigatório antes de divulgar

1. Abrir a página em janela anônima, no celular e no computador.
2. Verificar se **Sem preferência** é a primeira modalidade e já aparece selecionada. Indicar curso/área no campo livre (opcional), testar também sem curso, incluir segunda opção quando desejada, **marcar e desmarcar** a opção 'Quero consultar bolsas de estudo disponíveis', preencher cidade/UF e um contato real de teste.
3. Enviar. Verificar se uma linha surgiu em `LEADS_BOLSAS_LP` com o protocolo e todos os campos, incluindo `source` e UTM.
4. Confirmar se o WhatsApp abre **depois** do registro, com protocolo, nome, cidade/UF, nível, curso/área informado quando houver, segunda opção quando houver, modalidade e a marcação de consulta de bolsas.
5. Repetir envio com o mesmo requestId se houver erro de conexão: o script evita linhas duplicadas por ID.
6. Conferir que a planilha privada permanece **não compartilhada publicamente** (somente o Apps Script é público).
7. Verificar os dados de teste e removê-los ao final, se adequado.

## Observações importantes

- Este código ainda não foi implantado no Google Apps Script: copiar, configurar, implantar e testar são passos necessários.
- O Apps Script original do catálogo **não** deve ser substituído ou alterado.
- Esta primeira integração cria apenas uma aba de entrada no arquivo do CRM. **Não escreve automaticamente nas abas PESSOAS, VINCULOS ou CRM_TRIAGEM**; essa transformação exige mapear as regras do CRM vigente.
- O formulário não pergunta se a pessoa é maior de 18 anos.\n- Não há caixa de categorias genéricas nem área obrigatória: o interessado pode escrever livremente o nome do curso ou da área, informar uma segunda preferência ou continuar sem definir um curso.
- A opção `Para meu filho ou dependente` não coleta dados da criança nesta etapa.
- O percentual `até 83%` precisa refletir oportunidades reais e condições auditáveis. A página não garante benefício nem matrícula.
- Se o script falhar, a LP mantém os dados na tela e não redireciona prematuramente ao WhatsApp.
- Não publique a LP com `SCRIPT_URL` vazio.

## Atualização futura do Apps Script

Após modificar o código, use **Implantar → Gerenciar implantações → Editar → Nova versão → Implantar** para atualizar uma implantação existente. Em geral, assim é possível manter a mesma URL do web app.

- A consulta de bolsas agora é uma única caixa de seleção **opcional**. O campo da planilha registra `Sim` quando marcado e `Não` quando desmarcado. Se a planilha já tiver sido preparada com cabeçalhos antigos, confira o nome da coluna correspondente antes de usar a nova versão; não renomeie colunas de produção sem revisão.

## Revisão visual — novembro/2026
- Foto editorial de ambiente de estudo utilizada como referência visual da LP via CDN da Unsplash (imagem ilustrativa, sem vincular pessoas reais a matrícula ou bolsas GEB).
- Ilustração vetorial acadêmica original em `bolsas/consultar/trajetoria-academica.svg`, também usada como fallback caso a foto não carregue.
- Marca oficial segue referenciada por `/assets/geb-educacao-logo.webp`. Se houver falha de carregamento, a página exibe um wordmark tipográfico GEB Educação em vez de um ícone de imagem quebrada.
- O conteúdo WebP retornado na inspeção do repositório apresentou divergência de tamanho no cabeçalho RIFF. Confirmar integridade do arquivo original publicado no navegador. Substituir o arquivo somente após obter uma cópia autêntica e íntegra da marca.
- O banner “Privacidade e medição” visto em uma captura não consta no HTML nem no JavaScript desta LP. Verificar se é injetado pelo ambiente de hospedagem, tag manager, plugin ou camada de preview; não o ocultar por CSS sem revisar os requisitos de consentimento.
- Verificar contraste, foco por teclado, carregamento de foto e SVG e legibilidade do formulário em larguras 360, 390, 768, 1024 e 1440 px antes da publicação.

## Revisão de copy e FAQ — 2026-11-22
- Removido o crédito visível "Foto ilustrativa: Unsplash" do rodapé. A licença Unsplash permite uso comercial sem atribuição obrigatória (https://unsplash.com/license).
- A abertura da LP passou a apresentar de maneira direta as formações ofertadas: EJA, profissionalizantes, técnicos, graduação, pós-graduação, MBA e formação acadêmica internacional.
- O FAQ agora distingue regulação de EJA pelos sistemas de ensino competentes, regularidade de graduações no e-MEC, certificados de cursos livres/qualificação, diplomas técnicos e SISTEC, pós-graduação lato sensu e títulos estrangeiros.
- **Atenção:** antes de publicar alegações específicas sobre cursos/instituições, conferir atos e documentos efetivamente aplicáveis à oferta consultada. Não descrever os cursos internacionais da Enber como diplomas brasileiros já reconhecidos pelo MEC.
- Referências oficiais: https://www.gov.br/mec/pt-br/politica-regulacao-supervisao-educacao-superior/cadastro-nacional-de-cursos-e-ies , https://portal.mec.gov.br/sistec-inicial/ , https://acervoportal.mec.gov.br/cursos-da-ept/formacao-inicial-e-continuada-ou-qualificacao-profissional , https://portaleduca.educacao.go.gov.br/suporte_ti/atos-legais-parametros/ .


## Ajuste de posicionamento — validade da certificação
- Não promover `instituições participantes` como argumento principal da LP nem enfatizar a origem dos certificados no hero ou seção comercial.
- A comunicação central deve responder: qual formação, qual documento o estudante recebe e como pode verificar sua validade.
- O FAQ esclarece, de forma distinta, EJA, cursos livres/profissionalizantes, técnicos, graduações brasileiras, especializações/MBA e diplomas estrangeiros. Não afirmar que certificado de curso livre equivale a diploma técnico, nem que diploma estrangeiro é automaticamente reconhecido no Brasil.
- A identidade da entidade emissora e os atos documentais aplicáveis devem ficar disponíveis antes da matrícula, sem impor lista de marcas e parceiros na abertura da página.
- Fontes oficiais consultadas para validação regulatória: Cadastro e-MEC (https://www.gov.br/mec/pt-br/politica-regulacao-supervisao-educacao-superior/cadastro-nacional-de-cursos-e-ies), Sistema SISTEC (https://portal.mec.gov.br/sistec-inicial/), FIC/Qualificação Profissional (https://acervoportal.mec.gov.br/cursos-da-ept/formacao-inicial-e-continuada-ou-qualificacao-profissional) e documentação escolar de sistemas de ensino (https://portal.mec.gov.br/setec-secretaria-de-educacao-profissional-e-tecnologica/30000-uncategorised/62851-homologacao-de-estudos-e-titulos).


## Auditoria visual pelo PDF de 7 páginas — revisão de layout
- Origem: exportação da LP de 22/11/2026 (7 páginas, impressão horizontal).
- Página 1: foto da biblioteca se sobrepunha à headline e ao percentual; a fotografia passou a um bloco independente na coluna esquerda, abaixo da oferta/texto. Em telas pequenas, foto própria entre título e oferta.
- Páginas 2 e 3: os pictogramas da jornada eram exibidos desproporcionalmente grandes e preenchidos em preto. Foram inseridas dimensões SVG de 48px e atributos de traço diretamente nos elementos; CSS limita a 42px. Os três passos passaram a cartões com conteúdo e espaçamento consistentes.
- Página 4: a seção de certificação tinha fundo preto semelhante ao da abertura e do CTA final; passou a fundo branco-quente/cinza areia, preservando o painel acadêmico escuro em contraste.
- Páginas 5 e 6: FAQ tem respiro vertical menor, sem alterar as informações.
- Páginas 1 a 7: o link "Ir para o conteúdo" era repetido na impressão. Adicionada regra de impressão para escondê-lo; no navegador permanece acessível ao teclado.
- Alteração de `lp.css` e `lp.js` com parâmetro de versão `20261123-layout2` para reduzir risco de cache de CSS desatualizado.
- Inspeção estática: chaves CSS equilibradas; três ícones SVG com atributos visuais explícitos; JavaScript sintaticamente válido.
- Verificação ainda necessária: renderizar página real em navegador desktop e mobile (360, 390, 768, 1024 e 1440 px), testar os dois passos do formulário e confirmar se a janela externa de privacidade cobre alguma interação.
- Não publicar enquanto o endpoint `SCRIPT_URL` permanecer vazio.
