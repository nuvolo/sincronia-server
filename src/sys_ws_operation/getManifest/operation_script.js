(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
  var utils = new x_nuvo_x.CICDUtils();
  return utils.getManifest(request.pathParams.scope, false);
})(request, response);
