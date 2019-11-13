import { IGetManifestRequest } from "../../../types";
import SincUtils from "../../sys_script_include/SincUtils/script.sn";
import { sn_ws } from "@nuvolo/servicenow-types";

declare var request: IGetManifestRequest;
declare var response: sn_ws.RESTAPIResponse;

(function process(
  request: IGetManifestRequest,
  response: sn_ws.RESTAPIResponse
) {
  let utils = new SincUtils();
  let { includes, excludes, tableOptions = {} } = request.body.data;
  let { scope: scopeName } = request.pathParams;
  let results = utils.getManifest({
    includes,
    excludes,
    scopeName,
    getContents: true,
    tableOptions
  });
  return results;
})(request, response);
