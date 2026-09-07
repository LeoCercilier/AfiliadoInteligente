const estado = {
  produtos: [],
  produtosFiltrados: [],
  pagina: 1,
  limite: 20,
  hasNextPage: false,
  totalCarregados: 0,
  keyword: '',
  ordenacao: 'score',
  filtros: {
    precoMin: null,
    precoMax: null,
    comissaoMin: null,
    descontoMin: null,
    avaliacaoMin: null,
    vendasMin: null,
    loja: '',
    tipoLoja: '',
    ams: false,
    keySeller: false,
    categoria: ''
  },
  carregando: false,
  ultimaBusca: null,
  produtoSelecionado: null,
  session: null,
  abortController: null
};

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatarPreco(valor) {
  if (valor == null || valor === '' || isNaN(Number(valor))) return '\u2014';
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarComissao(valor) {
  if (valor == null || valor === '' || isNaN(Number(valor))) return '\u2014';
  return formatarPreco(valor);
}

function formatarPercentual(valor) {
  if (valor == null || valor === '' || isNaN(Number(valor))) return '\u2014';
  const n = Number(valor);
  const pct = n <= 1 && n > 0 ? n * 100 : n;
  return pct.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%';
}

function formatarVendas(valor) {
  if (valor == null || valor === '' || isNaN(Number(valor))) return '\u2014';
  const n = Number(valor);
  if (n >= 1000000) return (n / 1000000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mi';
  if (n >= 1000) return (n / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mil';
  return n.toLocaleString('pt-BR');
}

function formatarAvaliacao(valor) {
  if (valor == null || valor === '' || isNaN(Number(valor))) return '\u2014';
  return Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function obterScore(produto) {
  if (produto.score != null && !isNaN(Number(produto.score))) return Number(produto.score);
  if (produto.produto_scores && produto.produto_scores.score != null) return Number(produto.produto_scores.score);
  return null;
}

function obterExplicacaoScore(produto) {
  if (produto.explicacao) return produto.explicacao;
  if (produto.produto_scores && produto.produto_scores.explicacao) return produto.produto_scores.explicacao;
  return null;
}

function classificarScore(score) {
  if (score == null) return { classe: '', label: '', emoji: '' };
  if (score >= 90) return { classe: 'score-excellent', label: 'Excelente oportunidade', emoji: '\ud83d\udd25' };
  if (score >= 75) return { classe: 'score-great', label: 'Otima oportunidade', emoji: '\u2728' };
  if (score >= 60) return { classe: 'score-good', label: 'Boa oportunidade', emoji: '\ud83d\udc4d' };
  if (score >= 40) return { classe: 'score-moderate', label: 'Oportunidade moderada', emoji: '\u26a1' };
  return { classe: 'score-low', label: 'Baixo potencial', emoji: '\ud83d\udcc9' };
}

function obterLinkProduto(produto) {
  return produto.offer_link || produto.produto_link || null;
}

function obterTaxaComissao(produto) {
  if (produto.taxa_comissao != null) return Number(produto.taxa_comissao);
  const s = Number(produto.seller_commission_rate) || 0;
  const sh = Number(produto.shopee_commission_rate) || 0;
  if (s || sh) return s + sh;
  return null;
}

function obterComissaoEstimada(produto) {
  if (produto.comissao != null && !isNaN(Number(produto.comissao))) return Number(produto.comissao);
  const preco = Number(produto.preco) || Number(produto.preco_min) || 0;
  const taxa = obterTaxaComissao(produto);
  if (preco && taxa != null) {
    const t = taxa <= 1 ? taxa : taxa / 100;
    return preco * t;
  }
  return null;
}

function mostrarToast(mensagem, tipo = 'info', duracao = 3500) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast ' + tipo;
  const icons = { success: '\u2713', error: '!', info: 'i' };
  toast.innerHTML = '<span style="font-weight:700;opacity:0.8">' + (icons[tipo] || 'i') + '</span><span>' + escapeHtml(mensagem) + '</span>';
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.2s';
    setTimeout(() => toast.remove(), 200);
  }, duracao);
}

async function verificarSessao() {
  try {
    if (typeof supabaseClient === 'undefined') {
      console.error('supabaseClient nao encontrado. Verifique supabase-config.js');
      mostrarErroAuth('Configuracao do Supabase ausente.');
      return null;
    }

    const { data: { session }, error } = await supabaseClient.auth.getSession();

    if (error) {
      console.error('Erro ao obter sessao:', error);
      mostrarErroAuth('Erro ao verificar sessao.');
      return null;
    }

    if (!session) {
      window.location.href = 'login.html';
      return null;
    }

    estado.session = session;

    const badge = document.getElementById('authBadge');
    const label = document.getElementById('authLabel');

    if (badge) badge.classList.add('visible');

    if (label) {
      const email = session.user?.email || '';
      label.textContent = email ? email.split('@')[0] : 'Conectado';
    }

    supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        window.location.href = 'login.html';
      } else {
        estado.session = session;
      }
    });

    return session;

  } catch (err) {
    console.error('verificarSessao:', err);
    mostrarErroAuth('Falha ao verificar autenticacao.');
    return null;
  }
}

function mostrarErroAuth(msg) {
  const box = document.getElementById('stateBox');

  document.getElementById('stateIcon').textContent = '\ud83d\udd12';
  document.getElementById('stateTitle').textContent = 'Sua sessao expirou';
  document.getElementById('stateDesc').textContent = msg || 'Faca login novamente.';
  document.getElementById('btnRetry').style.display = 'none';

  box.classList.remove('hidden');

  setTimeout(() => {
    window.location.href = 'login.html';
  }, 1800);
}

function montarFiltrosHTML() {
  return `
    <div class="filter-group">
      <label class="filter-label">Preco minimo (R$)</label>
      <input type="number" class="filter-input filtro-campo" data-filtro="precoMin" placeholder="Ex: 20" min="0" step="0.01" />
    </div>

    <div class="filter-group">
      <label class="filter-label">Preco maximo (R$)</label>
      <input type="number" class="filter-input filtro-campo" data-filtro="precoMax" placeholder="Ex: 200" min="0" step="0.01" />
    </div>

    <div class="filter-group">
      <label class="filter-label">Comissao minima (R$)</label>
      <input type="number" class="filter-input filtro-campo" data-filtro="comissaoMin" placeholder="Ex: 5" min="0" step="0.01" />
    </div>

    <div class="filter-group">
      <label class="filter-label">Desconto minimo (%)</label>
      <input type="number" class="filter-input filtro-campo" data-filtro="descontoMin" placeholder="Ex: 10" min="0" max="100" step="1" />
    </div>

    <div class="filter-group">
      <label class="filter-label">Avaliacao minima</label>
      <input type="number" class="filter-input filtro-campo" data-filtro="avaliacaoMin" placeholder="Ex: 4.5" min="0" max="5" step="0.1" />
    </div>

    <div class="filter-group">
      <label class="filter-label">Vendas minimas</label>
      <input type="number" class="filter-input filtro-campo" data-filtro="vendasMin" placeholder="Ex: 100" min="0" step="1" />
    </div>

    <div class="filter-group">
      <label class="filter-label">Loja</label>
      <input type="text" class="filter-input filtro-campo" data-filtro="loja" placeholder="Nome da loja" />
    </div>

    <div class="filter-group">
      <label class="filter-label">Tipo de loja</label>
      <select class="filter-select filtro-campo" data-filtro="tipoLoja">
        <option value="">Todos</option>
        <option value="mall">Shopee Mall</option>
        <option value="preferred">Preferred</option>
        <option value="normal">Normal</option>
      </select>
    </div>

    <div class="filter-group">
      <label class="filter-label">Categoria (texto)</label>
      <input type="text" class="filter-input filtro-campo" data-filtro="categoria" placeholder="Ex: eletronicos" />
    </div>

    <div class="filter-group">
      <label class="filter-label">Opcoes especiais</label>
      <div class="filter-checkboxes">
        <label class="filter-check">
          <input type="checkbox" class="filtro-check" data-filtro="ams" /> Oferta AMS
        </label>

        <label class="filter-check">
          <input type="checkbox" class="filtro-check" data-filtro="keySeller" /> Key Seller
        </label>
      </div>
    </div>

    <div class="filters-actions">
      <button type="button" class="btn btn-primary btn-sm" id="btnAplicarFiltros">
        Aplicar filtros
      </button>

      <button type="button" class="btn btn-ghost btn-sm" id="btnResetFiltros">
        Limpar filtros
      </button>
    </div>
  `;
}

function sincronizarFiltrosParaEstado() {
  document.querySelectorAll('.filtro-campo').forEach(el => {
    const key = el.dataset.filtro;

    if (!key) return;

    if (el.type === 'number') {
      const v = el.value.trim();
      estado.filtros[key] = v === '' ? null : Number(v);
    } else {
      estado.filtros[key] = el.value.trim();
    }
  });

  document.querySelectorAll('.filtro-check').forEach(el => {
    const key = el.dataset.filtro;

    if (key) estado.filtros[key] = el.checked;
  });
}

function contarFiltrosAtivos() {
  let n = 0;
  const f = estado.filtros;

  if (f.precoMin != null) n++;
  if (f.precoMax != null) n++;
  if (f.comissaoMin != null) n++;
  if (f.descontoMin != null) n++;
  if (f.avaliacaoMin != null) n++;
  if (f.vendasMin != null) n++;
  if (f.loja) n++;
  if (f.tipoLoja) n++;
  if (f.categoria) n++;
  if (f.ams) n++;
  if (f.keySeller) n++;

  return n;
}

function atualizarBadgeFiltros() {
  const n = contarFiltrosAtivos();
  const badge = document.getElementById('filtersBadge');
  const toggle = document.getElementById('btnFiltros');

  if (n > 0) {
    badge.textContent = n;
    badge.classList.remove('hidden');
    toggle.classList.add('active');
  } else {
    badge.classList.add('hidden');
    toggle.classList.remove('active');
  }
}

function aplicarFiltrosLocais(lista) {
  const f = estado.filtros;

  return lista.filter(p => {
    const preco = Number(p.preco) || Number(p.preco_min) || 0;
    const comissao = obterComissaoEstimada(p);
    const desconto = Number(p.desconto_percentual) || 0;
    const avaliacao = Number(p.avaliacao) || 0;
    const vendas = Number(p.vendas) || 0;
    const loja = (p.nome_loja || '').toLowerCase();
    const tipo = (p.shop_type || '').toLowerCase();
    const cat = JSON.stringify(p.categoria_ids || p.dados_api || '').toLowerCase();

    if (f.precoMin != null && preco < f.precoMin) return false;
    if (f.precoMax != null && preco > f.precoMax) return false;
    if (f.comissaoMin != null && (comissao == null || comissao < f.comissaoMin)) return false;
    if (f.descontoMin != null && desconto < f.descontoMin) return false;
    if (f.avaliacaoMin != null && avaliacao < f.avaliacaoMin) return false;
    if (f.vendasMin != null && vendas < f.vendasMin) return false;

    if (f.loja && !loja.includes(f.loja.toLowerCase())) return false;

    if (f.tipoLoja) {
      const t = f.tipoLoja.toLowerCase();

      if (t === 'mall' && !tipo.includes('mall')) return false;
      if (t === 'preferred' && !tipo.includes('preferred') && !tipo.includes('prefer')) return false;
      if (t === 'normal' && (tipo.includes('mall') || tipo.includes('preferred'))) return false;
    }

    if (
      f.categoria &&
      !cat.includes(f.categoria.toLowerCase()) &&
      !(p.nome || '').toLowerCase().includes(f.categoria.toLowerCase())
    ) return false;

    if (f.ams && !p.is_ams_offer) return false;
    if (f.keySeller && !p.is_key_seller) return false;

    return true;
  });
}

function ordenarProdutos(lista) {
  const arr = [...lista];
  const key = estado.ordenacao;

  arr.sort((a, b) => {
    switch (key) {

      case 'score': {
        const sa = obterScore(a);
        const sb = obterScore(b);

        if (sa == null && sb == null) {
          return (Number(b.vendas) || 0) - (Number(a.vendas) || 0);
        }

        if (sa == null) return 1;
        if (sb == null) return -1;

        return sb - sa;
      }

      case 'sales':
        return (Number(b.vendas) || 0) - (Number(a.vendas) || 0);

      case 'commission': {
        const ca = obterComissaoEstimada(a) || 0;
        const cb = obterComissaoEstimada(b) || 0;

        return cb - ca;
      }

      case 'discount':
        return (Number(b.desconto_percentual) || 0) -
               (Number(a.desconto_percentual) || 0);

      case 'rating':
        return (Number(b.avaliacao) || 0) -
               (Number(a.avaliacao) || 0);

      case 'price_asc': {
        const pa = Number(a.preco) || Number(a.preco_min) || Infinity;
        const pb = Number(b.preco) || Number(b.preco_min) || Infinity;

        return pa - pb;
      }

      case 'price_desc': {
        const pa = Number(a.preco) || Number(a.preco_min) || 0;
        const pb = Number(b.preco) || Number(b.preco_min) || 0;

        return pb - pa;
      }

      default:
        return 0;
    }
  });

  return arr;
}

function atualizarStats(lista) {
  const totalEl = document.getElementById('statTotal');
  const scoreEl = document.getElementById('statBestScore');
  const commEl = document.getElementById('statBestCommission');
  const salesEl = document.getElementById('statBestSales');

  if (!lista || lista.length === 0) {
    totalEl.textContent = '0';
    scoreEl.textContent = '\u2014';
    commEl.textContent = '\u2014';
    salesEl.textContent = '\u2014';
    return;
  }

  totalEl.textContent = lista.length.toLocaleString('pt-BR');

  let bestScore = null;
  let bestComm = null;
  let bestSales = null;

  lista.forEach(p => {
    const s = obterScore(p);

    if (s != null && (bestScore == null || s > bestScore)) {
      bestScore = s;
    }

    const c = obterComissaoEstimada(p);

    if (c != null && (bestComm == null || c > bestComm)) {
      bestComm = c;
    }

    const v = Number(p.vendas);

    if (!isNaN(v) && (bestSales == null || v > bestSales)) {
      bestSales = v;
    }
  });

  scoreEl.textContent = bestScore != null ? Math.round(bestScore) : '\u2014';
  commEl.textContent = bestComm != null ? formatarPreco(bestComm) : '\u2014';
  salesEl.textContent = bestSales != null ? formatarVendas(bestSales) : '\u2014';
}

function mostrarLoading(ativo) {
  estado.carregando = ativo;

  const bar = document.getElementById('loadingBar');
  const skel = document.getElementById('skeletonGrid');
  const grid = document.getElementById('productsGrid');
  const state = document.getElementById('stateBox');
  const pag = document.getElementById('pagination');
  const btnBuscar = document.getElementById('btnBuscar');

  if (ativo) {
    bar.classList.add('active');
    skel.classList.remove('hidden');
    grid.innerHTML = '';
    state.classList.add('hidden');
    pag.classList.add('hidden');
    btnBuscar.disabled = true;
    document.getElementById('resultsInfo').textContent = 'Buscando produtos...';
  } else {
    bar.classList.remove('active');
    skel.classList.add('hidden');
    btnBuscar.disabled = false;
  }
}

function mostrarEstadoVazio(titulo, desc, mostrarRetry = false) {
  const box = document.getElementById('stateBox');

  document.getElementById('stateIcon').textContent = '\ud83d\udd0d';
  document.getElementById('stateTitle').textContent = titulo;
  document.getElementById('stateDesc').textContent = desc;

  const btn = document.getElementById('btnRetry');
  btn.style.display = mostrarRetry ? 'inline-flex' : 'none';

  box.classList.remove('hidden');

  document.getElementById('productsGrid').innerHTML = '';
  document.getElementById('pagination').classList.add('hidden');
}

function mostrarEstadoErro(titulo, desc) {
  const box = document.getElementById('stateBox');

  document.getElementById('stateIcon').textContent = '\u26a0\ufe0f';
  document.getElementById('stateTitle').textContent = titulo;
  document.getElementById('stateDesc').textContent = desc;
  document.getElementById('btnRetry').style.display = 'inline-flex';

  box.classList.remove('hidden');

  document.getElementById('productsGrid').innerHTML = '';
  document.getElementById('pagination').classList.add('hidden');
}

async function buscarProdutos(resetPagina = true) {
  if (estado.carregando) return;

  if (!estado.session) {
    const s = await verificarSessao();
    if (!s) return;
  }

  const keywordInput = document.getElementById('keywordInput');
  const keywordSidebar = document.getElementById('keywordSidebar');

  if (document.activeElement === keywordSidebar) {
    keywordInput.value = keywordSidebar.value;
  } else if (keywordSidebar) {
    keywordSidebar.value = keywordInput.value;
  }

  const keyword = (keywordInput.value || '').trim();

  estado.keyword = keyword;

  if (resetPagina) estado.pagina = 1;

  if (estado.abortController) {
    try {
      estado.abortController.abort();
    } catch (_) {}
  }

  estado.abortController = new AbortController();

  mostrarLoading(true);

  try {
    const body = {
      keyword: keyword || undefined,
      page: estado.pagina,
      limit: estado.limite
    };

    Object.keys(body).forEach(k => {
      if (body[k] === undefined) delete body[k];
    });

    const { data, error } =
      await supabaseClient.functions.invoke(
        'shopee-products-v2',
        { body }
      );

    if (error) {
      console.error('Edge Function error:', error);

      if (error.message && /auth|jwt|session|401|403/i.test(error.message)) {
        mostrarErroAuth('Sua sessao expirou. Faca login novamente.');
        return;
      }

      mostrarEstadoErro(
        'Nao foi possivel buscar produtos',
        'Ocorreu um erro ao consultar a Shopee. Tente novamente em instantes.'
      );

      mostrarToast('Erro na busca de produtos', 'error');
      return;
    }

    let produtos = [];
    let hasNext = false;
    let page = estado.pagina;

    if (Array.isArray(data)) {
      produtos = data;

    /* CORRECAO CIRURGICA:
       A Edge Function shopee-products-v2 retorna
       os produtos em data.products e a paginacao
       dentro de data.pageInfo.
    */
    } else if (data && Array.isArray(data.products)) {
      produtos = data.products;
      hasNext = Boolean(data.pageInfo?.hasNextPage);

      if (data.pageInfo?.page != null) {
        page = Number(data.pageInfo.page);
      }

    } else if (data && Array.isArray(data.produtos)) {
      produtos = data.produtos;
      hasNext = Boolean(data.hasNextPage);

      if (data.page != null) {
        page = Number(data.page);
      }

    } else if (data && Array.isArray(data.data)) {
      produtos = data.data;
      hasNext = Boolean(data.hasNextPage || data.has_next_page);

      if (data.page != null) {
        page = Number(data.page);
      }

    } else if (data && data.error) {
      mostrarEstadoErro(
        'Erro na consulta',
        data.message || data.error || 'Tente novamente.'
      );
      return;
    }

    estado.produtos = produtos;
    estado.hasNextPage = hasNext;
    estado.pagina = page;
    estado.totalCarregados = produtos.length;
    estado.ultimaBusca = Date.now();

    processarERenderizar();

  } catch (err) {
    if (err.name === 'AbortError') return;

    console.error('buscarProdutos:', err);

    mostrarEstadoErro(
      'Falha na conexao',
      'Nao foi possivel contatar o servidor. Verifique sua internet e tente novamente.'
    );

    mostrarToast('Falha na conexao', 'error');

  } finally {
    mostrarLoading(false);
  }
}
