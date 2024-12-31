import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import ContractForm from './components/ContractForm';
import ContractDownload from './components/ContractDownload';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-gray-900">
                    Gerador de Contratos
                  </h1>
                </div>
              </div>
              <div className="flex items-center">
                {user ? (
                  <button
                    onClick={() => setUser(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Sair
                  </button>
                ) : (
                  <button
                    onClick={() => setUser({ name: 'Usuário Teste' })}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Entrar
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Routes>
              {user ? (
                <Route path="/" element={<ContractForm />} />
              ) : (
                <Route path="/" element={
                  <div className="text-center">
                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                      Crie contratos profissionais em minutos
                    </h2>
                    <p className="mt-4 text-lg leading-8 text-gray-600">
                      Escolha entre diversos modelos de contratos, personalize conforme sua necessidade
                      e gere documentos profissionais em PDF.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                      <button
                        onClick={() => setUser({ name: 'Usuário Teste' })}
                        className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        Começar Agora
                      </button>
                      <a href="#features" className="text-sm font-semibold leading-6 text-gray-900">
                        Saiba mais <span aria-hidden="true">→</span>
                      </a>
                    </div>
                  </div>
                } />
              )}
              
              <Route path="/download-contract" element={<ContractDownload />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
