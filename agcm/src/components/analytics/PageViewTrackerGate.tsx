import { isPageViewTrackingEnabled } from '@/lib/page-view-config';
import PageViewTracker from './PageViewTracker';

/** N’affiche le tracker que si activé (off en prod par défaut). */
export default function PageViewTrackerGate() {
  if (!isPageViewTrackingEnabled()) return null;
  return <PageViewTracker />;
}
