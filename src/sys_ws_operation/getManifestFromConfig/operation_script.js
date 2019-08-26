"use strict";

(function process(
  /*RESTAPIRequest*/
  request,
  /*RESTAPIResponse*/
  response
) {
  var utils = new CICDUtils();
  var _request$body$data = request.body.data,
    includes = _request$body$data.includes,
    excludes = _request$body$data.excludes;
  var scopeName = request.pathParams.scope;
  return utils.getManifest({
    scopeName: scopeName,
    includes: includes,
    excludes: excludes
  });
})(request, response);
