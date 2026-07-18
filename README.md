# PJCS Pokémon GO Simulator PWA v0.1

iPhoneのSafariで使用し、ホーム画面へ追加できるPWAの第1版です。

## 現在の機能

- 自分・相手の6体とCPを登録
- 90秒の選出タイマー
- 6体から3体を選択し、タップ順で先発・控えを設定
- BO3 / BO5のゲーム進行
- ゲームごとの選出と勝敗履歴
- localStorageによる端末内保存
- Service Workerによる基本的なオフライン対応

## 未実装

- Pokémon・技の全データ
- 個体値、レベル、HP、CP計算
- ターン制バトルエンジン
- ダメージ、エネルギー、シールド、交代、CMP
- 選出AI・バトルAI

## GitHub Pagesで公開

1. GitHubで新しいリポジトリを作る
2. このフォルダ内のファイルをリポジトリ直下へアップロード
3. Settings → Pages
4. Deploy from a branch を選択
5. Branchを main、フォルダを /(root) にして保存
6. 発行されたURLをiPhoneのSafariで開く
7. 共有 → ホーム画面に追加 → Webアプリとして開く

## ローカル確認

Service Workerは `file://` では動作しないため、HTTPサーバーで開いてください。

例:

```bash
python3 -m http.server 8000
```
