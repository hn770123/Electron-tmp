/**
 * ログイン画面用のJavaScript
 * フォームの送信イベントを捕捉し、バックエンドへ認証リクエストを送信します。
 * 成功時にはJWTトークンをlocalStorageに保存し、index.htmlへ遷移します。
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const errorMessageEl = document.getElementById('error-message');

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      // フォームのデフォルトの送信処理（ページ遷移）を防ぐ
      event.preventDefault();

      const usernameInput = document.getElementById('username');
      const passwordInput = document.getElementById('password');

      const username = usernameInput.value;
      const password = passwordInput.value;

      // エラーメッセージをクリアして非表示にする
      errorMessageEl.style.display = 'none';
      errorMessageEl.textContent = '';

      try {
        // バックエンドのログインAPIへPOSTリクエストを送信
        const response = await fetch('http://localhost:3000/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
          // ログイン成功
          console.log('ログイン成功:', data.message);

          // トークンをlocalStorageに保存
          if (data.token) {
            localStorage.setItem('jwtToken', data.token);
          }

          // ハローワールド画面(index.html)へ遷移
          window.location.href = 'index.html';
        } else {
          // ログイン失敗（エラーメッセージを表示）
          errorMessageEl.textContent = data.error || 'ログインに失敗しました。';
          errorMessageEl.style.display = 'block';
        }
      } catch (error) {
        // ネットワークエラーなどの例外処理
        console.error('通信エラー:', error);
        errorMessageEl.textContent = 'サーバーとの通信に失敗しました。';
        errorMessageEl.style.display = 'block';
      }
    });
  }
});
