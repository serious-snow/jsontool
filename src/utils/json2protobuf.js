import {getTarget, struct, TYPE} from "@/utils/base/object";
import {toCamel, toSnake} from "@/utils/util";


const TYPEMap = {}

TYPEMap[TYPE.Struct] = "message"
TYPEMap[TYPE.Object] = "message{}"
TYPEMap[TYPE.String] = "string"
TYPEMap[TYPE.Bool] = "bool"
TYPEMap[TYPE.Int] = "int64"
TYPEMap[TYPE.Float] = "double"
TYPEMap[TYPE.Slice] = "repeated"

export const json2protobuf = (object, option) => {
  return getProtobuf(getTarget("", object, -1), 1, option)
}

const genMessage = (ob = {}, messageName, option) => {
  if (ob.type !== TYPE.Struct) {
    return ""
  }
  const result = []
  result.push(`message ${messageName}{`)
  Object.keys(ob.kv).forEach((key, idx) => {
    result.push(getProtobuf(ob.kv[key], idx + 1, option))
  })
  result.push(`${ob.getPrefix()}}`)
  return result.join('\n')
}
const getProtobuf = (ob, index, option) => {
  const beforeComment = option.withComment ? ob.getBeforeComment() : ''
  const afterComment = option.withComment ? ob.getAfterComment() : ''


  const prefix = ob.getPrefix(ob.level)
  const result = []
  beforeComment && result.push(`${prefix}${beforeComment}`)

  let fieldName = ""
  let swaggerExample = ""
  switch (ob.type) {
    case TYPE.Slice:
      var item = ob.item ? ob.item : new struct("", {}, ob.level + 1)
      if (item.isStruct()) {
        const messageName = getMessageName(ob.key)
        result.push(ob.getPrefix() + genMessage(item, messageName, option))
        fieldName = `repeated ${messageName}`
      } else {
        fieldName = `repeated ${TYPEMap[item.type]}`
      }
      break
    case TYPE.Struct:
      result.push(ob.getPrefix() + genMessage(ob, getMessageName(ob.key), option))
      fieldName = `${TYPEMap[ob.type]}`
      break
    case TYPE.Object:
    case TYPE.String:
    case TYPE.Bool:
    case TYPE.Int:
    case TYPE.Float:
    default:

      fieldName = `${ob.isPointer() ? "optional" : ''} ${TYPEMap[ob.type]}`
      if (option?.isShowExample) {
        var example = ob.type === TYPE.String ? `\\"${ob.value}\\"` : ob.value
        swaggerExample = ` [(grpc.gateway.protoc_gen_openapiv2.options.openapiv2_field) = {example: "${example}"}]`
      }

  }

  (ob.key || ob.type !== TYPE.Struct) && result.push(`${prefix}${fieldName} ${toSnake(getMessageName(ob.key))} = ${index}${swaggerExample}; ${afterComment}`)

  return result.join('\n')

}

const getMessageName = (key) => {
  return key ? toCamel(key) : "AutoGenerated"
}
