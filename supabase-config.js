const SUPABASE_URL = "https://ajjbtuhnvdehcxqykfkf.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_UD6ktmFQ0yW9fVIHRH7EVQ_gGsn5Al4";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

/* ============================================================
   AFILIADO INTELIGENTE — GERADOR DE ANÚNCIOS
   ============================================================ */

(function () {
    if (!window.location.pathname.endsWith("/produtos.html")) return;

    const estilo = document.createElement("style");

    estilo.textContent = `
        .ai-anuncio-button {
            width: 100%;
            margin-top: 8px;
            padding: 11px 14px;
            border: 0;
            border-radius: 9px;
            background: #7c3aed;
            color: white;
            font-weight: 700;
            cursor: pointer;
            font-size: 14px;
        }

        .ai-anuncio-button:hover {
            opacity: .9;
        }

        .ai-anuncio-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,.65);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 18px;
            z-index: 99999;
        }

        .ai-anuncio-modal {
            width: min(620px, 100%);
            max-height: 90vh;
            overflow-y: auto;
            background: #fff;
            border-radius: 16px;
            padding: 22px;
            box-shadow: 0 20px 60px rgba(0,0,0,.3);
        }

        .ai-anuncio-modal h2 {
            margin: 0 0 6px;
            color: #111827;
        }

        .ai-anuncio-subtitulo {
            margin-bottom: 16px;
            color: #6b7280;
            font-size: 14px;
        }

        .ai-anuncio-modal label {
            display: block;
            margin: 12px 0 6px;
            font-weight: 700;
        }

        .ai-anuncio-modal select,
        .ai-anuncio-modal textarea {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid #d1d5db;
            border-radius: 9px;
            padding: 11px;
            font-size: 14px;
        }

        .ai-anuncio-modal textarea {
            min-height: 300px;
            resize: vertical;
        }

        .ai-anuncio-actions {
            display: flex;
            gap: 10px;
            margin-top: 14px;
        }

        .ai-anuncio-actions button {
            flex: 1;
            padding: 12px;
            border: 0;
            border-radius: 9px;
            font-weight: 700;
            cursor: pointer;
        }

        .ai-anuncio-copy {
            background: #16a34a;
            color: white;
        }

        .ai-anuncio-close {
            background: #e5e7eb;
            color: #111827;
        }

        @media (max-width: 500px) {
            .ai-anuncio-actions {
                flex-direction: column;
            }
        }
    `;

    document.head.appendChild(estilo);

    function limparTexto(texto) {
        return (texto || "").replace(/\\s+/g, " ").trim();
    }

    function escaparHTML(texto) {
        return String(texto || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function obterDadosProduto(card) {
        const nome =
            limparTexto(
                card.querySelector(".product-name")?.textContent
            ) || "Produto em destaque";

        const preco =
            limparTexto(
                card.querySelector(".product-price")?.textContent
            );

        const comissao =
            limparTexto(
                card.querySelector(".commission-value")?.textContent
            );

        const metas = [
            ...card.querySelectorAll(".meta-item")
        ]
            .map(el => limparTexto(el.textContent))
            .filter(Boolean);

        let link = "";

        const botoes = [
            ...card.querySelectorAll("[onclick]")
        ];

        for (const botao of botoes) {
            const onclick = botao.getAttribute("onclick") || "";

            const encontrado =
                onclick.match(
                    /abrirProduto\\(['"]([^'"]*)['"]\\)/
                );

            if (encontrado) {
                link = encontrado[1];
                break;
            }
        }

        return {
            nome,
            preco,
            comissao,
            meta: metas.join(" • "),
            link
        };
    }

    function gerarAnuncio(produto, plataforma) {
        const nome = produto.nome;
        const preco = produto.preco || "Confira o preço";
        const comissao = produto.comissao
            ? `💵 ${produto.comissao}`
            : "";
        const meta = produto.meta
            ? produto.meta
            : "";

        const link = produto.link || "";

        if (plataforma === "whatsapp") {
            return `🔥 ACHADO NA SHOPEE!

${nome}

💰 ${preco}
${comissao}
${meta}

✨ Uma ótima oportunidade para quem está procurando esse tipo de produto!

👉 Confira aqui:
${link}

⏳ Aproveite enquanto a oferta estiver disponível!`;
        }

        if (plataforma === "tiktok") {
            return `🔥 OLHA ESSE ACHADO!

${nome}

💰 ${preco}
${meta}

Se você estava procurando algo assim, vale a pena conferir 👀

👉 Link do produto:
${link}

#shopee #achadinhos #ofertas #promocao #compras`;
        }

        return `🔥 ACHADINHO QUE VALE A PENA CONFERIR!

${nome}

💰 ${preco}
${comissao}
${meta}

✨ Encontrei esse produto na Shopee e ele chamou atenção pelo conjunto de preço e avaliações.

👉 Confira a oferta:
${link}

⏳ Aproveite enquanto estiver disponível!

#shopee #achadinhos #ofertas #promocao #compras`;
    }

    let produtoAtual = null;

    function abrirGerador(card) {
        produtoAtual = obterDadosProduto(card);

        const overlay = document.createElement("div");
        overlay.className = "ai-anuncio-overlay";
        overlay.id = "aiAnuncioOverlay";

        overlay.innerHTML = `
            <div class="ai-anuncio-modal">

                <h2>📣 Gerar anúncio</h2>

                <div class="ai-anuncio-subtitulo">
                    Crie rapidamente um texto pronto para divulgar este produto.
                </div>

                <label for="aiPlataforma">
                    Onde você vai divulgar?
                </label>

                <select id="aiPlataforma">
                    <option value="instagram">
                        Instagram / Facebook
                    </option>

                    <option value="whatsapp">
                        WhatsApp
                    </option>

                    <option value="tiktok">
                        TikTok
                    </option>
                </select>

                <label for="aiTextoAnuncio">
                    Anúncio
                </label>

                <textarea id="aiTextoAnuncio"></textarea>

                <div class="ai-anuncio-actions">

                    <button
                        class="ai-anuncio-copy"
                        id="aiCopiarAnuncio"
                    >
                        📋 Copiar anúncio
                    </button>

                    <button
                        class="ai-anuncio-close"
                        id="aiFecharAnuncio"
                    >
                        Fechar
                    </button>

                </div>

            </div>
        `;

        document.body.appendChild(overlay);

        const select =
            document.getElementById("aiPlataforma");

        const textarea =
            document.getElementById("aiTextoAnuncio");

        function atualizarTexto() {
            textarea.value =
                gerarAnuncio(
                    produtoAtual,
                    select.value
                );
        }

        select.addEventListener(
            "change",
            atualizarTexto
        );

        document
            .getElementById("aiFecharAnuncio")
            .addEventListener("click", () => {
                overlay.remove();
            });

        document
            .getElementById("aiCopiarAnuncio")
            .addEventListener("click", async () => {

                try {
                    await navigator.clipboard.writeText(
                        textarea.value
                    );

                    const botao =
                        document.getElementById(
                            "aiCopiarAnuncio"
                        );

                    botao.textContent =
                        "✅ Copiado!";

                    setTimeout(() => {
                        botao.textContent =
                            "📋 Copiar anúncio";
                    }, 1800);

                } catch (erro) {
                    textarea.select();
                    document.execCommand("copy");

                    alert(
                        "Anúncio copiado!"
                    );
                }
            });

        overlay.addEventListener("click", (evento) => {
            if (evento.target === overlay) {
                overlay.remove();
            }
        });

        atualizarTexto();
    }

    function adicionarBotoes() {
        const cards =
            document.querySelectorAll(".product-card");

        cards.forEach(card => {

            if (
                card.querySelector(
                    ".ai-anuncio-button"
                )
            ) {
                return;
            }

            const botao =
                document.createElement("button");

            botao.className =
                "ai-anuncio-button";

            botao.type = "button";

            botao.textContent =
                "📣 Gerar anúncio";

            botao.addEventListener(
                "click",
                () => abrirGerador(card)
            );

            card.appendChild(botao);
        });
    }

    function iniciar() {
        adicionarBotoes();

        const observador =
            new MutationObserver(() => {
                adicionarBotoes();
            });

        observador.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );
    }

    if (
        document.readyState === "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            iniciar
        );
    } else {
        iniciar();
    }

})();
