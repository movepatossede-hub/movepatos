// Monta a pasta "publicar/" só com o que o site precisa para ir ao ar.
// Uso: npm run publicar  → depois arraste a pasta "publicar" no Netlify Drop.
import { cpSync, mkdirSync, rmSync } from "node:fs";

const destino = "publicar";
rmSync(destino, { recursive: true, force: true });
mkdirSync(destino);

for (const item of ["index.html", "404.html", "style.css", "vc.js", "assets"]) {
  cpSync(item, `${destino}/${item}`, { recursive: true });
}

console.log(`Pronto: pasta "${destino}" atualizada.`);
