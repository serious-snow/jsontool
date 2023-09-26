import {Swagger} from "@/utils/base/swagger";
import {markdownTable} from "markdown-table";

export const swagger2md = (object) => {
  const swagger = new Swagger(object);

  const actionMap = {}

  swagger.actions.forEach(item => {
    if (!actionMap[item.tag]) {
      actionMap[item.tag] = []
    }
    actionMap[item.tag].push(item)
  })

  const lines = []

  swagger.tags.forEach(item => {
    lines.push(`# ${item.name} ${item.description || ''}
`)
    actionMap[item.name]?.forEach((item, idx) => {
      lines.push(action2md(item, idx + 1
      ))
    })
  })

  return lines.join('\n')


}


const action2md = (action, idx) => {
  return `## ${idx ? idx + ". " : ''}${action.summary || ''}
${action.description ? '> ' + action.description : ''}

\`${action.method} ${action.path}\`

${action.paths.length ?
    `### 请求路径

${requestPathMD(action)}

` : ''}
### 请求参数

${requestArgsMD(action)}

### 请求样例

${requestExampleMD(action)}

### 返回结果
   
${responseArgsMD(action)}

### 返回样例

${responseExampleMD(action)}

`
}

const requestPathMD = (action) => {
  return argsMD(action.paths)
}


const argsMD = (list = [], before = '') => {
  let lines = [];
  lines.push(["名称", "类型", "必填", "说明", "样例"])
  const mdList = list.map(item => [
    item.paths ? item.paths.join(".").replaceAll(".0", "[0]").replaceAll("0.", "[0]") : item.name,
    getItemType(item),
    item.required ? '是' : '否',
    getItemDes(item).replaceAll('\n', '<br/>'),
    getItemExample(item) || ''
  ])
  lines = lines.concat(mdList)
  return before + markdownTable(lines,
    {
      align: 'left',
      alignDelimiters: true
      , stringLength: (v) => {
        const len = v.split("<br/>").reduce((x, y) => x.length > y.length ? x : y).length
        if (len < 4) {
          return 4
        }
        return len
      }
    })
}


function getItemType({format, type, item = {}, enum: enumerate}) {
  switch (type) {
    case 'integer':
      return enumerate ? 'int32' : format
    case 'array':
      return `[${getItemType(item)}]`
  }
  return format ? `${type}(${format})` : type
}

function getItemDes({title, description = ''}) {
  return title ? title : description
}

function getItemExample({default: def, example, type}) {
  if (typeof def !== 'undefined') {
    return def
  }

  if (typeof example === 'undefined') {
    return example
  }

  if (type === "string") {
    return example.toString()
  }

  return example
}

function getItemTypeExample({example, format, type}) {
  if (typeof example === 'object') {
    return JSON.stringify(example)
  }

  switch (type) {
    case "integer":
      return 0
    case "boolean":
      return false
    case "number":
      // switch (format) {
      //   case "double":
      //   case "float":
      //     return 0.0
      //   default:
      return 0
    // }
    default:
      switch (format) {
        case "int64":
          return "0"
        default:
          return "string"
      }

  }
  // return format ? format : type
}


const requestArgsMD = (action) => {
  let before = ""
  let list
  if (action.method === "GET" || action.queries.length) {
    list = action.queries.map(item => action.getBody(item.name, item))
  } else {
    list = action.getBodyList("", action.body.schema)
    const ob = action.getObject(action.body.schema)
    if (ob.externalDocs?.description) {
      before = ` > ${ob.externalDocs?.description}

`;
    }
  }

  return argsMD(list, before)
}

const responseArgsMD = (action) => {
  let lines = [];
  lines.push(["名称", "类型", "说明", "样例"])
  const list = action.getBodyList("", action.response.schema)
  const mdList = list.map(item => [
    item.paths.join(".").replaceAll(".0", "[0]").replaceAll("0.", "[0]."),
    getItemType(item),
    getItemDes(item).replaceAll('\n', '<br/>'),
    getItemExample(item) || ''
  ])

  lines = lines.concat(mdList)
  return markdownTable(lines,
    {
      align: 'left',
      alignDelimiters: true
      , stringLength: (v) => {
        const len = v.split("<br/>").reduce((x, y) => x.length > y.length ? x : y).length
        if (len < 4) {
          return 4
        }
        return len
      }
    })
}

const requestExampleMD = (action) => {

  let str
  if (action.method === "GET" || action.queries.length) {
    str = action.queries.map(item => {
      return `${item.name}=${getItemExample(item) || ''}`
    }).join('&')
  } else {
    str = getJsonExample(action, action.body.schema)
  }
  return `\`\`\` json
${str}
\`\`\`
    `
}

const getJsonExample = (action, ob) => {
  const list = action.getBodyList("", ob)
  const object = action.getObject(ob).type === "array" ? [{}] : {}
  list.forEach((item) => {
    // const path = item.paths.join(".").replaceAll(".[", "[")
    let tempObject = object

    item.paths.forEach((path, idx) => {
      if (idx === item.paths.length - 1) {
        return
      }
      tempObject = tempObject[path]
    })
    const example = getItemExample(item)
    switch (item.type) {
      case "object":
        tempObject[item.paths[item.paths.length - 1]] = {}
        break
      case "array":
        switch (item.item.type) {
          case "object":
            // 递归的
            if (item.paths.length > item.item.paths?.length) {
              tempObject[item.paths[item.paths.length - 1]] = []
            } else {
              tempObject[item.paths[item.paths.length - 1]] = [{}]
            }
            // tempObject[item.paths[item.paths.length - 1]] = [{}]
            break
          default:
            tempObject[item.paths[item.paths.length - 1]] = example || [getItemTypeExample(item.item)]
            break
        }
        // tempObject[item.paths[item.paths.length - 1]] = [undefined]
        break
      default:
        tempObject[item.paths[item.paths.length - 1]] = example || getItemTypeExample(item)
    }
  })

  return JSON.stringify(object, null, "  ")
}

const responseExampleMD = (action) => {
  const str = getJsonExample(action, action.response.schema)
  return `\`\`\` json
${str}
\`\`\`
    `
}
