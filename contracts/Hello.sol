pragma solidity ^0.4.17;

contract Hello {

    String message;

    function Hello(){
        message = "Hello";
    }

    function getMessage(String otherMessage) constant returns(string) {
        return message + " " + otherMessage
    }
}