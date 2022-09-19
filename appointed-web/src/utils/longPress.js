/**
 * 长按自定义指令
 */

const vLongPress = () => {
  return {
    created(el, binding, vnode, prevVnode) {},
    mounted(el, binding, vnode, prevVnode) {
      const fn = binding.value.fn;
      const args = binding.value.args;
      const time = binding.value.time || 500;
      let timeStamp;
      el.addEventListener('touchstart', (e) => {
        timeStamp = setTimeout(() => {
          fn(...args, e);
        }, time);
      });
      el.addEventListener('touchend', (e) => {
        clearTimeout(timeStamp);
      });
    }
  };
};

export default vLongPress;
