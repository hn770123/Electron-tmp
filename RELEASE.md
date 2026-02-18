# リリース手順書

このドキュメントでは、ElectronアプリケーションをGitHub上でWindowsおよびmacOS向けにリリースする手順について説明します。

## 前提条件

*   **Node.js**: v20以上を推奨します。
*   **Git**: リポジトリの操作に必要です。
*   **GitHubリポジトリ**: GitHub Actionsが有効になっている必要があります。

## セットアップ

リポジトリをクローンした後、以下のコマンドで依存関係をインストールしてください。

```bash
npm install
```

## ローカルでの開発とビルド

### 開発モードでの起動

以下のコマンドでアプリケーションを起動できます。

```bash
npm start
```

### ローカルビルド

現在のOS向けにインストーラーを作成するには、以下のコマンドを実行します。

```bash
npm run dist
```

生成されたインストーラーは `dist` ディレクトリに出力されます。

**注意**: Windows上でmacOS向けのビルドを行うことや、その逆は、ネイティブモジュールが含まれている場合やコード署名が必要な場合に失敗することがあります。クロスプラットフォームビルドは可能ですが、推奨される方法はCI/CD（GitHub Actions）を利用することです。

## GitHub Actions を利用した自動リリース

このリポジトリには、タグがプッシュされたときに自動的にWindowsおよびmacOS向けのビルドを行い、GitHub Releasesにアップロードするワークフローが設定されています。

### 手順

1.  **バージョンの更新**:
    `package.json` の `version` フィールドを更新します。
    ```json
    "version": "1.0.1"
    ```

2.  **変更のコミットとプッシュ**:
    ```bash
    git add .
    git commit -m "Bump version to 1.0.1"
    git push
    ```

3.  **タグの作成とプッシュ**:
    バージョン番号に対応するタグ（例: `v1.0.1`）を作成し、プッシュします。
    タグは必ず `v` で始まる必要があります。

    ```bash
    git tag v1.0.1
    git push origin v1.0.1
    ```

4.  **ビルドの確認**:
    GitHubのリポジトリページにある「Actions」タブを開き、ワークフローが実行されていることを確認します。

5.  **リリースの確認**:
    ワークフローが成功すると、「Releases」ページに新しいリリースが作成され、インストーラー（`.exe`, `.dmg`, `.zip` など）がアップロードされます。通常は「Draft（下書き）」として作成されるため、内容を確認して公開してください。

## コード署名（Code Signing）について

アプリケーションを配布する場合、OSによる警告（Windows SmartScreenやmacOS Gatekeeper）を回避するためにコード署名が必要です。

### GitHub Actions での署名設定

GitHubリポジトリの `Settings` > `Secrets and variables` > `Actions` に以下のシークレットを追加することで、ビルド時に自動的に署名が行われます。

#### Windows用
*   `WIN_CSC_LINK`: 証明書ファイル（.p12 または .pfx）をBase64エンコードした文字列、または証明書ファイルのダウンロードURL。
*   `WIN_CSC_KEY_PASSWORD`: 証明書のパスワード。

#### macOS用
*   `CSC_LINK`: 証明書ファイル（.p12）をBase64エンコードした文字列、または証明書ファイルのダウンロードURL。
*   `CSC_KEY_PASSWORD`: 証明書のパスワード。
*   **Notarization（公証）**: macOSで警告なく実行するには、Appleによる公証が必要です。これにはApple IDとアプリ用パスワードが必要です（`APPLE_ID`, `APPLE_ID_PASSWORD`, `APPLE_TEAM_ID` など）。詳細は `electron-builder` のドキュメントを参照してください。

## ネイティブモジュールの注意点

`sqlite3` などのネイティブモジュールを使用する場合、ビルド環境（OSやアーキテクチャ）に合わせてコンパイルする必要があります。
`electron-builder` は通常これを自動的に処理しますが、エラーが発生する場合は `electron-rebuild` パッケージを導入し、`postinstall` スクリプトなどで実行するように設定してください。

```bash
npm install --save-dev @electron/rebuild
```

`package.json` の例:
```json
"scripts": {
  "postinstall": "electron-rebuild",
  ...
}
```
