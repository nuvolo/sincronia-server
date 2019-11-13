import SincUtils from "../../sys_script_include/SincUtils/script.sn";
import { sn_ws } from "@nuvolo/servicenow-types";
declare var request: sn_ws.RESTAPIRequest;
declare var response: sn_ws.RESTAPIResponse;
(function process(request, response) {
  var utils = new SincUtils();
  return utils.getCurrentScope();
})(request, response);
