"use strict";

(function process(
  /*RESTAPIRequest*/
  request,
  /*RESTAPIResponse*/
  response
) {
  var utils = new CICDUtils();
  response.setBody(utils.getAppList());
})(request, response);
