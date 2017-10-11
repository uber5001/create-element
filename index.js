import _f from '@uber5001/create-fragment';
import pap from '@uber5001/partial-application-proxy';
import deepAssign from '@uber5001/deep-assign';
function _e(el, ...args) {
  const classes = [];
  const props = {};
  const children = [];
  for (const arg of args) {
    if (arg instanceof Array) {
      children.push(...arg);
    } else if (arg instanceof HTMLElement) {
      children.push(arg);
    } else if (typeof arg == "string") {
      classes.push(arg);
    } else if (arg) {
      Object.assign(props, arg);
    }
  }
  if (typeof el == "string") {
    el = document.createElement(el);
  } else {
    el.innerHTML = "";
  }
  deepAssign(el, props)
  for (const klass of classes) {
    el.classList.add(klass);
  }
  if (children.length > 0) {
    el.appendChild(
      _f(
        children.filter(x=>x)
      )
    );
  }
  return el;
}

export default pap(_e);