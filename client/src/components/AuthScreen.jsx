import React, { useState } from 'react';

export function AuthScreen({ login, signup }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      if (mode === 'signup') {
        await signup(username, password);
      } else {
        await login(username, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    if (mode === 'login') {
      setSuccess('Create an account with a secure server-side password.');
    } else {
      setSuccess('');
    }
  };

  return (
    <section id="authScreen" className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark">V</span>
          <h1>Vocal</h1>
          <p>Sign in to share and view vocational teaching resources.</p>
        </div>

        <form id="authForm" className="auth-form" onSubmit={handleSubmit}>
          <label>
            Username or email
            <input
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength="8"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <p className={`auth-message ${error ? 'error' : success ? 'success' : ''}`}>
            {error || success}
          </p>
          <button className="primary-button" type="submit">
            {mode === 'login' ? 'Log in' : 'Sign up'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>
        <button className="secondary-button" type="button" onClick={toggleMode}>
          {mode === 'login' ? 'Create new account' : 'Back to log in'}
        </button>
      </div>
    </section>
  );
}
