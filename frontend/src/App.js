import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sucesso from "./pages/Sucesso";
import Falha from "./pages/Falha";
import Dashboard from "./pages/Dashboard";


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard/>} />
        <Route path="/Sucesso" element={<Sucesso />} />
        <Route path="/Falha" element={<Falha/>} />
      </Routes>
    </Router>
  );
};

export default App;
