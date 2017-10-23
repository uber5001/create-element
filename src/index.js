import _f from '@uber5001/create-fragment';
import pap from '@uber5001/partial-application-proxy';
import deepAssign from '@uber5001/deep-assign';
function _e(el, ...args) {
  if (typeof el == "string") {
    el = document.createElement(el);
  } else {
    el.innerHTML = "";
  }
  for (const arg of args) {
    if (!arg) continue;
    if (arg instanceof Array) {
      el.appendChild(_f(arg.filter(x=>x)));
    } else if (arg instanceof Node) {
      el.appendChild(arg);
    } else if (typeof arg == "string") {
      el.classList.add(arg);
    } else if (arg.subscribe instanceof Function) { //arg instanceof Observable
      const insertLocation = document.createComment("@uber5001/create-element insertLocation")
      el.appendChild(insertLocation);
      arg
        .startWith(undefined)
        .pairwise()
        .subscribe(([prev, curr]) => {
          if (prev) {
            if (prev instanceof Array) {
              for (const child of prev) {
                if (child) {
                  el.removeChild(child);
                }
              }
            } else if (prev instanceof Node) {
              el.removeChild(prev)
            } else if (typeof prev == "string") {
              el.classList.remove(prev);
            } else {
              //uhh, ignore this one, I guess?
              //not sure if unassigning properties is useful.
            }
          }

          if (curr) {
            if (curr instanceof Array) {
              el.insertBefore(_f(curr.filter(x=>x)), insertLocation)
            } else if (curr instanceof Node) {
              el.insertBefore(curr, insertLocation)
            } else if (typeof curr == "string") {
              el.classList.add(curr);
            } else {
              deepAssign(el, arg)
            }
          }
        })
    } else if (arg instanceof Promise) {
      const placeholder = document.createComment("@uber5001/create-element placeholder")
      el.appendChild(placeholder);
      arg.then(val => {
        if (val) {
          if (val instanceof Array) {
            el.replaceChild(_f(val.filter(x=>x)), placeholder);
          } else if (val instanceof HTMLElement) {
            el.replaceChild(val, placeholder);
          } else if (typeof val == "string") {
            el.removeChild(placeholder);
            el.classList.add(val);
          } else {
            el.removeChild(placeholder);
            deepAssign(el, arg)
          }
        }
      })
    } else {
      for (const key of Object.keys(arg)) {
        if (arg[key] && arg[key].subscribe instanceof Function) {
          const obs = arg[key];
          delete arg[key];
          obs.subscribe(val => {
            el[key] = val;
          })
        }
      }
      deepAssign(el, arg)
    }
  }
  return el;
}

export default pap(_e);