pragma solidity ^0.4.15;

import "./Strings.sol";

contract FamilyTree {
	address owner;
	mapping (int128 => FamilyNode) familyNodes;
	int128 nextNodeId;
	int128 numberOfFamilymembers;

	struct FamilyNode {
		int128 nodeId;
		bytes18 firstName;
		bytes18 lastName;
		bytes6 gender;
		int128 spouseId;
		int128 dateOfBirth;
		int128 dateOfDeath;
		int128[] parentIds;
		uint noOfChildren;
		int128[] childrenIds;
	}


	event FamilyCreated(address fromAddress, bytes18 firstName, bytes18 lastName);
	event FamilyMemberAdded(address fromAddress, bytes18 firstName, bytes18 lastName, bytes6 gender);

	function FamilyTree(bytes18 firstName, bytes18 lastName, bytes6 gender, int128 dateOfBirth) public payable {
		owner = msg.sender;
		nextNodeId = 1;
		numberOfFamilymembers = 1;
		int128[] memory childrenIds;
		int128[] memory parentIds;
		FamilyNode memory node = FamilyNode(
			0,
			firstName,
			lastName,
			gender,
			-1,
			dateOfBirth,
			0,
			parentIds,
			0,
			childrenIds
		);
		familyNodes[0] = node;
		FamilyCreated(owner,firstName, lastName);
	}
	
	function addFamilyMember( bytes18 firstName, bytes18 lastName, bytes6 gender, int128 dateOfBirth, int128 dateOfDeath) public returns (int128 id) {
			
		var node = familyNodes[nextNodeId];
		node.firstName = firstName;
		node.lastName = lastName;
		node.gender = gender;
		node.dateOfBirth = dateOfBirth;
		node.dateOfDeath = dateOfDeath;
		node.spouseId = -1;
		node.noOfChildren = 0;
		FamilyMemberAdded(msg.sender, firstName, lastName, gender);
		numberOfFamilymembers++;
		return nextNodeId++;
	}

	function deleteFamilyMember(int128 id) public returns (bool) {
		FamilyNode memory fn = familyNodes[id];
		for (uint i = 0; i < fn.parentIds.length; i++) {
			int128 parentId = fn.parentIds[i];
			removeThisChild(parentId, id);
		}
		for (uint c = 0; c < fn.childrenIds.length; c++) {
			int128 childId = fn.childrenIds[c];
			removeThisParent(childId, id);
		}
		if (fn.spouseId > -1) {
			familyNodes[fn.spouseId].spouseId = -1;
		}
		delete(familyNodes[id]);
		return true;
	}

	function getNumberOfFamilyMembers() public constant returns(int128) {
		return numberOfFamilymembers;
	}

	function getFullName(int128 id) public constant returns (bytes18, bytes18) {
		FamilyNode memory fn = familyNodes[id];
    return (
    	fn.firstName,
    	fn.lastName
    );
}

function uintToString(int128 v) private pure returns (string str) {
        uint maxlength = 100;
        bytes memory reversed = new bytes(maxlength);
        uint i = 0;
        while (v != 0) {
            int128 remainder = v % 10;
            v = v / 10;
            reversed[i++] = byte(48 + remainder);
        }
        bytes memory s = new bytes(i + 1);
        for (uint j = 0; j <= i; j++) {
            s[j] = reversed[i - j];
        }
        str = string(s);
    }


	function getNode(int128 id) public constant returns (bytes18 firstName, bytes18 lastName, bytes6 gender, int128 dateOfBirth, int128 spouseId, int128 dateOfDeath, uint noOfChildren) {
		FamilyNode memory fn = familyNodes[id];
	
		return (
		    fn.firstName,
		    fn.lastName,
			fn.gender, 
			fn.dateOfBirth, 
			fn.spouseId, 
			fn.dateOfDeath,
			fn.noOfChildren);
	}

	function arrayToCsvString(int128[] array) public constant returns (string arrayString) {
		uint128 x = 0;
		string memory stringCsv = "";
		Strings.Slice memory commaSlice = Strings.toSlice(",");
		
        while (x < array.length) {
			Strings.Slice memory stringCsvSlice = Strings.toSlice(stringCsv);
			if (!Strings.empty(stringCsvSlice)) {
				Strings.Slice memory stringCsvPart = Strings.toSlice(Strings.concat(stringCsvSlice, commaSlice));
				stringCsv = Strings.concat(stringCsvPart, Strings.toSlice(uintToString(array[x])));
			}else {
				stringCsv = uintToString(array[x]);
			}
            x++;
        }
		return (
		  stringCsv
		);
	}

	function getChildren(int128 id) public constant returns (string children) {
		FamilyNode memory fn = familyNodes[id];
		string memory childrenCsv = arrayToCsvString(fn.childrenIds);
		return (
		  childrenCsv
		);
	}

	function hasThisChild(int128 parentId, int128 childId) private constant returns (bool) {
		
		FamilyNode memory familyNode = familyNodes[parentId];
		uint length = familyNode.noOfChildren;
		for ( uint i = 0; i < length; i++ ) {
			if (familyNode.childrenIds[i] == childId) {
				return true;
			}
		}
		return false;
	}

	function removeThisChild(int128 parentId, int128 childId) private returns (bool) {
		
		FamilyNode memory familyNode = familyNodes[parentId];
		uint length = familyNode.noOfChildren;
		for ( uint i = 0; i < length; i++ ) {
			if (familyNode.childrenIds[i] == childId) {
				familyNodes[parentId].childrenIds[i] = -1;
				return true;
			}
		}
		return false;
	}

	function removeThisParent(int128 childId, int128 parentId) private returns (bool) {
		
		FamilyNode memory familyNode = familyNodes[childId];
		
		for ( uint i = 0; i < familyNode.parentIds.length; i++ ) {
			if (familyNode.parentIds[i] == parentId) {
				familyNodes[childId].parentIds[i] = -1;
				return true;
			}
		}
		return false;
	}

	function addChild(int128 parentId, bytes18 firstName, bytes18 lastName, bytes6 gender, int128 dateOfBirth,int128 dateOfDeath) public {
		var id = addFamilyMember(firstName, lastName, gender, dateOfBirth, dateOfDeath);
		FamilyNode storage fn = familyNodes[parentId];
		if (!hasThisChild(parentId, id)) {
			fn.childrenIds.push(id);
			fn.noOfChildren += 1;
			familyNodes[id].parentIds.push(parentId);
		}
		if (fn.spouseId > 0 && !hasThisChild(fn.spouseId, id)) {
			familyNodes[fn.spouseId].childrenIds.push(id);
			familyNodes[fn.spouseId].noOfChildren += 1;
		}

	}

	//Add a new spouse to current member and visa versa
	function addSpouse(int128 otherSpouseId, bytes18 firstName, bytes18 lastName, bytes6 gender, int128 dateOfBirth,int128 dateOfDeath) public {
		var id = addFamilyMember(firstName, lastName, gender, dateOfBirth, dateOfDeath);
		familyNodes[otherSpouseId].spouseId = id;
		familyNodes[id].spouseId = otherSpouseId;

	}
	//Add Father to child and visa versa
	function addFather(int128 childId, bytes18 firstName, bytes18 lastName, bytes6 gender, int128 dateOfBirth,int128 dateOfDeath) public {
		var id = addFamilyMember(firstName, lastName, gender, dateOfBirth, dateOfDeath);
		familyNodes[childId].parentIds.push(id);
		familyNodes[id].childrenIds.push(childId);

	}
	//Add Mother to child and visa versa
	function addMother(int128 childId, bytes18 firstName, bytes18 lastName, bytes6 gender, int128 dateOfBirth,int128 dateOfDeath) public {
		var id = addFamilyMember(firstName, lastName, gender, dateOfBirth, dateOfDeath);
		familyNodes[childId].parentIds.push(id);
		familyNodes[id].childrenIds.push(childId);
	}

	//Get Divorsed
	function divorse(int128 spouseId, int128 otherSpouseId) public {
		familyNodes[spouseId].spouseId = -1;
		familyNodes[otherSpouseId].spouseId = -1;
	}

	function funeral(int128 id, int128 dateOfDeath) public {
		familyNodes[id].dateOfDeath = dateOfDeath;
	}

	function kill() public { //self-destruct function, 
		if (msg.sender == owner) {
			selfdestruct(owner); 
		}
	}
	
	function () public payable {
 
 	}	

}
