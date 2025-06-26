// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Lock {
    uint256 public unlockTime;
    address payable public owner;

    event Withdrawal(address indexed to, uint256 amount);

    constructor(uint256 _unlockTime) payable {
        require(_unlockTime > block.timestamp, "Unlock time should be in the future");
        require(msg.value > 0,             "Deposit ETH is required");
        unlockTime = _unlockTime;
        owner      = payable(msg.sender);
    }

    function withdraw() public {
        // 1) 소유자 체크를 먼저
        require(msg.sender == owner,          "You aren't the owner");
        // 2) 그다음 잠금 해제 시간 체크
        require(block.timestamp >= unlockTime, "You can't withdraw yet");

        uint256 amount = address(this).balance;
        (bool sent, ) = owner.call{ value: amount }("");
        require(sent, "Failed to send Ether");

        emit Withdrawal(owner, amount);
    }

}
