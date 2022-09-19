/**
 * 血糖单位转换 为mmol/l
 */
export function bloodSugarUnitConvert(value , unit){
    console.log('bloodSugarUnitConvert',value,unit);
    if (!value){
        return ''
    }
    if (unit == 1){
        // 1 g/L = 100mg/dL
//        100mmol/l = 1800mg/ml = 18g/l
        return ((value * 100) / 18.0).toFixed(2)
    }else if(unit == 2){
      // 1mmol/L = 18mg/dL
      return (value / 18.0).toFixed(2)
    }
    return value;
}


/**
 * 甘油三酯单位转换 为mmol/l
 */
export function triglycerideUnitConvert(value , unit){
    console.log('triglycerideUnitConvert',value,unit);
    if (!value ){
        return ''
    }
    if (unit == 1){
        // 1 g/L = 100mg/dL
        return ((value * 100) / 88.6).toFixed(2)
    }else if(unit == 2){
        // 1mmol/L = 88.6mg/dL
        return (value / 88.6).toFixed(2)
    }
    return value;
}


/**
 * 其他脂类单位转换 为mmol/l
 */
export function otherLipidUnitConvert(value , unit){
    console.log('otherLipidUnitConvert',value,unit);
    if (!value ){
        return ''
    }
    if (unit == 1){
        // 1 g/L = 100mg/dL
        return ((value * 100) / 38.66).toFixed(2)
    }else if(unit == 2){
        //1mmol/L = 38.66mg/dL
        return (value / 38.66).toFixed(2)
    }
    return value;
}

/**
 * 糖化血红蛋白转为 百分比  （mmol/mol） = [DCCT-HbA1c （%） - 2.15] x 10.929
 */
export function ghbUnitConvert(value,unit){
    console.log('ghbUnitConvert',value,unit);
   if(!value){
        console.log('============进入了不想进的逻辑',value);
       return '';
   }
   if (unit == '0'){
       return value
   }else{
        return (value  / 10.929).toFixed(2) + 2.15
   }
   
}

export function isWeiXinBrowser(){
        //window.navigator.userAgent属性包含了浏览器类型、版本、操作系统类型、浏览器引擎类型等信息，这个属性可以用来判断浏览器类型
        var ua = window.navigator.userAgent.toLowerCase();
        //通过正则表达式匹配ua中是否含有MicroMessenger字符串
        if(ua.match(/MicroMessenger/i) == 'micromessenger'){
            return true;
        }else{
            return false;
        }
    }


 export function watermark(icon) {
       var maxWidth = document.body.clientWidth
       var maxHeight = document.body.clientHeight-document.documentElement.clientHeight>=0?document.body.clientHeight:document.documentElement.clientHeight
       var intervalWidth = 120 //间隔宽度
       var intervalheight = 120 //间隔高度
       var rowNumber = (maxWidth - 40) / intervalWidth //横向个数
       var coumnNumber = (maxHeight - 40 - 80) / intervalheight //纵向个数
       console.log('==========maxHeight',maxHeight);
       //默认设置
       var defaultSettings = {
         watermark_color: '#aaa', //水印字体颜色
         watermark_alpha: 0.1, //水印透明度
         watermark_fontsize: '15px', //水印字体大小
         watermark_font: '微软雅黑', //水印字体
         watermark_width: 12, //水印宽度
         watermark_height: 12, //水印长度
         watermark_angle: 15, //水印倾斜度数
       }
       var time = new Date().format('YYYY-MM-DD HH:mm:ss')
       var _temp = document.createDocumentFragment()
       for (var i = 0; i < rowNumber; i++) {
         for (var j = 0; j < coumnNumber; j++) {
           var x = intervalWidth * i + 20
           var y = intervalheight * j + 30
           var mark_div = document.createElement('div')
           mark_div.id = 'mark_div' + i + j
           mark_div.className = 'mark_div'
           // 三个节点
           var span1 = document.createElement('img')
           span1.className = 'icon_sy'
           span1.setAttribute('src', icon)
           var span2 = document.createElement('div')
           span2.className = 'sy_text'
           span2.appendChild(document.createTextNode(time))
           // mark_div.appendChild(span0)
           mark_div.appendChild(span1)
           mark_div.appendChild(span2)
           //设置水印div倾斜显示
           mark_div.style.webkitTransform =
             'rotate(-' + defaultSettings.watermark_angle + 'deg)'
           mark_div.style.MozTransform =
             'rotate(-' + defaultSettings.watermark_angle + 'deg)'
           mark_div.style.msTransform =
             'rotate(-' + defaultSettings.watermark_angle + 'deg)'
           mark_div.style.OTransform =
             'rotate(-' + defaultSettings.watermark_angle + 'deg)'
           mark_div.style.transform =
             'rotate(-' + defaultSettings.watermark_angle + 'deg)'
           mark_div.style.visibility = ''
           mark_div.style.position = 'absolute'
           mark_div.style.left = x + 'px'
           mark_div.style.top = y + 'px'
           mark_div.style.overflow = 'hidden'
           mark_div.style.zIndex = '9999'
           mark_div.style.pointerEvents = 'none' //pointer-events:none  让水印不阻止交互事件
           mark_div.style.opacity = defaultSettings.watermark_alpha
           mark_div.style.fontSize = defaultSettings.watermark_fontsize
           mark_div.style.fontFamily = defaultSettings.watermark_font
           mark_div.style.color = defaultSettings.watermark_color
           mark_div.style.textAlign = 'center'
           mark_div.style.width = defaultSettings.watermark_width + 'rem'
           mark_div.style.height = defaultSettings.watermark_height + 'rem'
           mark_div.style.display = 'flex'
           mark_div.style.flexDirection = 'column'

           _temp.appendChild(mark_div)
         }
       }
       //document.getElementById('wrapper').style.height= maxHeight+'px'
       //document.getElementById('wrapper').innerHTML = '';
       //document.getElementById('wrapper').appendChild(_temp)
       document.body.appendChild(_temp)
     }

export const noEmtyChar = (val) => {
  return val !== ''
}

