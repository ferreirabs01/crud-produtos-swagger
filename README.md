# crud-produtos

```terminal 
mkdir crud-produtos
cd crud-produtos
npm init -y
npm install express mysql2
```


abri o vs code para os proximos passo 

```plaintext
crud-produtos/
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
└── server.js
```


banco de dados 

```sql

CREATE DATABASE IF NOT EXISTS crud_produtos;
USE crud_produtos;

CREATE TABLE IF NOT EXISTS produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    preco DECIMAL(10, 2) NOT NULL
);

```

3. Código do Backend (server.js)


```javascript
const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const PORT = 3000;

// Configuração de middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conexão com o banco de dados MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // Altere para o usuário do seu banco
    password: '',      // Altere para a senha do seu banco
    database: 'crud_produtos'
});

db.connect(err => {
    if (err) throw err;
    console.log('Conectado ao banco de dados MySQL.');
});

// Rotas da API (CRUD)

// CREATE - Adicionar produto
app.post('/api/produtos', (req, res) => {
    const { nome, preco } = req.body;
    const sql = 'INSERT INTO produtos (nome, preco) VALUES (?, ?)';
    db.query(sql, [nome, preco], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, nome, preco });
    });
});

// READ - Listar todos os produtos
app.get('/api/produtos', (req, res) => {
    const sql = 'SELECT * FROM produtos';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// UPDATE - Atualizar produto
app.put('/api/produtos/:id', (req, res) => {
    const { id } = req.params;
    const { nome, preco } = req.body;
    const sql = 'UPDATE produtos SET nome = ?, preco = ? WHERE id = ?';
    db.query(sql, [nome, preco, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Produto atualizado com sucesso' });
    });
});

// DELETE - Remover produto
app.delete('/api/produtos/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM produtos WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Produto removido com sucesso' });
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

```

4.Código do Frontend
public/index.html

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadastro de Produtos</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h2>Gerenciamento de Produtos</h2>
        
        <form id="produtoForm">
            <input type="hidden" id="produtoId">
            <input type="text" id="nome" placeholder="Nome do Produto" required>
            <input type="number" id="preco" placeholder="Preço" step="0.01" required>
            <button type="submit">Salvar</button>
            <button type="button" id="btnCancelar" style="display:none;">Cancelar</button>
        </form>

        <table id="produtosTable">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Preço (R$)</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                </tbody>
        </table>
    </div>

    <script src="app.js"></script>
</body>
</html>
```




public/style.css


```css
body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
    margin: 0;
    padding: 20px;
}

.container {
    max-width: 600px;
    margin: 0 auto;
    background: #fff;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

form {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

button {
    padding: 8px 15px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background-color: #218838;
}

button.delete {
    background-color: #dc3545;
}

button.edit {
    background-color: #ffc107;
    color: black;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th, td {
    padding: 10px;
    border-bottom: 1px solid #ddd;
    text-align: left;
}
```


public/app.js
Lógica de comunicação com a API e manipulação do DOM.


```javascript
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
```




5. Execução
Para iniciar a aplicação, execute o comando na raiz do projeto:

```bash
node server.js
```

instalacao swagger 

```bash
npm install swagger-ui-express
```

1. Criar o arquivo swagger.json
Na raiz do projeto, deve-se criar um arquivo chamado swagger.json e adicionar a estrutura OpenAPI:

```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "API de Produtos",
    "version": "1.0.0",
    "description": "Documentação do CRUD de produtos"
  },
  "servers": [
    {
      "url": "http://localhost:3000",
      "description": "Servidor Local"
    }
  ],
  "paths": {
    "/api/produtos": {
      "get": {
        "summary": "Retorna a lista de todos os produtos",
        "responses": {
          "200": { "description": "Lista de produtos" }
        }
      },
      "post": {
        "summary": "Adiciona um novo produto",
        "responses": {
          "201": { "description": "Produto criado com sucesso" }
        }
      }
    },
    "/api/produtos/{id}": {
      "put": {
        "summary": "Atualiza um produto existente",
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Produto atualizado com sucesso" }
        }
      },
      "delete": {
        "summary": "Remove um produto",
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Produto removido com sucesso" }
        }
      }
    }
  }
}
```


2. Atualizar o arquivo server.js
3. 
```
//cod inicial add apos const db 
// Importação do Swagger e do arquivo JSON
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
```


