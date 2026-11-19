// Robô que confere o Instagram da gincana e registra as postagens novas em instagram.json.
// Roda no GitHub Actions (.github/workflows/instagram.yml). Sem dependências: Node 20+.
//
// Segredos (Settings → Secrets and variables → Actions):
//   IG_TOKEN            token da API do Instagram (Meta), com acesso à conta Comercial/Criador da equipe
//   IG_USER_ID          ID da conta do Instagram da equipe na API (não é o @)
//   NTFY_TOPIC          (opcional) nome do tópico no app ntfy para receber avisos no celular
//   TELEGRAM_BOT_TOKEN  (opcional) token de um bot do Telegram
//   TELEGRAM_CHAT_ID    (opcional) ID do grupo/conversa do Telegram que recebe os avisos
// Para testar sem a API: IG_FIXTURE=caminho/para/resposta.json

import { readFile, writeFile } from "node:fs/promises";

const CONTA = process.env.IG_CONTA_ALVO || "gincanamartinholutero";
const ARQUIVO = process.env.IG_ARQUIVO || "instagram.json";
const SITE = process.env.SITE_URL || "https://schackschuck.github.io/gincana-ulbra/";
const API = "https://graph.facebook.com/v21.0";
const MAX_GUARDADAS = 300;
const MAX_AVISOS_INDIVIDUAIS = 5;

const env = k => (process.env[k] || "").trim();

async function lerAtual() {
  try { return JSON.parse(await readFile(ARQUIVO, "utf8")); } catch { return null; }
}

async function buscarPostagens() {
  let corpo;
  if (env("IG_FIXTURE")) {
    corpo = JSON.parse(await readFile(env("IG_FIXTURE"), "utf8"));
  } else {
    const campos = `business_discovery.username(${CONTA}){username,media.limit(30){id,caption,permalink,timestamp,media_type}}`;
    const url = `${API}/${env("IG_USER_ID")}?fields=${encodeURIComponent(campos)}&access_token=${encodeURIComponent(env("IG_TOKEN"))}`;
    const r = await fetch(url).catch(e => { throw new Error("Não consegui acessar a API do Instagram: " + (e.cause?.message || e.message)); });
    corpo = await r.json().catch(() => ({}));
    if (!r.ok || corpo.error) {
      const e = corpo.error || {};
      let dica = "";
      if (e.code === 190) dica = " → O token expirou ou é inválido. Gere outro e atualize o segredo IG_TOKEN.";
      else if (e.code === 110 || /business_discovery|cannot be found|Invalid user id/i.test(e.message || ""))
        dica = ` → Confira o IG_USER_ID e se @${CONTA} é uma conta Comercial ou de Criador (a API só enxerga esse tipo de conta).`;
      throw new Error(`API do Instagram respondeu ${r.status}: ${e.message || JSON.stringify(corpo)}${dica}`);
    }
  }
  const media = corpo?.business_discovery?.media?.data || [];
  return media.map(m => ({
    id: String(m.id),
    link: m.permalink || "",
    legenda: m.caption || "",
    data: m.timestamp ? new Date(m.timestamp).toISOString() : "",
    tipo: m.media_type || "",
  }));
}

const resumo = (txt, n) => { const s = String(txt || "").replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n - 1) + "…" : s; };

async function avisar(titulo, mensagem, link) {
  const tarefas = [];
  if (env("NTFY_TOPIC")) {
    tarefas.push(fetch("https://ntfy.sh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: env("NTFY_TOPIC"), title: titulo, message: mensagem, click: link || SITE, tags: ["loudspeaker"], priority: 4,
        actions: [{ action: "view", label: "Abrir o site", url: SITE }] }),
    }).then(r => { if (!r.ok) throw new Error("ntfy " + r.status); }));
  }
  if (env("TELEGRAM_BOT_TOKEN") && env("TELEGRAM_CHAT_ID")) {
    tarefas.push(fetch(`https://api.telegram.org/bot${env("TELEGRAM_BOT_TOKEN")}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: env("TELEGRAM_CHAT_ID"), text: `📣 ${titulo}\n\n${mensagem}${link ? "\n\n" + link : ""}\n\nSite: ${SITE}` }),
    }).then(r => { if (!r.ok) throw new Error("telegram " + r.status); }));
  }
  if (!tarefas.length) { console.log("(nenhum canal de aviso configurado) " + titulo); return; }
  for (const r of await Promise.allSettled(tarefas))
    if (r.status === "rejected") console.warn("Aviso não enviado: " + r.reason?.message);
}

async function main() {
  if (!env("IG_FIXTURE") && (!env("IG_TOKEN") || !env("IG_USER_ID"))) {
    console.log("Segredos IG_TOKEN e IG_USER_ID ainda não configurados; nada a fazer por enquanto. Veja o README.");
    return;
  }

  const atual = await lerAtual();
  const primeiraVez = !atual || !atual.atualizado;
  const antigas = Array.isArray(atual?.postagens) ? atual.postagens : [];
  const porId = new Map(antigas.map(p => [String(p.id), p]));

  const recebidas = await buscarPostagens();
  const novas = recebidas.filter(p => !porId.has(p.id));
  let editadas = 0;
  for (const p of recebidas) {
    const velha = porId.get(p.id);
    if (velha && (velha.legenda !== p.legenda || velha.link !== p.link)) { Object.assign(velha, p); editadas++; }
  }

  console.log(`@${CONTA}: ${recebidas.length} postagens lidas, ${novas.length} novas, ${editadas} com legenda alterada.`);
  if (!novas.length && !editadas && !primeiraVez) return;

  const postagens = [...novas, ...antigas]
    .sort((a, b) => String(b.data).localeCompare(String(a.data)))
    .slice(0, MAX_GUARDADAS);
  await writeFile(ARQUIVO, JSON.stringify({ conta: CONTA, atualizado: new Date().toISOString(), postagens }, null, 2) + "\n");

  if (primeiraVez) {
    await avisar("Robô da gincana ativado ✅",
      `Acompanhando @${CONTA}. ${postagens.length} postagens já existentes foram registradas no site; a partir de agora você recebe um aviso a cada postagem nova.`);
    return;
  }
  const ordem = [...novas].sort((a, b) => String(a.data).localeCompare(String(b.data)));
  if (ordem.length > MAX_AVISOS_INDIVIDUAIS) {
    await avisar(`${ordem.length} postagens novas da gincana`, ordem.map(p => "• " + resumo(p.legenda, 80)).join("\n"), SITE);
  } else {
    for (const p of ordem) await avisar("Nova postagem da gincana!", resumo(p.legenda, 300) || "(sem legenda)", p.link);
  }
}

main().catch(e => { console.error(e.message || e); process.exit(1); });
