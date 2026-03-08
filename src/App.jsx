import { useState, useEffect } from 'react';
import api from './api';

function App() {
  // ==========================================
  // ESTADOS GERAIS
  // ==========================================
  const [clientes, setClientes] = useState([]);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  // Novo estado para a barra de pesquisa
  const [termoBusca, setTermoBusca] = useState('');// Novo estado para a barra de pesquisa 
  // Estado para o Dashboard
  const [estatisticas, setEstatisticas] = useState({ totalClientes: 0, totalTarefas: 0, tarefasConcluidas: 0 }); 
  
  const [clienteSelecionado, setClienteSelecionado] = useState(null); 
  const [tarefas, setTarefas] = useState([]); 
  const [novaTarefa, setNovaTarefa] = useState('');
  // Estados para a Edição de Tarefas
  const [tarefaEditando, setTarefaEditando] = useState(null); // Guarda o ID da tarefa que está sendo editada
  const [textoEdicao, setTextoEdicao] = useState(''); // Guarda o texto novo enquanto o usuário digita

  // ==========================================
  // ESTADOS DE SEGURANÇA (LOGIN)
  // ==========================================
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [emailLogin, setEmailLogin] = useState('');
  const [senhaLogin, setSenhaLogin] = useState('');
  // ==========================================
  // LÓGICA DE PESQUISA
  // ==========================================
  // Filtra a lista original em tempo real. Se o termoBusca estiver vazio, mostra todos!
  const clientesFiltrados = clientes.filter((cliente) => 
    cliente.nome.toLowerCase().includes(termoBusca.toLowerCase())
  );

  // O React agora só busca os clientes se tivermos um Token válido!
  useEffect(() => {
    if (token) {
      buscarClientes();
      buscarEstatisticas();
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
  async function buscarEstatisticas() {
    try {
      const resposta = await api.get('/estatisticas');
      setEstatisticas(resposta.data);
    } catch (erro) {
      console.error("Erro ao buscar estatísticas:", erro);
    }
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
    buscarEstatisticas();
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
    buscarEstatisticas();
  }

  async function alternarStatusTarefa(tarefa) {
    try {
      await api.put(`/tarefas/${tarefa.id}`, { concluida: !tarefa.concluida });
      abrirTarefas(clienteSelecionado);
    } catch (erro) {
      alert("Erro ao atualizar o estado da tarefa.");
    }
    buscarEstatisticas();
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
  // 6. FUNÇÃO PARA SALVAR A EDIÇÃO DA TAREFA
  async function salvarEdicaoTarefa(id) {
    if (!textoEdicao) return alert("O texto não pode ficar vazio!");
    
    try {
      await api.put(`/tarefas/${id}/titulo`, { titulo: textoEdicao });
      
      setTarefaEditando(null); // Sai do "modo de edição"
      abrirTarefas(clienteSelecionado); // Atualiza a lista na tela
      buscarEstatisticas(); // Atualiza os números do dashboard
    } catch (erro) {
      alert("Erro ao editar a tarefa.");
    }
  }

  // ==========================================
  // O GUARDA-COSTAS (TELA DE LOGIN PREMIUM)
  // ==========================================
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md transform transition-all">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">
              🏢 Mini <span className="text-blue-600">ERP</span>
            </h2>
            <p className="text-gray-500 mt-2">Acesso restrito para administradores</p>
          </div>
          
          <form onSubmit={fazerLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input 
                type="email" 
                placeholder="admin@minierp.com" 
                value={emailLogin}
                onChange={(e) => setEmailLogin(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={senhaLogin}
                onChange={(e) => setSenhaLogin(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 mt-2"
            >
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
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* CABEÇALHO COM BOTÃO DE SAIR */}
      <div className="flex justify-between items-center mb-8 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-extrabold text-gray-800 m-0 tracking-tight">
          🏢 Meu Mini <span className="text-blue-600">ERP</span>
        </h1>
        <button 
          onClick={fazerLogout} 
          className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white font-bold py-2 px-5 rounded-lg transition-all duration-200 shadow-sm"
        >
          Sair do Sistema
        </button>
      </div>
      
      {/* 📊 DASHBOARD DE ESTATÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Cartão 1: Clientes */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center">
          <h4 className="text-blue-100 mb-1 text-sm font-semibold uppercase tracking-wider">Total de Clientes</h4>
          <h2 className="text-5xl font-black">{estatisticas.totalClientes}</h2>
        </div>

        {/* Cartão 2: Tarefas Totais */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center">
          <h4 className="text-purple-100 mb-1 text-sm font-semibold uppercase tracking-wider">Tarefas Criadas</h4>
          <h2 className="text-5xl font-black">{estatisticas.totalTarefas}</h2>
        </div>

        {/* Cartão 3: Tarefas Concluídas */}
        <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 text-white p-6 rounded-2xl shadow-lg transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center">
          <h4 className="text-emerald-100 mb-1 text-sm font-semibold uppercase tracking-wider">Concluídas</h4>
          <h2 className="text-5xl font-black">{estatisticas.tarefasConcluidas}</h2>
        </div>

      </div>

      {/* 3. O Formulário Visual de Novo Cliente */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-10">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          ✨ Adicionar Novo Cliente
        </h3>
        <form onSubmit={adicionarCliente} className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Nome completo" 
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
          <input 
            type="email" 
            placeholder="E-mail profissional" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap"
          >
            + Salvar Cliente
          </button>
        </form>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-6">Lista de Clientes</h2>

      <h2>Lista de Clientes</h2>
      {/* 🔍 NOVA BARRA DE PESQUISA */}
      <div className="mb-6 relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
          🔍
        </span>
        <input 
          type="text" 
          placeholder="Buscar cliente por nome..." 
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
        />
      </div>

      {clientesFiltrados.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-lg">Nenhum cliente encontrado. 🕵️‍♂️</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {clientesFiltrados.map((cliente) => (
            <li 
              key={cliente.id} 
              className="bg-white p-5 rounded-2xl border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div>
                <strong className="text-lg text-gray-800 block">{cliente.nome}</strong>
                <span className="text-gray-500 text-sm">{cliente.email}</span>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => abrirTarefas(cliente)} 
                  className="flex-1 sm:flex-none bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  📋 Tarefas
                </button>
                <button 
                  onClick={() => excluirCliente(cliente.id)} 
                  className="flex-1 sm:flex-none bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  🗑️ Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 4. PAINEL DE TAREFAS */}
      {clienteSelecionado && (
        <div className="mt-10 bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200 shadow-inner">
          
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              📋 Tarefas: <span className="text-blue-600">{clienteSelecionado.nome}</span>
            </h2>
            <button 
              onClick={() => setClienteSelecionado(null)} 
              className="text-slate-400 hover:text-red-500 transition-colors bg-white hover:bg-red-50 p-2 rounded-full shadow-sm"
              title="Fechar Painel"
            >
              ❌
            </button>
          </div>

          {/* FORMULÁRIO DE ADICIONAR TAREFA */}
          <form onSubmit={adicionarTarefa} className="flex flex-col sm:flex-row gap-3 mb-8">
            <input 
              type="text" 
              placeholder="O que precisa ser feito?" 
              value={novaTarefa}
              onChange={(e) => setNovaTarefa(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm transition-all"
            />
            <button 
              type="submit" 
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all whitespace-nowrap"
            >
              + Adicionar
            </button>
          </form>

          {/* LISTA DE TAREFAS */}
          {tarefas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">Nenhuma tarefa pendente. Tudo limpo! ✨</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {tarefas.map(tarefa => (
                <li 
                  key={tarefa.id} 
                  className={`group p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all border ${tarefa.concluida ? 'bg-slate-100 border-slate-200 opacity-75' : 'bg-white border-white shadow-sm hover:shadow-md'}`}
                >
                  
                  {tarefaEditando === tarefa.id ? (
                    <div className="flex flex-1 w-full gap-2">
                      <input 
                        type="text" 
                        value={textoEdicao} 
                        onChange={(e) => setTextoEdicao(e.target.value)} 
                        className="flex-1 px-3 py-2 rounded-lg border-2 border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        autoFocus
                      />
                      <button onClick={() => salvarEdicaoTarefa(tarefa.id)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">Salvar</button>
                      <button onClick={() => setTarefaEditando(null)} className="bg-slate-300 hover:bg-slate-400 text-slate-800 px-4 py-2 rounded-lg font-medium transition-colors">Cancelar</button>
                    </div>
                  ) : (
                    <>
                      <span className={`flex-1 text-lg flex items-center gap-3 ${tarefa.concluida ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                        <span className="text-xl">{tarefa.concluida ? '✅' : '⏳'}</span> 
                        {tarefa.titulo}
                      </span>

                      {/* BOTÕES DE AÇÃO: Aparecem no PC ao passar o mouse, ou sempre no celular */}
                      <div className="flex gap-2 w-full sm:w-auto opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                        
                        {!tarefa.concluida && (
                          <button 
                            onClick={() => { setTarefaEditando(tarefa.id); setTextoEdicao(tarefa.titulo); }} 
                            className="flex-1 sm:flex-none bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium px-3 py-2 rounded-lg transition-colors text-sm"
                          >
                            ✏️ Editar
                          </button>
                        )}

                        <button 
                          onClick={() => alternarStatusTarefa(tarefa)} 
                          className={`flex-1 sm:flex-none font-medium px-3 py-2 rounded-lg transition-colors text-sm ${tarefa.concluida ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'}`}
                        >
                          {tarefa.concluida ? '↩️ Desfazer' : '✔️ Concluir'}
                        </button>
                        
                        <button 
                          onClick={() => apagarTarefa(tarefa.id)} 
                          className="flex-1 sm:flex-none bg-red-100 hover:bg-red-200 text-red-700 font-medium px-3 py-2 rounded-lg transition-colors text-sm"
                        >
                          🗑️ Apagar
                        </button>
                      </div>
                    </>
                  )}
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