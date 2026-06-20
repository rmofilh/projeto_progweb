import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getPatternRepository } from "@/src/infrastructure/repositories";
import { VaultClient } from "./VaultClient";

export default async function VaultPage() {
  const repo = getPatternRepository();
  const collections = await repo.listCollections();

  return (
    <div className="flex flex-col min-h-screen bg-alabaster font-outfit text-charcoal">
      <Header />

      <main className="flex-1">
        <VaultClient collections={collections} />
      </main>

      <Footer />
    </div>
  );
}
