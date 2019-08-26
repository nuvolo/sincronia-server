(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var utils = new SincUtils();
    return utils.processMissingFiles(request.body.data);
})(request, response);
