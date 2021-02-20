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
  // creating the dom node using the `element.type`
  // if `element.type` is `TEXT_ELEMENT`, create a text node instead of a regular node
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ?
      document.createTextNode("")
      :
      document.createElement(fiber.type)

  // 为节点分配除了 children 的 props 属性
  const isProperty = key => key !== "children"
  Object.keys(fiber.props).filter(isProperty).forEach(name => {
    dom[name] = fiber.props[name]
  })

  return dom
}

function render(element, container) {
  // TODO set next unit of work
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element]
    }
  }
}

let nextUnitOfWork = null;

function workLoop(deadLine) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadLine.timeRemaining() < 1
  }
  // make a loop, 主线程空闲时 run the callback
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

// 执行工作，返回下一个工作单元
function performUnitOfWork(nextUnitOfWork) {
  // TODO add dom node
  // TODO create new fibers
  // TODO return next unit
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