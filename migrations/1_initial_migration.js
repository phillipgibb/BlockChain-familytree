var Migrations = artifacts.require("./Migrations.sol");
var StringLib = artifacts.require("./StringLib.sol");
module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(StringLib);
};
