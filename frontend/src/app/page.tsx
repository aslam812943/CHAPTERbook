import CanvasSequence from '@/components/CanvasSequence';
import AuthorSection from '@/components/AuthorSection';
import PromoBanners from '@/components/PromoBanners';
import CtaSection from '@/components/CtaSection';
import LatestBooks from '@/components/LatestBooks';
import BestSellers from '@/components/BestSellers';
import ShopByCategory from '@/components/ShopByCategory';

export default function Home() {
  return (
    <main className="w-full bg-paper min-h-screen">
      {/* 1. Hero & 2. Library Journey (Canvas Image Sequence) combined */}
      <CanvasSequence />

      {/* 3. Shop By Categories */}
      <ShopByCategory />

      {/* 3.5 Latest Additions */}
      <LatestBooks />

      {/* 3.6 Best Sellers */}
      <BestSellers />

      {/* 4. Browse By Authors */}
      <AuthorSection />

      {/* 5. Promo Banners */}
      {/* <PromoBanners /> */}

      {/* 6. CTA / Close the Loop */}
      <CtaSection />
    </main>
  );
}
