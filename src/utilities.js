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
