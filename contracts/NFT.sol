//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    //address of the marketplace for NFTs to interface
    address contractAddress;

    constructor(address marketplaceAddress) ERC721 ("HULk", "HULK"){
        contractAddress = marketplaceAddress;

    }


    /**
    @notice allows minting of new token based on tokenURI
    @param tokenURI string- wheren the json metadata is stored
    */
    function mintToken(string memory tokenURI) public returns (uint){
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        setApprovalForAll(contractAddress, true);

        return newItemId;

    }

}