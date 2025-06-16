import MindMap from '@/features/mind-map/components/MindMap';
import { MindMapProvider } from '@/contexts/MindMapContext';

const IndexPage = () => {
  return (
    <MindMapProvider>
      <MindMap />
    </MindMapProvider>
  );
};

export default IndexPage;