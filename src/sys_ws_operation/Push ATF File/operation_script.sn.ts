import SincUtils from "../../sys_script_include/SincUtils/script.sn";
import { sn_ws } from "@nuvolo/servicenow-types";
import { IPushATFoptions } from "../../../types";
import { TypedRESTAPIRequest } from "@nuvolo/servicenow-types/util";
declare var request: TypedRESTAPIRequest<IPushATFoptions>;
declare var response: sn_ws.RESTAPIResponse;
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
  const file = request.body.data.file;
  const sys_id = request.body.data.sys_id;
  if (new SincUtils().pushATFfile(sys_id, file)) return "success";
  return response.setError("Error updating atf record");
})(request, response);
