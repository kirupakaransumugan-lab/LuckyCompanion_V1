import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { isElectron } from './utils/platform.js';
import './index.css';

if (!isElectron) document.documentElement.classList.add('isWeb');

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
