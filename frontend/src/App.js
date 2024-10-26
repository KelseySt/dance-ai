import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState(null);

  {/* Fetch data from Flask/Backend */}
  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/data').then(response => response.json())
    .then(data => setData(data))
  }, []);

  return (
    <div className="App">
      <h1>React + Flask Integration</h1>
      {data ? <p>{data.message}</p> : <p>Loading...</p>}
    </div>
  );
}

export default App;
