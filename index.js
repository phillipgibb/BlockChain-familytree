

const Web3 = require('web3');
const solc = require('solc');
const fs = require('fs');
const http = require('http');




    function createNewContract(name, gender, dateOfBirth){
        const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
        web3.eth.getAccounts().then((accounts) => {
            const code = fs.readFileSync('./contracts/FamilyTree.sol').toString();
            const compiledCode = solc.compile(code);
            const errors = [];
            const warnings = [];
            (compiledCode.errors || []).forEach((err) => {
                if (/\:\s*Warning\:/.test(err)) {
                    warnings.push(err);
                } else {
                    errors.push(err);
                }
            })

            if (errors.length) {
                throw new Error('solc.compile: ' + errors.join('\n'));
            }
            if (warnings.length) {
                console.warn('solc.compile: ' + warnings.join('\n'));
            }
            const byteCode = compiledCode.contracts[':FamilyTree'].bytecode;
            // console.log('byteCode', byteCode);
            const abiDefinition = JSON.parse(compiledCode.contracts[':FamilyTree'].interface);
            // console.log('abiDefinition', abiDefinition);

            var gasEstimate = web3.eth.estimateGas({
                from: web3.eth.coinbase,
                to: receiverAddress,
                data: setData
            });
            
            var gasPrice = web3.eth.gasPrice;
            
            console.log('gas Price: ' + gasPrice);
            console.log('Estimated Transaction gas: ' + gasEstimate);
            
            
            console.log('unlocking Coinbase account');
            const password = "test1234";
            try {
              web3.personal.unlockAccount(web3.eth.coinbase, password);
            } catch(e) {
              console.log(e);
              return;
            }

            const FamilyTreeContract = new web3.eth.Contract(abiDefinition,{data: byteCode, from: accounts[0], gas: 4700000});
            // console.log('FamilyTreeContract', FamilyTreeContract);

            let deployedContract = null;

            FamilyTreeContract.deploy({arguments: [name, gender, dateOfBirth]}).send(function (error, transactionHash) {
                console.log('transactionHash', transactionHash);
            });

        }
    }
