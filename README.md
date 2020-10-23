这个 loader 会自动在 async-await 中包裹 try-catch 语句

### USAGE

```
yarn add async-try-catch-loader --dev
```

webpack loader 配置

```json
{
  "loader": "async-try-catch-loader",
  "options": {
    "argument": "e", // catch 子句 参数名
    "padding": "console.log(e)" // catch body
  }
}
```

### 示例

```javascript
(async () => {
  await genPromise()
  console.log(23322)
  await genPromise()
  console.log(233)
})()
```

转换成

```javascript
(async () => {
  try {
    await genPromise()
    console.log(23322)
    await genPromise()
    console.log(233)
  } catch (e) {
    console.log(e)
  }
})()
```

<hr />

```javascript
const a = {
  methods: async function() {
    await genPromise()
    console.log(233)
  }
}
a.methods()
```

转换成

```javascript
const a = {
  methods: async function() {
    try {
      await genPromise()
      console.log(233)
    } catch (e) {
      console.log(e)
    }
  }
}
a.methods()
```

<hr />

```javascript
const func2 = async () => {
  try {
    await genPromise()
    console.log(233)
  } catch (e) {
    console.log(e)
  }
}
func2()
```

转换成

```javascript
const a = {
  methods: async function() {
    try {
      await genPromise()
      console.log(233)
    } catch (e) {
      console.log(e)
    }
  }
}
a.methods()
```

<hr />

```javascript
async function func() {
  await genPromise()
  console.log(233)
}
func()
```

转换成

```javascript
async function func() {
  try {
    await genPromise()
    console.log(233)
  } catch (e) {
    console.log(e)
  }
}
func()
```
