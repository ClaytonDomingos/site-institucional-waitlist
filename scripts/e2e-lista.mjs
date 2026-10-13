/* Teste de ponta a ponta do formulário da lista de espera, contra o destino
   que o `pnpm dev` estiver usando (demonstração, Supabase ou webhook).
   node scripts/e2e-lista.mjs [url] [pasta-das-capturas]
   ex.: node scripts/e2e-lista.mjs http://localhost:5211/ .shots/e2e
   Com o servidor de teste (scripts/servidor-teste.mjs) rodando, confere também
   o que chegou nele (CONFERIR=http://localhost:54321/inscricoes). */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

const [URL = "http://localhost:5211/", pasta = ".shots/e2e"] = process.argv.slice(2);
mkdirSync(pasta, { recursive: true });
const sufixo = Date.now().toString(36);
const emailViajante = `marina.${sufixo}@exemplo.com`;
const emailAgencia = `juliana.${sufixo}@rotasul.com.br`;

const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const erros = [];
page.on("pageerror", (e) => erros.push(e.message));
/* o 409 do e-mail repetido é esperado (o Chrome registra toda resposta não 2xx no console) */
page.on("console", (m) => m.type() === "error" && !m.text().includes("status of 409") && erros.push(m.text()));

let falhas = 0;
const passo = async (nome, fn) => {
  try {
    await fn();
    console.log("ok  ", nome);
  } catch (e) {
    falhas++;
    console.log("FALHOU", nome, "\n     ", e.message.split("\n")[0]);
  }
};
const form = page.locator("#lista form");
const campo = (id) => page.locator(`#lista-${id}`);
const enviar = () => form.getByRole("button", { name: "Entrar na lista" }).click();

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
  await page.screenshot({ path: `${pasta}/2-inscrito.png` });
});

/* o webhook não sabe se o e-mail já existe: rode com SEM_DUPLICADO=1 (a deduplicação fica do lado do n8n/planilha) */
await passo(process.env.SEM_DUPLICADO ? "o mesmo e-mail de novo é aceito (webhook)" : "o mesmo e-mail de novo vira “já está na lista”", async () => {
  await page.getByRole("button", { name: "Inscrever outra pessoa" }).click();
  await campo("nome").fill("Marina L.");
  await campo("email").fill(emailViajante);
  await enviar();
  await page.getByText(process.env.SEM_DUPLICADO ? "Você está na lista, Marina" : "Você já está na lista, Marina").waitFor({ timeout: 15000 });
});

await passo("“Quero para minha agência” troca o perfil para agência", async () => {
  await page.getByRole("button", { name: "Inscrever outra pessoa" }).click();
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
  await page.screenshot({ path: `${pasta}/3-agencia.png` });
});

await passo("campo-armadilha preenchido: finge sucesso e não grava", async () => {
  const antes = await page.evaluate(() => JSON.parse(localStorage.getItem("meuguia-lista-espera") ?? "[]").length);
  await page.getByRole("button", { name: "Inscrever outra pessoa" }).click();
  await page.locator("#lista").getByRole("radio", { name: "Viajante" }).click();
  await campo("nome").fill("Robô");
  await campo("email").fill(`robo.${sufixo}@spam.com`);
  await page.locator('#lista input[tabindex="-1"]').fill("http://spam.example");
  await enviar();
  await page.getByText("Você está na lista, Robô").waitFor({ timeout: 5000 });
  const depois = await page.evaluate(() => JSON.parse(localStorage.getItem("meuguia-lista-espera") ?? "[]").length);
  if (depois !== antes) throw new Error("gravou a inscrição do robô");
});

const local = await page.evaluate(() => JSON.parse(localStorage.getItem("meuguia-lista-espera") ?? "[]"));
if (local.length) console.log(`\nlocalStorage (modo demonstração): ${local.length} inscrição(ões)`);
for (const l of local) console.log("  ", JSON.stringify(l));

if (process.env.CONFERIR) {
  const recebidas = await (await fetch(process.env.CONFERIR)).json();
  const nossas = recebidas.filter((r) => r.email?.includes(sufixo));
  console.log(`\nservidor de teste: ${nossas.length} inscrição(ões) deste teste`);
  for (const r of nossas) console.log("  ", JSON.stringify(r));
  if (nossas.some((r) => r.email.includes("robo."))) {
    falhas++;
    console.log("FALHOU a armadilha deixou passar o robô");
  }
}

if (erros.length) {
  falhas++;
  console.log("\nERROS NO CONSOLE:\n" + erros.join("\n"));
}
await browser.close();
console.log(falhas ? `\n${falhas} falha(s)` : "\ntudo certo");
process.exit(falhas ? 1 : 0);
