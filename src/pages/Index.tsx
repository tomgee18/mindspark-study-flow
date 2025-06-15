
import MindMap from '@/features/mind-map/components/MindMap';
import { AppSidebar } from '@/features/sidebar/components/AppSidebar';
import MainLayout from '@/app/layout/MainLayout';
import { MindMapProvider } from '@/contexts/MindMapContext';

const IndexPage = () => {
  return (
    <MindMapProvider>
      <MainLayout
        sidebar={<AppSidebar />}
        mainContent={<MindMap />}
      />
    </MindMapProvider>
  );
};

export default IndexPage;
