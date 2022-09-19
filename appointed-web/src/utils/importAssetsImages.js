/**
 * 静态文件批量导入并导出，后续考虑增加全局预览
 */

const moduleList =
  import.meta.globEager('/src/assets/images/*.*');

const fileNameReg = /(?:\/)[\w\-]*\.?\w+$/
const getFileName = (path) => {
  return fileNameReg.exec(path)[0].replace('/', '');
}
const genModuleName = (fileName) => {
  return fileName.split(/[-.]/).map((e, i) => {
    if (i > 0) {
      return e.replace(/^\w/, (match) => {
        return match.toUpperCase();
      })
    } else {
      return e;
    }
  }).join("");
}


const moduleD = {};
Object.keys(moduleList).forEach(path => {
  const key = genModuleName(getFileName(path))
  const value = moduleList[path].default;
  moduleD[key] = value;
});


export default moduleD;