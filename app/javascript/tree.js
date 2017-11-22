const Web3 = require('web3')
const solc = require('solc')
const fs = require('fs')
// const http = require('http')

var options = [
  ['Option 1', 'Option 2'],
  ['First Option', 'Second Option', 'Third Option']
]

export default class FamilyTreeWrapper {
  constructor (web3) {
    this.web3 = web3
  }

// get contract address if it already exists or create a new one

// assuming we have done that, create tree

makeTree (array) {
  // Create the list element:
  var list = document.createElement('ul')

  for (var i = 0; i < array.length; i++) {
    // Create the list item:
    var item = document.createElement('li')

    // Set its contents:
    item.appendChild(document.createTextNode(array[i]))

    // Add it to the list:
    list.appendChild(item)
  }

  // Finally, return the constructed list:
  return list
}

// Add the contents of options[0] to #foo:
document.getElementById('FamilyTree').appendChild(makeTree(options[0]))

