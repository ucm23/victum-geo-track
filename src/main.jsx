import React, { StrictMode } from 'react';
import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter } from "react-router-dom";
import ReactDOM from 'react-dom';
//import 'bootstrap/dist/css/bootstrap.min.css'
import App from './App.jsx'

ReactDOM.render(
  <StrictMode>
    <ChakraProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ChakraProvider>
  </StrictMode>,
  document.getElementById('root')
);
