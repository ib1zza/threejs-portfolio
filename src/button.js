// import {buttonListener} from "./script.js";

 
const main = document.querySelector('.main')

 

function hideInfo() {
 
  main.classList.add('main_invisible')
  main.classList.remove('main_visible')
}

function showInfo() {
 
  main.classList.remove('main_invisible')
  main.classList.add('main_visible')
}

export const toggleButtonState = (state) => {
  if(!state) {
    hideInfo()
  } else {
    showInfo()
  }
}