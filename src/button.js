// import {buttonListener} from "./script.js";


const main = document.querySelector('.main')
const age = document.querySelector('#age')

const myAge = new Date(Date.now() - new Date('2005-08-22').getTime()).getFullYear() - 1970;
age.textContent = myAge;

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
