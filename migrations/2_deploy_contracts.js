var FamilyTree = artifacts.require("./FamilyTree.sol");

module.exports = function(deployer) {
  deployer.deploy(FamilyTree, "Phillip" ,"Gibb", "Male", "27051972");
};
