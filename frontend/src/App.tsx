/* eslint-disable */
import /*React,*/ { useState, useEffect } from 'react';
import axios from 'axios'; // HTTPリクエスト用にaxiosを使用
import './App.css';

const API_BASE_URL = 'http://localhost:3001';

function App() {
  const [files, setFiles] = useState<string[]>([]);
  const [currentTns, setCurrentTns] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const fetchData = async () => {
    try {
      setError('');
      const filesResponse = await axios.get<string[]>(`${API_BASE_URL}/api/files`);
      setFiles(filesResponse.data);
      if (filesResponse.data.length > 0 && !selectedFile) {
        setSelectedFile(filesResponse.data[0]);
      }

      const currentTnsResponse = await axios.get<string>(`${API_BASE_URL}/api/current`);
      setCurrentTns(currentTnsResponse.data);
    } catch (err: any) {
      console.error("データの取得中にエラーが発生しました:", err);
      const errorMessage = err.response?.data || err.message || 'サーバーからデータを取得できませんでした。';
      setError(errorMessage);
      setCurrentTns(''); // エラー時は現在の内容をクリア
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      await fetchData();
    } catch (err: any) {
      console.error("ファイルの切り替え中にエラーが発生しました:", err);
      const errorMessage = err.response?.data || err.message || 'ファイルの切り替えに失敗しました。';
      setError(errorMessage);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>tnsnames.ora-switcher</h1>
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
                onChange={(e) => setSelectedFile(e.target.value)}
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