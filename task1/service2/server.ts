import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Подключение к базе данных
const pool = new Pool({
    user: process.env.DATABASE_USERNAME,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: parseInt(process.env.DATABASE_PORT as string),
});

// Обработчик маршрута для получения истории действий
app.get('/history', async (req, res) => {
    const { shop_id, plu, action, startDate, endDate, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = 'SELECT * FROM product_actions WHERE 1=1';
    const params: any[] = [];

    if (shop_id) {
        query += ' AND shop_id = $' + (params.length + 1);
        params.push(shop_id);
    }

    if (plu) {
        query += ' AND plu = $' + (params.length + 1);
        params.push(plu);
    }

    if (action) {
        query += ' AND action = $' + (params.length + 1);
        params.push(action);
    }

    if (startDate) {
        query += ' AND action_date >= $' + (params.length + 1);
        params.push(startDate);
    }

    if (endDate) {
        query += ' AND action_date <= $' + (params.length + 1);
        params.push(endDate);
    }

    query += ` ORDER BY action_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);

    try {
        const { rows } = await pool.query(query, params);
        const countQuery = 'SELECT COUNT(*) FROM product_actions WHERE 1=1';
        const { rows: countRows } = await pool.query(countQuery, params.slice(0, -2));
        const total = Number(countRows[0].count);

        res.json({
            data: rows,
            total,
            page: Number(page),
            limit: Number(limit),
        });
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Обработчик маршрута для добавления нового действия
app.put('/history', async (req, res) => {
    const { shop_id, plu, action } = req.body;

    if (!action || (!shop_id && !plu)) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO product_actions (shop_id, plu, action) VALUES ($1, $2, $3) RETURNING *',
            [shop_id, plu, action]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error inserting data', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Настройка и запуск сервера
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
