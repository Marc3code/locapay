

function Sucesso() {
  const handleDownload = () => {
    alert('Comprovante baixado com sucesso!');
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>✅ Pagamento do aluguel confirmado!</h1>
      <p style={styles.text}>
        Obrigado! Seu pagamento foi processado com sucesso.
      </p>
      
      <button onClick={handleDownload} style={styles.downloadButton}>
        Baixar comprovante
      </button>
    </div>
  );
}

const styles = {
  container: {
    padding: '40px',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif'
  },
  title: {
    fontSize: '28px',
    color: 'green'
  },
  text: {
    fontSize: '18px',
    margin: '20px 0'
  },
  downloadButton: {
    marginTop: '20px',
    padding: '12px 24px',
    backgroundColor: '#2d89ef',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginRight: '10px'
  },

};

export default Sucesso;
