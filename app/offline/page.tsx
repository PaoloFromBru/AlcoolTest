export const metadata = { title: "Offline" };

export default function Offline() {
  return (
    <section className="card">
      <h1 className="text-2xl font-bold">Sei offline</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Contenuti non disponibili senza connessione. Riprova quando torni online.
      </p>
      <a className="btn mt-4" href="/">Torna alla Home</a>
    </section>
  );
}
