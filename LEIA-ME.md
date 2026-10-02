# NR 5 • CIPA • Grau de risco 4 (jogo educativo 3D)

Jogo educativo da série de jogos de segurança do trabalho: **treinamento de CIPA para estabelecimento de grau de risco 4**, com carga horária mínima de **20 horas** (item 5.7.4 da NR 5), mínimo de 8 horas presenciais (5.7.4.2).

CIPA do **canteiro de obras de um edifício, com 60 empregados e 14 meses de obra**, conforme o Anexo I da NR 5. Altura, escavação, andaime, eletricidade e poeira; frente de trabalho e empreiteira; e um acidente grave no içamento.

O jogo cobre o conteúdo mínimo do item 5.7.2: riscos do ambiente, acidentes e doenças, investigação de acidentes, higiene do trabalho, legislação, inclusão, organização da CIPA e prevenção ao assédio.

Os outros graus de risco têm jogo próprio, no mesmo padrão: [Grau de risco 1](https://github.com/WendellLife/nr5-cipa-gr1-3d) • [Grau de risco 2](https://github.com/WendellLife/nr5-cipa-gr2-3d) • [Grau de risco 3](https://github.com/WendellLife/nr5-cipa-gr3-3d).

> **Conteúdo educativo.** Não substitui o treinamento com carga horária e avaliação, nem a atuação da CIPA e do SESMT da empresa. Leia o [SAFETY-NOTES.md](SAFETY-NOTES.md).

## Como abrir

Requer Node.js 18 ou superior (ou Python 3).

- **Windows:** dê dois cliques em `INICIAR.cmd` e abra http://127.0.0.1:8765
- **Qualquer sistema:** `npm start` (ou `node server.mjs`) e abra http://127.0.0.1:8765
- **Hospedagem estática:** publique a pasta `dist/` como está. Não há build nem dependências npm. O Three.js 0.170.0 está em `dist/`.

## Controles

| Ação | Teclado | Celular |
|---|---|---|
| Mover | WASD ou setas | botões de seta na tela |
| Correr | Shift | — |
| Interagir | E | botão AÇÃO |
| Fontes e origem do conteúdo | botão **Fontes** | botão **Fontes** |
| Pausar | Esc ou botão Ⅱ | botão Ⅱ |

O losango verde é você. O losango azul, o alvo luminoso e as setas no chão marcam o destino.

**Painel da CIPA** (canto superior direito): grau de risco, carga horária mínima do treinamento, estabelecimento (Canteiro de obras • 60 empregados), tamanho da comissão (3 efetivos e 2 suplentes de cada lado) e o **mapa de riscos**, com a contagem por grupo.

**Mapa de riscos no cenário:** a cada risco que você registra, um círculo colorido aparece no piso, na cor do grupo (verde: físico; vermelho: químico; marrom: biológico; amarelo: ergonômico; azul: acidente). Quanto maior o círculo, maior a gravidade. Neste jogo são 5 riscos a registrar. O cenário também muda com as suas decisões.

## Origem do conteúdo (muito importante)

| Etiqueta | Significa |
|---|---|
| **Em vigor** | NR 5 com a redação da Portaria MTP 422/2021, alterada pela Portaria MTP 4.219/2022 (CIPA e assédio), incluídos o Quadro I e o Anexo I (construção). Também outras NR e leis (CLT, Lei 8.213/1991, Lei 14.457/2022) quando citadas. |
| **Boa prática — não é item de NR** | Cores do mapa de riscos, árvore de causas, medidas de acessibilidade e de engenharia. A NR 5 em vigor não fixa cores nem um método único de registro. |

Etiquetas com **“conferir subitem”** marcam o Quadro I e os artigos de lei, que devem ser conferidos no texto oficial antes do uso em sala de aula.

## Sequência das 16 etapas

| # | Etapa | Origem |
|---|---|---|
| 1 | Faça o treinamento da CIPA | 5.7.4 d) • 5.7.4.1 • 5.7.4.2 • Anexo I (construção) — 3.5 |
| 2 | CIPA por canteiro | Anexo I (construção) — 3.1 • Anexo I (construção) — 3.3 • Quadro I — grau de risco 4 • 51 a 80 empregados |
| 3 | A frente de trabalho na rua | Anexo I (construção) — 3.1.2 • Anexo I (construção) — 3.1.3 • Anexo I (construção) — 3.5.1 |
| 4 | A empreiteira de armação | Anexo I (construção) — 3.2 • Anexo I (construção) — 3.2.1 • Anexo I (construção) — 3.2.2 • Anexo I (construção) — 3.6.1 |
| 5 | Risco grave e iminente na laje | 5.3.1 h) • NR 35 — trabalho acima de 2,0 m do nível inferior • NR 18 — proteção coletiva contra queda de altura |
| 6 | A vala sem escoramento | 5.3.1 c) • NR 18 — escavações: escoramento, acessos e material afastado da borda • Mapa de riscos: risco de acidente em azul (boa prática) |
| 7 | Inspecione o andaime | 5.3.1 c) • NR 18 — andaimes: piso completo, guarda-corpo, rodapé e montagem por capacitados |
| 8 | O quadro elétrico provisório | 5.3.1 c) • NR 10 — instalações elétricas: intervenção só por autorizados • NR 18 — instalações elétricas temporárias |
| 9 | Poeira e ruído no corte | 5.7.2 d) • 5.3.1 b) • Boa prática: corte a úmido e respirador PFF2 para poeira com sílica (boa prática) • Mapa de riscos: poeira em vermelho • ruído em verde (boa prática) |
| 10 | Atualize o mapa a cada etapa | 5.3.1 b) • Anexo I (construção) — 3.5.1 b) • Mapa de riscos: atualizado a cada etapa da obra (boa prática) |
| 11 | Acidente grave no içamento | 5.6.4 a) • 5.3.1 f) • Lei 8.213/1991 — art. 22 (CAT; morte: de imediato) |
| 12 | Investigue o içamento | 5.7.2 c) • 5.3.1 f) • Método: árvore de causas (boa prática) |
| 13 | Enfrente o assédio no canteiro | 5.3.1 j) • 5.7.2 h) • Lei 14.457/2022 — art. 23 (canal de denúncia com anonimato) |
| 14 | Garantia de emprego na obra | 5.4.12 • 5.4.12.1 • 5.7.2 e) |
| 15 | Integre todo o canteiro | Anexo I (construção) — 3.6 • Anexo I (construção) — 3.6.1 • 5.9.1 • 5.6.1 |
| 16 | Encerre a CIPA com a obra | Anexo I (construção) — 3.7 • Anexo I (construção) — 3.7.1 • Anexo I (construção) — 3.7.2 • 5.9.2 |

Cada decisão tem três opções, uma única correta, e cada opção tem um feedback didático.

## Personagens

Você é: **Vice-presidente da CIPA do canteiro**. Equipe do estabelecimento: Valter (mestre de obras, presidente da CIPA), Cida (técnica de segurança), Zé (pedreiro), Tonho (servente), Lu (armadora da empreiteira) e Beto (azulejista).

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `dist/index.html`, `dist/style.css` | Interface (mesma da série, com painel da CIPA e etiquetas de origem) |
| `dist/rules.mjs` | Regras puras e testáveis: etapas, decisões, referências, carga horária, Quadro I, mapa de riscos e objetos do cenário |
| `dist/layout.mjs` | Planta do estabelecimento, equipe e estados de cada pessoa |
| `dist/crew.mjs` | Fase de cada pessoa conforme o andamento e busca de rotas |
| `dist/scenery.mjs` | Cenário 3D |
| `dist/game.mjs` | Jogo: câmera, equipe, mapa de riscos, painel da CIPA e diálogos |
| `dist/graphics.mjs` | Qualidade, pós-processamento e texturas |
| `dist/characters.mjs` | Personagens com esqueleto, animações e poses de ação |
| `dist/models/` | Modelos GLB dos personagens |
| `server.mjs`, `INICIAR.cmd` | Servidor local (127.0.0.1:8765) |
| `manifest.mjs` | Gera o `MANIFESTO-SHA256.json` (`npm run manifest`) |
| `test.mjs` | Testes em Node puro (`npm test`) |

## Testes

```
npm test
```

Cobrem: ordem das etapas; uma única resposta certa por decisão, com feedback; todo item e alínea da NR 5 citados existem no texto em vigor; carga horária, horas presenciais e dias mínimos coerentes com os textos; Quadro I e o tamanho da CIPA; conteúdo mínimo do item 5.7.2; mapa de riscos; objetos do cenário; fases da equipe; e acessibilidade de todos os destinos.
