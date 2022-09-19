import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/dashboad',
    name: '',
    meta: {
      title: '114预约挂号监控首页'
    },
    redirect: '/dashboad/home',
    component: () => import('@/views/dashboad/index.vue'),
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/home/index.vue')
      },
      {
        path: 'hos-depart',
        name: 'HosAndDepInfo',
        redirect: 'hos-depart/select-hos',
        component: () => import('@/views/hosAndDepInfo/index.vue'),
        children: [
          {
            path: 'select-hos',
            name: 'SelectHos',
            component: () => import('@/views/hosAndDepInfo/selectHos.vue')
          },
          {
            path: 'select-dep',
            name: 'SelectDep',
            component: () => import('@/views/hosAndDepInfo/selectDep.vue')
          },
          {
            path: 'select-date',
            name: 'SelectDate',
            component: () => import('@/views/hosAndDepInfo/selectDate.vue')
          }
        ]
      },
      {
        path: 'appointment-list',
        name: 'AppointmentList',
        component: () => import('@/views/appointmentList/index.vue')
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    meta: {
      title: '114预约挂号监控登录'
    },
    component: () => import('@/views/login/index.vue')
  }
];

const router = createRouter({
  history: createWebHistory('/'),
  routes
});

// 全局导航守卫
router.beforeEach((to, from) => {
  if (to.meta.title) {
    document.title = to.meta.title;
  }
  // 校验缓存中是否含有token
  // const token = localStorage.getItem('token');
  // if (!token && to.name !== 'Login') {
  //   return { name: 'Login' };
  // }
});

export default router;
