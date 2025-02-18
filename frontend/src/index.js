import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';
import Upload from './Upload';
import reportWebVitals from './reportWebVitals';
import WrapperComponent from './wrapper';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <WrapperComponent/>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();