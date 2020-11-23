import { SN, Sinc } from "@sincronia/types";
import { TypedRESTAPIRequest } from "@nuvolo/servicenow-types/util";
import { GlideRecord, GlideElement } from "@nuvolo/servicenow-types";
export interface fieldMap {
  [fieldName: string]: SN.File;
}

export interface IGetManifestRequest
  extends TypedRESTAPIRequest<IGetManifestOptions> {
  pathParams: {
    scope: string;
  };
}

export interface IGetManifestOptions {
  tableOptions?: ITableOptionsMap;
  includes: ExInProp;
  excludes: ExInProp;
  withFiles: boolean;
}
export interface IPushATFoptions {
  sys_id: string;
  file: string;
}

export interface ExInProp {
  [table: string]: boolean | fieldMap;
}

export interface ITableOptions {
  displayField?: string;
  differentiatorField?: string | string[];
  query?: string;
}

export interface ITableOptionsMap {
  [table: string]: ITableOptions;
}

export interface manifestConfig {
  scopeName: string;
  getContents?: boolean;
  includes: ExInProp;
  excludes: ExInProp;
  tableOptions: ITableOptionsMap;
}

export interface buildTableMapConfig {
  tableName: string;
  scopeId: string;
  getContents: boolean;
  includes: ExInProp;
  excludes: ExInProp;
  tableOptions: ITableOptions;
}

export interface fileMapConfig {
  tableName: string;
  includes: ExInProp;
  excludes: ExInProp;
}

export interface getTablesConfig {
  scopeId: string;
  includes: ExInProp;
  excludes: ExInProp;
}

export interface ExInMap {
  includes: ExInProp;
  excludes: ExInProp;
}

export interface ATFTable {
  sys_scope: GlideElement;
  sys_id: GlideElement;
  step_config: GlideElement;
  inputs: any;
}

export interface AppTable {
  scope: GlideElement;
  sys_id: GlideElement;
  name: GlideElement;
}

export interface RecordTable {
  sys_scope: GlideElement;
  sys_class_name: GlideElement;
  [FieldName: string]: GlideElement;
  inputs: any;
}

export interface DictionaryTable {
  name: GlideElement;
  element: GlideElement;
  internal_type: GlideElement;
}
