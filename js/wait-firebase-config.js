// Firebaseコンソール（https://console.firebase.google.com）で
// プロジェクトを作成 → Firestore Database を有効化 → 「ウェブアプリを追加」
// すると表示される値を、下にそのままコピーしてください。
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// スタッフページ（staff.html）に入るための合言葉。
// 出し物担当に配る前に、好きな文字列に書き換えてください。
// ※このファイルはブラウザから誰でも読めるので、本格的な「パスワード」ではなく
//   「関係者以外がうっかり触らないための合言葉」程度のものだと考えてください。
export const STAFF_PIN = "bunrisai2026";
