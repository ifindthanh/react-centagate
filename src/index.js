import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import {computeHmac, addItem, loadItems} from './utilities'

var persistedItems = loadItems();
console.log(persistedItems);
var store = createStore(reducer, persistedItems);

store.subscribe(()=>{
	addItem({
		loginStatus: store.getState().loginStatus,
		selectedTab: store.getState().selectedTab
	});
});
function reducer(state = {}, action){
  return {
    authMethods: getAuthMethods(state.authMethods, action),
    loginStatus: getLoginStatus(state.loginStatus, action),
    selectedTab: getSelectedTab(state.selectedTab, action)
  }
}

function getAuthMethods(authMethods=[], action){
  switch (action.type) {
    case 'SET_AUTH_METHODS':
      return {
				firstStepLogin: true,
				authMethods: action.authMethods
			};
      break;
		case 'LOGOUT':
	    return {};
    default:
    return authMethods;

  }
}

function getLoginStatus(loginStatus={}, action){
  switch (action.type) {
    case 'LOGIN':
			return Object.assign({}, loginStatus, {
				loggedIn: true,
				username: action.username,
				authToken: action.authToken
			});
      break;
    case 'LOGOUT':
      return {};
      break;
    default:
    return loginStatus;
  }
  return false;
}

function getSelectedTab(selectedTab='HOME', action){
	switch (action.type) {
		case 'SELECT':
			return selectedTab;
			break;
		case 'LOGOUT':
	    return {};
		default:
			return selectedTab;
	}
  return selectedTab;
}

ReactDOM.render(
  <Provider store={store}>
		<App />
  </Provider>, document.getElementById('root'));
registerServiceWorker();
