const SUPABASE_URL = "https://ajjbtuhnvdehcxqykfkf.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_UD6ktmFQ0yW9fVIHRH7EVQ_gGsn5Al4";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

/* ============================================================
   AFILIADO INTELIGENTE — GERADOR DE ANÚNCIOS (v2)
   ============================================================ */

(function () {
    if (!window.location.pathname.endsWith("/produtos.html") &&
        !window.location.pathname.endsWith("/AfiliadoInteligente/produtos.html") &&
        !window.location.href.includes("produtos.html")) return;

    const estilo = document.createElement("style");

    estilo.textContent = `
        .ai-anuncio-button {
            width: 100%;
            margin-top: 8px;
            padding: 12px 14px;
            border: 0;
            border-radius: 9px;
            background: #7c3aed;
            color: white;
            font-weight: 700;
            cursor: pointer;
            font-size: 14px;
            transition: opacity .15s ease;
        }

        .ai-anuncio-button:hover {
            opacity: .9;
        }

        .ai-anuncio-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,.72);
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding: 12px;
            padding-top: max(12px, env(safe-area-inset-top));
            padding-bottom: max(12px, env(safe-area-inset-bottom));
            z-index: 99999;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
        }

        .ai-anuncio-modal {
            width: min(640px, 100%);
            max-height: none;
            margin: 8px auto 24px;
            background: #fff;
            border-radius: 16px;
            padding: 18px 16px 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,.35);
            box-sizing: border-box;
        }

        .ai-anuncio-modal h2 {
            margin: 0 0 4px;
            color: #111827;
            font-size: 1.25rem;
        }

        .ai-anuncio-subtitulo {
            margin-bottom: 14px;
            color: #6b7280;
            font-size: 13px;
            line-height: 1.4;
        }

        .ai-anuncio-img-wrap {
            width: 100%;
            max-height: 220px;
            border-radius: 12px;
            overflow: hidden;
            background: #f3f4f6;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 14px;
            border: 1px solid #e5e7eb;
        }

        .ai-anuncio-img-wrap img {
            max-width: 100%;
            max-height: 220px;
            object-fit: contain;
            display: block;
        }

        .ai-anuncio-img-fallback {
            padding: 28px 16px;
            color: #6b7280;
            font-size: 14px;
            text-align: center;
        }

        .ai-anuncio-modal label {
            display: block;
            margin: 12px 0 6px;
            font-weight: 700;
            color: #111827;
            font-size: 14px;
        }

        .ai-anuncio-modal select,
        .ai-anuncio-modal textarea {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid #d1d5db;
            border-radius: 10px;
            padding: 12px;
            font-size: 15px;
            font-family: inherit;
            line-height: 1.45;
        }

        .ai-anuncio-modal textarea {
            min-height: 260px;
            resize: vertical;
        }

        .ai-anuncio-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 16px;
        }

        .ai-anuncio-actions button {
            min-height: 48px;
            padding: 12px 10px;
            border: 0;
            border-radius: 10px;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            line-height: 1.2;
        }

        .ai-anuncio-copy {
            background: #16a34a;
            color: white;
        }

        .ai-anuncio-arte {
            background: #7c3aed;
            color: white;
        }

        .ai-anuncio-baixar {
            background: #2563eb;
            color: white;
        }

        .ai-anuncio-share {
            background: #0ea5e9;
            color: white;
        }

        .ai-anuncio-close {
            background: #e5e7eb;
            color: #111827;
            grid-column: 1 / -1;
        }

        .ai-anuncio-arte-preview {
            margin-top: 14px;
            display: none;
            text-align: center;
        }

        .ai-anuncio-arte-preview img {
            max-width: 100%;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 8px 24px rgba(0,0,0,.12);
        }

        .ai-anuncio-arte-msg {
            margin-top: 8px;
            font-size: 13px;
            color: #6b7280;
        }

        .ai-anuncio-arte-actions {
            display: flex;
            gap: 8px;
            justify-content: center;
            margin-top: 10px;
            flex-wrap: wrap;
        }

        .ai-anuncio-arte-actions a,
        .ai-anuncio-arte-actions button {
            min-height: 44px;
            padding: 10px 16px;
            border-radius: 10px;
            font-weight: 700;
            font-size: 14px;
            border: 0;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        .ai-anuncio-salvar-arte {
            background: #16a34a;
            color: white;
        }

        @media (max-width: 480px) {
            .ai-anuncio-modal {
                padding: 16px 12px 18px;
            }

            .ai-anuncio-actions {
                grid-template-columns: 1fr;
            }

            .ai-anuncio-modal textarea {
                min-height: 220px;
            }
        }
    `;

    document.head.appendChild(estilo);

    function limparTexto(texto) {
        return (texto || "").replace(/\s+/g, " ").trim();
    }

    function escaparHTML(texto) {
        return String(texto || "")
            .replace(/&/g, "&")
            .replace(/</g, "<")
            .replace(/>/g, ">")
            .replace(/"/g, """)
            .replace(/'/g, "&#039;");
    }

    function escolher(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function formatarVendasTexto(n) {
        if (n == null || isNaN(n)) return null;
        const num = Number(n);
        if (num >= 1000) {
            const k = Math.floor(num / 100) / 10;
            return `+${k.toLocaleString("pt-BR")} mil`;
        }
        return `+${Math.floor(num).toLocaleString("pt-BR")}`;
    }

    function detectarCategoria(nome) {
        const t = (nome || "").toLowerCase();

        const regras = [
            {
                cat: "beleza",
                keys: [
                    "cabelo", "capilar", "touca", "hidrata", "shampoo", "condicionador",
                    "máscara", "mascara", "skincare", "pele", "rosto", "maquiagem",
                    "batom", "base", "creme", "serum", "sérum", "esfoliante", "beleza",
                    "unha", "esmalt", "perfume", "colônia", "colonia", "kit cabelo"
                ]
            },
            {
                cat: "eletronicos",
                keys: [
                    "fone", "bluetooth", "carregador", "cabo", "usb", "power bank",
                    "powerbank", "celular", "smartphone", "tablet", "notebook", "mouse",
                    "teclado", "webcam", "ssd", "hd ", "pen drive", "pendrive", "led",
                    "lâmpada", "lampada", "smartwatch", "relógio digital", "relogio",
                    "caixa de som", "speaker", "tv ", "monitor", "eletrônico", "eletronico"
                ]
            },
            {
                cat: "casa",
                keys: [
                    "cozinha", "panela", "frigideira", "utensílio", "utensilio", "organizador",
                    "caixa organizadora", "cabide", "prateleira", "cortina", "toalha",
                    "tapete", "vaso", "jardim", "limpeza", "vassoura", "rodo", "balde",
                    "garrafa", "copo", "talher", "faca", "tesoura", "porta", "suporte",
                    "casa", "doméstico", "domestico", "air fryer", "liquidificador"
                ]
            },
            {
                cat: "moda",
                keys: [
                    "roupa", "camiseta", "camisa", "calça", "calca", "short", "saia",
                    "vestido", "blusa", "jaqueta", "casaco", "moletom", "tênis", "tenis",
                    "sapato", "sandália", "sandalia", "chinelo", "bolsa", "mochila",
                    "carteira", "óculos", "oculos", "boné", "bone", "meia", "cueca",
                    "sutiã", "sutia", "lingerie", "moda", "look"
                ]
            },
            {
                cat: "pets",
                keys: [
                    "pet", "cão", "cao", "cachorro", "gato", "felino", "ração", "racao",
                    "coleira", "guia", "brinquedo pet", "arranhador", "comedouro",
                    "bebêdoro", "bebedouro", "antipulgas", "petisco"
                ]
            },
            {
                cat: "ferramentas",
                keys: [
                    "furadeira", "parafusadeira", "chave de fenda", "chave allen",
                    "alicate", "martelo", "serra", "nível", "nivel", "trena",
                    "ferramenta", "kit ferramenta", "broca", "lixa", "esmerilhadeira"
                ]
            }
        ];

        for (const r of regras) {
            if (r.keys.some(k => t.includes(k))) return r.cat;
        }
        return "geral";
    }

    function nomeResumido(nome, max = 48) {
        const n = limparTexto(nome);
        if (n.length <= max) return n;
        return n.slice(0, max - 1).trim() + "…";
    }

    function obterDadosProduto(card) {
        const nome =
            limparTexto(card.querySelector(".product-name")?.textContent) ||
            "Produto em destaque";

        const preco =
            limparTexto(card.querySelector(".product-price")?.textContent) ||
            "";

        const comissao =
            limparTexto(card.querySelector(".commission-value")?.textContent) ||
            "";

        // Imagem real do card
        const imgEl = card.querySelector(".product-image");
        let imagem = "";
        if (imgEl && imgEl.src && imgEl.style.display !== "none") {
            imagem = imgEl.src;
        }

        // Meta items: ⭐ avaliação | 🛒 vendas | 📈 taxa | 🧠 Score
        let avaliacao = null;
        let vendas = null;
        let vendasRaw = null;

        const metas = [...card.querySelectorAll(".meta-item")];
        for (const el of metas) {
            const txt = limparTexto(el.textContent);
            if (txt.includes("⭐") || txt.startsWith("⭐")) {
                const m = txt.match(/([\d]+[.,][\d]+|[\d]+)/);
                if (m) {
                    avaliacao = parseFloat(m[1].replace(",", "."));
                }
            } else if (txt.includes("🛒")) {
                const strong = el.querySelector("strong");
                const raw = limparTexto(strong ? strong.textContent : txt.replace("🛒", ""));
                if (raw && raw !== "—") {
                    vendasRaw = raw;
                    // tenta extrair número aproximado
                    const numMatch = raw.replace(/\./g, "").replace(",", ".").match(/[\d.]+/);
                    if (numMatch) {
                        let v = parseFloat(numMatch[0]);
                        if (/mil/i.test(raw)) v = v * 1000;
                        vendas = v;
                    }
                }
            }
        }

        // Link de afiliado (mesmo do botão Ver produto)
        let link = "";
        const botoes = [...card.querySelectorAll("[onclick]")];
        for (const botao of botoes) {
            const onclick = botao.getAttribute("onclick") || "";
            const encontrado = onclick.match(/abrirProduto\(['"]([^'"]*)['"]\)/);
            if (encontrado) {
                link = encontrado[1];
                break;
            }
        }

        const categoria = detectarCategoria(nome);

        return {
            nome,
            preco,
            comissao,
            imagem,
            avaliacao,
            vendas,
            vendasRaw,
            link,
            categoria
        };
    }

    /* ---------- Templates de anúncio ---------- */

    function gerarAnuncio(produto, plataforma) {
        const nome = produto.nome;
        const preco = produto.preco || "Confira o preço";
        const link = produto.link || "";
        const cat = produto.categoria || "geral";

        const av = produto.avaliacao;
        const vendasTxt = produto.vendas != null
            ? formatarVendasTexto(produto.vendas)
            : (produto.vendasRaw && produto.vendasRaw !== "—" ? `+${produto.vendasRaw}` : null);

        const provaSocialParts = [];
        if (av != null && !isNaN(av)) {
            provaSocialParts.push(`⭐ Avaliação ${av.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}`);
        }
        if (vendasTxt) {
            provaSocialParts.push(`🛒 ${vendasTxt} vendas`);
        }
        const provaSocial = provaSocialParts.join("\n");

        // Introduções por categoria
        const intros = {
            beleza: [
                "✨ Seu momento de autocuidado pode ficar ainda melhor...",
                "💆‍♀️ Olha esse achadinho para quem ama cuidar do cabelo e da pele!",
                "💖 Encontrei algo que pode elevar sua rotina de cuidados..."
            ],
            eletronicos: [
                "⚡ Olha o que encontrei para facilitar o dia a dia...",
                "🔌 Esse gadget pode mudar a forma como você usa a tecnologia no cotidiano!",
                "📱 Achadinho tech que vale a pena conferir..."
            ],
            casa: [
                "🏠 Um daqueles achadinhos simples que podem deixar sua rotina muito mais prática...",
                "🍳 Olha o que pode facilitar a vida em casa!",
                "✨ Encontrei algo útil para organizar e otimizar o dia a dia..."
            ],
            moda: [
                "👀 Esse achadinho merece entrar no seu próximo look...",
                "👗 Olha essa peça que pode renovar o guarda-roupa!",
                "✨ Encontrei algo estiloso e com ótimo custo-benefício..."
            ],
            pets: [
                "🐶 Olha esse mimo que encontrei para os pets...",
                "🐱 Seu pet merece esse carinho!",
                "🐾 Achadinho especial para quem ama os bichinhos..."
            ],
            ferramentas: [
                "🔧 Para quem gosta de ter a ferramenta certa na hora certa...",
                "🛠️ Olha esse item que pode facilitar vários trabalhos!",
                "⚙️ Achadinho prático para o dia a dia de quem resolve as coisas..."
            ],
            geral: [
                "🔥 Olha o que eu encontrei na Shopee!",
                "👀 Esse produto chamou minha atenção...",
                "✨ Um achadinho que vale a pena conferir...",
                "💥 Olha esse preço!"
            ]
        };

        const ganchosInsta = [
            "🔥 OLHA O QUE EU ENCONTREI!",
            "👀 ESSE PRODUTO CHAMOU MINHA ATENÇÃO...",
            "🚨 VOCÊ PAGARIA QUANTO NISSO?",
            "✨ UM ACHADINHO PARA FACILITAR A ROTINA",
            "💥 OLHA ESSE PREÇO!",
            "🛍️ MAIS UM ACHADINHO QUE VALE CONFERIR"
        ];

        const ganchosWhats = [
            "🔥 OLHA O QUE EU ACHEI NA SHOPEE!",
            "👀 Encontrei isso e achei o preço interessante:",
            "✨ Achadinho que vale a pena dar uma olhada:",
            "💥 Olha esse preço:"
        ];

        const ganchosTik = [
            "🚨 VOCÊ PAGARIA QUANTO NISSO?",
            "👀 EU NÃO ESPERAVA ENCONTRAR ISSO POR ESSE PREÇO...",
            "🔥 OLHA ESSE ACHADO!",
            "✨ Descobri isso e precisei compartilhar..."
        ];

        const hashtags = {
            beleza: "#shopee #achadinhos #cabelos #cuidadoscomocabelo #beleza #ofertas #skincare",
            eletronicos: "#shopee #achadinhos #tech #eletronicos #ofertas #gadgets",
            casa: "#shopee #achadinhos #casa #cozinha #organizacao #ofertas",
            moda: "#shopee #achadinhos #moda #look #estilo #ofertas",
            pets: "#shopee #achadinhos #pets #cachorro #gato #ofertas",
            ferramentas: "#shopee #achadinhos #ferramentas #diy #ofertas",
            geral: "#shopee #achadinhos #ofertas #promocao #compras"
        };

        const intro = escolher(intros[cat] || intros.geral);
        const tags = hashtags[cat] || hashtags.geral;

        // Benefício genérico natural
        const beneficios = [
            "Uma daquelas comprinhas que chamam atenção pelo preço e pela quantidade de pessoas que já compraram.",
            "Vale a pena conferir se faz sentido para você — o conjunto de preço e avaliações está interessante.",
            "Se você estava procurando algo nessa linha, esse pode ser um bom candidato.",
            "Preço acessível e boa aceitação de quem já comprou."
        ];
        const beneficio = escolher(beneficios);

        if (plataforma === "whatsapp") {
            const gancho = escolher(ganchosWhats);
            const estruturas = [
                `${gancho}\n\n${nome}\n\n${intro}\n\n💰 ${preco}\n${provaSocial ? provaSocial + "\n" : ""}\n👀 Achei o preço muito interessante.\n\n👇 Confira:\n🛍️ ${link}`,

                `${gancho}\n\n${nome}\n\n💰 ${preco}\n${provaSocial ? provaSocial + "\n" : ""}\n${beneficio}\n\n👇 Link:\n${link}`,

                `🔥 ACHADO NA SHOPEE!\n\n${nome}\n\n${intro}\n\n💰 Apenas ${preco}\n${provaSocial ? "\n" + provaSocial : ""}\n\n👇 Ver oferta:\n🛍️ ${link}`
            ];
            return escolher(estruturas);
        }

        if (plataforma === "tiktok") {
            const gancho = escolher(ganchosTik);
            const estruturas = [
                `${gancho}\n\n${nome}\n\n💰 ${preco}\n${provaSocial ? provaSocial + "\n" : ""}\nSe você estava procurando algo assim, vale a pena conferir 👀\n\n👉 Link:\n${link}\n\n${tags}`,

                `${gancho}\n\n${intro}\n\n${nome}\n\n💰 ${preco}\n${provaSocial ? "\n" + provaSocial : ""}\n\n👇 Confira o link na bio / nos comentários\n${link}\n\n${tags}`,

                `👀 EU NÃO ESPERAVA ESSE PREÇO...\n\n${nome}\n\n💰 ${preco}\n${provaSocial ? provaSocial + "\n" : ""}\n${beneficio}\n\n👉 ${link}\n\n${tags}`
            ];
            return escolher(estruturas);
        }

        // Instagram / Facebook (default)
        const gancho = escolher(ganchosInsta);
        const estruturas = [
            `${gancho}\n\n${intro}\n\n${nome}\n\n💰 Apenas ${preco}!\n\n${provaSocial ? provaSocial + "\n" : ""}\n${beneficio}\n\n👇 Vale a pena conferir:\n🛍️ VER OFERTA NA SHOPEE\n${link}\n\n${tags}`,

            `${gancho}\n\nQuer uma opção acessível e com boa aceitação de quem já comprou? 👀\n\n${nome}\n\n💰 ${preco}\n${provaSocial ? "\n" + provaSocial : ""}\n\n${beneficio}\n\n👇 Confira a oferta:\n${link}\n\n${tags}`,

            `✨ ${intro}\n\n${nome}\n\nE olha esse preço:\n💰 ${preco}\n\n${provaSocial ? provaSocial + "\n" : ""}\nUma daquelas comprinhas que chamam atenção pelo custo-benefício.\n\n👇 VER OFERTA:\n🛍️ ${link}\n\n${tags}`,

            `${gancho}\n\n${nome}\n\n${intro}\n\n💰 ${preco}\n${provaSocial ? "\n" + provaSocial : ""}\n\n👇 Link da oferta:\n${link}\n\n${tags}`
        ];
        return escolher(estruturas);
    }

    /* ---------- Canvas / Arte ---------- */

    function criarArteCanvas(produto) {
        return new Promise((resolve, reject) => {
            const W = 1080;
            const H = 1350;
            const canvas = document.createElement("canvas");
            canvas.width = W;
            canvas.height = H;
            const ctx = canvas.getContext("2d");

            // Fundo gradiente
            const grad = ctx.createLinearGradient(0, 0, 0, H);
            grad.addColorStop(0, "#1e1b4b");
            grad.addColorStop(0.5, "#312e81");
            grad.addColorStop(1, "#4c1d95");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);

            // Card branco central
            const pad = 48;
            const cardX = pad;
            const cardY = 100;
            const cardW = W - pad * 2;
            const cardH = H - 200;
            ctx.fillStyle = "#ffffff";
            roundRect(ctx, cardX, cardY, cardW, cardH, 28);
            ctx.fill();

            // Título
            ctx.fillStyle = "#7c3aed";
            ctx.font = "bold 42px system-ui, -apple-system, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("🔥 ACHADINHO DO DIA", W / 2, cardY + 60);

            const imgAreaY = cardY + 90;
            const imgAreaH = 520;
            const imgAreaX = cardX + 40;
            const imgAreaW = cardW - 80;

            // Área da imagem
            ctx.fillStyle = "#f3f4f6";
            roundRect(ctx, imgAreaX, imgAreaY, imgAreaW, imgAreaH, 16);
            ctx.fill();

            function desenharTextoEBotoes() {
                let y = imgAreaY + imgAreaH + 50;

                // Nome
                ctx.fillStyle = "#111827";
                ctx.font = "bold 36px system-ui, -apple-system, sans-serif";
                ctx.textAlign = "center";
                const nome = nomeResumido(produto.nome, 42);
                wrapText(ctx, nome, W / 2, y, cardW - 80, 44);
                y += 90;

                // Preço
                ctx.fillStyle = "#16a34a";
                ctx.font = "bold 52px system-ui, -apple-system, sans-serif";
                ctx.fillText(produto.preco || "Confira o preço", W / 2, y);
                y += 60;

                // Avaliação e vendas
                ctx.fillStyle = "#374151";
                ctx.font = "28px system-ui, -apple-system, sans-serif";
                const parts = [];
                if (produto.avaliacao != null && !isNaN(produto.avaliacao)) {
                    parts.push(`⭐ ${produto.avaliacao.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}`);
                }
                if (produto.vendas != null) {
                    parts.push(`🛒 ${formatarVendasTexto(produto.vendas)} vendas`);
                } else if (produto.vendasRaw && produto.vendasRaw !== "—") {
                    parts.push(`🛒 ${produto.vendasRaw} vendas`);
                }
                if (parts.length) {
                    ctx.fillText(parts.join("    "), W / 2, y);
                    y += 55;
                }

                // Botão visual VER OFERTA
                const btnW = 360;
                const btnH = 70;
                const btnX = (W - btnW) / 2;
                const btnY = Math.min(y + 20, H - 160);
                ctx.fillStyle = "#7c3aed";
                roundRect(ctx, btnX, btnY, btnW, btnH, 16);
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 32px system-ui, -apple-system, sans-serif";
                ctx.fillText("🛍️ VER OFERTA", W / 2, btnY + 46);

                try {
                    resolve(canvas.toDataURL("image/png"));
                } catch (e) {
                    reject(e);
                }
            }

            if (produto.imagem) {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => {
                    try {
                        // object-fit contain
                        const scale = Math.min(imgAreaW / img.width, imgAreaH / img.height);
                        const dw = img.width * scale;
                        const dh = img.height * scale;
                        const dx = imgAreaX + (imgAreaW - dw) / 2;
                        const dy = imgAreaY + (imgAreaH - dh) / 2;
                        ctx.drawImage(img, dx, dy, dw, dh);
                    } catch (e) {
                        // CORS ou outro erro ao desenhar
                        ctx.fillStyle = "#9ca3af";
                        ctx.font = "28px system-ui, sans-serif";
                        ctx.textAlign = "center";
                        ctx.fillText("Imagem indisponível para arte", W / 2, imgAreaY + imgAreaH / 2);
                    }
                    desenharTextoEBotoes();
                };
                img.onerror = () => {
                    ctx.fillStyle = "#9ca3af";
                    ctx.font = "28px system-ui, sans-serif";
                    ctx.textAlign = "center";
                    ctx.fillText("Imagem do produto não disponível", W / 2, imgAreaY + imgAreaH / 2);
                    desenharTextoEBotoes();
                };
                // Tenta carregar; se CORS bloquear, onerror ou toDataURL falha
                img.src = produto.imagem;
            } else {
                ctx.fillStyle = "#9ca3af";
                ctx.font = "28px system-ui, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("Imagem do produto não disponível", W / 2, imgAreaY + imgAreaH / 2);
                desenharTextoEBotoes();
            }
        });
    }

    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(" ");
        let line = "";
        let yy = y;
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + " ";
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                ctx.fillText(line.trim(), x, yy);
                line = words[n] + " ";
                yy += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line.trim(), x, yy);
    }

    /* ---------- Modal ---------- */

    let produtoAtual = null;
    let arteDataUrl = null;

    function abrirGerador(card) {
        produtoAtual = obterDadosProduto(card);
        arteDataUrl = null;

        const overlay = document.createElement("div");
        overlay.className = "ai-anuncio-overlay";
        overlay.id = "aiAnuncioOverlay";

        const temImagem = !!produtoAtual.imagem;

        overlay.innerHTML = `
            <div class="ai-anuncio-modal" role="dialog" aria-labelledby="aiAnuncioTitulo">

                <h2 id="aiAnuncioTitulo">📣 Gerar anúncio</h2>

                <div class="ai-anuncio-subtitulo">
                    Texto comercial pronto + arte para divulgar este produto.
                </div>

                <div class="ai-anuncio-img-wrap" id="aiImgWrap">
                    ${
                        temImagem
                            ? `<img src="${escaparHTML(produtoAtual.imagem)}" alt="${escaparHTML(produtoAtual.nome)}" id="aiProdutoImg">`
                            : `<div class="ai-anuncio-img-fallback">Imagem do produto não disponível.</div>`
                    }
                </div>

                <label for="aiPlataforma">Onde você vai divulgar?</label>
                <select id="aiPlataforma">
                    <option value="instagram">Instagram / Facebook</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="tiktok">TikTok</option>
                </select>

                <label for="aiTextoAnuncio">Anúncio (edite se quiser)</label>
                <textarea id="aiTextoAnuncio"></textarea>

                <div class="ai-anuncio-actions">
                    <button type="button" class="ai-anuncio-copy" id="aiCopiarAnuncio">
                        📋 Copiar anúncio
                    </button>
                    <button type="button" class="ai-anuncio-arte" id="aiCriarArte">
                        🎨 Criar arte
                    </button>
                    <button type="button" class="ai-anuncio-baixar" id="aiBaixarImg">
                        📷 Baixar imagem
                    </button>
                    <button type="button" class="ai-anuncio-share" id="aiCompartilhar">
                        📤 Compartilhar
                    </button>
                    <button type="button" class="ai-anuncio-close" id="aiFecharAnuncio">
                        Fechar
                    </button>
                </div>

                <div class="ai-anuncio-arte-preview" id="aiArtePreview">
                    <img id="aiArteImg" alt="Arte do anúncio">
                    <div class="ai-anuncio-arte-msg" id="aiArteMsg"></div>
                    <div class="ai-anuncio-arte-actions">
                        <a class="ai-anuncio-salvar-arte" id="aiSalvarArte" download="anuncio-afiliado.png">💾 Salvar arte</a>
                    </div>
                </div>

            </div>
        `;

        document.body.appendChild(overlay);

        // Trava scroll do body no mobile
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const select = document.getElementById("aiPlataforma");
        const textarea = document.getElementById("aiTextoAnuncio");
        const preview = document.getElementById("aiArtePreview");
        const arteImg = document.getElementById("aiArteImg");
        const arteMsg = document.getElementById("aiArteMsg");
        const salvarArte = document.getElementById("aiSalvarArte");

        function atualizarTexto() {
            textarea.value = gerarAnuncio(produtoAtual, select.value);
        }

        select.addEventListener("change", atualizarTexto);

        document.getElementById("aiFecharAnuncio").addEventListener("click", () => {
            document.body.style.overflow = prevOverflow;
            overlay.remove();
        });

        overlay.addEventListener("click", (evento) => {
            if (evento.target === overlay) {
                document.body.style.overflow = prevOverflow;
                overlay.remove();
            }
        });

        document.getElementById("aiCopiarAnuncio").addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(textarea.value);
                const botao = document.getElementById("aiCopiarAnuncio");
                botao.textContent = "✅ Copiado!";
                setTimeout(() => {
                    botao.textContent = "📋 Copiar anúncio";
                }, 1800);
            } catch (erro) {
                textarea.select();
                document.execCommand("copy");
                alert("Anúncio copiado!");
            }
        });

        document.getElementById("aiBaixarImg").addEventListener("click", () => {
            if (!produtoAtual.imagem) {
                alert("Imagem do produto não disponível.");
                return;
            }
            // Abre em nova aba para o usuário salvar (evita problemas de CORS no download forçado)
            const a = document.createElement("a");
            a.href = produtoAtual.imagem;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            a.download = "produto-shopee.jpg";
            document.body.appendChild(a);
            a.click();
            a.remove();
        });

        document.getElementById("aiCriarArte").addEventListener("click", async () => {
            const botao = document.getElementById("aiCriarArte");
            const textoOriginal = botao.textContent;
            botao.textContent = "⏳ Gerando...";
            botao.disabled = true;
            arteMsg.textContent = "";

            try {
                const dataUrl = await criarArteCanvas(produtoAtual);
                arteDataUrl = dataUrl;
                arteImg.src = dataUrl;
                salvarArte.href = dataUrl;
                preview.style.display = "block";
                arteMsg.textContent = "Arte pronta! Toque em “Salvar arte” para baixar no celular.";
                preview.scrollIntoView({ behavior: "smooth", block: "nearest" });
            } catch (err) {
                preview.style.display = "block";
                arteImg.removeAttribute("src");
                arteMsg.textContent =
                    "Não foi possível gerar a arte com a imagem (possível restrição de CORS da Shopee). " +
                    "Você ainda pode copiar o texto e baixar a imagem original do produto.";
                console.warn("Erro ao criar arte:", err);
            } finally {
                botao.textContent = textoOriginal;
                botao.disabled = false;
            }
        });

        document.getElementById("aiCompartilhar").addEventListener("click", async () => {
            const texto = textarea.value;
            try {
                if (navigator.share) {
                    const shareData = { text: texto };
                    if (arteDataUrl && navigator.canShare) {
                        try {
                            const res = await fetch(arteDataUrl);
                            const blob = await res.blob();
                            const file = new File([blob], "anuncio-afiliado.png", { type: "image/png" });
                            if (navigator.canShare({ files: [file], text: texto })) {
                                await navigator.share({ files: [file], text: texto, title: "Anúncio" });
                                return;
                            }
                        } catch (_) {
                            // fallback para só texto
                        }
                    }
                    await navigator.share(shareData);
                } else {
                    await navigator.clipboard.writeText(texto);
                    alert("Texto copiado! Cole onde quiser compartilhar.");
                }
            } catch (err) {
                if (err && err.name === "AbortError") return;
                try {
                    await navigator.clipboard.writeText(texto);
                    alert("Texto copiado!");
                } catch (_) {
                    alert("Não foi possível compartilhar automaticamente. Copie o texto manualmente.");
                }
            }
        });

        atualizarTexto();
    }

    function adicionarBotoes() {
        const cards = document.querySelectorAll(".product-card");

        cards.forEach(card => {
            if (card.querySelector(".ai-anuncio-button")) return;

            const botao = document.createElement("button");
            botao.className = "ai-anuncio-button";
            botao.type = "button";
            botao.textContent = "📣 Gerar anúncio";

            botao.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                abrirGerador(card);
            });

            // Preferência: inserir após .card-actions se existir
            const actions = card.querySelector(".card-actions");
            if (actions && actions.parentNode) {
                actions.parentNode.insertBefore(botao, actions.nextSibling);
            } else {
                card.appendChild(botao);
            }
        });
    }

    function iniciar() {
        adicionarBotoes();

        const observador = new MutationObserver(() => {
            adicionarBotoes();
        });

        observador.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }
})();
