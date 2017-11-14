pragma solidity ^0.4.17;

contract FamilyTree {
	mapping (uint256 => TreeNode) nodes;

	uint256 lastNodeId;

	struct TreeNode {
		uint nodeId;
		String name;
		String gender;
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

	function addFamilyMember(uint id, String name, String gender,
		String dateOfBirth,
		String dateOfDeath,
		String motherId,
		uint fatherId)returns (uint id){
			var node = nodes[id]
			node.name = name;
			node.gender = gender;
			node.dateOfBirth = dateOfBirth;
			node.dateOfDeath = dateOfDeath;
			node.motherId = motherId;
			node.fatherId = fatherId;
			return ++id;
	}
}
