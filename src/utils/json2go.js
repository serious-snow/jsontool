import {getTarget, object, TYPE} from "@/utils/base/object";
import {toCamel} from "@/utils/util";

const TYPEMap = {}

TYPEMap[TYPE.Struct] = "struct"
TYPEMap[TYPE.Object] = "interface{}"
TYPEMap[TYPE.String] = "string"
TYPEMap[TYPE.Bool] = "bool"
TYPEMap[TYPE.Int] = "int64"
TYPEMap[TYPE.Float] = "float64"
TYPEMap[TYPE.Slice] = "[]"


export const json2go = (object, option = {}) => {
  return getJson(getTarget("", object, -1), option)
}

const getFieldName = (ob = {}, option = {}) => {
  const result = []
  switch (ob.type) {
    case TYPE.Struct:
      ob.key ? result.push(`struct {`) : result.push(`type AutoGenerated struct {`)
      Object.keys(ob.kv).forEach(key => {
        result.push(getJson(ob.kv[key], option))
      })
      result.push(`${ob.getPrefix()}}`)
      return result.join('\n')
    case TYPE.Slice:
      return `${ob.key ? "[]" : "type AutoGenerated []"}${ob.item ? getFieldName(ob.item, option) : getFieldName(new object(), option)}`
    case TYPE.Object:
    case TYPE.String:
    case TYPE.Bool:
    case TYPE.Int:
    case TYPE.Float:
    default:
      return `${option?.autoPointer && ob.isPointer() ? "*" : ''}${TYPEMap[ob.type]}`
  }
}
const getJson = (ob, option) => {
  const beforeComment = ob.getBeforeComment()
  const afterComment = ob.getAfterComment()

  const prefix = ob.getPrefix(ob.level)

  const jsonTag = getJsonTag(ob, option)
  const fieldName = getFieldName(ob, option)
  const result = []

  beforeComment && result.push(`${prefix}${beforeComment}`)
  result.push(`${prefix}${toCamel(ob.key)} ${fieldName} ${jsonTag} ${afterComment}`)

  return result.join('\n')
}


const getJsonTag = (ob, {omitempty} = {}) => {
  if (ob.key.length === 0) {
    return ""
  }

  if (typeof omitempty === 'undefined') {
    omitempty = ob.omitempty
  }
  return `\`json:"${ob.key}${omitempty ? ',omitempty' : ''}"\``
}
