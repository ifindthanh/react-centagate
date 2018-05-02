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
		authMethods: store.getState().authMethods,
		loginStatus: store.getState().loginStatus,
		selectedTab: store.getState().selectedTab,
		action: store.getState().action
	});
});
function reducer(state = {}, action){
  return {
    authMethods: getAuthMethods(state.authMethods, action),
    loginStatus: getLoginStatus(state.loginStatus, action),
    selectedTab: getSelectedTab(state.selectedTab, action),
		action: getAction(state.action, action)
  }
}

function getAuthMethods(authMethods={}, action){
  switch (action.type) {
    case 'SET_AUTH_METHODS':
      return {
				firstStepLogin: true,
				authMethods: action.authMethods,
				username: action.username,
				password: action.password
			};
		case 'LOGIN_FAILED':
				return Object.assign({}, authMethods, {
					failed: true,
					message: action.message
				});
      break;
		case 'RESET':
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
				authToken: action.authToken,
				secretCode: action.secretCode
			});
      break;
			break;
    case 'RESET':
      return {};
      break;
    default:
    return loginStatus;
  }
  return false;
}

function getSelectedTab(selectedTab='Home', action){
	switch (action.type) {
		case 'SELECT':
			return action.tab;
			break;
		case 'RESET':
	    return "Home";
		default:
			return selectedTab;
	}
  return selectedTab;
}

function getAction (myAction = {}, action) {
	switch (action.type) {
		case 'SELECT_ACTION':
			return {
				action: action.action,
				data: action.data,
				waitCallback: action.waitCallback
			};
			break;
		case 'RESET':
	    return {};
		case 'RESET_ACTION':
		  return {};
		default:
			return myAction;
	}
  return myAction;
}

ReactDOM.render(
  <Provider store={store}>
		<App />
  </Provider>, document.getElementById('root'));
registerServiceWorker();
