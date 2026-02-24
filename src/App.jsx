import { useState, useEffect } from 'react';
import api from './api';

function App() {
  // ==========================================
  // ESTADOS GERAIS
  // ==========================================
  const [clientes, setClientes] = useState([]);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  
  const [clienteSelecionado, setClienteSelecionado] = useState(null); 
  const [tarefas, setTarefas] = useState([]); 
  const [novaTarefa, setNovaTarefa] = useState('');

  // ==========================================
  // ESTADOS DE SEGURANÇA (LOGIN)
  // ==========================================
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [emailLogin, setEmailLogin] = useState('');
  const [senhaLogin, setSenhaLogin] = useState('');

  // O React agora só busca os clientes se tivermos um Token válido!
  useEffect(() => {
    if (token) {
      buscarClientes();
    }
  }, [token]);

  // ==========================================
  // FUNÇÕES DE AUTENTICAÇÃO
  // ==========================================
  async function fazerLogin(e) {
    e.preventDefault(); 
    try {
      const resposta = await api.post('/login', {
        email: emailLogin,
        senha: senhaLogin
      });
      
      const crachaJWT = resposta.data.token;
      
      localStorage.setItem('token', crachaJWT);
      setToken(crachaJWT);
      
    } catch (erro) {
      alert("❌ Erro no login: Verifique seu e-mail e senha.");
    }
  }

  function fazerLogout() {
    localStorage.removeItem('token');
    setToken(null);
    setClienteSelecionado(null); // Fecha o painel de tarefas se estiver aberto
  }

  // ==========================================
  // FUNÇÕES DE CLIENTES E TAREFAS
  // ==========================================
  async function buscarClientes() {
    try {
      const resposta = await api.get('/clientes'); 
      setClientes(resposta.data); 
    } catch (erro) {
      console.error("Erro ao buscar clientes:", erro);
    }
  }

  async function adicionarCliente(e) {
    e.preventDefault(); 
    if (!nome || !email) return alert("Por favor, preencha o nome e o email!");
    try {
      await api.post('/clientes', { nome, email });
      setNome('');
      setEmail('');
      buscarClientes(); 
    } catch (erro) {
      alert("Erro ao salvar o cliente.");
    }
  }

  async function excluirCliente(id) {
    const confirmacao = window.confirm("Tem certeza que deseja excluir este cliente?");
    if (confirmacao) {
      try {
        await api.delete(`/clientes/${id}`);
        buscarClientes(); 
      } catch (erro) {
        alert("Erro ao excluir o cliente.");
      }
    }
  }

  async function abrirTarefas(cliente) {
    setClienteSelecionado(cliente); 
    try {
      const resposta = await api.get(`/clientes/${cliente.id}/tarefas`);
      setTarefas(resposta.data);
    } catch (erro) {
      alert("Erro ao carregar as tarefas.");
    }
  }

  async function adicionarTarefa(e) {
    e.preventDefault(); 
    if (!novaTarefa) return alert("Digite o título da tarefa!");
    try {
      await api.post('/tarefas', { titulo: novaTarefa, cliente_id: clienteSelecionado.id });
      setNovaTarefa(''); 
      abrirTarefas(clienteSelecionado); 
    } catch (erro) {
      alert("Erro ao salvar a tarefa.");
    }
  }

  async function alternarStatusTarefa(tarefa) {
    try {
      await api.put(`/tarefas/${tarefa.id}`, { concluida: !tarefa.concluida });
      abrirTarefas(clienteSelecionado);
    } catch (erro) {
      alert("Erro ao atualizar o estado da tarefa.");
    }
  }

  async function apagarTarefa(id) {
    const confirmacao = window.confirm("Tens a certeza que pretendes apagar esta tarefa?");
    if (confirmacao) {
      try {
        await api.delete(`/tarefas/${id}`);
        abrirTarefas(clienteSelecionado); 
      } catch (erro) {
        alert("Erro ao apagar a tarefa.");
      }
    }
  }

  // ==========================================
  // O GUARDA-COSTAS (TELA DE LOGIN)
  // ==========================================
  if (!token) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f4f9' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', textAlign: 'center', width: '350px' }}>
          <h2>🔒 Acesso Restrito</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>Faça login para acessar o Mini ERP</p>
          
          <form onSubmit={fazerLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              type="email" 
              placeholder="E-mail de administrador" 
              value={emailLogin}
              onChange={(e) => setEmailLogin(e.target.value)}
              required
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <input 
              type="password" 
              placeholder="Senha" 
              value={senhaLogin}
              onChange={(e) => setSenhaLogin(e.target.value)}
              required
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <button type="submit" style={{ padding: '12px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Entrar no Sistema
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAINEL PRINCIPAL (DASHBOARD)
  // ==========================================
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* CABEÇALHO COM BOTÃO DE SAIR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>🏢 Meu Mini ERP</h1>
        <button onClick={fazerLogout} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Sair do Sistema
        </button>
      </div>
      
      {/* 3. O Formulário Visual */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <h3>Novo Cliente</h3>
        <form onSubmit={adicionarCliente} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Nome" 
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={{ flex: 1, padding: '8px' }}
          />
          <input 
            type="email" 
            placeholder="E-mail" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ flex: 1, padding: '8px' }}
          />
          <button type="submit" style={{ background: '#2ecc71', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>
            Salvar
          </button>
        </form>
      </div>

      <h2>Lista de Clientes</h2>

      {clientes.length === 0 ? (
        <p>Nenhum cliente cadastrado.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {clientes.map((cliente) => (
            <li 
              key={cliente.id} 
              style={{ 
                background: 'white', margin: '10px 0', padding: '15px', 
                borderRadius: '5px', borderLeft: '5px solid #3498db', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
            >
              <div>
                <strong>{cliente.nome}</strong> <br/>
                <small style={{ color: '#7f8c8d' }}>{cliente.email}</small>
              </div>
              <div>
                <button 
                  onClick={() => abrirTarefas(cliente)} 
                  style={{ background: '#3498db', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}
                >
                  Ver Tarefas
                </button>
                <button 
                  onClick={() => excluirCliente(cliente.id)} 
                  style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 4. PAINEL DE TAREFAS */}
      {clienteSelecionado && (
        <div style={{ background: '#ecf0f1', padding: '20px', borderRadius: '8px', marginTop: '30px', borderTop: '5px solid #2c3e50' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2>📋 Tarefas de: {clienteSelecionado.nome}</h2>
            <button onClick={() => setClienteSelecionado(null)} style={{ background: '#95a5a6', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
              Fechar
            </button>
          </div>

          <form onSubmit={adicionarTarefa} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input 
              type="text" 
              placeholder="Digite uma nova tarefa..." 
              value={novaTarefa}
              onChange={(e) => setNovaTarefa(e.target.value)}
              style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #bdc3c7' }}
            />
            <button type="submit" style={{ background: '#27ae60', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>
              + Adicionar
            </button>
          </form>

          {tarefas.length === 0 ? (
            <p>Nenhuma tarefa pendente para este cliente.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {tarefas.map(tarefa => (
                <li key={tarefa.id} style={{ background: 'white', margin: '5px 0', padding: '10px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  
                  <span style={{ textDecoration: tarefa.concluida ? 'line-through' : 'none', color: tarefa.concluida ? '#95a5a6' : 'black', flex: 1 }}>
                    {tarefa.concluida ? '✅' : '⏳'} {tarefa.titulo}
                  </span>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => alternarStatusTarefa(tarefa)} 
                      style={{ background: tarefa.concluida ? '#f39c12' : '#27ae60', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      {tarefa.concluida ? 'Desfazer' : 'Concluir'}
                    </button>
                    
                    <button 
                      onClick={() => apagarTarefa(tarefa.id)} 
                      style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Apagar
                    </button>
                  </div>

                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default App;