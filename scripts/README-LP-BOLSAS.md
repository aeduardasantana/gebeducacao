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
