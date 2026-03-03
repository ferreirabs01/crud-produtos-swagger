const form = document.getElementById('produtoForm');
const tbody = document.querySelector('#produtosTable tbody');
const inputId = document.getElementById('produtoId');
const inputNome = document.getElementById('nome');
const inputPreco = document.getElementById('preco');
const btnCancelar = document.getElementById('btnCancelar');

// Carregar produtos ao iniciar
document.addEventListener('DOMContentLoaded', fetchProdutos);

async function fetchProdutos() {
    const response = await fetch('/api/produtos');
    const produtos = await response.json();
    tbody.innerHTML = '';
    produtos.forEach(produto => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${produto.id}</td>
            <td>${produto.nome}</td>
            <td>${parseFloat(produto.preco).toFixed(2)}</td>
            <td>
                <button class="edit" onclick="editarProduto(${produto.id}, '${produto.nome}', ${produto.preco})">Editar</button>
                <button class="delete" onclick="deletarProduto(${produto.id})">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = inputId.value;
    const nome = inputNome.value;
    const preco = inputPreco.value;

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/produtos/${id}` : '/api/produtos';

    await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, preco })
    });

    form.reset();
    inputId.value = '';
    btnCancelar.style.display = 'none';
    fetchProdutos();
});

function editarProduto(id, nome, preco) {
    inputId.value = id;
    inputNome.value = nome;
    inputPreco.value = preco;
    btnCancelar.style.display = 'inline-block';
}

btnCancelar.addEventListener('click', () => {
    form.reset();
    inputId.value = '';
    btnCancelar.style.display = 'none';
});

async function deletarProduto(id) {
    if (confirm('Tem certeza que deseja excluir?')) {
        await fetch(`/api/produtos/${id}`, { method: 'DELETE' });
        fetchProdutos();
    }
}