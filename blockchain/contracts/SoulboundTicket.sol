// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SoulboundTicket is ERC721, Ownable {
    uint256 public constant FEE_NUMERATOR   = 1;    // 분자: 0.1%
    uint256 public constant FEE_DENOMINATOR = 1000; // 분모: 1000
    uint256 public nextTokenId             = 1;

    address payable public adminAddress;

    struct Ticket {
        uint256 concertId;
        string  seatNumber;
        uint256 issuedAt;
        uint256 price;           // 순수입(msg.value - fee)
        bool    isUsed;
        bool    isFaceVerified;
        bytes32 faceHash;
    }

    mapping(uint256 => Ticket)                   public tickets;
    mapping(address => mapping(uint256 => bool)) public hasMintedForConcert;
    mapping(uint256 => string)                   private _tokenURIs;

    constructor(address payable _adminAddress)
        ERC721("SBTicket", "SBT")
        Ownable(msg.sender)
    {
        require(_adminAddress != address(0), "Admin address required");
        adminAddress = _adminAddress;
    }

    function setAdminAddress(address payable _newAdmin) external onlyOwner {
        require(_newAdmin != address(0), "Invalid admin address");
        adminAddress = _newAdmin;
    }

    function mintTicket(
        uint256 concertId,
        string memory seatNumber,
        string memory uri,
        uint256 priceWei
    ) external payable {
        require(msg.value == priceWei,                        "Incorrect payment amount");
        require(!hasMintedForConcert[msg.sender][concertId],  "Already minted for this concert");

        uint256 fee = (msg.value * FEE_NUMERATOR) / FEE_DENOMINATOR;
        (bool sent, ) = adminAddress.call{ value: fee }("");
        require(sent, "Fee transfer failed");

        uint256 net = msg.value - fee;
        uint256 tid = nextTokenId++;

        _safeMint(msg.sender, tid);
        _tokenURIs[tid] = uri;
        tickets[tid] = Ticket({
            concertId:      concertId,
            seatNumber:     seatNumber,
            issuedAt:       block.timestamp,
            price:          net,
            isUsed:         false,
            isFaceVerified: false,
            faceHash:       bytes32(0)
        });
        hasMintedForConcert[msg.sender][concertId] = true;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(tickets[tokenId].issuedAt != 0, "Token does not exist");
        return _tokenURIs[tokenId];
    }

    function registerFaceHash(uint256 tokenId, bytes32 hash) external onlyOwner {
        require(tickets[tokenId].issuedAt != 0,            "Token does not exist");
        require(tickets[tokenId].faceHash == bytes32(0),   "Face hash already set");
        tickets[tokenId].faceHash = hash;
    }

    function markFaceVerified(uint256 tokenId) external onlyOwner {
        require(tickets[tokenId].issuedAt != 0,            "Token does not exist");
        require(tickets[tokenId].faceHash != bytes32(0),   "Face hash not set");
        tickets[tokenId].isFaceVerified = true;
    }

    function markAsUsed(uint256 tokenId) external onlyOwner {
        require(tickets[tokenId].issuedAt != 0,            "Token does not exist");
        require(!tickets[tokenId].isUsed,                  "Token already used");
        require(tickets[tokenId].isFaceVerified,           "Face not verified");
        tickets[tokenId].isUsed = true;
    }

    // Soulbound: 전송·승인 함수 전부 차단
    function approve(address, uint256) public pure override {
        revert("SBT: approval disabled");
    }
    function setApprovalForAll(address, bool) public pure override {
        revert("SBT: approval disabled");
    }
    function transferFrom(address, address, uint256) public pure override {
        revert("SBT: transfer disabled");
    }
    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert("SBT: transfer disabled");
    }
}
