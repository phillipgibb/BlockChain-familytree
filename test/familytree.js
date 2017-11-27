var FamilyTree = artifacts.require("./FamilyTree.sol");

contract('FamilyTree', function(accounts) {
  it("should find contract with one family member", function() {
    return FamilyTree.deployed().then(function(instance) {
      return instance.getNumberOfFamilyMembers();
    }).then(function(nrOfFamilyMembers) {
      assert.equal(nrOfFamilyMembers, 1, "There was not a since family member");
    });
  });
  it("should find contract with expected initial values", function() {
      return FamilyTree.deployed().then(function(instance) {
      return instance.getFullName(0);
    }).then(function(familyNode) {
      var firstName = web3.toUtf8(familyNode[0]);
      var lastName = web3.toUtf8(familyNode[1]);
      assert.equal(firstName, "Phillip", "First Name should have been Phillip");
      assert.equal(lastName, "Gibb", "Last Name should have been Gibb");
    });
  })

});
