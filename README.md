# MonitorIA – protótipos corrigidos (NP2 de IHC)

O protótipo original (Baseline) está em https://github.com/anapsaraujo100/monitoria-ihc-prototipo (commit e72ce2b), publicado em https://anapsaraujo100.github.io/monitoria-ihc-prototipo/. Ele não foi alterado.

Este repositório tem duas versões:

1. **`/baseline-corrigido/` – registro histórico.** Foi preparada para um teste com usuários que deixou de ser exigido na versão atual do enunciado (a avaliação passou a ser só por inspeção). Não é usada no relatório. São as telas originais em imagem, com uma única correção indispensável no invólucro: o problema C-01 (E1-02/E1-16, botões de ação da tela Alunos e "Ver explicação completa"). Os demais problemas foram mantidos, porque o enunciado pede para preservar o Baseline e documentar a versão corrigida separadamente.
2. **Raiz (`/`) – versão v2 (melhoria opcional, documentada no Anexo C do relatório; não altera o Baseline nem entra na comparação).** Refaz as telas em HTML/CSS/JS reais e corrige também E1-01, E1-03 a E1-09 e E1-11 a E1-15. As instruções usadas para construí-la estão em `PROMPTS.md`.

Os dados são fictícios. Para usar, basta abrir `index.html`; não há build.


## Material do relatório (`/relatorio`)

- `figuras/`: figuras da Parte 1 e o mapa de dependências do Entregável 5 (Figura 6).
- `prompts/`: prompts A (Baseline, literal), B (intermediário) e C (mínimo), um arquivo por etapa (P0–P3), prontos para colar na LLM.
