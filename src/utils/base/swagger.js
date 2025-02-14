// eslint-disable-next-line no-unused-vars
export class Swagger {
  source = {}; //原来的数据
  tags = [];
  tagMap = {};
  actions = [];
  definitions = [];

  constructor(source) {
    this.source = source;
    this.tags = source.tags || [];
    this.definitions = source.definitions;

    this.tags.forEach((item) => {
      this.tagMap[item.name] = item;
    });

    for (const path in source.paths) {
      for (const method in source.paths[path]) {
        const action = new Action(
          path,
          method,
          source.definitions,
          source.paths[path][method]
        );
        this.actions.push(action);

        if (!this.tagMap[action.tag]) {
          this.tagMap[action.tag] = { name: action.tag };
          this.tags.push({ name: action.tag });
        }
      }
    }
  }
}

// eslint-disable-next-line no-unused-vars
class Action {
  summary = ""; //标题
  description = "";
  tag = ""; //分组
  path = ""; //路径
  method = ""; //方法
  queries = [];
  paths = [];
  body = {};
  // parameters //参数
  responses = {}; //回复
  response = {};

  defines = {};

  constructor(
    path,
    method,
    defines,
    { parameters = [], summary, description, responses = {}, tags }
  ) {
    this.summary = summary;
    this.description = description;
    this.tag = tags[0];
    this.path = path;
    this.method = method.toUpperCase();
    this.defines = defines;
    parameters.forEach((item) => {
      switch (item.in) {
        case "query":
          this.queries.push(item);
          break;
        case "path":
          this.paths.push(item);
          break;
        case "body":
          this.body = item;
          break;
      }
    });
    this.responses = responses;
    this.response = responses["200"] || {};
    // console.log(method,this.response.schema)
    // console.log(this.responseExampleMD())
  }

  getDefine(item) {
    return this.defines[item.replace("#/definitions/", "")];
  }

  getBodyList(key, ob = {}) {
    const list = [];
    this.getBody(key, ob, [], function (item) {
      list.push(item);
    });

    list.splice(0, 1);
    return list;
  }

  getObject(ob = {}) {
    if (ob["$ref"]) {
      return this.getDefine(ob["$ref"]);
    }
    return ob;
  }

  getBody(
    key,
    fromOb = {},
    paths = [],
    callback = () => {},
    cache = new WeakMap()
  ) {
    const ob = this.getObject(fromOb);

    if (cache.has(ob)) {
      return {
        ...cache.get(ob),
        title: fromOb.title || ob.title,
      };
    }

    const newPaths = key ? paths.concat(key) : paths;
    const newOb = {
      ...ob,
      paths: newPaths,
      title: fromOb.title || ob.title,
    };

    if (["object"].includes(ob.type)) {
      cache.set(ob, newOb);
    }

    if (key !== "0") {
      callback && callback(newOb);
    }

    switch (ob.type) {
      case "object":
        newOb.property = {};
        for (const listKey in ob.properties) {
          newOb.property[listKey] = this.getBody(
            listKey,
            ob.properties[listKey],
            newPaths,
            callback,
            cache
          );

          if (newOb.required) {
            newOb.property[listKey].required =
              newOb.property[listKey].required ??
              newOb.required?.includes(listKey);
          }
        }
        break;
      case "array":
        newOb.item = this.getBody("0", ob.items, newPaths, callback, cache);
        newOb.item.required = ob.required;
        break;
    }
    cache.delete(ob);
    return newOb;
  }
}
