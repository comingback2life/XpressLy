
(function() {
  "use strict";
  /**
   * selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * event listener function
   */
  const on = (type, el, listener, all = false) => {
    if (all) {
      select(el, all).forEach(e => e.addEventListener(type, listener))
    } else {
      select(el, all).addEventListener(type, listener)
    }
  }

  /**
   * scroll event listener 
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  /**
   * Toggle .header-scrolled class to #header when page is scrolled
   */
  let selectHeader = select('#header')
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        selectHeader.classList.add('header-scrolled')
      } else {
        selectHeader.classList.remove('header-scrolled')
      }
    }
    window.addEventListener('load', headerScrolled)
    onscroll(document, headerScrolled)
  }
  /**
   * Mobile nav toggle
   */
  on('click', '.mobile-nav-toggle', function(e) {
    select('#navbar').classList.toggle('navbar-mobile')
    this.classList.toggle('bi-list')
    this.classList.toggle('bi-x')
  })

  /**
   * Scrool with ofset on links with a class name .scrollto
   */
  on('click', '.scrollto', function(e) {
    if (select(this.hash)) {
      e.preventDefault()

      let navbar = select('#navbar')
      if (navbar.classList.contains('navbar-mobile')) {
        navbar.classList.remove('navbar-mobile')
        let navbarToggle = select('.mobile-nav-toggle')
        navbarToggle.classList.toggle('bi-list')
        navbarToggle.classList.toggle('bi-x')
      }
      scrollto(this.hash)
    }
  }, true)

  /**
   * Animation on scroll
   */
  function aos_init() {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', () => {
    aos_init();
  });

})();

 /**
   * Currency Converter
   * 
   */

const flagFrom = document.getElementById('flag-from');
const flagTo = document.getElementById('flag-to');

const fromAmountInput = document.getElementById('fromAmount');
const fromCurrencyLi = document.getElementById('fromCurrency');
const toAmountInput = document.getElementById('toAmount');
const toCurrencyLi = document.getElementById('toCurrency');

const rateLi = document.querySelector('.rate');
const exchange = document.querySelector('#exchange');

flagFrom.innerHTML = `<img src="./flags/${fromCurrencyLi.value}.png" width="30" class="cpt transition"/>`;
flagTo.innerHTML = `<img src="./flags/${toCurrencyLi.value}.png" width="30" class="cpt transition"/>`;


fromAmountInput.addEventListener('input', calculate);
fromCurrencyLi.addEventListener('change', changeFlagFrom, calculate);
toAmountInput.addEventListener('input', calculate);
toCurrencyLi.addEventListener('change', changeFlagTo, calculate);

function changeFlagFrom() {
  flagFrom.innerHTML = `<img src="./flags/${fromCurrencyLi.value}.png" width="30" class="cpt"/>`;
}

function changeFlagTo() {
  flagTo.innerHTML = `<img src="./flags/${toCurrencyLi.value}.png" width="30" class="cpt"/>`;
}

exchange.addEventListener('click', ()=>{
  const temp = fromCurrencyLi.value;
  fromCurrencyLi.value = toCurrencyLi.value;
  toCurrencyLi.value = temp;
  changeFlagFrom();
  changeFlagTo();
  calculate();
});

function calculate(){
  const fromCurrency = fromCurrencyLi.value;
  const toCurrency = toCurrencyLi.value;

  fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`)
    .then(res => res.json())
    .then(res =>{
    const rate = res.rates[toCurrency];
    rateLi.innerText = `1 ${fromCurrency} = ${rate} ${toCurrency}`;
    toAmountInput.value = (fromAmountInput.value * rate).toFixed(2);
  })
}
calculate();

/**
   * Updating Currency Name
   */

// function updateCurrencyName(e) {
//   // grab data attribute
//   const currencyName = this.selectedOptions[0].dataset.name;
//   // assign currency output text on which was changed
//   const outputText = this.id.includes("currencyContainer")
//     ? document.querySelector("#fromCurrencyText")
//     : document.querySelector("#toCurrencyText");
//   // update html
//   outputText.innerHTML = currencyName;
//   // update amount currency format
//   updateFormat(e);
// }
// fromCurrencyLi.addEventListener("change", updateCurrencyName);
// toCurrencyLi.addEventListener("change", updateCurrencyName);

