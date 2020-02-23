import React from 'react';
import ReactDOM from 'react-dom';

import WebFont from 'webfontloader';

import App from './App';

import './index.css';

WebFont.load({
  custom: {
    families: ['VideoTerminalScreen'],
    urls: ['/fonts.css'],
  },
  active: () => {
    ReactDOM.render(<App />, document.getElementById('root'));
  },
});
