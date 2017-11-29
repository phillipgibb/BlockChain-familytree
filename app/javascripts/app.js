import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'
import FamilyTreeWrapper from './FamilyTreeWrapper';
var ethereum_address = require('ethereum-address');

//var familyTreeContract;
var accounts;
var account;

(function(window, document){
  
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
          
        document.getElementById('makeContractButton').addEventListener('click',App.interactWithContract,false);
        document.getElementById('findContractButton').addEventListener('click',App.interactWithContract,false);
        document.getElementById('killContractButton').addEventListener('click',App.destroyContract,false);
      },
        app.unlockAccount = function(address, passphrase) {
          document.getElementById('message').value = "";
          if(passphrase !=null){
            web3.personal.unlockAccount(web3.eth.coinbase, passphrase, 10000, function (error, result){
              if(error){
                var str = error.toString();
                if(str.includes("could not decrypt")){
                  alert("Please enter the valid Passphrase.! " + str);
                }else{
                  alert(str + `for address: ${web3.eth.coinbase} and passphrase ${passphrase}`);
                }
              }
            });
          }else{
            app.error("Password/Passphrase is incorrect for your account");
          }
        }, 
        app.destroyContract =  function(){

        },
        app.error = function(errorString){
          console.log(errorString)
          $('#message').show();
          var error_element = $('#message div #errorMessage')
          error_element.text(errorString);
          // document.getElementById("errorMessage").innerHTML = errorString ;
          $('#message').removeClass('fade')
          $("#message").css("display","block");
          //document.getElementById("message").style.display = 'block';
          console.log(error_element.text())
        },
        app.interactWithContract =  function(){
          console.log("interact")
         // $('#message div').val("");
          const ownerAddress = document.getElementById('ownerAddress').value;
          const contractAddress = document.getElementById('contractAddress').value;
          const password = $('#password').val();
          var validateOwnerAddress = false;
          var validatePassword = false;

          if (password.length == 0 || password == "") {
            app.error("Password must be defined");
          }else{
            validatePassword = true;
          }

          if (ownerAddress.length == 0 || ownerAddress == "") {
            app.error("Owner Address must be defined");
          }else{
            if(ethereum_address.isAddress(ownerAddress)){
              validateOwnerAddress = true
            }else{
              app.error("Not a valid Address");
            }
          }

          if(validateOwnerAddress && validatePassword){
            if(contractAddress.length != 0 && contractAddress != ""){
              if (ethereum_address.isAddress(contractAddress)){
                // App.unlockAccount(contractAddress,password);
                document.getElementById('message').value = "";
                $('#message').hide();
                var flag = web3.personal.unlockAccount(web3.eth.coinbase, password, 10000);
                if(flag){
                  const deployedFamilyTree = this.familyTreeWrapper.findContract(contractAddress);
                  deployedFamilyTree.kill.sendTransaction({from:contractAddress});
                }else{
                  app.error("Password/Passphrase is incorrect for your account");
                }
              }else{
                app.error("Not a valid contract address");
              }
            }else{
              app.error("Not a valid owner and contract address");
            }
          }
        },
        app.newFamilyTree = function(contractAddress){
          this.familyTreeWrapper.newFamilyTree(contractAddress,"Me", "Boy", "long time");
        },
        app.findContract = async function(ownerAddress, contractAddress){
          document.getElementById('message').value = "";
          $('#message').hide();
          try {
            const deployedFamilyTree = this.familyTreeWrapper.findContract(contractAddress);
            //.then(contract => {
              console.log("deployedFamilyTree = " + deployedFamilyTree)
               var number = await deployedFamilyTree.getNumberOfFamilyMembers.call((function(error, result) {
                if(!error){
                  console.log(`Found ${result} family members`)
                  for (var i = 0; i < result; i++) {
                    console.log(`Family member Nr: ${i}`)
                      App.getNode(deployedFamilyTree,i);
                    }
                  }else{
                    app.error(`Error finding contract at address ${contractAddress}`);
                  }
                }));
         //   });
          } catch (err) {
            console.log(err);
          }
          return false;
        },
        app.getNode = function(deployedFamilyTree, index){
          deployedFamilyTree.getNode.call(index, function(error, result){
            if(!error){
                console.log(`Family Node ${index} = [${result}]`)
            }else
              document.getElementById('message').value = error;
              $('#message').show();
            })
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
      $('.alert .close').on('click', function(e) {
        $('#message').hide();
      });
    })(window, window.document);  