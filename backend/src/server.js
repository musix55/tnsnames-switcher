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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var cors_1 = require("cors");
var app = (0, express_1.default)();
var port = 3001;
// 重要: この環境変数をOracleのTNS_ADMINパスに設定してください
// 例: C:\oracle\product\19.0.0\client_1\network\admin
var TNS_ADMIN_PATH = process.env.TNS_ADMIN; // 環境変数から取得する方が望ましい
var TNS_FILENAME = 'tnsnames.ora';
var TARGET_TNS_FILE_PATH = TNS_ADMIN_PATH ? path_1.default.join(TNS_ADMIN_PATH, TNS_FILENAME) : '';
// tnsnames.oraの各バージョンを保存するディレクトリ
var TNS_FILES_DIR = 'C:\\Oracle\\各システム用tnsnames.ora';
console.log("TNS_ADMIN_PATH: ".concat(TNS_ADMIN_PATH));
console.log("TARGET_TNS_FILE_PATH: ".concat(TARGET_TNS_FILE_PATH));
console.log("TNS_FILES_DIR: ".concat(TNS_FILES_DIR));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// 利用可能なtnsnamesファイルの一覧（ディレクトリ名）を取得するエンドポイント
app.get('/api/files', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var dirents, dirNames, err_1, error;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, promises_1.default.readdir(TNS_FILES_DIR, { withFileTypes: true })];
            case 1:
                dirents = _a.sent();
                dirNames = dirents
                    .filter(function (dirent) { return dirent.isDirectory(); })
                    .map(function (dirent) { return dirent.name; });
                res.json(dirNames);
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                error = err_1;
                console.error('ディレクトリをスキャンできませんでした:', error);
                // ENOENT (No such file or directory) の場合は、ユーザーに分かりやすいメッセージを返す
                if (error.code === 'ENOENT') {
                    res.status(404).send("\u30C7\u30A3\u30EC\u30AF\u30C8\u30EA\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093: ".concat(TNS_FILES_DIR));
                }
                else {
                    res.status(500).send('ディレクトリをスキャンできませんでした: ' + error.message);
                }
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// 現在のtnsnames.oraの内容を取得するエンドポイント
app.get('/api/current', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var buffer, content, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!TNS_ADMIN_PATH) {
                    return [2 /*return*/, res.status(400).send('環境変数 TNS_ADMIN が設定されていません。')];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, promises_1.default.readFile(TARGET_TNS_FILE_PATH)];
            case 2:
                buffer = _a.sent();
                content = new TextDecoder('shift-jis').decode(buffer);
                res.send(content);
                return [3 /*break*/, 4];
            case 3:
                err_2 = _a.sent();
                console.error('現在の tnsnames.ora を読み取れませんでした:', err_2);
                res.status(500).send('現在の tnsnames.ora を読み取れませんでした。まだ存在しない可能性があります。');
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// tnsnames.oraファイルを切り替えるエンドポイント
app.post('/api/switch', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var dirName, sourceDir, filesInDir, oraFile, sourcePath, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                dirName = req.body.filename;
                if (!dirName) {
                    return [2 /*return*/, res.status(400).send('ディレクトリ名が必要です。')];
                }
                if (!TNS_ADMIN_PATH) {
                    return [2 /*return*/, res.status(400).send('環境変数 TNS_ADMIN が設定されていません。')];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                sourceDir = path_1.default.join(TNS_FILES_DIR, dirName);
                return [4 /*yield*/, promises_1.default.readdir(sourceDir)];
            case 2:
                filesInDir = _a.sent();
                oraFile = filesInDir.find(function (f) { return f.endsWith('.ora'); });
                if (!oraFile) {
                    return [2 /*return*/, res.status(404).send(".ora \u30D5\u30A1\u30A4\u30EB\u304C\u30C7\u30A3\u30EC\u30AF\u30C8\u30EA ".concat(dirName, " \u5185\u306B\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002"))];
                }
                sourcePath = path_1.default.join(sourceDir, oraFile);
                return [4 /*yield*/, promises_1.default.copyFile(sourcePath, TARGET_TNS_FILE_PATH)];
            case 3:
                _a.sent(); // ファイルをコピー
                res.json({ message: "".concat(dirName, " (").concat(oraFile, ") \u3078\u306E\u5207\u308A\u66FF\u3048\u306B\u6210\u529F\u3057\u307E\u3057\u305F\u3002") });
                return [3 /*break*/, 5];
            case 4:
                err_3 = _a.sent();
                console.error("".concat(dirName, " \u3078\u306E\u5207\u308A\u66FF\u3048\u306B\u5931\u6557\u3057\u307E\u3057\u305F:"), err_3);
                res.status(500).send("".concat(dirName, " \u3078\u306E\u5207\u308A\u66FF\u3048\u306B\u5931\u6557\u3057\u307E\u3057\u305F: ").concat(err_3.message));
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.listen(port, function () {
    console.log("tnsnames-switcher \u30D0\u30C3\u30AF\u30A8\u30F3\u30C9\u304C http://localhost:".concat(port, " \u3067\u8D77\u52D5\u3057\u307E\u3057\u305F"));
    if (!TNS_ADMIN_PATH) {
        console.warn('警告: 環境変数 TNS_ADMIN が設定されていません。');
        console.warn('ファイルの切り替え機能は動作しません。');
    }
    else {
        console.log("\u5BFE\u8C61\u306E tnsnames.ora \u30D1\u30B9: ".concat(TARGET_TNS_FILE_PATH));
    }
    console.log(".ora \u30D5\u30A1\u30A4\u30EB\u306E\u691C\u7D22\u30C7\u30A3\u30EC\u30AF\u30C8\u30EA: ".concat(TNS_FILES_DIR));
});
