export default function ShopHomePage() {
  return (
    <section className="grid gap-6 md:grid-cols-2">
      <div className="rounded-lg border border-black/10 p-6">
        <h1 className="mb-2 text-2xl font-semibold">Hoş geldiniz</h1>
        <p className="text-sm text-black/70">
          Küçük ölçekli e-ticaret uygulaması iskeleti hazır. Ürünler sayfasına
          giderek listeyi görebilir, sepet akışı için navigasyonu
          kullanabilirsiniz.
        </p>
      </div>
      <div className="rounded-lg border border-black/10 p-6">
        <ul className="list-disc pl-5 text-sm">
          <li>Ürün listesi ve detay sayfası</li>
          <li>Sepet sayfası ve global state</li>
          <li>Giriş/Kayıt sayfaları (JWT entegrasyonuna hazır)</li>
        </ul>
      </div>
    </section>
  );
}
