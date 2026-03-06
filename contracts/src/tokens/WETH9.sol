// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract WETH9 {
    string public name     = "Wrapped Ether";
    string public symbol   = "WETH";
    uint8  public decimals = 18;

    event  Deposit(address indexed dst, uint wad);
    event  Withdrawal(address indexed src, uint wad);

    mapping (address => uint) public  balanceOf;
    mapping (address => mapping (address => uint)) public allowance;

    function deposit() public payable {
        balanceOf[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
   function withdraw(uint wad) public {
    require(balanceOf[msg.sender] >= wad);
    balanceOf[msg.sender] -= wad;
    (bool success, ) = payable(msg.sender).call{value: wad}("");
    require(success, "ETH transfer failed");
    
    emit Withdrawal(msg.sender, wad);
}

    function totalSupply() public view returns (uint) {
        return address(this).balance;
    }  
}
