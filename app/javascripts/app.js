import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'
import FamilyTreeWrapper from './FamilyTreeWrapper';
var ethereum_address = require('ethereum-address');

//var familyTreeContract;
var accounts;
var account;

(function(window, document, undefined){
  
    window.App = (function(){    
      var app = { };
      app.init = function() {
        console.log("INIT")
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
      },
      app.start = function() {
          var self = this;
         console.log("compileContract")
         this.familyTreeWrapper = new FamilyTreeWrapper(window.web3);
         this.familyTreeWrapper.initialize();
          
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
            web3.eth.defaultAccount = account;
          
          });
          document.getElementById('findContractButton').addEventListener('click',app.interactWithContract,false);
        },
        app.unlockAccount = function(val) {
          var accounts = web3.eth.coinbase;
          var passphrase = val;
          if(passphrase !=null){
            web3.personal.unlockAccount(web3.eth.coinbase, val,1000, function (error, result){
              if(error){
                var str =error.toString();
                if(str.includes("could not decrypt")){
                  alert("Please enter the valid Passphrase.! ");
                }else{
                  alert(str);
                }
              }
            });
          }
        },
        app.interactWithContract =  function(){
          const ownerAddress = document.getElementById('ownerAddress').value;
          const contractAddress = document.getElementById('contractAddress').value;
          const password = document.getElementById('password').value;

          var validateOwnerAddress = false;
          var validatePassword = false;

          if (password.length == 0 || password == "") {
            console.log("Password must be defined");
          }else{
            validatePassword = true;
          }

          if (ownerAddress.length == 0 || ownerAddress == "") {
            console.log("Owner Address must be defined");
          }else{
            if(ethereum_address.isAddress(ownerAddress)){
              console.log("owner address ok");
              validateOwnerAddress = true
            }else{
              alert("Not a Valid Owner address")
              console.log("not a valid address");
            }
          }

          if(validateOwnerAddress && validatePassword){
            if(contractAddress.length != 0 && contractAddress != ""){
              if (ethereum_address.isAddress(contractAddress)){
                App.unlockAccount(password);
                App.findContract(ownerAddress, contractAddress);
              }else{
                alert("Not a valid contract address")
              }
            }else{
              App.newFamilyTree();
            }
          }
        },
        app.newFamilyTree = function(){
          console.log("New Family Tree");
          //const familyTreeWrapper = new FamilyTreeWrapper(this.familyTreeContract);
          console.log("familyTreeWrapper : " + this.familyTreeWrapper)
          this.familyTreeWrapper.newFamilyTree("Me", "Boy", "long time");
          
        },
        app.findContract = async function(ownerAddress, contractAddress){
  
        console.log("ownerAddress = " + ownerAddress)
        console.log("contractAddress = " + contractAddress)     
      //    const familyTreeWrapper = new FamilyTreeWrapper(familyTreeContract);
          
          try {
            const deployedFamilyTree = this.familyTreeWrapper.findContract(contractAddress);
            //.then(contract => {
              console.log("deployedFamilyTree = " + deployedFamilyTree)
              var number = deployedFamilyTree.getNumberOfFamilyMembers((function(error, result) { 
                console.log('result: ' + result + ', error: ' + error); 
                console.log(`Found ${result} family members`)
                for (var i = 0; i <= result; i++) {
                  var info = deployedFamilyTree.getNode(i, function(error, result){
                    if(!error){
                        console.log(result)
                        console.log(`Family Node ${i} = [${info}]`)
                    }else
                        console.error(error);
                })
                  
                }
              }));

         //   });

          } catch (err) {
            console.log(err);
          }
          return false;
        },
  
        app.setStatus = function(message) {
          var status = document.getElementById("status");
          status.innerHTML = message;
        },
  
        app.refreshBalance = function() {
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
        },
        app.makeTree = function (array) {
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
          document.getElementById('FamilyTree').appendChild(list)
        }
        return app;  
      })();
      if (window.addEventListener) {
        window.addEventListener('DOMContentLoaded', App.init, false);
      }
    })(window, window.document);  