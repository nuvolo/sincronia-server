import SincUtils from "../../sys_script_include/SincUtils/script.sn";
declare var request: any;
declare var response: {
  setBody(body: any): void;
};
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
  var utils = new SincUtils();
  response.setBody(utils.getAppList());
})(request, response);
