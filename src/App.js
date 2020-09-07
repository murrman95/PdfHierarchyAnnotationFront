import React from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';

import { BrowserRouter, Route, Switch } from 'react-router-dom'; 
import logo from './logo.svg';
import './App.css';
import AnnotationApp from './components'

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
            <Route path='/' exact component = {AnnotationApp}/>
        </Switch>

      </BrowserRouter>
    </div>
  );
}

export default App;
