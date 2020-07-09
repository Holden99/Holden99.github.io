'use strict';

let footerYear = document.querySelector('.footer__text');
let date = new Date();
footerYear.textContent += date.getFullYear();