pragma solidity ^0.4.17;

contract FamilyTree {
	mapping (uint256 => TreeNode) nodes;

	uint256 lastNodeId;

	struct TreeNode {
		uint nodeId;
		String name;
		String gender;
		unit spouseId;
		String dateOfBirth;
		String dateOfDeath;
		String motherId;
		uint fatherId;
		String[] childrenIds;
	}


	event FamilyCreated(address fromAddress, address toAddress, uint256 linkId);

	function FamilyTree(String name) {
		lastNodeId = 0;
		TreeNode node = TreeNode[0];
		node.name = name;
		node.nodeId = 0;
	}

	function addFamilyMember(uint id, String name, String gender, String dateOfBirth,String dateOfDeath)returns (uint id){
			var node = nodes[id]
			node.name = name;
			node.gender = gender;
			node.dateOfBirth = dateOfBirth;
			node.dateOfDeath = dateOfDeath;
			return ++id;
	}

	function addChild(uint parentId, String name, String gender, String dateOfBirth,String dateOfDeath){
		var id = addFamilyMember(name, gender, dateOfBirth, dateOfDeath);
		nodes[parentId].childrenIds.push(id);

	}
	function addSpouse(uint spouseId, String name, String gender, String dateOfBirth,String dateOfDeath){
		var id = addFamilyMember(name, gender, dateOfBirth, dateOfDeath);
		nodes[parentId].spouseId = id;

	}
	function addFather(uint childId, String name, String gender, String dateOfBirth,String dateOfDeath){
		var id = addFamilyMember(name, gender, dateOfBirth, dateOfDeath);
		nodes[parentId].fatherId = id;

	}
	function addMother(uint childId, String name, String gender, String dateOfBirth,String dateOfDeath){
		var id = addFamilyMember(name, gender, dateOfBirth, dateOfDeath);
		nodes[parentId].motherId = id;
	}
}
