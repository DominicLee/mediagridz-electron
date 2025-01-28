import {RouteRecordRaw} from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '/setup',
        component: () => import('pages/Setup.vue')
      },
      {
        path: '/dashboard',
        component: () => import('pages/DashboaredView.vue')
      },
      {
        path: '/display',
        component: () => import('pages/GridDisplay.vue')
      },
      {
        path: '/library',
        component: () => import('pages/MediaLibrary.vue')
      },
      {
        path: '/playlists',
        component: () => import('pages/PlaylistManager.vue')
      },
      {
        path: '/layouts',
        component: () => import('pages/LayoutManager.vue')
      },
      {
        path: '/convert',
        component: () => import('pages/VideoConverter.vue')
      },
      {
        path: '/browse',
        component: () => import('pages/LocalBrowser.vue')
      },
      {
        path: '/export',
        component: () => import('pages/ExportPackager.vue')
      },
      {
        path: '/settings',
        component: () => import('pages/SettingsDialog.vue')
      }

    ],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
