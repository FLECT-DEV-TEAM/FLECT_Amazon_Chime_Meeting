import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';

import createSagaMiddleware from 'redux-saga';
import rootSaga from './saga';
import reducer from './reducers';
import Connector from './containers';

const sagaMiddleware = createSagaMiddleware();
const store = createStore(
  reducer,
  applyMiddleware(
    sagaMiddleware
  )
);
sagaMiddleware.run(rootSaga);


ReactDOM.render(
    <Provider store={store}>
       <Connector />
    </Provider>
    ,document.getElementById('root'));

