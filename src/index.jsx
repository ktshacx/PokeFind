import { useState, useEffect } from 'preact/hooks';
import { render } from 'preact';
import './style.css';

const TOTAL_POKEMON = 173; // Up to Gen 6

const getRandomPokemonId = () => Math.floor(Math.random() * TOTAL_POKEMON) + 1;

export function App() {
    const [pokemon, setPokemon] = useState(null); // Current Pokémon
    const [guess, setGuess] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [allPokemon, setAllPokemon] = useState([]); // All Pokémon names for auto-complete
    const [suggestions, setSuggestions] = useState([]);

    // Fetch random Pokémon and all Pokémon names on load
    useEffect(() => {
        fetchPokemon();
        fetchAllPokemon();
    }, []);

    const fetchPokemon = async () => {
        setLoading(true);
        const id = getRandomPokemonId();
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await response.json();
        setPokemon(data);
        setLoading(false);
    };

    const fetchAllPokemon = async () => {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${TOTAL_POKEMON}`);
        const data = await response.json();
        setAllPokemon(data.results.map((item) => item.name));
    };

    const handleGuess = () => {
        if (!pokemon) return;

        if (guess.toLowerCase() === pokemon.name.toLowerCase()) {
            setMessage(`🎉 Correct! It's ${pokemon.name}!`);
            setScore((prev) => prev + 1);
        } else {
            setMessage(`❌ Incorrect! It was ${pokemon.name}.`);
            setGameOver(true);
        }
        setGuess('');
        setSuggestions([]);
    };

    const handleNextPokemon = () => {
        setMessage('');
        setGuess('');
        fetchPokemon();
    };

    const handleRestart = () => {
        setScore(0);
        setGameOver(false);
        setMessage('');
        fetchPokemon();
    };

    const handleInputChange = (value) => {
        setGuess(value);

        // Filter suggestions based on input
        const filteredSuggestions = allPokemon.filter((name) =>
            name.toLowerCase().startsWith(value.toLowerCase())
        );
        setSuggestions(filteredSuggestions.slice(0, 5)); // Show top 5 suggestions
    };

    return (
        <div className="main">
            <h1>Who's That Pokémon?</h1>
            <div className="game-container">
                <div className="scoreboard">
                    <p>Score: {score}</p>
                </div>
                {loading ? (
                    <p>Loading Pokémon...</p>
                ) : gameOver ? (
                    <div className="game-over">
                        <p>Game Over!</p>
                        <p>Your Final Score: {score}</p>
                        <button onClick={handleRestart}>Restart</button>
                    </div>
                ) : (
                    <div>
                        <div className="pokemon-image">
                            <img
                                src={pokemon.sprites.front_default}
                                alt="Pokemon"
                                style={{
                                    width: '150px',
                                    height: '150px',
                                }}
                            />
                        </div>
                        <div className="input-area">
                            <input
                                type="text"
                                value={guess}
                                onChange={(e) => handleInputChange(e.target.value)}
                                placeholder="Guess the Pokémon"
                            />
                            {suggestions.length > 0 && (
                                <ul className="suggestions">
                                    {suggestions.map((item) => (
                                        <li key={item} onClick={() => setGuess(item)}>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <button onClick={handleGuess}>Guess</button>
                        </div>
                        <p className="message">{message}</p>
                        {message && !gameOver && (
                            <button className="next-button" onClick={handleNextPokemon}>
                                Next Pokémon
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

render(<App />, document.getElementById('app'));
