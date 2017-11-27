import _f from '@uber5001/create-fragment';
import pap from '@uber5001/partial-application-proxy';
import deepAssign from '@uber5001/deep-assign';
function _e(el, ...args) {
  if (typeof el == "string") {
    el = document.createElement(el);
  } else {
    el.innerHTML = "";
  }

  function _c(txt = "") {return document.createComment(`@uber5001/create-element ${txt}`)}
  function processArray(arr, referenceNode = null) {
    if (!(arr instanceof Array)) arr = [arr];
    const undoList = [];
    function undo() {undoList.forEach(item => item())}
    function insert(newEl) {el.insertBefore(newEl, referenceNode); return newEl;}
    for (const item of arr) {
      if (item === undefined) continue;
      if (item instanceof Array) {
        const comment = insert(_c("array"));
        undoList.push(processArray(item, comment));
        undoList.push(() => el.removeChild(comment));
      } else if (item instanceof Node) {
        insert(item);
        undoList.push(() => el.removeChild(item));
      } else if (typeof item == "string") {
        el.classList.add(item);
        undoList.push(() => el.classList.remove(item))
      } else if (item.subscribe instanceof Function) {
        const comment = insert(_c("observable"));
        let undo = _=>_;
        const subscription = item
          .subscribe(val => {
            undo();
            undo = processArray(val, comment)
          })
        undoList.push(() => {
          subscription.unsubscribe();
          undo();
        })
        undoList.push(() => el.removeChild(comment));
      } else if (item instanceof Promise) {
        const comment = insert(_c("promise"));
        let undo = _=>_;
        let cancelled = false;
        item.then(val => {
          if (!cancelled) undo = processArray(val, comment);
        })
        undoList.push(() => {
          undo();
          cancelled = true;
        })
        undoList.push(() => el.removeChild(comment));
      } else {
        for (const key of Object.keys(item)) {
          if (item[key] && item[key].subscribe instanceof Function) {
            const obs = item[key];
            delete item[key];
            obs.subscribe(val => {
              el[key] = val;
            })
          }
        }
        deepAssign(el, item)
        //TODO: prop assignment precedence (currently 'most recent')
        //TODO: deep subscribe
        //TODO: unsubscribe / deep unsubscribe
        //TODO: undo
      }
    }
    return undo;
  }
  processArray(args);
  return el;
}

export default pap(_e);