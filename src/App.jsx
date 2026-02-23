import { useState, useEffect } from 'react';
import api from './api';


function App() {
  const [clientes, setClientes] = useState([]);
  
  // 1. Novos "estados" para guardar o que o usuário digita nos inputs
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  // 1. NOVOS ESTADOS PARA AS TAREFAS:
  // Guarda o cliente que clicamos para ver as tarefas
  const [clienteSelecionado, setClienteSelecionado] = useState(null); 
  // Guarda a lista de tarefas desse cliente específico
  const [tarefas, setTarefas] = useState([]); 
  // NOVO: Guarda o texto da tarefa que estamos digitando
  const [novaTarefa, setNovaTarefa] = useState('');
  // ... resto do código

  useEffect(() => {
    buscarClientes();
  }, []);

  async function buscarClientes() {
    try {
      const resposta = await api.get('/clientes'); 
      setClientes(resposta.data); 
    } catch (erro) {
      console.error("Erro ao buscar clientes:", erro);
      alert("Servidor fora do ar!");
    }
  }

  // 2. A função que faz o POST para o servidor
  async function adicionarCliente(e) {
    e.preventDefault(); // Evita que a página dê F5 automaticamente ao enviar o form

    if (!nome || !email) {
      return alert("Por favor, preencha o nome e o email!");
    }

    try {
      // Mandamos os dados para a rota POST que você criou no Node
      await api.post('/clientes', { nome: nome, email: email });
      
      // Limpamos os campos da tela
      setNome('');
      setEmail('');
      
      // Chamamos a busca novamente para atualizar a lista na tela com o novo cliente
      buscarClientes(); 

    } catch (erro) {
      console.error("Erro ao adicionar:", erro);
      alert("Erro ao salvar o cliente.");
    }
  }
  // ... (código anterior de buscar e adicionar)

  // 3. A função que faz o DELETE
  async function excluirCliente(id) {
    // Uma perguntinha de segurança antes de apagar do banco
    const confirmacao = window.confirm("Tem certeza que deseja excluir este cliente?");
    
    if (confirmacao) {
      try {
        // O Axios avisa o Node para deletar o ID específico
        await api.delete(`/clientes/${id}`);
        
        // Atualiza a lista na tela para o cliente sumir
        buscarClientes(); 
      } catch (erro) {
        console.error("Erro ao excluir:", erro);
        alert("Erro ao excluir o cliente.");
      }
    }
  }
  // ... (função excluirCliente)

  // 2. FUNÇÃO PARA BUSCAR AS TAREFAS DE UM CLIENTE ESPECÍFICO
  async function abrirTarefas(cliente) {
    setClienteSelecionado(cliente); // Salva na memória quem é o cliente atual
    
    try {
      // Usa o ID do cliente clicado para buscar as tarefas dele
      const resposta = await api.get(`/clientes/${cliente.id}/tarefas`);
      setTarefas(resposta.data);
    } catch (erro) {
      console.error("Erro ao buscar tarefas:", erro);
      alert("Erro ao carregar as tarefas.");
    }
  }
  // 3. FUNÇÃO PARA ADICIONAR UMA TAREFA NOVA
  async function adicionarTarefa(e) {
    e.preventDefault(); // Evita o F5 na página
    
    if (!novaTarefa) return alert("Digite o título da tarefa!");

    try {
      // Mandamos para o backend: O título e de QUEM é a tarefa
      await api.post('/tarefas', { 
        titulo: novaTarefa, 
        cliente_id: clienteSelecionado.id 
      });
      
      setNovaTarefa(''); // Limpa o input
      
      // Atualiza a lista de tarefas para a nova aparecer na hora!
      abrirTarefas(clienteSelecionado); 
      
    } catch (erro) {
      console.error("Erro ao adicionar tarefa:", erro);
      alert("Erro ao salvar a tarefa.");
    }
  }
  // 4. FUNÇÃO PARA ALTERNAR O ESTADO DA TAREFA (Concluída / Pendente)
  async function alternarStatusTarefa(tarefa) {
    try {
      // Enviamos para o backend o valor inverso do estado atual da tarefa
      await api.put(`/tarefas/${tarefa.id}`, {
        concluida: !tarefa.concluida 
      });
      
      // Atualiza a lista de tarefas para refletir a mudança no ecrã
      abrirTarefas(clienteSelecionado);
    } catch (erro) {
      console.error("Erro ao atualizar a tarefa:", erro);
      alert("Erro ao atualizar o estado da tarefa.");
    }
  }

  // 5. FUNÇÃO PARA APAGAR UMA TAREFA
  async function apagarTarefa(id) {
    const confirmacao = window.confirm("Tens a certeza que pretendes apagar esta tarefa?");
    if (confirmacao) {
      try {
        await api.delete(`/tarefas/${id}`);
        
        // Atualiza a lista após apagar
        abrirTarefas(clienteSelecionado); 
      } catch (erro) {
        console.error("Erro ao apagar tarefa:", erro);
        alert("Erro ao apagar a tarefa.");
      }
    }
  }
  
 

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>🏢 Meu Mini ERP</h1>
      
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
                display: 'flex', justifyContent: 'space-between', alignItems: 'center' // Deixa o texto de um lado e o botão do outro
              }}
            >
              <div>
                <strong>{cliente.nome}</strong> <br/>
                <small style={{ color: '#7f8c8d' }}>{cliente.email}</small>
              </div>
              {/* NOVO BOTÃO AZUL */}
                <button 
                  onClick={() => abrirTarefas(cliente)} 
                  style={{ background: '#3498db', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Ver Tarefas
                </button>
              
              {/* Novo botão de Excluir */}
              <button 
                onClick={() => excluirCliente(cliente.id)} 
                style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
              >
                Excluir
              </button>
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

          {/* NOVO: FORMULÁRIO DE ADICIONAR TAREFA */}
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

          {/* LISTA DE TAREFAS (Continua igual) */}
          {tarefas.length === 0 ? (
            <p>Nenhuma tarefa pendente para este cliente.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {tarefas.map(tarefa => (
                
                <li key={tarefa.id} style={{ background: 'white', margin: '5px 0', padding: '10px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  
                  {/* TEXTO DA TAREFA */}
                  <span style={{ textDecoration: tarefa.concluida ? 'line-through' : 'none', color: tarefa.concluida ? '#95a5a6' : 'black', flex: 1 }}>
                    {tarefa.concluida ? '✅' : '⏳'} {tarefa.titulo}
                  </span>

                  {/* NOVOS BOTÕES: CONCLUIR E APAGAR */}
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