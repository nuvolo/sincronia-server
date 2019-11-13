import SincUtils from "../../sys_script_include/SincUtils/script.sn";
import { SN } from "@sincronia/types";
import { sn_ws } from "@nuvolo/servicenow-types";
// declare var request: {
//   body: {
//     data: SN.MissingFileTableMap;
//   };
// };
// declare var response: any;
declare var request: sn_ws.RESTAPIRequest;
declare var response: sn_ws.RESTAPIResponse;
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
  var utils = new SincUtils();
  return utils.processMissingFiles(request.body.data);
})(request, response);
