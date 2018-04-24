import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import QRCode from 'qrcode.react';
import logo from './logo.svg';
import default_fprint from './img/default_fprint.jpg';
import './App.css';
import Home from './Home.js';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import {computeHmac, getItem, addItem} from './utilities'
import PropTypes from 'prop-types';

class App extends Component {

  constructor(props) {
		super(props);
    this.state = {
    			isLoggedIn: false,
          smsOtp : false,
          timeOtp : false,
          qna : false,
          crOtp : false,
          mobilePush: false,
          qrCode: false,
          fprint: false
    		};
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
        this.refs.userName.disabled=true;
        this.refs.password.disabled=true;
        this.refs.loginButton.style.display = "none";
        var myObject = JSON.parse(result.object);
        myStore.dispatch({
          type: "SET_AUTH_METHODS",
          authMethods: myObject.authMethods
        });

        if (typeof(myObject.authMethods) === 'undefined' || myObject.authMethods.length === 0) {

          myStore.dispatch({
      			type: "LOGIN",
      			username: myObject.username,
            authToken: myObject.authToken
      		});



          return;
        }
        var authMethods = myObject.authMethods.split(",");

        for (var i=0; i< authMethods.length; i++) {
          var item = authMethods[i];
          switch (item) {
            case 'OTP':
              this.setState({
                timeOtp : true,
              });

              break;
            case 'SMS':
              this.setState({
                smsOtp : true,
              });
              break;
            case 'CROTP':
              this.setState({
                crOtp : true,
              });
              break;
            case 'MSOFTCERT':
              this.setState({
                mobilePush : true,
              });
              break;
            case 'QRCODE':
              this.setState({
                qrCode : true,
              });
              break;
            case 'QNA':
              this.setState({
                qna : true,
              });
                break;

            case 'FPRINT':
              this.setState({
                fprint : true,
              });
                break;
            default:
              break;
          }
        }


      } else {
        this.refs.errorMsg.innerHTML="Wrong"
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
      console.log(data.status);
      return data.json();
    })
		.then((result) => {
      console.log(result);
      if (result.code == 0) {
        console.log(result.object)
      } else {
        this.refs.errorMsg.innerHTML="Wrong"
      }
		});
  }
  verifyQNA(){

  }

  showQNA(){

  }

  showFprint(){
    this.refs.fprintContainer.style.display="block";
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
        myStore.dispatch({
          type: "LOGIN",
          username: myObject.username,
          authToken: myObject.authToken
        });
      } else {
        this.refs.errorMsg.innerHTML="Wrong fprint";
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
        this.refs.smsContainer.style.display = "block";
      }
    });
  }

  verifySMS(){
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
        this.setState({
            isLoggedIn : true,
          })
      } else {
        this.refs.errorMsg.innerHTML="Wrong OTP";
      }
    });
  }

  showTimeOTP(){
    this.refs.timeOtpContainer.style.display = "block";
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
        this.setState({
            isLoggedIn : true,
          })
      } else {
        this.refs.errorMsg.innerHTML="Wrong OTP";
      }
    });
  }

  showQR(){
    var timeStamp = Math.floor(new Date().getTime()/1000);
    fetch(`/webresources/auth/requestQrCode`, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body:
        "{'username': '" +this.refs.userName.value +"',"+
        "'details': '" + this.refs.userName.value + "'," +
        "'integrationKey': '" + process.env.REACT_APP_CENTAGATE_INTEGRATION_KEY+"',"+
        "'unixTimestamp': '" +timeStamp+"',"+
        "'hmac': '"+ computeHmac(this.refs.userName.value + this.refs.userName.value + process.env.REACT_APP_CENTAGATE_INTEGRATION_KEY + timeStamp) +"'}"
  	}).then(data => data.json()).then((result) => {
      if (result.code == 0 ) {
        var myObject = JSON.parse(result.object);
        ReactDOM.render(
        <QRCode value= {myObject.qrCode} size="300" />,
          document.getElementById("qrCodeDisplay")
        );
        //this.refs.qrCode.src = "./qrcode?qrtext=" + encodeURIComponent(myObject.qrCode);
        this.refs.qrContainer.style.display = "block";
      }
    });
  }

  verifyQRCode(){

  }

  render() {
    var store = this.context.store;
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

            			<div class="form-group ">
            				<div class = "col-sm-4 left txt_right">User name</div>
                    <div class = "col-sm-6 left"><input ref="userName" type="text" class="form-control" /></div>
            			</div>
                  <br/>

            			<div class="form-group ">
            				<label class="col-sm-4 control-label left txt_right">Password</label>
            				<div class="col-sm-6 left">
                      <input id="passwordHash" ref="password" class="form-control "  maxlength="40" type="password"/>
            				</div>
            			</div>
                  <br/>
                  <div class="form-group">
                    <div class="col-sm-4 left"> </div>
              			<div class="col-sm-6 left">
                      <p class="errorMsg" ref="errorMsg"/>
              			</div>
              		</div>
              		<div class="form-group" ref="loginButton">
                    <div class="col-sm-4 left"> </div>
              			<div class="col-sm-6 left">
                      <button name="action" value="login" onClick={this.doLogin.bind(this)}  class="btn-lg btn-primary pull-m5 left">Login</button>
              			</div>
              		</div>
                  <br/>
                  <div class="form-group">
                    <div class="col-sm-2 left"></div>
                    <div class="col-sm-10 left menu-header">
                      <ul>
                      {
                          this.state.qna ? <li><a href="#qna" onClick={this.showQNA.bind(this)} data-toggle="modal" class="btn" ><i class="fa fa-question-circle"	aria-hidden="true"></i> QNA</a></li> : ""
                      }

                      {
                          this.state.timeOtp ? <li><a href="#timeOTP" onClick={this.showTimeOTP.bind(this)} data-toggle="modal" class="btn" ><i class="fa fa-clock"	aria-hidden="true"></i> TimeOTP</a></li> : ""
                      }

                      {
                          this.state.smsOtp ? <li><a href="#SmsOtp" onClick={this.showSMS.bind(this)} data-toggle="modal" class="btn" ><i class="fa fa-envelope"	aria-hidden="true"></i> SmsOTP</a></li> : ""
                      }

                      {
                          this.state.crOtp ? <li><a href="#crOtp" data-toggle="modal"  class="btn"><i class="fa fa-alarm-clock"	aria-hidden="true"></i> CrOTP</a></li> : ""
                      }

                      {
                          this.state.mobilePush ? <li><a href="#mobile" data-toggle="modal" class="btn" ><i class="fa fa-mobile"	aria-hidden="true"></i> Mobile Push</a></li> : ""
                      }

                      {
                          this.state.qrCode ? <li><a href="#qr" onClick={this.showQR.bind(this)} data-toggle="modal" class="btn" ><i class="fa fa-qrcode"	aria-hidden="true"></i> QR Code</a></li> : ""
                      }

                      {
                          this.state.fprint ? <li><a href="#qr" onClick={this.showFprint.bind(this)} data-toggle="modal" class="btn" ><i class="fa fa-hand-point-up"	aria-hidden="true"></i> Fprint</a></li> : ""
                      }

                      </ul>
                    </div>
                    <div class="form-group hidden" ref="qnaContainer">
                      <div class="col-sm-10 question">  QUESTION  </div>
                      <div class="col-sm-4 left"> </div>
                			<div class="col-sm-6 left">
                        <label class="control-label left txt_right">Answer</label>
                        <input type="text" class="col-sm-2 left form-control" />
                        <button name="action" onClick={this.verifyQNA.bind(this)}  class="btn btn-primary pull-m5 left">Login</button>
                			</div>
                		</div>
                    <div class="form-group hidden" ref="timeOtpContainer">
                      <div class="col-sm-10">  OTP  </div>
                      <div class="col-sm-4 left"> </div>
                			<div class="col-sm-6 left last">
                        <input type="text" ref="timeOtp" class="col-sm-2 left form-control" />
                        <button name="action" onClick={this.verifyTimeOTP.bind(this)}  class="btn btn-primary pull-m5 left">Login</button>
                			</div>
                		</div>
                    <div class="form-group hidden" ref="smsContainer">
                      <div class="col-sm-10">  SMS OTP  </div>
                      <div class="col-sm-4 left"> </div>
                			<div class="col-sm-6 left last">
                        <input type="text" ref="smsOtp" class="col-sm-2 left form-control" />
                        <button name="action" onClick={this.verifySMS.bind(this)}  class="btn btn-primary pull-m5 left">Login</button>
                			</div>
                		</div>
                    <div class="form-group hidden" ref="qrContainer">
                      <div class="col-sm-10 question">  Scan the QR image below </div>
                      <div class="col-sm-2 left"> </div>
                			<div class="col-sm-6 left last">
                        <div id="qrCodeDisplay">
                        </div>
                        <button name="action" onClick={this.verifyQRCode.bind(this)}  class="btn btn-primary pull-m5 left">Login</button>
                			</div>
                		</div>
                    <div class="form-group hidden" ref="fprintContainer">
                      <div class="col-sm-10 question">  Press your finger to the device  </div>
                      <div class="col-sm-2 left"> </div>
                			<div class="col-sm-6 left last">
                        <div>
                          <img ref="fprint" src={default_fprint} alt={default_fprint} width="300px" height="400px"/>
                          <input type="hidden" ref="fprintBase64" />
                        </div>
                        <button name="action" onClick={this.verifyFprint.bind(this)}  class="btn btn-primary pull-m5 left">Login</button>
                			</div>
                		</div>
              	</div>
        </div>


    );
  }
}

App.contextTypes = {
	store: PropTypes.object
}

export default App;
