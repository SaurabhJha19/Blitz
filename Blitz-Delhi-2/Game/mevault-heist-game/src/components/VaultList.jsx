import React from 'react';

const VaultList = ({ vaults }) => {
    return (
        <div>
            <h2>Vault List</h2>
            {vaults.length === 0 ? (
                <p>No vaults available.</p>
            ) : (
                <ul>
                    {vaults.map((vault, index) => (
                        <li key={index}>
                            <h3>{vault.name}</h3>
                            <p>Owner: {vault.owner}</p>
                            <p>Balance: {vault.balance}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default VaultList;