import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'
import FamilyTreeWrapper from './FamilyTreeWrapper';

var ethereum_address = require('ethereum-address');
var familyTreeWrapper;
var currentOwnerAddress, currentContractAddress;
var familyTreeStructure;

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
        this.familyTreeStructure = new Map();

       // document.getElementById('makeContractButton').addEventListener('click',App.newContract,false);
       // document.getElementById('findContractButton').addEventListener('click',App.findContract,false);
        document.getElementById('killContractButton').addEventListener('click',App.destroyContract,false);
      },
        app.destroyContract =  function(){
          App.clearMessages();
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
        app.validateContractData = function(contractData){
          var errors = [];
          var valid = true;
          var validAddress = App.validateAddressField(contractData.currentOwnerAddress).validAddress;
          if(!validAddress){
            valid = false;
            errors.push("Owner Address is empty or invalid");
          }
          if(!contractData.currentFirstName){
            valid = false;
            errors.push("First Name must be entered");
          }else if (contractData.currentFirstName.length >   16){
            valid = false;
            errors.push("First Name cannot be more than 16 characters");
          }

          if(!contractData.currentLastName){
            valid = false;
            errors.push("Last Name must be entered");
          }else if (contractData.currentLastName.length >   16){
            valid = false;
            errors.push("Last Name cannot be more than 16 characters");
          }
          if(!contractData.currentDob){
            valid = false;
            errors.push("Date of Birth is incorect");
          }
          


          return{
            validData: valid,
            errors: errors
          }
        },
        app.validateAddressField = function(address){
          console.log(`validating ${address}`)
          var valid = false;
          if (address && address.length !== 0 && address !== "" && ethereum_address.isAddress(address)) {
            valid = true;
          }
          
          return{
            validAddress: valid
          }
        },
        app.unlockAccount = async function(address, password) {
          
          await web3.personal.unlockAccount(address, password, 10000, function (error, result) {
            var errors = [];
            if(!error){
              errors.push(`Account ${address} will be unlocked for 10 seconds`);
            }else{
              var str = error.toString();
              if(str.includes("could not decrypt")){
                errors.push(`Please enter the valid Passphrase.! ${str}`);
              }else{
                errors.push(str + `for address: ${web3.eth.coinbase} and passphrase ${passphrase}`);
              }
              App.displayErrors(errors);
            }
          });
      }, 
      app.newContract = async function(contractData){
        
        var errors = [];
        App.clearMessages();
        //var validAddress = App.validateAddressField(this.currentOwnerAddress).validAddress;
        /*
        if(!validAddress){
          errors.push("Owner Address is empty or invalid");
        }



        var validPassword = App.validatePasswordField(password).validPassword;
        if (!validPassword) {
          errors.push("Password is empty");
        }

        

        var unlocked = App.unlockAccount(this.currentOwnerAddress, password);
        */
       // if(validPassword && unlocked){
        const ownerAddress = document.getElementById('ownerAddress').value;
          this.familyTreeWrapper.newFamilyTree(contractData.currentOwnerAddress,contractData.currentFirstName, contractData.currentLastName, contractData.currentGender, contractData.currentDob, (function(error, result) {
          if(!error){
            console.log(">>>>>>>>>>>Result: " + result)
          }else{
            console.log("Error: " + error)
          }
        }));
        /*}else{
          errors.push("Password/Passphrase is incorrect for your account address");
          App.displayErrors(errors);
        }
        */
      },
        app.findContract = async function() {
          console.log("find")
          // const ownerAddress = document.getElementById('ownerAddress').value;
          const contractAddress = document.getElementById('contractAddress').value;
          var errors = [];
          App.clearMessages();
          // if(!App.validateAddressField(ownerAddress).validAddress){
          //   errors.push("Owner Address is empty or invalid");
          // }

          if(!App.validateAddressField(contractAddress).validAddress){
            errors.push("Contract Address is empty or invalid");
          }
          if(errors.length === 0){
            // var unlocked = App.unlockAccount(ownerAddress);
            // if (unlocked) {
              try {
                // this.currentOwnerAddress = ownerAddress;
                // this.currentContractAddress = contractAddress;
                const deployedFamilyTree = App.familyTreeWrapper.findContract(contractAddress);
                if(deployedFamilyTree){
                  var number = await deployedFamilyTree.getNumberOfFamilyMembers.call((function(error, result) {
                   if(!error){
                     console.log(`Found ${result} family members`)
                     for (var i = 0; i < result; i++) {
                       console.log(`Family member Nr: ${i}`)
                         App.getNode(deployedFamilyTree,i, result);
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
          }
 
          if(errors.length != 0){
            App.displayErrors(errors);
          }
        },
        app.clearMessages = function(){
          $('#message').hide();
          var error_element = $('#message');
          error_element.text("");
        },
        app.setNewContract = function(address, contractAddress){
          this.currentOwnerAddress = address;
          this.currentContractAddress = contractAddress;
          return;
        },
        app.showMessage = function(message, type){
          var str = "";
          var error_element = $('#message')
          error_element.html("");
          $('#message').show();
          error_element.html(message);
          $('#message').removeClass('fade')
          $("#message").removeClass (function (index, className) {
            return (className.match ((/alert-\S+/g) || []).join(' '));
          });
         // $('#message').removeClass('alert-danger')
          $('#message').addClass('alert-'+type)
          $("#message").css("display","block");
          
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
          
        app.hexDecode = function(hexx) {
          var hex = hexx.toString(); //force conversion
          var str = '';
          for (var i = 0; i < hex.length; i += 2){

            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
          }
          return str.replace(/\u0000/g,'').trim();
        },

        app.decodeNode = function(node){
          var nodeObj = {};
          nodeObj.firstName = App.hexDecode(node[0]);
          nodeObj.lastName = App.hexDecode(node[1]);
          nodeObj.gender = App.hexDecode(node[2]);
          nodeObj.dob = node[3];
          nodeObj.dod = node[4];
          return nodeObj;
        },
        
        app.getNode = async function(deployedFamilyTree, index, nrOfMembers){
          var node = await deployedFamilyTree.getNode.call(index, function(error, result){
            if(!error){
              var decodedNode = App.decodeNode(result);
              App.familyTreeStructure.set(index, decodedNode);
              console.log(`Family Node ${index} = [${result}]`);
              if((index+1).toString() === nrOfMembers.toString()){
                App.makeTree();
              }
            }else{
             App.showMessage(error, 'danger');
            }
            });
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
        app.makeTree = function () {
          // Create the list element:
          var list = document.createElement('ul');
          
          for (var [key, value] of App.familyTreeStructure) {
            
            // Create the list item:
            var item = document.createElement('li');
        
            //create link
            var link = document.createElement('a');
            link.setAttribute("href", "#");

            // var button = document.createElement('button');
            // button.setAttribute("type","button");
            // button.setAttribute("class","btn btn-secondary");

            link.setAttribute("data-toggle", "tooltip");
            link.setAttribute("data-placement","top");
            link.setAttribute("data-html","true");
            // button.setAttribute("value", value.firstName + " " + value.lastName);
            
            var nodeString = "First Name: " + value.firstName + "<br>";
            nodeString += "Last Name    : " + value.lastName + "<br>";
            nodeString += "Gender       : " + value.gender + "<br>";
            nodeString += "Date of Birth: " + value.dob + "<br>";
            if(value.dod > 0){
              nodeString += "Date of Death: " + value.dod + "<br>";
            }
            link.setAttribute("title", nodeString);
            // Set its contents:
            link.appendChild(document.createTextNode(value.firstName + " " + value.lastName));
            // link.appendChild(button);
            item.appendChild(link);


            // Add it to the list:
            list.appendChild(item);
          }
          document.getElementById('FamilyTreeDisplay').appendChild(list);
        }
        return app;  
      })();

      'use strict';
      var contractData = {}

      $(document).ready(function() {
        // $('[data-toggle="tooltip"]').tooltip()
        jQuery("body").tooltip({ selector: '[data-toggle=tooltip]' });
      })

      $('#retrieveTreeModal').on('show.bs.modal', function() {
        // if(currentOwnerAddress){
        //   $("#ownerAddress").val(this.currentOwnerAddress);
        // }
        if(currentContractAddress){
          $("#contractAddress").val(currentContractAddress);
        }
      });
      if (window.addEventListener) {
        window.addEventListener('DOMContentLoaded', App.init, false);
      }

      $( "#findContractButton" ).click(function() {
        App.findContract();
        $('#retrieveTreeModal').modal('hide');
      });

      $( "#passwordButton" ).click(function() {
        var validatePassword = App.validatePasswordField($('input[name="password"]').val());
        if (!validatePassword.validPassword) {
          errors.push("Password cannot be empty");
        }else {
          this.contractData = new Object();
          this.contractData.currentOwnerAddress =  $('#passwordModal').data('currentOwnerAddress');
          this.contractData.currentFirstName = $('#passwordModal').data('currentFirstName');
          this.contractData.currentLastName =  $('#passwordModal').data('currentLastName');
          this.contractData.currentGender = $('#passwordModal').data('currentGender');
          this.contractData.currentDob = $('#passwordModal').data('currentDob');
//
 /*
          App.unlockAccount(this.contractData.currentOwnerAddress, $('input[name="password"]').val()).then(function(result) {
            if(result.unlocked){
              App.newFamilyTree(contractData);
            }else{
              App.displayErrors(result.errors);
            }
          });
*/
          App.unlockAccount(this.contractData.currentOwnerAddress, $('input[name="password"]').val()).then(function(result){
            $('#passwordModal').modal('hide');
            var contractData = new Object();
            contractData.currentOwnerAddress =  $('#passwordModal').data('currentOwnerAddress');
            contractData.currentFirstName = $('#passwordModal').data('currentFirstName');
            contractData.currentLastName =  $('#passwordModal').data('currentLastName');
            contractData.currentGender = $('#passwordModal').data('currentGender');
            contractData.currentDob = $('#passwordModal').data('currentDob');
            App.newContract(contractData).catch(e => {
              console.log(e);
          });
          }, function(error){
            console.log("error: " + error);
          }).catch(e => {
            console.log(e);
        });
          
        }
      });
      $( "#makeContractButton" ).click(function() {
        this.contractData = new Object();
        this.contractData.currentOwnerAddress = $('input[name="ownerAddress"]').val();
        this.contractData.currentFirstName = $('input[name="firstName"]').val();
        this.contractData.currentLastName = $('input[name="lastName"]').val();
        this.contractData.currentGender =  $('#gender').find(":selected").text();
        var date = new Date($('#dateofbirthpick').val());

        this.contractData.currentDob = date.getDate().toString()+(date.getMonth()+1).toString().padStart(2,"0")+date.getFullYear().toString();
  //      $('#newTreeModal').modal('hide')
        console.log(`currentOwnerAddress ${this.contractData.currentOwnerAddress}`)

        $('#newTreeModal').modal('toggle');
        //  $('#newTreeModal').on('hide.bs.modal', function () {
          var validatedData = App.validateContractData(this.contractData);
        if(validatedData.validData){
          $('#passwordModal').data('currentOwnerAddress', this.contractData.currentOwnerAddress);
          $('#passwordModal').data('currentFirstName', this.contractData.currentFirstName);
          $('#passwordModal').data('currentLastName', this.contractData.currentLastName);
          $('#passwordModal').data('currentGender', this.contractData.currentGender.trim());
          $('#passwordModal').data('currentDob', this.contractData.currentDob);
          $('#passwordModal').modal('show');
        }else{
          App.displayErrors(validatedData.errors);
        }
        //})
      });

      //$( "#makeContractButton" ).click(function() {
      //  App.newContract($('input[name="password"]').val())
      //});
     
      $(function() {
        $('[data-toggle="datepicker"]').datepicker({
          date: new Date(1972, 4, 27), 
          startDate: new Date(1900, 5, 27), 
          endDate: new Date(2020, 5, 27), 
          autoHide: true,
          zIndex: 2048,
        });
        $('#dateofbirthpick').val('05/27/1972');
      });
    })(window, window.document);  