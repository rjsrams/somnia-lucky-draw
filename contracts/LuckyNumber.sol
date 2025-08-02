// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract LuckyNumber {
    mapping(address => uint256) public gameCoinBalance;
    mapping(address => uint256) public userPoints;
    mapping(address => uint256) public lastRefillTime;

    uint256 public constant COOLDOWN = 1 hours;

    event Played(
        address indexed player,
        uint256 guess,
        uint256 luckyNumber,
        bool won,
        uint256 pointsEarned,
        uint256 newBalance
    );

    function play(uint256 guess) public {
        require(guess >= 1 && guess <= 3, "Guess must be 1-3");

        // Refill otomatis jika saldo < 3 dan cooldown terpenuhi
        if (gameCoinBalance[msg.sender] < 3) {
            if (block.timestamp >= lastRefillTime[msg.sender] + COOLDOWN) {
                gameCoinBalance[msg.sender] = 10;
                lastRefillTime[msg.sender] = block.timestamp;
            }
        }

        require(gameCoinBalance[msg.sender] >= 3, "Insufficient GameCoin");

        gameCoinBalance[msg.sender] -= 3;

        uint256 luckyNumber = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender, block.prevrandao))
        ) % 3 + 1;

        bool won = (guess == luckyNumber);
        uint256 pointsEarned = won ? 5 : 1;

        userPoints[msg.sender] += pointsEarned;

        emit Played(
            msg.sender,
            guess,
            luckyNumber,
            won,
            pointsEarned,
            gameCoinBalance[msg.sender]
        );
    }

    function getStatus(address player) external view returns (uint256 coin, uint256 points, uint256 nextRefillTime) {
        uint256 next = lastRefillTime[player] + COOLDOWN;
        return (gameCoinBalance[player], userPoints[player], next);
    }
}

