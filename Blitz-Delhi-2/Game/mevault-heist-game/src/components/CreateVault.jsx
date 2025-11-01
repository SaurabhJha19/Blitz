import React, { useState } from 'react';

const CreateVault = () => {
    const [vaultName, setVaultName] = useState('');
    const [vaultAmount, setVaultAmount] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic to create a new vault goes here
        console.log('Vault Created:', { vaultName, vaultAmount });
    };

    return (
        <div>
            <h2>Create a New Vault</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="vaultName">Vault Name:</label>
                    <input
                        type="text"
                        id="vaultName"
                        value={vaultName}
                        onChange={(e) => setVaultName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="vaultAmount">Initial Amount:</label>
                    <input
                        type="number"
                        id="vaultAmount"
                        value={vaultAmount}
                        onChange={(e) => setVaultAmount(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Create Vault</button>
            </form>
        </div>
    );
};

export default CreateVault;