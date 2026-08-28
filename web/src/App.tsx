import { ClientRegistrationForm } from "./components/ClientRegistrationForm";

export function App() {
  return (
    <div className="page">
      <main className="card">
        <div className="card-accent" aria-hidden="true" />
        <h1>Cadastro de Cliente</h1>
        <p className="subtitle">Preencha seus dados abaixo. Leva menos de um minuto.</p>
        <ClientRegistrationForm />
      </main>
    </div>
  );
}
