
function Falha() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>❌ Falha no pagamento</h1>
      <p style={styles.text}>
        Ocorreu um erro ao processar o pagamento do aluguel.
      </p>
      <p style={styles.contactText}>
        Por favor, <strong>entre em contato conosco</strong> para que possamos
        resolver a situação o quanto antes.
      </p>

      <button onClick={() => alert("entrando em contato")} style={styles.downloadButton}>Fale conosco</button>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "28px",
    color: "red",
  },
  text: {
    fontSize: "18px",
    margin: "20px 0",
  },
  contactText: {
    fontSize: "16px",
    marginBottom: "10px",
  },
  downloadButton: {
    marginTop: "20px",
    padding: "12px 24px",
    backgroundColor: "#2d89ef",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginRight: "10px",
  }
};

export default Falha;
