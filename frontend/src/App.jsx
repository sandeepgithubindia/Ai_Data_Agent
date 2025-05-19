import React, { useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const App = () => {
  const [question, setQuestion] = useState('');
  const [data, setData] = useState([]);
  const [sql, setSQL] = useState('');
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/ask', { question });
      setData(res.data.data);
      setSQL(res.data.sql);
    } catch (err) {
      alert('Error fetching data. Check console for more.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold mb-4 text-center text-blue-600">AI SQL Data Agent</h1>
        
        <div className="mb-4">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a complex business question..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          onClick={askQuestion}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Ask'}
        </button>

        {sql && (
          <div className="mt-6">
            <h2 className="font-semibold text-lg mb-2">Generated SQL</h2>
            <pre className="bg-gray-100 text-sm p-3 rounded border">{sql}</pre>
          </div>
        )}

        {data.length > 0 && (
          <div className="mt-8">
            <h2 className="font-semibold text-lg mb-2">Result Table</h2>
            <div className="overflow-x-auto">
              <table className="table-auto w-full border text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    {Object.keys(data[0]).map((col) => (
                      <th key={col} className="border px-3 py-2 text-left">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="border px-3 py-2">{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Optional: Chart placeholder */}
        {data.length > 0 && (
          <div className="mt-8">
            <h2 className="font-semibold text-lg mb-2">Chart (Coming Soon)</h2>
            <div className="bg-gray-200 h-64 flex items-center justify-center rounded-lg text-gray-600">
              You can visualize this data with a chart based on the context.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
