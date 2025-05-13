import React, { useState } from 'react';

const SimulateUserSwitcher = ({ onSwitch }) => {
  const [email, setEmail] = useState('');

  const handleSwitch = () => {
    if (email) {
      localStorage.setItem('currentUser', JSON.stringify({ email }));
      if (onSwitch) onSwitch(email);
      window.location.reload();
    }
  };

  return (
    <div style={{ margin: '1rem 0', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <input
        type="email"
        placeholder="Simuler un utilisateur (email)"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc', minWidth: 220 }}
      />
      <button onClick={handleSwitch} style={{ padding: '0.5rem 1rem', borderRadius: '6px', background: '#1976D2', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
        Changer d'utilisateur
      </button>
    </div>
  );
};

export default SimulateUserSwitcher; 