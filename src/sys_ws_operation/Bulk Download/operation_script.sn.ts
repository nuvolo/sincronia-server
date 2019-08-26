import SincUtils from "../../sys_script_include/SincUtils/script.sn";
import { SN } from "@sincronia/types";
declare var request: {
  body: {
    data: SN.MissingFileTableMap;
  };
};
declare var response: any;
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
  var utils = new SincUtils();
  return utils.processMissingFiles(request.body.data);
})(request, response);
