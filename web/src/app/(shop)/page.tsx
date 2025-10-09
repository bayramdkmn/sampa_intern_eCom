import ProductsSliderComponent from "@/components/ProductsSliderComponent";

export default function ShopHomePage() {
  return (
    <div className="w-full">
      <section className="grid gap-6 md:grid-cols-2 px-4 py-6">
        <div className="rounded-lg border border-black/10 p-6">
          <h1 className="mb-2 text-black text-2xl font-semibold">
            Welcome to Sampa Connect
          </h1>
          <p className="text-sm text-black/70">
            Küçük ölçekli e-ticaret uygulaması iskeleti hazır. Ürünler sayfasına
            giderek listeyi görebilir, sepet akışı için navigasyonu
            kullanabilirsiniz.
          </p>
        </div>
      </section>

      {/* Recently Viewed Products Slider */}
      <ProductsSliderComponent />
    </div>
  );
}
