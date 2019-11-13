import SincUtils from "../../sys_script_include/SincUtils/script.sn";
import { sn_ws } from "@nuvolo/servicenow-types";
declare var request: sn_ws.RESTAPIRequest;
declare var response: sn_ws.RESTAPIResponse;
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
  var utils = new SincUtils();
  response.setBody(utils.getAppList());
})(request, response);
