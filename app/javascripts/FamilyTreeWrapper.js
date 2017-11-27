var fs = require('fs');
var contract = require("truffle-contract");

export default class  FamilyTreeWrapper {

  constructor(web3){
  this.web3 = web3
  this.familyTreeABI =[{"constant":false,"inputs":[{"name":"childId","type":"int128"},{"name":"firstName","type":"bytes32"},{"name":"lastName","type":"bytes32"},{"name":"gender","type":"bytes32"},{"name":"dateOfBirth","type":"bytes32"},{"name":"dateOfDeath","type":"bytes32"}],"name":"addMother","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"id","type":"int128"},{"name":"dateOfDeath","type":"bytes32"}],"name":"funeral","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"parentId","type":"int128"},{"name":"childId","type":"int128"}],"name":"hasThisChild","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"fatherId","type":"int128"},{"name":"motherId","type":"int128"},{"name":"firstName","type":"bytes32"},{"name":"lastName","type":"bytes32"},{"name":"gender","type":"bytes32"},{"name":"dateOfBirth","type":"bytes32"},{"name":"dateOfDeath","type":"bytes32"}],"name":"addChild","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"firstName","type":"bytes32"},{"name":"lastName","type":"bytes32"},{"name":"gender","type":"bytes32"},{"name":"dateOfBirth","type":"bytes32"},{"name":"dateOfDeath","type":"bytes32"}],"name":"addFamilyMember","outputs":[{"name":"newId","type":"int128"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getNumberOfFamilyMembers","outputs":[{"name":"","type":"int128"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"id","type":"int128"}],"name":"getNode","outputs":[{"name":"gender","type":"bytes32"},{"name":"spouseId","type":"int128"},{"name":"dateOfBirth","type":"bytes32"},{"name":"dateOfDeath","type":"bytes32"},{"name":"motherId","type":"int128"},{"name":"fatherId","type":"int128"},{"name":"noOfChildren","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"childId","type":"int128"},{"name":"firstName","type":"bytes32"},{"name":"lastName","type":"bytes32"},{"name":"gender","type":"bytes32"},{"name":"dateOfBirth","type":"bytes32"},{"name":"dateOfDeath","type":"bytes32"}],"name":"addFather","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"otherSpouseId","type":"int128"},{"name":"firstName","type":"bytes32"},{"name":"lastName","type":"bytes32"},{"name":"gender","type":"bytes32"},{"name":"dateOfBirth","type":"bytes32"},{"name":"dateOfDeath","type":"bytes32"}],"name":"addSpouse","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"spouseId","type":"int128"},{"name":"otherSpouseId","type":"int128"}],"name":"divorse","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"id","type":"int128"}],"name":"getFullName","outputs":[{"name":"","type":"bytes32"},{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"firstName","type":"bytes32"},{"name":"lastName","type":"bytes32"},{"name":"gender","type":"bytes32"},{"name":"dateOfBirth","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"fromAddress","type":"address"},{"indexed":false,"name":"toAddress","type":"address"},{"indexed":false,"name":"linkId","type":"uint256"}],"name":"FamilyCreated","type":"event"}];
  this.familyTreeByteCode = "0x606060405260008054600160a060020a03191633600160a060020a031617905534156200002b57600080fd5b604051608080620010368339810160405280805191906020018051919060200180519190602001805191506200006290506200021b565b6200006c6200022d565b600280546001608060020a03191660011790556101606040519081016040908152600080835260208084018a9052918301889052606083018790526000196080840181905260a0840187905260c0840182905260e08401819052610100840152610120830181905261014083018590528052600190529050807fa6eef7e35abe7026729641147f7915573c7e97b47efa546f5f6e3230263bcb4981518154600f9190910b6001608060020a03166001608060020a03199091161781556020820151600182015560408201516002820155606082015160038201556080820151600482018054600f9290920b6001608060020a03166001608060020a031990921691909117905560a0820151600582015560c0820151600682015560e0820151600782018054600f9290920b6001608060020a03166001608060020a03199092169190911790556101008201518160070160106101000a8154816001608060020a030219169083600f0b6001608060020a031602179055506101208201518160080155610140820151816009019080516200020b92916020019062000292565b509050505050505050506200037e565b60206040519081016040526000815290565b6101606040519081016040908152600080835260208301819052908201819052606082018190526080820181905260a0820181905260c0820181905260e08201819052610100820181905261012082015261014081016200028d6200021b565b905290565b82805482825590600052602060002090600101600290048101928215620003425791602002820160005b838211156200030b57835183826101000a8154816001608060020a030219169083600f0b6001608060020a031602179055509260200192601001602081600f01049283019260010302620002bc565b8015620003405782816101000a8154906001608060020a030219169055601001602081600f010492830192600103026200030b565b505b506200035092915062000354565b5090565b6200037b91905b80821115620003505780546001608060020a03191681556001016200035b565b90565b610ca8806200038e6000396000f3006060604052600436106100b95763ffffffff7c0100000000000000000000000000000000000000000000000000000000600035041663160edbea81146100bb57806326ff6267146100e35780632ce5cac1146100ff578063387987401461013457806341c0e1b514610164578063535f9b3d1461017757806360fbf745146101b25780636d244b69146101c5578063868645191461022a578063a13b54a114610252578063c357b1111461027a578063f713dda01461029b575b005b34156100c657600080fd5b6100b9600435600f0b60243560443560643560843560a4356102cc565b34156100ee57600080fd5b6100b9600435600f0b602435610389565b341561010a57600080fd5b610120600435600f90810b90602435900b6103a5565b604051901515815260200160405180910390f35b341561013f57600080fd5b6100b9600435600f90810b90602435900b60443560643560843560a43560c43561053c565b341561016f57600080fd5b6100b96106d9565b341561018257600080fd5b61019960043560243560443560643560843561071a565b604051600f91820b90910b815260200160405180910390f35b34156101bd57600080fd5b6101996107a5565b34156101d057600080fd5b6101de600435600f0b6107af565b604051968752600f95860b860b6020880152604080880195909552606087019390935290840b840b6080860152830b90920b60a084015260c083019190915260e0909101905180910390f35b341561023557600080fd5b6100b9600435600f0b60243560443560643560843560a435610932565b341561025d57600080fd5b6100b9600435600f0b60243560443560643560843560a435610997565b341561028557600080fd5b6100b9600435600f90810b90602435900b610a08565b34156102a657600080fd5b6102b4600435600f0b610a5e565b60405191825260208201526040908101905180910390f35b60006102db868686868661071a565b600f88810b810b600090815260016020819052604080832060070180546fffffffffffffffffffffffffffffffff19166001608060020a0387870b9081169190911790915590930b825291902060090180549293509190810161033e8382610bb0565b916000526020600020906002918282040191900660100289909190916101000a8154816001608060020a030219169083600f0b6001608060020a031602179055505050505050505050565b600f91820b90910b600090815260016020526040902060060155565b60006103af610be9565b600f84810b900b6000908152600160205260408082208291610160905190810160409081528254600f90810b810b810b83526001840154602080850191909152600285015483850152600385015460608501526004850154820b820b820b6080850152600585015460a0850152600685015460c0850152600785015480830b830b830b60e0860152608060020a9004820b820b90910b61010084015260088401546101208401526009840180549394936101408601939192909182820290910190519081016040528092919081815260200182805480156104d557602002820191906000526020600020906000905b82829054906101000a9004600f0b600f0b81526020019060100190602082600f0104928301926001038202915080841161049e5790505b50505050508152505092508261012001519150600090505b8181101561052e5784600f0b836101400151828151811061050a57fe5b90602001906020020151600f0b14156105265760019350610533565b6001016104ed565b600093505b50505092915050565b600061054b868686868661071a565b905061055788826103a5565b1515610609576001600089600f0b600f0b8152602001908152602001600020600901805480600101828161058b9190610bb0565b506000918252602080832060028084049091018054600f87810b6001608060020a03818116601096909806959095026101000a96870296850219909216959095179091558c840b80850b865260019384905260408087206008018054909501909455930b845292206007018054918316608060020a02919092161790555b61061387826103a5565b15156106cf576001600088600f0b600f0b815260200190815260200160002060090180548060010182816106479190610bb0565b506000918252602080832060028084049091018054919093066010026101000a6001608060020a0381810219909216600f87810b84811693909302919091179094558c840b840b855260019283905260408086206008018054909401909355830b8452922060070180546fffffffffffffffffffffffffffffffff1916918a900b9092161790555b5050505050505050565b6000543373ffffffffffffffffffffffffffffffffffffffff908116911614156107185760005473ffffffffffffffffffffffffffffffffffffffff16ff5b565b60028054600f81810b6001818101830b6001608060020a039081166fffffffffffffffffffffffffffffffff1995861617865591830b830b60009081526020829052604081209182018b90558186018a90556003820189905560058201889055600682018790556004820180549095169092179093556008830155915490910b905095945050505050565b600254600f0b5b90565b60008060008060008060006107c2610be9565b600160008a600f0b600f0b815260200190815260200160002061016060405190810160409081528254600f90810b810b810b83526001840154602080850191909152600285015483850152600385015460608501526004850154820b820b820b6080850152600585015460a0850152600685015460c0850152600785015480830b830b830b60e0860152608060020a9004820b820b90910b61010084015260088401546101208401526009840180549394936101408601939192909182820290910190519081016040528092919081815260200182805480156108ea57602002820191906000526020600020906000905b82829054906101000a9004600f0b600f0b81526020019060100190602082600f010492830192600103820291508084116108b35790505b5050505050815250509050806060015181608001518260a001518360c001518460e00151856101000151866101200151959f949e50929c50909a509850965090945092505050565b6000610941868686868661071a565b600f88810b810b600090815260016020819052604080832060070180546001608060020a03908116608060020a88880b928316021790915590930b825291902060090180549293509190810161033e8382610bb0565b60006109a6868686868661071a565b600f97880b80890b600090815260016020526040808220600490810180546fffffffffffffffffffffffffffffffff199081166001608060020a03978f0b888116919091179092559c0b83529120018054909916911617909655505050505050565b600f91820b820b600090815260016020526040808220600490810180546001608060020a036fffffffffffffffffffffffffffffffff19918216811790925594860b90950b835291200180549091169091179055565b600080610a69610be9565b6001600085600f0b600f0b815260200190815260200160002061016060405190810160409081528254600f90810b810b810b83526001840154602080850191909152600285015483850152600385015460608501526004850154820b820b820b6080850152600585015460a0850152600685015460c0850152600785015480830b830b830b60e0860152608060020a9004820b820b90910b6101008401526008840154610120840152600984018054939493610140860193919290918282029091019051908101604052809291908181526020018280548015610b9157602002820191906000526020600020906000905b82829054906101000a9004600f0b600f0b81526020019060100190602082600f01049283019260010382029150808411610b5a5790505b5050505050815250509050806020015181604001519250925050915091565b815481835581811511610be4576001016002900481600101600290048360005260206000209182019101610be49190610c4c565b505050565b6101606040519081016040908152600080835260208301819052908201819052606082018190526080820181905260a0820181905260c0820181905260e0820181905261010082018190526101208201526101408101610c47610c6a565b905290565b6107ac91905b80821115610c665760008155600101610c52565b5090565b602060405190810160405260008152905600a165627a7a72305820c7fc6b2fde22c3ed0948f5cf4dae690d7bcfee09cfc4d3b7877985cc40632bbd0029";
  
} 

initialize(){
  console.log("Initializing");
  this.familyTreeContract = this.web3.eth.contract(this.familyTreeABI);
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

  findContract(contractAddress) {
    console.log(contractAddress);
    var contract = this.web3.eth.contract(this.familyTreeABI);
    var contractInstance = contract.at(contractAddress);
    console.log("deployedContract: " + contractInstance)
    return contractInstance;  
  }

  // We need to wait until any miner has included the transaction
  // in a block to get the address of the contract
  //this method seems to be out of scope otherwise I would use it
  waitForContractToBeMined(contract){
    console.log('waiting for contract to be mined');
    const receipt = web3.eth.getTransactionReceipt(contract.transactionHash);
    // If no receipt, try again in 1s
    if (receipt == null) {
        setTimeout(() => {
            waitForTransactionReceipt(contract);
        }, 1000);
    } else {
        // The transaction was mined, we can retrieve the contract address
        console.log('contract address: ' + receipt.contractAddress);
    }
  }

  newFamilyTree(contractAddress, name, gender, dob){
    console.log("contract; " + this.familyTreeContract)
    console.log("Deploying the contract");
    console.log("name = " + name);
    console.log("gender = " + gender);
    console.log("dob = " + dob);
    var receipt;
    this.deployedContract = this.familyTreeContract.new(name, gender, dob, {from: contractAddress, gas: 3000000, data: this.familyTreeByteCode}, (contractError, contractResult) => {
      if (!contractError) {
        var count = 0;
        // If we have an address property, the contract was deployed
        if (!contractResult.address) {
          console.log("Contract transaction sent: TransactionHash: " + contractResult.transactionHash + " waiting to be mined...");
          while (receipt == null && count < 20) {
            new Promise((resolve) => setTimeout(resolve, 1000)).then(
              web3.eth.getTransactionReceipt(contractResult.transactionHash, function (err, res) {
                // The transaction was mined, we can retrieve the contract address
                if(!err){
                  receipt = res;
                  console.log('contract address: ' + contractResult.contractAddress);
                }else{
                  console.log("Error: " + err);
                }
              })
            );
            count++;
          } 
        }else{
          console.log('Contract address: ' + contractResult.address);
        }
      }else{
        console.log(contractError);
      }
    });
  }
}