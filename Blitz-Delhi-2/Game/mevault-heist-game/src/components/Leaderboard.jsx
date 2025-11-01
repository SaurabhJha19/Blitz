import React from 'react';

const Leaderboard = () => {
    // Sample data for leaderboard
    const leaderboardData = [
        { rank: 1, player: 'Player1', score: 100 },
        { rank: 2, player: 'Player2', score: 90 },
        { rank: 3, player: 'Player3', score: 80 },
    ];

    return (
        <div className="leaderboard">
            <h2>Leaderboard</h2>
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                    {leaderboardData.map((entry) => (
                        <tr key={entry.rank}>
                            <td>{entry.rank}</td>
                            <td>{entry.player}</td>
                            <td>{entry.score}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Leaderboard;