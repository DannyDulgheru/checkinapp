// Simplified App for testing

export default function AppSimple() {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#FF0000',
      color: '#FFFFFF',
      padding: '50px',
      fontSize: '24px',
    }}>
      <h1>TEST APP</h1>
      <p>If you see this, React is rendering!</p>
      <p style={{ backgroundColor: '#000000', padding: '20px', marginTop: '20px' }}>
        Background should be RED
      </p>
    </div>
  );
}

