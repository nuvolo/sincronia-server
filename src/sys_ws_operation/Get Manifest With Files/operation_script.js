"use strict";

(function process(
  /*RESTAPIRequest*/
  request,
  /*RESTAPIResponse*/
  response
) {
  var utils = new SincUtils();
  var _request$body$data = request.body.data,
    includes = _request$body$data.includes,
    excludes = _request$body$data.excludes;
  var scopeName = request.pathParams.scope;
  var results = utils.getManifest({
    includes: includes,
    excludes: excludes,
    scopeName: scopeName,
    getContents: true
  });
  return results;
})(request, response);
