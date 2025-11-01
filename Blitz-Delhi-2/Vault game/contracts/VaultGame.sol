// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VaultGame
 * @dev On-chain vault challenge game between Defender and Attacker
 */
contract VaultGame is ReentrancyGuard, Pausable, Ownable {
    
    // ============ Structs ============
    
    struct Vault {
        address defender;              // Creator of the vault
        uint256 rewardAmount;          // Staked reward amount
        uint256 entryFee;              // Fee to join as attacker
        ChallengeType challengeType;   // Type of challenge
        bytes32 challengeHash;         // Hash of the solution (for hash-based challenges)
        uint256 codeChallenge;         // 4-digit code (for code-based challenges)
        uint256 maxAttempts;           // Maximum attempts allowed
        uint256 attemptsUsed;          // Attempts used so far
        address attacker;              // Current attacker
        uint256 createdAt;             // Block timestamp when vault was created
        uint256 timeoutDuration;       // Timeout in seconds
        bool isActive;                 // Whether vault is active
        bool isCracked;               // Whether vault was successfully cracked
    }
    
    // ============ Enums ============
    
    enum ChallengeType {
        CODE,      // 4-digit numeric code
        HASH,      // Hash guess challenge
        PUZZLE     // Puzzle challenge (future extension)
    }
    
    // ============ State Variables ============
    
    mapping(uint256 => Vault) public vaults;
    uint256 public vaultCount;
    uint256 public minimumReward;
    uint256 public minimumEntryFee;
    uint256 public platformFee; // Fee percentage (basis points, e.g., 100 = 1%)
    
    // ============ Events ============
    
    event VaultCreated(
        uint256 indexed vaultId,
        address indexed defender,
        uint256 rewardAmount,
        ChallengeType challengeType,
        uint256 timeoutDuration
    );
    
    event AttackerJoined(
        uint256 indexed vaultId,
        address indexed attacker,
        uint256 entryFee
    );
    
    event AttemptMade(
        uint256 indexed vaultId,
        address indexed attacker,
        bool success,
        uint256 attemptsRemaining
    );
    
    event VaultCracked(
        uint256 indexed vaultId,
        address indexed attacker,
        uint256 rewardAmount
    );
    
    event VaultReclaimed(
        uint256 indexed vaultId,
        address indexed defender,
        uint256 rewardAmount
    );
    
    event VaultTimeout(
        uint256 indexed vaultId
    );
    
    // ============ Modifiers ============
    
    modifier validVault(uint256 _vaultId) {
        require(vaults[_vaultId].defender != address(0), "Vault does not exist");
        _;
    }
    
    modifier onlyDefender(uint256 _vaultId) {
        require(msg.sender == vaults[_vaultId].defender, "Not the defender");
        _;
    }
    
    modifier onlyAttacker(uint256 _vaultId) {
        require(msg.sender == vaults[_vaultId].attacker, "Not the attacker");
        _;
    }
    
    // ============ Constructor ============
    
    constructor(
        uint256 _minimumReward,
        uint256 _minimumEntryFee,
        uint256 _platformFee
    ) Ownable(msg.sender) {
        minimumReward = _minimumReward;
        minimumEntryFee = _minimumEntryFee;
        platformFee = _platformFee;
    }
    
    // ============ Defender Functions ============
    
    /**
     * @dev Create a new vault with a code challenge (4-digit code)
     * @param _codeChallenge The 4-digit code solution (0-9999)
     * @param _maxAttempts Maximum attempts allowed for attacker
     * @param _timeoutDuration Timeout duration in seconds
     */
    function createVaultWithCode(
        uint256 _codeChallenge,
        uint256 _maxAttempts,
        uint256 _timeoutDuration
    ) external payable nonReentrant whenNotPaused {
        require(msg.value >= minimumReward, "Reward too low");
        require(_codeChallenge <= 9999, "Code must be 4 digits");
        require(_maxAttempts > 0 && _maxAttempts <= 10, "Invalid max attempts");
        require(_timeoutDuration >= 1 hours, "Timeout too short");
        
        uint256 vaultId = vaultCount++;
        
        vaults[vaultId] = Vault({
            defender: msg.sender,
            rewardAmount: msg.value,
            entryFee: minimumEntryFee,
            challengeType: ChallengeType.CODE,
            challengeHash: bytes32(0),
            codeChallenge: _codeChallenge,
            maxAttempts: _maxAttempts,
            attemptsUsed: 0,
            attacker: address(0),
            createdAt: block.timestamp,
            timeoutDuration: _timeoutDuration,
            isActive: true,
            isCracked: false
        });
        
        emit VaultCreated(vaultId, msg.sender, msg.value, ChallengeType.CODE, _timeoutDuration);
    }
    
    /**
     * @dev Create a new vault with a hash challenge
     * @param _challengeHash The keccak256 hash of the solution
     * @param _entryFee Custom entry fee for attacker (must be >= minimumEntryFee)
     * @param _maxAttempts Maximum attempts allowed for attacker
     * @param _timeoutDuration Timeout duration in seconds
     */
    function createVaultWithHash(
        bytes32 _challengeHash,
        uint256 _entryFee,
        uint256 _maxAttempts,
        uint256 _timeoutDuration
    ) external payable nonReentrant whenNotPaused {
        require(msg.value >= minimumReward, "Reward too low");
        require(_entryFee >= minimumEntryFee, "Entry fee too low");
        require(_maxAttempts > 0 && _maxAttempts <= 10, "Invalid max attempts");
        require(_timeoutDuration >= 1 hours, "Timeout too short");
        
        uint256 vaultId = vaultCount++;
        
        vaults[vaultId] = Vault({
            defender: msg.sender,
            rewardAmount: msg.value,
            entryFee: _entryFee,
            challengeType: ChallengeType.HASH,
            challengeHash: _challengeHash,
            codeChallenge: 0,
            maxAttempts: _maxAttempts,
            attemptsUsed: 0,
            attacker: address(0),
            createdAt: block.timestamp,
            timeoutDuration: _timeoutDuration,
            isActive: true,
            isCracked: false
        });
        
        emit VaultCreated(vaultId, msg.sender, msg.value, ChallengeType.HASH, _timeoutDuration);
    }
    
    /**
     * @dev Reclaim vault if timeout has passed or attacker failed
     */
    function reclaimVault(uint256 _vaultId) external nonReentrant validVault(_vaultId) onlyDefender(_vaultId) {
        Vault storage vault = vaults[_vaultId];
        require(vault.isActive, "Vault is not active");
        require(!vault.isCracked, "Vault was already cracked");
        
        // Check if timeout has passed OR no attacker has joined
        bool canReclaim = block.timestamp >= vault.createdAt + vault.timeoutDuration || 
                         vault.attacker == address(0);
        
        require(canReclaim, "Vault still active or attacker in progress");
        
        vault.isActive = false;
        uint256 reward = vault.rewardAmount;
        vault.rewardAmount = 0;
        
        (bool success, ) = payable(vault.defender).call{value: reward}("");
        require(success, "Transfer failed");
        
        emit VaultReclaimed(_vaultId, vault.defender, reward);
    }
    
    // ============ Attacker Functions ============
    
    /**
     * @dev Join a vault as attacker
     */
    function joinAsAttacker(uint256 _vaultId) external payable nonReentrant validVault(_vaultId) whenNotPaused {
        Vault storage vault = vaults[_vaultId];
        require(vault.isActive, "Vault is not active");
        require(vault.attacker == address(0), "Vault already has an attacker");
        require(msg.value >= vault.entryFee, "Insufficient entry fee");
        require(!vault.isCracked, "Vault already cracked");
        require(block.timestamp < vault.createdAt + vault.timeoutDuration, "Vault expired");
        
        vault.attacker = msg.sender;
        
        // Refund excess if overpaid
        if (msg.value > vault.entryFee) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - vault.entryFee}("");
            require(success, "Refund failed");
        }
        
        emit AttackerJoined(_vaultId, msg.sender, vault.entryFee);
    }
    
    /**
     * @dev Attempt to crack vault with a code guess
     */
    function attemptCode(uint256 _vaultId, uint256 _guess) external nonReentrant validVault(_vaultId) onlyAttacker(_vaultId) {
        Vault storage vault = vaults[_vaultId];
        require(vault.isActive, "Vault is not active");
        require(vault.challengeType == ChallengeType.CODE, "Wrong challenge type");
        require(!vault.isCracked, "Vault already cracked");
        require(vault.attemptsUsed < vault.maxAttempts, "No attempts remaining");
        require(block.timestamp < vault.createdAt + vault.timeoutDuration, "Vault expired");
        
        vault.attemptsUsed++;
        
        if (_guess == vault.codeChallenge) {
            _rewardAttacker(_vaultId);
            emit AttemptMade(_vaultId, msg.sender, true, 0);
        } else {
            bool hasAttemptsLeft = vault.attemptsUsed < vault.maxAttempts;
            emit AttemptMade(_vaultId, msg.sender, false, vault.maxAttempts - vault.attemptsUsed);
            
            // If no attempts left, mark as inactive
            if (!hasAttemptsLeft) {
                vault.isActive = false;
                emit VaultTimeout(_vaultId);
            }
        }
    }
    
    /**
     * @dev Attempt to crack vault with a hash solution guess
     */
    function attemptHash(uint256 _vaultId, string memory _solution) external nonReentrant validVault(_vaultId) onlyAttacker(_vaultId) {
        Vault storage vault = vaults[_vaultId];
        require(vault.isActive, "Vault is not active");
        require(vault.challengeType == ChallengeType.HASH, "Wrong challenge type");
        require(!vault.isCracked, "Vault already cracked");
        require(vault.attemptsUsed < vault.maxAttempts, "No attempts remaining");
        require(block.timestamp < vault.createdAt + vault.timeoutDuration, "Vault expired");
        
        vault.attemptsUsed++;
        
        bytes32 solutionHash = keccak256(abi.encodePacked(_solution));
        
        if (solutionHash == vault.challengeHash) {
            _rewardAttacker(_vaultId);
            emit AttemptMade(_vaultId, msg.sender, true, 0);
        } else {
            bool hasAttemptsLeft = vault.attemptsUsed < vault.maxAttempts;
            emit AttemptMade(_vaultId, msg.sender, false, vault.maxAttempts - vault.attemptsUsed);
            
            // If no attempts left, mark as inactive
            if (!hasAttemptsLeft) {
                vault.isActive = false;
                emit VaultTimeout(_vaultId);
            }
        }
    }
    
    // ============ Internal Functions ============
    
    /**
     * @dev Internal function to reward attacker and close vault
     */
    function _rewardAttacker(uint256 _vaultId) internal {
        Vault storage vault = vaults[_vaultId];
        vault.isCracked = true;
        vault.isActive = false;
        
        uint256 reward = vault.rewardAmount;
        uint256 feeAmount = (reward * platformFee) / 10000;
        uint256 payoutAmount = reward - feeAmount;
        
        vault.rewardAmount = 0;
        
        // Pay attacker
        (bool success1, ) = payable(vault.attacker).call{value: payoutAmount}("");
        require(success1, "Attacker payout failed");
        
        // Pay platform fee to owner
        if (feeAmount > 0) {
            (bool success2, ) = payable(owner()).call{value: feeAmount}("");
            require(success2, "Fee transfer failed");
        }
        
        emit VaultCracked(_vaultId, vault.attacker, payoutAmount);
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Get vault details
     */
    function getVault(uint256 _vaultId) external view validVault(_vaultId) returns (Vault memory) {
        return vaults[_vaultId];
    }
    
    /**
     * @dev Check if vault has expired
     */
    function isVaultExpired(uint256 _vaultId) external view validVault(_vaultId) returns (bool) {
        Vault memory vault = vaults[_vaultId];
        return block.timestamp >= vault.createdAt + vault.timeoutDuration;
    }
    
    /**
     * @dev Get remaining attempts for a vault
     */
    function getRemainingAttempts(uint256 _vaultId) external view validVault(_vaultId) returns (uint256) {
        Vault memory vault = vaults[_vaultId];
        if (vault.attemptsUsed >= vault.maxAttempts) return 0;
        return vault.maxAttempts - vault.attemptsUsed;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @dev Update minimum reward amount
     */
    function setMinimumReward(uint256 _minimumReward) external onlyOwner {
        minimumReward = _minimumReward;
    }
    
    /**
     * @dev Update minimum entry fee
     */
    function setMinimumEntryFee(uint256 _minimumEntryFee) external onlyOwner {
        minimumEntryFee = _minimumEntryFee;
    }
    
    /**
     * @dev Update platform fee
     */
    function setPlatformFee(uint256 _platformFee) external onlyOwner {
        require(_platformFee <= 1000, "Fee too high (max 10%)");
        platformFee = _platformFee;
    }
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }
}
