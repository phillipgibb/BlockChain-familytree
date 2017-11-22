import 'bootstrap';
// Import the page's CSS. Webpack will know what to do with it.
import 'bootstrap/dist/css/bootstrap.min.css';
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'
import FamilyTreeWrapper from './contract.js';
import TreeWrapper from './tree.js';

// Import our contract artifacts and turn them into usable abstractions.
import familyTree_artifacts from '../../build/contracts/FamilyTree.json'

// FamilyTree is our usable abstraction, which we'll use through the code below.
var FamilyTree = contract(familyTree_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.App = {
  start: function() {
    var self = this;

    // Bootstrap the Familytree abstraction for Use.
    FamilyTree.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];
    });
  },

  findContract: function(){

    const ownerAddress = document.getElementById('ownerAddress').value;
    const contractAddress = document.getElementById('contractAddress').value;
    const password = document.getElementById('password').value;
    
    const cWrapper = new ContractWrapper(foodSafeContract);
    try {
      const deployedFoodSafe = await cWrapper.at(contractAddress);
      await deployedFoodSafe.addNewLocation(locationId, locationName, encryptedSecret)
    } catch (err) {
      console.log(err);
    }


  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  refreshBalance: function() {
    var self = this;

    var familyTree;
    FamilyTree.deployed().then(function(instance) {
      familyTree = instance;
      return familyTree.getBalance.call(account, {from: account});
    }).then(function(value) {
      var balance_element = document.getElementById("balance");
      balance_element.innerHTML = value.valueOf();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting balance; see log.");
    });
  }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 balance, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
  }

  App.start();
});
