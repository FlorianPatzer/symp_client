import { MyINavData } from './services/sidebar-items.service';

export const navItems: MyINavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    icon: 'icon-speedometer',
  },
  {
    name: 'Analysis',
    url: '/analysis/overview',
    icon: 'icon-folder',
  },
  {
    name: 'Reports',
    url: '/reports',
    icon: 'icon-note',
  },
  {
    name: 'Settings',
    url: '/settings',
    icon: 'icon-settings',
    class: 'mt-auto',
  },
  {
    name: 'Administrator',
    url: '/admin',
    icon: 'icon-people',
    permissions: ['admin']
  },
  {
    name: 'Logout',
    url: '/logout',
    icon: 'fa fa-lock',
    variant: 'danger',
  }
];

