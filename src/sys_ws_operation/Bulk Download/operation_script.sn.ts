import SincUtils from "../../sys_script_include/SincUtils/script.sn";
import { SN } from "@sincronia/types";
import { sn_ws } from "@nuvolo/servicenow-types";
import { TypedRESTAPIRequest } from "@nuvolo/servicenow-types/util";
import { ITableOptionsMap } from "../../../types";
interface IMissingFilesPayload {
  tableOptions: ITableOptionsMap;
  missingFiles: SN.MissingFileTableMap;
}
declare var request: TypedRESTAPIRequest<IMissingFilesPayload>;
declare var response: sn_ws.RESTAPIResponse;
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
  const utils = new SincUtils();
  const { missingFiles, tableOptions } = request.body.data;
  return utils.processMissingFiles(missingFiles, tableOptions);
})(request, response);
