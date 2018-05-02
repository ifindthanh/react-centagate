import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link  } from 'react-router-dom';
import Single from './Single.js';
import Transaction from './Transaction.js';
import {Navbar, Nav, NavItem, NavDropdown, MenuItem} from 'react-bootstrap';
import Main from './Main.js';
import PropTypes from 'prop-types';

class Home extends Component {

  setActive(tab){
    var store = this.context.store;
    store.dispatch({
      type: "SELECT",
      tab: tab
    })
  }

  logout(){
    var myStore = this.context.store;
    myStore.dispatch({
      type: "RESET"
    });
  }

  render() {
    var myStore = this.context.store;
    console.log(myStore.getState().selectedTab);

    return (
      <div>
        <Router>
          <div>
            <div className="headerbar">
              <ul>
                <li><Link to="/" onClick={this.logout.bind(this)}>Logout</Link></li>
                <li><a href="#">{myStore.getState().loginStatus.username}</a></li>
              </ul>
            </div>
            <div className="menubar">
              <ul ref="menuUl">
                <li><Link onClick={this.setActive.bind(this, 'Home')} className={!myStore.getState().selectedTab || myStore.getState().selectedTab === 'Home' ? "active" : ""} to="/home">Home</Link></li>
                <li><Link onClick={this.setActive.bind(this, 'About')} className={myStore.getState().selectedTab === 'About' ? "active" : ""} to="/about">About</Link></li>
                <li><Link onClick={this.setActive.bind(this, 'SelfService')} className={myStore.getState().selectedTab === 'SelfService' ? "active" : ""} to="/selfService">SelfService</Link></li>
                <li><Link onClick={this.setActive.bind(this, 'ListTransaction')} className={myStore.getState().selectedTab === 'ListTransaction' ? "active" : ""} to="/transactions">Transactions</Link></li>
              </ul>
            </div>
            <Route path="/home" component={Main} />
            <Route path="/about" component={Single} />
            <Route path="/selfService" component={Transaction} />
          </div>
        </Router>
      </div>
    );
  }
}
Home.contextTypes = {
	store: PropTypes.object
}
export default Home;
