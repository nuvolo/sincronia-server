"use strict";

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj &&
        typeof Symbol === "function" &&
        obj.constructor === Symbol &&
        obj !== Symbol.prototype
        ? "symbol"
        : typeof obj;
    };
  }
  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

var CICDUtilsMS =
  /*#__PURE__*/
  (function() {
    function CICDUtilsMS() {
      _classCallCheck(this, CICDUtilsMS);

      _defineProperty(this, "type", void 0);

      _defineProperty(this, "typeMap", void 0);

      this.type = "CICDUtilsMS";
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
      this.initialize();
    }

    _createClass(CICDUtilsMS, [
      {
        key: "initialize",
        value: function initialize() {
          this.type = "CICDUtilsMS";
        }
      },
      {
        key: "getScopeId",
        value: function getScopeId(scopeName) {
          var appGR = new GlideRecord("sys_app");
          appGR.get("scope", scopeName);
          return appGR.getValue("sys_id");
        }
      },
      {
        key: "getTableNames",
        value: function getTableNames(config) {
          var scopeId = config.scopeId,
            includes = config.includes,
            excludes = config.excludes;
          var tables = [];
          var appFilesAgg = new GlideAggregate("sys_metadata");
          appFilesAgg.addQuery("sys_scope", scopeId);
          appFilesAgg.groupBy("sys_class_name");
          appFilesAgg.query();

          while (appFilesAgg.next()) {
            var tableName = appFilesAgg.getValue("sys_class_name");
            var tableExcluded =
              tableName in excludes &&
              _typeof(excludes[tableName]) !== "object" &&
              excludes[tableName] !== false;
            var tableIncluded =
              tableName in includes && includes[tableName] !== false;

            if (!tableExcluded || tableIncluded) {
              tables.push(tableName);
            }
          }

          return tables;
        }
      },
      {
        key: "getManifest",
        value: function getManifest(config) {
          var scopeName = config.scopeName,
            _config$getContents = config.getContents,
            getContents =
              _config$getContents === void 0 ? false : _config$getContents,
            includes = config.includes,
            excludes = config.excludes;
          var scopeId = this.getScopeId(scopeName);
          var tables = {};
          var tableNames = this.getTableNames({
            scopeId: scopeId,
            includes: includes,
            excludes: excludes
          });

          for (var i = 0; i < tableNames.length; i++) {
            var tableName = tableNames[i];
            var tableMap = this.buildTableMap({
              tableName: tableName,
              scopeId: scopeId,
              includes: includes,
              excludes: excludes,
              getContents: getContents
            });
            var records = Object.keys(tableMap.records);

            if (records.length === 0) {
              continue;
            }

            tables[tableName] = tableMap;
          }

          return {
            tables: tables,
            scope: scopeName
          };
        }
      },
      {
        key: "buildTableMap",
        value: function buildTableMap(config) {
          var tableName = config.tableName,
            scopeId = config.scopeId,
            getContents = config.getContents,
            includes = config.includes,
            excludes = config.excludes;
          var results = {
            records: {}
          };
          var fieldListForTable = this.getFileMap({
            tableName: tableName,
            includes: includes,
            excludes: excludes
          });

          if (Object.keys(fieldListForTable).length === 0) {
            return results;
          }

          var records = {};
          var recGR = new GlideRecord(tableName);
          recGR.addQuery("sys_scope", scopeId);
          recGR.query();

          while (recGR.next()) {
            var files = Object.keys(fieldListForTable).map(function(key) {
              fieldListForTable[key].content = recGR.getValue(key);
              var file = {
                name: fieldListForTable[key].name,
                type: fieldListForTable[key].type
              };

              if (getContents) {
                file.content = recGR.getValue(key);
              }

              return file;
            });
            var recName = (
              recGR.getDisplayValue() || recGR.getValue("sys_id")
            ).replace(/[\/\\]/g, "〳");

            if (!recName || recName === "") {
              recName = recGR.getValue("sys_id");
            }

            records[recName] = {
              files: files,
              name: recName,
              sys_id: recGR.getValue("sys_id")
            };
          }

          var tableConfig = {
            records: records
          };
          return tableConfig;
        }
      },
      {
        key: "getFieldExcludes",
        value: function getFieldExcludes(config) {
          var tableName = config.tableName,
            excludes = config.excludes;
          var excludesHasTable = tableName in excludes;

          var hasFieldLevel = function hasFieldLevel() {
            return typeof excludes[tableName] !== "boolean";
          };

          if (excludesHasTable && hasFieldLevel()) {
            return excludes[tableName];
          }
        }
      },
      {
        key: "getFilteredExcludes",
        value: function getFilteredExcludes(config) {
          var tableName = config.tableName,
            includes = config.includes;
          var exFields = this.getFieldExcludes(config);

          if (!exFields) {
            return [];
          }

          var excludedFields = Object.keys(exFields);
          var includesHasTable = tableName in includes;

          if (!includesHasTable) {
            return excludedFields;
          }

          var hasFieldLevel = typeof includes[tableName] !== "boolean";

          if (!hasFieldLevel) {
            return excludedFields;
          }

          var tableIncludes = includes[tableName];
          return excludedFields.filter(function(exField) {
            //if a field has been explicitly included we want to make sure it doesn't get filtered out
            var fieldIncluded = exField in tableIncludes;

            var overridden = function overridden() {
              return typeof tableIncludes[exField] !== "boolean";
            };

            if (!fieldIncluded) {
              return true;
            }

            if (fieldIncluded && !overridden()) {
              return true;
            }
          });
        }
      },
      {
        key: "getFileMap",
        value: function getFileMap(config) {
          var tableName = config.tableName,
            includes = config.includes,
            excludes = config.excludes;
          var fieldList = {};
          var dictGR = new GlideRecord("sys_dictionary");
          dictGR.addQuery("name", tableName); //determine excluded fields

          var fieldExcludes = this.getFilteredExcludes(config);

          if (fieldExcludes.length > 0) {
            //ignore any excluded fields
            for (var i = 0; i < fieldExcludes.length; i++) {
              var exField = fieldExcludes[i];
              dictGR.addEncodedQuery("element!=".concat(exField));
            }
          } //get fields that fit within the typemap

          var typeQuery = Object.keys(this.typeMap)
            .map(function(type) {
              return "internal_type=" + type;
            })
            .join("^OR");
          dictGR.addEncodedQuery(typeQuery);
          dictGR.query();

          while (dictGR.next()) {
            var _field = {
              name: dictGR.getValue("element"),
              type: this.typeMap[dictGR.getValue("internal_type")]
            };
            fieldList[_field.name] = _field;
          } //overrides

          if (tableName in includes) {
            if (_typeof(includes[tableName]) === "object") {
              for (var _fieldName in includes[tableName]) {
                var fieldFile = {
                  name: _fieldName,
                  type: "txt"
                };
                var fMap = includes[tableName][_fieldName];

                if (fMap.type) {
                  fieldFile.type = fMap.type;
                }

                fieldList[_fieldName] = fieldFile;
              }
            }
          }

          return fieldList;
        }
      },
      {
        key: "processMissingFiles",
        value: function processMissingFiles(missingObj) {
          var fileTableMap = {};

          for (var tableName in missingObj) {
            var tableGR = new GlideRecord(tableName);
            var recordMap = missingObj[tableName];
            var tableMap = {
              records: {}
            };

            for (var recordID in recordMap) {
              if (tableGR.get(recordID)) {
                var metaRecord = {
                  name: tableGR.getDisplayValue(),
                  files: [],
                  sys_id: tableGR.getValue("sys_id")
                };

                for (var i = 0; i < recordMap[recordID].length; i++) {
                  var file = recordMap[recordID][i];
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
      },
      {
        key: "getCurrentScope",
        value: function getCurrentScope() {
          var session = gs.getSession();

          if (typeof session !== "string") {
            var scopeID = session.getCurrentApplicationId();
            var appGR = new GlideRecord("sys_app");
            appGR.get(scopeID);
            return {
              scope: appGR.getValue("scope") || "Global",
              sys_id: scopeID
            };
          }
        }
      },
      {
        key: "getAppList",
        value: function getAppList() {
          var results = [];
          var appGR = new GlideRecord("sys_app");
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
    ]);

    return CICDUtilsMS;
  })();
