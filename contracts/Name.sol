pragma solidity ^0.4.17;

contract Name {

    String name;

    function Name(){
        name = "Alice";
    }

    function getName() constant returns(string) {
        return name
        ;
    }
}