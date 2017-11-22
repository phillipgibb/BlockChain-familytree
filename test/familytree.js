var FamilyTree = artifacts.require("./FamilyTree.sol");

contract('FamilyTree', function(accounts) {
  it("should create one family tree node", function() {
    return FamilyTree.deployed().then(function(instance) {
      return instance.addFamilyMember("Alice", "Female", "10102000","").call();
    }).then(function(id) {
      //get the node back and compare
      assert.equal();
    });
  });
});
