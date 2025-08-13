import { useI18n } from "../../../components/Providers";

export const metadata = { title: "Offline" };

export default function Offline() {
  const { dict } = useI18n();
  return (
    <section className="card">
      <h1 className="text-2xl font-bold">Offline</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400"></p>
      <a className="btn mt-4" href="./">← {dict.nav.title}</a>
    </section>
  );
}
