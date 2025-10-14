"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = 3001;
// 重要: この環境変数をOracleのTNS_ADMINパスに設定してください
// 例: C:\oracle\product\19.0.0\client_1\network\admin
const TNS_ADMIN_PATH = process.env.TNS_ADMIN; // 環境変数から取得する方が望ましい
const TNS_FILENAME = 'tnsnames.ora';
const TARGET_TNS_FILE_PATH = TNS_ADMIN_PATH ? path_1.default.join(TNS_ADMIN_PATH, TNS_FILENAME) : '';
// tnsnames.oraの各バージョンを保存するディレクトリ
const TNS_FILES_DIR = 'C:\\Oracle\\各システム用tnsnames.ora';
console.log(`TNS_ADMIN_PATH: ${TNS_ADMIN_PATH}`);
console.log(`TARGET_TNS_FILE_PATH: ${TARGET_TNS_FILE_PATH}`);
console.log(`TNS_FILES_DIR: ${TNS_FILES_DIR}`);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// 利用可能なtnsnamesファイルの一覧（ディレクトリ名）を取得するエンドポイント
app.get('/api/files', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // TNS_FILES_DIR直下のディレクトリ一覧を取得
        const dirents = yield promises_1.default.readdir(TNS_FILES_DIR, { withFileTypes: true });
        const dirNames = dirents
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
        res.json(dirNames);
    }
    catch (err) {
        const error = err;
        console.error('ディレクトリをスキャンできませんでした:', error);
        // ENOENT (No such file or directory) の場合は、ユーザーに分かりやすいメッセージを返す
        if (error.code === 'ENOENT') {
            res.status(404).send(`ディレクトリが見つかりません: ${TNS_FILES_DIR}`);
        }
        else {
            res.status(500).send('ディレクトリをスキャンできませんでした: ' + error.message);
        }
    }
}));
// 現在のtnsnames.oraの内容を取得するエンドポイント
app.get('/api/current', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!TNS_ADMIN_PATH) {
        return res.status(400).send('環境変数 TNS_ADMIN が設定されていません。');
    }
    try {
        const buffer = yield promises_1.default.readFile(TARGET_TNS_FILE_PATH);
        const content = new TextDecoder('shift-jis').decode(buffer);
        res.send(content);
    }
    catch (err) {
        console.error('現在の tnsnames.ora を読み取れませんでした:', err);
        res.status(500).send('現在の tnsnames.ora を読み取れませんでした。まだ存在しない可能性があります。');
    }
}));
// tnsnames.oraファイルを切り替えるエンドポイント
app.post('/api/switch', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { filename: dirName } = req.body; // フロントエンドからはディレクトリ名が送られてくる
    if (!dirName) {
        return res.status(400).send('ディレクトリ名が必要です。');
    }
    if (!TNS_ADMIN_PATH) {
        return res.status(400).send('環境変数 TNS_ADMIN が設定されていません。');
    }
    try {
        const sourceDir = path_1.default.join(TNS_FILES_DIR, dirName);
        const filesInDir = yield promises_1.default.readdir(sourceDir);
        // ディレクトリ内で.oraで終わるファイルを探す
        const oraFile = filesInDir.find(f => f.endsWith('.ora'));
        if (!oraFile) {
            return res.status(404).send(`.ora ファイルがディレクトリ ${dirName} 内に見つかりません。`);
        }
        const sourcePath = path_1.default.join(sourceDir, oraFile);
        yield promises_1.default.copyFile(sourcePath, TARGET_TNS_FILE_PATH); // ファイルをコピー
        res.json({ message: `${dirName} (${oraFile}) への切り替えに成功しました。` });
    }
    catch (err) {
        console.error(`${dirName} への切り替えに失敗しました:`, err);
        res.status(500).send(`${dirName} への切り替えに失敗しました: ${err.message}`);
    }
}));
app.listen(port, () => {
    console.log(`tnsnames-switcher バックエンドが http://localhost:${port} で起動しました`);
    if (!TNS_ADMIN_PATH) {
        console.warn('警告: 環境変数 TNS_ADMIN が設定されていません。');
        console.warn('ファイルの切り替え機能は動作しません。');
    }
    else {
        console.log(`対象の tnsnames.ora パス: ${TARGET_TNS_FILE_PATH}`);
    }
    console.log(`.ora ファイルの検索ディレクトリ: ${TNS_FILES_DIR}`);
});
