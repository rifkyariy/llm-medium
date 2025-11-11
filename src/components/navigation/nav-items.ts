import {
  BarChart3,
  Bookmark,
  FileText,
  Home as HomeIcon,
  type LucideIcon,
  User,
} from 'lucide-react';

export type NavKey = 'home' | 'library' | 'profile' | 'stories' | 'stats';

export type NavItem = {
  key: NavKey;
  label: string;
  href: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { key: 'home', label: 'Home', href: '/', icon: HomeIcon },
  { key: 'library', label: 'Library', href: '/library', icon: Bookmark },
  { key: 'profile', label: 'Profile', href: '/profile', icon: User },
  { key: 'stories', label: 'Stories', href: '/stories', icon: FileText },
  { key: 'stats', label: 'Stats', href: '/stats', icon: BarChart3 },
];
