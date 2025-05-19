// backend/server.js
import express from 'express';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL DB setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'business_db',
});

db.connect((err) => {
  if (err) {
    console.error('MySQL Connection Error:', err);
    process.exit(1);
  }
  console.log('✅ MySQL Connected');
});

// OpenAI setup (v4+)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/ask', async (req, res) => {
  const { question } = req.body;

  try {
    const [tables] = await db.promise().query("SHOW TABLES");
    let schemaDescription = "";

    for (const row of tables) {
      const tableName = Object.values(row)[0];
      const [columns] = await db.promise().query(`DESCRIBE ${tableName}`);
      schemaDescription += `Table: ${tableName}\n`;
      columns.forEach(col => {
        schemaDescription += `- ${col.Field} (${col.Type})\n`;
      });
    }

    const prompt = `
Given the following MySQL database schema:
${schemaDescription}

Write an accurate and optimized SQL query to answer the business question:
"${question}"

Only return the SQL query.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an expert data analyst writing SQL queries for MySQL.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0,
    });

    const sqlQuery = completion.choices[0].message.content.trim();
    const [results] = await db.promise().query(sqlQuery);

    res.json({ sql: sqlQuery, data: results });

  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log('🚀 Server running on http://localhost:5000'));
