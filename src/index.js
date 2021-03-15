// ...children: ...rest参数语法，保证 children 始终是一个数组
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      // 对象扩展
      ...props,
      // 将 children 中的字符等基本值类型的成员 转化为对象形式
      children: children.map(child => {
        return typeof child === "object"
          ?
          child
          :
          createTextElement(child)
      })
    }
  }
}

// 将不是对象的内容封装到它自己的元素，创建一个特殊类型 TEXT_element
function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  }
}



function createDom(fiber) {
  const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(fiber.type)

  const isProperty = key => key !== "children"

  Object.keys(fiber.props).filter(isProperty).forEach(name => {
    dom[name] = fiber.props[name]
  })

  return dom
}

function commitRoot() {
  // TODO add nodes to dom
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
}

function commitWork(fiber) {
  if (!fiber) {
    return
  }
  const domParent = fiber.parent.dom
  domParent.appendChild(fiber.dom)
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element]
    },
    alternate: currentRoot
  }
  nextUnitOfWork = wipRoot
}



// next unit of work
let nextUnitOfWork = null;
let currentRoot = null;
let wipRoot = null

function workLoop(deadLine) {
  // should browser interrupt the rendering ?
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {

    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    )
    // check how much time until browser take control again
    shouldYield = deadLine.timeRemaining() < 1
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
  }

  requestIdleCallback(workLoop)
}

// make a loop to run { workLoop }, browser will run the callback when the main thread is idle
requestIdleCallback(workLoop)

// perform the work and return the next unit of work
function performUnitOfWork(fiber) {
  // add dom node
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }


  const elements = fiber.props.children
  // create new fibers for the element's children
  reconcileChildren(fiber, elements)

  // TODO return next unit of work
  if (fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}

// reconcile the old fibers with the new elements
function reconcileChildren(wipFiber, elements) {
  // create new fibers for the element's children
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child
  let prevSibling = null;

  while (index < elements.lenght || oldFiber != null) {
    const element = elements[index]
    let newFiber = null

    // TODO compare oldFiber to element
    const sameType = oldFiber && element && element.type === oldFiber.type

    if (sameType) {
      // TODO update the node
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE'
      }
    }

    if (element && !sameType) {
      // TODO add this node
    }

    if (oldFiber && !sameType) {
      // TODO delete the oldFiber's node
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++

  }
}


const Chen = {
  createElement,
  render
}

// 如果我们有一个类似这样的注释，当 babel 发送 JSX 时，它将使用我们定义的函数。
/** @jsx Chen.createElement */
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
)

const container = document.getElementById("root")
Chen.render(element, container)