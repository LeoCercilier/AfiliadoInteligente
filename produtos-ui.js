function processarERenderizar() {
  sincronizarFiltrosParaEstado();
  atualizarBadgeFiltros();
  let lista = aplicarFiltrosLocais(estado.produtos);
  lista = ordenarProdutos(lista);
  estado.produtosFiltrados = lista;
  atualizarStats(lista);
  renderizarProdutos(lista);
  atualizarPaginacao();
  const info = document.getElementById('resultsInfo');
  if (lista.length === 0 && estado.produtos.length === 0) {
    mostrarEstadoVazio('Nenhum produto encontrado', 'Tente outro termo ou altere os filtros.');
    info.textContent = 'Nenhum resultado';
  } else if (lista.length === 0 && estado.produtos.length > 0) {
    mostrarEstadoVazio('Nenhum produto com esses filtros', 'Os filtros locais removeram todos os resultados. Ajuste ou limpe os filtros.');
    info.textContent = estado.produtos.length + ' produto(s) da API \u00b7 0 apos filtros';
  } else {
    document.getElementById('stateBox').classList.add('hidden');
    const filtroNota = estado.produtos.length !== lista.length ? ' \u00b7 ' + lista.length + ' apos filtros' : '';
    info.innerHTML = '<strong>' + lista.length + '</strong> produto(s) nesta pagina' + filtroNota;
  }
}

function renderizarProdutos(lista) {
  const grid = document.getElementById('productsGrid');
  if (!lista || lista.length === 0) { grid.innerHTML = ''; return; }
  grid.innerHTML = lista.map((p, idx) => renderizarCardProduto(p, idx)).join('');
}

function renderizarCardProduto(p, idx) {
  const score = obterScore(p);
  const scoreInfo = classificarScore(score);
  const link = obterLinkProduto(p);
  const comissao = obterComissaoEstimada(p);
  const taxa = obterTaxaComissao(p);
  const preco = p.preco != null ? Number(p.preco) : (p.preco_min != null ? Number(p.preco_min) : null);
  const precoMax = p.preco_max != null ? Number(p.preco_max) : null;
  const desconto = Number(p.desconto_percentual) || 0;
  const img = p.imagem_url || '';
  const nome = escapeHtml(p.nome || 'Produto sem nome');
  const loja = escapeHtml(p.nome_loja || 'Loja');
  const explicacao = obterExplicacaoScore(p);
  const scoreHtml = score != null ? '<div class="score-badge ' + scoreInfo.classe + '">' + scoreInfo.emoji + ' ' + Math.round(score) + '</div>' : '';
  const badges = [];
  if (p.is_ams_offer) badges.push('<span class="badge badge-ams">AMS</span>');
  if (p.is_key_seller) badges.push('<span class="badge badge-key">Key Seller</span>');
  if (desconto > 0) badges.push('<span class="badge badge-discount">' + Math.round(desconto) + '% OFF</span>');
  const precoRange = (precoMax && preco && precoMax > preco) ? formatarPreco(preco) + ' \u2013 ' + formatarPreco(precoMax) : formatarPreco(preco);
  const id = escapeHtml(p.id || p.item_id || idx);
  return '<article class="product-card" data-idx="' + idx + '" data-id="' + id + '">' +
    '<div class="card-image-wrap">' +
    (img ? '<img class="card-image" src="' + escapeHtml(img) + '" alt="' + nome + '" loading="lazy" onerror="this.classList.add(\'placeholder\');this.removeAttribute(\'src\');this.textContent=\'\ud83d\udce6\';" />' : '<div class="card-image placeholder">\ud83d\udce6</div>') +
    '<div class="card-badges">' + badges.join('') + '</div>' + scoreHtml + '</div>' +
    '<div class="card-body">' +
    '<h3 class="card-name" data-action="detalhes">' + nome + '</h3>' +
    '<div class="card-shop">\ud83c\udfea ' + loja + '</div>' +
    '<div class="card-meta"><span>\u2b50 ' + formatarAvaliacao(p.avaliacao) + '</span><span>\ud83d\uded2 ' + formatarVendas(p.vendas) + ' vendas</span></div>' +
    '<div class="card-price-row"><span class="card-price">' + precoRange + '</span></div>' +
    '<div class="card-commission"><strong>\ud83d\udcb0 Comissao est.: ' + formatarComissao(comissao) + '</strong>' +
    '<span class="card-commission-rate">\ud83d\udcc8 Taxa: ' + formatarPercentual(taxa) + '</span></div>' +
    (score != null && explicacao ? '<div class="score-explanation">' + escapeHtml(String(explicacao).slice(0, 120)) + '</div>' : (score != null ? '<div class="score-explanation">' + scoreInfo.emoji + ' ' + scoreInfo.label + '</div>' : '')) +
    '<div class="card-actions">' +
    '<button type="button" class="btn btn-secondary btn-sm" data-action="ver" ' + (link ? '' : 'disabled') + '>Ver produto</button>' +
    '<button type="button" class="btn btn-secondary btn-sm" data-action="divulgacao">Criar divulgacao</button>' +
    '<button type="button" class="btn btn-primary btn-sm card-actions-full" data-action="link">Criar link</button>' +
    '</div></div></article>';
}

function atualizarPaginacao() {
  const pag = document.getElementById('pagination');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const indicator = document.getElementById('pageIndicator');
  if (estado.produtos.length === 0 && estado.pagina <= 1) { pag.classList.add('hidden'); return; }
  pag.classList.remove('hidden');
  indicator.textContent = 'Pagina ' + estado.pagina;
  btnPrev.disabled = estado.pagina <= 1 || estado.carregando;
  btnNext.disabled = !estado.hasNextPage || estado.carregando;
}

function abrirDetalhesProduto(produto) {
  estado.produtoSelecionado = produto;
  const overlay = document.getElementById('modalOverlay');
  const body = document.getElementById('modalBody');
  const score = obterScore(produto);
  const scoreInfo = classificarScore(score);
  const explicacao = obterExplicacaoScore(produto);
  const link = obterLinkProduto(produto);
  const comissao = obterComissaoEstimada(produto);
  const taxa = obterTaxaComissao(produto);
  const preco = produto.preco != null ? Number(produto.preco) : Number(produto.preco_min);
  const img = produto.imagem_url || '';
  const motivos = [];
  if (score != null && score >= 75) motivos.push('Score alto de oportunidade (' + Math.round(score) + '/100)');
  if (Number(produto.vendas) >= 500) motivos.push('Volume relevante de vendas (' + formatarVendas(produto.vendas) + ')');
  if (comissao != null && comissao >= 5) motivos.push('Comissao estimada atrativa (' + formatarComissao(comissao) + ')');
  if (Number(produto.desconto_percentual) >= 15) motivos.push('Desconto destacado (' + Math.round(produto.desconto_percentual) + '% OFF)');
  if (Number(produto.avaliacao) >= 4.5) motivos.push('Avaliacao elevada (' + formatarAvaliacao(produto.avaliacao) + ')');
  if (produto.is_ams_offer) motivos.push('Participa de oferta AMS');
  if (produto.is_key_seller) motivos.push('Vendedor Key Seller');
  if (explicacao) motivos.push(explicacao);
  const scoreBlock = score != null ? '<div class="modal-score-block"><div class="modal-score-num ' + scoreInfo.classe + '" style="background:none;padding:0">' + scoreInfo.emoji + ' ' + Math.round(score) + '</div><div><div class="modal-score-label">' + scoreInfo.label + '</div><div class="modal-score-exp">' + (explicacao ? escapeHtml(explicacao) : 'Score calculado com base em demanda, comissao, desconto e avaliacao.') + '</div></div></div>' : '';
  const whyBlock = motivos.length ? '<div class="modal-why"><div class="modal-why-title">\ud83d\udca1 Por que este produto pode valer a pena?</div><ul class="modal-why-list">' + motivos.slice(0, 6).map(function(m) { return '<li>' + escapeHtml(m) + '</li>'; }).join('') + '</ul></div>' : '';
  body.innerHTML = (img ? '<img class="modal-image" src="' + escapeHtml(img) + '" alt="" onerror="this.style.display=\'none\'" />' : '') +
    '<h3 class="modal-name">' + escapeHtml(produto.nome || 'Produto') + '</h3>' + scoreBlock + whyBlock +
    '<div class="modal-section"><div class="modal-section-title">Informacoes principais</div><div class="modal-grid">' +
    '<div class="modal-field"><div class="modal-field-label">Preco</div><div class="modal-field-value">' + formatarPreco(preco) + '</div></div>' +
    '<div class="modal-field"><div class="modal-field-label">Desconto</div><div class="modal-field-value">' + (produto.desconto_percentual != null ? Math.round(produto.desconto_percentual) + '%' : '\u2014') + '</div></div>' +
    '<div class="modal-field"><div class="modal-field-label">Vendas</div><div class="modal-field-value">' + formatarVendas(produto.vendas) + '</div></div>' +
    '<div class="modal-field"><div class="modal-field-label">Avaliacao</div><div class="modal-field-value">\u2b50 ' + formatarAvaliacao(produto.avaliacao) + '</div></div>' +
    '<div class="modal-field"><div class="modal-field-label">Comissao estimada</div><div class="modal-field-value">' + formatarComissao(comissao) + '</div></div>' +
    '<div class="modal-field"><div class="modal-field-label">Taxa de comissao</div><div class="modal-field-value">' + formatarPercentual(taxa) + '</div></div>' +
    '<div class="modal-field"><div class="modal-field-label">Loja</div><div class="modal-field-value">' + escapeHtml(produto.nome_loja || '\u2014') + '</div></div>' +
    '<div class="modal-field"><div class="modal-field-label">Tipo de loja</div><div class="modal-field-value">' + escapeHtml(produto.shop_type || '\u2014') + '</div></div></div></div>' +
    '<div class="modal-section"><div class="modal-section-title">Oferta e status</div><div class="modal-grid">' +
    '<div class="modal-field"><div class="modal-field-label">Oferta AMS</div><div class="modal-field-value">' + (produto.is_ams_offer ? 'Sim' : 'Nao') + '</div></div>' +
    '<div class="modal-field"><div class="modal-field-label">Key Seller</div><div class="modal-field-value">' + (produto.is_key_seller ? 'Sim' : 'Nao') + '</div></div>' +
    '<div class="modal-field"><div class="modal-field-label">Inicio da oferta</div><div class="modal-field-value">' + (produto.periodo_inicio ? escapeHtml(String(produto.periodo_inicio).slice(0, 10)) : '\u2014') + '</div></div>' +
    '<div class="modal-field"><div class="modal-field-label">Fim da oferta</div><div class="modal-field-value">' + (produto.periodo_fim ? escapeHtml(String(produto.periodo_fim).slice(0, 10)) : '\u2014') + '</div></div></div></div>' +
    '<div class="modal-actions">' +
    '<button type="button" class="btn btn-secondary" data-modal-action="ver" ' + (link ? '' : 'disabled') + '>Ver na Shopee</button>' +
    '<button type="button" class="btn btn-secondary" data-modal-action="divulgacao">Criar divulgacao</button>' +
    '<button type="button" class="btn btn-primary" data-modal-action="link">Criar link de afiliado</button></div>';
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function fecharModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
  estado.produtoSelecionado = null;
}

function verProduto(produto) {
  const link = obterLinkProduto(produto);
  if (!link) { mostrarToast('Link do produto indisponivel', 'error'); return; }
  window.open(link, '_blank', 'noopener,noreferrer');
}

function criarDivulgacao(produto) {
  const id = produto.id || produto.item_id;
  if (!id) { mostrarToast('Produto sem identificador', 'error'); return; }
  window.location.href = 'divulgacao.html?produto_id=' + encodeURIComponent(id);
}

function criarLinkAfiliado(produto) {
  const id = produto.id || produto.item_id;
  if (!id) { mostrarToast('Produto sem identificador', 'error'); return; }
  const params = new URLSearchParams({ produto_id: id, nome: produto.nome || '', origin_url: obterLinkProduto(produto) || '' });
  window.location.href = 'links.html?acao=criar&' + params.toString();
}

function configurarEventos() {
  document.getElementById('btnBuscar').addEventListener('click', function() { buscarProdutos(true); });
  document.getElementById('keywordInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') { e.preventDefault(); buscarProdutos(true); }
  });
  var kwSidebar = document.getElementById('keywordSidebar');
  if (kwSidebar) {
    kwSidebar.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') { e.preventDefault(); document.getElementById('keywordInput').value = kwSidebar.value; buscarProdutos(true); }
    });
  }
  document.getElementById('btnLimpar').addEventListener('click', function() {
    document.getElementById('keywordInput').value = '';
    if (kwSidebar) kwSidebar.value = '';
    document.querySelectorAll('.filtro-campo').forEach(function(el) { if (el.tagName === 'SELECT') el.value = ''; else el.value = ''; });
    document.querySelectorAll('.filtro-check').forEach(function(el) { el.checked = false; });
    estado.filtros = { precoMin: null, precoMax: null, comissaoMin: null, descontoMin: null, avaliacaoMin: null, vendasMin: null, loja: '', tipoLoja: '', ams: false, keySeller: false, categoria: '' };
    estado.produtos = []; estado.produtosFiltrados = []; estado.pagina = 1; estado.hasNextPage = false;
    atualizarBadgeFiltros(); atualizarStats([]);
    document.getElementById('productsGrid').innerHTML = '';
    document.getElementById('pagination').classList.add('hidden');
    document.getElementById('stateBox').classList.add('hidden');
    document.getElementById('resultsInfo').textContent = 'Faca uma busca para descobrir produtos';
    document.getElementById('statTotal').textContent = '\u2014';
  });
  document.getElementById('btnFiltros').addEventListener('click', function() {
    var panel = document.getElementById('filtersPanelMobile');
    var open = panel.classList.toggle('open');
    document.getElementById('btnFiltros').setAttribute('aria-expanded', open);
  });
  document.getElementById('sortSelect').addEventListener('change', function(e) {
    estado.ordenacao = e.target.value;
    if (estado.produtos.length) processarERenderizar();
  });
  document.getElementById('btnPrev').addEventListener('click', function() {
    if (estado.pagina > 1 && !estado.carregando) { estado.pagina -= 1; buscarProdutos(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  });
  document.getElementById('btnNext').addEventListener('click', function() {
    if (estado.hasNextPage && !estado.carregando) { estado.pagina += 1; buscarProdutos(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  });
  document.getElementById('btnRetry').addEventListener('click', function() { buscarProdutos(true); });
  document.getElementById('productsGrid').addEventListener('click', function(e) {
    var card = e.target.closest('.product-card');
    if (!card) return;
    var idx = Number(card.dataset.idx);
    var produto = estado.produtosFiltrados[idx];
    if (!produto) return;
    var actionEl = e.target.closest('[data-action]');
    var action = actionEl ? actionEl.dataset.action : null;
    if (action === 'ver') verProduto(produto);
    else if (action === 'divulgacao') criarDivulgacao(produto);
    else if (action === 'link') criarLinkAfiliado(produto);
    else if (action === 'detalhes' || e.target.classList.contains('card-name') || e.target.classList.contains('card-image')) abrirDetalhesProduto(produto);
  });
  document.getElementById('modalClose').addEventListener('click', fecharModal);
  document.getElementById('modalOverlay').addEventListener('click', function(e) {
    if (e.target === document.getElementById('modalOverlay')) fecharModal();
  });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') fecharModal(); });
  document.getElementById('modalBody').addEventListener('click', function(e) {
    var actionEl = e.target.closest('[data-modal-action]');
    var action = actionEl ? actionEl.dataset.modalAction : null;
    if (!action || !estado.produtoSelecionado) return;
    if (action === 'ver') verProduto(estado.produtoSelecionado);
    else if (action === 'divulgacao') criarDivulgacao(estado.produtoSelecionado);
    else if (action === 'link') criarLinkAfiliado(estado.produtoSelecionado);
  });
  document.addEventListener('click', function(e) {
    if (e.target.id === 'btnAplicarFiltros' || e.target.closest('#btnAplicarFiltros')) {
      sincronizarFiltrosParaEstado();
      document.querySelectorAll('.filtro-campo').forEach(function(el) {
        var key = el.dataset.filtro; var val = estado.filtros[key];
        if (el.type === 'number') el.value = val != null ? val : '';
        else if (el.tagName === 'SELECT' || el.type === 'text') el.value = val || '';
      });
      document.querySelectorAll('.filtro-check').forEach(function(el) { el.checked = Boolean(estado.filtros[el.dataset.filtro]); });
      atualizarBadgeFiltros();
      if (estado.produtos.length) processarERenderizar();
      else mostrarToast('Faca uma busca primeiro', 'info');
    }
    if (e.target.id === 'btnResetFiltros' || e.target.closest('#btnResetFiltros')) {
      document.querySelectorAll('.filtro-campo').forEach(function(el) { if (el.tagName === 'SELECT') el.value = ''; else el.value = ''; });
      document.querySelectorAll('.filtro-check').forEach(function(el) { el.checked = false; });
      estado.filtros = { precoMin: null, precoMax: null, comissaoMin: null, descontoMin: null, avaliacaoMin: null, vendasMin: null, loja: '', tipoLoja: '', ams: false, keySeller: false, categoria: '' };
      atualizarBadgeFiltros();
      if (estado.produtos.length) processarERenderizar();
    }
  });
}

async function init() {
  var filtrosHtml = montarFiltrosHTML();
  document.getElementById('filtersPanelMobile').innerHTML = filtrosHtml;
  var desktopPanel = document.getElementById('filtersPanelDesktop');
  if (desktopPanel) desktopPanel.innerHTML = filtrosHtml;
  configurarEventos();
  var session = await verificarSessao();
  if (!session) return;
  document.getElementById('keywordInput').focus();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
