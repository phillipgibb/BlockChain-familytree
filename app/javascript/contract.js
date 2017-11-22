import { default as Web3} from 'web3';
import { default as CryptoJS } from 'crypto-js';

var familyTreeABI = JSON.parse(process.env.FAMILYTREE_ABI);
var familyTreeCode = process.env.FAMILYTREE_CODE;
//chekout:
//https://github.com/jsanguinetti/foodsafe/blob/e3f9b8b2d2af3e96ce46e79a3eb95748ae84d5a6/app/javascripts/app.js
export default class FamilyTreeWrapper {
  constructor (web3) {
    this.web3 = web3
  }
  
  estimateGas (params) {
    const estimateGasAsync = (resolve, reject) => {
      this.web3.eth.estimateGas(
        params,
        (error, estimatedGas) => {
          if (error) {
            reject(error)
          } else {
            resolve(estimatedGas)
          }
        }
      )
    }
    return new Promise(estimateGasAsync)
  }

  // Not Needed?
  // Something to have upfront so we don't compile on client machines
  compileContract (){
    const code = fs.readFileSync('./contracts/FamilyTree.sol').toString()
    const compiledCode = solc.compile(code)
    const errors = []
    const warnings = []
    (compiledCode.errors || []).forEach((err) => {
      if (/:\s*Warning:/.test(err)) {
        warnings.push(err)
      } else {
        errors.push(err)
      }
    })

    if (errors.length) {
      throw new Error('solc.compile: ' + errors.join('\n'))
    }
    if (warnings.length) {
      console.warn('solc.compile: ' + warnings.join('\n'))
    }
    
    familyTreeCode = compiledCode.contracts[':FamilyTree'].bytecode
    // console.log('byteCode', byteCode);
    
    familyTreeABI = JSON.parse(compiledCode.contracts[':FamilyTree'].interface)
  }

  createNewContract (name, gender, dateOfBirth) {
    web3.eth.getAccounts().then((accounts) => {
      const estimatedGas = await estimateGas ( { data: familyTreeCode })
      const gasPrice = web3.eth.gasPrice

      console.log('gas Price: ' + gasPrice)
      console.log('Estimated Transaction gas: ' + gasEstimate)
      //TODO: popup to ask for password
      console.log('unlocking Coinbase account')
      const password = 'test1234'
      try {
          web3.personal.unlockAccount(web3.eth.coinbase, password)
      } catch (e) {
        console.log(e)
        return
      }

      const FamilyTreeContract = new web3.eth.Contract(familyTreeABI, {data: familyTreeCode, from: accounts[0], gas: 4700000})
      // console.log('FamilyTreeContract', FamilyTreeContract);

      let deployedContract = null

      FamilyTreeContract.deploy({ arguments: [name, gender, dateOfBirth]}).send(function (error, transactionHash) {
        console.log('transactionHash', transactionHash)
      })
    })
  }

  findContract(contractAddress) {
    const findAsync = (resolve, reject) => {
      this.contract.at(contractAddress, (error, deployedContract) => {
        if (error)
          reject(error);
        else
          resolve(new ContractWrapper(deployedContract));
      });
    };
    return new Promise(findAsync);
  }

}