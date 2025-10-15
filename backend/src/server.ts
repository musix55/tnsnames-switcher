import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import cors from 'cors';

const app = express();
const port = 3001;

// 重要: この環境変数をOracleのTNS_ADMINパスに設定してください
// 例: C:\oracle\product\19.0.0\client_1\network\admin
const TNS_ADMIN_PATH = process.env.TNS_ADMIN;
const TNS_FILENAME = 'tnsnames.ora';
const TARGET_TNS_FILE_PATH = TNS_ADMIN_PATH ? path.join(TNS_ADMIN_PATH, TNS_FILENAME) : '';

// tnsnames.oraの各バージョンを保存するディレクトリ
const TNS_FILES_DIR = 'C:\\Oracle\\各システム用tnsnames.ora';

app.use(cors());
app.use(express.json());

// 利用可能なtnsnamesファイルの一覧（ディレクトリ名）を取得するエンドポイント
app.get('/api/files', async (req, res) => {
  try {
    // TNS_FILES_DIR直下のディレクトリ一覧を取得
    const dirents = await fs.readdir(TNS_FILES_DIR, { withFileTypes: true });
    const dirNames = dirents
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    res.json(dirNames);
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    console.error('ディレクトリをスキャンできませんでした:', error);
    // ENOENT (No such file or directory) の場合は、ユーザーに分かりやすいメッセージを返す
    if (error.code === 'ENOENT') {
        res.status(404).send(`ディレクトリが見つかりません: ${TNS_FILES_DIR}`);
    } else {
        res.status(500).send('ディレクトリをスキャンできませんでした: ' + error.message);
    }
  }
});

// 現在のtnsnames.oraの内容を取得するエンドポイント
app.get('/api/current', async (req, res) => {
  if (!TNS_ADMIN_PATH) {
    return res.status(400).send('環境変数 TNS_ADMIN が設定されていません。');
  }
  try {
    const buffer = await fs.readFile(TARGET_TNS_FILE_PATH);
    const content = new TextDecoder('shift-jis').decode(buffer);
    res.send(content);
  } catch (err) {
    console.error('現在の tnsnames.ora を読み取れませんでした:', err);
    res.status(500).send('現在の tnsnames.ora を読み取れませんでした。まだ存在しない可能性があります。');
  }
});

// tnsnames.oraファイルを切り替えるエンドポイント
app.post('/api/switch', async (req, res) => {
  const { filename: dirName } = req.body; // フロントエンドからはディレクトリ名が送られてくる

  if (!dirName) {
    return res.status(400).send('ディレクトリ名が必要です。');
  }
  if (!TNS_ADMIN_PATH) {
    return res.status(400).send('環境変数 TNS_ADMIN が設定されていません。');
  }

  try {
    const sourceDir = path.join(TNS_FILES_DIR, dirName);
    const filesInDir = await fs.readdir(sourceDir);
    const oraFile = filesInDir.find(f => f.endsWith('.ora'));

    if (!oraFile) {
      return res.status(404).send(`.ora ファイルがディレクトリ ${dirName} 内に見つかりません。`);
    }

    const sourcePath = path.join(sourceDir, oraFile);

    await fs.copyFile(sourcePath, TARGET_TNS_FILE_PATH);
    res.json({ message: `${dirName} (${oraFile}) への切り替えに成功しました。` });
  } catch (err) {
    console.error(`${dirName} への切り替えに失敗しました:`, err);
    res.status(500).send(`${dirName} への切り替えに失敗しました: ${(err as Error).message}`);
  }
});

app.listen(port, () => {
  console.log(`tnsnames-switcher バックエンドが http://localhost:${port} で起動しました`);
  if (!TNS_ADMIN_PATH) {
    console.warn('警告: 環境変数 TNS_ADMIN が設定されていません。');
    console.warn('ファイルの切り替え機能は動作しません。');
  } else {
    console.log(`対象の tnsnames.ora パス: ${TARGET_TNS_FILE_PATH}`);
  }
  console.log(`.ora ファイルの検索ディレクトリ: ${TNS_FILES_DIR}`);
});