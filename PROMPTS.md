# Prompts e instruções usados no protótipo corrigido (v2)

O protótipo v2 foi construído por um agente de IA (Grok Bot), que escreveu o código HTML/CSS/JS diretamente, sem gerar imagens. Em 27/10/2026 (UTC-3), o agente seguiu as instruções abaixo, na ordem em que aparecem.

## P1 – Pedido da equipe (Thiago)
"Construir o protótipo corrigido em HTML/CSS/JS puro, fiel ao protótipo original (https://anapsaraujo100.github.io/monitoria-ihc-prototipo/, repositório anapsaraujo100/monitoria-ihc-prototipo), corrigindo os problemas indispensáveis (no mínimo os botões de ação da tela Alunos, E1-02/E1-16) e os demais de alta severidade que forem viáveis, com telas interativas reais em vez de imagens estáticas."

## P2 – Diretriz de fidelidade ao Baseline
"Reproduza as 6 telas do Baseline (Dashboard, Alunos, Comunicação, Inteligência Artificial, Relatórios e Ajuda) com o mesmo menu lateral, a mesma identidade visual (azul-marinho, laranja, logotipo MonitorIA, usuária Maria Monitor – Monitoria EaD), os mesmos nomes de alunos, cursos e indicadores (1.030, 726, 304, 70%, 45, 428, 76%, 186, 87%) e os mesmos rótulos de botões. Não acrescente funções que não existam no Baseline, exceto as exigidas pelas correções abaixo. Mantenha o princípio 'A IA recomenda, a monitoria decide'."

## P3 – Correções, uma por problema do E1
- E1-02/E1-16 (sev. 4/3): "Na tela Alunos, cada um dos botões de 'Decisão da Monitoria' (Atualizar dados cadastrais, Alterar canal de comunicação, Solicitar nova análise da IA, Rejeitar recomendação, Registrar intervenção manual) deve executar a sua própria ação, com retorno específico e verdadeiro. 'Ver explicação completa' deve abrir uma explicação real, com fatores, pesos, confiança e limitações."
- E1-03: "Depois de qualquer decisão, mostre na tela o novo estado, quem decidiu (Maria Monitor) e a hora, e registre a decisão no histórico (perfil e Relatórios)."
- E1-04: "Inclua 'Rejeitar recomendação' no Dashboard, pedindo o motivo."
- E1-05: "Peça confirmação antes de 'Aprovar e enviar mensagem' e ofereça 'Desfazer' logo após cada decisão."
- E1-06: "Crie a lista de alunos com busca e filtros (prioridade, situação). O item Alunos do menu abre a lista; o aluno priorizado no Dashboard abre o seu perfil."
- E1-07: "Use um único modelo de dados para todas as telas, para que o mesmo aluno tenha os mesmos dados (status, prioridade, confiança) em todas elas: João Pereira 42% e Maria Oliveira 'Aguardando primeiro acesso', ALTA, em todas as telas; 186 = 'alunos reativados após contato' em Comunicação e Relatórios."
- E1-08/E1-09: "Diga a que se refere a confiança ('Confiança da IA para <aluno selecionado>') e dê, para cada indicador, um ⓘ funcional com a definição, a base e o período."
- E1-01/E1-11: "Tudo o que parecer clicável deve responder (linhas da lista, filtros, feedback 👍/👎, notificações, checkboxes); menu com botões reais, sem hotspots sobre imagem."
- E1-12: "Inclua 'Sair' e uma tela de entrada simulada."
- E1-13: "Use texto real (não imagem), botões com rótulos específicos, foco visível no teclado, contraste adequado e link 'Pular para o conteúdo'."
- E1-14: "Calcule as datas a partir da data de hoje (não use datas fixas de junho/2026)."
- E1-15: "Faça a busca da Ajuda filtrar os tópicos e inclua o tópico 'Privacidade e Dados (LGPD)' com conteúdo, sinalizado como texto de exemplo do protótipo."

## P4 – Restrições
"HTML/CSS/JS puro, sem frameworks e sem build, publicável no GitHub Pages. Dados fictícios, identificados como tal. Não invente políticas institucionais reais. Não altere o Baseline original."

## P5 – Verificação
"Abra o protótipo num navegador headless, execute o fluxo das tarefas T1 a T6 (priorizar, compreender, decidir, tratar erro em João Pereira, acompanhar e encontrar privacidade) e confirme que não há erros no console e que cada botão dá o retorno esperado."

## P6 – Correção indispensável no Baseline (versão usada no teste, pasta `baseline-corrigido/`)
"Siga o enunciado: preserve o Baseline e corrija só o impedimento que inviabiliza a T4. Copie o invólucro original (index.html, script.js, style.css e as mesmas imagens) e altere apenas as áreas clicáveis. Em Alunos, crie uma área e uma mensagem própria para cada um dos cinco botões da Decisão da Monitoria, nas coordenadas da imagem (E1-02). No Dashboard, faça 'Ver explicação completa' abrir um painel com a recomendação, os fatores e a confiança mostrados na própria tela (E1-16). Mostre os botões de ação do Dashboard só no Dashboard. Não altere imagens, textos nem os demais comportamentos."
