import LandingPage, { landingMetadata } from '@/components/LandingPage';

export const dynamic = 'force-dynamic';

export const generateMetadata = () => landingMetadata('kink');

export default function Page() {
  return <LandingPage which="kink" />;
}
