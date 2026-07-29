# 文理祭2026 公式サイト

コードを書かずにテキストエディタ(メモ帳/VSCodeなど)だけで更新できる、静的なHTMLサイトです。

## 更新のしかた

1. `index.html` を開く
2. `<!-- ▼ここを編集 -->` から `<!-- ここまで編集 -->` の間にある日本語のテキストだけを書き換える
3. 出し物カードやお知らせを増やしたいときは、同じブロック（`<div class="exhibit-card">...</div>` や `<li>...</li>`）をコピーして、その下に貼り付けてから中の文字を変える
4. 保存してブラウザで `index.html` を開けば見た目を確認できる

タグ（`<` と `>` で囲まれた部分）は消さないように注意してください。

## 色を変えたいとき

`css/style.css` の一番上、`:root { ... }` の中にある色コード（`#4b2e83` など）を変えるだけで、サイト全体の配色が変わります。

## GitHub Pagesで公開する手順

1. GitHubで新しいリポジトリを作成する（例: `bunrisai2026`）
2. このフォルダの中身をそのリポジトリにpushする
   ```
   git init
   git add .
   git commit -m "文理祭2026サイト初版"
   git branch -M main
   git remote add origin https://github.com/ユーザー名/リポジトリ名.git
   git push -u origin main
   ```
3. GitHubのリポジトリ画面で「Settings」→「Pages」を開く
4. 「Branch」を `main` / `/(root)` に設定して保存する
5. 数分後、`https://ユーザー名.github.io/リポジトリ名/` でサイトが公開される

## フォルダ構成

```
website/
├── index.html      ページ本体
├── css/style.css   デザイン
├── js/main.js      メニュー開閉などの最小限の動き
├── images/         画像を置く場所
└── README.md       このファイル
```
