const isOpenChii =
  process.env.NODE_ENV === 'development' || process.env.CUSTOM_ENV === 'dev';

((dom) => {
  if (isOpenChii) {
    const script = dom.createElement('script');
    script.src = 'http://' + dom.location.hostname + ':8080/target.js';
    dom.body.appendChild(script);
  }
})(document);
