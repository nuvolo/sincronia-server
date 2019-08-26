(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
  var utils = new SincUtils();
  response.setBody(utils.getAppList());
})(request, response);