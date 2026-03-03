const express = require('express');
const path = require('path');
require('dotenv').config();

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração de middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));



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
    console.log(`Servidor rodando na http://localhost:${PORT}`);
});