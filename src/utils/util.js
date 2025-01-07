const EnglishNumbers = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
export const toCamel = (str,idx = 0) => {
  if (typeof str != "string") {
    return String(str)
  }
  if (!str) {
    return ''
  }

  if (str.includes('_')) {
    return str.split('_').map((item,idx) => toCamel(item, idx)).join('')
  }

  if (str[0] >= 'a' && str[0] <= 'z') {
    return str[0].toUpperCase() + str.substring(1)
  }

  //320->Three20
  if (idx === 0 && str[0] >= '0' && str[0] <= '9') {
    return EnglishNumbers[str[0] - '0'] + str.substring(1)
  }
  return str
}

export const toSnake = (str) => {
  let result = []
  for (let i = 0; i < str.length; i++) {
    if (str.charAt(i) >= 'A' && str.charAt(i) <= 'Z') {
      result.length !== 0 && result.push("_")
      result.push(str[i].toLowerCase())
    } else {
      result.push(str[i])
    }
  }
  //320->three20
  if (str[0] && str[0] >= '0' && str[0] <= '9') {
    return EnglishNumbers[str[0] - '0'].toLowerCase() + str.substring(1)
  }
  return result.join('')
}

export const getType = (obj) => {
  const type = typeof obj;

  if (type !== 'object') {
    return type;
  }
  //如果不是object类型的数据，直接用typeof就能判断出来

  //如果是object类型数据，准确判断类型必须使用Object.prototype.toString.call(obj)的方式才能判断
  return Object.prototype.toString.call(obj).replace(/^\[object (\S+)\]$/, '$1');
}

export const getComment = (key, value) => {
  const _comment = {}
  if (typeof value != "object") {
    return _comment
  }
  let _symbol_before, _symbol_after
  if (key.length === 0) {
    _symbol_before = Symbol.for(`before-all`)
    _symbol_after = Symbol.for(`after-all`)
  } else {
    _symbol_before = Symbol.for(`before:${key}`)
    _symbol_after = Symbol.for(`after:${key}`)
  }
  if (value[_symbol_before]) {
    _comment.before = value[_symbol_before]
  }
  if (value[_symbol_after]) {
    _comment.after = value[_symbol_after]
  }
  return _comment
}
