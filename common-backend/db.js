/**
 * データベース接続および初期化モジュール
 * SQLite（better-sqlite3）を使用し、ユーザー管理用テーブルを提供します。
 */
const Database = require('better-sqlite3');
const path = require('path');

// データベースファイルのパスを設定
// __dirname は現在のファイル（db.js）が存在するディレクトリを指します
const dbPath = path.join(__dirname, 'database.sqlite');

// データベースへの接続（ファイルがない場合は新規作成されます）
const db = new Database(dbPath, { verbose: console.log });

/**
 * データベースの初期化関数
 * usersテーブルが存在しない場合は作成します。
 */
function initializeDB() {
    // ユーザー情報を保存するためのテーブルを作成するSQL
    // id: 一意の識別子（自動インクリメント）
    // username: ユーザー名（一意である必要があります）
    // passwordHash: bcryptなどでハッシュ化されたパスワード
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            passwordHash TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `;

    // SQLを実行
    db.exec(createTableQuery);
    console.log('データベースの初期化が完了しました。');
}

// データベースの初期化を実行
initializeDB();

// dbインスタンスをエクスポート
module.exports = db;
