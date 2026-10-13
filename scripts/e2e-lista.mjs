/* Teste de ponta a ponta do formulário da lista de espera, no navegador.
   node scripts/e2e-lista.mjs [url] [pasta-das-capturas]
   ex.: node scripts/e2e-lista.mjs http://localhost:5211/ .shots/e2e        (modo demonstração: confere o localStorage)
        ADMIN_SENHA=… node scripts/e2e-lista.mjs http://localhost:8787/     (com a API: confere no Postgres, pelo CSV)
   Com a API, o site precisa ter VITE_LISTA_ESPERA_API=/api (o pnpm build já usa; no dev, .env.local). */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

const [URL = "http://localhost:5211/", pasta = ".shots/e2e"] = process.argv.slice(2);
mkdirSync(pasta, { recursive: true });
const sufixo = Date.now().toString(36);
const emailViajante = `marina.${sufixo}@exemplo.com`;
const emailAgencia = `juliana.${sufixo}@rotasul.com.br`;
const emailFormula = `ana.${sufixo}@exemplo.com`;
const emailRobo = `robo.${sufixo}@spam.com`;

const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const erros = [];
page.on("pageerror", (e) => erros.push(e.message));
page.on("console", (m) => m.type() === "error" && erros.push(m.text()));

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
const form = page.locator("#lista form");
const campo = (id) => page.locator(`#lista-${id}`);
const enviar = () => form.getByRole("button", { name: "Entrar na lista" }).click();
const outra = () => page.getByRole("button", { name: "Inscrever outra pessoa" }).click();
const local = () => page.evaluate(() => JSON.parse(localStorage.getItem("meuguia-lista-espera") ?? "[]"));

await page.goto(URL, { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.removeItem("meuguia-lista-espera"));

await passo("botão do cabeçalho leva ao formulário e foca o nome", async () => {
  await page.getByRole("banner").getByRole("button", { name: "Entrar na lista" }).click();
  await page.waitForTimeout(900);
  const foco = await page.evaluate(() => document.activeElement?.id);
  if (foco !== "lista-nome") throw new Error(`foco em ${foco}`);
});

await passo("enviar vazio mostra os erros e não envia", async () => {
  await enviar();
  await page.getByText("Informe seu nome").waitFor({ timeout: 2000 });
  await page.getByText("Informe seu e-mail").waitFor({ timeout: 2000 });
});

await passo("e-mail inválido e WhatsApp incompleto são recusados", async () => {
  await campo("nome").fill("Marina Lopes");
  await campo("email").fill("marina@exemplo");
  await campo("whatsapp").fill("1198");
  await enviar();
  await page.getByText("E-mail inválido").waitFor({ timeout: 2000 });
  await page.getByText("WhatsApp inválido").waitFor({ timeout: 2000 });
});

await passo("viajante entra na lista (máscara de WhatsApp, destino)", async () => {
  await campo("email").fill(emailViajante.toUpperCase());
  await campo("whatsapp").fill("11987654321");
  const mascara = await campo("whatsapp").inputValue();
  if (mascara !== "(11) 98765-4321") throw new Error(`máscara: ${mascara}`);
  await campo("destino").fill("Lisboa");
  await page.screenshot({ path: `${pasta}/1-preenchido.png` });
  await enviar();
  await page.getByText("Você está na lista, Marina").waitFor({ timeout: 15000 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${pasta}/2-inscrito.png` });
});

await passo("o mesmo e-mail de novo recebe a mesma confirmação (não revela quem está na lista)", async () => {
  await outra();
  await campo("nome").fill("Marina L.");
  await campo("email").fill(emailViajante);
  await enviar();
  await page.getByText("Você está na lista, Marina").waitFor({ timeout: 15000 });
});

await passo("nome começando com = é limpo antes de gravar (sem fórmula na planilha)", async () => {
  await outra();
  await campo("nome").fill("=Ana Teste");
  await campo("email").fill(emailFormula);
  await campo("destino").fill("+Roma");
  await enviar();
  await page.getByText("Você está na lista, Ana").waitFor({ timeout: 15000 });
});

await passo("“Quero para minha agência” troca o perfil para agência", async () => {
  await outra();
  await page.getByRole("button", { name: "Quero para minha agência" }).click();
  await page.waitForTimeout(900);
  const marcado = await page.locator("#lista").getByRole("radio", { name: "Agência de viagens" }).getAttribute("aria-checked");
  if (marcado !== "true") throw new Error("perfil não mudou");
});

await passo("agência exige WhatsApp e nome da agência", async () => {
  await campo("nome").fill("Juliana Martins");
  await campo("email").fill(emailAgencia);
  await enviar();
  await page.getByText("Informe o WhatsApp da agência").waitFor({ timeout: 2000 });
  await page.getByText("Informe o nome da agência").waitFor({ timeout: 2000 });
});

await passo("agência entra na lista", async () => {
  await campo("whatsapp").fill("51998765432");
  await campo("agencia").fill("Rota Sul Viagens");
  await enviar();
  await page.getByText("Recebemos o contato da Rota Sul Viagens").waitFor({ timeout: 15000 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${pasta}/3-agencia.png` });
});

await passo("campo-armadilha preenchido: finge sucesso e não envia", async () => {
  const antes = (await local()).length;
  await outra();
  await page.locator("#lista").getByRole("radio", { name: "Viajante" }).click();
  await campo("nome").fill("Robô");
  await campo("email").fill(emailRobo);
  await page.locator('#lista input[tabindex="-1"]').fill("http://spam.example");
  await enviar();
  await page.getByText("Você está na lista, Robô").waitFor({ timeout: 5000 });
  if ((await local()).length !== antes) throw new Error("gravou a inscrição do robô");
});

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
  /* globalThis.URL: aqui "URL" é o endereço do site passado na linha de comando */
  const r = await fetch(new globalThis.URL("/api/lista-espera.csv", URL), { headers: { authorization: `Basic ${credencial}` } });
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
if (doEmail(emailViajante).length !== 1) falhar(`e-mail repetido gravado ${doEmail(emailViajante).length} vezes`);
if (doEmail(emailViajante)[0]?.destino !== "Lisboa") falhar("destino da Marina não gravado");
const ana = doEmail(emailFormula)[0];
if (!ana || ana.nome !== "Ana Teste" || ana.destino !== "Roma") falhar(`texto com fórmula não foi limpo: ${JSON.stringify(ana)}`);
if (doEmail(emailAgencia)[0]?.agencia !== "Rota Sul Viagens") falhar("agência não gravada");
if (doEmail(emailRobo).length) falhar("a armadilha deixou passar o robô");

if (erros.length) falhar("erros no console:\n" + erros.join("\n"));
await browser.close();
console.log(falhas ? `\n${falhas} falha(s)` : "\ntudo certo");
process.exit(falhas ? 1 : 0);
