var $ = require("jquery");
(function () {
  'use strict'

  if (!window.addEventListener) return // Check for IE9+

  

  // This code ensures that the app doesn't run before the page is loaded.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', console.log("asdfgasdgf"))
  } else {
    updateElement()
  }
}())