import { useState, useEffect, type ChangeEvent, useCallback } from 'react';
import axios from 'axios'; // HTTPリクエスト用にaxiosを使用
import './App.css';

const API_BASE_URL = 'http://localhost:3001';

function App() {
  const [files, setFiles] = useState<string[]>([]);
  const [currentTns, setCurrentTns] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editContent, setEditContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [writeBack, setWriteBack] = useState<boolean>(true);

  const fetchCurrentTns = useCallback(async () => {
    try {
      const currentTnsResponse = await axios.get<string>(`${API_BASE_URL}/api/current`);
      setCurrentTns(currentTnsResponse.data);
      // 編集用にも反映
      setEditContent(currentTnsResponse.data);
    } catch (err: unknown) {
      console.error("tnsnames.ora の内容取得中にエラーが発生しました:", err);
      setError('現在の tnsnames.ora の内容を取得できませんでした。');
      setCurrentTns('');
    }
  }, []);

  const fetchInitialData = useCallback(async () => {
    try {
      setError('');
      const filesResponse = await axios.get<string[]>(`${API_BASE_URL}/api/files`);
      setFiles(filesResponse.data);
      if (filesResponse.data.length > 0) {
        setSelectedFile(filesResponse.data[0]);
      }
      await fetchCurrentTns();
    } catch (err: unknown) {
      console.error("データの取得中にエラーが発生しました:", err);
      let errorMessage = 'データを取得できませんでした。';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setCurrentTns('');
    }
  }, [fetchCurrentTns]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleSwitch = async () => {
    if (!selectedFile) {
      setError('切り替えるファイルを選択してください。');
      return;
    }
    try {
      setMessage('');
      setError('');
      const response = await axios.post(`${API_BASE_URL}/api/switch`, { filename: selectedFile });
      setMessage(response.data.message);
      // 切り替え後に現在のtnsnamesの内容を再取得
      await fetchCurrentTns();
    } catch (err: unknown) {
      console.error("ファイルの切り替え中にエラーが発生しました:", err);
      let errorMessage = 'ファイルの切り替えに失敗しました。';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    }
  };

  const startEditing = () => {
    setIsEditing(true);
    setEditContent(currentTns);
    setMessage('');
    setError('');
    setWriteBack(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditContent(currentTns);
    setMessage('');
    setError('');
  };

  const saveEdit = async () => {
    setIsSaving(true);
    setMessage('');
    setError('');
    try {
      const payload: { content: string; dirName?: string } = { content: editContent };
      if (writeBack && selectedFile) payload.dirName = selectedFile;
      const res = await axios.post(`${API_BASE_URL}/api/save`, payload);
      setMessage(res.data.message || '保存に成功しました。');
      setIsEditing(false);
      await fetchCurrentTns();
    } catch (err: unknown) {
      let errorMessage = '保存に失敗しました。';
      if (axios.isAxiosError(err)) errorMessage = String(err.response?.data) || err.message || errorMessage;
      else if (err instanceof Error) errorMessage = err.message;
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>tnsnames.ora切り替えツール</h1>
      </header>
      <main>
        {message && <p className="message success">{message}</p>}
        {error && <p className="message error">{error}</p>}

        <div className="content-wrapper">
          <div className="switcher-container">
            <h2>利用可能なTNSファイル</h2>
            <p>ファイルを選択して「切り替え」ボタンを押してください。</p>
            <div className="controls">
              <select
                value={selectedFile}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedFile(e.target.value)}
                aria-label="TNSファイルを選択"
              >
                {files.map((file) => (
                  <option key={file} value={file}>
                    {file}
                  </option>
                ))}
              </select>
              <button onClick={handleSwitch} disabled={!selectedFile}>
                切り替え
              </button>
            </div>
          </div>

          <div className="current-tns-container">
            <h2>現在の <code>tnsnames.ora</code> の内容</h2>
            {!isEditing ? (
              <>
                <pre><code>{currentTns || '現在の tnsnames.ora を読み込めませんでした。'}</code></pre>
                <div className="edit-controls">
                  <button onClick={startEditing} disabled={!currentTns}>編集</button>
                </div>
              </>
            ) : (
              <>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={20}
                  style={{ width: '100%', fontFamily: 'monospace' }}
                  aria-label="tnsnames.ora 編集"
                />
                <div className="edit-controls">
                  <label style={{ marginRight: 12 }}>
                    <input
                      type="checkbox"
                      checked={writeBack}
                      onChange={(e) => setWriteBack(e.target.checked)}
                      disabled={!selectedFile}
                    />
                    {' '}バージョンフォルダに書き戻す
                  </label>
                  <button onClick={saveEdit} disabled={isSaving}>保存</button>
                  <button onClick={cancelEditing} disabled={isSaving}>キャンセル</button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;