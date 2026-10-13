/* Teste de ponta a ponta do quiz da lista de espera, no navegador.
   node scripts/e2e-lista.mjs [url] [pasta-das-capturas]
   ex.: node scripts/e2e-lista.mjs http://localhost:5211/ .shots/e2e        (modo demonstração: confere o localStorage)
        ADMIN_SENHA=… node scripts/e2e-lista.mjs http://localhost:8787/     (com a API: confere no Postgres, pelo CSV)
   Com a API, o site precisa ter VITE_LISTA_ESPERA_API=/api (o pnpm build já usa; no dev, .env.local). */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

const [URL = "http://localhost:5211/", pasta = ".shots/e2e"] = process.argv.slice(2);
const site = new globalThis.URL(URL);
const endereco = (caminho) => new globalThis.URL(caminho, site).href;
mkdirSync(pasta, { recursive: true });
const sufixo = Date.now().toString(36);
const emailViajante = `marina.${sufixo}@exemplo.com`;
const emailAgencia = `juliana.${sufixo}@rotasul.com.br`;
const emailFormula = `ana.${sufixo}@exemplo.com`;
const emailRobo = `robo.${sufixo}@spam.com`;
const emailUtm = `bruno.${sufixo}@exemplo.com`;

const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const erros = [];
const vigiar = (p) => {
  p.on("pageerror", (e) => erros.push(e.message));
  p.on("console", (m) => m.type() === "error" && erros.push(m.text()));
};
vigiar(page);

let falhas = 0;
const falhar = (msg) => {
  falhas++;
  console.log("FALHOU", msg);
};
const passo = async (nome, fn) => {
  try {
    await fn();
    console.log("ok  ", nome);
  } catch (e) {
    falhar(`${nome}\n      ${e.message.split("\n")[0]}`);
  }
};
const esperar = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

const quiz = page.locator('[role="dialog"][aria-label="Lista de espera"]');
const titulo = quiz.locator("#quiz-titulo");
const naPergunta = (texto) => titulo.filter({ hasText: texto }).waitFor({ timeout: 4000 });
const botao = (nome) => quiz.getByRole("button", { name: nome, exact: true }).click();
const campo = (id) => quiz.locator(`#quiz-${id}`);
const caminho = () => page.evaluate(() => window.location.pathname);
const focado = () => page.evaluate(() => document.activeElement?.id || document.activeElement?.textContent?.trim().slice(0, 40));
/** captura depois da troca de tela (a pergunta entra com uma animação curta) */
const foto = async (nome) => {
  await page.waitForTimeout(450);
  await page.screenshot({ path: `${pasta}/${nome}` });
};
const local = () => page.evaluate(() => JSON.parse(localStorage.getItem("meuguia-lista-espera") ?? "[]"));

/** o ramo de viajante inteiro, a partir da pergunta do perfil */
async function viajante({ nome, email, destino, quando = "Nos próximos 3 meses", comQuem = "Com a família", whatsapp }) {
  await naPergunta("Para começar, você é");
  await quiz.getByRole("radio", { name: /Viajante/ }).click();
  await naPergunta("Para onde é a sua próxima viagem");
  if (destino) await campo("destino").fill(destino);
  await botao(destino ? "Continuar" : "Pular");
  await naPergunta("Quando você vai viajar");
  await quiz.getByRole("radio", { name: new RegExp(quando) }).click();
  await naPergunta("Com quem você vai");
  await quiz.getByRole("radio", { name: new RegExp(comQuem) }).click();
  await naPergunta("O que você mais quer usar");
  await botao("Pular");
  await naPergunta("Como você se chama");
  await campo("nome").fill(nome);
  await page.keyboard.press("Enter");
  await naPergunta("qual é o seu melhor e-mail");
  await campo("email").fill(email);
  await page.keyboard.press("Enter");
  await naPergunta("Quer o aviso também no WhatsApp");
  if (whatsapp) await campo("whatsapp").fill(whatsapp);
  await botao("Entrar na lista");
}

await page.goto(URL, { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.removeItem("meuguia-lista-espera"));

await passo("botão do cabeçalho abre o quiz em /lista-de-espera, nas boas-vindas", async () => {
  await page.getByRole("banner").getByRole("button", { name: "Entrar na lista" }).click();
  await quiz.getByRole("button", { name: "Começar" }).waitFor({ timeout: 3000 });
  esperar((await caminho()) === "/lista-de-espera", `endereço ${await caminho()}`);
  esperar((await focado()) === "Começar", `foco em ${await focado()}`);
  esperar((await page.title()).startsWith("Lista de espera"), `título ${await page.title()}`);
  await foto("1-boas-vindas.png");
});

await passo("Enter começa; a letra A escolhe Viajante e avança sozinha", async () => {
  await page.keyboard.press("Enter");
  await naPergunta("Para começar, você é");
  await foto("2-perfil.png");
  await page.keyboard.press("a");
  await naPergunta("Para onde é a sua próxima viagem");
  esperar((await focado()) === "quiz-destino", `foco em ${await focado()}`);
});

await passo("Esc fecha o quiz, devolve o foco e o endereço; abrir de novo continua de onde parou", async () => {
  await page.keyboard.press("Escape");
  await quiz.waitFor({ state: "detached", timeout: 3000 });
  esperar((await caminho()) === "/", `endereço ${await caminho()}`);
  esperar((await focado()) === "Entrar na lista", `foco em ${await focado()}`);
  await page.getByRole("banner").getByRole("button", { name: "Entrar na lista" }).click();
  await naPergunta("Para onde é a sua próxima viagem");
});

await passo("destino: a sugestão preenche o campo e o Enter segue", async () => {
  await quiz.getByRole("button", { name: "Lisboa", exact: true }).click();
  esperar((await campo("destino").inputValue()) === "Lisboa", "campo não preenchido");
  esperar((await focado()) === "quiz-destino", `foco em ${await focado()}`);
  await foto("3-destino.png");
  await page.keyboard.press("Enter");
  await naPergunta("Quando você vai viajar");
});

await passo("escolhas: clique e letra avançam; Voltar mostra a resposta marcada", async () => {
  await quiz.getByRole("radio", { name: /Nos próximos 3 meses/ }).click();
  await naPergunta("Com quem você vai");
  await page.keyboard.press("c");
  await naPergunta("O que você mais quer usar");
  await botao("Voltar");
  await naPergunta("Com quem você vai");
  esperar((await quiz.getByRole("radio", { name: /Com a família/ }).getAttribute("aria-checked")) === "true", "resposta perdida ao voltar");
  await botao("Continuar");
  await naPergunta("O que você mais quer usar");
});

await passo("várias escolhas: B e D marcam, Continuar segue", async () => {
  await page.keyboard.press("b");
  await page.keyboard.press("d");
  const marcadas = await quiz.getByRole("checkbox", { checked: true }).allTextContents();
  esperar(marcadas.length === 2, `marcadas: ${marcadas}`);
  await foto("4-interesses.png");
  await botao("Continuar");
  await naPergunta("Como você se chama");
});

await passo("nome vazio e e-mail inválido são recusados", async () => {
  await page.keyboard.press("Enter");
  await quiz.getByText("Informe seu nome").waitFor({ timeout: 2000 });
  await campo("nome").fill("Marina Lopes");
  await page.keyboard.press("Enter");
  await naPergunta("Marina, qual é o seu melhor e-mail?");
  await campo("email").fill("marina@exemplo");
  await page.keyboard.press("Enter");
  await quiz.getByText("E-mail inválido").waitFor({ timeout: 2000 });
  await foto("5-email-invalido.png");
  await campo("email").fill(emailViajante.toUpperCase());
  await page.keyboard.press("Enter");
  await naPergunta("Quer o aviso também no WhatsApp");
});

await passo("WhatsApp incompleto é recusado; máscara; viajante entra na lista", async () => {
  await campo("whatsapp").fill("1198");
  await botao("Entrar na lista");
  await quiz.getByText("WhatsApp inválido").waitFor({ timeout: 2000 });
  await campo("whatsapp").fill("11987654321");
  const mascara = await campo("whatsapp").inputValue();
  esperar(mascara === "(11) 98765-4321", `máscara: ${mascara}`);
  await foto("6-whatsapp.png");
  await botao("Entrar na lista");
  await quiz.getByText("Você está na lista, Marina").waitFor({ timeout: 15000 });
  await foto("7-inscrito.png");
});

await passo("o mesmo e-mail de novo recebe a mesma confirmação (não revela quem está na lista)", async () => {
  await botao("Inscrever outra pessoa");
  await viajante({ nome: "Marina L.", email: emailViajante });
  await quiz.getByText("Você está na lista, Marina").waitFor({ timeout: 15000 });
});

await passo("nome começando com = é limpo antes de gravar (sem fórmula na planilha)", async () => {
  await botao("Inscrever outra pessoa");
  await viajante({ nome: "=Ana Teste", email: emailFormula, destino: "+Roma" });
  await quiz.getByText("Você está na lista, Ana").waitFor({ timeout: 15000 });
});

await passo("“Quero para minha agência” abre o quiz já no ramo da agência", async () => {
  await botao("Voltar ao site");
  await quiz.waitFor({ state: "detached", timeout: 3000 });
  await page.getByRole("button", { name: "Quero para minha agência" }).click();
  await naPergunta("Qual é o nome da agência?");
  const progresso = await quiz.getByText(/Pergunta \d+ de \d+/).textContent();
  esperar(progresso === "Pergunta 2 de 6", `progresso: ${progresso}`);
});

await passo("agência: nome, viagens por mês, e WhatsApp obrigatório", async () => {
  await page.keyboard.press("Enter");
  await quiz.getByText("Informe o nome da agência").waitFor({ timeout: 2000 });
  await campo("agencia").fill("Rota Sul Viagens");
  await page.keyboard.press("Enter");
  await naPergunta("Quantas viagens a agência vende por mês?");
  await foto("8-agencia-viagens.png");
  await quiz.getByRole("radio", { name: /De 31 a 100/ }).click();
  await naPergunta("E qual é o seu nome?");
  await campo("nome").fill("Juliana Martins");
  await page.keyboard.press("Enter");
  await naPergunta("Juliana, qual é o seu melhor e-mail?");
  await campo("email").fill(emailAgencia);
  await page.keyboard.press("Enter");
  await naPergunta("Qual é o WhatsApp da agência?");
  await botao("Entrar na lista");
  await quiz.getByText("Informe o WhatsApp da agência").waitFor({ timeout: 2000 });
  await campo("whatsapp").fill("51998765432");
  await botao("Entrar na lista");
  await quiz.getByText("Recebemos o contato da Rota Sul Viagens").waitFor({ timeout: 15000 });
  await foto("9-agencia.png");
});

await passo("“Sugerir um destino” abre na pergunta do destino", async () => {
  await botao("Voltar ao site");
  await quiz.waitFor({ state: "detached", timeout: 3000 });
  await page.getByRole("button", { name: "Sugerir um destino" }).click();
  await naPergunta("Para onde é a sua próxima viagem");
});

await passo("o Voltar do navegador fecha o quiz", async () => {
  await page.goBack();
  await quiz.waitFor({ state: "detached", timeout: 3000 });
  esperar((await caminho()) === "/", `endereço ${await caminho()}`);
});

await passo("na seção da lista, “Agência de viagens” abre o quiz no ramo da agência", async () => {
  await page.locator("#lista").getByRole("button", { name: /Agência de viagens/ }).click();
  await naPergunta("Qual é o nome da agência?");
  await page.keyboard.press("Escape");
  await quiz.waitFor({ state: "detached", timeout: 3000 });
});

await passo("campo-armadilha preenchido: finge sucesso e não envia", async () => {
  const antes = (await local()).length;
  await page.getByRole("banner").getByRole("button", { name: "Entrar na lista" }).click();
  await naPergunta("Qual é o nome da agência?");
  await botao("Voltar");
  await naPergunta("Para começar, você é");
  await quiz.locator('input[tabindex="-1"]').fill("http://spam.example");
  await viajante({ nome: "Robô", email: emailRobo });
  await quiz.getByText("Você está na lista, Robô").waitFor({ timeout: 5000 });
  esperar((await local()).length === antes, "gravou a inscrição do robô");
});

await passo("link direto com UTM: abre só o quiz, grava a origem e “Voltar ao site” carrega a página", async () => {
  await page.goto(endereco("/lista-de-espera?utm_source=instagram&utm_campaign=lancamento"), { waitUntil: "networkidle" });
  await quiz.getByRole("button", { name: "Começar" }).waitFor({ timeout: 3000 });
  esperar((await page.locator("#lista").count()) === 0, "a página carregou por baixo do quiz");
  await botao("Começar");
  await viajante({ nome: "Bruno Dias", email: emailUtm, quando: "Ainda não tenho data", comQuem: "Em casal" });
  await quiz.getByText("Você está na lista, Bruno").waitFor({ timeout: 15000 });
  await botao("Voltar ao site");
  await page.locator("#lista").waitFor({ timeout: 5000 });
  const url = await page.evaluate(() => window.location.pathname + window.location.search);
  esperar(url === "/?utm_source=instagram&utm_campaign=lancamento", `endereço ${url}`);
});

/* ------------------------------- no celular ------------------------------- */

const celular = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
vigiar(celular);
await passo("celular: sem atalhos de teclado, cursor não vai sozinho para o campo, sem rolagem horizontal", async () => {
  await celular.goto(endereco("/lista-de-espera"), { waitUntil: "networkidle" });
  const q = celular.locator('[role="dialog"][aria-label="Lista de espera"]');
  await q.getByRole("button", { name: "Começar" }).tap();
  await q.locator("#quiz-titulo").filter({ hasText: "Para começar" }).waitFor({ timeout: 4000 });
  esperar((await q.locator("kbd").count()) === 0, "mostra atalhos de teclado no celular");
  await celular.waitForTimeout(400);
  await celular.screenshot({ path: `${pasta}/10-celular-perfil.png` });
  await q.getByRole("radio", { name: /Viajante/ }).tap();
  await q.locator("#quiz-titulo").filter({ hasText: "Para onde" }).waitFor({ timeout: 4000 });
  const foco = await celular.evaluate(() => document.activeElement?.id);
  esperar(foco === "quiz-titulo", `foco em ${foco}`);
  await celular.waitForTimeout(400);
  await celular.screenshot({ path: `${pasta}/11-celular-destino.png` });
  const doc = await celular.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  esperar(doc.scroll <= doc.client, `rolagem horizontal (${doc.scroll} > ${doc.client})`);
});
await celular.close();

/* linha do CSV da API: separada por ;, com aspas quando o texto tem ; ou " */
function dividir(linha) {
  const celulas = [];
  let atual = "";
  let aspas = false;
  for (let i = 0; i < linha.length; i++) {
    const ch = linha[i];
    if (aspas && ch === '"' && linha[i + 1] === '"') {
      atual += '"';
      i++;
    } else if (ch === '"') aspas = !aspas;
    else if (ch === ";" && !aspas) {
      celulas.push(atual);
      atual = "";
    } else atual += ch;
  }
  return [...celulas, atual];
}
async function lerCsvDaApi() {
  const credencial = Buffer.from(`${process.env.ADMIN_USUARIO ?? "admin"}:${process.env.ADMIN_SENHA}`).toString("base64");
  const r = await fetch(endereco("/api/lista-espera.csv"), { headers: { authorization: `Basic ${credencial}` } });
  if (!r.ok) throw new Error(`o CSV da API respondeu ${r.status}`);
  const [cabecalho, ...linhas] = (await r.text()).split("\r\n").filter(Boolean);
  const colunas = dividir(cabecalho);
  return linhas.map((l) => Object.fromEntries(dividir(l).map((v, i) => [colunas[i], v || null])));
}

/* o que ficou gravado: no Postgres (pelo CSV da API) ou no navegador (demonstração) */
const comApi = !!process.env.ADMIN_SENHA;
const gravadas = (comApi ? await lerCsvDaApi() : await local()).filter((g) => g.email?.includes(sufixo));
console.log(`\ngravadas ${comApi ? "no Postgres (CSV da API)" : "no localStorage (demonstração)"}: ${gravadas.length}`);
for (const g of gravadas) console.log("  ", JSON.stringify(g));

const doEmail = (e) => gravadas.filter((g) => g.email === e);
/* no localStorage os interesses são uma lista; no CSV, texto separado por vírgula */
const lista = (v) => (Array.isArray(v) ? v.join(", ") : v);
const marina = doEmail(emailViajante);
if (marina.length !== 1) falhar(`e-mail repetido gravado ${marina.length} vezes`);
const m = marina[0] ?? {};
if (m.nome !== "Marina Lopes" || m.destino !== "Lisboa" || m.whatsapp !== "(11) 98765-4321") falhar(`dados da Marina: ${JSON.stringify(m)}`);
if (m.quando !== "3-meses" || m.com_quem !== "familia" || lista(m.interesses) !== "mapa, assistente") falhar(`respostas do quiz da Marina: ${JSON.stringify(m)}`);
const ana = doEmail(emailFormula)[0];
if (!ana || ana.nome !== "Ana Teste" || ana.destino !== "Roma") falhar(`texto com fórmula não foi limpo: ${JSON.stringify(ana)}`);
const juliana = doEmail(emailAgencia)[0];
if (juliana?.agencia !== "Rota Sul Viagens" || juliana.viagens_mes !== "31-100" || juliana.quando) falhar(`agência: ${JSON.stringify(juliana)}`);
if (doEmail(emailRobo).length) falhar("a armadilha deixou passar o robô");
const bruno = doEmail(emailUtm)[0];
if (bruno?.utm_source !== "instagram" || bruno.utm_campaign !== "lancamento" || bruno.quando !== "sem-data" || bruno.com_quem !== "casal") falhar(`origem (UTM) e respostas do Bruno: ${JSON.stringify(bruno)}`);

if (erros.length) falhar("erros no console:\n" + erros.join("\n"));
await browser.close();
console.log(falhas ? `\n${falhas} falha(s)` : "\ntudo certo");
process.exit(falhas ? 1 : 0);
