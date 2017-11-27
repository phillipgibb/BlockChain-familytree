pragma solidity ^0.4.15;

contract FamilyTree {
	mapping (int128 => FamilyNode) familyNodes;

	int128 lastNodeId;

	struct FamilyNode {
		int128 nodeId;
		bytes32 firstName;
		bytes32 lastName;
		bytes32 gender;
		int128 spouseId;
		bytes32 dateOfBirth;
		bytes32 dateOfDeath;
		int128 motherId;
		int128 fatherId;
		uint noOfChildren;
		int128[] childrenIds;
	}


	event FamilyCreated(address fromAddress, address toAddress, uint256 linkId);

	function FamilyTree(bytes32 firstName, bytes32 lastName, bytes32 gender, bytes32 dateOfBirth) public {
		lastNodeId = 1;
		int128[] memory childreIds;
		FamilyNode memory node = FamilyNode(
			0,
			firstName,
			lastName,
			gender,
			-1,
			dateOfBirth,
			"",
			-1,
			-1,
			0,
			childreIds
		);
		familyNodes[0] = node;
	}
	
	function addFamilyMember(bytes32 firstName, bytes32 lastName, bytes32 gender, bytes32 dateOfBirth,bytes32 dateOfDeath) public returns (int128 newId) {
		var node = familyNodes[lastNodeId++];
		node.firstName = firstName;
		node.lastName = lastName;
		node.gender = gender;
		node.dateOfBirth = dateOfBirth;
		node.dateOfDeath = dateOfDeath;
		node.spouseId = -1;
		node.noOfChildren = 0;
		return lastNodeId;
	}

	function getNumberOfFamilyMembers() public constant returns(int128) {
		return lastNodeId;
	}

	function getFullName(int128 id) public constant returns (bytes32, bytes32) {
		FamilyNode memory fn = familyNodes[id];
    return (
    	fn.firstName,
    	fn.lastName
    );
}

	function getNode(int128 id) public constant returns (bytes32 gender, int128 spouseId, bytes32 dateOfBirth, bytes32 dateOfDeath, int128 motherId, int128 fatherId, uint noOfChildren) {
		FamilyNode memory fn = familyNodes[id];
		return (
			fn.gender, 
			fn.spouseId, 
			fn.dateOfBirth, 
			fn.dateOfDeath, 
			fn.motherId, 
			fn.fatherId, 
			fn.noOfChildren);
	}

	function hasThisChild(int128 parentId, int128 childId) public constant returns (bool) {
		
		FamilyNode memory familyNode = familyNodes[parentId];
		uint length = familyNode.noOfChildren;
		for ( uint i = 0; i < length; i++ ) {
			if (familyNode.childrenIds[i] == childId) {
				return true;
			}
		}
		return false;
	}

	function addChild(int128 fatherId, int128 motherId, bytes32 firstName, bytes32 lastName, bytes32 gender, bytes32 dateOfBirth,bytes32 dateOfDeath) public {
		var id = addFamilyMember(firstName, lastName, gender, dateOfBirth, dateOfDeath);
		if (!hasThisChild(fatherId, id)) {
			familyNodes[fatherId].childrenIds.push(id);
			familyNodes[fatherId].noOfChildren += 1;
			familyNodes[id].fatherId = fatherId;		
		}
		if (!hasThisChild(motherId, id)) {
			familyNodes[motherId].childrenIds.push(id);
			familyNodes[fatherId].noOfChildren += 1;
			familyNodes[id].motherId = motherId;
		}
	}

	//Add a new spouse to current member and visa versa
	function addSpouse(int128 otherSpouseId, bytes32 firstName, bytes32 lastName, bytes32 gender, bytes32 dateOfBirth,bytes32 dateOfDeath) public {
		var id = addFamilyMember(firstName, lastName, gender, dateOfBirth, dateOfDeath);
		familyNodes[otherSpouseId].spouseId = id;
		familyNodes[id].spouseId = otherSpouseId;

	}
	//Add Father to child and visa versa
	function addFather(int128 childId, bytes32 firstName, bytes32 lastName, bytes32 gender, bytes32 dateOfBirth,bytes32 dateOfDeath) public {
		var id = addFamilyMember(firstName, lastName, gender, dateOfBirth, dateOfDeath);
		familyNodes[childId].fatherId = id;
		familyNodes[id].childrenIds.push(childId);

	}
	//Add Mother to child and visa versa
	function addMother(int128 childId, bytes32 firstName, bytes32 lastName, bytes32 gender, bytes32 dateOfBirth,bytes32 dateOfDeath) public {
		var id = addFamilyMember(firstName, lastName, gender, dateOfBirth, dateOfDeath);
		familyNodes[childId].motherId = id;
		familyNodes[id].childrenIds.push(childId);
	}

	//Get Divorsed
	function divorse(int128 spouseId, int128 otherSpouseId) public {
		familyNodes[spouseId].spouseId = -1;
		familyNodes[otherSpouseId].spouseId = -1;
	}

	function funeral(int128 id, bytes32 dateOfDeath) public {
		familyNodes[id].dateOfDeath = dateOfDeath;
	}

}
