// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title RewardNFT
 * @dev NFT contract for distributing rewards in Monad Blitz 2 game
 */
contract RewardNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    // Mapping from token ID to game data
    mapping(uint256 => GameData) public gameData;
    
    // Mapping to track which addresses have claimed NFTs from specific games
    mapping(address => mapping(string => bool)) public claimedGames;
    
    // Mint price (free for winners, but could be set)
    uint256 public mintPrice = 0;
    
    struct GameData {
        string gameName;
        uint256 score;
        uint256 timestamp;
        string metadataURI;
    }
    
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed to,
        string gameName,
        uint256 score
    );
    
    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _tokenIds.increment(); // Start from tokenId 1
    }
    
    /**
     * @dev Mint NFT for game winners
     * @param to Address to mint the NFT to
     * @param gameName Name of the game won
     * @param score Score achieved
     * @param tokenURI Metadata URI for the NFT
     */
    function mintGameReward(
        address to,
        string memory gameName,
        uint256 score,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        // Check if user already claimed this game type
        require(!claimedGames[to][gameName], "Already claimed NFT for this game");
        
        uint256 tokenId = _tokenIds.current();
        _tokenIds.increment();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        gameData[tokenId] = GameData({
            gameName: gameName,
            score: score,
            timestamp: block.timestamp,
            metadataURI: tokenURI
        });
        
        claimedGames[to][gameName] = true;
        
        emit NFTMinted(tokenId, to, gameName, score);
        
        return tokenId;
    }
    
    /**
     * @dev Batch mint NFTs (for multiple games)
     */
    function batchMint(
        address to,
        string[] memory gameNames,
        uint256[] memory scores,
        string[] memory tokenURIs
    ) public onlyOwner returns (uint256[] memory) {
        require(
            gameNames.length == scores.length && 
            scores.length == tokenURIs.length,
            "Arrays length mismatch"
        );
        
        uint256[] memory tokenIds = new uint256[](gameNames.length);
        
        for (uint256 i = 0; i < gameNames.length; i++) {
            tokenIds[i] = mintGameReward(to, gameNames[i], scores[i], tokenURIs[i]);
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Check if address has claimed a specific game
     */
    function hasClaimedGame(address user, string memory gameName) 
        public 
        view 
        returns (bool) 
    {
        return claimedGames[user][gameName];
    }
    
    /**
     * @dev Get total number of NFTs minted
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIds.current() - 1;
    }
    
    /**
     * @dev Get token data for a specific token ID
     */
    function getTokenData(uint256 tokenId) 
        public 
        view 
        returns (GameData memory) 
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return gameData[tokenId];
    }
    
    /**
     * @dev Override required by Solidity
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }
    
    /**
     * @dev Override required by Solidity
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    /**
     * @dev Override required by Solidity
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
