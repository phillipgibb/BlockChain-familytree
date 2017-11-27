pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/FamilyTree.sol";

contract TestFamilyTree {

  function testInitialValuesOfDeployedContract() {
    FamilyTree deployedFamilyTree = FamilyTree(DeployedAddresses.FamilyTree());

    bytes32 firstName;
    bytes32 lastName;
    bytes32 expectedFirstName = "Phillip";
    bytes32 expectedLastName = "Gibb";
    (firstName, lastName) = deployedFamilyTree.getFullName(0);
    Assert.equal(firstName, expectedFirstName, "First Name of Family Member should be Phillip");
    Assert.equal(lastName, expectedLastName, "Last Name of Family Member should be Gibb");
  }

function stringToBytes32(string memory source) returns (bytes32 result) {
    bytes memory tempEmptyStringTest = bytes(source);
    if (tempEmptyStringTest.length == 0) {
        return 0x0;
    }

    assembly {
        result := mload(add(source, 32))
    }
}

}
