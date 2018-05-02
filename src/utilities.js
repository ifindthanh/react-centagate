import {HmacSHA256} from 'crypto-js';

export function test(){

}

export function computeHmac(message){
  return HmacSHA256(message, process.env.REACT_APP_CENTAGATE_SECRET_KEY).toString();
}

export function loadItems(){
  try {
    var value = sessionStorage.getItem("centagate");
    if (value === null) {
      return undefined;
    }
    return JSON.parse(value);
  } catch (err) {
    return undefined;
  }
}

export function addItem(value){
  try {
    var valueString = JSON.stringify(value);
    sessionStorage.setItem("centagate", valueString)
  } catch (error) {
    //do nothing
  }
}

export function checkTransaction(userName, cenToken, authMethod){
  var timeStamp = Math.floor(new Date().getTime()/1000);
  fetch(`/webresources/auth/statecheck`, {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body:
      "{'username': '" + userName +"',"+
      "'authMethod': '" + authMethod + "'," +
      "'integrationKey': '" + process.env.REACT_APP_CENTAGATE_INTEGRATION_KEY+"',"+
      "'unixTimestamp': '" +timeStamp+"',"+
      "'authToken': '" +cenToken+"',"+
      "'hmac': '"+ computeHmac(userName + authMethod + process.env.REACT_APP_CENTAGATE_INTEGRATION_KEY + timeStamp + cenToken) +"'}"

  }).then((data) => {
    return data.json();
  })
  .then((result) => {
    console.log("a");
    console.log(result);
    if (result.code == 0) {
      return JSON.parse(result.object);
    } else {
      return null;
    }
  });
}
