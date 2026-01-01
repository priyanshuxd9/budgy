import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!supabase) throw new Error("Supabase client not initialized");

            const { error } = isSignUp
                ? await supabase.auth.signUp({ email, password })
                : await supabase.auth.signInWithPassword({ email, password });

            if (error) throw error;

            if (!isSignUp) {
                navigate('/');
            } else {
                alert('Check your email for the login link!');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Budgy</h1>
            <p style={{ fontWeight: 'bold', opacity: 0.8, marginBottom: '2rem' }}>
                Get your money right, tight & bright!
            </p>

            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                        borderBottom: '2px solid var(--text-color)',
                        padding: '0.5rem',
                        background: 'rgba(255,255,255,0.2)'
                    }}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                        borderBottom: '2px solid var(--text-color)',
                        padding: '0.5rem',
                        background: 'rgba(255,255,255,0.2)'
                    }}
                    required
                />

                {error && <p className="text-red" style={{ fontSize: '0.9rem' }}>{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        marginTop: '1rem',
                        border: '2px solid var(--text-color)',
                        padding: '0.5rem',
                        borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px', /* Hand-drawn box */
                        background: 'white',
                        fontWeight: 'bold'
                    }}
                >
                    {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')}
                </button>
            </form>

            <p style={{ marginTop: '2rem', fontSize: '0.9rem' }}>
                {isSignUp ? 'Already have a notebook?' : 'Need a new notebook?'}
                <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-blue underline bold"
                    style={{ marginLeft: '0.5rem' }}
                >
                    {isSignUp ? 'Log In' : 'Sign Up'}
                </button>
            </p>
        </div>
    );
};

export default Auth;
