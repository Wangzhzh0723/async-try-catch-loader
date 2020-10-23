/*
 * @Author: Jonath
 * @Date: 2020-10-23 10:28:03
 * @LastEditors: Jonath
 * @LastEditTime: 2020-10-23 15:05:36
 * @Description: webpack try catch loader
 */
const { parse } = require("@babel/parser")
const traverse = require("@babel/traverse").default
const t = require("@babel/types")
const core = require("@babel/core")

function createTryStatementAndUpdate(path, statement) {
  // catch 标识
  const catchIdentifier = t.identifier("e")
  // catch body
  const catchClauseBlockStatement = [
    t.expressionStatement(
      t.callExpression(
        t.memberExpression(t.identifier("console"), t.identifier("log")),
        [t.stringLiteral("错误"), catchIdentifier]
      )
    )
  ]
  // catch 子句
  const catchClause = t.catchClause(
    catchIdentifier,
    t.blockStatement(catchClauseBlockStatement)
  )
  // try-catch 语句
  const tryStatement = t.tryStatement(t.blockStatement(statement), catchClause)
  path.replaceWithMultiple([tryStatement])
}

// webpack loader normal 默认导出一个函数
module.exports = function(source) {
  // 解析ast语法树
  const ast = parse(source)
  traverse(ast, {
    AwaitExpression(path) {
      // 如果已经使用了try-catch 不做处理 直接返回
      if (path.findParent(path => t.isTryStatement(path.node))) return
      const parent = path.parent
      if (t.isVariableDeclarator(parent)) {
        // 变量声明 let res = await promise()
        const variableDeclarationPath = path.parentPath.parentPath
        return createTryStatementAndUpdate(variableDeclarationPath, [
          variableDeclarationPath.node
        ])
      }
      if (t.isAssignmentExpression(parent)) {
        // 赋值表达式  res = await promise()
        const expressionStatementPath = path.parentPath.parentPath
        return createTryStatementAndUpdate(expressionStatementPath, [
          expressionStatementPath.node
        ])
      }
      // 单纯的表达式  await promise()
      createTryStatementAndUpdate(path, [t.expressionStatement(path.node)])
    }
  })
  // 转换更改后的ast语法树 并返回 转换后的结果
  return core.transformFromAstSync(ast).code
}
