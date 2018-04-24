import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link  } from 'react-router-dom';
import Single from './Single.js';
import {Navbar, Nav, NavItem, NavDropdown, MenuItem} from 'react-bootstrap';
import Main from './Main.js';
import App from './App.js';
import PropTypes from 'prop-types';

class Home extends Component {

  setActive(event){
    var childNodes = this.refs.menuUl.childNodes;
    for (var i=0; i < childNodes.length; i++) {
      childNodes[i].childNodes[0].className="";
    }

    event.target.className="active";
  }

  logout(){
    var myStore = this.context.store;
    myStore.dispatch({
      type: "LOGOUT"
    });
    window.location.href = window.location.href.split("#")[0];
  }

  render() {
    var myStore = this.context.store;
    console.log(myStore.getState().loginStatus.username);

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
                <li><Link onClick={this.setActive.bind(this)} className="active" to="/home">Home</Link></li>
                <li><Link onClick={this.setActive.bind(this)} to="/about">About</Link></li>
                <li><Link onClick={this.setActive.bind(this)} to="/selfService">SelfService</Link></li>
              </ul>
            </div>
            <Route path="/home" component={Main} />
            <Route path="/about" component={Single} />
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
