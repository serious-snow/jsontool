import {getComment, getType} from "@/utils/util";

export const TYPE = {
  Object: 0,
  Int: 1,
  Float: 2,
  String: 3,
  Bool: 4,
  Slice: 5,
  Null: 6,
  Struct: 7,
}

export class object {
  key = ""
  value = null
  type = TYPE.Object
  omitempty = false
  level = 0
  _null = false
  baseClass = true

  // {
  //   before: [{
  //     type: "BlockComment",
  //     value: "111"
  //   }]
  //   ,
  //   after: [{
  //     type: "BlockComment",
  //     value: "111"
  //   }]
  // }
  comment = {}

  constructor(key, value, level = 0, comment = {}, isNull = false, omitempty = false) {
    this.key = key
    this.value = value
    this.level = level
    this._null = isNull
    this.omitempty = omitempty
    this.comment = comment
  }


  getBeforeComment() {
    return this._getComment(this.comment.before)
  }

  getAfterComment() {
    return this._getComment(this.comment.after)
  }

  _getComment(comments = []) {
    return comments.filter(item => !!item.value).map(item => {
      if (item.type === "BlockComment") {
        return `/*${item.value}*/`
      }
      if (item.type === "LineComment") {
        return `// ${item.value.trim()}`
      }
    }).join("\n")
  }


  is(target) {
    return this.type === target.type
  }

  isNumber() {
    return this.isInt() || this.isFloat()
  }

  getPrefix(level = this.level) {
    return '    '.repeat(level)
  }

  combine(target) {
    this._null = target._null = this.isNull() || target.isNull()
    this.omitempty = target.omitempty = this.omitempty || target.omitempty
    return target
  }

  toObject() {
    return new object(this.key, this.value, this.level, this._null, this.omitempty, this.comment)
  }

  toFloat() {
    return new float(this.key, this.value, this.level, this._null, this.omitempty, this.comment)
  }

  isPointer() {
    return this.isNull() && !this.isObject() && !this.isSlice()
  }

  typeEqual(targetType) {
    return this.type === targetType
  }

  isObject() {
    return this.type === TYPE.Object
  }

  isInt() {
    return this.type === TYPE.Int
  }

  isFloat() {
    return this.type === TYPE.Float
  }

  isString() {
    return this.type === TYPE.String
  }

  isBool() {
    return this.type === TYPE.Bool
  }

  isSlice() {
    return this.type === TYPE.Slice
  }

  isNull() {
    return this._null
  }

  isStruct() {
    return this.type === TYPE.Struct
  }
}

export class string extends object {
  type = TYPE.String
  baseClass = false
  mayInt64 = false

  constructor() {
    super(...arguments);
    this.mayInt64 = /^-?\d{1,19}$/.test(this.value)
  }

  is(target) {
    return this.typeEqual(target.type)
  }

  combine(target) {
    super.combine(target)
    if (!this.is(target)) {
      return this.toObject()
    }
    this.mayInt64 = target.mayInt64 = this.mayInt64 && target.mayInt64
    return this
  }

}

export class float extends object {
  type = TYPE.Float
  bit = 32
  baseClass = false

  constructor() {
    super(...arguments);
  }

  is(target) {
    return this.bit === target.bit && super.is(target)
  }

  combine(target) {
    super.combine(target)
    if (this.is(target)) {
      return this
    }
    if (target.baseClass) {
      return this
    }

    if (target.isFloat()) {
      return this
    }

    if (target.isInt()) {
      return target.toFloat()
    }

    if (target.isNull()) {
      return this
    }

    return this.toObject()
  }
}

export class int extends object {
  type = TYPE.Int
  bit = 32
  baseClass = false

  constructor() {
    super(...arguments);
  }

  is(target) {
    return this.bit === target.bit && super.is(target)
  }

  combine(target) {
    super.combine(target)
    if (this.is(target)) {
      return this
    }
    if (target.baseClass) {
      return this
    }

    if (target.isFloat()) {
      return this.toFloat()
    }

    if (target.isNull()) {
      return this
    }

    return this.toObject()
  }
}

export class slice extends object {
  type = TYPE.Slice
  item = null
  baseClass = false

  constructor(key, value) {
    super(...arguments);
    for (let i = 0; i < value.length; i++) {
      const target = getTarget(i.toString(), value[i], this.level)
      if (this.item) {
        this.item = this.item.combine(target)
      } else {
        this.item = target
      }
    }
  }
}

export class bool extends object {
  type = TYPE.Bool
  baseClass = false

  constructor() {
    super(...arguments);
  }

  combine(target) {
    super.combine(target)
    if (this.is(target)) {
      return this
    }

    if (target.baseClass) {
      return this
    }

    if (target.isNull()) {
      return this
    }

    return this.toObject()
  }

}

export class struct extends object {
  type = TYPE.Struct
  kv = {}
  baseClass = false

  constructor(key1, value = {}) {
    super(...arguments);
    Object.keys(value).forEach(key => {
      const target = getTarget(key, value[key], this.level, getComment(key, value))
      if (this.kv[key]) {
        this.kv[key] = this.kv[key].combine(target)
      } else {
        this.kv[key] = target
      }
    })
  }


  combine(target) {
    super.combine(target)
    if (target.baseClass) {
      return this
    }
    //都是结构体
    if (this.is(target)) {
      Object.keys(target.kv).forEach(key => {
        const v = target.kv[key]
        if (Object.prototype.hasOwnProperty.call(this.kv,key)) {
          this.kv[key] = this.kv[key].combine(v)
        } else {
          this.kv[key] = v
          this.kv[key].omitempty = true
        }
      })
      Object.keys(this.kv).forEach(key => {
        if (!Object.prototype.hasOwnProperty.call(target.kv,key)) {
          this.kv[key].omitempty = true
        }
      })
      return this
    }

    return this.toObject()
  }
}


export const getTarget = (key, value, level, comment) => {
  // comment = comment || getComment(key, value)
  switch (getType(value)) {
    case "Undefined":
    /* falls through */
    case "undefined":
      return new object(key, value, level + 1, comment, undefined, true)
    case "Number":
      if (Number.isInteger(value.valueOf())) {
        return new int(key, value, level + 1, comment)
      }
      return new float(key, value, level + 1, comment)
    case "number":
      if (Number.isInteger(value)) {
        return new int(key, value, level + 1, comment)
      }
      return new float(key, value, level + 1, comment)
    case "Boolean":
    /* falls through */
    case "boolean":
      return new bool(key, value, level + 1, comment)
    case "String":
    /* falls through */
    case "string":
      return new string(key, value, level + 1, comment)
    case "Array":
      return new slice(key, value, level + 1, comment)
    case "Null":
      return new object(key, value, level + 1, comment, true)
    case "Object":
    /* falls through */
    case "object":
      if (Array.isArray(value)) {
        return new slice(key, value, level + 1, comment)
      }
      if (value === null) {
        return new object(key, value, level + 1, comment, true)
      }
      return new struct(key, value, level + 1, comment)
  }
  return new object(key, value, level + 1, comment)
}
