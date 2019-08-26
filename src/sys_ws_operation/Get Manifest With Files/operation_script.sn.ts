import { SN } from "@sincronia/types";
import SincUtils from "../../sys_script_include/SincUtils/script.sn";
interface gmfcRequest {
  body: {
    data: {
      includes: { [key: string]: boolean | { [fieldName: string]: SN.File } };
      excludes: { [key: string]: boolean | { [fieldName: string]: SN.File } };
    };
  };
  pathParams: {
    scope: string;
  };
}
declare var request: gmfcRequest;
declare var response: any;
(function process(/*RESTAPIRequest*/ request: gmfcRequest, /*RESTAPIResponse*/ response) {
  var utils = new SincUtils();
  let { includes, excludes } = request.body.data;
  let { scope: scopeName } = request.pathParams;
  var results = utils.getManifest({
    includes,
    excludes,
    scopeName,
    getContents: true
  });
  return results;
})(request, response);
