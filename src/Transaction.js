import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ib from './img/ib.jpg';
import {computeHmac, checkTransaction} from './utilities'


import ReactDOM from 'react-dom';
import QRCode from 'qrcode.react';

class Transaction extends Component {
  componentDidMount(){
		var myStore = this.context.store;
    if (myStore.getState().action.waitCallback) {
       this.intervalId = setInterval(function(){
         console.log("Auto");
        var stateResult = checkTransaction(myStore.getState().loginStatus.username, myStore.getState().loginStatus.cenToken, myStore.getState().action.action);
        if (stateResult != null) {
          console.log(stateResult);
          alert("Giao dich thanh cong");
        }
      }, 1000);
    }
	}

  showQNA(){
    var store = this.context.store;

    var timeStamp = Math.floor(new Date().getTime()/1000);
    fetch(`/webresources/auth//kba/getQuestions`, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body:
        "{'username': '" +store.getState().loginStatus.username +"',"+
        "'integrationKey': '" + process.env.REACT_APP_CENTAGATE_INTEGRATION_KEY+"',"+
        "'unixTimestamp': '" +timeStamp+"',"+
        "'hmac': '"+ computeHmac(store.getState().loginStatus.username + process.env.REACT_APP_CENTAGATE_INTEGRATION_KEY + timeStamp) +"'}"
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
        this.refs.errorMsg.innerHTML="Wrong fprint";
      }
    });
  }

  showSMS(){
    var store = this.context.store;
    store.dispatch({type: "SELECT_ACTION", action: "SMS"});
  }

  showFprint (){
    var store = this.context.store;
    store.dispatch({type: "SELECT_ACTION", action: "FPRINT"});
  }

  showTimeOTP(){
    var store = this.context.store;
    store.dispatch({type: "SELECT_ACTION", action: "OTP"});
  }

  showQR(){
    var store = this.context.store;
    var timeStamp = Math.floor(new Date().getTime()/1000);
    var userName = store.getState().loginStatus.username;
    var transactionDetail = new Buffer("Transaction from: " + this.refs.fromAccount.value + " to "
    + this.refs.toAccount.value + ". Amount: " + this.refs.amount.value + " "+ this.refs.rate.value).toString('base64');;
    fetch(`/webresources/auth/requestQrCode`, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body:
        "{'username': '" +userName +"',"+
        "'details': '" + transactionDetail + "'," +
        "'integrationKey': '" + process.env.REACT_APP_CENTAGATE_INTEGRATION_KEY+"',"+
        "'unixTimestamp': '" +timeStamp+"',"+
        "'hmac': '"+ computeHmac(userName + transactionDetail + process.env.REACT_APP_CENTAGATE_INTEGRATION_KEY + timeStamp) +"'}"
  	}).then(data => data.json()).then((result) => {
      if (result.code == 0 ) {
        var store = this.context.store;
        var myObject = JSON.parse(result.object);

        store.dispatch({type: "SELECT_ACTION", action: "QRCODE", data: myObject.qrCode, waitCallback: true});
        console.log(store.getState().loginStatus);
        this.intervalId = setInterval(function(){
          console.log("Active");
          var cenToken = computeHmac(store.getState().loginStatus.secretCode, store.getState().loginStatus.username + store.getState().loginStatus.cenToken);
          var stateResult = checkTransaction(store.getState().loginStatus.username, cenToken, 'QRCODE');
            console.log(stateResult);
          if (stateResult != null) {
            console.log(stateResult);
            alert("Giao dich thanh cong");
          }
        }, 1000);
      }
    });
  }

  verifySMS(){

  }

  verifyFprint(){

  }

  verifyTimeOTP(){
    var store = this.context.store;
    var timeStamp = Math.floor(new Date().getTime()/1000);
    var userName = store.getState().loginStatus.username;
    fetch(`/webresources/auth/authOtp`, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body:
        "{'username': '" +userName +"',"+
        "'otp': '" + this.refs.timeOtp.value + "'," +
        "'integrationKey': '" + process.env.REACT_APP_CENTAGATE_INTEGRATION_KEY+"',"+
        "'unixTimestamp': '" +timeStamp+"',"+
        "'hmac': '"+ computeHmac(userName + this.refs.timeOtp.value + process.env.REACT_APP_CENTAGATE_INTEGRATION_KEY + timeStamp) +"'}"
  	}).then(data => data.json()).then((result) => {
      if (result.code == 0 ) {
        var myObject = JSON.parse(result.object);

      } else {


      }
    });
  }

  verifyQNA (){
    var store = this.context.store;
    var userName = store.getState().loginStatus.username;
    var timeStamp = Math.floor(new Date().getTime()/1000);
    var qnaBase64 = new Buffer(this.refs.questionId.value + ":" + this.refs.answer.value).toString('base64');
    fetch(`/webresources/auth/authQna`, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body:
        "{'username': '" + userName +"',"+
        "'integrationKey': '" + process.env.REACT_APP_CENTAGATE_INTEGRATION_KEY+"',"+
        "'data': '" + qnaBase64 + "'," +
        "'unixTimestamp': '" +timeStamp+"',"+
        "'hmac': '"+ computeHmac(userName + process.env.REACT_APP_CENTAGATE_INTEGRATION_KEY + timeStamp + qnaBase64) +"'}"
    }).then(data => data.json()).then((result) => {
      if (result.code == 0 ) {
        alert("Transaction success");
        store.dispatch({type: "RESET_ACTION"});
      } else {
        alert("Transaction failed");
        store.dispatch({type: "RESET_ACTION"});
      }
    });
  }

  verifyQRCode (){

  }

  reset(){
    var store = this.context.store;
    store.dispatch({type: "RESET_ACTION"});
    console.log(this.intervalId);
    clearInterval(this.intervalId);
  }

  render() {
    var store = this.context.store;
    console.log(store.getState().action);
    return (
      <div>
        <div className="App container">
          <header className="trans-header">
            <img src={ib} alt="logo" />
            <h1 className="App-title">Transaction</h1>
          </header>
          <div className="transaction-container">
            <div class="form-group row">
              <label class="col-sm-2 col-form-label left txt_right">From account</label>
              <div class = "col-sm-3 left">
                <input ref="fromAccount" type="text" class="form-control" disabled defaultValue="0123456789"/>
              </div>
              <label class="col-sm-2 col-form-label left txt_right">To account</label>
              <div class = "col-sm-3 left">
                <input ref="toAccount" type="text" class="form-control" defaultValue="987654321"/>
              </div>
            </div>

            <div class="form-group row">
              <label class="col-sm-2 col-form-label left txt_right">Amount</label>
              <div class = "col-sm-3 left">
                <input ref="amount" type="text" class="form-control" defaultValue="50000000"/>
              </div>
              <label class="col-sm-2 col-form-label left txt_right">Money</label>
              <div class = "col-sm-3 left">
                <input ref="rate" type="text" class="form-control" defaultValue="VND"/>
              </div>
            </div>
          </div>
        </div>


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
              store.getState().authMethods.authMethods && store.getState().authMethods.authMethods.split(",").indexOf("MSOFTCERT") >= 0 ? <li><a href="#mobile" data-toggle="modal" class="btn" ><i class="fa fa-mobile"	aria-hidden="true"></i> Mobile Push</a></li> : ""
          }

          {
              store.getState().authMethods.authMethods && store.getState().authMethods.authMethods.split(",").indexOf("QRCODE") >= 0 ? <li><a href="#qr" onClick={this.showQR.bind(this)} data-toggle="modal" class="btn" ><i class="fa fa-qrcode"	aria-hidden="true"></i> QR Code</a></li> : ""
          }

          {
              store.getState().authMethods.authMethods && store.getState().authMethods.authMethods.split(",").indexOf("FPRINT") >= 0 ? <li><a href="#qr" onClick={this.showFprint.bind(this)} data-toggle="modal" class="btn" ><i class="fa fa-hand-point-up"	aria-hidden="true"></i> Fprint</a></li> : ""
          }
          <li><a href="#" onClick={this.reset.bind(this)} data-toggle="modal" class="btn" ><i class="fa fa-hand-point-up"	aria-hidden="true"></i> Reset</a></li>
          </ul>
          </div>
        </div>
        <br/>
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
          <div className="form-group row col-sm-12">
            <div className="col-sm-3 left"></div>
            <div className="col-sm-2 left txt_right"> Input the OTP </div>
            <div className="col-sm-2 left last">
              <input type="text" ref="timeOtp"  className="form-control"/>
            </div>
            <div>
              <button name="action" onClick={this.verifyTimeOTP.bind(this)}  className="btn btn-primary pull-m5 left">Transfer</button>
            </div>
          </div>
          : ""
        }

        {
          store.getState().action.action === "SMS"?
          <div className="form-group row col-sm-12">
            <div className="col-sm-3 left"></div>
            <div className="col-sm-2 left txt_right"> Input the SMS OTP </div>
            <div className="col-sm-2 left last">
              <input type="text" ref="smsOTP"  className="form-control"/>
            </div>
            <div>
              <button name="action" onClick={this.verifySMS.bind(this)}  className="btn btn-primary pull-m5 left">Transfer</button>
            </div>
          </div>
          : ""
        }

        {
          store.getState().action.action === "QRCODE"?
          <div class="form-group row" ref="qrContainer">
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
          <div class="form-group row col-sm-10">
            <div class="col-sm-10 question">  Press your finger to the device  </div>
            <div class="col-sm-2 left"> </div>
            <div class="col-sm-6 left last">
              <div>
                <input type="hidden" ref="fprintBase64" />
              </div>
              <button name="action" onClick={this.verifyFprint.bind(this)}  class="btn btn-primary pull-m5 left">Transfer</button>
            </div>
          </div>
          :""
        }

      </div>
    );
  }
}
Transaction.contextTypes = {
	store: PropTypes.object
}
export default Transaction;
