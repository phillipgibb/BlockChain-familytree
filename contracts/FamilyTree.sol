pragma solidity ^0.4.17;

contract FamilyTree {
	mapping (int128 => FamilyNode) familyNodes;

	int128 lastNodeId;

	struct FamilyNode {
		int128 nodeId;
		string name;
		string gender;
		int128 spouseId;
		string dateOfBirth;
		string dateOfDeath;
		int128 motherId;
		int128 fatherId;
		uint noOfChildren;
		int128[] childrenIds;
	}


	event FamilyCreated(address fromAddress, address toAddress, uint256 linkId);

	function FamilyTree(string name, string gender, string dateOfBirth) public {
		lastNodeId = 0;
		FamilyNode memory node = familyNodes[0];
		node.name = name;
		node.spouseId = -1;
		node.nodeId = 0;
		node.noOfChildren = 0;
		node.gender = gender;
		node.dateOfBirth = dateOfBirth;
	}

	function addFamilyMember(string name, string gender, string dateOfBirth,string dateOfDeath) public returns (int128 newId) {
		var node = familyNodes[lastNodeId++];
		node.name = name;
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

	function getNode(int128 id) public constant returns (string name, string gender, int128 spouseId, string dateOfBirth, string dateOfDeath, int128 motherId, int128 fatherId, int128[] childrenIds) {
		FamilyNode memory fn = familyNodes[id];
		return (fn.name, fn.gender, fn.spouseId, fn.dateOfBirth, fn.dateOfDeath, fn.motherId, fn.fatherId, fn.childrenIds);
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

	function addChild(int128 fatherId, int128 motherId, string name, string gender, string dateOfBirth,string dateOfDeath) public {
		var id = addFamilyMember(name, gender, dateOfBirth, dateOfDeath);
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
	function addSpouse(int128 otherSpouseId, string name, string gender, string dateOfBirth,string dateOfDeath) public {
		var id = addFamilyMember(name, gender, dateOfBirth, dateOfDeath);
		familyNodes[otherSpouseId].spouseId = id;
		familyNodes[id].spouseId = otherSpouseId;

	}
	//Add Father to child and visa versa
	function addFather(int128 childId, string name, string gender, string dateOfBirth,string dateOfDeath) public {
		var id = addFamilyMember(name, gender, dateOfBirth, dateOfDeath);
		familyNodes[childId].fatherId = id;
		familyNodes[id].childrenIds.push(childId);

	}
	//Add Mother to child and visa versa
	function addMother(int128 childId, string name, string gender, string dateOfBirth,string dateOfDeath) public {
		var id = addFamilyMember(name, gender, dateOfBirth, dateOfDeath);
		familyNodes[childId].motherId = id;
		familyNodes[id].childrenIds.push(childId);
	}

	//Get Divorsed
	function divorse(int128 spouseId, int128 otherSpouseId) public {
		familyNodes[spouseId].spouseId = -1;
		familyNodes[otherSpouseId].spouseId = -1;
	}

	function funeral(int128 id, string dateOfDeath) public {
		familyNodes[id].dateOfDeath = dateOfDeath;
	}

}
