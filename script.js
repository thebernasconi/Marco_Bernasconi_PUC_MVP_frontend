// configurações globais
const API_URL = 'http://localhost:5000';
const LS_KEY = 'anotai_user';
let currentUser = null;

// inicialização
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    // Tabs de autenticação
    document.getElementById('tab-register').addEventListener('click', () => switchAuthTab('register'));
    document.getElementById('tab-login').addEventListener('click', () => switchAuthTab('login'));

    // Formulários
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('note-form').addEventListener('submit', handleCreateNote);

    // Logout
    document.getElementById('btn-logout').addEventListener('click', handleLogout);

    // Checar se já existe usuário logado
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
        currentUser = JSON.parse(stored);
        renderUserHeader();
        showAppView();
        loadNotesForCurrentUser();
    } else {
        showWelcomeView();
    }
}

// controle de telas
function showWelcomeView() {
    document.getElementById('welcome-view').style.display = 'block';
    document.getElementById('app-view').style.display = 'none';
    clearMessages();
}

function showAppView() {
    document.getElementById('welcome-view').style.display = 'none';
    document.getElementById('app-view').style.display = 'block';
    clearMessages();
}

function renderUserHeader() {
    const area = document.getElementById('user-area');
    if (currentUser) {
        area.textContent = `Olá, ${currentUser.name}`;
    } else {
        area.textContent = '';
    }
}

// tabs de autenticação
function switchAuthTab(tab) {
    const regTab = document.getElementById('tab-register');
    const logTab = document.getElementById('tab-login');
    const regForm = document.getElementById('register-form');
    const logForm = document.getElementById('login-form');

    if (tab === 'register') {
        regTab.classList.add('active');
        logTab.classList.remove('active');
        regForm.style.display = 'block';
        logForm.style.display = 'none';
    } else {
        logTab.classList.add('active');
        regTab.classList.remove('active');
        logForm.style.display = 'block';
        regForm.style.display = 'none';
    }
    clearMessages();
}

// registro
async function handleRegister(e) {
    e.preventDefault();
    clearMessages();

    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();

    try {
        const response = await fetch(`${API_URL}/users/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone })
        });

        if (response.ok) {
            const user = await response.json();
            currentUser = user;
            localStorage.setItem(LS_KEY, JSON.stringify(user));
            renderUserHeader();
            showAppView();
            loadNotesForCurrentUser();
        } else if (response.status === 409) {
            showMessage('#auth-message', 'E-mail já cadastrado. Faça login.');
        } else {
            showMessage('#auth-message', 'Erro ao cadastrar. Tente novamente.');
        }
    } catch (err) {
        console.error(err);
        showMessage('#auth-message', 'Falha de conexão com o servidor.');
    }
}

// login
async function handleLogin(e) {
    e.preventDefault();
    clearMessages();

    const email = document.getElementById('login-email').value.trim();
    const phone = document.getElementById('login-phone').value.trim();

    try {
        const response = await fetch(`${API_URL}/users/`);
        if (response.ok) {
            const users = await response.json();
            const user = users.find(u => u.email === email && u.phone === phone);
            if (user) {
                currentUser = user;
                localStorage.setItem(LS_KEY, JSON.stringify(user));
                renderUserHeader();
                showAppView();
                loadNotesForCurrentUser();
            } else {
                showMessage('#auth-message', 'Usuário não encontrado. Verifique os dados ou cadastre-se.');
            }
        } else {
            showMessage('#auth-message', 'Erro ao carregar usuários.');
        }
    } catch (err) {
        console.error(err);
        showMessage('#auth-message', 'Falha de conexão com o servidor.');
    }
}

// logout
function handleLogout() {
    localStorage.removeItem(LS_KEY);
    currentUser = null;
    renderUserHeader();
    showWelcomeView();
}

// notas
async function loadNotesForCurrentUser() {
    if (!currentUser) {
        console.warn("nenhum usuário logado.");
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/notes/`, { cache: 'no-store' });
        console.log("Resposta bruta:", response);

        if (response.ok) {
            const notes = await response.json();
            console.log("Notas recebidas:", notes);

            const myNotes = notes.filter(n => n.user_id === currentUser.id);
            console.log("Notas do usuário atual:", myNotes);
            renderNotes(myNotes);
        } else {
            console.error("Erro HTTP:", response.status);
            showMessage('#note-message', 'Erro ao carregar anotações.');
        }
    } catch (err) {
        console.error("Erro de conexão", err);
        showMessage('#note-message', 'Falha de conexão ao carregar anotações.');
    }
}

function formatDateSafe(value) {
    if (!value) return '';
    // Normaliza microssegundos para 3 casas (milissegundos) — compatível com JS
    const normalized = value.replace(/(\.\d{3})\d+$/, '$1');
    const d = new Date(normalized);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}


function renderNotes(notes) {
    const container = document.getElementById('notes-list');
    container.innerHTML = '';

    if (notes.length === 0) {
        container.innerHTML = '<p>Nenhuma anotação encontrada.</p>';
        return;
    }

    notes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    notes.forEach(note => {

        const createdAtStr = formatDateSafe(note.created_at);

        const card = document.createElement('div');
        card.className = 'note-card';
        card.innerHTML = `
            <h3>${note.title}</h3>
            <p>${note.content}</p>
            <p><strong>Status:</strong> ${note.status}</p>
            <p class="note-date"><em>Criado em: ${createdAtStr}</em></p>
            <div class="note-actions">
                <button onclick="editNote(${note.id})" class="btn-outline">Editar</button>
                <button onclick="deleteNote(${note.id})" class="btn-outline">Excluir</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// criar nota
async function handleCreateNote(e) {
    e.preventDefault();
    clearMessages();
    if (!currentUser) return;

    const title = document.getElementById('note-title').value.trim();
    const content = document.getElementById('note-content').value.trim();
    const status = document.getElementById('note-status').value;

    try {
        const response = await fetch(`${API_URL}/notes/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, status, user_id: currentUser.id })
        });

        if (response.ok) {
            document.getElementById('note-form').reset();
            loadNotesForCurrentUser();
        } else {
            showMessage('#note-message', 'Erro ao criar anotação.');
        }
    } catch (err) {
        console.error(err);
        showMessage('#note-message', 'Falha de conexão ao criar anotação.');
    }
}

// editar nota
async function editNote(id) {
    const title = prompt("Novo título:");
    const content = prompt("Novo conteúdo:");
    const status = prompt("Novo status (active ou archived):", "active");

    // impede envio de valores nulos
    if (!title || !content) {
        alert("Título e conteúdo não podem estar vazios.");
        return;
    }

    const response = await fetch(`${API_URL}/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
            status: status.trim(),
            user_id: currentUser.id
        })
    });

    if (response.ok) {
        const updatedNote = await response.json(); // pega a nota atualizada
        console.log("Nota atualizada:", updatedNote);

        await loadNotesForCurrentUser();  // recarrega lista
        document.getElementById('notes-list').scrollIntoView({ behavior: 'smooth' }); // rola para a lista

        alert("Nota atualizada com sucesso!");
    } else {
        alert("Erro ao atualizar a nota.");
    }
}

// excluir nota
async function deleteNote(noteId) {
    if (!confirm('Tem certeza que deseja excluir esta anotação?')) return;

    try {
        const response = await fetch(`${API_URL}/notes/${noteId}`, {method: 'DELETE'});
        if (response.status === 204) {
            loadNotesForCurrentUser();
        } else {
            showMessage('#note-message', 'Erro ao excluir anotação.');
        }
    } catch (err) {
        console.error(err);
        showMessage('#note-message', 'Falha de conexão ao excluir anotação.');
    }
}

// Utilitários
function showMessage(selector, text) {
    const el = document.querySelector(selector);
    if (el) {
        el.textContent = text;
        setTimeout(() => el.textContent = '', 4000);
    }
}

function clearMessages() {
    document.querySelectorAll('.message').forEach(el => el.textContent = '');
}