import React from "react";
import styled from "styled-components";

const Container = styled.div`
  padding: 2rem;
  background-color: #f9fafb;
  min-height: 100vh;
  font-family: sans-serif;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const NavLink = styled.a`
  color: #4f46e5;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const Cards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const Card = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const Table = styled.table`
  width: 100%;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.75rem;
  background: #f3f4f6;
  font-weight: 600;
`;

const Td = styled.td`
  padding: 0.75rem;
  border-top: 1px solid #e5e7eb;
`;

const Status = styled.span`
  color: ${(props) => (props.pago ? "green" : "red")};
  font-weight: bold;
`;

const QuickActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button`
  background-color: #4f46e5;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #4338ca;
  }
`;

const Dashboard = () => {
  return (
    <Container>
      <Header>
        <h1>🏠 Locapay</h1>
        <div>Olá, Marcos!</div>
        <Nav>
          <NavLink>Dashboard</NavLink>
          <NavLink>Imóveis</NavLink>
          <NavLink>Inquilinos</NavLink>
          <NavLink>Financeiro</NavLink>
          <NavLink>Sair</NavLink>
        </Nav>
      </Header>

      <Cards>
        <Card>
          <div>🏘️ Imóveis Cadastrados</div>
          <strong>4 imóveis</strong>
        </Card>
        <Card>
          <div>👥 Inquilinos Ativos</div>
          <strong>3 inquilinos</strong>
        </Card>
        <Card>
          <div>💰 Total de Aluguéis</div>
          <strong>R$ 3.200,00</strong>
        </Card>
        <Card>
          <div>📅 Próximo Vencimento</div>
          <strong>10/04/2025</strong>
        </Card>
      </Cards>

      <h2>🧾 Últimos Pagamentos</h2>
      <Table>
        <thead>
          <tr>
            <Th>Inquilino</Th>
            <Th>Imóvel</Th>
            <Th>Valor</Th>
            <Th>Data</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td>João Silva</Td>
            <Td>Apto 301</Td>
            <Td>R$ 1.200</Td>
            <Td>05/04/2025</Td>
            <Td><Status pago={true}>✅ Pago</Status></Td>
          </tr>
          <tr>
            <Td>Maria Oliveira</Td>
            <Td>Casa Jardim</Td>
            <Td>R$ 900</Td>
            <Td>03/04/2025</Td>
            <Td><Status pago={false}>❌ Atrasado</Status></Td>
          </tr>
        </tbody>
      </Table>

      <h2>🧰 Ações Rápidas</h2>
      <QuickActions>
        <Button>➕ Adicionar novo imóvel</Button>
        <Button>➕ Adicionar inquilino</Button>
        <Button>📤 Enviar cobrança</Button>
        <Button>📃 Gerar relatório</Button>
      </QuickActions>
    </Container>
  );
};

export default Dashboard;
