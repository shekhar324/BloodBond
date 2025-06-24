import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from './supabasec.js';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      navigate('/post-login');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '40px auto',
        padding: '32px',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          color: '#e53e3e',
          marginBottom: '24px',
        }}
      >
        Login to BloodConnect
      </h2>
      <form
        onSubmit={handleLogin}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <label style={{ fontWeight: '500', color: '#718096' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            style={{
              padding: '12px 16px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '1rem',
              background: '#f7fafc',
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <label style={{ fontWeight: '500', color: '#718096' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            minLength={6}
            style={{
              padding: '12px 16px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '1rem',
              background: '#f7fafc',
            }}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          style={{
            background: 'linear-gradient(90deg, #e53e3e 60%, #c53030 100%)',
            color: '#fff',
            border: 'none',
            padding: '14px 0',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginTop: '16px',
            boxShadow: '0 2px 12px rgba(229, 62, 62, 0.1)',
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        {error && (
          <p
            style={{
              color: '#e53e3e',
              textAlign: 'center',
              marginTop: '8px',
            }}
          >
            {error}
          </p>
        )}
      </form>
      <p style={{ textAlign: 'center', marginTop: '24px', color: '#718096' }}>
        Don't have an account?{' '}
        <Link
          to="/signup"
          style={{
            color: '#e53e3e',
            fontWeight: '600',
            textDecoration: 'none',
          }}
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default LoginForm;

async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });
  if (error) console.error(error);
  else console.log('User signed in:', data);
}

