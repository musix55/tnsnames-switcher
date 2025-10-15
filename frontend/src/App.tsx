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

  const fetchCurrentTns = useCallback(async () => {
    try {
      const currentTnsResponse = await axios.get<string>(`${API_BASE_URL}/api/current`);
      setCurrentTns(currentTnsResponse.data);
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
            <pre><code>{currentTns || '現在の tnsnames.ora を読み込めませんでした。'}</code></pre>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;