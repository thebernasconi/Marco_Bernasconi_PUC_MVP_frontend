# MVP PUC Desenvolvimento FullStack - Marco Bernasconi
---
## Frontend (HTML, CSS, JavaScript)

**Repositório oficial do frontend do projeto AnotAí (PUC — MVP Fullstack).**  
SPA simples em HTML, CSS e JavaScript puros, sem frameworks JS. O frontend consome a API do backend.

---

## 🚀 Tecnologias
- HTML5
- CSS3
- JavaScript (ES6)
- (Opcional) Bootstrap para estilo

---

## 📂 Estrutura
- ├─ index.html
- ├─ style.css
- ├─ script.js
- └─ README.md
---

## ▶️ Como rodar
1. Certifique-se de que o backend está rodando em `http://127.0.0.1:5000`.
2. Abra `index.html` diretamente no navegador:  
   - `file:///C:/caminho/Marco_Bernasconi_PUC_MVP_frontend/index.html`

---

## ⚠️ Problemas de CORS
- Firefox funciona melhor ao abrir com `file://`.
- Caso tenha erro no Chrome/Edge, rode:
```bash
python -m http.server 5500
```
---

## ✨ Funcionalidades

- Tela inicial com cadastro ou login
- Persistência do usuário com localStorage
- Criar nota
- Listar notas (em cards, ordenadas por data)
- Editar nota
- Excluir nota
- Mostrar data de criação (created_at)
- Logout
