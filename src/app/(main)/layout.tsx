import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import { DataProvider } from '@/context/DataContext';
import { RegionProvider } from '@/context/RegionContext';
import { SearchProvider } from '@/context/SearchContext';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DataProvider>
      <RegionProvider>
        <SearchProvider>
          <div className="min-h-screen bg-surface">
            <TopNav />
            <main className="pt-14 pb-20 mx-auto max-w-lg">
              {children}
            </main>
            <BottomNav />
          </div>
        </SearchProvider>
      </RegionProvider>
    </DataProvider>
  );
}
