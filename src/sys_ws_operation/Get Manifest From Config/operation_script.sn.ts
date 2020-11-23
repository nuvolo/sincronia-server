import SincUtils from "../../sys_script_include/SincUtils/script.sn";
import { sn_ws } from "@nuvolo/servicenow-types";
import { IGetManifestRequest } from "../../../types";
declare var request: IGetManifestRequest;
declare var response: sn_ws.RESTAPIResponse;
(function process(
  request: IGetManifestRequest,
  response: sn_ws.RESTAPIResponse
) {
  let utils = new SincUtils();
  let { includes, excludes, tableOptions = {}, withFiles } = request.body.data;
  let { scope: scopeName } = request.pathParams;
  return utils.getManifest({
    scopeName,
    includes,
    excludes,
    tableOptions,
    getContents: withFiles
  });
})(request, response);
