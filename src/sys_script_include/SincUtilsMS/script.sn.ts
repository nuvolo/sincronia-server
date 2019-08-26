import { SN, Sinc } from "@sincronia/types";

interface fieldMap {
  [fieldName: string]: SN.File;
}

interface ExInProp {
  [table: string]: boolean | fieldMap;
}
interface manifestConfig {
  scopeName: string;
  getContents?: boolean;
  includes: ExInProp;
  excludes: ExInProp;
}

interface buildTableMapConfig {
  tableName: string;
  scopeId: string;
  getContents: boolean;
  includes: ExInProp;
  excludes: ExInProp;
}

interface fileMapConfig {
  tableName: string;
  includes: ExInProp;
  excludes: ExInProp;
}

interface getTablesConfig {
  scopeId: string;
  includes: ExInProp;
  excludes: ExInProp;
}

declare class GlideAggregate {
  constructor(table: string);
  addQuery(field: string, value: string): void;
  groupBy(field: string): void;
  query(): void;
  next(): boolean;
  getValue(field: string): string;
}
export default class SincUtilsMS {
  type: string;
  typeMap: SN.TypeMap;
  constructor() {
    this.type = "SincUtilsMS";
    this.typeMap = {
      css: "css",
      html: "html",
      html_script: "html",
      html_template: "html",
      script: "js",
      script_plain: "js",
      script_server: "js",
      xml: "xml"
    };
  }

  getScopeId(scopeName: string): string {
    let appGR = new GlideRecord("sys_app");
    appGR.get("scope", scopeName);
    return appGR.getValue("sys_id");
  }

  getTableNames(config: getTablesConfig) {
    const { scopeId, includes, excludes } = config;
    let tables: string[] = [];
    let appFilesAgg = new GlideAggregate("sys_metadata");
    appFilesAgg.addQuery("sys_scope", scopeId);
    appFilesAgg.groupBy("sys_class_name");
    appFilesAgg.query();
    while (appFilesAgg.next()) {
      let tableName = appFilesAgg.getValue("sys_class_name");
      let tableExcluded =
        tableName in excludes && typeof excludes[tableName] !== "object" && excludes[tableName] !== false;
      let tableIncluded = tableName in includes && includes[tableName] !== false;
      if (!tableExcluded || tableIncluded) {
        tables.push(tableName);
      }
    }
    return tables;
  }

  getManifest(config: manifestConfig) {
    const { scopeName, getContents = false, includes, excludes } = config;
    const scopeId = this.getScopeId(scopeName);
    let tables: SN.TableMap = {};
    let tableNames = this.getTableNames({ scopeId, includes, excludes });
    for (let i = 0; i < tableNames.length; i++) {
      let tableName = tableNames[i];
      let tableMap = this.buildTableMap({
        tableName,
        scopeId,
        includes,
        excludes,
        getContents
      });
      let records = Object.keys(tableMap.records);
      if (records.length === 0) {
        continue;
      }
      tables[tableName] = tableMap;
    }
    return {
      tables,
      scope: scopeName
    };
  }

  buildTableMap(config: buildTableMapConfig) {
    const { tableName, scopeId, getContents, includes, excludes } = config;
    let results = {
      records: {}
    };
    let fieldListForTable = this.getFileMap({
      tableName,
      includes,
      excludes
    });
    if (Object.keys(fieldListForTable).length === 0) {
      return results;
    }
    let records: SN.TableConfigRecords = {};
    let recGR = new GlideRecord(tableName);
    recGR.addQuery("sys_scope", scopeId);
    recGR.query();
    while (recGR.next()) {
      let files = Object.keys(fieldListForTable).map(key => {
        fieldListForTable[key].content = recGR.getValue(key);
        let file: SN.File = {
          name: fieldListForTable[key].name,
          type: fieldListForTable[key].type
        };
        if (getContents) {
          file.content = recGR.getValue(key);
        }
        return file;
      });

      let recName = (recGR.getDisplayValue() || recGR.getValue("sys_id")).replace(/[\/\\]/g, "〳");
      if (!recName || recName === "") {
        recName = recGR.getValue("sys_id");
      }
      records[recName] = {
        files,
        name: recName,
        sys_id: recGR.getValue("sys_id")
      };
    }
    let tableConfig: SN.TableConfig = {
      records
    };

    return tableConfig;
  }

  getFieldExcludes(config: fileMapConfig) {
    const { tableName, excludes } = config;
    let excludesHasTable = tableName in excludes;
    let hasFieldLevel = () => typeof excludes[tableName] !== "boolean";
    if (excludesHasTable && hasFieldLevel()) {
      return excludes[tableName] as fieldMap;
    }
  }

  getFilteredExcludes(config: fileMapConfig) {
    const { tableName, includes } = config;
    let exFields = this.getFieldExcludes(config);
    if (!exFields) {
      return [];
    }
    let excludedFields = Object.keys(exFields);
    let includesHasTable = tableName in includes;
    if (!includesHasTable) {
      return excludedFields;
    }
    let hasFieldLevel = typeof includes[tableName] !== "boolean";
    if (!hasFieldLevel) {
      return excludedFields;
    }
    let tableIncludes = includes[tableName] as fieldMap;
    return excludedFields.filter(exField => {
      //if a field has been explicitly included we want to make sure it doesn't get filtered out
      let fieldIncluded = exField in tableIncludes;
      let overridden = () => typeof tableIncludes[exField] !== "boolean";
      if (!fieldIncluded) {
        return true;
      }
      if (fieldIncluded && !overridden()) {
        return true;
      }
    });
  }

  getFileMap(config: fileMapConfig) {
    const { tableName, includes, excludes } = config;
    let fieldList: { [fieldName: string]: SN.File } = {};
    let dictGR = new GlideRecord("sys_dictionary");
    dictGR.addQuery("name", tableName);
    //determine excluded fields
    let fieldExcludes = this.getFilteredExcludes(config);
    if (fieldExcludes.length > 0) {
      //ignore any excluded fields
      for (let i = 0; i < fieldExcludes.length; i++) {
        let exField = fieldExcludes[i];
        dictGR.addEncodedQuery(`element!=${exField}`);
      }
    }
    //get fields that fit within the typemap
    let typeQuery = Object.keys(this.typeMap)
      .map(type => "internal_type=" + type)
      .join("^OR");
    dictGR.addEncodedQuery(typeQuery);
    dictGR.query();
    while (dictGR.next()) {
      let field: SN.File = {
        name: dictGR.getValue("element"),
        type: this.typeMap[dictGR.getValue("internal_type")] as SN.FileType
      };
      fieldList[field.name] = field;
    }
    //overrides
    if (tableName in includes) {
      if (typeof includes[tableName] === "object") {
        for (let fieldName in includes[tableName] as fieldMap) {
          let fieldFile: SN.File = {
            name: fieldName,
            type: "txt"
          };
          let fMap = (includes[tableName] as fieldMap)[fieldName];
          if (fMap.type) {
            fieldFile.type = fMap.type;
          }
          fieldList[fieldName] = fieldFile;
        }
      }
    }
    return fieldList;
  }
  processMissingFiles(missingObj: SN.MissingFileTableMap): SN.TableMap {
    let fileTableMap: SN.TableMap = {};
    for (let tableName in missingObj) {
      let tableGR = new GlideRecord(tableName);
      let recordMap = missingObj[tableName];
      let tableMap: SN.TableConfig = {
        records: {}
      };
      for (let recordID in recordMap) {
        if (tableGR.get(recordID)) {
          let metaRecord: SN.MetaRecord = {
            name: tableGR.getDisplayValue(),
            files: [],
            sys_id: tableGR.getValue("sys_id")
          };
          for (let i = 0; i < recordMap[recordID].length; i++) {
            let file = recordMap[recordID][i];
            file.content = tableGR.getValue(file.name);
            metaRecord.files.push(file);
          }
          tableMap.records[tableGR.getDisplayValue()] = metaRecord;
        }
      }
      fileTableMap[tableName] = tableMap;
    }
    return fileTableMap;
  }

  getCurrentScope() {
    let session = gs.getSession();
    if (typeof session !== "string") {
      let scopeID = session.getCurrentApplicationId();
      let appGR = new GlideRecord("sys_app");
      appGR.get(scopeID);
      return {
        scope: appGR.getValue("scope") || "Global",
        sys_id: scopeID
      };
    }
  }

  getAppList(): SN.App[] {
    let results: SN.App[] = [];
    let appGR = new GlideRecord("sys_app");
    appGR.query();
    while (appGR.next()) {
      results.push({
        displayName: appGR.getValue("name"),
        scope: appGR.getValue("scope"),
        sys_id: appGR.getValue("sys_id")
      });
    }
    return results;
  }
}
