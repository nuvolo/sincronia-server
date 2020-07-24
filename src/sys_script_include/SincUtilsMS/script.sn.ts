import { SN, Sinc } from "@sincronia/types";
import {
  fieldMap,
  manifestConfig,
  buildTableMapConfig,
  fileMapConfig,
  getTablesConfig,
  ITableOptions,
  ITableOptionsMap,
  ATFTable,
  AppTable,
  RecordTable,
  DictionaryTable
} from "../../../types";
import {
  GlideAggregate,
  GlideRecord,
  gs,
  GlideSession,
  GlideTableHierarchy
} from "@nuvolo/servicenow-types";

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

  getScopeId(scopeName: string) {
    let appGR = new GlideRecord<AppTable>("sys_app");
    appGR.get("scope", scopeName);
    return appGR.getValue("sys_id");
  }

  getTableNames(config: getTablesConfig) {
    const { scopeId, includes, excludes } = config;
    let tables: string[] = [];
    let appFilesAgg = new GlideAggregate("sys_metadata");
    appFilesAgg.addQuery("sys_scope", "=", scopeId);
    appFilesAgg.groupBy("sys_class_name");
    appFilesAgg.query();
    while (appFilesAgg.next()) {
      let tableName = appFilesAgg.getValue("sys_class_name");
      let tableExcluded =
        tableName in excludes &&
        typeof excludes[tableName] !== "object" &&
        excludes[tableName] !== false;
      let tableIncluded =
        tableName in includes && includes[tableName] !== false;
      if (!tableExcluded || tableIncluded) {
        tables.push(tableName);
      }
    }
    return tables;
  }

  getServerScriptId() {
    let gr = new GlideRecord<RecordTable>("sys_atf_step_config");
    gr.addQuery("name", "Run Server Side Script");
    gr.query();
    gr.next();
    return gr.getValue("sys_id");
  }

  getATFmanifest(scopeName: string) {
    let scopeId = this.getScopeId(scopeName);
    let scriptId = this.getServerScriptId();
    let gr = new GlideRecord<ATFTable>("sys_atf_step");
    gr.addQuery("sys_scope", scopeId);
    gr.addQuery("step_config", scriptId);
    gr.query();
    let records: SN.TableConfigRecords = {};
    while (gr.next()) {
      let id = gr.getValue("sys_id") || "";
      let script = gr.inputs.script;
      script = script ? script.toString() : "";
      records[id] = {
        files: [
          {
            name: "inputs.script",
            type: "js",
            content: script
          }
        ],
        name: id,
        sys_id: id
      };
    }
    return { records: records };
  }

  getManifest(config: manifestConfig) {
    const {
      scopeName,
      getContents = false,
      includes,
      excludes,
      tableOptions = {}
    } = config;
    const scopeId = this.getScopeId(scopeName) || "";
    let tables: SN.TableMap = {};
    let tableNames = this.getTableNames({ scopeId, includes, excludes });
    for (let i = 0; i < tableNames.length; i++) {
      let tableName = tableNames[i];
      let tableMap = this.buildTableMap({
        tableName,
        scopeId,
        includes,
        excludes,
        getContents,
        tableOptions: tableOptions[tableName] || {}
      });
      let records = Object.keys(tableMap.records);
      if (records.length === 0) {
        continue;
      }
      tables[tableName] = tableMap;
    }
    tables["sys_atf_step"] = this.getATFmanifest(scopeName);
    return {
      tables,
      scope: scopeName
    };
  }

  buildTableMap(config: buildTableMapConfig) {
    const {
      tableName,
      scopeId,
      getContents,
      includes,
      excludes,
      tableOptions
    } = config;
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
    let recGR = new GlideRecord<RecordTable>(tableName);
    recGR.addQuery("sys_scope", scopeId);
    recGR.addQuery("sys_class_name", tableName);
    if (tableOptions.query !== undefined) {
      recGR.addEncodedQuery(tableOptions.query);
    }
    recGR.query();
    while (recGR.next()) {
      let files = Object.keys(fieldListForTable).map((key) => {
        fieldListForTable[key].content = recGR.getValue(key) || undefined;
        let file: SN.File = {
          name: fieldListForTable[key].name,
          type: fieldListForTable[key].type
        };
        if (getContents) {
          file.content = recGR.getValue(key) || undefined;
        }
        return file;
      });

      let recName = this.generateRecordName(recGR, tableOptions);
      records[recName] = {
        files,
        name: recName,
        sys_id: recGR.getValue("sys_id") || ""
      };
    }
    let tableConfig: SN.TableConfig = {
      records
    };

    return tableConfig;
  }

  generateRecordName(
    recGR: GlideRecord<RecordTable>,
    tableOptions: ITableOptions
  ) {
    let recordName = recGR.getDisplayValue() || recGR.getValue("sys_id");
    if (tableOptions.displayField !== undefined) {
      recordName = recGR
        .getElement(tableOptions.displayField)
        .getDisplayValue();
    }
    if (tableOptions.differentiatorField !== undefined) {
      if (typeof tableOptions.differentiatorField === "string") {
        recordName = `${recordName} (${recGR
          .getElement(tableOptions.differentiatorField)
          .getDisplayValue()})`;
      }
      if (typeof tableOptions.differentiatorField === "object") {
        let diffArr = tableOptions.differentiatorField;
        for (let i = 0; i < diffArr.length; i++) {
          let field = diffArr[i];
          let val = recGR.getElement(field).getDisplayValue();
          if (val !== undefined && val !== "") {
            recordName = `${recordName} (${field}:${val})`;
            break;
          }
        }
      }
    }
    if (!recordName || recordName === "") {
      recordName = recGR.getValue("sys_id") || "";
    }
    return recordName.replace(/[\/\\]/g, "〳");
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
    return excludedFields.filter((exField) => {
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
    let dictGR = new GlideRecord<DictionaryTable>("sys_dictionary");
    const tableHierarchy = new GlideTableHierarchy(tableName);
    if (tableHierarchy.isBaseClass() || tableHierarchy.isSoloClass()) {
      dictGR.addQuery("name", tableName);
    } else {
      const tableList: string[] = tableHierarchy.getTables();
      const tableEQ = tableList.map((table) => "name=" + table).join("^OR");
      dictGR.addEncodedQuery(tableEQ);
    }
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
      .map((type) => "internal_type=" + type)
      .join("^OR");
    dictGR.addEncodedQuery(typeQuery);
    dictGR.query();
    while (dictGR.next()) {
      let field: SN.File = {
        name: dictGR.getValue("element") || "",
        type: this.typeMap[
          dictGR.getValue("internal_type") || ""
        ] as SN.FileType
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
  processMissingFiles(
    missingObj: SN.MissingFileTableMap,
    tableOptions: ITableOptionsMap
  ): SN.TableMap {
    let fileTableMap: SN.TableMap = {};
    for (let tableName in missingObj) {
      gs.info(tableName);
      let tableGR = new GlideRecord<RecordTable>(tableName);
      let recordMap = missingObj[tableName];
      let tableOpts = tableOptions[tableName] || {};
      if (tableName === "sys_atf_step") {
        tableOpts = {
          displayField: "sys_id"
        };
      }
      let tableMap: SN.TableConfig = {
        records: {}
      };
      for (let recordID in recordMap) {
        if (tableGR.get(recordID)) {
          let metaRecord: SN.MetaRecord = {
            name: this.generateRecordName(tableGR, tableOpts),
            files: [],
            sys_id: tableGR.getValue("sys_id") || ""
          };
          for (let i = 0; i < recordMap[recordID].length; i++) {
            let file = recordMap[recordID][i];
            if (tableName === "sys_atf_step") {
              let script = tableGR.inputs.script;
              file.content = script ? script.toString() : "";
            } else {
              file.content = tableGR.getValue(file.name) || "";
            }
            metaRecord.files.push(file);
          }
          tableMap.records[
            this.generateRecordName(tableGR, tableOpts)
          ] = metaRecord;
        }
      }
      fileTableMap[tableName] = tableMap;
    }
    return fileTableMap;
  }

  getCurrentScope() {
    let session = (gs.getSession() as unknown) as GlideSession;
    if (typeof session !== "string") {
      let scopeID = session.getCurrentApplicationId();
      let appGR = new GlideRecord<AppTable>("sys_app");
      appGR.get(scopeID);
      return {
        scope: appGR.getValue("scope") || "Global",
        sys_id: scopeID
      };
    }
  }

  getAppList(): SN.App[] {
    let results: SN.App[] = [];
    let appGR = new GlideRecord<AppTable>("sys_app");
    appGR.query();
    while (appGR.next()) {
      results.push({
        displayName: appGR.getValue("name") || "",
        scope: appGR.getValue("scope") || "",
        sys_id: appGR.getValue("sys_id") || ""
      });
    }
    return results;
  }

  pushATFfile(sys_id: string, script: string) {
    let gr = new GlideRecord<ATFTable>("sys_atf_step");
    gr.get(sys_id);
    gr.inputs.script = script;
    if (gr.update() != null) return true;
    return false;
  }
}
