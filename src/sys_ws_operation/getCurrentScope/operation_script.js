"use strict";

(function process(
  /*RESTAPIRequest*/
  request,
  /*RESTAPIResponse*/
  response
) {
  var utils = new CICDUtils();
  return utils.getCurrentScope();
})(request, response);
