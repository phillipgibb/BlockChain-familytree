import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract'
import FamilyTreeWrapper from './FamilyTreeWrapper';
var ethereum_address = require('ethereum-address');
//import  svgDraw from './svgDraw';
import Belay from './belay';

var familyTreeWrapper;
var belay;

(function (window, document, undefined) {

  window.App = (function () {

    var app = {};
    var account = 0x0;
    var contractAddress;

    var familyTreeStructure;
    var partnerships;
    var connections = [];

    app.init = function () {
       belay = new Belay();
       belay.init({strokeWidth: 1});
       belay.set('strokeColor', '#999');
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
      App.displayAccountInfo();
      App.start();
    },
      app.displayAccountInfo = function () {
        web3.eth.getCoinbase(function (err, account) {
          if (!err) {
            App.account = account;
            web3.eth.getBalance(App.account, function (err, balance) {
              if (!err) {
                var amount = web3.fromWei(balance, "ether") + " ETH";
                $("#account").text(App.account);
                $("#amount").text(amount);
                //App.findContractsFromAddress(App.account);
                App.getTransactionsByAccount(App.account, 0, 10);
              }
            });
          }
        });
      },
      app.start = function () {
        var self = this;
        this.familyTreeWrapper = new FamilyTreeWrapper(window.web3);
        this.familyTreeWrapper.initialize();
        this.familyTreeStructure = new Map();
        this.partnerships = new Map();

        // document.getElementById('makeContractButton').addEventListener('click',App.newContract,false);
        // document.getElementById('findContractButton').addEventListener('click',App.findContract,false);
        document.getElementById('killContractButton').addEventListener('click', App.destroyContract, false);
      },
      app.setNewContract = function (newContractAddress) {
        App.contractAddress = newContractAddress;
      },
      app.findContractsFromAddress = function () {
        $("#contractListDropdown").find('a').remove();
        console.log("looking for contract from " + web3.eth.accounts[0]);
        var filter = web3.eth.filter({ fromBlock: 0, toBlock: 'latest', address: web3.eth.accounts[0] });

        filter.get(function (err, transactions) {

          if (!err) {
            console.log(JSON.stringify(transactions));
            // console.log("transactions: "+transactions);

            transactions.forEach(function (tx) {
              web3.eth.getTransactionReceipt(tx.transactionHash, function (error, result) {
                if (!error) {
                  console.log(JSON.stringify(result));
                  /* Here you have
                  txInfo.contractAddress;
                  txInfo.from;
                  txInfo.input;
                  */
                  $("#contractListDropdown").append(`<a class="dropdown-item">${result.contractAddress}</a>`);
                  // $('#contractListDropdown a').on('click', function () {
                  //   App.contractAddress = $(this).text();
                  //   App.findContract();
                  // });
                  console.log("found " + result.contractAddress);
                } else {
                  console.log(error);
                }
              });

            })
          } else {
            console.log(error);
          }
        });
      },
      app.destroyContract = function () {
        App.clearMessages();
        //deployedFamilyTree.kill.sendTransaction({from:contractAddress});
      },
      app.error = function (errorString) {
        console.log(errorString)
        $('#message').show();
        var error_element = $('#message')
        error_element.text(errorString);
        // document.getElementById("errorMessage").innerHTML = errorString ;
        $('#message').removeClass('fade')
        $("#message").css("display", "block");
        //document.getElementById("message").style.display = 'block';
        console.log(error_element.text())
      },
      app.validatePasswordField = function () {
        var valid = false;
        const password = $('#password').val();
        if (password.length != 0 && password != "") {
          valid = true;
        }
        return {
          validPassword: valid
        }
      },
      app.validateContractData = function (contractData) {
        var errors = [];
        var valid = true;
        var validAddress = App.validateAddressField(contractData.currentOwnerAddress).validAddress;
        if (!validAddress) {
          valid = false;
          errors.push("Owner Address is empty or invalid");
        }
        if (!contractData.currentFirstName) {
          valid = false;
          errors.push("First Name must be entered");
        } else if (contractData.currentFirstName.length > 16) {
          valid = false;
          errors.push("First Name cannot be more than 16 characters");
        }

        if (!contractData.currentLastName) {
          valid = false;
          errors.push("Last Name must be entered");
        } else if (contractData.currentLastName.length > 16) {
          valid = false;
          errors.push("Last Name cannot be more than 16 characters");
        }
        if (!contractData.currentDob) {
          valid = false;
          errors.push("Date of Birth is incorect");
        }



        return {
          validData: valid,
          errors: errors
        }
      },
      app.validateAddressField = function (address) {
        console.log(`validating ${address}`)
        var valid = false;
        if (address && address.length !== 0 && address !== "" && ethereum_address.isAddress(address)) {
          valid = true;
        }

        return {
          validAddress: valid
        }
      },
      app.unlockAccount = async function (address, password) {

        await web3.personal.unlockAccount(address, password, 10000, function (error, result) {
          var errors = [];
          if (!error) {
            errors.push(`Account ${address} will be unlocked for 10 seconds`);
          } else {
            var str = error.toString();
            if (str.includes("could not decrypt")) {
              errors.push(`Please enter the valid Passphrase.! ${str}`);
            } else {
              errors.push(str + `for address: ${web3.eth.coinbase} and passphrase ${passphrase}`);
            }
            App.displayErrors(errors);
          }
        });
      },
      app.addFamilyMember = async function (contractData) {

        var errors = [];
        App.clearMessages();

        this.familyTreeWrapper.addFamilyMember(contractData.addFromId, contractData.currentOwnerAddress, contractData.currentFirstName, contractData.currentLastName, contractData.currentGender, contractData.currentFamilyType, contractData.currentDob, -1, (function (error, result) {
          if (!error) {
            console.log(">>>>>>>>>>>Result: " + result)
          } else {
            console.log("Error: " + error)
          }
        })).catch(function (error) {
          errors.push("Cannot locate the contract");
          console.log(error);
        }
          );
      },

      app.getTransactionsByAccount = function (myaccount, startBlockNumber, endBlockNumber) {
        if (endBlockNumber == null) {
          endBlockNumber = web3.eth.blockNumber;
          console.log("Using endBlockNumber: " + endBlockNumber);
        }
        if (startBlockNumber == null) {
          startBlockNumber = endBlockNumber - 1000;
          console.log("Using startBlockNumber: " + startBlockNumber);
        }
        console.log("Searching for transactions to/from account \"" + myaccount + "\" within blocks " + startBlockNumber + " and " + endBlockNumber);

        for (var i = startBlockNumber; i <= endBlockNumber; i++) {
          if (i % 1000 == 0) {
            console.log("Searching block " + i);
          }
          var block = web3.eth.getBlock(i, true, function (error, block) {
            if (block != null && block.transactions != null) {
              block.transactions.forEach(function (e) {
                if (myaccount == "*" || myaccount == e.from || myaccount == e.to) {
                  console.log("  tx hash          : " + e.hash + "\n"
                    + "   nonce           : " + e.nonce + "\n"
                    + "   blockHash       : " + e.blockHash + "\n"
                    + "   blockNumber     : " + e.blockNumber + "\n"
                    + "   transactionIndex: " + e.transactionIndex + "\n"
                    + "   from            : " + e.from + "\n"
                    + "   to              : " + e.to + "\n"
                    + "   value           : " + e.value + "\n"
                    + "   time            : " + block.timestamp + " " + new Date(block.timestamp * 1000).toGMTString() + "\n"
                    + "   gasPrice        : " + e.gasPrice + "\n"
                    + "   gas             : " + e.gas);

                  web3.eth.getTransactionReceipt(e.hash, function (error, result) {
                    if (!error) {
                      if (result.contractAddress) {
                        $("#contractListDropdown").append(`<a class="dropdown-item">${result.contractAddress}</a>`);
                        // $('#contractListDropdown a').on('click', function () {
                        //   App.contractAddress = $(this).text();
                        //   console.log("Finding contract from click")
                        //   App.findContract();
                        // });
                        console.log("found " + result.contractAddress);
                      }
                    } else {
                      console.log(error);
                    }
                  });









                }
              })
            }
          }
          );

        }
      },
      app.newContract = async function (contractData) {

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
        console.log("Creating contract with account: " + App.account);
        this.familyTreeWrapper.newFamilyTree(App.account, contractData.currentFirstName, contractData.currentLastName, contractData.currentGender, contractData.currentDob, (function (error, result) {
          if (!error) {
            console.log(">>>>>>>>>>>Result: " + result)
          } else {
            console.log("Error: " + error)
          }
        }));
        /*}else{
          errors.push("Password/Passphrase is incorrect for your account address");
          App.displayErrors(errors);
        }
        */
      },
      app.displayNewFamilyTree = function(result){
        var message = "Contract Address: <b>" + result.contractAddress + "</b>";
        message += "<p/>"
        message += "Transaction Hash: " + result.transactionHash;
        App.setNewContract(result.contractAddress);
        $("#contractListDropdown").append(`<a class="dropdown-item">${result.contractAddress}</a>`);
        App.showMessage(message, 'success');
        App.findContract();
      },
      app.findContract = async function () {
        console.log("find")
        // const ownerAddress = document.getElementById('ownerAddress').value;

        var errors = [];
        App.clearMessages();
        this.familyTreeStructure = new Map();
        // if(!App.validateAddressField(ownerAddress).validAddress){
        //   errors.push("Owner Address is empty or invalid");
        // }

        if (!App.validateAddressField(App.contractAddress).validAddress) {
          errors.push("Contract Address is empty or invalid");
        }
        if (errors.length === 0) {
          // var unlocked = App.unlockAccount(ownerAddress);
          // if (unlocked) {
          try {
            // this.currentOwnerAddress = ownerAddress;
            // this.currentContractAddress = contractAddress;
            const deployedFamilyTree = App.familyTreeWrapper.findContract(App.contractAddress);
            if (deployedFamilyTree) {
              var number = App.familyTreeWrapper.getNumberOfFamilyMembers((function (error, result) {
                if (!error) {
                  console.log(`Found ${result} family members`)
                  for (var i = 0; i < result; i++) {
                    console.log(`Family member Nr: ${i}`)
                    App.getNode(deployedFamilyTree, i, result);
                  }
                } else {
                  console.log(error);
                  //errors.push(error); - will have to do this manually because of callback
                  // app.error(`Error finding contract at address ${contractAddress}`);
                }
              }));

            } else {
              errors.push("Cannot locate the contract");
            }
          } catch (err) {
            errors.push("Cannot locate the contract");
            console.log(err);
          }
        }

        if (errors.length != 0) {
          App.displayErrors(errors);
        }
      },
      app.clearMessages = function () {
        $('#message').hide();
        var error_element = $('#message');
        error_element.text("");
      },
      app.showMessage = function (message, type) {
        var str = "";
        var error_element = $('#message')
        error_element.html("");
        $('#message').show();
        error_element.html(message);
        $('#message').removeClass('fade')
        $("#message").removeClass(function (index, className) {
          return (className.match((/alert-\S+/g) || []).join(' '));
        });
        // $('#message').removeClass('alert-danger')
        $('#message').addClass('alert-' + type)
        $("#message").css("display", "block");

      },
      app.displayErrors = function (errors) {
        var str = "";
        var error_element = $('#message')
        error_element.html("");
        $('#message').show();
        errors.forEach(function (error) {
          str += '<li>' + error + '</li>' // build the list
        });

        error_element.html(str);
        // document.getElementById("errorMessage").innerHTML = errorString ;
        $('#message').removeClass('fade')
        $("#message").css("display", "block");
        //document.getElementById("message").style.display = 'block';
        errors = []

      },

      app.hexDecode = function (hexx) {
        var hex = hexx.toString(); //force conversion
        var str = '';
        for (var i = 0; i < hex.length; i += 2) {

          str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        return str.replace(/\u0000/g, '').trim();
      },

      app.decodeNode = function (node) {
        var nodeObj = {};
        nodeObj.firstName = App.hexDecode(node[0]);
        nodeObj.lastName = App.hexDecode(node[1]);
        nodeObj.gender = App.hexDecode(node[2]);
        nodeObj.dob = node[3];
        nodeObj.spouseId = node[4];
        nodeObj.dod = node[5];
        nodeObj.numberOfChildren = node[6];
        
        return nodeObj;
      },

      app.getNode = async function (deployedFamilyTree, index, nrOfMembers) {
        var node = await deployedFamilyTree.getNode.call(index, function (error, result) {
          if (!error) {
            var personNode = App.decodeNode(result);
            console.log(`Family Node ${index} = [${result}]`);
            
            if(personNode.spouseId >= 0){//what if the partnership is divorced?
              var partnership = [index, personNode.spouseId];
              if(personNode.getNumberOfFamilyMembers > 0){
                deployedFamilyTree.getChildren.call(index, function (error, result) {
                  if (!error) {
                    var childrenHex = App.hexDecode(personNode.children);
                    console.log('Found Children: ' + childrenHex);
                    partnership.children = childrenHex.split(',');
                    personNode.partnerships = [partnership];//could be more than one - future
                    App.updateFamilyTreeStructure(index, personNode, nrOfMembers);
                  }else{
                    console.log(error);
                  }
                });
                 
              }else{
                personNode.partnerships = [partnership];//could be more than one - future
                App.updateFamilyTreeStructure(index, personNode, nrOfMembers);
              }
              
            }else{
              App.updateFamilyTreeStructure(index, personNode, nrOfMembers);
            }
            
          } else {
            App.showMessage(error, 'danger');
          }
        });
      },
      app.updateFamilyTreeStructure = function(index, personNode, nrOfMembers){
        App.familyTreeStructure.set(index, personNode);
        if ((index + 1).toString() === nrOfMembers.toString()) {
          App.makeTree();
        }
      }

      app.setStatus = function (message) {
        var status = document.getElementById("status");
        status.innerHTML = message;
      },

      app.refreshBalance = function () {
        var self = this;

        var familyTree;
        FamilyTree.deployed().then(function (instance) {
          familyTree = instance;
          return familyTree.getBalance.call(account, { from: account });
        }).then(function (value) {
          var balance_element = document.getElementById("balance");
          balance_element.innerHTML = value.valueOf();
        }).catch(function (e) {
          console.log(e);
          self.setStatus("Error getting balance; see log.");
        });
      },
      app.addNode = function (key, value) {
       // Create the list item:
        var item = document.createElement('li');
        
        //maybe use string rather
        //create link
        var addSpan = document.createElement('span');
        var delSpan = document.createElement('span');
        //<i class="far fa-plus-square"></i>
        var addIcon = document.createElement('i');
        var delIcon = document.createElement('i');
        addIcon.setAttribute("class", "far fa-plus-square");
        addIcon.setAttribute("id", "addIconId_" + key);
        delIcon.setAttribute("class", "far fa-minus-square");

        addIcon.setAttribute("id", "delIconId_" + key);
        //addIcon.onclick = 
        var div = document.createElement('div');
        div.setAttribute("class", "draggable");

        var link = document.createElement('a');
        link.setAttribute("href", "#");
        link.setAttribute("class", "btn btn-outline-info");
        link.setAttribute("data-toggle", "tooltip");
        link.setAttribute("data-placement", "top");
        link.setAttribute("data-html", "true");

        var nodeString = "First Name: " + value.firstName + "<br>";
        nodeString += "Last Name    : " + value.lastName + "<br>";
        nodeString += "Gender       : " + value.gender + "<br>";
        nodeString += "Date of Birth: " + value.dob + "<br>";
        if (value.dod > 0) {
          nodeString += "Date of Death: " + value.dod + "<br>";
        }
        link.setAttribute("title", nodeString);
        // Set its contents:
        link.appendChild(document.createTextNode(value.firstName + " " + value.lastName));
        // link.appendChild(button);

        addSpan.appendChild(addIcon);
        delSpan.appendChild(delIcon);
        div.appendChild(addSpan);
        div.appendChild(link);
        div.appendChild(delSpan);
        item.appendChild(div);
        
        delSpan.addEventListener("click", function () {
          $('#delFamilyMemberModal').data('delFromId', key);
          $('#delFamilyMemberModal').modal('show');
        });
        addSpan.addEventListener("click", function () {
          $('#addFamilyMemberModal').data('addFromId', key);
          $('#addFamilyMemberModal').modal('show');
        });
        App.familyTreeStructure.delete(key); 
        return item;
      },
      app.makeTree = function () {
        App.connections = [];
        console.log("Make tree");//not clearing tree
        $('#FamilyTreeDisplay ul').remove();
        var lines = [];
        // Create the list element:
        var list = document.createElement('ul');
        list.setAttribute("id","ul-data");//tried this for orgchart
        var rowNumber = 0;
        for (var [key, value] of App.familyTreeStructure) {
          var rowDiv = document.createElement('div');
          rowDiv.setAttribute("class", "row");

          var familyMember = App.addNode(key, value);//li entry
          var familyMemberKey = "familyMember_"+key
          familyMember.setAttribute("id", familyMemberKey);
          // Add it to the list:
          rowDiv.appendChild(familyMember);
          if(value.partnerships && value.partnerships.length > 0){
            var partnershipId = parseFloat(value.partnerships[0][1]);//0 = doing only one partnership right now and 0 = self
            var partnership = App.addNode(partnershipId, App.familyTreeStructure.get(partnershipId));
            var partnershipKey = "familyMember_"+partnershipId
            partnership.setAttribute("id", partnershipKey);
            // Add it to the list:
            var partnershipCircle = document.createElement('li');
            var partnershipCircleDiv = document.createElement('div');
            partnershipCircleDiv.setAttribute("class", "draggable circle");
            var circleKey = "partnership_"+key+"_"+partnershipId;
            partnershipCircle.setAttribute("id", circleKey);
            partnershipCircle.appendChild(partnershipCircleDiv);
            rowDiv.appendChild(partnershipCircle);
            rowDiv.appendChild(partnership);
            list.appendChild(rowDiv);
            // belay.on($("#"+familyMemberKey), $("#"+circleKey));
            // belay.on($("#"+circleKey), $("#"+partnershipKey));
            App.connections.push({from: familyMemberKey, to: circleKey});
            App.connections.push({from: circleKey, to: partnershipKey});
            //these can only be called when list has been added to the tree
            
            //add to list of lines to be drawn
            //line to circle
            //line from circle
          }   
          
        }
        document.getElementById('FamilyTreeDisplay').appendChild(list);
        //$("#svg1").attr("height", "0");
        //$("#svg1").attr("width", "0");
        for(var connection of App.connections){
         // connectElements($("#svg1"), $("#path"),$("#"+connection.from).find('div')[0], $("#"+connection.to).find('div')[0]);
         belay.on($("#"+connection.from).find('div')[0], $("#"+connection.to).find('div')[0]);
        }
        // $('#FamilyTreeDisplay').orgchart({
        //  // 'chartContainer': '#FamilyTreeDisplay'
        //   'data' : $('#ul-data')
        // });
        // document.querySelector('#FamilyTreeDisplay').appendChild(orgchart);
      }
    return app;
  })();

  'use strict';
  var contractData = {}

  $(document).ready(function () {
    // $('[data-toggle="tooltip"]').tooltip()
    jQuery("body").tooltip({ selector: '[data-toggle=tooltip]' });
  })

  $('#retrieveTreeModal').on('show.bs.modal', function () {
    // if(currentOwnerAddress){
    //   $("#ownerAddress").val(this.currentOwnerAddress);
    // }
    if (App.contractAddress) {
      $("#contractAddress").val(App.contractAddress);
    }
  });
  if (window.addEventListener) {
    window.addEventListener('DOMContentLoaded', App.init, false);
  }

  $("#findContractButton").click(function () {
    App.contractAddress = document.getElementById('findContractAddress').value;
    App.findContract();
    $('#retrieveTreeModal').modal('hide');
  });

  $("#passwordButton").click(function () {
    var validatePassword = App.validatePasswordField($('input[name="password"]').val());
    if (!validatePassword.validPassword) {
      errors.push("Password cannot be empty");
    } else {
      this.contractData = new Object();
      this.contractData.currentOwnerAddress = $('#passwordModal').data('currentOwnerAddress');
      this.contractData.currentFirstName = $('#passwordModal').data('currentFirstName');
      this.contractData.currentLastName = $('#passwordModal').data('currentLastName');
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
      App.unlockAccount(this.contractData.currentOwnerAddress, $('input[name="password"]').val()).then(function (result) {
        $('#passwordModal').modal('hide');
        var contractData = new Object();
        contractData.currentOwnerAddress = $('#passwordModal').data('currentOwnerAddress');
        contractData.currentFirstName = $('#passwordModal').data('currentFirstName');
        contractData.currentLastName = $('#passwordModal').data('currentLastName');
        contractData.currentGender = $('#passwordModal').data('currentGender');
        contractData.currentDob = $('#passwordModal').data('currentDob');
        App.newContract(contractData).catch(e => {
          console.log(e);
        });
      }, function (error) {
        console.log("error: " + error);
      }).catch(e => {
        console.log(e);
      });

    }
  });



  $("#makeContractButton").click(function () {
    this.contractData = new Object();
    this.contractData.currentOwnerAddress = App.account;
    this.contractData.currentFirstName = $('input[name="firstName"]').val();
    this.contractData.currentLastName = $('input[name="lastName"]').val();
    this.contractData.currentGender = $('#gender').find(":selected").text();
    var date = new Date($('#dateofbirthpick').val());

    this.contractData.currentDob = date.getDate().toString() + (date.getMonth() + 1).toString().padStart(2, "0") + date.getFullYear().toString();
    console.log(`currentOwnerAddress ${this.contractData.currentOwnerAddress}`)

    $('#newTreeModal').modal('toggle');
    var validatedData = App.validateContractData(this.contractData);
    if (validatedData.validData) {
      App.newContract(this.contractData).catch(e => {
        console.log(e);
      });

    } else {
      App.displayErrors(validatedData.errors);
    }
    //})
  });

  $('body').on('click', '#contractListDropdown a', function () {
    App.contractAddress = $(this).text();
    console.log("Finding contract from click")
    App.findContract();
  });
  $("#addFamilyMemberButton").click(function () {
    //ask for owner address if not present
    this.contractData = new Object();
    this.contractData.currentOwnerAddress = App.account;
    this.contractData.currentContractAddress = App.contractAddress;
    this.contractData.addFromId = $('#addFamilyMemberModal').data('addFromId');
    this.contractData.currentFirstName = $('input[name="add_firstName"]').val();
    this.contractData.currentLastName = $('input[name="add_lastName"]').val();
    this.contractData.currentGender = $('#add_gender').find(":selected").text();
    this.contractData.currentFamilyType = $('#add_type').find(":selected").text();
    var date = new Date($('#add_dateofbirthpick').val());

    this.contractData.currentDob = date.getDate().toString() + (date.getMonth() + 1).toString().padStart(2, "0") + date.getFullYear().toString();
    this.contractData.currentDod = 0;
    //      $('#newTreeModal').modal('hide')
    //   var validatedData = App.validateContractData(this.contractData);
    // if(validatedData.validData){
    //   $('#passwordModal').data('currentOwnerAddress', this.contractData.currentOwnerAddress);
    //   $('#passwordModal').data('currentFirstName', this.contractData.currentFirstName);
    //   $('#passwordModal').data('currentLastName', this.contractData.currentLastName);
    //   $('#passwordModal').data('currentGender', this.contractData.currentGender.trim());
    //   $('#passwordModal').data('currentDob', this.contractData.currentDob);
    //   $('#passwordModal').modal('show');
    // }else{
    //   App.displayErrors(validatedData.errors);
    // }
    App.addFamilyMember(this.contractData);
    $('#addFamilyMemberModal').modal('toggle');
  });


  //$( "#makeContractButton" ).click(function() {
  //  App.newContract($('input[name="password"]').val())
  //});

  $(function () {
    $('[data-toggle="datepicker"]').datepicker({
      date: new Date(1972, 4, 27),
      startDate: new Date(1900, 5, 27),
      endDate: new Date(2020, 5, 27),
      autoHide: true,
      zIndex: 2048,
    });
    $('#dateofbirthpick').val('05/27/1972');
  });

  $(function () {
    $('[data-toggle="add_datepicker"]').datepicker({
      date: new Date(1972, 4, 27),
      startDate: new Date(1900, 5, 27),
      endDate: new Date(2020, 5, 27),
      autoHide: true,
      zIndex: 2048,
    });
    $('#add_dateofbirthpick').val('05/27/1972');
  });


})(window, window.document);  