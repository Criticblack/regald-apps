import RoadmapView from './RoadmapView';

export const revalidate = 60;
export const metadata = { title: 'Roadmap — Regald Apps', description: 'Aplicațiile la care lucrez — progress tracked în real time.' };

export default function RoadmapPage() {
  return <RoadmapView />;
}
