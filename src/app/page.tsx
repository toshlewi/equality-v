import HeroSection from '@/components/sections/HeroSection';
import IntroductionSection from '@/components/sections/IntroductionSection';
import ResourcesSnippet from '@/components/sections/ResourcesSnippet';
import KnowledgePortalSnippet from '@/components/sections/KnowledgePortalSnippet';
import LatestNewsSnippet from '@/components/sections/LatestNewsSnippet';
import SocialHighlights from '@/components/sections/SocialHighlights';
import GetInvolvedSection from '@/components/sections/GetInvolvedSection';

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <IntroductionSection />
      <ResourcesSnippet />
      <KnowledgePortalSnippet />
      <LatestNewsSnippet />
      <SocialHighlights />
      <GetInvolvedSection />
    </div>
  );
}