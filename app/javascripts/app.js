import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'
import FamilyTreeWrapper from './FamilyTreeWrapper';
var ethereum_address = require('ethereum-address');

var accounts;
var account;
var familyTreeWrapper;

(function(window, document,undefined){
  
    window.App = (function(){    
      var app = { };
      app.init = function() {
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
          
        document.getElementById('makeContractButton').addEventListener('click',App.newContract,false);
        document.getElementById('findContractButton').addEventListener('click',App.findContract,false);
        document.getElementById('killContractButton').addEventListener('click',App.destroyContract,false);
      },
        app.destroyContract =  function(){
           //deployedFamilyTree.kill.sendTransaction({from:contractAddress});
        },
        app.error = function(errorString){
          console.log(errorString)
          $('#message').show();
          var error_element = $('#message')
          error_element.text(errorString);
          // document.getElementById("errorMessage").innerHTML = errorString ;
          $('#message').removeClass('fade')
          $("#message").css("display","block");
          //document.getElementById("message").style.display = 'block';
          console.log(error_element.text())
        },
        app.validatePasswordField = function(){
          var valid = false;
          const password = $('#password').val();
          if (password.length != 0 && password != "") {
            valid = true;
          }
          return{
            validPassword: valid
          }
        },
        app.validateAddressField = function(address){
          console.log(`validating ${address}`)
          var valid = false;
          if (address.length != 0 && address != "" && ethereum_address.isAddress(address)) {
            valid = true;
          }
          
          return{
            validAddress: valid
          }
        },
        app.unlockAccount = async function(address) {
          web3.personal.unlockAccount(address, $('#password').val(), 10000, function (error, result){
            if(!error){
              return{unlocked:true}
            }else{
              var str = error.toString();
              if(str.includes("could not decrypt")){
                console.log("Please enter the valid Passphrase.! " + str);
                return{unlocked:false}
              }else{
                return{unlocked:false}
                console.log(str + `for address: ${web3.eth.coinbase} and passphrase ${passphrase}`);
              }
            }
          });
      }, 
        app.newContract = async function(){
          const ownerAddress = document.getElementById('ownerAddress').value;
          var errors = [];

          var validAddress = App.validateAddressField(ownerAddress).validAddress;
          if(!validAddress){
            errors.push("Owner Address is empty or invalid");
          }
          var validPassword = App.validatePasswordField().validPassword;
          if (!validPassword) {
            errors.push("Password is empty");
          }
          var unlocked = App.unlockAccount(ownerAddress);
          if(validPassword && unlocked){
            await App.familyTreeWrapper.newFamilyTree(ownerAddress,"Phillip", "Gibb", "Male", "27051972", (function(error, result) {
              if(!error){
                console.log("Result: " + result)
              }else{
                console.log("Error: " + error)
              }
            }));
          }else{
            errors.push("Password/Passphrase is incorrect for your account address");
            App.displayErrors(errors);
          }
          
        },
        app.findContract = async function() {
          console.log("find")
          const ownerAddress = document.getElementById('ownerAddress').value;
          const contractAddress = document.getElementById('contractAddress').value;
          var errors = [];

          if(!App.validateAddressField(ownerAddress).validAddress){
            errors.push("Owner Address is empty or invalid");
          }

          if(!App.validateAddressField(contractAddress).validAddress){
            errors.push("Contract Address is empty or invalid");
          }
          if(errors.length === 0){
            var unlocked = App.unlockAccount(ownerAddress);
            if (unlocked) {
              try {
                const deployedFamilyTree = App.familyTreeWrapper.findContract(contractAddress);
                if(deployedFamilyTree){
                  console.log("deployedFamilyTree = " + deployedFamilyTree)
                  var number = await deployedFamilyTree.getNumberOfFamilyMembers.call((function(error, result) {
                   if(!error){
                     console.log(`Found ${result} family members`)
                     for (var i = 0; i < result; i++) {
                       console.log(`Family member Nr: ${i}`)
                         App.getNode(deployedFamilyTree,i);
                       }
                     }else{
                      console.log(error);
                      //errors.push(error); - will have to do this manually because of callback
                      // app.error(`Error finding contract at address ${contractAddress}`);
                     }
                   }));
  
                }else{
                  errors.push("Cannot locate the contract");
                }
              } catch (err) {
                errors.push("Cannot locate the contract");
                console.log(err);
              }
            }else{
              errors.push("Password/Passphrase is incorrect for your account address");
            }
          }
 
          if(errors.length != 0){
            App.displayErrors(errors);
          }
        },
        app.displayErrors = function(errors){
          var str = "";
          var error_element = $('#message')
          error_element.html("");
          $('#message').show();
          errors.forEach(function(error){
              str += '<li>' + error + '</li>' // build the list
          });
          
          error_element.html(str);
          // document.getElementById("errorMessage").innerHTML = errorString ;
          $('#message').removeClass('fade')
          $("#message").css("display","block");
          //document.getElementById("message").style.display = 'block';
          errors = []

        },
        
        app.getNode = async function(deployedFamilyTree, index){
          var node = await deployedFamilyTree.getNode.call(index, function(error, result){
            if(!error){
                console.log(`Family Node ${index} = [${result}]`)
            }else{
              document.getElementById('message').value = error;
              $('#message').show();
            }
            })
            console.log("node: " + node)
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
      // $('.alert .close').on('click', function(e) {
      //   $('#message').hide();
      // });
      'use strict';
      // jQuery('#datetimepicker').datetimepicker({
      //   timepicker:false,
      //   formatDate:'DDMMYYYY'
      //  });

      $(function() {
        $('[data-toggle="datepicker"]').datepicker({
          date: new Date(1972, 5, 27), 
          startDate: new Date(1900, 5, 27), 
          endDate: new Date(2020, 5, 27), 
          autoHide: true,
          zIndex: 2048,
        });
      });
    })(window, window.document);  