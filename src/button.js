import {buttonListener} from "./script.js";
import gsap from "gsap";

const button = document.querySelector('.button')
const icon = button.querySelector('svg')
const main = document.querySelector('.main')

let state = false;
button.addEventListener('click', () =>
{
  buttonListener(state)
    
  if(state) {
    showInvinsibleButton()
  } else {
    showXmarkButton()
  }

  state = !state;
})

function showInvinsibleButton() {
  button.classList.add('button__invisible')
  button.classList.remove('xmark')

  icon.classList.add('icon_invisible')
  icon.classList.remove('icon_visible')

  main.classList.add('main_invisible')
  main.classList.remove('main_visible')
}

function showXmarkButton() {
  button.classList.remove('button__invisible')
  button.classList.add('xmark')

  icon.classList.remove('icon_invisible')
  icon.classList.add('icon_visible')

  console.log(main);
  main.classList.remove('main_invisible')
  main.classList.add('main_visible')
}