/**
 * エントリーポイント - Express サーバーの立ち上げ
 * JWT認証とSQLiteを用いたユーザー登録・ログイン機能を提供します。
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db'); // データベース接続モジュールを読み込み

const app = express();
const PORT = process.env.PORT || 3000;

// JWTのシークレットキー (環境変数から取得、未設定時はデフォルト値を使用)
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret_key_change_in_production';

// ミドルウェアの設定
app.use(cors()); // CORSを許可
app.use(express.json()); // JSONリクエストボディの解析を有効化

/**
 * 新規ユーザー登録 APIエンドポイント
 * POST /api/register
 *
 * リクエストボディ:
 * {
 *   "username": "...",
 *   "password": "..."
 * }
 */
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 必須項目のチェック
        if (!username || !password) {
            return res.status(400).json({ error: 'ユーザー名とパスワードは必須です。' });
        }

        // パスワードのハッシュ化 (ソルトラウンドは10に設定)
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // データベースにユーザー情報を挿入する準備
        const insertUserStmt = db.prepare('INSERT INTO users (username, passwordHash) VALUES (?, ?)');

        // SQL実行
        const result = insertUserStmt.run(username, passwordHash);

        res.status(201).json({
            message: 'ユーザー登録が完了しました。',
            userId: result.lastInsertRowid
        });
    } catch (error) {
        console.error('登録エラー:', error);
        // SQLiteのユニーク制約違反エラーの判定 (ユーザー名が既に存在する場合)
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'そのユーザー名は既に使用されています。' });
        }
        res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
});

/**
 * ログイン APIエンドポイント
 * POST /api/login
 *
 * リクエストボディ:
 * {
 *   "username": "...",
 *   "password": "..."
 * }
 */
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 必須項目のチェック
        if (!username || !password) {
            return res.status(400).json({ error: 'ユーザー名とパスワードは必須です。' });
        }

        // ユーザー名からユーザー情報を取得
        const getUserStmt = db.prepare('SELECT * FROM users WHERE username = ?');
        const user = getUserStmt.get(username);

        // ユーザーが存在しない場合
        if (!user) {
            return res.status(401).json({ error: 'ユーザー名またはパスワードが間違っています。' });
        }

        // パスワードの照合 (提供されたパスワードとデータベースに保存されたハッシュ値を比較)
        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if (!isMatch) {
            return res.status(401).json({ error: 'ユーザー名またはパスワードが間違っています。' });
        }

        // 認証成功時、JWTを発行する
        const payload = {
            id: user.id,
            username: user.username
        };

        // トークンを生成 (有効期限を1時間に設定)
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        res.json({
            message: 'ログインに成功しました。',
            token: token
        });

    } catch (error) {
        console.error('ログインエラー:', error);
        res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
});

/**
 * サーバーの起動
 */
app.listen(PORT, () => {
    console.log(`サーバーがポート ${PORT} で起動しました。`);
});
