import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import QRCode from 'qrcode.react';
import logo from './logo.svg';
import default_fprint from './img/default_fprint.jpg';
import './App.css';
import Home from './Home.js';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import {computeHmac, getItem, addItem, checkTransaction} from './utilities'
import PropTypes from 'prop-types';

class App extends Component {

  constructor(props) {
		super(props);
	}

  componentDidMount(){
		var myStore = this.context.store;
		myStore.subscribe(()=>this.forceUpdate());
	}

  doLogin(){
    // if (true) {
    //   this.setState({
    //       isLoggedIn : true,
    //     })
    //     return;
    // }
    var timeStamp = Math.floor(new Date().getTime()/1000);
    var myStore = this.context.store;
    fetch(`/webresources/auth/authBasic`, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body:
        "{'username': '" +this.refs.userName.value +"',"+
        "'password': '" + this.refs.password.value + "'," +
        "'integrationKey': '" + process.env.REACT_APP_CENTAGATE_INTEGRATION_KEY+"',"+
        "'unixTimestamp': '" +timeStamp+"',"+
        "'hmac': '"+ computeHmac(this.refs.userName.value + this.refs.password.value + process.env.REACT_APP_CENTAGATE_INTEGRATION_KEY + timeStamp) +"'}"
  	}).then((data) => {
      return data.json();
    }).then((result) => {
      if (result.code == 0) {
        var myObject = JSON.parse(result.object);
        myStore.dispatch({
          type: "SET_AUTH_METHODS",
          authMethods: myObject.authMethods,
          username: this.refs.userName.value,
          password: this.refs.password.value
        });

        if (typeof(myObject.authMethods) === 'undefined' || myObject.authMethods.length === 0) {
          myStore.dispatch({
      			type: "LOGIN",
      			username: myObject.username,
            authToken: myObject.authToken
      		});
          return;
        }
      } else {
        myStore.dispatch({
          type: "LOGIN_FAILED",
          message: result.message
        });
        return;
      }
		});

  }

  getAuthList(cenToken){
    fetch(`/webresources/auth/list`+this.refs.userName.value, {
      method: "PUT",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body:
        "{'username': '" +this.refs.userName.value +"',"+
        "'cenToken': '" + cenToken + "'}"
  	}).then((data) => {
      return data.json();
    })
		.then((result) => {
      if (result.code == 0) {
      } else {
        this.refs.errorMsg.innerHTML="Wrong"
      }
		});
  }

  loginSuccess(myObject){
    var myStore = this.context.store;
    myStore.dispatch({
      type: "LOGIN",
      username: myObject.username,
      authToken: myObject.authToken,
      secretCode: myObject.secretCode
    });
    myStore.dispatch({type: "RESET_ACTION"});
  }
  verifyQNA(){
    var myStore = this.context.store;
    var timeStamp = Math.floor(new Date().getTime()/1000);
    var qnaBase64 = new Buffer(this.refs.questionId.value + ":" + this.refs.answer.value).toString('base64');
    fetch(`/webresources/auth/authQna`, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body:
        "{'username': '" +this.refs.userName.value +"',"+
        "'integrationKey': '" + process.env.REACT_APP_CENTAGATE_INTEGRATION_KEY+"',"+
        "'data': '" + qnaBase64 + "'," +
        "'unixTimestamp': '" +timeStamp+"',"+
        "'hmac': '"+ computeHmac(this.refs.userName.value + process.env.REACT_APP_CENTAGATE_INTEGRATION_KEY + timeStamp + qnaBase64) +"'}"
  	}).then(data => data.json()).then((result) => {
      if (result.code == 0 ) {
        var myObject = JSON.parse(result.object);
        this.loginSuccess(myObject);
      } else {
        myStore.dispatch({
          type: "LOGIN_FAILED",
          message: result.message
        });
      }
    });
  }

  showQNA(){
    var timeStamp = Math.floor(new Date().getTime()/1000);
    var store = this.context.store;
    fetch(`/webresources/auth//kba/getQuestions`, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body:
        "{'username': '" +this.refs.userName.value +"',"+
        "'integrationKey': '" + process.env.REACT_APP_CENTAGATE_INTEGRATION_KEY+"',"+
        "'unixTimestamp': '" +timeStamp+"',"+
        "'hmac': '"+ computeHmac(this.refs.userName.value + process.env.REACT_APP_CENTAGATE_INTEGRATION_KEY + timeStamp) +"'}"
  	}).then(data => data.json()).then((result) => {
      if (result.code == 0 ) {
        var myObject = JSON.parse(result.object);
        if (myObject.length > 0) {

            store.dispatch({type: "SELECT_ACTION", action: "QNA", data: {
              question: myObject[0].question,
              questionId: myObject[0].id
            }});
        }

      } else {
        store.dispatch({
          type: "LOGIN_FAILED",
          message: result.message
        });
      }
    });
  }

  showFprint(){
    // fetch(`https://localhost:8443/SGIFPCapture`, {
    //   method: "POST",
    //   body: JSON.stringify({
    //     Licstr: "",
    //     Timeout: 100,
    //     Quality: 50,
    //     TemplateFormat: "ISO"
    //   })
  	// }).then(data => data).then((result) => {
    //   console.log(result);
    // });
    var store = this.context.store;
    store.dispatch({type: "SELECT_ACTION", action: "FPRINT"});
    var uri = "https://localhost:8443/SGIFPCapture";

			var xmlhttp = new XMLHttpRequest();
      var parent = this;
			xmlhttp.onreadystatechange = function () {
				if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
					var fpobject = JSON.parse(xmlhttp.responseText);
          parent.refs.fprint.src = "data:image/bmp;base64," + fpobject.BMPBase64;
          parent.refs.fprintBase64.value = fpobject.TemplateBase64;
				}
				else if (xmlhttp.status == 404) {

				}
			}
			var params = "Timeout=" + "10000";
			params += "&Quality=" + "50";
			params += "&templateFormat=" + "ISO";
			xmlhttp.open("POST", uri, true);
			xmlhttp.send(params);

			xmlhttp.onerror = function () {
			}
  }

  verifyFprint(){
    var myStore = this.context.store;
    var timeStamp = Math.floor(new Date().getTime()/1000);

    if (!this.refs.fprintBase64.value || typeof(this.refs.fprintBase64.value) === "undefined" || this.refs.fprintBase64.value.trim() === ''
      || this.refs.fprintBase64.value.trim() === 'undefined') {
      myStore.dispatch({
        type: "LOGIN_FAILED",
        message: "No finger print found"
      });
      return;
    }
    fetch(`/webresources/auth/authFprint`, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body:
        "{'username': '" +this.refs.userName.value +"',"+
        "'fprint': '" + this.refs.fprintBase64.value + "'," +
        "'integrationKey': '" + process.env.REACT_APP_CENTAGATE_INTEGRATION_KEY+"',"+
        "'unixTimestamp': '" +timeStamp+"',"+
        "'hmac': '"+ computeHmac(this.refs.userName.value + process.env.REACT_APP_CENTAGATE_INTEGRATION_KEY + timeStamp + this.refs.fprintBase64.value) +"'}"
  	}).then(data => data.json()).then((result) => {
      if (result.code == 0 ) {
        var myObject = JSON.parse(result.object);
        this.loginSuccess(myObject);
      } else {
        myStore.dispatch({
          type: "LOGIN_FAILED",
          message: result.message
        });
      }
    });
  }

  showSMS(){
    var timeStamp = Math.floor(new Date().getTime()/1000);
    fetch(`/webresources/auth/requestSmsOtp`, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body:
        "{'username': '" +this.refs.userName.value +"',"+
        "'integrationKey': '" + process.env.REACT_APP_CENTAGATE_INTEGRATION_KEY+"',"+
        "'unixTimestamp': '" +timeStamp+"',"+
        "'hmac': '"+ computeHmac(this.refs.userName.value + process.env.REACT_APP_CENTAGATE_INTEGRATION_KEY + timeStamp) +"'}"
  	}).then(data => data.json()).then((result) => {
      if (result.code == 0 ) {
        var store = this.context.store;
        store.dispatch({type: "SELECT_ACTION", action: "SMS"});
      }
    });
  }

  verifySMS(){
    var store = this.context.store;
    var timeStamp = Math.floor(new Date().getTime()/1000);
    fetch(`/webresources/auth/authSmsOtp`, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body:
        "{'username': '" +this.refs.userName.value +"',"+
        "'smsOtp': '" + this.refs.smsOtp.value + "'," +
        "'integrationKey': '" + process.env.REACT_APP_CENTAGATE_INTEGRATION_KEY+"',"+
        "'unixTimestamp': '" +timeStamp+"',"+
        "'hmac': '"+ computeHmac(this.refs.userName.value + this.refs.smsOtp.value + process.env.REACT_APP_CENTAGATE_INTEGRATION_KEY + timeStamp) +"'}"
  	}).then(data => data.json()).then((result) => {

      if (result.code == 0 ) {
        var myObject = JSON.parse(result.object);
        this.loginSuccess(myObject);
      } else {
        store.dispatch({
          type: "LOGIN_FAILED",
          message: result.message
        });
      }
    });
  }

  showTimeOTP(){
    var store = this.context.store;
    store.dispatch({type: "SELECT_ACTION", action: "OTP"});
  }

  verifyTimeOTP(){
    var timeStamp = Math.floor(new Date().getTime()/1000);
    fetch(`/webresources/auth/authOtp`, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body:
        "{'username': '" +this.refs.userName.value +"',"+
        "'otp': '" + this.refs.timeOtp.value + "'," +
        "'integrationKey': '" + process.env.REACT_APP_CENTAGATE_INTEGRATION_KEY+"',"+
        "'unixTimestamp': '" +timeStamp+"',"+
        "'hmac': '"+ computeHmac(this.refs.userName.value + this.refs.timeOtp.value + process.env.REACT_APP_CENTAGATE_INTEGRATION_KEY + timeStamp) +"'}"
  	}).then(data => data.json()).then((result) => {
      if (result.code == 0 ) {
        var myObject = JSON.parse(result.object);
        this.loginSuccess(myObject);
      } else {
        var store = this.context.store;
        store.dispatch({
          type: "LOGIN_FAILED",
          message: result.message
        });
      }
    });
  }

  reset(){
    var store = this.context.store;
    store.dispatch({
      type: "RESET"
    });
    this.refs.userName.value="";
    this.refs.password.value="";
  }

  render() {
    var store = this.context.store;
    console.log(store.getState().action.waitCallback);
    if(store.getState().loginStatus.loggedIn === true){
      return <Home />;
    }

    return (

        <div className="App container">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Welcome to React</h1>
          </header>
          <p className="App-intro">
            To get started, edit <code>src/App.js</code> and save to reload.
          </p>

            			<div class="form-group row">
            				<div class = "col-sm-4 left txt_right">User name</div>

                    <div class = "col-sm-6 left">
                    <input ref="userName" type="text" class="form-control"
                      value= {store.getState().authMethods.username}
                      disabled = {store.getState().authMethods.firstStepLogin} />

                    </div>
            			</div>
            			<div class="form-group row">
            				<label class="col-sm-4 control-label left txt_right">Password</label>
            				<div class="col-sm-6 left">
                      <input id="passwordHash" ref="password" class="form-control "  maxlength="40" type="password"
                        value= {store.getState().authMethods.password}
                        disabled = {store.getState().authMethods.firstStepLogin} />
            				</div>
            			</div>
                  {
                    store.getState().authMethods.failed ?
                    <div class="form-group row">
                      <div class="col-sm-4 left"> </div>
                			<div class="col-sm-6 left">
                        <p class="errorMsg" ref="errorMsg">{store.getState().authMethods.message}</p>
                			</div>
                		</div>
                    :""
                  }
              		<div class="form-group row">
                    <div class="col-sm-4 left"> </div>
              			<div class="col-sm-6 left">
                      <button name="action" value="login" disabled = {store.getState().authMethods.firstStepLogin} onClick={this.doLogin.bind(this)}  class="btn-lg btn-primary pull-m5 left">Login</button>
                      <button name="action" value="reset" onClick={this.reset.bind(this)}  class="btn-lg pull-m5 left">Reset</button>
              			</div>
              		</div>
                  {

                    store.getState().authMethods.firstStepLogin ?
                  <div class="form-group row">
                    <div class="col-sm-2 left"></div>
                    <div class="col-sm-10 left menu-header">
                      <ul>
                      {

                          store.getState().authMethods.authMethods && store.getState().authMethods.authMethods.split(",").indexOf("QNA") >= 0 ? <li><a href="#qna" onClick={this.showQNA.bind(this)} data-toggle="modal" class="btn" ><i class="fa fa-question-circle"	aria-hidden="true"></i> QNA</a></li> : ""
                      }

                      {
                          store.getState().authMethods.authMethods && store.getState().authMethods.authMethods.split(",").indexOf("OTP") >= 0 ? <li><a href="#timeOTP" onClick={this.showTimeOTP.bind(this)} data-toggle="modal" class="btn" ><i class="fa fa-clock"	aria-hidden="true"></i> TimeOTP</a></li> : ""
                      }

                      {
                          store.getState().authMethods.authMethods && store.getState().authMethods.authMethods.split(",").indexOf("SMS") >= 0 ? <li><a href="#SmsOtp" onClick={this.showSMS.bind(this)} data-toggle="modal" class="btn" ><i class="fa fa-envelope"	aria-hidden="true"></i> SmsOTP</a></li> : ""
                      }

                      {
                          store.getState().authMethods.authMethods && store.getState().authMethods.authMethods.split(",").indexOf("CROTP") >= 0 ? <li><a href="#crOtp" data-toggle="modal"  class="btn"><i class="fa fa-alarm-clock"	aria-hidden="true"></i> CrOTP</a></li> : ""
                      }

                      {
                          store.getState().authMethods.authMethods && store.getState().authMethods.authMethods.split(",").indexOf("FPRINT") >= 0 ? <li><a href="#qr" onClick={this.showFprint.bind(this)} data-toggle="modal" class="btn" ><i class="fa fa-hand-point-up"	aria-hidden="true"></i> Fprint</a></li> : ""
                      }

                      </ul>
                    </div>
                  </div>
                    :""
                  }
                    {
                      store.getState().action.action === "QNA"?
                      <div class="form-group row col-sm-12">
                        <div class="col-sm-12 question">  QUESTION  </div>
                        <div class="col-sm-12 left txt_center" ref="question"> {store.getState().action.data.question}</div>
                        <div class="col-sm-5 left">  </div>
                        <div class="col-sm-6 left">
                          <label class="control-label left txt_right">Answer</label>
                          <input type="text" class="col-sm-2 left form-control" ref="answer" />
                          <input type="hidden" ref="questionId" value={store.getState().action.data.questionId}/>
                          <button name="action" onClick={this.verifyQNA.bind(this)}  class="btn btn-primary pull-m5 left">Transfer</button>
                        </div>
                      </div>
                      :""
                    }
                    {
                      store.getState().action.action === "OTP"?
                      <div class="form-group">
                        <div class="col-sm-10">  OTP  </div>
                        <div class="col-sm-4 left"> </div>
                  			<div class="col-sm-6 left last">
                          <input type="text" ref="timeOtp" class="col-sm-2 left form-control" />
                          <button name="action" onClick={this.verifyTimeOTP.bind(this)}  class="btn btn-primary pull-m5 left">Login</button>
                  			</div>
                  		</div>
                      :""
                    }
                    {
                      store.getState().action.action === "SMS"?
                      <div class="form-group" ref="smsContainer">
                        <div class="col-sm-10">  SMS OTP  </div>
                        <div class="col-sm-4 left"> </div>
                  			<div class="col-sm-6 left last">
                          <input type="text" ref="smsOtp" class="col-sm-2 left form-control" />
                          <button name="action" onClick={this.verifySMS.bind(this)}  class="btn btn-primary pull-m5 left">Login</button>
                  			</div>
                  		</div>
                      :""
                    }

                    {
                      store.getState().action.action === "QRCODE"?
                      <div class="form-group" ref="qrContainer">
                        <div class="col-sm-10 question">  Scan the QR image below </div>
                        <div class="col-sm-2 left"> </div>
                        <div class="col-sm-6 left last">
                          <div class="txt_center">
                            {
                              store.getState().action.data && store.getState().action.data != undefined?
                              <QRCode value= {store.getState().action.data} size="300" />:""
                            }
                          </div>
                        </div>
                  		</div>
                      :""
                    }

                    {
                      store.getState().action.action === "FPRINT"?
                      <div class="form-group" ref="fprintContainer">
                        <div class="col-sm-10 question">  Press your finger to the device  </div>
                        <div class="col-sm-2 left"> </div>
                  			<div class="col-sm-6 left last">
                          <div>
                            <img ref="fprint" src={default_fprint} alt={default_fprint} width="300px" height="400px"/>
                            <input type="hidden" ref="fprintBase64" defaultValue=""/>
                          </div>
                          <button name="action" onClick={this.verifyFprint.bind(this)}  class="btn btn-primary pull-m5 left">Login</button>
                  			</div>
                  		</div>
                      :""
                    }

        </div>


    );
  }
}

App.contextTypes = {
	store: PropTypes.object
}

export default App;
