import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Locale-aware navigation wrappers. Use these instead of next/link and
// next/navigation throughout the app so locale prefixes are handled for us.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
