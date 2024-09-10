require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { default: axios } = require('axios');

const app = express();
app.use(bodyParser.json());

const pool = new Pool({
    user: process.env.DATABASE_USERNAME,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
});

// Создание товара
app.post('/products', async (req, res) => {
    const { plu, name } = req.body;
    const result = await pool.query(
        'INSERT INTO products (plu, name) VALUES ($1, $2) RETURNING *',
        [plu, name]
    );

    // Отправка действия в сервис истории действий
    axios.put('http://localhost:3001/history', {
        plu: plu,
        action: 'product_created'
    });

    res.status(201).json(result.rows[0]);
});

// Создание остатка
app.post('/stocks', async (req, res) => {
    const { product_id, shop_id, stock_quantity, order_quantity } = req.body;
    const result = await pool.query(
        'INSERT INTO stocks (product_id, shop_id, stock_quantity, order_quantity) VALUES ($1, $2, $3, $4) RETURNING *',
        [product_id, shop_id, stock_quantity, order_quantity]
    );

    // Отправка действия в сервис истории действий
    axios.put('http://localhost:3001/history', {
        shop_id: shop_id,
        action: 'stock_created'
    });

    res.status(201).json(result.rows[0]);
});

// Увеличение остатка
app.put('/stocks/increase/:id', async (req, res) => {
    const { id } = req.params;
    const { stock_quantity, order_quantity } = req.body;
    const result = await pool.query(
        'UPDATE stocks SET stock_quantity = stock_quantity + $1, order_quantity = order_quantity + $2 WHERE id = $3 RETURNING *',
        [stock_quantity, order_quantity, id]
    );

    const shopId = result.rows[0]?.shop_id;

    // Отправка действия в сервис истории действий
    axios.put('http://localhost:3001/history', {
        // @ts-ignore
        shop_id: shopId,
        action: 'increase_stock'
    });

    res.status(200).json(result.rows[0]);
});

// Уменьшение остатка
app.put('/stocks/decrease/:id', async (req, res) => {
    const { id } = req.params;
    const { stock_quantity, order_quantity } = req.body;
    const result = await pool.query(
        'UPDATE stocks SET stock_quantity = stock_quantity - $1, order_quantity = order_quantity - $2 WHERE id = $3 RETURNING *',
        [stock_quantity, order_quantity, id]
    );

    const shopId = result.rows[0]?.shop_id;

    // Отправка действия в сервис истории действий
    axios.put('http://localhost:3001/history', {
        // @ts-ignore
        shop_id: shopId,
        action: 'decrease_stock'
    });

    res.status(200).json(result.rows[0]);
});

// Получение остатков по фильтрам
app.get('/stocks', async (req, res) => {
    const { plu, shop_id, stock_min, stock_max, order_min, order_max } = req.query;
    let query = `SELECT * FROM stocks WHERE 1=1`;
    const params = [];

    if (plu) {
        query += ` AND product_id = (SELECT id FROM products WHERE plu = $${params.length + 1})`;
        params.push(plu);
    }

    if (shop_id) {
        query += ` AND shop_id = $${params.length + 1}`;
        params.push(shop_id);
    }

    if (stock_min) {
        query += ` AND stock_quantity >= $${params.length + 1}`;
        params.push(stock_min);
    }

    if (stock_max) {
        query += ` AND stock_quantity <= $${params.length + 1}`;
        params.push(stock_max);
    }

    if (order_min) {
        query += ` AND order_quantity >= $${params.length + 1}`;
        params.push(order_min);
    }

    if (order_max) {
        query += ` AND order_quantity <= $${params.length + 1}`;
        params.push(order_max);
    }

    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
});

// Получение товаров по фильтрам
app.get('/products', async (req, res) => {
    const { name, plu } = req.query;
    let query = `SELECT * FROM products WHERE 1=1`;
    const params = [];

    if (name) {
        query += ` AND name ILIKE $${params.length + 1}`;
        params.push(`%${name}%`);
    }

    if (plu) {
        query += ` AND plu = $${params.length + 1}`;
        params.push(plu);
    }

    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
});


// Выполнение миграций при старте сервиса
const initDB = async () => {
    const iniSqlPath = path.join(__dirname, 'init.sql');
    const sql = fs.readFileSync(iniSqlPath, 'utf8');

    try {
        await pool.query(sql);
        console.log('Database initialized successfully.');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
};

// Запуск сервера
initDB().then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
