(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    //hi
    var utils = new CICDUtils();
    return utils.processMissingFiles(request.body.data);
})(request, response);
