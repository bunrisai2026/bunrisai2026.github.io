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

## 待ち時間ページ（wait.html / staff.html）の使い方

各出し物の待ち時間を、来場者がスマホで確認できるページです。
- `wait.html` … 来場者用。誰でも見られます。
- `staff.html` … スタッフ用。合言葉を入れると、待ち時間の更新・出し物の追加ができます。

データの保存にはFirebase（Googleの無料サービス）のFirestoreを使います。サーバーを自分で用意する必要はありません。以下の手順は一度だけ行えばOKです。

1. [Firebase コンソール](https://console.firebase.google.com/)にGoogleアカウントでログインし、「プロジェクトを作成」で新しいプロジェクトを作る
2. 左メニューの「Firestore Database」を開き、「データベースの作成」→ ロケーションは `asia-northeast1` （東京）を選ぶ
3. 「ルール」タブを開き、このフォルダの `firestore.rules` の中身を丸ごとコピーして貼り付け、「公開」する
4. プロジェクトの概要ページで「</> (ウェブ)」アイコンをクリックしてウェブアプリを追加する（アプリ名は何でもOK、Firebase Hostingは使わないのでチェック不要）
5. 表示された `firebaseConfig` の値を、`js/wait-firebase-config.js` の中の同名の項目にそのままコピーする
6. 同じファイルの `STAFF_PIN` を、出し物担当に配る合言葉に書き換える（例：`"bunrisai2026-staff"`）
7. いつも通り `git add` → `git commit` → `git push` すれば、`wait.html` / `staff.html` もGitHub Pagesで公開される
8. 公開後、`staff.html` を開いて合言葉を入力し、「出し物を追加」フォームから各出し物を登録する（Firestoreコンソールから手動で追加してもOK）

各出し物の担当者には `.../staff.html` のURLと合言葉を伝えてください。待ち時間の更新はスマホからそのままできます。

※ `STAFF_PIN` はページのソースを見れば分かってしまう簡易的な合言葉であり、本格的なパスワード認証ではありません。文理祭のような短期間のイベントでは十分ですが、その点は理解した上でお使いください。

## フォルダ構成

```
website/
├── index.html                    トップページ
├── wait.html                     待ち時間（来場者用）
├── staff.html                    待ち時間（スタッフ用）
├── css/style.css                 トップページのデザイン
├── css/wait.css                  待ち時間ページのデザイン
├── js/main.js                    メニュー開閉などの最小限の動き
├── js/wait-public.js             来場者用ページのロジック
├── js/wait-staff.js              スタッフ用ページのロジック
├── js/wait-firebase-config.js    Firebaseの接続設定・合言葉
├── firestore.rules               Firestoreのセキュリティルール（コンソールに貼る用）
├── images/                       画像を置く場所
├── files/                        PDFなどダウンロード用ファイルを置く場所
└── README.md                     このファイル
```
