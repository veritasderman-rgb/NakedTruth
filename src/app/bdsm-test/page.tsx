import LandingPage, { landingMetadata } from '@/components/LandingPage';

export const dynamic = 'force-dynamic';

export const generateMetadata = () => landingMetadata('bdsm');

export default function Page() {
  return <LandingPage which="bdsm" />;
}
