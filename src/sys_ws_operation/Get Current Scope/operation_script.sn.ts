import SincUtils from "../../sys_script_include/SincUtils/script.sn";
declare var request: any;
declare var response: any;
(function process(request, response) {
  var utils = new SincUtils();
  return utils.getCurrentScope();
})(request, response);
