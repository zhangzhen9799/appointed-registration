import { ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';

/**
 * desc: 根据url上参数 初始化用户信息
 */
export default function setUserInfoStorage() {
  const route = useRoute();
  const urlParams = {};
  const parmas = route.query;
  Object.keys(parmas).map((key) => {
    localStorage.setItem(
      key,
      key !== 'returnUrl'
        ? parmas[key] || ''
        : decodeURIComponent(parmas[key] || '')
    );
    urlParams[key] =
      key !== 'returnUrl'
        ? parmas[key] || ''
        : decodeURIComponent(parmas[key] || '');
  });

  return urlParams;
}
