// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VaultHeist {
    struct Vault {
        uint256 id;
        address owner;
        uint256 balance;
        bool isActive;
    }

    mapping(uint256 => Vault) public vaults;
    uint256 public vaultCount;

    event VaultCreated(uint256 id, address owner);
    event VaultAttacked(uint256 id, address attacker, uint256 amount);

    function createVault() external {
        vaultCount++;
        vaults[vaultCount] = Vault(vaultCount, msg.sender, 0, true);
        emit VaultCreated(vaultCount, msg.sender);
    }

    function attackVault(uint256 _vaultId) external payable {
        require(vaults[_vaultId].isActive, "Vault is not active");
        require(msg.value > 0, "Must send Ether to attack");

        vaults[_vaultId].balance += msg.value;
        emit VaultAttacked(_vaultId, msg.sender, msg.value);
    }

    function deactivateVault(uint256 _vaultId) external {
        require(msg.sender == vaults[_vaultId].owner, "Only owner can deactivate");
        vaults[_vaultId].isActive = false;
    }

    function getVault(uint256 _vaultId) external view returns (Vault memory) {
        return vaults[_vaultId];
    }
}