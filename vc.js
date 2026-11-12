/*
  VCs DO MOVE — edite só esta lista.

  lider    → nome do líder
  bairro   → bairro onde o VC acontece
  foto     → caminho da foto (ex.: "assets/vc/joao.webp"). Vazio = espaço sem foto.
  foco     → (opcional) ponto da foto que não pode ser cortado: "horizontal vertical".
             Ex.: "50% 15%" = centro, perto do topo (onde costuma ficar o rosto).
  whatsapp → número do líder só com dígitos, com 55 + DDD (ex.: "5583999998888").
             Vazio = vai para o WhatsApp geral do Move.
*/
const VCS = [
  { lider: "Arthur",  bairro: "Jatobá",        foto: "assets/vc/arthur.webp",  foco: "50% 15%", whatsapp: "5583996096077" },
  { lider: "Duda",    bairro: "Monte Castelo", foto: "assets/vc/duda.webp",    foco: "50% 30%", whatsapp: "5583999820886" },
  { lider: "Vanessa", bairro: "Salgadinho",    foto: "assets/vc/vanessa.webp", foco: "50% 10%", whatsapp: "5583999982319" },
  { lider: "Allana Vernancio", bairro: "Monte Castelo", foto: "assets/vc/allana.webp", foco: "65% 40%", whatsapp: "5583998057284" },
  { lider: "Asdrúbal", bairro: "UNIFIP", foto: "assets/vc/asdrubal.webp", foco: "45% 15%", whatsapp: "5584996284031" },
  { lider: "Vinicius", bairro: "Praça do São Sebastião", foto: "assets/vc/vinicius.webp", foco: "65% 35%", whatsapp: "5583921464141" },
  { lider: "Romário", bairro: "São Sebastião", foto: "assets/vc/romario.webp", foco: "48% 20%", whatsapp: "5583988334473" },
];

const WHATSAPP_MOVE = "5583996096077";

/* ------------------------------------------------------------------ */

const botao = document.getElementById("vc-botao");
const painel = document.getElementById("vc-painel");
const lista = document.getElementById("vc-lista");
const nome = document.getElementById("vc-nome");
const bairro = document.getElementById("vc-bairro");
const detalhe = document.getElementById("vc-detalhe");
const semMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;

const semFoto = `
  <span class="meio-tom-amarelo absolute inset-0"></span>
  <svg viewBox="0 0 24 24" aria-hidden="true" class="absolute inset-0 m-auto size-2/5 fill-none stroke-amarelo stroke-[1.25]">
    <circle cx="12" cy="8.5" r="4"/>
    <path d="M4 21c0-4.4 3.6-7.5 8-7.5s8 3.100 8 7.5" stroke-linecap="round"/>
  </svg>`;

const foto = (vc) =>
  vc.foto
    ? `<img src="${vc.foto}" alt="" loading="lazy" style="object-position:${vc.foco || "50% 25%"}" class="absolute inset-0 size-full object-cover">`
    : semFoto;

function linkWhatsApp(vc) {
  const numero = vc.whatsapp || WHATSAPP_MOVE;
  const msg = `Olá, ${vc.lider}! Vi o VC do bairro ${vc.bairro} no link do Move e quero participar.`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;
}

/* ---------- cards do carrossel ---------- */
lista.innerHTML = VCS.map((vc, i) => `
  <li class="relative shrink-0 basis-[70%] snap-center">
    <button type="button" data-vc="${i}" aria-label="${vc.lider}, ${vc.bairro}"
      class="relative block aspect-[3/4] w-full origin-center cursor-pointer overflow-hidden rounded-2xl bg-cartaz shadow-[0_18px_36px_rgba(0,0,0,.6)] ring-1 ring-papel/15 ring-inset outline-none will-change-transform focus-visible:ring-3 focus-visible:ring-papel">
      ${foto(vc)}
    </button>
  </li>`).join("");

const itens = [...lista.children];
let ativo = 0;

/* posiciona os cards: o do meio grande, os vizinhos menores e por trás */
function atualizar() {
  const centro = lista.scrollLeft + lista.clientWidth / 2;
  let menor = Infinity;

  itens.forEach((li, i) => {
    const d = (li.offsetLeft + li.offsetWidth / 2 - centro) / li.offsetWidth;
    const a = Math.min(Math.abs(d), 2);
    const escala = 1 - a * 0.2;
    const puxa = -Math.sign(d) * a * 30; // aproxima os vizinhos do centro (sobreposição)

    li.style.zIndex = String(100 - Math.round(a * 10));
    const card = li.firstElementChild;
    card.style.transform = `translateX(${puxa}%) scale(${escala})`;
    card.style.filter = `brightness(${1 - a * 0.3})`;

    if (Math.abs(d) < menor) { menor = Math.abs(d); ativo = i; }
  });

  itens.forEach((li, i) => li.firstElementChild.setAttribute("aria-current", String(i === ativo)));
  nome.textContent = VCS[ativo].lider;
  bairro.textContent = VCS[ativo].bairro;
}

let quadro = 0;
lista.addEventListener("scroll", () => {
  cancelAnimationFrame(quadro);
  quadro = requestAnimationFrame(atualizar);
}, { passive: true });
addEventListener("resize", atualizar);

function centralizar(i, suave = true) {
  const li = itens[i];
  lista.scrollTo({
    left: li.offsetLeft - (lista.clientWidth - li.offsetWidth) / 2,
    behavior: suave && !semMovimento ? "smooth" : "auto",
  });
}

/* ---------- abrir/fechar o painel ---------- */
function alternarPainel() {
  const aberto = botao.getAttribute("aria-expanded") === "true";
  botao.setAttribute("aria-expanded", String(!aberto));
  painel.toggleAttribute("data-aberto", !aberto);
  painel.inert = aberto;
  if (!aberto) {
    centralizar(Math.floor(VCS.length / 2), false); // começa pelo do meio
    atualizar();
  }
}
painel.inert = true;
botao.addEventListener("click", alternarPainel);

/* ---------- tocar num card ---------- */
lista.addEventListener("click", (e) => {
  const card = e.target.closest("[data-vc]");
  if (!card) return;
  const i = Number(card.dataset.vc);
  if (i !== ativo) return centralizar(i); // card do lado: traz para o meio
  abrirDetalhe(VCS[i]);                    // card do meio: abre os detalhes
});

/* teclado: Tab leva o card focado para o meio */
lista.addEventListener("focusin", (e) => {
  const card = e.target.closest("[data-vc]");
  if (card) centralizar(Number(card.dataset.vc));
});

/* ---------- janela de detalhes ---------- */
function abrirDetalhe(vc) {
  detalhe.querySelector("[data-foto]").innerHTML = foto(vc);
  detalhe.querySelector("[data-bairro]").textContent = vc.bairro;
  detalhe.querySelector("[data-lider]").textContent = vc.lider;
  const zap = detalhe.querySelector("[data-whatsapp]");
  zap.href = linkWhatsApp(vc);
  zap.querySelector("span").textContent = `Conversar com ${vc.lider.split(" ")[0]}`;
  detalhe.showModal();
}

/* ---------- janela "Como chegar" (Google Maps ou Waze) ---------- */
const comoChegar = document.getElementById("como-chegar");
document.getElementById("como-chegar-botao").addEventListener("click", () => comoChegar.showModal());
/* depois de escolher o app, a janela fecha (para não estar aberta quando a pessoa voltar) */
comoChegar.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => comoChegar.close()));

/* fecha qualquer janela ao tocar fora dela */
for (const janela of [detalhe, comoChegar]) {
  janela.addEventListener("click", (e) => {
    if (e.target === janela) janela.close();
  });
}
