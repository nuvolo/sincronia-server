"use strict";

(function process(
  /*RESTAPIRequest*/
  request,
  /*RESTAPIResponse*/
  response
) {
  var utils = new SincUtils();
  return utils.getCurrentScope();
})(request, response);