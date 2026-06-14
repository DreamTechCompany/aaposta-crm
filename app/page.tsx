export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">AAposta — CRM de Eventos</h1>
      <p className="mt-3 text-neutral-600">
        Sistema de gestão de expositores. Estrutura inicial — schema do banco e
        clients do Supabase prontos; telas em construção.
      </p>

      <section className="mt-10">
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Escopo do MVP
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-neutral-700">
          <li>Dashboard por evento</li>
          <li>Cadastro de empresas expositoras</li>
          <li>Gestão de eventos</li>
          <li>Construtor de formulários por evento (link público)</li>
          <li>Coleta de dados operacionais</li>
          <li>Envio e coleta de documentos</li>
          <li>Pipeline visual de status (kanban)</li>
          <li>Notificações por e-mail</li>
        </ul>
      </section>
    </main>
  );
}
