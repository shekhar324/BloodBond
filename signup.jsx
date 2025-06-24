import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabasec.js';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [city, setCity] = useState('');
  const [age, setAge] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Call the signup service with the provided details.
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: fullName,
            mobile,
            city,
            age,
            blood_group: bloodGroup,
            role
          }
        }
      });
      if (error) throw error;
      alert('Signup successful! Please check your email for a confirmation link.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '40px auto',
      padding: '32px',
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    }}>
      <h2 style={{ textAlign: 'center', color: '#e53e3e', marginBottom: '24px' }}>
        Sign Up for BloodConnect
      </h2>
      <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <input
          type="email"
          value={email}
          placeholder="Email"
          required
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <input
          type="password"
          value={password}
          placeholder="Password"
          required
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <input
          type="text"
          value={fullName}
          placeholder="Full Name"
          required
          onChange={(e) => setFullName(e.target.value)}
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <input
          type="text"
          value={mobile}
          placeholder="Mobile Number"
          required
          onChange={(e) => setMobile(e.target.value)}
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <input
          type="text"
          value={city}
          placeholder="City"
          required
          onChange={(e) => setCity(e.target.value)}
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <input
          type="number"
          value={age}
          placeholder="Age"
          required
          onChange={(e) => setAge(e.target.value)}
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <input
          type="text"
          value={bloodGroup}
          placeholder="Blood Group"
          required
          onChange={(e) => setBloodGroup(e.target.value)}
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
        />
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
          }}
        >
          {isLoading ? 'Signing up...' : 'Sign Up'}
        </button>
        {error && <p style={{ color: '#e53e3e', textAlign: 'center' }}>{error}</p>}
      </form>
      <p style={{ textAlign: 'center', marginTop: '24px', color: '#718096' }}>
        Already have an account? <a href="/login" style={{ color: '#e53e3e', fontWeight: '600' }}>Login</a>
      </p>
    </div>
  );
}

export default Signup;

async function getTasks() {
  const { data, error } = await supabase.from('tasks').select('*');
  if (error) console.error(error);
  else console.log(data);
}
getTasks();

async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  });
  if (error) console.error(error);
  else console.log('User created:', data);
}
// Example usage: signUp('user@example.com', 'password123');
