/* Captura do site. Requer `pnpm dev` (porta 5211) e o Chrome instalado.
   node scripts/shot.mjs [largura] [altura] [arquivo] [tema] [âncora]
   ex.: node scripts/shot.mjs 1440 900 .shots/topo.png
        node scripts/shot.mjs 390 844 .shots/lista-escuro.png dark lista
        PARTES=1 node scripts/shot.mjs 390 844 .shots/celular.png   (a página toda, uma tela por arquivo: celular-00.png, -01…)
   O Chrome não captura mais de 16.384 px de altura numa imagem só (a página
   "recomeça" depois disso), por isso a página inteira sai em partes.
   Avisa se houver erro no console ou rolagem horizontal. */
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { chromium } from "playwright-core";

const [w = "1440", h = "900", arquivo = ".shots/shot.png", tema = "light", ancora = ""] = process.argv.slice(2);
const URL = process.env.URL ?? "http://localhost:5211/";
const largura = Number(w);
const altura = Number(h);
mkdirSync(dirname(arquivo), { recursive: true });

const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const page = await browser.newPage({ viewport: { width: largura, height: altura }, deviceScaleFactor: 2 });
const erros = [];
page.on("console", (m) => m.type() === "error" && erros.push(m.text()));
page.on("pageerror", (e) => erros.push(e.message));

await page.goto(URL);
await page.evaluate((t) => localStorage.setItem("proto-theme", t), tema);
await page.reload({ waitUntil: "networkidle" });
await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" });

/* fotos com loading="lazy" carregam já, para não sair caixa cinza na captura */
await page.evaluate(() => document.querySelectorAll("img[loading=lazy]").forEach((i) => (i.loading = "eager")));
await page.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 30000 }).catch(() => console.log("AVISO: alguma foto não terminou de carregar"));
await page.waitForTimeout(500);

if (process.env.PARTES) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const base = arquivo.replace(/\.png$/, "");
  let n = 0;
  for (let y = 0; y < total; y += altura) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(350);
    await page.screenshot({ path: `${base}-${String(n++).padStart(2, "0")}.png` });
  }
  console.log(`ok ${n} partes (${total}px)`);
} else {
  if (ancora) {
    await page.evaluate((id) => document.getElementById(id)?.scrollIntoView({ block: "start" }), ancora);
    await page.waitForTimeout(800);
  }
  await page.screenshot({ path: arquivo });
  console.log("ok", arquivo);
}

const doc = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
if (doc.scroll > doc.client) console.log(`AVISO: rolagem horizontal (${doc.scroll} > ${doc.client})`);
if (erros.length) console.log("ERROS NO CONSOLE:\n" + erros.join("\n"));
await browser.close();
