/*
 * @Author: Jonath
 * @Date: 2020-10-23 10:28:03
 * @LastEditors: Jonath
 * @LastEditTime: 2020-10-23 16:54:12
 * @Description: webpack try catch loader
 */
const { parse } = require("@babel/parser")
const traverse = require("@babel/traverse").default
const t = require("@babel/types")
const core = require("@babel/core")
const loaderUtils = require("loader-utils")

function createTryStatementAndUpdate(
  path,
  statement,
  catchArg = "e",
  catchPaddingStr
) {
  // catch 标识
  const catchIdentifier = t.identifier("e")
  // catch body
  let catchClauseBlockStatement
  if (!catchPaddingStr) {
    catchClauseBlockStatement = [
      t.expressionStatement(
        t.callExpression(
          t.memberExpression(t.identifier("console"), t.identifier("log")),
          [t.stringLiteral("错误"), catchIdentifier]
        )
      )
    ]
  } else {
    catchClauseBlockStatement = parse(catchPaddingStr).program.body
  }
  // catch 子句
  const catchClause = t.catchClause(
    t.identifier(catchArg),
    t.blockStatement(catchClauseBlockStatement)
  )
  // try-catch 语句
  const tryStatement = t.tryStatement(t.blockStatement(statement), catchClause)
  path.node.body = t.blockStatement([tryStatement])
}

// webpack loader normal 默认导出一个函数
module.exports = function(source) {
  const options = {
    argument: "e",
    padding: "",
    ...(loaderUtils.getOptions(this) || {})
  }

  // 解析ast语法树
  const ast = parse(source)

  const cachePath = new Set()
  traverse(ast, {
    AwaitExpression(path) {
      // 如果已经使用了 try-catch 不做处理 直接返回
      if (path.findParent(path => t.isTryStatement(path.node))) return
      const asyncMethodPath = path.findParent(path => {
        return path.node.async
      })
      if (cachePath.has(asyncMethodPath)) return
      cachePath.add(asyncMethodPath)
      asyncMethodPath &&
        createTryStatementAndUpdate(
          asyncMethodPath,
          asyncMethodPath.node.body.body,
          options.argument,
          options.padding
        )
    }
  })
  cachePath.clear()
  // 转换更改后的ast语法树 并返回 转换后的结果
  return core.transformFromAstSync(ast).code
}
