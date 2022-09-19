import canvasDpiScaler from 'canvas-dpi-scaler';

const dpr = window.devicePixelRatio;
class Ruler {
  constructor(options) {
    if (!(this instanceof Ruler)) {
      return new Ruler(options);
    }
    this.ver = '1.0.0';
    this.options = options;
    this.options.scaleplate =
      this.options.scaleplate === undefined ? {} : this.options.scaleplate;
    this.options.scaleplate.color =
      this.options.scaleplate.color === undefined
        ? '#f00'
        : this.options.scaleplate.color; //刻度颜色
    this.options.scaleplate.width =
      this.options.scaleplate.width === undefined
        ? 1
        : this.options.scaleplate.width; //刻度宽度
    this.options.scaleplate.fontsize =
      this.options.scaleplate.fontsize === undefined
        ? 16
        : this.options.scaleplate.fontsize; //刻度值字体大小
    this.options.scaleplate.fontcolor =
      this.options.scaleplate.fontcolor === undefined
        ? '#f00'
        : this.options.scaleplate.fontcolor; //刻度值字体颜色
    this.options.scaleplate.fontfamily =
      this.options.scaleplate.fontfamily === undefined
        ? 'Courier New'
        : this.options.scaleplate.fontfamily; //刻度值字体样式
    this.options.unit =
      this.options.unit === undefined ? 10 : this.options.unit; //刻度间隔，默认值5
    this.options.value =
      this.options.value === undefined
        ? this.options.start
        : this.options.value; //中心线位置，默认值为开始值
    this.options.background =
      this.options.background === undefined ? '#fff' : this.options.background; //画布背景色，默认白色
    this.options.linecolor =
      this.options.linecolor === undefined ? '#000' : this.options.linecolor; //中心线颜色，默认黑色
    this.options.capacity =
      this.options.capacity === undefined ? 1 : this.options.capacity; //每个刻度代表的值
    this.init();
  }

  init() {
    this.canvas = this.options.target;
    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;

    this.addEvent();
    this.renderCanvas();
  }
  renderCanvas() {
    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;
    var ctx = this.canvas.getContext('2d');
    canvasDpiScaler(this.canvas, ctx);
    var options = this.options;
    var curScaleValue = options.value; //当前刻度值
    var i = 0;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.lineWidth = options.scaleplate.width;

    ctx.fillStyle = '#F9FAFB';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const bigScale = Math.ceil((options.height * 1) / 2);
    const smallScale = Math.ceil((options.height * 1) / 3);
    //绘制右侧刻度
    for (
      i = options.width / 2;
      i < options.width && curScaleValue <= options.end;
      i += options.unit
    ) {
      ctx.beginPath();
      ctx.moveTo(i, bigScale);
      ctx.fillStyle = options.scaleplate.fontcolor;
      if (curScaleValue % (options.capacity * options.unit) == 0) {
        ctx.moveTo(i, bigScale);
        ctx.font =
          options.scaleplate.fontsize + 'px ' + options.scaleplate.fontfamily; //设置文本的字体大小和字体样式
        ctx.fillStyle = options.scaleplate.fontcolor;
        ctx.fillText(
          curScaleValue,
          i - (curScaleValue + '').length * 3.5,
          bigScale + 12
        );
      } else {
        ctx.moveTo(i, smallScale);
      }
      ctx.lineTo(i, 6);
      ctx.strokeStyle = options.scaleplate.color;
      ctx.stroke(); //实际地绘制出通过 moveTo() 和 lineTo() 方法定义的路径
      ctx.closePath(); //关闭当前的绘制路径
      curScaleValue = curScaleValue + options.capacity;
    }

    //绘制左侧刻度
    curScaleValue = options.value - options.capacity;
    for (
      i = options.width / 2 - options.unit;
      i > -options.width && curScaleValue >= options.start;
      i -= options.unit
    ) {
      ctx.beginPath();
      ctx.moveTo(i, bigScale);
      ctx.fillStyle = options.scaleplate.fontcolor;
      if (curScaleValue % (options.capacity * options.unit) == 0) {
        //第1或10格刻度
        ctx.font =
          options.scaleplate.fontsize + 'px ' + options.scaleplate.fontfamily; //设置文本的字体大小和字体样式
        ctx.fillStyle = options.scaleplate.fontcolor;
        ctx.fillText(
          curScaleValue,
          i - (curScaleValue + '').length * 3.5,
          bigScale + 12
        );
      } else {
        //第5格刻度
        ctx.moveTo(i, smallScale);
      }
      ctx.lineTo(i, 5);
      ctx.strokeStyle = options.scaleplate.color;
      ctx.stroke(); //实际地绘制出通过 moveTo() 和 lineTo() 方法定义的路径
      ctx.closePath(); //关闭当前的绘制路径
      curScaleValue = curScaleValue - options.capacity;
    }

    //绘制中心线
    ctx.beginPath();
    const midBaseDotX = Math.floor(this.canvas.width / 2) / dpr;
    const midBaseDotY = this.canvas.height / dpr;
    ctx.moveTo(midBaseDotX, 0);
    ctx.lineWidth = options.scaleplate.width;
    ctx.lineTo(midBaseDotX, midBaseDotY - 10);
    ctx.lineTo(midBaseDotX - 4, midBaseDotY - 3);
    ctx.lineTo(midBaseDotX + 4, midBaseDotY - 3);
    ctx.lineTo(midBaseDotX, midBaseDotY - 10);
    ctx.strokeStyle = options.linecolor;
    ctx.fillStyle = options.linecolor;
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }
  addEvent() {
    var x,
      curX,
      moveDistance,
      _this = this;
    //添加手指触碰屏幕时的touchstart事件
    this.canvas.addEventListener(
      'touchstart',
      function (e) {
        e.stopPropagation();
        e.preventDefault();
        x = e.touches[0].clientX; //获取第一个手指对象的X轴坐标值
      },
      false
    );
    //添加手指滑动屏幕时的touchmove事件
    this.canvas.addEventListener(
      'touchmove',
      function (e) {
        e.stopPropagation();
        e.preventDefault();
        curX = e.touches[0].clientX;
        if (Math.abs(curX - x) > _this.options.unit) {
          moveDistance = curX - x;
          x = curX;
          _this.options.value -=
            Math.ceil(moveDistance / _this.options.unit) *
            _this.options.capacity;
          _this.options.value =
            _this.options.value < _this.options.start
              ? _this.options.start
              : _this.options.value > _this.options.end
              ? _this.options.end
              : _this.options.value;

          _this.renderCanvas();
          _this.options.callback && _this.options.callback(_this.options.value);
        }
      },
      false
    );
  }
}

export default Ruler;
