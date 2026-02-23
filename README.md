# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
### 2. Modelo para o Repositório do Frontend (`mini-erp-frontend`)

```markdown
# 💻 Mini ERP - Frontend Web

Interface de usuário (Dashboard) desenvolvida em React para interagir com a API do Mini ERP. O sistema adota o padrão de interface "Mestre-Detalhe", permitindo a gestão intuitiva de clientes e suas tarefas diretamente pelo navegador.

*(Adicione aqui uma captura de tela do seu sistema rodando! Basta arrastar a imagem para o editor do GitHub)*

## 🚀 Tecnologias Utilizadas

* **React:** Biblioteca para construção da interface.
* **Vite:** Ferramenta de build super rápida para projetos web.
* **Axios:** Cliente HTTP para realizar as requisições (GET, POST, PUT, DELETE) à API RESTful.

## ✨ Funcionalidades

* Interface reativa e atualização de estado em tempo real.
* Padrão "Mestre-Detalhe": Seleção de um cliente para visualizar seu painel de tarefas exclusivo.
* Formulários integrados para cadastro de novos clientes e novas tarefas.
* Controle visual de status das tarefas (Pendente / Concluída) com botões de ação rápida.

## 🛠️ Como rodar o projeto localmente

**Pré-requisito:** Certifique-se de que o servidor [Backend do Mini ERP](https://github.com/SEU_USUARIO/mini-erp-backend) esteja rodando na porta `3000` da sua máquina.

1. Clone este repositório:
   ```bash
   git clone [https://github.com/SEU_USUARIO/mini-erp-frontend.git](https://github.com/SEU_USUARIO/mini-erp-frontend.git)
Acesse a pasta e instale as dependências:

Bash
cd mini-erp-frontend
npm install
Inicie o servidor de desenvolvimento:

Bash
npm run dev
Abra o navegador no endereço indicado no terminal (geralmente http://localhost:5173).
