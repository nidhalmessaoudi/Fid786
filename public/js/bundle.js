/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/axios/index.js":
/*!*************************************!*\
  !*** ./node_modules/axios/index.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib/axios */ "./node_modules/axios/lib/axios.js");

/***/ }),

/***/ "./node_modules/axios/lib/adapters/xhr.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/adapters/xhr.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "./node_modules/axios/lib/core/settle.js");
var cookies = __webpack_require__(/*! ./../helpers/cookies */ "./node_modules/axios/lib/helpers/cookies.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ "./node_modules/axios/lib/core/buildFullPath.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "./node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "./node_modules/axios/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__(/*! ../core/createError */ "./node_modules/axios/lib/core/createError.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults.js");
var Cancel = __webpack_require__(/*! ../cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var responseType = config.responseType;
    var onCanceled;
    function done() {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(onCanceled);
      }

      if (config.signal) {
        config.signal.removeEventListener('abort', onCanceled);
      }
    }

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
        request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
      var transitional = config.transitional || defaults.transitional;
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(
        timeoutErrorMessage,
        config,
        transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken || config.signal) {
      // Handle cancellation
      // eslint-disable-next-line func-names
      onCanceled = function(cancel) {
        if (!request) {
          return;
        }
        reject(!cancel || (cancel && cancel.type) ? new Cancel('canceled') : cancel);
        request.abort();
        request = null;
      };

      config.cancelToken && config.cancelToken.subscribe(onCanceled);
      if (config.signal) {
        config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
      }
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/axios.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/axios.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "./node_modules/axios/lib/core/Axios.js");
var mergeConfig = __webpack_require__(/*! ./core/mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var defaults = __webpack_require__(/*! ./defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  // Factory for creating new instances
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "./node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
axios.VERSION = (__webpack_require__(/*! ./env/data */ "./node_modules/axios/lib/env/data.js").version);

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "./node_modules/axios/lib/helpers/spread.js");

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(/*! ./helpers/isAxiosError */ "./node_modules/axios/lib/helpers/isAxiosError.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports["default"] = axios;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/Cancel.js":
/*!*************************************************!*\
  !*** ./node_modules/axios/lib/cancel/Cancel.js ***!
  \*************************************************/
/***/ ((module) => {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/CancelToken.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/cancel/CancelToken.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(/*! ./Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;

  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;

  // eslint-disable-next-line func-names
  this.promise.then(function(cancel) {
    if (!token._listeners) return;

    var i;
    var l = token._listeners.length;

    for (i = 0; i < l; i++) {
      token._listeners[i](cancel);
    }
    token._listeners = null;
  });

  // eslint-disable-next-line func-names
  this.promise.then = function(onfulfilled) {
    var _resolve;
    // eslint-disable-next-line func-names
    var promise = new Promise(function(resolve) {
      token.subscribe(resolve);
      _resolve = resolve;
    }).then(onfulfilled);

    promise.cancel = function reject() {
      token.unsubscribe(_resolve);
    };

    return promise;
  };

  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Subscribe to the cancel signal
 */

CancelToken.prototype.subscribe = function subscribe(listener) {
  if (this.reason) {
    listener(this.reason);
    return;
  }

  if (this._listeners) {
    this._listeners.push(listener);
  } else {
    this._listeners = [listener];
  }
};

/**
 * Unsubscribe from the cancel signal
 */

CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
  if (!this._listeners) {
    return;
  }
  var index = this._listeners.indexOf(listener);
  if (index !== -1) {
    this._listeners.splice(index, 1);
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/isCancel.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/cancel/isCancel.js ***!
  \***************************************************/
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/Axios.js":
/*!**********************************************!*\
  !*** ./node_modules/axios/lib/core/Axios.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var buildURL = __webpack_require__(/*! ../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "./node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "./node_modules/axios/lib/core/dispatchRequest.js");
var mergeConfig = __webpack_require__(/*! ./mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var validator = __webpack_require__(/*! ../helpers/validator */ "./node_modules/axios/lib/helpers/validator.js");

var validators = validator.validators;
/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  var transitional = config.transitional;

  if (transitional !== undefined) {
    validator.assertOptions(transitional, {
      silentJSONParsing: validators.transitional(validators.boolean),
      forcedJSONParsing: validators.transitional(validators.boolean),
      clarifyTimeoutError: validators.transitional(validators.boolean)
    }, false);
  }

  // filter out skipped interceptors
  var requestInterceptorChain = [];
  var synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }

    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  var promise;

  if (!synchronousRequestInterceptors) {
    var chain = [dispatchRequest, undefined];

    Array.prototype.unshift.apply(chain, requestInterceptorChain);
    chain = chain.concat(responseInterceptorChain);

    promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }


  var newConfig = config;
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "./node_modules/axios/lib/core/InterceptorManager.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/core/InterceptorManager.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "./node_modules/axios/lib/core/buildFullPath.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/buildFullPath.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(/*! ../helpers/isAbsoluteURL */ "./node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ../helpers/combineURLs */ "./node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/createError.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/createError.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(/*! ./enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/dispatchRequest.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/core/dispatchRequest.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "./node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults.js");
var Cancel = __webpack_require__(/*! ../cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }

  if (config.signal && config.signal.aborted) {
    throw new Cancel('canceled');
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData.call(
    config,
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData.call(
      config,
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/core/enhanceError.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/core/enhanceError.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  };
  return error;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/mergeConfig.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/mergeConfig.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  // eslint-disable-next-line consistent-return
  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function mergeDirectKeys(prop) {
    if (prop in config2) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  var mergeMap = {
    'url': valueFromConfig2,
    'method': valueFromConfig2,
    'data': valueFromConfig2,
    'baseURL': defaultToConfig2,
    'transformRequest': defaultToConfig2,
    'transformResponse': defaultToConfig2,
    'paramsSerializer': defaultToConfig2,
    'timeout': defaultToConfig2,
    'timeoutMessage': defaultToConfig2,
    'withCredentials': defaultToConfig2,
    'adapter': defaultToConfig2,
    'responseType': defaultToConfig2,
    'xsrfCookieName': defaultToConfig2,
    'xsrfHeaderName': defaultToConfig2,
    'onUploadProgress': defaultToConfig2,
    'onDownloadProgress': defaultToConfig2,
    'decompress': defaultToConfig2,
    'maxContentLength': defaultToConfig2,
    'maxBodyLength': defaultToConfig2,
    'transport': defaultToConfig2,
    'httpAgent': defaultToConfig2,
    'httpsAgent': defaultToConfig2,
    'cancelToken': defaultToConfig2,
    'socketPath': defaultToConfig2,
    'responseEncoding': defaultToConfig2,
    'validateStatus': mergeDirectKeys
  };

  utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
    var merge = mergeMap[prop] || mergeDeepProperties;
    var configValue = merge(prop);
    (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
  });

  return config;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/settle.js":
/*!***********************************************!*\
  !*** ./node_modules/axios/lib/core/settle.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(/*! ./createError */ "./node_modules/axios/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "./node_modules/axios/lib/core/transformData.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/transformData.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var defaults = __webpack_require__(/*! ./../defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  var context = this || defaults;
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn.call(context, data, headers);
  });

  return data;
};


/***/ }),

/***/ "./node_modules/axios/lib/defaults.js":
/*!********************************************!*\
  !*** ./node_modules/axios/lib/defaults.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ./helpers/normalizeHeaderName */ "./node_modules/axios/lib/helpers/normalizeHeaderName.js");
var enhanceError = __webpack_require__(/*! ./core/enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ./adapters/xhr */ "./node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ./adapters/http */ "./node_modules/axios/lib/adapters/xhr.js");
  }
  return adapter;
}

function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

var defaults = {

  transitional: {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
  },

  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');

    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
      setContentTypeIfUnset(headers, 'application/json');
      return stringifySafely(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    var transitional = this.transitional || defaults.transitional;
    var silentJSONParsing = transitional && transitional.silentJSONParsing;
    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

    if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw enhanceError(e, this, 'E_JSON_PARSE');
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },

  headers: {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ "./node_modules/axios/lib/env/data.js":
/*!********************************************!*\
  !*** ./node_modules/axios/lib/env/data.js ***!
  \********************************************/
/***/ ((module) => {

module.exports = {
  "version": "0.24.0"
};

/***/ }),

/***/ "./node_modules/axios/lib/helpers/bind.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/helpers/bind.js ***!
  \************************************************/
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/buildURL.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/buildURL.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/combineURLs.js":
/*!*******************************************************!*\
  !*** ./node_modules/axios/lib/helpers/combineURLs.js ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/cookies.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/helpers/cookies.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAxiosError.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAxiosError.js ***!
  \********************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return (typeof payload === 'object') && (payload.isAxiosError === true);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!***************************************************************!*\
  !*** ./node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/parseHeaders.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/parseHeaders.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/spread.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/helpers/spread.js ***!
  \**************************************************/
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/validator.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/validator.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var VERSION = (__webpack_require__(/*! ../env/data */ "./node_modules/axios/lib/env/data.js").version);

var validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

var deprecatedWarnings = {};

/**
 * Transitional option validator
 * @param {function|boolean?} validator - set to false if the transitional option has been removed
 * @param {string?} version - deprecated version / removed since version
 * @param {string?} message - some message with additional info
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return function(value, opt, opts) {
    if (validator === false) {
      throw new Error(formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')));
    }

    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }
  var keys = Object.keys(options);
  var i = keys.length;
  while (i-- > 0) {
    var opt = keys[i];
    var validator = schema[opt];
    if (validator) {
      var value = options[opt];
      var result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new TypeError('option ' + opt + ' must be ' + result);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw Error('Unknown option ' + opt);
    }
  }
}

module.exports = {
  assertOptions: assertOptions,
  validators: validators
};


/***/ }),

/***/ "./node_modules/axios/lib/utils.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/utils.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),

/***/ "./client/Dashboard.ts":
/*!*****************************!*\
  !*** ./client/Dashboard.ts ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var Home_1 = __importDefault(__webpack_require__(/*! ./sections/Home */ "./client/sections/Home.ts"));
var Order_1 = __importDefault(__webpack_require__(/*! ./sections/Order */ "./client/sections/Order.ts"));
var Product_1 = __importDefault(__webpack_require__(/*! ./sections/Product */ "./client/sections/Product.ts"));
var Reward_1 = __importDefault(__webpack_require__(/*! ./sections/Reward */ "./client/sections/Reward.ts"));
var Store_1 = __importDefault(__webpack_require__(/*! ./sections/Store */ "./client/sections/Store.ts"));
var Dashboard = (function () {
    function Dashboard() {
        this.renderDashboard();
        var sidebarItemsContainer = document.getElementById("sidebarItems");
        sidebarItemsContainer.addEventListener("click", this.sidebarClickHandler.bind(this));
    }
    Dashboard.prototype.renderDashboard = function (section) {
        var activeSection = section || "HOME";
        switch (activeSection) {
            case "HOME":
                new Home_1.default();
                break;
            case "STORE":
                new Store_1.default();
                break;
            case "PRODUCT":
                new Product_1.default();
                break;
            case "REWARD":
                new Reward_1.default();
                break;
            case "ORDER":
                new Order_1.default();
                break;
        }
        document.querySelectorAll("[data-section]").forEach(function (el) {
            if (!(el instanceof HTMLElement))
                return;
            if (el.dataset.section !== activeSection &&
                el.classList.contains("sidebar-item__active")) {
                el.classList.remove("sidebar-item__active");
            }
            if (el.dataset.section === activeSection &&
                !el.classList.contains("sidebar-item__active")) {
                el.classList.add("sidebar-item__active");
            }
        });
    };
    Dashboard.prototype.sidebarClickHandler = function (e) {
        var target = e.target;
        if (!target.classList.contains("sidebar-item")) {
            target = target.closest(".sidebar-item");
            if (!target)
                return;
        }
        var sectionDataset = target.dataset.section;
        if (sectionDataset === "NULL") {
            location.href = "/";
            return;
        }
        this.renderDashboard(sectionDataset);
    };
    return Dashboard;
}());
exports["default"] = Dashboard;


/***/ }),

/***/ "./client/Main.ts":
/*!************************!*\
  !*** ./client/Main.ts ***!
  \************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var Dashboard_1 = __importDefault(__webpack_require__(/*! ./Dashboard */ "./client/Dashboard.ts"));
var OrderProduct_1 = __importDefault(__webpack_require__(/*! ./modals/OrderProduct */ "./client/modals/OrderProduct.ts"));
var Main = (function () {
    function Main() {
        var _a, _b, _c, _d;
        (_a = document
            .getElementById("dropdownToggle")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", this.dropdownToggleHandler.bind(this));
        if (location.pathname === "/dashboard") {
            new Dashboard_1.default();
            return;
        }
        if (location.pathname === "/") {
            (_b = document
                .getElementById("contactForm")) === null || _b === void 0 ? void 0 : _b.addEventListener("submit", this.contactSubmitHandler.bind(this));
            return;
        }
        (_c = document
            .getElementById("productImgs")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", this.changeActiveImgHandler.bind(this));
        (_d = document
            .getElementById("orderProduct")) === null || _d === void 0 ? void 0 : _d.addEventListener("submit", this.orderProductHandler.bind(this));
    }
    Main.main = function () {
        this.self = new Main();
        return this.self;
    };
    Main.prototype.dropdownToggleHandler = function () {
        var _this = this;
        var _a;
        if (this.focusedEl) {
            return;
        }
        var userDropdownTemplate = document.getElementById("userDropdownTemplate");
        (_a = userDropdownTemplate.parentElement) === null || _a === void 0 ? void 0 : _a.appendChild(userDropdownTemplate.content.cloneNode(true));
        this.focusedEl = document.getElementById("userDropdown");
        setTimeout(function () { return _this.attachListenerToBody(); }, 50);
    };
    Main.prototype.attachListenerToBody = function () {
        document.body.addEventListener("click", this.closeFocusedHandler.bind(this), { once: true });
    };
    Main.prototype.closeFocusedHandler = function (e) {
        var target = e.target;
        if (target.closest("#".concat(this.focusedEl.id))) {
            this.attachListenerToBody();
            return;
        }
        this.focusedEl.remove();
        this.focusedEl = undefined;
    };
    Main.prototype.changeActiveImgHandler = function (e) {
        var target = e.target;
        if (!target.src) {
            return;
        }
        var activeImgContainer = document.getElementById("productActiveImg");
        if (target.src === activeImgContainer.src) {
            return;
        }
        activeImgContainer.innerHTML = target.outerHTML;
    };
    Main.prototype.orderProductHandler = function (e) {
        var _a, _b, _c;
        e.preventDefault();
        var target = e.target;
        var productId = (_a = target.dataset) === null || _a === void 0 ? void 0 : _a.id;
        var orderType = (_b = target.dataset) === null || _b === void 0 ? void 0 : _b.type;
        var loggedIn = ((_c = target.dataset) === null || _c === void 0 ? void 0 : _c.loggedin) === "true" ? true : false;
        var quantityInput = target === null || target === void 0 ? void 0 : target.querySelector("input[id='orderAmount']");
        if (!loggedIn) {
            location.href = "/login";
            return;
        }
        new OrderProduct_1.default(orderType, productId, +(quantityInput === null || quantityInput === void 0 ? void 0 : quantityInput.value.trim()) || 1);
    };
    Main.prototype.contactSubmitHandler = function (e) {
        e.preventDefault();
        var contactName = document.getElementById("contactName");
        var contactEmail = document.getElementById("contactEmail");
        var contactSubject = document.getElementById("contactSubject");
        var contactMessage = document.getElementById("contactMessage");
        var email = contactEmail.value;
        var subject = contactSubject.value;
        var body = contactMessage.value;
        var url = "mailto:gafouri@gmail.com?bcc=".concat(email, "&subject=").concat(subject, "&body=").concat(body);
        window.open(url);
        contactName.value = "";
        contactEmail.value = "";
        contactSubject.value = "";
        contactMessage.value = "";
    };
    return Main;
}());
exports["default"] = Main;


/***/ }),

/***/ "./client/helpers/formatDate.ts":
/*!**************************************!*\
  !*** ./client/helpers/formatDate.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
function formatDate(date) {
    var dateObj = new Date(date);
    var day = dateObj.getDate();
    var month = dateObj.toLocaleString("en-us", { month: "short" });
    var year = dateObj.getFullYear();
    return "".concat(day, " ").concat(month, ", ").concat(year);
}
exports["default"] = formatDate;


/***/ }),

/***/ "./client/index.ts":
/*!*************************!*\
  !*** ./client/index.ts ***!
  \*************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var Main_1 = __importDefault(__webpack_require__(/*! ./Main */ "./client/Main.ts"));
window.addEventListener("load", function () { return Main_1.default.main(); });


/***/ }),

/***/ "./client/modals/Modal.ts":
/*!********************************!*\
  !*** ./client/modals/Modal.ts ***!
  \********************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var Modal = (function () {
    function Modal(title, type, reloadFn) {
        if (type === void 0) { type = "CREATABLE"; }
        this.title = title;
        this.type = type;
        this.reloadFn = reloadFn;
        this.overlayMarkup = "<div class=\"overlay\"></div>";
        this.modalMarkup = "\n    <div class=\"modal-container\">\n        <div class=\"modal\">\n            <div class=\"modal-top\">\n                <h2 class=\"modal-brand\"></h2>\n                <div class=\"modal-close\"><i class=\"bi bi-x\"></i></div>\n            </div>\n            <div class=\"modal-content\"></div>\n        </div>\n    </div>\n  ";
        this.loadingSpinner = "\n    <div class=\"loading-spinner__modal\"><div class=\"loading-spinner\"></div></div>\n  ";
        this.activeTimer = 0;
        document.body.insertAdjacentHTML("afterbegin", this.overlayMarkup);
        document.body.insertAdjacentHTML("afterbegin", this.modalMarkup);
        this.overlay = document.querySelector(".overlay");
        this.modal = document.querySelector(".modal");
        this.modalTitle = document.querySelector(".modal-brand");
        this.modalClose = document.querySelector(".modal-close");
        this.modalContentContainer = document.querySelector(".modal-content");
        this.modalTitle.textContent = this.title;
        this.modalContentContainer.innerHTML = this.loadingSpinner;
        this.modalClose.addEventListener("click", this.closeModalHandler.bind(this));
        this.overlay.addEventListener("click", this.closeModalHandler.bind(this));
        document.addEventListener("keydown", this.keydownHandler.bind(this), {
            once: true,
        });
    }
    Modal.prototype.closeModalHandler = function () {
        this.closeHandler();
    };
    Modal.prototype.keydownHandler = function (e) {
        if (e.key === "Escape") {
            e.preventDefault();
            this.closeHandler();
        }
    };
    Modal.prototype.render = function (markup) {
        var _a;
        this.modalContentContainer.innerHTML = markup;
        if (this.type === "EDITABLE") {
            (_a = document
                .getElementById("deleteDoc")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", this.deleteHandler.bind(this));
        }
    };
    Modal.prototype.closeHandler = function (reload) {
        if (reload === void 0) { reload = true; }
        this.modal.remove();
        this.overlay.remove();
        if (!reload)
            return;
        if (this.reloadFn) {
            this.reloadFn();
        }
    };
    Modal.prototype.createError = function (text) {
        var errorEl = document.createElement("p");
        errorEl.classList.add("form-error");
        errorEl.textContent = text;
        return errorEl;
    };
    Modal.prototype.deleteHandler = function (e) {
        return __awaiter(this, void 0, void 0, function () {
            var target_1, timer_1;
            var _this = this;
            return __generator(this, function (_a) {
                try {
                    target_1 = e.target;
                    if (this.activeTimer) {
                        clearInterval(this.activeTimer);
                        target_1.textContent = "Delete";
                        target_1.style.opacity = "1";
                        this.activeTimer = 0;
                        return [2];
                    }
                    timer_1 = 3;
                    target_1.textContent = "Undo... ".concat(timer_1);
                    target_1.style.opacity = "0.7";
                    this.activeTimer = window.setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (timer_1 !== 0) {
                                        timer_1--;
                                        target_1.textContent = "Undo... ".concat(timer_1);
                                        return [2];
                                    }
                                    target_1.textContent = "Deleting";
                                    target_1.disabled = true;
                                    return [4, this.deleteDoc()];
                                case 1:
                                    _a.sent();
                                    this.closeHandler();
                                    clearInterval(this.activeTimer);
                                    return [2];
                            }
                        });
                    }); }, 1000);
                }
                catch (err) {
                    console.error(err);
                }
                return [2];
            });
        });
    };
    Modal.prototype.deleteDoc = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2];
        }); });
    };
    return Modal;
}());
exports["default"] = Modal;


/***/ }),

/***/ "./client/modals/Order.ts":
/*!********************************!*\
  !*** ./client/modals/Order.ts ***!
  \********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var axios_1 = __importDefault(__webpack_require__(/*! axios */ "./node_modules/axios/index.js"));
var Modal_1 = __importDefault(__webpack_require__(/*! ./Modal */ "./client/modals/Modal.ts"));
var formatDate_1 = __importDefault(__webpack_require__(/*! ../helpers/formatDate */ "./client/helpers/formatDate.ts"));
var OrderModal = (function (_super) {
    __extends(OrderModal, _super);
    function OrderModal(reloadFn, orderId) {
        var _this = _super.call(this, "New Order", "CREATABLE", reloadFn) || this;
        _this.load(orderId)
            .then(function () {
            var _a;
            (_a = document
                .getElementById("setAsDelivered")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", _this.setAsDeliveredHandler.bind(_this));
        })
            .catch(function (_) {
            return;
        });
        return _this;
    }
    OrderModal.prototype.load = function (orderId) {
        return __awaiter(this, void 0, void 0, function () {
            var res, order, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, (0, axios_1.default)({
                                url: "/api/v1/orders/".concat(orderId),
                                method: "GET",
                            })];
                    case 1:
                        res = _a.sent();
                        order = res.data.doc;
                        this.render("\n        <div class=\"order-info__group\">\n            <span class=\"order-info__group-title\">Order ID: </span>\n            <span class=\"order-info__group-detail\">".concat(order._id, "</span>\n        </div>\n        <div class=\"order-info__group\">\n            <span class=\"order-info__group-title\">Product: </span>\n            <span class=\"order-info__group-detail\">").concat(order.product.name, "</span>\n        </div>\n        <div class=\"order-info__group\">\n            <span class=\"order-info__group-title\">Amount: </span>\n            <span class=\"order-info__group-detail\"> ").concat(order.amount === 0
                            ? 1
                            : "\u20AC".concat(order.product.price, " &times; ").concat(order.amount), "</span>\n        </div>\n        <div class=\"order-info__group\">\n            <span class=\"order-info__group-title\">Total: </span>\n            <span class=\"order-info__group-detail\">\n              ").concat(order.totalPrice === 0 ? "FREE" : "\u20AC".concat(order.totalPrice), "\n            </span>\n        </div>\n        <div class=\"order-info__group\">\n            <span class=\"order-info__group-title\">Buyer Email: </span>\n            <span class=\"order-info__group-detail\">").concat(order.buyer.email, "</span>\n        </div>\n        <div class=\"order-info__group\">\n            <span class=\"order-info__group-title\">Delivery Location: </span>\n            <span class=\"order-info__group-detail\">").concat(order.buyerLocation, "</span>\n        </div>\n        <div class=\"order-info__group\">\n            <span class=\"order-info__group-title\">Delivery Time: </span>\n            <span class=\"order-info__group-detail\">").concat(order.product.deliveryTime, " Days</span>\n        </div>\n        <div class=\"order-info__group\">\n            <span class=\"order-info__group-title\">Submitted At: </span>\n            <span class=\"order-info__group-detail\">").concat((0, formatDate_1.default)(order.createdAt), "</span>\n        </div>\n        ").concat(order.state === "delivered"
                            ? "<div class=\"order-info__group\">\n                <span class=\"order-info__group-title\">Status: </span>\n                <span class=\"order-info__group-detail\">".concat(order.state, " at ").concat((0, formatDate_1.default)(order.updatedAt), "</span>\n            </div>")
                            : "", "\n        ").concat(order.state === "pending"
                            ? "<div class=\"order-edit__container\">\n               <button id=\"setAsDelivered\" data-id=\"".concat(order._id, "\" class=\"btn btn-primary\">Set as delivered</button>\n            </div>")
                            : "", "\n      "));
                        return [3, 3];
                    case 2:
                        err_1 = _a.sent();
                        console.error(err_1);
                        return [3, 3];
                    case 3: return [2];
                }
            });
        });
    };
    OrderModal.prototype.setAsDeliveredHandler = function (e) {
        return __awaiter(this, void 0, void 0, function () {
            var target, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        e.preventDefault();
                        target = e.target;
                        target.textContent = "Setting";
                        target.disabled = true;
                        return [4, (0, axios_1.default)({
                                url: "/api/v1/orders/".concat(target.dataset.id),
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                data: {
                                    state: "delivered",
                                },
                            })];
                    case 1:
                        _a.sent();
                        this.closeHandler();
                        return [3, 3];
                    case 2:
                        err_2 = _a.sent();
                        console.log(err_2);
                        this.closeHandler();
                        return [3, 3];
                    case 3: return [2];
                }
            });
        });
    };
    return OrderModal;
}(Modal_1.default));
exports["default"] = OrderModal;


/***/ }),

/***/ "./client/modals/OrderProduct.ts":
/*!***************************************!*\
  !*** ./client/modals/OrderProduct.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var axios_1 = __importDefault(__webpack_require__(/*! axios */ "./node_modules/axios/index.js"));
var Modal_1 = __importDefault(__webpack_require__(/*! ./Modal */ "./client/modals/Modal.ts"));
var OrderProductModal = (function (_super) {
    __extends(OrderProductModal, _super);
    function OrderProductModal(orderType, productId, quantity) {
        var _this = _super.call(this, "New Order") || this;
        _this.orderType = orderType;
        _this.quantity = quantity;
        _this.load(productId)
            .then(function () {
            var _a;
            _this.orderTotalEl = document.getElementById("orderTotal");
            (_a = document
                .getElementById("modalOrderAmount")) === null || _a === void 0 ? void 0 : _a.addEventListener("change", _this.orderAmountChangeHandler.bind(_this));
            _this.form = document.getElementById("submitOrder");
            _this.form.addEventListener("submit", _this.orderSubmitHandler.bind(_this));
        })
            .catch(function (_) {
            return;
        });
        return _this;
    }
    OrderProductModal.prototype.load = function (productId) {
        return __awaiter(this, void 0, void 0, function () {
            var res, product, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, (0, axios_1.default)({
                                url: "/api/v1/products/".concat(productId),
                                method: "GET",
                            })];
                    case 1:
                        res = _a.sent();
                        product = res.data.doc;
                        if (this.orderType === "FREE") {
                            this.render("\n          <form id=\"submitOrder\" class=\"order-modal\" data-id=\"".concat(productId, "\">\n            <h3 class=\"order-modal__title\">").concat(product.name, "</h3>\n            <div class=\"order-modal__info\">\n              <span class=\"order-modal__single-price\">FREE</span>\n            </div>\n            <div class=\"form-control\">\n                <label>Delivery Location *</label>\n                <input type=\"text\" name=\"buyerLocation\" placeholder=\"Put your delivery location here...\" required>\n            </div>\n            <div class=\"form-control order-modal__total\">\n              <label>Total Price</label>\n              <p id=\"orderTotal\">FREE</p>\n            </div>\n            <button type=\"submit\" class=\"btn btn-primary\">Order Now</button>\n          </form>\n        "));
                            return [2];
                        }
                        this.price = product.price;
                        this.render("\n        <form id=\"submitOrder\" class=\"order-modal\" data-id=\"".concat(productId, "\">\n          <h3 class=\"order-modal__title\">").concat(product.name, "</h3>\n          <div class=\"order-modal__info\">\n            <span class=\"order-modal__single-price\">\u20AC").concat(product.price, "</span>\n            <span class=\"order-modal__single-price\">&times;</span>\n            <div class=\"form-control form-control__mini order-modal__amount\">\n                <label for=\"orderAmount\">Qty:</label>\n                <input id=\"modalOrderAmount\" name=\"orderAmount\" type=\"number\" min=\"1\" value=\"").concat(this.quantity, "\" required>\n            </div>\n          </div>\n          <div class=\"form-control\">\n              <label>Delivery Location *</label>\n              <input type=\"text\" name=\"buyerLocation\" placeholder=\"Put your delivery location here...\" required>\n          </div>\n          <div class=\"form-control order-modal__total\">\n            <label>Total Price</label>\n            <p id=\"orderTotal\">\u20AC").concat(product.price * this.quantity, "</p>\n          </div>\n          <button type=\"submit\" class=\"btn btn-primary\">Order Now</button>\n        </form>\n    "));
                        return [3, 3];
                    case 2:
                        err_1 = _a.sent();
                        console.error(err_1);
                        return [3, 3];
                    case 3: return [2];
                }
            });
        });
    };
    OrderProductModal.prototype.orderAmountChangeHandler = function (e) {
        if (!this.price) {
            return;
        }
        var target = e.target;
        this.orderTotalEl.textContent = "\u20AC".concat(this.price * +target.value);
    };
    OrderProductModal.prototype.orderSubmitHandler = function (e) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var amountInput, buyerLocationInput, submitBtn, err_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        e.preventDefault();
                        amountInput = this.form.querySelector("input[name=\"orderAmount\"]");
                        buyerLocationInput = this.form.querySelector("input[name=\"buyerLocation\"]");
                        submitBtn = this.form.querySelector("button[type=\"submit\"]");
                        submitBtn.textContent = "Ordering";
                        submitBtn.disabled = true;
                        return [4, (0, axios_1.default)({
                                url: "/api/v1/orders".concat(this.orderType === "FREE" ? "?type=free" : ""),
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                data: {
                                    product: (_a = this.form) === null || _a === void 0 ? void 0 : _a.dataset.id,
                                    buyerLocation: buyerLocationInput.value,
                                    amount: +(amountInput === null || amountInput === void 0 ? void 0 : amountInput.value) || 0,
                                    totalPrice: (+(amountInput === null || amountInput === void 0 ? void 0 : amountInput.value) && this.price * +(amountInput === null || amountInput === void 0 ? void 0 : amountInput.value)) || 0,
                                },
                            })];
                    case 1:
                        _b.sent();
                        this.closeHandler(false);
                        location.href = "/orders";
                        return [3, 3];
                    case 2:
                        err_2 = _b.sent();
                        this.closeHandler();
                        return [3, 3];
                    case 3: return [2];
                }
            });
        });
    };
    return OrderProductModal;
}(Modal_1.default));
exports["default"] = OrderProductModal;


/***/ }),

/***/ "./client/modals/Product.ts":
/*!**********************************!*\
  !*** ./client/modals/Product.ts ***!
  \**********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var axios_1 = __importDefault(__webpack_require__(/*! axios */ "./node_modules/axios/index.js"));
var Modal_1 = __importDefault(__webpack_require__(/*! ./Modal */ "./client/modals/Modal.ts"));
var ProductModal = (function (_super) {
    __extends(ProductModal, _super);
    function ProductModal(reloadFn, productId) {
        var _this = _super.call(this, "New Product", productId ? "EDITABLE" : "CREATABLE", reloadFn) || this;
        _this.photoNumber = 1;
        _this.load(productId)
            .then(function () {
            _this.form = document.querySelector(".modal-form");
            _this.select = document.getElementById("storeSelect");
            _this.photoInputs = document.getElementById("photoInputs");
            _this.selectChangeHandler();
            _this.select.addEventListener("change", _this.selectChangeHandler.bind(_this));
            _this.form.addEventListener("submit", _this.submitHandler.bind(_this));
            document
                .getElementById("addPhoto")
                .addEventListener("click", _this.addPhotoHandler.bind(_this));
        })
            .catch(function (_) {
            return;
        });
        return _this;
    }
    ProductModal.prototype.load = function (productId) {
        return __awaiter(this, void 0, void 0, function () {
            var buttons, storeValue_1, nameValue, descriptionValue, photosValue, priceValue, deliveryValue, availabilityValue, fidPointsValue, data, doc, storesRes, storesData, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        buttons = void 0;
                        storeValue_1 = "";
                        nameValue = "";
                        descriptionValue = "";
                        photosValue = [""];
                        priceValue = 0;
                        deliveryValue = 0;
                        availabilityValue = "";
                        fidPointsValue = 0;
                        if (!productId) return [3, 2];
                        buttons = "\n        <button type=\"submit\" class=\"btn btn-primary\">Edit</button>\n        <button type=\"button\" id=\"deleteDoc\" class=\"btn btn-danger\">Delete</button>\n      ";
                        return [4, (0, axios_1.default)({
                                url: "/api/v1/products/".concat(productId),
                                method: "GET",
                            })];
                    case 1:
                        data = (_a.sent()).data;
                        doc = data.doc;
                        storeValue_1 = doc.store._id;
                        nameValue = doc.name;
                        descriptionValue = doc.description;
                        photosValue = doc.photos;
                        priceValue = doc.price;
                        deliveryValue = doc.deliveryTime;
                        availabilityValue = doc.availability;
                        fidPointsValue = doc.fidPoints;
                        return [3, 3];
                    case 2:
                        buttons = "<button type=\"submit\" class=\"btn btn-primary\">Submit</button>";
                        _a.label = 3;
                    case 3: return [4, (0, axios_1.default)({
                            url: "/api/v1/stores",
                            method: "GET",
                            params: {
                                all: true,
                            },
                        })];
                    case 4:
                        storesRes = _a.sent();
                        storesData = storesRes.data.data;
                        if (!storesData.length) {
                            this.render("\n            <div class=\"modal-error\">\n              <h3>No store was created!</h3>\n              <em>(Please create a store first)</em>\n            </div>\n          ");
                            throw new Error("CANCEL");
                        }
                        this.render("\n        <form class=\"modal-form\" data-id=\"".concat(productId || "", "\">\n          <div class=\"form-control\">\n            <label>Store</label>\n              <select id=\"storeSelect\" name=\"store\">\n                ").concat(storesData === null || storesData === void 0 ? void 0 : storesData.map(function (store) {
                            return "\n                    <option\n                    data-id=\"".concat(store._id, "\"\n                    value=\"").concat(store.name, "\"\n                    ").concat(store._id === storeValue_1 ? "selected" : "", ">\n                      ").concat(store.name, "\n                    </option>\n                  ");
                        }).join(""), "\n              </select>\n          </div>\n          <div class=\"form-control\">\n              <label>Product Name</label>\n              <input type=\"text\" name=\"name\" value=\"").concat(nameValue || "", "\" placeholder=\"Put the name here...\">\n          </div>\n          <div class=\"form-control\">\n              <label>Product Description</label>\n              <textarea \n               type=\"text\"\n               name=\"description\"\n               rows=\"6\"\n               placeholder=\"Put the description here...\"\n              >").concat(descriptionValue || "", "</textarea>\n          </div>\n          <div class=\"form-control\">\n              <label>Product Photo</label>\n                <div id=\"photoInputs\">\n                  ").concat(photosValue
                            .map(function (photoValue, i) {
                            return "\n                      <input \n                      type=\"text\"\n                      value=\"".concat(photoValue, "\"\n                      name=\"photo").concat(i + 1, "\"\n                      placeholder=\"Put the photo url here...\"\n                      ").concat(i === 0 ? "required" : "", "\n                      >\n                    ");
                        })
                            .join("") ||
                            "<input \n                    type=\"text\"\n                    name=\"photo1\"\n                    placeholder=\"Put the photo url here...\"\n                    >", "\n                </div>\n                <button class=\"btn btn-primary\" id=\"addPhoto\">New Photo</button>\n          </div>\n          <div class=\"form-control\">\n              <label>Product Price</label>\n              <input\n               type=\"number\"\n               name=\"price\"\n               value=\"").concat(priceValue, "\"\n               step=\".01\"\n               min=\"1\"\n               placeholder=\"Put the price with euros here...\"\n              >\n          </div>\n          <div class=\"form-control\">\n              <label>Product Delivery Time</label>\n              <input\n               type=\"number\"\n               name=\"delivery\"\n               value=\"").concat(deliveryValue, "\"\n               min=\"1\"\n               placeholder=\"Put the delivery time here as number of days...\"\n              >\n          </div>\n          <div id=\"availabilityCheck\" class=\"form-control\">\n              <label>Availability</label>\n              <div>\n                <input type=\"radio\" id=\"inStock\" name=\"availability\" value=\"In Stock\" ").concat(availabilityValue === "Out of Stock" ? "" : "checked", ">\n                <label class=\"radio-label\" for=\"inStock\">In Stock</label>\n              </div>\n              <div>\n                <input type=\"radio\" id=\"outOfStock\" name=\"availability\" value=\"Out of Stock\" ").concat(availabilityValue === "Out of Stock" ? "checked" : "", ">\n                <label class=\"radio-label\" for=\"outOfStock\">Out of Stock</label>\n              </div>\n          </div>\n          <div class=\"form-control\">\n              <label>Product Fid Points</label>\n              <input type=\"number\" name=\"fidPoints\" value=\"").concat(fidPointsValue || "", "\" placeholder=\"Put the fid points here...\">\n          </div>\n          <div class=\"form-submit\">\n              ").concat(buttons, "\n          </div>\n        </form>\n    "));
                        return [3, 6];
                    case 5:
                        err_1 = _a.sent();
                        console.error(err_1);
                        return [3, 6];
                    case 6: return [2];
                }
            });
        });
    };
    ProductModal.prototype.selectChangeHandler = function () {
        var selectedOption = this.select.options[this.select.selectedIndex];
        if (!selectedOption) {
            this.select.options[0].selected = true;
            selectedOption = this.select.options[0];
        }
        this.select.dataset.id = selectedOption.dataset.id;
    };
    ProductModal.prototype.submitHandler = function (e) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var storeInput, nameInput, descriptionInput, photoInputs, priceInput, deliveryInput, fidPointsInput, inStockInput, submitBtn, productId, err_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        e.preventDefault();
                        storeInput = this.form.querySelector("select[name=\"store\"]");
                        nameInput = this.form.querySelector("input[name=\"name\"]");
                        descriptionInput = this.form.querySelector("textarea[name=\"description\"]");
                        photoInputs = Array.from(this.photoInputs.querySelectorAll("input"));
                        priceInput = this.form.querySelector("input[name=\"price\"]");
                        deliveryInput = this.form.querySelector("input[name=\"delivery\"]");
                        fidPointsInput = this.form.querySelector("input[name=\"fidPoints\"]");
                        inStockInput = this.form.querySelector("input[id=\"inStock\"]");
                        submitBtn = this.form.querySelector("button[type=\"submit\"]");
                        submitBtn.textContent = "Submitting";
                        submitBtn.disabled = true;
                        productId = (_a = this.form) === null || _a === void 0 ? void 0 : _a.dataset.id;
                        return [4, (0, axios_1.default)({
                                url: this.type === "CREATABLE"
                                    ? "/api/v1/products"
                                    : "/api/v1/products/".concat(productId),
                                method: this.type === "CREATABLE" ? "POST" : "PATCH",
                                headers: { "Content-Type": "application/json" },
                                data: {
                                    store: storeInput.dataset.id,
                                    name: nameInput.value,
                                    description: descriptionInput.value.trim(),
                                    photos: photoInputs
                                        .filter(function (input) { return input.value !== ""; })
                                        .map(function (input) { return input.value; }),
                                    price: +priceInput.value,
                                    deliveryTime: +deliveryInput.value,
                                    fidPoints: +fidPointsInput.value,
                                    availability: inStockInput.checked ? "In Stock" : "Out of Stock",
                                },
                            })];
                    case 1:
                        _b.sent();
                        this.closeHandler();
                        return [3, 3];
                    case 2:
                        err_2 = _b.sent();
                        this.closeHandler();
                        return [3, 3];
                    case 3: return [2];
                }
            });
        });
    };
    ProductModal.prototype.addPhotoHandler = function (e) {
        e.preventDefault();
        var prevInput = this.photoInputs.lastElementChild;
        if (!(prevInput === null || prevInput === void 0 ? void 0 : prevInput.value) || !(prevInput === null || prevInput === void 0 ? void 0 : prevInput.value.trim())) {
            prevInput.focus();
            return;
        }
        ++this.photoNumber;
        var photoInput = document.createElement("input");
        photoInput.type = "text";
        photoInput.name = "photo".concat(this.photoNumber);
        photoInput.placeholder = "Put the photo url here...";
        this.photoInputs.insertAdjacentElement("beforeend", photoInput);
    };
    ProductModal.prototype.deleteDoc = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4, (0, axios_1.default)({
                            url: "/api/v1/products/".concat((_a = this.form) === null || _a === void 0 ? void 0 : _a.dataset.id),
                            method: "DELETE",
                        })];
                    case 1:
                        _b.sent();
                        return [2];
                }
            });
        });
    };
    return ProductModal;
}(Modal_1.default));
exports["default"] = ProductModal;


/***/ }),

/***/ "./client/modals/Reward.ts":
/*!*********************************!*\
  !*** ./client/modals/Reward.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var axios_1 = __importDefault(__webpack_require__(/*! axios */ "./node_modules/axios/index.js"));
var Modal_1 = __importDefault(__webpack_require__(/*! ./Modal */ "./client/modals/Modal.ts"));
var RewardModal = (function (_super) {
    __extends(RewardModal, _super);
    function RewardModal(reloadFn, rewardId) {
        var _this = _super.call(this, "New Reward", rewardId ? "EDITABLE" : "CREATABLE", reloadFn) || this;
        _this.load(rewardId)
            .then(function () {
            _this.form = document.querySelector(".modal-form");
            _this.select = document.getElementById("productSelect");
            _this.selectChangeHandler();
            _this.select.addEventListener("change", _this.selectChangeHandler.bind(_this));
            _this.form.addEventListener("submit", _this.submitHandler.bind(_this));
        })
            .catch(function (_) {
            return;
        });
        return _this;
    }
    RewardModal.prototype.load = function (rewardId) {
        return __awaiter(this, void 0, void 0, function () {
            var buttons, productValue_1, fidPointsValue, data, doc, productsRes, productsData, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        buttons = void 0;
                        productValue_1 = "";
                        fidPointsValue = 0;
                        if (!rewardId) return [3, 2];
                        buttons = "\n        <button type=\"submit\" class=\"btn btn-primary\">Edit</button>\n        <button type=\"button\" id=\"deleteDoc\" class=\"btn btn-danger\">Delete</button>\n      ";
                        return [4, (0, axios_1.default)({
                                url: "/api/v1/rewards/".concat(rewardId),
                                method: "GET",
                            })];
                    case 1:
                        data = (_a.sent()).data;
                        doc = data.doc;
                        productValue_1 = doc.product._id;
                        fidPointsValue = doc.requiredPoints;
                        return [3, 3];
                    case 2:
                        buttons = "<button type=\"submit\" class=\"btn btn-primary\">Submit</button>";
                        _a.label = 3;
                    case 3: return [4, (0, axios_1.default)({
                            url: "/api/v1/products",
                            method: "GET",
                            params: {
                                all: true,
                            },
                        })];
                    case 4:
                        productsRes = _a.sent();
                        productsData = productsRes.data.data;
                        if (!productsData.length) {
                            this.render("\n            <div class=\"modal-error\">\n              <h3>No product was created!</h3>\n              <em>(Please create a product first)</em>\n            </div>\n          ");
                            throw new Error("CANCEL");
                        }
                        this.render("\n        <form class=\"modal-form\" data-id=\"".concat(rewardId || "", "\">\n          <div class=\"form-control\">\n              <label>Product To Be Rewarded</label>\n              <select name=\"product\" id=\"productSelect\">\n                ").concat(productsData === null || productsData === void 0 ? void 0 : productsData.map(function (product) {
                            return "\n                    <option\n                    data-id=\"".concat(product._id, "\"\n                    value=\"").concat(product.name, "\"\n                    ").concat(product._id === productValue_1 ? "selected" : "", ">\n                      ").concat(product.name, "\n                    </option>\n                  ");
                        }).join(""), "\n              </select>\n          </div>\n          <div class=\"form-control\">\n              <label>Required Fid Points</label>\n              <input \n               type=\"number\"\n               name=\"fidPoints\"\n               value=\"").concat(fidPointsValue || "", "\"\n               placeholder=\"Put the required fid points here...\">\n          </div>\n          <div class=\"form-submit\">\n              ").concat(buttons, "\n          </div>\n        </form>\n    "));
                        return [3, 6];
                    case 5:
                        err_1 = _a.sent();
                        console.error(err_1);
                        return [3, 6];
                    case 6: return [2];
                }
            });
        });
    };
    RewardModal.prototype.selectChangeHandler = function () {
        var selectedOption = this.select.options[this.select.selectedIndex];
        if (!selectedOption) {
            this.select.options[0].selected = true;
            selectedOption = this.select.options[0];
        }
        this.select.dataset.id = selectedOption.dataset.id;
    };
    RewardModal.prototype.submitHandler = function (e) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var productInput, fidPointsInput, submitBtn, rewardId, res, err_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        e.preventDefault();
                        productInput = this.form.querySelector("select[name=\"product\"]");
                        fidPointsInput = this.form.querySelector("input[name=\"fidPoints\"]");
                        submitBtn = this.form.querySelector("button[type=\"submit\"]");
                        submitBtn.textContent = "Submitting";
                        submitBtn.disabled = true;
                        rewardId = (_a = this.form) === null || _a === void 0 ? void 0 : _a.dataset.id;
                        return [4, (0, axios_1.default)({
                                url: this.type === "CREATABLE"
                                    ? "/api/v1/rewards"
                                    : "/api/v1/rewards/".concat(rewardId),
                                method: this.type === "CREATABLE" ? "POST" : "PATCH",
                                headers: { "Content-Type": "application/json" },
                                data: {
                                    product: productInput.dataset.id,
                                    requiredPoints: fidPointsInput.value,
                                },
                            })];
                    case 1:
                        res = _b.sent();
                        console.log(res);
                        this.closeHandler();
                        return [3, 3];
                    case 2:
                        err_2 = _b.sent();
                        console.log(err_2);
                        this.closeHandler();
                        return [3, 3];
                    case 3: return [2];
                }
            });
        });
    };
    RewardModal.prototype.deleteDoc = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4, (0, axios_1.default)({
                            url: "/api/v1/rewards/".concat((_a = this.form) === null || _a === void 0 ? void 0 : _a.dataset.id),
                            method: "DELETE",
                        })];
                    case 1:
                        _b.sent();
                        return [2];
                }
            });
        });
    };
    return RewardModal;
}(Modal_1.default));
exports["default"] = RewardModal;


/***/ }),

/***/ "./client/modals/Store.ts":
/*!********************************!*\
  !*** ./client/modals/Store.ts ***!
  \********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var axios_1 = __importDefault(__webpack_require__(/*! axios */ "./node_modules/axios/index.js"));
var validator_1 = __importDefault(__webpack_require__(/*! validator */ "./node_modules/validator/index.js"));
var Modal_1 = __importDefault(__webpack_require__(/*! ./Modal */ "./client/modals/Modal.ts"));
var StoreModal = (function (_super) {
    __extends(StoreModal, _super);
    function StoreModal(reloadFn, storeId) {
        var _this = _super.call(this, "New Store", storeId ? "EDITABLE" : "CREATABLE", reloadFn) || this;
        _this.load(storeId).then(function () {
            _this.form = document.querySelector(".modal-form");
            _this.form.addEventListener("submit", _this.submitHandler.bind(_this));
        });
        return _this;
    }
    StoreModal.prototype.load = function (storeId) {
        return __awaiter(this, void 0, void 0, function () {
            var buttons, nameValue, locationValue, pathValue, logoValue, data, doc, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        buttons = void 0;
                        nameValue = void 0;
                        locationValue = void 0;
                        pathValue = void 0;
                        logoValue = void 0;
                        if (!storeId) return [3, 2];
                        buttons = "\n        <button type=\"submit\" class=\"btn btn-primary\">Edit</button>\n        <button type=\"button\" id=\"deleteDoc\" class=\"btn btn-danger\">Delete</button>\n      ";
                        return [4, (0, axios_1.default)({
                                url: "/api/v1/stores/".concat(storeId),
                                method: "GET",
                            })];
                    case 1:
                        data = (_a.sent()).data;
                        doc = data.doc;
                        nameValue = doc.name;
                        locationValue = doc.location;
                        pathValue = doc.subUrl;
                        logoValue = doc.logo;
                        return [3, 3];
                    case 2:
                        buttons = "<button type=\"submit\" class=\"btn btn-primary\">Submit</button>";
                        _a.label = 3;
                    case 3:
                        this.render("\n      <form class=\"modal-form\" data-id=\"".concat(storeId || "", "\">\n          <div class=\"form-control\">\n              <label>Store Name *</label>\n              <input type=\"text\" name=\"name\" value=\"").concat(nameValue || "", "\" placeholder=\"Put the name here...\" required>\n          </div>\n          <div class=\"form-control\">\n              <label>Store Location *</label>\n              <input type=\"text\" name=\"location\" value=\"").concat(locationValue || "", "\" placeholder=\"Put the location here...\" required>\n          </div>\n          <div class=\"form-control\">\n              <label>Store Url *</label>\n              <div class=\"input-group\">\n                  <input type=\"text\" class=\"inline-first\" value=\"https://fid786.com/stores/\" required disabled>\n                  <input type=\"text\" name=\"path\" value=\"").concat(pathValue || "", "\" class=\"inline-second\" placeholder=\"Put the path here...\">\n              </div>\n          </div>\n          <div class=\"form-control\">\n              <label>Store Logo *</label>\n              <input type=\"text\" name=\"logo\" value=\"").concat(logoValue || "", "\" placeholder=\"Put the logo url here...\" required>\n          </div>\n          <div class=\"form-submit\">\n              ").concat(buttons, "\n          </div>\n      </form>\n    "));
                        return [3, 5];
                    case 4:
                        err_1 = _a.sent();
                        console.error(err_1);
                        return [3, 5];
                    case 5: return [2];
                }
            });
        });
    };
    StoreModal.prototype.submitHandler = function (e) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var nameInput, locationInput, pathInput, logoInput, submitBtn, storeId, err_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        e.preventDefault();
                        nameInput = this.form.querySelector("input[name=\"name\"]");
                        locationInput = this.form.querySelector("input[name=\"location\"]");
                        pathInput = this.form.querySelector("input[name=\"path\"]");
                        logoInput = this.form.querySelector("input[name=\"logo\"]");
                        submitBtn = this.form.querySelector("button[type=\"submit\"]");
                        if (!this.validateForm(pathInput)) {
                            return [2];
                        }
                        submitBtn.textContent = "Submitting";
                        submitBtn.disabled = true;
                        storeId = (_a = this.form) === null || _a === void 0 ? void 0 : _a.dataset.id;
                        return [4, (0, axios_1.default)({
                                url: storeId ? "/api/v1/stores/".concat(storeId) : "/api/v1/stores",
                                method: storeId ? "PATCH" : "POST",
                                headers: { "Content-Type": "application/json" },
                                data: {
                                    name: nameInput.value,
                                    location: locationInput.value,
                                    subUrl: pathInput.value,
                                    logo: logoInput.value,
                                },
                            })];
                    case 1:
                        _b.sent();
                        this.closeHandler();
                        return [3, 3];
                    case 2:
                        err_2 = _b.sent();
                        console.log(err_2);
                        this.closeHandler();
                        return [3, 3];
                    case 3: return [2];
                }
            });
        });
    };
    StoreModal.prototype.deleteDoc = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4, (0, axios_1.default)({
                            url: "/api/v1/stores/".concat((_a = this.form) === null || _a === void 0 ? void 0 : _a.dataset.id),
                            method: "DELETE",
                        })];
                    case 1:
                        _b.sent();
                        return [2];
                }
            });
        });
    };
    StoreModal.prototype.validateForm = function (pathInput) {
        var _a, _b;
        if (this.renderedError) {
            return false;
        }
        if (!validator_1.default.isAlphanumeric(pathInput.value)) {
            this.renderedError = this.createError("The url path must be alphanumeric.");
            (_b = (_a = pathInput.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.appendChild(this.renderedError);
            pathInput.addEventListener("focus", this.pathInputFocusHandler.bind(this));
            return false;
        }
        return true;
    };
    StoreModal.prototype.pathInputFocusHandler = function () {
        if (!this.renderedError) {
            return;
        }
        this.renderedError.remove();
        this.renderedError = undefined;
    };
    return StoreModal;
}(Modal_1.default));
exports["default"] = StoreModal;


/***/ }),

/***/ "./client/sections/Home.ts":
/*!*********************************!*\
  !*** ./client/sections/Home.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var axios_1 = __importDefault(__webpack_require__(/*! axios */ "./node_modules/axios/index.js"));
var Section_1 = __importDefault(__webpack_require__(/*! ./Section */ "./client/sections/Section.ts"));
var HomeSection = (function (_super) {
    __extends(HomeSection, _super);
    function HomeSection() {
        var _this = _super.call(this, "HOME") || this;
        (0, axios_1.default)({
            url: "/api/v1/overview",
            method: "GET",
        })
            .then(function (res) {
            var data = res.data.data;
            _this.render("\n              <section class=\"dashboard-section\" id=\"home\">\n                  <div class=\"dashboard-section__top\">\n                      <h2 class=\"dashboard-section__title\">Home</h2>\n                  </div>\n                  <div class=\"dashboard-section__cards\">\n                      <div class=\"dashboard-section__card home-card card-red\">\n                          <h3 class=\"home-card__title\">Total Stores</h3>\n                          <p class=\"home-card__content\">".concat(data.numberOfStores, "</p>\n                      </div>\n                      <div class=\"dashboard-section__card home-card card-blue\">\n                          <h3 class=\"home-card__title\">Total Products</h3>\n                          <p class=\"home-card__content\">").concat(data.numberOfProducts, "</p>\n                      </div>\n                      <div class=\"dashboard-section__card home-card card-yellow\">\n                          <h3 class=\"home-card__title\">Total Orders</h3>\n                          <p class=\"home-card__content\">").concat(data.numberOfOrders, "</p>\n                      </div>\n                  </div>\n              </section>\n          "));
        })
            .catch(function (err) {
            console.log(err);
        });
        return _this;
    }
    return HomeSection;
}(Section_1.default));
exports["default"] = HomeSection;


/***/ }),

/***/ "./client/sections/Order.ts":
/*!**********************************!*\
  !*** ./client/sections/Order.ts ***!
  \**********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var axios_1 = __importDefault(__webpack_require__(/*! axios */ "./node_modules/axios/index.js"));
var formatDate_1 = __importDefault(__webpack_require__(/*! ../helpers/formatDate */ "./client/helpers/formatDate.ts"));
var Order_1 = __importDefault(__webpack_require__(/*! ../modals/Order */ "./client/modals/Order.ts"));
var Section_1 = __importDefault(__webpack_require__(/*! ./Section */ "./client/sections/Section.ts"));
var OrderSection = (function (_super) {
    __extends(OrderSection, _super);
    function OrderSection() {
        var _this = _super.call(this, "ORDER") || this;
        (0, axios_1.default)({
            url: "/api/v1/orders",
            method: "GET",
        }).then(function (res) {
            var _a;
            var data = res.data.data;
            _this.render("\n          <section class=\"dashboard-section\" id=\"orders\">\n              <div class=\"dashboard-section__top\">\n                  <h2 class=\"dashboard-section__title\">Manage Orders</h2>\n              </div>\n              <div class=\"dashboard-section__overview\"><em>(Total: ".concat(data.length, ")</em></div>\n              <div id=\"orderCards\" class=\"order-cards\">\n                ").concat(_this.renderOrder(data), "\n              </div>\n          </section>\n      "));
            (_a = document
                .getElementById("orderCards")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", _this.orderCardClickHandler.bind(_this));
        });
        return _this;
    }
    OrderSection.prototype.renderOrder = function (data) {
        var orders = data.map(function (order) {
            var orderDate = (0, formatDate_1.default)(order.createdAt);
            return "\n            <div class=\"order-card\" data-id=\"".concat(order._id, "\">\n                <div>\n                    <i class=\"bi bi-person-circle\"></i>\n                    <span>").concat(order.buyer.username, "</span>\n                </div>\n                <div>\n                    <span>").concat(order.product.name, "</span>\n                    \u00B7\n                    <span>").concat(orderDate, "</span>\n                </div>\n                <span>").concat(order.totalPrice > 0 ? "\u20AC".concat(order.totalPrice) : "FREE", "</span>\n                <span>").concat(order.product.deliveryTime, " Days Delivery</span>\n                <span class=\"order-card__").concat(order.state, "\">").concat(order.state, "</span>\n            </div>\n        ");
        });
        return orders.join("");
    };
    OrderSection.prototype.orderCardClickHandler = function (e) {
        var target = e.target;
        var orderCard = target.closest(".order-card");
        if (!orderCard) {
            return;
        }
        new Order_1.default(function () { return new OrderSection(); }, orderCard.dataset.id);
    };
    return OrderSection;
}(Section_1.default));
exports["default"] = OrderSection;


/***/ }),

/***/ "./client/sections/Product.ts":
/*!************************************!*\
  !*** ./client/sections/Product.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var axios_1 = __importDefault(__webpack_require__(/*! axios */ "./node_modules/axios/index.js"));
var Section_1 = __importDefault(__webpack_require__(/*! ./Section */ "./client/sections/Section.ts"));
var formatDate_1 = __importDefault(__webpack_require__(/*! ../helpers/formatDate */ "./client/helpers/formatDate.ts"));
var ProductSection = (function (_super) {
    __extends(ProductSection, _super);
    function ProductSection() {
        var _this = _super.call(this, "PRODUCT", function () { return new ProductSection(); }) || this;
        (0, axios_1.default)({
            url: "/api/v1/products",
            method: "GET",
        }).then(function (res) {
            var data = res.data.data;
            _this.render("\n          <section class=\"dashboard-section\" id=\"products\">\n              <div class=\"dashboard-section__top\">\n                  <h2 class=\"dashboard-section__title\">Manage Products</h2>\n                  <button class=\"btn btn-primary\" id=\"newPRODUCT\">New Product</button>\n              </div>\n              <div class=\"dashboard-section__overview\"><em>(Total: ".concat(data.length, ")</em></div>\n              <div class=\"dashboard-section__cards\">\n                    ").concat(_this.renderProduct(data), "\n              </div>\n          </section>\n        "));
        });
        return _this;
    }
    ProductSection.prototype.renderProduct = function (data) {
        var products = data.map(function (product) {
            var date = (0, formatDate_1.default)(product.createdAt);
            var availability = product.availability;
            return "\n              <a \n                href=\"/stores/".concat(product.store.subUrl, "/").concat(product._id, "\"\n                target=\"_blank\" rel=\"noopener noreferrer\"\n              >\n                <div \n                 data-id=\"").concat(product._id, "\"\n                 data-type=\"PRODUCT\"\n                 class=\"dashboard-section__card product-card\"\n                >\n                    <div class=\"product-card__img\">\n                        <img src=\"").concat(product.photos[0], "\" />\n                    </div>\n                    <div class=\"product-card__info\">\n                        <div class=\"product-card__top\">\n                            <span class=\"product-card__title\">").concat(product.name, "</span>\n                            <span \n                             class=\"product-card__").concat(availability
                .toLowerCase()
                .replace(/\s/g, "-"), "\"\n                            >\n                             ").concat(availability === "In Stock"
                ? "<i class=\"bi bi-check-lg\"></i>"
                : "<i class=\"bi bi-exclamation-circle\"></i>", "\n                             ").concat(availability, "\n                            </span>\n                        </div>\n                        <span class=\"product-card__store\">").concat(product.store.name, "</span>\n                        \u00B7\n                        <span class=\"product-card__date\">").concat(date, "</span>\n                        <div class=\"product-card__bottom\">\n                            <span class=\"product-card__price\">\u20AC").concat(product.price, "</span>\n                            <button class=\"btn btn-primary card-btn\">Actions</button>\n                        </div>\n                    </div>\n                </div>\n              </a>\n          ");
        });
        for (var i = 0; i <= products.length % 3; i++) {
            products.push("<div class=\"wrapper\"></div>");
        }
        return products.join("");
    };
    return ProductSection;
}(Section_1.default));
exports["default"] = ProductSection;


/***/ }),

/***/ "./client/sections/Reward.ts":
/*!***********************************!*\
  !*** ./client/sections/Reward.ts ***!
  \***********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var axios_1 = __importDefault(__webpack_require__(/*! axios */ "./node_modules/axios/index.js"));
var Section_1 = __importDefault(__webpack_require__(/*! ./Section */ "./client/sections/Section.ts"));
var formatDate_1 = __importDefault(__webpack_require__(/*! ../helpers/formatDate */ "./client/helpers/formatDate.ts"));
var RewardSection = (function (_super) {
    __extends(RewardSection, _super);
    function RewardSection() {
        var _this = _super.call(this, "REWARD", function () { return new RewardSection(); }) || this;
        (0, axios_1.default)({
            url: "/api/v1/rewards",
            method: "GET",
        }).then(function (res) {
            var data = res.data.data;
            _this.render("\n            <section class=\"dashboard-section\" id=\"reward\">\n                <div class=\"dashboard-section__top\">\n                    <h2 class=\"dashboard-section__title\">Manage Rewards</h2>\n                    <button class=\"btn btn-primary\" id=\"newREWARD\">New Reward</button>\n                </div>\n                <div class=\"dashboard-section__overview\"><em>(Total: ".concat(data.length, ")</em></div>\n                <div class=\"dashboard-section__cards\">\n                    ").concat(_this.renderReward(data), "\n                </div>\n            </section>\n        "));
        });
        return _this;
    }
    RewardSection.prototype.renderReward = function (data) {
        var rewards = data.map(function (reward) {
            var date = (0, formatDate_1.default)(reward.createdAt);
            var availability = reward.product.availability;
            return "\n        <a \n        href=\"/stores/".concat(reward.product.store.subUrl, "/").concat(reward.product._id, "?type=reward\"\n        target=\"_blank\" rel=\"noopener noreferrer\"\n        >\n          <div \n           data-id=\"").concat(reward._id, "\"\n           data-type=\"REWARD\"\n           class=\"dashboard-section__card product-card\"\n          >\n              <div class=\"product-card__img\">\n                  <img src=\"").concat(reward.product.photos[0], "\" />\n              </div>\n              <div class=\"product-card__info\">\n                  <div class=\"product-card__top\">\n                      <span class=\"product-card__title\">").concat(reward.product.name, "</span>\n                      <span \n                       class=\"product-card__").concat(availability
                .toLowerCase()
                .replace(/\s/g, "-"), "\"\n                      >\n                       ").concat(availability === "In Stock"
                ? "<i class=\"bi bi-check-lg\"></i>"
                : "<i class=\"bi bi-exclamation-circle\"></i>", "\n                       ").concat(availability, "\n                      </span>\n                  </div>\n                  <span class=\"product-card__store\">").concat(reward.product.store.name, "</span>\n                  \u00B7\n                  <span class=\"product-card__date\">").concat(date, "</span>\n                  <div class=\"product-card__bottom\">\n                      <span class=\"product-card__points\">\n                          ").concat(reward.requiredPoints, " Points\n                      </span>\n                      <button class=\"btn btn-primary card-btn\">Actions</button>\n                  </div>\n              </div>\n          </div>\n        </a>\n      ");
        });
        for (var i = 0; i <= rewards.length % 3; i++) {
            rewards.push("<div class=\"wrapper\"></div>");
        }
        return rewards.join("");
    };
    return RewardSection;
}(Section_1.default));
exports["default"] = RewardSection;


/***/ }),

/***/ "./client/sections/Section.ts":
/*!************************************!*\
  !*** ./client/sections/Section.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var Product_1 = __importDefault(__webpack_require__(/*! ../modals/Product */ "./client/modals/Product.ts"));
var Reward_1 = __importDefault(__webpack_require__(/*! ../modals/Reward */ "./client/modals/Reward.ts"));
var Store_1 = __importDefault(__webpack_require__(/*! ../modals/Store */ "./client/modals/Store.ts"));
var Section = (function () {
    function Section(type, reloadFn) {
        this.type = type;
        this.reloadFn = reloadFn;
        this.loadingSpinner = "\n    <div class=\"loading-spinner__dashboard\"><div class=\"loading-spinner\"></div></div>\n  ";
        this.sectionContainer = document.getElementById("dashboardContent");
        this.sectionContainer.innerHTML = this.loadingSpinner;
    }
    Section.prototype.render = function (markup) {
        var _a, _b;
        this.sectionContainer.innerHTML = markup;
        this.cardsContainer = document.querySelector(".dashboard-section__cards");
        (_a = this.cardsContainer) === null || _a === void 0 ? void 0 : _a.addEventListener("click", this.cardClickHandler.bind(this));
        if (this.type !== "HOME" && this.type !== "ORDER") {
            (_b = document
                .getElementById("new".concat(this.type))) === null || _b === void 0 ? void 0 : _b.addEventListener("click", this.renderModalHandler.bind(this));
        }
    };
    Section.prototype.renderModalHandler = function () {
        switch (this.type) {
            case "STORE":
                new Store_1.default(this.reloadFn);
                break;
            case "PRODUCT":
                new Product_1.default(this.reloadFn);
                break;
            case "REWARD":
                new Reward_1.default(this.reloadFn);
                break;
        }
    };
    Section.prototype.cardClickHandler = function (e) {
        var target = e.target;
        if (!target.classList.contains("card-btn")) {
            return;
        }
        e.preventDefault();
        var card = target.closest(".dashboard-section__card");
        switch (card === null || card === void 0 ? void 0 : card.dataset.type) {
            case "STORE":
                new Store_1.default(this.reloadFn, card === null || card === void 0 ? void 0 : card.dataset.id);
                break;
            case "PRODUCT":
                new Product_1.default(this.reloadFn, card === null || card === void 0 ? void 0 : card.dataset.id);
                break;
            case "REWARD":
                new Reward_1.default(this.reloadFn, card === null || card === void 0 ? void 0 : card.dataset.id);
                break;
        }
    };
    return Section;
}());
exports["default"] = Section;


/***/ }),

/***/ "./client/sections/Store.ts":
/*!**********************************!*\
  !*** ./client/sections/Store.ts ***!
  \**********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var axios_1 = __importDefault(__webpack_require__(/*! axios */ "./node_modules/axios/index.js"));
var Section_1 = __importDefault(__webpack_require__(/*! ./Section */ "./client/sections/Section.ts"));
var formatDate_1 = __importDefault(__webpack_require__(/*! ../helpers/formatDate */ "./client/helpers/formatDate.ts"));
var StoreSection = (function (_super) {
    __extends(StoreSection, _super);
    function StoreSection() {
        var _this = _super.call(this, "STORE", function () { return new StoreSection(); }) || this;
        (0, axios_1.default)({
            url: "/api/v1/stores",
            method: "GET",
        })
            .then(function (res) {
            var data = res.data.data;
            _this.render("\n            <section class=\"dashboard-section\" id=\"stores\">\n                <div class=\"dashboard-section__top\">\n                    <h2 class=\"dashboard-section__title\">Manage Stores</h2>\n                    <button class=\"btn btn-primary\" id=\"newSTORE\">New Store</button>\n                </div>\n                <div class=\"dashboard-section__overview\"><em>(Total: ".concat(data.length, ")</em></div>\n                <div class=\"dashboard-section__cards\">\n                    ").concat(_this.renderStore(data), "\n                </div>\n            </section>\n          "));
        })
            .catch(function (err) {
            console.error(err);
        });
        return _this;
    }
    StoreSection.prototype.renderStore = function (data) {
        var stores = data.map(function (store) {
            var date = (0, formatDate_1.default)(store.createdAt);
            return "\n            <a href=\"/stores/".concat(store.subUrl, "\" target=\"_blank\" rel=\"noopener noreferrer\">\n              <div data-id=\"").concat(store._id, "\" data-type=\"STORE\" class=\"dashboard-section__card store-card\">\n                  <div class=\"store-card__top\">\n                      <div class=\"store-card__info\">\n                          <span class=\"store-card__title\">").concat(store.name, "</span>\n                          <span class=\"store-card__location\">").concat(store.location, "</span>\n                          \u00B7\n                          <span class=\"store-card__date\">").concat(date, "</span>\n                      </div>\n                      <div class=\"store-card__actions\">\n                          <button class=\"btn btn-primary card-btn\">Actions</button>\n                      </div>\n                  </div>\n                  <div class=\"store-card__logo\">\n                      <img class=\"store-card__img\" src=\"").concat(store.logo, "\">\n                  </div>\n              </div>\n            </a>\n        ");
        });
        for (var i = 0; i <= stores.length % 3; i++) {
            stores.push("<div class=\"wrapper\"></div>");
        }
        return stores.join("");
    };
    return StoreSection;
}(Section_1.default));
exports["default"] = StoreSection;


/***/ }),

/***/ "./node_modules/validator/index.js":
/*!*****************************************!*\
  !*** ./node_modules/validator/index.js ***!
  \*****************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _toDate = _interopRequireDefault(__webpack_require__(/*! ./lib/toDate */ "./node_modules/validator/lib/toDate.js"));

var _toFloat = _interopRequireDefault(__webpack_require__(/*! ./lib/toFloat */ "./node_modules/validator/lib/toFloat.js"));

var _toInt = _interopRequireDefault(__webpack_require__(/*! ./lib/toInt */ "./node_modules/validator/lib/toInt.js"));

var _toBoolean = _interopRequireDefault(__webpack_require__(/*! ./lib/toBoolean */ "./node_modules/validator/lib/toBoolean.js"));

var _equals = _interopRequireDefault(__webpack_require__(/*! ./lib/equals */ "./node_modules/validator/lib/equals.js"));

var _contains = _interopRequireDefault(__webpack_require__(/*! ./lib/contains */ "./node_modules/validator/lib/contains.js"));

var _matches = _interopRequireDefault(__webpack_require__(/*! ./lib/matches */ "./node_modules/validator/lib/matches.js"));

var _isEmail = _interopRequireDefault(__webpack_require__(/*! ./lib/isEmail */ "./node_modules/validator/lib/isEmail.js"));

var _isURL = _interopRequireDefault(__webpack_require__(/*! ./lib/isURL */ "./node_modules/validator/lib/isURL.js"));

var _isMACAddress = _interopRequireDefault(__webpack_require__(/*! ./lib/isMACAddress */ "./node_modules/validator/lib/isMACAddress.js"));

var _isIP = _interopRequireDefault(__webpack_require__(/*! ./lib/isIP */ "./node_modules/validator/lib/isIP.js"));

var _isIPRange = _interopRequireDefault(__webpack_require__(/*! ./lib/isIPRange */ "./node_modules/validator/lib/isIPRange.js"));

var _isFQDN = _interopRequireDefault(__webpack_require__(/*! ./lib/isFQDN */ "./node_modules/validator/lib/isFQDN.js"));

var _isDate = _interopRequireDefault(__webpack_require__(/*! ./lib/isDate */ "./node_modules/validator/lib/isDate.js"));

var _isBoolean = _interopRequireDefault(__webpack_require__(/*! ./lib/isBoolean */ "./node_modules/validator/lib/isBoolean.js"));

var _isLocale = _interopRequireDefault(__webpack_require__(/*! ./lib/isLocale */ "./node_modules/validator/lib/isLocale.js"));

var _isAlpha = _interopRequireWildcard(__webpack_require__(/*! ./lib/isAlpha */ "./node_modules/validator/lib/isAlpha.js"));

var _isAlphanumeric = _interopRequireWildcard(__webpack_require__(/*! ./lib/isAlphanumeric */ "./node_modules/validator/lib/isAlphanumeric.js"));

var _isNumeric = _interopRequireDefault(__webpack_require__(/*! ./lib/isNumeric */ "./node_modules/validator/lib/isNumeric.js"));

var _isPassportNumber = _interopRequireDefault(__webpack_require__(/*! ./lib/isPassportNumber */ "./node_modules/validator/lib/isPassportNumber.js"));

var _isPort = _interopRequireDefault(__webpack_require__(/*! ./lib/isPort */ "./node_modules/validator/lib/isPort.js"));

var _isLowercase = _interopRequireDefault(__webpack_require__(/*! ./lib/isLowercase */ "./node_modules/validator/lib/isLowercase.js"));

var _isUppercase = _interopRequireDefault(__webpack_require__(/*! ./lib/isUppercase */ "./node_modules/validator/lib/isUppercase.js"));

var _isIMEI = _interopRequireDefault(__webpack_require__(/*! ./lib/isIMEI */ "./node_modules/validator/lib/isIMEI.js"));

var _isAscii = _interopRequireDefault(__webpack_require__(/*! ./lib/isAscii */ "./node_modules/validator/lib/isAscii.js"));

var _isFullWidth = _interopRequireDefault(__webpack_require__(/*! ./lib/isFullWidth */ "./node_modules/validator/lib/isFullWidth.js"));

var _isHalfWidth = _interopRequireDefault(__webpack_require__(/*! ./lib/isHalfWidth */ "./node_modules/validator/lib/isHalfWidth.js"));

var _isVariableWidth = _interopRequireDefault(__webpack_require__(/*! ./lib/isVariableWidth */ "./node_modules/validator/lib/isVariableWidth.js"));

var _isMultibyte = _interopRequireDefault(__webpack_require__(/*! ./lib/isMultibyte */ "./node_modules/validator/lib/isMultibyte.js"));

var _isSemVer = _interopRequireDefault(__webpack_require__(/*! ./lib/isSemVer */ "./node_modules/validator/lib/isSemVer.js"));

var _isSurrogatePair = _interopRequireDefault(__webpack_require__(/*! ./lib/isSurrogatePair */ "./node_modules/validator/lib/isSurrogatePair.js"));

var _isInt = _interopRequireDefault(__webpack_require__(/*! ./lib/isInt */ "./node_modules/validator/lib/isInt.js"));

var _isFloat = _interopRequireWildcard(__webpack_require__(/*! ./lib/isFloat */ "./node_modules/validator/lib/isFloat.js"));

var _isDecimal = _interopRequireDefault(__webpack_require__(/*! ./lib/isDecimal */ "./node_modules/validator/lib/isDecimal.js"));

var _isHexadecimal = _interopRequireDefault(__webpack_require__(/*! ./lib/isHexadecimal */ "./node_modules/validator/lib/isHexadecimal.js"));

var _isOctal = _interopRequireDefault(__webpack_require__(/*! ./lib/isOctal */ "./node_modules/validator/lib/isOctal.js"));

var _isDivisibleBy = _interopRequireDefault(__webpack_require__(/*! ./lib/isDivisibleBy */ "./node_modules/validator/lib/isDivisibleBy.js"));

var _isHexColor = _interopRequireDefault(__webpack_require__(/*! ./lib/isHexColor */ "./node_modules/validator/lib/isHexColor.js"));

var _isRgbColor = _interopRequireDefault(__webpack_require__(/*! ./lib/isRgbColor */ "./node_modules/validator/lib/isRgbColor.js"));

var _isHSL = _interopRequireDefault(__webpack_require__(/*! ./lib/isHSL */ "./node_modules/validator/lib/isHSL.js"));

var _isISRC = _interopRequireDefault(__webpack_require__(/*! ./lib/isISRC */ "./node_modules/validator/lib/isISRC.js"));

var _isIBAN = _interopRequireWildcard(__webpack_require__(/*! ./lib/isIBAN */ "./node_modules/validator/lib/isIBAN.js"));

var _isBIC = _interopRequireDefault(__webpack_require__(/*! ./lib/isBIC */ "./node_modules/validator/lib/isBIC.js"));

var _isMD = _interopRequireDefault(__webpack_require__(/*! ./lib/isMD5 */ "./node_modules/validator/lib/isMD5.js"));

var _isHash = _interopRequireDefault(__webpack_require__(/*! ./lib/isHash */ "./node_modules/validator/lib/isHash.js"));

var _isJWT = _interopRequireDefault(__webpack_require__(/*! ./lib/isJWT */ "./node_modules/validator/lib/isJWT.js"));

var _isJSON = _interopRequireDefault(__webpack_require__(/*! ./lib/isJSON */ "./node_modules/validator/lib/isJSON.js"));

var _isEmpty = _interopRequireDefault(__webpack_require__(/*! ./lib/isEmpty */ "./node_modules/validator/lib/isEmpty.js"));

var _isLength = _interopRequireDefault(__webpack_require__(/*! ./lib/isLength */ "./node_modules/validator/lib/isLength.js"));

var _isByteLength = _interopRequireDefault(__webpack_require__(/*! ./lib/isByteLength */ "./node_modules/validator/lib/isByteLength.js"));

var _isUUID = _interopRequireDefault(__webpack_require__(/*! ./lib/isUUID */ "./node_modules/validator/lib/isUUID.js"));

var _isMongoId = _interopRequireDefault(__webpack_require__(/*! ./lib/isMongoId */ "./node_modules/validator/lib/isMongoId.js"));

var _isAfter = _interopRequireDefault(__webpack_require__(/*! ./lib/isAfter */ "./node_modules/validator/lib/isAfter.js"));

var _isBefore = _interopRequireDefault(__webpack_require__(/*! ./lib/isBefore */ "./node_modules/validator/lib/isBefore.js"));

var _isIn = _interopRequireDefault(__webpack_require__(/*! ./lib/isIn */ "./node_modules/validator/lib/isIn.js"));

var _isCreditCard = _interopRequireDefault(__webpack_require__(/*! ./lib/isCreditCard */ "./node_modules/validator/lib/isCreditCard.js"));

var _isIdentityCard = _interopRequireDefault(__webpack_require__(/*! ./lib/isIdentityCard */ "./node_modules/validator/lib/isIdentityCard.js"));

var _isEAN = _interopRequireDefault(__webpack_require__(/*! ./lib/isEAN */ "./node_modules/validator/lib/isEAN.js"));

var _isISIN = _interopRequireDefault(__webpack_require__(/*! ./lib/isISIN */ "./node_modules/validator/lib/isISIN.js"));

var _isISBN = _interopRequireDefault(__webpack_require__(/*! ./lib/isISBN */ "./node_modules/validator/lib/isISBN.js"));

var _isISSN = _interopRequireDefault(__webpack_require__(/*! ./lib/isISSN */ "./node_modules/validator/lib/isISSN.js"));

var _isTaxID = _interopRequireDefault(__webpack_require__(/*! ./lib/isTaxID */ "./node_modules/validator/lib/isTaxID.js"));

var _isMobilePhone = _interopRequireWildcard(__webpack_require__(/*! ./lib/isMobilePhone */ "./node_modules/validator/lib/isMobilePhone.js"));

var _isEthereumAddress = _interopRequireDefault(__webpack_require__(/*! ./lib/isEthereumAddress */ "./node_modules/validator/lib/isEthereumAddress.js"));

var _isCurrency = _interopRequireDefault(__webpack_require__(/*! ./lib/isCurrency */ "./node_modules/validator/lib/isCurrency.js"));

var _isBtcAddress = _interopRequireDefault(__webpack_require__(/*! ./lib/isBtcAddress */ "./node_modules/validator/lib/isBtcAddress.js"));

var _isISO = _interopRequireDefault(__webpack_require__(/*! ./lib/isISO8601 */ "./node_modules/validator/lib/isISO8601.js"));

var _isRFC = _interopRequireDefault(__webpack_require__(/*! ./lib/isRFC3339 */ "./node_modules/validator/lib/isRFC3339.js"));

var _isISO31661Alpha = _interopRequireDefault(__webpack_require__(/*! ./lib/isISO31661Alpha2 */ "./node_modules/validator/lib/isISO31661Alpha2.js"));

var _isISO31661Alpha2 = _interopRequireDefault(__webpack_require__(/*! ./lib/isISO31661Alpha3 */ "./node_modules/validator/lib/isISO31661Alpha3.js"));

var _isISO2 = _interopRequireDefault(__webpack_require__(/*! ./lib/isISO4217 */ "./node_modules/validator/lib/isISO4217.js"));

var _isBase = _interopRequireDefault(__webpack_require__(/*! ./lib/isBase32 */ "./node_modules/validator/lib/isBase32.js"));

var _isBase2 = _interopRequireDefault(__webpack_require__(/*! ./lib/isBase58 */ "./node_modules/validator/lib/isBase58.js"));

var _isBase3 = _interopRequireDefault(__webpack_require__(/*! ./lib/isBase64 */ "./node_modules/validator/lib/isBase64.js"));

var _isDataURI = _interopRequireDefault(__webpack_require__(/*! ./lib/isDataURI */ "./node_modules/validator/lib/isDataURI.js"));

var _isMagnetURI = _interopRequireDefault(__webpack_require__(/*! ./lib/isMagnetURI */ "./node_modules/validator/lib/isMagnetURI.js"));

var _isMimeType = _interopRequireDefault(__webpack_require__(/*! ./lib/isMimeType */ "./node_modules/validator/lib/isMimeType.js"));

var _isLatLong = _interopRequireDefault(__webpack_require__(/*! ./lib/isLatLong */ "./node_modules/validator/lib/isLatLong.js"));

var _isPostalCode = _interopRequireWildcard(__webpack_require__(/*! ./lib/isPostalCode */ "./node_modules/validator/lib/isPostalCode.js"));

var _ltrim = _interopRequireDefault(__webpack_require__(/*! ./lib/ltrim */ "./node_modules/validator/lib/ltrim.js"));

var _rtrim = _interopRequireDefault(__webpack_require__(/*! ./lib/rtrim */ "./node_modules/validator/lib/rtrim.js"));

var _trim = _interopRequireDefault(__webpack_require__(/*! ./lib/trim */ "./node_modules/validator/lib/trim.js"));

var _escape = _interopRequireDefault(__webpack_require__(/*! ./lib/escape */ "./node_modules/validator/lib/escape.js"));

var _unescape = _interopRequireDefault(__webpack_require__(/*! ./lib/unescape */ "./node_modules/validator/lib/unescape.js"));

var _stripLow = _interopRequireDefault(__webpack_require__(/*! ./lib/stripLow */ "./node_modules/validator/lib/stripLow.js"));

var _whitelist = _interopRequireDefault(__webpack_require__(/*! ./lib/whitelist */ "./node_modules/validator/lib/whitelist.js"));

var _blacklist = _interopRequireDefault(__webpack_require__(/*! ./lib/blacklist */ "./node_modules/validator/lib/blacklist.js"));

var _isWhitelisted = _interopRequireDefault(__webpack_require__(/*! ./lib/isWhitelisted */ "./node_modules/validator/lib/isWhitelisted.js"));

var _normalizeEmail = _interopRequireDefault(__webpack_require__(/*! ./lib/normalizeEmail */ "./node_modules/validator/lib/normalizeEmail.js"));

var _isSlug = _interopRequireDefault(__webpack_require__(/*! ./lib/isSlug */ "./node_modules/validator/lib/isSlug.js"));

var _isLicensePlate = _interopRequireDefault(__webpack_require__(/*! ./lib/isLicensePlate */ "./node_modules/validator/lib/isLicensePlate.js"));

var _isStrongPassword = _interopRequireDefault(__webpack_require__(/*! ./lib/isStrongPassword */ "./node_modules/validator/lib/isStrongPassword.js"));

var _isVAT = _interopRequireDefault(__webpack_require__(/*! ./lib/isVAT */ "./node_modules/validator/lib/isVAT.js"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var version = '13.7.0';
var validator = {
  version: version,
  toDate: _toDate.default,
  toFloat: _toFloat.default,
  toInt: _toInt.default,
  toBoolean: _toBoolean.default,
  equals: _equals.default,
  contains: _contains.default,
  matches: _matches.default,
  isEmail: _isEmail.default,
  isURL: _isURL.default,
  isMACAddress: _isMACAddress.default,
  isIP: _isIP.default,
  isIPRange: _isIPRange.default,
  isFQDN: _isFQDN.default,
  isBoolean: _isBoolean.default,
  isIBAN: _isIBAN.default,
  isBIC: _isBIC.default,
  isAlpha: _isAlpha.default,
  isAlphaLocales: _isAlpha.locales,
  isAlphanumeric: _isAlphanumeric.default,
  isAlphanumericLocales: _isAlphanumeric.locales,
  isNumeric: _isNumeric.default,
  isPassportNumber: _isPassportNumber.default,
  isPort: _isPort.default,
  isLowercase: _isLowercase.default,
  isUppercase: _isUppercase.default,
  isAscii: _isAscii.default,
  isFullWidth: _isFullWidth.default,
  isHalfWidth: _isHalfWidth.default,
  isVariableWidth: _isVariableWidth.default,
  isMultibyte: _isMultibyte.default,
  isSemVer: _isSemVer.default,
  isSurrogatePair: _isSurrogatePair.default,
  isInt: _isInt.default,
  isIMEI: _isIMEI.default,
  isFloat: _isFloat.default,
  isFloatLocales: _isFloat.locales,
  isDecimal: _isDecimal.default,
  isHexadecimal: _isHexadecimal.default,
  isOctal: _isOctal.default,
  isDivisibleBy: _isDivisibleBy.default,
  isHexColor: _isHexColor.default,
  isRgbColor: _isRgbColor.default,
  isHSL: _isHSL.default,
  isISRC: _isISRC.default,
  isMD5: _isMD.default,
  isHash: _isHash.default,
  isJWT: _isJWT.default,
  isJSON: _isJSON.default,
  isEmpty: _isEmpty.default,
  isLength: _isLength.default,
  isLocale: _isLocale.default,
  isByteLength: _isByteLength.default,
  isUUID: _isUUID.default,
  isMongoId: _isMongoId.default,
  isAfter: _isAfter.default,
  isBefore: _isBefore.default,
  isIn: _isIn.default,
  isCreditCard: _isCreditCard.default,
  isIdentityCard: _isIdentityCard.default,
  isEAN: _isEAN.default,
  isISIN: _isISIN.default,
  isISBN: _isISBN.default,
  isISSN: _isISSN.default,
  isMobilePhone: _isMobilePhone.default,
  isMobilePhoneLocales: _isMobilePhone.locales,
  isPostalCode: _isPostalCode.default,
  isPostalCodeLocales: _isPostalCode.locales,
  isEthereumAddress: _isEthereumAddress.default,
  isCurrency: _isCurrency.default,
  isBtcAddress: _isBtcAddress.default,
  isISO8601: _isISO.default,
  isRFC3339: _isRFC.default,
  isISO31661Alpha2: _isISO31661Alpha.default,
  isISO31661Alpha3: _isISO31661Alpha2.default,
  isISO4217: _isISO2.default,
  isBase32: _isBase.default,
  isBase58: _isBase2.default,
  isBase64: _isBase3.default,
  isDataURI: _isDataURI.default,
  isMagnetURI: _isMagnetURI.default,
  isMimeType: _isMimeType.default,
  isLatLong: _isLatLong.default,
  ltrim: _ltrim.default,
  rtrim: _rtrim.default,
  trim: _trim.default,
  escape: _escape.default,
  unescape: _unescape.default,
  stripLow: _stripLow.default,
  whitelist: _whitelist.default,
  blacklist: _blacklist.default,
  isWhitelisted: _isWhitelisted.default,
  normalizeEmail: _normalizeEmail.default,
  toString: toString,
  isSlug: _isSlug.default,
  isStrongPassword: _isStrongPassword.default,
  isTaxID: _isTaxID.default,
  isDate: _isDate.default,
  isLicensePlate: _isLicensePlate.default,
  isVAT: _isVAT.default,
  ibanLocales: _isIBAN.locales
};
var _default = validator;
exports["default"] = _default;
module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/alpha.js":
/*!*********************************************!*\
  !*** ./node_modules/validator/lib/alpha.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.commaDecimal = exports.dotDecimal = exports.farsiLocales = exports.arabicLocales = exports.englishLocales = exports.decimal = exports.alphanumeric = exports.alpha = void 0;
var alpha = {
  'en-US': /^[A-Z]+$/i,
  'az-AZ': /^[A-VXYZÇƏĞİıÖŞÜ]+$/i,
  'bg-BG': /^[А-Я]+$/i,
  'cs-CZ': /^[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]+$/i,
  'da-DK': /^[A-ZÆØÅ]+$/i,
  'de-DE': /^[A-ZÄÖÜß]+$/i,
  'el-GR': /^[Α-ώ]+$/i,
  'es-ES': /^[A-ZÁÉÍÑÓÚÜ]+$/i,
  'fa-IR': /^[ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی]+$/i,
  'fi-FI': /^[A-ZÅÄÖ]+$/i,
  'fr-FR': /^[A-ZÀÂÆÇÉÈÊËÏÎÔŒÙÛÜŸ]+$/i,
  'it-IT': /^[A-ZÀÉÈÌÎÓÒÙ]+$/i,
  'nb-NO': /^[A-ZÆØÅ]+$/i,
  'nl-NL': /^[A-ZÁÉËÏÓÖÜÚ]+$/i,
  'nn-NO': /^[A-ZÆØÅ]+$/i,
  'hu-HU': /^[A-ZÁÉÍÓÖŐÚÜŰ]+$/i,
  'pl-PL': /^[A-ZĄĆĘŚŁŃÓŻŹ]+$/i,
  'pt-PT': /^[A-ZÃÁÀÂÄÇÉÊËÍÏÕÓÔÖÚÜ]+$/i,
  'ru-RU': /^[А-ЯЁ]+$/i,
  'sl-SI': /^[A-ZČĆĐŠŽ]+$/i,
  'sk-SK': /^[A-ZÁČĎÉÍŇÓŠŤÚÝŽĹŔĽÄÔ]+$/i,
  'sr-RS@latin': /^[A-ZČĆŽŠĐ]+$/i,
  'sr-RS': /^[А-ЯЂЈЉЊЋЏ]+$/i,
  'sv-SE': /^[A-ZÅÄÖ]+$/i,
  'th-TH': /^[ก-๐\s]+$/i,
  'tr-TR': /^[A-ZÇĞİıÖŞÜ]+$/i,
  'uk-UA': /^[А-ЩЬЮЯЄIЇҐі]+$/i,
  'vi-VN': /^[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴĐÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸ]+$/i,
  'ku-IQ': /^[ئابپتجچحخدرڕزژسشعغفڤقکگلڵمنوۆھەیێيطؤثآإأكضصةظذ]+$/i,
  ar: /^[ءآأؤإئابةتثجحخدذرزسشصضطظعغفقكلمنهوىيًٌٍَُِّْٰ]+$/,
  he: /^[א-ת]+$/,
  fa: /^['آاءأؤئبپتثجچحخدذرزژسشصضطظعغفقکگلمنوهةی']+$/i,
  'hi-IN': /^[\u0900-\u0961]+[\u0972-\u097F]*$/i
};
exports.alpha = alpha;
var alphanumeric = {
  'en-US': /^[0-9A-Z]+$/i,
  'az-AZ': /^[0-9A-VXYZÇƏĞİıÖŞÜ]+$/i,
  'bg-BG': /^[0-9А-Я]+$/i,
  'cs-CZ': /^[0-9A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]+$/i,
  'da-DK': /^[0-9A-ZÆØÅ]+$/i,
  'de-DE': /^[0-9A-ZÄÖÜß]+$/i,
  'el-GR': /^[0-9Α-ω]+$/i,
  'es-ES': /^[0-9A-ZÁÉÍÑÓÚÜ]+$/i,
  'fi-FI': /^[0-9A-ZÅÄÖ]+$/i,
  'fr-FR': /^[0-9A-ZÀÂÆÇÉÈÊËÏÎÔŒÙÛÜŸ]+$/i,
  'it-IT': /^[0-9A-ZÀÉÈÌÎÓÒÙ]+$/i,
  'hu-HU': /^[0-9A-ZÁÉÍÓÖŐÚÜŰ]+$/i,
  'nb-NO': /^[0-9A-ZÆØÅ]+$/i,
  'nl-NL': /^[0-9A-ZÁÉËÏÓÖÜÚ]+$/i,
  'nn-NO': /^[0-9A-ZÆØÅ]+$/i,
  'pl-PL': /^[0-9A-ZĄĆĘŚŁŃÓŻŹ]+$/i,
  'pt-PT': /^[0-9A-ZÃÁÀÂÄÇÉÊËÍÏÕÓÔÖÚÜ]+$/i,
  'ru-RU': /^[0-9А-ЯЁ]+$/i,
  'sl-SI': /^[0-9A-ZČĆĐŠŽ]+$/i,
  'sk-SK': /^[0-9A-ZÁČĎÉÍŇÓŠŤÚÝŽĹŔĽÄÔ]+$/i,
  'sr-RS@latin': /^[0-9A-ZČĆŽŠĐ]+$/i,
  'sr-RS': /^[0-9А-ЯЂЈЉЊЋЏ]+$/i,
  'sv-SE': /^[0-9A-ZÅÄÖ]+$/i,
  'th-TH': /^[ก-๙\s]+$/i,
  'tr-TR': /^[0-9A-ZÇĞİıÖŞÜ]+$/i,
  'uk-UA': /^[0-9А-ЩЬЮЯЄIЇҐі]+$/i,
  'ku-IQ': /^[٠١٢٣٤٥٦٧٨٩0-9ئابپتجچحخدرڕزژسشعغفڤقکگلڵمنوۆھەیێيطؤثآإأكضصةظذ]+$/i,
  'vi-VN': /^[0-9A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴĐÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸ]+$/i,
  ar: /^[٠١٢٣٤٥٦٧٨٩0-9ءآأؤإئابةتثجحخدذرزسشصضطظعغفقكلمنهوىيًٌٍَُِّْٰ]+$/,
  he: /^[0-9א-ת]+$/,
  fa: /^['0-9آاءأؤئبپتثجچحخدذرزژسشصضطظعغفقکگلمنوهةی۱۲۳۴۵۶۷۸۹۰']+$/i,
  'hi-IN': /^[\u0900-\u0963]+[\u0966-\u097F]*$/i
};
exports.alphanumeric = alphanumeric;
var decimal = {
  'en-US': '.',
  ar: '٫'
};
exports.decimal = decimal;
var englishLocales = ['AU', 'GB', 'HK', 'IN', 'NZ', 'ZA', 'ZM'];
exports.englishLocales = englishLocales;

for (var locale, i = 0; i < englishLocales.length; i++) {
  locale = "en-".concat(englishLocales[i]);
  alpha[locale] = alpha['en-US'];
  alphanumeric[locale] = alphanumeric['en-US'];
  decimal[locale] = decimal['en-US'];
} // Source: http://www.localeplanet.com/java/


var arabicLocales = ['AE', 'BH', 'DZ', 'EG', 'IQ', 'JO', 'KW', 'LB', 'LY', 'MA', 'QM', 'QA', 'SA', 'SD', 'SY', 'TN', 'YE'];
exports.arabicLocales = arabicLocales;

for (var _locale, _i = 0; _i < arabicLocales.length; _i++) {
  _locale = "ar-".concat(arabicLocales[_i]);
  alpha[_locale] = alpha.ar;
  alphanumeric[_locale] = alphanumeric.ar;
  decimal[_locale] = decimal.ar;
}

var farsiLocales = ['IR', 'AF'];
exports.farsiLocales = farsiLocales;

for (var _locale2, _i2 = 0; _i2 < farsiLocales.length; _i2++) {
  _locale2 = "fa-".concat(farsiLocales[_i2]);
  alphanumeric[_locale2] = alphanumeric.fa;
  decimal[_locale2] = decimal.ar;
} // Source: https://en.wikipedia.org/wiki/Decimal_mark


var dotDecimal = ['ar-EG', 'ar-LB', 'ar-LY'];
exports.dotDecimal = dotDecimal;
var commaDecimal = ['bg-BG', 'cs-CZ', 'da-DK', 'de-DE', 'el-GR', 'en-ZM', 'es-ES', 'fr-CA', 'fr-FR', 'id-ID', 'it-IT', 'ku-IQ', 'hi-IN', 'hu-HU', 'nb-NO', 'nn-NO', 'nl-NL', 'pl-PL', 'pt-PT', 'ru-RU', 'sl-SI', 'sr-RS@latin', 'sr-RS', 'sv-SE', 'tr-TR', 'uk-UA', 'vi-VN'];
exports.commaDecimal = commaDecimal;

for (var _i3 = 0; _i3 < dotDecimal.length; _i3++) {
  decimal[dotDecimal[_i3]] = decimal['en-US'];
}

for (var _i4 = 0; _i4 < commaDecimal.length; _i4++) {
  decimal[commaDecimal[_i4]] = ',';
}

alpha['fr-CA'] = alpha['fr-FR'];
alphanumeric['fr-CA'] = alphanumeric['fr-FR'];
alpha['pt-BR'] = alpha['pt-PT'];
alphanumeric['pt-BR'] = alphanumeric['pt-PT'];
decimal['pt-BR'] = decimal['pt-PT']; // see #862

alpha['pl-Pl'] = alpha['pl-PL'];
alphanumeric['pl-Pl'] = alphanumeric['pl-PL'];
decimal['pl-Pl'] = decimal['pl-PL']; // see #1455

alpha['fa-AF'] = alpha.fa;

/***/ }),

/***/ "./node_modules/validator/lib/blacklist.js":
/*!*************************************************!*\
  !*** ./node_modules/validator/lib/blacklist.js ***!
  \*************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = blacklist;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function blacklist(str, chars) {
  (0, _assertString.default)(str);
  return str.replace(new RegExp("[".concat(chars, "]+"), 'g'), '');
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/contains.js":
/*!************************************************!*\
  !*** ./node_modules/validator/lib/contains.js ***!
  \************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = contains;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

var _toString = _interopRequireDefault(__webpack_require__(/*! ./util/toString */ "./node_modules/validator/lib/util/toString.js"));

var _merge = _interopRequireDefault(__webpack_require__(/*! ./util/merge */ "./node_modules/validator/lib/util/merge.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaulContainsOptions = {
  ignoreCase: false,
  minOccurrences: 1
};

function contains(str, elem, options) {
  (0, _assertString.default)(str);
  options = (0, _merge.default)(options, defaulContainsOptions);

  if (options.ignoreCase) {
    return str.toLowerCase().split((0, _toString.default)(elem).toLowerCase()).length > options.minOccurrences;
  }

  return str.split((0, _toString.default)(elem)).length > options.minOccurrences;
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/equals.js":
/*!**********************************************!*\
  !*** ./node_modules/validator/lib/equals.js ***!
  \**********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = equals;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function equals(str, comparison) {
  (0, _assertString.default)(str);
  return str === comparison;
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/escape.js":
/*!**********************************************!*\
  !*** ./node_modules/validator/lib/escape.js ***!
  \**********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = escape;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function escape(str) {
  (0, _assertString.default)(str);
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\//g, '&#x2F;').replace(/\\/g, '&#x5C;').replace(/`/g, '&#96;');
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isAfter.js":
/*!***********************************************!*\
  !*** ./node_modules/validator/lib/isAfter.js ***!
  \***********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isAfter;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

var _toDate = _interopRequireDefault(__webpack_require__(/*! ./toDate */ "./node_modules/validator/lib/toDate.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isAfter(str) {
  var date = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : String(new Date());
  (0, _assertString.default)(str);
  var comparison = (0, _toDate.default)(date);
  var original = (0, _toDate.default)(str);
  return !!(original && comparison && original > comparison);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isAlpha.js":
/*!***********************************************!*\
  !*** ./node_modules/validator/lib/isAlpha.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isAlpha;
exports.locales = void 0;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

var _alpha = __webpack_require__(/*! ./alpha */ "./node_modules/validator/lib/alpha.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isAlpha(_str) {
  var locale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'en-US';
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  (0, _assertString.default)(_str);
  var str = _str;
  var ignore = options.ignore;

  if (ignore) {
    if (ignore instanceof RegExp) {
      str = str.replace(ignore, '');
    } else if (typeof ignore === 'string') {
      str = str.replace(new RegExp("[".concat(ignore.replace(/[-[\]{}()*+?.,\\^$|#\\s]/g, '\\$&'), "]"), 'g'), ''); // escape regex for ignore
    } else {
      throw new Error('ignore should be instance of a String or RegExp');
    }
  }

  if (locale in _alpha.alpha) {
    return _alpha.alpha[locale].test(str);
  }

  throw new Error("Invalid locale '".concat(locale, "'"));
}

var locales = Object.keys(_alpha.alpha);
exports.locales = locales;

/***/ }),

/***/ "./node_modules/validator/lib/isAlphanumeric.js":
/*!******************************************************!*\
  !*** ./node_modules/validator/lib/isAlphanumeric.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isAlphanumeric;
exports.locales = void 0;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

var _alpha = __webpack_require__(/*! ./alpha */ "./node_modules/validator/lib/alpha.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isAlphanumeric(_str) {
  var locale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'en-US';
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  (0, _assertString.default)(_str);
  var str = _str;
  var ignore = options.ignore;

  if (ignore) {
    if (ignore instanceof RegExp) {
      str = str.replace(ignore, '');
    } else if (typeof ignore === 'string') {
      str = str.replace(new RegExp("[".concat(ignore.replace(/[-[\]{}()*+?.,\\^$|#\\s]/g, '\\$&'), "]"), 'g'), ''); // escape regex for ignore
    } else {
      throw new Error('ignore should be instance of a String or RegExp');
    }
  }

  if (locale in _alpha.alphanumeric) {
    return _alpha.alphanumeric[locale].test(str);
  }

  throw new Error("Invalid locale '".concat(locale, "'"));
}

var locales = Object.keys(_alpha.alphanumeric);
exports.locales = locales;

/***/ }),

/***/ "./node_modules/validator/lib/isAscii.js":
/*!***********************************************!*\
  !*** ./node_modules/validator/lib/isAscii.js ***!
  \***********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isAscii;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-control-regex */
var ascii = /^[\x00-\x7F]+$/;
/* eslint-enable no-control-regex */

function isAscii(str) {
  (0, _assertString.default)(str);
  return ascii.test(str);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isBIC.js":
/*!*********************************************!*\
  !*** ./node_modules/validator/lib/isBIC.js ***!
  \*********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isBIC;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

var _isISO31661Alpha = __webpack_require__(/*! ./isISO31661Alpha2 */ "./node_modules/validator/lib/isISO31661Alpha2.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// https://en.wikipedia.org/wiki/ISO_9362
var isBICReg = /^[A-Za-z]{6}[A-Za-z0-9]{2}([A-Za-z0-9]{3})?$/;

function isBIC(str) {
  (0, _assertString.default)(str); // toUpperCase() should be removed when a new major version goes out that changes
  // the regex to [A-Z] (per the spec).

  if (!_isISO31661Alpha.CountryCodes.has(str.slice(4, 6).toUpperCase())) {
    return false;
  }

  return isBICReg.test(str);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isBase32.js":
/*!************************************************!*\
  !*** ./node_modules/validator/lib/isBase32.js ***!
  \************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isBase32;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var base32 = /^[A-Z2-7]+=*$/;

function isBase32(str) {
  (0, _assertString.default)(str);
  var len = str.length;

  if (len % 8 === 0 && base32.test(str)) {
    return true;
  }

  return false;
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isBase58.js":
/*!************************************************!*\
  !*** ./node_modules/validator/lib/isBase58.js ***!
  \************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isBase58;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Accepted chars - 123456789ABCDEFGH JKLMN PQRSTUVWXYZabcdefghijk mnopqrstuvwxyz
var base58Reg = /^[A-HJ-NP-Za-km-z1-9]*$/;

function isBase58(str) {
  (0, _assertString.default)(str);

  if (base58Reg.test(str)) {
    return true;
  }

  return false;
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isBase64.js":
/*!************************************************!*\
  !*** ./node_modules/validator/lib/isBase64.js ***!
  \************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isBase64;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

var _merge = _interopRequireDefault(__webpack_require__(/*! ./util/merge */ "./node_modules/validator/lib/util/merge.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var notBase64 = /[^A-Z0-9+\/=]/i;
var urlSafeBase64 = /^[A-Z0-9_\-]*$/i;
var defaultBase64Options = {
  urlSafe: false
};

function isBase64(str, options) {
  (0, _assertString.default)(str);
  options = (0, _merge.default)(options, defaultBase64Options);
  var len = str.length;

  if (options.urlSafe) {
    return urlSafeBase64.test(str);
  }

  if (len % 4 !== 0 || notBase64.test(str)) {
    return false;
  }

  var firstPaddingChar = str.indexOf('=');
  return firstPaddingChar === -1 || firstPaddingChar === len - 1 || firstPaddingChar === len - 2 && str[len - 1] === '=';
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isBefore.js":
/*!************************************************!*\
  !*** ./node_modules/validator/lib/isBefore.js ***!
  \************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isBefore;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

var _toDate = _interopRequireDefault(__webpack_require__(/*! ./toDate */ "./node_modules/validator/lib/toDate.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isBefore(str) {
  var date = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : String(new Date());
  (0, _assertString.default)(str);
  var comparison = (0, _toDate.default)(date);
  var original = (0, _toDate.default)(str);
  return !!(original && comparison && original < comparison);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isBoolean.js":
/*!*************************************************!*\
  !*** ./node_modules/validator/lib/isBoolean.js ***!
  \*************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isBoolean;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultOptions = {
  loose: false
};
var strictBooleans = ['true', 'false', '1', '0'];
var looseBooleans = [].concat(strictBooleans, ['yes', 'no']);

function isBoolean(str) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultOptions;
  (0, _assertString.default)(str);

  if (options.loose) {
    return looseBooleans.includes(str.toLowerCase());
  }

  return strictBooleans.includes(str);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isBtcAddress.js":
/*!****************************************************!*\
  !*** ./node_modules/validator/lib/isBtcAddress.js ***!
  \****************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isBtcAddress;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// supports Bech32 addresses
var bech32 = /^(bc1)[a-z0-9]{25,39}$/;
var base58 = /^(1|3)[A-HJ-NP-Za-km-z1-9]{25,39}$/;

function isBtcAddress(str) {
  (0, _assertString.default)(str); // check for bech32

  if (str.startsWith('bc1')) {
    return bech32.test(str);
  }

  return base58.test(str);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isByteLength.js":
/*!****************************************************!*\
  !*** ./node_modules/validator/lib/isByteLength.js ***!
  \****************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isByteLength;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/* eslint-disable prefer-rest-params */
function isByteLength(str, options) {
  (0, _assertString.default)(str);
  var min;
  var max;

  if (_typeof(options) === 'object') {
    min = options.min || 0;
    max = options.max;
  } else {
    // backwards compatibility: isByteLength(str, min [, max])
    min = arguments[1];
    max = arguments[2];
  }

  var len = encodeURI(str).split(/%..|./).length - 1;
  return len >= min && (typeof max === 'undefined' || len <= max);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isCreditCard.js":
/*!****************************************************!*\
  !*** ./node_modules/validator/lib/isCreditCard.js ***!
  \****************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isCreditCard;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable max-len */
var creditCard = /^(?:4[0-9]{12}(?:[0-9]{3,6})?|5[1-5][0-9]{14}|(222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}|6(?:011|5[0-9][0-9])[0-9]{12,15}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11}|6[27][0-9]{14}|^(81[0-9]{14,17}))$/;
/* eslint-enable max-len */

function isCreditCard(str) {
  (0, _assertString.default)(str);
  var sanitized = str.replace(/[- ]+/g, '');

  if (!creditCard.test(sanitized)) {
    return false;
  }

  var sum = 0;
  var digit;
  var tmpNum;
  var shouldDouble;

  for (var i = sanitized.length - 1; i >= 0; i--) {
    digit = sanitized.substring(i, i + 1);
    tmpNum = parseInt(digit, 10);

    if (shouldDouble) {
      tmpNum *= 2;

      if (tmpNum >= 10) {
        sum += tmpNum % 10 + 1;
      } else {
        sum += tmpNum;
      }
    } else {
      sum += tmpNum;
    }

    shouldDouble = !shouldDouble;
  }

  return !!(sum % 10 === 0 ? sanitized : false);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isCurrency.js":
/*!**************************************************!*\
  !*** ./node_modules/validator/lib/isCurrency.js ***!
  \**************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isCurrency;

var _merge = _interopRequireDefault(__webpack_require__(/*! ./util/merge */ "./node_modules/validator/lib/util/merge.js"));

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function currencyRegex(options) {
  var decimal_digits = "\\d{".concat(options.digits_after_decimal[0], "}");
  options.digits_after_decimal.forEach(function (digit, index) {
    if (index !== 0) decimal_digits = "".concat(decimal_digits, "|\\d{").concat(digit, "}");
  });
  var symbol = "(".concat(options.symbol.replace(/\W/, function (m) {
    return "\\".concat(m);
  }), ")").concat(options.require_symbol ? '' : '?'),
      negative = '-?',
      whole_dollar_amount_without_sep = '[1-9]\\d*',
      whole_dollar_amount_with_sep = "[1-9]\\d{0,2}(\\".concat(options.thousands_separator, "\\d{3})*"),
      valid_whole_dollar_amounts = ['0', whole_dollar_amount_without_sep, whole_dollar_amount_with_sep],
      whole_dollar_amount = "(".concat(valid_whole_dollar_amounts.join('|'), ")?"),
      decimal_amount = "(\\".concat(options.decimal_separator, "(").concat(decimal_digits, "))").concat(options.require_decimal ? '' : '?');
  var pattern = whole_dollar_amount + (options.allow_decimal || options.require_decimal ? decimal_amount : ''); // default is negative sign before symbol, but there are two other options (besides parens)

  if (options.allow_negatives && !options.parens_for_negatives) {
    if (options.negative_sign_after_digits) {
      pattern += negative;
    } else if (options.negative_sign_before_digits) {
      pattern = negative + pattern;
    }
  } // South African Rand, for example, uses R 123 (space) and R-123 (no space)


  if (options.allow_negative_sign_placeholder) {
    pattern = "( (?!\\-))?".concat(pattern);
  } else if (options.allow_space_after_symbol) {
    pattern = " ?".concat(pattern);
  } else if (options.allow_space_after_digits) {
    pattern += '( (?!$))?';
  }

  if (options.symbol_after_digits) {
    pattern += symbol;
  } else {
    pattern = symbol + pattern;
  }

  if (options.allow_negatives) {
    if (options.parens_for_negatives) {
      pattern = "(\\(".concat(pattern, "\\)|").concat(pattern, ")");
    } else if (!(options.negative_sign_before_digits || options.negative_sign_after_digits)) {
      pattern = negative + pattern;
    }
  } // ensure there's a dollar and/or decimal amount, and that
  // it doesn't start with a space or a negative sign followed by a space


  return new RegExp("^(?!-? )(?=.*\\d)".concat(pattern, "$"));
}

var default_currency_options = {
  symbol: '$',
  require_symbol: false,
  allow_space_after_symbol: false,
  symbol_after_digits: false,
  allow_negatives: true,
  parens_for_negatives: false,
  negative_sign_before_digits: false,
  negative_sign_after_digits: false,
  allow_negative_sign_placeholder: false,
  thousands_separator: ',',
  decimal_separator: '.',
  allow_decimal: true,
  require_decimal: false,
  digits_after_decimal: [2],
  allow_space_after_digits: false
};

function isCurrency(str, options) {
  (0, _assertString.default)(str);
  options = (0, _merge.default)(options, default_currency_options);
  return currencyRegex(options).test(str);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isDataURI.js":
/*!*************************************************!*\
  !*** ./node_modules/validator/lib/isDataURI.js ***!
  \*************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isDataURI;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var validMediaType = /^[a-z]+\/[a-z0-9\-\+]+$/i;
var validAttribute = /^[a-z\-]+=[a-z0-9\-]+$/i;
var validData = /^[a-z0-9!\$&'\(\)\*\+,;=\-\._~:@\/\?%\s]*$/i;

function isDataURI(str) {
  (0, _assertString.default)(str);
  var data = str.split(',');

  if (data.length < 2) {
    return false;
  }

  var attributes = data.shift().trim().split(';');
  var schemeAndMediaType = attributes.shift();

  if (schemeAndMediaType.substr(0, 5) !== 'data:') {
    return false;
  }

  var mediaType = schemeAndMediaType.substr(5);

  if (mediaType !== '' && !validMediaType.test(mediaType)) {
    return false;
  }

  for (var i = 0; i < attributes.length; i++) {
    if (!(i === attributes.length - 1 && attributes[i].toLowerCase() === 'base64') && !validAttribute.test(attributes[i])) {
      return false;
    }
  }

  for (var _i = 0; _i < data.length; _i++) {
    if (!validData.test(data[_i])) {
      return false;
    }
  }

  return true;
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isDate.js":
/*!**********************************************!*\
  !*** ./node_modules/validator/lib/isDate.js ***!
  \**********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isDate;

var _merge = _interopRequireDefault(__webpack_require__(/*! ./util/merge */ "./node_modules/validator/lib/util/merge.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var default_date_options = {
  format: 'YYYY/MM/DD',
  delimiters: ['/', '-'],
  strictMode: false
};

function isValidFormat(format) {
  return /(^(y{4}|y{2})[.\/-](m{1,2})[.\/-](d{1,2})$)|(^(m{1,2})[.\/-](d{1,2})[.\/-]((y{4}|y{2})$))|(^(d{1,2})[.\/-](m{1,2})[.\/-]((y{4}|y{2})$))/gi.test(format);
}

function zip(date, format) {
  var zippedArr = [],
      len = Math.min(date.length, format.length);

  for (var i = 0; i < len; i++) {
    zippedArr.push([date[i], format[i]]);
  }

  return zippedArr;
}

function isDate(input, options) {
  if (typeof options === 'string') {
    // Allow backward compatbility for old format isDate(input [, format])
    options = (0, _merge.default)({
      format: options
    }, default_date_options);
  } else {
    options = (0, _merge.default)(options, default_date_options);
  }

  if (typeof input === 'string' && isValidFormat(options.format)) {
    var formatDelimiter = options.delimiters.find(function (delimiter) {
      return options.format.indexOf(delimiter) !== -1;
    });
    var dateDelimiter = options.strictMode ? formatDelimiter : options.delimiters.find(function (delimiter) {
      return input.indexOf(delimiter) !== -1;
    });
    var dateAndFormat = zip(input.split(dateDelimiter), options.format.toLowerCase().split(formatDelimiter));
    var dateObj = {};

    var _iterator = _createForOfIteratorHelper(dateAndFormat),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var _step$value = _slicedToArray(_step.value, 2),
            dateWord = _step$value[0],
            formatWord = _step$value[1];

        if (dateWord.length !== formatWord.length) {
          return false;
        }

        dateObj[formatWord.charAt(0)] = dateWord;
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    return new Date("".concat(dateObj.m, "/").concat(dateObj.d, "/").concat(dateObj.y)).getDate() === +dateObj.d;
  }

  if (!options.strictMode) {
    return Object.prototype.toString.call(input) === '[object Date]' && isFinite(input);
  }

  return false;
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isDecimal.js":
/*!*************************************************!*\
  !*** ./node_modules/validator/lib/isDecimal.js ***!
  \*************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isDecimal;

var _merge = _interopRequireDefault(__webpack_require__(/*! ./util/merge */ "./node_modules/validator/lib/util/merge.js"));

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

var _includes = _interopRequireDefault(__webpack_require__(/*! ./util/includes */ "./node_modules/validator/lib/util/includes.js"));

var _alpha = __webpack_require__(/*! ./alpha */ "./node_modules/validator/lib/alpha.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function decimalRegExp(options) {
  var regExp = new RegExp("^[-+]?([0-9]+)?(\\".concat(_alpha.decimal[options.locale], "[0-9]{").concat(options.decimal_digits, "})").concat(options.force_decimal ? '' : '?', "$"));
  return regExp;
}

var default_decimal_options = {
  force_decimal: false,
  decimal_digits: '1,',
  locale: 'en-US'
};
var blacklist = ['', '-', '+'];

function isDecimal(str, options) {
  (0, _assertString.default)(str);
  options = (0, _merge.default)(options, default_decimal_options);

  if (options.locale in _alpha.decimal) {
    return !(0, _includes.default)(blacklist, str.replace(/ /g, '')) && decimalRegExp(options).test(str);
  }

  throw new Error("Invalid locale '".concat(options.locale, "'"));
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isDivisibleBy.js":
/*!*****************************************************!*\
  !*** ./node_modules/validator/lib/isDivisibleBy.js ***!
  \*****************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isDivisibleBy;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

var _toFloat = _interopRequireDefault(__webpack_require__(/*! ./toFloat */ "./node_modules/validator/lib/toFloat.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isDivisibleBy(str, num) {
  (0, _assertString.default)(str);
  return (0, _toFloat.default)(str) % parseInt(num, 10) === 0;
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isEAN.js":
/*!*********************************************!*\
  !*** ./node_modules/validator/lib/isEAN.js ***!
  \*********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isEAN;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The most commonly used EAN standard is
 * the thirteen-digit EAN-13, while the
 * less commonly used 8-digit EAN-8 barcode was
 * introduced for use on small packages.
 * Also EAN/UCC-14 is used for Grouping of individual
 * trade items above unit level(Intermediate, Carton or Pallet).
 * For more info about EAN-14 checkout: https://www.gtin.info/itf-14-barcodes/
 * EAN consists of:
 * GS1 prefix, manufacturer code, product code and check digit
 * Reference: https://en.wikipedia.org/wiki/International_Article_Number
 * Reference: https://www.gtin.info/
 */

/**
 * Define EAN Lenghts; 8 for EAN-8; 13 for EAN-13; 14 for EAN-14
 * and Regular Expression for valid EANs (EAN-8, EAN-13, EAN-14),
 * with exact numberic matching of 8 or 13 or 14 digits [0-9]
 */
var LENGTH_EAN_8 = 8;
var LENGTH_EAN_14 = 14;
var validEanRegex = /^(\d{8}|\d{13}|\d{14})$/;
/**
 * Get position weight given:
 * EAN length and digit index/position
 *
 * @param {number} length
 * @param {number} index
 * @return {number}
 */

function getPositionWeightThroughLengthAndIndex(length, index) {
  if (length === LENGTH_EAN_8 || length === LENGTH_EAN_14) {
    return index % 2 === 0 ? 3 : 1;
  }

  return index % 2 === 0 ? 1 : 3;
}
/**
 * Calculate EAN Check Digit
 * Reference: https://en.wikipedia.org/wiki/International_Article_Number#Calculation_of_checksum_digit
 *
 * @param {string} ean
 * @return {number}
 */


function calculateCheckDigit(ean) {
  var checksum = ean.slice(0, -1).split('').map(function (char, index) {
    return Number(char) * getPositionWeightThroughLengthAndIndex(ean.length, index);
  }).reduce(function (acc, partialSum) {
    return acc + partialSum;
  }, 0);
  var remainder = 10 - checksum % 10;
  return remainder < 10 ? remainder : 0;
}
/**
 * Check if string is valid EAN:
 * Matches EAN-8/EAN-13/EAN-14 regex
 * Has valid check digit.
 *
 * @param {string} str
 * @return {boolean}
 */


function isEAN(str) {
  (0, _assertString.default)(str);
  var actualCheckDigit = Number(str.slice(-1));
  return validEanRegex.test(str) && actualCheckDigit === calculateCheckDigit(str);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isEmail.js":
/*!***********************************************!*\
  !*** ./node_modules/validator/lib/isEmail.js ***!
  \***********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isEmail;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

var _merge = _interopRequireDefault(__webpack_require__(/*! ./util/merge */ "./node_modules/validator/lib/util/merge.js"));

var _isByteLength = _interopRequireDefault(__webpack_require__(/*! ./isByteLength */ "./node_modules/validator/lib/isByteLength.js"));

var _isFQDN = _interopRequireDefault(__webpack_require__(/*! ./isFQDN */ "./node_modules/validator/lib/isFQDN.js"));

var _isIP = _interopRequireDefault(__webpack_require__(/*! ./isIP */ "./node_modules/validator/lib/isIP.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var default_email_options = {
  allow_display_name: false,
  require_display_name: false,
  allow_utf8_local_part: true,
  require_tld: true,
  blacklisted_chars: '',
  ignore_max_length: false,
  host_blacklist: []
};
/* eslint-disable max-len */

/* eslint-disable no-control-regex */

var splitNameAddress = /^([^\x00-\x1F\x7F-\x9F\cX]+)</i;
var emailUserPart = /^[a-z\d!#\$%&'\*\+\-\/=\?\^_`{\|}~]+$/i;
var gmailUserPart = /^[a-z\d]+$/;
var quotedEmailUser = /^([\s\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e]|(\\[\x01-\x09\x0b\x0c\x0d-\x7f]))*$/i;
var emailUserUtf8Part = /^[a-z\d!#\$%&'\*\+\-\/=\?\^_`{\|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+$/i;
var quotedEmailUserUtf8 = /^([\s\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|(\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*$/i;
var defaultMaxEmailLength = 254;
/* eslint-enable max-len */

/* eslint-enable no-control-regex */

/**
 * Validate display name according to the RFC2822: https://tools.ietf.org/html/rfc2822#appendix-A.1.2
 * @param {String} display_name
 */

function validateDisplayName(display_name) {
  var display_name_without_quotes = display_name.replace(/^"(.+)"$/, '$1'); // display name with only spaces is not valid

  if (!display_name_without_quotes.trim()) {
    return false;
  } // check whether display name contains illegal character


  var contains_illegal = /[\.";<>]/.test(display_name_without_quotes);

  if (contains_illegal) {
    // if contains illegal characters,
    // must to be enclosed in double-quotes, otherwise it's not a valid display name
    if (display_name_without_quotes === display_name) {
      return false;
    } // the quotes in display name must start with character symbol \


    var all_start_with_back_slash = display_name_without_quotes.split('"').length === display_name_without_quotes.split('\\"').length;

    if (!all_start_with_back_slash) {
      return false;
    }
  }

  return true;
}

function isEmail(str, options) {
  (0, _assertString.default)(str);
  options = (0, _merge.default)(options, default_email_options);

  if (options.require_display_name || options.allow_display_name) {
    var display_email = str.match(splitNameAddress);

    if (display_email) {
      var display_name = display_email[1]; // Remove display name and angle brackets to get email address
      // Can be done in the regex but will introduce a ReDOS (See  #1597 for more info)

      str = str.replace(display_name, '').replace(/(^<|>$)/g, ''); // sometimes need to trim the last space to get the display name
      // because there may be a space between display name and email address
      // eg. myname <address@gmail.com>
      // the display name is `myname` instead of `myname `, so need to trim the last space

      if (display_name.endsWith(' ')) {
        display_name = display_name.substr(0, display_name.length - 1);
      }

      if (!validateDisplayName(display_name)) {
        return false;
      }
    } else if (options.require_display_name) {
      return false;
    }
  }

  if (!options.ignore_max_length && str.length > defaultMaxEmailLength) {
    return false;
  }

  var parts = str.split('@');
  var domain = parts.pop();
  var lower_domain = domain.toLowerCase();

  if (options.host_blacklist.includes(lower_domain)) {
    return false;
  }

  var user = parts.join('@');

  if (options.domain_specific_validation && (lower_domain === 'gmail.com' || lower_domain === 'googlemail.com')) {
    /*
      Previously we removed dots for gmail addresses before validating.
      This was removed because it allows `multiple..dots@gmail.com`
      to be reported as valid, but it is not.
      Gmail only normalizes single dots, removing them from here is pointless,
      should be done in normalizeEmail
    */
    user = user.toLowerCase(); // Removing sub-address from username before gmail validation

    var username = user.split('+')[0]; // Dots are not included in gmail length restriction

    if (!(0, _isByteLength.default)(username.replace(/\./g, ''), {
      min: 6,
      max: 30
    })) {
      return false;
    }

    var _user_parts = username.split('.');

    for (var i = 0; i < _user_parts.length; i++) {
      if (!gmailUserPart.test(_user_parts[i])) {
        return false;
      }
    }
  }

  if (options.ignore_max_length === false && (!(0, _isByteLength.default)(user, {
    max: 64
  }) || !(0, _isByteLength.default)(domain, {
    max: 254
  }))) {
    return false;
  }

  if (!(0, _isFQDN.default)(domain, {
    require_tld: options.require_tld
  })) {
    if (!options.allow_ip_domain) {
      return false;
    }

    if (!(0, _isIP.default)(domain)) {
      if (!domain.startsWith('[') || !domain.endsWith(']')) {
        return false;
      }

      var noBracketdomain = domain.substr(1, domain.length - 2);

      if (noBracketdomain.length === 0 || !(0, _isIP.default)(noBracketdomain)) {
        return false;
      }
    }
  }

  if (user[0] === '"') {
    user = user.slice(1, user.length - 1);
    return options.allow_utf8_local_part ? quotedEmailUserUtf8.test(user) : quotedEmailUser.test(user);
  }

  var pattern = options.allow_utf8_local_part ? emailUserUtf8Part : emailUserPart;
  var user_parts = user.split('.');

  for (var _i = 0; _i < user_parts.length; _i++) {
    if (!pattern.test(user_parts[_i])) {
      return false;
    }
  }

  if (options.blacklisted_chars) {
    if (user.search(new RegExp("[".concat(options.blacklisted_chars, "]+"), 'g')) !== -1) return false;
  }

  return true;
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isEmpty.js":
/*!***********************************************!*\
  !*** ./node_modules/validator/lib/isEmpty.js ***!
  \***********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isEmpty;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

var _merge = _interopRequireDefault(__webpack_require__(/*! ./util/merge */ "./node_modules/validator/lib/util/merge.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var default_is_empty_options = {
  ignore_whitespace: false
};

function isEmpty(str, options) {
  (0, _assertString.default)(str);
  options = (0, _merge.default)(options, default_is_empty_options);
  return (options.ignore_whitespace ? str.trim().length : str.length) === 0;
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isEthereumAddress.js":
/*!*********************************************************!*\
  !*** ./node_modules/validator/lib/isEthereumAddress.js ***!
  \*********************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isEthereumAddress;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var eth = /^(0x)[0-9a-f]{40}$/i;

function isEthereumAddress(str) {
  (0, _assertString.default)(str);
  return eth.test(str);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isFQDN.js":
/*!**********************************************!*\
  !*** ./node_modules/validator/lib/isFQDN.js ***!
  \**********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isFQDN;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

var _merge = _interopRequireDefault(__webpack_require__(/*! ./util/merge */ "./node_modules/validator/lib/util/merge.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var default_fqdn_options = {
  require_tld: true,
  allow_underscores: false,
  allow_trailing_dot: false,
  allow_numeric_tld: false,
  allow_wildcard: false
};

function isFQDN(str, options) {
  (0, _assertString.default)(str);
  options = (0, _merge.default)(options, default_fqdn_options);
  /* Remove the optional trailing dot before checking validity */

  if (options.allow_trailing_dot && str[str.length - 1] === '.') {
    str = str.substring(0, str.length - 1);
  }
  /* Remove the optional wildcard before checking validity */


  if (options.allow_wildcard === true && str.indexOf('*.') === 0) {
    str = str.substring(2);
  }

  var parts = str.split('.');
  var tld = parts[parts.length - 1];

  if (options.require_tld) {
    // disallow fqdns without tld
    if (parts.length < 2) {
      return false;
    }

    if (!/^([a-z\u00A1-\u00A8\u00AA-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]{2,}|xn[a-z0-9-]{2,})$/i.test(tld)) {
      return false;
    } // disallow spaces


    if (/\s/.test(tld)) {
      return false;
    }
  } // reject numeric TLDs


  if (!options.allow_numeric_tld && /^\d+$/.test(tld)) {
    return false;
  }

  return parts.every(function (part) {
    if (part.length > 63) {
      return false;
    }

    if (!/^[a-z_\u00a1-\uffff0-9-]+$/i.test(part)) {
      return false;
    } // disallow full-width chars


    if (/[\uff01-\uff5e]/.test(part)) {
      return false;
    } // disallow parts starting or ending with hyphen


    if (/^-|-$/.test(part)) {
      return false;
    }

    if (!options.allow_underscores && /_/.test(part)) {
      return false;
    }

    return true;
  });
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isFloat.js":
/*!***********************************************!*\
  !*** ./node_modules/validator/lib/isFloat.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isFloat;
exports.locales = void 0;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

var _alpha = __webpack_require__(/*! ./alpha */ "./node_modules/validator/lib/alpha.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isFloat(str, options) {
  (0, _assertString.default)(str);
  options = options || {};
  var float = new RegExp("^(?:[-+])?(?:[0-9]+)?(?:\\".concat(options.locale ? _alpha.decimal[options.locale] : '.', "[0-9]*)?(?:[eE][\\+\\-]?(?:[0-9]+))?$"));

  if (str === '' || str === '.' || str === '-' || str === '+') {
    return false;
  }

  var value = parseFloat(str.replace(',', '.'));
  return float.test(str) && (!options.hasOwnProperty('min') || value >= options.min) && (!options.hasOwnProperty('max') || value <= options.max) && (!options.hasOwnProperty('lt') || value < options.lt) && (!options.hasOwnProperty('gt') || value > options.gt);
}

var locales = Object.keys(_alpha.decimal);
exports.locales = locales;

/***/ }),

/***/ "./node_modules/validator/lib/isFullWidth.js":
/*!***************************************************!*\
  !*** ./node_modules/validator/lib/isFullWidth.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isFullWidth;
exports.fullWidth = void 0;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fullWidth = /[^\u0020-\u007E\uFF61-\uFF9F\uFFA0-\uFFDC\uFFE8-\uFFEE0-9a-zA-Z]/;
exports.fullWidth = fullWidth;

function isFullWidth(str) {
  (0, _assertString.default)(str);
  return fullWidth.test(str);
}

/***/ }),

/***/ "./node_modules/validator/lib/isHSL.js":
/*!*********************************************!*\
  !*** ./node_modules/validator/lib/isHSL.js ***!
  \*********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isHSL;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hslComma = /^hsla?\(((\+|\-)?([0-9]+(\.[0-9]+)?(e(\+|\-)?[0-9]+)?|\.[0-9]+(e(\+|\-)?[0-9]+)?))(deg|grad|rad|turn)?(,(\+|\-)?([0-9]+(\.[0-9]+)?(e(\+|\-)?[0-9]+)?|\.[0-9]+(e(\+|\-)?[0-9]+)?)%){2}(,((\+|\-)?([0-9]+(\.[0-9]+)?(e(\+|\-)?[0-9]+)?|\.[0-9]+(e(\+|\-)?[0-9]+)?)%?))?\)$/i;
var hslSpace = /^hsla?\(((\+|\-)?([0-9]+(\.[0-9]+)?(e(\+|\-)?[0-9]+)?|\.[0-9]+(e(\+|\-)?[0-9]+)?))(deg|grad|rad|turn)?(\s(\+|\-)?([0-9]+(\.[0-9]+)?(e(\+|\-)?[0-9]+)?|\.[0-9]+(e(\+|\-)?[0-9]+)?)%){2}\s?(\/\s((\+|\-)?([0-9]+(\.[0-9]+)?(e(\+|\-)?[0-9]+)?|\.[0-9]+(e(\+|\-)?[0-9]+)?)%?)\s?)?\)$/i;

function isHSL(str) {
  (0, _assertString.default)(str); // Strip duplicate spaces before calling the validation regex (See  #1598 for more info)

  var strippedStr = str.replace(/\s+/g, ' ').replace(/\s?(hsla?\(|\)|,)\s?/ig, '$1');

  if (strippedStr.indexOf(',') !== -1) {
    return hslComma.test(strippedStr);
  }

  return hslSpace.test(strippedStr);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isHalfWidth.js":
/*!***************************************************!*\
  !*** ./node_modules/validator/lib/isHalfWidth.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isHalfWidth;
exports.halfWidth = void 0;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var halfWidth = /[\u0020-\u007E\uFF61-\uFF9F\uFFA0-\uFFDC\uFFE8-\uFFEE0-9a-zA-Z]/;
exports.halfWidth = halfWidth;

function isHalfWidth(str) {
  (0, _assertString.default)(str);
  return halfWidth.test(str);
}

/***/ }),

/***/ "./node_modules/validator/lib/isHash.js":
/*!**********************************************!*\
  !*** ./node_modules/validator/lib/isHash.js ***!
  \**********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isHash;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var lengths = {
  md5: 32,
  md4: 32,
  sha1: 40,
  sha256: 64,
  sha384: 96,
  sha512: 128,
  ripemd128: 32,
  ripemd160: 40,
  tiger128: 32,
  tiger160: 40,
  tiger192: 48,
  crc32: 8,
  crc32b: 8
};

function isHash(str, algorithm) {
  (0, _assertString.default)(str);
  var hash = new RegExp("^[a-fA-F0-9]{".concat(lengths[algorithm], "}$"));
  return hash.test(str);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isHexColor.js":
/*!**************************************************!*\
  !*** ./node_modules/validator/lib/isHexColor.js ***!
  \**************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isHexColor;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hexcolor = /^#?([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i;

function isHexColor(str) {
  (0, _assertString.default)(str);
  return hexcolor.test(str);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isHexadecimal.js":
/*!*****************************************************!*\
  !*** ./node_modules/validator/lib/isHexadecimal.js ***!
  \*****************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isHexadecimal;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hexadecimal = /^(0x|0h)?[0-9A-F]+$/i;

function isHexadecimal(str) {
  (0, _assertString.default)(str);
  return hexadecimal.test(str);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isIBAN.js":
/*!**********************************************!*\
  !*** ./node_modules/validator/lib/isIBAN.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isIBAN;
exports.locales = void 0;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * List of country codes with
 * corresponding IBAN regular expression
 * Reference: https://en.wikipedia.org/wiki/International_Bank_Account_Number
 */
var ibanRegexThroughCountryCode = {
  AD: /^(AD[0-9]{2})\d{8}[A-Z0-9]{12}$/,
  AE: /^(AE[0-9]{2})\d{3}\d{16}$/,
  AL: /^(AL[0-9]{2})\d{8}[A-Z0-9]{16}$/,
  AT: /^(AT[0-9]{2})\d{16}$/,
  AZ: /^(AZ[0-9]{2})[A-Z0-9]{4}\d{20}$/,
  BA: /^(BA[0-9]{2})\d{16}$/,
  BE: /^(BE[0-9]{2})\d{12}$/,
  BG: /^(BG[0-9]{2})[A-Z]{4}\d{6}[A-Z0-9]{8}$/,
  BH: /^(BH[0-9]{2})[A-Z]{4}[A-Z0-9]{14}$/,
  BR: /^(BR[0-9]{2})\d{23}[A-Z]{1}[A-Z0-9]{1}$/,
  BY: /^(BY[0-9]{2})[A-Z0-9]{4}\d{20}$/,
  CH: /^(CH[0-9]{2})\d{5}[A-Z0-9]{12}$/,
  CR: /^(CR[0-9]{2})\d{18}$/,
  CY: /^(CY[0-9]{2})\d{8}[A-Z0-9]{16}$/,
  CZ: /^(CZ[0-9]{2})\d{20}$/,
  DE: /^(DE[0-9]{2})\d{18}$/,
  DK: /^(DK[0-9]{2})\d{14}$/,
  DO: /^(DO[0-9]{2})[A-Z]{4}\d{20}$/,
  EE: /^(EE[0-9]{2})\d{16}$/,
  EG: /^(EG[0-9]{2})\d{25}$/,
  ES: /^(ES[0-9]{2})\d{20}$/,
  FI: /^(FI[0-9]{2})\d{14}$/,
  FO: /^(FO[0-9]{2})\d{14}$/,
  FR: /^(FR[0-9]{2})\d{10}[A-Z0-9]{11}\d{2}$/,
  GB: /^(GB[0-9]{2})[A-Z]{4}\d{14}$/,
  GE: /^(GE[0-9]{2})[A-Z0-9]{2}\d{16}$/,
  GI: /^(GI[0-9]{2})[A-Z]{4}[A-Z0-9]{15}$/,
  GL: /^(GL[0-9]{2})\d{14}$/,
  GR: /^(GR[0-9]{2})\d{7}[A-Z0-9]{16}$/,
  GT: /^(GT[0-9]{2})[A-Z0-9]{4}[A-Z0-9]{20}$/,
  HR: /^(HR[0-9]{2})\d{17}$/,
  HU: /^(HU[0-9]{2})\d{24}$/,
  IE: /^(IE[0-9]{2})[A-Z0-9]{4}\d{14}$/,
  IL: /^(IL[0-9]{2})\d{19}$/,
  IQ: /^(IQ[0-9]{2})[A-Z]{4}\d{15}$/,
  IR: /^(IR[0-9]{2})0\d{2}0\d{18}$/,
  IS: /^(IS[0-9]{2})\d{22}$/,
  IT: /^(IT[0-9]{2})[A-Z]{1}\d{10}[A-Z0-9]{12}$/,
  JO: /^(JO[0-9]{2})[A-Z]{4}\d{22}$/,
  KW: /^(KW[0-9]{2})[A-Z]{4}[A-Z0-9]{22}$/,
  KZ: /^(KZ[0-9]{2})\d{3}[A-Z0-9]{13}$/,
  LB: /^(LB[0-9]{2})\d{4}[A-Z0-9]{20}$/,
  LC: /^(LC[0-9]{2})[A-Z]{4}[A-Z0-9]{24}$/,
  LI: /^(LI[0-9]{2})\d{5}[A-Z0-9]{12}$/,
  LT: /^(LT[0-9]{2})\d{16}$/,
  LU: /^(LU[0-9]{2})\d{3}[A-Z0-9]{13}$/,
  LV: /^(LV[0-9]{2})[A-Z]{4}[A-Z0-9]{13}$/,
  MC: /^(MC[0-9]{2})\d{10}[A-Z0-9]{11}\d{2}$/,
  MD: /^(MD[0-9]{2})[A-Z0-9]{20}$/,
  ME: /^(ME[0-9]{2})\d{18}$/,
  MK: /^(MK[0-9]{2})\d{3}[A-Z0-9]{10}\d{2}$/,
  MR: /^(MR[0-9]{2})\d{23}$/,
  MT: /^(MT[0-9]{2})[A-Z]{4}\d{5}[A-Z0-9]{18}$/,
  MU: /^(MU[0-9]{2})[A-Z]{4}\d{19}[A-Z]{3}$/,
  MZ: /^(MZ[0-9]{2})\d{21}$/,
  NL: /^(NL[0-9]{2})[A-Z]{4}\d{10}$/,
  NO: /^(NO[0-9]{2})\d{11}$/,
  PK: /^(PK[0-9]{2})[A-Z0-9]{4}\d{16}$/,
  PL: /^(PL[0-9]{2})\d{24}$/,
  PS: /^(PS[0-9]{2})[A-Z0-9]{4}\d{21}$/,
  PT: /^(PT[0-9]{2})\d{21}$/,
  QA: /^(QA[0-9]{2})[A-Z]{4}[A-Z0-9]{21}$/,
  RO: /^(RO[0-9]{2})[A-Z]{4}[A-Z0-9]{16}$/,
  RS: /^(RS[0-9]{2})\d{18}$/,
  SA: /^(SA[0-9]{2})\d{2}[A-Z0-9]{18}$/,
  SC: /^(SC[0-9]{2})[A-Z]{4}\d{20}[A-Z]{3}$/,
  SE: /^(SE[0-9]{2})\d{20}$/,
  SI: /^(SI[0-9]{2})\d{15}$/,
  SK: /^(SK[0-9]{2})\d{20}$/,
  SM: /^(SM[0-9]{2})[A-Z]{1}\d{10}[A-Z0-9]{12}$/,
  SV: /^(SV[0-9]{2})[A-Z0-9]{4}\d{20}$/,
  TL: /^(TL[0-9]{2})\d{19}$/,
  TN: /^(TN[0-9]{2})\d{20}$/,
  TR: /^(TR[0-9]{2})\d{5}[A-Z0-9]{17}$/,
  UA: /^(UA[0-9]{2})\d{6}[A-Z0-9]{19}$/,
  VA: /^(VA[0-9]{2})\d{18}$/,
  VG: /^(VG[0-9]{2})[A-Z0-9]{4}\d{16}$/,
  XK: /^(XK[0-9]{2})\d{16}$/
};
/**
 * Check whether string has correct universal IBAN format
 * The IBAN consists of up to 34 alphanumeric characters, as follows:
 * Country Code using ISO 3166-1 alpha-2, two letters
 * check digits, two digits and
 * Basic Bank Account Number (BBAN), up to 30 alphanumeric characters.
 * NOTE: Permitted IBAN characters are: digits [0-9] and the 26 latin alphabetic [A-Z]
 *
 * @param {string} str - string under validation
 * @return {boolean}
 */

function hasValidIbanFormat(str) {
  // Strip white spaces and hyphens
  var strippedStr = str.replace(/[\s\-]+/gi, '').toUpperCase();
  var isoCountryCode = strippedStr.slice(0, 2).toUpperCase();
  return isoCountryCode in ibanRegexThroughCountryCode && ibanRegexThroughCountryCode[isoCountryCode].test(strippedStr);
}
/**
   * Check whether string has valid IBAN Checksum
   * by performing basic mod-97 operation and
   * the remainder should equal 1
   * -- Start by rearranging the IBAN by moving the four initial characters to the end of the string
   * -- Replace each letter in the string with two digits, A -> 10, B = 11, Z = 35
   * -- Interpret the string as a decimal integer and
   * -- compute the remainder on division by 97 (mod 97)
   * Reference: https://en.wikipedia.org/wiki/International_Bank_Account_Number
   *
   * @param {string} str
   * @return {boolean}
   */


function hasValidIbanChecksum(str) {
  var strippedStr = str.replace(/[^A-Z0-9]+/gi, '').toUpperCase(); // Keep only digits and A-Z latin alphabetic

  var rearranged = strippedStr.slice(4) + strippedStr.slice(0, 4);
  var alphaCapsReplacedWithDigits = rearranged.replace(/[A-Z]/g, function (char) {
    return char.charCodeAt(0) - 55;
  });
  var remainder = alphaCapsReplacedWithDigits.match(/\d{1,7}/g).reduce(function (acc, value) {
    return Number(acc + value) % 97;
  }, '');
  return remainder === 1;
}

function isIBAN(str) {
  (0, _assertString.default)(str);
  return hasValidIbanFormat(str) && hasValidIbanChecksum(str);
}

var locales = Object.keys(ibanRegexThroughCountryCode);
exports.locales = locales;

/***/ }),

/***/ "./node_modules/validator/lib/isIMEI.js":
/*!**********************************************!*\
  !*** ./node_modules/validator/lib/isIMEI.js ***!
  \**********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isIMEI;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var imeiRegexWithoutHypens = /^[0-9]{15}$/;
var imeiRegexWithHypens = /^\d{2}-\d{6}-\d{6}-\d{1}$/;

function isIMEI(str, options) {
  (0, _assertString.default)(str);
  options = options || {}; // default regex for checking imei is the one without hyphens

  var imeiRegex = imeiRegexWithoutHypens;

  if (options.allow_hyphens) {
    imeiRegex = imeiRegexWithHypens;
  }

  if (!imeiRegex.test(str)) {
    return false;
  }

  str = str.replace(/-/g, '');
  var sum = 0,
      mul = 2,
      l = 14;

  for (var i = 0; i < l; i++) {
    var digit = str.substring(l - i - 1, l - i);
    var tp = parseInt(digit, 10) * mul;

    if (tp >= 10) {
      sum += tp % 10 + 1;
    } else {
      sum += tp;
    }

    if (mul === 1) {
      mul += 1;
    } else {
      mul -= 1;
    }
  }

  var chk = (10 - sum % 10) % 10;

  if (chk !== parseInt(str.substring(14, 15), 10)) {
    return false;
  }

  return true;
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isIP.js":
/*!********************************************!*\
  !*** ./node_modules/validator/lib/isIP.js ***!
  \********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isIP;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
11.3.  Examples

   The following addresses

             fe80::1234 (on the 1st link of the node)
             ff02::5678 (on the 5th link of the node)
             ff08::9abc (on the 10th organization of the node)

   would be represented as follows:

             fe80::1234%1
             ff02::5678%5
             ff08::9abc%10

   (Here we assume a natural translation from a zone index to the
   <zone_id> part, where the Nth zone of any scope is translated into
   "N".)

   If we use interface names as <zone_id>, those addresses could also be
   represented as follows:

            fe80::1234%ne0
            ff02::5678%pvc1.3
            ff08::9abc%interface10

   where the interface "ne0" belongs to the 1st link, "pvc1.3" belongs
   to the 5th link, and "interface10" belongs to the 10th organization.
 * * */
var IPv4SegmentFormat = '(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])';
var IPv4AddressFormat = "(".concat(IPv4SegmentFormat, "[.]){3}").concat(IPv4SegmentFormat);
var IPv4AddressRegExp = new RegExp("^".concat(IPv4AddressFormat, "$"));
var IPv6SegmentFormat = '(?:[0-9a-fA-F]{1,4})';
var IPv6AddressRegExp = new RegExp('^(' + "(?:".concat(IPv6SegmentFormat, ":){7}(?:").concat(IPv6SegmentFormat, "|:)|") + "(?:".concat(IPv6SegmentFormat, ":){6}(?:").concat(IPv4AddressFormat, "|:").concat(IPv6SegmentFormat, "|:)|") + "(?:".concat(IPv6SegmentFormat, ":){5}(?::").concat(IPv4AddressFormat, "|(:").concat(IPv6SegmentFormat, "){1,2}|:)|") + "(?:".concat(IPv6SegmentFormat, ":){4}(?:(:").concat(IPv6SegmentFormat, "){0,1}:").concat(IPv4AddressFormat, "|(:").concat(IPv6SegmentFormat, "){1,3}|:)|") + "(?:".concat(IPv6SegmentFormat, ":){3}(?:(:").concat(IPv6SegmentFormat, "){0,2}:").concat(IPv4AddressFormat, "|(:").concat(IPv6SegmentFormat, "){1,4}|:)|") + "(?:".concat(IPv6SegmentFormat, ":){2}(?:(:").concat(IPv6SegmentFormat, "){0,3}:").concat(IPv4AddressFormat, "|(:").concat(IPv6SegmentFormat, "){1,5}|:)|") + "(?:".concat(IPv6SegmentFormat, ":){1}(?:(:").concat(IPv6SegmentFormat, "){0,4}:").concat(IPv4AddressFormat, "|(:").concat(IPv6SegmentFormat, "){1,6}|:)|") + "(?::((?::".concat(IPv6SegmentFormat, "){0,5}:").concat(IPv4AddressFormat, "|(?::").concat(IPv6SegmentFormat, "){1,7}|:))") + ')(%[0-9a-zA-Z-.:]{1,})?$');

function isIP(str) {
  var version = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  (0, _assertString.default)(str);
  version = String(version);

  if (!version) {
    return isIP(str, 4) || isIP(str, 6);
  }

  if (version === '4') {
    if (!IPv4AddressRegExp.test(str)) {
      return false;
    }

    var parts = str.split('.').sort(function (a, b) {
      return a - b;
    });
    return parts[3] <= 255;
  }

  if (version === '6') {
    return !!IPv6AddressRegExp.test(str);
  }

  return false;
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isIPRange.js":
/*!*************************************************!*\
  !*** ./node_modules/validator/lib/isIPRange.js ***!
  \*************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isIPRange;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

var _isIP = _interopRequireDefault(__webpack_require__(/*! ./isIP */ "./node_modules/validator/lib/isIP.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var subnetMaybe = /^\d{1,3}$/;
var v4Subnet = 32;
var v6Subnet = 128;

function isIPRange(str) {
  var version = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  (0, _assertString.default)(str);
  var parts = str.split('/'); // parts[0] -> ip, parts[1] -> subnet

  if (parts.length !== 2) {
    return false;
  }

  if (!subnetMaybe.test(parts[1])) {
    return false;
  } // Disallow preceding 0 i.e. 01, 02, ...


  if (parts[1].length > 1 && parts[1].startsWith('0')) {
    return false;
  }

  var isValidIP = (0, _isIP.default)(parts[0], version);

  if (!isValidIP) {
    return false;
  } // Define valid subnet according to IP's version


  var expectedSubnet = null;

  switch (String(version)) {
    case '4':
      expectedSubnet = v4Subnet;
      break;

    case '6':
      expectedSubnet = v6Subnet;
      break;

    default:
      expectedSubnet = (0, _isIP.default)(parts[0], '6') ? v6Subnet : v4Subnet;
  }

  return parts[1] <= expectedSubnet && parts[1] >= 0;
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isISBN.js":
/*!**********************************************!*\
  !*** ./node_modules/validator/lib/isISBN.js ***!
  \**********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isISBN;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isbn10Maybe = /^(?:[0-9]{9}X|[0-9]{10})$/;
var isbn13Maybe = /^(?:[0-9]{13})$/;
var factor = [1, 3];

function isISBN(str) {
  var version = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  (0, _assertString.default)(str);
  version = String(version);

  if (!version) {
    return isISBN(str, 10) || isISBN(str, 13);
  }

  var sanitized = str.replace(/[\s-]+/g, '');
  var checksum = 0;
  var i;

  if (version === '10') {
    if (!isbn10Maybe.test(sanitized)) {
      return false;
    }

    for (i = 0; i < 9; i++) {
      checksum += (i + 1) * sanitized.charAt(i);
    }

    if (sanitized.charAt(9) === 'X') {
      checksum += 10 * 10;
    } else {
      checksum += 10 * sanitized.charAt(9);
    }

    if (checksum % 11 === 0) {
      return !!sanitized;
    }
  } else if (version === '13') {
    if (!isbn13Maybe.test(sanitized)) {
      return false;
    }

    for (i = 0; i < 12; i++) {
      checksum += factor[i % 2] * sanitized.charAt(i);
    }

    if (sanitized.charAt(12) - (10 - checksum % 10) % 10 === 0) {
      return !!sanitized;
    }
  }

  return false;
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isISIN.js":
/*!**********************************************!*\
  !*** ./node_modules/validator/lib/isISIN.js ***!
  \**********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isISIN;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isin = /^[A-Z]{2}[0-9A-Z]{9}[0-9]$/; // this link details how the check digit is calculated:
// https://www.isin.org/isin-format/. it is a little bit
// odd in that it works with digits, not numbers. in order
// to make only one pass through the ISIN characters, the
// each alpha character is handled as 2 characters within
// the loop.

function isISIN(str) {
  (0, _assertString.default)(str);

  if (!isin.test(str)) {
    return false;
  }

  var double = true;
  var sum = 0; // convert values

  for (var i = str.length - 2; i >= 0; i--) {
    if (str[i] >= 'A' && str[i] <= 'Z') {
      var value = str[i].charCodeAt(0) - 55;
      var lo = value % 10;
      var hi = Math.trunc(value / 10); // letters have two digits, so handle the low order
      // and high order digits separately.

      for (var _i = 0, _arr = [lo, hi]; _i < _arr.length; _i++) {
        var digit = _arr[_i];

        if (double) {
          if (digit >= 5) {
            sum += 1 + (digit - 5) * 2;
          } else {
            sum += digit * 2;
          }
        } else {
          sum += digit;
        }

        double = !double;
      }
    } else {
      var _digit = str[i].charCodeAt(0) - '0'.charCodeAt(0);

      if (double) {
        if (_digit >= 5) {
          sum += 1 + (_digit - 5) * 2;
        } else {
          sum += _digit * 2;
        }
      } else {
        sum += _digit;
      }

      double = !double;
    }
  }

  var check = Math.trunc((sum + 9) / 10) * 10 - sum;
  return +str[str.length - 1] === check;
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isISO31661Alpha2.js":
/*!********************************************************!*\
  !*** ./node_modules/validator/lib/isISO31661Alpha2.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isISO31661Alpha2;
exports.CountryCodes = void 0;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// from https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
var validISO31661Alpha2CountriesCodes = new Set(['AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ', 'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS', 'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE', 'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM', 'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM', 'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA', 'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW', 'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI', 'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM', 'ZW']);

function isISO31661Alpha2(str) {
  (0, _assertString.default)(str);
  return validISO31661Alpha2CountriesCodes.has(str.toUpperCase());
}

var CountryCodes = validISO31661Alpha2CountriesCodes;
exports.CountryCodes = CountryCodes;

/***/ }),

/***/ "./node_modules/validator/lib/isISO31661Alpha3.js":
/*!********************************************************!*\
  !*** ./node_modules/validator/lib/isISO31661Alpha3.js ***!
  \********************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isISO31661Alpha3;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// from https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3
var validISO31661Alpha3CountriesCodes = new Set(['AFG', 'ALA', 'ALB', 'DZA', 'ASM', 'AND', 'AGO', 'AIA', 'ATA', 'ATG', 'ARG', 'ARM', 'ABW', 'AUS', 'AUT', 'AZE', 'BHS', 'BHR', 'BGD', 'BRB', 'BLR', 'BEL', 'BLZ', 'BEN', 'BMU', 'BTN', 'BOL', 'BES', 'BIH', 'BWA', 'BVT', 'BRA', 'IOT', 'BRN', 'BGR', 'BFA', 'BDI', 'KHM', 'CMR', 'CAN', 'CPV', 'CYM', 'CAF', 'TCD', 'CHL', 'CHN', 'CXR', 'CCK', 'COL', 'COM', 'COG', 'COD', 'COK', 'CRI', 'CIV', 'HRV', 'CUB', 'CUW', 'CYP', 'CZE', 'DNK', 'DJI', 'DMA', 'DOM', 'ECU', 'EGY', 'SLV', 'GNQ', 'ERI', 'EST', 'ETH', 'FLK', 'FRO', 'FJI', 'FIN', 'FRA', 'GUF', 'PYF', 'ATF', 'GAB', 'GMB', 'GEO', 'DEU', 'GHA', 'GIB', 'GRC', 'GRL', 'GRD', 'GLP', 'GUM', 'GTM', 'GGY', 'GIN', 'GNB', 'GUY', 'HTI', 'HMD', 'VAT', 'HND', 'HKG', 'HUN', 'ISL', 'IND', 'IDN', 'IRN', 'IRQ', 'IRL', 'IMN', 'ISR', 'ITA', 'JAM', 'JPN', 'JEY', 'JOR', 'KAZ', 'KEN', 'KIR', 'PRK', 'KOR', 'KWT', 'KGZ', 'LAO', 'LVA', 'LBN', 'LSO', 'LBR', 'LBY', 'LIE', 'LTU', 'LUX', 'MAC', 'MKD', 'MDG', 'MWI', 'MYS', 'MDV', 'MLI', 'MLT', 'MHL', 'MTQ', 'MRT', 'MUS', 'MYT', 'MEX', 'FSM', 'MDA', 'MCO', 'MNG', 'MNE', 'MSR', 'MAR', 'MOZ', 'MMR', 'NAM', 'NRU', 'NPL', 'NLD', 'NCL', 'NZL', 'NIC', 'NER', 'NGA', 'NIU', 'NFK', 'MNP', 'NOR', 'OMN', 'PAK', 'PLW', 'PSE', 'PAN', 'PNG', 'PRY', 'PER', 'PHL', 'PCN', 'POL', 'PRT', 'PRI', 'QAT', 'REU', 'ROU', 'RUS', 'RWA', 'BLM', 'SHN', 'KNA', 'LCA', 'MAF', 'SPM', 'VCT', 'WSM', 'SMR', 'STP', 'SAU', 'SEN', 'SRB', 'SYC', 'SLE', 'SGP', 'SXM', 'SVK', 'SVN', 'SLB', 'SOM', 'ZAF', 'SGS', 'SSD', 'ESP', 'LKA', 'SDN', 'SUR', 'SJM', 'SWZ', 'SWE', 'CHE', 'SYR', 'TWN', 'TJK', 'TZA', 'THA', 'TLS', 'TGO', 'TKL', 'TON', 'TTO', 'TUN', 'TUR', 'TKM', 'TCA', 'TUV', 'UGA', 'UKR', 'ARE', 'GBR', 'USA', 'UMI', 'URY', 'UZB', 'VUT', 'VEN', 'VNM', 'VGB', 'VIR', 'WLF', 'ESH', 'YEM', 'ZMB', 'ZWE']);

function isISO31661Alpha3(str) {
  (0, _assertString.default)(str);
  return validISO31661Alpha3CountriesCodes.has(str.toUpperCase());
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isISO4217.js":
/*!*************************************************!*\
  !*** ./node_modules/validator/lib/isISO4217.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isISO4217;
exports.CurrencyCodes = void 0;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// from https://en.wikipedia.org/wiki/ISO_4217
var validISO4217CurrencyCodes = new Set(['AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN', 'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BOV', 'BRL', 'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHE', 'CHF', 'CHW', 'CLF', 'CLP', 'CNY', 'COP', 'COU', 'CRC', 'CUC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD', 'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'GBP', 'GEL', 'GHS', 'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF', 'IDR', 'ILS', 'INR', 'IQD', 'IRR', 'ISK', 'JMD', 'JOD', 'JPY', 'KES', 'KGS', 'KHR', 'KMF', 'KPW', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MRU', 'MUR', 'MVR', 'MWK', 'MXN', 'MXV', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLL', 'SOS', 'SRD', 'SSP', 'STN', 'SVC', 'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY', 'TTD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD', 'USN', 'UYI', 'UYU', 'UYW', 'UZS', 'VES', 'VND', 'VUV', 'WST', 'XAF', 'XAG', 'XAU', 'XBA', 'XBB', 'XBC', 'XBD', 'XCD', 'XDR', 'XOF', 'XPD', 'XPF', 'XPT', 'XSU', 'XTS', 'XUA', 'XXX', 'YER', 'ZAR', 'ZMW', 'ZWL']);

function isISO4217(str) {
  (0, _assertString.default)(str);
  return validISO4217CurrencyCodes.has(str.toUpperCase());
}

var CurrencyCodes = validISO4217CurrencyCodes;
exports.CurrencyCodes = CurrencyCodes;

/***/ }),

/***/ "./node_modules/validator/lib/isISO8601.js":
/*!*************************************************!*\
  !*** ./node_modules/validator/lib/isISO8601.js ***!
  \*************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isISO8601;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable max-len */
// from http://goo.gl/0ejHHW
var iso8601 = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-3])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/; // same as above, except with a strict 'T' separator between date and time

var iso8601StrictSeparator = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-3])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T]((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;
/* eslint-enable max-len */

var isValidDate = function isValidDate(str) {
  // str must have passed the ISO8601 check
  // this check is meant to catch invalid dates
  // like 2009-02-31
  // first check for ordinal dates
  var ordinalMatch = str.match(/^(\d{4})-?(\d{3})([ T]{1}\.*|$)/);

  if (ordinalMatch) {
    var oYear = Number(ordinalMatch[1]);
    var oDay = Number(ordinalMatch[2]); // if is leap year

    if (oYear % 4 === 0 && oYear % 100 !== 0 || oYear % 400 === 0) return oDay <= 366;
    return oDay <= 365;
  }

  var match = str.match(/(\d{4})-?(\d{0,2})-?(\d*)/).map(Number);
  var year = match[1];
  var month = match[2];
  var day = match[3];
  var monthString = month ? "0".concat(month).slice(-2) : month;
  var dayString = day ? "0".concat(day).slice(-2) : day; // create a date object and compare

  var d = new Date("".concat(year, "-").concat(monthString || '01', "-").concat(dayString || '01'));

  if (month && day) {
    return d.getUTCFullYear() === year && d.getUTCMonth() + 1 === month && d.getUTCDate() === day;
  }

  return true;
};

function isISO8601(str) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  (0, _assertString.default)(str);
  var check = options.strictSeparator ? iso8601StrictSeparator.test(str) : iso8601.test(str);
  if (check && options.strict) return isValidDate(str);
  return check;
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isISRC.js":
/*!**********************************************!*\
  !*** ./node_modules/validator/lib/isISRC.js ***!
  \**********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isISRC;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// see http://isrc.ifpi.org/en/isrc-standard/code-syntax
var isrc = /^[A-Z]{2}[0-9A-Z]{3}\d{2}\d{5}$/;

function isISRC(str) {
  (0, _assertString.default)(str);
  return isrc.test(str);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isISSN.js":
/*!**********************************************!*\
  !*** ./node_modules/validator/lib/isISSN.js ***!
  \**********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isISSN;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var issn = '^\\d{4}-?\\d{3}[\\dX]$';

function isISSN(str) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  (0, _assertString.default)(str);
  var testIssn = issn;
  testIssn = options.require_hyphen ? testIssn.replace('?', '') : testIssn;
  testIssn = options.case_sensitive ? new RegExp(testIssn) : new RegExp(testIssn, 'i');

  if (!testIssn.test(str)) {
    return false;
  }

  var digits = str.replace('-', '').toUpperCase();
  var checksum = 0;

  for (var i = 0; i < digits.length; i++) {
    var digit = digits[i];
    checksum += (digit === 'X' ? 10 : +digit) * (8 - i);
  }

  return checksum % 11 === 0;
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isIdentityCard.js":
/*!******************************************************!*\
  !*** ./node_modules/validator/lib/isIdentityCard.js ***!
  \******************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isIdentityCard;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

var _isInt = _interopRequireDefault(__webpack_require__(/*! ./isInt */ "./node_modules/validator/lib/isInt.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var validators = {
  PL: function PL(str) {
    (0, _assertString.default)(str);
    var weightOfDigits = {
      1: 1,
      2: 3,
      3: 7,
      4: 9,
      5: 1,
      6: 3,
      7: 7,
      8: 9,
      9: 1,
      10: 3,
      11: 0
    };

    if (str != null && str.length === 11 && (0, _isInt.default)(str, {
      allow_leading_zeroes: true
    })) {
      var digits = str.split('').slice(0, -1);
      var sum = digits.reduce(function (acc, digit, index) {
        return acc + Number(digit) * weightOfDigits[index + 1];
      }, 0);
      var modulo = sum % 10;
      var lastDigit = Number(str.charAt(str.length - 1));

      if (modulo === 0 && lastDigit === 0 || lastDigit === 10 - modulo) {
        return true;
      }
    }

    return false;
  },
  ES: function ES(str) {
    (0, _assertString.default)(str);
    var DNI = /^[0-9X-Z][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
    var charsValue = {
      X: 0,
      Y: 1,
      Z: 2
    };
    var controlDigits = ['T', 'R', 'W', 'A', 'G', 'M', 'Y', 'F', 'P', 'D', 'X', 'B', 'N', 'J', 'Z', 'S', 'Q', 'V', 'H', 'L', 'C', 'K', 'E']; // sanitize user input

    var sanitized = str.trim().toUpperCase(); // validate the data structure

    if (!DNI.test(sanitized)) {
      return false;
    } // validate the control digit


    var number = sanitized.slice(0, -1).replace(/[X,Y,Z]/g, function (char) {
      return charsValue[char];
    });
    return sanitized.endsWith(controlDigits[number % 23]);
  },
  FI: function FI(str) {
    // https://dvv.fi/en/personal-identity-code#:~:text=control%20character%20for%20a-,personal,-identity%20code%20calculated
    (0, _assertString.default)(str);

    if (str.length !== 11) {
      return false;
    }

    if (!str.match(/^\d{6}[\-A\+]\d{3}[0-9ABCDEFHJKLMNPRSTUVWXY]{1}$/)) {
      return false;
    }

    var checkDigits = '0123456789ABCDEFHJKLMNPRSTUVWXY';
    var idAsNumber = parseInt(str.slice(0, 6), 10) * 1000 + parseInt(str.slice(7, 10), 10);
    var remainder = idAsNumber % 31;
    var checkDigit = checkDigits[remainder];
    return checkDigit === str.slice(10, 11);
  },
  IN: function IN(str) {
    var DNI = /^[1-9]\d{3}\s?\d{4}\s?\d{4}$/; // multiplication table

    var d = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 4, 0, 6, 7, 8, 9, 5], [2, 3, 4, 0, 1, 7, 8, 9, 5, 6], [3, 4, 0, 1, 2, 8, 9, 5, 6, 7], [4, 0, 1, 2, 3, 9, 5, 6, 7, 8], [5, 9, 8, 7, 6, 0, 4, 3, 2, 1], [6, 5, 9, 8, 7, 1, 0, 4, 3, 2], [7, 6, 5, 9, 8, 2, 1, 0, 4, 3], [8, 7, 6, 5, 9, 3, 2, 1, 0, 4], [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]]; // permutation table

    var p = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 5, 7, 6, 2, 8, 3, 0, 9, 4], [5, 8, 0, 3, 7, 9, 6, 1, 4, 2], [8, 9, 1, 6, 0, 4, 3, 5, 2, 7], [9, 4, 5, 3, 1, 2, 6, 8, 7, 0], [4, 2, 8, 6, 5, 7, 3, 9, 0, 1], [2, 7, 9, 3, 8, 0, 6, 4, 1, 5], [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]]; // sanitize user input

    var sanitized = str.trim(); // validate the data structure

    if (!DNI.test(sanitized)) {
      return false;
    }

    var c = 0;
    var invertedArray = sanitized.replace(/\s/g, '').split('').map(Number).reverse();
    invertedArray.forEach(function (val, i) {
      c = d[c][p[i % 8][val]];
    });
    return c === 0;
  },
  IR: function IR(str) {
    if (!str.match(/^\d{10}$/)) return false;
    str = "0000".concat(str).substr(str.length - 6);
    if (parseInt(str.substr(3, 6), 10) === 0) return false;
    var lastNumber = parseInt(str.substr(9, 1), 10);
    var sum = 0;

    for (var i = 0; i < 9; i++) {
      sum += parseInt(str.substr(i, 1), 10) * (10 - i);
    }

    sum %= 11;
    return sum < 2 && lastNumber === sum || sum >= 2 && lastNumber === 11 - sum;
  },
  IT: function IT(str) {
    if (str.length !== 9) return false;
    if (str === 'CA00000AA') return false; // https://it.wikipedia.org/wiki/Carta_d%27identit%C3%A0_elettronica_italiana

    return str.search(/C[A-Z][0-9]{5}[A-Z]{2}/i) > -1;
  },
  NO: function NO(str) {
    var sanitized = str.trim();
    if (isNaN(Number(sanitized))) return false;
    if (sanitized.length !== 11) return false;
    if (sanitized === '00000000000') return false; // https://no.wikipedia.org/wiki/F%C3%B8dselsnummer

    var f = sanitized.split('').map(Number);
    var k1 = (11 - (3 * f[0] + 7 * f[1] + 6 * f[2] + 1 * f[3] + 8 * f[4] + 9 * f[5] + 4 * f[6] + 5 * f[7] + 2 * f[8]) % 11) % 11;
    var k2 = (11 - (5 * f[0] + 4 * f[1] + 3 * f[2] + 2 * f[3] + 7 * f[4] + 6 * f[5] + 5 * f[6] + 4 * f[7] + 3 * f[8] + 2 * k1) % 11) % 11;
    if (k1 !== f[9] || k2 !== f[10]) return false;
    return true;
  },
  TH: function TH(str) {
    if (!str.match(/^[1-8]\d{12}$/)) return false; // validate check digit

    var sum = 0;

    for (var i = 0; i < 12; i++) {
      sum += parseInt(str[i], 10) * (13 - i);
    }

    return str[12] === ((11 - sum % 11) % 10).toString();
  },
  LK: function LK(str) {
    var old_nic = /^[1-9]\d{8}[vx]$/i;
    var new_nic = /^[1-9]\d{11}$/i;
    if (str.length === 10 && old_nic.test(str)) return true;else if (str.length === 12 && new_nic.test(str)) return true;
    return false;
  },
  'he-IL': function heIL(str) {
    var DNI = /^\d{9}$/; // sanitize user input

    var sanitized = str.trim(); // validate the data structure

    if (!DNI.test(sanitized)) {
      return false;
    }

    var id = sanitized;
    var sum = 0,
        incNum;

    for (var i = 0; i < id.length; i++) {
      incNum = Number(id[i]) * (i % 2 + 1); // Multiply number by 1 or 2

      sum += incNum > 9 ? incNum - 9 : incNum; // Sum the digits up and add to total
    }

    return sum % 10 === 0;
  },
  'ar-LY': function arLY(str) {
    // Libya National Identity Number NIN is 12 digits, the first digit is either 1 or 2
    var NIN = /^(1|2)\d{11}$/; // sanitize user input

    var sanitized = str.trim(); // validate the data structure

    if (!NIN.test(sanitized)) {
      return false;
    }

    return true;
  },
  'ar-TN': function arTN(str) {
    var DNI = /^\d{8}$/; // sanitize user input

    var sanitized = str.trim(); // validate the data structure

    if (!DNI.test(sanitized)) {
      return false;
    }

    return true;
  },
  'zh-CN': function zhCN(str) {
    var provincesAndCities = ['11', // 北京
    '12', // 天津
    '13', // 河北
    '14', // 山西
    '15', // 内蒙古
    '21', // 辽宁
    '22', // 吉林
    '23', // 黑龙江
    '31', // 上海
    '32', // 江苏
    '33', // 浙江
    '34', // 安徽
    '35', // 福建
    '36', // 江西
    '37', // 山东
    '41', // 河南
    '42', // 湖北
    '43', // 湖南
    '44', // 广东
    '45', // 广西
    '46', // 海南
    '50', // 重庆
    '51', // 四川
    '52', // 贵州
    '53', // 云南
    '54', // 西藏
    '61', // 陕西
    '62', // 甘肃
    '63', // 青海
    '64', // 宁夏
    '65', // 新疆
    '71', // 台湾
    '81', // 香港
    '82', // 澳门
    '91' // 国外
    ];
    var powers = ['7', '9', '10', '5', '8', '4', '2', '1', '6', '3', '7', '9', '10', '5', '8', '4', '2'];
    var parityBit = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

    var checkAddressCode = function checkAddressCode(addressCode) {
      return provincesAndCities.includes(addressCode);
    };

    var checkBirthDayCode = function checkBirthDayCode(birDayCode) {
      var yyyy = parseInt(birDayCode.substring(0, 4), 10);
      var mm = parseInt(birDayCode.substring(4, 6), 10);
      var dd = parseInt(birDayCode.substring(6), 10);
      var xdata = new Date(yyyy, mm - 1, dd);

      if (xdata > new Date()) {
        return false; // eslint-disable-next-line max-len
      } else if (xdata.getFullYear() === yyyy && xdata.getMonth() === mm - 1 && xdata.getDate() === dd) {
        return true;
      }

      return false;
    };

    var getParityBit = function getParityBit(idCardNo) {
      var id17 = idCardNo.substring(0, 17);
      var power = 0;

      for (var i = 0; i < 17; i++) {
        power += parseInt(id17.charAt(i), 10) * parseInt(powers[i], 10);
      }

      var mod = power % 11;
      return parityBit[mod];
    };

    var checkParityBit = function checkParityBit(idCardNo) {
      return getParityBit(idCardNo) === idCardNo.charAt(17).toUpperCase();
    };

    var check15IdCardNo = function check15IdCardNo(idCardNo) {
      var check = /^[1-9]\d{7}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))\d{3}$/.test(idCardNo);
      if (!check) return false;
      var addressCode = idCardNo.substring(0, 2);
      check = checkAddressCode(addressCode);
      if (!check) return false;
      var birDayCode = "19".concat(idCardNo.substring(6, 12));
      check = checkBirthDayCode(birDayCode);
      if (!check) return false;
      return true;
    };

    var check18IdCardNo = function check18IdCardNo(idCardNo) {
      var check = /^[1-9]\d{5}[1-9]\d{3}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))\d{3}(\d|x|X)$/.test(idCardNo);
      if (!check) return false;
      var addressCode = idCardNo.substring(0, 2);
      check = checkAddressCode(addressCode);
      if (!check) return false;
      var birDayCode = idCardNo.substring(6, 14);
      check = checkBirthDayCode(birDayCode);
      if (!check) return false;
      return checkParityBit(idCardNo);
    };

    var checkIdCardNo = function checkIdCardNo(idCardNo) {
      var check = /^\d{15}|(\d{17}(\d|x|X))$/.test(idCardNo);
      if (!check) return false;

      if (idCardNo.length === 15) {
        return check15IdCardNo(idCardNo);
      }

      return check18IdCardNo(idCardNo);
    };

    return checkIdCardNo(str);
  },
  'zh-TW': function zhTW(str) {
    var ALPHABET_CODES = {
      A: 10,
      B: 11,
      C: 12,
      D: 13,
      E: 14,
      F: 15,
      G: 16,
      H: 17,
      I: 34,
      J: 18,
      K: 19,
      L: 20,
      M: 21,
      N: 22,
      O: 35,
      P: 23,
      Q: 24,
      R: 25,
      S: 26,
      T: 27,
      U: 28,
      V: 29,
      W: 32,
      X: 30,
      Y: 31,
      Z: 33
    };
    var sanitized = str.trim().toUpperCase();
    if (!/^[A-Z][0-9]{9}$/.test(sanitized)) return false;
    return Array.from(sanitized).reduce(function (sum, number, index) {
      if (index === 0) {
        var code = ALPHABET_CODES[number];
        return code % 10 * 9 + Math.floor(code / 10);
      }

      if (index === 9) {
        return (10 - sum % 10 - Number(number)) % 10 === 0;
      }

      return sum + Number(number) * (9 - index);
    }, 0);
  }
};

function isIdentityCard(str, locale) {
  (0, _assertString.default)(str);

  if (locale in validators) {
    return validators[locale](str);
  } else if (locale === 'any') {
    for (var key in validators) {
      // https://github.com/gotwarlost/istanbul/blob/master/ignoring-code-for-coverage.md#ignoring-code-for-coverage-purposes
      // istanbul ignore else
      if (validators.hasOwnProperty(key)) {
        var validator = validators[key];

        if (validator(str)) {
          return true;
        }
      }
    }

    return false;
  }

  throw new Error("Invalid locale '".concat(locale, "'"));
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isIn.js":
/*!********************************************!*\
  !*** ./node_modules/validator/lib/isIn.js ***!
  \********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isIn;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

var _toString = _interopRequireDefault(__webpack_require__(/*! ./util/toString */ "./node_modules/validator/lib/util/toString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function isIn(str, options) {
  (0, _assertString.default)(str);
  var i;

  if (Object.prototype.toString.call(options) === '[object Array]') {
    var array = [];

    for (i in options) {
      // https://github.com/gotwarlost/istanbul/blob/master/ignoring-code-for-coverage.md#ignoring-code-for-coverage-purposes
      // istanbul ignore else
      if ({}.hasOwnProperty.call(options, i)) {
        array[i] = (0, _toString.default)(options[i]);
      }
    }

    return array.indexOf(str) >= 0;
  } else if (_typeof(options) === 'object') {
    return options.hasOwnProperty(str);
  } else if (options && typeof options.indexOf === 'function') {
    return options.indexOf(str) >= 0;
  }

  return false;
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isInt.js":
/*!*********************************************!*\
  !*** ./node_modules/validator/lib/isInt.js ***!
  \*********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isInt;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var int = /^(?:[-+]?(?:0|[1-9][0-9]*))$/;
var intLeadingZeroes = /^[-+]?[0-9]+$/;

function isInt(str, options) {
  (0, _assertString.default)(str);
  options = options || {}; // Get the regex to use for testing, based on whether
  // leading zeroes are allowed or not.

  var regex = options.hasOwnProperty('allow_leading_zeroes') && !options.allow_leading_zeroes ? int : intLeadingZeroes; // Check min/max/lt/gt

  var minCheckPassed = !options.hasOwnProperty('min') || str >= options.min;
  var maxCheckPassed = !options.hasOwnProperty('max') || str <= options.max;
  var ltCheckPassed = !options.hasOwnProperty('lt') || str < options.lt;
  var gtCheckPassed = !options.hasOwnProperty('gt') || str > options.gt;
  return regex.test(str) && minCheckPassed && maxCheckPassed && ltCheckPassed && gtCheckPassed;
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isJSON.js":
/*!**********************************************!*\
  !*** ./node_modules/validator/lib/isJSON.js ***!
  \**********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isJSON;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

var _merge = _interopRequireDefault(__webpack_require__(/*! ./util/merge */ "./node_modules/validator/lib/util/merge.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var default_json_options = {
  allow_primitives: false
};

function isJSON(str, options) {
  (0, _assertString.default)(str);

  try {
    options = (0, _merge.default)(options, default_json_options);
    var primitives = [];

    if (options.allow_primitives) {
      primitives = [null, false, true];
    }

    var obj = JSON.parse(str);
    return primitives.includes(obj) || !!obj && _typeof(obj) === 'object';
  } catch (e) {
    /* ignore */
  }

  return false;
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isJWT.js":
/*!*********************************************!*\
  !*** ./node_modules/validator/lib/isJWT.js ***!
  \*********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isJWT;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

var _isBase = _interopRequireDefault(__webpack_require__(/*! ./isBase64 */ "./node_modules/validator/lib/isBase64.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isJWT(str) {
  (0, _assertString.default)(str);
  var dotSplit = str.split('.');
  var len = dotSplit.length;

  if (len > 3 || len < 2) {
    return false;
  }

  return dotSplit.reduce(function (acc, currElem) {
    return acc && (0, _isBase.default)(currElem, {
      urlSafe: true
    });
  }, true);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isLatLong.js":
/*!*************************************************!*\
  !*** ./node_modules/validator/lib/isLatLong.js ***!
  \*************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isLatLong;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

var _merge = _interopRequireDefault(__webpack_require__(/*! ./util/merge */ "./node_modules/validator/lib/util/merge.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var lat = /^\(?[+-]?(90(\.0+)?|[1-8]?\d(\.\d+)?)$/;
var long = /^\s?[+-]?(180(\.0+)?|1[0-7]\d(\.\d+)?|\d{1,2}(\.\d+)?)\)?$/;
var latDMS = /^(([1-8]?\d)\D+([1-5]?\d|60)\D+([1-5]?\d|60)(\.\d+)?|90\D+0\D+0)\D+[NSns]?$/i;
var longDMS = /^\s*([1-7]?\d{1,2}\D+([1-5]?\d|60)\D+([1-5]?\d|60)(\.\d+)?|180\D+0\D+0)\D+[EWew]?$/i;
var defaultLatLongOptions = {
  checkDMS: false
};

function isLatLong(str, options) {
  (0, _assertString.default)(str);
  options = (0, _merge.default)(options, defaultLatLongOptions);
  if (!str.includes(',')) return false;
  var pair = str.split(',');
  if (pair[0].startsWith('(') && !pair[1].endsWith(')') || pair[1].endsWith(')') && !pair[0].startsWith('(')) return false;

  if (options.checkDMS) {
    return latDMS.test(pair[0]) && longDMS.test(pair[1]);
  }

  return lat.test(pair[0]) && long.test(pair[1]);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isLength.js":
/*!************************************************!*\
  !*** ./node_modules/validator/lib/isLength.js ***!
  \************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isLength;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/* eslint-disable prefer-rest-params */
function isLength(str, options) {
  (0, _assertString.default)(str);
  var min;
  var max;

  if (_typeof(options) === 'object') {
    min = options.min || 0;
    max = options.max;
  } else {
    // backwards compatibility: isLength(str, min [, max])
    min = arguments[1] || 0;
    max = arguments[2];
  }

  var surrogatePairs = str.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g) || [];
  var len = str.length - surrogatePairs.length;
  return len >= min && (typeof max === 'undefined' || len <= max);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isLicensePlate.js":
/*!******************************************************!*\
  !*** ./node_modules/validator/lib/isLicensePlate.js ***!
  \******************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isLicensePlate;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var validators = {
  'cs-CZ': function csCZ(str) {
    return /^(([ABCDEFHKIJKLMNPRSTUVXYZ]|[0-9])-?){5,8}$/.test(str);
  },
  'de-DE': function deDE(str) {
    return /^((AW|UL|AK|GA|AÖ|LF|AZ|AM|AS|ZE|AN|AB|A|KG|KH|BA|EW|BZ|HY|KM|BT|HP|B|BC|BI|BO|FN|TT|ÜB|BN|AH|BS|FR|HB|ZZ|BB|BK|BÖ|OC|OK|CW|CE|C|CO|LH|CB|KW|LC|LN|DA|DI|DE|DH|SY|NÖ|DO|DD|DU|DN|D|EI|EA|EE|FI|EM|EL|EN|PF|ED|EF|ER|AU|ZP|E|ES|NT|EU|FL|FO|FT|FF|F|FS|FD|FÜ|GE|G|GI|GF|GS|ZR|GG|GP|GR|NY|ZI|GÖ|GZ|GT|HA|HH|HM|HU|WL|HZ|WR|RN|HK|HD|HN|HS|GK|HE|HF|RZ|HI|HG|HO|HX|IK|IL|IN|J|JL|KL|KA|KS|KF|KE|KI|KT|KO|KN|KR|KC|KU|K|LD|LL|LA|L|OP|LM|LI|LB|LU|LÖ|HL|LG|MD|GN|MZ|MA|ML|MR|MY|AT|DM|MC|NZ|RM|RG|MM|ME|MB|MI|FG|DL|HC|MW|RL|MK|MG|MÜ|WS|MH|M|MS|NU|NB|ND|NM|NK|NW|NR|NI|NF|DZ|EB|OZ|TG|TO|N|OA|GM|OB|CA|EH|FW|OF|OL|OE|OG|BH|LR|OS|AA|GD|OH|KY|NP|WK|PB|PA|PE|PI|PS|P|PM|PR|RA|RV|RE|R|H|SB|WN|RS|RD|RT|BM|NE|GV|RP|SU|GL|RO|GÜ|RH|EG|RW|PN|SK|MQ|RU|SZ|RI|SL|SM|SC|HR|FZ|VS|SW|SN|CR|SE|SI|SO|LP|SG|NH|SP|IZ|ST|BF|TE|HV|OD|SR|S|AC|DW|ZW|TF|TS|TR|TÜ|UM|PZ|TP|UE|UN|UH|MN|KK|VB|V|AE|PL|RC|VG|GW|PW|VR|VK|KB|WA|WT|BE|WM|WE|AP|MO|WW|FB|WZ|WI|WB|JE|WF|WO|W|WÜ|BL|Z|GC)[- ]?[A-Z]{1,2}[- ]?\d{1,4}|(AIC|FDB|ABG|SLN|SAW|KLZ|BUL|ESB|NAB|SUL|WST|ABI|AZE|BTF|KÖT|DKB|FEU|ROT|ALZ|SMÜ|WER|AUR|NOR|DÜW|BRK|HAB|TÖL|WOR|BAD|BAR|BER|BIW|EBS|KEM|MÜB|PEG|BGL|BGD|REI|WIL|BKS|BIR|WAT|BOR|BOH|BOT|BRB|BLK|HHM|NEB|NMB|WSF|LEO|HDL|WMS|WZL|BÜS|CHA|KÖZ|ROD|WÜM|CLP|NEC|COC|ZEL|COE|CUX|DAH|LDS|DEG|DEL|RSL|DLG|DGF|LAN|HEI|MED|DON|KIB|ROK|JÜL|MON|SLE|EBE|EIC|HIG|WBS|BIT|PRÜ|LIB|EMD|WIT|ERH|HÖS|ERZ|ANA|ASZ|MAB|MEK|STL|SZB|FDS|HCH|HOR|WOL|FRG|GRA|WOS|FRI|FFB|GAP|GER|BRL|CLZ|GTH|NOH|HGW|GRZ|LÖB|NOL|WSW|DUD|HMÜ|OHA|KRU|HAL|HAM|HBS|QLB|HVL|NAU|HAS|EBN|GEO|HOH|HDH|ERK|HER|WAN|HEF|ROF|HBN|ALF|HSK|USI|NAI|REH|SAN|KÜN|ÖHR|HOL|WAR|ARN|BRG|GNT|HOG|WOH|KEH|MAI|PAR|RID|ROL|KLE|GEL|KUS|KYF|ART|SDH|LDK|DIL|MAL|VIB|LER|BNA|GHA|GRM|MTL|WUR|LEV|LIF|STE|WEL|LIP|VAI|LUP|HGN|LBZ|LWL|PCH|STB|DAN|MKK|SLÜ|MSP|TBB|MGH|MTK|BIN|MSH|EIL|HET|SGH|BID|MYK|MSE|MST|MÜR|WRN|MEI|GRH|RIE|MZG|MIL|OBB|BED|FLÖ|MOL|FRW|SEE|SRB|AIB|MOS|BCH|ILL|SOB|NMS|NEA|SEF|UFF|NEW|VOH|NDH|TDO|NWM|GDB|GVM|WIS|NOM|EIN|GAN|LAU|HEB|OHV|OSL|SFB|ERB|LOS|BSK|KEL|BSB|MEL|WTL|OAL|FÜS|MOD|OHZ|OPR|BÜR|PAF|PLÖ|CAS|GLA|REG|VIT|ECK|SIM|GOA|EMS|DIZ|GOH|RÜD|SWA|NES|KÖN|MET|LRO|BÜZ|DBR|ROS|TET|HRO|ROW|BRV|HIP|PAN|GRI|SHK|EIS|SRO|SOK|LBS|SCZ|MER|QFT|SLF|SLS|HOM|SLK|ASL|BBG|SBK|SFT|SHG|MGN|MEG|ZIG|SAD|NEN|OVI|SHA|BLB|SIG|SON|SPN|FOR|GUB|SPB|IGB|WND|STD|STA|SDL|OBG|HST|BOG|SHL|PIR|FTL|SEB|SÖM|SÜW|TIR|SAB|TUT|ANG|SDT|LÜN|LSZ|MHL|VEC|VER|VIE|OVL|ANK|OVP|SBG|UEM|UER|WLG|GMN|NVP|RDG|RÜG|DAU|FKB|WAF|WAK|SLZ|WEN|SOG|APD|WUG|GUN|ESW|WIZ|WES|DIN|BRA|BÜD|WHV|HWI|GHC|WTM|WOB|WUN|MAK|SEL|OCH|HOT|WDA)[- ]?(([A-Z][- ]?\d{1,4})|([A-Z]{2}[- ]?\d{1,3})))[- ]?(E|H)?$/.test(str);
  },
  'de-LI': function deLI(str) {
    return /^FL[- ]?\d{1,5}[UZ]?$/.test(str);
  },
  'fi-FI': function fiFI(str) {
    return /^(?=.{4,7})(([A-Z]{1,3}|[0-9]{1,3})[\s-]?([A-Z]{1,3}|[0-9]{1,5}))$/.test(str);
  },
  'pt-PT': function ptPT(str) {
    return /^([A-Z]{2}|[0-9]{2})[ -·]?([A-Z]{2}|[0-9]{2})[ -·]?([A-Z]{2}|[0-9]{2})$/.test(str);
  },
  'sq-AL': function sqAL(str) {
    return /^[A-Z]{2}[- ]?((\d{3}[- ]?(([A-Z]{2})|T))|(R[- ]?\d{3}))$/.test(str);
  },
  'pt-BR': function ptBR(str) {
    return /^[A-Z]{3}[ -]?[0-9][A-Z][0-9]{2}|[A-Z]{3}[ -]?[0-9]{4}$/.test(str);
  }
};

function isLicensePlate(str, locale) {
  (0, _assertString.default)(str);

  if (locale in validators) {
    return validators[locale](str);
  } else if (locale === 'any') {
    for (var key in validators) {
      /* eslint guard-for-in: 0 */
      var validator = validators[key];

      if (validator(str)) {
        return true;
      }
    }

    return false;
  }

  throw new Error("Invalid locale '".concat(locale, "'"));
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isLocale.js":
/*!************************************************!*\
  !*** ./node_modules/validator/lib/isLocale.js ***!
  \************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isLocale;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var localeReg = /^[A-Za-z]{2,4}([_-]([A-Za-z]{4}|[\d]{3}))?([_-]([A-Za-z]{2}|[\d]{3}))?$/;

function isLocale(str) {
  (0, _assertString.default)(str);

  if (str === 'en_US_POSIX' || str === 'ca_ES_VALENCIA') {
    return true;
  }

  return localeReg.test(str);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isLowercase.js":
/*!***************************************************!*\
  !*** ./node_modules/validator/lib/isLowercase.js ***!
  \***************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isLowercase;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isLowercase(str) {
  (0, _assertString.default)(str);
  return str === str.toLowerCase();
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isMACAddress.js":
/*!****************************************************!*\
  !*** ./node_modules/validator/lib/isMACAddress.js ***!
  \****************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isMACAddress;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var macAddress = /^(?:[0-9a-fA-F]{2}([-:\s]))([0-9a-fA-F]{2}\1){4}([0-9a-fA-F]{2})$/;
var macAddressNoSeparators = /^([0-9a-fA-F]){12}$/;
var macAddressWithDots = /^([0-9a-fA-F]{4}\.){2}([0-9a-fA-F]{4})$/;

function isMACAddress(str, options) {
  (0, _assertString.default)(str);
  /**
   * @deprecated `no_colons` TODO: remove it in the next major
  */

  if (options && (options.no_colons || options.no_separators)) {
    return macAddressNoSeparators.test(str);
  }

  return macAddress.test(str) || macAddressWithDots.test(str);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isMD5.js":
/*!*********************************************!*\
  !*** ./node_modules/validator/lib/isMD5.js ***!
  \*********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isMD5;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var md5 = /^[a-f0-9]{32}$/;

function isMD5(str) {
  (0, _assertString.default)(str);
  return md5.test(str);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isMagnetURI.js":
/*!***************************************************!*\
  !*** ./node_modules/validator/lib/isMagnetURI.js ***!
  \***************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isMagnetURI;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var magnetURI = /^magnet:\?xt(?:\.1)?=urn:(?:aich|bitprint|btih|ed2k|ed2khash|kzhash|md5|sha1|tree:tiger):[a-z0-9]{32}(?:[a-z0-9]{8})?($|&)/i;

function isMagnetURI(url) {
  (0, _assertString.default)(url);
  return magnetURI.test(url.trim());
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isMimeType.js":
/*!**************************************************!*\
  !*** ./node_modules/validator/lib/isMimeType.js ***!
  \**************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isMimeType;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
  Checks if the provided string matches to a correct Media type format (MIME type)

  This function only checks is the string format follows the
  etablished rules by the according RFC specifications.
  This function supports 'charset' in textual media types
  (https://tools.ietf.org/html/rfc6657).

  This function does not check against all the media types listed
  by the IANA (https://www.iana.org/assignments/media-types/media-types.xhtml)
  because of lightness purposes : it would require to include
  all these MIME types in this librairy, which would weigh it
  significantly. This kind of effort maybe is not worth for the use that
  this function has in this entire librairy.

  More informations in the RFC specifications :
  - https://tools.ietf.org/html/rfc2045
  - https://tools.ietf.org/html/rfc2046
  - https://tools.ietf.org/html/rfc7231#section-3.1.1.1
  - https://tools.ietf.org/html/rfc7231#section-3.1.1.5
*/
// Match simple MIME types
// NB :
//   Subtype length must not exceed 100 characters.
//   This rule does not comply to the RFC specs (what is the max length ?).
var mimeTypeSimple = /^(application|audio|font|image|message|model|multipart|text|video)\/[a-zA-Z0-9\.\-\+]{1,100}$/i; // eslint-disable-line max-len
// Handle "charset" in "text/*"

var mimeTypeText = /^text\/[a-zA-Z0-9\.\-\+]{1,100};\s?charset=("[a-zA-Z0-9\.\-\+\s]{0,70}"|[a-zA-Z0-9\.\-\+]{0,70})(\s?\([a-zA-Z0-9\.\-\+\s]{1,20}\))?$/i; // eslint-disable-line max-len
// Handle "boundary" in "multipart/*"

var mimeTypeMultipart = /^multipart\/[a-zA-Z0-9\.\-\+]{1,100}(;\s?(boundary|charset)=("[a-zA-Z0-9\.\-\+\s]{0,70}"|[a-zA-Z0-9\.\-\+]{0,70})(\s?\([a-zA-Z0-9\.\-\+\s]{1,20}\))?){0,2}$/i; // eslint-disable-line max-len

function isMimeType(str) {
  (0, _assertString.default)(str);
  return mimeTypeSimple.test(str) || mimeTypeText.test(str) || mimeTypeMultipart.test(str);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isMobilePhone.js":
/*!*****************************************************!*\
  !*** ./node_modules/validator/lib/isMobilePhone.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isMobilePhone;
exports.locales = void 0;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable max-len */
var phones = {
  'am-AM': /^(\+?374|0)((10|[9|7][0-9])\d{6}$|[2-4]\d{7}$)/,
  'ar-AE': /^((\+?971)|0)?5[024568]\d{7}$/,
  'ar-BH': /^(\+?973)?(3|6)\d{7}$/,
  'ar-DZ': /^(\+?213|0)(5|6|7)\d{8}$/,
  'ar-LB': /^(\+?961)?((3|81)\d{6}|7\d{7})$/,
  'ar-EG': /^((\+?20)|0)?1[0125]\d{8}$/,
  'ar-IQ': /^(\+?964|0)?7[0-9]\d{8}$/,
  'ar-JO': /^(\+?962|0)?7[789]\d{7}$/,
  'ar-KW': /^(\+?965)[569]\d{7}$/,
  'ar-LY': /^((\+?218)|0)?(9[1-6]\d{7}|[1-8]\d{7,9})$/,
  'ar-MA': /^(?:(?:\+|00)212|0)[5-7]\d{8}$/,
  'ar-OM': /^((\+|00)968)?(9[1-9])\d{6}$/,
  'ar-PS': /^(\+?970|0)5[6|9](\d{7})$/,
  'ar-SA': /^(!?(\+?966)|0)?5\d{8}$/,
  'ar-SY': /^(!?(\+?963)|0)?9\d{8}$/,
  'ar-TN': /^(\+?216)?[2459]\d{7}$/,
  'az-AZ': /^(\+994|0)(5[015]|7[07]|99)\d{7}$/,
  'bs-BA': /^((((\+|00)3876)|06))((([0-3]|[5-6])\d{6})|(4\d{7}))$/,
  'be-BY': /^(\+?375)?(24|25|29|33|44)\d{7}$/,
  'bg-BG': /^(\+?359|0)?8[789]\d{7}$/,
  'bn-BD': /^(\+?880|0)1[13456789][0-9]{8}$/,
  'ca-AD': /^(\+376)?[346]\d{5}$/,
  'cs-CZ': /^(\+?420)? ?[1-9][0-9]{2} ?[0-9]{3} ?[0-9]{3}$/,
  'da-DK': /^(\+?45)?\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/,
  'de-DE': /^((\+49|0)[1|3])([0|5][0-45-9]\d|6([23]|0\d?)|7([0-57-9]|6\d))\d{7,9}$/,
  'de-AT': /^(\+43|0)\d{1,4}\d{3,12}$/,
  'de-CH': /^(\+41|0)([1-9])\d{1,9}$/,
  'de-LU': /^(\+352)?((6\d1)\d{6})$/,
  'dv-MV': /^(\+?960)?(7[2-9]|91|9[3-9])\d{7}$/,
  'el-GR': /^(\+?30|0)?(69\d{8})$/,
  'en-AU': /^(\+?61|0)4\d{8}$/,
  'en-BM': /^(\+?1)?441(((3|7)\d{6}$)|(5[0-3][0-9]\d{4}$)|(59\d{5}))/,
  'en-GB': /^(\+?44|0)7\d{9}$/,
  'en-GG': /^(\+?44|0)1481\d{6}$/,
  'en-GH': /^(\+233|0)(20|50|24|54|27|57|26|56|23|28|55|59)\d{7}$/,
  'en-GY': /^(\+592|0)6\d{6}$/,
  'en-HK': /^(\+?852[-\s]?)?[456789]\d{3}[-\s]?\d{4}$/,
  'en-MO': /^(\+?853[-\s]?)?[6]\d{3}[-\s]?\d{4}$/,
  'en-IE': /^(\+?353|0)8[356789]\d{7}$/,
  'en-IN': /^(\+?91|0)?[6789]\d{9}$/,
  'en-KE': /^(\+?254|0)(7|1)\d{8}$/,
  'en-KI': /^((\+686|686)?)?( )?((6|7)(2|3|8)[0-9]{6})$/,
  'en-MT': /^(\+?356|0)?(99|79|77|21|27|22|25)[0-9]{6}$/,
  'en-MU': /^(\+?230|0)?\d{8}$/,
  'en-NA': /^(\+?264|0)(6|8)\d{7}$/,
  'en-NG': /^(\+?234|0)?[789]\d{9}$/,
  'en-NZ': /^(\+?64|0)[28]\d{7,9}$/,
  'en-PK': /^((00|\+)?92|0)3[0-6]\d{8}$/,
  'en-PH': /^(09|\+639)\d{9}$/,
  'en-RW': /^(\+?250|0)?[7]\d{8}$/,
  'en-SG': /^(\+65)?[3689]\d{7}$/,
  'en-SL': /^(\+?232|0)\d{8}$/,
  'en-TZ': /^(\+?255|0)?[67]\d{8}$/,
  'en-UG': /^(\+?256|0)?[7]\d{8}$/,
  'en-US': /^((\+1|1)?( |-)?)?(\([2-9][0-9]{2}\)|[2-9][0-9]{2})( |-)?([2-9][0-9]{2}( |-)?[0-9]{4})$/,
  'en-ZA': /^(\+?27|0)\d{9}$/,
  'en-ZM': /^(\+?26)?09[567]\d{7}$/,
  'en-ZW': /^(\+263)[0-9]{9}$/,
  'en-BW': /^(\+?267)?(7[1-8]{1})\d{6}$/,
  'es-AR': /^\+?549(11|[2368]\d)\d{8}$/,
  'es-BO': /^(\+?591)?(6|7)\d{7}$/,
  'es-CO': /^(\+?57)?3(0(0|1|2|4|5)|1\d|2[0-4]|5(0|1))\d{7}$/,
  'es-CL': /^(\+?56|0)[2-9]\d{1}\d{7}$/,
  'es-CR': /^(\+506)?[2-8]\d{7}$/,
  'es-CU': /^(\+53|0053)?5\d{7}/,
  'es-DO': /^(\+?1)?8[024]9\d{7}$/,
  'es-HN': /^(\+?504)?[9|8]\d{7}$/,
  'es-EC': /^(\+?593|0)([2-7]|9[2-9])\d{7}$/,
  'es-ES': /^(\+?34)?[6|7]\d{8}$/,
  'es-PE': /^(\+?51)?9\d{8}$/,
  'es-MX': /^(\+?52)?(1|01)?\d{10,11}$/,
  'es-PA': /^(\+?507)\d{7,8}$/,
  'es-PY': /^(\+?595|0)9[9876]\d{7}$/,
  'es-SV': /^(\+?503)?[67]\d{7}$/,
  'es-UY': /^(\+598|0)9[1-9][\d]{6}$/,
  'es-VE': /^(\+?58)?(2|4)\d{9}$/,
  'et-EE': /^(\+?372)?\s?(5|8[1-4])\s?([0-9]\s?){6,7}$/,
  'fa-IR': /^(\+?98[\-\s]?|0)9[0-39]\d[\-\s]?\d{3}[\-\s]?\d{4}$/,
  'fi-FI': /^(\+?358|0)\s?(4(0|1|2|4|5|6)?|50)\s?(\d\s?){4,8}\d$/,
  'fj-FJ': /^(\+?679)?\s?\d{3}\s?\d{4}$/,
  'fo-FO': /^(\+?298)?\s?\d{2}\s?\d{2}\s?\d{2}$/,
  'fr-BF': /^(\+226|0)[67]\d{7}$/,
  'fr-CM': /^(\+?237)6[0-9]{8}$/,
  'fr-FR': /^(\+?33|0)[67]\d{8}$/,
  'fr-GF': /^(\+?594|0|00594)[67]\d{8}$/,
  'fr-GP': /^(\+?590|0|00590)[67]\d{8}$/,
  'fr-MQ': /^(\+?596|0|00596)[67]\d{8}$/,
  'fr-PF': /^(\+?689)?8[789]\d{6}$/,
  'fr-RE': /^(\+?262|0|00262)[67]\d{8}$/,
  'he-IL': /^(\+972|0)([23489]|5[012345689]|77)[1-9]\d{6}$/,
  'hu-HU': /^(\+?36|06)(20|30|31|50|70)\d{7}$/,
  'id-ID': /^(\+?62|0)8(1[123456789]|2[1238]|3[1238]|5[12356789]|7[78]|9[56789]|8[123456789])([\s?|\d]{5,11})$/,
  'it-IT': /^(\+?39)?\s?3\d{2} ?\d{6,7}$/,
  'it-SM': /^((\+378)|(0549)|(\+390549)|(\+3780549))?6\d{5,9}$/,
  'ja-JP': /^(\+81[ \-]?(\(0\))?|0)[6789]0[ \-]?\d{4}[ \-]?\d{4}$/,
  'ka-GE': /^(\+?995)?(5|79)\d{7}$/,
  'kk-KZ': /^(\+?7|8)?7\d{9}$/,
  'kl-GL': /^(\+?299)?\s?\d{2}\s?\d{2}\s?\d{2}$/,
  'ko-KR': /^((\+?82)[ \-]?)?0?1([0|1|6|7|8|9]{1})[ \-]?\d{3,4}[ \-]?\d{4}$/,
  'lt-LT': /^(\+370|8)\d{8}$/,
  'lv-LV': /^(\+?371)2\d{7}$/,
  'ms-MY': /^(\+?6?01){1}(([0145]{1}(\-|\s)?\d{7,8})|([236789]{1}(\s|\-)?\d{7}))$/,
  'mz-MZ': /^(\+?258)?8[234567]\d{7}$/,
  'nb-NO': /^(\+?47)?[49]\d{7}$/,
  'ne-NP': /^(\+?977)?9[78]\d{8}$/,
  'nl-BE': /^(\+?32|0)4\d{8}$/,
  'nl-NL': /^(((\+|00)?31\(0\))|((\+|00)?31)|0)6{1}\d{8}$/,
  'nn-NO': /^(\+?47)?[49]\d{7}$/,
  'pl-PL': /^(\+?48)? ?[5-8]\d ?\d{3} ?\d{2} ?\d{2}$/,
  'pt-BR': /^((\+?55\ ?[1-9]{2}\ ?)|(\+?55\ ?\([1-9]{2}\)\ ?)|(0[1-9]{2}\ ?)|(\([1-9]{2}\)\ ?)|([1-9]{2}\ ?))((\d{4}\-?\d{4})|(9[2-9]{1}\d{3}\-?\d{4}))$/,
  'pt-PT': /^(\+?351)?9[1236]\d{7}$/,
  'pt-AO': /^(\+244)\d{9}$/,
  'ro-RO': /^(\+?4?0)\s?7\d{2}(\/|\s|\.|\-)?\d{3}(\s|\.|\-)?\d{3}$/,
  'ru-RU': /^(\+?7|8)?9\d{9}$/,
  'si-LK': /^(?:0|94|\+94)?(7(0|1|2|4|5|6|7|8)( |-)?)\d{7}$/,
  'sl-SI': /^(\+386\s?|0)(\d{1}\s?\d{3}\s?\d{2}\s?\d{2}|\d{2}\s?\d{3}\s?\d{3})$/,
  'sk-SK': /^(\+?421)? ?[1-9][0-9]{2} ?[0-9]{3} ?[0-9]{3}$/,
  'sq-AL': /^(\+355|0)6[789]\d{6}$/,
  'sr-RS': /^(\+3816|06)[- \d]{5,9}$/,
  'sv-SE': /^(\+?46|0)[\s\-]?7[\s\-]?[02369]([\s\-]?\d){7}$/,
  'tg-TJ': /^(\+?992)?[5][5]\d{7}$/,
  'th-TH': /^(\+66|66|0)\d{9}$/,
  'tr-TR': /^(\+?90|0)?5\d{9}$/,
  'tk-TM': /^(\+993|993|8)\d{8}$/,
  'uk-UA': /^(\+?38|8)?0\d{9}$/,
  'uz-UZ': /^(\+?998)?(6[125-79]|7[1-69]|88|9\d)\d{7}$/,
  'vi-VN': /^((\+?84)|0)((3([2-9]))|(5([25689]))|(7([0|6-9]))|(8([1-9]))|(9([0-9])))([0-9]{7})$/,
  'zh-CN': /^((\+|00)86)?(1[3-9]|9[28])\d{9}$/,
  'zh-TW': /^(\+?886\-?|0)?9\d{8}$/,
  'dz-BT': /^(\+?975|0)?(17|16|77|02)\d{6}$/
};
/* eslint-enable max-len */
// aliases

phones['en-CA'] = phones['en-US'];
phones['fr-CA'] = phones['en-CA'];
phones['fr-BE'] = phones['nl-BE'];
phones['zh-HK'] = phones['en-HK'];
phones['zh-MO'] = phones['en-MO'];
phones['ga-IE'] = phones['en-IE'];
phones['fr-CH'] = phones['de-CH'];
phones['it-CH'] = phones['fr-CH'];

function isMobilePhone(str, locale, options) {
  (0, _assertString.default)(str);

  if (options && options.strictMode && !str.startsWith('+')) {
    return false;
  }

  if (Array.isArray(locale)) {
    return locale.some(function (key) {
      // https://github.com/gotwarlost/istanbul/blob/master/ignoring-code-for-coverage.md#ignoring-code-for-coverage-purposes
      // istanbul ignore else
      if (phones.hasOwnProperty(key)) {
        var phone = phones[key];

        if (phone.test(str)) {
          return true;
        }
      }

      return false;
    });
  } else if (locale in phones) {
    return phones[locale].test(str); // alias falsey locale as 'any'
  } else if (!locale || locale === 'any') {
    for (var key in phones) {
      // istanbul ignore else
      if (phones.hasOwnProperty(key)) {
        var phone = phones[key];

        if (phone.test(str)) {
          return true;
        }
      }
    }

    return false;
  }

  throw new Error("Invalid locale '".concat(locale, "'"));
}

var locales = Object.keys(phones);
exports.locales = locales;

/***/ }),

/***/ "./node_modules/validator/lib/isMongoId.js":
/*!*************************************************!*\
  !*** ./node_modules/validator/lib/isMongoId.js ***!
  \*************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isMongoId;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

var _isHexadecimal = _interopRequireDefault(__webpack_require__(/*! ./isHexadecimal */ "./node_modules/validator/lib/isHexadecimal.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isMongoId(str) {
  (0, _assertString.default)(str);
  return (0, _isHexadecimal.default)(str) && str.length === 24;
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isMultibyte.js":
/*!***************************************************!*\
  !*** ./node_modules/validator/lib/isMultibyte.js ***!
  \***************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isMultibyte;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-control-regex */
var multibyte = /[^\x00-\x7F]/;
/* eslint-enable no-control-regex */

function isMultibyte(str) {
  (0, _assertString.default)(str);
  return multibyte.test(str);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isNumeric.js":
/*!*************************************************!*\
  !*** ./node_modules/validator/lib/isNumeric.js ***!
  \*************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isNumeric;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

var _alpha = __webpack_require__(/*! ./alpha */ "./node_modules/validator/lib/alpha.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var numericNoSymbols = /^[0-9]+$/;

function isNumeric(str, options) {
  (0, _assertString.default)(str);

  if (options && options.no_symbols) {
    return numericNoSymbols.test(str);
  }

  return new RegExp("^[+-]?([0-9]*[".concat((options || {}).locale ? _alpha.decimal[options.locale] : '.', "])?[0-9]+$")).test(str);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isOctal.js":
/*!***********************************************!*\
  !*** ./node_modules/validator/lib/isOctal.js ***!
  \***********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isOctal;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var octal = /^(0o)?[0-7]+$/i;

function isOctal(str) {
  (0, _assertString.default)(str);
  return octal.test(str);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isPassportNumber.js":
/*!********************************************************!*\
  !*** ./node_modules/validator/lib/isPassportNumber.js ***!
  \********************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isPassportNumber;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Reference:
 * https://en.wikipedia.org/ -- Wikipedia
 * https://docs.microsoft.com/en-us/microsoft-365/compliance/eu-passport-number -- EU Passport Number
 * https://countrycode.org/ -- Country Codes
 */
var passportRegexByCountryCode = {
  AM: /^[A-Z]{2}\d{7}$/,
  // ARMENIA
  AR: /^[A-Z]{3}\d{6}$/,
  // ARGENTINA
  AT: /^[A-Z]\d{7}$/,
  // AUSTRIA
  AU: /^[A-Z]\d{7}$/,
  // AUSTRALIA
  BE: /^[A-Z]{2}\d{6}$/,
  // BELGIUM
  BG: /^\d{9}$/,
  // BULGARIA
  BR: /^[A-Z]{2}\d{6}$/,
  // BRAZIL
  BY: /^[A-Z]{2}\d{7}$/,
  // BELARUS
  CA: /^[A-Z]{2}\d{6}$/,
  // CANADA
  CH: /^[A-Z]\d{7}$/,
  // SWITZERLAND
  CN: /^G\d{8}$|^E(?![IO])[A-Z0-9]\d{7}$/,
  // CHINA [G=Ordinary, E=Electronic] followed by 8-digits, or E followed by any UPPERCASE letter (except I and O) followed by 7 digits
  CY: /^[A-Z](\d{6}|\d{8})$/,
  // CYPRUS
  CZ: /^\d{8}$/,
  // CZECH REPUBLIC
  DE: /^[CFGHJKLMNPRTVWXYZ0-9]{9}$/,
  // GERMANY
  DK: /^\d{9}$/,
  // DENMARK
  DZ: /^\d{9}$/,
  // ALGERIA
  EE: /^([A-Z]\d{7}|[A-Z]{2}\d{7})$/,
  // ESTONIA (K followed by 7-digits), e-passports have 2 UPPERCASE followed by 7 digits
  ES: /^[A-Z0-9]{2}([A-Z0-9]?)\d{6}$/,
  // SPAIN
  FI: /^[A-Z]{2}\d{7}$/,
  // FINLAND
  FR: /^\d{2}[A-Z]{2}\d{5}$/,
  // FRANCE
  GB: /^\d{9}$/,
  // UNITED KINGDOM
  GR: /^[A-Z]{2}\d{7}$/,
  // GREECE
  HR: /^\d{9}$/,
  // CROATIA
  HU: /^[A-Z]{2}(\d{6}|\d{7})$/,
  // HUNGARY
  IE: /^[A-Z0-9]{2}\d{7}$/,
  // IRELAND
  IN: /^[A-Z]{1}-?\d{7}$/,
  // INDIA
  ID: /^[A-C]\d{7}$/,
  // INDONESIA
  IR: /^[A-Z]\d{8}$/,
  // IRAN
  IS: /^(A)\d{7}$/,
  // ICELAND
  IT: /^[A-Z0-9]{2}\d{7}$/,
  // ITALY
  JP: /^[A-Z]{2}\d{7}$/,
  // JAPAN
  KR: /^[MS]\d{8}$/,
  // SOUTH KOREA, REPUBLIC OF KOREA, [S=PS Passports, M=PM Passports]
  LT: /^[A-Z0-9]{8}$/,
  // LITHUANIA
  LU: /^[A-Z0-9]{8}$/,
  // LUXEMBURG
  LV: /^[A-Z0-9]{2}\d{7}$/,
  // LATVIA
  LY: /^[A-Z0-9]{8}$/,
  // LIBYA
  MT: /^\d{7}$/,
  // MALTA
  MZ: /^([A-Z]{2}\d{7})|(\d{2}[A-Z]{2}\d{5})$/,
  // MOZAMBIQUE
  MY: /^[AHK]\d{8}$/,
  // MALAYSIA
  NL: /^[A-Z]{2}[A-Z0-9]{6}\d$/,
  // NETHERLANDS
  PL: /^[A-Z]{2}\d{7}$/,
  // POLAND
  PT: /^[A-Z]\d{6}$/,
  // PORTUGAL
  RO: /^\d{8,9}$/,
  // ROMANIA
  RU: /^\d{9}$/,
  // RUSSIAN FEDERATION
  SE: /^\d{8}$/,
  // SWEDEN
  SL: /^(P)[A-Z]\d{7}$/,
  // SLOVANIA
  SK: /^[0-9A-Z]\d{7}$/,
  // SLOVAKIA
  TR: /^[A-Z]\d{8}$/,
  // TURKEY
  UA: /^[A-Z]{2}\d{6}$/,
  // UKRAINE
  US: /^\d{9}$/ // UNITED STATES

};
/**
 * Check if str is a valid passport number
 * relative to provided ISO Country Code.
 *
 * @param {string} str
 * @param {string} countryCode
 * @return {boolean}
 */

function isPassportNumber(str, countryCode) {
  (0, _assertString.default)(str);
  /** Remove All Whitespaces, Convert to UPPERCASE */

  var normalizedStr = str.replace(/\s/g, '').toUpperCase();
  return countryCode.toUpperCase() in passportRegexByCountryCode && passportRegexByCountryCode[countryCode].test(normalizedStr);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isPort.js":
/*!**********************************************!*\
  !*** ./node_modules/validator/lib/isPort.js ***!
  \**********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isPort;

var _isInt = _interopRequireDefault(__webpack_require__(/*! ./isInt */ "./node_modules/validator/lib/isInt.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isPort(str) {
  return (0, _isInt.default)(str, {
    min: 0,
    max: 65535
  });
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isPostalCode.js":
/*!****************************************************!*\
  !*** ./node_modules/validator/lib/isPostalCode.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isPostalCode;
exports.locales = void 0;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// common patterns
var threeDigit = /^\d{3}$/;
var fourDigit = /^\d{4}$/;
var fiveDigit = /^\d{5}$/;
var sixDigit = /^\d{6}$/;
var patterns = {
  AD: /^AD\d{3}$/,
  AT: fourDigit,
  AU: fourDigit,
  AZ: /^AZ\d{4}$/,
  BE: fourDigit,
  BG: fourDigit,
  BR: /^\d{5}-\d{3}$/,
  BY: /2[1-4]{1}\d{4}$/,
  CA: /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][\s\-]?\d[ABCEGHJ-NPRSTV-Z]\d$/i,
  CH: fourDigit,
  CN: /^(0[1-7]|1[012356]|2[0-7]|3[0-6]|4[0-7]|5[1-7]|6[1-7]|7[1-5]|8[1345]|9[09])\d{4}$/,
  CZ: /^\d{3}\s?\d{2}$/,
  DE: fiveDigit,
  DK: fourDigit,
  DO: fiveDigit,
  DZ: fiveDigit,
  EE: fiveDigit,
  ES: /^(5[0-2]{1}|[0-4]{1}\d{1})\d{3}$/,
  FI: fiveDigit,
  FR: /^\d{2}\s?\d{3}$/,
  GB: /^(gir\s?0aa|[a-z]{1,2}\d[\da-z]?\s?(\d[a-z]{2})?)$/i,
  GR: /^\d{3}\s?\d{2}$/,
  HR: /^([1-5]\d{4}$)/,
  HT: /^HT\d{4}$/,
  HU: fourDigit,
  ID: fiveDigit,
  IE: /^(?!.*(?:o))[A-Za-z]\d[\dw]\s\w{4}$/i,
  IL: /^(\d{5}|\d{7})$/,
  IN: /^((?!10|29|35|54|55|65|66|86|87|88|89)[1-9][0-9]{5})$/,
  IR: /\b(?!(\d)\1{3})[13-9]{4}[1346-9][013-9]{5}\b/,
  IS: threeDigit,
  IT: fiveDigit,
  JP: /^\d{3}\-\d{4}$/,
  KE: fiveDigit,
  KR: /^(\d{5}|\d{6})$/,
  LI: /^(948[5-9]|949[0-7])$/,
  LT: /^LT\-\d{5}$/,
  LU: fourDigit,
  LV: /^LV\-\d{4}$/,
  LK: fiveDigit,
  MX: fiveDigit,
  MT: /^[A-Za-z]{3}\s{0,1}\d{4}$/,
  MY: fiveDigit,
  NL: /^\d{4}\s?[a-z]{2}$/i,
  NO: fourDigit,
  NP: /^(10|21|22|32|33|34|44|45|56|57)\d{3}$|^(977)$/i,
  NZ: fourDigit,
  PL: /^\d{2}\-\d{3}$/,
  PR: /^00[679]\d{2}([ -]\d{4})?$/,
  PT: /^\d{4}\-\d{3}?$/,
  RO: sixDigit,
  RU: sixDigit,
  SA: fiveDigit,
  SE: /^[1-9]\d{2}\s?\d{2}$/,
  SG: sixDigit,
  SI: fourDigit,
  SK: /^\d{3}\s?\d{2}$/,
  TH: fiveDigit,
  TN: fourDigit,
  TW: /^\d{3}(\d{2})?$/,
  UA: fiveDigit,
  US: /^\d{5}(-\d{4})?$/,
  ZA: fourDigit,
  ZM: fiveDigit
};
var locales = Object.keys(patterns);
exports.locales = locales;

function isPostalCode(str, locale) {
  (0, _assertString.default)(str);

  if (locale in patterns) {
    return patterns[locale].test(str);
  } else if (locale === 'any') {
    for (var key in patterns) {
      // https://github.com/gotwarlost/istanbul/blob/master/ignoring-code-for-coverage.md#ignoring-code-for-coverage-purposes
      // istanbul ignore else
      if (patterns.hasOwnProperty(key)) {
        var pattern = patterns[key];

        if (pattern.test(str)) {
          return true;
        }
      }
    }

    return false;
  }

  throw new Error("Invalid locale '".concat(locale, "'"));
}

/***/ }),

/***/ "./node_modules/validator/lib/isRFC3339.js":
/*!*************************************************!*\
  !*** ./node_modules/validator/lib/isRFC3339.js ***!
  \*************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isRFC3339;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* Based on https://tools.ietf.org/html/rfc3339#section-5.6 */
var dateFullYear = /[0-9]{4}/;
var dateMonth = /(0[1-9]|1[0-2])/;
var dateMDay = /([12]\d|0[1-9]|3[01])/;
var timeHour = /([01][0-9]|2[0-3])/;
var timeMinute = /[0-5][0-9]/;
var timeSecond = /([0-5][0-9]|60)/;
var timeSecFrac = /(\.[0-9]+)?/;
var timeNumOffset = new RegExp("[-+]".concat(timeHour.source, ":").concat(timeMinute.source));
var timeOffset = new RegExp("([zZ]|".concat(timeNumOffset.source, ")"));
var partialTime = new RegExp("".concat(timeHour.source, ":").concat(timeMinute.source, ":").concat(timeSecond.source).concat(timeSecFrac.source));
var fullDate = new RegExp("".concat(dateFullYear.source, "-").concat(dateMonth.source, "-").concat(dateMDay.source));
var fullTime = new RegExp("".concat(partialTime.source).concat(timeOffset.source));
var rfc3339 = new RegExp("^".concat(fullDate.source, "[ tT]").concat(fullTime.source, "$"));

function isRFC3339(str) {
  (0, _assertString.default)(str);
  return rfc3339.test(str);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isRgbColor.js":
/*!**************************************************!*\
  !*** ./node_modules/validator/lib/isRgbColor.js ***!
  \**************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isRgbColor;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var rgbColor = /^rgb\((([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]),){2}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\)$/;
var rgbaColor = /^rgba\((([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]),){3}(0?\.\d|1(\.0)?|0(\.0)?)\)$/;
var rgbColorPercent = /^rgb\((([0-9]%|[1-9][0-9]%|100%),){2}([0-9]%|[1-9][0-9]%|100%)\)/;
var rgbaColorPercent = /^rgba\((([0-9]%|[1-9][0-9]%|100%),){3}(0?\.\d|1(\.0)?|0(\.0)?)\)/;

function isRgbColor(str) {
  var includePercentValues = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  (0, _assertString.default)(str);

  if (!includePercentValues) {
    return rgbColor.test(str) || rgbaColor.test(str);
  }

  return rgbColor.test(str) || rgbaColor.test(str) || rgbColorPercent.test(str) || rgbaColorPercent.test(str);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isSemVer.js":
/*!************************************************!*\
  !*** ./node_modules/validator/lib/isSemVer.js ***!
  \************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isSemVer;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

var _multilineRegex = _interopRequireDefault(__webpack_require__(/*! ./util/multilineRegex */ "./node_modules/validator/lib/util/multilineRegex.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Regular Expression to match
 * semantic versioning (SemVer)
 * built from multi-line, multi-parts regexp
 * Reference: https://semver.org/
 */
var semanticVersioningRegex = (0, _multilineRegex.default)(['^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)', '(?:-((?:0|[1-9]\\d*|\\d*[a-z-][0-9a-z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-z-][0-9a-z-]*))*))', '?(?:\\+([0-9a-z-]+(?:\\.[0-9a-z-]+)*))?$'], 'i');

function isSemVer(str) {
  (0, _assertString.default)(str);
  return semanticVersioningRegex.test(str);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isSlug.js":
/*!**********************************************!*\
  !*** ./node_modules/validator/lib/isSlug.js ***!
  \**********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isSlug;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var charsetRegex = /^[^\s-_](?!.*?[-_]{2,})[a-z0-9-\\][^\s]*[^-_\s]$/;

function isSlug(str) {
  (0, _assertString.default)(str);
  return charsetRegex.test(str);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isStrongPassword.js":
/*!********************************************************!*\
  !*** ./node_modules/validator/lib/isStrongPassword.js ***!
  \********************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isStrongPassword;

var _merge = _interopRequireDefault(__webpack_require__(/*! ./util/merge */ "./node_modules/validator/lib/util/merge.js"));

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var upperCaseRegex = /^[A-Z]$/;
var lowerCaseRegex = /^[a-z]$/;
var numberRegex = /^[0-9]$/;
var symbolRegex = /^[-#!$@%^&*()_+|~=`{}\[\]:";'<>?,.\/ ]$/;
var defaultOptions = {
  minLength: 8,
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 1,
  returnScore: false,
  pointsPerUnique: 1,
  pointsPerRepeat: 0.5,
  pointsForContainingLower: 10,
  pointsForContainingUpper: 10,
  pointsForContainingNumber: 10,
  pointsForContainingSymbol: 10
};
/* Counts number of occurrences of each char in a string
 * could be moved to util/ ?
*/

function countChars(str) {
  var result = {};
  Array.from(str).forEach(function (char) {
    var curVal = result[char];

    if (curVal) {
      result[char] += 1;
    } else {
      result[char] = 1;
    }
  });
  return result;
}
/* Return information about a password */


function analyzePassword(password) {
  var charMap = countChars(password);
  var analysis = {
    length: password.length,
    uniqueChars: Object.keys(charMap).length,
    uppercaseCount: 0,
    lowercaseCount: 0,
    numberCount: 0,
    symbolCount: 0
  };
  Object.keys(charMap).forEach(function (char) {
    /* istanbul ignore else */
    if (upperCaseRegex.test(char)) {
      analysis.uppercaseCount += charMap[char];
    } else if (lowerCaseRegex.test(char)) {
      analysis.lowercaseCount += charMap[char];
    } else if (numberRegex.test(char)) {
      analysis.numberCount += charMap[char];
    } else if (symbolRegex.test(char)) {
      analysis.symbolCount += charMap[char];
    }
  });
  return analysis;
}

function scorePassword(analysis, scoringOptions) {
  var points = 0;
  points += analysis.uniqueChars * scoringOptions.pointsPerUnique;
  points += (analysis.length - analysis.uniqueChars) * scoringOptions.pointsPerRepeat;

  if (analysis.lowercaseCount > 0) {
    points += scoringOptions.pointsForContainingLower;
  }

  if (analysis.uppercaseCount > 0) {
    points += scoringOptions.pointsForContainingUpper;
  }

  if (analysis.numberCount > 0) {
    points += scoringOptions.pointsForContainingNumber;
  }

  if (analysis.symbolCount > 0) {
    points += scoringOptions.pointsForContainingSymbol;
  }

  return points;
}

function isStrongPassword(str) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  (0, _assertString.default)(str);
  var analysis = analyzePassword(str);
  options = (0, _merge.default)(options || {}, defaultOptions);

  if (options.returnScore) {
    return scorePassword(analysis, options);
  }

  return analysis.length >= options.minLength && analysis.lowercaseCount >= options.minLowercase && analysis.uppercaseCount >= options.minUppercase && analysis.numberCount >= options.minNumbers && analysis.symbolCount >= options.minSymbols;
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isSurrogatePair.js":
/*!*******************************************************!*\
  !*** ./node_modules/validator/lib/isSurrogatePair.js ***!
  \*******************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isSurrogatePair;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var surrogatePair = /[\uD800-\uDBFF][\uDC00-\uDFFF]/;

function isSurrogatePair(str) {
  (0, _assertString.default)(str);
  return surrogatePair.test(str);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isTaxID.js":
/*!***********************************************!*\
  !*** ./node_modules/validator/lib/isTaxID.js ***!
  \***********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isTaxID;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

var algorithms = _interopRequireWildcard(__webpack_require__(/*! ./util/algorithms */ "./node_modules/validator/lib/util/algorithms.js"));

var _isDate = _interopRequireDefault(__webpack_require__(/*! ./isDate */ "./node_modules/validator/lib/isDate.js"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/**
 * TIN Validation
 * Validates Tax Identification Numbers (TINs) from the US, EU member states and the United Kingdom.
 *
 * EU-UK:
 * National TIN validity is calculated using public algorithms as made available by DG TAXUD.
 *
 * See `https://ec.europa.eu/taxation_customs/tin/specs/FS-TIN%20Algorithms-Public.docx` for more information.
 *
 * US:
 * An Employer Identification Number (EIN), also known as a Federal Tax Identification Number,
 *  is used to identify a business entity.
 *
 * NOTES:
 *  - Prefix 47 is being reserved for future use
 *  - Prefixes 26, 27, 45, 46 and 47 were previously assigned by the Philadelphia campus.
 *
 * See `http://www.irs.gov/Businesses/Small-Businesses-&-Self-Employed/How-EINs-are-Assigned-and-Valid-EIN-Prefixes`
 * for more information.
 */
// Locale functions

/*
 * bg-BG validation function
 * (Edinen graždanski nomer (EGN/ЕГН), persons only)
 * Checks if birth date (first six digits) is valid and calculates check (last) digit
 */
function bgBgCheck(tin) {
  // Extract full year, normalize month and check birth date validity
  var century_year = tin.slice(0, 2);
  var month = parseInt(tin.slice(2, 4), 10);

  if (month > 40) {
    month -= 40;
    century_year = "20".concat(century_year);
  } else if (month > 20) {
    month -= 20;
    century_year = "18".concat(century_year);
  } else {
    century_year = "19".concat(century_year);
  }

  if (month < 10) {
    month = "0".concat(month);
  }

  var date = "".concat(century_year, "/").concat(month, "/").concat(tin.slice(4, 6));

  if (!(0, _isDate.default)(date, 'YYYY/MM/DD')) {
    return false;
  } // split digits into an array for further processing


  var digits = tin.split('').map(function (a) {
    return parseInt(a, 10);
  }); // Calculate checksum by multiplying digits with fixed values

  var multip_lookup = [2, 4, 8, 5, 10, 9, 7, 3, 6];
  var checksum = 0;

  for (var i = 0; i < multip_lookup.length; i++) {
    checksum += digits[i] * multip_lookup[i];
  }

  checksum = checksum % 11 === 10 ? 0 : checksum % 11;
  return checksum === digits[9];
}
/*
 * cs-CZ validation function
 * (Rodné číslo (RČ), persons only)
 * Checks if birth date (first six digits) is valid and divisibility by 11
 * Material not in DG TAXUD document sourced from:
 * -`https://lorenc.info/3MA381/overeni-spravnosti-rodneho-cisla.htm`
 * -`https://www.mvcr.cz/clanek/rady-a-sluzby-dokumenty-rodne-cislo.aspx`
 */


function csCzCheck(tin) {
  tin = tin.replace(/\W/, ''); // Extract full year from TIN length

  var full_year = parseInt(tin.slice(0, 2), 10);

  if (tin.length === 10) {
    if (full_year < 54) {
      full_year = "20".concat(full_year);
    } else {
      full_year = "19".concat(full_year);
    }
  } else {
    if (tin.slice(6) === '000') {
      return false;
    } // Three-zero serial not assigned before 1954


    if (full_year < 54) {
      full_year = "19".concat(full_year);
    } else {
      return false; // No 18XX years seen in any of the resources
    }
  } // Add missing zero if needed


  if (full_year.length === 3) {
    full_year = [full_year.slice(0, 2), '0', full_year.slice(2)].join('');
  } // Extract month from TIN and normalize


  var month = parseInt(tin.slice(2, 4), 10);

  if (month > 50) {
    month -= 50;
  }

  if (month > 20) {
    // Month-plus-twenty was only introduced in 2004
    if (parseInt(full_year, 10) < 2004) {
      return false;
    }

    month -= 20;
  }

  if (month < 10) {
    month = "0".concat(month);
  } // Check date validity


  var date = "".concat(full_year, "/").concat(month, "/").concat(tin.slice(4, 6));

  if (!(0, _isDate.default)(date, 'YYYY/MM/DD')) {
    return false;
  } // Verify divisibility by 11


  if (tin.length === 10) {
    if (parseInt(tin, 10) % 11 !== 0) {
      // Some numbers up to and including 1985 are still valid if
      // check (last) digit equals 0 and modulo of first 9 digits equals 10
      var checkdigit = parseInt(tin.slice(0, 9), 10) % 11;

      if (parseInt(full_year, 10) < 1986 && checkdigit === 10) {
        if (parseInt(tin.slice(9), 10) !== 0) {
          return false;
        }
      } else {
        return false;
      }
    }
  }

  return true;
}
/*
 * de-AT validation function
 * (Abgabenkontonummer, persons/entities)
 * Verify TIN validity by calling luhnCheck()
 */


function deAtCheck(tin) {
  return algorithms.luhnCheck(tin);
}
/*
 * de-DE validation function
 * (Steueridentifikationsnummer (Steuer-IdNr.), persons only)
 * Tests for single duplicate/triplicate value, then calculates ISO 7064 check (last) digit
 * Partial implementation of spec (same result with both algorithms always)
 */


function deDeCheck(tin) {
  // Split digits into an array for further processing
  var digits = tin.split('').map(function (a) {
    return parseInt(a, 10);
  }); // Fill array with strings of number positions

  var occurences = [];

  for (var i = 0; i < digits.length - 1; i++) {
    occurences.push('');

    for (var j = 0; j < digits.length - 1; j++) {
      if (digits[i] === digits[j]) {
        occurences[i] += j;
      }
    }
  } // Remove digits with one occurence and test for only one duplicate/triplicate


  occurences = occurences.filter(function (a) {
    return a.length > 1;
  });

  if (occurences.length !== 2 && occurences.length !== 3) {
    return false;
  } // In case of triplicate value only two digits are allowed next to each other


  if (occurences[0].length === 3) {
    var trip_locations = occurences[0].split('').map(function (a) {
      return parseInt(a, 10);
    });
    var recurrent = 0; // Amount of neighbour occurences

    for (var _i = 0; _i < trip_locations.length - 1; _i++) {
      if (trip_locations[_i] + 1 === trip_locations[_i + 1]) {
        recurrent += 1;
      }
    }

    if (recurrent === 2) {
      return false;
    }
  }

  return algorithms.iso7064Check(tin);
}
/*
 * dk-DK validation function
 * (CPR-nummer (personnummer), persons only)
 * Checks if birth date (first six digits) is valid and assigned to century (seventh) digit,
 * and calculates check (last) digit
 */


function dkDkCheck(tin) {
  tin = tin.replace(/\W/, ''); // Extract year, check if valid for given century digit and add century

  var year = parseInt(tin.slice(4, 6), 10);
  var century_digit = tin.slice(6, 7);

  switch (century_digit) {
    case '0':
    case '1':
    case '2':
    case '3':
      year = "19".concat(year);
      break;

    case '4':
    case '9':
      if (year < 37) {
        year = "20".concat(year);
      } else {
        year = "19".concat(year);
      }

      break;

    default:
      if (year < 37) {
        year = "20".concat(year);
      } else if (year > 58) {
        year = "18".concat(year);
      } else {
        return false;
      }

      break;
  } // Add missing zero if needed


  if (year.length === 3) {
    year = [year.slice(0, 2), '0', year.slice(2)].join('');
  } // Check date validity


  var date = "".concat(year, "/").concat(tin.slice(2, 4), "/").concat(tin.slice(0, 2));

  if (!(0, _isDate.default)(date, 'YYYY/MM/DD')) {
    return false;
  } // Split digits into an array for further processing


  var digits = tin.split('').map(function (a) {
    return parseInt(a, 10);
  });
  var checksum = 0;
  var weight = 4; // Multiply by weight and add to checksum

  for (var i = 0; i < 9; i++) {
    checksum += digits[i] * weight;
    weight -= 1;

    if (weight === 1) {
      weight = 7;
    }
  }

  checksum %= 11;

  if (checksum === 1) {
    return false;
  }

  return checksum === 0 ? digits[9] === 0 : digits[9] === 11 - checksum;
}
/*
 * el-CY validation function
 * (Arithmos Forologikou Mitroou (AFM/ΑΦΜ), persons only)
 * Verify TIN validity by calculating ASCII value of check (last) character
 */


function elCyCheck(tin) {
  // split digits into an array for further processing
  var digits = tin.slice(0, 8).split('').map(function (a) {
    return parseInt(a, 10);
  });
  var checksum = 0; // add digits in even places

  for (var i = 1; i < digits.length; i += 2) {
    checksum += digits[i];
  } // add digits in odd places


  for (var _i2 = 0; _i2 < digits.length; _i2 += 2) {
    if (digits[_i2] < 2) {
      checksum += 1 - digits[_i2];
    } else {
      checksum += 2 * (digits[_i2] - 2) + 5;

      if (digits[_i2] > 4) {
        checksum += 2;
      }
    }
  }

  return String.fromCharCode(checksum % 26 + 65) === tin.charAt(8);
}
/*
 * el-GR validation function
 * (Arithmos Forologikou Mitroou (AFM/ΑΦΜ), persons/entities)
 * Verify TIN validity by calculating check (last) digit
 * Algorithm not in DG TAXUD document- sourced from:
 * - `http://epixeirisi.gr/%CE%9A%CE%A1%CE%99%CE%A3%CE%99%CE%9C%CE%91-%CE%98%CE%95%CE%9C%CE%91%CE%A4%CE%91-%CE%A6%CE%9F%CE%A1%CE%9F%CE%9B%CE%9F%CE%93%CE%99%CE%91%CE%A3-%CE%9A%CE%91%CE%99-%CE%9B%CE%9F%CE%93%CE%99%CE%A3%CE%A4%CE%99%CE%9A%CE%97%CE%A3/23791/%CE%91%CF%81%CE%B9%CE%B8%CE%BC%CF%8C%CF%82-%CE%A6%CE%BF%CF%81%CE%BF%CE%BB%CE%BF%CE%B3%CE%B9%CE%BA%CE%BF%CF%8D-%CE%9C%CE%B7%CF%84%CF%81%CF%8E%CE%BF%CF%85`
 */


function elGrCheck(tin) {
  // split digits into an array for further processing
  var digits = tin.split('').map(function (a) {
    return parseInt(a, 10);
  });
  var checksum = 0;

  for (var i = 0; i < 8; i++) {
    checksum += digits[i] * Math.pow(2, 8 - i);
  }

  return checksum % 11 % 10 === digits[8];
}
/*
 * en-GB validation function (should go here if needed)
 * (National Insurance Number (NINO) or Unique Taxpayer Reference (UTR),
 * persons/entities respectively)
 */

/*
 * en-IE validation function
 * (Personal Public Service Number (PPS No), persons only)
 * Verify TIN validity by calculating check (second to last) character
 */


function enIeCheck(tin) {
  var checksum = algorithms.reverseMultiplyAndSum(tin.split('').slice(0, 7).map(function (a) {
    return parseInt(a, 10);
  }), 8);

  if (tin.length === 9 && tin[8] !== 'W') {
    checksum += (tin[8].charCodeAt(0) - 64) * 9;
  }

  checksum %= 23;

  if (checksum === 0) {
    return tin[7].toUpperCase() === 'W';
  }

  return tin[7].toUpperCase() === String.fromCharCode(64 + checksum);
} // Valid US IRS campus prefixes


var enUsCampusPrefix = {
  andover: ['10', '12'],
  atlanta: ['60', '67'],
  austin: ['50', '53'],
  brookhaven: ['01', '02', '03', '04', '05', '06', '11', '13', '14', '16', '21', '22', '23', '25', '34', '51', '52', '54', '55', '56', '57', '58', '59', '65'],
  cincinnati: ['30', '32', '35', '36', '37', '38', '61'],
  fresno: ['15', '24'],
  internet: ['20', '26', '27', '45', '46', '47'],
  kansas: ['40', '44'],
  memphis: ['94', '95'],
  ogden: ['80', '90'],
  philadelphia: ['33', '39', '41', '42', '43', '46', '48', '62', '63', '64', '66', '68', '71', '72', '73', '74', '75', '76', '77', '81', '82', '83', '84', '85', '86', '87', '88', '91', '92', '93', '98', '99'],
  sba: ['31']
}; // Return an array of all US IRS campus prefixes

function enUsGetPrefixes() {
  var prefixes = [];

  for (var location in enUsCampusPrefix) {
    // https://github.com/gotwarlost/istanbul/blob/master/ignoring-code-for-coverage.md#ignoring-code-for-coverage-purposes
    // istanbul ignore else
    if (enUsCampusPrefix.hasOwnProperty(location)) {
      prefixes.push.apply(prefixes, _toConsumableArray(enUsCampusPrefix[location]));
    }
  }

  return prefixes;
}
/*
 * en-US validation function
 * Verify that the TIN starts with a valid IRS campus prefix
 */


function enUsCheck(tin) {
  return enUsGetPrefixes().indexOf(tin.substr(0, 2)) !== -1;
}
/*
 * es-ES validation function
 * (Documento Nacional de Identidad (DNI)
 * or Número de Identificación de Extranjero (NIE), persons only)
 * Verify TIN validity by calculating check (last) character
 */


function esEsCheck(tin) {
  // Split characters into an array for further processing
  var chars = tin.toUpperCase().split(''); // Replace initial letter if needed

  if (isNaN(parseInt(chars[0], 10)) && chars.length > 1) {
    var lead_replace = 0;

    switch (chars[0]) {
      case 'Y':
        lead_replace = 1;
        break;

      case 'Z':
        lead_replace = 2;
        break;

      default:
    }

    chars.splice(0, 1, lead_replace); // Fill with zeros if smaller than proper
  } else {
    while (chars.length < 9) {
      chars.unshift(0);
    }
  } // Calculate checksum and check according to lookup


  var lookup = ['T', 'R', 'W', 'A', 'G', 'M', 'Y', 'F', 'P', 'D', 'X', 'B', 'N', 'J', 'Z', 'S', 'Q', 'V', 'H', 'L', 'C', 'K', 'E'];
  chars = chars.join('');
  var checksum = parseInt(chars.slice(0, 8), 10) % 23;
  return chars[8] === lookup[checksum];
}
/*
 * et-EE validation function
 * (Isikukood (IK), persons only)
 * Checks if birth date (century digit and six following) is valid and calculates check (last) digit
 * Material not in DG TAXUD document sourced from:
 * - `https://www.oecd.org/tax/automatic-exchange/crs-implementation-and-assistance/tax-identification-numbers/Estonia-TIN.pdf`
 */


function etEeCheck(tin) {
  // Extract year and add century
  var full_year = tin.slice(1, 3);
  var century_digit = tin.slice(0, 1);

  switch (century_digit) {
    case '1':
    case '2':
      full_year = "18".concat(full_year);
      break;

    case '3':
    case '4':
      full_year = "19".concat(full_year);
      break;

    default:
      full_year = "20".concat(full_year);
      break;
  } // Check date validity


  var date = "".concat(full_year, "/").concat(tin.slice(3, 5), "/").concat(tin.slice(5, 7));

  if (!(0, _isDate.default)(date, 'YYYY/MM/DD')) {
    return false;
  } // Split digits into an array for further processing


  var digits = tin.split('').map(function (a) {
    return parseInt(a, 10);
  });
  var checksum = 0;
  var weight = 1; // Multiply by weight and add to checksum

  for (var i = 0; i < 10; i++) {
    checksum += digits[i] * weight;
    weight += 1;

    if (weight === 10) {
      weight = 1;
    }
  } // Do again if modulo 11 of checksum is 10


  if (checksum % 11 === 10) {
    checksum = 0;
    weight = 3;

    for (var _i3 = 0; _i3 < 10; _i3++) {
      checksum += digits[_i3] * weight;
      weight += 1;

      if (weight === 10) {
        weight = 1;
      }
    }

    if (checksum % 11 === 10) {
      return digits[10] === 0;
    }
  }

  return checksum % 11 === digits[10];
}
/*
 * fi-FI validation function
 * (Henkilötunnus (HETU), persons only)
 * Checks if birth date (first six digits plus century symbol) is valid
 * and calculates check (last) digit
 */


function fiFiCheck(tin) {
  // Extract year and add century
  var full_year = tin.slice(4, 6);
  var century_symbol = tin.slice(6, 7);

  switch (century_symbol) {
    case '+':
      full_year = "18".concat(full_year);
      break;

    case '-':
      full_year = "19".concat(full_year);
      break;

    default:
      full_year = "20".concat(full_year);
      break;
  } // Check date validity


  var date = "".concat(full_year, "/").concat(tin.slice(2, 4), "/").concat(tin.slice(0, 2));

  if (!(0, _isDate.default)(date, 'YYYY/MM/DD')) {
    return false;
  } // Calculate check character


  var checksum = parseInt(tin.slice(0, 6) + tin.slice(7, 10), 10) % 31;

  if (checksum < 10) {
    return checksum === parseInt(tin.slice(10), 10);
  }

  checksum -= 10;
  var letters_lookup = ['A', 'B', 'C', 'D', 'E', 'F', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y'];
  return letters_lookup[checksum] === tin.slice(10);
}
/*
 * fr/nl-BE validation function
 * (Numéro national (N.N.), persons only)
 * Checks if birth date (first six digits) is valid and calculates check (last two) digits
 */


function frBeCheck(tin) {
  // Zero month/day value is acceptable
  if (tin.slice(2, 4) !== '00' || tin.slice(4, 6) !== '00') {
    // Extract date from first six digits of TIN
    var date = "".concat(tin.slice(0, 2), "/").concat(tin.slice(2, 4), "/").concat(tin.slice(4, 6));

    if (!(0, _isDate.default)(date, 'YY/MM/DD')) {
      return false;
    }
  }

  var checksum = 97 - parseInt(tin.slice(0, 9), 10) % 97;
  var checkdigits = parseInt(tin.slice(9, 11), 10);

  if (checksum !== checkdigits) {
    checksum = 97 - parseInt("2".concat(tin.slice(0, 9)), 10) % 97;

    if (checksum !== checkdigits) {
      return false;
    }
  }

  return true;
}
/*
 * fr-FR validation function
 * (Numéro fiscal de référence (numéro SPI), persons only)
 * Verify TIN validity by calculating check (last three) digits
 */


function frFrCheck(tin) {
  tin = tin.replace(/\s/g, '');
  var checksum = parseInt(tin.slice(0, 10), 10) % 511;
  var checkdigits = parseInt(tin.slice(10, 13), 10);
  return checksum === checkdigits;
}
/*
 * fr/lb-LU validation function
 * (numéro d’identification personnelle, persons only)
 * Verify birth date validity and run Luhn and Verhoeff checks
 */


function frLuCheck(tin) {
  // Extract date and check validity
  var date = "".concat(tin.slice(0, 4), "/").concat(tin.slice(4, 6), "/").concat(tin.slice(6, 8));

  if (!(0, _isDate.default)(date, 'YYYY/MM/DD')) {
    return false;
  } // Run Luhn check


  if (!algorithms.luhnCheck(tin.slice(0, 12))) {
    return false;
  } // Remove Luhn check digit and run Verhoeff check


  return algorithms.verhoeffCheck("".concat(tin.slice(0, 11)).concat(tin[12]));
}
/*
 * hr-HR validation function
 * (Osobni identifikacijski broj (OIB), persons/entities)
 * Verify TIN validity by calling iso7064Check(digits)
 */


function hrHrCheck(tin) {
  return algorithms.iso7064Check(tin);
}
/*
 * hu-HU validation function
 * (Adóazonosító jel, persons only)
 * Verify TIN validity by calculating check (last) digit
 */


function huHuCheck(tin) {
  // split digits into an array for further processing
  var digits = tin.split('').map(function (a) {
    return parseInt(a, 10);
  });
  var checksum = 8;

  for (var i = 1; i < 9; i++) {
    checksum += digits[i] * (i + 1);
  }

  return checksum % 11 === digits[9];
}
/*
 * lt-LT validation function (should go here if needed)
 * (Asmens kodas, persons/entities respectively)
 * Current validation check is alias of etEeCheck- same format applies
 */

/*
 * it-IT first/last name validity check
 * Accepts it-IT TIN-encoded names as a three-element character array and checks their validity
 * Due to lack of clarity between resources ("Are only Italian consonants used?
 * What happens if a person has X in their name?" etc.) only two test conditions
 * have been implemented:
 * Vowels may only be followed by other vowels or an X character
 * and X characters after vowels may only be followed by other X characters.
 */


function itItNameCheck(name) {
  // true at the first occurence of a vowel
  var vowelflag = false; // true at the first occurence of an X AFTER vowel
  // (to properly handle last names with X as consonant)

  var xflag = false;

  for (var i = 0; i < 3; i++) {
    if (!vowelflag && /[AEIOU]/.test(name[i])) {
      vowelflag = true;
    } else if (!xflag && vowelflag && name[i] === 'X') {
      xflag = true;
    } else if (i > 0) {
      if (vowelflag && !xflag) {
        if (!/[AEIOU]/.test(name[i])) {
          return false;
        }
      }

      if (xflag) {
        if (!/X/.test(name[i])) {
          return false;
        }
      }
    }
  }

  return true;
}
/*
 * it-IT validation function
 * (Codice fiscale (TIN-IT), persons only)
 * Verify name, birth date and codice catastale validity
 * and calculate check character.
 * Material not in DG-TAXUD document sourced from:
 * `https://en.wikipedia.org/wiki/Italian_fiscal_code`
 */


function itItCheck(tin) {
  // Capitalize and split characters into an array for further processing
  var chars = tin.toUpperCase().split(''); // Check first and last name validity calling itItNameCheck()

  if (!itItNameCheck(chars.slice(0, 3))) {
    return false;
  }

  if (!itItNameCheck(chars.slice(3, 6))) {
    return false;
  } // Convert letters in number spaces back to numbers if any


  var number_locations = [6, 7, 9, 10, 12, 13, 14];
  var number_replace = {
    L: '0',
    M: '1',
    N: '2',
    P: '3',
    Q: '4',
    R: '5',
    S: '6',
    T: '7',
    U: '8',
    V: '9'
  };

  for (var _i4 = 0, _number_locations = number_locations; _i4 < _number_locations.length; _i4++) {
    var i = _number_locations[_i4];

    if (chars[i] in number_replace) {
      chars.splice(i, 1, number_replace[chars[i]]);
    }
  } // Extract month and day, and check date validity


  var month_replace = {
    A: '01',
    B: '02',
    C: '03',
    D: '04',
    E: '05',
    H: '06',
    L: '07',
    M: '08',
    P: '09',
    R: '10',
    S: '11',
    T: '12'
  };
  var month = month_replace[chars[8]];
  var day = parseInt(chars[9] + chars[10], 10);

  if (day > 40) {
    day -= 40;
  }

  if (day < 10) {
    day = "0".concat(day);
  }

  var date = "".concat(chars[6]).concat(chars[7], "/").concat(month, "/").concat(day);

  if (!(0, _isDate.default)(date, 'YY/MM/DD')) {
    return false;
  } // Calculate check character by adding up even and odd characters as numbers


  var checksum = 0;

  for (var _i5 = 1; _i5 < chars.length - 1; _i5 += 2) {
    var char_to_int = parseInt(chars[_i5], 10);

    if (isNaN(char_to_int)) {
      char_to_int = chars[_i5].charCodeAt(0) - 65;
    }

    checksum += char_to_int;
  }

  var odd_convert = {
    // Maps of characters at odd places
    A: 1,
    B: 0,
    C: 5,
    D: 7,
    E: 9,
    F: 13,
    G: 15,
    H: 17,
    I: 19,
    J: 21,
    K: 2,
    L: 4,
    M: 18,
    N: 20,
    O: 11,
    P: 3,
    Q: 6,
    R: 8,
    S: 12,
    T: 14,
    U: 16,
    V: 10,
    W: 22,
    X: 25,
    Y: 24,
    Z: 23,
    0: 1,
    1: 0
  };

  for (var _i6 = 0; _i6 < chars.length - 1; _i6 += 2) {
    var _char_to_int = 0;

    if (chars[_i6] in odd_convert) {
      _char_to_int = odd_convert[chars[_i6]];
    } else {
      var multiplier = parseInt(chars[_i6], 10);
      _char_to_int = 2 * multiplier + 1;

      if (multiplier > 4) {
        _char_to_int += 2;
      }
    }

    checksum += _char_to_int;
  }

  if (String.fromCharCode(65 + checksum % 26) !== chars[15]) {
    return false;
  }

  return true;
}
/*
 * lv-LV validation function
 * (Personas kods (PK), persons only)
 * Check validity of birth date and calculate check (last) digit
 * Support only for old format numbers (not starting with '32', issued before 2017/07/01)
 * Material not in DG TAXUD document sourced from:
 * `https://boot.ritakafija.lv/forums/index.php?/topic/88314-personas-koda-algoritms-%C4%8Deksumma/`
 */


function lvLvCheck(tin) {
  tin = tin.replace(/\W/, ''); // Extract date from TIN

  var day = tin.slice(0, 2);

  if (day !== '32') {
    // No date/checksum check if new format
    var month = tin.slice(2, 4);

    if (month !== '00') {
      // No date check if unknown month
      var full_year = tin.slice(4, 6);

      switch (tin[6]) {
        case '0':
          full_year = "18".concat(full_year);
          break;

        case '1':
          full_year = "19".concat(full_year);
          break;

        default:
          full_year = "20".concat(full_year);
          break;
      } // Check date validity


      var date = "".concat(full_year, "/").concat(tin.slice(2, 4), "/").concat(day);

      if (!(0, _isDate.default)(date, 'YYYY/MM/DD')) {
        return false;
      }
    } // Calculate check digit


    var checksum = 1101;
    var multip_lookup = [1, 6, 3, 7, 9, 10, 5, 8, 4, 2];

    for (var i = 0; i < tin.length - 1; i++) {
      checksum -= parseInt(tin[i], 10) * multip_lookup[i];
    }

    return parseInt(tin[10], 10) === checksum % 11;
  }

  return true;
}
/*
 * mt-MT validation function
 * (Identity Card Number or Unique Taxpayer Reference, persons/entities)
 * Verify Identity Card Number structure (no other tests found)
 */


function mtMtCheck(tin) {
  if (tin.length !== 9) {
    // No tests for UTR
    var chars = tin.toUpperCase().split(''); // Fill with zeros if smaller than proper

    while (chars.length < 8) {
      chars.unshift(0);
    } // Validate format according to last character


    switch (tin[7]) {
      case 'A':
      case 'P':
        if (parseInt(chars[6], 10) === 0) {
          return false;
        }

        break;

      default:
        {
          var first_part = parseInt(chars.join('').slice(0, 5), 10);

          if (first_part > 32000) {
            return false;
          }

          var second_part = parseInt(chars.join('').slice(5, 7), 10);

          if (first_part === second_part) {
            return false;
          }
        }
    }
  }

  return true;
}
/*
 * nl-NL validation function
 * (Burgerservicenummer (BSN) or Rechtspersonen Samenwerkingsverbanden Informatie Nummer (RSIN),
 * persons/entities respectively)
 * Verify TIN validity by calculating check (last) digit (variant of MOD 11)
 */


function nlNlCheck(tin) {
  return algorithms.reverseMultiplyAndSum(tin.split('').slice(0, 8).map(function (a) {
    return parseInt(a, 10);
  }), 9) % 11 === parseInt(tin[8], 10);
}
/*
 * pl-PL validation function
 * (Powszechny Elektroniczny System Ewidencji Ludności (PESEL)
 * or Numer identyfikacji podatkowej (NIP), persons/entities)
 * Verify TIN validity by validating birth date (PESEL) and calculating check (last) digit
 */


function plPlCheck(tin) {
  // NIP
  if (tin.length === 10) {
    // Calculate last digit by multiplying with lookup
    var lookup = [6, 5, 7, 2, 3, 4, 5, 6, 7];
    var _checksum = 0;

    for (var i = 0; i < lookup.length; i++) {
      _checksum += parseInt(tin[i], 10) * lookup[i];
    }

    _checksum %= 11;

    if (_checksum === 10) {
      return false;
    }

    return _checksum === parseInt(tin[9], 10);
  } // PESEL
  // Extract full year using month


  var full_year = tin.slice(0, 2);
  var month = parseInt(tin.slice(2, 4), 10);

  if (month > 80) {
    full_year = "18".concat(full_year);
    month -= 80;
  } else if (month > 60) {
    full_year = "22".concat(full_year);
    month -= 60;
  } else if (month > 40) {
    full_year = "21".concat(full_year);
    month -= 40;
  } else if (month > 20) {
    full_year = "20".concat(full_year);
    month -= 20;
  } else {
    full_year = "19".concat(full_year);
  } // Add leading zero to month if needed


  if (month < 10) {
    month = "0".concat(month);
  } // Check date validity


  var date = "".concat(full_year, "/").concat(month, "/").concat(tin.slice(4, 6));

  if (!(0, _isDate.default)(date, 'YYYY/MM/DD')) {
    return false;
  } // Calculate last digit by mulitplying with odd one-digit numbers except 5


  var checksum = 0;
  var multiplier = 1;

  for (var _i7 = 0; _i7 < tin.length - 1; _i7++) {
    checksum += parseInt(tin[_i7], 10) * multiplier % 10;
    multiplier += 2;

    if (multiplier > 10) {
      multiplier = 1;
    } else if (multiplier === 5) {
      multiplier += 2;
    }
  }

  checksum = 10 - checksum % 10;
  return checksum === parseInt(tin[10], 10);
}
/*
* pt-BR validation function
* (Cadastro de Pessoas Físicas (CPF, persons)
* Cadastro Nacional de Pessoas Jurídicas (CNPJ, entities)
* Both inputs will be validated
*/


function ptBrCheck(tin) {
  if (tin.length === 11) {
    var _sum;

    var remainder;
    _sum = 0;
    if ( // Reject known invalid CPFs
    tin === '11111111111' || tin === '22222222222' || tin === '33333333333' || tin === '44444444444' || tin === '55555555555' || tin === '66666666666' || tin === '77777777777' || tin === '88888888888' || tin === '99999999999' || tin === '00000000000') return false;

    for (var i = 1; i <= 9; i++) {
      _sum += parseInt(tin.substring(i - 1, i), 10) * (11 - i);
    }

    remainder = _sum * 10 % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(tin.substring(9, 10), 10)) return false;
    _sum = 0;

    for (var _i8 = 1; _i8 <= 10; _i8++) {
      _sum += parseInt(tin.substring(_i8 - 1, _i8), 10) * (12 - _i8);
    }

    remainder = _sum * 10 % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(tin.substring(10, 11), 10)) return false;
    return true;
  }

  if ( // Reject know invalid CNPJs
  tin === '00000000000000' || tin === '11111111111111' || tin === '22222222222222' || tin === '33333333333333' || tin === '44444444444444' || tin === '55555555555555' || tin === '66666666666666' || tin === '77777777777777' || tin === '88888888888888' || tin === '99999999999999') {
    return false;
  }

  var length = tin.length - 2;
  var identifiers = tin.substring(0, length);
  var verificators = tin.substring(length);
  var sum = 0;
  var pos = length - 7;

  for (var _i9 = length; _i9 >= 1; _i9--) {
    sum += identifiers.charAt(length - _i9) * pos;
    pos -= 1;

    if (pos < 2) {
      pos = 9;
    }
  }

  var result = sum % 11 < 2 ? 0 : 11 - sum % 11;

  if (result !== parseInt(verificators.charAt(0), 10)) {
    return false;
  }

  length += 1;
  identifiers = tin.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (var _i10 = length; _i10 >= 1; _i10--) {
    sum += identifiers.charAt(length - _i10) * pos;
    pos -= 1;

    if (pos < 2) {
      pos = 9;
    }
  }

  result = sum % 11 < 2 ? 0 : 11 - sum % 11;

  if (result !== parseInt(verificators.charAt(1), 10)) {
    return false;
  }

  return true;
}
/*
 * pt-PT validation function
 * (Número de identificação fiscal (NIF), persons/entities)
 * Verify TIN validity by calculating check (last) digit (variant of MOD 11)
 */


function ptPtCheck(tin) {
  var checksum = 11 - algorithms.reverseMultiplyAndSum(tin.split('').slice(0, 8).map(function (a) {
    return parseInt(a, 10);
  }), 9) % 11;

  if (checksum > 9) {
    return parseInt(tin[8], 10) === 0;
  }

  return checksum === parseInt(tin[8], 10);
}
/*
 * ro-RO validation function
 * (Cod Numeric Personal (CNP) or Cod de înregistrare fiscală (CIF),
 * persons only)
 * Verify CNP validity by calculating check (last) digit (test not found for CIF)
 * Material not in DG TAXUD document sourced from:
 * `https://en.wikipedia.org/wiki/National_identification_number#Romania`
 */


function roRoCheck(tin) {
  if (tin.slice(0, 4) !== '9000') {
    // No test found for this format
    // Extract full year using century digit if possible
    var full_year = tin.slice(1, 3);

    switch (tin[0]) {
      case '1':
      case '2':
        full_year = "19".concat(full_year);
        break;

      case '3':
      case '4':
        full_year = "18".concat(full_year);
        break;

      case '5':
      case '6':
        full_year = "20".concat(full_year);
        break;

      default:
    } // Check date validity


    var date = "".concat(full_year, "/").concat(tin.slice(3, 5), "/").concat(tin.slice(5, 7));

    if (date.length === 8) {
      if (!(0, _isDate.default)(date, 'YY/MM/DD')) {
        return false;
      }
    } else if (!(0, _isDate.default)(date, 'YYYY/MM/DD')) {
      return false;
    } // Calculate check digit


    var digits = tin.split('').map(function (a) {
      return parseInt(a, 10);
    });
    var multipliers = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
    var checksum = 0;

    for (var i = 0; i < multipliers.length; i++) {
      checksum += digits[i] * multipliers[i];
    }

    if (checksum % 11 === 10) {
      return digits[12] === 1;
    }

    return digits[12] === checksum % 11;
  }

  return true;
}
/*
 * sk-SK validation function
 * (Rodné číslo (RČ) or bezvýznamové identifikačné číslo (BIČ), persons only)
 * Checks validity of pre-1954 birth numbers (rodné číslo) only
 * Due to the introduction of the pseudo-random BIČ it is not possible to test
 * post-1954 birth numbers without knowing whether they are BIČ or RČ beforehand
 */


function skSkCheck(tin) {
  if (tin.length === 9) {
    tin = tin.replace(/\W/, '');

    if (tin.slice(6) === '000') {
      return false;
    } // Three-zero serial not assigned before 1954
    // Extract full year from TIN length


    var full_year = parseInt(tin.slice(0, 2), 10);

    if (full_year > 53) {
      return false;
    }

    if (full_year < 10) {
      full_year = "190".concat(full_year);
    } else {
      full_year = "19".concat(full_year);
    } // Extract month from TIN and normalize


    var month = parseInt(tin.slice(2, 4), 10);

    if (month > 50) {
      month -= 50;
    }

    if (month < 10) {
      month = "0".concat(month);
    } // Check date validity


    var date = "".concat(full_year, "/").concat(month, "/").concat(tin.slice(4, 6));

    if (!(0, _isDate.default)(date, 'YYYY/MM/DD')) {
      return false;
    }
  }

  return true;
}
/*
 * sl-SI validation function
 * (Davčna številka, persons/entities)
 * Verify TIN validity by calculating check (last) digit (variant of MOD 11)
 */


function slSiCheck(tin) {
  var checksum = 11 - algorithms.reverseMultiplyAndSum(tin.split('').slice(0, 7).map(function (a) {
    return parseInt(a, 10);
  }), 8) % 11;

  if (checksum === 10) {
    return parseInt(tin[7], 10) === 0;
  }

  return checksum === parseInt(tin[7], 10);
}
/*
 * sv-SE validation function
 * (Personnummer or samordningsnummer, persons only)
 * Checks validity of birth date and calls luhnCheck() to validate check (last) digit
 */


function svSeCheck(tin) {
  // Make copy of TIN and normalize to two-digit year form
  var tin_copy = tin.slice(0);

  if (tin.length > 11) {
    tin_copy = tin_copy.slice(2);
  } // Extract date of birth


  var full_year = '';
  var month = tin_copy.slice(2, 4);
  var day = parseInt(tin_copy.slice(4, 6), 10);

  if (tin.length > 11) {
    full_year = tin.slice(0, 4);
  } else {
    full_year = tin.slice(0, 2);

    if (tin.length === 11 && day < 60) {
      // Extract full year from centenarian symbol
      // Should work just fine until year 10000 or so
      var current_year = new Date().getFullYear().toString();
      var current_century = parseInt(current_year.slice(0, 2), 10);
      current_year = parseInt(current_year, 10);

      if (tin[6] === '-') {
        if (parseInt("".concat(current_century).concat(full_year), 10) > current_year) {
          full_year = "".concat(current_century - 1).concat(full_year);
        } else {
          full_year = "".concat(current_century).concat(full_year);
        }
      } else {
        full_year = "".concat(current_century - 1).concat(full_year);

        if (current_year - parseInt(full_year, 10) < 100) {
          return false;
        }
      }
    }
  } // Normalize day and check date validity


  if (day > 60) {
    day -= 60;
  }

  if (day < 10) {
    day = "0".concat(day);
  }

  var date = "".concat(full_year, "/").concat(month, "/").concat(day);

  if (date.length === 8) {
    if (!(0, _isDate.default)(date, 'YY/MM/DD')) {
      return false;
    }
  } else if (!(0, _isDate.default)(date, 'YYYY/MM/DD')) {
    return false;
  }

  return algorithms.luhnCheck(tin.replace(/\W/, ''));
} // Locale lookup objects

/*
 * Tax id regex formats for various locales
 *
 * Where not explicitly specified in DG-TAXUD document both
 * uppercase and lowercase letters are acceptable.
 */


var taxIdFormat = {
  'bg-BG': /^\d{10}$/,
  'cs-CZ': /^\d{6}\/{0,1}\d{3,4}$/,
  'de-AT': /^\d{9}$/,
  'de-DE': /^[1-9]\d{10}$/,
  'dk-DK': /^\d{6}-{0,1}\d{4}$/,
  'el-CY': /^[09]\d{7}[A-Z]$/,
  'el-GR': /^([0-4]|[7-9])\d{8}$/,
  'en-GB': /^\d{10}$|^(?!GB|NK|TN|ZZ)(?![DFIQUV])[A-Z](?![DFIQUVO])[A-Z]\d{6}[ABCD ]$/i,
  'en-IE': /^\d{7}[A-W][A-IW]{0,1}$/i,
  'en-US': /^\d{2}[- ]{0,1}\d{7}$/,
  'es-ES': /^(\d{0,8}|[XYZKLM]\d{7})[A-HJ-NP-TV-Z]$/i,
  'et-EE': /^[1-6]\d{6}(00[1-9]|0[1-9][0-9]|[1-6][0-9]{2}|70[0-9]|710)\d$/,
  'fi-FI': /^\d{6}[-+A]\d{3}[0-9A-FHJ-NPR-Y]$/i,
  'fr-BE': /^\d{11}$/,
  'fr-FR': /^[0-3]\d{12}$|^[0-3]\d\s\d{2}(\s\d{3}){3}$/,
  // Conforms both to official spec and provided example
  'fr-LU': /^\d{13}$/,
  'hr-HR': /^\d{11}$/,
  'hu-HU': /^8\d{9}$/,
  'it-IT': /^[A-Z]{6}[L-NP-V0-9]{2}[A-EHLMPRST][L-NP-V0-9]{2}[A-ILMZ][L-NP-V0-9]{3}[A-Z]$/i,
  'lv-LV': /^\d{6}-{0,1}\d{5}$/,
  // Conforms both to DG TAXUD spec and original research
  'mt-MT': /^\d{3,7}[APMGLHBZ]$|^([1-8])\1\d{7}$/i,
  'nl-NL': /^\d{9}$/,
  'pl-PL': /^\d{10,11}$/,
  'pt-BR': /(?:^\d{11}$)|(?:^\d{14}$)/,
  'pt-PT': /^\d{9}$/,
  'ro-RO': /^\d{13}$/,
  'sk-SK': /^\d{6}\/{0,1}\d{3,4}$/,
  'sl-SI': /^[1-9]\d{7}$/,
  'sv-SE': /^(\d{6}[-+]{0,1}\d{4}|(18|19|20)\d{6}[-+]{0,1}\d{4})$/
}; // taxIdFormat locale aliases

taxIdFormat['lb-LU'] = taxIdFormat['fr-LU'];
taxIdFormat['lt-LT'] = taxIdFormat['et-EE'];
taxIdFormat['nl-BE'] = taxIdFormat['fr-BE']; // Algorithmic tax id check functions for various locales

var taxIdCheck = {
  'bg-BG': bgBgCheck,
  'cs-CZ': csCzCheck,
  'de-AT': deAtCheck,
  'de-DE': deDeCheck,
  'dk-DK': dkDkCheck,
  'el-CY': elCyCheck,
  'el-GR': elGrCheck,
  'en-IE': enIeCheck,
  'en-US': enUsCheck,
  'es-ES': esEsCheck,
  'et-EE': etEeCheck,
  'fi-FI': fiFiCheck,
  'fr-BE': frBeCheck,
  'fr-FR': frFrCheck,
  'fr-LU': frLuCheck,
  'hr-HR': hrHrCheck,
  'hu-HU': huHuCheck,
  'it-IT': itItCheck,
  'lv-LV': lvLvCheck,
  'mt-MT': mtMtCheck,
  'nl-NL': nlNlCheck,
  'pl-PL': plPlCheck,
  'pt-BR': ptBrCheck,
  'pt-PT': ptPtCheck,
  'ro-RO': roRoCheck,
  'sk-SK': skSkCheck,
  'sl-SI': slSiCheck,
  'sv-SE': svSeCheck
}; // taxIdCheck locale aliases

taxIdCheck['lb-LU'] = taxIdCheck['fr-LU'];
taxIdCheck['lt-LT'] = taxIdCheck['et-EE'];
taxIdCheck['nl-BE'] = taxIdCheck['fr-BE']; // Regexes for locales where characters should be omitted before checking format

var allsymbols = /[-\\\/!@#$%\^&\*\(\)\+\=\[\]]+/g;
var sanitizeRegexes = {
  'de-AT': allsymbols,
  'de-DE': /[\/\\]/g,
  'fr-BE': allsymbols
}; // sanitizeRegexes locale aliases

sanitizeRegexes['nl-BE'] = sanitizeRegexes['fr-BE'];
/*
 * Validator function
 * Return true if the passed string is a valid tax identification number
 * for the specified locale.
 * Throw an error exception if the locale is not supported.
 */

function isTaxID(str) {
  var locale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'en-US';
  (0, _assertString.default)(str); // Copy TIN to avoid replacement if sanitized

  var strcopy = str.slice(0);

  if (locale in taxIdFormat) {
    if (locale in sanitizeRegexes) {
      strcopy = strcopy.replace(sanitizeRegexes[locale], '');
    }

    if (!taxIdFormat[locale].test(strcopy)) {
      return false;
    }

    if (locale in taxIdCheck) {
      return taxIdCheck[locale](strcopy);
    } // Fallthrough; not all locales have algorithmic checks


    return true;
  }

  throw new Error("Invalid locale '".concat(locale, "'"));
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isURL.js":
/*!*********************************************!*\
  !*** ./node_modules/validator/lib/isURL.js ***!
  \*********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isURL;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

var _isFQDN = _interopRequireDefault(__webpack_require__(/*! ./isFQDN */ "./node_modules/validator/lib/isFQDN.js"));

var _isIP = _interopRequireDefault(__webpack_require__(/*! ./isIP */ "./node_modules/validator/lib/isIP.js"));

var _merge = _interopRequireDefault(__webpack_require__(/*! ./util/merge */ "./node_modules/validator/lib/util/merge.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/*
options for isURL method

require_protocol - if set as true isURL will return false if protocol is not present in the URL
require_valid_protocol - isURL will check if the URL's protocol is present in the protocols option
protocols - valid protocols can be modified with this option
require_host - if set as false isURL will not check if host is present in the URL
require_port - if set as true isURL will check if port is present in the URL
allow_protocol_relative_urls - if set as true protocol relative URLs will be allowed
validate_length - if set as false isURL will skip string length validation (IE maximum is 2083)

*/
var default_url_options = {
  protocols: ['http', 'https', 'ftp'],
  require_tld: true,
  require_protocol: false,
  require_host: true,
  require_port: false,
  require_valid_protocol: true,
  allow_underscores: false,
  allow_trailing_dot: false,
  allow_protocol_relative_urls: false,
  allow_fragments: true,
  allow_query_components: true,
  validate_length: true
};
var wrapped_ipv6 = /^\[([^\]]+)\](?::([0-9]+))?$/;

function isRegExp(obj) {
  return Object.prototype.toString.call(obj) === '[object RegExp]';
}

function checkHost(host, matches) {
  for (var i = 0; i < matches.length; i++) {
    var match = matches[i];

    if (host === match || isRegExp(match) && match.test(host)) {
      return true;
    }
  }

  return false;
}

function isURL(url, options) {
  (0, _assertString.default)(url);

  if (!url || /[\s<>]/.test(url)) {
    return false;
  }

  if (url.indexOf('mailto:') === 0) {
    return false;
  }

  options = (0, _merge.default)(options, default_url_options);

  if (options.validate_length && url.length >= 2083) {
    return false;
  }

  if (!options.allow_fragments && url.includes('#')) {
    return false;
  }

  if (!options.allow_query_components && (url.includes('?') || url.includes('&'))) {
    return false;
  }

  var protocol, auth, host, hostname, port, port_str, split, ipv6;
  split = url.split('#');
  url = split.shift();
  split = url.split('?');
  url = split.shift();
  split = url.split('://');

  if (split.length > 1) {
    protocol = split.shift().toLowerCase();

    if (options.require_valid_protocol && options.protocols.indexOf(protocol) === -1) {
      return false;
    }
  } else if (options.require_protocol) {
    return false;
  } else if (url.substr(0, 2) === '//') {
    if (!options.allow_protocol_relative_urls) {
      return false;
    }

    split[0] = url.substr(2);
  }

  url = split.join('://');

  if (url === '') {
    return false;
  }

  split = url.split('/');
  url = split.shift();

  if (url === '' && !options.require_host) {
    return true;
  }

  split = url.split('@');

  if (split.length > 1) {
    if (options.disallow_auth) {
      return false;
    }

    if (split[0] === '') {
      return false;
    }

    auth = split.shift();

    if (auth.indexOf(':') >= 0 && auth.split(':').length > 2) {
      return false;
    }

    var _auth$split = auth.split(':'),
        _auth$split2 = _slicedToArray(_auth$split, 2),
        user = _auth$split2[0],
        password = _auth$split2[1];

    if (user === '' && password === '') {
      return false;
    }
  }

  hostname = split.join('@');
  port_str = null;
  ipv6 = null;
  var ipv6_match = hostname.match(wrapped_ipv6);

  if (ipv6_match) {
    host = '';
    ipv6 = ipv6_match[1];
    port_str = ipv6_match[2] || null;
  } else {
    split = hostname.split(':');
    host = split.shift();

    if (split.length) {
      port_str = split.join(':');
    }
  }

  if (port_str !== null && port_str.length > 0) {
    port = parseInt(port_str, 10);

    if (!/^[0-9]+$/.test(port_str) || port <= 0 || port > 65535) {
      return false;
    }
  } else if (options.require_port) {
    return false;
  }

  if (options.host_whitelist) {
    return checkHost(host, options.host_whitelist);
  }

  if (!(0, _isIP.default)(host) && !(0, _isFQDN.default)(host, options) && (!ipv6 || !(0, _isIP.default)(ipv6, 6))) {
    return false;
  }

  host = host || ipv6;

  if (options.host_blacklist && checkHost(host, options.host_blacklist)) {
    return false;
  }

  return true;
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isUUID.js":
/*!**********************************************!*\
  !*** ./node_modules/validator/lib/isUUID.js ***!
  \**********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isUUID;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var uuid = {
  1: /^[0-9A-F]{8}-[0-9A-F]{4}-1[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
  2: /^[0-9A-F]{8}-[0-9A-F]{4}-2[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
  3: /^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
  4: /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
  5: /^[0-9A-F]{8}-[0-9A-F]{4}-5[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
  all: /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i
};

function isUUID(str, version) {
  (0, _assertString.default)(str);
  var pattern = uuid[![undefined, null].includes(version) ? version : 'all'];
  return !!pattern && pattern.test(str);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isUppercase.js":
/*!***************************************************!*\
  !*** ./node_modules/validator/lib/isUppercase.js ***!
  \***************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isUppercase;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isUppercase(str) {
  (0, _assertString.default)(str);
  return str === str.toUpperCase();
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isVAT.js":
/*!*********************************************!*\
  !*** ./node_modules/validator/lib/isVAT.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isVAT;
exports.vatMatchers = void 0;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var vatMatchers = {
  GB: /^GB((\d{3} \d{4} ([0-8][0-9]|9[0-6]))|(\d{9} \d{3})|(((GD[0-4])|(HA[5-9]))[0-9]{2}))$/,
  IT: /^(IT)?[0-9]{11}$/,
  NL: /^(NL)?[0-9]{9}B[0-9]{2}$/
};
exports.vatMatchers = vatMatchers;

function isVAT(str, countryCode) {
  (0, _assertString.default)(str);
  (0, _assertString.default)(countryCode);

  if (countryCode in vatMatchers) {
    return vatMatchers[countryCode].test(str);
  }

  throw new Error("Invalid country code: '".concat(countryCode, "'"));
}

/***/ }),

/***/ "./node_modules/validator/lib/isVariableWidth.js":
/*!*******************************************************!*\
  !*** ./node_modules/validator/lib/isVariableWidth.js ***!
  \*******************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isVariableWidth;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

var _isFullWidth = __webpack_require__(/*! ./isFullWidth */ "./node_modules/validator/lib/isFullWidth.js");

var _isHalfWidth = __webpack_require__(/*! ./isHalfWidth */ "./node_modules/validator/lib/isHalfWidth.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isVariableWidth(str) {
  (0, _assertString.default)(str);
  return _isFullWidth.fullWidth.test(str) && _isHalfWidth.halfWidth.test(str);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/isWhitelisted.js":
/*!*****************************************************!*\
  !*** ./node_modules/validator/lib/isWhitelisted.js ***!
  \*****************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = isWhitelisted;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isWhitelisted(str, chars) {
  (0, _assertString.default)(str);

  for (var i = str.length - 1; i >= 0; i--) {
    if (chars.indexOf(str[i]) === -1) {
      return false;
    }
  }

  return true;
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/ltrim.js":
/*!*********************************************!*\
  !*** ./node_modules/validator/lib/ltrim.js ***!
  \*********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = ltrim;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ltrim(str, chars) {
  (0, _assertString.default)(str); // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping

  var pattern = chars ? new RegExp("^[".concat(chars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "]+"), 'g') : /^\s+/g;
  return str.replace(pattern, '');
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/matches.js":
/*!***********************************************!*\
  !*** ./node_modules/validator/lib/matches.js ***!
  \***********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = matches;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function matches(str, pattern, modifiers) {
  (0, _assertString.default)(str);

  if (Object.prototype.toString.call(pattern) !== '[object RegExp]') {
    pattern = new RegExp(pattern, modifiers);
  }

  return pattern.test(str);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/normalizeEmail.js":
/*!******************************************************!*\
  !*** ./node_modules/validator/lib/normalizeEmail.js ***!
  \******************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = normalizeEmail;

var _merge = _interopRequireDefault(__webpack_require__(/*! ./util/merge */ "./node_modules/validator/lib/util/merge.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var default_normalize_email_options = {
  // The following options apply to all email addresses
  // Lowercases the local part of the email address.
  // Please note this may violate RFC 5321 as per http://stackoverflow.com/a/9808332/192024).
  // The domain is always lowercased, as per RFC 1035
  all_lowercase: true,
  // The following conversions are specific to GMail
  // Lowercases the local part of the GMail address (known to be case-insensitive)
  gmail_lowercase: true,
  // Removes dots from the local part of the email address, as that's ignored by GMail
  gmail_remove_dots: true,
  // Removes the subaddress (e.g. "+foo") from the email address
  gmail_remove_subaddress: true,
  // Conversts the googlemail.com domain to gmail.com
  gmail_convert_googlemaildotcom: true,
  // The following conversions are specific to Outlook.com / Windows Live / Hotmail
  // Lowercases the local part of the Outlook.com address (known to be case-insensitive)
  outlookdotcom_lowercase: true,
  // Removes the subaddress (e.g. "+foo") from the email address
  outlookdotcom_remove_subaddress: true,
  // The following conversions are specific to Yahoo
  // Lowercases the local part of the Yahoo address (known to be case-insensitive)
  yahoo_lowercase: true,
  // Removes the subaddress (e.g. "-foo") from the email address
  yahoo_remove_subaddress: true,
  // The following conversions are specific to Yandex
  // Lowercases the local part of the Yandex address (known to be case-insensitive)
  yandex_lowercase: true,
  // The following conversions are specific to iCloud
  // Lowercases the local part of the iCloud address (known to be case-insensitive)
  icloud_lowercase: true,
  // Removes the subaddress (e.g. "+foo") from the email address
  icloud_remove_subaddress: true
}; // List of domains used by iCloud

var icloud_domains = ['icloud.com', 'me.com']; // List of domains used by Outlook.com and its predecessors
// This list is likely incomplete.
// Partial reference:
// https://blogs.office.com/2013/04/17/outlook-com-gets-two-step-verification-sign-in-by-alias-and-new-international-domains/

var outlookdotcom_domains = ['hotmail.at', 'hotmail.be', 'hotmail.ca', 'hotmail.cl', 'hotmail.co.il', 'hotmail.co.nz', 'hotmail.co.th', 'hotmail.co.uk', 'hotmail.com', 'hotmail.com.ar', 'hotmail.com.au', 'hotmail.com.br', 'hotmail.com.gr', 'hotmail.com.mx', 'hotmail.com.pe', 'hotmail.com.tr', 'hotmail.com.vn', 'hotmail.cz', 'hotmail.de', 'hotmail.dk', 'hotmail.es', 'hotmail.fr', 'hotmail.hu', 'hotmail.id', 'hotmail.ie', 'hotmail.in', 'hotmail.it', 'hotmail.jp', 'hotmail.kr', 'hotmail.lv', 'hotmail.my', 'hotmail.ph', 'hotmail.pt', 'hotmail.sa', 'hotmail.sg', 'hotmail.sk', 'live.be', 'live.co.uk', 'live.com', 'live.com.ar', 'live.com.mx', 'live.de', 'live.es', 'live.eu', 'live.fr', 'live.it', 'live.nl', 'msn.com', 'outlook.at', 'outlook.be', 'outlook.cl', 'outlook.co.il', 'outlook.co.nz', 'outlook.co.th', 'outlook.com', 'outlook.com.ar', 'outlook.com.au', 'outlook.com.br', 'outlook.com.gr', 'outlook.com.pe', 'outlook.com.tr', 'outlook.com.vn', 'outlook.cz', 'outlook.de', 'outlook.dk', 'outlook.es', 'outlook.fr', 'outlook.hu', 'outlook.id', 'outlook.ie', 'outlook.in', 'outlook.it', 'outlook.jp', 'outlook.kr', 'outlook.lv', 'outlook.my', 'outlook.ph', 'outlook.pt', 'outlook.sa', 'outlook.sg', 'outlook.sk', 'passport.com']; // List of domains used by Yahoo Mail
// This list is likely incomplete

var yahoo_domains = ['rocketmail.com', 'yahoo.ca', 'yahoo.co.uk', 'yahoo.com', 'yahoo.de', 'yahoo.fr', 'yahoo.in', 'yahoo.it', 'ymail.com']; // List of domains used by yandex.ru

var yandex_domains = ['yandex.ru', 'yandex.ua', 'yandex.kz', 'yandex.com', 'yandex.by', 'ya.ru']; // replace single dots, but not multiple consecutive dots

function dotsReplacer(match) {
  if (match.length > 1) {
    return match;
  }

  return '';
}

function normalizeEmail(email, options) {
  options = (0, _merge.default)(options, default_normalize_email_options);
  var raw_parts = email.split('@');
  var domain = raw_parts.pop();
  var user = raw_parts.join('@');
  var parts = [user, domain]; // The domain is always lowercased, as it's case-insensitive per RFC 1035

  parts[1] = parts[1].toLowerCase();

  if (parts[1] === 'gmail.com' || parts[1] === 'googlemail.com') {
    // Address is GMail
    if (options.gmail_remove_subaddress) {
      parts[0] = parts[0].split('+')[0];
    }

    if (options.gmail_remove_dots) {
      // this does not replace consecutive dots like example..email@gmail.com
      parts[0] = parts[0].replace(/\.+/g, dotsReplacer);
    }

    if (!parts[0].length) {
      return false;
    }

    if (options.all_lowercase || options.gmail_lowercase) {
      parts[0] = parts[0].toLowerCase();
    }

    parts[1] = options.gmail_convert_googlemaildotcom ? 'gmail.com' : parts[1];
  } else if (icloud_domains.indexOf(parts[1]) >= 0) {
    // Address is iCloud
    if (options.icloud_remove_subaddress) {
      parts[0] = parts[0].split('+')[0];
    }

    if (!parts[0].length) {
      return false;
    }

    if (options.all_lowercase || options.icloud_lowercase) {
      parts[0] = parts[0].toLowerCase();
    }
  } else if (outlookdotcom_domains.indexOf(parts[1]) >= 0) {
    // Address is Outlook.com
    if (options.outlookdotcom_remove_subaddress) {
      parts[0] = parts[0].split('+')[0];
    }

    if (!parts[0].length) {
      return false;
    }

    if (options.all_lowercase || options.outlookdotcom_lowercase) {
      parts[0] = parts[0].toLowerCase();
    }
  } else if (yahoo_domains.indexOf(parts[1]) >= 0) {
    // Address is Yahoo
    if (options.yahoo_remove_subaddress) {
      var components = parts[0].split('-');
      parts[0] = components.length > 1 ? components.slice(0, -1).join('-') : components[0];
    }

    if (!parts[0].length) {
      return false;
    }

    if (options.all_lowercase || options.yahoo_lowercase) {
      parts[0] = parts[0].toLowerCase();
    }
  } else if (yandex_domains.indexOf(parts[1]) >= 0) {
    if (options.all_lowercase || options.yandex_lowercase) {
      parts[0] = parts[0].toLowerCase();
    }

    parts[1] = 'yandex.ru'; // all yandex domains are equal, 1st preferred
  } else if (options.all_lowercase) {
    // Any other address
    parts[0] = parts[0].toLowerCase();
  }

  return parts.join('@');
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/rtrim.js":
/*!*********************************************!*\
  !*** ./node_modules/validator/lib/rtrim.js ***!
  \*********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = rtrim;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function rtrim(str, chars) {
  (0, _assertString.default)(str);

  if (chars) {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
    var pattern = new RegExp("[".concat(chars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "]+$"), 'g');
    return str.replace(pattern, '');
  } // Use a faster and more safe than regex trim method https://blog.stevenlevithan.com/archives/faster-trim-javascript


  var strIndex = str.length - 1;

  while (/\s/.test(str.charAt(strIndex))) {
    strIndex -= 1;
  }

  return str.slice(0, strIndex + 1);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/stripLow.js":
/*!************************************************!*\
  !*** ./node_modules/validator/lib/stripLow.js ***!
  \************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = stripLow;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

var _blacklist = _interopRequireDefault(__webpack_require__(/*! ./blacklist */ "./node_modules/validator/lib/blacklist.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function stripLow(str, keep_new_lines) {
  (0, _assertString.default)(str);
  var chars = keep_new_lines ? '\\x00-\\x09\\x0B\\x0C\\x0E-\\x1F\\x7F' : '\\x00-\\x1F\\x7F';
  return (0, _blacklist.default)(str, chars);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/toBoolean.js":
/*!*************************************************!*\
  !*** ./node_modules/validator/lib/toBoolean.js ***!
  \*************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = toBoolean;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function toBoolean(str, strict) {
  (0, _assertString.default)(str);

  if (strict) {
    return str === '1' || /^true$/i.test(str);
  }

  return str !== '0' && !/^false$/i.test(str) && str !== '';
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/toDate.js":
/*!**********************************************!*\
  !*** ./node_modules/validator/lib/toDate.js ***!
  \**********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = toDate;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function toDate(date) {
  (0, _assertString.default)(date);
  date = Date.parse(date);
  return !isNaN(date) ? new Date(date) : null;
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/toFloat.js":
/*!***********************************************!*\
  !*** ./node_modules/validator/lib/toFloat.js ***!
  \***********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = toFloat;

var _isFloat = _interopRequireDefault(__webpack_require__(/*! ./isFloat */ "./node_modules/validator/lib/isFloat.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function toFloat(str) {
  if (!(0, _isFloat.default)(str)) return NaN;
  return parseFloat(str);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/toInt.js":
/*!*********************************************!*\
  !*** ./node_modules/validator/lib/toInt.js ***!
  \*********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = toInt;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function toInt(str, radix) {
  (0, _assertString.default)(str);
  return parseInt(str, radix || 10);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/trim.js":
/*!********************************************!*\
  !*** ./node_modules/validator/lib/trim.js ***!
  \********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = trim;

var _rtrim = _interopRequireDefault(__webpack_require__(/*! ./rtrim */ "./node_modules/validator/lib/rtrim.js"));

var _ltrim = _interopRequireDefault(__webpack_require__(/*! ./ltrim */ "./node_modules/validator/lib/ltrim.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function trim(str, chars) {
  return (0, _rtrim.default)((0, _ltrim.default)(str, chars), chars);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/unescape.js":
/*!************************************************!*\
  !*** ./node_modules/validator/lib/unescape.js ***!
  \************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = unescape;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function unescape(str) {
  (0, _assertString.default)(str);
  return str.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#x2F;/g, '/').replace(/&#x5C;/g, '\\').replace(/&#96;/g, '`').replace(/&amp;/g, '&'); // &amp; replacement has to be the last one to prevent
  // bugs with intermediate strings containing escape sequences
  // See: https://github.com/validatorjs/validator.js/issues/1827
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/util/algorithms.js":
/*!*******************************************************!*\
  !*** ./node_modules/validator/lib/util/algorithms.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.iso7064Check = iso7064Check;
exports.luhnCheck = luhnCheck;
exports.reverseMultiplyAndSum = reverseMultiplyAndSum;
exports.verhoeffCheck = verhoeffCheck;

/**
 * Algorithmic validation functions
 * May be used as is or implemented in the workflow of other validators.
 */

/*
 * ISO 7064 validation function
 * Called with a string of numbers (incl. check digit)
 * to validate according to ISO 7064 (MOD 11, 10).
 */
function iso7064Check(str) {
  var checkvalue = 10;

  for (var i = 0; i < str.length - 1; i++) {
    checkvalue = (parseInt(str[i], 10) + checkvalue) % 10 === 0 ? 10 * 2 % 11 : (parseInt(str[i], 10) + checkvalue) % 10 * 2 % 11;
  }

  checkvalue = checkvalue === 1 ? 0 : 11 - checkvalue;
  return checkvalue === parseInt(str[10], 10);
}
/*
 * Luhn (mod 10) validation function
 * Called with a string of numbers (incl. check digit)
 * to validate according to the Luhn algorithm.
 */


function luhnCheck(str) {
  var checksum = 0;
  var second = false;

  for (var i = str.length - 1; i >= 0; i--) {
    if (second) {
      var product = parseInt(str[i], 10) * 2;

      if (product > 9) {
        // sum digits of product and add to checksum
        checksum += product.toString().split('').map(function (a) {
          return parseInt(a, 10);
        }).reduce(function (a, b) {
          return a + b;
        }, 0);
      } else {
        checksum += product;
      }
    } else {
      checksum += parseInt(str[i], 10);
    }

    second = !second;
  }

  return checksum % 10 === 0;
}
/*
 * Reverse TIN multiplication and summation helper function
 * Called with an array of single-digit integers and a base multiplier
 * to calculate the sum of the digits multiplied in reverse.
 * Normally used in variations of MOD 11 algorithmic checks.
 */


function reverseMultiplyAndSum(digits, base) {
  var total = 0;

  for (var i = 0; i < digits.length; i++) {
    total += digits[i] * (base - i);
  }

  return total;
}
/*
 * Verhoeff validation helper function
 * Called with a string of numbers
 * to validate according to the Verhoeff algorithm.
 */


function verhoeffCheck(str) {
  var d_table = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 4, 0, 6, 7, 8, 9, 5], [2, 3, 4, 0, 1, 7, 8, 9, 5, 6], [3, 4, 0, 1, 2, 8, 9, 5, 6, 7], [4, 0, 1, 2, 3, 9, 5, 6, 7, 8], [5, 9, 8, 7, 6, 0, 4, 3, 2, 1], [6, 5, 9, 8, 7, 1, 0, 4, 3, 2], [7, 6, 5, 9, 8, 2, 1, 0, 4, 3], [8, 7, 6, 5, 9, 3, 2, 1, 0, 4], [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]];
  var p_table = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 5, 7, 6, 2, 8, 3, 0, 9, 4], [5, 8, 0, 3, 7, 9, 6, 1, 4, 2], [8, 9, 1, 6, 0, 4, 3, 5, 2, 7], [9, 4, 5, 3, 1, 2, 6, 8, 7, 0], [4, 2, 8, 6, 5, 7, 3, 9, 0, 1], [2, 7, 9, 3, 8, 0, 6, 4, 1, 5], [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]]; // Copy (to prevent replacement) and reverse

  var str_copy = str.split('').reverse().join('');
  var checksum = 0;

  for (var i = 0; i < str_copy.length; i++) {
    checksum = d_table[checksum][p_table[i % 8][parseInt(str_copy[i], 10)]];
  }

  return checksum === 0;
}

/***/ }),

/***/ "./node_modules/validator/lib/util/assertString.js":
/*!*********************************************************!*\
  !*** ./node_modules/validator/lib/util/assertString.js ***!
  \*********************************************************/
/***/ ((module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = assertString;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function assertString(input) {
  var isString = typeof input === 'string' || input instanceof String;

  if (!isString) {
    var invalidType = _typeof(input);

    if (input === null) invalidType = 'null';else if (invalidType === 'object') invalidType = input.constructor.name;
    throw new TypeError("Expected a string but received a ".concat(invalidType));
  }
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/util/includes.js":
/*!*****************************************************!*\
  !*** ./node_modules/validator/lib/util/includes.js ***!
  \*****************************************************/
/***/ ((module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var includes = function includes(arr, val) {
  return arr.some(function (arrVal) {
    return val === arrVal;
  });
};

var _default = includes;
exports["default"] = _default;
module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/util/merge.js":
/*!**************************************************!*\
  !*** ./node_modules/validator/lib/util/merge.js ***!
  \**************************************************/
/***/ ((module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = merge;

function merge() {
  var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var defaults = arguments.length > 1 ? arguments[1] : undefined;

  for (var key in defaults) {
    if (typeof obj[key] === 'undefined') {
      obj[key] = defaults[key];
    }
  }

  return obj;
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/util/multilineRegex.js":
/*!***********************************************************!*\
  !*** ./node_modules/validator/lib/util/multilineRegex.js ***!
  \***********************************************************/
/***/ ((module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = multilineRegexp;

/**
 * Build RegExp object from an array
 * of multiple/multi-line regexp parts
 *
 * @param {string[]} parts
 * @param {string} flags
 * @return {object} - RegExp object
 */
function multilineRegexp(parts, flags) {
  var regexpAsStringLiteral = parts.join('');
  return new RegExp(regexpAsStringLiteral, flags);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/util/toString.js":
/*!*****************************************************!*\
  !*** ./node_modules/validator/lib/util/toString.js ***!
  \*****************************************************/
/***/ ((module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = toString;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function toString(input) {
  if (_typeof(input) === 'object' && input !== null) {
    if (typeof input.toString === 'function') {
      input = input.toString();
    } else {
      input = '[object Object]';
    }
  } else if (input === null || typeof input === 'undefined' || isNaN(input) && !input.length) {
    input = '';
  }

  return String(input);
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ }),

/***/ "./node_modules/validator/lib/whitelist.js":
/*!*************************************************!*\
  !*** ./node_modules/validator/lib/whitelist.js ***!
  \*************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = whitelist;

var _assertString = _interopRequireDefault(__webpack_require__(/*! ./util/assertString */ "./node_modules/validator/lib/util/assertString.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function whitelist(str, chars) {
  (0, _assertString.default)(str);
  return str.replace(new RegExp("[^".concat(chars, "]+"), 'g'), '');
}

module.exports = exports.default;
module.exports["default"] = exports.default;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./client/index.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7OztBQUdKOztBQUVBO0FBQ0E7QUFDQSxJQUFJOzs7QUFHSjtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0Esa0JBQWtCOztBQUVsQixrQkFBa0IsUUFBUTtBQUMxQjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7OztBQUdKO0FBQ0E7QUFDQTs7QUFFQSxzQkFBc0IsVUFBVTtBQUNoQztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFJOzs7QUFHSjs7QUFFQTtBQUNBO0FBQ0EsSUFBSTs7O0FBR0o7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBSTs7O0FBR0o7QUFDQTtBQUNBLElBQUk7OztBQUdKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQSxrQkFBa0IsT0FBTztB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Ozs7Ozs7Ozs7O0FDckJUOztBQUViLDhDQUE2QztBQUM3QztBQUNBLENBQUMsRUFBQztBQUNGLGtCQUFlOztBQUVmO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxVQUFVO0FBQ3JCLFdBQVcsUUFBUTtBQUNuQixZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHlCQUFzQjs7Ozs7Ozs7Ozs7QUNyQlQ7O0FBRWIsOENBQTZDO0FBQzdDO0FBQ0EsQ0FBQyxFQUFDO0FBQ0Ysa0JBQWU7O0FBRWYsd0JBQXdCLDJCQUEyQiwyRUFBMkUsa0NBQWtDLHdCQUF3QixPQUFPLGtDQUFrQyxtSUFBbUk7O0FBRXBXO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EseUJBQXNCOzs7Ozs7Ozs7OztBQ3hCVDs7QUFFYiw4Q0FBNkM7QUFDN0M7QUFDQSxDQUFDLEVBQUM7QUFDRixrQkFBZTs7QUFFZiwyQ0FBMkMsbUJBQU8sQ0FBQyw4RUFBcUI7O0FBRXhFLHVDQUF1Qyx1Q0FBdUM7O0FBRTlFO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EseUJBQXNCOzs7Ozs7VUNqQnRCO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2luZGV4LmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2FkYXB0ZXJzL3hoci5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9heGlvcy5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvQ2FuY2VsLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWxUb2tlbi5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvaXNDYW5jZWwuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9BeGlvcy5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0ludGVyY2VwdG9yTWFuYWdlci5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2J1aWxkRnVsbFBhdGguanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9jcmVhdGVFcnJvci5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2Rpc3BhdGNoUmVxdWVzdC5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2VuaGFuY2VFcnJvci5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL21lcmdlQ29uZmlnLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvc2V0dGxlLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvdHJhbnNmb3JtRGF0YS5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9kZWZhdWx0cy5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9lbnYvZGF0YS5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2JpbmQuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9idWlsZFVSTC5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2NvbWJpbmVVUkxzLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29va2llcy5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc0F4aW9zRXJyb3IuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc1VSTFNhbWVPcmlnaW4uanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvcGFyc2VIZWFkZXJzLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvc3ByZWFkLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvdmFsaWRhdG9yLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL3V0aWxzLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9jbGllbnQvRGFzaGJvYXJkLnRzIiwid2VicGFjazovL3dlYnNpdGUvLi9jbGllbnQvTWFpbi50cyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vY2xpZW50L2hlbHBlcnMvZm9ybWF0RGF0ZS50cyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vY2xpZW50L2luZGV4LnRzIiwid2VicGFjazovL3dlYnNpdGUvLi9jbGllbnQvbW9kYWxzL01vZGFsLnRzIiwid2VicGFjazovL3dlYnNpdGUvLi9jbGllbnQvbW9kYWxzL09yZGVyLnRzIiwid2VicGFjazovL3dlYnNpdGUvLi9jbGllbnQvbW9kYWxzL09yZGVyUHJvZHVjdC50cyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vY2xpZW50L21vZGFscy9Qcm9kdWN0LnRzIiwid2VicGFjazovL3dlYnNpdGUvLi9jbGllbnQvbW9kYWxzL1Jld2FyZC50cyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vY2xpZW50L21vZGFscy9TdG9yZS50cyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vY2xpZW50L3NlY3Rpb25zL0hvbWUudHMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL2NsaWVudC9zZWN0aW9ucy9PcmRlci50cyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vY2xpZW50L3NlY3Rpb25zL1Byb2R1Y3QudHMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL2NsaWVudC9zZWN0aW9ucy9SZXdhcmQudHMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL2NsaWVudC9zZWN0aW9ucy9TZWN0aW9uLnRzIiwid2VicGFjazovL3dlYnNpdGUvLi9jbGllbnQvc2VjdGlvbnMvU3RvcmUudHMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvaW5kZXguanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL2FscGhhLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi9ibGFja2xpc3QuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL2NvbnRhaW5zLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi9lcXVhbHMuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL2VzY2FwZS5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRvci9saWIvaXNBZnRlci5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRvci9saWIvaXNBbHBoYS5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRvci9saWIvaXNBbHBoYW51bWVyaWMuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL2lzQXNjaWkuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL2lzQklDLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi9pc0Jhc2UzMi5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRvci9saWIvaXNCYXNlNTguanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL2lzQmFzZTY0LmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi9pc0JlZm9yZS5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRvci9saWIvaXNCb29sZWFuLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi9pc0J0Y0FkZHJlc3MuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL2lzQnl0ZUxlbmd0aC5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRvci9saWIvaXNDcmVkaXRDYXJkLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi9pc0N1cnJlbmN5LmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi9pc0RhdGFVUkkuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL2lzRGF0ZS5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRvci9saWIvaXNEZWNpbWFsLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi9pc0RpdmlzaWJsZUJ5LmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi9pc0VBTi5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRvci9saWIvaXNFbWFpbC5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRvci9saWIvaXNFbXB0eS5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRvci9saWIvaXNFdGhlcmV1bUFkZHJlc3MuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL2lzRlFETi5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRvci9saWIvaXNGbG9hdC5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRvci9saWIvaXNGdWxsV2lkdGguanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL2lzSFNMLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi9pc0hhbGZXaWR0aC5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRvci9saWIvaXNIYXNoLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi9pc0hleENvbG9yLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi9pc0hleGFkZWNpbWFsLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi9pc0lCQU4uanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL2lzSU1FSS5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRvci9saWIvaXNJUC5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRvci9saWIvaXNJUFJhbmdlLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi9pc0lTQk4uanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL2lzSVNJTi5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRvci9saWIvaXNJU08zMTY2MUFscGhhMi5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRvci9saWIvaXNJU08zMTY2MUFscGhhMy5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRvci9saWIvaXNJU080MjE3LmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi9pc0lTTzg2MDEuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL2lzSVNSQy5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRvci9saWIvaXNJU1NOLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi9pc0lkZW50aXR5Q2FyZC5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRvci9saWIvaXNJbi5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRvci9saWIvaXNJbnQuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL2lzSlNPTi5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRvci9saWIvaXNKV1QuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL2lzTGF0TG9uZy5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRvci9saWIvaXNMZW5ndGguanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL2lzTGljZW5zZVBsYXRlLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi9pc0xvY2FsZS5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRvci9saWIvaXNMb3dlcmNhc2UuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL2lzTUFDQWRkcmVzcy5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRvci9saWIvaXNNRDUuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL2lzTWFnbmV0VVJJLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi9pc01pbWVUeXBlLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi9pc01vYmlsZVBob25lLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi9pc01vbmdvSWQuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL2lzTXVsdGlieXRlLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi9pc051bWVyaWMuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL2lzT2N0YWwuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL2lzUGFzc3BvcnROdW1iZXIuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL2lzUG9ydC5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRvci9saWIvaXNQb3N0YWxDb2RlLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi9pc1JGQzMzMzkuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL2lzUmdiQ29sb3IuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL2lzU2VtVmVyLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi9pc1NsdWcuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL2lzU3Ryb25nUGFzc3dvcmQuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL2lzU3Vycm9nYXRlUGFpci5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRvci9saWIvaXNUYXhJRC5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRvci9saWIvaXNVUkwuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL2lzVVVJRC5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRvci9saWIvaXNVcHBlcmNhc2UuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL2lzVkFULmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi9pc1ZhcmlhYmxlV2lkdGguanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL2lzV2hpdGVsaXN0ZWQuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL2x0cmltLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi9tYXRjaGVzLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi9ub3JtYWxpemVFbWFpbC5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRvci9saWIvcnRyaW0uanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL3N0cmlwTG93LmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi90b0Jvb2xlYW4uanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL3RvRGF0ZS5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRvci9saWIvdG9GbG9hdC5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRvci9saWIvdG9JbnQuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL3RyaW0uanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL3VuZXNjYXBlLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi91dGlsL2FsZ29yaXRobXMuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy92YWxpZGF0b3IvbGliL3V0aWwvYXNzZXJ0U3RyaW5nLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi91dGlsL2luY2x1ZGVzLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi91dGlsL21lcmdlLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi91dGlsL211bHRpbGluZVJlZ2V4LmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi91dGlsL3RvU3RyaW5nLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvdmFsaWRhdG9yL2xpYi93aGl0ZWxpc3QuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly93ZWJzaXRlL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9heGlvcycpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHNldHRsZSA9IHJlcXVpcmUoJy4vLi4vY29yZS9zZXR0bGUnKTtcbnZhciBjb29raWVzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2Nvb2tpZXMnKTtcbnZhciBidWlsZFVSTCA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIGJ1aWxkRnVsbFBhdGggPSByZXF1aXJlKCcuLi9jb3JlL2J1aWxkRnVsbFBhdGgnKTtcbnZhciBwYXJzZUhlYWRlcnMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvcGFyc2VIZWFkZXJzJyk7XG52YXIgaXNVUkxTYW1lT3JpZ2luID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbicpO1xudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi4vY29yZS9jcmVhdGVFcnJvcicpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi4vZGVmYXVsdHMnKTtcbnZhciBDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvQ2FuY2VsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24geGhyQWRhcHRlcihjb25maWcpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIGRpc3BhdGNoWGhyUmVxdWVzdChyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgcmVxdWVzdERhdGEgPSBjb25maWcuZGF0YTtcbiAgICB2YXIgcmVxdWVzdEhlYWRlcnMgPSBjb25maWcuaGVhZGVycztcbiAgICB2YXIgcmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcbiAgICB2YXIgb25DYW5jZWxlZDtcbiAgICBmdW5jdGlvbiBkb25lKCkge1xuICAgICAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgICAgICBjb25maWcuY2FuY2VsVG9rZW4udW5zdWJzY3JpYmUob25DYW5jZWxlZCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChjb25maWcuc2lnbmFsKSB7XG4gICAgICAgIGNvbmZpZy5zaWduYWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBvbkNhbmNlbGVkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShyZXF1ZXN0RGF0YSkpIHtcbiAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1snQ29udGVudC1UeXBlJ107IC8vIExldCB0aGUgYnJvd3NlciBzZXQgaXRcbiAgICB9XG5cbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgLy8gSFRUUCBiYXNpYyBhdXRoZW50aWNhdGlvblxuICAgIGlmIChjb25maWcuYXV0aCkge1xuICAgICAgdmFyIHVzZXJuYW1lID0gY29uZmlnLmF1dGgudXNlcm5hbWUgfHwgJyc7XG4gICAgICB2YXIgcGFzc3dvcmQgPSBjb25maWcuYXV0aC5wYXNzd29yZCA/IHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChjb25maWcuYXV0aC5wYXNzd29yZCkpIDogJyc7XG4gICAgICByZXF1ZXN0SGVhZGVycy5BdXRob3JpemF0aW9uID0gJ0Jhc2ljICcgKyBidG9hKHVzZXJuYW1lICsgJzonICsgcGFzc3dvcmQpO1xuICAgIH1cblxuICAgIHZhciBmdWxsUGF0aCA9IGJ1aWxkRnVsbFBhdGgoY29uZmlnLmJhc2VVUkwsIGNvbmZpZy51cmwpO1xuICAgIHJlcXVlc3Qub3Blbihjb25maWcubWV0aG9kLnRvVXBwZXJDYXNlKCksIGJ1aWxkVVJMKGZ1bGxQYXRoLCBjb25maWcucGFyYW1zLCBjb25maWcucGFyYW1zU2VyaWFsaXplciksIHRydWUpO1xuXG4gICAgLy8gU2V0IHRoZSByZXF1ZXN0IHRpbWVvdXQgaW4gTVNcbiAgICByZXF1ZXN0LnRpbWVvdXQgPSBjb25maWcudGltZW91dDtcblxuICAgIGZ1bmN0aW9uIG9ubG9hZGVuZCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBQcmVwYXJlIHRoZSByZXNwb25zZVxuICAgICAgdmFyIHJlc3BvbnNlSGVhZGVycyA9ICdnZXRBbGxSZXNwb25zZUhlYWRlcnMnIGluIHJlcXVlc3QgPyBwYXJzZUhlYWRlcnMocmVxdWVzdC5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkgOiBudWxsO1xuICAgICAgdmFyIHJlc3BvbnNlRGF0YSA9ICFyZXNwb25zZVR5cGUgfHwgcmVzcG9uc2VUeXBlID09PSAndGV4dCcgfHwgIHJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nID9cbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVRleHQgOiByZXF1ZXN0LnJlc3BvbnNlO1xuICAgICAgdmFyIHJlc3BvbnNlID0ge1xuICAgICAgICBkYXRhOiByZXNwb25zZURhdGEsXG4gICAgICAgIHN0YXR1czogcmVxdWVzdC5zdGF0dXMsXG4gICAgICAgIHN0YXR1c1RleHQ6IHJlcXVlc3Quc3RhdHVzVGV4dCxcbiAgICAgICAgaGVhZGVyczogcmVzcG9uc2VIZWFkZXJzLFxuICAgICAgICBjb25maWc6IGNvbmZpZyxcbiAgICAgICAgcmVxdWVzdDogcmVxdWVzdFxuICAgICAgfTtcblxuICAgICAgc2V0dGxlKGZ1bmN0aW9uIF9yZXNvbHZlKHZhbHVlKSB7XG4gICAgICAgIHJlc29sdmUodmFsdWUpO1xuICAgICAgICBkb25lKCk7XG4gICAgICB9LCBmdW5jdGlvbiBfcmVqZWN0KGVycikge1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfSwgcmVzcG9uc2UpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoJ29ubG9hZGVuZCcgaW4gcmVxdWVzdCkge1xuICAgICAgLy8gVXNlIG9ubG9hZGVuZCBpZiBhdmFpbGFibGVcbiAgICAgIHJlcXVlc3Qub25sb2FkZW5kID0gb25sb2FkZW5kO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBMaXN0ZW4gZm9yIHJlYWR5IHN0YXRlIHRvIGVtdWxhdGUgb25sb2FkZW5kXG4gICAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uIGhhbmRsZUxvYWQoKSB7XG4gICAgICAgIGlmICghcmVxdWVzdCB8fCByZXF1ZXN0LnJlYWR5U3RhdGUgIT09IDQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgcmVxdWVzdCBlcnJvcmVkIG91dCBhbmQgd2UgZGlkbid0IGdldCBhIHJlc3BvbnNlLCB0aGlzIHdpbGwgYmVcbiAgICAgICAgLy8gaGFuZGxlZCBieSBvbmVycm9yIGluc3RlYWRcbiAgICAgICAgLy8gV2l0aCBvbmUgZXhjZXB0aW9uOiByZXF1ZXN0IHRoYXQgdXNpbmcgZmlsZTogcHJvdG9jb2wsIG1vc3QgYnJvd3NlcnNcbiAgICAgICAgLy8gd2lsbCByZXR1cm4gc3RhdHVzIGFzIDAgZXZlbiB0aG91Z2ggaXQncyBhIHN1Y2Nlc3NmdWwgcmVxdWVzdFxuICAgICAgICBpZiAocmVxdWVzdC5zdGF0dXMgPT09IDAgJiYgIShyZXF1ZXN0LnJlc3BvbnNlVVJMICYmIHJlcXVlc3QucmVzcG9uc2VVUkwuaW5kZXhPZignZmlsZTonKSA9PT0gMCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmVhZHlzdGF0ZSBoYW5kbGVyIGlzIGNhbGxpbmcgYmVmb3JlIG9uZXJyb3Igb3Igb250aW1lb3V0IGhhbmRsZXJzLFxuICAgICAgICAvLyBzbyB3ZSBzaG91bGQgY2FsbCBvbmxvYWRlbmQgb24gdGhlIG5leHQgJ3RpY2snXG4gICAgICAgIHNldFRpbWVvdXQob25sb2FkZW5kKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIGJyb3dzZXIgcmVxdWVzdCBjYW5jZWxsYXRpb24gKGFzIG9wcG9zZWQgdG8gYSBtYW51YWwgY2FuY2VsbGF0aW9uKVxuICAgIHJlcXVlc3Qub25hYm9ydCA9IGZ1bmN0aW9uIGhhbmRsZUFib3J0KCkge1xuICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCdSZXF1ZXN0IGFib3J0ZWQnLCBjb25maWcsICdFQ09OTkFCT1JURUQnLCByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgbG93IGxldmVsIG5ldHdvcmsgZXJyb3JzXG4gICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24gaGFuZGxlRXJyb3IoKSB7XG4gICAgICAvLyBSZWFsIGVycm9ycyBhcmUgaGlkZGVuIGZyb20gdXMgYnkgdGhlIGJyb3dzZXJcbiAgICAgIC8vIG9uZXJyb3Igc2hvdWxkIG9ubHkgZmlyZSBpZiBpdCdzIGEgbmV0d29yayBlcnJvclxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCdOZXR3b3JrIEVycm9yJywgY29uZmlnLCBudWxsLCByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgdGltZW91dFxuICAgIHJlcXVlc3Qub250aW1lb3V0ID0gZnVuY3Rpb24gaGFuZGxlVGltZW91dCgpIHtcbiAgICAgIHZhciB0aW1lb3V0RXJyb3JNZXNzYWdlID0gY29uZmlnLnRpbWVvdXQgPyAndGltZW91dCBvZiAnICsgY29uZmlnLnRpbWVvdXQgKyAnbXMgZXhjZWVkZWQnIDogJ3RpbWVvdXQgZXhjZWVkZWQnO1xuICAgICAgdmFyIHRyYW5zaXRpb25hbCA9IGNvbmZpZy50cmFuc2l0aW9uYWwgfHwgZGVmYXVsdHMudHJhbnNpdGlvbmFsO1xuICAgICAgaWYgKGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlKSB7XG4gICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSBjb25maWcudGltZW91dEVycm9yTWVzc2FnZTtcbiAgICAgIH1cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcihcbiAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZSxcbiAgICAgICAgY29uZmlnLFxuICAgICAgICB0cmFuc2l0aW9uYWwuY2xhcmlmeVRpbWVvdXRFcnJvciA/ICdFVElNRURPVVQnIDogJ0VDT05OQUJPUlRFRCcsXG4gICAgICAgIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgIC8vIFRoaXMgaXMgb25seSBkb25lIGlmIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50LlxuICAgIC8vIFNwZWNpZmljYWxseSBub3QgaWYgd2UncmUgaW4gYSB3ZWIgd29ya2VyLCBvciByZWFjdC1uYXRpdmUuXG4gICAgaWYgKHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkpIHtcbiAgICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgICAgdmFyIHhzcmZWYWx1ZSA9IChjb25maWcud2l0aENyZWRlbnRpYWxzIHx8IGlzVVJMU2FtZU9yaWdpbihmdWxsUGF0aCkpICYmIGNvbmZpZy54c3JmQ29va2llTmFtZSA/XG4gICAgICAgIGNvb2tpZXMucmVhZChjb25maWcueHNyZkNvb2tpZU5hbWUpIDpcbiAgICAgICAgdW5kZWZpbmVkO1xuXG4gICAgICBpZiAoeHNyZlZhbHVlKSB7XG4gICAgICAgIHJlcXVlc3RIZWFkZXJzW2NvbmZpZy54c3JmSGVhZGVyTmFtZV0gPSB4c3JmVmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWRkIGhlYWRlcnMgdG8gdGhlIHJlcXVlc3RcbiAgICBpZiAoJ3NldFJlcXVlc3RIZWFkZXInIGluIHJlcXVlc3QpIHtcbiAgICAgIHV0aWxzLmZvckVhY2gocmVxdWVzdEhlYWRlcnMsIGZ1bmN0aW9uIHNldFJlcXVlc3RIZWFkZXIodmFsLCBrZXkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiByZXF1ZXN0RGF0YSA9PT0gJ3VuZGVmaW5lZCcgJiYga2V5LnRvTG93ZXJDYXNlKCkgPT09ICdjb250ZW50LXR5cGUnKSB7XG4gICAgICAgICAgLy8gUmVtb3ZlIENvbnRlbnQtVHlwZSBpZiBkYXRhIGlzIHVuZGVmaW5lZFxuICAgICAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1trZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE90aGVyd2lzZSBhZGQgaGVhZGVyIHRvIHRoZSByZXF1ZXN0XG4gICAgICAgICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgdmFsKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQWRkIHdpdGhDcmVkZW50aWFscyB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnLndpdGhDcmVkZW50aWFscykpIHtcbiAgICAgIHJlcXVlc3Qud2l0aENyZWRlbnRpYWxzID0gISFjb25maWcud2l0aENyZWRlbnRpYWxzO1xuICAgIH1cblxuICAgIC8vIEFkZCByZXNwb25zZVR5cGUgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAocmVzcG9uc2VUeXBlICYmIHJlc3BvbnNlVHlwZSAhPT0gJ2pzb24nKSB7XG4gICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9IGNvbmZpZy5yZXNwb25zZVR5cGU7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHByb2dyZXNzIGlmIG5lZWRlZFxuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIC8vIE5vdCBhbGwgYnJvd3NlcnMgc3VwcG9ydCB1cGxvYWQgZXZlbnRzXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25VcGxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJyAmJiByZXF1ZXN0LnVwbG9hZCkge1xuICAgICAgcmVxdWVzdC51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25VcGxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbiB8fCBjb25maWcuc2lnbmFsKSB7XG4gICAgICAvLyBIYW5kbGUgY2FuY2VsbGF0aW9uXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuICAgICAgb25DYW5jZWxlZCA9IGZ1bmN0aW9uKGNhbmNlbCkge1xuICAgICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmVqZWN0KCFjYW5jZWwgfHwgKGNhbmNlbCAmJiBjYW5jZWwudHlwZSkgPyBuZXcgQ2FuY2VsKCdjYW5jZWxlZCcpIDogY2FuY2VsKTtcbiAgICAgICAgcmVxdWVzdC5hYm9ydCgpO1xuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH07XG5cbiAgICAgIGNvbmZpZy5jYW5jZWxUb2tlbiAmJiBjb25maWcuY2FuY2VsVG9rZW4uc3Vic2NyaWJlKG9uQ2FuY2VsZWQpO1xuICAgICAgaWYgKGNvbmZpZy5zaWduYWwpIHtcbiAgICAgICAgY29uZmlnLnNpZ25hbC5hYm9ydGVkID8gb25DYW5jZWxlZCgpIDogY29uZmlnLnNpZ25hbC5hZGRFdmVudExpc3RlbmVyKCdhYm9ydCcsIG9uQ2FuY2VsZWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghcmVxdWVzdERhdGEpIHtcbiAgICAgIHJlcXVlc3REYXRhID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBTZW5kIHRoZSByZXF1ZXN0XG4gICAgcmVxdWVzdC5zZW5kKHJlcXVlc3REYXRhKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG52YXIgQXhpb3MgPSByZXF1aXJlKCcuL2NvcmUvQXhpb3MnKTtcbnZhciBtZXJnZUNvbmZpZyA9IHJlcXVpcmUoJy4vY29yZS9tZXJnZUNvbmZpZycpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkZWZhdWx0Q29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKiBAcmV0dXJuIHtBeGlvc30gQSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqL1xuZnVuY3Rpb24gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdENvbmZpZykge1xuICB2YXIgY29udGV4dCA9IG5ldyBBeGlvcyhkZWZhdWx0Q29uZmlnKTtcbiAgdmFyIGluc3RhbmNlID0gYmluZChBeGlvcy5wcm90b3R5cGUucmVxdWVzdCwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBheGlvcy5wcm90b3R5cGUgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBBeGlvcy5wcm90b3R5cGUsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgY29udGV4dCB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIGNvbnRleHQpO1xuXG4gIC8vIEZhY3RvcnkgZm9yIGNyZWF0aW5nIG5ldyBpbnN0YW5jZXNcbiAgaW5zdGFuY2UuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKGluc3RhbmNlQ29uZmlnKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUluc3RhbmNlKG1lcmdlQ29uZmlnKGRlZmF1bHRDb25maWcsIGluc3RhbmNlQ29uZmlnKSk7XG4gIH07XG5cbiAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG4vLyBDcmVhdGUgdGhlIGRlZmF1bHQgaW5zdGFuY2UgdG8gYmUgZXhwb3J0ZWRcbnZhciBheGlvcyA9IGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRzKTtcblxuLy8gRXhwb3NlIEF4aW9zIGNsYXNzIHRvIGFsbG93IGNsYXNzIGluaGVyaXRhbmNlXG5heGlvcy5BeGlvcyA9IEF4aW9zO1xuXG4vLyBFeHBvc2UgQ2FuY2VsICYgQ2FuY2VsVG9rZW5cbmF4aW9zLkNhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbCcpO1xuYXhpb3MuQ2FuY2VsVG9rZW4gPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWxUb2tlbicpO1xuYXhpb3MuaXNDYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9pc0NhbmNlbCcpO1xuYXhpb3MuVkVSU0lPTiA9IHJlcXVpcmUoJy4vZW52L2RhdGEnKS52ZXJzaW9uO1xuXG4vLyBFeHBvc2UgYWxsL3NwcmVhZFxuYXhpb3MuYWxsID0gZnVuY3Rpb24gYWxsKHByb21pc2VzKSB7XG4gIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XG59O1xuYXhpb3Muc3ByZWFkID0gcmVxdWlyZSgnLi9oZWxwZXJzL3NwcmVhZCcpO1xuXG4vLyBFeHBvc2UgaXNBeGlvc0Vycm9yXG5heGlvcy5pc0F4aW9zRXJyb3IgPSByZXF1aXJlKCcuL2hlbHBlcnMvaXNBeGlvc0Vycm9yJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gYXhpb3M7XG5cbi8vIEFsbG93IHVzZSBvZiBkZWZhdWx0IGltcG9ydCBzeW50YXggaW4gVHlwZVNjcmlwdFxubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGF4aW9zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEEgYENhbmNlbGAgaXMgYW4gb2JqZWN0IHRoYXQgaXMgdGhyb3duIHdoZW4gYW4gb3BlcmF0aW9uIGlzIGNhbmNlbGVkLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtzdHJpbmc9fSBtZXNzYWdlIFRoZSBtZXNzYWdlLlxuICovXG5mdW5jdGlvbiBDYW5jZWwobWVzc2FnZSkge1xuICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xufVxuXG5DYW5jZWwucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gIHJldHVybiAnQ2FuY2VsJyArICh0aGlzLm1lc3NhZ2UgPyAnOiAnICsgdGhpcy5tZXNzYWdlIDogJycpO1xufTtcblxuQ2FuY2VsLnByb3RvdHlwZS5fX0NBTkNFTF9fID0gdHJ1ZTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWw7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDYW5jZWwgPSByZXF1aXJlKCcuL0NhbmNlbCcpO1xuXG4vKipcbiAqIEEgYENhbmNlbFRva2VuYCBpcyBhbiBvYmplY3QgdGhhdCBjYW4gYmUgdXNlZCB0byByZXF1ZXN0IGNhbmNlbGxhdGlvbiBvZiBhbiBvcGVyYXRpb24uXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBleGVjdXRvciBUaGUgZXhlY3V0b3IgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIENhbmNlbFRva2VuKGV4ZWN1dG9yKSB7XG4gIGlmICh0eXBlb2YgZXhlY3V0b3IgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdleGVjdXRvciBtdXN0IGJlIGEgZnVuY3Rpb24uJyk7XG4gIH1cblxuICB2YXIgcmVzb2x2ZVByb21pc2U7XG5cbiAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gcHJvbWlzZUV4ZWN1dG9yKHJlc29sdmUpIHtcbiAgICByZXNvbHZlUHJvbWlzZSA9IHJlc29sdmU7XG4gIH0pO1xuXG4gIHZhciB0b2tlbiA9IHRoaXM7XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcbiAgdGhpcy5wcm9taXNlLnRoZW4oZnVuY3Rpb24oY2FuY2VsKSB7XG4gICAgaWYgKCF0b2tlbi5fbGlzdGVuZXJzKSByZXR1cm47XG5cbiAgICB2YXIgaTtcbiAgICB2YXIgbCA9IHRva2VuLl9saXN0ZW5lcnMubGVuZ3RoO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgdG9rZW4uX2xpc3RlbmVyc1tpXShjYW5jZWwpO1xuICAgIH1cbiAgICB0b2tlbi5fbGlzdGVuZXJzID0gbnVsbDtcbiAgfSk7XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcbiAgdGhpcy5wcm9taXNlLnRoZW4gPSBmdW5jdGlvbihvbmZ1bGZpbGxlZCkge1xuICAgIHZhciBfcmVzb2x2ZTtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgICAgdG9rZW4uc3Vic2NyaWJlKHJlc29sdmUpO1xuICAgICAgX3Jlc29sdmUgPSByZXNvbHZlO1xuICAgIH0pLnRoZW4ob25mdWxmaWxsZWQpO1xuXG4gICAgcHJvbWlzZS5jYW5jZWwgPSBmdW5jdGlvbiByZWplY3QoKSB7XG4gICAgICB0b2tlbi51bnN1YnNjcmliZShfcmVzb2x2ZSk7XG4gICAgfTtcblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9O1xuXG4gIGV4ZWN1dG9yKGZ1bmN0aW9uIGNhbmNlbChtZXNzYWdlKSB7XG4gICAgaWYgKHRva2VuLnJlYXNvbikge1xuICAgICAgLy8gQ2FuY2VsbGF0aW9uIGhhcyBhbHJlYWR5IGJlZW4gcmVxdWVzdGVkXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdG9rZW4ucmVhc29uID0gbmV3IENhbmNlbChtZXNzYWdlKTtcbiAgICByZXNvbHZlUHJvbWlzZSh0b2tlbi5yZWFzb24pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBUaHJvd3MgYSBgQ2FuY2VsYCBpZiBjYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLlxuICovXG5DYW5jZWxUb2tlbi5wcm90b3R5cGUudGhyb3dJZlJlcXVlc3RlZCA9IGZ1bmN0aW9uIHRocm93SWZSZXF1ZXN0ZWQoKSB7XG4gIGlmICh0aGlzLnJlYXNvbikge1xuICAgIHRocm93IHRoaXMucmVhc29uO1xuICB9XG59O1xuXG4vKipcbiAqIFN1YnNjcmliZSB0byB0aGUgY2FuY2VsIHNpZ25hbFxuICovXG5cbkNhbmNlbFRva2VuLnByb3RvdHlwZS5zdWJzY3JpYmUgPSBmdW5jdGlvbiBzdWJzY3JpYmUobGlzdGVuZXIpIHtcbiAgaWYgKHRoaXMucmVhc29uKSB7XG4gICAgbGlzdGVuZXIodGhpcy5yZWFzb24pO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICh0aGlzLl9saXN0ZW5lcnMpIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fbGlzdGVuZXJzID0gW2xpc3RlbmVyXTtcbiAgfVxufTtcblxuLyoqXG4gKiBVbnN1YnNjcmliZSBmcm9tIHRoZSBjYW5jZWwgc2lnbmFsXG4gKi9cblxuQ2FuY2VsVG9rZW4ucHJvdG90eXBlLnVuc3Vic2NyaWJlID0gZnVuY3Rpb24gdW5zdWJzY3JpYmUobGlzdGVuZXIpIHtcbiAgaWYgKCF0aGlzLl9saXN0ZW5lcnMpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGluZGV4ID0gdGhpcy5fbGlzdGVuZXJzLmluZGV4T2YobGlzdGVuZXIpO1xuICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgdGhpcy5fbGlzdGVuZXJzLnNwbGljZShpbmRleCwgMSk7XG4gIH1cbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3QgdGhhdCBjb250YWlucyBhIG5ldyBgQ2FuY2VsVG9rZW5gIGFuZCBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLFxuICogY2FuY2VscyB0aGUgYENhbmNlbFRva2VuYC5cbiAqL1xuQ2FuY2VsVG9rZW4uc291cmNlID0gZnVuY3Rpb24gc291cmNlKCkge1xuICB2YXIgY2FuY2VsO1xuICB2YXIgdG9rZW4gPSBuZXcgQ2FuY2VsVG9rZW4oZnVuY3Rpb24gZXhlY3V0b3IoYykge1xuICAgIGNhbmNlbCA9IGM7XG4gIH0pO1xuICByZXR1cm4ge1xuICAgIHRva2VuOiB0b2tlbixcbiAgICBjYW5jZWw6IGNhbmNlbFxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWxUb2tlbjtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0NhbmNlbCh2YWx1ZSkge1xuICByZXR1cm4gISEodmFsdWUgJiYgdmFsdWUuX19DQU5DRUxfXyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgSW50ZXJjZXB0b3JNYW5hZ2VyID0gcmVxdWlyZSgnLi9JbnRlcmNlcHRvck1hbmFnZXInKTtcbnZhciBkaXNwYXRjaFJlcXVlc3QgPSByZXF1aXJlKCcuL2Rpc3BhdGNoUmVxdWVzdCcpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9tZXJnZUNvbmZpZycpO1xudmFyIHZhbGlkYXRvciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvdmFsaWRhdG9yJyk7XG5cbnZhciB2YWxpZGF0b3JzID0gdmFsaWRhdG9yLnZhbGlkYXRvcnM7XG4vKipcbiAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBpbnN0YW5jZUNvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBBeGlvcyhpbnN0YW5jZUNvbmZpZykge1xuICB0aGlzLmRlZmF1bHRzID0gaW5zdGFuY2VDb25maWc7XG4gIHRoaXMuaW50ZXJjZXB0b3JzID0ge1xuICAgIHJlcXVlc3Q6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKSxcbiAgICByZXNwb25zZTogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpXG4gIH07XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHNwZWNpZmljIGZvciB0aGlzIHJlcXVlc3QgKG1lcmdlZCB3aXRoIHRoaXMuZGVmYXVsdHMpXG4gKi9cbkF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24gcmVxdWVzdChjb25maWcpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIC8vIEFsbG93IGZvciBheGlvcygnZXhhbXBsZS91cmwnWywgY29uZmlnXSkgYSBsYSBmZXRjaCBBUElcbiAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgY29uZmlnID0gYXJndW1lbnRzWzFdIHx8IHt9O1xuICAgIGNvbmZpZy51cmwgPSBhcmd1bWVudHNbMF07XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICB9XG5cbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcblxuICAvLyBTZXQgY29uZmlnLm1ldGhvZFxuICBpZiAoY29uZmlnLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSBjb25maWcubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSBpZiAodGhpcy5kZWZhdWx0cy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gdGhpcy5kZWZhdWx0cy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcubWV0aG9kID0gJ2dldCc7XG4gIH1cblxuICB2YXIgdHJhbnNpdGlvbmFsID0gY29uZmlnLnRyYW5zaXRpb25hbDtcblxuICBpZiAodHJhbnNpdGlvbmFsICE9PSB1bmRlZmluZWQpIHtcbiAgICB2YWxpZGF0b3IuYXNzZXJ0T3B0aW9ucyh0cmFuc2l0aW9uYWwsIHtcbiAgICAgIHNpbGVudEpTT05QYXJzaW5nOiB2YWxpZGF0b3JzLnRyYW5zaXRpb25hbCh2YWxpZGF0b3JzLmJvb2xlYW4pLFxuICAgICAgZm9yY2VkSlNPTlBhcnNpbmc6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbiksXG4gICAgICBjbGFyaWZ5VGltZW91dEVycm9yOiB2YWxpZGF0b3JzLnRyYW5zaXRpb25hbCh2YWxpZGF0b3JzLmJvb2xlYW4pXG4gICAgfSwgZmFsc2UpO1xuICB9XG5cbiAgLy8gZmlsdGVyIG91dCBza2lwcGVkIGludGVyY2VwdG9yc1xuICB2YXIgcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4gPSBbXTtcbiAgdmFyIHN5bmNocm9ub3VzUmVxdWVzdEludGVyY2VwdG9ycyA9IHRydWU7XG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlcXVlc3QuZm9yRWFjaChmdW5jdGlvbiB1bnNoaWZ0UmVxdWVzdEludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIGlmICh0eXBlb2YgaW50ZXJjZXB0b3IucnVuV2hlbiA9PT0gJ2Z1bmN0aW9uJyAmJiBpbnRlcmNlcHRvci5ydW5XaGVuKGNvbmZpZykgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzID0gc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzICYmIGludGVyY2VwdG9yLnN5bmNocm9ub3VzO1xuXG4gICAgcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4udW5zaGlmdChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgdmFyIHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbiA9IFtdO1xuICB0aGlzLmludGVyY2VwdG9ycy5yZXNwb25zZS5mb3JFYWNoKGZ1bmN0aW9uIHB1c2hSZXNwb25zZUludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbi5wdXNoKGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB2YXIgcHJvbWlzZTtcblxuICBpZiAoIXN5bmNocm9ub3VzUmVxdWVzdEludGVyY2VwdG9ycykge1xuICAgIHZhciBjaGFpbiA9IFtkaXNwYXRjaFJlcXVlc3QsIHVuZGVmaW5lZF07XG5cbiAgICBBcnJheS5wcm90b3R5cGUudW5zaGlmdC5hcHBseShjaGFpbiwgcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4pO1xuICAgIGNoYWluID0gY2hhaW4uY29uY2F0KHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbik7XG5cbiAgICBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKGNvbmZpZyk7XG4gICAgd2hpbGUgKGNoYWluLmxlbmd0aCkge1xuICAgICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihjaGFpbi5zaGlmdCgpLCBjaGFpbi5zaGlmdCgpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG5cbiAgdmFyIG5ld0NvbmZpZyA9IGNvbmZpZztcbiAgd2hpbGUgKHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLmxlbmd0aCkge1xuICAgIHZhciBvbkZ1bGZpbGxlZCA9IHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCk7XG4gICAgdmFyIG9uUmVqZWN0ZWQgPSByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi5zaGlmdCgpO1xuICAgIHRyeSB7XG4gICAgICBuZXdDb25maWcgPSBvbkZ1bGZpbGxlZChuZXdDb25maWcpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBvblJlamVjdGVkKGVycm9yKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHRyeSB7XG4gICAgcHJvbWlzZSA9IGRpc3BhdGNoUmVxdWVzdChuZXdDb25maWcpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG4gIH1cblxuICB3aGlsZSAocmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLmxlbmd0aCkge1xuICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4ocmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCksIHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbi5zaGlmdCgpKTtcbiAgfVxuXG4gIHJldHVybiBwcm9taXNlO1xufTtcblxuQXhpb3MucHJvdG90eXBlLmdldFVyaSA9IGZ1bmN0aW9uIGdldFVyaShjb25maWcpIHtcbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcbiAgcmV0dXJuIGJ1aWxkVVJMKGNvbmZpZy51cmwsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKS5yZXBsYWNlKC9eXFw/LywgJycpO1xufTtcblxuLy8gUHJvdmlkZSBhbGlhc2VzIGZvciBzdXBwb3J0ZWQgcmVxdWVzdCBtZXRob2RzXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ29wdGlvbnMnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogKGNvbmZpZyB8fCB7fSkuZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiBkYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gSW50ZXJjZXB0b3JNYW5hZ2VyKCkge1xuICB0aGlzLmhhbmRsZXJzID0gW107XG59XG5cbi8qKlxuICogQWRkIGEgbmV3IGludGVyY2VwdG9yIHRvIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bGZpbGxlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGB0aGVuYCBmb3IgYSBgUHJvbWlzZWBcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHJlamVjdGAgZm9yIGEgYFByb21pc2VgXG4gKlxuICogQHJldHVybiB7TnVtYmVyfSBBbiBJRCB1c2VkIHRvIHJlbW92ZSBpbnRlcmNlcHRvciBsYXRlclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uIHVzZShmdWxmaWxsZWQsIHJlamVjdGVkLCBvcHRpb25zKSB7XG4gIHRoaXMuaGFuZGxlcnMucHVzaCh7XG4gICAgZnVsZmlsbGVkOiBmdWxmaWxsZWQsXG4gICAgcmVqZWN0ZWQ6IHJlamVjdGVkLFxuICAgIHN5bmNocm9ub3VzOiBvcHRpb25zID8gb3B0aW9ucy5zeW5jaHJvbm91cyA6IGZhbHNlLFxuICAgIHJ1bldoZW46IG9wdGlvbnMgPyBvcHRpb25zLnJ1bldoZW4gOiBudWxsXG4gIH0pO1xuICByZXR1cm4gdGhpcy5oYW5kbGVycy5sZW5ndGggLSAxO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYW4gaW50ZXJjZXB0b3IgZnJvbSB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaWQgVGhlIElEIHRoYXQgd2FzIHJldHVybmVkIGJ5IGB1c2VgXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZWplY3QgPSBmdW5jdGlvbiBlamVjdChpZCkge1xuICBpZiAodGhpcy5oYW5kbGVyc1tpZF0pIHtcbiAgICB0aGlzLmhhbmRsZXJzW2lkXSA9IG51bGw7XG4gIH1cbn07XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFsbCB0aGUgcmVnaXN0ZXJlZCBpbnRlcmNlcHRvcnNcbiAqXG4gKiBUaGlzIG1ldGhvZCBpcyBwYXJ0aWN1bGFybHkgdXNlZnVsIGZvciBza2lwcGluZyBvdmVyIGFueVxuICogaW50ZXJjZXB0b3JzIHRoYXQgbWF5IGhhdmUgYmVjb21lIGBudWxsYCBjYWxsaW5nIGBlamVjdGAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggaW50ZXJjZXB0b3JcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gZm9yRWFjaChmbikge1xuICB1dGlscy5mb3JFYWNoKHRoaXMuaGFuZGxlcnMsIGZ1bmN0aW9uIGZvckVhY2hIYW5kbGVyKGgpIHtcbiAgICBpZiAoaCAhPT0gbnVsbCkge1xuICAgICAgZm4oaCk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJjZXB0b3JNYW5hZ2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaXNBYnNvbHV0ZVVSTCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTCcpO1xudmFyIGNvbWJpbmVVUkxzID0gcmVxdWlyZSgnLi4vaGVscGVycy9jb21iaW5lVVJMcycpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgVVJMIGJ5IGNvbWJpbmluZyB0aGUgYmFzZVVSTCB3aXRoIHRoZSByZXF1ZXN0ZWRVUkwsXG4gKiBvbmx5IHdoZW4gdGhlIHJlcXVlc3RlZFVSTCBpcyBub3QgYWxyZWFkeSBhbiBhYnNvbHV0ZSBVUkwuXG4gKiBJZiB0aGUgcmVxdWVzdFVSTCBpcyBhYnNvbHV0ZSwgdGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSByZXF1ZXN0ZWRVUkwgdW50b3VjaGVkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlcXVlc3RlZFVSTCBBYnNvbHV0ZSBvciByZWxhdGl2ZSBVUkwgdG8gY29tYmluZVxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIGZ1bGwgcGF0aFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkRnVsbFBhdGgoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKSB7XG4gIGlmIChiYXNlVVJMICYmICFpc0Fic29sdXRlVVJMKHJlcXVlc3RlZFVSTCkpIHtcbiAgICByZXR1cm4gY29tYmluZVVSTHMoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKTtcbiAgfVxuICByZXR1cm4gcmVxdWVzdGVkVVJMO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vZW5oYW5jZUVycm9yJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBtZXNzYWdlLCBjb25maWcsIGVycm9yIGNvZGUsIHJlcXVlc3QgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBjcmVhdGVkIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZUVycm9yKG1lc3NhZ2UsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgdmFyIGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICByZXR1cm4gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciB0cmFuc2Zvcm1EYXRhID0gcmVxdWlyZSgnLi90cmFuc2Zvcm1EYXRhJyk7XG52YXIgaXNDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvaXNDYW5jZWwnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4uL2RlZmF1bHRzJyk7XG52YXIgQ2FuY2VsID0gcmVxdWlyZSgnLi4vY2FuY2VsL0NhbmNlbCcpO1xuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbmZ1bmN0aW9uIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKSB7XG4gIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICBjb25maWcuY2FuY2VsVG9rZW4udGhyb3dJZlJlcXVlc3RlZCgpO1xuICB9XG5cbiAgaWYgKGNvbmZpZy5zaWduYWwgJiYgY29uZmlnLnNpZ25hbC5hYm9ydGVkKSB7XG4gICAgdGhyb3cgbmV3IENhbmNlbCgnY2FuY2VsZWQnKTtcbiAgfVxufVxuXG4vKipcbiAqIERpc3BhdGNoIGEgcmVxdWVzdCB0byB0aGUgc2VydmVyIHVzaW5nIHRoZSBjb25maWd1cmVkIGFkYXB0ZXIuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHRoYXQgaXMgdG8gYmUgdXNlZCBmb3IgdGhlIHJlcXVlc3RcbiAqIEByZXR1cm5zIHtQcm9taXNlfSBUaGUgUHJvbWlzZSB0byBiZSBmdWxmaWxsZWRcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkaXNwYXRjaFJlcXVlc3QoY29uZmlnKSB7XG4gIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAvLyBFbnN1cmUgaGVhZGVycyBleGlzdFxuICBjb25maWcuaGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzIHx8IHt9O1xuXG4gIC8vIFRyYW5zZm9ybSByZXF1ZXN0IGRhdGFcbiAgY29uZmlnLmRhdGEgPSB0cmFuc2Zvcm1EYXRhLmNhbGwoXG4gICAgY29uZmlnLFxuICAgIGNvbmZpZy5kYXRhLFxuICAgIGNvbmZpZy5oZWFkZXJzLFxuICAgIGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0XG4gICk7XG5cbiAgLy8gRmxhdHRlbiBoZWFkZXJzXG4gIGNvbmZpZy5oZWFkZXJzID0gdXRpbHMubWVyZ2UoXG4gICAgY29uZmlnLmhlYWRlcnMuY29tbW9uIHx8IHt9LFxuICAgIGNvbmZpZy5oZWFkZXJzW2NvbmZpZy5tZXRob2RdIHx8IHt9LFxuICAgIGNvbmZpZy5oZWFkZXJzXG4gICk7XG5cbiAgdXRpbHMuZm9yRWFjaChcbiAgICBbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCcsICdwb3N0JywgJ3B1dCcsICdwYXRjaCcsICdjb21tb24nXSxcbiAgICBmdW5jdGlvbiBjbGVhbkhlYWRlckNvbmZpZyhtZXRob2QpIHtcbiAgICAgIGRlbGV0ZSBjb25maWcuaGVhZGVyc1ttZXRob2RdO1xuICAgIH1cbiAgKTtcblxuICB2YXIgYWRhcHRlciA9IGNvbmZpZy5hZGFwdGVyIHx8IGRlZmF1bHRzLmFkYXB0ZXI7XG5cbiAgcmV0dXJuIGFkYXB0ZXIoY29uZmlnKS50aGVuKGZ1bmN0aW9uIG9uQWRhcHRlclJlc29sdXRpb24ocmVzcG9uc2UpIHtcbiAgICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgIHJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhLmNhbGwoXG4gICAgICBjb25maWcsXG4gICAgICByZXNwb25zZS5kYXRhLFxuICAgICAgcmVzcG9uc2UuaGVhZGVycyxcbiAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICk7XG5cbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH0sIGZ1bmN0aW9uIG9uQWRhcHRlclJlamVjdGlvbihyZWFzb24pIHtcbiAgICBpZiAoIWlzQ2FuY2VsKHJlYXNvbikpIHtcbiAgICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICAgIGlmIChyZWFzb24gJiYgcmVhc29uLnJlc3BvbnNlKSB7XG4gICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YS5jYWxsKFxuICAgICAgICAgIGNvbmZpZyxcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSxcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuaGVhZGVycyxcbiAgICAgICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QocmVhc29uKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFVwZGF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgY29uZmlnLCBlcnJvciBjb2RlLCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyb3IgVGhlIGVycm9yIHRvIHVwZGF0ZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3JlcXVlc3RdIFRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XG4gIGVycm9yLmNvbmZpZyA9IGNvbmZpZztcbiAgaWYgKGNvZGUpIHtcbiAgICBlcnJvci5jb2RlID0gY29kZTtcbiAgfVxuXG4gIGVycm9yLnJlcXVlc3QgPSByZXF1ZXN0O1xuICBlcnJvci5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICBlcnJvci5pc0F4aW9zRXJyb3IgPSB0cnVlO1xuXG4gIGVycm9yLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gU3RhbmRhcmRcbiAgICAgIG1lc3NhZ2U6IHRoaXMubWVzc2FnZSxcbiAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgIC8vIE1pY3Jvc29mdFxuICAgICAgZGVzY3JpcHRpb246IHRoaXMuZGVzY3JpcHRpb24sXG4gICAgICBudW1iZXI6IHRoaXMubnVtYmVyLFxuICAgICAgLy8gTW96aWxsYVxuICAgICAgZmlsZU5hbWU6IHRoaXMuZmlsZU5hbWUsXG4gICAgICBsaW5lTnVtYmVyOiB0aGlzLmxpbmVOdW1iZXIsXG4gICAgICBjb2x1bW5OdW1iZXI6IHRoaXMuY29sdW1uTnVtYmVyLFxuICAgICAgc3RhY2s6IHRoaXMuc3RhY2ssXG4gICAgICAvLyBBeGlvc1xuICAgICAgY29uZmlnOiB0aGlzLmNvbmZpZyxcbiAgICAgIGNvZGU6IHRoaXMuY29kZSxcbiAgICAgIHN0YXR1czogdGhpcy5yZXNwb25zZSAmJiB0aGlzLnJlc3BvbnNlLnN0YXR1cyA/IHRoaXMucmVzcG9uc2Uuc3RhdHVzIDogbnVsbFxuICAgIH07XG4gIH07XG4gIHJldHVybiBlcnJvcjtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbi8qKlxuICogQ29uZmlnLXNwZWNpZmljIG1lcmdlLWZ1bmN0aW9uIHdoaWNoIGNyZWF0ZXMgYSBuZXcgY29uZmlnLW9iamVjdFxuICogYnkgbWVyZ2luZyB0d28gY29uZmlndXJhdGlvbiBvYmplY3RzIHRvZ2V0aGVyLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcxXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnMlxuICogQHJldHVybnMge09iamVjdH0gTmV3IG9iamVjdCByZXN1bHRpbmcgZnJvbSBtZXJnaW5nIGNvbmZpZzIgdG8gY29uZmlnMVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1lcmdlQ29uZmlnKGNvbmZpZzEsIGNvbmZpZzIpIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gIGNvbmZpZzIgPSBjb25maWcyIHx8IHt9O1xuICB2YXIgY29uZmlnID0ge307XG5cbiAgZnVuY3Rpb24gZ2V0TWVyZ2VkVmFsdWUodGFyZ2V0LCBzb3VyY2UpIHtcbiAgICBpZiAodXRpbHMuaXNQbGFpbk9iamVjdCh0YXJnZXQpICYmIHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHRhcmdldCwgc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHt9LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNBcnJheShzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gc291cmNlLnNsaWNlKCk7XG4gICAgfVxuICAgIHJldHVybiBzb3VyY2U7XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29uc2lzdGVudC1yZXR1cm5cbiAgZnVuY3Rpb24gbWVyZ2VEZWVwUHJvcGVydGllcyhwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKGNvbmZpZzFbcHJvcF0sIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29uc2lzdGVudC1yZXR1cm5cbiAgZnVuY3Rpb24gdmFsdWVGcm9tQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfVxuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNvbnNpc3RlbnQtcmV0dXJuXG4gIGZ1bmN0aW9uIGRlZmF1bHRUb0NvbmZpZzIocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29uc2lzdGVudC1yZXR1cm5cbiAgZnVuY3Rpb24gbWVyZ2VEaXJlY3RLZXlzKHByb3ApIHtcbiAgICBpZiAocHJvcCBpbiBjb25maWcyKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmIChwcm9wIGluIGNvbmZpZzEpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIHZhciBtZXJnZU1hcCA9IHtcbiAgICAndXJsJzogdmFsdWVGcm9tQ29uZmlnMixcbiAgICAnbWV0aG9kJzogdmFsdWVGcm9tQ29uZmlnMixcbiAgICAnZGF0YSc6IHZhbHVlRnJvbUNvbmZpZzIsXG4gICAgJ2Jhc2VVUkwnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd0cmFuc2Zvcm1SZXF1ZXN0JzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAndHJhbnNmb3JtUmVzcG9uc2UnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdwYXJhbXNTZXJpYWxpemVyJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAndGltZW91dCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3RpbWVvdXRNZXNzYWdlJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnd2l0aENyZWRlbnRpYWxzJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnYWRhcHRlcic6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3Jlc3BvbnNlVHlwZSc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3hzcmZDb29raWVOYW1lJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAneHNyZkhlYWRlck5hbWUnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdvblVwbG9hZFByb2dyZXNzJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnb25Eb3dubG9hZFByb2dyZXNzJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnZGVjb21wcmVzcyc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ21heENvbnRlbnRMZW5ndGgnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdtYXhCb2R5TGVuZ3RoJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAndHJhbnNwb3J0JzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnaHR0cEFnZW50JzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnaHR0cHNBZ2VudCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ2NhbmNlbFRva2VuJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnc29ja2V0UGF0aCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3Jlc3BvbnNlRW5jb2RpbmcnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd2YWxpZGF0ZVN0YXR1cyc6IG1lcmdlRGlyZWN0S2V5c1xuICB9O1xuXG4gIHV0aWxzLmZvckVhY2goT2JqZWN0LmtleXMoY29uZmlnMSkuY29uY2F0KE9iamVjdC5rZXlzKGNvbmZpZzIpKSwgZnVuY3Rpb24gY29tcHV0ZUNvbmZpZ1ZhbHVlKHByb3ApIHtcbiAgICB2YXIgbWVyZ2UgPSBtZXJnZU1hcFtwcm9wXSB8fCBtZXJnZURlZXBQcm9wZXJ0aWVzO1xuICAgIHZhciBjb25maWdWYWx1ZSA9IG1lcmdlKHByb3ApO1xuICAgICh1dGlscy5pc1VuZGVmaW5lZChjb25maWdWYWx1ZSkgJiYgbWVyZ2UgIT09IG1lcmdlRGlyZWN0S2V5cykgfHwgKGNvbmZpZ1twcm9wXSA9IGNvbmZpZ1ZhbHVlKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGNvbmZpZztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4vY3JlYXRlRXJyb3InKTtcblxuLyoqXG4gKiBSZXNvbHZlIG9yIHJlamVjdCBhIFByb21pc2UgYmFzZWQgb24gcmVzcG9uc2Ugc3RhdHVzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlc29sdmUgQSBmdW5jdGlvbiB0aGF0IHJlc29sdmVzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0IEEgZnVuY3Rpb24gdGhhdCByZWplY3RzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIFRoZSByZXNwb25zZS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSkge1xuICB2YXIgdmFsaWRhdGVTdGF0dXMgPSByZXNwb25zZS5jb25maWcudmFsaWRhdGVTdGF0dXM7XG4gIGlmICghcmVzcG9uc2Uuc3RhdHVzIHx8ICF2YWxpZGF0ZVN0YXR1cyB8fCB2YWxpZGF0ZVN0YXR1cyhyZXNwb25zZS5zdGF0dXMpKSB7XG4gICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gIH0gZWxzZSB7XG4gICAgcmVqZWN0KGNyZWF0ZUVycm9yKFxuICAgICAgJ1JlcXVlc3QgZmFpbGVkIHdpdGggc3RhdHVzIGNvZGUgJyArIHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgIHJlc3BvbnNlLmNvbmZpZyxcbiAgICAgIG51bGwsXG4gICAgICByZXNwb25zZS5yZXF1ZXN0LFxuICAgICAgcmVzcG9uc2VcbiAgICApKTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi8uLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIFRyYW5zZm9ybSB0aGUgZGF0YSBmb3IgYSByZXF1ZXN0IG9yIGEgcmVzcG9uc2VcbiAqXG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IGRhdGEgVGhlIGRhdGEgdG8gYmUgdHJhbnNmb3JtZWRcbiAqIEBwYXJhbSB7QXJyYXl9IGhlYWRlcnMgVGhlIGhlYWRlcnMgZm9yIHRoZSByZXF1ZXN0IG9yIHJlc3BvbnNlXG4gKiBAcGFyYW0ge0FycmF5fEZ1bmN0aW9ufSBmbnMgQSBzaW5nbGUgZnVuY3Rpb24gb3IgQXJyYXkgb2YgZnVuY3Rpb25zXG4gKiBAcmV0dXJucyB7Kn0gVGhlIHJlc3VsdGluZyB0cmFuc2Zvcm1lZCBkYXRhXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdHJhbnNmb3JtRGF0YShkYXRhLCBoZWFkZXJzLCBmbnMpIHtcbiAgdmFyIGNvbnRleHQgPSB0aGlzIHx8IGRlZmF1bHRzO1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgdXRpbHMuZm9yRWFjaChmbnMsIGZ1bmN0aW9uIHRyYW5zZm9ybShmbikge1xuICAgIGRhdGEgPSBmbi5jYWxsKGNvbnRleHQsIGRhdGEsIGhlYWRlcnMpO1xuICB9KTtcblxuICByZXR1cm4gZGF0YTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBub3JtYWxpemVIZWFkZXJOYW1lID0gcmVxdWlyZSgnLi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUnKTtcbnZhciBlbmhhbmNlRXJyb3IgPSByZXF1aXJlKCcuL2NvcmUvZW5oYW5jZUVycm9yJyk7XG5cbnZhciBERUZBVUxUX0NPTlRFTlRfVFlQRSA9IHtcbiAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG5mdW5jdGlvbiBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgdmFsdWUpIHtcbiAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzKSAmJiB1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzWydDb250ZW50LVR5cGUnXSkpIHtcbiAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IHZhbHVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldERlZmF1bHRBZGFwdGVyKCkge1xuICB2YXIgYWRhcHRlcjtcbiAgaWYgKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBGb3IgYnJvd3NlcnMgdXNlIFhIUiBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMveGhyJyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nKSB7XG4gICAgLy8gRm9yIG5vZGUgdXNlIEhUVFAgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL2h0dHAnKTtcbiAgfVxuICByZXR1cm4gYWRhcHRlcjtcbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5U2FmZWx5KHJhd1ZhbHVlLCBwYXJzZXIsIGVuY29kZXIpIHtcbiAgaWYgKHV0aWxzLmlzU3RyaW5nKHJhd1ZhbHVlKSkge1xuICAgIHRyeSB7XG4gICAgICAocGFyc2VyIHx8IEpTT04ucGFyc2UpKHJhd1ZhbHVlKTtcbiAgICAgIHJldHVybiB1dGlscy50cmltKHJhd1ZhbHVlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZS5uYW1lICE9PSAnU3ludGF4RXJyb3InKSB7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIChlbmNvZGVyIHx8IEpTT04uc3RyaW5naWZ5KShyYXdWYWx1ZSk7XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcblxuICB0cmFuc2l0aW9uYWw6IHtcbiAgICBzaWxlbnRKU09OUGFyc2luZzogdHJ1ZSxcbiAgICBmb3JjZWRKU09OUGFyc2luZzogdHJ1ZSxcbiAgICBjbGFyaWZ5VGltZW91dEVycm9yOiBmYWxzZVxuICB9LFxuXG4gIGFkYXB0ZXI6IGdldERlZmF1bHRBZGFwdGVyKCksXG5cbiAgdHJhbnNmb3JtUmVxdWVzdDogW2Z1bmN0aW9uIHRyYW5zZm9ybVJlcXVlc3QoZGF0YSwgaGVhZGVycykge1xuICAgIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgJ0FjY2VwdCcpO1xuICAgIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgJ0NvbnRlbnQtVHlwZScpO1xuXG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQXJyYXlCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQnVmZmVyKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc1N0cmVhbShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNGaWxlKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0Jsb2IoZGF0YSlcbiAgICApIHtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNBcnJheUJ1ZmZlclZpZXcoZGF0YSkpIHtcbiAgICAgIHJldHVybiBkYXRhLmJ1ZmZlcjtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKGRhdGEpKSB7XG4gICAgICBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PXV0Zi04Jyk7XG4gICAgICByZXR1cm4gZGF0YS50b1N0cmluZygpO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNPYmplY3QoZGF0YSkgfHwgKGhlYWRlcnMgJiYgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPT09ICdhcHBsaWNhdGlvbi9qc29uJykpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgcmV0dXJuIHN0cmluZ2lmeVNhZmVseShkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIHRyYW5zZm9ybVJlc3BvbnNlOiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVzcG9uc2UoZGF0YSkge1xuICAgIHZhciB0cmFuc2l0aW9uYWwgPSB0aGlzLnRyYW5zaXRpb25hbCB8fCBkZWZhdWx0cy50cmFuc2l0aW9uYWw7XG4gICAgdmFyIHNpbGVudEpTT05QYXJzaW5nID0gdHJhbnNpdGlvbmFsICYmIHRyYW5zaXRpb25hbC5zaWxlbnRKU09OUGFyc2luZztcbiAgICB2YXIgZm9yY2VkSlNPTlBhcnNpbmcgPSB0cmFuc2l0aW9uYWwgJiYgdHJhbnNpdGlvbmFsLmZvcmNlZEpTT05QYXJzaW5nO1xuICAgIHZhciBzdHJpY3RKU09OUGFyc2luZyA9ICFzaWxlbnRKU09OUGFyc2luZyAmJiB0aGlzLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nO1xuXG4gICAgaWYgKHN0cmljdEpTT05QYXJzaW5nIHx8IChmb3JjZWRKU09OUGFyc2luZyAmJiB1dGlscy5pc1N0cmluZyhkYXRhKSAmJiBkYXRhLmxlbmd0aCkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoc3RyaWN0SlNPTlBhcnNpbmcpIHtcbiAgICAgICAgICBpZiAoZS5uYW1lID09PSAnU3ludGF4RXJyb3InKSB7XG4gICAgICAgICAgICB0aHJvdyBlbmhhbmNlRXJyb3IoZSwgdGhpcywgJ0VfSlNPTl9QQVJTRScpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIC8qKlxuICAgKiBBIHRpbWVvdXQgaW4gbWlsbGlzZWNvbmRzIHRvIGFib3J0IGEgcmVxdWVzdC4gSWYgc2V0IHRvIDAgKGRlZmF1bHQpIGFcbiAgICogdGltZW91dCBpcyBub3QgY3JlYXRlZC5cbiAgICovXG4gIHRpbWVvdXQ6IDAsXG5cbiAgeHNyZkNvb2tpZU5hbWU6ICdYU1JGLVRPS0VOJyxcbiAgeHNyZkhlYWRlck5hbWU6ICdYLVhTUkYtVE9LRU4nLFxuXG4gIG1heENvbnRlbnRMZW5ndGg6IC0xLFxuICBtYXhCb2R5TGVuZ3RoOiAtMSxcblxuICB2YWxpZGF0ZVN0YXR1czogZnVuY3Rpb24gdmFsaWRhdGVTdGF0dXMoc3RhdHVzKSB7XG4gICAgcmV0dXJuIHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwO1xuICB9LFxuXG4gIGhlYWRlcnM6IHtcbiAgICBjb21tb246IHtcbiAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbiwgdGV4dC9wbGFpbiwgKi8qJ1xuICAgIH1cbiAgfVxufTtcblxudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB7fTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB1dGlscy5tZXJnZShERUZBVUxUX0NPTlRFTlRfVFlQRSk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBkZWZhdWx0cztcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBcInZlcnNpb25cIjogXCIwLjI0LjBcIlxufTsiLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYmluZChmbiwgdGhpc0FyZykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcCgpIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gZW5jb2RlKHZhbCkge1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHZhbCkuXG4gICAgcmVwbGFjZSgvJTNBL2dpLCAnOicpLlxuICAgIHJlcGxhY2UoLyUyNC9nLCAnJCcpLlxuICAgIHJlcGxhY2UoLyUyQy9naSwgJywnKS5cbiAgICByZXBsYWNlKC8lMjAvZywgJysnKS5cbiAgICByZXBsYWNlKC8lNUIvZ2ksICdbJykuXG4gICAgcmVwbGFjZSgvJTVEL2dpLCAnXScpO1xufVxuXG4vKipcbiAqIEJ1aWxkIGEgVVJMIGJ5IGFwcGVuZGluZyBwYXJhbXMgdG8gdGhlIGVuZFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIGJhc2Ugb2YgdGhlIHVybCAoZS5nLiwgaHR0cDovL3d3dy5nb29nbGUuY29tKVxuICogQHBhcmFtIHtvYmplY3R9IFtwYXJhbXNdIFRoZSBwYXJhbXMgdG8gYmUgYXBwZW5kZWRcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBmb3JtYXR0ZWQgdXJsXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRVUkwodXJsLCBwYXJhbXMsIHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIGlmICghcGFyYW1zKSB7XG4gICAgcmV0dXJuIHVybDtcbiAgfVxuXG4gIHZhciBzZXJpYWxpemVkUGFyYW1zO1xuICBpZiAocGFyYW1zU2VyaWFsaXplcikge1xuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJhbXNTZXJpYWxpemVyKHBhcmFtcyk7XG4gIH0gZWxzZSBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMocGFyYW1zKSkge1xuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJhbXMudG9TdHJpbmcoKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgcGFydHMgPSBbXTtcblxuICAgIHV0aWxzLmZvckVhY2gocGFyYW1zLCBmdW5jdGlvbiBzZXJpYWxpemUodmFsLCBrZXkpIHtcbiAgICAgIGlmICh2YWwgPT09IG51bGwgfHwgdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodXRpbHMuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgIGtleSA9IGtleSArICdbXSc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWwgPSBbdmFsXTtcbiAgICAgIH1cblxuICAgICAgdXRpbHMuZm9yRWFjaCh2YWwsIGZ1bmN0aW9uIHBhcnNlVmFsdWUodikge1xuICAgICAgICBpZiAodXRpbHMuaXNEYXRlKHYpKSB7XG4gICAgICAgICAgdiA9IHYudG9JU09TdHJpbmcoKTtcbiAgICAgICAgfSBlbHNlIGlmICh1dGlscy5pc09iamVjdCh2KSkge1xuICAgICAgICAgIHYgPSBKU09OLnN0cmluZ2lmeSh2KTtcbiAgICAgICAgfVxuICAgICAgICBwYXJ0cy5wdXNoKGVuY29kZShrZXkpICsgJz0nICsgZW5jb2RlKHYpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcnRzLmpvaW4oJyYnKTtcbiAgfVxuXG4gIGlmIChzZXJpYWxpemVkUGFyYW1zKSB7XG4gICAgdmFyIGhhc2htYXJrSW5kZXggPSB1cmwuaW5kZXhPZignIycpO1xuICAgIGlmIChoYXNobWFya0luZGV4ICE9PSAtMSkge1xuICAgICAgdXJsID0gdXJsLnNsaWNlKDAsIGhhc2htYXJrSW5kZXgpO1xuICAgIH1cblxuICAgIHVybCArPSAodXJsLmluZGV4T2YoJz8nKSA9PT0gLTEgPyAnPycgOiAnJicpICsgc2VyaWFsaXplZFBhcmFtcztcbiAgfVxuXG4gIHJldHVybiB1cmw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgVVJMIGJ5IGNvbWJpbmluZyB0aGUgc3BlY2lmaWVkIFVSTHNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVSTCBUaGUgYmFzZSBVUkxcbiAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGl2ZVVSTCBUaGUgcmVsYXRpdmUgVVJMXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tYmluZWQgVVJMXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29tYmluZVVSTHMoYmFzZVVSTCwgcmVsYXRpdmVVUkwpIHtcbiAgcmV0dXJuIHJlbGF0aXZlVVJMXG4gICAgPyBiYXNlVVJMLnJlcGxhY2UoL1xcLyskLywgJycpICsgJy8nICsgcmVsYXRpdmVVUkwucmVwbGFjZSgvXlxcLysvLCAnJylcbiAgICA6IGJhc2VVUkw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgc3VwcG9ydCBkb2N1bWVudC5jb29raWVcbiAgICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKG5hbWUsIHZhbHVlLCBleHBpcmVzLCBwYXRoLCBkb21haW4sIHNlY3VyZSkge1xuICAgICAgICAgIHZhciBjb29raWUgPSBbXTtcbiAgICAgICAgICBjb29raWUucHVzaChuYW1lICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSk7XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNOdW1iZXIoZXhwaXJlcykpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdleHBpcmVzPScgKyBuZXcgRGF0ZShleHBpcmVzKS50b0dNVFN0cmluZygpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNTdHJpbmcocGF0aCkpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdwYXRoPScgKyBwYXRoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNTdHJpbmcoZG9tYWluKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2RvbWFpbj0nICsgZG9tYWluKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc2VjdXJlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnc2VjdXJlJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZG9jdW1lbnQuY29va2llID0gY29va2llLmpvaW4oJzsgJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZChuYW1lKSB7XG4gICAgICAgICAgdmFyIG1hdGNoID0gZG9jdW1lbnQuY29va2llLm1hdGNoKG5ldyBSZWdFeHAoJyhefDtcXFxccyopKCcgKyBuYW1lICsgJyk9KFteO10qKScpKTtcbiAgICAgICAgICByZXR1cm4gKG1hdGNoID8gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzNdKSA6IG51bGwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKG5hbWUpIHtcbiAgICAgICAgICB0aGlzLndyaXRlKG5hbWUsICcnLCBEYXRlLm5vdygpIC0gODY0MDAwMDApO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudiAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKCkge30sXG4gICAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQoKSB7IHJldHVybiBudWxsOyB9LFxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHt9XG4gICAgICB9O1xuICAgIH0pKClcbik7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgVVJMIGlzIGFic29sdXRlXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgVVJMIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBzcGVjaWZpZWQgVVJMIGlzIGFic29sdXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0Fic29sdXRlVVJMKHVybCkge1xuICAvLyBBIFVSTCBpcyBjb25zaWRlcmVkIGFic29sdXRlIGlmIGl0IGJlZ2lucyB3aXRoIFwiPHNjaGVtZT46Ly9cIiBvciBcIi8vXCIgKHByb3RvY29sLXJlbGF0aXZlIFVSTCkuXG4gIC8vIFJGQyAzOTg2IGRlZmluZXMgc2NoZW1lIG5hbWUgYXMgYSBzZXF1ZW5jZSBvZiBjaGFyYWN0ZXJzIGJlZ2lubmluZyB3aXRoIGEgbGV0dGVyIGFuZCBmb2xsb3dlZFxuICAvLyBieSBhbnkgY29tYmluYXRpb24gb2YgbGV0dGVycywgZGlnaXRzLCBwbHVzLCBwZXJpb2QsIG9yIGh5cGhlbi5cbiAgcmV0dXJuIC9eKFthLXpdW2EtelxcZFxcK1xcLVxcLl0qOik/XFwvXFwvL2kudGVzdCh1cmwpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHBheWxvYWQgaXMgYW4gZXJyb3IgdGhyb3duIGJ5IEF4aW9zXG4gKlxuICogQHBhcmFtIHsqfSBwYXlsb2FkIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgcGF5bG9hZCBpcyBhbiBlcnJvciB0aHJvd24gYnkgQXhpb3MsIG90aGVyd2lzZSBmYWxzZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQXhpb3NFcnJvcihwYXlsb2FkKSB7XG4gIHJldHVybiAodHlwZW9mIHBheWxvYWQgPT09ICdvYmplY3QnKSAmJiAocGF5bG9hZC5pc0F4aW9zRXJyb3IgPT09IHRydWUpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIGhhdmUgZnVsbCBzdXBwb3J0IG9mIHRoZSBBUElzIG5lZWRlZCB0byB0ZXN0XG4gIC8vIHdoZXRoZXIgdGhlIHJlcXVlc3QgVVJMIGlzIG9mIHRoZSBzYW1lIG9yaWdpbiBhcyBjdXJyZW50IGxvY2F0aW9uLlxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICB2YXIgbXNpZSA9IC8obXNpZXx0cmlkZW50KS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gICAgICB2YXIgdXJsUGFyc2luZ05vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICB2YXIgb3JpZ2luVVJMO1xuXG4gICAgICAvKipcbiAgICAqIFBhcnNlIGEgVVJMIHRvIGRpc2NvdmVyIGl0J3MgY29tcG9uZW50c1xuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgVGhlIFVSTCB0byBiZSBwYXJzZWRcbiAgICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAgKi9cbiAgICAgIGZ1bmN0aW9uIHJlc29sdmVVUkwodXJsKSB7XG4gICAgICAgIHZhciBocmVmID0gdXJsO1xuXG4gICAgICAgIGlmIChtc2llKSB7XG4gICAgICAgIC8vIElFIG5lZWRzIGF0dHJpYnV0ZSBzZXQgdHdpY2UgdG8gbm9ybWFsaXplIHByb3BlcnRpZXNcbiAgICAgICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcbiAgICAgICAgICBocmVmID0gdXJsUGFyc2luZ05vZGUuaHJlZjtcbiAgICAgICAgfVxuXG4gICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuXG4gICAgICAgIC8vIHVybFBhcnNpbmdOb2RlIHByb3ZpZGVzIHRoZSBVcmxVdGlscyBpbnRlcmZhY2UgLSBodHRwOi8vdXJsLnNwZWMud2hhdHdnLm9yZy8jdXJsdXRpbHNcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBocmVmOiB1cmxQYXJzaW5nTm9kZS5ocmVmLFxuICAgICAgICAgIHByb3RvY29sOiB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbCA/IHVybFBhcnNpbmdOb2RlLnByb3RvY29sLnJlcGxhY2UoLzokLywgJycpIDogJycsXG4gICAgICAgICAgaG9zdDogdXJsUGFyc2luZ05vZGUuaG9zdCxcbiAgICAgICAgICBzZWFyY2g6IHVybFBhcnNpbmdOb2RlLnNlYXJjaCA/IHVybFBhcnNpbmdOb2RlLnNlYXJjaC5yZXBsYWNlKC9eXFw/LywgJycpIDogJycsXG4gICAgICAgICAgaGFzaDogdXJsUGFyc2luZ05vZGUuaGFzaCA/IHVybFBhcnNpbmdOb2RlLmhhc2gucmVwbGFjZSgvXiMvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0bmFtZTogdXJsUGFyc2luZ05vZGUuaG9zdG5hbWUsXG4gICAgICAgICAgcG9ydDogdXJsUGFyc2luZ05vZGUucG9ydCxcbiAgICAgICAgICBwYXRobmFtZTogKHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nKSA/XG4gICAgICAgICAgICB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZSA6XG4gICAgICAgICAgICAnLycgKyB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBvcmlnaW5VUkwgPSByZXNvbHZlVVJMKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcblxuICAgICAgLyoqXG4gICAgKiBEZXRlcm1pbmUgaWYgYSBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiBhcyB0aGUgY3VycmVudCBsb2NhdGlvblxuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSByZXF1ZXN0VVJMIFRoZSBVUkwgdG8gdGVzdFxuICAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4sIG90aGVyd2lzZSBmYWxzZVxuICAgICovXG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKHJlcXVlc3RVUkwpIHtcbiAgICAgICAgdmFyIHBhcnNlZCA9ICh1dGlscy5pc1N0cmluZyhyZXF1ZXN0VVJMKSkgPyByZXNvbHZlVVJMKHJlcXVlc3RVUkwpIDogcmVxdWVzdFVSTDtcbiAgICAgICAgcmV0dXJuIChwYXJzZWQucHJvdG9jb2wgPT09IG9yaWdpblVSTC5wcm90b2NvbCAmJlxuICAgICAgICAgICAgcGFyc2VkLmhvc3QgPT09IG9yaWdpblVSTC5ob3N0KTtcbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52cyAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9O1xuICAgIH0pKClcbik7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCBub3JtYWxpemVkTmFtZSkge1xuICB1dGlscy5mb3JFYWNoKGhlYWRlcnMsIGZ1bmN0aW9uIHByb2Nlc3NIZWFkZXIodmFsdWUsIG5hbWUpIHtcbiAgICBpZiAobmFtZSAhPT0gbm9ybWFsaXplZE5hbWUgJiYgbmFtZS50b1VwcGVyQ2FzZSgpID09PSBub3JtYWxpemVkTmFtZS50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICBoZWFkZXJzW25vcm1hbGl6ZWROYW1lXSA9IHZhbHVlO1xuICAgICAgZGVsZXRlIGhlYWRlcnNbbmFtZV07XG4gICAgfVxuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuLy8gSGVhZGVycyB3aG9zZSBkdXBsaWNhdGVzIGFyZSBpZ25vcmVkIGJ5IG5vZGVcbi8vIGMuZi4gaHR0cHM6Ly9ub2RlanMub3JnL2FwaS9odHRwLmh0bWwjaHR0cF9tZXNzYWdlX2hlYWRlcnNcbnZhciBpZ25vcmVEdXBsaWNhdGVPZiA9IFtcbiAgJ2FnZScsICdhdXRob3JpemF0aW9uJywgJ2NvbnRlbnQtbGVuZ3RoJywgJ2NvbnRlbnQtdHlwZScsICdldGFnJyxcbiAgJ2V4cGlyZXMnLCAnZnJvbScsICdob3N0JywgJ2lmLW1vZGlmaWVkLXNpbmNlJywgJ2lmLXVubW9kaWZpZWQtc2luY2UnLFxuICAnbGFzdC1tb2RpZmllZCcsICdsb2NhdGlvbicsICdtYXgtZm9yd2FyZHMnLCAncHJveHktYXV0aG9yaXphdGlvbicsXG4gICdyZWZlcmVyJywgJ3JldHJ5LWFmdGVyJywgJ3VzZXItYWdlbnQnXG5dO1xuXG4vKipcbiAqIFBhcnNlIGhlYWRlcnMgaW50byBhbiBvYmplY3RcbiAqXG4gKiBgYGBcbiAqIERhdGU6IFdlZCwgMjcgQXVnIDIwMTQgMDg6NTg6NDkgR01UXG4gKiBDb250ZW50LVR5cGU6IGFwcGxpY2F0aW9uL2pzb25cbiAqIENvbm5lY3Rpb246IGtlZXAtYWxpdmVcbiAqIFRyYW5zZmVyLUVuY29kaW5nOiBjaHVua2VkXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaGVhZGVycyBIZWFkZXJzIG5lZWRpbmcgdG8gYmUgcGFyc2VkXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBIZWFkZXJzIHBhcnNlZCBpbnRvIGFuIG9iamVjdFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBhcnNlSGVhZGVycyhoZWFkZXJzKSB7XG4gIHZhciBwYXJzZWQgPSB7fTtcbiAgdmFyIGtleTtcbiAgdmFyIHZhbDtcbiAgdmFyIGk7XG5cbiAgaWYgKCFoZWFkZXJzKSB7IHJldHVybiBwYXJzZWQ7IH1cblxuICB1dGlscy5mb3JFYWNoKGhlYWRlcnMuc3BsaXQoJ1xcbicpLCBmdW5jdGlvbiBwYXJzZXIobGluZSkge1xuICAgIGkgPSBsaW5lLmluZGV4T2YoJzonKTtcbiAgICBrZXkgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKDAsIGkpKS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhbCA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoaSArIDEpKTtcblxuICAgIGlmIChrZXkpIHtcbiAgICAgIGlmIChwYXJzZWRba2V5XSAmJiBpZ25vcmVEdXBsaWNhdGVPZi5pbmRleE9mKGtleSkgPj0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoa2V5ID09PSAnc2V0LWNvb2tpZScpIHtcbiAgICAgICAgcGFyc2VkW2tleV0gPSAocGFyc2VkW2tleV0gPyBwYXJzZWRba2V5XSA6IFtdKS5jb25jYXQoW3ZhbF0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFyc2VkW2tleV0gPSBwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldICsgJywgJyArIHZhbCA6IHZhbDtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBwYXJzZWQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFN5bnRhY3RpYyBzdWdhciBmb3IgaW52b2tpbmcgYSBmdW5jdGlvbiBhbmQgZXhwYW5kaW5nIGFuIGFycmF5IGZvciBhcmd1bWVudHMuXG4gKlxuICogQ29tbW9uIHVzZSBjYXNlIHdvdWxkIGJlIHRvIHVzZSBgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5YC5cbiAqXG4gKiAgYGBganNcbiAqICBmdW5jdGlvbiBmKHgsIHksIHopIHt9XG4gKiAgdmFyIGFyZ3MgPSBbMSwgMiwgM107XG4gKiAgZi5hcHBseShudWxsLCBhcmdzKTtcbiAqICBgYGBcbiAqXG4gKiBXaXRoIGBzcHJlYWRgIHRoaXMgZXhhbXBsZSBjYW4gYmUgcmUtd3JpdHRlbi5cbiAqXG4gKiAgYGBganNcbiAqICBzcHJlYWQoZnVuY3Rpb24oeCwgeSwgeikge30pKFsxLCAyLCAzXSk7XG4gKiAgYGBgXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzcHJlYWQoY2FsbGJhY2spIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXAoYXJyKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KG51bGwsIGFycik7XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgVkVSU0lPTiA9IHJlcXVpcmUoJy4uL2Vudi9kYXRhJykudmVyc2lvbjtcblxudmFyIHZhbGlkYXRvcnMgPSB7fTtcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcblsnb2JqZWN0JywgJ2Jvb2xlYW4nLCAnbnVtYmVyJywgJ2Z1bmN0aW9uJywgJ3N0cmluZycsICdzeW1ib2wnXS5mb3JFYWNoKGZ1bmN0aW9uKHR5cGUsIGkpIHtcbiAgdmFsaWRhdG9yc1t0eXBlXSA9IGZ1bmN0aW9uIHZhbGlkYXRvcih0aGluZykge1xuICAgIHJldHVybiB0eXBlb2YgdGhpbmcgPT09IHR5cGUgfHwgJ2EnICsgKGkgPCAxID8gJ24gJyA6ICcgJykgKyB0eXBlO1xuICB9O1xufSk7XG5cbnZhciBkZXByZWNhdGVkV2FybmluZ3MgPSB7fTtcblxuLyoqXG4gKiBUcmFuc2l0aW9uYWwgb3B0aW9uIHZhbGlkYXRvclxuICogQHBhcmFtIHtmdW5jdGlvbnxib29sZWFuP30gdmFsaWRhdG9yIC0gc2V0IHRvIGZhbHNlIGlmIHRoZSB0cmFuc2l0aW9uYWwgb3B0aW9uIGhhcyBiZWVuIHJlbW92ZWRcbiAqIEBwYXJhbSB7c3RyaW5nP30gdmVyc2lvbiAtIGRlcHJlY2F0ZWQgdmVyc2lvbiAvIHJlbW92ZWQgc2luY2UgdmVyc2lvblxuICogQHBhcmFtIHtzdHJpbmc/fSBtZXNzYWdlIC0gc29tZSBtZXNzYWdlIHdpdGggYWRkaXRpb25hbCBpbmZvXG4gKiBAcmV0dXJucyB7ZnVuY3Rpb259XG4gKi9cbnZhbGlkYXRvcnMudHJhbnNpdGlvbmFsID0gZnVuY3Rpb24gdHJhbnNpdGlvbmFsKHZhbGlkYXRvciwgdmVyc2lvbiwgbWVzc2FnZSkge1xuICBmdW5jdGlvbiBmb3JtYXRNZXNzYWdlKG9wdCwgZGVzYykge1xuICAgIHJldHVybiAnW0F4aW9zIHYnICsgVkVSU0lPTiArICddIFRyYW5zaXRpb25hbCBvcHRpb24gXFwnJyArIG9wdCArICdcXCcnICsgZGVzYyArIChtZXNzYWdlID8gJy4gJyArIG1lc3NhZ2UgOiAnJyk7XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuICByZXR1cm4gZnVuY3Rpb24odmFsdWUsIG9wdCwgb3B0cykge1xuICAgIGlmICh2YWxpZGF0b3IgPT09IGZhbHNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZm9ybWF0TWVzc2FnZShvcHQsICcgaGFzIGJlZW4gcmVtb3ZlZCcgKyAodmVyc2lvbiA/ICcgaW4gJyArIHZlcnNpb24gOiAnJykpKTtcbiAgICB9XG5cbiAgICBpZiAodmVyc2lvbiAmJiAhZGVwcmVjYXRlZFdhcm5pbmdzW29wdF0pIHtcbiAgICAgIGRlcHJlY2F0ZWRXYXJuaW5nc1tvcHRdID0gdHJ1ZTtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIGZvcm1hdE1lc3NhZ2UoXG4gICAgICAgICAgb3B0LFxuICAgICAgICAgICcgaGFzIGJlZW4gZGVwcmVjYXRlZCBzaW5jZSB2JyArIHZlcnNpb24gKyAnIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdGhlIG5lYXIgZnV0dXJlJ1xuICAgICAgICApXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiB2YWxpZGF0b3IgPyB2YWxpZGF0b3IodmFsdWUsIG9wdCwgb3B0cykgOiB0cnVlO1xuICB9O1xufTtcblxuLyoqXG4gKiBBc3NlcnQgb2JqZWN0J3MgcHJvcGVydGllcyB0eXBlXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtvYmplY3R9IHNjaGVtYVxuICogQHBhcmFtIHtib29sZWFuP30gYWxsb3dVbmtub3duXG4gKi9cblxuZnVuY3Rpb24gYXNzZXJ0T3B0aW9ucyhvcHRpb25zLCBzY2hlbWEsIGFsbG93VW5rbm93bikge1xuICBpZiAodHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9ucyBtdXN0IGJlIGFuIG9iamVjdCcpO1xuICB9XG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMob3B0aW9ucyk7XG4gIHZhciBpID0ga2V5cy5sZW5ndGg7XG4gIHdoaWxlIChpLS0gPiAwKSB7XG4gICAgdmFyIG9wdCA9IGtleXNbaV07XG4gICAgdmFyIHZhbGlkYXRvciA9IHNjaGVtYVtvcHRdO1xuICAgIGlmICh2YWxpZGF0b3IpIHtcbiAgICAgIHZhciB2YWx1ZSA9IG9wdGlvbnNbb3B0XTtcbiAgICAgIHZhciByZXN1bHQgPSB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbGlkYXRvcih2YWx1ZSwgb3B0LCBvcHRpb25zKTtcbiAgICAgIGlmIChyZXN1bHQgIT09IHRydWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9uICcgKyBvcHQgKyAnIG11c3QgYmUgJyArIHJlc3VsdCk7XG4gICAgICB9XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKGFsbG93VW5rbm93biAhPT0gdHJ1ZSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ1Vua25vd24gb3B0aW9uICcgKyBvcHQpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYXNzZXJ0T3B0aW9uczogYXNzZXJ0T3B0aW9ucyxcbiAgdmFsaWRhdG9yczogdmFsaWRhdG9yc1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xuXG4vLyB1dGlscyBpcyBhIGxpYnJhcnkgb2YgZ2VuZXJpYyBoZWxwZXIgZnVuY3Rpb25zIG5vbi1zcGVjaWZpYyB0byBheGlvc1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIEFycmF5XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gQXJyYXksIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5KHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBBcnJheV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIHVuZGVmaW5lZFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSB2YWx1ZSBpcyB1bmRlZmluZWQsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1VuZGVmaW5lZCh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0J1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiAhaXNVbmRlZmluZWQodmFsKSAmJiB2YWwuY29uc3RydWN0b3IgIT09IG51bGwgJiYgIWlzVW5kZWZpbmVkKHZhbC5jb25zdHJ1Y3RvcilcbiAgICAmJiB0eXBlb2YgdmFsLmNvbnN0cnVjdG9yLmlzQnVmZmVyID09PSAnZnVuY3Rpb24nICYmIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlcih2YWwpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5QnVmZmVyKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRm9ybURhdGFcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBGb3JtRGF0YSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRm9ybURhdGEodmFsKSB7XG4gIHJldHVybiAodHlwZW9mIEZvcm1EYXRhICE9PSAndW5kZWZpbmVkJykgJiYgKHZhbCBpbnN0YW5jZW9mIEZvcm1EYXRhKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHZpZXcgb24gYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIHZpZXcgb24gYW4gQXJyYXlCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5QnVmZmVyVmlldyh2YWwpIHtcbiAgdmFyIHJlc3VsdDtcbiAgaWYgKCh0eXBlb2YgQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnKSAmJiAoQXJyYXlCdWZmZXIuaXNWaWV3KSkge1xuICAgIHJlc3VsdCA9IEFycmF5QnVmZmVyLmlzVmlldyh2YWwpO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdCA9ICh2YWwpICYmICh2YWwuYnVmZmVyKSAmJiAodmFsLmJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyaW5nXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJpbmcsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmluZyh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgTnVtYmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBOdW1iZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc051bWJlcih2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdudW1iZXInO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIE9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIHBsYWluIE9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3QodmFsKSB7XG4gIGlmICh0b1N0cmluZy5jYWxsKHZhbCkgIT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIHByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih2YWwpO1xuICByZXR1cm4gcHJvdG90eXBlID09PSBudWxsIHx8IHByb3RvdHlwZSA9PT0gT2JqZWN0LnByb3RvdHlwZTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIERhdGVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIERhdGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0RhdGUodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZpbGVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZpbGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0ZpbGUodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEZpbGVdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJsb2JcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJsb2IsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Jsb2IodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEJsb2JdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGdW5jdGlvbiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJlYW1cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmVhbSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyZWFtKHZhbCkge1xuICByZXR1cm4gaXNPYmplY3QodmFsKSAmJiBpc0Z1bmN0aW9uKHZhbC5waXBlKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFVSTFNlYXJjaFBhcmFtcyBvYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFVSTFNlYXJjaFBhcmFtcyBvYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1VSTFNlYXJjaFBhcmFtcyh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiBVUkxTZWFyY2hQYXJhbXMgIT09ICd1bmRlZmluZWQnICYmIHZhbCBpbnN0YW5jZW9mIFVSTFNlYXJjaFBhcmFtcztcbn1cblxuLyoqXG4gKiBUcmltIGV4Y2VzcyB3aGl0ZXNwYWNlIG9mZiB0aGUgYmVnaW5uaW5nIGFuZCBlbmQgb2YgYSBzdHJpbmdcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIFRoZSBTdHJpbmcgdG8gdHJpbVxuICogQHJldHVybnMge1N0cmluZ30gVGhlIFN0cmluZyBmcmVlZCBvZiBleGNlc3Mgd2hpdGVzcGFjZVxuICovXG5mdW5jdGlvbiB0cmltKHN0cikge1xuICByZXR1cm4gc3RyLnRyaW0gPyBzdHIudHJpbSgpIDogc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgd2UncmUgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnRcbiAqXG4gKiBUaGlzIGFsbG93cyBheGlvcyB0byBydW4gaW4gYSB3ZWIgd29ya2VyLCBhbmQgcmVhY3QtbmF0aXZlLlxuICogQm90aCBlbnZpcm9ubWVudHMgc3VwcG9ydCBYTUxIdHRwUmVxdWVzdCwgYnV0IG5vdCBmdWxseSBzdGFuZGFyZCBnbG9iYWxzLlxuICpcbiAqIHdlYiB3b3JrZXJzOlxuICogIHR5cGVvZiB3aW5kb3cgLT4gdW5kZWZpbmVkXG4gKiAgdHlwZW9mIGRvY3VtZW50IC0+IHVuZGVmaW5lZFxuICpcbiAqIHJlYWN0LW5hdGl2ZTpcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnUmVhY3ROYXRpdmUnXG4gKiBuYXRpdmVzY3JpcHRcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnTmF0aXZlU2NyaXB0JyBvciAnTlMnXG4gKi9cbmZ1bmN0aW9uIGlzU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgKG5hdmlnYXRvci5wcm9kdWN0ID09PSAnUmVhY3ROYXRpdmUnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOYXRpdmVTY3JpcHQnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOUycpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiAoXG4gICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnXG4gICk7XG59XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFuIEFycmF5IG9yIGFuIE9iamVjdCBpbnZva2luZyBhIGZ1bmN0aW9uIGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgYG9iamAgaXMgYW4gQXJyYXkgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBpbmRleCwgYW5kIGNvbXBsZXRlIGFycmF5IGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgJ29iaicgaXMgYW4gT2JqZWN0IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwga2V5LCBhbmQgY29tcGxldGUgb2JqZWN0IGZvciBlYWNoIHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBvYmogVGhlIG9iamVjdCB0byBpdGVyYXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgY2FsbGJhY2sgdG8gaW52b2tlIGZvciBlYWNoIGl0ZW1cbiAqL1xuZnVuY3Rpb24gZm9yRWFjaChvYmosIGZuKSB7XG4gIC8vIERvbid0IGJvdGhlciBpZiBubyB2YWx1ZSBwcm92aWRlZFxuICBpZiAob2JqID09PSBudWxsIHx8IHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRm9yY2UgYW4gYXJyYXkgaWYgbm90IGFscmVhZHkgc29tZXRoaW5nIGl0ZXJhYmxlXG4gIGlmICh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0Jykge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIG9iaiA9IFtvYmpdO1xuICB9XG5cbiAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBhcnJheSB2YWx1ZXNcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG9iai5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2ldLCBpLCBvYmopO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgb2JqZWN0IGtleXNcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgICBmbi5jYWxsKG51bGwsIG9ialtrZXldLCBrZXksIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQWNjZXB0cyB2YXJhcmdzIGV4cGVjdGluZyBlYWNoIGFyZ3VtZW50IHRvIGJlIGFuIG9iamVjdCwgdGhlblxuICogaW1tdXRhYmx5IG1lcmdlcyB0aGUgcHJvcGVydGllcyBvZiBlYWNoIG9iamVjdCBhbmQgcmV0dXJucyByZXN1bHQuXG4gKlxuICogV2hlbiBtdWx0aXBsZSBvYmplY3RzIGNvbnRhaW4gdGhlIHNhbWUga2V5IHRoZSBsYXRlciBvYmplY3QgaW5cbiAqIHRoZSBhcmd1bWVudHMgbGlzdCB3aWxsIHRha2UgcHJlY2VkZW5jZS5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIGBgYGpzXG4gKiB2YXIgcmVzdWx0ID0gbWVyZ2Uoe2ZvbzogMTIzfSwge2ZvbzogNDU2fSk7XG4gKiBjb25zb2xlLmxvZyhyZXN1bHQuZm9vKTsgLy8gb3V0cHV0cyA0NTZcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmoxIE9iamVjdCB0byBtZXJnZVxuICogQHJldHVybnMge09iamVjdH0gUmVzdWx0IG9mIGFsbCBtZXJnZSBwcm9wZXJ0aWVzXG4gKi9cbmZ1bmN0aW9uIG1lcmdlKC8qIG9iajEsIG9iajIsIG9iajMsIC4uLiAqLykge1xuICB2YXIgcmVzdWx0ID0ge307XG4gIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKGlzUGxhaW5PYmplY3QocmVzdWx0W2tleV0pICYmIGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZShyZXN1bHRba2V5XSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZSh7fSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWwuc2xpY2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWw7XG4gICAgfVxuICB9XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgZm9yRWFjaChhcmd1bWVudHNbaV0sIGFzc2lnblZhbHVlKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEV4dGVuZHMgb2JqZWN0IGEgYnkgbXV0YWJseSBhZGRpbmcgdG8gaXQgdGhlIHByb3BlcnRpZXMgb2Ygb2JqZWN0IGIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGEgVGhlIG9iamVjdCB0byBiZSBleHRlbmRlZFxuICogQHBhcmFtIHtPYmplY3R9IGIgVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgZnJvbVxuICogQHBhcmFtIHtPYmplY3R9IHRoaXNBcmcgVGhlIG9iamVjdCB0byBiaW5kIGZ1bmN0aW9uIHRvXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSByZXN1bHRpbmcgdmFsdWUgb2Ygb2JqZWN0IGFcbiAqL1xuZnVuY3Rpb24gZXh0ZW5kKGEsIGIsIHRoaXNBcmcpIHtcbiAgZm9yRWFjaChiLCBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmICh0aGlzQXJnICYmIHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFba2V5XSA9IGJpbmQodmFsLCB0aGlzQXJnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYVtrZXldID0gdmFsO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBhO1xufVxuXG4vKipcbiAqIFJlbW92ZSBieXRlIG9yZGVyIG1hcmtlci4gVGhpcyBjYXRjaGVzIEVGIEJCIEJGICh0aGUgVVRGLTggQk9NKVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZW50IHdpdGggQk9NXG4gKiBAcmV0dXJuIHtzdHJpbmd9IGNvbnRlbnQgdmFsdWUgd2l0aG91dCBCT01cbiAqL1xuZnVuY3Rpb24gc3RyaXBCT00oY29udGVudCkge1xuICBpZiAoY29udGVudC5jaGFyQ29kZUF0KDApID09PSAweEZFRkYpIHtcbiAgICBjb250ZW50ID0gY29udGVudC5zbGljZSgxKTtcbiAgfVxuICByZXR1cm4gY29udGVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzQXJyYXk6IGlzQXJyYXksXG4gIGlzQXJyYXlCdWZmZXI6IGlzQXJyYXlCdWZmZXIsXG4gIGlzQnVmZmVyOiBpc0J1ZmZlcixcbiAgaXNGb3JtRGF0YTogaXNGb3JtRGF0YSxcbiAgaXNBcnJheUJ1ZmZlclZpZXc6IGlzQXJyYXlCdWZmZXJWaWV3LFxuICBpc1N0cmluZzogaXNTdHJpbmcsXG4gIGlzTnVtYmVyOiBpc051bWJlcixcbiAgaXNPYmplY3Q6IGlzT2JqZWN0LFxuICBpc1BsYWluT2JqZWN0OiBpc1BsYWluT2JqZWN0LFxuICBpc1VuZGVmaW5lZDogaXNVbmRlZmluZWQsXG4gIGlzRGF0ZTogaXNEYXRlLFxuICBpc0ZpbGU6IGlzRmlsZSxcbiAgaXNCbG9iOiBpc0Jsb2IsXG4gIGlzRnVuY3Rpb246IGlzRnVuY3Rpb24sXG4gIGlzU3RyZWFtOiBpc1N0cmVhbSxcbiAgaXNVUkxTZWFyY2hQYXJhbXM6IGlzVVJMU2VhcmNoUGFyYW1zLFxuICBpc1N0YW5kYXJkQnJvd3NlckVudjogaXNTdGFuZGFyZEJyb3dzZXJFbnYsXG4gIGZvckVhY2g6IGZvckVhY2gsXG4gIG1lcmdlOiBtZXJnZSxcbiAgZXh0ZW5kOiBleHRlbmQsXG4gIHRyaW06IHRyaW0sXG4gIHN0cmlwQk9NOiBzdHJpcEJPTVxufTtcbiIsImltcG9ydCBTZWN0aW9uIGZyb20gXCIuL3R5cGVzL1NlY3Rpb25cIjtcbmltcG9ydCBIb21lU2VjdGlvbiBmcm9tIFwiLi9zZWN0aW9ucy9Ib21lXCI7XG5pbXBvcnQgT3JkZXJTZWN0aW9uIGZyb20gXCIuL3NlY3Rpb25zL09yZGVyXCI7XG5pbXBvcnQgUHJvZHVjdFNlY3Rpb24gZnJvbSBcIi4vc2VjdGlvbnMvUHJvZHVjdFwiO1xuaW1wb3J0IFJld2FyZFNlY3Rpb24gZnJvbSBcIi4vc2VjdGlvbnMvUmV3YXJkXCI7XG5pbXBvcnQgU3RvcmVTZWN0aW9uIGZyb20gXCIuL3NlY3Rpb25zL1N0b3JlXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERhc2hib2FyZCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMucmVuZGVyRGFzaGJvYXJkKCk7XG5cbiAgICBjb25zdCBzaWRlYmFySXRlbXNDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcbiAgICAgIFwic2lkZWJhckl0ZW1zXCJcbiAgICApISBhcyBIVE1MRGl2RWxlbWVudDtcbiAgICBzaWRlYmFySXRlbXNDb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwiY2xpY2tcIixcbiAgICAgIHRoaXMuc2lkZWJhckNsaWNrSGFuZGxlci5iaW5kKHRoaXMpXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyRGFzaGJvYXJkKHNlY3Rpb24/OiBTZWN0aW9uKSB7XG4gICAgY29uc3QgYWN0aXZlU2VjdGlvbiA9IHNlY3Rpb24gfHwgXCJIT01FXCI7XG5cbiAgICBzd2l0Y2ggKGFjdGl2ZVNlY3Rpb24pIHtcbiAgICAgIGNhc2UgXCJIT01FXCI6XG4gICAgICAgIG5ldyBIb21lU2VjdGlvbigpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJTVE9SRVwiOlxuICAgICAgICBuZXcgU3RvcmVTZWN0aW9uKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIlBST0RVQ1RcIjpcbiAgICAgICAgbmV3IFByb2R1Y3RTZWN0aW9uKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIlJFV0FSRFwiOlxuICAgICAgICBuZXcgUmV3YXJkU2VjdGlvbigpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJPUkRFUlwiOlxuICAgICAgICBuZXcgT3JkZXJTZWN0aW9uKCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJbZGF0YS1zZWN0aW9uXVwiKS5mb3JFYWNoKChlbCkgPT4ge1xuICAgICAgaWYgKCEoZWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHJldHVybjtcblxuICAgICAgaWYgKFxuICAgICAgICBlbC5kYXRhc2V0LnNlY3Rpb24gIT09IGFjdGl2ZVNlY3Rpb24gJiZcbiAgICAgICAgZWwuY2xhc3NMaXN0LmNvbnRhaW5zKFwic2lkZWJhci1pdGVtX19hY3RpdmVcIilcbiAgICAgICkge1xuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKFwic2lkZWJhci1pdGVtX19hY3RpdmVcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChcbiAgICAgICAgZWwuZGF0YXNldC5zZWN0aW9uID09PSBhY3RpdmVTZWN0aW9uICYmXG4gICAgICAgICFlbC5jbGFzc0xpc3QuY29udGFpbnMoXCJzaWRlYmFyLWl0ZW1fX2FjdGl2ZVwiKVxuICAgICAgKSB7XG4gICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoXCJzaWRlYmFyLWl0ZW1fX2FjdGl2ZVwiKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgc2lkZWJhckNsaWNrSGFuZGxlcihlOiBFdmVudCkge1xuICAgIGxldCB0YXJnZXQgPSBlLnRhcmdldCBhcyBIVE1MRWxlbWVudDtcblxuICAgIGlmICghdGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhcInNpZGViYXItaXRlbVwiKSkge1xuICAgICAgdGFyZ2V0ID0gdGFyZ2V0LmNsb3Nlc3QoXCIuc2lkZWJhci1pdGVtXCIpIGFzIEhUTUxFbGVtZW50O1xuICAgICAgaWYgKCF0YXJnZXQpIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzZWN0aW9uRGF0YXNldCA9IHRhcmdldC5kYXRhc2V0LnNlY3Rpb24gYXMgU2VjdGlvbiB8IFwiTlVMTFwiO1xuXG4gICAgaWYgKHNlY3Rpb25EYXRhc2V0ID09PSBcIk5VTExcIikge1xuICAgICAgbG9jYXRpb24uaHJlZiA9IFwiL1wiO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMucmVuZGVyRGFzaGJvYXJkKHNlY3Rpb25EYXRhc2V0KTtcbiAgfVxufVxuIiwiaW1wb3J0IERhc2hib2FyZCBmcm9tIFwiLi9EYXNoYm9hcmRcIjtcbmltcG9ydCBPcmRlclByb2R1Y3RNb2RhbCBmcm9tIFwiLi9tb2RhbHMvT3JkZXJQcm9kdWN0XCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1haW4ge1xuICBwdWJsaWMgc3RhdGljIHNlbGY6IE1haW47XG4gIHByaXZhdGUgZm9jdXNlZEVsPzogSFRNTEVsZW1lbnQ7XG5cbiAgcHJpdmF0ZSBjb25zdHJ1Y3RvcigpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLmdldEVsZW1lbnRCeUlkKFwiZHJvcGRvd25Ub2dnbGVcIilcbiAgICAgID8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuZHJvcGRvd25Ub2dnbGVIYW5kbGVyLmJpbmQodGhpcykpO1xuXG4gICAgaWYgKGxvY2F0aW9uLnBhdGhuYW1lID09PSBcIi9kYXNoYm9hcmRcIikge1xuICAgICAgbmV3IERhc2hib2FyZCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChsb2NhdGlvbi5wYXRobmFtZSA9PT0gXCIvXCIpIHtcbiAgICAgIGRvY3VtZW50XG4gICAgICAgIC5nZXRFbGVtZW50QnlJZChcImNvbnRhY3RGb3JtXCIpXG4gICAgICAgID8uYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCB0aGlzLmNvbnRhY3RTdWJtaXRIYW5kbGVyLmJpbmQodGhpcykpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGRvY3VtZW50XG4gICAgICAuZ2V0RWxlbWVudEJ5SWQoXCJwcm9kdWN0SW1nc1wiKVxuICAgICAgPy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5jaGFuZ2VBY3RpdmVJbWdIYW5kbGVyLmJpbmQodGhpcykpO1xuXG4gICAgZG9jdW1lbnRcbiAgICAgIC5nZXRFbGVtZW50QnlJZChcIm9yZGVyUHJvZHVjdFwiKVxuICAgICAgPy5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIHRoaXMub3JkZXJQcm9kdWN0SGFuZGxlci5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIHN0YXRpYyBtYWluKCkge1xuICAgIHRoaXMuc2VsZiA9IG5ldyBNYWluKCk7XG4gICAgcmV0dXJuIHRoaXMuc2VsZjtcbiAgfVxuXG4gIHByaXZhdGUgZHJvcGRvd25Ub2dnbGVIYW5kbGVyKCkge1xuICAgIGlmICh0aGlzLmZvY3VzZWRFbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHVzZXJEcm9wZG93blRlbXBsYXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXG4gICAgICBcInVzZXJEcm9wZG93blRlbXBsYXRlXCJcbiAgICApISBhcyBIVE1MVGVtcGxhdGVFbGVtZW50O1xuXG4gICAgdXNlckRyb3Bkb3duVGVtcGxhdGUucGFyZW50RWxlbWVudD8uYXBwZW5kQ2hpbGQoXG4gICAgICB1c2VyRHJvcGRvd25UZW1wbGF0ZS5jb250ZW50LmNsb25lTm9kZSh0cnVlKSBhcyBIVE1MRWxlbWVudFxuICAgICk7XG5cbiAgICB0aGlzLmZvY3VzZWRFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidXNlckRyb3Bkb3duXCIpITtcblxuICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5hdHRhY2hMaXN0ZW5lclRvQm9keSgpLCA1MCk7XG4gIH1cblxuICBwcml2YXRlIGF0dGFjaExpc3RlbmVyVG9Cb2R5KCkge1xuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwiY2xpY2tcIixcbiAgICAgIHRoaXMuY2xvc2VGb2N1c2VkSGFuZGxlci5iaW5kKHRoaXMpLFxuICAgICAgeyBvbmNlOiB0cnVlIH1cbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBjbG9zZUZvY3VzZWRIYW5kbGVyKGU6IEV2ZW50KSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQ7XG5cbiAgICBpZiAodGFyZ2V0LmNsb3Nlc3QoYCMke3RoaXMuZm9jdXNlZEVsIS5pZH1gKSkge1xuICAgICAgdGhpcy5hdHRhY2hMaXN0ZW5lclRvQm9keSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuZm9jdXNlZEVsIS5yZW1vdmUoKTtcbiAgICB0aGlzLmZvY3VzZWRFbCA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHByaXZhdGUgY2hhbmdlQWN0aXZlSW1nSGFuZGxlcihlOiBFdmVudCkge1xuICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0IGFzIEhUTUxJbWFnZUVsZW1lbnQ7XG5cbiAgICBpZiAoIXRhcmdldC5zcmMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBhY3RpdmVJbWdDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcbiAgICAgIFwicHJvZHVjdEFjdGl2ZUltZ1wiXG4gICAgKSBhcyBIVE1MSW1hZ2VFbGVtZW50O1xuXG4gICAgaWYgKHRhcmdldC5zcmMgPT09IGFjdGl2ZUltZ0NvbnRhaW5lci5zcmMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBhY3RpdmVJbWdDb250YWluZXIuaW5uZXJIVE1MID0gdGFyZ2V0Lm91dGVySFRNTDtcbiAgfVxuXG4gIHByaXZhdGUgb3JkZXJQcm9kdWN0SGFuZGxlcihlOiBFdmVudCkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0IGFzIEhUTUxGb3JtRWxlbWVudDtcblxuICAgIGNvbnN0IHByb2R1Y3RJZCA9IHRhcmdldC5kYXRhc2V0Py5pZDtcbiAgICBjb25zdCBvcmRlclR5cGUgPSB0YXJnZXQuZGF0YXNldD8udHlwZTtcbiAgICBjb25zdCBsb2dnZWRJbiA9IHRhcmdldC5kYXRhc2V0Py5sb2dnZWRpbiA9PT0gXCJ0cnVlXCIgPyB0cnVlIDogZmFsc2U7XG4gICAgY29uc3QgcXVhbnRpdHlJbnB1dCA9IHRhcmdldD8ucXVlcnlTZWxlY3RvcihcbiAgICAgIFwiaW5wdXRbaWQ9J29yZGVyQW1vdW50J11cIlxuICAgICkgYXMgSFRNTElucHV0RWxlbWVudDtcblxuICAgIGlmICghbG9nZ2VkSW4pIHtcbiAgICAgIGxvY2F0aW9uLmhyZWYgPSBcIi9sb2dpblwiO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIG5ldyBPcmRlclByb2R1Y3RNb2RhbChcbiAgICAgIG9yZGVyVHlwZSEsXG4gICAgICBwcm9kdWN0SWQhLFxuICAgICAgK3F1YW50aXR5SW5wdXQ/LnZhbHVlLnRyaW0oKSB8fCAxXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgY29udGFjdFN1Ym1pdEhhbmRsZXIoZTogRXZlbnQpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICBjb25zdCBjb250YWN0TmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxuICAgICAgXCJjb250YWN0TmFtZVwiXG4gICAgKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgIGNvbnN0IGNvbnRhY3RFbWFpbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxuICAgICAgXCJjb250YWN0RW1haWxcIlxuICAgICkgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICBjb25zdCBjb250YWN0U3ViamVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxuICAgICAgXCJjb250YWN0U3ViamVjdFwiXG4gICAgKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgIGNvbnN0IGNvbnRhY3RNZXNzYWdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXG4gICAgICBcImNvbnRhY3RNZXNzYWdlXCJcbiAgICApIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG5cbiAgICBjb25zdCBlbWFpbCA9IGNvbnRhY3RFbWFpbC52YWx1ZTtcbiAgICBjb25zdCBzdWJqZWN0ID0gY29udGFjdFN1YmplY3QudmFsdWU7XG4gICAgY29uc3QgYm9keSA9IGNvbnRhY3RNZXNzYWdlLnZhbHVlO1xuXG4gICAgY29uc3QgdXJsID0gYG1haWx0bzpnYWZvdXJpQGdtYWlsLmNvbT9iY2M9JHtlbWFpbH0mc3ViamVjdD0ke3N1YmplY3R9JmJvZHk9JHtib2R5fWA7XG4gICAgd2luZG93Lm9wZW4odXJsKTtcblxuICAgIGNvbnRhY3ROYW1lLnZhbHVlID0gXCJcIjtcbiAgICBjb250YWN0RW1haWwudmFsdWUgPSBcIlwiO1xuICAgIGNvbnRhY3RTdWJqZWN0LnZhbHVlID0gXCJcIjtcbiAgICBjb250YWN0TWVzc2FnZS52YWx1ZSA9IFwiXCI7XG4gIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZvcm1hdERhdGUoZGF0ZTogRGF0ZSkge1xuICBjb25zdCBkYXRlT2JqID0gbmV3IERhdGUoZGF0ZSk7XG4gIGNvbnN0IGRheSA9IGRhdGVPYmouZ2V0RGF0ZSgpO1xuICBjb25zdCBtb250aCA9IGRhdGVPYmoudG9Mb2NhbGVTdHJpbmcoXCJlbi11c1wiLCB7IG1vbnRoOiBcInNob3J0XCIgfSk7XG4gIGNvbnN0IHllYXIgPSBkYXRlT2JqLmdldEZ1bGxZZWFyKCk7XG5cbiAgcmV0dXJuIGAke2RheX0gJHttb250aH0sICR7eWVhcn1gO1xufVxuIiwiaW1wb3J0IE1haW4gZnJvbSBcIi4vTWFpblwiO1xuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgKCkgPT4gTWFpbi5tYWluKCkpO1xuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9kYWwge1xuICBwcml2YXRlIG92ZXJsYXlNYXJrdXAgPSBgPGRpdiBjbGFzcz1cIm92ZXJsYXlcIj48L2Rpdj5gO1xuICBwcml2YXRlIG1vZGFsTWFya3VwID0gYFxuICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1jb250YWluZXJcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtdG9wXCI+XG4gICAgICAgICAgICAgICAgPGgyIGNsYXNzPVwibW9kYWwtYnJhbmRcIj48L2gyPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1jbG9zZVwiPjxpIGNsYXNzPVwiYmkgYmkteFwiPjwvaT48L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWNvbnRlbnRcIj48L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIGA7XG4gIHByaXZhdGUgbG9hZGluZ1NwaW5uZXIgPSBgXG4gICAgPGRpdiBjbGFzcz1cImxvYWRpbmctc3Bpbm5lcl9fbW9kYWxcIj48ZGl2IGNsYXNzPVwibG9hZGluZy1zcGlubmVyXCI+PC9kaXY+PC9kaXY+XG4gIGA7XG5cbiAgcHJpdmF0ZSBvdmVybGF5OiBIVE1MRWxlbWVudDtcbiAgcHJpdmF0ZSBtb2RhbDogSFRNTEVsZW1lbnQ7XG4gIHByb3RlY3RlZCBtb2RhbFRpdGxlOiBIVE1MRWxlbWVudDtcbiAgcHJpdmF0ZSBtb2RhbENsb3NlOiBIVE1MRWxlbWVudDtcbiAgcHJvdGVjdGVkIG1vZGFsQ29udGVudENvbnRhaW5lcjogSFRNTEVsZW1lbnQ7XG4gIHByb3RlY3RlZCBmb3JtPzogSFRNTEZvcm1FbGVtZW50O1xuICBwcm90ZWN0ZWQgcmVuZGVyZWRFcnJvcj86IEhUTUxFbGVtZW50O1xuICBwcm90ZWN0ZWQgYWN0aXZlVGltZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgdGl0bGU6IHN0cmluZyxcbiAgICBwcm90ZWN0ZWQgdHlwZTogXCJFRElUQUJMRVwiIHwgXCJDUkVBVEFCTEVcIiA9IFwiQ1JFQVRBQkxFXCIsXG4gICAgcHJpdmF0ZSByZWxvYWRGbj86IEZ1bmN0aW9uXG4gICkge1xuICAgIGRvY3VtZW50LmJvZHkuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYWZ0ZXJiZWdpblwiLCB0aGlzLm92ZXJsYXlNYXJrdXApO1xuICAgIGRvY3VtZW50LmJvZHkuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYWZ0ZXJiZWdpblwiLCB0aGlzLm1vZGFsTWFya3VwKTtcblxuICAgIHRoaXMub3ZlcmxheSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIub3ZlcmxheVwiKSBhcyBIVE1MRWxlbWVudDtcbiAgICB0aGlzLm1vZGFsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5tb2RhbFwiKSBhcyBIVE1MRWxlbWVudDtcbiAgICB0aGlzLm1vZGFsVGl0bGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLm1vZGFsLWJyYW5kXCIpIGFzIEhUTUxFbGVtZW50O1xuICAgIHRoaXMubW9kYWxDbG9zZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubW9kYWwtY2xvc2VcIikgYXMgSFRNTEVsZW1lbnQ7XG4gICAgdGhpcy5tb2RhbENvbnRlbnRDb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgXCIubW9kYWwtY29udGVudFwiXG4gICAgKSBhcyBIVE1MRWxlbWVudDtcblxuICAgIHRoaXMubW9kYWxUaXRsZS50ZXh0Q29udGVudCA9IHRoaXMudGl0bGU7XG4gICAgdGhpcy5tb2RhbENvbnRlbnRDb250YWluZXIuaW5uZXJIVE1MID0gdGhpcy5sb2FkaW5nU3Bpbm5lcjtcblxuICAgIHRoaXMubW9kYWxDbG9zZS5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgXCJjbGlja1wiLFxuICAgICAgdGhpcy5jbG9zZU1vZGFsSGFuZGxlci5iaW5kKHRoaXMpXG4gICAgKTtcbiAgICB0aGlzLm92ZXJsYXkuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuY2xvc2VNb2RhbEhhbmRsZXIuYmluZCh0aGlzKSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5rZXlkb3duSGFuZGxlci5iaW5kKHRoaXMpLCB7XG4gICAgICBvbmNlOiB0cnVlLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBjbG9zZU1vZGFsSGFuZGxlcigpIHtcbiAgICB0aGlzLmNsb3NlSGFuZGxlcigpO1xuICB9XG5cbiAgcHJpdmF0ZSBrZXlkb3duSGFuZGxlcihlOiBLZXlib2FyZEV2ZW50KSB7XG4gICAgaWYgKGUua2V5ID09PSBcIkVzY2FwZVwiKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB0aGlzLmNsb3NlSGFuZGxlcigpO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCByZW5kZXIobWFya3VwOiBzdHJpbmcpIHtcbiAgICB0aGlzLm1vZGFsQ29udGVudENvbnRhaW5lci5pbm5lckhUTUwgPSBtYXJrdXA7XG4gICAgaWYgKHRoaXMudHlwZSA9PT0gXCJFRElUQUJMRVwiKSB7XG4gICAgICBkb2N1bWVudFxuICAgICAgICAuZ2V0RWxlbWVudEJ5SWQoXCJkZWxldGVEb2NcIilcbiAgICAgICAgPy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5kZWxldGVIYW5kbGVyLmJpbmQodGhpcykpO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBjbG9zZUhhbmRsZXIocmVsb2FkID0gdHJ1ZSkge1xuICAgIHRoaXMubW9kYWwucmVtb3ZlKCk7XG4gICAgdGhpcy5vdmVybGF5LnJlbW92ZSgpO1xuXG4gICAgaWYgKCFyZWxvYWQpIHJldHVybjtcblxuICAgIGlmICh0aGlzLnJlbG9hZEZuKSB7XG4gICAgICB0aGlzLnJlbG9hZEZuKCk7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGNyZWF0ZUVycm9yKHRleHQ6IHN0cmluZykge1xuICAgIGNvbnN0IGVycm9yRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcbiAgICBlcnJvckVsLmNsYXNzTGlzdC5hZGQoXCJmb3JtLWVycm9yXCIpO1xuICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgIHJldHVybiBlcnJvckVsO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBkZWxldGVIYW5kbGVyKGU6IEV2ZW50KSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0IGFzIEhUTUxCdXR0b25FbGVtZW50O1xuXG4gICAgICBpZiAodGhpcy5hY3RpdmVUaW1lcikge1xuICAgICAgICBjbGVhckludGVydmFsKHRoaXMuYWN0aXZlVGltZXIpO1xuICAgICAgICB0YXJnZXQudGV4dENvbnRlbnQgPSBcIkRlbGV0ZVwiO1xuICAgICAgICB0YXJnZXQuc3R5bGUub3BhY2l0eSA9IFwiMVwiO1xuICAgICAgICB0aGlzLmFjdGl2ZVRpbWVyID0gMDtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBsZXQgdGltZXIgPSAzO1xuICAgICAgdGFyZ2V0LnRleHRDb250ZW50ID0gYFVuZG8uLi4gJHt0aW1lcn1gO1xuICAgICAgdGFyZ2V0LnN0eWxlLm9wYWNpdHkgPSBcIjAuN1wiO1xuICAgICAgdGhpcy5hY3RpdmVUaW1lciA9IHdpbmRvdy5zZXRJbnRlcnZhbChhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICh0aW1lciAhPT0gMCkge1xuICAgICAgICAgIHRpbWVyLS07XG4gICAgICAgICAgdGFyZ2V0LnRleHRDb250ZW50ID0gYFVuZG8uLi4gJHt0aW1lcn1gO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRhcmdldC50ZXh0Q29udGVudCA9IFwiRGVsZXRpbmdcIjtcbiAgICAgICAgdGFyZ2V0LmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgYXdhaXQgdGhpcy5kZWxldGVEb2MoKTtcbiAgICAgICAgdGhpcy5jbG9zZUhhbmRsZXIoKTtcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmFjdGl2ZVRpbWVyKTtcbiAgICAgIH0sIDEwMDApO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBkZWxldGVEb2MoKSB7fVxufVxuIiwiaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiO1xuXG5pbXBvcnQgTW9kYWwgZnJvbSBcIi4vTW9kYWxcIjtcbmltcG9ydCBPcmRlciBmcm9tIFwiLi4vdHlwZXMvT3JkZXJcIjtcbmltcG9ydCBmb3JtYXREYXRlIGZyb20gXCIuLi9oZWxwZXJzL2Zvcm1hdERhdGVcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT3JkZXJNb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgY29uc3RydWN0b3IocmVsb2FkRm46IEZ1bmN0aW9uLCBvcmRlcklkOiBzdHJpbmcpIHtcbiAgICBzdXBlcihcIk5ldyBPcmRlclwiLCBcIkNSRUFUQUJMRVwiLCByZWxvYWRGbik7XG5cbiAgICB0aGlzLmxvYWQob3JkZXJJZClcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgZG9jdW1lbnRcbiAgICAgICAgICAuZ2V0RWxlbWVudEJ5SWQoXCJzZXRBc0RlbGl2ZXJlZFwiKVxuICAgICAgICAgID8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuc2V0QXNEZWxpdmVyZWRIYW5kbGVyLmJpbmQodGhpcykpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoXykgPT4ge1xuICAgICAgICByZXR1cm47XG4gICAgICB9KTtcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBsb2FkKG9yZGVySWQ6IHN0cmluZykge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBheGlvcyh7XG4gICAgICAgIHVybDogYC9hcGkvdjEvb3JkZXJzLyR7b3JkZXJJZH1gLFxuICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICB9KTtcblxuICAgICAgY29uc3Qgb3JkZXIgPSByZXMuZGF0YS5kb2MgYXMgT3JkZXI7XG5cbiAgICAgIHRoaXMucmVuZGVyKGBcbiAgICAgICAgPGRpdiBjbGFzcz1cIm9yZGVyLWluZm9fX2dyb3VwXCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm9yZGVyLWluZm9fX2dyb3VwLXRpdGxlXCI+T3JkZXIgSUQ6IDwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwib3JkZXItaW5mb19fZ3JvdXAtZGV0YWlsXCI+JHtvcmRlci5faWR9PC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm9yZGVyLWluZm9fX2dyb3VwXCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm9yZGVyLWluZm9fX2dyb3VwLXRpdGxlXCI+UHJvZHVjdDogPC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJvcmRlci1pbmZvX19ncm91cC1kZXRhaWxcIj4ke29yZGVyLnByb2R1Y3QubmFtZX08L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwib3JkZXItaW5mb19fZ3JvdXBcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwib3JkZXItaW5mb19fZ3JvdXAtdGl0bGVcIj5BbW91bnQ6IDwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwib3JkZXItaW5mb19fZ3JvdXAtZGV0YWlsXCI+ICR7XG4gICAgICAgICAgICAgIG9yZGVyLmFtb3VudCA9PT0gMFxuICAgICAgICAgICAgICAgID8gMVxuICAgICAgICAgICAgICAgIDogYOKCrCR7b3JkZXIucHJvZHVjdC5wcmljZX0gJnRpbWVzOyAke29yZGVyLmFtb3VudH1gXG4gICAgICAgICAgICB9PC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm9yZGVyLWluZm9fX2dyb3VwXCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm9yZGVyLWluZm9fX2dyb3VwLXRpdGxlXCI+VG90YWw6IDwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwib3JkZXItaW5mb19fZ3JvdXAtZGV0YWlsXCI+XG4gICAgICAgICAgICAgICR7b3JkZXIudG90YWxQcmljZSA9PT0gMCA/IFwiRlJFRVwiIDogYOKCrCR7b3JkZXIudG90YWxQcmljZX1gfVxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm9yZGVyLWluZm9fX2dyb3VwXCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm9yZGVyLWluZm9fX2dyb3VwLXRpdGxlXCI+QnV5ZXIgRW1haWw6IDwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwib3JkZXItaW5mb19fZ3JvdXAtZGV0YWlsXCI+JHtvcmRlci5idXllci5lbWFpbH08L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwib3JkZXItaW5mb19fZ3JvdXBcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwib3JkZXItaW5mb19fZ3JvdXAtdGl0bGVcIj5EZWxpdmVyeSBMb2NhdGlvbjogPC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJvcmRlci1pbmZvX19ncm91cC1kZXRhaWxcIj4ke29yZGVyLmJ1eWVyTG9jYXRpb259PC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm9yZGVyLWluZm9fX2dyb3VwXCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm9yZGVyLWluZm9fX2dyb3VwLXRpdGxlXCI+RGVsaXZlcnkgVGltZTogPC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJvcmRlci1pbmZvX19ncm91cC1kZXRhaWxcIj4ke1xuICAgICAgICAgICAgICBvcmRlci5wcm9kdWN0LmRlbGl2ZXJ5VGltZVxuICAgICAgICAgICAgfSBEYXlzPC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm9yZGVyLWluZm9fX2dyb3VwXCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm9yZGVyLWluZm9fX2dyb3VwLXRpdGxlXCI+U3VibWl0dGVkIEF0OiA8L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm9yZGVyLWluZm9fX2dyb3VwLWRldGFpbFwiPiR7Zm9ybWF0RGF0ZShcbiAgICAgICAgICAgICAgb3JkZXIuY3JlYXRlZEF0XG4gICAgICAgICAgICApfTwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgICR7XG4gICAgICAgICAgb3JkZXIuc3RhdGUgPT09IFwiZGVsaXZlcmVkXCJcbiAgICAgICAgICAgID8gYDxkaXYgY2xhc3M9XCJvcmRlci1pbmZvX19ncm91cFwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwib3JkZXItaW5mb19fZ3JvdXAtdGl0bGVcIj5TdGF0dXM6IDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm9yZGVyLWluZm9fX2dyb3VwLWRldGFpbFwiPiR7XG4gICAgICAgICAgICAgICAgICBvcmRlci5zdGF0ZVxuICAgICAgICAgICAgICAgIH0gYXQgJHtmb3JtYXREYXRlKG9yZGVyLnVwZGF0ZWRBdCl9PC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+YFxuICAgICAgICAgICAgOiBcIlwiXG4gICAgICAgIH1cbiAgICAgICAgJHtcbiAgICAgICAgICBvcmRlci5zdGF0ZSA9PT0gXCJwZW5kaW5nXCJcbiAgICAgICAgICAgID8gYDxkaXYgY2xhc3M9XCJvcmRlci1lZGl0X19jb250YWluZXJcIj5cbiAgICAgICAgICAgICAgIDxidXR0b24gaWQ9XCJzZXRBc0RlbGl2ZXJlZFwiIGRhdGEtaWQ9XCIke29yZGVyLl9pZH1cIiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiPlNldCBhcyBkZWxpdmVyZWQ8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PmBcbiAgICAgICAgICAgIDogXCJcIlxuICAgICAgICB9XG4gICAgICBgKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHNldEFzRGVsaXZlcmVkSGFuZGxlcihlOiBFdmVudCkge1xuICAgIHRyeSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCBhcyBIVE1MQnV0dG9uRWxlbWVudDtcbiAgICAgIHRhcmdldC50ZXh0Q29udGVudCA9IFwiU2V0dGluZ1wiO1xuICAgICAgdGFyZ2V0LmRpc2FibGVkID0gdHJ1ZTtcblxuICAgICAgYXdhaXQgYXhpb3Moe1xuICAgICAgICB1cmw6IGAvYXBpL3YxL29yZGVycy8ke3RhcmdldC5kYXRhc2V0LmlkfWAsXG4gICAgICAgIG1ldGhvZDogXCJQQVRDSFwiLFxuICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBzdGF0ZTogXCJkZWxpdmVyZWRcIixcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmNsb3NlSGFuZGxlcigpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgIHRoaXMuY2xvc2VIYW5kbGVyKCk7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgYXhpb3MgZnJvbSBcImF4aW9zXCI7XG5cbmltcG9ydCBNb2RhbCBmcm9tIFwiLi9Nb2RhbFwiO1xuaW1wb3J0IFByb2R1Y3QgZnJvbSBcIi4uL3R5cGVzL1Byb2R1Y3RcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT3JkZXJQcm9kdWN0TW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG4gIHByaXZhdGUgb3JkZXJUb3RhbEVsITogSFRNTFBhcmFncmFwaEVsZW1lbnQ7XG4gIHByaXZhdGUgcHJpY2U/OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBvcmRlclR5cGU6IHN0cmluZyxcbiAgICBwcm9kdWN0SWQ6IHN0cmluZyxcbiAgICBwcml2YXRlIHF1YW50aXR5OiBudW1iZXJcbiAgKSB7XG4gICAgc3VwZXIoXCJOZXcgT3JkZXJcIik7XG5cbiAgICB0aGlzLmxvYWQocHJvZHVjdElkKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLm9yZGVyVG90YWxFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxuICAgICAgICAgIFwib3JkZXJUb3RhbFwiXG4gICAgICAgICkgYXMgSFRNTFBhcmFncmFwaEVsZW1lbnQ7XG5cbiAgICAgICAgZG9jdW1lbnRcbiAgICAgICAgICAuZ2V0RWxlbWVudEJ5SWQoXCJtb2RhbE9yZGVyQW1vdW50XCIpXG4gICAgICAgICAgPy5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgXCJjaGFuZ2VcIixcbiAgICAgICAgICAgIHRoaXMub3JkZXJBbW91bnRDaGFuZ2VIYW5kbGVyLmJpbmQodGhpcylcbiAgICAgICAgICApO1xuXG4gICAgICAgIHRoaXMuZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3VibWl0T3JkZXJcIikgYXMgSFRNTEZvcm1FbGVtZW50O1xuXG4gICAgICAgIHRoaXMuZm9ybS5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgIFwic3VibWl0XCIsXG4gICAgICAgICAgdGhpcy5vcmRlclN1Ym1pdEhhbmRsZXIuYmluZCh0aGlzKVxuICAgICAgICApO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoXykgPT4ge1xuICAgICAgICByZXR1cm47XG4gICAgICB9KTtcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBsb2FkKHByb2R1Y3RJZDogc3RyaW5nKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGF4aW9zKHtcbiAgICAgICAgdXJsOiBgL2FwaS92MS9wcm9kdWN0cy8ke3Byb2R1Y3RJZH1gLFxuICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICB9KTtcblxuICAgICAgY29uc3QgcHJvZHVjdCA9IHJlcy5kYXRhLmRvYyBhcyBQcm9kdWN0O1xuXG4gICAgICBpZiAodGhpcy5vcmRlclR5cGUgPT09IFwiRlJFRVwiKSB7XG4gICAgICAgIHRoaXMucmVuZGVyKGBcbiAgICAgICAgICA8Zm9ybSBpZD1cInN1Ym1pdE9yZGVyXCIgY2xhc3M9XCJvcmRlci1tb2RhbFwiIGRhdGEtaWQ9XCIke3Byb2R1Y3RJZH1cIj5cbiAgICAgICAgICAgIDxoMyBjbGFzcz1cIm9yZGVyLW1vZGFsX190aXRsZVwiPiR7cHJvZHVjdC5uYW1lfTwvaDM+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwib3JkZXItbW9kYWxfX2luZm9cIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJvcmRlci1tb2RhbF9fc2luZ2xlLXByaWNlXCI+RlJFRTwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tY29udHJvbFwiPlxuICAgICAgICAgICAgICAgIDxsYWJlbD5EZWxpdmVyeSBMb2NhdGlvbiAqPC9sYWJlbD5cbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBuYW1lPVwiYnV5ZXJMb2NhdGlvblwiIHBsYWNlaG9sZGVyPVwiUHV0IHlvdXIgZGVsaXZlcnkgbG9jYXRpb24gaGVyZS4uLlwiIHJlcXVpcmVkPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1jb250cm9sIG9yZGVyLW1vZGFsX190b3RhbFwiPlxuICAgICAgICAgICAgICA8bGFiZWw+VG90YWwgUHJpY2U8L2xhYmVsPlxuICAgICAgICAgICAgICA8cCBpZD1cIm9yZGVyVG90YWxcIj5GUkVFPC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiPk9yZGVyIE5vdzwvYnV0dG9uPlxuICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgYCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5wcmljZSA9IHByb2R1Y3QucHJpY2U7XG5cbiAgICAgIHRoaXMucmVuZGVyKGBcbiAgICAgICAgPGZvcm0gaWQ9XCJzdWJtaXRPcmRlclwiIGNsYXNzPVwib3JkZXItbW9kYWxcIiBkYXRhLWlkPVwiJHtwcm9kdWN0SWR9XCI+XG4gICAgICAgICAgPGgzIGNsYXNzPVwib3JkZXItbW9kYWxfX3RpdGxlXCI+JHtwcm9kdWN0Lm5hbWV9PC9oMz5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwib3JkZXItbW9kYWxfX2luZm9cIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwib3JkZXItbW9kYWxfX3NpbmdsZS1wcmljZVwiPuKCrCR7cHJvZHVjdC5wcmljZX08L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm9yZGVyLW1vZGFsX19zaW5nbGUtcHJpY2VcIj4mdGltZXM7PC9zcGFuPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tY29udHJvbCBmb3JtLWNvbnRyb2xfX21pbmkgb3JkZXItbW9kYWxfX2Ftb3VudFwiPlxuICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJvcmRlckFtb3VudFwiPlF0eTo8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDxpbnB1dCBpZD1cIm1vZGFsT3JkZXJBbW91bnRcIiBuYW1lPVwib3JkZXJBbW91bnRcIiB0eXBlPVwibnVtYmVyXCIgbWluPVwiMVwiIHZhbHVlPVwiJHtcbiAgICAgICAgICAgICAgICAgIHRoaXMucXVhbnRpdHlcbiAgICAgICAgICAgICAgICB9XCIgcmVxdWlyZWQ+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1jb250cm9sXCI+XG4gICAgICAgICAgICAgIDxsYWJlbD5EZWxpdmVyeSBMb2NhdGlvbiAqPC9sYWJlbD5cbiAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cImJ1eWVyTG9jYXRpb25cIiBwbGFjZWhvbGRlcj1cIlB1dCB5b3VyIGRlbGl2ZXJ5IGxvY2F0aW9uIGhlcmUuLi5cIiByZXF1aXJlZD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1jb250cm9sIG9yZGVyLW1vZGFsX190b3RhbFwiPlxuICAgICAgICAgICAgPGxhYmVsPlRvdGFsIFByaWNlPC9sYWJlbD5cbiAgICAgICAgICAgIDxwIGlkPVwib3JkZXJUb3RhbFwiPuKCrCR7cHJvZHVjdC5wcmljZSAqIHRoaXMucXVhbnRpdHl9PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxidXR0b24gdHlwZT1cInN1Ym1pdFwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCI+T3JkZXIgTm93PC9idXR0b24+XG4gICAgICAgIDwvZm9ybT5cbiAgICBgKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG9yZGVyQW1vdW50Q2hhbmdlSGFuZGxlcihlOiBFdmVudCkge1xuICAgIGlmICghdGhpcy5wcmljZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgdGhpcy5vcmRlclRvdGFsRWwudGV4dENvbnRlbnQgPSBg4oKsJHt0aGlzLnByaWNlISAqICt0YXJnZXQudmFsdWV9YDtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgb3JkZXJTdWJtaXRIYW5kbGVyKGU6IEV2ZW50KSB7XG4gICAgdHJ5IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgY29uc3QgYW1vdW50SW5wdXQgPSB0aGlzLmZvcm0hLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgIGBpbnB1dFtuYW1lPVwib3JkZXJBbW91bnRcIl1gXG4gICAgICApIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgICBjb25zdCBidXllckxvY2F0aW9uSW5wdXQgPSB0aGlzLmZvcm0hLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgIGBpbnB1dFtuYW1lPVwiYnV5ZXJMb2NhdGlvblwiXWBcbiAgICAgICkgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICAgIGNvbnN0IHN1Ym1pdEJ0biA9IHRoaXMuZm9ybSEucXVlcnlTZWxlY3RvcihcbiAgICAgICAgYGJ1dHRvblt0eXBlPVwic3VibWl0XCJdYFxuICAgICAgKSEgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG5cbiAgICAgIHN1Ym1pdEJ0bi50ZXh0Q29udGVudCA9IFwiT3JkZXJpbmdcIjtcbiAgICAgIHN1Ym1pdEJ0bi5kaXNhYmxlZCA9IHRydWU7XG5cbiAgICAgIGF3YWl0IGF4aW9zKHtcbiAgICAgICAgdXJsOiBgL2FwaS92MS9vcmRlcnMke3RoaXMub3JkZXJUeXBlID09PSBcIkZSRUVcIiA/IFwiP3R5cGU9ZnJlZVwiIDogXCJcIn1gLFxuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBwcm9kdWN0OiB0aGlzLmZvcm0/LmRhdGFzZXQuaWQsXG4gICAgICAgICAgYnV5ZXJMb2NhdGlvbjogYnV5ZXJMb2NhdGlvbklucHV0LnZhbHVlLFxuICAgICAgICAgIGFtb3VudDogK2Ftb3VudElucHV0Py52YWx1ZSB8fCAwLFxuICAgICAgICAgIHRvdGFsUHJpY2U6XG4gICAgICAgICAgICAoK2Ftb3VudElucHV0Py52YWx1ZSAmJiB0aGlzLnByaWNlISAqICthbW91bnRJbnB1dD8udmFsdWUpIHx8IDAsXG4gICAgICAgIH0sXG4gICAgICB9KTtcblxuICAgICAgdGhpcy5jbG9zZUhhbmRsZXIoZmFsc2UpO1xuICAgICAgbG9jYXRpb24uaHJlZiA9IFwiL29yZGVyc1wiO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhpcy5jbG9zZUhhbmRsZXIoKTtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIjtcblxuaW1wb3J0IE1vZGFsIGZyb20gXCIuL01vZGFsXCI7XG5pbXBvcnQgU3RvcmUgZnJvbSBcIi4uL3R5cGVzL1N0b3JlXCI7XG5pbXBvcnQgUHJvZHVjdCBmcm9tIFwiLi4vdHlwZXMvUHJvZHVjdFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcm9kdWN0TW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG4gIHByaXZhdGUgc2VsZWN0ITogSFRNTFNlbGVjdEVsZW1lbnQ7XG4gIHByaXZhdGUgcGhvdG9JbnB1dHMhOiBIVE1MRGl2RWxlbWVudDtcbiAgcHJpdmF0ZSBwaG90b051bWJlciA9IDE7XG5cbiAgY29uc3RydWN0b3IocmVsb2FkRm46IEZ1bmN0aW9uLCBwcm9kdWN0SWQ/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihcIk5ldyBQcm9kdWN0XCIsIHByb2R1Y3RJZCA/IFwiRURJVEFCTEVcIiA6IFwiQ1JFQVRBQkxFXCIsIHJlbG9hZEZuKTtcblxuICAgIHRoaXMubG9hZChwcm9kdWN0SWQpXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMuZm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubW9kYWwtZm9ybVwiKSBhcyBIVE1MRm9ybUVsZW1lbnQ7XG4gICAgICAgIHRoaXMuc2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXG4gICAgICAgICAgXCJzdG9yZVNlbGVjdFwiXG4gICAgICAgICkgYXMgSFRNTFNlbGVjdEVsZW1lbnQ7XG4gICAgICAgIHRoaXMucGhvdG9JbnB1dHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcbiAgICAgICAgICBcInBob3RvSW5wdXRzXCJcbiAgICAgICAgKSBhcyBIVE1MRGl2RWxlbWVudDtcblxuICAgICAgICB0aGlzLnNlbGVjdENoYW5nZUhhbmRsZXIoKTtcblxuICAgICAgICB0aGlzLnNlbGVjdC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgIFwiY2hhbmdlXCIsXG4gICAgICAgICAgdGhpcy5zZWxlY3RDaGFuZ2VIYW5kbGVyLmJpbmQodGhpcylcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5mb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgdGhpcy5zdWJtaXRIYW5kbGVyLmJpbmQodGhpcykpO1xuICAgICAgICBkb2N1bWVudFxuICAgICAgICAgIC5nZXRFbGVtZW50QnlJZChcImFkZFBob3RvXCIpIVxuICAgICAgICAgIC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5hZGRQaG90b0hhbmRsZXIuYmluZCh0aGlzKSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKChfKSA9PiB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0pO1xuICB9XG5cbiAgcHJvdGVjdGVkIGFzeW5jIGxvYWQocHJvZHVjdElkPzogc3RyaW5nKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBidXR0b25zO1xuICAgICAgbGV0IHN0b3JlVmFsdWUgPSBcIlwiO1xuICAgICAgbGV0IG5hbWVWYWx1ZSA9IFwiXCI7XG4gICAgICBsZXQgZGVzY3JpcHRpb25WYWx1ZSA9IFwiXCI7XG4gICAgICBsZXQgcGhvdG9zVmFsdWUgPSBbXCJcIl07XG4gICAgICBsZXQgcHJpY2VWYWx1ZSA9IDA7XG4gICAgICBsZXQgZGVsaXZlcnlWYWx1ZSA9IDA7XG4gICAgICBsZXQgYXZhaWxhYmlsaXR5VmFsdWUgPSBcIlwiO1xuICAgICAgbGV0IGZpZFBvaW50c1ZhbHVlID0gMDtcbiAgICAgIGlmIChwcm9kdWN0SWQpIHtcbiAgICAgICAgYnV0dG9ucyA9IGBcbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIj5FZGl0PC9idXR0b24+XG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGlkPVwiZGVsZXRlRG9jXCIgY2xhc3M9XCJidG4gYnRuLWRhbmdlclwiPkRlbGV0ZTwvYnV0dG9uPlxuICAgICAgYDtcbiAgICAgICAgY29uc3QgeyBkYXRhIH0gPSBhd2FpdCBheGlvcyh7XG4gICAgICAgICAgdXJsOiBgL2FwaS92MS9wcm9kdWN0cy8ke3Byb2R1Y3RJZH1gLFxuICAgICAgICAgIG1ldGhvZDogXCJHRVRcIixcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgZG9jID0gZGF0YS5kb2MgYXMgUHJvZHVjdDtcblxuICAgICAgICBzdG9yZVZhbHVlID0gZG9jLnN0b3JlLl9pZDtcbiAgICAgICAgbmFtZVZhbHVlID0gZG9jLm5hbWU7XG4gICAgICAgIGRlc2NyaXB0aW9uVmFsdWUgPSBkb2MuZGVzY3JpcHRpb247XG4gICAgICAgIHBob3Rvc1ZhbHVlID0gZG9jLnBob3RvcztcbiAgICAgICAgcHJpY2VWYWx1ZSA9IGRvYy5wcmljZTtcbiAgICAgICAgZGVsaXZlcnlWYWx1ZSA9IGRvYy5kZWxpdmVyeVRpbWU7XG4gICAgICAgIGF2YWlsYWJpbGl0eVZhbHVlID0gZG9jLmF2YWlsYWJpbGl0eTtcbiAgICAgICAgZmlkUG9pbnRzVmFsdWUgPSBkb2MuZmlkUG9pbnRzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnV0dG9ucyA9IGA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiPlN1Ym1pdDwvYnV0dG9uPmA7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHN0b3Jlc1JlcyA9IGF3YWl0IGF4aW9zKHtcbiAgICAgICAgdXJsOiBcIi9hcGkvdjEvc3RvcmVzXCIsXG4gICAgICAgIG1ldGhvZDogXCJHRVRcIixcbiAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgYWxsOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHN0b3Jlc0RhdGEgPSBzdG9yZXNSZXMuZGF0YS5kYXRhIGFzIFtTdG9yZV07XG5cbiAgICAgIGlmICghc3RvcmVzRGF0YS5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5yZW5kZXIoXG4gICAgICAgICAgYFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWVycm9yXCI+XG4gICAgICAgICAgICAgIDxoMz5ObyBzdG9yZSB3YXMgY3JlYXRlZCE8L2gzPlxuICAgICAgICAgICAgICA8ZW0+KFBsZWFzZSBjcmVhdGUgYSBzdG9yZSBmaXJzdCk8L2VtPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgYFxuICAgICAgICApO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDQU5DRUxcIik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucmVuZGVyKGBcbiAgICAgICAgPGZvcm0gY2xhc3M9XCJtb2RhbC1mb3JtXCIgZGF0YS1pZD1cIiR7cHJvZHVjdElkIHx8IFwiXCJ9XCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tY29udHJvbFwiPlxuICAgICAgICAgICAgPGxhYmVsPlN0b3JlPC9sYWJlbD5cbiAgICAgICAgICAgICAgPHNlbGVjdCBpZD1cInN0b3JlU2VsZWN0XCIgbmFtZT1cInN0b3JlXCI+XG4gICAgICAgICAgICAgICAgJHtzdG9yZXNEYXRhXG4gICAgICAgICAgICAgICAgICA/Lm1hcCgoc3RvcmUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgICAgICAgICAgPG9wdGlvblxuICAgICAgICAgICAgICAgICAgICBkYXRhLWlkPVwiJHtzdG9yZS5faWR9XCJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9XCIke3N0b3JlLm5hbWV9XCJcbiAgICAgICAgICAgICAgICAgICAgJHtzdG9yZS5faWQgPT09IHN0b3JlVmFsdWUgPyBcInNlbGVjdGVkXCIgOiBcIlwifT5cbiAgICAgICAgICAgICAgICAgICAgICAke3N0b3JlLm5hbWV9XG4gICAgICAgICAgICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgYDtcbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAuam9pbihcIlwiKX1cbiAgICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tY29udHJvbFwiPlxuICAgICAgICAgICAgICA8bGFiZWw+UHJvZHVjdCBOYW1lPC9sYWJlbD5cbiAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cIm5hbWVcIiB2YWx1ZT1cIiR7XG4gICAgICAgICAgICAgICAgbmFtZVZhbHVlIHx8IFwiXCJcbiAgICAgICAgICAgICAgfVwiIHBsYWNlaG9sZGVyPVwiUHV0IHRoZSBuYW1lIGhlcmUuLi5cIj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1jb250cm9sXCI+XG4gICAgICAgICAgICAgIDxsYWJlbD5Qcm9kdWN0IERlc2NyaXB0aW9uPC9sYWJlbD5cbiAgICAgICAgICAgICAgPHRleHRhcmVhIFxuICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgbmFtZT1cImRlc2NyaXB0aW9uXCJcbiAgICAgICAgICAgICAgIHJvd3M9XCI2XCJcbiAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiUHV0IHRoZSBkZXNjcmlwdGlvbiBoZXJlLi4uXCJcbiAgICAgICAgICAgICAgPiR7ZGVzY3JpcHRpb25WYWx1ZSB8fCBcIlwifTwvdGV4dGFyZWE+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tY29udHJvbFwiPlxuICAgICAgICAgICAgICA8bGFiZWw+UHJvZHVjdCBQaG90bzwvbGFiZWw+XG4gICAgICAgICAgICAgICAgPGRpdiBpZD1cInBob3RvSW5wdXRzXCI+XG4gICAgICAgICAgICAgICAgICAke1xuICAgICAgICAgICAgICAgICAgICBwaG90b3NWYWx1ZVxuICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKHBob3RvVmFsdWUsIGkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICAgICAgICAgICAgPGlucHV0IFxuICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT1cIiR7cGhvdG9WYWx1ZX1cIlxuICAgICAgICAgICAgICAgICAgICAgIG5hbWU9XCJwaG90byR7aSArIDF9XCJcbiAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlB1dCB0aGUgcGhvdG8gdXJsIGhlcmUuLi5cIlxuICAgICAgICAgICAgICAgICAgICAgICR7aSA9PT0gMCA/IFwicmVxdWlyZWRcIiA6IFwiXCJ9XG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICBgO1xuICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgLmpvaW4oXCJcIikgfHxcbiAgICAgICAgICAgICAgICAgICAgYDxpbnB1dCBcbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICBuYW1lPVwicGhvdG8xXCJcbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJQdXQgdGhlIHBob3RvIHVybCBoZXJlLi4uXCJcbiAgICAgICAgICAgICAgICAgICAgPmBcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCIgaWQ9XCJhZGRQaG90b1wiPk5ldyBQaG90bzwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIj5cbiAgICAgICAgICAgICAgPGxhYmVsPlByb2R1Y3QgUHJpY2U8L2xhYmVsPlxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgbmFtZT1cInByaWNlXCJcbiAgICAgICAgICAgICAgIHZhbHVlPVwiJHtwcmljZVZhbHVlfVwiXG4gICAgICAgICAgICAgICBzdGVwPVwiLjAxXCJcbiAgICAgICAgICAgICAgIG1pbj1cIjFcIlxuICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJQdXQgdGhlIHByaWNlIHdpdGggZXVyb3MgaGVyZS4uLlwiXG4gICAgICAgICAgICAgID5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1jb250cm9sXCI+XG4gICAgICAgICAgICAgIDxsYWJlbD5Qcm9kdWN0IERlbGl2ZXJ5IFRpbWU8L2xhYmVsPlxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgbmFtZT1cImRlbGl2ZXJ5XCJcbiAgICAgICAgICAgICAgIHZhbHVlPVwiJHtkZWxpdmVyeVZhbHVlfVwiXG4gICAgICAgICAgICAgICBtaW49XCIxXCJcbiAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiUHV0IHRoZSBkZWxpdmVyeSB0aW1lIGhlcmUgYXMgbnVtYmVyIG9mIGRheXMuLi5cIlxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBpZD1cImF2YWlsYWJpbGl0eUNoZWNrXCIgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIj5cbiAgICAgICAgICAgICAgPGxhYmVsPkF2YWlsYWJpbGl0eTwvbGFiZWw+XG4gICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJyYWRpb1wiIGlkPVwiaW5TdG9ja1wiIG5hbWU9XCJhdmFpbGFiaWxpdHlcIiB2YWx1ZT1cIkluIFN0b2NrXCIgJHtcbiAgICAgICAgICAgICAgICAgIGF2YWlsYWJpbGl0eVZhbHVlID09PSBcIk91dCBvZiBTdG9ja1wiID8gXCJcIiA6IFwiY2hlY2tlZFwiXG4gICAgICAgICAgICAgICAgfT5cbiAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJyYWRpby1sYWJlbFwiIGZvcj1cImluU3RvY2tcIj5JbiBTdG9jazwvbGFiZWw+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicmFkaW9cIiBpZD1cIm91dE9mU3RvY2tcIiBuYW1lPVwiYXZhaWxhYmlsaXR5XCIgdmFsdWU9XCJPdXQgb2YgU3RvY2tcIiAke1xuICAgICAgICAgICAgICAgICAgYXZhaWxhYmlsaXR5VmFsdWUgPT09IFwiT3V0IG9mIFN0b2NrXCIgPyBcImNoZWNrZWRcIiA6IFwiXCJcbiAgICAgICAgICAgICAgICB9PlxuICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cInJhZGlvLWxhYmVsXCIgZm9yPVwib3V0T2ZTdG9ja1wiPk91dCBvZiBTdG9jazwvbGFiZWw+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIj5cbiAgICAgICAgICAgICAgPGxhYmVsPlByb2R1Y3QgRmlkIFBvaW50czwvbGFiZWw+XG4gICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwibnVtYmVyXCIgbmFtZT1cImZpZFBvaW50c1wiIHZhbHVlPVwiJHtcbiAgICAgICAgICAgICAgICBmaWRQb2ludHNWYWx1ZSB8fCBcIlwiXG4gICAgICAgICAgICAgIH1cIiBwbGFjZWhvbGRlcj1cIlB1dCB0aGUgZmlkIHBvaW50cyBoZXJlLi4uXCI+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tc3VibWl0XCI+XG4gICAgICAgICAgICAgICR7YnV0dG9uc31cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9mb3JtPlxuICAgIGApO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc2VsZWN0Q2hhbmdlSGFuZGxlcigpIHtcbiAgICBsZXQgc2VsZWN0ZWRPcHRpb24gPSB0aGlzLnNlbGVjdC5vcHRpb25zW3RoaXMuc2VsZWN0LnNlbGVjdGVkSW5kZXhdO1xuICAgIGlmICghc2VsZWN0ZWRPcHRpb24pIHtcbiAgICAgIHRoaXMuc2VsZWN0Lm9wdGlvbnNbMF0uc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgc2VsZWN0ZWRPcHRpb24gPSB0aGlzLnNlbGVjdC5vcHRpb25zWzBdO1xuICAgIH1cbiAgICB0aGlzLnNlbGVjdC5kYXRhc2V0LmlkID0gc2VsZWN0ZWRPcHRpb24uZGF0YXNldC5pZDtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgc3VibWl0SGFuZGxlcihlOiBFdmVudCkge1xuICAgIHRyeSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIGNvbnN0IHN0b3JlSW5wdXQgPSB0aGlzLmZvcm0hLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgIGBzZWxlY3RbbmFtZT1cInN0b3JlXCJdYFxuICAgICAgKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgICAgY29uc3QgbmFtZUlucHV0ID0gdGhpcy5mb3JtIS5xdWVyeVNlbGVjdG9yKFxuICAgICAgICBgaW5wdXRbbmFtZT1cIm5hbWVcIl1gXG4gICAgICApIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgICBjb25zdCBkZXNjcmlwdGlvbklucHV0ID0gdGhpcy5mb3JtIS5xdWVyeVNlbGVjdG9yKFxuICAgICAgICBgdGV4dGFyZWFbbmFtZT1cImRlc2NyaXB0aW9uXCJdYFxuICAgICAgKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgICAgY29uc3QgcGhvdG9JbnB1dHMgPSBBcnJheS5mcm9tKFxuICAgICAgICB0aGlzLnBob3RvSW5wdXRzLnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnB1dFwiKVxuICAgICAgKTtcbiAgICAgIGNvbnN0IHByaWNlSW5wdXQgPSB0aGlzLmZvcm0hLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgIGBpbnB1dFtuYW1lPVwicHJpY2VcIl1gXG4gICAgICApIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgICBjb25zdCBkZWxpdmVyeUlucHV0ID0gdGhpcy5mb3JtIS5xdWVyeVNlbGVjdG9yKFxuICAgICAgICBgaW5wdXRbbmFtZT1cImRlbGl2ZXJ5XCJdYFxuICAgICAgKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgICAgY29uc3QgZmlkUG9pbnRzSW5wdXQgPSB0aGlzLmZvcm0hLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgIGBpbnB1dFtuYW1lPVwiZmlkUG9pbnRzXCJdYFxuICAgICAgKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgICAgY29uc3QgaW5TdG9ja0lucHV0ID0gdGhpcy5mb3JtIS5xdWVyeVNlbGVjdG9yKFxuICAgICAgICBgaW5wdXRbaWQ9XCJpblN0b2NrXCJdYFxuICAgICAgKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgICAgY29uc3Qgc3VibWl0QnRuID0gdGhpcy5mb3JtIS5xdWVyeVNlbGVjdG9yKFxuICAgICAgICBgYnV0dG9uW3R5cGU9XCJzdWJtaXRcIl1gXG4gICAgICApISBhcyBIVE1MQnV0dG9uRWxlbWVudDtcblxuICAgICAgc3VibWl0QnRuLnRleHRDb250ZW50ID0gXCJTdWJtaXR0aW5nXCI7XG4gICAgICBzdWJtaXRCdG4uZGlzYWJsZWQgPSB0cnVlO1xuXG4gICAgICBjb25zdCBwcm9kdWN0SWQgPSB0aGlzLmZvcm0/LmRhdGFzZXQuaWQ7XG4gICAgICBhd2FpdCBheGlvcyh7XG4gICAgICAgIHVybDpcbiAgICAgICAgICB0aGlzLnR5cGUgPT09IFwiQ1JFQVRBQkxFXCJcbiAgICAgICAgICAgID8gXCIvYXBpL3YxL3Byb2R1Y3RzXCJcbiAgICAgICAgICAgIDogYC9hcGkvdjEvcHJvZHVjdHMvJHtwcm9kdWN0SWR9YCxcbiAgICAgICAgbWV0aG9kOiB0aGlzLnR5cGUgPT09IFwiQ1JFQVRBQkxFXCIgPyBcIlBPU1RcIiA6IFwiUEFUQ0hcIixcbiAgICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgc3RvcmU6IHN0b3JlSW5wdXQuZGF0YXNldC5pZCxcbiAgICAgICAgICBuYW1lOiBuYW1lSW5wdXQudmFsdWUsXG4gICAgICAgICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uSW5wdXQudmFsdWUudHJpbSgpLFxuICAgICAgICAgIHBob3RvczogcGhvdG9JbnB1dHNcbiAgICAgICAgICAgIC5maWx0ZXIoKGlucHV0KSA9PiBpbnB1dC52YWx1ZSAhPT0gXCJcIilcbiAgICAgICAgICAgIC5tYXAoKGlucHV0KSA9PiBpbnB1dC52YWx1ZSksXG4gICAgICAgICAgcHJpY2U6ICtwcmljZUlucHV0LnZhbHVlLFxuICAgICAgICAgIGRlbGl2ZXJ5VGltZTogK2RlbGl2ZXJ5SW5wdXQudmFsdWUsXG4gICAgICAgICAgZmlkUG9pbnRzOiArZmlkUG9pbnRzSW5wdXQudmFsdWUsXG4gICAgICAgICAgYXZhaWxhYmlsaXR5OiBpblN0b2NrSW5wdXQuY2hlY2tlZCA/IFwiSW4gU3RvY2tcIiA6IFwiT3V0IG9mIFN0b2NrXCIsXG4gICAgICAgIH0sXG4gICAgICB9KTtcblxuICAgICAgdGhpcy5jbG9zZUhhbmRsZXIoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRoaXMuY2xvc2VIYW5kbGVyKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhZGRQaG90b0hhbmRsZXIoZTogRXZlbnQpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgY29uc3QgcHJldklucHV0ID0gdGhpcy5waG90b0lucHV0cy5sYXN0RWxlbWVudENoaWxkISBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgIGlmICghcHJldklucHV0Py52YWx1ZSB8fCAhcHJldklucHV0Py52YWx1ZS50cmltKCkpIHtcbiAgICAgIHByZXZJbnB1dC5mb2N1cygpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICArK3RoaXMucGhvdG9OdW1iZXI7XG4gICAgY29uc3QgcGhvdG9JbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcbiAgICBwaG90b0lucHV0LnR5cGUgPSBcInRleHRcIjtcbiAgICBwaG90b0lucHV0Lm5hbWUgPSBgcGhvdG8ke3RoaXMucGhvdG9OdW1iZXJ9YDtcbiAgICBwaG90b0lucHV0LnBsYWNlaG9sZGVyID0gXCJQdXQgdGhlIHBob3RvIHVybCBoZXJlLi4uXCI7XG5cbiAgICB0aGlzLnBob3RvSW5wdXRzLmluc2VydEFkamFjZW50RWxlbWVudChcImJlZm9yZWVuZFwiLCBwaG90b0lucHV0KTtcbiAgfVxuXG4gIHByb3RlY3RlZCBvdmVycmlkZSBhc3luYyBkZWxldGVEb2MoKSB7XG4gICAgYXdhaXQgYXhpb3Moe1xuICAgICAgdXJsOiBgL2FwaS92MS9wcm9kdWN0cy8ke3RoaXMuZm9ybT8uZGF0YXNldC5pZH1gLFxuICAgICAgbWV0aG9kOiBcIkRFTEVURVwiLFxuICAgIH0pO1xuICB9XG59XG4iLCJpbXBvcnQgYXhpb3MgZnJvbSBcImF4aW9zXCI7XG5cbmltcG9ydCBNb2RhbCBmcm9tIFwiLi9Nb2RhbFwiO1xuaW1wb3J0IFJld2FyZCBmcm9tIFwiLi4vdHlwZXMvUmV3YXJkXCI7XG5pbXBvcnQgUHJvZHVjdCBmcm9tIFwiLi4vdHlwZXMvUHJvZHVjdFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXdhcmRNb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgcHJpdmF0ZSBzZWxlY3QhOiBIVE1MU2VsZWN0RWxlbWVudDtcblxuICBjb25zdHJ1Y3RvcihyZWxvYWRGbjogRnVuY3Rpb24sIHJld2FyZElkPzogc3RyaW5nKSB7XG4gICAgc3VwZXIoXCJOZXcgUmV3YXJkXCIsIHJld2FyZElkID8gXCJFRElUQUJMRVwiIDogXCJDUkVBVEFCTEVcIiwgcmVsb2FkRm4pO1xuXG4gICAgdGhpcy5sb2FkKHJld2FyZElkKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLmZvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLm1vZGFsLWZvcm1cIikgYXMgSFRNTEZvcm1FbGVtZW50O1xuICAgICAgICB0aGlzLnNlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxuICAgICAgICAgIFwicHJvZHVjdFNlbGVjdFwiXG4gICAgICAgICkgYXMgSFRNTFNlbGVjdEVsZW1lbnQ7XG5cbiAgICAgICAgdGhpcy5zZWxlY3RDaGFuZ2VIYW5kbGVyKCk7XG5cbiAgICAgICAgdGhpcy5zZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICBcImNoYW5nZVwiLFxuICAgICAgICAgIHRoaXMuc2VsZWN0Q2hhbmdlSGFuZGxlci5iaW5kKHRoaXMpXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuZm9ybS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIHRoaXMuc3VibWl0SGFuZGxlci5iaW5kKHRoaXMpKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKF8pID0+IHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgYXN5bmMgbG9hZChyZXdhcmRJZD86IHN0cmluZykge1xuICAgIHRyeSB7XG4gICAgICBsZXQgYnV0dG9ucztcbiAgICAgIGxldCBwcm9kdWN0VmFsdWUgPSBcIlwiO1xuICAgICAgbGV0IGZpZFBvaW50c1ZhbHVlID0gMDtcbiAgICAgIGlmIChyZXdhcmRJZCkge1xuICAgICAgICBidXR0b25zID0gYFxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiPkVkaXQ8L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgaWQ9XCJkZWxldGVEb2NcIiBjbGFzcz1cImJ0biBidG4tZGFuZ2VyXCI+RGVsZXRlPC9idXR0b24+XG4gICAgICBgO1xuICAgICAgICBjb25zdCB7IGRhdGEgfSA9IGF3YWl0IGF4aW9zKHtcbiAgICAgICAgICB1cmw6IGAvYXBpL3YxL3Jld2FyZHMvJHtyZXdhcmRJZH1gLFxuICAgICAgICAgIG1ldGhvZDogXCJHRVRcIixcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgZG9jID0gZGF0YS5kb2MgYXMgUmV3YXJkO1xuXG4gICAgICAgIHByb2R1Y3RWYWx1ZSA9IGRvYy5wcm9kdWN0Ll9pZDtcbiAgICAgICAgZmlkUG9pbnRzVmFsdWUgPSBkb2MucmVxdWlyZWRQb2ludHM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBidXR0b25zID0gYDxidXR0b24gdHlwZT1cInN1Ym1pdFwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCI+U3VibWl0PC9idXR0b24+YDtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcHJvZHVjdHNSZXMgPSBhd2FpdCBheGlvcyh7XG4gICAgICAgIHVybDogXCIvYXBpL3YxL3Byb2R1Y3RzXCIsXG4gICAgICAgIG1ldGhvZDogXCJHRVRcIixcbiAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgYWxsOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHByb2R1Y3RzRGF0YSA9IHByb2R1Y3RzUmVzLmRhdGEuZGF0YSBhcyBbUHJvZHVjdF07XG5cbiAgICAgIGlmICghcHJvZHVjdHNEYXRhLmxlbmd0aCkge1xuICAgICAgICB0aGlzLnJlbmRlcihcbiAgICAgICAgICBgXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtZXJyb3JcIj5cbiAgICAgICAgICAgICAgPGgzPk5vIHByb2R1Y3Qgd2FzIGNyZWF0ZWQhPC9oMz5cbiAgICAgICAgICAgICAgPGVtPihQbGVhc2UgY3JlYXRlIGEgcHJvZHVjdCBmaXJzdCk8L2VtPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgYFxuICAgICAgICApO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDQU5DRUxcIik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucmVuZGVyKGBcbiAgICAgICAgPGZvcm0gY2xhc3M9XCJtb2RhbC1mb3JtXCIgZGF0YS1pZD1cIiR7cmV3YXJkSWQgfHwgXCJcIn1cIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1jb250cm9sXCI+XG4gICAgICAgICAgICAgIDxsYWJlbD5Qcm9kdWN0IFRvIEJlIFJld2FyZGVkPC9sYWJlbD5cbiAgICAgICAgICAgICAgPHNlbGVjdCBuYW1lPVwicHJvZHVjdFwiIGlkPVwicHJvZHVjdFNlbGVjdFwiPlxuICAgICAgICAgICAgICAgICR7cHJvZHVjdHNEYXRhXG4gICAgICAgICAgICAgICAgICA/Lm1hcCgocHJvZHVjdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYFxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uXG4gICAgICAgICAgICAgICAgICAgIGRhdGEtaWQ9XCIke3Byb2R1Y3QuX2lkfVwiXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPVwiJHtwcm9kdWN0Lm5hbWV9XCJcbiAgICAgICAgICAgICAgICAgICAgJHtwcm9kdWN0Ll9pZCA9PT0gcHJvZHVjdFZhbHVlID8gXCJzZWxlY3RlZFwiIDogXCJcIn0+XG4gICAgICAgICAgICAgICAgICAgICAgJHtwcm9kdWN0Lm5hbWV9XG4gICAgICAgICAgICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgYDtcbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAuam9pbihcIlwiKX1cbiAgICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tY29udHJvbFwiPlxuICAgICAgICAgICAgICA8bGFiZWw+UmVxdWlyZWQgRmlkIFBvaW50czwvbGFiZWw+XG4gICAgICAgICAgICAgIDxpbnB1dCBcbiAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgbmFtZT1cImZpZFBvaW50c1wiXG4gICAgICAgICAgICAgICB2YWx1ZT1cIiR7ZmlkUG9pbnRzVmFsdWUgfHwgXCJcIn1cIlxuICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJQdXQgdGhlIHJlcXVpcmVkIGZpZCBwb2ludHMgaGVyZS4uLlwiPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLXN1Ym1pdFwiPlxuICAgICAgICAgICAgICAke2J1dHRvbnN9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZm9ybT5cbiAgICBgKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNlbGVjdENoYW5nZUhhbmRsZXIoKSB7XG4gICAgbGV0IHNlbGVjdGVkT3B0aW9uID0gdGhpcy5zZWxlY3Qub3B0aW9uc1t0aGlzLnNlbGVjdC5zZWxlY3RlZEluZGV4XTtcbiAgICBpZiAoIXNlbGVjdGVkT3B0aW9uKSB7XG4gICAgICB0aGlzLnNlbGVjdC5vcHRpb25zWzBdLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgIHNlbGVjdGVkT3B0aW9uID0gdGhpcy5zZWxlY3Qub3B0aW9uc1swXTtcbiAgICB9XG4gICAgdGhpcy5zZWxlY3QuZGF0YXNldC5pZCA9IHNlbGVjdGVkT3B0aW9uLmRhdGFzZXQuaWQ7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHN1Ym1pdEhhbmRsZXIoZTogRXZlbnQpIHtcbiAgICB0cnkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICBjb25zdCBwcm9kdWN0SW5wdXQgPSB0aGlzLmZvcm0hLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgIGBzZWxlY3RbbmFtZT1cInByb2R1Y3RcIl1gXG4gICAgICApIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgICBjb25zdCBmaWRQb2ludHNJbnB1dCA9IHRoaXMuZm9ybSEucXVlcnlTZWxlY3RvcihcbiAgICAgICAgYGlucHV0W25hbWU9XCJmaWRQb2ludHNcIl1gXG4gICAgICApIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgICBjb25zdCBzdWJtaXRCdG4gPSB0aGlzLmZvcm0hLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgIGBidXR0b25bdHlwZT1cInN1Ym1pdFwiXWBcbiAgICAgICkhIGFzIEhUTUxCdXR0b25FbGVtZW50O1xuXG4gICAgICBzdWJtaXRCdG4udGV4dENvbnRlbnQgPSBcIlN1Ym1pdHRpbmdcIjtcbiAgICAgIHN1Ym1pdEJ0bi5kaXNhYmxlZCA9IHRydWU7XG5cbiAgICAgIGNvbnN0IHJld2FyZElkID0gdGhpcy5mb3JtPy5kYXRhc2V0LmlkO1xuXG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBheGlvcyh7XG4gICAgICAgIHVybDpcbiAgICAgICAgICB0aGlzLnR5cGUgPT09IFwiQ1JFQVRBQkxFXCJcbiAgICAgICAgICAgID8gXCIvYXBpL3YxL3Jld2FyZHNcIlxuICAgICAgICAgICAgOiBgL2FwaS92MS9yZXdhcmRzLyR7cmV3YXJkSWR9YCxcbiAgICAgICAgbWV0aG9kOiB0aGlzLnR5cGUgPT09IFwiQ1JFQVRBQkxFXCIgPyBcIlBPU1RcIiA6IFwiUEFUQ0hcIixcbiAgICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgcHJvZHVjdDogcHJvZHVjdElucHV0LmRhdGFzZXQuaWQsXG4gICAgICAgICAgcmVxdWlyZWRQb2ludHM6IGZpZFBvaW50c0lucHV0LnZhbHVlLFxuICAgICAgICB9LFxuICAgICAgfSk7XG5cbiAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG5cbiAgICAgIHRoaXMuY2xvc2VIYW5kbGVyKCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgdGhpcy5jbG9zZUhhbmRsZXIoKTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgYXN5bmMgZGVsZXRlRG9jKCkge1xuICAgIGF3YWl0IGF4aW9zKHtcbiAgICAgIHVybDogYC9hcGkvdjEvcmV3YXJkcy8ke3RoaXMuZm9ybT8uZGF0YXNldC5pZH1gLFxuICAgICAgbWV0aG9kOiBcIkRFTEVURVwiLFxuICAgIH0pO1xuICB9XG59XG4iLCJpbXBvcnQgYXhpb3MgZnJvbSBcImF4aW9zXCI7XG5pbXBvcnQgdmFsaWRhdG9yIGZyb20gXCJ2YWxpZGF0b3JcIjtcblxuaW1wb3J0IE1vZGFsIGZyb20gXCIuL01vZGFsXCI7XG5pbXBvcnQgU3RvcmUgZnJvbSBcIi4uL3R5cGVzL1N0b3JlXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0b3JlTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG4gIGNvbnN0cnVjdG9yKHJlbG9hZEZuOiBGdW5jdGlvbiwgc3RvcmVJZD86IHN0cmluZykge1xuICAgIHN1cGVyKFwiTmV3IFN0b3JlXCIsIHN0b3JlSWQgPyBcIkVESVRBQkxFXCIgOiBcIkNSRUFUQUJMRVwiLCByZWxvYWRGbik7XG5cbiAgICB0aGlzLmxvYWQoc3RvcmVJZCkudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLmZvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLm1vZGFsLWZvcm1cIikgYXMgSFRNTEZvcm1FbGVtZW50O1xuXG4gICAgICB0aGlzLmZvcm0uYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCB0aGlzLnN1Ym1pdEhhbmRsZXIuYmluZCh0aGlzKSk7XG4gICAgfSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgYXN5bmMgbG9hZChzdG9yZUlkPzogc3RyaW5nKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBidXR0b25zO1xuICAgICAgbGV0IG5hbWVWYWx1ZTtcbiAgICAgIGxldCBsb2NhdGlvblZhbHVlO1xuICAgICAgbGV0IHBhdGhWYWx1ZTtcbiAgICAgIGxldCBsb2dvVmFsdWU7XG4gICAgICBpZiAoc3RvcmVJZCkge1xuICAgICAgICBidXR0b25zID0gYFxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiPkVkaXQ8L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgaWQ9XCJkZWxldGVEb2NcIiBjbGFzcz1cImJ0biBidG4tZGFuZ2VyXCI+RGVsZXRlPC9idXR0b24+XG4gICAgICBgO1xuICAgICAgICBjb25zdCB7IGRhdGEgfSA9IGF3YWl0IGF4aW9zKHtcbiAgICAgICAgICB1cmw6IGAvYXBpL3YxL3N0b3Jlcy8ke3N0b3JlSWR9YCxcbiAgICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGRvYyA9IGRhdGEuZG9jIGFzIFN0b3JlO1xuXG4gICAgICAgIG5hbWVWYWx1ZSA9IGRvYy5uYW1lO1xuICAgICAgICBsb2NhdGlvblZhbHVlID0gZG9jLmxvY2F0aW9uO1xuICAgICAgICBwYXRoVmFsdWUgPSBkb2Muc3ViVXJsO1xuICAgICAgICBsb2dvVmFsdWUgPSBkb2MubG9nbztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJ1dHRvbnMgPSBgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIj5TdWJtaXQ8L2J1dHRvbj5gO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnJlbmRlcihgXG4gICAgICA8Zm9ybSBjbGFzcz1cIm1vZGFsLWZvcm1cIiBkYXRhLWlkPVwiJHtzdG9yZUlkIHx8IFwiXCJ9XCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tY29udHJvbFwiPlxuICAgICAgICAgICAgICA8bGFiZWw+U3RvcmUgTmFtZSAqPC9sYWJlbD5cbiAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cIm5hbWVcIiB2YWx1ZT1cIiR7XG4gICAgICAgICAgICAgICAgbmFtZVZhbHVlIHx8IFwiXCJcbiAgICAgICAgICAgICAgfVwiIHBsYWNlaG9sZGVyPVwiUHV0IHRoZSBuYW1lIGhlcmUuLi5cIiByZXF1aXJlZD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1jb250cm9sXCI+XG4gICAgICAgICAgICAgIDxsYWJlbD5TdG9yZSBMb2NhdGlvbiAqPC9sYWJlbD5cbiAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cImxvY2F0aW9uXCIgdmFsdWU9XCIke1xuICAgICAgICAgICAgICAgIGxvY2F0aW9uVmFsdWUgfHwgXCJcIlxuICAgICAgICAgICAgICB9XCIgcGxhY2Vob2xkZXI9XCJQdXQgdGhlIGxvY2F0aW9uIGhlcmUuLi5cIiByZXF1aXJlZD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1jb250cm9sXCI+XG4gICAgICAgICAgICAgIDxsYWJlbD5TdG9yZSBVcmwgKjwvbGFiZWw+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpbnB1dC1ncm91cFwiPlxuICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJpbmxpbmUtZmlyc3RcIiB2YWx1ZT1cImh0dHBzOi8vZmlkNzg2LmNvbS9zdG9yZXMvXCIgcmVxdWlyZWQgZGlzYWJsZWQ+XG4gICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBuYW1lPVwicGF0aFwiIHZhbHVlPVwiJHtcbiAgICAgICAgICAgICAgICAgICAgcGF0aFZhbHVlIHx8IFwiXCJcbiAgICAgICAgICAgICAgICAgIH1cIiBjbGFzcz1cImlubGluZS1zZWNvbmRcIiBwbGFjZWhvbGRlcj1cIlB1dCB0aGUgcGF0aCBoZXJlLi4uXCI+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIj5cbiAgICAgICAgICAgICAgPGxhYmVsPlN0b3JlIExvZ28gKjwvbGFiZWw+XG4gICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIG5hbWU9XCJsb2dvXCIgdmFsdWU9XCIke1xuICAgICAgICAgICAgICAgIGxvZ29WYWx1ZSB8fCBcIlwiXG4gICAgICAgICAgICAgIH1cIiBwbGFjZWhvbGRlcj1cIlB1dCB0aGUgbG9nbyB1cmwgaGVyZS4uLlwiIHJlcXVpcmVkPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLXN1Ym1pdFwiPlxuICAgICAgICAgICAgICAke2J1dHRvbnN9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICA8L2Zvcm0+XG4gICAgYCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBzdWJtaXRIYW5kbGVyKGU6IEV2ZW50KSB7XG4gICAgdHJ5IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgY29uc3QgbmFtZUlucHV0ID0gdGhpcy5mb3JtIS5xdWVyeVNlbGVjdG9yKFxuICAgICAgICBgaW5wdXRbbmFtZT1cIm5hbWVcIl1gXG4gICAgICApIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgICBjb25zdCBsb2NhdGlvbklucHV0ID0gdGhpcy5mb3JtIS5xdWVyeVNlbGVjdG9yKFxuICAgICAgICBgaW5wdXRbbmFtZT1cImxvY2F0aW9uXCJdYFxuICAgICAgKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgICAgY29uc3QgcGF0aElucHV0ID0gdGhpcy5mb3JtIS5xdWVyeVNlbGVjdG9yKFxuICAgICAgICBgaW5wdXRbbmFtZT1cInBhdGhcIl1gXG4gICAgICApIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgICBjb25zdCBsb2dvSW5wdXQgPSB0aGlzLmZvcm0hLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgIGBpbnB1dFtuYW1lPVwibG9nb1wiXWBcbiAgICAgICkgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICAgIGNvbnN0IHN1Ym1pdEJ0biA9IHRoaXMuZm9ybSEucXVlcnlTZWxlY3RvcihcbiAgICAgICAgYGJ1dHRvblt0eXBlPVwic3VibWl0XCJdYFxuICAgICAgKSEgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG5cbiAgICAgIGlmICghdGhpcy52YWxpZGF0ZUZvcm0ocGF0aElucHV0KSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHN1Ym1pdEJ0bi50ZXh0Q29udGVudCA9IFwiU3VibWl0dGluZ1wiO1xuICAgICAgc3VibWl0QnRuLmRpc2FibGVkID0gdHJ1ZTtcblxuICAgICAgY29uc3Qgc3RvcmVJZCA9IHRoaXMuZm9ybT8uZGF0YXNldC5pZDtcbiAgICAgIGF3YWl0IGF4aW9zKHtcbiAgICAgICAgdXJsOiBzdG9yZUlkID8gYC9hcGkvdjEvc3RvcmVzLyR7c3RvcmVJZH1gIDogXCIvYXBpL3YxL3N0b3Jlc1wiLFxuICAgICAgICBtZXRob2Q6IHN0b3JlSWQgPyBcIlBBVENIXCIgOiBcIlBPU1RcIixcbiAgICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgbmFtZTogbmFtZUlucHV0LnZhbHVlLFxuICAgICAgICAgIGxvY2F0aW9uOiBsb2NhdGlvbklucHV0LnZhbHVlLFxuICAgICAgICAgIHN1YlVybDogcGF0aElucHV0LnZhbHVlLFxuICAgICAgICAgIGxvZ286IGxvZ29JbnB1dC52YWx1ZSxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmNsb3NlSGFuZGxlcigpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgIHRoaXMuY2xvc2VIYW5kbGVyKCk7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIG92ZXJyaWRlIGFzeW5jIGRlbGV0ZURvYygpIHtcbiAgICBhd2FpdCBheGlvcyh7XG4gICAgICB1cmw6IGAvYXBpL3YxL3N0b3Jlcy8ke3RoaXMuZm9ybT8uZGF0YXNldC5pZH1gLFxuICAgICAgbWV0aG9kOiBcIkRFTEVURVwiLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSB2YWxpZGF0ZUZvcm0ocGF0aElucHV0OiBIVE1MSW5wdXRFbGVtZW50KSB7XG4gICAgaWYgKHRoaXMucmVuZGVyZWRFcnJvcikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghdmFsaWRhdG9yLmlzQWxwaGFudW1lcmljKHBhdGhJbnB1dC52YWx1ZSkpIHtcbiAgICAgIHRoaXMucmVuZGVyZWRFcnJvciA9IHRoaXMuY3JlYXRlRXJyb3IoXG4gICAgICAgIFwiVGhlIHVybCBwYXRoIG11c3QgYmUgYWxwaGFudW1lcmljLlwiXG4gICAgICApO1xuICAgICAgcGF0aElucHV0LnBhcmVudEVsZW1lbnQ/LnBhcmVudEVsZW1lbnQ/LmFwcGVuZENoaWxkKHRoaXMucmVuZGVyZWRFcnJvcik7XG5cbiAgICAgIHBhdGhJbnB1dC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICBcImZvY3VzXCIsXG4gICAgICAgIHRoaXMucGF0aElucHV0Rm9jdXNIYW5kbGVyLmJpbmQodGhpcylcbiAgICAgICk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBwcml2YXRlIHBhdGhJbnB1dEZvY3VzSGFuZGxlcigpIHtcbiAgICBpZiAoIXRoaXMucmVuZGVyZWRFcnJvcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMucmVuZGVyZWRFcnJvci5yZW1vdmUoKTtcbiAgICB0aGlzLnJlbmRlcmVkRXJyb3IgPSB1bmRlZmluZWQ7XG4gIH1cbn1cbiIsImltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIjtcblxuaW1wb3J0IFNlY3Rpb24gZnJvbSBcIi4vU2VjdGlvblwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIb21lU2VjdGlvbiBleHRlbmRzIFNlY3Rpb24ge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihcIkhPTUVcIik7XG5cbiAgICBheGlvcyh7XG4gICAgICB1cmw6IFwiL2FwaS92MS9vdmVydmlld1wiLFxuICAgICAgbWV0aG9kOiBcIkdFVFwiLFxuICAgIH0pXG4gICAgICAudGhlbigocmVzKSA9PiB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSByZXMuZGF0YS5kYXRhO1xuICAgICAgICB0aGlzLnJlbmRlcihcbiAgICAgICAgICBgXG4gICAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzPVwiZGFzaGJvYXJkLXNlY3Rpb25cIiBpZD1cImhvbWVcIj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkYXNoYm9hcmQtc2VjdGlvbl9fdG9wXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPGgyIGNsYXNzPVwiZGFzaGJvYXJkLXNlY3Rpb25fX3RpdGxlXCI+SG9tZTwvaDI+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkYXNoYm9hcmQtc2VjdGlvbl9fY2FyZHNcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGFzaGJvYXJkLXNlY3Rpb25fX2NhcmQgaG9tZS1jYXJkIGNhcmQtcmVkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxoMyBjbGFzcz1cImhvbWUtY2FyZF9fdGl0bGVcIj5Ub3RhbCBTdG9yZXM8L2gzPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cImhvbWUtY2FyZF9fY29udGVudFwiPiR7ZGF0YS5udW1iZXJPZlN0b3Jlc308L3A+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRhc2hib2FyZC1zZWN0aW9uX19jYXJkIGhvbWUtY2FyZCBjYXJkLWJsdWVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGgzIGNsYXNzPVwiaG9tZS1jYXJkX190aXRsZVwiPlRvdGFsIFByb2R1Y3RzPC9oMz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJob21lLWNhcmRfX2NvbnRlbnRcIj4ke2RhdGEubnVtYmVyT2ZQcm9kdWN0c308L3A+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRhc2hib2FyZC1zZWN0aW9uX19jYXJkIGhvbWUtY2FyZCBjYXJkLXllbGxvd1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8aDMgY2xhc3M9XCJob21lLWNhcmRfX3RpdGxlXCI+VG90YWwgT3JkZXJzPC9oMz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJob21lLWNhcmRfX2NvbnRlbnRcIj4ke2RhdGEubnVtYmVyT2ZPcmRlcnN9PC9wPlxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgICBgXG4gICAgICAgICk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgIH0pO1xuICB9XG59XG4iLCJpbXBvcnQgYXhpb3MgZnJvbSBcImF4aW9zXCI7XG5cbmltcG9ydCBmb3JtYXREYXRlIGZyb20gXCIuLi9oZWxwZXJzL2Zvcm1hdERhdGVcIjtcbmltcG9ydCBPcmRlck1vZGFsIGZyb20gXCIuLi9tb2RhbHMvT3JkZXJcIjtcbmltcG9ydCBPcmRlciBmcm9tIFwiLi4vdHlwZXMvT3JkZXJcIjtcblxuaW1wb3J0IFNlY3Rpb24gZnJvbSBcIi4vU2VjdGlvblwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPcmRlclNlY3Rpb24gZXh0ZW5kcyBTZWN0aW9uIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoXCJPUkRFUlwiKTtcblxuICAgIGF4aW9zKHtcbiAgICAgIHVybDogXCIvYXBpL3YxL29yZGVyc1wiLFxuICAgICAgbWV0aG9kOiBcIkdFVFwiLFxuICAgIH0pLnRoZW4oKHJlcykgPT4ge1xuICAgICAgY29uc3QgZGF0YSA9IHJlcy5kYXRhLmRhdGEgYXMgW09yZGVyXTtcblxuICAgICAgdGhpcy5yZW5kZXIoXG4gICAgICAgIGBcbiAgICAgICAgICA8c2VjdGlvbiBjbGFzcz1cImRhc2hib2FyZC1zZWN0aW9uXCIgaWQ9XCJvcmRlcnNcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRhc2hib2FyZC1zZWN0aW9uX190b3BcIj5cbiAgICAgICAgICAgICAgICAgIDxoMiBjbGFzcz1cImRhc2hib2FyZC1zZWN0aW9uX190aXRsZVwiPk1hbmFnZSBPcmRlcnM8L2gyPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRhc2hib2FyZC1zZWN0aW9uX19vdmVydmlld1wiPjxlbT4oVG90YWw6ICR7XG4gICAgICAgICAgICAgICAgZGF0YS5sZW5ndGhcbiAgICAgICAgICAgICAgfSk8L2VtPjwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGlkPVwib3JkZXJDYXJkc1wiIGNsYXNzPVwib3JkZXItY2FyZHNcIj5cbiAgICAgICAgICAgICAgICAke3RoaXMucmVuZGVyT3JkZXIoZGF0YSl9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvc2VjdGlvbj5cbiAgICAgIGBcbiAgICAgICk7XG5cbiAgICAgIGRvY3VtZW50XG4gICAgICAgIC5nZXRFbGVtZW50QnlJZChcIm9yZGVyQ2FyZHNcIilcbiAgICAgICAgPy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5vcmRlckNhcmRDbGlja0hhbmRsZXIuYmluZCh0aGlzKSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlck9yZGVyKGRhdGE6IFtPcmRlcl0pIHtcbiAgICBjb25zdCBvcmRlcnMgPSBkYXRhLm1hcCgob3JkZXIpID0+IHtcbiAgICAgIGNvbnN0IG9yZGVyRGF0ZSA9IGZvcm1hdERhdGUob3JkZXIuY3JlYXRlZEF0KTtcblxuICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJvcmRlci1jYXJkXCIgZGF0YS1pZD1cIiR7b3JkZXIuX2lkfVwiPlxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiYmkgYmktcGVyc29uLWNpcmNsZVwiPjwvaT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+JHtvcmRlci5idXllci51c2VybmFtZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+JHtvcmRlci5wcm9kdWN0Lm5hbWV9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICDCt1xuICAgICAgICAgICAgICAgICAgICA8c3Bhbj4ke29yZGVyRGF0ZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPHNwYW4+JHtcbiAgICAgICAgICAgICAgICAgIG9yZGVyLnRvdGFsUHJpY2UgPiAwID8gYOKCrCR7b3JkZXIudG90YWxQcmljZX1gIDogXCJGUkVFXCJcbiAgICAgICAgICAgICAgICB9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzcGFuPiR7b3JkZXIucHJvZHVjdC5kZWxpdmVyeVRpbWV9IERheXMgRGVsaXZlcnk8L3NwYW4+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJvcmRlci1jYXJkX18ke29yZGVyLnN0YXRlfVwiPiR7b3JkZXIuc3RhdGV9PC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIGA7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb3JkZXJzLmpvaW4oXCJcIik7XG4gIH1cblxuICBwcml2YXRlIG9yZGVyQ2FyZENsaWNrSGFuZGxlcihlOiBFdmVudCkge1xuICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xuICAgIGNvbnN0IG9yZGVyQ2FyZCA9IHRhcmdldC5jbG9zZXN0KFwiLm9yZGVyLWNhcmRcIikgYXMgSFRNTERpdkVsZW1lbnQ7XG4gICAgaWYgKCFvcmRlckNhcmQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBuZXcgT3JkZXJNb2RhbCgoKSA9PiBuZXcgT3JkZXJTZWN0aW9uKCksIG9yZGVyQ2FyZC5kYXRhc2V0LmlkISk7XG4gIH1cbn1cbiIsImltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIjtcblxuaW1wb3J0IFNlY3Rpb24gZnJvbSBcIi4vU2VjdGlvblwiO1xuaW1wb3J0IFByb2R1Y3QgZnJvbSBcIi4uL3R5cGVzL1Byb2R1Y3RcIjtcbmltcG9ydCBmb3JtYXREYXRlIGZyb20gXCIuLi9oZWxwZXJzL2Zvcm1hdERhdGVcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJvZHVjdFNlY3Rpb24gZXh0ZW5kcyBTZWN0aW9uIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoXCJQUk9EVUNUXCIsICgpID0+IG5ldyBQcm9kdWN0U2VjdGlvbigpKTtcblxuICAgIGF4aW9zKHtcbiAgICAgIHVybDogXCIvYXBpL3YxL3Byb2R1Y3RzXCIsXG4gICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgfSkudGhlbigocmVzKSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0gcmVzLmRhdGEuZGF0YSBhcyBbUHJvZHVjdF07XG5cbiAgICAgIHRoaXMucmVuZGVyKFxuICAgICAgICBgXG4gICAgICAgICAgPHNlY3Rpb24gY2xhc3M9XCJkYXNoYm9hcmQtc2VjdGlvblwiIGlkPVwicHJvZHVjdHNcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRhc2hib2FyZC1zZWN0aW9uX190b3BcIj5cbiAgICAgICAgICAgICAgICAgIDxoMiBjbGFzcz1cImRhc2hib2FyZC1zZWN0aW9uX190aXRsZVwiPk1hbmFnZSBQcm9kdWN0czwvaDI+XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCIgaWQ9XCJuZXdQUk9EVUNUXCI+TmV3IFByb2R1Y3Q8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkYXNoYm9hcmQtc2VjdGlvbl9fb3ZlcnZpZXdcIj48ZW0+KFRvdGFsOiAke1xuICAgICAgICAgICAgICAgIGRhdGEubGVuZ3RoXG4gICAgICAgICAgICAgIH0pPC9lbT48L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRhc2hib2FyZC1zZWN0aW9uX19jYXJkc1wiPlxuICAgICAgICAgICAgICAgICAgICAke3RoaXMucmVuZGVyUHJvZHVjdChkYXRhKX1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICBgXG4gICAgICApO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJQcm9kdWN0KGRhdGE6IFtQcm9kdWN0XSkge1xuICAgIGNvbnN0IHByb2R1Y3RzID0gZGF0YS5tYXAoKHByb2R1Y3QpID0+IHtcbiAgICAgIGNvbnN0IGRhdGUgPSBmb3JtYXREYXRlKHByb2R1Y3QuY3JlYXRlZEF0KTtcbiAgICAgIGNvbnN0IGF2YWlsYWJpbGl0eSA9IHByb2R1Y3QuYXZhaWxhYmlsaXR5O1xuICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgICAgPGEgXG4gICAgICAgICAgICAgICAgaHJlZj1cIi9zdG9yZXMvJHtwcm9kdWN0LnN0b3JlLnN1YlVybH0vJHtwcm9kdWN0Ll9pZH1cIlxuICAgICAgICAgICAgICAgIHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vb3BlbmVyIG5vcmVmZXJyZXJcIlxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdiBcbiAgICAgICAgICAgICAgICAgZGF0YS1pZD1cIiR7cHJvZHVjdC5faWR9XCJcbiAgICAgICAgICAgICAgICAgZGF0YS10eXBlPVwiUFJPRFVDVFwiXG4gICAgICAgICAgICAgICAgIGNsYXNzPVwiZGFzaGJvYXJkLXNlY3Rpb25fX2NhcmQgcHJvZHVjdC1jYXJkXCJcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwcm9kdWN0LWNhcmRfX2ltZ1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGltZyBzcmM9XCIke3Byb2R1Y3QucGhvdG9zWzBdfVwiIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicHJvZHVjdC1jYXJkX19pbmZvXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicHJvZHVjdC1jYXJkX190b3BcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInByb2R1Y3QtY2FyZF9fdGl0bGVcIj4ke1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZHVjdC5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJwcm9kdWN0LWNhcmRfXyR7YXZhaWxhYmlsaXR5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxzL2csIFwiLVwiKX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmFpbGFiaWxpdHkgPT09IFwiSW4gU3RvY2tcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBgPGkgY2xhc3M9XCJiaSBiaS1jaGVjay1sZ1wiPjwvaT5gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IGA8aSBjbGFzcz1cImJpIGJpLWV4Y2xhbWF0aW9uLWNpcmNsZVwiPjwvaT5gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHthdmFpbGFiaWxpdHl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInByb2R1Y3QtY2FyZF9fc3RvcmVcIj4ke1xuICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9kdWN0LnN0b3JlLm5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICDCt1xuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJwcm9kdWN0LWNhcmRfX2RhdGVcIj4ke2RhdGV9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInByb2R1Y3QtY2FyZF9fYm90dG9tXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJwcm9kdWN0LWNhcmRfX3ByaWNlXCI+4oKsJHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2R1Y3QucHJpY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXByaW1hcnkgY2FyZC1idG5cIj5BY3Rpb25zPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICBgO1xuICAgIH0pO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPD0gcHJvZHVjdHMubGVuZ3RoICUgMzsgaSsrKSB7XG4gICAgICBwcm9kdWN0cy5wdXNoKGA8ZGl2IGNsYXNzPVwid3JhcHBlclwiPjwvZGl2PmApO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9kdWN0cy5qb2luKFwiXCIpO1xuICB9XG59XG4iLCJpbXBvcnQgYXhpb3MgZnJvbSBcImF4aW9zXCI7XG5cbmltcG9ydCBTZWN0aW9uIGZyb20gXCIuL1NlY3Rpb25cIjtcbmltcG9ydCBSZXdhcmQgZnJvbSBcIi4uL3R5cGVzL1Jld2FyZFwiO1xuaW1wb3J0IGZvcm1hdERhdGUgZnJvbSBcIi4uL2hlbHBlcnMvZm9ybWF0RGF0ZVwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXdhcmRTZWN0aW9uIGV4dGVuZHMgU2VjdGlvbiB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKFwiUkVXQVJEXCIsICgpID0+IG5ldyBSZXdhcmRTZWN0aW9uKCkpO1xuXG4gICAgYXhpb3Moe1xuICAgICAgdXJsOiBcIi9hcGkvdjEvcmV3YXJkc1wiLFxuICAgICAgbWV0aG9kOiBcIkdFVFwiLFxuICAgIH0pLnRoZW4oKHJlcykgPT4ge1xuICAgICAgY29uc3QgZGF0YSA9IHJlcy5kYXRhLmRhdGEgYXMgW1Jld2FyZF07XG5cbiAgICAgIHRoaXMucmVuZGVyKFxuICAgICAgICBgXG4gICAgICAgICAgICA8c2VjdGlvbiBjbGFzcz1cImRhc2hib2FyZC1zZWN0aW9uXCIgaWQ9XCJyZXdhcmRcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGFzaGJvYXJkLXNlY3Rpb25fX3RvcFwiPlxuICAgICAgICAgICAgICAgICAgICA8aDIgY2xhc3M9XCJkYXNoYm9hcmQtc2VjdGlvbl9fdGl0bGVcIj5NYW5hZ2UgUmV3YXJkczwvaDI+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIiBpZD1cIm5ld1JFV0FSRFwiPk5ldyBSZXdhcmQ8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGFzaGJvYXJkLXNlY3Rpb25fX292ZXJ2aWV3XCI+PGVtPihUb3RhbDogJHtcbiAgICAgICAgICAgICAgICAgIGRhdGEubGVuZ3RoXG4gICAgICAgICAgICAgICAgfSk8L2VtPjwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkYXNoYm9hcmQtc2VjdGlvbl9fY2FyZHNcIj5cbiAgICAgICAgICAgICAgICAgICAgJHt0aGlzLnJlbmRlclJld2FyZChkYXRhKX1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgYFxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyUmV3YXJkKGRhdGE6IFtSZXdhcmRdKSB7XG4gICAgY29uc3QgcmV3YXJkcyA9IGRhdGEubWFwKChyZXdhcmQpID0+IHtcbiAgICAgIGNvbnN0IGRhdGUgPSBmb3JtYXREYXRlKHJld2FyZC5jcmVhdGVkQXQpO1xuICAgICAgY29uc3QgYXZhaWxhYmlsaXR5ID0gcmV3YXJkLnByb2R1Y3QuYXZhaWxhYmlsaXR5O1xuICAgICAgcmV0dXJuIGBcbiAgICAgICAgPGEgXG4gICAgICAgIGhyZWY9XCIvc3RvcmVzLyR7cmV3YXJkLnByb2R1Y3Quc3RvcmUuc3ViVXJsfS8ke1xuICAgICAgICByZXdhcmQucHJvZHVjdC5faWRcbiAgICAgIH0/dHlwZT1yZXdhcmRcIlxuICAgICAgICB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub29wZW5lciBub3JlZmVycmVyXCJcbiAgICAgICAgPlxuICAgICAgICAgIDxkaXYgXG4gICAgICAgICAgIGRhdGEtaWQ9XCIke3Jld2FyZC5faWR9XCJcbiAgICAgICAgICAgZGF0YS10eXBlPVwiUkVXQVJEXCJcbiAgICAgICAgICAgY2xhc3M9XCJkYXNoYm9hcmQtc2VjdGlvbl9fY2FyZCBwcm9kdWN0LWNhcmRcIlxuICAgICAgICAgID5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInByb2R1Y3QtY2FyZF9faW1nXCI+XG4gICAgICAgICAgICAgICAgICA8aW1nIHNyYz1cIiR7cmV3YXJkLnByb2R1Y3QucGhvdG9zWzBdfVwiIC8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicHJvZHVjdC1jYXJkX19pbmZvXCI+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicHJvZHVjdC1jYXJkX190b3BcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInByb2R1Y3QtY2FyZF9fdGl0bGVcIj4ke1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV3YXJkLnByb2R1Y3QubmFtZVxuICAgICAgICAgICAgICAgICAgICAgIH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gXG4gICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwicHJvZHVjdC1jYXJkX18ke2F2YWlsYWJpbGl0eVxuICAgICAgICAgICAgICAgICAgICAgICAgIC50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xccy9nLCBcIi1cIil9XCJcbiAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICR7XG4gICAgICAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmlsaXR5ID09PSBcIkluIFN0b2NrXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgID8gYDxpIGNsYXNzPVwiYmkgYmktY2hlY2stbGdcIj48L2k+YFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBgPGkgY2xhc3M9XCJiaSBiaS1leGNsYW1hdGlvbi1jaXJjbGVcIj48L2k+YFxuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICR7YXZhaWxhYmlsaXR5fVxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJwcm9kdWN0LWNhcmRfX3N0b3JlXCI+JHtcbiAgICAgICAgICAgICAgICAgICAgcmV3YXJkLnByb2R1Y3Quc3RvcmUubmFtZVxuICAgICAgICAgICAgICAgICAgfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIMK3XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInByb2R1Y3QtY2FyZF9fZGF0ZVwiPiR7ZGF0ZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicHJvZHVjdC1jYXJkX19ib3R0b21cIj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInByb2R1Y3QtY2FyZF9fcG9pbnRzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICR7cmV3YXJkLnJlcXVpcmVkUG9pbnRzfSBQb2ludHNcbiAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeSBjYXJkLWJ0blwiPkFjdGlvbnM8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9hPlxuICAgICAgYDtcbiAgICB9KTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IHJld2FyZHMubGVuZ3RoICUgMzsgaSsrKSB7XG4gICAgICByZXdhcmRzLnB1c2goYDxkaXYgY2xhc3M9XCJ3cmFwcGVyXCI+PC9kaXY+YCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJld2FyZHMuam9pbihcIlwiKTtcbiAgfVxufVxuIiwiaW1wb3J0IFByb2R1Y3RNb2RhbCBmcm9tIFwiLi4vbW9kYWxzL1Byb2R1Y3RcIjtcbmltcG9ydCBSZXdhcmRNb2RhbCBmcm9tIFwiLi4vbW9kYWxzL1Jld2FyZFwiO1xuaW1wb3J0IFN0b3JlTW9kYWwgZnJvbSBcIi4uL21vZGFscy9TdG9yZVwiO1xuaW1wb3J0IFR5cGVTZWN0aW9uIGZyb20gXCIuLi90eXBlcy9TZWN0aW9uXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlY3Rpb24ge1xuICBwcml2YXRlIHNlY3Rpb25Db250YWluZXI6IEhUTUxEaXZFbGVtZW50O1xuICBwcml2YXRlIGxvYWRpbmdTcGlubmVyID0gYFxuICAgIDxkaXYgY2xhc3M9XCJsb2FkaW5nLXNwaW5uZXJfX2Rhc2hib2FyZFwiPjxkaXYgY2xhc3M9XCJsb2FkaW5nLXNwaW5uZXJcIj48L2Rpdj48L2Rpdj5cbiAgYDtcbiAgcHJvdGVjdGVkIGNhcmRzQ29udGFpbmVyITogSFRNTERpdkVsZW1lbnQ7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSB0eXBlOiBUeXBlU2VjdGlvbiwgcHJpdmF0ZSByZWxvYWRGbj86IEZ1bmN0aW9uKSB7XG4gICAgdGhpcy5zZWN0aW9uQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXG4gICAgICBcImRhc2hib2FyZENvbnRlbnRcIlxuICAgICkgYXMgSFRNTERpdkVsZW1lbnQ7XG4gICAgdGhpcy5zZWN0aW9uQ29udGFpbmVyLmlubmVySFRNTCA9IHRoaXMubG9hZGluZ1NwaW5uZXI7XG4gIH1cblxuICBwcm90ZWN0ZWQgcmVuZGVyKG1hcmt1cDogc3RyaW5nKSB7XG4gICAgdGhpcy5zZWN0aW9uQ29udGFpbmVyLmlubmVySFRNTCA9IG1hcmt1cDtcblxuICAgIHRoaXMuY2FyZHNDb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgXCIuZGFzaGJvYXJkLXNlY3Rpb25fX2NhcmRzXCJcbiAgICApIGFzIEhUTUxEaXZFbGVtZW50O1xuXG4gICAgdGhpcy5jYXJkc0NvbnRhaW5lcj8uYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwiY2xpY2tcIixcbiAgICAgIHRoaXMuY2FyZENsaWNrSGFuZGxlci5iaW5kKHRoaXMpXG4gICAgKTtcblxuICAgIGlmICh0aGlzLnR5cGUgIT09IFwiSE9NRVwiICYmIHRoaXMudHlwZSAhPT0gXCJPUkRFUlwiKSB7XG4gICAgICBkb2N1bWVudFxuICAgICAgICAuZ2V0RWxlbWVudEJ5SWQoYG5ldyR7dGhpcy50eXBlfWApXG4gICAgICAgID8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMucmVuZGVyTW9kYWxIYW5kbGVyLmJpbmQodGhpcykpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyTW9kYWxIYW5kbGVyKCkge1xuICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICBjYXNlIFwiU1RPUkVcIjpcbiAgICAgICAgbmV3IFN0b3JlTW9kYWwodGhpcy5yZWxvYWRGbiEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJQUk9EVUNUXCI6XG4gICAgICAgIG5ldyBQcm9kdWN0TW9kYWwodGhpcy5yZWxvYWRGbiEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJSRVdBUkRcIjpcbiAgICAgICAgbmV3IFJld2FyZE1vZGFsKHRoaXMucmVsb2FkRm4hKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGNhcmRDbGlja0hhbmRsZXIoZTogRXZlbnQpIHtcbiAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCBhcyBIVE1MRWxlbWVudDtcblxuICAgIGlmICghdGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhcImNhcmQtYnRuXCIpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgY29uc3QgY2FyZCA9IHRhcmdldC5jbG9zZXN0KFwiLmRhc2hib2FyZC1zZWN0aW9uX19jYXJkXCIpIGFzIEhUTUxEaXZFbGVtZW50O1xuXG4gICAgc3dpdGNoIChjYXJkPy5kYXRhc2V0LnR5cGUpIHtcbiAgICAgIGNhc2UgXCJTVE9SRVwiOlxuICAgICAgICBuZXcgU3RvcmVNb2RhbCh0aGlzLnJlbG9hZEZuISwgY2FyZD8uZGF0YXNldC5pZCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIlBST0RVQ1RcIjpcbiAgICAgICAgbmV3IFByb2R1Y3RNb2RhbCh0aGlzLnJlbG9hZEZuISwgY2FyZD8uZGF0YXNldC5pZCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIlJFV0FSRFwiOlxuICAgICAgICBuZXcgUmV3YXJkTW9kYWwodGhpcy5yZWxvYWRGbiEsIGNhcmQ/LmRhdGFzZXQuaWQpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIjtcblxuaW1wb3J0IFNlY3Rpb24gZnJvbSBcIi4vU2VjdGlvblwiO1xuaW1wb3J0IFN0b3JlIGZyb20gXCIuLi90eXBlcy9TdG9yZVwiO1xuaW1wb3J0IGZvcm1hdERhdGUgZnJvbSBcIi4uL2hlbHBlcnMvZm9ybWF0RGF0ZVwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdG9yZVNlY3Rpb24gZXh0ZW5kcyBTZWN0aW9uIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoXCJTVE9SRVwiLCAoKSA9PiBuZXcgU3RvcmVTZWN0aW9uKCkpO1xuXG4gICAgYXhpb3Moe1xuICAgICAgdXJsOiBcIi9hcGkvdjEvc3RvcmVzXCIsXG4gICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgfSlcbiAgICAgIC50aGVuKChyZXMpID0+IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IHJlcy5kYXRhLmRhdGEgYXMgW1N0b3JlXTtcblxuICAgICAgICB0aGlzLnJlbmRlcihcbiAgICAgICAgICBgXG4gICAgICAgICAgICA8c2VjdGlvbiBjbGFzcz1cImRhc2hib2FyZC1zZWN0aW9uXCIgaWQ9XCJzdG9yZXNcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGFzaGJvYXJkLXNlY3Rpb25fX3RvcFwiPlxuICAgICAgICAgICAgICAgICAgICA8aDIgY2xhc3M9XCJkYXNoYm9hcmQtc2VjdGlvbl9fdGl0bGVcIj5NYW5hZ2UgU3RvcmVzPC9oMj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiIGlkPVwibmV3U1RPUkVcIj5OZXcgU3RvcmU8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGFzaGJvYXJkLXNlY3Rpb25fX292ZXJ2aWV3XCI+PGVtPihUb3RhbDogJHtcbiAgICAgICAgICAgICAgICAgIGRhdGEubGVuZ3RoXG4gICAgICAgICAgICAgICAgfSk8L2VtPjwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkYXNoYm9hcmQtc2VjdGlvbl9fY2FyZHNcIj5cbiAgICAgICAgICAgICAgICAgICAgJHt0aGlzLnJlbmRlclN0b3JlKGRhdGEpfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICAgIGBcbiAgICAgICAgKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyU3RvcmUoZGF0YTogW1N0b3JlXSkge1xuICAgIGNvbnN0IHN0b3JlcyA9IGRhdGEubWFwKChzdG9yZSkgPT4ge1xuICAgICAgY29uc3QgZGF0ZSA9IGZvcm1hdERhdGUoc3RvcmUuY3JlYXRlZEF0KTtcblxuICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgIDxhIGhyZWY9XCIvc3RvcmVzLyR7c3RvcmUuc3ViVXJsfVwiIHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vb3BlbmVyIG5vcmVmZXJyZXJcIj5cbiAgICAgICAgICAgICAgPGRpdiBkYXRhLWlkPVwiJHtzdG9yZS5faWR9XCIgZGF0YS10eXBlPVwiU1RPUkVcIiBjbGFzcz1cImRhc2hib2FyZC1zZWN0aW9uX19jYXJkIHN0b3JlLWNhcmRcIj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdG9yZS1jYXJkX190b3BcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RvcmUtY2FyZF9faW5mb1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInN0b3JlLWNhcmRfX3RpdGxlXCI+JHtzdG9yZS5uYW1lfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJzdG9yZS1jYXJkX19sb2NhdGlvblwiPiR7c3RvcmUubG9jYXRpb259PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICDCt1xuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInN0b3JlLWNhcmRfX2RhdGVcIj4ke2RhdGV9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdG9yZS1jYXJkX19hY3Rpb25zXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXByaW1hcnkgY2FyZC1idG5cIj5BY3Rpb25zPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdG9yZS1jYXJkX19sb2dvXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPGltZyBjbGFzcz1cInN0b3JlLWNhcmRfX2ltZ1wiIHNyYz1cIiR7c3RvcmUubG9nb31cIj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvYT5cbiAgICAgICAgYDtcbiAgICB9KTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IHN0b3Jlcy5sZW5ndGggJSAzOyBpKyspIHtcbiAgICAgIHN0b3Jlcy5wdXNoKGA8ZGl2IGNsYXNzPVwid3JhcHBlclwiPjwvZGl2PmApO1xuICAgIH1cblxuICAgIHJldHVybiBzdG9yZXMuam9pbihcIlwiKTtcbiAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IFwiQGJhYmVsL2hlbHBlcnMgLSB0eXBlb2ZcIjsgaWYgKHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiKSB7IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfTsgfSBlbHNlIHsgX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9OyB9IHJldHVybiBfdHlwZW9mKG9iaik7IH1cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHZvaWQgMDtcblxudmFyIF90b0RhdGUgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2xpYi90b0RhdGVcIikpO1xuXG52YXIgX3RvRmxvYXQgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2xpYi90b0Zsb2F0XCIpKTtcblxudmFyIF90b0ludCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL3RvSW50XCIpKTtcblxudmFyIF90b0Jvb2xlYW4gPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2xpYi90b0Jvb2xlYW5cIikpO1xuXG52YXIgX2VxdWFscyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL2VxdWFsc1wiKSk7XG5cbnZhciBfY29udGFpbnMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2xpYi9jb250YWluc1wiKSk7XG5cbnZhciBfbWF0Y2hlcyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL21hdGNoZXNcIikpO1xuXG52YXIgX2lzRW1haWwgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2xpYi9pc0VtYWlsXCIpKTtcblxudmFyIF9pc1VSTCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL2lzVVJMXCIpKTtcblxudmFyIF9pc01BQ0FkZHJlc3MgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2xpYi9pc01BQ0FkZHJlc3NcIikpO1xuXG52YXIgX2lzSVAgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2xpYi9pc0lQXCIpKTtcblxudmFyIF9pc0lQUmFuZ2UgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2xpYi9pc0lQUmFuZ2VcIikpO1xuXG52YXIgX2lzRlFETiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL2lzRlFETlwiKSk7XG5cbnZhciBfaXNEYXRlID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9saWIvaXNEYXRlXCIpKTtcblxudmFyIF9pc0Jvb2xlYW4gPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2xpYi9pc0Jvb2xlYW5cIikpO1xuXG52YXIgX2lzTG9jYWxlID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9saWIvaXNMb2NhbGVcIikpO1xuXG52YXIgX2lzQWxwaGEgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChyZXF1aXJlKFwiLi9saWIvaXNBbHBoYVwiKSk7XG5cbnZhciBfaXNBbHBoYW51bWVyaWMgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChyZXF1aXJlKFwiLi9saWIvaXNBbHBoYW51bWVyaWNcIikpO1xuXG52YXIgX2lzTnVtZXJpYyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL2lzTnVtZXJpY1wiKSk7XG5cbnZhciBfaXNQYXNzcG9ydE51bWJlciA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL2lzUGFzc3BvcnROdW1iZXJcIikpO1xuXG52YXIgX2lzUG9ydCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL2lzUG9ydFwiKSk7XG5cbnZhciBfaXNMb3dlcmNhc2UgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2xpYi9pc0xvd2VyY2FzZVwiKSk7XG5cbnZhciBfaXNVcHBlcmNhc2UgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2xpYi9pc1VwcGVyY2FzZVwiKSk7XG5cbnZhciBfaXNJTUVJID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9saWIvaXNJTUVJXCIpKTtcblxudmFyIF9pc0FzY2lpID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9saWIvaXNBc2NpaVwiKSk7XG5cbnZhciBfaXNGdWxsV2lkdGggPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2xpYi9pc0Z1bGxXaWR0aFwiKSk7XG5cbnZhciBfaXNIYWxmV2lkdGggPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2xpYi9pc0hhbGZXaWR0aFwiKSk7XG5cbnZhciBfaXNWYXJpYWJsZVdpZHRoID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9saWIvaXNWYXJpYWJsZVdpZHRoXCIpKTtcblxudmFyIF9pc011bHRpYnl0ZSA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL2lzTXVsdGlieXRlXCIpKTtcblxudmFyIF9pc1NlbVZlciA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL2lzU2VtVmVyXCIpKTtcblxudmFyIF9pc1N1cnJvZ2F0ZVBhaXIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2xpYi9pc1N1cnJvZ2F0ZVBhaXJcIikpO1xuXG52YXIgX2lzSW50ID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9saWIvaXNJbnRcIikpO1xuXG52YXIgX2lzRmxvYXQgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChyZXF1aXJlKFwiLi9saWIvaXNGbG9hdFwiKSk7XG5cbnZhciBfaXNEZWNpbWFsID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9saWIvaXNEZWNpbWFsXCIpKTtcblxudmFyIF9pc0hleGFkZWNpbWFsID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9saWIvaXNIZXhhZGVjaW1hbFwiKSk7XG5cbnZhciBfaXNPY3RhbCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL2lzT2N0YWxcIikpO1xuXG52YXIgX2lzRGl2aXNpYmxlQnkgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2xpYi9pc0RpdmlzaWJsZUJ5XCIpKTtcblxudmFyIF9pc0hleENvbG9yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9saWIvaXNIZXhDb2xvclwiKSk7XG5cbnZhciBfaXNSZ2JDb2xvciA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL2lzUmdiQ29sb3JcIikpO1xuXG52YXIgX2lzSFNMID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9saWIvaXNIU0xcIikpO1xuXG52YXIgX2lzSVNSQyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL2lzSVNSQ1wiKSk7XG5cbnZhciBfaXNJQkFOID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQocmVxdWlyZShcIi4vbGliL2lzSUJBTlwiKSk7XG5cbnZhciBfaXNCSUMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2xpYi9pc0JJQ1wiKSk7XG5cbnZhciBfaXNNRCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL2lzTUQ1XCIpKTtcblxudmFyIF9pc0hhc2ggPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2xpYi9pc0hhc2hcIikpO1xuXG52YXIgX2lzSldUID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9saWIvaXNKV1RcIikpO1xuXG52YXIgX2lzSlNPTiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL2lzSlNPTlwiKSk7XG5cbnZhciBfaXNFbXB0eSA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL2lzRW1wdHlcIikpO1xuXG52YXIgX2lzTGVuZ3RoID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9saWIvaXNMZW5ndGhcIikpO1xuXG52YXIgX2lzQnl0ZUxlbmd0aCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL2lzQnl0ZUxlbmd0aFwiKSk7XG5cbnZhciBfaXNVVUlEID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9saWIvaXNVVUlEXCIpKTtcblxudmFyIF9pc01vbmdvSWQgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2xpYi9pc01vbmdvSWRcIikpO1xuXG52YXIgX2lzQWZ0ZXIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2xpYi9pc0FmdGVyXCIpKTtcblxudmFyIF9pc0JlZm9yZSA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL2lzQmVmb3JlXCIpKTtcblxudmFyIF9pc0luID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9saWIvaXNJblwiKSk7XG5cbnZhciBfaXNDcmVkaXRDYXJkID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9saWIvaXNDcmVkaXRDYXJkXCIpKTtcblxudmFyIF9pc0lkZW50aXR5Q2FyZCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL2lzSWRlbnRpdHlDYXJkXCIpKTtcblxudmFyIF9pc0VBTiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL2lzRUFOXCIpKTtcblxudmFyIF9pc0lTSU4gPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2xpYi9pc0lTSU5cIikpO1xuXG52YXIgX2lzSVNCTiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL2lzSVNCTlwiKSk7XG5cbnZhciBfaXNJU1NOID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9saWIvaXNJU1NOXCIpKTtcblxudmFyIF9pc1RheElEID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9saWIvaXNUYXhJRFwiKSk7XG5cbnZhciBfaXNNb2JpbGVQaG9uZSA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKHJlcXVpcmUoXCIuL2xpYi9pc01vYmlsZVBob25lXCIpKTtcblxudmFyIF9pc0V0aGVyZXVtQWRkcmVzcyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL2lzRXRoZXJldW1BZGRyZXNzXCIpKTtcblxudmFyIF9pc0N1cnJlbmN5ID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9saWIvaXNDdXJyZW5jeVwiKSk7XG5cbnZhciBfaXNCdGNBZGRyZXNzID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9saWIvaXNCdGNBZGRyZXNzXCIpKTtcblxudmFyIF9pc0lTTyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL2lzSVNPODYwMVwiKSk7XG5cbnZhciBfaXNSRkMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2xpYi9pc1JGQzMzMzlcIikpO1xuXG52YXIgX2lzSVNPMzE2NjFBbHBoYSA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL2lzSVNPMzE2NjFBbHBoYTJcIikpO1xuXG52YXIgX2lzSVNPMzE2NjFBbHBoYTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2xpYi9pc0lTTzMxNjYxQWxwaGEzXCIpKTtcblxudmFyIF9pc0lTTzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2xpYi9pc0lTTzQyMTdcIikpO1xuXG52YXIgX2lzQmFzZSA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL2lzQmFzZTMyXCIpKTtcblxudmFyIF9pc0Jhc2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9saWIvaXNCYXNlNThcIikpO1xuXG52YXIgX2lzQmFzZTMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2xpYi9pc0Jhc2U2NFwiKSk7XG5cbnZhciBfaXNEYXRhVVJJID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9saWIvaXNEYXRhVVJJXCIpKTtcblxudmFyIF9pc01hZ25ldFVSSSA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL2lzTWFnbmV0VVJJXCIpKTtcblxudmFyIF9pc01pbWVUeXBlID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9saWIvaXNNaW1lVHlwZVwiKSk7XG5cbnZhciBfaXNMYXRMb25nID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9saWIvaXNMYXRMb25nXCIpKTtcblxudmFyIF9pc1Bvc3RhbENvZGUgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChyZXF1aXJlKFwiLi9saWIvaXNQb3N0YWxDb2RlXCIpKTtcblxudmFyIF9sdHJpbSA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL2x0cmltXCIpKTtcblxudmFyIF9ydHJpbSA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL3J0cmltXCIpKTtcblxudmFyIF90cmltID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9saWIvdHJpbVwiKSk7XG5cbnZhciBfZXNjYXBlID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9saWIvZXNjYXBlXCIpKTtcblxudmFyIF91bmVzY2FwZSA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL3VuZXNjYXBlXCIpKTtcblxudmFyIF9zdHJpcExvdyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL3N0cmlwTG93XCIpKTtcblxudmFyIF93aGl0ZWxpc3QgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2xpYi93aGl0ZWxpc3RcIikpO1xuXG52YXIgX2JsYWNrbGlzdCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL2JsYWNrbGlzdFwiKSk7XG5cbnZhciBfaXNXaGl0ZWxpc3RlZCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL2lzV2hpdGVsaXN0ZWRcIikpO1xuXG52YXIgX25vcm1hbGl6ZUVtYWlsID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9saWIvbm9ybWFsaXplRW1haWxcIikpO1xuXG52YXIgX2lzU2x1ZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL2lzU2x1Z1wiKSk7XG5cbnZhciBfaXNMaWNlbnNlUGxhdGUgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2xpYi9pc0xpY2Vuc2VQbGF0ZVwiKSk7XG5cbnZhciBfaXNTdHJvbmdQYXNzd29yZCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vbGliL2lzU3Ryb25nUGFzc3dvcmRcIikpO1xuXG52YXIgX2lzVkFUID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9saWIvaXNWQVRcIikpO1xuXG5mdW5jdGlvbiBfZ2V0UmVxdWlyZVdpbGRjYXJkQ2FjaGUoKSB7IGlmICh0eXBlb2YgV2Vha01hcCAhPT0gXCJmdW5jdGlvblwiKSByZXR1cm4gbnVsbDsgdmFyIGNhY2hlID0gbmV3IFdlYWtNYXAoKTsgX2dldFJlcXVpcmVXaWxkY2FyZENhY2hlID0gZnVuY3Rpb24gX2dldFJlcXVpcmVXaWxkY2FyZENhY2hlKCkgeyByZXR1cm4gY2FjaGU7IH07IHJldHVybiBjYWNoZTsgfVxuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChvYmopIHsgaWYgKG9iaiAmJiBvYmouX19lc01vZHVsZSkgeyByZXR1cm4gb2JqOyB9IGlmIChvYmogPT09IG51bGwgfHwgX3R5cGVvZihvYmopICE9PSBcIm9iamVjdFwiICYmIHR5cGVvZiBvYmogIT09IFwiZnVuY3Rpb25cIikgeyByZXR1cm4geyBkZWZhdWx0OiBvYmogfTsgfSB2YXIgY2FjaGUgPSBfZ2V0UmVxdWlyZVdpbGRjYXJkQ2FjaGUoKTsgaWYgKGNhY2hlICYmIGNhY2hlLmhhcyhvYmopKSB7IHJldHVybiBjYWNoZS5nZXQob2JqKTsgfSB2YXIgbmV3T2JqID0ge307IHZhciBoYXNQcm9wZXJ0eURlc2NyaXB0b3IgPSBPYmplY3QuZGVmaW5lUHJvcGVydHkgJiYgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjsgZm9yICh2YXIga2V5IGluIG9iaikgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkgeyB2YXIgZGVzYyA9IGhhc1Byb3BlcnR5RGVzY3JpcHRvciA/IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqLCBrZXkpIDogbnVsbDsgaWYgKGRlc2MgJiYgKGRlc2MuZ2V0IHx8IGRlc2Muc2V0KSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkobmV3T2JqLCBrZXksIGRlc2MpOyB9IGVsc2UgeyBuZXdPYmpba2V5XSA9IG9ialtrZXldOyB9IH0gfSBuZXdPYmouZGVmYXVsdCA9IG9iajsgaWYgKGNhY2hlKSB7IGNhY2hlLnNldChvYmosIG5ld09iaik7IH0gcmV0dXJuIG5ld09iajsgfVxuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgdmVyc2lvbiA9ICcxMy43LjAnO1xudmFyIHZhbGlkYXRvciA9IHtcbiAgdmVyc2lvbjogdmVyc2lvbixcbiAgdG9EYXRlOiBfdG9EYXRlLmRlZmF1bHQsXG4gIHRvRmxvYXQ6IF90b0Zsb2F0LmRlZmF1bHQsXG4gIHRvSW50OiBfdG9JbnQuZGVmYXVsdCxcbiAgdG9Cb29sZWFuOiBfdG9Cb29sZWFuLmRlZmF1bHQsXG4gIGVxdWFsczogX2VxdWFscy5kZWZhdWx0LFxuICBjb250YWluczogX2NvbnRhaW5zLmRlZmF1bHQsXG4gIG1hdGNoZXM6IF9tYXRjaGVzLmRlZmF1bHQsXG4gIGlzRW1haWw6IF9pc0VtYWlsLmRlZmF1bHQsXG4gIGlzVVJMOiBfaXNVUkwuZGVmYXVsdCxcbiAgaXNNQUNBZGRyZXNzOiBfaXNNQUNBZGRyZXNzLmRlZmF1bHQsXG4gIGlzSVA6IF9pc0lQLmRlZmF1bHQsXG4gIGlzSVBSYW5nZTogX2lzSVBSYW5nZS5kZWZhdWx0LFxuICBpc0ZRRE46IF9pc0ZRRE4uZGVmYXVsdCxcbiAgaXNCb29sZWFuOiBfaXNCb29sZWFuLmRlZmF1bHQsXG4gIGlzSUJBTjogX2lzSUJBTi5kZWZhdWx0LFxuICBpc0JJQzogX2lzQklDLmRlZmF1bHQsXG4gIGlzQWxwaGE6IF9pc0FscGhhLmRlZmF1bHQsXG4gIGlzQWxwaGFMb2NhbGVzOiBfaXNBbHBoYS5sb2NhbGVzLFxuICBpc0FscGhhbnVtZXJpYzogX2lzQWxwaGFudW1lcmljLmRlZmF1bHQsXG4gIGlzQWxwaGFudW1lcmljTG9jYWxlczogX2lzQWxwaGFudW1lcmljLmxvY2FsZXMsXG4gIGlzTnVtZXJpYzogX2lzTnVtZXJpYy5kZWZhdWx0LFxuICBpc1Bhc3Nwb3J0TnVtYmVyOiBfaXNQYXNzcG9ydE51bWJlci5kZWZhdWx0LFxuICBpc1BvcnQ6IF9pc1BvcnQuZGVmYXVsdCxcbiAgaXNMb3dlcmNhc2U6IF9pc0xvd2VyY2FzZS5kZWZhdWx0LFxuICBpc1VwcGVyY2FzZTogX2lzVXBwZXJjYXNlLmRlZmF1bHQsXG4gIGlzQXNjaWk6IF9pc0FzY2lpLmRlZmF1bHQsXG4gIGlzRnVsbFdpZHRoOiBfaXNGdWxsV2lkdGguZGVmYXVsdCxcbiAgaXNIYWxmV2lkdGg6IF9pc0hhbGZXaWR0aC5kZWZhdWx0LFxuICBpc1ZhcmlhYmxlV2lkdGg6IF9pc1ZhcmlhYmxlV2lkdGguZGVmYXVsdCxcbiAgaXNNdWx0aWJ5dGU6IF9pc011bHRpYnl0ZS5kZWZhdWx0LFxuICBpc1NlbVZlcjogX2lzU2VtVmVyLmRlZmF1bHQsXG4gIGlzU3Vycm9nYXRlUGFpcjogX2lzU3Vycm9nYXRlUGFpci5kZWZhdWx0LFxuICBpc0ludDogX2lzSW50LmRlZmF1bHQsXG4gIGlzSU1FSTogX2lzSU1FSS5kZWZhdWx0LFxuICBpc0Zsb2F0OiBfaXNGbG9hdC5kZWZhdWx0LFxuICBpc0Zsb2F0TG9jYWxlczogX2lzRmxvYXQubG9jYWxlcyxcbiAgaXNEZWNpbWFsOiBfaXNEZWNpbWFsLmRlZmF1bHQsXG4gIGlzSGV4YWRlY2ltYWw6IF9pc0hleGFkZWNpbWFsLmRlZmF1bHQsXG4gIGlzT2N0YWw6IF9pc09jdGFsLmRlZmF1bHQsXG4gIGlzRGl2aXNpYmxlQnk6IF9pc0RpdmlzaWJsZUJ5LmRlZmF1bHQsXG4gIGlzSGV4Q29sb3I6IF9pc0hleENvbG9yLmRlZmF1bHQsXG4gIGlzUmdiQ29sb3I6IF9pc1JnYkNvbG9yLmRlZmF1bHQsXG4gIGlzSFNMOiBfaXNIU0wuZGVmYXVsdCxcbiAgaXNJU1JDOiBfaXNJU1JDLmRlZmF1bHQsXG4gIGlzTUQ1OiBfaXNNRC5kZWZhdWx0LFxuICBpc0hhc2g6IF9pc0hhc2guZGVmYXVsdCxcbiAgaXNKV1Q6IF9pc0pXVC5kZWZhdWx0LFxuICBpc0pTT046IF9pc0pTT04uZGVmYXVsdCxcbiAgaXNFbXB0eTogX2lzRW1wdHkuZGVmYXVsdCxcbiAgaXNMZW5ndGg6IF9pc0xlbmd0aC5kZWZhdWx0LFxuICBpc0xvY2FsZTogX2lzTG9jYWxlLmRlZmF1bHQsXG4gIGlzQnl0ZUxlbmd0aDogX2lzQnl0ZUxlbmd0aC5kZWZhdWx0LFxuICBpc1VVSUQ6IF9pc1VVSUQuZGVmYXVsdCxcbiAgaXNNb25nb0lkOiBfaXNNb25nb0lkLmRlZmF1bHQsXG4gIGlzQWZ0ZXI6IF9pc0FmdGVyLmRlZmF1bHQsXG4gIGlzQmVmb3JlOiBfaXNCZWZvcmUuZGVmYXVsdCxcbiAgaXNJbjogX2lzSW4uZGVmYXVsdCxcbiAgaXNDcmVkaXRDYXJkOiBfaXNDcmVkaXRDYXJkLmRlZmF1bHQsXG4gIGlzSWRlbnRpdHlDYXJkOiBfaXNJZGVudGl0eUNhcmQuZGVmYXVsdCxcbiAgaXNFQU46IF9pc0VBTi5kZWZhdWx0LFxuICBpc0lTSU46IF9pc0lTSU4uZGVmYXVsdCxcbiAgaXNJU0JOOiBfaXNJU0JOLmRlZmF1bHQsXG4gIGlzSVNTTjogX2lzSVNTTi5kZWZhdWx0LFxuICBpc01vYmlsZVBob25lOiBfaXNNb2JpbGVQaG9uZS5kZWZhdWx0LFxuICBpc01vYmlsZVBob25lTG9jYWxlczogX2lzTW9iaWxlUGhvbmUubG9jYWxlcyxcbiAgaXNQb3N0YWxDb2RlOiBfaXNQb3N0YWxDb2RlLmRlZmF1bHQsXG4gIGlzUG9zdGFsQ29kZUxvY2FsZXM6IF9pc1Bvc3RhbENvZGUubG9jYWxlcyxcbiAgaXNFdGhlcmV1bUFkZHJlc3M6IF9pc0V0aGVyZXVtQWRkcmVzcy5kZWZhdWx0LFxuICBpc0N1cnJlbmN5OiBfaXNDdXJyZW5jeS5kZWZhdWx0LFxuICBpc0J0Y0FkZHJlc3M6IF9pc0J0Y0FkZHJlc3MuZGVmYXVsdCxcbiAgaXNJU084NjAxOiBfaXNJU08uZGVmYXVsdCxcbiAgaXNSRkMzMzM5OiBfaXNSRkMuZGVmYXVsdCxcbiAgaXNJU08zMTY2MUFscGhhMjogX2lzSVNPMzE2NjFBbHBoYS5kZWZhdWx0LFxuICBpc0lTTzMxNjYxQWxwaGEzOiBfaXNJU08zMTY2MUFscGhhMi5kZWZhdWx0LFxuICBpc0lTTzQyMTc6IF9pc0lTTzIuZGVmYXVsdCxcbiAgaXNCYXNlMzI6IF9pc0Jhc2UuZGVmYXVsdCxcbiAgaXNCYXNlNTg6IF9pc0Jhc2UyLmRlZmF1bHQsXG4gIGlzQmFzZTY0OiBfaXNCYXNlMy5kZWZhdWx0LFxuICBpc0RhdGFVUkk6IF9pc0RhdGFVUkkuZGVmYXVsdCxcbiAgaXNNYWduZXRVUkk6IF9pc01hZ25ldFVSSS5kZWZhdWx0LFxuICBpc01pbWVUeXBlOiBfaXNNaW1lVHlwZS5kZWZhdWx0LFxuICBpc0xhdExvbmc6IF9pc0xhdExvbmcuZGVmYXVsdCxcbiAgbHRyaW06IF9sdHJpbS5kZWZhdWx0LFxuICBydHJpbTogX3J0cmltLmRlZmF1bHQsXG4gIHRyaW06IF90cmltLmRlZmF1bHQsXG4gIGVzY2FwZTogX2VzY2FwZS5kZWZhdWx0LFxuICB1bmVzY2FwZTogX3VuZXNjYXBlLmRlZmF1bHQsXG4gIHN0cmlwTG93OiBfc3RyaXBMb3cuZGVmYXVsdCxcbiAgd2hpdGVsaXN0OiBfd2hpdGVsaXN0LmRlZmF1bHQsXG4gIGJsYWNrbGlzdDogX2JsYWNrbGlzdC5kZWZhdWx0LFxuICBpc1doaXRlbGlzdGVkOiBfaXNXaGl0ZWxpc3RlZC5kZWZhdWx0LFxuICBub3JtYWxpemVFbWFpbDogX25vcm1hbGl6ZUVtYWlsLmRlZmF1bHQsXG4gIHRvU3RyaW5nOiB0b1N0cmluZyxcbiAgaXNTbHVnOiBfaXNTbHVnLmRlZmF1bHQsXG4gIGlzU3Ryb25nUGFzc3dvcmQ6IF9pc1N0cm9uZ1Bhc3N3b3JkLmRlZmF1bHQsXG4gIGlzVGF4SUQ6IF9pc1RheElELmRlZmF1bHQsXG4gIGlzRGF0ZTogX2lzRGF0ZS5kZWZhdWx0LFxuICBpc0xpY2Vuc2VQbGF0ZTogX2lzTGljZW5zZVBsYXRlLmRlZmF1bHQsXG4gIGlzVkFUOiBfaXNWQVQuZGVmYXVsdCxcbiAgaWJhbkxvY2FsZXM6IF9pc0lCQU4ubG9jYWxlc1xufTtcbnZhciBfZGVmYXVsdCA9IHZhbGlkYXRvcjtcbmV4cG9ydHMuZGVmYXVsdCA9IF9kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzLmRlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5jb21tYURlY2ltYWwgPSBleHBvcnRzLmRvdERlY2ltYWwgPSBleHBvcnRzLmZhcnNpTG9jYWxlcyA9IGV4cG9ydHMuYXJhYmljTG9jYWxlcyA9IGV4cG9ydHMuZW5nbGlzaExvY2FsZXMgPSBleHBvcnRzLmRlY2ltYWwgPSBleHBvcnRzLmFscGhhbnVtZXJpYyA9IGV4cG9ydHMuYWxwaGEgPSB2b2lkIDA7XG52YXIgYWxwaGEgPSB7XG4gICdlbi1VUyc6IC9eW0EtWl0rJC9pLFxuICAnYXotQVonOiAvXltBLVZYWVrDh8aPxJ7EsMSxw5bFnsOcXSskL2ksXG4gICdiZy1CRyc6IC9eW9CQLdCvXSskL2ksXG4gICdjcy1DWic6IC9eW0EtWsOBxIzEjsOJxJrDjcWHw5PFmMWgxaTDmsWuw53FvV0rJC9pLFxuICAnZGEtREsnOiAvXltBLVrDhsOYw4VdKyQvaSxcbiAgJ2RlLURFJzogL15bQS1aw4TDlsOcw59dKyQvaSxcbiAgJ2VsLUdSJzogL15bzpEtz45dKyQvaSxcbiAgJ2VzLUVTJzogL15bQS1aw4HDicONw5HDk8Oaw5xdKyQvaSxcbiAgJ2ZhLUlSJzogL15b2KfYqNm+2KrYq9is2obYrdiu2K/YsNix2LLamNiz2LTYtdi22LfYuNi52LrZgdmC2qnar9mE2YXZhtmI2YfbjF0rJC9pLFxuICAnZmktRkknOiAvXltBLVrDhcOEw5ZdKyQvaSxcbiAgJ2ZyLUZSJzogL15bQS1aw4DDgsOGw4fDicOIw4rDi8OPw47DlMWSw5nDm8OcxbhdKyQvaSxcbiAgJ2l0LUlUJzogL15bQS1aw4DDicOIw4zDjsOTw5LDmV0rJC9pLFxuICAnbmItTk8nOiAvXltBLVrDhsOYw4VdKyQvaSxcbiAgJ25sLU5MJzogL15bQS1aw4HDicOLw4/Dk8OWw5zDml0rJC9pLFxuICAnbm4tTk8nOiAvXltBLVrDhsOYw4VdKyQvaSxcbiAgJ2h1LUhVJzogL15bQS1aw4HDicONw5PDlsWQw5rDnMWwXSskL2ksXG4gICdwbC1QTCc6IC9eW0EtWsSExIbEmMWaxYHFg8OTxbvFuV0rJC9pLFxuICAncHQtUFQnOiAvXltBLVrDg8OBw4DDgsOEw4fDicOKw4vDjcOPw5XDk8OUw5bDmsOcXSskL2ksXG4gICdydS1SVSc6IC9eW9CQLdCv0IFdKyQvaSxcbiAgJ3NsLVNJJzogL15bQS1axIzEhsSQxaDFvV0rJC9pLFxuICAnc2stU0snOiAvXltBLVrDgcSMxI7DicONxYfDk8WgxaTDmsOdxb3EucWUxL3DhMOUXSskL2ksXG4gICdzci1SU0BsYXRpbic6IC9eW0EtWsSMxIbFvcWgxJBdKyQvaSxcbiAgJ3NyLVJTJzogL15b0JAt0K/QgtCI0InQitCL0I9dKyQvaSxcbiAgJ3N2LVNFJzogL15bQS1aw4XDhMOWXSskL2ksXG4gICd0aC1USCc6IC9eW+C4gS3guZBcXHNdKyQvaSxcbiAgJ3RyLVRSJzogL15bQS1aw4fEnsSwxLHDlsWew5xdKyQvaSxcbiAgJ3VrLVVBJzogL15b0JAt0KnQrNCu0K/QhEnQh9KQ0ZZdKyQvaSxcbiAgJ3ZpLVZOJzogL15bQS1aw4DDgeG6oOG6osODw4LhuqbhuqThuqzhuqjhuqrEguG6sOG6ruG6tuG6suG6tMSQw4jDieG6uOG6uuG6vMOK4buA4bq+4buG4buC4buEw4zDjeG7iuG7iMSow5LDk+G7jOG7jsOVw5Thu5Lhu5Dhu5jhu5Thu5bGoOG7nOG7muG7ouG7nuG7oMOZw5rhu6Thu6bFqMav4buq4buo4buw4bus4buu4buyw53hu7Thu7bhu7hdKyQvaSxcbiAgJ2t1LUlRJzogL15b2KbYp9io2b7Yqtis2obYrdiu2K/YsdqV2LLamNiz2LTYudi62YHapNmC2qnar9mE2rXZhdmG2Yjbhtq+25XbjNuO2YrYt9ik2KvYotil2KPZg9i22LXYqdi42LBdKyQvaSxcbiAgYXI6IC9eW9ih2KLYo9ik2KXYptin2KjYqdiq2KvYrNit2K7Yr9iw2LHYstiz2LTYtdi22LfYuNi52LrZgdmC2YPZhNmF2YbZh9mI2YnZitmL2YzZjdmO2Y/ZkNmR2ZLZsF0rJC8sXG4gIGhlOiAvXlvXkC3Xql0rJC8sXG4gIGZhOiAvXlsn2KLYp9ih2KPYpNim2KjZvtiq2KvYrNqG2K3Yrtiv2LDYsdiy2pjYs9i02LXYtti32LjYudi62YHZgtqp2q/ZhNmF2YbZiNmH2KnbjCddKyQvaSxcbiAgJ2hpLUlOJzogL15bXFx1MDkwMC1cXHUwOTYxXStbXFx1MDk3Mi1cXHUwOTdGXSokL2lcbn07XG5leHBvcnRzLmFscGhhID0gYWxwaGE7XG52YXIgYWxwaGFudW1lcmljID0ge1xuICAnZW4tVVMnOiAvXlswLTlBLVpdKyQvaSxcbiAgJ2F6LUFaJzogL15bMC05QS1WWFlaw4fGj8SexLDEscOWxZ7DnF0rJC9pLFxuICAnYmctQkcnOiAvXlswLTnQkC3Qr10rJC9pLFxuICAnY3MtQ1onOiAvXlswLTlBLVrDgcSMxI7DicSaw43Fh8OTxZjFoMWkw5rFrsOdxb1dKyQvaSxcbiAgJ2RhLURLJzogL15bMC05QS1aw4bDmMOFXSskL2ksXG4gICdkZS1ERSc6IC9eWzAtOUEtWsOEw5bDnMOfXSskL2ksXG4gICdlbC1HUic6IC9eWzAtOc6RLc+JXSskL2ksXG4gICdlcy1FUyc6IC9eWzAtOUEtWsOBw4nDjcORw5PDmsOcXSskL2ksXG4gICdmaS1GSSc6IC9eWzAtOUEtWsOFw4TDll0rJC9pLFxuICAnZnItRlInOiAvXlswLTlBLVrDgMOCw4bDh8OJw4jDisOLw4/DjsOUxZLDmcObw5zFuF0rJC9pLFxuICAnaXQtSVQnOiAvXlswLTlBLVrDgMOJw4jDjMOOw5PDksOZXSskL2ksXG4gICdodS1IVSc6IC9eWzAtOUEtWsOBw4nDjcOTw5bFkMOaw5zFsF0rJC9pLFxuICAnbmItTk8nOiAvXlswLTlBLVrDhsOYw4VdKyQvaSxcbiAgJ25sLU5MJzogL15bMC05QS1aw4HDicOLw4/Dk8OWw5zDml0rJC9pLFxuICAnbm4tTk8nOiAvXlswLTlBLVrDhsOYw4VdKyQvaSxcbiAgJ3BsLVBMJzogL15bMC05QS1axITEhsSYxZrFgcWDw5PFu8W5XSskL2ksXG4gICdwdC1QVCc6IC9eWzAtOUEtWsODw4HDgMOCw4TDh8OJw4rDi8ONw4/DlcOTw5TDlsOaw5xdKyQvaSxcbiAgJ3J1LVJVJzogL15bMC050JAt0K/QgV0rJC9pLFxuICAnc2wtU0knOiAvXlswLTlBLVrEjMSGxJDFoMW9XSskL2ksXG4gICdzay1TSyc6IC9eWzAtOUEtWsOBxIzEjsOJw43Fh8OTxaDFpMOaw53FvcS5xZTEvcOEw5RdKyQvaSxcbiAgJ3NyLVJTQGxhdGluJzogL15bMC05QS1axIzEhsW9xaDEkF0rJC9pLFxuICAnc3ItUlMnOiAvXlswLTnQkC3Qr9CC0IjQidCK0IvQj10rJC9pLFxuICAnc3YtU0UnOiAvXlswLTlBLVrDhcOEw5ZdKyQvaSxcbiAgJ3RoLVRIJzogL15b4LiBLeC5mVxcc10rJC9pLFxuICAndHItVFInOiAvXlswLTlBLVrDh8SexLDEscOWxZ7DnF0rJC9pLFxuICAndWstVUEnOiAvXlswLTnQkC3QqdCs0K7Qr9CESdCH0pDRll0rJC9pLFxuICAna3UtSVEnOiAvXlvZoNmh2aLZo9mk2aXZptmn2ajZqTAtOdim2KfYqNm+2KrYrNqG2K3Yrtiv2LHaldiy2pjYs9i02LnYutmB2qTZgtqp2q/ZhNq12YXZhtmI24bavtuV24zbjtmK2LfYpNir2KLYpdij2YPYtti12KnYuNiwXSskL2ksXG4gICd2aS1WTic6IC9eWzAtOUEtWsOAw4HhuqDhuqLDg8OC4bqm4bqk4bqs4bqo4bqqxILhurDhuq7hurbhurLhurTEkMOIw4nhurjhurrhurzDiuG7gOG6vuG7huG7guG7hMOMw43hu4rhu4jEqMOSw5Phu4zhu47DlcOU4buS4buQ4buY4buU4buWxqDhu5zhu5rhu6Lhu57hu6DDmcOa4buk4bumxajGr+G7quG7qOG7sOG7rOG7ruG7ssOd4bu04bu24bu4XSskL2ksXG4gIGFyOiAvXlvZoNmh2aLZo9mk2aXZptmn2ajZqTAtOdih2KLYo9ik2KXYptin2KjYqdiq2KvYrNit2K7Yr9iw2LHYstiz2LTYtdi22LfYuNi52LrZgdmC2YPZhNmF2YbZh9mI2YnZitmL2YzZjdmO2Y/ZkNmR2ZLZsF0rJC8sXG4gIGhlOiAvXlswLTnXkC3Xql0rJC8sXG4gIGZhOiAvXlsnMC052KLYp9ih2KPYpNim2KjZvtiq2KvYrNqG2K3Yrtiv2LDYsdiy2pjYs9i02LXYtti32LjYudi62YHZgtqp2q/ZhNmF2YbZiNmH2KnbjNux27Lbs9u027Xbttu327jbuduwJ10rJC9pLFxuICAnaGktSU4nOiAvXltcXHUwOTAwLVxcdTA5NjNdK1tcXHUwOTY2LVxcdTA5N0ZdKiQvaVxufTtcbmV4cG9ydHMuYWxwaGFudW1lcmljID0gYWxwaGFudW1lcmljO1xudmFyIGRlY2ltYWwgPSB7XG4gICdlbi1VUyc6ICcuJyxcbiAgYXI6ICfZqydcbn07XG5leHBvcnRzLmRlY2ltYWwgPSBkZWNpbWFsO1xudmFyIGVuZ2xpc2hMb2NhbGVzID0gWydBVScsICdHQicsICdISycsICdJTicsICdOWicsICdaQScsICdaTSddO1xuZXhwb3J0cy5lbmdsaXNoTG9jYWxlcyA9IGVuZ2xpc2hMb2NhbGVzO1xuXG5mb3IgKHZhciBsb2NhbGUsIGkgPSAwOyBpIDwgZW5nbGlzaExvY2FsZXMubGVuZ3RoOyBpKyspIHtcbiAgbG9jYWxlID0gXCJlbi1cIi5jb25jYXQoZW5nbGlzaExvY2FsZXNbaV0pO1xuICBhbHBoYVtsb2NhbGVdID0gYWxwaGFbJ2VuLVVTJ107XG4gIGFscGhhbnVtZXJpY1tsb2NhbGVdID0gYWxwaGFudW1lcmljWydlbi1VUyddO1xuICBkZWNpbWFsW2xvY2FsZV0gPSBkZWNpbWFsWydlbi1VUyddO1xufSAvLyBTb3VyY2U6IGh0dHA6Ly93d3cubG9jYWxlcGxhbmV0LmNvbS9qYXZhL1xuXG5cbnZhciBhcmFiaWNMb2NhbGVzID0gWydBRScsICdCSCcsICdEWicsICdFRycsICdJUScsICdKTycsICdLVycsICdMQicsICdMWScsICdNQScsICdRTScsICdRQScsICdTQScsICdTRCcsICdTWScsICdUTicsICdZRSddO1xuZXhwb3J0cy5hcmFiaWNMb2NhbGVzID0gYXJhYmljTG9jYWxlcztcblxuZm9yICh2YXIgX2xvY2FsZSwgX2kgPSAwOyBfaSA8IGFyYWJpY0xvY2FsZXMubGVuZ3RoOyBfaSsrKSB7XG4gIF9sb2NhbGUgPSBcImFyLVwiLmNvbmNhdChhcmFiaWNMb2NhbGVzW19pXSk7XG4gIGFscGhhW19sb2NhbGVdID0gYWxwaGEuYXI7XG4gIGFscGhhbnVtZXJpY1tfbG9jYWxlXSA9IGFscGhhbnVtZXJpYy5hcjtcbiAgZGVjaW1hbFtfbG9jYWxlXSA9IGRlY2ltYWwuYXI7XG59XG5cbnZhciBmYXJzaUxvY2FsZXMgPSBbJ0lSJywgJ0FGJ107XG5leHBvcnRzLmZhcnNpTG9jYWxlcyA9IGZhcnNpTG9jYWxlcztcblxuZm9yICh2YXIgX2xvY2FsZTIsIF9pMiA9IDA7IF9pMiA8IGZhcnNpTG9jYWxlcy5sZW5ndGg7IF9pMisrKSB7XG4gIF9sb2NhbGUyID0gXCJmYS1cIi5jb25jYXQoZmFyc2lMb2NhbGVzW19pMl0pO1xuICBhbHBoYW51bWVyaWNbX2xvY2FsZTJdID0gYWxwaGFudW1lcmljLmZhO1xuICBkZWNpbWFsW19sb2NhbGUyXSA9IGRlY2ltYWwuYXI7XG59IC8vIFNvdXJjZTogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRGVjaW1hbF9tYXJrXG5cblxudmFyIGRvdERlY2ltYWwgPSBbJ2FyLUVHJywgJ2FyLUxCJywgJ2FyLUxZJ107XG5leHBvcnRzLmRvdERlY2ltYWwgPSBkb3REZWNpbWFsO1xudmFyIGNvbW1hRGVjaW1hbCA9IFsnYmctQkcnLCAnY3MtQ1onLCAnZGEtREsnLCAnZGUtREUnLCAnZWwtR1InLCAnZW4tWk0nLCAnZXMtRVMnLCAnZnItQ0EnLCAnZnItRlInLCAnaWQtSUQnLCAnaXQtSVQnLCAna3UtSVEnLCAnaGktSU4nLCAnaHUtSFUnLCAnbmItTk8nLCAnbm4tTk8nLCAnbmwtTkwnLCAncGwtUEwnLCAncHQtUFQnLCAncnUtUlUnLCAnc2wtU0knLCAnc3ItUlNAbGF0aW4nLCAnc3ItUlMnLCAnc3YtU0UnLCAndHItVFInLCAndWstVUEnLCAndmktVk4nXTtcbmV4cG9ydHMuY29tbWFEZWNpbWFsID0gY29tbWFEZWNpbWFsO1xuXG5mb3IgKHZhciBfaTMgPSAwOyBfaTMgPCBkb3REZWNpbWFsLmxlbmd0aDsgX2kzKyspIHtcbiAgZGVjaW1hbFtkb3REZWNpbWFsW19pM11dID0gZGVjaW1hbFsnZW4tVVMnXTtcbn1cblxuZm9yICh2YXIgX2k0ID0gMDsgX2k0IDwgY29tbWFEZWNpbWFsLmxlbmd0aDsgX2k0KyspIHtcbiAgZGVjaW1hbFtjb21tYURlY2ltYWxbX2k0XV0gPSAnLCc7XG59XG5cbmFscGhhWydmci1DQSddID0gYWxwaGFbJ2ZyLUZSJ107XG5hbHBoYW51bWVyaWNbJ2ZyLUNBJ10gPSBhbHBoYW51bWVyaWNbJ2ZyLUZSJ107XG5hbHBoYVsncHQtQlInXSA9IGFscGhhWydwdC1QVCddO1xuYWxwaGFudW1lcmljWydwdC1CUiddID0gYWxwaGFudW1lcmljWydwdC1QVCddO1xuZGVjaW1hbFsncHQtQlInXSA9IGRlY2ltYWxbJ3B0LVBUJ107IC8vIHNlZSAjODYyXG5cbmFscGhhWydwbC1QbCddID0gYWxwaGFbJ3BsLVBMJ107XG5hbHBoYW51bWVyaWNbJ3BsLVBsJ10gPSBhbHBoYW51bWVyaWNbJ3BsLVBMJ107XG5kZWNpbWFsWydwbC1QbCddID0gZGVjaW1hbFsncGwtUEwnXTsgLy8gc2VlICMxNDU1XG5cbmFscGhhWydmYS1BRiddID0gYWxwaGEuZmE7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBibGFja2xpc3Q7XG5cbnZhciBfYXNzZXJ0U3RyaW5nID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL2Fzc2VydFN0cmluZ1wiKSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIGJsYWNrbGlzdChzdHIsIGNoYXJzKSB7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7XG4gIHJldHVybiBzdHIucmVwbGFjZShuZXcgUmVnRXhwKFwiW1wiLmNvbmNhdChjaGFycywgXCJdK1wiKSwgJ2cnKSwgJycpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBjb250YWlucztcblxudmFyIF9hc3NlcnRTdHJpbmcgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvYXNzZXJ0U3RyaW5nXCIpKTtcblxudmFyIF90b1N0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC90b1N0cmluZ1wiKSk7XG5cbnZhciBfbWVyZ2UgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvbWVyZ2VcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgZGVmYXVsQ29udGFpbnNPcHRpb25zID0ge1xuICBpZ25vcmVDYXNlOiBmYWxzZSxcbiAgbWluT2NjdXJyZW5jZXM6IDFcbn07XG5cbmZ1bmN0aW9uIGNvbnRhaW5zKHN0ciwgZWxlbSwgb3B0aW9ucykge1xuICAoMCwgX2Fzc2VydFN0cmluZy5kZWZhdWx0KShzdHIpO1xuICBvcHRpb25zID0gKDAsIF9tZXJnZS5kZWZhdWx0KShvcHRpb25zLCBkZWZhdWxDb250YWluc09wdGlvbnMpO1xuXG4gIGlmIChvcHRpb25zLmlnbm9yZUNhc2UpIHtcbiAgICByZXR1cm4gc3RyLnRvTG93ZXJDYXNlKCkuc3BsaXQoKDAsIF90b1N0cmluZy5kZWZhdWx0KShlbGVtKS50b0xvd2VyQ2FzZSgpKS5sZW5ndGggPiBvcHRpb25zLm1pbk9jY3VycmVuY2VzO1xuICB9XG5cbiAgcmV0dXJuIHN0ci5zcGxpdCgoMCwgX3RvU3RyaW5nLmRlZmF1bHQpKGVsZW0pKS5sZW5ndGggPiBvcHRpb25zLm1pbk9jY3VycmVuY2VzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBlcXVhbHM7XG5cbnZhciBfYXNzZXJ0U3RyaW5nID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL2Fzc2VydFN0cmluZ1wiKSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIGVxdWFscyhzdHIsIGNvbXBhcmlzb24pIHtcbiAgKDAsIF9hc3NlcnRTdHJpbmcuZGVmYXVsdCkoc3RyKTtcbiAgcmV0dXJuIHN0ciA9PT0gY29tcGFyaXNvbjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzLmRlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gZXNjYXBlO1xuXG52YXIgX2Fzc2VydFN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9hc3NlcnRTdHJpbmdcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBlc2NhcGUoc3RyKSB7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvJi9nLCAnJmFtcDsnKS5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JykucmVwbGFjZSgvJy9nLCAnJiN4Mjc7JykucmVwbGFjZSgvPC9nLCAnJmx0OycpLnJlcGxhY2UoLz4vZywgJyZndDsnKS5yZXBsYWNlKC9cXC8vZywgJyYjeDJGOycpLnJlcGxhY2UoL1xcXFwvZywgJyYjeDVDOycpLnJlcGxhY2UoL2AvZywgJyYjOTY7Jyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGlzQWZ0ZXI7XG5cbnZhciBfYXNzZXJ0U3RyaW5nID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL2Fzc2VydFN0cmluZ1wiKSk7XG5cbnZhciBfdG9EYXRlID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi90b0RhdGVcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBpc0FmdGVyKHN0cikge1xuICB2YXIgZGF0ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogU3RyaW5nKG5ldyBEYXRlKCkpO1xuICAoMCwgX2Fzc2VydFN0cmluZy5kZWZhdWx0KShzdHIpO1xuICB2YXIgY29tcGFyaXNvbiA9ICgwLCBfdG9EYXRlLmRlZmF1bHQpKGRhdGUpO1xuICB2YXIgb3JpZ2luYWwgPSAoMCwgX3RvRGF0ZS5kZWZhdWx0KShzdHIpO1xuICByZXR1cm4gISEob3JpZ2luYWwgJiYgY29tcGFyaXNvbiAmJiBvcmlnaW5hbCA+IGNvbXBhcmlzb24pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBpc0FscGhhO1xuZXhwb3J0cy5sb2NhbGVzID0gdm9pZCAwO1xuXG52YXIgX2Fzc2VydFN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9hc3NlcnRTdHJpbmdcIikpO1xuXG52YXIgX2FscGhhID0gcmVxdWlyZShcIi4vYWxwaGFcIik7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIGlzQWxwaGEoX3N0cikge1xuICB2YXIgbG9jYWxlID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAnZW4tVVMnO1xuICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDoge307XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKF9zdHIpO1xuICB2YXIgc3RyID0gX3N0cjtcbiAgdmFyIGlnbm9yZSA9IG9wdGlvbnMuaWdub3JlO1xuXG4gIGlmIChpZ25vcmUpIHtcbiAgICBpZiAoaWdub3JlIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgICBzdHIgPSBzdHIucmVwbGFjZShpZ25vcmUsICcnKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBpZ25vcmUgPT09ICdzdHJpbmcnKSB7XG4gICAgICBzdHIgPSBzdHIucmVwbGFjZShuZXcgUmVnRXhwKFwiW1wiLmNvbmNhdChpZ25vcmUucmVwbGFjZSgvWy1bXFxde30oKSorPy4sXFxcXF4kfCNcXFxcc10vZywgJ1xcXFwkJicpLCBcIl1cIiksICdnJyksICcnKTsgLy8gZXNjYXBlIHJlZ2V4IGZvciBpZ25vcmVcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpZ25vcmUgc2hvdWxkIGJlIGluc3RhbmNlIG9mIGEgU3RyaW5nIG9yIFJlZ0V4cCcpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChsb2NhbGUgaW4gX2FscGhhLmFscGhhKSB7XG4gICAgcmV0dXJuIF9hbHBoYS5hbHBoYVtsb2NhbGVdLnRlc3Qoc3RyKTtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgbG9jYWxlICdcIi5jb25jYXQobG9jYWxlLCBcIidcIikpO1xufVxuXG52YXIgbG9jYWxlcyA9IE9iamVjdC5rZXlzKF9hbHBoYS5hbHBoYSk7XG5leHBvcnRzLmxvY2FsZXMgPSBsb2NhbGVzOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gaXNBbHBoYW51bWVyaWM7XG5leHBvcnRzLmxvY2FsZXMgPSB2b2lkIDA7XG5cbnZhciBfYXNzZXJ0U3RyaW5nID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL2Fzc2VydFN0cmluZ1wiKSk7XG5cbnZhciBfYWxwaGEgPSByZXF1aXJlKFwiLi9hbHBoYVwiKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gaXNBbHBoYW51bWVyaWMoX3N0cikge1xuICB2YXIgbG9jYWxlID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAnZW4tVVMnO1xuICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDoge307XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKF9zdHIpO1xuICB2YXIgc3RyID0gX3N0cjtcbiAgdmFyIGlnbm9yZSA9IG9wdGlvbnMuaWdub3JlO1xuXG4gIGlmIChpZ25vcmUpIHtcbiAgICBpZiAoaWdub3JlIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgICBzdHIgPSBzdHIucmVwbGFjZShpZ25vcmUsICcnKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBpZ25vcmUgPT09ICdzdHJpbmcnKSB7XG4gICAgICBzdHIgPSBzdHIucmVwbGFjZShuZXcgUmVnRXhwKFwiW1wiLmNvbmNhdChpZ25vcmUucmVwbGFjZSgvWy1bXFxde30oKSorPy4sXFxcXF4kfCNcXFxcc10vZywgJ1xcXFwkJicpLCBcIl1cIiksICdnJyksICcnKTsgLy8gZXNjYXBlIHJlZ2V4IGZvciBpZ25vcmVcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpZ25vcmUgc2hvdWxkIGJlIGluc3RhbmNlIG9mIGEgU3RyaW5nIG9yIFJlZ0V4cCcpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChsb2NhbGUgaW4gX2FscGhhLmFscGhhbnVtZXJpYykge1xuICAgIHJldHVybiBfYWxwaGEuYWxwaGFudW1lcmljW2xvY2FsZV0udGVzdChzdHIpO1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBsb2NhbGUgJ1wiLmNvbmNhdChsb2NhbGUsIFwiJ1wiKSk7XG59XG5cbnZhciBsb2NhbGVzID0gT2JqZWN0LmtleXMoX2FscGhhLmFscGhhbnVtZXJpYyk7XG5leHBvcnRzLmxvY2FsZXMgPSBsb2NhbGVzOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gaXNBc2NpaTtcblxudmFyIF9hc3NlcnRTdHJpbmcgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvYXNzZXJ0U3RyaW5nXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuLyogZXNsaW50LWRpc2FibGUgbm8tY29udHJvbC1yZWdleCAqL1xudmFyIGFzY2lpID0gL15bXFx4MDAtXFx4N0ZdKyQvO1xuLyogZXNsaW50LWVuYWJsZSBuby1jb250cm9sLXJlZ2V4ICovXG5cbmZ1bmN0aW9uIGlzQXNjaWkoc3RyKSB7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7XG4gIHJldHVybiBhc2NpaS50ZXN0KHN0cik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGlzQklDO1xuXG52YXIgX2Fzc2VydFN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9hc3NlcnRTdHJpbmdcIikpO1xuXG52YXIgX2lzSVNPMzE2NjFBbHBoYSA9IHJlcXVpcmUoXCIuL2lzSVNPMzE2NjFBbHBoYTJcIik7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbi8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lTT185MzYyXG52YXIgaXNCSUNSZWcgPSAvXltBLVphLXpdezZ9W0EtWmEtejAtOV17Mn0oW0EtWmEtejAtOV17M30pPyQvO1xuXG5mdW5jdGlvbiBpc0JJQyhzdHIpIHtcbiAgKDAsIF9hc3NlcnRTdHJpbmcuZGVmYXVsdCkoc3RyKTsgLy8gdG9VcHBlckNhc2UoKSBzaG91bGQgYmUgcmVtb3ZlZCB3aGVuIGEgbmV3IG1ham9yIHZlcnNpb24gZ29lcyBvdXQgdGhhdCBjaGFuZ2VzXG4gIC8vIHRoZSByZWdleCB0byBbQS1aXSAocGVyIHRoZSBzcGVjKS5cblxuICBpZiAoIV9pc0lTTzMxNjYxQWxwaGEuQ291bnRyeUNvZGVzLmhhcyhzdHIuc2xpY2UoNCwgNikudG9VcHBlckNhc2UoKSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gaXNCSUNSZWcudGVzdChzdHIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBpc0Jhc2UzMjtcblxudmFyIF9hc3NlcnRTdHJpbmcgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvYXNzZXJ0U3RyaW5nXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIGJhc2UzMiA9IC9eW0EtWjItN10rPSokLztcblxuZnVuY3Rpb24gaXNCYXNlMzIoc3RyKSB7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7XG4gIHZhciBsZW4gPSBzdHIubGVuZ3RoO1xuXG4gIGlmIChsZW4gJSA4ID09PSAwICYmIGJhc2UzMi50ZXN0KHN0cikpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzLmRlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gaXNCYXNlNTg7XG5cbnZhciBfYXNzZXJ0U3RyaW5nID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL2Fzc2VydFN0cmluZ1wiKSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbi8vIEFjY2VwdGVkIGNoYXJzIC0gMTIzNDU2Nzg5QUJDREVGR0ggSktMTU4gUFFSU1RVVldYWVphYmNkZWZnaGlqayBtbm9wcXJzdHV2d3h5elxudmFyIGJhc2U1OFJlZyA9IC9eW0EtSEotTlAtWmEta20tejEtOV0qJC87XG5cbmZ1bmN0aW9uIGlzQmFzZTU4KHN0cikge1xuICAoMCwgX2Fzc2VydFN0cmluZy5kZWZhdWx0KShzdHIpO1xuXG4gIGlmIChiYXNlNThSZWcudGVzdChzdHIpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGlzQmFzZTY0O1xuXG52YXIgX2Fzc2VydFN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9hc3NlcnRTdHJpbmdcIikpO1xuXG52YXIgX21lcmdlID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL21lcmdlXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIG5vdEJhc2U2NCA9IC9bXkEtWjAtOStcXC89XS9pO1xudmFyIHVybFNhZmVCYXNlNjQgPSAvXltBLVowLTlfXFwtXSokL2k7XG52YXIgZGVmYXVsdEJhc2U2NE9wdGlvbnMgPSB7XG4gIHVybFNhZmU6IGZhbHNlXG59O1xuXG5mdW5jdGlvbiBpc0Jhc2U2NChzdHIsIG9wdGlvbnMpIHtcbiAgKDAsIF9hc3NlcnRTdHJpbmcuZGVmYXVsdCkoc3RyKTtcbiAgb3B0aW9ucyA9ICgwLCBfbWVyZ2UuZGVmYXVsdCkob3B0aW9ucywgZGVmYXVsdEJhc2U2NE9wdGlvbnMpO1xuICB2YXIgbGVuID0gc3RyLmxlbmd0aDtcblxuICBpZiAob3B0aW9ucy51cmxTYWZlKSB7XG4gICAgcmV0dXJuIHVybFNhZmVCYXNlNjQudGVzdChzdHIpO1xuICB9XG5cbiAgaWYgKGxlbiAlIDQgIT09IDAgfHwgbm90QmFzZTY0LnRlc3Qoc3RyKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBmaXJzdFBhZGRpbmdDaGFyID0gc3RyLmluZGV4T2YoJz0nKTtcbiAgcmV0dXJuIGZpcnN0UGFkZGluZ0NoYXIgPT09IC0xIHx8IGZpcnN0UGFkZGluZ0NoYXIgPT09IGxlbiAtIDEgfHwgZmlyc3RQYWRkaW5nQ2hhciA9PT0gbGVuIC0gMiAmJiBzdHJbbGVuIC0gMV0gPT09ICc9Jztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzLmRlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gaXNCZWZvcmU7XG5cbnZhciBfYXNzZXJ0U3RyaW5nID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL2Fzc2VydFN0cmluZ1wiKSk7XG5cbnZhciBfdG9EYXRlID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi90b0RhdGVcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBpc0JlZm9yZShzdHIpIHtcbiAgdmFyIGRhdGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IFN0cmluZyhuZXcgRGF0ZSgpKTtcbiAgKDAsIF9hc3NlcnRTdHJpbmcuZGVmYXVsdCkoc3RyKTtcbiAgdmFyIGNvbXBhcmlzb24gPSAoMCwgX3RvRGF0ZS5kZWZhdWx0KShkYXRlKTtcbiAgdmFyIG9yaWdpbmFsID0gKDAsIF90b0RhdGUuZGVmYXVsdCkoc3RyKTtcbiAgcmV0dXJuICEhKG9yaWdpbmFsICYmIGNvbXBhcmlzb24gJiYgb3JpZ2luYWwgPCBjb21wYXJpc29uKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzLmRlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gaXNCb29sZWFuO1xuXG52YXIgX2Fzc2VydFN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9hc3NlcnRTdHJpbmdcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gIGxvb3NlOiBmYWxzZVxufTtcbnZhciBzdHJpY3RCb29sZWFucyA9IFsndHJ1ZScsICdmYWxzZScsICcxJywgJzAnXTtcbnZhciBsb29zZUJvb2xlYW5zID0gW10uY29uY2F0KHN0cmljdEJvb2xlYW5zLCBbJ3llcycsICdubyddKTtcblxuZnVuY3Rpb24gaXNCb29sZWFuKHN0cikge1xuICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogZGVmYXVsdE9wdGlvbnM7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7XG5cbiAgaWYgKG9wdGlvbnMubG9vc2UpIHtcbiAgICByZXR1cm4gbG9vc2VCb29sZWFucy5pbmNsdWRlcyhzdHIudG9Mb3dlckNhc2UoKSk7XG4gIH1cblxuICByZXR1cm4gc3RyaWN0Qm9vbGVhbnMuaW5jbHVkZXMoc3RyKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzLmRlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gaXNCdGNBZGRyZXNzO1xuXG52YXIgX2Fzc2VydFN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9hc3NlcnRTdHJpbmdcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG4vLyBzdXBwb3J0cyBCZWNoMzIgYWRkcmVzc2VzXG52YXIgYmVjaDMyID0gL14oYmMxKVthLXowLTldezI1LDM5fSQvO1xudmFyIGJhc2U1OCA9IC9eKDF8MylbQS1ISi1OUC1aYS1rbS16MS05XXsyNSwzOX0kLztcblxuZnVuY3Rpb24gaXNCdGNBZGRyZXNzKHN0cikge1xuICAoMCwgX2Fzc2VydFN0cmluZy5kZWZhdWx0KShzdHIpOyAvLyBjaGVjayBmb3IgYmVjaDMyXG5cbiAgaWYgKHN0ci5zdGFydHNXaXRoKCdiYzEnKSkge1xuICAgIHJldHVybiBiZWNoMzIudGVzdChzdHIpO1xuICB9XG5cbiAgcmV0dXJuIGJhc2U1OC50ZXN0KHN0cik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGlzQnl0ZUxlbmd0aDtcblxudmFyIF9hc3NlcnRTdHJpbmcgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvYXNzZXJ0U3RyaW5nXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgXCJAYmFiZWwvaGVscGVycyAtIHR5cGVvZlwiOyBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIpIHsgX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9OyB9IGVsc2UgeyBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07IH0gcmV0dXJuIF90eXBlb2Yob2JqKTsgfVxuXG4vKiBlc2xpbnQtZGlzYWJsZSBwcmVmZXItcmVzdC1wYXJhbXMgKi9cbmZ1bmN0aW9uIGlzQnl0ZUxlbmd0aChzdHIsIG9wdGlvbnMpIHtcbiAgKDAsIF9hc3NlcnRTdHJpbmcuZGVmYXVsdCkoc3RyKTtcbiAgdmFyIG1pbjtcbiAgdmFyIG1heDtcblxuICBpZiAoX3R5cGVvZihvcHRpb25zKSA9PT0gJ29iamVjdCcpIHtcbiAgICBtaW4gPSBvcHRpb25zLm1pbiB8fCAwO1xuICAgIG1heCA9IG9wdGlvbnMubWF4O1xuICB9IGVsc2Uge1xuICAgIC8vIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5OiBpc0J5dGVMZW5ndGgoc3RyLCBtaW4gWywgbWF4XSlcbiAgICBtaW4gPSBhcmd1bWVudHNbMV07XG4gICAgbWF4ID0gYXJndW1lbnRzWzJdO1xuICB9XG5cbiAgdmFyIGxlbiA9IGVuY29kZVVSSShzdHIpLnNwbGl0KC8lLi58Li8pLmxlbmd0aCAtIDE7XG4gIHJldHVybiBsZW4gPj0gbWluICYmICh0eXBlb2YgbWF4ID09PSAndW5kZWZpbmVkJyB8fCBsZW4gPD0gbWF4KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzLmRlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gaXNDcmVkaXRDYXJkO1xuXG52YXIgX2Fzc2VydFN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9hc3NlcnRTdHJpbmdcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG4vKiBlc2xpbnQtZGlzYWJsZSBtYXgtbGVuICovXG52YXIgY3JlZGl0Q2FyZCA9IC9eKD86NFswLTldezEyfSg/OlswLTldezMsNn0pP3w1WzEtNV1bMC05XXsxNH18KDIyMlsxLTldfDIyWzMtOV1bMC05XXwyWzMtNl1bMC05XXsyfXwyN1swMV1bMC05XXwyNzIwKVswLTldezEyfXw2KD86MDExfDVbMC05XVswLTldKVswLTldezEyLDE1fXwzWzQ3XVswLTldezEzfXwzKD86MFswLTVdfFs2OF1bMC05XSlbMC05XXsxMX18KD86MjEzMXwxODAwfDM1XFxkezN9KVxcZHsxMX18NlsyN11bMC05XXsxNH18Xig4MVswLTldezE0LDE3fSkpJC87XG4vKiBlc2xpbnQtZW5hYmxlIG1heC1sZW4gKi9cblxuZnVuY3Rpb24gaXNDcmVkaXRDYXJkKHN0cikge1xuICAoMCwgX2Fzc2VydFN0cmluZy5kZWZhdWx0KShzdHIpO1xuICB2YXIgc2FuaXRpemVkID0gc3RyLnJlcGxhY2UoL1stIF0rL2csICcnKTtcblxuICBpZiAoIWNyZWRpdENhcmQudGVzdChzYW5pdGl6ZWQpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIHN1bSA9IDA7XG4gIHZhciBkaWdpdDtcbiAgdmFyIHRtcE51bTtcbiAgdmFyIHNob3VsZERvdWJsZTtcblxuICBmb3IgKHZhciBpID0gc2FuaXRpemVkLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgZGlnaXQgPSBzYW5pdGl6ZWQuc3Vic3RyaW5nKGksIGkgKyAxKTtcbiAgICB0bXBOdW0gPSBwYXJzZUludChkaWdpdCwgMTApO1xuXG4gICAgaWYgKHNob3VsZERvdWJsZSkge1xuICAgICAgdG1wTnVtICo9IDI7XG5cbiAgICAgIGlmICh0bXBOdW0gPj0gMTApIHtcbiAgICAgICAgc3VtICs9IHRtcE51bSAlIDEwICsgMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN1bSArPSB0bXBOdW07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN1bSArPSB0bXBOdW07XG4gICAgfVxuXG4gICAgc2hvdWxkRG91YmxlID0gIXNob3VsZERvdWJsZTtcbiAgfVxuXG4gIHJldHVybiAhIShzdW0gJSAxMCA9PT0gMCA/IHNhbml0aXplZCA6IGZhbHNlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzLmRlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gaXNDdXJyZW5jeTtcblxudmFyIF9tZXJnZSA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9tZXJnZVwiKSk7XG5cbnZhciBfYXNzZXJ0U3RyaW5nID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL2Fzc2VydFN0cmluZ1wiKSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIGN1cnJlbmN5UmVnZXgob3B0aW9ucykge1xuICB2YXIgZGVjaW1hbF9kaWdpdHMgPSBcIlxcXFxke1wiLmNvbmNhdChvcHRpb25zLmRpZ2l0c19hZnRlcl9kZWNpbWFsWzBdLCBcIn1cIik7XG4gIG9wdGlvbnMuZGlnaXRzX2FmdGVyX2RlY2ltYWwuZm9yRWFjaChmdW5jdGlvbiAoZGlnaXQsIGluZGV4KSB7XG4gICAgaWYgKGluZGV4ICE9PSAwKSBkZWNpbWFsX2RpZ2l0cyA9IFwiXCIuY29uY2F0KGRlY2ltYWxfZGlnaXRzLCBcInxcXFxcZHtcIikuY29uY2F0KGRpZ2l0LCBcIn1cIik7XG4gIH0pO1xuICB2YXIgc3ltYm9sID0gXCIoXCIuY29uY2F0KG9wdGlvbnMuc3ltYm9sLnJlcGxhY2UoL1xcVy8sIGZ1bmN0aW9uIChtKSB7XG4gICAgcmV0dXJuIFwiXFxcXFwiLmNvbmNhdChtKTtcbiAgfSksIFwiKVwiKS5jb25jYXQob3B0aW9ucy5yZXF1aXJlX3N5bWJvbCA/ICcnIDogJz8nKSxcbiAgICAgIG5lZ2F0aXZlID0gJy0/JyxcbiAgICAgIHdob2xlX2RvbGxhcl9hbW91bnRfd2l0aG91dF9zZXAgPSAnWzEtOV1cXFxcZConLFxuICAgICAgd2hvbGVfZG9sbGFyX2Ftb3VudF93aXRoX3NlcCA9IFwiWzEtOV1cXFxcZHswLDJ9KFxcXFxcIi5jb25jYXQob3B0aW9ucy50aG91c2FuZHNfc2VwYXJhdG9yLCBcIlxcXFxkezN9KSpcIiksXG4gICAgICB2YWxpZF93aG9sZV9kb2xsYXJfYW1vdW50cyA9IFsnMCcsIHdob2xlX2RvbGxhcl9hbW91bnRfd2l0aG91dF9zZXAsIHdob2xlX2RvbGxhcl9hbW91bnRfd2l0aF9zZXBdLFxuICAgICAgd2hvbGVfZG9sbGFyX2Ftb3VudCA9IFwiKFwiLmNvbmNhdCh2YWxpZF93aG9sZV9kb2xsYXJfYW1vdW50cy5qb2luKCd8JyksIFwiKT9cIiksXG4gICAgICBkZWNpbWFsX2Ftb3VudCA9IFwiKFxcXFxcIi5jb25jYXQob3B0aW9ucy5kZWNpbWFsX3NlcGFyYXRvciwgXCIoXCIpLmNvbmNhdChkZWNpbWFsX2RpZ2l0cywgXCIpKVwiKS5jb25jYXQob3B0aW9ucy5yZXF1aXJlX2RlY2ltYWwgPyAnJyA6ICc/Jyk7XG4gIHZhciBwYXR0ZXJuID0gd2hvbGVfZG9sbGFyX2Ftb3VudCArIChvcHRpb25zLmFsbG93X2RlY2ltYWwgfHwgb3B0aW9ucy5yZXF1aXJlX2RlY2ltYWwgPyBkZWNpbWFsX2Ftb3VudCA6ICcnKTsgLy8gZGVmYXVsdCBpcyBuZWdhdGl2ZSBzaWduIGJlZm9yZSBzeW1ib2wsIGJ1dCB0aGVyZSBhcmUgdHdvIG90aGVyIG9wdGlvbnMgKGJlc2lkZXMgcGFyZW5zKVxuXG4gIGlmIChvcHRpb25zLmFsbG93X25lZ2F0aXZlcyAmJiAhb3B0aW9ucy5wYXJlbnNfZm9yX25lZ2F0aXZlcykge1xuICAgIGlmIChvcHRpb25zLm5lZ2F0aXZlX3NpZ25fYWZ0ZXJfZGlnaXRzKSB7XG4gICAgICBwYXR0ZXJuICs9IG5lZ2F0aXZlO1xuICAgIH0gZWxzZSBpZiAob3B0aW9ucy5uZWdhdGl2ZV9zaWduX2JlZm9yZV9kaWdpdHMpIHtcbiAgICAgIHBhdHRlcm4gPSBuZWdhdGl2ZSArIHBhdHRlcm47XG4gICAgfVxuICB9IC8vIFNvdXRoIEFmcmljYW4gUmFuZCwgZm9yIGV4YW1wbGUsIHVzZXMgUiAxMjMgKHNwYWNlKSBhbmQgUi0xMjMgKG5vIHNwYWNlKVxuXG5cbiAgaWYgKG9wdGlvbnMuYWxsb3dfbmVnYXRpdmVfc2lnbl9wbGFjZWhvbGRlcikge1xuICAgIHBhdHRlcm4gPSBcIiggKD8hXFxcXC0pKT9cIi5jb25jYXQocGF0dGVybik7XG4gIH0gZWxzZSBpZiAob3B0aW9ucy5hbGxvd19zcGFjZV9hZnRlcl9zeW1ib2wpIHtcbiAgICBwYXR0ZXJuID0gXCIgP1wiLmNvbmNhdChwYXR0ZXJuKTtcbiAgfSBlbHNlIGlmIChvcHRpb25zLmFsbG93X3NwYWNlX2FmdGVyX2RpZ2l0cykge1xuICAgIHBhdHRlcm4gKz0gJyggKD8hJCkpPyc7XG4gIH1cblxuICBpZiAob3B0aW9ucy5zeW1ib2xfYWZ0ZXJfZGlnaXRzKSB7XG4gICAgcGF0dGVybiArPSBzeW1ib2w7XG4gIH0gZWxzZSB7XG4gICAgcGF0dGVybiA9IHN5bWJvbCArIHBhdHRlcm47XG4gIH1cblxuICBpZiAob3B0aW9ucy5hbGxvd19uZWdhdGl2ZXMpIHtcbiAgICBpZiAob3B0aW9ucy5wYXJlbnNfZm9yX25lZ2F0aXZlcykge1xuICAgICAgcGF0dGVybiA9IFwiKFxcXFwoXCIuY29uY2F0KHBhdHRlcm4sIFwiXFxcXCl8XCIpLmNvbmNhdChwYXR0ZXJuLCBcIilcIik7XG4gICAgfSBlbHNlIGlmICghKG9wdGlvbnMubmVnYXRpdmVfc2lnbl9iZWZvcmVfZGlnaXRzIHx8IG9wdGlvbnMubmVnYXRpdmVfc2lnbl9hZnRlcl9kaWdpdHMpKSB7XG4gICAgICBwYXR0ZXJuID0gbmVnYXRpdmUgKyBwYXR0ZXJuO1xuICAgIH1cbiAgfSAvLyBlbnN1cmUgdGhlcmUncyBhIGRvbGxhciBhbmQvb3IgZGVjaW1hbCBhbW91bnQsIGFuZCB0aGF0XG4gIC8vIGl0IGRvZXNuJ3Qgc3RhcnQgd2l0aCBhIHNwYWNlIG9yIGEgbmVnYXRpdmUgc2lnbiBmb2xsb3dlZCBieSBhIHNwYWNlXG5cblxuICByZXR1cm4gbmV3IFJlZ0V4cChcIl4oPyEtPyApKD89LipcXFxcZClcIi5jb25jYXQocGF0dGVybiwgXCIkXCIpKTtcbn1cblxudmFyIGRlZmF1bHRfY3VycmVuY3lfb3B0aW9ucyA9IHtcbiAgc3ltYm9sOiAnJCcsXG4gIHJlcXVpcmVfc3ltYm9sOiBmYWxzZSxcbiAgYWxsb3dfc3BhY2VfYWZ0ZXJfc3ltYm9sOiBmYWxzZSxcbiAgc3ltYm9sX2FmdGVyX2RpZ2l0czogZmFsc2UsXG4gIGFsbG93X25lZ2F0aXZlczogdHJ1ZSxcbiAgcGFyZW5zX2Zvcl9uZWdhdGl2ZXM6IGZhbHNlLFxuICBuZWdhdGl2ZV9zaWduX2JlZm9yZV9kaWdpdHM6IGZhbHNlLFxuICBuZWdhdGl2ZV9zaWduX2FmdGVyX2RpZ2l0czogZmFsc2UsXG4gIGFsbG93X25lZ2F0aXZlX3NpZ25fcGxhY2Vob2xkZXI6IGZhbHNlLFxuICB0aG91c2FuZHNfc2VwYXJhdG9yOiAnLCcsXG4gIGRlY2ltYWxfc2VwYXJhdG9yOiAnLicsXG4gIGFsbG93X2RlY2ltYWw6IHRydWUsXG4gIHJlcXVpcmVfZGVjaW1hbDogZmFsc2UsXG4gIGRpZ2l0c19hZnRlcl9kZWNpbWFsOiBbMl0sXG4gIGFsbG93X3NwYWNlX2FmdGVyX2RpZ2l0czogZmFsc2Vcbn07XG5cbmZ1bmN0aW9uIGlzQ3VycmVuY3koc3RyLCBvcHRpb25zKSB7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7XG4gIG9wdGlvbnMgPSAoMCwgX21lcmdlLmRlZmF1bHQpKG9wdGlvbnMsIGRlZmF1bHRfY3VycmVuY3lfb3B0aW9ucyk7XG4gIHJldHVybiBjdXJyZW5jeVJlZ2V4KG9wdGlvbnMpLnRlc3Qoc3RyKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzLmRlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gaXNEYXRhVVJJO1xuXG52YXIgX2Fzc2VydFN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9hc3NlcnRTdHJpbmdcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgdmFsaWRNZWRpYVR5cGUgPSAvXlthLXpdK1xcL1thLXowLTlcXC1cXCtdKyQvaTtcbnZhciB2YWxpZEF0dHJpYnV0ZSA9IC9eW2EtelxcLV0rPVthLXowLTlcXC1dKyQvaTtcbnZhciB2YWxpZERhdGEgPSAvXlthLXowLTkhXFwkJidcXChcXClcXCpcXCssOz1cXC1cXC5ffjpAXFwvXFw/JVxcc10qJC9pO1xuXG5mdW5jdGlvbiBpc0RhdGFVUkkoc3RyKSB7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7XG4gIHZhciBkYXRhID0gc3RyLnNwbGl0KCcsJyk7XG5cbiAgaWYgKGRhdGEubGVuZ3RoIDwgMikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBhdHRyaWJ1dGVzID0gZGF0YS5zaGlmdCgpLnRyaW0oKS5zcGxpdCgnOycpO1xuICB2YXIgc2NoZW1lQW5kTWVkaWFUeXBlID0gYXR0cmlidXRlcy5zaGlmdCgpO1xuXG4gIGlmIChzY2hlbWVBbmRNZWRpYVR5cGUuc3Vic3RyKDAsIDUpICE9PSAnZGF0YTonKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIG1lZGlhVHlwZSA9IHNjaGVtZUFuZE1lZGlhVHlwZS5zdWJzdHIoNSk7XG5cbiAgaWYgKG1lZGlhVHlwZSAhPT0gJycgJiYgIXZhbGlkTWVkaWFUeXBlLnRlc3QobWVkaWFUeXBlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXR0cmlidXRlcy5sZW5ndGg7IGkrKykge1xuICAgIGlmICghKGkgPT09IGF0dHJpYnV0ZXMubGVuZ3RoIC0gMSAmJiBhdHRyaWJ1dGVzW2ldLnRvTG93ZXJDYXNlKCkgPT09ICdiYXNlNjQnKSAmJiAhdmFsaWRBdHRyaWJ1dGUudGVzdChhdHRyaWJ1dGVzW2ldKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGZvciAodmFyIF9pID0gMDsgX2kgPCBkYXRhLmxlbmd0aDsgX2krKykge1xuICAgIGlmICghdmFsaWREYXRhLnRlc3QoZGF0YVtfaV0pKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGlzRGF0ZTtcblxudmFyIF9tZXJnZSA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9tZXJnZVwiKSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9zbGljZWRUb0FycmF5KGFyciwgaSkgeyByZXR1cm4gX2FycmF5V2l0aEhvbGVzKGFycikgfHwgX2l0ZXJhYmxlVG9BcnJheUxpbWl0KGFyciwgaSkgfHwgX3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5KGFyciwgaSkgfHwgX25vbkl0ZXJhYmxlUmVzdCgpOyB9XG5cbmZ1bmN0aW9uIF9ub25JdGVyYWJsZVJlc3QoKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlLlxcbkluIG9yZGVyIHRvIGJlIGl0ZXJhYmxlLCBub24tYXJyYXkgb2JqZWN0cyBtdXN0IGhhdmUgYSBbU3ltYm9sLml0ZXJhdG9yXSgpIG1ldGhvZC5cIik7IH1cblxuZnVuY3Rpb24gX2l0ZXJhYmxlVG9BcnJheUxpbWl0KGFyciwgaSkgeyBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJ1bmRlZmluZWRcIiB8fCAhKFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoYXJyKSkpIHJldHVybjsgdmFyIF9hcnIgPSBbXTsgdmFyIF9uID0gdHJ1ZTsgdmFyIF9kID0gZmFsc2U7IHZhciBfZSA9IHVuZGVmaW5lZDsgdHJ5IHsgZm9yICh2YXIgX2kgPSBhcnJbU3ltYm9sLml0ZXJhdG9yXSgpLCBfczsgIShfbiA9IChfcyA9IF9pLm5leHQoKSkuZG9uZSk7IF9uID0gdHJ1ZSkgeyBfYXJyLnB1c2goX3MudmFsdWUpOyBpZiAoaSAmJiBfYXJyLmxlbmd0aCA9PT0gaSkgYnJlYWs7IH0gfSBjYXRjaCAoZXJyKSB7IF9kID0gdHJ1ZTsgX2UgPSBlcnI7IH0gZmluYWxseSB7IHRyeSB7IGlmICghX24gJiYgX2lbXCJyZXR1cm5cIl0gIT0gbnVsbCkgX2lbXCJyZXR1cm5cIl0oKTsgfSBmaW5hbGx5IHsgaWYgKF9kKSB0aHJvdyBfZTsgfSB9IHJldHVybiBfYXJyOyB9XG5cbmZ1bmN0aW9uIF9hcnJheVdpdGhIb2xlcyhhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgcmV0dXJuIGFycjsgfVxuXG5mdW5jdGlvbiBfY3JlYXRlRm9yT2ZJdGVyYXRvckhlbHBlcihvLCBhbGxvd0FycmF5TGlrZSkgeyB2YXIgaXQ7IGlmICh0eXBlb2YgU3ltYm9sID09PSBcInVuZGVmaW5lZFwiIHx8IG9bU3ltYm9sLml0ZXJhdG9yXSA9PSBudWxsKSB7IGlmIChBcnJheS5pc0FycmF5KG8pIHx8IChpdCA9IF91bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheShvKSkgfHwgYWxsb3dBcnJheUxpa2UgJiYgbyAmJiB0eXBlb2Ygby5sZW5ndGggPT09IFwibnVtYmVyXCIpIHsgaWYgKGl0KSBvID0gaXQ7IHZhciBpID0gMDsgdmFyIEYgPSBmdW5jdGlvbiBGKCkge307IHJldHVybiB7IHM6IEYsIG46IGZ1bmN0aW9uIG4oKSB7IGlmIChpID49IG8ubGVuZ3RoKSByZXR1cm4geyBkb25lOiB0cnVlIH07IHJldHVybiB7IGRvbmU6IGZhbHNlLCB2YWx1ZTogb1tpKytdIH07IH0sIGU6IGZ1bmN0aW9uIGUoX2UyKSB7IHRocm93IF9lMjsgfSwgZjogRiB9OyB9IHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gaXRlcmF0ZSBub24taXRlcmFibGUgaW5zdGFuY2UuXFxuSW4gb3JkZXIgdG8gYmUgaXRlcmFibGUsIG5vbi1hcnJheSBvYmplY3RzIG11c3QgaGF2ZSBhIFtTeW1ib2wuaXRlcmF0b3JdKCkgbWV0aG9kLlwiKTsgfSB2YXIgbm9ybWFsQ29tcGxldGlvbiA9IHRydWUsIGRpZEVyciA9IGZhbHNlLCBlcnI7IHJldHVybiB7IHM6IGZ1bmN0aW9uIHMoKSB7IGl0ID0gb1tTeW1ib2wuaXRlcmF0b3JdKCk7IH0sIG46IGZ1bmN0aW9uIG4oKSB7IHZhciBzdGVwID0gaXQubmV4dCgpOyBub3JtYWxDb21wbGV0aW9uID0gc3RlcC5kb25lOyByZXR1cm4gc3RlcDsgfSwgZTogZnVuY3Rpb24gZShfZTMpIHsgZGlkRXJyID0gdHJ1ZTsgZXJyID0gX2UzOyB9LCBmOiBmdW5jdGlvbiBmKCkgeyB0cnkgeyBpZiAoIW5vcm1hbENvbXBsZXRpb24gJiYgaXQucmV0dXJuICE9IG51bGwpIGl0LnJldHVybigpOyB9IGZpbmFsbHkgeyBpZiAoZGlkRXJyKSB0aHJvdyBlcnI7IH0gfSB9OyB9XG5cbmZ1bmN0aW9uIF91bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheShvLCBtaW5MZW4pIHsgaWYgKCFvKSByZXR1cm47IGlmICh0eXBlb2YgbyA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIF9hcnJheUxpa2VUb0FycmF5KG8sIG1pbkxlbik7IHZhciBuID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pLnNsaWNlKDgsIC0xKTsgaWYgKG4gPT09IFwiT2JqZWN0XCIgJiYgby5jb25zdHJ1Y3RvcikgbiA9IG8uY29uc3RydWN0b3IubmFtZTsgaWYgKG4gPT09IFwiTWFwXCIgfHwgbiA9PT0gXCJTZXRcIikgcmV0dXJuIEFycmF5LmZyb20obyk7IGlmIChuID09PSBcIkFyZ3VtZW50c1wiIHx8IC9eKD86VWl8SSludCg/Ojh8MTZ8MzIpKD86Q2xhbXBlZCk/QXJyYXkkLy50ZXN0KG4pKSByZXR1cm4gX2FycmF5TGlrZVRvQXJyYXkobywgbWluTGVuKTsgfVxuXG5mdW5jdGlvbiBfYXJyYXlMaWtlVG9BcnJheShhcnIsIGxlbikgeyBpZiAobGVuID09IG51bGwgfHwgbGVuID4gYXJyLmxlbmd0aCkgbGVuID0gYXJyLmxlbmd0aDsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBuZXcgQXJyYXkobGVuKTsgaSA8IGxlbjsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH1cblxudmFyIGRlZmF1bHRfZGF0ZV9vcHRpb25zID0ge1xuICBmb3JtYXQ6ICdZWVlZL01NL0REJyxcbiAgZGVsaW1pdGVyczogWycvJywgJy0nXSxcbiAgc3RyaWN0TW9kZTogZmFsc2Vcbn07XG5cbmZ1bmN0aW9uIGlzVmFsaWRGb3JtYXQoZm9ybWF0KSB7XG4gIHJldHVybiAvKF4oeXs0fXx5ezJ9KVsuXFwvLV0obXsxLDJ9KVsuXFwvLV0oZHsxLDJ9KSQpfCheKG17MSwyfSlbLlxcLy1dKGR7MSwyfSlbLlxcLy1dKCh5ezR9fHl7Mn0pJCkpfCheKGR7MSwyfSlbLlxcLy1dKG17MSwyfSlbLlxcLy1dKCh5ezR9fHl7Mn0pJCkpL2dpLnRlc3QoZm9ybWF0KTtcbn1cblxuZnVuY3Rpb24gemlwKGRhdGUsIGZvcm1hdCkge1xuICB2YXIgemlwcGVkQXJyID0gW10sXG4gICAgICBsZW4gPSBNYXRoLm1pbihkYXRlLmxlbmd0aCwgZm9ybWF0Lmxlbmd0aCk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIHppcHBlZEFyci5wdXNoKFtkYXRlW2ldLCBmb3JtYXRbaV1dKTtcbiAgfVxuXG4gIHJldHVybiB6aXBwZWRBcnI7XG59XG5cbmZ1bmN0aW9uIGlzRGF0ZShpbnB1dCwgb3B0aW9ucykge1xuICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnKSB7XG4gICAgLy8gQWxsb3cgYmFja3dhcmQgY29tcGF0YmlsaXR5IGZvciBvbGQgZm9ybWF0IGlzRGF0ZShpbnB1dCBbLCBmb3JtYXRdKVxuICAgIG9wdGlvbnMgPSAoMCwgX21lcmdlLmRlZmF1bHQpKHtcbiAgICAgIGZvcm1hdDogb3B0aW9uc1xuICAgIH0sIGRlZmF1bHRfZGF0ZV9vcHRpb25zKTtcbiAgfSBlbHNlIHtcbiAgICBvcHRpb25zID0gKDAsIF9tZXJnZS5kZWZhdWx0KShvcHRpb25zLCBkZWZhdWx0X2RhdGVfb3B0aW9ucyk7XG4gIH1cblxuICBpZiAodHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJyAmJiBpc1ZhbGlkRm9ybWF0KG9wdGlvbnMuZm9ybWF0KSkge1xuICAgIHZhciBmb3JtYXREZWxpbWl0ZXIgPSBvcHRpb25zLmRlbGltaXRlcnMuZmluZChmdW5jdGlvbiAoZGVsaW1pdGVyKSB7XG4gICAgICByZXR1cm4gb3B0aW9ucy5mb3JtYXQuaW5kZXhPZihkZWxpbWl0ZXIpICE9PSAtMTtcbiAgICB9KTtcbiAgICB2YXIgZGF0ZURlbGltaXRlciA9IG9wdGlvbnMuc3RyaWN0TW9kZSA/IGZvcm1hdERlbGltaXRlciA6IG9wdGlvbnMuZGVsaW1pdGVycy5maW5kKGZ1bmN0aW9uIChkZWxpbWl0ZXIpIHtcbiAgICAgIHJldHVybiBpbnB1dC5pbmRleE9mKGRlbGltaXRlcikgIT09IC0xO1xuICAgIH0pO1xuICAgIHZhciBkYXRlQW5kRm9ybWF0ID0gemlwKGlucHV0LnNwbGl0KGRhdGVEZWxpbWl0ZXIpLCBvcHRpb25zLmZvcm1hdC50b0xvd2VyQ2FzZSgpLnNwbGl0KGZvcm1hdERlbGltaXRlcikpO1xuICAgIHZhciBkYXRlT2JqID0ge307XG5cbiAgICB2YXIgX2l0ZXJhdG9yID0gX2NyZWF0ZUZvck9mSXRlcmF0b3JIZWxwZXIoZGF0ZUFuZEZvcm1hdCksXG4gICAgICAgIF9zdGVwO1xuXG4gICAgdHJ5IHtcbiAgICAgIGZvciAoX2l0ZXJhdG9yLnMoKTsgIShfc3RlcCA9IF9pdGVyYXRvci5uKCkpLmRvbmU7KSB7XG4gICAgICAgIHZhciBfc3RlcCR2YWx1ZSA9IF9zbGljZWRUb0FycmF5KF9zdGVwLnZhbHVlLCAyKSxcbiAgICAgICAgICAgIGRhdGVXb3JkID0gX3N0ZXAkdmFsdWVbMF0sXG4gICAgICAgICAgICBmb3JtYXRXb3JkID0gX3N0ZXAkdmFsdWVbMV07XG5cbiAgICAgICAgaWYgKGRhdGVXb3JkLmxlbmd0aCAhPT0gZm9ybWF0V29yZC5sZW5ndGgpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBkYXRlT2JqW2Zvcm1hdFdvcmQuY2hhckF0KDApXSA9IGRhdGVXb3JkO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgX2l0ZXJhdG9yLmUoZXJyKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgX2l0ZXJhdG9yLmYoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IERhdGUoXCJcIi5jb25jYXQoZGF0ZU9iai5tLCBcIi9cIikuY29uY2F0KGRhdGVPYmouZCwgXCIvXCIpLmNvbmNhdChkYXRlT2JqLnkpKS5nZXREYXRlKCkgPT09ICtkYXRlT2JqLmQ7XG4gIH1cblxuICBpZiAoIW9wdGlvbnMuc3RyaWN0TW9kZSkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoaW5wdXQpID09PSAnW29iamVjdCBEYXRlXScgJiYgaXNGaW5pdGUoaW5wdXQpO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBpc0RlY2ltYWw7XG5cbnZhciBfbWVyZ2UgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvbWVyZ2VcIikpO1xuXG52YXIgX2Fzc2VydFN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9hc3NlcnRTdHJpbmdcIikpO1xuXG52YXIgX2luY2x1ZGVzID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL2luY2x1ZGVzXCIpKTtcblxudmFyIF9hbHBoYSA9IHJlcXVpcmUoXCIuL2FscGhhXCIpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBkZWNpbWFsUmVnRXhwKG9wdGlvbnMpIHtcbiAgdmFyIHJlZ0V4cCA9IG5ldyBSZWdFeHAoXCJeWy0rXT8oWzAtOV0rKT8oXFxcXFwiLmNvbmNhdChfYWxwaGEuZGVjaW1hbFtvcHRpb25zLmxvY2FsZV0sIFwiWzAtOV17XCIpLmNvbmNhdChvcHRpb25zLmRlY2ltYWxfZGlnaXRzLCBcIn0pXCIpLmNvbmNhdChvcHRpb25zLmZvcmNlX2RlY2ltYWwgPyAnJyA6ICc/JywgXCIkXCIpKTtcbiAgcmV0dXJuIHJlZ0V4cDtcbn1cblxudmFyIGRlZmF1bHRfZGVjaW1hbF9vcHRpb25zID0ge1xuICBmb3JjZV9kZWNpbWFsOiBmYWxzZSxcbiAgZGVjaW1hbF9kaWdpdHM6ICcxLCcsXG4gIGxvY2FsZTogJ2VuLVVTJ1xufTtcbnZhciBibGFja2xpc3QgPSBbJycsICctJywgJysnXTtcblxuZnVuY3Rpb24gaXNEZWNpbWFsKHN0ciwgb3B0aW9ucykge1xuICAoMCwgX2Fzc2VydFN0cmluZy5kZWZhdWx0KShzdHIpO1xuICBvcHRpb25zID0gKDAsIF9tZXJnZS5kZWZhdWx0KShvcHRpb25zLCBkZWZhdWx0X2RlY2ltYWxfb3B0aW9ucyk7XG5cbiAgaWYgKG9wdGlvbnMubG9jYWxlIGluIF9hbHBoYS5kZWNpbWFsKSB7XG4gICAgcmV0dXJuICEoMCwgX2luY2x1ZGVzLmRlZmF1bHQpKGJsYWNrbGlzdCwgc3RyLnJlcGxhY2UoLyAvZywgJycpKSAmJiBkZWNpbWFsUmVnRXhwKG9wdGlvbnMpLnRlc3Qoc3RyKTtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgbG9jYWxlICdcIi5jb25jYXQob3B0aW9ucy5sb2NhbGUsIFwiJ1wiKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGlzRGl2aXNpYmxlQnk7XG5cbnZhciBfYXNzZXJ0U3RyaW5nID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL2Fzc2VydFN0cmluZ1wiKSk7XG5cbnZhciBfdG9GbG9hdCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdG9GbG9hdFwiKSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIGlzRGl2aXNpYmxlQnkoc3RyLCBudW0pIHtcbiAgKDAsIF9hc3NlcnRTdHJpbmcuZGVmYXVsdCkoc3RyKTtcbiAgcmV0dXJuICgwLCBfdG9GbG9hdC5kZWZhdWx0KShzdHIpICUgcGFyc2VJbnQobnVtLCAxMCkgPT09IDA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGlzRUFOO1xuXG52YXIgX2Fzc2VydFN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9hc3NlcnRTdHJpbmdcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG4vKipcbiAqIFRoZSBtb3N0IGNvbW1vbmx5IHVzZWQgRUFOIHN0YW5kYXJkIGlzXG4gKiB0aGUgdGhpcnRlZW4tZGlnaXQgRUFOLTEzLCB3aGlsZSB0aGVcbiAqIGxlc3MgY29tbW9ubHkgdXNlZCA4LWRpZ2l0IEVBTi04IGJhcmNvZGUgd2FzXG4gKiBpbnRyb2R1Y2VkIGZvciB1c2Ugb24gc21hbGwgcGFja2FnZXMuXG4gKiBBbHNvIEVBTi9VQ0MtMTQgaXMgdXNlZCBmb3IgR3JvdXBpbmcgb2YgaW5kaXZpZHVhbFxuICogdHJhZGUgaXRlbXMgYWJvdmUgdW5pdCBsZXZlbChJbnRlcm1lZGlhdGUsIENhcnRvbiBvciBQYWxsZXQpLlxuICogRm9yIG1vcmUgaW5mbyBhYm91dCBFQU4tMTQgY2hlY2tvdXQ6IGh0dHBzOi8vd3d3Lmd0aW4uaW5mby9pdGYtMTQtYmFyY29kZXMvXG4gKiBFQU4gY29uc2lzdHMgb2Y6XG4gKiBHUzEgcHJlZml4LCBtYW51ZmFjdHVyZXIgY29kZSwgcHJvZHVjdCBjb2RlIGFuZCBjaGVjayBkaWdpdFxuICogUmVmZXJlbmNlOiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JbnRlcm5hdGlvbmFsX0FydGljbGVfTnVtYmVyXG4gKiBSZWZlcmVuY2U6IGh0dHBzOi8vd3d3Lmd0aW4uaW5mby9cbiAqL1xuXG4vKipcbiAqIERlZmluZSBFQU4gTGVuZ2h0czsgOCBmb3IgRUFOLTg7IDEzIGZvciBFQU4tMTM7IDE0IGZvciBFQU4tMTRcbiAqIGFuZCBSZWd1bGFyIEV4cHJlc3Npb24gZm9yIHZhbGlkIEVBTnMgKEVBTi04LCBFQU4tMTMsIEVBTi0xNCksXG4gKiB3aXRoIGV4YWN0IG51bWJlcmljIG1hdGNoaW5nIG9mIDggb3IgMTMgb3IgMTQgZGlnaXRzIFswLTldXG4gKi9cbnZhciBMRU5HVEhfRUFOXzggPSA4O1xudmFyIExFTkdUSF9FQU5fMTQgPSAxNDtcbnZhciB2YWxpZEVhblJlZ2V4ID0gL14oXFxkezh9fFxcZHsxM318XFxkezE0fSkkLztcbi8qKlxuICogR2V0IHBvc2l0aW9uIHdlaWdodCBnaXZlbjpcbiAqIEVBTiBsZW5ndGggYW5kIGRpZ2l0IGluZGV4L3Bvc2l0aW9uXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IGxlbmd0aFxuICogQHBhcmFtIHtudW1iZXJ9IGluZGV4XG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKi9cblxuZnVuY3Rpb24gZ2V0UG9zaXRpb25XZWlnaHRUaHJvdWdoTGVuZ3RoQW5kSW5kZXgobGVuZ3RoLCBpbmRleCkge1xuICBpZiAobGVuZ3RoID09PSBMRU5HVEhfRUFOXzggfHwgbGVuZ3RoID09PSBMRU5HVEhfRUFOXzE0KSB7XG4gICAgcmV0dXJuIGluZGV4ICUgMiA9PT0gMCA/IDMgOiAxO1xuICB9XG5cbiAgcmV0dXJuIGluZGV4ICUgMiA9PT0gMCA/IDEgOiAzO1xufVxuLyoqXG4gKiBDYWxjdWxhdGUgRUFOIENoZWNrIERpZ2l0XG4gKiBSZWZlcmVuY2U6IGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0ludGVybmF0aW9uYWxfQXJ0aWNsZV9OdW1iZXIjQ2FsY3VsYXRpb25fb2ZfY2hlY2tzdW1fZGlnaXRcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZWFuXG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKi9cblxuXG5mdW5jdGlvbiBjYWxjdWxhdGVDaGVja0RpZ2l0KGVhbikge1xuICB2YXIgY2hlY2tzdW0gPSBlYW4uc2xpY2UoMCwgLTEpLnNwbGl0KCcnKS5tYXAoZnVuY3Rpb24gKGNoYXIsIGluZGV4KSB7XG4gICAgcmV0dXJuIE51bWJlcihjaGFyKSAqIGdldFBvc2l0aW9uV2VpZ2h0VGhyb3VnaExlbmd0aEFuZEluZGV4KGVhbi5sZW5ndGgsIGluZGV4KTtcbiAgfSkucmVkdWNlKGZ1bmN0aW9uIChhY2MsIHBhcnRpYWxTdW0pIHtcbiAgICByZXR1cm4gYWNjICsgcGFydGlhbFN1bTtcbiAgfSwgMCk7XG4gIHZhciByZW1haW5kZXIgPSAxMCAtIGNoZWNrc3VtICUgMTA7XG4gIHJldHVybiByZW1haW5kZXIgPCAxMCA/IHJlbWFpbmRlciA6IDA7XG59XG4vKipcbiAqIENoZWNrIGlmIHN0cmluZyBpcyB2YWxpZCBFQU46XG4gKiBNYXRjaGVzIEVBTi04L0VBTi0xMy9FQU4tMTQgcmVnZXhcbiAqIEhhcyB2YWxpZCBjaGVjayBkaWdpdC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5cblxuZnVuY3Rpb24gaXNFQU4oc3RyKSB7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7XG4gIHZhciBhY3R1YWxDaGVja0RpZ2l0ID0gTnVtYmVyKHN0ci5zbGljZSgtMSkpO1xuICByZXR1cm4gdmFsaWRFYW5SZWdleC50ZXN0KHN0cikgJiYgYWN0dWFsQ2hlY2tEaWdpdCA9PT0gY2FsY3VsYXRlQ2hlY2tEaWdpdChzdHIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBpc0VtYWlsO1xuXG52YXIgX2Fzc2VydFN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9hc3NlcnRTdHJpbmdcIikpO1xuXG52YXIgX21lcmdlID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL21lcmdlXCIpKTtcblxudmFyIF9pc0J5dGVMZW5ndGggPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2lzQnl0ZUxlbmd0aFwiKSk7XG5cbnZhciBfaXNGUUROID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9pc0ZRRE5cIikpO1xuXG52YXIgX2lzSVAgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2lzSVBcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgZGVmYXVsdF9lbWFpbF9vcHRpb25zID0ge1xuICBhbGxvd19kaXNwbGF5X25hbWU6IGZhbHNlLFxuICByZXF1aXJlX2Rpc3BsYXlfbmFtZTogZmFsc2UsXG4gIGFsbG93X3V0ZjhfbG9jYWxfcGFydDogdHJ1ZSxcbiAgcmVxdWlyZV90bGQ6IHRydWUsXG4gIGJsYWNrbGlzdGVkX2NoYXJzOiAnJyxcbiAgaWdub3JlX21heF9sZW5ndGg6IGZhbHNlLFxuICBob3N0X2JsYWNrbGlzdDogW11cbn07XG4vKiBlc2xpbnQtZGlzYWJsZSBtYXgtbGVuICovXG5cbi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnRyb2wtcmVnZXggKi9cblxudmFyIHNwbGl0TmFtZUFkZHJlc3MgPSAvXihbXlxceDAwLVxceDFGXFx4N0YtXFx4OUZcXGNYXSspPC9pO1xudmFyIGVtYWlsVXNlclBhcnQgPSAvXlthLXpcXGQhI1xcJCUmJ1xcKlxcK1xcLVxcLz1cXD9cXF5fYHtcXHx9fl0rJC9pO1xudmFyIGdtYWlsVXNlclBhcnQgPSAvXlthLXpcXGRdKyQvO1xudmFyIHF1b3RlZEVtYWlsVXNlciA9IC9eKFtcXHNcXHgwMS1cXHgwOFxceDBiXFx4MGNcXHgwZS1cXHgxZlxceDdmXFx4MjFcXHgyMy1cXHg1YlxceDVkLVxceDdlXXwoXFxcXFtcXHgwMS1cXHgwOVxceDBiXFx4MGNcXHgwZC1cXHg3Zl0pKSokL2k7XG52YXIgZW1haWxVc2VyVXRmOFBhcnQgPSAvXlthLXpcXGQhI1xcJCUmJ1xcKlxcK1xcLVxcLz1cXD9cXF5fYHtcXHx9flxcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0rJC9pO1xudmFyIHF1b3RlZEVtYWlsVXNlclV0ZjggPSAvXihbXFxzXFx4MDEtXFx4MDhcXHgwYlxceDBjXFx4MGUtXFx4MWZcXHg3ZlxceDIxXFx4MjMtXFx4NWJcXHg1ZC1cXHg3ZVxcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl18KFxcXFxbXFx4MDEtXFx4MDlcXHgwYlxceDBjXFx4MGQtXFx4N2ZcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSkqJC9pO1xudmFyIGRlZmF1bHRNYXhFbWFpbExlbmd0aCA9IDI1NDtcbi8qIGVzbGludC1lbmFibGUgbWF4LWxlbiAqL1xuXG4vKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnRyb2wtcmVnZXggKi9cblxuLyoqXG4gKiBWYWxpZGF0ZSBkaXNwbGF5IG5hbWUgYWNjb3JkaW5nIHRvIHRoZSBSRkMyODIyOiBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMjgyMiNhcHBlbmRpeC1BLjEuMlxuICogQHBhcmFtIHtTdHJpbmd9IGRpc3BsYXlfbmFtZVxuICovXG5cbmZ1bmN0aW9uIHZhbGlkYXRlRGlzcGxheU5hbWUoZGlzcGxheV9uYW1lKSB7XG4gIHZhciBkaXNwbGF5X25hbWVfd2l0aG91dF9xdW90ZXMgPSBkaXNwbGF5X25hbWUucmVwbGFjZSgvXlwiKC4rKVwiJC8sICckMScpOyAvLyBkaXNwbGF5IG5hbWUgd2l0aCBvbmx5IHNwYWNlcyBpcyBub3QgdmFsaWRcblxuICBpZiAoIWRpc3BsYXlfbmFtZV93aXRob3V0X3F1b3Rlcy50cmltKCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0gLy8gY2hlY2sgd2hldGhlciBkaXNwbGF5IG5hbWUgY29udGFpbnMgaWxsZWdhbCBjaGFyYWN0ZXJcblxuXG4gIHZhciBjb250YWluc19pbGxlZ2FsID0gL1tcXC5cIjs8Pl0vLnRlc3QoZGlzcGxheV9uYW1lX3dpdGhvdXRfcXVvdGVzKTtcblxuICBpZiAoY29udGFpbnNfaWxsZWdhbCkge1xuICAgIC8vIGlmIGNvbnRhaW5zIGlsbGVnYWwgY2hhcmFjdGVycyxcbiAgICAvLyBtdXN0IHRvIGJlIGVuY2xvc2VkIGluIGRvdWJsZS1xdW90ZXMsIG90aGVyd2lzZSBpdCdzIG5vdCBhIHZhbGlkIGRpc3BsYXkgbmFtZVxuICAgIGlmIChkaXNwbGF5X25hbWVfd2l0aG91dF9xdW90ZXMgPT09IGRpc3BsYXlfbmFtZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gLy8gdGhlIHF1b3RlcyBpbiBkaXNwbGF5IG5hbWUgbXVzdCBzdGFydCB3aXRoIGNoYXJhY3RlciBzeW1ib2wgXFxcblxuXG4gICAgdmFyIGFsbF9zdGFydF93aXRoX2JhY2tfc2xhc2ggPSBkaXNwbGF5X25hbWVfd2l0aG91dF9xdW90ZXMuc3BsaXQoJ1wiJykubGVuZ3RoID09PSBkaXNwbGF5X25hbWVfd2l0aG91dF9xdW90ZXMuc3BsaXQoJ1xcXFxcIicpLmxlbmd0aDtcblxuICAgIGlmICghYWxsX3N0YXJ0X3dpdGhfYmFja19zbGFzaCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBpc0VtYWlsKHN0ciwgb3B0aW9ucykge1xuICAoMCwgX2Fzc2VydFN0cmluZy5kZWZhdWx0KShzdHIpO1xuICBvcHRpb25zID0gKDAsIF9tZXJnZS5kZWZhdWx0KShvcHRpb25zLCBkZWZhdWx0X2VtYWlsX29wdGlvbnMpO1xuXG4gIGlmIChvcHRpb25zLnJlcXVpcmVfZGlzcGxheV9uYW1lIHx8IG9wdGlvbnMuYWxsb3dfZGlzcGxheV9uYW1lKSB7XG4gICAgdmFyIGRpc3BsYXlfZW1haWwgPSBzdHIubWF0Y2goc3BsaXROYW1lQWRkcmVzcyk7XG5cbiAgICBpZiAoZGlzcGxheV9lbWFpbCkge1xuICAgICAgdmFyIGRpc3BsYXlfbmFtZSA9IGRpc3BsYXlfZW1haWxbMV07IC8vIFJlbW92ZSBkaXNwbGF5IG5hbWUgYW5kIGFuZ2xlIGJyYWNrZXRzIHRvIGdldCBlbWFpbCBhZGRyZXNzXG4gICAgICAvLyBDYW4gYmUgZG9uZSBpbiB0aGUgcmVnZXggYnV0IHdpbGwgaW50cm9kdWNlIGEgUmVET1MgKFNlZSAgIzE1OTcgZm9yIG1vcmUgaW5mbylcblxuICAgICAgc3RyID0gc3RyLnJlcGxhY2UoZGlzcGxheV9uYW1lLCAnJykucmVwbGFjZSgvKF48fD4kKS9nLCAnJyk7IC8vIHNvbWV0aW1lcyBuZWVkIHRvIHRyaW0gdGhlIGxhc3Qgc3BhY2UgdG8gZ2V0IHRoZSBkaXNwbGF5IG5hbWVcbiAgICAgIC8vIGJlY2F1c2UgdGhlcmUgbWF5IGJlIGEgc3BhY2UgYmV0d2VlbiBkaXNwbGF5IG5hbWUgYW5kIGVtYWlsIGFkZHJlc3NcbiAgICAgIC8vIGVnLiBteW5hbWUgPGFkZHJlc3NAZ21haWwuY29tPlxuICAgICAgLy8gdGhlIGRpc3BsYXkgbmFtZSBpcyBgbXluYW1lYCBpbnN0ZWFkIG9mIGBteW5hbWUgYCwgc28gbmVlZCB0byB0cmltIHRoZSBsYXN0IHNwYWNlXG5cbiAgICAgIGlmIChkaXNwbGF5X25hbWUuZW5kc1dpdGgoJyAnKSkge1xuICAgICAgICBkaXNwbGF5X25hbWUgPSBkaXNwbGF5X25hbWUuc3Vic3RyKDAsIGRpc3BsYXlfbmFtZS5sZW5ndGggLSAxKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCF2YWxpZGF0ZURpc3BsYXlOYW1lKGRpc3BsYXlfbmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAob3B0aW9ucy5yZXF1aXJlX2Rpc3BsYXlfbmFtZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGlmICghb3B0aW9ucy5pZ25vcmVfbWF4X2xlbmd0aCAmJiBzdHIubGVuZ3RoID4gZGVmYXVsdE1heEVtYWlsTGVuZ3RoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIHBhcnRzID0gc3RyLnNwbGl0KCdAJyk7XG4gIHZhciBkb21haW4gPSBwYXJ0cy5wb3AoKTtcbiAgdmFyIGxvd2VyX2RvbWFpbiA9IGRvbWFpbi50b0xvd2VyQ2FzZSgpO1xuXG4gIGlmIChvcHRpb25zLmhvc3RfYmxhY2tsaXN0LmluY2x1ZGVzKGxvd2VyX2RvbWFpbikpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgdXNlciA9IHBhcnRzLmpvaW4oJ0AnKTtcblxuICBpZiAob3B0aW9ucy5kb21haW5fc3BlY2lmaWNfdmFsaWRhdGlvbiAmJiAobG93ZXJfZG9tYWluID09PSAnZ21haWwuY29tJyB8fCBsb3dlcl9kb21haW4gPT09ICdnb29nbGVtYWlsLmNvbScpKSB7XG4gICAgLypcbiAgICAgIFByZXZpb3VzbHkgd2UgcmVtb3ZlZCBkb3RzIGZvciBnbWFpbCBhZGRyZXNzZXMgYmVmb3JlIHZhbGlkYXRpbmcuXG4gICAgICBUaGlzIHdhcyByZW1vdmVkIGJlY2F1c2UgaXQgYWxsb3dzIGBtdWx0aXBsZS4uZG90c0BnbWFpbC5jb21gXG4gICAgICB0byBiZSByZXBvcnRlZCBhcyB2YWxpZCwgYnV0IGl0IGlzIG5vdC5cbiAgICAgIEdtYWlsIG9ubHkgbm9ybWFsaXplcyBzaW5nbGUgZG90cywgcmVtb3ZpbmcgdGhlbSBmcm9tIGhlcmUgaXMgcG9pbnRsZXNzLFxuICAgICAgc2hvdWxkIGJlIGRvbmUgaW4gbm9ybWFsaXplRW1haWxcbiAgICAqL1xuICAgIHVzZXIgPSB1c2VyLnRvTG93ZXJDYXNlKCk7IC8vIFJlbW92aW5nIHN1Yi1hZGRyZXNzIGZyb20gdXNlcm5hbWUgYmVmb3JlIGdtYWlsIHZhbGlkYXRpb25cblxuICAgIHZhciB1c2VybmFtZSA9IHVzZXIuc3BsaXQoJysnKVswXTsgLy8gRG90cyBhcmUgbm90IGluY2x1ZGVkIGluIGdtYWlsIGxlbmd0aCByZXN0cmljdGlvblxuXG4gICAgaWYgKCEoMCwgX2lzQnl0ZUxlbmd0aC5kZWZhdWx0KSh1c2VybmFtZS5yZXBsYWNlKC9cXC4vZywgJycpLCB7XG4gICAgICBtaW46IDYsXG4gICAgICBtYXg6IDMwXG4gICAgfSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgX3VzZXJfcGFydHMgPSB1c2VybmFtZS5zcGxpdCgnLicpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfdXNlcl9wYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKCFnbWFpbFVzZXJQYXJ0LnRlc3QoX3VzZXJfcGFydHNbaV0pKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAob3B0aW9ucy5pZ25vcmVfbWF4X2xlbmd0aCA9PT0gZmFsc2UgJiYgKCEoMCwgX2lzQnl0ZUxlbmd0aC5kZWZhdWx0KSh1c2VyLCB7XG4gICAgbWF4OiA2NFxuICB9KSB8fCAhKDAsIF9pc0J5dGVMZW5ndGguZGVmYXVsdCkoZG9tYWluLCB7XG4gICAgbWF4OiAyNTRcbiAgfSkpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKCEoMCwgX2lzRlFETi5kZWZhdWx0KShkb21haW4sIHtcbiAgICByZXF1aXJlX3RsZDogb3B0aW9ucy5yZXF1aXJlX3RsZFxuICB9KSkge1xuICAgIGlmICghb3B0aW9ucy5hbGxvd19pcF9kb21haW4pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoISgwLCBfaXNJUC5kZWZhdWx0KShkb21haW4pKSB7XG4gICAgICBpZiAoIWRvbWFpbi5zdGFydHNXaXRoKCdbJykgfHwgIWRvbWFpbi5lbmRzV2l0aCgnXScpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgdmFyIG5vQnJhY2tldGRvbWFpbiA9IGRvbWFpbi5zdWJzdHIoMSwgZG9tYWluLmxlbmd0aCAtIDIpO1xuXG4gICAgICBpZiAobm9CcmFja2V0ZG9tYWluLmxlbmd0aCA9PT0gMCB8fCAhKDAsIF9pc0lQLmRlZmF1bHQpKG5vQnJhY2tldGRvbWFpbikpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmICh1c2VyWzBdID09PSAnXCInKSB7XG4gICAgdXNlciA9IHVzZXIuc2xpY2UoMSwgdXNlci5sZW5ndGggLSAxKTtcbiAgICByZXR1cm4gb3B0aW9ucy5hbGxvd191dGY4X2xvY2FsX3BhcnQgPyBxdW90ZWRFbWFpbFVzZXJVdGY4LnRlc3QodXNlcikgOiBxdW90ZWRFbWFpbFVzZXIudGVzdCh1c2VyKTtcbiAgfVxuXG4gIHZhciBwYXR0ZXJuID0gb3B0aW9ucy5hbGxvd191dGY4X2xvY2FsX3BhcnQgPyBlbWFpbFVzZXJVdGY4UGFydCA6IGVtYWlsVXNlclBhcnQ7XG4gIHZhciB1c2VyX3BhcnRzID0gdXNlci5zcGxpdCgnLicpO1xuXG4gIGZvciAodmFyIF9pID0gMDsgX2kgPCB1c2VyX3BhcnRzLmxlbmd0aDsgX2krKykge1xuICAgIGlmICghcGF0dGVybi50ZXN0KHVzZXJfcGFydHNbX2ldKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGlmIChvcHRpb25zLmJsYWNrbGlzdGVkX2NoYXJzKSB7XG4gICAgaWYgKHVzZXIuc2VhcmNoKG5ldyBSZWdFeHAoXCJbXCIuY29uY2F0KG9wdGlvbnMuYmxhY2tsaXN0ZWRfY2hhcnMsIFwiXStcIiksICdnJykpICE9PSAtMSkgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGlzRW1wdHk7XG5cbnZhciBfYXNzZXJ0U3RyaW5nID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL2Fzc2VydFN0cmluZ1wiKSk7XG5cbnZhciBfbWVyZ2UgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvbWVyZ2VcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgZGVmYXVsdF9pc19lbXB0eV9vcHRpb25zID0ge1xuICBpZ25vcmVfd2hpdGVzcGFjZTogZmFsc2Vcbn07XG5cbmZ1bmN0aW9uIGlzRW1wdHkoc3RyLCBvcHRpb25zKSB7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7XG4gIG9wdGlvbnMgPSAoMCwgX21lcmdlLmRlZmF1bHQpKG9wdGlvbnMsIGRlZmF1bHRfaXNfZW1wdHlfb3B0aW9ucyk7XG4gIHJldHVybiAob3B0aW9ucy5pZ25vcmVfd2hpdGVzcGFjZSA/IHN0ci50cmltKCkubGVuZ3RoIDogc3RyLmxlbmd0aCkgPT09IDA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGlzRXRoZXJldW1BZGRyZXNzO1xuXG52YXIgX2Fzc2VydFN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9hc3NlcnRTdHJpbmdcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgZXRoID0gL14oMHgpWzAtOWEtZl17NDB9JC9pO1xuXG5mdW5jdGlvbiBpc0V0aGVyZXVtQWRkcmVzcyhzdHIpIHtcbiAgKDAsIF9hc3NlcnRTdHJpbmcuZGVmYXVsdCkoc3RyKTtcbiAgcmV0dXJuIGV0aC50ZXN0KHN0cik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGlzRlFETjtcblxudmFyIF9hc3NlcnRTdHJpbmcgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvYXNzZXJ0U3RyaW5nXCIpKTtcblxudmFyIF9tZXJnZSA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9tZXJnZVwiKSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBkZWZhdWx0X2ZxZG5fb3B0aW9ucyA9IHtcbiAgcmVxdWlyZV90bGQ6IHRydWUsXG4gIGFsbG93X3VuZGVyc2NvcmVzOiBmYWxzZSxcbiAgYWxsb3dfdHJhaWxpbmdfZG90OiBmYWxzZSxcbiAgYWxsb3dfbnVtZXJpY190bGQ6IGZhbHNlLFxuICBhbGxvd193aWxkY2FyZDogZmFsc2Vcbn07XG5cbmZ1bmN0aW9uIGlzRlFETihzdHIsIG9wdGlvbnMpIHtcbiAgKDAsIF9hc3NlcnRTdHJpbmcuZGVmYXVsdCkoc3RyKTtcbiAgb3B0aW9ucyA9ICgwLCBfbWVyZ2UuZGVmYXVsdCkob3B0aW9ucywgZGVmYXVsdF9mcWRuX29wdGlvbnMpO1xuICAvKiBSZW1vdmUgdGhlIG9wdGlvbmFsIHRyYWlsaW5nIGRvdCBiZWZvcmUgY2hlY2tpbmcgdmFsaWRpdHkgKi9cblxuICBpZiAob3B0aW9ucy5hbGxvd190cmFpbGluZ19kb3QgJiYgc3RyW3N0ci5sZW5ndGggLSAxXSA9PT0gJy4nKSB7XG4gICAgc3RyID0gc3RyLnN1YnN0cmluZygwLCBzdHIubGVuZ3RoIC0gMSk7XG4gIH1cbiAgLyogUmVtb3ZlIHRoZSBvcHRpb25hbCB3aWxkY2FyZCBiZWZvcmUgY2hlY2tpbmcgdmFsaWRpdHkgKi9cblxuXG4gIGlmIChvcHRpb25zLmFsbG93X3dpbGRjYXJkID09PSB0cnVlICYmIHN0ci5pbmRleE9mKCcqLicpID09PSAwKSB7XG4gICAgc3RyID0gc3RyLnN1YnN0cmluZygyKTtcbiAgfVxuXG4gIHZhciBwYXJ0cyA9IHN0ci5zcGxpdCgnLicpO1xuICB2YXIgdGxkID0gcGFydHNbcGFydHMubGVuZ3RoIC0gMV07XG5cbiAgaWYgKG9wdGlvbnMucmVxdWlyZV90bGQpIHtcbiAgICAvLyBkaXNhbGxvdyBmcWRucyB3aXRob3V0IHRsZFxuICAgIGlmIChwYXJ0cy5sZW5ndGggPCAyKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCEvXihbYS16XFx1MDBBMS1cXHUwMEE4XFx1MDBBQS1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXXsyLH18eG5bYS16MC05LV17Mix9KSQvaS50ZXN0KHRsZCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IC8vIGRpc2FsbG93IHNwYWNlc1xuXG5cbiAgICBpZiAoL1xccy8udGVzdCh0bGQpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9IC8vIHJlamVjdCBudW1lcmljIFRMRHNcblxuXG4gIGlmICghb3B0aW9ucy5hbGxvd19udW1lcmljX3RsZCAmJiAvXlxcZCskLy50ZXN0KHRsZCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gcGFydHMuZXZlcnkoZnVuY3Rpb24gKHBhcnQpIHtcbiAgICBpZiAocGFydC5sZW5ndGggPiA2Mykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghL15bYS16X1xcdTAwYTEtXFx1ZmZmZjAtOS1dKyQvaS50ZXN0KHBhcnQpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSAvLyBkaXNhbGxvdyBmdWxsLXdpZHRoIGNoYXJzXG5cblxuICAgIGlmICgvW1xcdWZmMDEtXFx1ZmY1ZV0vLnRlc3QocGFydCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IC8vIGRpc2FsbG93IHBhcnRzIHN0YXJ0aW5nIG9yIGVuZGluZyB3aXRoIGh5cGhlblxuXG5cbiAgICBpZiAoL14tfC0kLy50ZXN0KHBhcnQpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCFvcHRpb25zLmFsbG93X3VuZGVyc2NvcmVzICYmIC9fLy50ZXN0KHBhcnQpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBpc0Zsb2F0O1xuZXhwb3J0cy5sb2NhbGVzID0gdm9pZCAwO1xuXG52YXIgX2Fzc2VydFN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9hc3NlcnRTdHJpbmdcIikpO1xuXG52YXIgX2FscGhhID0gcmVxdWlyZShcIi4vYWxwaGFcIik7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIGlzRmxvYXQoc3RyLCBvcHRpb25zKSB7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgZmxvYXQgPSBuZXcgUmVnRXhwKFwiXig/OlstK10pPyg/OlswLTldKyk/KD86XFxcXFwiLmNvbmNhdChvcHRpb25zLmxvY2FsZSA/IF9hbHBoYS5kZWNpbWFsW29wdGlvbnMubG9jYWxlXSA6ICcuJywgXCJbMC05XSopPyg/OltlRV1bXFxcXCtcXFxcLV0/KD86WzAtOV0rKSk/JFwiKSk7XG5cbiAgaWYgKHN0ciA9PT0gJycgfHwgc3RyID09PSAnLicgfHwgc3RyID09PSAnLScgfHwgc3RyID09PSAnKycpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgdmFsdWUgPSBwYXJzZUZsb2F0KHN0ci5yZXBsYWNlKCcsJywgJy4nKSk7XG4gIHJldHVybiBmbG9hdC50ZXN0KHN0cikgJiYgKCFvcHRpb25zLmhhc093blByb3BlcnR5KCdtaW4nKSB8fCB2YWx1ZSA+PSBvcHRpb25zLm1pbikgJiYgKCFvcHRpb25zLmhhc093blByb3BlcnR5KCdtYXgnKSB8fCB2YWx1ZSA8PSBvcHRpb25zLm1heCkgJiYgKCFvcHRpb25zLmhhc093blByb3BlcnR5KCdsdCcpIHx8IHZhbHVlIDwgb3B0aW9ucy5sdCkgJiYgKCFvcHRpb25zLmhhc093blByb3BlcnR5KCdndCcpIHx8IHZhbHVlID4gb3B0aW9ucy5ndCk7XG59XG5cbnZhciBsb2NhbGVzID0gT2JqZWN0LmtleXMoX2FscGhhLmRlY2ltYWwpO1xuZXhwb3J0cy5sb2NhbGVzID0gbG9jYWxlczsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGlzRnVsbFdpZHRoO1xuZXhwb3J0cy5mdWxsV2lkdGggPSB2b2lkIDA7XG5cbnZhciBfYXNzZXJ0U3RyaW5nID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL2Fzc2VydFN0cmluZ1wiKSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBmdWxsV2lkdGggPSAvW15cXHUwMDIwLVxcdTAwN0VcXHVGRjYxLVxcdUZGOUZcXHVGRkEwLVxcdUZGRENcXHVGRkU4LVxcdUZGRUUwLTlhLXpBLVpdLztcbmV4cG9ydHMuZnVsbFdpZHRoID0gZnVsbFdpZHRoO1xuXG5mdW5jdGlvbiBpc0Z1bGxXaWR0aChzdHIpIHtcbiAgKDAsIF9hc3NlcnRTdHJpbmcuZGVmYXVsdCkoc3RyKTtcbiAgcmV0dXJuIGZ1bGxXaWR0aC50ZXN0KHN0cik7XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBpc0hTTDtcblxudmFyIF9hc3NlcnRTdHJpbmcgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvYXNzZXJ0U3RyaW5nXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIGhzbENvbW1hID0gL15oc2xhP1xcKCgoXFwrfFxcLSk/KFswLTldKyhcXC5bMC05XSspPyhlKFxcK3xcXC0pP1swLTldKyk/fFxcLlswLTldKyhlKFxcK3xcXC0pP1swLTldKyk/KSkoZGVnfGdyYWR8cmFkfHR1cm4pPygsKFxcK3xcXC0pPyhbMC05XSsoXFwuWzAtOV0rKT8oZShcXCt8XFwtKT9bMC05XSspP3xcXC5bMC05XSsoZShcXCt8XFwtKT9bMC05XSspPyklKXsyfSgsKChcXCt8XFwtKT8oWzAtOV0rKFxcLlswLTldKyk/KGUoXFwrfFxcLSk/WzAtOV0rKT98XFwuWzAtOV0rKGUoXFwrfFxcLSk/WzAtOV0rKT8pJT8pKT9cXCkkL2k7XG52YXIgaHNsU3BhY2UgPSAvXmhzbGE/XFwoKChcXCt8XFwtKT8oWzAtOV0rKFxcLlswLTldKyk/KGUoXFwrfFxcLSk/WzAtOV0rKT98XFwuWzAtOV0rKGUoXFwrfFxcLSk/WzAtOV0rKT8pKShkZWd8Z3JhZHxyYWR8dHVybik/KFxccyhcXCt8XFwtKT8oWzAtOV0rKFxcLlswLTldKyk/KGUoXFwrfFxcLSk/WzAtOV0rKT98XFwuWzAtOV0rKGUoXFwrfFxcLSk/WzAtOV0rKT8pJSl7Mn1cXHM/KFxcL1xccygoXFwrfFxcLSk/KFswLTldKyhcXC5bMC05XSspPyhlKFxcK3xcXC0pP1swLTldKyk/fFxcLlswLTldKyhlKFxcK3xcXC0pP1swLTldKyk/KSU/KVxccz8pP1xcKSQvaTtcblxuZnVuY3Rpb24gaXNIU0woc3RyKSB7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7IC8vIFN0cmlwIGR1cGxpY2F0ZSBzcGFjZXMgYmVmb3JlIGNhbGxpbmcgdGhlIHZhbGlkYXRpb24gcmVnZXggKFNlZSAgIzE1OTggZm9yIG1vcmUgaW5mbylcblxuICB2YXIgc3RyaXBwZWRTdHIgPSBzdHIucmVwbGFjZSgvXFxzKy9nLCAnICcpLnJlcGxhY2UoL1xccz8oaHNsYT9cXCh8XFwpfCwpXFxzPy9pZywgJyQxJyk7XG5cbiAgaWYgKHN0cmlwcGVkU3RyLmluZGV4T2YoJywnKSAhPT0gLTEpIHtcbiAgICByZXR1cm4gaHNsQ29tbWEudGVzdChzdHJpcHBlZFN0cik7XG4gIH1cblxuICByZXR1cm4gaHNsU3BhY2UudGVzdChzdHJpcHBlZFN0cik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGlzSGFsZldpZHRoO1xuZXhwb3J0cy5oYWxmV2lkdGggPSB2b2lkIDA7XG5cbnZhciBfYXNzZXJ0U3RyaW5nID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL2Fzc2VydFN0cmluZ1wiKSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBoYWxmV2lkdGggPSAvW1xcdTAwMjAtXFx1MDA3RVxcdUZGNjEtXFx1RkY5RlxcdUZGQTAtXFx1RkZEQ1xcdUZGRTgtXFx1RkZFRTAtOWEtekEtWl0vO1xuZXhwb3J0cy5oYWxmV2lkdGggPSBoYWxmV2lkdGg7XG5cbmZ1bmN0aW9uIGlzSGFsZldpZHRoKHN0cikge1xuICAoMCwgX2Fzc2VydFN0cmluZy5kZWZhdWx0KShzdHIpO1xuICByZXR1cm4gaGFsZldpZHRoLnRlc3Qoc3RyKTtcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGlzSGFzaDtcblxudmFyIF9hc3NlcnRTdHJpbmcgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvYXNzZXJ0U3RyaW5nXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIGxlbmd0aHMgPSB7XG4gIG1kNTogMzIsXG4gIG1kNDogMzIsXG4gIHNoYTE6IDQwLFxuICBzaGEyNTY6IDY0LFxuICBzaGEzODQ6IDk2LFxuICBzaGE1MTI6IDEyOCxcbiAgcmlwZW1kMTI4OiAzMixcbiAgcmlwZW1kMTYwOiA0MCxcbiAgdGlnZXIxMjg6IDMyLFxuICB0aWdlcjE2MDogNDAsXG4gIHRpZ2VyMTkyOiA0OCxcbiAgY3JjMzI6IDgsXG4gIGNyYzMyYjogOFxufTtcblxuZnVuY3Rpb24gaXNIYXNoKHN0ciwgYWxnb3JpdGhtKSB7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7XG4gIHZhciBoYXNoID0gbmV3IFJlZ0V4cChcIl5bYS1mQS1GMC05XXtcIi5jb25jYXQobGVuZ3Roc1thbGdvcml0aG1dLCBcIn0kXCIpKTtcbiAgcmV0dXJuIGhhc2gudGVzdChzdHIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBpc0hleENvbG9yO1xuXG52YXIgX2Fzc2VydFN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9hc3NlcnRTdHJpbmdcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgaGV4Y29sb3IgPSAvXiM/KFswLTlBLUZdezN9fFswLTlBLUZdezR9fFswLTlBLUZdezZ9fFswLTlBLUZdezh9KSQvaTtcblxuZnVuY3Rpb24gaXNIZXhDb2xvcihzdHIpIHtcbiAgKDAsIF9hc3NlcnRTdHJpbmcuZGVmYXVsdCkoc3RyKTtcbiAgcmV0dXJuIGhleGNvbG9yLnRlc3Qoc3RyKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzLmRlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gaXNIZXhhZGVjaW1hbDtcblxudmFyIF9hc3NlcnRTdHJpbmcgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvYXNzZXJ0U3RyaW5nXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIGhleGFkZWNpbWFsID0gL14oMHh8MGgpP1swLTlBLUZdKyQvaTtcblxuZnVuY3Rpb24gaXNIZXhhZGVjaW1hbChzdHIpIHtcbiAgKDAsIF9hc3NlcnRTdHJpbmcuZGVmYXVsdCkoc3RyKTtcbiAgcmV0dXJuIGhleGFkZWNpbWFsLnRlc3Qoc3RyKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzLmRlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gaXNJQkFOO1xuZXhwb3J0cy5sb2NhbGVzID0gdm9pZCAwO1xuXG52YXIgX2Fzc2VydFN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9hc3NlcnRTdHJpbmdcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG4vKipcbiAqIExpc3Qgb2YgY291bnRyeSBjb2RlcyB3aXRoXG4gKiBjb3JyZXNwb25kaW5nIElCQU4gcmVndWxhciBleHByZXNzaW9uXG4gKiBSZWZlcmVuY2U6IGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0ludGVybmF0aW9uYWxfQmFua19BY2NvdW50X051bWJlclxuICovXG52YXIgaWJhblJlZ2V4VGhyb3VnaENvdW50cnlDb2RlID0ge1xuICBBRDogL14oQURbMC05XXsyfSlcXGR7OH1bQS1aMC05XXsxMn0kLyxcbiAgQUU6IC9eKEFFWzAtOV17Mn0pXFxkezN9XFxkezE2fSQvLFxuICBBTDogL14oQUxbMC05XXsyfSlcXGR7OH1bQS1aMC05XXsxNn0kLyxcbiAgQVQ6IC9eKEFUWzAtOV17Mn0pXFxkezE2fSQvLFxuICBBWjogL14oQVpbMC05XXsyfSlbQS1aMC05XXs0fVxcZHsyMH0kLyxcbiAgQkE6IC9eKEJBWzAtOV17Mn0pXFxkezE2fSQvLFxuICBCRTogL14oQkVbMC05XXsyfSlcXGR7MTJ9JC8sXG4gIEJHOiAvXihCR1swLTldezJ9KVtBLVpdezR9XFxkezZ9W0EtWjAtOV17OH0kLyxcbiAgQkg6IC9eKEJIWzAtOV17Mn0pW0EtWl17NH1bQS1aMC05XXsxNH0kLyxcbiAgQlI6IC9eKEJSWzAtOV17Mn0pXFxkezIzfVtBLVpdezF9W0EtWjAtOV17MX0kLyxcbiAgQlk6IC9eKEJZWzAtOV17Mn0pW0EtWjAtOV17NH1cXGR7MjB9JC8sXG4gIENIOiAvXihDSFswLTldezJ9KVxcZHs1fVtBLVowLTldezEyfSQvLFxuICBDUjogL14oQ1JbMC05XXsyfSlcXGR7MTh9JC8sXG4gIENZOiAvXihDWVswLTldezJ9KVxcZHs4fVtBLVowLTldezE2fSQvLFxuICBDWjogL14oQ1pbMC05XXsyfSlcXGR7MjB9JC8sXG4gIERFOiAvXihERVswLTldezJ9KVxcZHsxOH0kLyxcbiAgREs6IC9eKERLWzAtOV17Mn0pXFxkezE0fSQvLFxuICBETzogL14oRE9bMC05XXsyfSlbQS1aXXs0fVxcZHsyMH0kLyxcbiAgRUU6IC9eKEVFWzAtOV17Mn0pXFxkezE2fSQvLFxuICBFRzogL14oRUdbMC05XXsyfSlcXGR7MjV9JC8sXG4gIEVTOiAvXihFU1swLTldezJ9KVxcZHsyMH0kLyxcbiAgRkk6IC9eKEZJWzAtOV17Mn0pXFxkezE0fSQvLFxuICBGTzogL14oRk9bMC05XXsyfSlcXGR7MTR9JC8sXG4gIEZSOiAvXihGUlswLTldezJ9KVxcZHsxMH1bQS1aMC05XXsxMX1cXGR7Mn0kLyxcbiAgR0I6IC9eKEdCWzAtOV17Mn0pW0EtWl17NH1cXGR7MTR9JC8sXG4gIEdFOiAvXihHRVswLTldezJ9KVtBLVowLTldezJ9XFxkezE2fSQvLFxuICBHSTogL14oR0lbMC05XXsyfSlbQS1aXXs0fVtBLVowLTldezE1fSQvLFxuICBHTDogL14oR0xbMC05XXsyfSlcXGR7MTR9JC8sXG4gIEdSOiAvXihHUlswLTldezJ9KVxcZHs3fVtBLVowLTldezE2fSQvLFxuICBHVDogL14oR1RbMC05XXsyfSlbQS1aMC05XXs0fVtBLVowLTldezIwfSQvLFxuICBIUjogL14oSFJbMC05XXsyfSlcXGR7MTd9JC8sXG4gIEhVOiAvXihIVVswLTldezJ9KVxcZHsyNH0kLyxcbiAgSUU6IC9eKElFWzAtOV17Mn0pW0EtWjAtOV17NH1cXGR7MTR9JC8sXG4gIElMOiAvXihJTFswLTldezJ9KVxcZHsxOX0kLyxcbiAgSVE6IC9eKElRWzAtOV17Mn0pW0EtWl17NH1cXGR7MTV9JC8sXG4gIElSOiAvXihJUlswLTldezJ9KTBcXGR7Mn0wXFxkezE4fSQvLFxuICBJUzogL14oSVNbMC05XXsyfSlcXGR7MjJ9JC8sXG4gIElUOiAvXihJVFswLTldezJ9KVtBLVpdezF9XFxkezEwfVtBLVowLTldezEyfSQvLFxuICBKTzogL14oSk9bMC05XXsyfSlbQS1aXXs0fVxcZHsyMn0kLyxcbiAgS1c6IC9eKEtXWzAtOV17Mn0pW0EtWl17NH1bQS1aMC05XXsyMn0kLyxcbiAgS1o6IC9eKEtaWzAtOV17Mn0pXFxkezN9W0EtWjAtOV17MTN9JC8sXG4gIExCOiAvXihMQlswLTldezJ9KVxcZHs0fVtBLVowLTldezIwfSQvLFxuICBMQzogL14oTENbMC05XXsyfSlbQS1aXXs0fVtBLVowLTldezI0fSQvLFxuICBMSTogL14oTElbMC05XXsyfSlcXGR7NX1bQS1aMC05XXsxMn0kLyxcbiAgTFQ6IC9eKExUWzAtOV17Mn0pXFxkezE2fSQvLFxuICBMVTogL14oTFVbMC05XXsyfSlcXGR7M31bQS1aMC05XXsxM30kLyxcbiAgTFY6IC9eKExWWzAtOV17Mn0pW0EtWl17NH1bQS1aMC05XXsxM30kLyxcbiAgTUM6IC9eKE1DWzAtOV17Mn0pXFxkezEwfVtBLVowLTldezExfVxcZHsyfSQvLFxuICBNRDogL14oTURbMC05XXsyfSlbQS1aMC05XXsyMH0kLyxcbiAgTUU6IC9eKE1FWzAtOV17Mn0pXFxkezE4fSQvLFxuICBNSzogL14oTUtbMC05XXsyfSlcXGR7M31bQS1aMC05XXsxMH1cXGR7Mn0kLyxcbiAgTVI6IC9eKE1SWzAtOV17Mn0pXFxkezIzfSQvLFxuICBNVDogL14oTVRbMC05XXsyfSlbQS1aXXs0fVxcZHs1fVtBLVowLTldezE4fSQvLFxuICBNVTogL14oTVVbMC05XXsyfSlbQS1aXXs0fVxcZHsxOX1bQS1aXXszfSQvLFxuICBNWjogL14oTVpbMC05XXsyfSlcXGR7MjF9JC8sXG4gIE5MOiAvXihOTFswLTldezJ9KVtBLVpdezR9XFxkezEwfSQvLFxuICBOTzogL14oTk9bMC05XXsyfSlcXGR7MTF9JC8sXG4gIFBLOiAvXihQS1swLTldezJ9KVtBLVowLTldezR9XFxkezE2fSQvLFxuICBQTDogL14oUExbMC05XXsyfSlcXGR7MjR9JC8sXG4gIFBTOiAvXihQU1swLTldezJ9KVtBLVowLTldezR9XFxkezIxfSQvLFxuICBQVDogL14oUFRbMC05XXsyfSlcXGR7MjF9JC8sXG4gIFFBOiAvXihRQVswLTldezJ9KVtBLVpdezR9W0EtWjAtOV17MjF9JC8sXG4gIFJPOiAvXihST1swLTldezJ9KVtBLVpdezR9W0EtWjAtOV17MTZ9JC8sXG4gIFJTOiAvXihSU1swLTldezJ9KVxcZHsxOH0kLyxcbiAgU0E6IC9eKFNBWzAtOV17Mn0pXFxkezJ9W0EtWjAtOV17MTh9JC8sXG4gIFNDOiAvXihTQ1swLTldezJ9KVtBLVpdezR9XFxkezIwfVtBLVpdezN9JC8sXG4gIFNFOiAvXihTRVswLTldezJ9KVxcZHsyMH0kLyxcbiAgU0k6IC9eKFNJWzAtOV17Mn0pXFxkezE1fSQvLFxuICBTSzogL14oU0tbMC05XXsyfSlcXGR7MjB9JC8sXG4gIFNNOiAvXihTTVswLTldezJ9KVtBLVpdezF9XFxkezEwfVtBLVowLTldezEyfSQvLFxuICBTVjogL14oU1ZbMC05XXsyfSlbQS1aMC05XXs0fVxcZHsyMH0kLyxcbiAgVEw6IC9eKFRMWzAtOV17Mn0pXFxkezE5fSQvLFxuICBUTjogL14oVE5bMC05XXsyfSlcXGR7MjB9JC8sXG4gIFRSOiAvXihUUlswLTldezJ9KVxcZHs1fVtBLVowLTldezE3fSQvLFxuICBVQTogL14oVUFbMC05XXsyfSlcXGR7Nn1bQS1aMC05XXsxOX0kLyxcbiAgVkE6IC9eKFZBWzAtOV17Mn0pXFxkezE4fSQvLFxuICBWRzogL14oVkdbMC05XXsyfSlbQS1aMC05XXs0fVxcZHsxNn0kLyxcbiAgWEs6IC9eKFhLWzAtOV17Mn0pXFxkezE2fSQvXG59O1xuLyoqXG4gKiBDaGVjayB3aGV0aGVyIHN0cmluZyBoYXMgY29ycmVjdCB1bml2ZXJzYWwgSUJBTiBmb3JtYXRcbiAqIFRoZSBJQkFOIGNvbnNpc3RzIG9mIHVwIHRvIDM0IGFscGhhbnVtZXJpYyBjaGFyYWN0ZXJzLCBhcyBmb2xsb3dzOlxuICogQ291bnRyeSBDb2RlIHVzaW5nIElTTyAzMTY2LTEgYWxwaGEtMiwgdHdvIGxldHRlcnNcbiAqIGNoZWNrIGRpZ2l0cywgdHdvIGRpZ2l0cyBhbmRcbiAqIEJhc2ljIEJhbmsgQWNjb3VudCBOdW1iZXIgKEJCQU4pLCB1cCB0byAzMCBhbHBoYW51bWVyaWMgY2hhcmFjdGVycy5cbiAqIE5PVEU6IFBlcm1pdHRlZCBJQkFOIGNoYXJhY3RlcnMgYXJlOiBkaWdpdHMgWzAtOV0gYW5kIHRoZSAyNiBsYXRpbiBhbHBoYWJldGljIFtBLVpdXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHN0ciAtIHN0cmluZyB1bmRlciB2YWxpZGF0aW9uXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5cbmZ1bmN0aW9uIGhhc1ZhbGlkSWJhbkZvcm1hdChzdHIpIHtcbiAgLy8gU3RyaXAgd2hpdGUgc3BhY2VzIGFuZCBoeXBoZW5zXG4gIHZhciBzdHJpcHBlZFN0ciA9IHN0ci5yZXBsYWNlKC9bXFxzXFwtXSsvZ2ksICcnKS50b1VwcGVyQ2FzZSgpO1xuICB2YXIgaXNvQ291bnRyeUNvZGUgPSBzdHJpcHBlZFN0ci5zbGljZSgwLCAyKS50b1VwcGVyQ2FzZSgpO1xuICByZXR1cm4gaXNvQ291bnRyeUNvZGUgaW4gaWJhblJlZ2V4VGhyb3VnaENvdW50cnlDb2RlICYmIGliYW5SZWdleFRocm91Z2hDb3VudHJ5Q29kZVtpc29Db3VudHJ5Q29kZV0udGVzdChzdHJpcHBlZFN0cik7XG59XG4vKipcbiAgICogQ2hlY2sgd2hldGhlciBzdHJpbmcgaGFzIHZhbGlkIElCQU4gQ2hlY2tzdW1cbiAgICogYnkgcGVyZm9ybWluZyBiYXNpYyBtb2QtOTcgb3BlcmF0aW9uIGFuZFxuICAgKiB0aGUgcmVtYWluZGVyIHNob3VsZCBlcXVhbCAxXG4gICAqIC0tIFN0YXJ0IGJ5IHJlYXJyYW5naW5nIHRoZSBJQkFOIGJ5IG1vdmluZyB0aGUgZm91ciBpbml0aWFsIGNoYXJhY3RlcnMgdG8gdGhlIGVuZCBvZiB0aGUgc3RyaW5nXG4gICAqIC0tIFJlcGxhY2UgZWFjaCBsZXR0ZXIgaW4gdGhlIHN0cmluZyB3aXRoIHR3byBkaWdpdHMsIEEgLT4gMTAsIEIgPSAxMSwgWiA9IDM1XG4gICAqIC0tIEludGVycHJldCB0aGUgc3RyaW5nIGFzIGEgZGVjaW1hbCBpbnRlZ2VyIGFuZFxuICAgKiAtLSBjb21wdXRlIHRoZSByZW1haW5kZXIgb24gZGl2aXNpb24gYnkgOTcgKG1vZCA5NylcbiAgICogUmVmZXJlbmNlOiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JbnRlcm5hdGlvbmFsX0JhbmtfQWNjb3VudF9OdW1iZXJcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0clxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cblxuXG5mdW5jdGlvbiBoYXNWYWxpZEliYW5DaGVja3N1bShzdHIpIHtcbiAgdmFyIHN0cmlwcGVkU3RyID0gc3RyLnJlcGxhY2UoL1teQS1aMC05XSsvZ2ksICcnKS50b1VwcGVyQ2FzZSgpOyAvLyBLZWVwIG9ubHkgZGlnaXRzIGFuZCBBLVogbGF0aW4gYWxwaGFiZXRpY1xuXG4gIHZhciByZWFycmFuZ2VkID0gc3RyaXBwZWRTdHIuc2xpY2UoNCkgKyBzdHJpcHBlZFN0ci5zbGljZSgwLCA0KTtcbiAgdmFyIGFscGhhQ2Fwc1JlcGxhY2VkV2l0aERpZ2l0cyA9IHJlYXJyYW5nZWQucmVwbGFjZSgvW0EtWl0vZywgZnVuY3Rpb24gKGNoYXIpIHtcbiAgICByZXR1cm4gY2hhci5jaGFyQ29kZUF0KDApIC0gNTU7XG4gIH0pO1xuICB2YXIgcmVtYWluZGVyID0gYWxwaGFDYXBzUmVwbGFjZWRXaXRoRGlnaXRzLm1hdGNoKC9cXGR7MSw3fS9nKS5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgdmFsdWUpIHtcbiAgICByZXR1cm4gTnVtYmVyKGFjYyArIHZhbHVlKSAlIDk3O1xuICB9LCAnJyk7XG4gIHJldHVybiByZW1haW5kZXIgPT09IDE7XG59XG5cbmZ1bmN0aW9uIGlzSUJBTihzdHIpIHtcbiAgKDAsIF9hc3NlcnRTdHJpbmcuZGVmYXVsdCkoc3RyKTtcbiAgcmV0dXJuIGhhc1ZhbGlkSWJhbkZvcm1hdChzdHIpICYmIGhhc1ZhbGlkSWJhbkNoZWNrc3VtKHN0cik7XG59XG5cbnZhciBsb2NhbGVzID0gT2JqZWN0LmtleXMoaWJhblJlZ2V4VGhyb3VnaENvdW50cnlDb2RlKTtcbmV4cG9ydHMubG9jYWxlcyA9IGxvY2FsZXM7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBpc0lNRUk7XG5cbnZhciBfYXNzZXJ0U3RyaW5nID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL2Fzc2VydFN0cmluZ1wiKSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBpbWVpUmVnZXhXaXRob3V0SHlwZW5zID0gL15bMC05XXsxNX0kLztcbnZhciBpbWVpUmVnZXhXaXRoSHlwZW5zID0gL15cXGR7Mn0tXFxkezZ9LVxcZHs2fS1cXGR7MX0kLztcblxuZnVuY3Rpb24gaXNJTUVJKHN0ciwgb3B0aW9ucykge1xuICAoMCwgX2Fzc2VydFN0cmluZy5kZWZhdWx0KShzdHIpO1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTsgLy8gZGVmYXVsdCByZWdleCBmb3IgY2hlY2tpbmcgaW1laSBpcyB0aGUgb25lIHdpdGhvdXQgaHlwaGVuc1xuXG4gIHZhciBpbWVpUmVnZXggPSBpbWVpUmVnZXhXaXRob3V0SHlwZW5zO1xuXG4gIGlmIChvcHRpb25zLmFsbG93X2h5cGhlbnMpIHtcbiAgICBpbWVpUmVnZXggPSBpbWVpUmVnZXhXaXRoSHlwZW5zO1xuICB9XG5cbiAgaWYgKCFpbWVpUmVnZXgudGVzdChzdHIpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgc3RyID0gc3RyLnJlcGxhY2UoLy0vZywgJycpO1xuICB2YXIgc3VtID0gMCxcbiAgICAgIG11bCA9IDIsXG4gICAgICBsID0gMTQ7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICB2YXIgZGlnaXQgPSBzdHIuc3Vic3RyaW5nKGwgLSBpIC0gMSwgbCAtIGkpO1xuICAgIHZhciB0cCA9IHBhcnNlSW50KGRpZ2l0LCAxMCkgKiBtdWw7XG5cbiAgICBpZiAodHAgPj0gMTApIHtcbiAgICAgIHN1bSArPSB0cCAlIDEwICsgMTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3VtICs9IHRwO1xuICAgIH1cblxuICAgIGlmIChtdWwgPT09IDEpIHtcbiAgICAgIG11bCArPSAxO1xuICAgIH0gZWxzZSB7XG4gICAgICBtdWwgLT0gMTtcbiAgICB9XG4gIH1cblxuICB2YXIgY2hrID0gKDEwIC0gc3VtICUgMTApICUgMTA7XG5cbiAgaWYgKGNoayAhPT0gcGFyc2VJbnQoc3RyLnN1YnN0cmluZygxNCwgMTUpLCAxMCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzLmRlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gaXNJUDtcblxudmFyIF9hc3NlcnRTdHJpbmcgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvYXNzZXJ0U3RyaW5nXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuLyoqXG4xMS4zLiAgRXhhbXBsZXNcblxuICAgVGhlIGZvbGxvd2luZyBhZGRyZXNzZXNcblxuICAgICAgICAgICAgIGZlODA6OjEyMzQgKG9uIHRoZSAxc3QgbGluayBvZiB0aGUgbm9kZSlcbiAgICAgICAgICAgICBmZjAyOjo1Njc4IChvbiB0aGUgNXRoIGxpbmsgb2YgdGhlIG5vZGUpXG4gICAgICAgICAgICAgZmYwODo6OWFiYyAob24gdGhlIDEwdGggb3JnYW5pemF0aW9uIG9mIHRoZSBub2RlKVxuXG4gICB3b3VsZCBiZSByZXByZXNlbnRlZCBhcyBmb2xsb3dzOlxuXG4gICAgICAgICAgICAgZmU4MDo6MTIzNCUxXG4gICAgICAgICAgICAgZmYwMjo6NTY3OCU1XG4gICAgICAgICAgICAgZmYwODo6OWFiYyUxMFxuXG4gICAoSGVyZSB3ZSBhc3N1bWUgYSBuYXR1cmFsIHRyYW5zbGF0aW9uIGZyb20gYSB6b25lIGluZGV4IHRvIHRoZVxuICAgPHpvbmVfaWQ+IHBhcnQsIHdoZXJlIHRoZSBOdGggem9uZSBvZiBhbnkgc2NvcGUgaXMgdHJhbnNsYXRlZCBpbnRvXG4gICBcIk5cIi4pXG5cbiAgIElmIHdlIHVzZSBpbnRlcmZhY2UgbmFtZXMgYXMgPHpvbmVfaWQ+LCB0aG9zZSBhZGRyZXNzZXMgY291bGQgYWxzbyBiZVxuICAgcmVwcmVzZW50ZWQgYXMgZm9sbG93czpcblxuICAgICAgICAgICAgZmU4MDo6MTIzNCVuZTBcbiAgICAgICAgICAgIGZmMDI6OjU2NzglcHZjMS4zXG4gICAgICAgICAgICBmZjA4Ojo5YWJjJWludGVyZmFjZTEwXG5cbiAgIHdoZXJlIHRoZSBpbnRlcmZhY2UgXCJuZTBcIiBiZWxvbmdzIHRvIHRoZSAxc3QgbGluaywgXCJwdmMxLjNcIiBiZWxvbmdzXG4gICB0byB0aGUgNXRoIGxpbmssIGFuZCBcImludGVyZmFjZTEwXCIgYmVsb25ncyB0byB0aGUgMTB0aCBvcmdhbml6YXRpb24uXG4gKiAqICovXG52YXIgSVB2NFNlZ21lbnRGb3JtYXQgPSAnKD86WzAtOV18WzEtOV1bMC05XXwxWzAtOV1bMC05XXwyWzAtNF1bMC05XXwyNVswLTVdKSc7XG52YXIgSVB2NEFkZHJlc3NGb3JtYXQgPSBcIihcIi5jb25jYXQoSVB2NFNlZ21lbnRGb3JtYXQsIFwiWy5dKXszfVwiKS5jb25jYXQoSVB2NFNlZ21lbnRGb3JtYXQpO1xudmFyIElQdjRBZGRyZXNzUmVnRXhwID0gbmV3IFJlZ0V4cChcIl5cIi5jb25jYXQoSVB2NEFkZHJlc3NGb3JtYXQsIFwiJFwiKSk7XG52YXIgSVB2NlNlZ21lbnRGb3JtYXQgPSAnKD86WzAtOWEtZkEtRl17MSw0fSknO1xudmFyIElQdjZBZGRyZXNzUmVnRXhwID0gbmV3IFJlZ0V4cCgnXignICsgXCIoPzpcIi5jb25jYXQoSVB2NlNlZ21lbnRGb3JtYXQsIFwiOil7N30oPzpcIikuY29uY2F0KElQdjZTZWdtZW50Rm9ybWF0LCBcInw6KXxcIikgKyBcIig/OlwiLmNvbmNhdChJUHY2U2VnbWVudEZvcm1hdCwgXCI6KXs2fSg/OlwiKS5jb25jYXQoSVB2NEFkZHJlc3NGb3JtYXQsIFwifDpcIikuY29uY2F0KElQdjZTZWdtZW50Rm9ybWF0LCBcInw6KXxcIikgKyBcIig/OlwiLmNvbmNhdChJUHY2U2VnbWVudEZvcm1hdCwgXCI6KXs1fSg/OjpcIikuY29uY2F0KElQdjRBZGRyZXNzRm9ybWF0LCBcInwoOlwiKS5jb25jYXQoSVB2NlNlZ21lbnRGb3JtYXQsIFwiKXsxLDJ9fDopfFwiKSArIFwiKD86XCIuY29uY2F0KElQdjZTZWdtZW50Rm9ybWF0LCBcIjopezR9KD86KDpcIikuY29uY2F0KElQdjZTZWdtZW50Rm9ybWF0LCBcIil7MCwxfTpcIikuY29uY2F0KElQdjRBZGRyZXNzRm9ybWF0LCBcInwoOlwiKS5jb25jYXQoSVB2NlNlZ21lbnRGb3JtYXQsIFwiKXsxLDN9fDopfFwiKSArIFwiKD86XCIuY29uY2F0KElQdjZTZWdtZW50Rm9ybWF0LCBcIjopezN9KD86KDpcIikuY29uY2F0KElQdjZTZWdtZW50Rm9ybWF0LCBcIil7MCwyfTpcIikuY29uY2F0KElQdjRBZGRyZXNzRm9ybWF0LCBcInwoOlwiKS5jb25jYXQoSVB2NlNlZ21lbnRGb3JtYXQsIFwiKXsxLDR9fDopfFwiKSArIFwiKD86XCIuY29uY2F0KElQdjZTZWdtZW50Rm9ybWF0LCBcIjopezJ9KD86KDpcIikuY29uY2F0KElQdjZTZWdtZW50Rm9ybWF0LCBcIil7MCwzfTpcIikuY29uY2F0KElQdjRBZGRyZXNzRm9ybWF0LCBcInwoOlwiKS5jb25jYXQoSVB2NlNlZ21lbnRGb3JtYXQsIFwiKXsxLDV9fDopfFwiKSArIFwiKD86XCIuY29uY2F0KElQdjZTZWdtZW50Rm9ybWF0LCBcIjopezF9KD86KDpcIikuY29uY2F0KElQdjZTZWdtZW50Rm9ybWF0LCBcIil7MCw0fTpcIikuY29uY2F0KElQdjRBZGRyZXNzRm9ybWF0LCBcInwoOlwiKS5jb25jYXQoSVB2NlNlZ21lbnRGb3JtYXQsIFwiKXsxLDZ9fDopfFwiKSArIFwiKD86OigoPzo6XCIuY29uY2F0KElQdjZTZWdtZW50Rm9ybWF0LCBcIil7MCw1fTpcIikuY29uY2F0KElQdjRBZGRyZXNzRm9ybWF0LCBcInwoPzo6XCIpLmNvbmNhdChJUHY2U2VnbWVudEZvcm1hdCwgXCIpezEsN318OikpXCIpICsgJykoJVswLTlhLXpBLVotLjpdezEsfSk/JCcpO1xuXG5mdW5jdGlvbiBpc0lQKHN0cikge1xuICB2YXIgdmVyc2lvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogJyc7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7XG4gIHZlcnNpb24gPSBTdHJpbmcodmVyc2lvbik7XG5cbiAgaWYgKCF2ZXJzaW9uKSB7XG4gICAgcmV0dXJuIGlzSVAoc3RyLCA0KSB8fCBpc0lQKHN0ciwgNik7XG4gIH1cblxuICBpZiAodmVyc2lvbiA9PT0gJzQnKSB7XG4gICAgaWYgKCFJUHY0QWRkcmVzc1JlZ0V4cC50ZXN0KHN0cikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgcGFydHMgPSBzdHIuc3BsaXQoJy4nKS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICByZXR1cm4gYSAtIGI7XG4gICAgfSk7XG4gICAgcmV0dXJuIHBhcnRzWzNdIDw9IDI1NTtcbiAgfVxuXG4gIGlmICh2ZXJzaW9uID09PSAnNicpIHtcbiAgICByZXR1cm4gISFJUHY2QWRkcmVzc1JlZ0V4cC50ZXN0KHN0cik7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGlzSVBSYW5nZTtcblxudmFyIF9hc3NlcnRTdHJpbmcgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvYXNzZXJ0U3RyaW5nXCIpKTtcblxudmFyIF9pc0lQID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9pc0lQXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIHN1Ym5ldE1heWJlID0gL15cXGR7MSwzfSQvO1xudmFyIHY0U3VibmV0ID0gMzI7XG52YXIgdjZTdWJuZXQgPSAxMjg7XG5cbmZ1bmN0aW9uIGlzSVBSYW5nZShzdHIpIHtcbiAgdmFyIHZlcnNpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6ICcnO1xuICAoMCwgX2Fzc2VydFN0cmluZy5kZWZhdWx0KShzdHIpO1xuICB2YXIgcGFydHMgPSBzdHIuc3BsaXQoJy8nKTsgLy8gcGFydHNbMF0gLT4gaXAsIHBhcnRzWzFdIC0+IHN1Ym5ldFxuXG4gIGlmIChwYXJ0cy5sZW5ndGggIT09IDIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoIXN1Ym5ldE1heWJlLnRlc3QocGFydHNbMV0pKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9IC8vIERpc2FsbG93IHByZWNlZGluZyAwIGkuZS4gMDEsIDAyLCAuLi5cblxuXG4gIGlmIChwYXJ0c1sxXS5sZW5ndGggPiAxICYmIHBhcnRzWzFdLnN0YXJ0c1dpdGgoJzAnKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBpc1ZhbGlkSVAgPSAoMCwgX2lzSVAuZGVmYXVsdCkocGFydHNbMF0sIHZlcnNpb24pO1xuXG4gIGlmICghaXNWYWxpZElQKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9IC8vIERlZmluZSB2YWxpZCBzdWJuZXQgYWNjb3JkaW5nIHRvIElQJ3MgdmVyc2lvblxuXG5cbiAgdmFyIGV4cGVjdGVkU3VibmV0ID0gbnVsbDtcblxuICBzd2l0Y2ggKFN0cmluZyh2ZXJzaW9uKSkge1xuICAgIGNhc2UgJzQnOlxuICAgICAgZXhwZWN0ZWRTdWJuZXQgPSB2NFN1Ym5ldDtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnNic6XG4gICAgICBleHBlY3RlZFN1Ym5ldCA9IHY2U3VibmV0O1xuICAgICAgYnJlYWs7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgZXhwZWN0ZWRTdWJuZXQgPSAoMCwgX2lzSVAuZGVmYXVsdCkocGFydHNbMF0sICc2JykgPyB2NlN1Ym5ldCA6IHY0U3VibmV0O1xuICB9XG5cbiAgcmV0dXJuIHBhcnRzWzFdIDw9IGV4cGVjdGVkU3VibmV0ICYmIHBhcnRzWzFdID49IDA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGlzSVNCTjtcblxudmFyIF9hc3NlcnRTdHJpbmcgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvYXNzZXJ0U3RyaW5nXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIGlzYm4xME1heWJlID0gL14oPzpbMC05XXs5fVh8WzAtOV17MTB9KSQvO1xudmFyIGlzYm4xM01heWJlID0gL14oPzpbMC05XXsxM30pJC87XG52YXIgZmFjdG9yID0gWzEsIDNdO1xuXG5mdW5jdGlvbiBpc0lTQk4oc3RyKSB7XG4gIHZhciB2ZXJzaW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAnJztcbiAgKDAsIF9hc3NlcnRTdHJpbmcuZGVmYXVsdCkoc3RyKTtcbiAgdmVyc2lvbiA9IFN0cmluZyh2ZXJzaW9uKTtcblxuICBpZiAoIXZlcnNpb24pIHtcbiAgICByZXR1cm4gaXNJU0JOKHN0ciwgMTApIHx8IGlzSVNCTihzdHIsIDEzKTtcbiAgfVxuXG4gIHZhciBzYW5pdGl6ZWQgPSBzdHIucmVwbGFjZSgvW1xccy1dKy9nLCAnJyk7XG4gIHZhciBjaGVja3N1bSA9IDA7XG4gIHZhciBpO1xuXG4gIGlmICh2ZXJzaW9uID09PSAnMTAnKSB7XG4gICAgaWYgKCFpc2JuMTBNYXliZS50ZXN0KHNhbml0aXplZCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgOTsgaSsrKSB7XG4gICAgICBjaGVja3N1bSArPSAoaSArIDEpICogc2FuaXRpemVkLmNoYXJBdChpKTtcbiAgICB9XG5cbiAgICBpZiAoc2FuaXRpemVkLmNoYXJBdCg5KSA9PT0gJ1gnKSB7XG4gICAgICBjaGVja3N1bSArPSAxMCAqIDEwO1xuICAgIH0gZWxzZSB7XG4gICAgICBjaGVja3N1bSArPSAxMCAqIHNhbml0aXplZC5jaGFyQXQoOSk7XG4gICAgfVxuXG4gICAgaWYgKGNoZWNrc3VtICUgMTEgPT09IDApIHtcbiAgICAgIHJldHVybiAhIXNhbml0aXplZDtcbiAgICB9XG4gIH0gZWxzZSBpZiAodmVyc2lvbiA9PT0gJzEzJykge1xuICAgIGlmICghaXNibjEzTWF5YmUudGVzdChzYW5pdGl6ZWQpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZm9yIChpID0gMDsgaSA8IDEyOyBpKyspIHtcbiAgICAgIGNoZWNrc3VtICs9IGZhY3RvcltpICUgMl0gKiBzYW5pdGl6ZWQuY2hhckF0KGkpO1xuICAgIH1cblxuICAgIGlmIChzYW5pdGl6ZWQuY2hhckF0KDEyKSAtICgxMCAtIGNoZWNrc3VtICUgMTApICUgMTAgPT09IDApIHtcbiAgICAgIHJldHVybiAhIXNhbml0aXplZDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGlzSVNJTjtcblxudmFyIF9hc3NlcnRTdHJpbmcgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvYXNzZXJ0U3RyaW5nXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIGlzaW4gPSAvXltBLVpdezJ9WzAtOUEtWl17OX1bMC05XSQvOyAvLyB0aGlzIGxpbmsgZGV0YWlscyBob3cgdGhlIGNoZWNrIGRpZ2l0IGlzIGNhbGN1bGF0ZWQ6XG4vLyBodHRwczovL3d3dy5pc2luLm9yZy9pc2luLWZvcm1hdC8uIGl0IGlzIGEgbGl0dGxlIGJpdFxuLy8gb2RkIGluIHRoYXQgaXQgd29ya3Mgd2l0aCBkaWdpdHMsIG5vdCBudW1iZXJzLiBpbiBvcmRlclxuLy8gdG8gbWFrZSBvbmx5IG9uZSBwYXNzIHRocm91Z2ggdGhlIElTSU4gY2hhcmFjdGVycywgdGhlXG4vLyBlYWNoIGFscGhhIGNoYXJhY3RlciBpcyBoYW5kbGVkIGFzIDIgY2hhcmFjdGVycyB3aXRoaW5cbi8vIHRoZSBsb29wLlxuXG5mdW5jdGlvbiBpc0lTSU4oc3RyKSB7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7XG5cbiAgaWYgKCFpc2luLnRlc3Qoc3RyKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBkb3VibGUgPSB0cnVlO1xuICB2YXIgc3VtID0gMDsgLy8gY29udmVydCB2YWx1ZXNcblxuICBmb3IgKHZhciBpID0gc3RyLmxlbmd0aCAtIDI7IGkgPj0gMDsgaS0tKSB7XG4gICAgaWYgKHN0cltpXSA+PSAnQScgJiYgc3RyW2ldIDw9ICdaJykge1xuICAgICAgdmFyIHZhbHVlID0gc3RyW2ldLmNoYXJDb2RlQXQoMCkgLSA1NTtcbiAgICAgIHZhciBsbyA9IHZhbHVlICUgMTA7XG4gICAgICB2YXIgaGkgPSBNYXRoLnRydW5jKHZhbHVlIC8gMTApOyAvLyBsZXR0ZXJzIGhhdmUgdHdvIGRpZ2l0cywgc28gaGFuZGxlIHRoZSBsb3cgb3JkZXJcbiAgICAgIC8vIGFuZCBoaWdoIG9yZGVyIGRpZ2l0cyBzZXBhcmF0ZWx5LlxuXG4gICAgICBmb3IgKHZhciBfaSA9IDAsIF9hcnIgPSBbbG8sIGhpXTsgX2kgPCBfYXJyLmxlbmd0aDsgX2krKykge1xuICAgICAgICB2YXIgZGlnaXQgPSBfYXJyW19pXTtcblxuICAgICAgICBpZiAoZG91YmxlKSB7XG4gICAgICAgICAgaWYgKGRpZ2l0ID49IDUpIHtcbiAgICAgICAgICAgIHN1bSArPSAxICsgKGRpZ2l0IC0gNSkgKiAyO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdW0gKz0gZGlnaXQgKiAyO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdW0gKz0gZGlnaXQ7XG4gICAgICAgIH1cblxuICAgICAgICBkb3VibGUgPSAhZG91YmxlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgX2RpZ2l0ID0gc3RyW2ldLmNoYXJDb2RlQXQoMCkgLSAnMCcuY2hhckNvZGVBdCgwKTtcblxuICAgICAgaWYgKGRvdWJsZSkge1xuICAgICAgICBpZiAoX2RpZ2l0ID49IDUpIHtcbiAgICAgICAgICBzdW0gKz0gMSArIChfZGlnaXQgLSA1KSAqIDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3VtICs9IF9kaWdpdCAqIDI7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN1bSArPSBfZGlnaXQ7XG4gICAgICB9XG5cbiAgICAgIGRvdWJsZSA9ICFkb3VibGU7XG4gICAgfVxuICB9XG5cbiAgdmFyIGNoZWNrID0gTWF0aC50cnVuYygoc3VtICsgOSkgLyAxMCkgKiAxMCAtIHN1bTtcbiAgcmV0dXJuICtzdHJbc3RyLmxlbmd0aCAtIDFdID09PSBjaGVjaztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzLmRlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gaXNJU08zMTY2MUFscGhhMjtcbmV4cG9ydHMuQ291bnRyeUNvZGVzID0gdm9pZCAwO1xuXG52YXIgX2Fzc2VydFN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9hc3NlcnRTdHJpbmdcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG4vLyBmcm9tIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lTT18zMTY2LTFfYWxwaGEtMlxudmFyIHZhbGlkSVNPMzE2NjFBbHBoYTJDb3VudHJpZXNDb2RlcyA9IG5ldyBTZXQoWydBRCcsICdBRScsICdBRicsICdBRycsICdBSScsICdBTCcsICdBTScsICdBTycsICdBUScsICdBUicsICdBUycsICdBVCcsICdBVScsICdBVycsICdBWCcsICdBWicsICdCQScsICdCQicsICdCRCcsICdCRScsICdCRicsICdCRycsICdCSCcsICdCSScsICdCSicsICdCTCcsICdCTScsICdCTicsICdCTycsICdCUScsICdCUicsICdCUycsICdCVCcsICdCVicsICdCVycsICdCWScsICdCWicsICdDQScsICdDQycsICdDRCcsICdDRicsICdDRycsICdDSCcsICdDSScsICdDSycsICdDTCcsICdDTScsICdDTicsICdDTycsICdDUicsICdDVScsICdDVicsICdDVycsICdDWCcsICdDWScsICdDWicsICdERScsICdESicsICdESycsICdETScsICdETycsICdEWicsICdFQycsICdFRScsICdFRycsICdFSCcsICdFUicsICdFUycsICdFVCcsICdGSScsICdGSicsICdGSycsICdGTScsICdGTycsICdGUicsICdHQScsICdHQicsICdHRCcsICdHRScsICdHRicsICdHRycsICdHSCcsICdHSScsICdHTCcsICdHTScsICdHTicsICdHUCcsICdHUScsICdHUicsICdHUycsICdHVCcsICdHVScsICdHVycsICdHWScsICdISycsICdITScsICdITicsICdIUicsICdIVCcsICdIVScsICdJRCcsICdJRScsICdJTCcsICdJTScsICdJTicsICdJTycsICdJUScsICdJUicsICdJUycsICdJVCcsICdKRScsICdKTScsICdKTycsICdKUCcsICdLRScsICdLRycsICdLSCcsICdLSScsICdLTScsICdLTicsICdLUCcsICdLUicsICdLVycsICdLWScsICdLWicsICdMQScsICdMQicsICdMQycsICdMSScsICdMSycsICdMUicsICdMUycsICdMVCcsICdMVScsICdMVicsICdMWScsICdNQScsICdNQycsICdNRCcsICdNRScsICdNRicsICdNRycsICdNSCcsICdNSycsICdNTCcsICdNTScsICdNTicsICdNTycsICdNUCcsICdNUScsICdNUicsICdNUycsICdNVCcsICdNVScsICdNVicsICdNVycsICdNWCcsICdNWScsICdNWicsICdOQScsICdOQycsICdORScsICdORicsICdORycsICdOSScsICdOTCcsICdOTycsICdOUCcsICdOUicsICdOVScsICdOWicsICdPTScsICdQQScsICdQRScsICdQRicsICdQRycsICdQSCcsICdQSycsICdQTCcsICdQTScsICdQTicsICdQUicsICdQUycsICdQVCcsICdQVycsICdQWScsICdRQScsICdSRScsICdSTycsICdSUycsICdSVScsICdSVycsICdTQScsICdTQicsICdTQycsICdTRCcsICdTRScsICdTRycsICdTSCcsICdTSScsICdTSicsICdTSycsICdTTCcsICdTTScsICdTTicsICdTTycsICdTUicsICdTUycsICdTVCcsICdTVicsICdTWCcsICdTWScsICdTWicsICdUQycsICdURCcsICdURicsICdURycsICdUSCcsICdUSicsICdUSycsICdUTCcsICdUTScsICdUTicsICdUTycsICdUUicsICdUVCcsICdUVicsICdUVycsICdUWicsICdVQScsICdVRycsICdVTScsICdVUycsICdVWScsICdVWicsICdWQScsICdWQycsICdWRScsICdWRycsICdWSScsICdWTicsICdWVScsICdXRicsICdXUycsICdZRScsICdZVCcsICdaQScsICdaTScsICdaVyddKTtcblxuZnVuY3Rpb24gaXNJU08zMTY2MUFscGhhMihzdHIpIHtcbiAgKDAsIF9hc3NlcnRTdHJpbmcuZGVmYXVsdCkoc3RyKTtcbiAgcmV0dXJuIHZhbGlkSVNPMzE2NjFBbHBoYTJDb3VudHJpZXNDb2Rlcy5oYXMoc3RyLnRvVXBwZXJDYXNlKCkpO1xufVxuXG52YXIgQ291bnRyeUNvZGVzID0gdmFsaWRJU08zMTY2MUFscGhhMkNvdW50cmllc0NvZGVzO1xuZXhwb3J0cy5Db3VudHJ5Q29kZXMgPSBDb3VudHJ5Q29kZXM7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBpc0lTTzMxNjYxQWxwaGEzO1xuXG52YXIgX2Fzc2VydFN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9hc3NlcnRTdHJpbmdcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG4vLyBmcm9tIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lTT18zMTY2LTFfYWxwaGEtM1xudmFyIHZhbGlkSVNPMzE2NjFBbHBoYTNDb3VudHJpZXNDb2RlcyA9IG5ldyBTZXQoWydBRkcnLCAnQUxBJywgJ0FMQicsICdEWkEnLCAnQVNNJywgJ0FORCcsICdBR08nLCAnQUlBJywgJ0FUQScsICdBVEcnLCAnQVJHJywgJ0FSTScsICdBQlcnLCAnQVVTJywgJ0FVVCcsICdBWkUnLCAnQkhTJywgJ0JIUicsICdCR0QnLCAnQlJCJywgJ0JMUicsICdCRUwnLCAnQkxaJywgJ0JFTicsICdCTVUnLCAnQlROJywgJ0JPTCcsICdCRVMnLCAnQklIJywgJ0JXQScsICdCVlQnLCAnQlJBJywgJ0lPVCcsICdCUk4nLCAnQkdSJywgJ0JGQScsICdCREknLCAnS0hNJywgJ0NNUicsICdDQU4nLCAnQ1BWJywgJ0NZTScsICdDQUYnLCAnVENEJywgJ0NITCcsICdDSE4nLCAnQ1hSJywgJ0NDSycsICdDT0wnLCAnQ09NJywgJ0NPRycsICdDT0QnLCAnQ09LJywgJ0NSSScsICdDSVYnLCAnSFJWJywgJ0NVQicsICdDVVcnLCAnQ1lQJywgJ0NaRScsICdETksnLCAnREpJJywgJ0RNQScsICdET00nLCAnRUNVJywgJ0VHWScsICdTTFYnLCAnR05RJywgJ0VSSScsICdFU1QnLCAnRVRIJywgJ0ZMSycsICdGUk8nLCAnRkpJJywgJ0ZJTicsICdGUkEnLCAnR1VGJywgJ1BZRicsICdBVEYnLCAnR0FCJywgJ0dNQicsICdHRU8nLCAnREVVJywgJ0dIQScsICdHSUInLCAnR1JDJywgJ0dSTCcsICdHUkQnLCAnR0xQJywgJ0dVTScsICdHVE0nLCAnR0dZJywgJ0dJTicsICdHTkInLCAnR1VZJywgJ0hUSScsICdITUQnLCAnVkFUJywgJ0hORCcsICdIS0cnLCAnSFVOJywgJ0lTTCcsICdJTkQnLCAnSUROJywgJ0lSTicsICdJUlEnLCAnSVJMJywgJ0lNTicsICdJU1InLCAnSVRBJywgJ0pBTScsICdKUE4nLCAnSkVZJywgJ0pPUicsICdLQVonLCAnS0VOJywgJ0tJUicsICdQUksnLCAnS09SJywgJ0tXVCcsICdLR1onLCAnTEFPJywgJ0xWQScsICdMQk4nLCAnTFNPJywgJ0xCUicsICdMQlknLCAnTElFJywgJ0xUVScsICdMVVgnLCAnTUFDJywgJ01LRCcsICdNREcnLCAnTVdJJywgJ01ZUycsICdNRFYnLCAnTUxJJywgJ01MVCcsICdNSEwnLCAnTVRRJywgJ01SVCcsICdNVVMnLCAnTVlUJywgJ01FWCcsICdGU00nLCAnTURBJywgJ01DTycsICdNTkcnLCAnTU5FJywgJ01TUicsICdNQVInLCAnTU9aJywgJ01NUicsICdOQU0nLCAnTlJVJywgJ05QTCcsICdOTEQnLCAnTkNMJywgJ05aTCcsICdOSUMnLCAnTkVSJywgJ05HQScsICdOSVUnLCAnTkZLJywgJ01OUCcsICdOT1InLCAnT01OJywgJ1BBSycsICdQTFcnLCAnUFNFJywgJ1BBTicsICdQTkcnLCAnUFJZJywgJ1BFUicsICdQSEwnLCAnUENOJywgJ1BPTCcsICdQUlQnLCAnUFJJJywgJ1FBVCcsICdSRVUnLCAnUk9VJywgJ1JVUycsICdSV0EnLCAnQkxNJywgJ1NITicsICdLTkEnLCAnTENBJywgJ01BRicsICdTUE0nLCAnVkNUJywgJ1dTTScsICdTTVInLCAnU1RQJywgJ1NBVScsICdTRU4nLCAnU1JCJywgJ1NZQycsICdTTEUnLCAnU0dQJywgJ1NYTScsICdTVksnLCAnU1ZOJywgJ1NMQicsICdTT00nLCAnWkFGJywgJ1NHUycsICdTU0QnLCAnRVNQJywgJ0xLQScsICdTRE4nLCAnU1VSJywgJ1NKTScsICdTV1onLCAnU1dFJywgJ0NIRScsICdTWVInLCAnVFdOJywgJ1RKSycsICdUWkEnLCAnVEhBJywgJ1RMUycsICdUR08nLCAnVEtMJywgJ1RPTicsICdUVE8nLCAnVFVOJywgJ1RVUicsICdUS00nLCAnVENBJywgJ1RVVicsICdVR0EnLCAnVUtSJywgJ0FSRScsICdHQlInLCAnVVNBJywgJ1VNSScsICdVUlknLCAnVVpCJywgJ1ZVVCcsICdWRU4nLCAnVk5NJywgJ1ZHQicsICdWSVInLCAnV0xGJywgJ0VTSCcsICdZRU0nLCAnWk1CJywgJ1pXRSddKTtcblxuZnVuY3Rpb24gaXNJU08zMTY2MUFscGhhMyhzdHIpIHtcbiAgKDAsIF9hc3NlcnRTdHJpbmcuZGVmYXVsdCkoc3RyKTtcbiAgcmV0dXJuIHZhbGlkSVNPMzE2NjFBbHBoYTNDb3VudHJpZXNDb2Rlcy5oYXMoc3RyLnRvVXBwZXJDYXNlKCkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBpc0lTTzQyMTc7XG5leHBvcnRzLkN1cnJlbmN5Q29kZXMgPSB2b2lkIDA7XG5cbnZhciBfYXNzZXJ0U3RyaW5nID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL2Fzc2VydFN0cmluZ1wiKSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbi8vIGZyb20gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSVNPXzQyMTdcbnZhciB2YWxpZElTTzQyMTdDdXJyZW5jeUNvZGVzID0gbmV3IFNldChbJ0FFRCcsICdBRk4nLCAnQUxMJywgJ0FNRCcsICdBTkcnLCAnQU9BJywgJ0FSUycsICdBVUQnLCAnQVdHJywgJ0FaTicsICdCQU0nLCAnQkJEJywgJ0JEVCcsICdCR04nLCAnQkhEJywgJ0JJRicsICdCTUQnLCAnQk5EJywgJ0JPQicsICdCT1YnLCAnQlJMJywgJ0JTRCcsICdCVE4nLCAnQldQJywgJ0JZTicsICdCWkQnLCAnQ0FEJywgJ0NERicsICdDSEUnLCAnQ0hGJywgJ0NIVycsICdDTEYnLCAnQ0xQJywgJ0NOWScsICdDT1AnLCAnQ09VJywgJ0NSQycsICdDVUMnLCAnQ1VQJywgJ0NWRScsICdDWksnLCAnREpGJywgJ0RLSycsICdET1AnLCAnRFpEJywgJ0VHUCcsICdFUk4nLCAnRVRCJywgJ0VVUicsICdGSkQnLCAnRktQJywgJ0dCUCcsICdHRUwnLCAnR0hTJywgJ0dJUCcsICdHTUQnLCAnR05GJywgJ0dUUScsICdHWUQnLCAnSEtEJywgJ0hOTCcsICdIUksnLCAnSFRHJywgJ0hVRicsICdJRFInLCAnSUxTJywgJ0lOUicsICdJUUQnLCAnSVJSJywgJ0lTSycsICdKTUQnLCAnSk9EJywgJ0pQWScsICdLRVMnLCAnS0dTJywgJ0tIUicsICdLTUYnLCAnS1BXJywgJ0tSVycsICdLV0QnLCAnS1lEJywgJ0taVCcsICdMQUsnLCAnTEJQJywgJ0xLUicsICdMUkQnLCAnTFNMJywgJ0xZRCcsICdNQUQnLCAnTURMJywgJ01HQScsICdNS0QnLCAnTU1LJywgJ01OVCcsICdNT1AnLCAnTVJVJywgJ01VUicsICdNVlInLCAnTVdLJywgJ01YTicsICdNWFYnLCAnTVlSJywgJ01aTicsICdOQUQnLCAnTkdOJywgJ05JTycsICdOT0snLCAnTlBSJywgJ05aRCcsICdPTVInLCAnUEFCJywgJ1BFTicsICdQR0snLCAnUEhQJywgJ1BLUicsICdQTE4nLCAnUFlHJywgJ1FBUicsICdST04nLCAnUlNEJywgJ1JVQicsICdSV0YnLCAnU0FSJywgJ1NCRCcsICdTQ1InLCAnU0RHJywgJ1NFSycsICdTR0QnLCAnU0hQJywgJ1NMTCcsICdTT1MnLCAnU1JEJywgJ1NTUCcsICdTVE4nLCAnU1ZDJywgJ1NZUCcsICdTWkwnLCAnVEhCJywgJ1RKUycsICdUTVQnLCAnVE5EJywgJ1RPUCcsICdUUlknLCAnVFREJywgJ1RXRCcsICdUWlMnLCAnVUFIJywgJ1VHWCcsICdVU0QnLCAnVVNOJywgJ1VZSScsICdVWVUnLCAnVVlXJywgJ1VaUycsICdWRVMnLCAnVk5EJywgJ1ZVVicsICdXU1QnLCAnWEFGJywgJ1hBRycsICdYQVUnLCAnWEJBJywgJ1hCQicsICdYQkMnLCAnWEJEJywgJ1hDRCcsICdYRFInLCAnWE9GJywgJ1hQRCcsICdYUEYnLCAnWFBUJywgJ1hTVScsICdYVFMnLCAnWFVBJywgJ1hYWCcsICdZRVInLCAnWkFSJywgJ1pNVycsICdaV0wnXSk7XG5cbmZ1bmN0aW9uIGlzSVNPNDIxNyhzdHIpIHtcbiAgKDAsIF9hc3NlcnRTdHJpbmcuZGVmYXVsdCkoc3RyKTtcbiAgcmV0dXJuIHZhbGlkSVNPNDIxN0N1cnJlbmN5Q29kZXMuaGFzKHN0ci50b1VwcGVyQ2FzZSgpKTtcbn1cblxudmFyIEN1cnJlbmN5Q29kZXMgPSB2YWxpZElTTzQyMTdDdXJyZW5jeUNvZGVzO1xuZXhwb3J0cy5DdXJyZW5jeUNvZGVzID0gQ3VycmVuY3lDb2RlczsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGlzSVNPODYwMTtcblxudmFyIF9hc3NlcnRTdHJpbmcgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvYXNzZXJ0U3RyaW5nXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuLyogZXNsaW50LWRpc2FibGUgbWF4LWxlbiAqL1xuLy8gZnJvbSBodHRwOi8vZ29vLmdsLzBlakhIV1xudmFyIGlzbzg2MDEgPSAvXihbXFwrLV0/XFxkezR9KD8hXFxkezJ9XFxiKSkoKC0/KSgoMFsxLTldfDFbMC0yXSkoXFwzKFsxMl1cXGR8MFsxLTldfDNbMDFdKSk/fFcoWzAtNF1cXGR8NVswLTNdKSgtP1sxLTddKT98KDAwWzEtOV18MFsxLTldXFxkfFsxMl1cXGR7Mn18MyhbMC01XVxcZHw2WzEtNl0pKSkoW1RcXHNdKCgoWzAxXVxcZHwyWzAtM10pKCg6PylbMC01XVxcZCk/fDI0Oj8wMCkoW1xcLixdXFxkKyg/ITopKT8pPyhcXDE3WzAtNV1cXGQoW1xcLixdXFxkKyk/KT8oW3paXXwoW1xcKy1dKShbMDFdXFxkfDJbMC0zXSk6PyhbMC01XVxcZCk/KT8pPyk/JC87IC8vIHNhbWUgYXMgYWJvdmUsIGV4Y2VwdCB3aXRoIGEgc3RyaWN0ICdUJyBzZXBhcmF0b3IgYmV0d2VlbiBkYXRlIGFuZCB0aW1lXG5cbnZhciBpc284NjAxU3RyaWN0U2VwYXJhdG9yID0gL14oW1xcKy1dP1xcZHs0fSg/IVxcZHsyfVxcYikpKCgtPykoKDBbMS05XXwxWzAtMl0pKFxcMyhbMTJdXFxkfDBbMS05XXwzWzAxXSkpP3xXKFswLTRdXFxkfDVbMC0zXSkoLT9bMS03XSk/fCgwMFsxLTldfDBbMS05XVxcZHxbMTJdXFxkezJ9fDMoWzAtNV1cXGR8NlsxLTZdKSkpKFtUXSgoKFswMV1cXGR8MlswLTNdKSgoOj8pWzAtNV1cXGQpP3wyNDo/MDApKFtcXC4sXVxcZCsoPyE6KSk/KT8oXFwxN1swLTVdXFxkKFtcXC4sXVxcZCspPyk/KFt6Wl18KFtcXCstXSkoWzAxXVxcZHwyWzAtM10pOj8oWzAtNV1cXGQpPyk/KT8pPyQvO1xuLyogZXNsaW50LWVuYWJsZSBtYXgtbGVuICovXG5cbnZhciBpc1ZhbGlkRGF0ZSA9IGZ1bmN0aW9uIGlzVmFsaWREYXRlKHN0cikge1xuICAvLyBzdHIgbXVzdCBoYXZlIHBhc3NlZCB0aGUgSVNPODYwMSBjaGVja1xuICAvLyB0aGlzIGNoZWNrIGlzIG1lYW50IHRvIGNhdGNoIGludmFsaWQgZGF0ZXNcbiAgLy8gbGlrZSAyMDA5LTAyLTMxXG4gIC8vIGZpcnN0IGNoZWNrIGZvciBvcmRpbmFsIGRhdGVzXG4gIHZhciBvcmRpbmFsTWF0Y2ggPSBzdHIubWF0Y2goL14oXFxkezR9KS0/KFxcZHszfSkoWyBUXXsxfVxcLip8JCkvKTtcblxuICBpZiAob3JkaW5hbE1hdGNoKSB7XG4gICAgdmFyIG9ZZWFyID0gTnVtYmVyKG9yZGluYWxNYXRjaFsxXSk7XG4gICAgdmFyIG9EYXkgPSBOdW1iZXIob3JkaW5hbE1hdGNoWzJdKTsgLy8gaWYgaXMgbGVhcCB5ZWFyXG5cbiAgICBpZiAob1llYXIgJSA0ID09PSAwICYmIG9ZZWFyICUgMTAwICE9PSAwIHx8IG9ZZWFyICUgNDAwID09PSAwKSByZXR1cm4gb0RheSA8PSAzNjY7XG4gICAgcmV0dXJuIG9EYXkgPD0gMzY1O1xuICB9XG5cbiAgdmFyIG1hdGNoID0gc3RyLm1hdGNoKC8oXFxkezR9KS0/KFxcZHswLDJ9KS0/KFxcZCopLykubWFwKE51bWJlcik7XG4gIHZhciB5ZWFyID0gbWF0Y2hbMV07XG4gIHZhciBtb250aCA9IG1hdGNoWzJdO1xuICB2YXIgZGF5ID0gbWF0Y2hbM107XG4gIHZhciBtb250aFN0cmluZyA9IG1vbnRoID8gXCIwXCIuY29uY2F0KG1vbnRoKS5zbGljZSgtMikgOiBtb250aDtcbiAgdmFyIGRheVN0cmluZyA9IGRheSA/IFwiMFwiLmNvbmNhdChkYXkpLnNsaWNlKC0yKSA6IGRheTsgLy8gY3JlYXRlIGEgZGF0ZSBvYmplY3QgYW5kIGNvbXBhcmVcblxuICB2YXIgZCA9IG5ldyBEYXRlKFwiXCIuY29uY2F0KHllYXIsIFwiLVwiKS5jb25jYXQobW9udGhTdHJpbmcgfHwgJzAxJywgXCItXCIpLmNvbmNhdChkYXlTdHJpbmcgfHwgJzAxJykpO1xuXG4gIGlmIChtb250aCAmJiBkYXkpIHtcbiAgICByZXR1cm4gZC5nZXRVVENGdWxsWWVhcigpID09PSB5ZWFyICYmIGQuZ2V0VVRDTW9udGgoKSArIDEgPT09IG1vbnRoICYmIGQuZ2V0VVRDRGF0ZSgpID09PSBkYXk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbmZ1bmN0aW9uIGlzSVNPODYwMShzdHIpIHtcbiAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuICAoMCwgX2Fzc2VydFN0cmluZy5kZWZhdWx0KShzdHIpO1xuICB2YXIgY2hlY2sgPSBvcHRpb25zLnN0cmljdFNlcGFyYXRvciA/IGlzbzg2MDFTdHJpY3RTZXBhcmF0b3IudGVzdChzdHIpIDogaXNvODYwMS50ZXN0KHN0cik7XG4gIGlmIChjaGVjayAmJiBvcHRpb25zLnN0cmljdCkgcmV0dXJuIGlzVmFsaWREYXRlKHN0cik7XG4gIHJldHVybiBjaGVjaztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzLmRlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gaXNJU1JDO1xuXG52YXIgX2Fzc2VydFN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9hc3NlcnRTdHJpbmdcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG4vLyBzZWUgaHR0cDovL2lzcmMuaWZwaS5vcmcvZW4vaXNyYy1zdGFuZGFyZC9jb2RlLXN5bnRheFxudmFyIGlzcmMgPSAvXltBLVpdezJ9WzAtOUEtWl17M31cXGR7Mn1cXGR7NX0kLztcblxuZnVuY3Rpb24gaXNJU1JDKHN0cikge1xuICAoMCwgX2Fzc2VydFN0cmluZy5kZWZhdWx0KShzdHIpO1xuICByZXR1cm4gaXNyYy50ZXN0KHN0cik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGlzSVNTTjtcblxudmFyIF9hc3NlcnRTdHJpbmcgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvYXNzZXJ0U3RyaW5nXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIGlzc24gPSAnXlxcXFxkezR9LT9cXFxcZHszfVtcXFxcZFhdJCc7XG5cbmZ1bmN0aW9uIGlzSVNTTihzdHIpIHtcbiAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuICAoMCwgX2Fzc2VydFN0cmluZy5kZWZhdWx0KShzdHIpO1xuICB2YXIgdGVzdElzc24gPSBpc3NuO1xuICB0ZXN0SXNzbiA9IG9wdGlvbnMucmVxdWlyZV9oeXBoZW4gPyB0ZXN0SXNzbi5yZXBsYWNlKCc/JywgJycpIDogdGVzdElzc247XG4gIHRlc3RJc3NuID0gb3B0aW9ucy5jYXNlX3NlbnNpdGl2ZSA/IG5ldyBSZWdFeHAodGVzdElzc24pIDogbmV3IFJlZ0V4cCh0ZXN0SXNzbiwgJ2knKTtcblxuICBpZiAoIXRlc3RJc3NuLnRlc3Qoc3RyKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBkaWdpdHMgPSBzdHIucmVwbGFjZSgnLScsICcnKS50b1VwcGVyQ2FzZSgpO1xuICB2YXIgY2hlY2tzdW0gPSAwO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZGlnaXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGRpZ2l0ID0gZGlnaXRzW2ldO1xuICAgIGNoZWNrc3VtICs9IChkaWdpdCA9PT0gJ1gnID8gMTAgOiArZGlnaXQpICogKDggLSBpKTtcbiAgfVxuXG4gIHJldHVybiBjaGVja3N1bSAlIDExID09PSAwO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBpc0lkZW50aXR5Q2FyZDtcblxudmFyIF9hc3NlcnRTdHJpbmcgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvYXNzZXJ0U3RyaW5nXCIpKTtcblxudmFyIF9pc0ludCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vaXNJbnRcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgdmFsaWRhdG9ycyA9IHtcbiAgUEw6IGZ1bmN0aW9uIFBMKHN0cikge1xuICAgICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7XG4gICAgdmFyIHdlaWdodE9mRGlnaXRzID0ge1xuICAgICAgMTogMSxcbiAgICAgIDI6IDMsXG4gICAgICAzOiA3LFxuICAgICAgNDogOSxcbiAgICAgIDU6IDEsXG4gICAgICA2OiAzLFxuICAgICAgNzogNyxcbiAgICAgIDg6IDksXG4gICAgICA5OiAxLFxuICAgICAgMTA6IDMsXG4gICAgICAxMTogMFxuICAgIH07XG5cbiAgICBpZiAoc3RyICE9IG51bGwgJiYgc3RyLmxlbmd0aCA9PT0gMTEgJiYgKDAsIF9pc0ludC5kZWZhdWx0KShzdHIsIHtcbiAgICAgIGFsbG93X2xlYWRpbmdfemVyb2VzOiB0cnVlXG4gICAgfSkpIHtcbiAgICAgIHZhciBkaWdpdHMgPSBzdHIuc3BsaXQoJycpLnNsaWNlKDAsIC0xKTtcbiAgICAgIHZhciBzdW0gPSBkaWdpdHMucmVkdWNlKGZ1bmN0aW9uIChhY2MsIGRpZ2l0LCBpbmRleCkge1xuICAgICAgICByZXR1cm4gYWNjICsgTnVtYmVyKGRpZ2l0KSAqIHdlaWdodE9mRGlnaXRzW2luZGV4ICsgMV07XG4gICAgICB9LCAwKTtcbiAgICAgIHZhciBtb2R1bG8gPSBzdW0gJSAxMDtcbiAgICAgIHZhciBsYXN0RGlnaXQgPSBOdW1iZXIoc3RyLmNoYXJBdChzdHIubGVuZ3RoIC0gMSkpO1xuXG4gICAgICBpZiAobW9kdWxvID09PSAwICYmIGxhc3REaWdpdCA9PT0gMCB8fCBsYXN0RGlnaXQgPT09IDEwIC0gbW9kdWxvKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcbiAgRVM6IGZ1bmN0aW9uIEVTKHN0cikge1xuICAgICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7XG4gICAgdmFyIEROSSA9IC9eWzAtOVgtWl1bMC05XXs3fVtUUldBR01ZRlBEWEJOSlpTUVZITENLRV0kLztcbiAgICB2YXIgY2hhcnNWYWx1ZSA9IHtcbiAgICAgIFg6IDAsXG4gICAgICBZOiAxLFxuICAgICAgWjogMlxuICAgIH07XG4gICAgdmFyIGNvbnRyb2xEaWdpdHMgPSBbJ1QnLCAnUicsICdXJywgJ0EnLCAnRycsICdNJywgJ1knLCAnRicsICdQJywgJ0QnLCAnWCcsICdCJywgJ04nLCAnSicsICdaJywgJ1MnLCAnUScsICdWJywgJ0gnLCAnTCcsICdDJywgJ0snLCAnRSddOyAvLyBzYW5pdGl6ZSB1c2VyIGlucHV0XG5cbiAgICB2YXIgc2FuaXRpemVkID0gc3RyLnRyaW0oKS50b1VwcGVyQ2FzZSgpOyAvLyB2YWxpZGF0ZSB0aGUgZGF0YSBzdHJ1Y3R1cmVcblxuICAgIGlmICghRE5JLnRlc3Qoc2FuaXRpemVkKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gLy8gdmFsaWRhdGUgdGhlIGNvbnRyb2wgZGlnaXRcblxuXG4gICAgdmFyIG51bWJlciA9IHNhbml0aXplZC5zbGljZSgwLCAtMSkucmVwbGFjZSgvW1gsWSxaXS9nLCBmdW5jdGlvbiAoY2hhcikge1xuICAgICAgcmV0dXJuIGNoYXJzVmFsdWVbY2hhcl07XG4gICAgfSk7XG4gICAgcmV0dXJuIHNhbml0aXplZC5lbmRzV2l0aChjb250cm9sRGlnaXRzW251bWJlciAlIDIzXSk7XG4gIH0sXG4gIEZJOiBmdW5jdGlvbiBGSShzdHIpIHtcbiAgICAvLyBodHRwczovL2R2di5maS9lbi9wZXJzb25hbC1pZGVudGl0eS1jb2RlIzp+OnRleHQ9Y29udHJvbCUyMGNoYXJhY3RlciUyMGZvciUyMGEtLHBlcnNvbmFsLC1pZGVudGl0eSUyMGNvZGUlMjBjYWxjdWxhdGVkXG4gICAgKDAsIF9hc3NlcnRTdHJpbmcuZGVmYXVsdCkoc3RyKTtcblxuICAgIGlmIChzdHIubGVuZ3RoICE9PSAxMSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghc3RyLm1hdGNoKC9eXFxkezZ9W1xcLUFcXCtdXFxkezN9WzAtOUFCQ0RFRkhKS0xNTlBSU1RVVldYWV17MX0kLykpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgY2hlY2tEaWdpdHMgPSAnMDEyMzQ1Njc4OUFCQ0RFRkhKS0xNTlBSU1RVVldYWSc7XG4gICAgdmFyIGlkQXNOdW1iZXIgPSBwYXJzZUludChzdHIuc2xpY2UoMCwgNiksIDEwKSAqIDEwMDAgKyBwYXJzZUludChzdHIuc2xpY2UoNywgMTApLCAxMCk7XG4gICAgdmFyIHJlbWFpbmRlciA9IGlkQXNOdW1iZXIgJSAzMTtcbiAgICB2YXIgY2hlY2tEaWdpdCA9IGNoZWNrRGlnaXRzW3JlbWFpbmRlcl07XG4gICAgcmV0dXJuIGNoZWNrRGlnaXQgPT09IHN0ci5zbGljZSgxMCwgMTEpO1xuICB9LFxuICBJTjogZnVuY3Rpb24gSU4oc3RyKSB7XG4gICAgdmFyIEROSSA9IC9eWzEtOV1cXGR7M31cXHM/XFxkezR9XFxzP1xcZHs0fSQvOyAvLyBtdWx0aXBsaWNhdGlvbiB0YWJsZVxuXG4gICAgdmFyIGQgPSBbWzAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDldLCBbMSwgMiwgMywgNCwgMCwgNiwgNywgOCwgOSwgNV0sIFsyLCAzLCA0LCAwLCAxLCA3LCA4LCA5LCA1LCA2XSwgWzMsIDQsIDAsIDEsIDIsIDgsIDksIDUsIDYsIDddLCBbNCwgMCwgMSwgMiwgMywgOSwgNSwgNiwgNywgOF0sIFs1LCA5LCA4LCA3LCA2LCAwLCA0LCAzLCAyLCAxXSwgWzYsIDUsIDksIDgsIDcsIDEsIDAsIDQsIDMsIDJdLCBbNywgNiwgNSwgOSwgOCwgMiwgMSwgMCwgNCwgM10sIFs4LCA3LCA2LCA1LCA5LCAzLCAyLCAxLCAwLCA0XSwgWzksIDgsIDcsIDYsIDUsIDQsIDMsIDIsIDEsIDBdXTsgLy8gcGVybXV0YXRpb24gdGFibGVcblxuICAgIHZhciBwID0gW1swLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5XSwgWzEsIDUsIDcsIDYsIDIsIDgsIDMsIDAsIDksIDRdLCBbNSwgOCwgMCwgMywgNywgOSwgNiwgMSwgNCwgMl0sIFs4LCA5LCAxLCA2LCAwLCA0LCAzLCA1LCAyLCA3XSwgWzksIDQsIDUsIDMsIDEsIDIsIDYsIDgsIDcsIDBdLCBbNCwgMiwgOCwgNiwgNSwgNywgMywgOSwgMCwgMV0sIFsyLCA3LCA5LCAzLCA4LCAwLCA2LCA0LCAxLCA1XSwgWzcsIDAsIDQsIDYsIDksIDEsIDMsIDIsIDUsIDhdXTsgLy8gc2FuaXRpemUgdXNlciBpbnB1dFxuXG4gICAgdmFyIHNhbml0aXplZCA9IHN0ci50cmltKCk7IC8vIHZhbGlkYXRlIHRoZSBkYXRhIHN0cnVjdHVyZVxuXG4gICAgaWYgKCFETkkudGVzdChzYW5pdGl6ZWQpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIGMgPSAwO1xuICAgIHZhciBpbnZlcnRlZEFycmF5ID0gc2FuaXRpemVkLnJlcGxhY2UoL1xccy9nLCAnJykuc3BsaXQoJycpLm1hcChOdW1iZXIpLnJldmVyc2UoKTtcbiAgICBpbnZlcnRlZEFycmF5LmZvckVhY2goZnVuY3Rpb24gKHZhbCwgaSkge1xuICAgICAgYyA9IGRbY11bcFtpICUgOF1bdmFsXV07XG4gICAgfSk7XG4gICAgcmV0dXJuIGMgPT09IDA7XG4gIH0sXG4gIElSOiBmdW5jdGlvbiBJUihzdHIpIHtcbiAgICBpZiAoIXN0ci5tYXRjaCgvXlxcZHsxMH0kLykpIHJldHVybiBmYWxzZTtcbiAgICBzdHIgPSBcIjAwMDBcIi5jb25jYXQoc3RyKS5zdWJzdHIoc3RyLmxlbmd0aCAtIDYpO1xuICAgIGlmIChwYXJzZUludChzdHIuc3Vic3RyKDMsIDYpLCAxMCkgPT09IDApIHJldHVybiBmYWxzZTtcbiAgICB2YXIgbGFzdE51bWJlciA9IHBhcnNlSW50KHN0ci5zdWJzdHIoOSwgMSksIDEwKTtcbiAgICB2YXIgc3VtID0gMDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgOTsgaSsrKSB7XG4gICAgICBzdW0gKz0gcGFyc2VJbnQoc3RyLnN1YnN0cihpLCAxKSwgMTApICogKDEwIC0gaSk7XG4gICAgfVxuXG4gICAgc3VtICU9IDExO1xuICAgIHJldHVybiBzdW0gPCAyICYmIGxhc3ROdW1iZXIgPT09IHN1bSB8fCBzdW0gPj0gMiAmJiBsYXN0TnVtYmVyID09PSAxMSAtIHN1bTtcbiAgfSxcbiAgSVQ6IGZ1bmN0aW9uIElUKHN0cikge1xuICAgIGlmIChzdHIubGVuZ3RoICE9PSA5KSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKHN0ciA9PT0gJ0NBMDAwMDBBQScpIHJldHVybiBmYWxzZTsgLy8gaHR0cHM6Ly9pdC53aWtpcGVkaWEub3JnL3dpa2kvQ2FydGFfZCUyN2lkZW50aXQlQzMlQTBfZWxldHRyb25pY2FfaXRhbGlhbmFcblxuICAgIHJldHVybiBzdHIuc2VhcmNoKC9DW0EtWl1bMC05XXs1fVtBLVpdezJ9L2kpID4gLTE7XG4gIH0sXG4gIE5POiBmdW5jdGlvbiBOTyhzdHIpIHtcbiAgICB2YXIgc2FuaXRpemVkID0gc3RyLnRyaW0oKTtcbiAgICBpZiAoaXNOYU4oTnVtYmVyKHNhbml0aXplZCkpKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKHNhbml0aXplZC5sZW5ndGggIT09IDExKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKHNhbml0aXplZCA9PT0gJzAwMDAwMDAwMDAwJykgcmV0dXJuIGZhbHNlOyAvLyBodHRwczovL25vLndpa2lwZWRpYS5vcmcvd2lraS9GJUMzJUI4ZHNlbHNudW1tZXJcblxuICAgIHZhciBmID0gc2FuaXRpemVkLnNwbGl0KCcnKS5tYXAoTnVtYmVyKTtcbiAgICB2YXIgazEgPSAoMTEgLSAoMyAqIGZbMF0gKyA3ICogZlsxXSArIDYgKiBmWzJdICsgMSAqIGZbM10gKyA4ICogZls0XSArIDkgKiBmWzVdICsgNCAqIGZbNl0gKyA1ICogZls3XSArIDIgKiBmWzhdKSAlIDExKSAlIDExO1xuICAgIHZhciBrMiA9ICgxMSAtICg1ICogZlswXSArIDQgKiBmWzFdICsgMyAqIGZbMl0gKyAyICogZlszXSArIDcgKiBmWzRdICsgNiAqIGZbNV0gKyA1ICogZls2XSArIDQgKiBmWzddICsgMyAqIGZbOF0gKyAyICogazEpICUgMTEpICUgMTE7XG4gICAgaWYgKGsxICE9PSBmWzldIHx8IGsyICE9PSBmWzEwXSkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBUSDogZnVuY3Rpb24gVEgoc3RyKSB7XG4gICAgaWYgKCFzdHIubWF0Y2goL15bMS04XVxcZHsxMn0kLykpIHJldHVybiBmYWxzZTsgLy8gdmFsaWRhdGUgY2hlY2sgZGlnaXRcblxuICAgIHZhciBzdW0gPSAwO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxMjsgaSsrKSB7XG4gICAgICBzdW0gKz0gcGFyc2VJbnQoc3RyW2ldLCAxMCkgKiAoMTMgLSBpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3RyWzEyXSA9PT0gKCgxMSAtIHN1bSAlIDExKSAlIDEwKS50b1N0cmluZygpO1xuICB9LFxuICBMSzogZnVuY3Rpb24gTEsoc3RyKSB7XG4gICAgdmFyIG9sZF9uaWMgPSAvXlsxLTldXFxkezh9W3Z4XSQvaTtcbiAgICB2YXIgbmV3X25pYyA9IC9eWzEtOV1cXGR7MTF9JC9pO1xuICAgIGlmIChzdHIubGVuZ3RoID09PSAxMCAmJiBvbGRfbmljLnRlc3Qoc3RyKSkgcmV0dXJuIHRydWU7ZWxzZSBpZiAoc3RyLmxlbmd0aCA9PT0gMTIgJiYgbmV3X25pYy50ZXN0KHN0cikpIHJldHVybiB0cnVlO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcbiAgJ2hlLUlMJzogZnVuY3Rpb24gaGVJTChzdHIpIHtcbiAgICB2YXIgRE5JID0gL15cXGR7OX0kLzsgLy8gc2FuaXRpemUgdXNlciBpbnB1dFxuXG4gICAgdmFyIHNhbml0aXplZCA9IHN0ci50cmltKCk7IC8vIHZhbGlkYXRlIHRoZSBkYXRhIHN0cnVjdHVyZVxuXG4gICAgaWYgKCFETkkudGVzdChzYW5pdGl6ZWQpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIGlkID0gc2FuaXRpemVkO1xuICAgIHZhciBzdW0gPSAwLFxuICAgICAgICBpbmNOdW07XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGlkLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpbmNOdW0gPSBOdW1iZXIoaWRbaV0pICogKGkgJSAyICsgMSk7IC8vIE11bHRpcGx5IG51bWJlciBieSAxIG9yIDJcblxuICAgICAgc3VtICs9IGluY051bSA+IDkgPyBpbmNOdW0gLSA5IDogaW5jTnVtOyAvLyBTdW0gdGhlIGRpZ2l0cyB1cCBhbmQgYWRkIHRvIHRvdGFsXG4gICAgfVxuXG4gICAgcmV0dXJuIHN1bSAlIDEwID09PSAwO1xuICB9LFxuICAnYXItTFknOiBmdW5jdGlvbiBhckxZKHN0cikge1xuICAgIC8vIExpYnlhIE5hdGlvbmFsIElkZW50aXR5IE51bWJlciBOSU4gaXMgMTIgZGlnaXRzLCB0aGUgZmlyc3QgZGlnaXQgaXMgZWl0aGVyIDEgb3IgMlxuICAgIHZhciBOSU4gPSAvXigxfDIpXFxkezExfSQvOyAvLyBzYW5pdGl6ZSB1c2VyIGlucHV0XG5cbiAgICB2YXIgc2FuaXRpemVkID0gc3RyLnRyaW0oKTsgLy8gdmFsaWRhdGUgdGhlIGRhdGEgc3RydWN0dXJlXG5cbiAgICBpZiAoIU5JTi50ZXN0KHNhbml0aXplZCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgJ2FyLVROJzogZnVuY3Rpb24gYXJUTihzdHIpIHtcbiAgICB2YXIgRE5JID0gL15cXGR7OH0kLzsgLy8gc2FuaXRpemUgdXNlciBpbnB1dFxuXG4gICAgdmFyIHNhbml0aXplZCA9IHN0ci50cmltKCk7IC8vIHZhbGlkYXRlIHRoZSBkYXRhIHN0cnVjdHVyZVxuXG4gICAgaWYgKCFETkkudGVzdChzYW5pdGl6ZWQpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gICd6aC1DTic6IGZ1bmN0aW9uIHpoQ04oc3RyKSB7XG4gICAgdmFyIHByb3ZpbmNlc0FuZENpdGllcyA9IFsnMTEnLCAvLyDljJfkuqxcbiAgICAnMTInLCAvLyDlpKnmtKVcbiAgICAnMTMnLCAvLyDmsrPljJdcbiAgICAnMTQnLCAvLyDlsbHopb9cbiAgICAnMTUnLCAvLyDlhoXokpnlj6RcbiAgICAnMjEnLCAvLyDovr3lroFcbiAgICAnMjInLCAvLyDlkInmnpdcbiAgICAnMjMnLCAvLyDpu5HpvpnmsZ9cbiAgICAnMzEnLCAvLyDkuIrmtbdcbiAgICAnMzInLCAvLyDmsZ/oi49cbiAgICAnMzMnLCAvLyDmtZnmsZ9cbiAgICAnMzQnLCAvLyDlronlvr1cbiAgICAnMzUnLCAvLyDnpo/lu7pcbiAgICAnMzYnLCAvLyDmsZ/opb9cbiAgICAnMzcnLCAvLyDlsbHkuJxcbiAgICAnNDEnLCAvLyDmsrPljZdcbiAgICAnNDInLCAvLyDmuZbljJdcbiAgICAnNDMnLCAvLyDmuZbljZdcbiAgICAnNDQnLCAvLyDlub/kuJxcbiAgICAnNDUnLCAvLyDlub/opb9cbiAgICAnNDYnLCAvLyDmtbfljZdcbiAgICAnNTAnLCAvLyDph43luoZcbiAgICAnNTEnLCAvLyDlm5vlt51cbiAgICAnNTInLCAvLyDotLXlt55cbiAgICAnNTMnLCAvLyDkupHljZdcbiAgICAnNTQnLCAvLyDopb/ol49cbiAgICAnNjEnLCAvLyDpmZXopb9cbiAgICAnNjInLCAvLyDnlJjogoNcbiAgICAnNjMnLCAvLyDpnZLmtbdcbiAgICAnNjQnLCAvLyDlroHlpI9cbiAgICAnNjUnLCAvLyDmlrDnloZcbiAgICAnNzEnLCAvLyDlj7Dmub5cbiAgICAnODEnLCAvLyDpppnmuK9cbiAgICAnODInLCAvLyDmvrPpl6hcbiAgICAnOTEnIC8vIOWbveWkllxuICAgIF07XG4gICAgdmFyIHBvd2VycyA9IFsnNycsICc5JywgJzEwJywgJzUnLCAnOCcsICc0JywgJzInLCAnMScsICc2JywgJzMnLCAnNycsICc5JywgJzEwJywgJzUnLCAnOCcsICc0JywgJzInXTtcbiAgICB2YXIgcGFyaXR5Qml0ID0gWycxJywgJzAnLCAnWCcsICc5JywgJzgnLCAnNycsICc2JywgJzUnLCAnNCcsICczJywgJzInXTtcblxuICAgIHZhciBjaGVja0FkZHJlc3NDb2RlID0gZnVuY3Rpb24gY2hlY2tBZGRyZXNzQ29kZShhZGRyZXNzQ29kZSkge1xuICAgICAgcmV0dXJuIHByb3ZpbmNlc0FuZENpdGllcy5pbmNsdWRlcyhhZGRyZXNzQ29kZSk7XG4gICAgfTtcblxuICAgIHZhciBjaGVja0JpcnRoRGF5Q29kZSA9IGZ1bmN0aW9uIGNoZWNrQmlydGhEYXlDb2RlKGJpckRheUNvZGUpIHtcbiAgICAgIHZhciB5eXl5ID0gcGFyc2VJbnQoYmlyRGF5Q29kZS5zdWJzdHJpbmcoMCwgNCksIDEwKTtcbiAgICAgIHZhciBtbSA9IHBhcnNlSW50KGJpckRheUNvZGUuc3Vic3RyaW5nKDQsIDYpLCAxMCk7XG4gICAgICB2YXIgZGQgPSBwYXJzZUludChiaXJEYXlDb2RlLnN1YnN0cmluZyg2KSwgMTApO1xuICAgICAgdmFyIHhkYXRhID0gbmV3IERhdGUoeXl5eSwgbW0gLSAxLCBkZCk7XG5cbiAgICAgIGlmICh4ZGF0YSA+IG5ldyBEYXRlKCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbWF4LWxlblxuICAgICAgfSBlbHNlIGlmICh4ZGF0YS5nZXRGdWxsWWVhcigpID09PSB5eXl5ICYmIHhkYXRhLmdldE1vbnRoKCkgPT09IG1tIC0gMSAmJiB4ZGF0YS5nZXREYXRlKCkgPT09IGRkKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIHZhciBnZXRQYXJpdHlCaXQgPSBmdW5jdGlvbiBnZXRQYXJpdHlCaXQoaWRDYXJkTm8pIHtcbiAgICAgIHZhciBpZDE3ID0gaWRDYXJkTm8uc3Vic3RyaW5nKDAsIDE3KTtcbiAgICAgIHZhciBwb3dlciA9IDA7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTc7IGkrKykge1xuICAgICAgICBwb3dlciArPSBwYXJzZUludChpZDE3LmNoYXJBdChpKSwgMTApICogcGFyc2VJbnQocG93ZXJzW2ldLCAxMCk7XG4gICAgICB9XG5cbiAgICAgIHZhciBtb2QgPSBwb3dlciAlIDExO1xuICAgICAgcmV0dXJuIHBhcml0eUJpdFttb2RdO1xuICAgIH07XG5cbiAgICB2YXIgY2hlY2tQYXJpdHlCaXQgPSBmdW5jdGlvbiBjaGVja1Bhcml0eUJpdChpZENhcmRObykge1xuICAgICAgcmV0dXJuIGdldFBhcml0eUJpdChpZENhcmRObykgPT09IGlkQ2FyZE5vLmNoYXJBdCgxNykudG9VcHBlckNhc2UoKTtcbiAgICB9O1xuXG4gICAgdmFyIGNoZWNrMTVJZENhcmRObyA9IGZ1bmN0aW9uIGNoZWNrMTVJZENhcmRObyhpZENhcmRObykge1xuICAgICAgdmFyIGNoZWNrID0gL15bMS05XVxcZHs3fSgoMFsxLTldKXwoMVswLTJdKSkoKDBbMS05XSl8KFsxLTJdWzAtOV0pfCgzWzAtMV0pKVxcZHszfSQvLnRlc3QoaWRDYXJkTm8pO1xuICAgICAgaWYgKCFjaGVjaykgcmV0dXJuIGZhbHNlO1xuICAgICAgdmFyIGFkZHJlc3NDb2RlID0gaWRDYXJkTm8uc3Vic3RyaW5nKDAsIDIpO1xuICAgICAgY2hlY2sgPSBjaGVja0FkZHJlc3NDb2RlKGFkZHJlc3NDb2RlKTtcbiAgICAgIGlmICghY2hlY2spIHJldHVybiBmYWxzZTtcbiAgICAgIHZhciBiaXJEYXlDb2RlID0gXCIxOVwiLmNvbmNhdChpZENhcmROby5zdWJzdHJpbmcoNiwgMTIpKTtcbiAgICAgIGNoZWNrID0gY2hlY2tCaXJ0aERheUNvZGUoYmlyRGF5Q29kZSk7XG4gICAgICBpZiAoIWNoZWNrKSByZXR1cm4gZmFsc2U7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgdmFyIGNoZWNrMThJZENhcmRObyA9IGZ1bmN0aW9uIGNoZWNrMThJZENhcmRObyhpZENhcmRObykge1xuICAgICAgdmFyIGNoZWNrID0gL15bMS05XVxcZHs1fVsxLTldXFxkezN9KCgwWzEtOV0pfCgxWzAtMl0pKSgoMFsxLTldKXwoWzEtMl1bMC05XSl8KDNbMC0xXSkpXFxkezN9KFxcZHx4fFgpJC8udGVzdChpZENhcmRObyk7XG4gICAgICBpZiAoIWNoZWNrKSByZXR1cm4gZmFsc2U7XG4gICAgICB2YXIgYWRkcmVzc0NvZGUgPSBpZENhcmROby5zdWJzdHJpbmcoMCwgMik7XG4gICAgICBjaGVjayA9IGNoZWNrQWRkcmVzc0NvZGUoYWRkcmVzc0NvZGUpO1xuICAgICAgaWYgKCFjaGVjaykgcmV0dXJuIGZhbHNlO1xuICAgICAgdmFyIGJpckRheUNvZGUgPSBpZENhcmROby5zdWJzdHJpbmcoNiwgMTQpO1xuICAgICAgY2hlY2sgPSBjaGVja0JpcnRoRGF5Q29kZShiaXJEYXlDb2RlKTtcbiAgICAgIGlmICghY2hlY2spIHJldHVybiBmYWxzZTtcbiAgICAgIHJldHVybiBjaGVja1Bhcml0eUJpdChpZENhcmRObyk7XG4gICAgfTtcblxuICAgIHZhciBjaGVja0lkQ2FyZE5vID0gZnVuY3Rpb24gY2hlY2tJZENhcmRObyhpZENhcmRObykge1xuICAgICAgdmFyIGNoZWNrID0gL15cXGR7MTV9fChcXGR7MTd9KFxcZHx4fFgpKSQvLnRlc3QoaWRDYXJkTm8pO1xuICAgICAgaWYgKCFjaGVjaykgcmV0dXJuIGZhbHNlO1xuXG4gICAgICBpZiAoaWRDYXJkTm8ubGVuZ3RoID09PSAxNSkge1xuICAgICAgICByZXR1cm4gY2hlY2sxNUlkQ2FyZE5vKGlkQ2FyZE5vKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNoZWNrMThJZENhcmRObyhpZENhcmRObyk7XG4gICAgfTtcblxuICAgIHJldHVybiBjaGVja0lkQ2FyZE5vKHN0cik7XG4gIH0sXG4gICd6aC1UVyc6IGZ1bmN0aW9uIHpoVFcoc3RyKSB7XG4gICAgdmFyIEFMUEhBQkVUX0NPREVTID0ge1xuICAgICAgQTogMTAsXG4gICAgICBCOiAxMSxcbiAgICAgIEM6IDEyLFxuICAgICAgRDogMTMsXG4gICAgICBFOiAxNCxcbiAgICAgIEY6IDE1LFxuICAgICAgRzogMTYsXG4gICAgICBIOiAxNyxcbiAgICAgIEk6IDM0LFxuICAgICAgSjogMTgsXG4gICAgICBLOiAxOSxcbiAgICAgIEw6IDIwLFxuICAgICAgTTogMjEsXG4gICAgICBOOiAyMixcbiAgICAgIE86IDM1LFxuICAgICAgUDogMjMsXG4gICAgICBROiAyNCxcbiAgICAgIFI6IDI1LFxuICAgICAgUzogMjYsXG4gICAgICBUOiAyNyxcbiAgICAgIFU6IDI4LFxuICAgICAgVjogMjksXG4gICAgICBXOiAzMixcbiAgICAgIFg6IDMwLFxuICAgICAgWTogMzEsXG4gICAgICBaOiAzM1xuICAgIH07XG4gICAgdmFyIHNhbml0aXplZCA9IHN0ci50cmltKCkudG9VcHBlckNhc2UoKTtcbiAgICBpZiAoIS9eW0EtWl1bMC05XXs5fSQvLnRlc3Qoc2FuaXRpemVkKSkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiBBcnJheS5mcm9tKHNhbml0aXplZCkucmVkdWNlKGZ1bmN0aW9uIChzdW0sIG51bWJlciwgaW5kZXgpIHtcbiAgICAgIGlmIChpbmRleCA9PT0gMCkge1xuICAgICAgICB2YXIgY29kZSA9IEFMUEhBQkVUX0NPREVTW251bWJlcl07XG4gICAgICAgIHJldHVybiBjb2RlICUgMTAgKiA5ICsgTWF0aC5mbG9vcihjb2RlIC8gMTApO1xuICAgICAgfVxuXG4gICAgICBpZiAoaW5kZXggPT09IDkpIHtcbiAgICAgICAgcmV0dXJuICgxMCAtIHN1bSAlIDEwIC0gTnVtYmVyKG51bWJlcikpICUgMTAgPT09IDA7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzdW0gKyBOdW1iZXIobnVtYmVyKSAqICg5IC0gaW5kZXgpO1xuICAgIH0sIDApO1xuICB9XG59O1xuXG5mdW5jdGlvbiBpc0lkZW50aXR5Q2FyZChzdHIsIGxvY2FsZSkge1xuICAoMCwgX2Fzc2VydFN0cmluZy5kZWZhdWx0KShzdHIpO1xuXG4gIGlmIChsb2NhbGUgaW4gdmFsaWRhdG9ycykge1xuICAgIHJldHVybiB2YWxpZGF0b3JzW2xvY2FsZV0oc3RyKTtcbiAgfSBlbHNlIGlmIChsb2NhbGUgPT09ICdhbnknKSB7XG4gICAgZm9yICh2YXIga2V5IGluIHZhbGlkYXRvcnMpIHtcbiAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9nb3R3YXJsb3N0L2lzdGFuYnVsL2Jsb2IvbWFzdGVyL2lnbm9yaW5nLWNvZGUtZm9yLWNvdmVyYWdlLm1kI2lnbm9yaW5nLWNvZGUtZm9yLWNvdmVyYWdlLXB1cnBvc2VzXG4gICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgZWxzZVxuICAgICAgaWYgKHZhbGlkYXRvcnMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICB2YXIgdmFsaWRhdG9yID0gdmFsaWRhdG9yc1trZXldO1xuXG4gICAgICAgIGlmICh2YWxpZGF0b3Ioc3RyKSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBsb2NhbGUgJ1wiLmNvbmNhdChsb2NhbGUsIFwiJ1wiKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGlzSW47XG5cbnZhciBfYXNzZXJ0U3RyaW5nID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL2Fzc2VydFN0cmluZ1wiKSk7XG5cbnZhciBfdG9TdHJpbmcgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvdG9TdHJpbmdcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfdHlwZW9mKG9iaikgeyBcIkBiYWJlbC9oZWxwZXJzIC0gdHlwZW9mXCI7IGlmICh0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIikgeyBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH07IH0gZWxzZSB7IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTsgfSByZXR1cm4gX3R5cGVvZihvYmopOyB9XG5cbmZ1bmN0aW9uIGlzSW4oc3RyLCBvcHRpb25zKSB7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7XG4gIHZhciBpO1xuXG4gIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob3B0aW9ucykgPT09ICdbb2JqZWN0IEFycmF5XScpIHtcbiAgICB2YXIgYXJyYXkgPSBbXTtcblxuICAgIGZvciAoaSBpbiBvcHRpb25zKSB7XG4gICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vZ290d2FybG9zdC9pc3RhbmJ1bC9ibG9iL21hc3Rlci9pZ25vcmluZy1jb2RlLWZvci1jb3ZlcmFnZS5tZCNpZ25vcmluZy1jb2RlLWZvci1jb3ZlcmFnZS1wdXJwb3Nlc1xuICAgICAgLy8gaXN0YW5idWwgaWdub3JlIGVsc2VcbiAgICAgIGlmICh7fS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9wdGlvbnMsIGkpKSB7XG4gICAgICAgIGFycmF5W2ldID0gKDAsIF90b1N0cmluZy5kZWZhdWx0KShvcHRpb25zW2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYXJyYXkuaW5kZXhPZihzdHIpID49IDA7XG4gIH0gZWxzZSBpZiAoX3R5cGVvZihvcHRpb25zKSA9PT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShzdHIpO1xuICB9IGVsc2UgaWYgKG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMuaW5kZXhPZiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBvcHRpb25zLmluZGV4T2Yoc3RyKSA+PSAwO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBpc0ludDtcblxudmFyIF9hc3NlcnRTdHJpbmcgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvYXNzZXJ0U3RyaW5nXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIGludCA9IC9eKD86Wy0rXT8oPzowfFsxLTldWzAtOV0qKSkkLztcbnZhciBpbnRMZWFkaW5nWmVyb2VzID0gL15bLStdP1swLTldKyQvO1xuXG5mdW5jdGlvbiBpc0ludChzdHIsIG9wdGlvbnMpIHtcbiAgKDAsIF9hc3NlcnRTdHJpbmcuZGVmYXVsdCkoc3RyKTtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307IC8vIEdldCB0aGUgcmVnZXggdG8gdXNlIGZvciB0ZXN0aW5nLCBiYXNlZCBvbiB3aGV0aGVyXG4gIC8vIGxlYWRpbmcgemVyb2VzIGFyZSBhbGxvd2VkIG9yIG5vdC5cblxuICB2YXIgcmVnZXggPSBvcHRpb25zLmhhc093blByb3BlcnR5KCdhbGxvd19sZWFkaW5nX3plcm9lcycpICYmICFvcHRpb25zLmFsbG93X2xlYWRpbmdfemVyb2VzID8gaW50IDogaW50TGVhZGluZ1plcm9lczsgLy8gQ2hlY2sgbWluL21heC9sdC9ndFxuXG4gIHZhciBtaW5DaGVja1Bhc3NlZCA9ICFvcHRpb25zLmhhc093blByb3BlcnR5KCdtaW4nKSB8fCBzdHIgPj0gb3B0aW9ucy5taW47XG4gIHZhciBtYXhDaGVja1Bhc3NlZCA9ICFvcHRpb25zLmhhc093blByb3BlcnR5KCdtYXgnKSB8fCBzdHIgPD0gb3B0aW9ucy5tYXg7XG4gIHZhciBsdENoZWNrUGFzc2VkID0gIW9wdGlvbnMuaGFzT3duUHJvcGVydHkoJ2x0JykgfHwgc3RyIDwgb3B0aW9ucy5sdDtcbiAgdmFyIGd0Q2hlY2tQYXNzZWQgPSAhb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSgnZ3QnKSB8fCBzdHIgPiBvcHRpb25zLmd0O1xuICByZXR1cm4gcmVnZXgudGVzdChzdHIpICYmIG1pbkNoZWNrUGFzc2VkICYmIG1heENoZWNrUGFzc2VkICYmIGx0Q2hlY2tQYXNzZWQgJiYgZ3RDaGVja1Bhc3NlZDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzLmRlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gaXNKU09OO1xuXG52YXIgX2Fzc2VydFN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9hc3NlcnRTdHJpbmdcIikpO1xuXG52YXIgX21lcmdlID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL21lcmdlXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgXCJAYmFiZWwvaGVscGVycyAtIHR5cGVvZlwiOyBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIpIHsgX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9OyB9IGVsc2UgeyBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07IH0gcmV0dXJuIF90eXBlb2Yob2JqKTsgfVxuXG52YXIgZGVmYXVsdF9qc29uX29wdGlvbnMgPSB7XG4gIGFsbG93X3ByaW1pdGl2ZXM6IGZhbHNlXG59O1xuXG5mdW5jdGlvbiBpc0pTT04oc3RyLCBvcHRpb25zKSB7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7XG5cbiAgdHJ5IHtcbiAgICBvcHRpb25zID0gKDAsIF9tZXJnZS5kZWZhdWx0KShvcHRpb25zLCBkZWZhdWx0X2pzb25fb3B0aW9ucyk7XG4gICAgdmFyIHByaW1pdGl2ZXMgPSBbXTtcblxuICAgIGlmIChvcHRpb25zLmFsbG93X3ByaW1pdGl2ZXMpIHtcbiAgICAgIHByaW1pdGl2ZXMgPSBbbnVsbCwgZmFsc2UsIHRydWVdO1xuICAgIH1cblxuICAgIHZhciBvYmogPSBKU09OLnBhcnNlKHN0cik7XG4gICAgcmV0dXJuIHByaW1pdGl2ZXMuaW5jbHVkZXMob2JqKSB8fCAhIW9iaiAmJiBfdHlwZW9mKG9iaikgPT09ICdvYmplY3QnO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLyogaWdub3JlICovXG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGlzSldUO1xuXG52YXIgX2Fzc2VydFN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9hc3NlcnRTdHJpbmdcIikpO1xuXG52YXIgX2lzQmFzZSA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vaXNCYXNlNjRcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBpc0pXVChzdHIpIHtcbiAgKDAsIF9hc3NlcnRTdHJpbmcuZGVmYXVsdCkoc3RyKTtcbiAgdmFyIGRvdFNwbGl0ID0gc3RyLnNwbGl0KCcuJyk7XG4gIHZhciBsZW4gPSBkb3RTcGxpdC5sZW5ndGg7XG5cbiAgaWYgKGxlbiA+IDMgfHwgbGVuIDwgMikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiBkb3RTcGxpdC5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgY3VyckVsZW0pIHtcbiAgICByZXR1cm4gYWNjICYmICgwLCBfaXNCYXNlLmRlZmF1bHQpKGN1cnJFbGVtLCB7XG4gICAgICB1cmxTYWZlOiB0cnVlXG4gICAgfSk7XG4gIH0sIHRydWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBpc0xhdExvbmc7XG5cbnZhciBfYXNzZXJ0U3RyaW5nID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL2Fzc2VydFN0cmluZ1wiKSk7XG5cbnZhciBfbWVyZ2UgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvbWVyZ2VcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgbGF0ID0gL15cXCg/WystXT8oOTAoXFwuMCspP3xbMS04XT9cXGQoXFwuXFxkKyk/KSQvO1xudmFyIGxvbmcgPSAvXlxccz9bKy1dPygxODAoXFwuMCspP3wxWzAtN11cXGQoXFwuXFxkKyk/fFxcZHsxLDJ9KFxcLlxcZCspPylcXCk/JC87XG52YXIgbGF0RE1TID0gL14oKFsxLThdP1xcZClcXEQrKFsxLTVdP1xcZHw2MClcXEQrKFsxLTVdP1xcZHw2MCkoXFwuXFxkKyk/fDkwXFxEKzBcXEQrMClcXEQrW05TbnNdPyQvaTtcbnZhciBsb25nRE1TID0gL15cXHMqKFsxLTddP1xcZHsxLDJ9XFxEKyhbMS01XT9cXGR8NjApXFxEKyhbMS01XT9cXGR8NjApKFxcLlxcZCspP3wxODBcXEQrMFxcRCswKVxcRCtbRVdld10/JC9pO1xudmFyIGRlZmF1bHRMYXRMb25nT3B0aW9ucyA9IHtcbiAgY2hlY2tETVM6IGZhbHNlXG59O1xuXG5mdW5jdGlvbiBpc0xhdExvbmcoc3RyLCBvcHRpb25zKSB7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7XG4gIG9wdGlvbnMgPSAoMCwgX21lcmdlLmRlZmF1bHQpKG9wdGlvbnMsIGRlZmF1bHRMYXRMb25nT3B0aW9ucyk7XG4gIGlmICghc3RyLmluY2x1ZGVzKCcsJykpIHJldHVybiBmYWxzZTtcbiAgdmFyIHBhaXIgPSBzdHIuc3BsaXQoJywnKTtcbiAgaWYgKHBhaXJbMF0uc3RhcnRzV2l0aCgnKCcpICYmICFwYWlyWzFdLmVuZHNXaXRoKCcpJykgfHwgcGFpclsxXS5lbmRzV2l0aCgnKScpICYmICFwYWlyWzBdLnN0YXJ0c1dpdGgoJygnKSkgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChvcHRpb25zLmNoZWNrRE1TKSB7XG4gICAgcmV0dXJuIGxhdERNUy50ZXN0KHBhaXJbMF0pICYmIGxvbmdETVMudGVzdChwYWlyWzFdKTtcbiAgfVxuXG4gIHJldHVybiBsYXQudGVzdChwYWlyWzBdKSAmJiBsb25nLnRlc3QocGFpclsxXSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGlzTGVuZ3RoO1xuXG52YXIgX2Fzc2VydFN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9hc3NlcnRTdHJpbmdcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfdHlwZW9mKG9iaikgeyBcIkBiYWJlbC9oZWxwZXJzIC0gdHlwZW9mXCI7IGlmICh0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIikgeyBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH07IH0gZWxzZSB7IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTsgfSByZXR1cm4gX3R5cGVvZihvYmopOyB9XG5cbi8qIGVzbGludC1kaXNhYmxlIHByZWZlci1yZXN0LXBhcmFtcyAqL1xuZnVuY3Rpb24gaXNMZW5ndGgoc3RyLCBvcHRpb25zKSB7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7XG4gIHZhciBtaW47XG4gIHZhciBtYXg7XG5cbiAgaWYgKF90eXBlb2Yob3B0aW9ucykgPT09ICdvYmplY3QnKSB7XG4gICAgbWluID0gb3B0aW9ucy5taW4gfHwgMDtcbiAgICBtYXggPSBvcHRpb25zLm1heDtcbiAgfSBlbHNlIHtcbiAgICAvLyBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eTogaXNMZW5ndGgoc3RyLCBtaW4gWywgbWF4XSlcbiAgICBtaW4gPSBhcmd1bWVudHNbMV0gfHwgMDtcbiAgICBtYXggPSBhcmd1bWVudHNbMl07XG4gIH1cblxuICB2YXIgc3Vycm9nYXRlUGFpcnMgPSBzdHIubWF0Y2goL1tcXHVEODAwLVxcdURCRkZdW1xcdURDMDAtXFx1REZGRl0vZykgfHwgW107XG4gIHZhciBsZW4gPSBzdHIubGVuZ3RoIC0gc3Vycm9nYXRlUGFpcnMubGVuZ3RoO1xuICByZXR1cm4gbGVuID49IG1pbiAmJiAodHlwZW9mIG1heCA9PT0gJ3VuZGVmaW5lZCcgfHwgbGVuIDw9IG1heCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGlzTGljZW5zZVBsYXRlO1xuXG52YXIgX2Fzc2VydFN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9hc3NlcnRTdHJpbmdcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgdmFsaWRhdG9ycyA9IHtcbiAgJ2NzLUNaJzogZnVuY3Rpb24gY3NDWihzdHIpIHtcbiAgICByZXR1cm4gL14oKFtBQkNERUZIS0lKS0xNTlBSU1RVVlhZWl18WzAtOV0pLT8pezUsOH0kLy50ZXN0KHN0cik7XG4gIH0sXG4gICdkZS1ERSc6IGZ1bmN0aW9uIGRlREUoc3RyKSB7XG4gICAgcmV0dXJuIC9eKChBV3xVTHxBS3xHQXxBw5Z8TEZ8QVp8QU18QVN8WkV8QU58QUJ8QXxLR3xLSHxCQXxFV3xCWnxIWXxLTXxCVHxIUHxCfEJDfEJJfEJPfEZOfFRUfMOcQnxCTnxBSHxCU3xGUnxIQnxaWnxCQnxCS3xCw5Z8T0N8T0t8Q1d8Q0V8Q3xDT3xMSHxDQnxLV3xMQ3xMTnxEQXxESXxERXxESHxTWXxOw5Z8RE98RER8RFV8RE58RHxFSXxFQXxFRXxGSXxFTXxFTHxFTnxQRnxFRHxFRnxFUnxBVXxaUHxFfEVTfE5UfEVVfEZMfEZPfEZUfEZGfEZ8RlN8RkR8RsOcfEdFfEd8R0l8R0Z8R1N8WlJ8R0d8R1B8R1J8Tll8Wkl8R8OWfEdafEdUfEhBfEhIfEhNfEhVfFdMfEhafFdSfFJOfEhLfEhEfEhOfEhTfEdLfEhFfEhGfFJafEhJfEhHfEhPfEhYfElLfElMfElOfEp8Skx8S0x8S0F8S1N8S0Z8S0V8S0l8S1R8S098S058S1J8S0N8S1V8S3xMRHxMTHxMQXxMfE9QfExNfExJfExCfExVfEzDlnxITHxMR3xNRHxHTnxNWnxNQXxNTHxNUnxNWXxBVHxETXxNQ3xOWnxSTXxSR3xNTXxNRXxNQnxNSXxGR3xETHxIQ3xNV3xSTHxNS3xNR3xNw5x8V1N8TUh8TXxNU3xOVXxOQnxORHxOTXxOS3xOV3xOUnxOSXxORnxEWnxFQnxPWnxUR3xUT3xOfE9BfEdNfE9CfENBfEVIfEZXfE9GfE9MfE9FfE9HfEJIfExSfE9TfEFBfEdEfE9IfEtZfE5QfFdLfFBCfFBBfFBFfFBJfFBTfFB8UE18UFJ8UkF8UlZ8UkV8UnxIfFNCfFdOfFJTfFJEfFJUfEJNfE5FfEdWfFJQfFNVfEdMfFJPfEfDnHxSSHxFR3xSV3xQTnxTS3xNUXxSVXxTWnxSSXxTTHxTTXxTQ3xIUnxGWnxWU3xTV3xTTnxDUnxTRXxTSXxTT3xMUHxTR3xOSHxTUHxJWnxTVHxCRnxURXxIVnxPRHxTUnxTfEFDfERXfFpXfFRGfFRTfFRSfFTDnHxVTXxQWnxUUHxVRXxVTnxVSHxNTnxLS3xWQnxWfEFFfFBMfFJDfFZHfEdXfFBXfFZSfFZLfEtCfFdBfFdUfEJFfFdNfFdFfEFQfE1PfFdXfEZCfFdafFdJfFdCfEpFfFdGfFdPfFd8V8OcfEJMfFp8R0MpWy0gXT9bQS1aXXsxLDJ9Wy0gXT9cXGR7MSw0fXwoQUlDfEZEQnxBQkd8U0xOfFNBV3xLTFp8QlVMfEVTQnxOQUJ8U1VMfFdTVHxBQkl8QVpFfEJURnxLw5ZUfERLQnxGRVV8Uk9UfEFMWnxTTcOcfFdFUnxBVVJ8Tk9SfETDnFd8QlJLfEhBQnxUw5ZMfFdPUnxCQUR8QkFSfEJFUnxCSVd8RUJTfEtFTXxNw5xCfFBFR3xCR0x8QkdEfFJFSXxXSUx8QktTfEJJUnxXQVR8Qk9SfEJPSHxCT1R8QlJCfEJMS3xISE18TkVCfE5NQnxXU0Z8TEVPfEhETHxXTVN8V1pMfELDnFN8Q0hBfEvDllp8Uk9EfFfDnE18Q0xQfE5FQ3xDT0N8WkVMfENPRXxDVVh8REFIfExEU3xERUd8REVMfFJTTHxETEd8REdGfExBTnxIRUl8TUVEfERPTnxLSUJ8Uk9LfErDnEx8TU9OfFNMRXxFQkV8RUlDfEhJR3xXQlN8QklUfFBSw5x8TElCfEVNRHxXSVR8RVJIfEjDllN8RVJafEFOQXxBU1p8TUFCfE1FS3xTVEx8U1pCfEZEU3xIQ0h8SE9SfFdPTHxGUkd8R1JBfFdPU3xGUkl8RkZCfEdBUHxHRVJ8QlJMfENMWnxHVEh8Tk9IfEhHV3xHUlp8TMOWQnxOT0x8V1NXfERVRHxITcOcfE9IQXxLUlV8SEFMfEhBTXxIQlN8UUxCfEhWTHxOQVV8SEFTfEVCTnxHRU98SE9IfEhESHxFUkt8SEVSfFdBTnxIRUZ8Uk9GfEhCTnxBTEZ8SFNLfFVTSXxOQUl8UkVIfFNBTnxLw5xOfMOWSFJ8SE9MfFdBUnxBUk58QlJHfEdOVHxIT0d8V09IfEtFSHxNQUl8UEFSfFJJRHxST0x8S0xFfEdFTHxLVVN8S1lGfEFSVHxTREh8TERLfERJTHxNQUx8VklCfExFUnxCTkF8R0hBfEdSTXxNVEx8V1VSfExFVnxMSUZ8U1RFfFdFTHxMSVB8VkFJfExVUHxIR058TEJafExXTHxQQ0h8U1RCfERBTnxNS0t8U0zDnHxNU1B8VEJCfE1HSHxNVEt8QklOfE1TSHxFSUx8SEVUfFNHSHxCSUR8TVlLfE1TRXxNU1R8TcOcUnxXUk58TUVJfEdSSHxSSUV8TVpHfE1JTHxPQkJ8QkVEfEZMw5Z8TU9MfEZSV3xTRUV8U1JCfEFJQnxNT1N8QkNIfElMTHxTT0J8Tk1TfE5FQXxTRUZ8VUZGfE5FV3xWT0h8TkRIfFRET3xOV018R0RCfEdWTXxXSVN8Tk9NfEVJTnxHQU58TEFVfEhFQnxPSFZ8T1NMfFNGQnxFUkJ8TE9TfEJTS3xLRUx8QlNCfE1FTHxXVEx8T0FMfEbDnFN8TU9EfE9IWnxPUFJ8QsOcUnxQQUZ8UEzDlnxDQVN8R0xBfFJFR3xWSVR8RUNLfFNJTXxHT0F8RU1TfERJWnxHT0h8UsOcRHxTV0F8TkVTfEvDlk58TUVUfExST3xCw5xafERCUnxST1N8VEVUfEhST3xST1d8QlJWfEhJUHxQQU58R1JJfFNIS3xFSVN8U1JPfFNPS3xMQlN8U0NafE1FUnxRRlR8U0xGfFNMU3xIT018U0xLfEFTTHxCQkd8U0JLfFNGVHxTSEd8TUdOfE1FR3xaSUd8U0FEfE5FTnxPVkl8U0hBfEJMQnxTSUd8U09OfFNQTnxGT1J8R1VCfFNQQnxJR0J8V05EfFNURHxTVEF8U0RMfE9CR3xIU1R8Qk9HfFNITHxQSVJ8RlRMfFNFQnxTw5ZNfFPDnFd8VElSfFNBQnxUVVR8QU5HfFNEVHxMw5xOfExTWnxNSEx8VkVDfFZFUnxWSUV8T1ZMfEFOS3xPVlB8U0JHfFVFTXxVRVJ8V0xHfEdNTnxOVlB8UkRHfFLDnEd8REFVfEZLQnxXQUZ8V0FLfFNMWnxXRU58U09HfEFQRHxXVUd8R1VOfEVTV3xXSVp8V0VTfERJTnxCUkF8QsOcRHxXSFZ8SFdJfEdIQ3xXVE18V09CfFdVTnxNQUt8U0VMfE9DSHxIT1R8V0RBKVstIF0/KChbQS1aXVstIF0/XFxkezEsNH0pfChbQS1aXXsyfVstIF0/XFxkezEsM30pKSlbLSBdPyhFfEgpPyQvLnRlc3Qoc3RyKTtcbiAgfSxcbiAgJ2RlLUxJJzogZnVuY3Rpb24gZGVMSShzdHIpIHtcbiAgICByZXR1cm4gL15GTFstIF0/XFxkezEsNX1bVVpdPyQvLnRlc3Qoc3RyKTtcbiAgfSxcbiAgJ2ZpLUZJJzogZnVuY3Rpb24gZmlGSShzdHIpIHtcbiAgICByZXR1cm4gL14oPz0uezQsN30pKChbQS1aXXsxLDN9fFswLTldezEsM30pW1xccy1dPyhbQS1aXXsxLDN9fFswLTldezEsNX0pKSQvLnRlc3Qoc3RyKTtcbiAgfSxcbiAgJ3B0LVBUJzogZnVuY3Rpb24gcHRQVChzdHIpIHtcbiAgICByZXR1cm4gL14oW0EtWl17Mn18WzAtOV17Mn0pWyAtwrddPyhbQS1aXXsyfXxbMC05XXsyfSlbIC3Ct10/KFtBLVpdezJ9fFswLTldezJ9KSQvLnRlc3Qoc3RyKTtcbiAgfSxcbiAgJ3NxLUFMJzogZnVuY3Rpb24gc3FBTChzdHIpIHtcbiAgICByZXR1cm4gL15bQS1aXXsyfVstIF0/KChcXGR7M31bLSBdPygoW0EtWl17Mn0pfFQpKXwoUlstIF0/XFxkezN9KSkkLy50ZXN0KHN0cik7XG4gIH0sXG4gICdwdC1CUic6IGZ1bmN0aW9uIHB0QlIoc3RyKSB7XG4gICAgcmV0dXJuIC9eW0EtWl17M31bIC1dP1swLTldW0EtWl1bMC05XXsyfXxbQS1aXXszfVsgLV0/WzAtOV17NH0kLy50ZXN0KHN0cik7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGlzTGljZW5zZVBsYXRlKHN0ciwgbG9jYWxlKSB7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7XG5cbiAgaWYgKGxvY2FsZSBpbiB2YWxpZGF0b3JzKSB7XG4gICAgcmV0dXJuIHZhbGlkYXRvcnNbbG9jYWxlXShzdHIpO1xuICB9IGVsc2UgaWYgKGxvY2FsZSA9PT0gJ2FueScpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gdmFsaWRhdG9ycykge1xuICAgICAgLyogZXNsaW50IGd1YXJkLWZvci1pbjogMCAqL1xuICAgICAgdmFyIHZhbGlkYXRvciA9IHZhbGlkYXRvcnNba2V5XTtcblxuICAgICAgaWYgKHZhbGlkYXRvcihzdHIpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgbG9jYWxlICdcIi5jb25jYXQobG9jYWxlLCBcIidcIikpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBpc0xvY2FsZTtcblxudmFyIF9hc3NlcnRTdHJpbmcgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvYXNzZXJ0U3RyaW5nXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIGxvY2FsZVJlZyA9IC9eW0EtWmEtel17Miw0fShbXy1dKFtBLVphLXpdezR9fFtcXGRdezN9KSk/KFtfLV0oW0EtWmEtel17Mn18W1xcZF17M30pKT8kLztcblxuZnVuY3Rpb24gaXNMb2NhbGUoc3RyKSB7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7XG5cbiAgaWYgKHN0ciA9PT0gJ2VuX1VTX1BPU0lYJyB8fCBzdHIgPT09ICdjYV9FU19WQUxFTkNJQScpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBsb2NhbGVSZWcudGVzdChzdHIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBpc0xvd2VyY2FzZTtcblxudmFyIF9hc3NlcnRTdHJpbmcgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvYXNzZXJ0U3RyaW5nXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gaXNMb3dlcmNhc2Uoc3RyKSB7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7XG4gIHJldHVybiBzdHIgPT09IHN0ci50b0xvd2VyQ2FzZSgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBpc01BQ0FkZHJlc3M7XG5cbnZhciBfYXNzZXJ0U3RyaW5nID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL2Fzc2VydFN0cmluZ1wiKSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBtYWNBZGRyZXNzID0gL14oPzpbMC05YS1mQS1GXXsyfShbLTpcXHNdKSkoWzAtOWEtZkEtRl17Mn1cXDEpezR9KFswLTlhLWZBLUZdezJ9KSQvO1xudmFyIG1hY0FkZHJlc3NOb1NlcGFyYXRvcnMgPSAvXihbMC05YS1mQS1GXSl7MTJ9JC87XG52YXIgbWFjQWRkcmVzc1dpdGhEb3RzID0gL14oWzAtOWEtZkEtRl17NH1cXC4pezJ9KFswLTlhLWZBLUZdezR9KSQvO1xuXG5mdW5jdGlvbiBpc01BQ0FkZHJlc3Moc3RyLCBvcHRpb25zKSB7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7XG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZCBgbm9fY29sb25zYCBUT0RPOiByZW1vdmUgaXQgaW4gdGhlIG5leHQgbWFqb3JcbiAgKi9cblxuICBpZiAob3B0aW9ucyAmJiAob3B0aW9ucy5ub19jb2xvbnMgfHwgb3B0aW9ucy5ub19zZXBhcmF0b3JzKSkge1xuICAgIHJldHVybiBtYWNBZGRyZXNzTm9TZXBhcmF0b3JzLnRlc3Qoc3RyKTtcbiAgfVxuXG4gIHJldHVybiBtYWNBZGRyZXNzLnRlc3Qoc3RyKSB8fCBtYWNBZGRyZXNzV2l0aERvdHMudGVzdChzdHIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBpc01ENTtcblxudmFyIF9hc3NlcnRTdHJpbmcgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvYXNzZXJ0U3RyaW5nXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIG1kNSA9IC9eW2EtZjAtOV17MzJ9JC87XG5cbmZ1bmN0aW9uIGlzTUQ1KHN0cikge1xuICAoMCwgX2Fzc2VydFN0cmluZy5kZWZhdWx0KShzdHIpO1xuICByZXR1cm4gbWQ1LnRlc3Qoc3RyKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzLmRlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gaXNNYWduZXRVUkk7XG5cbnZhciBfYXNzZXJ0U3RyaW5nID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL2Fzc2VydFN0cmluZ1wiKSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBtYWduZXRVUkkgPSAvXm1hZ25ldDpcXD94dCg/OlxcLjEpPz11cm46KD86YWljaHxiaXRwcmludHxidGlofGVkMmt8ZWQya2hhc2h8a3poYXNofG1kNXxzaGExfHRyZWU6dGlnZXIpOlthLXowLTldezMyfSg/OlthLXowLTldezh9KT8oJHwmKS9pO1xuXG5mdW5jdGlvbiBpc01hZ25ldFVSSSh1cmwpIHtcbiAgKDAsIF9hc3NlcnRTdHJpbmcuZGVmYXVsdCkodXJsKTtcbiAgcmV0dXJuIG1hZ25ldFVSSS50ZXN0KHVybC50cmltKCkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBpc01pbWVUeXBlO1xuXG52YXIgX2Fzc2VydFN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9hc3NlcnRTdHJpbmdcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG4vKlxuICBDaGVja3MgaWYgdGhlIHByb3ZpZGVkIHN0cmluZyBtYXRjaGVzIHRvIGEgY29ycmVjdCBNZWRpYSB0eXBlIGZvcm1hdCAoTUlNRSB0eXBlKVxuXG4gIFRoaXMgZnVuY3Rpb24gb25seSBjaGVja3MgaXMgdGhlIHN0cmluZyBmb3JtYXQgZm9sbG93cyB0aGVcbiAgZXRhYmxpc2hlZCBydWxlcyBieSB0aGUgYWNjb3JkaW5nIFJGQyBzcGVjaWZpY2F0aW9ucy5cbiAgVGhpcyBmdW5jdGlvbiBzdXBwb3J0cyAnY2hhcnNldCcgaW4gdGV4dHVhbCBtZWRpYSB0eXBlc1xuICAoaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzY2NTcpLlxuXG4gIFRoaXMgZnVuY3Rpb24gZG9lcyBub3QgY2hlY2sgYWdhaW5zdCBhbGwgdGhlIG1lZGlhIHR5cGVzIGxpc3RlZFxuICBieSB0aGUgSUFOQSAoaHR0cHM6Ly93d3cuaWFuYS5vcmcvYXNzaWdubWVudHMvbWVkaWEtdHlwZXMvbWVkaWEtdHlwZXMueGh0bWwpXG4gIGJlY2F1c2Ugb2YgbGlnaHRuZXNzIHB1cnBvc2VzIDogaXQgd291bGQgcmVxdWlyZSB0byBpbmNsdWRlXG4gIGFsbCB0aGVzZSBNSU1FIHR5cGVzIGluIHRoaXMgbGlicmFpcnksIHdoaWNoIHdvdWxkIHdlaWdoIGl0XG4gIHNpZ25pZmljYW50bHkuIFRoaXMga2luZCBvZiBlZmZvcnQgbWF5YmUgaXMgbm90IHdvcnRoIGZvciB0aGUgdXNlIHRoYXRcbiAgdGhpcyBmdW5jdGlvbiBoYXMgaW4gdGhpcyBlbnRpcmUgbGlicmFpcnkuXG5cbiAgTW9yZSBpbmZvcm1hdGlvbnMgaW4gdGhlIFJGQyBzcGVjaWZpY2F0aW9ucyA6XG4gIC0gaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzIwNDVcbiAgLSBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMjA0NlxuICAtIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmM3MjMxI3NlY3Rpb24tMy4xLjEuMVxuICAtIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmM3MjMxI3NlY3Rpb24tMy4xLjEuNVxuKi9cbi8vIE1hdGNoIHNpbXBsZSBNSU1FIHR5cGVzXG4vLyBOQiA6XG4vLyAgIFN1YnR5cGUgbGVuZ3RoIG11c3Qgbm90IGV4Y2VlZCAxMDAgY2hhcmFjdGVycy5cbi8vICAgVGhpcyBydWxlIGRvZXMgbm90IGNvbXBseSB0byB0aGUgUkZDIHNwZWNzICh3aGF0IGlzIHRoZSBtYXggbGVuZ3RoID8pLlxudmFyIG1pbWVUeXBlU2ltcGxlID0gL14oYXBwbGljYXRpb258YXVkaW98Zm9udHxpbWFnZXxtZXNzYWdlfG1vZGVsfG11bHRpcGFydHx0ZXh0fHZpZGVvKVxcL1thLXpBLVowLTlcXC5cXC1cXCtdezEsMTAwfSQvaTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBtYXgtbGVuXG4vLyBIYW5kbGUgXCJjaGFyc2V0XCIgaW4gXCJ0ZXh0LypcIlxuXG52YXIgbWltZVR5cGVUZXh0ID0gL150ZXh0XFwvW2EtekEtWjAtOVxcLlxcLVxcK117MSwxMDB9O1xccz9jaGFyc2V0PShcIlthLXpBLVowLTlcXC5cXC1cXCtcXHNdezAsNzB9XCJ8W2EtekEtWjAtOVxcLlxcLVxcK117MCw3MH0pKFxccz9cXChbYS16QS1aMC05XFwuXFwtXFwrXFxzXXsxLDIwfVxcKSk/JC9pOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG1heC1sZW5cbi8vIEhhbmRsZSBcImJvdW5kYXJ5XCIgaW4gXCJtdWx0aXBhcnQvKlwiXG5cbnZhciBtaW1lVHlwZU11bHRpcGFydCA9IC9ebXVsdGlwYXJ0XFwvW2EtekEtWjAtOVxcLlxcLVxcK117MSwxMDB9KDtcXHM/KGJvdW5kYXJ5fGNoYXJzZXQpPShcIlthLXpBLVowLTlcXC5cXC1cXCtcXHNdezAsNzB9XCJ8W2EtekEtWjAtOVxcLlxcLVxcK117MCw3MH0pKFxccz9cXChbYS16QS1aMC05XFwuXFwtXFwrXFxzXXsxLDIwfVxcKSk/KXswLDJ9JC9pOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG1heC1sZW5cblxuZnVuY3Rpb24gaXNNaW1lVHlwZShzdHIpIHtcbiAgKDAsIF9hc3NlcnRTdHJpbmcuZGVmYXVsdCkoc3RyKTtcbiAgcmV0dXJuIG1pbWVUeXBlU2ltcGxlLnRlc3Qoc3RyKSB8fCBtaW1lVHlwZVRleHQudGVzdChzdHIpIHx8IG1pbWVUeXBlTXVsdGlwYXJ0LnRlc3Qoc3RyKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzLmRlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gaXNNb2JpbGVQaG9uZTtcbmV4cG9ydHMubG9jYWxlcyA9IHZvaWQgMDtcblxudmFyIF9hc3NlcnRTdHJpbmcgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvYXNzZXJ0U3RyaW5nXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuLyogZXNsaW50LWRpc2FibGUgbWF4LWxlbiAqL1xudmFyIHBob25lcyA9IHtcbiAgJ2FtLUFNJzogL14oXFwrPzM3NHwwKSgoMTB8Wzl8N11bMC05XSlcXGR7Nn0kfFsyLTRdXFxkezd9JCkvLFxuICAnYXItQUUnOiAvXigoXFwrPzk3MSl8MCk/NVswMjQ1NjhdXFxkezd9JC8sXG4gICdhci1CSCc6IC9eKFxcKz85NzMpPygzfDYpXFxkezd9JC8sXG4gICdhci1EWic6IC9eKFxcKz8yMTN8MCkoNXw2fDcpXFxkezh9JC8sXG4gICdhci1MQic6IC9eKFxcKz85NjEpPygoM3w4MSlcXGR7Nn18N1xcZHs3fSkkLyxcbiAgJ2FyLUVHJzogL14oKFxcKz8yMCl8MCk/MVswMTI1XVxcZHs4fSQvLFxuICAnYXItSVEnOiAvXihcXCs/OTY0fDApPzdbMC05XVxcZHs4fSQvLFxuICAnYXItSk8nOiAvXihcXCs/OTYyfDApPzdbNzg5XVxcZHs3fSQvLFxuICAnYXItS1cnOiAvXihcXCs/OTY1KVs1NjldXFxkezd9JC8sXG4gICdhci1MWSc6IC9eKChcXCs/MjE4KXwwKT8oOVsxLTZdXFxkezd9fFsxLThdXFxkezcsOX0pJC8sXG4gICdhci1NQSc6IC9eKD86KD86XFwrfDAwKTIxMnwwKVs1LTddXFxkezh9JC8sXG4gICdhci1PTSc6IC9eKChcXCt8MDApOTY4KT8oOVsxLTldKVxcZHs2fSQvLFxuICAnYXItUFMnOiAvXihcXCs/OTcwfDApNVs2fDldKFxcZHs3fSkkLyxcbiAgJ2FyLVNBJzogL14oIT8oXFwrPzk2Nil8MCk/NVxcZHs4fSQvLFxuICAnYXItU1knOiAvXighPyhcXCs/OTYzKXwwKT85XFxkezh9JC8sXG4gICdhci1UTic6IC9eKFxcKz8yMTYpP1syNDU5XVxcZHs3fSQvLFxuICAnYXotQVonOiAvXihcXCs5OTR8MCkoNVswMTVdfDdbMDddfDk5KVxcZHs3fSQvLFxuICAnYnMtQkEnOiAvXigoKChcXCt8MDApMzg3Nil8MDYpKSgoKFswLTNdfFs1LTZdKVxcZHs2fSl8KDRcXGR7N30pKSQvLFxuICAnYmUtQlknOiAvXihcXCs/Mzc1KT8oMjR8MjV8Mjl8MzN8NDQpXFxkezd9JC8sXG4gICdiZy1CRyc6IC9eKFxcKz8zNTl8MCk/OFs3ODldXFxkezd9JC8sXG4gICdibi1CRCc6IC9eKFxcKz84ODB8MCkxWzEzNDU2Nzg5XVswLTldezh9JC8sXG4gICdjYS1BRCc6IC9eKFxcKzM3Nik/WzM0Nl1cXGR7NX0kLyxcbiAgJ2NzLUNaJzogL14oXFwrPzQyMCk/ID9bMS05XVswLTldezJ9ID9bMC05XXszfSA/WzAtOV17M30kLyxcbiAgJ2RhLURLJzogL14oXFwrPzQ1KT9cXHM/XFxkezJ9XFxzP1xcZHsyfVxccz9cXGR7Mn1cXHM/XFxkezJ9JC8sXG4gICdkZS1ERSc6IC9eKChcXCs0OXwwKVsxfDNdKShbMHw1XVswLTQ1LTldXFxkfDYoWzIzXXwwXFxkPyl8NyhbMC01Ny05XXw2XFxkKSlcXGR7Nyw5fSQvLFxuICAnZGUtQVQnOiAvXihcXCs0M3wwKVxcZHsxLDR9XFxkezMsMTJ9JC8sXG4gICdkZS1DSCc6IC9eKFxcKzQxfDApKFsxLTldKVxcZHsxLDl9JC8sXG4gICdkZS1MVSc6IC9eKFxcKzM1Mik/KCg2XFxkMSlcXGR7Nn0pJC8sXG4gICdkdi1NVic6IC9eKFxcKz85NjApPyg3WzItOV18OTF8OVszLTldKVxcZHs3fSQvLFxuICAnZWwtR1InOiAvXihcXCs/MzB8MCk/KDY5XFxkezh9KSQvLFxuICAnZW4tQVUnOiAvXihcXCs/NjF8MCk0XFxkezh9JC8sXG4gICdlbi1CTSc6IC9eKFxcKz8xKT80NDEoKCgzfDcpXFxkezZ9JCl8KDVbMC0zXVswLTldXFxkezR9JCl8KDU5XFxkezV9KSkvLFxuICAnZW4tR0InOiAvXihcXCs/NDR8MCk3XFxkezl9JC8sXG4gICdlbi1HRyc6IC9eKFxcKz80NHwwKTE0ODFcXGR7Nn0kLyxcbiAgJ2VuLUdIJzogL14oXFwrMjMzfDApKDIwfDUwfDI0fDU0fDI3fDU3fDI2fDU2fDIzfDI4fDU1fDU5KVxcZHs3fSQvLFxuICAnZW4tR1knOiAvXihcXCs1OTJ8MCk2XFxkezZ9JC8sXG4gICdlbi1ISyc6IC9eKFxcKz84NTJbLVxcc10/KT9bNDU2Nzg5XVxcZHszfVstXFxzXT9cXGR7NH0kLyxcbiAgJ2VuLU1PJzogL14oXFwrPzg1M1stXFxzXT8pP1s2XVxcZHszfVstXFxzXT9cXGR7NH0kLyxcbiAgJ2VuLUlFJzogL14oXFwrPzM1M3wwKThbMzU2Nzg5XVxcZHs3fSQvLFxuICAnZW4tSU4nOiAvXihcXCs/OTF8MCk/WzY3ODldXFxkezl9JC8sXG4gICdlbi1LRSc6IC9eKFxcKz8yNTR8MCkoN3wxKVxcZHs4fSQvLFxuICAnZW4tS0knOiAvXigoXFwrNjg2fDY4Nik/KT8oICk/KCg2fDcpKDJ8M3w4KVswLTldezZ9KSQvLFxuICAnZW4tTVQnOiAvXihcXCs/MzU2fDApPyg5OXw3OXw3N3wyMXwyN3wyMnwyNSlbMC05XXs2fSQvLFxuICAnZW4tTVUnOiAvXihcXCs/MjMwfDApP1xcZHs4fSQvLFxuICAnZW4tTkEnOiAvXihcXCs/MjY0fDApKDZ8OClcXGR7N30kLyxcbiAgJ2VuLU5HJzogL14oXFwrPzIzNHwwKT9bNzg5XVxcZHs5fSQvLFxuICAnZW4tTlonOiAvXihcXCs/NjR8MClbMjhdXFxkezcsOX0kLyxcbiAgJ2VuLVBLJzogL14oKDAwfFxcKyk/OTJ8MCkzWzAtNl1cXGR7OH0kLyxcbiAgJ2VuLVBIJzogL14oMDl8XFwrNjM5KVxcZHs5fSQvLFxuICAnZW4tUlcnOiAvXihcXCs/MjUwfDApP1s3XVxcZHs4fSQvLFxuICAnZW4tU0cnOiAvXihcXCs2NSk/WzM2ODldXFxkezd9JC8sXG4gICdlbi1TTCc6IC9eKFxcKz8yMzJ8MClcXGR7OH0kLyxcbiAgJ2VuLVRaJzogL14oXFwrPzI1NXwwKT9bNjddXFxkezh9JC8sXG4gICdlbi1VRyc6IC9eKFxcKz8yNTZ8MCk/WzddXFxkezh9JC8sXG4gICdlbi1VUyc6IC9eKChcXCsxfDEpPyggfC0pPyk/KFxcKFsyLTldWzAtOV17Mn1cXCl8WzItOV1bMC05XXsyfSkoIHwtKT8oWzItOV1bMC05XXsyfSggfC0pP1swLTldezR9KSQvLFxuICAnZW4tWkEnOiAvXihcXCs/Mjd8MClcXGR7OX0kLyxcbiAgJ2VuLVpNJzogL14oXFwrPzI2KT8wOVs1NjddXFxkezd9JC8sXG4gICdlbi1aVyc6IC9eKFxcKzI2MylbMC05XXs5fSQvLFxuICAnZW4tQlcnOiAvXihcXCs/MjY3KT8oN1sxLThdezF9KVxcZHs2fSQvLFxuICAnZXMtQVInOiAvXlxcKz81NDkoMTF8WzIzNjhdXFxkKVxcZHs4fSQvLFxuICAnZXMtQk8nOiAvXihcXCs/NTkxKT8oNnw3KVxcZHs3fSQvLFxuICAnZXMtQ08nOiAvXihcXCs/NTcpPzMoMCgwfDF8Mnw0fDUpfDFcXGR8MlswLTRdfDUoMHwxKSlcXGR7N30kLyxcbiAgJ2VzLUNMJzogL14oXFwrPzU2fDApWzItOV1cXGR7MX1cXGR7N30kLyxcbiAgJ2VzLUNSJzogL14oXFwrNTA2KT9bMi04XVxcZHs3fSQvLFxuICAnZXMtQ1UnOiAvXihcXCs1M3wwMDUzKT81XFxkezd9LyxcbiAgJ2VzLURPJzogL14oXFwrPzEpPzhbMDI0XTlcXGR7N30kLyxcbiAgJ2VzLUhOJzogL14oXFwrPzUwNCk/Wzl8OF1cXGR7N30kLyxcbiAgJ2VzLUVDJzogL14oXFwrPzU5M3wwKShbMi03XXw5WzItOV0pXFxkezd9JC8sXG4gICdlcy1FUyc6IC9eKFxcKz8zNCk/WzZ8N11cXGR7OH0kLyxcbiAgJ2VzLVBFJzogL14oXFwrPzUxKT85XFxkezh9JC8sXG4gICdlcy1NWCc6IC9eKFxcKz81Mik/KDF8MDEpP1xcZHsxMCwxMX0kLyxcbiAgJ2VzLVBBJzogL14oXFwrPzUwNylcXGR7Nyw4fSQvLFxuICAnZXMtUFknOiAvXihcXCs/NTk1fDApOVs5ODc2XVxcZHs3fSQvLFxuICAnZXMtU1YnOiAvXihcXCs/NTAzKT9bNjddXFxkezd9JC8sXG4gICdlcy1VWSc6IC9eKFxcKzU5OHwwKTlbMS05XVtcXGRdezZ9JC8sXG4gICdlcy1WRSc6IC9eKFxcKz81OCk/KDJ8NClcXGR7OX0kLyxcbiAgJ2V0LUVFJzogL14oXFwrPzM3Mik/XFxzPyg1fDhbMS00XSlcXHM/KFswLTldXFxzPyl7Niw3fSQvLFxuICAnZmEtSVInOiAvXihcXCs/OThbXFwtXFxzXT98MCk5WzAtMzldXFxkW1xcLVxcc10/XFxkezN9W1xcLVxcc10/XFxkezR9JC8sXG4gICdmaS1GSSc6IC9eKFxcKz8zNTh8MClcXHM/KDQoMHwxfDJ8NHw1fDYpP3w1MClcXHM/KFxcZFxccz8pezQsOH1cXGQkLyxcbiAgJ2ZqLUZKJzogL14oXFwrPzY3OSk/XFxzP1xcZHszfVxccz9cXGR7NH0kLyxcbiAgJ2ZvLUZPJzogL14oXFwrPzI5OCk/XFxzP1xcZHsyfVxccz9cXGR7Mn1cXHM/XFxkezJ9JC8sXG4gICdmci1CRic6IC9eKFxcKzIyNnwwKVs2N11cXGR7N30kLyxcbiAgJ2ZyLUNNJzogL14oXFwrPzIzNyk2WzAtOV17OH0kLyxcbiAgJ2ZyLUZSJzogL14oXFwrPzMzfDApWzY3XVxcZHs4fSQvLFxuICAnZnItR0YnOiAvXihcXCs/NTk0fDB8MDA1OTQpWzY3XVxcZHs4fSQvLFxuICAnZnItR1AnOiAvXihcXCs/NTkwfDB8MDA1OTApWzY3XVxcZHs4fSQvLFxuICAnZnItTVEnOiAvXihcXCs/NTk2fDB8MDA1OTYpWzY3XVxcZHs4fSQvLFxuICAnZnItUEYnOiAvXihcXCs/Njg5KT84Wzc4OV1cXGR7Nn0kLyxcbiAgJ2ZyLVJFJzogL14oXFwrPzI2MnwwfDAwMjYyKVs2N11cXGR7OH0kLyxcbiAgJ2hlLUlMJzogL14oXFwrOTcyfDApKFsyMzQ4OV18NVswMTIzNDU2ODldfDc3KVsxLTldXFxkezZ9JC8sXG4gICdodS1IVSc6IC9eKFxcKz8zNnwwNikoMjB8MzB8MzF8NTB8NzApXFxkezd9JC8sXG4gICdpZC1JRCc6IC9eKFxcKz82MnwwKTgoMVsxMjM0NTY3ODldfDJbMTIzOF18M1sxMjM4XXw1WzEyMzU2Nzg5XXw3Wzc4XXw5WzU2Nzg5XXw4WzEyMzQ1Njc4OV0pKFtcXHM/fFxcZF17NSwxMX0pJC8sXG4gICdpdC1JVCc6IC9eKFxcKz8zOSk/XFxzPzNcXGR7Mn0gP1xcZHs2LDd9JC8sXG4gICdpdC1TTSc6IC9eKChcXCszNzgpfCgwNTQ5KXwoXFwrMzkwNTQ5KXwoXFwrMzc4MDU0OSkpPzZcXGR7NSw5fSQvLFxuICAnamEtSlAnOiAvXihcXCs4MVsgXFwtXT8oXFwoMFxcKSk/fDApWzY3ODldMFsgXFwtXT9cXGR7NH1bIFxcLV0/XFxkezR9JC8sXG4gICdrYS1HRSc6IC9eKFxcKz85OTUpPyg1fDc5KVxcZHs3fSQvLFxuICAna2stS1onOiAvXihcXCs/N3w4KT83XFxkezl9JC8sXG4gICdrbC1HTCc6IC9eKFxcKz8yOTkpP1xccz9cXGR7Mn1cXHM/XFxkezJ9XFxzP1xcZHsyfSQvLFxuICAna28tS1InOiAvXigoXFwrPzgyKVsgXFwtXT8pPzA/MShbMHwxfDZ8N3w4fDldezF9KVsgXFwtXT9cXGR7Myw0fVsgXFwtXT9cXGR7NH0kLyxcbiAgJ2x0LUxUJzogL14oXFwrMzcwfDgpXFxkezh9JC8sXG4gICdsdi1MVic6IC9eKFxcKz8zNzEpMlxcZHs3fSQvLFxuICAnbXMtTVknOiAvXihcXCs/Nj8wMSl7MX0oKFswMTQ1XXsxfShcXC18XFxzKT9cXGR7Nyw4fSl8KFsyMzY3ODldezF9KFxcc3xcXC0pP1xcZHs3fSkpJC8sXG4gICdtei1NWic6IC9eKFxcKz8yNTgpPzhbMjM0NTY3XVxcZHs3fSQvLFxuICAnbmItTk8nOiAvXihcXCs/NDcpP1s0OV1cXGR7N30kLyxcbiAgJ25lLU5QJzogL14oXFwrPzk3Nyk/OVs3OF1cXGR7OH0kLyxcbiAgJ25sLUJFJzogL14oXFwrPzMyfDApNFxcZHs4fSQvLFxuICAnbmwtTkwnOiAvXigoKFxcK3wwMCk/MzFcXCgwXFwpKXwoKFxcK3wwMCk/MzEpfDApNnsxfVxcZHs4fSQvLFxuICAnbm4tTk8nOiAvXihcXCs/NDcpP1s0OV1cXGR7N30kLyxcbiAgJ3BsLVBMJzogL14oXFwrPzQ4KT8gP1s1LThdXFxkID9cXGR7M30gP1xcZHsyfSA/XFxkezJ9JC8sXG4gICdwdC1CUic6IC9eKChcXCs/NTVcXCA/WzEtOV17Mn1cXCA/KXwoXFwrPzU1XFwgP1xcKFsxLTldezJ9XFwpXFwgPyl8KDBbMS05XXsyfVxcID8pfChcXChbMS05XXsyfVxcKVxcID8pfChbMS05XXsyfVxcID8pKSgoXFxkezR9XFwtP1xcZHs0fSl8KDlbMi05XXsxfVxcZHszfVxcLT9cXGR7NH0pKSQvLFxuICAncHQtUFQnOiAvXihcXCs/MzUxKT85WzEyMzZdXFxkezd9JC8sXG4gICdwdC1BTyc6IC9eKFxcKzI0NClcXGR7OX0kLyxcbiAgJ3JvLVJPJzogL14oXFwrPzQ/MClcXHM/N1xcZHsyfShcXC98XFxzfFxcLnxcXC0pP1xcZHszfShcXHN8XFwufFxcLSk/XFxkezN9JC8sXG4gICdydS1SVSc6IC9eKFxcKz83fDgpPzlcXGR7OX0kLyxcbiAgJ3NpLUxLJzogL14oPzowfDk0fFxcKzk0KT8oNygwfDF8Mnw0fDV8Nnw3fDgpKCB8LSk/KVxcZHs3fSQvLFxuICAnc2wtU0knOiAvXihcXCszODZcXHM/fDApKFxcZHsxfVxccz9cXGR7M31cXHM/XFxkezJ9XFxzP1xcZHsyfXxcXGR7Mn1cXHM/XFxkezN9XFxzP1xcZHszfSkkLyxcbiAgJ3NrLVNLJzogL14oXFwrPzQyMSk/ID9bMS05XVswLTldezJ9ID9bMC05XXszfSA/WzAtOV17M30kLyxcbiAgJ3NxLUFMJzogL14oXFwrMzU1fDApNls3ODldXFxkezZ9JC8sXG4gICdzci1SUyc6IC9eKFxcKzM4MTZ8MDYpWy0gXFxkXXs1LDl9JC8sXG4gICdzdi1TRSc6IC9eKFxcKz80NnwwKVtcXHNcXC1dPzdbXFxzXFwtXT9bMDIzNjldKFtcXHNcXC1dP1xcZCl7N30kLyxcbiAgJ3RnLVRKJzogL14oXFwrPzk5Mik/WzVdWzVdXFxkezd9JC8sXG4gICd0aC1USCc6IC9eKFxcKzY2fDY2fDApXFxkezl9JC8sXG4gICd0ci1UUic6IC9eKFxcKz85MHwwKT81XFxkezl9JC8sXG4gICd0ay1UTSc6IC9eKFxcKzk5M3w5OTN8OClcXGR7OH0kLyxcbiAgJ3VrLVVBJzogL14oXFwrPzM4fDgpPzBcXGR7OX0kLyxcbiAgJ3V6LVVaJzogL14oXFwrPzk5OCk/KDZbMTI1LTc5XXw3WzEtNjldfDg4fDlcXGQpXFxkezd9JC8sXG4gICd2aS1WTic6IC9eKChcXCs/ODQpfDApKCgzKFsyLTldKSl8KDUoWzI1Njg5XSkpfCg3KFswfDYtOV0pKXwoOChbMS05XSkpfCg5KFswLTldKSkpKFswLTldezd9KSQvLFxuICAnemgtQ04nOiAvXigoXFwrfDAwKTg2KT8oMVszLTldfDlbMjhdKVxcZHs5fSQvLFxuICAnemgtVFcnOiAvXihcXCs/ODg2XFwtP3wwKT85XFxkezh9JC8sXG4gICdkei1CVCc6IC9eKFxcKz85NzV8MCk/KDE3fDE2fDc3fDAyKVxcZHs2fSQvXG59O1xuLyogZXNsaW50LWVuYWJsZSBtYXgtbGVuICovXG4vLyBhbGlhc2VzXG5cbnBob25lc1snZW4tQ0EnXSA9IHBob25lc1snZW4tVVMnXTtcbnBob25lc1snZnItQ0EnXSA9IHBob25lc1snZW4tQ0EnXTtcbnBob25lc1snZnItQkUnXSA9IHBob25lc1snbmwtQkUnXTtcbnBob25lc1snemgtSEsnXSA9IHBob25lc1snZW4tSEsnXTtcbnBob25lc1snemgtTU8nXSA9IHBob25lc1snZW4tTU8nXTtcbnBob25lc1snZ2EtSUUnXSA9IHBob25lc1snZW4tSUUnXTtcbnBob25lc1snZnItQ0gnXSA9IHBob25lc1snZGUtQ0gnXTtcbnBob25lc1snaXQtQ0gnXSA9IHBob25lc1snZnItQ0gnXTtcblxuZnVuY3Rpb24gaXNNb2JpbGVQaG9uZShzdHIsIGxvY2FsZSwgb3B0aW9ucykge1xuICAoMCwgX2Fzc2VydFN0cmluZy5kZWZhdWx0KShzdHIpO1xuXG4gIGlmIChvcHRpb25zICYmIG9wdGlvbnMuc3RyaWN0TW9kZSAmJiAhc3RyLnN0YXJ0c1dpdGgoJysnKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChBcnJheS5pc0FycmF5KGxvY2FsZSkpIHtcbiAgICByZXR1cm4gbG9jYWxlLnNvbWUoZnVuY3Rpb24gKGtleSkge1xuICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2dvdHdhcmxvc3QvaXN0YW5idWwvYmxvYi9tYXN0ZXIvaWdub3JpbmctY29kZS1mb3ItY292ZXJhZ2UubWQjaWdub3JpbmctY29kZS1mb3ItY292ZXJhZ2UtcHVycG9zZXNcbiAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBlbHNlXG4gICAgICBpZiAocGhvbmVzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgdmFyIHBob25lID0gcGhvbmVzW2tleV07XG5cbiAgICAgICAgaWYgKHBob25lLnRlc3Qoc3RyKSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChsb2NhbGUgaW4gcGhvbmVzKSB7XG4gICAgcmV0dXJuIHBob25lc1tsb2NhbGVdLnRlc3Qoc3RyKTsgLy8gYWxpYXMgZmFsc2V5IGxvY2FsZSBhcyAnYW55J1xuICB9IGVsc2UgaWYgKCFsb2NhbGUgfHwgbG9jYWxlID09PSAnYW55Jykge1xuICAgIGZvciAodmFyIGtleSBpbiBwaG9uZXMpIHtcbiAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBlbHNlXG4gICAgICBpZiAocGhvbmVzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgdmFyIHBob25lID0gcGhvbmVzW2tleV07XG5cbiAgICAgICAgaWYgKHBob25lLnRlc3Qoc3RyKSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBsb2NhbGUgJ1wiLmNvbmNhdChsb2NhbGUsIFwiJ1wiKSk7XG59XG5cbnZhciBsb2NhbGVzID0gT2JqZWN0LmtleXMocGhvbmVzKTtcbmV4cG9ydHMubG9jYWxlcyA9IGxvY2FsZXM7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBpc01vbmdvSWQ7XG5cbnZhciBfYXNzZXJ0U3RyaW5nID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL2Fzc2VydFN0cmluZ1wiKSk7XG5cbnZhciBfaXNIZXhhZGVjaW1hbCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vaXNIZXhhZGVjaW1hbFwiKSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIGlzTW9uZ29JZChzdHIpIHtcbiAgKDAsIF9hc3NlcnRTdHJpbmcuZGVmYXVsdCkoc3RyKTtcbiAgcmV0dXJuICgwLCBfaXNIZXhhZGVjaW1hbC5kZWZhdWx0KShzdHIpICYmIHN0ci5sZW5ndGggPT09IDI0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBpc011bHRpYnl0ZTtcblxudmFyIF9hc3NlcnRTdHJpbmcgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvYXNzZXJ0U3RyaW5nXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuLyogZXNsaW50LWRpc2FibGUgbm8tY29udHJvbC1yZWdleCAqL1xudmFyIG11bHRpYnl0ZSA9IC9bXlxceDAwLVxceDdGXS87XG4vKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnRyb2wtcmVnZXggKi9cblxuZnVuY3Rpb24gaXNNdWx0aWJ5dGUoc3RyKSB7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7XG4gIHJldHVybiBtdWx0aWJ5dGUudGVzdChzdHIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBpc051bWVyaWM7XG5cbnZhciBfYXNzZXJ0U3RyaW5nID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL2Fzc2VydFN0cmluZ1wiKSk7XG5cbnZhciBfYWxwaGEgPSByZXF1aXJlKFwiLi9hbHBoYVwiKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIG51bWVyaWNOb1N5bWJvbHMgPSAvXlswLTldKyQvO1xuXG5mdW5jdGlvbiBpc051bWVyaWMoc3RyLCBvcHRpb25zKSB7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7XG5cbiAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5ub19zeW1ib2xzKSB7XG4gICAgcmV0dXJuIG51bWVyaWNOb1N5bWJvbHMudGVzdChzdHIpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBSZWdFeHAoXCJeWystXT8oWzAtOV0qW1wiLmNvbmNhdCgob3B0aW9ucyB8fCB7fSkubG9jYWxlID8gX2FscGhhLmRlY2ltYWxbb3B0aW9ucy5sb2NhbGVdIDogJy4nLCBcIl0pP1swLTldKyRcIikpLnRlc3Qoc3RyKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzLmRlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gaXNPY3RhbDtcblxudmFyIF9hc3NlcnRTdHJpbmcgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvYXNzZXJ0U3RyaW5nXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIG9jdGFsID0gL14oMG8pP1swLTddKyQvaTtcblxuZnVuY3Rpb24gaXNPY3RhbChzdHIpIHtcbiAgKDAsIF9hc3NlcnRTdHJpbmcuZGVmYXVsdCkoc3RyKTtcbiAgcmV0dXJuIG9jdGFsLnRlc3Qoc3RyKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzLmRlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gaXNQYXNzcG9ydE51bWJlcjtcblxudmFyIF9hc3NlcnRTdHJpbmcgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvYXNzZXJ0U3RyaW5nXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuLyoqXG4gKiBSZWZlcmVuY2U6XG4gKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvIC0tIFdpa2lwZWRpYVxuICogaHR0cHM6Ly9kb2NzLm1pY3Jvc29mdC5jb20vZW4tdXMvbWljcm9zb2Z0LTM2NS9jb21wbGlhbmNlL2V1LXBhc3Nwb3J0LW51bWJlciAtLSBFVSBQYXNzcG9ydCBOdW1iZXJcbiAqIGh0dHBzOi8vY291bnRyeWNvZGUub3JnLyAtLSBDb3VudHJ5IENvZGVzXG4gKi9cbnZhciBwYXNzcG9ydFJlZ2V4QnlDb3VudHJ5Q29kZSA9IHtcbiAgQU06IC9eW0EtWl17Mn1cXGR7N30kLyxcbiAgLy8gQVJNRU5JQVxuICBBUjogL15bQS1aXXszfVxcZHs2fSQvLFxuICAvLyBBUkdFTlRJTkFcbiAgQVQ6IC9eW0EtWl1cXGR7N30kLyxcbiAgLy8gQVVTVFJJQVxuICBBVTogL15bQS1aXVxcZHs3fSQvLFxuICAvLyBBVVNUUkFMSUFcbiAgQkU6IC9eW0EtWl17Mn1cXGR7Nn0kLyxcbiAgLy8gQkVMR0lVTVxuICBCRzogL15cXGR7OX0kLyxcbiAgLy8gQlVMR0FSSUFcbiAgQlI6IC9eW0EtWl17Mn1cXGR7Nn0kLyxcbiAgLy8gQlJBWklMXG4gIEJZOiAvXltBLVpdezJ9XFxkezd9JC8sXG4gIC8vIEJFTEFSVVNcbiAgQ0E6IC9eW0EtWl17Mn1cXGR7Nn0kLyxcbiAgLy8gQ0FOQURBXG4gIENIOiAvXltBLVpdXFxkezd9JC8sXG4gIC8vIFNXSVRaRVJMQU5EXG4gIENOOiAvXkdcXGR7OH0kfF5FKD8hW0lPXSlbQS1aMC05XVxcZHs3fSQvLFxuICAvLyBDSElOQSBbRz1PcmRpbmFyeSwgRT1FbGVjdHJvbmljXSBmb2xsb3dlZCBieSA4LWRpZ2l0cywgb3IgRSBmb2xsb3dlZCBieSBhbnkgVVBQRVJDQVNFIGxldHRlciAoZXhjZXB0IEkgYW5kIE8pIGZvbGxvd2VkIGJ5IDcgZGlnaXRzXG4gIENZOiAvXltBLVpdKFxcZHs2fXxcXGR7OH0pJC8sXG4gIC8vIENZUFJVU1xuICBDWjogL15cXGR7OH0kLyxcbiAgLy8gQ1pFQ0ggUkVQVUJMSUNcbiAgREU6IC9eW0NGR0hKS0xNTlBSVFZXWFlaMC05XXs5fSQvLFxuICAvLyBHRVJNQU5ZXG4gIERLOiAvXlxcZHs5fSQvLFxuICAvLyBERU5NQVJLXG4gIERaOiAvXlxcZHs5fSQvLFxuICAvLyBBTEdFUklBXG4gIEVFOiAvXihbQS1aXVxcZHs3fXxbQS1aXXsyfVxcZHs3fSkkLyxcbiAgLy8gRVNUT05JQSAoSyBmb2xsb3dlZCBieSA3LWRpZ2l0cyksIGUtcGFzc3BvcnRzIGhhdmUgMiBVUFBFUkNBU0UgZm9sbG93ZWQgYnkgNyBkaWdpdHNcbiAgRVM6IC9eW0EtWjAtOV17Mn0oW0EtWjAtOV0/KVxcZHs2fSQvLFxuICAvLyBTUEFJTlxuICBGSTogL15bQS1aXXsyfVxcZHs3fSQvLFxuICAvLyBGSU5MQU5EXG4gIEZSOiAvXlxcZHsyfVtBLVpdezJ9XFxkezV9JC8sXG4gIC8vIEZSQU5DRVxuICBHQjogL15cXGR7OX0kLyxcbiAgLy8gVU5JVEVEIEtJTkdET01cbiAgR1I6IC9eW0EtWl17Mn1cXGR7N30kLyxcbiAgLy8gR1JFRUNFXG4gIEhSOiAvXlxcZHs5fSQvLFxuICAvLyBDUk9BVElBXG4gIEhVOiAvXltBLVpdezJ9KFxcZHs2fXxcXGR7N30pJC8sXG4gIC8vIEhVTkdBUllcbiAgSUU6IC9eW0EtWjAtOV17Mn1cXGR7N30kLyxcbiAgLy8gSVJFTEFORFxuICBJTjogL15bQS1aXXsxfS0/XFxkezd9JC8sXG4gIC8vIElORElBXG4gIElEOiAvXltBLUNdXFxkezd9JC8sXG4gIC8vIElORE9ORVNJQVxuICBJUjogL15bQS1aXVxcZHs4fSQvLFxuICAvLyBJUkFOXG4gIElTOiAvXihBKVxcZHs3fSQvLFxuICAvLyBJQ0VMQU5EXG4gIElUOiAvXltBLVowLTldezJ9XFxkezd9JC8sXG4gIC8vIElUQUxZXG4gIEpQOiAvXltBLVpdezJ9XFxkezd9JC8sXG4gIC8vIEpBUEFOXG4gIEtSOiAvXltNU11cXGR7OH0kLyxcbiAgLy8gU09VVEggS09SRUEsIFJFUFVCTElDIE9GIEtPUkVBLCBbUz1QUyBQYXNzcG9ydHMsIE09UE0gUGFzc3BvcnRzXVxuICBMVDogL15bQS1aMC05XXs4fSQvLFxuICAvLyBMSVRIVUFOSUFcbiAgTFU6IC9eW0EtWjAtOV17OH0kLyxcbiAgLy8gTFVYRU1CVVJHXG4gIExWOiAvXltBLVowLTldezJ9XFxkezd9JC8sXG4gIC8vIExBVFZJQVxuICBMWTogL15bQS1aMC05XXs4fSQvLFxuICAvLyBMSUJZQVxuICBNVDogL15cXGR7N30kLyxcbiAgLy8gTUFMVEFcbiAgTVo6IC9eKFtBLVpdezJ9XFxkezd9KXwoXFxkezJ9W0EtWl17Mn1cXGR7NX0pJC8sXG4gIC8vIE1PWkFNQklRVUVcbiAgTVk6IC9eW0FIS11cXGR7OH0kLyxcbiAgLy8gTUFMQVlTSUFcbiAgTkw6IC9eW0EtWl17Mn1bQS1aMC05XXs2fVxcZCQvLFxuICAvLyBORVRIRVJMQU5EU1xuICBQTDogL15bQS1aXXsyfVxcZHs3fSQvLFxuICAvLyBQT0xBTkRcbiAgUFQ6IC9eW0EtWl1cXGR7Nn0kLyxcbiAgLy8gUE9SVFVHQUxcbiAgUk86IC9eXFxkezgsOX0kLyxcbiAgLy8gUk9NQU5JQVxuICBSVTogL15cXGR7OX0kLyxcbiAgLy8gUlVTU0lBTiBGRURFUkFUSU9OXG4gIFNFOiAvXlxcZHs4fSQvLFxuICAvLyBTV0VERU5cbiAgU0w6IC9eKFApW0EtWl1cXGR7N30kLyxcbiAgLy8gU0xPVkFOSUFcbiAgU0s6IC9eWzAtOUEtWl1cXGR7N30kLyxcbiAgLy8gU0xPVkFLSUFcbiAgVFI6IC9eW0EtWl1cXGR7OH0kLyxcbiAgLy8gVFVSS0VZXG4gIFVBOiAvXltBLVpdezJ9XFxkezZ9JC8sXG4gIC8vIFVLUkFJTkVcbiAgVVM6IC9eXFxkezl9JC8gLy8gVU5JVEVEIFNUQVRFU1xuXG59O1xuLyoqXG4gKiBDaGVjayBpZiBzdHIgaXMgYSB2YWxpZCBwYXNzcG9ydCBudW1iZXJcbiAqIHJlbGF0aXZlIHRvIHByb3ZpZGVkIElTTyBDb3VudHJ5IENvZGUuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHN0clxuICogQHBhcmFtIHtzdHJpbmd9IGNvdW50cnlDb2RlXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5cbmZ1bmN0aW9uIGlzUGFzc3BvcnROdW1iZXIoc3RyLCBjb3VudHJ5Q29kZSkge1xuICAoMCwgX2Fzc2VydFN0cmluZy5kZWZhdWx0KShzdHIpO1xuICAvKiogUmVtb3ZlIEFsbCBXaGl0ZXNwYWNlcywgQ29udmVydCB0byBVUFBFUkNBU0UgKi9cblxuICB2YXIgbm9ybWFsaXplZFN0ciA9IHN0ci5yZXBsYWNlKC9cXHMvZywgJycpLnRvVXBwZXJDYXNlKCk7XG4gIHJldHVybiBjb3VudHJ5Q29kZS50b1VwcGVyQ2FzZSgpIGluIHBhc3Nwb3J0UmVnZXhCeUNvdW50cnlDb2RlICYmIHBhc3Nwb3J0UmVnZXhCeUNvdW50cnlDb2RlW2NvdW50cnlDb2RlXS50ZXN0KG5vcm1hbGl6ZWRTdHIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBpc1BvcnQ7XG5cbnZhciBfaXNJbnQgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2lzSW50XCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gaXNQb3J0KHN0cikge1xuICByZXR1cm4gKDAsIF9pc0ludC5kZWZhdWx0KShzdHIsIHtcbiAgICBtaW46IDAsXG4gICAgbWF4OiA2NTUzNVxuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzLmRlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gaXNQb3N0YWxDb2RlO1xuZXhwb3J0cy5sb2NhbGVzID0gdm9pZCAwO1xuXG52YXIgX2Fzc2VydFN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9hc3NlcnRTdHJpbmdcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG4vLyBjb21tb24gcGF0dGVybnNcbnZhciB0aHJlZURpZ2l0ID0gL15cXGR7M30kLztcbnZhciBmb3VyRGlnaXQgPSAvXlxcZHs0fSQvO1xudmFyIGZpdmVEaWdpdCA9IC9eXFxkezV9JC87XG52YXIgc2l4RGlnaXQgPSAvXlxcZHs2fSQvO1xudmFyIHBhdHRlcm5zID0ge1xuICBBRDogL15BRFxcZHszfSQvLFxuICBBVDogZm91ckRpZ2l0LFxuICBBVTogZm91ckRpZ2l0LFxuICBBWjogL15BWlxcZHs0fSQvLFxuICBCRTogZm91ckRpZ2l0LFxuICBCRzogZm91ckRpZ2l0LFxuICBCUjogL15cXGR7NX0tXFxkezN9JC8sXG4gIEJZOiAvMlsxLTRdezF9XFxkezR9JC8sXG4gIENBOiAvXltBQkNFR0hKS0xNTlBSU1RWWFldXFxkW0FCQ0VHSEotTlBSU1RWLVpdW1xcc1xcLV0/XFxkW0FCQ0VHSEotTlBSU1RWLVpdXFxkJC9pLFxuICBDSDogZm91ckRpZ2l0LFxuICBDTjogL14oMFsxLTddfDFbMDEyMzU2XXwyWzAtN118M1swLTZdfDRbMC03XXw1WzEtN118NlsxLTddfDdbMS01XXw4WzEzNDVdfDlbMDldKVxcZHs0fSQvLFxuICBDWjogL15cXGR7M31cXHM/XFxkezJ9JC8sXG4gIERFOiBmaXZlRGlnaXQsXG4gIERLOiBmb3VyRGlnaXQsXG4gIERPOiBmaXZlRGlnaXQsXG4gIERaOiBmaXZlRGlnaXQsXG4gIEVFOiBmaXZlRGlnaXQsXG4gIEVTOiAvXig1WzAtMl17MX18WzAtNF17MX1cXGR7MX0pXFxkezN9JC8sXG4gIEZJOiBmaXZlRGlnaXQsXG4gIEZSOiAvXlxcZHsyfVxccz9cXGR7M30kLyxcbiAgR0I6IC9eKGdpclxccz8wYWF8W2Etel17MSwyfVxcZFtcXGRhLXpdP1xccz8oXFxkW2Etel17Mn0pPykkL2ksXG4gIEdSOiAvXlxcZHszfVxccz9cXGR7Mn0kLyxcbiAgSFI6IC9eKFsxLTVdXFxkezR9JCkvLFxuICBIVDogL15IVFxcZHs0fSQvLFxuICBIVTogZm91ckRpZ2l0LFxuICBJRDogZml2ZURpZ2l0LFxuICBJRTogL14oPyEuKig/Om8pKVtBLVphLXpdXFxkW1xcZHddXFxzXFx3ezR9JC9pLFxuICBJTDogL14oXFxkezV9fFxcZHs3fSkkLyxcbiAgSU46IC9eKCg/ITEwfDI5fDM1fDU0fDU1fDY1fDY2fDg2fDg3fDg4fDg5KVsxLTldWzAtOV17NX0pJC8sXG4gIElSOiAvXFxiKD8hKFxcZClcXDF7M30pWzEzLTldezR9WzEzNDYtOV1bMDEzLTldezV9XFxiLyxcbiAgSVM6IHRocmVlRGlnaXQsXG4gIElUOiBmaXZlRGlnaXQsXG4gIEpQOiAvXlxcZHszfVxcLVxcZHs0fSQvLFxuICBLRTogZml2ZURpZ2l0LFxuICBLUjogL14oXFxkezV9fFxcZHs2fSkkLyxcbiAgTEk6IC9eKDk0OFs1LTldfDk0OVswLTddKSQvLFxuICBMVDogL15MVFxcLVxcZHs1fSQvLFxuICBMVTogZm91ckRpZ2l0LFxuICBMVjogL15MVlxcLVxcZHs0fSQvLFxuICBMSzogZml2ZURpZ2l0LFxuICBNWDogZml2ZURpZ2l0LFxuICBNVDogL15bQS1aYS16XXszfVxcc3swLDF9XFxkezR9JC8sXG4gIE1ZOiBmaXZlRGlnaXQsXG4gIE5MOiAvXlxcZHs0fVxccz9bYS16XXsyfSQvaSxcbiAgTk86IGZvdXJEaWdpdCxcbiAgTlA6IC9eKDEwfDIxfDIyfDMyfDMzfDM0fDQ0fDQ1fDU2fDU3KVxcZHszfSR8Xig5NzcpJC9pLFxuICBOWjogZm91ckRpZ2l0LFxuICBQTDogL15cXGR7Mn1cXC1cXGR7M30kLyxcbiAgUFI6IC9eMDBbNjc5XVxcZHsyfShbIC1dXFxkezR9KT8kLyxcbiAgUFQ6IC9eXFxkezR9XFwtXFxkezN9PyQvLFxuICBSTzogc2l4RGlnaXQsXG4gIFJVOiBzaXhEaWdpdCxcbiAgU0E6IGZpdmVEaWdpdCxcbiAgU0U6IC9eWzEtOV1cXGR7Mn1cXHM/XFxkezJ9JC8sXG4gIFNHOiBzaXhEaWdpdCxcbiAgU0k6IGZvdXJEaWdpdCxcbiAgU0s6IC9eXFxkezN9XFxzP1xcZHsyfSQvLFxuICBUSDogZml2ZURpZ2l0LFxuICBUTjogZm91ckRpZ2l0LFxuICBUVzogL15cXGR7M30oXFxkezJ9KT8kLyxcbiAgVUE6IGZpdmVEaWdpdCxcbiAgVVM6IC9eXFxkezV9KC1cXGR7NH0pPyQvLFxuICBaQTogZm91ckRpZ2l0LFxuICBaTTogZml2ZURpZ2l0XG59O1xudmFyIGxvY2FsZXMgPSBPYmplY3Qua2V5cyhwYXR0ZXJucyk7XG5leHBvcnRzLmxvY2FsZXMgPSBsb2NhbGVzO1xuXG5mdW5jdGlvbiBpc1Bvc3RhbENvZGUoc3RyLCBsb2NhbGUpIHtcbiAgKDAsIF9hc3NlcnRTdHJpbmcuZGVmYXVsdCkoc3RyKTtcblxuICBpZiAobG9jYWxlIGluIHBhdHRlcm5zKSB7XG4gICAgcmV0dXJuIHBhdHRlcm5zW2xvY2FsZV0udGVzdChzdHIpO1xuICB9IGVsc2UgaWYgKGxvY2FsZSA9PT0gJ2FueScpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gcGF0dGVybnMpIHtcbiAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9nb3R3YXJsb3N0L2lzdGFuYnVsL2Jsb2IvbWFzdGVyL2lnbm9yaW5nLWNvZGUtZm9yLWNvdmVyYWdlLm1kI2lnbm9yaW5nLWNvZGUtZm9yLWNvdmVyYWdlLXB1cnBvc2VzXG4gICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgZWxzZVxuICAgICAgaWYgKHBhdHRlcm5zLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgdmFyIHBhdHRlcm4gPSBwYXR0ZXJuc1trZXldO1xuXG4gICAgICAgIGlmIChwYXR0ZXJuLnRlc3Qoc3RyKSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBsb2NhbGUgJ1wiLmNvbmNhdChsb2NhbGUsIFwiJ1wiKSk7XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBpc1JGQzMzMzk7XG5cbnZhciBfYXNzZXJ0U3RyaW5nID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL2Fzc2VydFN0cmluZ1wiKSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbi8qIEJhc2VkIG9uIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzMzM5I3NlY3Rpb24tNS42ICovXG52YXIgZGF0ZUZ1bGxZZWFyID0gL1swLTldezR9LztcbnZhciBkYXRlTW9udGggPSAvKDBbMS05XXwxWzAtMl0pLztcbnZhciBkYXRlTURheSA9IC8oWzEyXVxcZHwwWzEtOV18M1swMV0pLztcbnZhciB0aW1lSG91ciA9IC8oWzAxXVswLTldfDJbMC0zXSkvO1xudmFyIHRpbWVNaW51dGUgPSAvWzAtNV1bMC05XS87XG52YXIgdGltZVNlY29uZCA9IC8oWzAtNV1bMC05XXw2MCkvO1xudmFyIHRpbWVTZWNGcmFjID0gLyhcXC5bMC05XSspPy87XG52YXIgdGltZU51bU9mZnNldCA9IG5ldyBSZWdFeHAoXCJbLStdXCIuY29uY2F0KHRpbWVIb3VyLnNvdXJjZSwgXCI6XCIpLmNvbmNhdCh0aW1lTWludXRlLnNvdXJjZSkpO1xudmFyIHRpbWVPZmZzZXQgPSBuZXcgUmVnRXhwKFwiKFt6Wl18XCIuY29uY2F0KHRpbWVOdW1PZmZzZXQuc291cmNlLCBcIilcIikpO1xudmFyIHBhcnRpYWxUaW1lID0gbmV3IFJlZ0V4cChcIlwiLmNvbmNhdCh0aW1lSG91ci5zb3VyY2UsIFwiOlwiKS5jb25jYXQodGltZU1pbnV0ZS5zb3VyY2UsIFwiOlwiKS5jb25jYXQodGltZVNlY29uZC5zb3VyY2UpLmNvbmNhdCh0aW1lU2VjRnJhYy5zb3VyY2UpKTtcbnZhciBmdWxsRGF0ZSA9IG5ldyBSZWdFeHAoXCJcIi5jb25jYXQoZGF0ZUZ1bGxZZWFyLnNvdXJjZSwgXCItXCIpLmNvbmNhdChkYXRlTW9udGguc291cmNlLCBcIi1cIikuY29uY2F0KGRhdGVNRGF5LnNvdXJjZSkpO1xudmFyIGZ1bGxUaW1lID0gbmV3IFJlZ0V4cChcIlwiLmNvbmNhdChwYXJ0aWFsVGltZS5zb3VyY2UpLmNvbmNhdCh0aW1lT2Zmc2V0LnNvdXJjZSkpO1xudmFyIHJmYzMzMzkgPSBuZXcgUmVnRXhwKFwiXlwiLmNvbmNhdChmdWxsRGF0ZS5zb3VyY2UsIFwiWyB0VF1cIikuY29uY2F0KGZ1bGxUaW1lLnNvdXJjZSwgXCIkXCIpKTtcblxuZnVuY3Rpb24gaXNSRkMzMzM5KHN0cikge1xuICAoMCwgX2Fzc2VydFN0cmluZy5kZWZhdWx0KShzdHIpO1xuICByZXR1cm4gcmZjMzMzOS50ZXN0KHN0cik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGlzUmdiQ29sb3I7XG5cbnZhciBfYXNzZXJ0U3RyaW5nID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL2Fzc2VydFN0cmluZ1wiKSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciByZ2JDb2xvciA9IC9ecmdiXFwoKChbMC05XXxbMS05XVswLTldfDFbMC05XVswLTldfDJbMC00XVswLTldfDI1WzAtNV0pLCl7Mn0oWzAtOV18WzEtOV1bMC05XXwxWzAtOV1bMC05XXwyWzAtNF1bMC05XXwyNVswLTVdKVxcKSQvO1xudmFyIHJnYmFDb2xvciA9IC9ecmdiYVxcKCgoWzAtOV18WzEtOV1bMC05XXwxWzAtOV1bMC05XXwyWzAtNF1bMC05XXwyNVswLTVdKSwpezN9KDA/XFwuXFxkfDEoXFwuMCk/fDAoXFwuMCk/KVxcKSQvO1xudmFyIHJnYkNvbG9yUGVyY2VudCA9IC9ecmdiXFwoKChbMC05XSV8WzEtOV1bMC05XSV8MTAwJSksKXsyfShbMC05XSV8WzEtOV1bMC05XSV8MTAwJSlcXCkvO1xudmFyIHJnYmFDb2xvclBlcmNlbnQgPSAvXnJnYmFcXCgoKFswLTldJXxbMS05XVswLTldJXwxMDAlKSwpezN9KDA/XFwuXFxkfDEoXFwuMCk/fDAoXFwuMCk/KVxcKS87XG5cbmZ1bmN0aW9uIGlzUmdiQ29sb3Ioc3RyKSB7XG4gIHZhciBpbmNsdWRlUGVyY2VudFZhbHVlcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogdHJ1ZTtcbiAgKDAsIF9hc3NlcnRTdHJpbmcuZGVmYXVsdCkoc3RyKTtcblxuICBpZiAoIWluY2x1ZGVQZXJjZW50VmFsdWVzKSB7XG4gICAgcmV0dXJuIHJnYkNvbG9yLnRlc3Qoc3RyKSB8fCByZ2JhQ29sb3IudGVzdChzdHIpO1xuICB9XG5cbiAgcmV0dXJuIHJnYkNvbG9yLnRlc3Qoc3RyKSB8fCByZ2JhQ29sb3IudGVzdChzdHIpIHx8IHJnYkNvbG9yUGVyY2VudC50ZXN0KHN0cikgfHwgcmdiYUNvbG9yUGVyY2VudC50ZXN0KHN0cik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGlzU2VtVmVyO1xuXG52YXIgX2Fzc2VydFN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9hc3NlcnRTdHJpbmdcIikpO1xuXG52YXIgX211bHRpbGluZVJlZ2V4ID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL211bHRpbGluZVJlZ2V4XCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuLyoqXG4gKiBSZWd1bGFyIEV4cHJlc3Npb24gdG8gbWF0Y2hcbiAqIHNlbWFudGljIHZlcnNpb25pbmcgKFNlbVZlcilcbiAqIGJ1aWx0IGZyb20gbXVsdGktbGluZSwgbXVsdGktcGFydHMgcmVnZXhwXG4gKiBSZWZlcmVuY2U6IGh0dHBzOi8vc2VtdmVyLm9yZy9cbiAqL1xudmFyIHNlbWFudGljVmVyc2lvbmluZ1JlZ2V4ID0gKDAsIF9tdWx0aWxpbmVSZWdleC5kZWZhdWx0KShbJ14oMHxbMS05XVxcXFxkKilcXFxcLigwfFsxLTldXFxcXGQqKVxcXFwuKDB8WzEtOV1cXFxcZCopJywgJyg/Oi0oKD86MHxbMS05XVxcXFxkKnxcXFxcZCpbYS16LV1bMC05YS16LV0qKSg/OlxcXFwuKD86MHxbMS05XVxcXFxkKnxcXFxcZCpbYS16LV1bMC05YS16LV0qKSkqKSknLCAnPyg/OlxcXFwrKFswLTlhLXotXSsoPzpcXFxcLlswLTlhLXotXSspKikpPyQnXSwgJ2knKTtcblxuZnVuY3Rpb24gaXNTZW1WZXIoc3RyKSB7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7XG4gIHJldHVybiBzZW1hbnRpY1ZlcnNpb25pbmdSZWdleC50ZXN0KHN0cik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGlzU2x1ZztcblxudmFyIF9hc3NlcnRTdHJpbmcgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvYXNzZXJ0U3RyaW5nXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIGNoYXJzZXRSZWdleCA9IC9eW15cXHMtX10oPyEuKj9bLV9dezIsfSlbYS16MC05LVxcXFxdW15cXHNdKlteLV9cXHNdJC87XG5cbmZ1bmN0aW9uIGlzU2x1ZyhzdHIpIHtcbiAgKDAsIF9hc3NlcnRTdHJpbmcuZGVmYXVsdCkoc3RyKTtcbiAgcmV0dXJuIGNoYXJzZXRSZWdleC50ZXN0KHN0cik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGlzU3Ryb25nUGFzc3dvcmQ7XG5cbnZhciBfbWVyZ2UgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvbWVyZ2VcIikpO1xuXG52YXIgX2Fzc2VydFN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9hc3NlcnRTdHJpbmdcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgdXBwZXJDYXNlUmVnZXggPSAvXltBLVpdJC87XG52YXIgbG93ZXJDYXNlUmVnZXggPSAvXlthLXpdJC87XG52YXIgbnVtYmVyUmVnZXggPSAvXlswLTldJC87XG52YXIgc3ltYm9sUmVnZXggPSAvXlstIyEkQCVeJiooKV8rfH49YHt9XFxbXFxdOlwiOyc8Pj8sLlxcLyBdJC87XG52YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gIG1pbkxlbmd0aDogOCxcbiAgbWluTG93ZXJjYXNlOiAxLFxuICBtaW5VcHBlcmNhc2U6IDEsXG4gIG1pbk51bWJlcnM6IDEsXG4gIG1pblN5bWJvbHM6IDEsXG4gIHJldHVyblNjb3JlOiBmYWxzZSxcbiAgcG9pbnRzUGVyVW5pcXVlOiAxLFxuICBwb2ludHNQZXJSZXBlYXQ6IDAuNSxcbiAgcG9pbnRzRm9yQ29udGFpbmluZ0xvd2VyOiAxMCxcbiAgcG9pbnRzRm9yQ29udGFpbmluZ1VwcGVyOiAxMCxcbiAgcG9pbnRzRm9yQ29udGFpbmluZ051bWJlcjogMTAsXG4gIHBvaW50c0ZvckNvbnRhaW5pbmdTeW1ib2w6IDEwXG59O1xuLyogQ291bnRzIG51bWJlciBvZiBvY2N1cnJlbmNlcyBvZiBlYWNoIGNoYXIgaW4gYSBzdHJpbmdcbiAqIGNvdWxkIGJlIG1vdmVkIHRvIHV0aWwvID9cbiovXG5cbmZ1bmN0aW9uIGNvdW50Q2hhcnMoc3RyKSB7XG4gIHZhciByZXN1bHQgPSB7fTtcbiAgQXJyYXkuZnJvbShzdHIpLmZvckVhY2goZnVuY3Rpb24gKGNoYXIpIHtcbiAgICB2YXIgY3VyVmFsID0gcmVzdWx0W2NoYXJdO1xuXG4gICAgaWYgKGN1clZhbCkge1xuICAgICAgcmVzdWx0W2NoYXJdICs9IDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdFtjaGFyXSA9IDE7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cbi8qIFJldHVybiBpbmZvcm1hdGlvbiBhYm91dCBhIHBhc3N3b3JkICovXG5cblxuZnVuY3Rpb24gYW5hbHl6ZVBhc3N3b3JkKHBhc3N3b3JkKSB7XG4gIHZhciBjaGFyTWFwID0gY291bnRDaGFycyhwYXNzd29yZCk7XG4gIHZhciBhbmFseXNpcyA9IHtcbiAgICBsZW5ndGg6IHBhc3N3b3JkLmxlbmd0aCxcbiAgICB1bmlxdWVDaGFyczogT2JqZWN0LmtleXMoY2hhck1hcCkubGVuZ3RoLFxuICAgIHVwcGVyY2FzZUNvdW50OiAwLFxuICAgIGxvd2VyY2FzZUNvdW50OiAwLFxuICAgIG51bWJlckNvdW50OiAwLFxuICAgIHN5bWJvbENvdW50OiAwXG4gIH07XG4gIE9iamVjdC5rZXlzKGNoYXJNYXApLmZvckVhY2goZnVuY3Rpb24gKGNoYXIpIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgIGlmICh1cHBlckNhc2VSZWdleC50ZXN0KGNoYXIpKSB7XG4gICAgICBhbmFseXNpcy51cHBlcmNhc2VDb3VudCArPSBjaGFyTWFwW2NoYXJdO1xuICAgIH0gZWxzZSBpZiAobG93ZXJDYXNlUmVnZXgudGVzdChjaGFyKSkge1xuICAgICAgYW5hbHlzaXMubG93ZXJjYXNlQ291bnQgKz0gY2hhck1hcFtjaGFyXTtcbiAgICB9IGVsc2UgaWYgKG51bWJlclJlZ2V4LnRlc3QoY2hhcikpIHtcbiAgICAgIGFuYWx5c2lzLm51bWJlckNvdW50ICs9IGNoYXJNYXBbY2hhcl07XG4gICAgfSBlbHNlIGlmIChzeW1ib2xSZWdleC50ZXN0KGNoYXIpKSB7XG4gICAgICBhbmFseXNpcy5zeW1ib2xDb3VudCArPSBjaGFyTWFwW2NoYXJdO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBhbmFseXNpcztcbn1cblxuZnVuY3Rpb24gc2NvcmVQYXNzd29yZChhbmFseXNpcywgc2NvcmluZ09wdGlvbnMpIHtcbiAgdmFyIHBvaW50cyA9IDA7XG4gIHBvaW50cyArPSBhbmFseXNpcy51bmlxdWVDaGFycyAqIHNjb3JpbmdPcHRpb25zLnBvaW50c1BlclVuaXF1ZTtcbiAgcG9pbnRzICs9IChhbmFseXNpcy5sZW5ndGggLSBhbmFseXNpcy51bmlxdWVDaGFycykgKiBzY29yaW5nT3B0aW9ucy5wb2ludHNQZXJSZXBlYXQ7XG5cbiAgaWYgKGFuYWx5c2lzLmxvd2VyY2FzZUNvdW50ID4gMCkge1xuICAgIHBvaW50cyArPSBzY29yaW5nT3B0aW9ucy5wb2ludHNGb3JDb250YWluaW5nTG93ZXI7XG4gIH1cblxuICBpZiAoYW5hbHlzaXMudXBwZXJjYXNlQ291bnQgPiAwKSB7XG4gICAgcG9pbnRzICs9IHNjb3JpbmdPcHRpb25zLnBvaW50c0ZvckNvbnRhaW5pbmdVcHBlcjtcbiAgfVxuXG4gIGlmIChhbmFseXNpcy5udW1iZXJDb3VudCA+IDApIHtcbiAgICBwb2ludHMgKz0gc2NvcmluZ09wdGlvbnMucG9pbnRzRm9yQ29udGFpbmluZ051bWJlcjtcbiAgfVxuXG4gIGlmIChhbmFseXNpcy5zeW1ib2xDb3VudCA+IDApIHtcbiAgICBwb2ludHMgKz0gc2NvcmluZ09wdGlvbnMucG9pbnRzRm9yQ29udGFpbmluZ1N5bWJvbDtcbiAgfVxuXG4gIHJldHVybiBwb2ludHM7XG59XG5cbmZ1bmN0aW9uIGlzU3Ryb25nUGFzc3dvcmQoc3RyKSB7XG4gIHZhciBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBudWxsO1xuICAoMCwgX2Fzc2VydFN0cmluZy5kZWZhdWx0KShzdHIpO1xuICB2YXIgYW5hbHlzaXMgPSBhbmFseXplUGFzc3dvcmQoc3RyKTtcbiAgb3B0aW9ucyA9ICgwLCBfbWVyZ2UuZGVmYXVsdCkob3B0aW9ucyB8fCB7fSwgZGVmYXVsdE9wdGlvbnMpO1xuXG4gIGlmIChvcHRpb25zLnJldHVyblNjb3JlKSB7XG4gICAgcmV0dXJuIHNjb3JlUGFzc3dvcmQoYW5hbHlzaXMsIG9wdGlvbnMpO1xuICB9XG5cbiAgcmV0dXJuIGFuYWx5c2lzLmxlbmd0aCA+PSBvcHRpb25zLm1pbkxlbmd0aCAmJiBhbmFseXNpcy5sb3dlcmNhc2VDb3VudCA+PSBvcHRpb25zLm1pbkxvd2VyY2FzZSAmJiBhbmFseXNpcy51cHBlcmNhc2VDb3VudCA+PSBvcHRpb25zLm1pblVwcGVyY2FzZSAmJiBhbmFseXNpcy5udW1iZXJDb3VudCA+PSBvcHRpb25zLm1pbk51bWJlcnMgJiYgYW5hbHlzaXMuc3ltYm9sQ291bnQgPj0gb3B0aW9ucy5taW5TeW1ib2xzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBpc1N1cnJvZ2F0ZVBhaXI7XG5cbnZhciBfYXNzZXJ0U3RyaW5nID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL2Fzc2VydFN0cmluZ1wiKSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBzdXJyb2dhdGVQYWlyID0gL1tcXHVEODAwLVxcdURCRkZdW1xcdURDMDAtXFx1REZGRl0vO1xuXG5mdW5jdGlvbiBpc1N1cnJvZ2F0ZVBhaXIoc3RyKSB7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7XG4gIHJldHVybiBzdXJyb2dhdGVQYWlyLnRlc3Qoc3RyKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzLmRlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBfdHlwZW9mKG9iaikgeyBcIkBiYWJlbC9oZWxwZXJzIC0gdHlwZW9mXCI7IGlmICh0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIikgeyBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH07IH0gZWxzZSB7IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTsgfSByZXR1cm4gX3R5cGVvZihvYmopOyB9XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBpc1RheElEO1xuXG52YXIgX2Fzc2VydFN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9hc3NlcnRTdHJpbmdcIikpO1xuXG52YXIgYWxnb3JpdGhtcyA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKHJlcXVpcmUoXCIuL3V0aWwvYWxnb3JpdGhtc1wiKSk7XG5cbnZhciBfaXNEYXRlID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9pc0RhdGVcIikpO1xuXG5mdW5jdGlvbiBfZ2V0UmVxdWlyZVdpbGRjYXJkQ2FjaGUoKSB7IGlmICh0eXBlb2YgV2Vha01hcCAhPT0gXCJmdW5jdGlvblwiKSByZXR1cm4gbnVsbDsgdmFyIGNhY2hlID0gbmV3IFdlYWtNYXAoKTsgX2dldFJlcXVpcmVXaWxkY2FyZENhY2hlID0gZnVuY3Rpb24gX2dldFJlcXVpcmVXaWxkY2FyZENhY2hlKCkgeyByZXR1cm4gY2FjaGU7IH07IHJldHVybiBjYWNoZTsgfVxuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChvYmopIHsgaWYgKG9iaiAmJiBvYmouX19lc01vZHVsZSkgeyByZXR1cm4gb2JqOyB9IGlmIChvYmogPT09IG51bGwgfHwgX3R5cGVvZihvYmopICE9PSBcIm9iamVjdFwiICYmIHR5cGVvZiBvYmogIT09IFwiZnVuY3Rpb25cIikgeyByZXR1cm4geyBkZWZhdWx0OiBvYmogfTsgfSB2YXIgY2FjaGUgPSBfZ2V0UmVxdWlyZVdpbGRjYXJkQ2FjaGUoKTsgaWYgKGNhY2hlICYmIGNhY2hlLmhhcyhvYmopKSB7IHJldHVybiBjYWNoZS5nZXQob2JqKTsgfSB2YXIgbmV3T2JqID0ge307IHZhciBoYXNQcm9wZXJ0eURlc2NyaXB0b3IgPSBPYmplY3QuZGVmaW5lUHJvcGVydHkgJiYgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjsgZm9yICh2YXIga2V5IGluIG9iaikgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkgeyB2YXIgZGVzYyA9IGhhc1Byb3BlcnR5RGVzY3JpcHRvciA/IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqLCBrZXkpIDogbnVsbDsgaWYgKGRlc2MgJiYgKGRlc2MuZ2V0IHx8IGRlc2Muc2V0KSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkobmV3T2JqLCBrZXksIGRlc2MpOyB9IGVsc2UgeyBuZXdPYmpba2V5XSA9IG9ialtrZXldOyB9IH0gfSBuZXdPYmouZGVmYXVsdCA9IG9iajsgaWYgKGNhY2hlKSB7IGNhY2hlLnNldChvYmosIG5ld09iaik7IH0gcmV0dXJuIG5ld09iajsgfVxuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IHJldHVybiBfYXJyYXlXaXRob3V0SG9sZXMoYXJyKSB8fCBfaXRlcmFibGVUb0FycmF5KGFycikgfHwgX3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5KGFycikgfHwgX25vbkl0ZXJhYmxlU3ByZWFkKCk7IH1cblxuZnVuY3Rpb24gX25vbkl0ZXJhYmxlU3ByZWFkKCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIHNwcmVhZCBub24taXRlcmFibGUgaW5zdGFuY2UuXFxuSW4gb3JkZXIgdG8gYmUgaXRlcmFibGUsIG5vbi1hcnJheSBvYmplY3RzIG11c3QgaGF2ZSBhIFtTeW1ib2wuaXRlcmF0b3JdKCkgbWV0aG9kLlwiKTsgfVxuXG5mdW5jdGlvbiBfdW5zdXBwb3J0ZWRJdGVyYWJsZVRvQXJyYXkobywgbWluTGVuKSB7IGlmICghbykgcmV0dXJuOyBpZiAodHlwZW9mIG8gPT09IFwic3RyaW5nXCIpIHJldHVybiBfYXJyYXlMaWtlVG9BcnJheShvLCBtaW5MZW4pOyB2YXIgbiA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKS5zbGljZSg4LCAtMSk7IGlmIChuID09PSBcIk9iamVjdFwiICYmIG8uY29uc3RydWN0b3IpIG4gPSBvLmNvbnN0cnVjdG9yLm5hbWU7IGlmIChuID09PSBcIk1hcFwiIHx8IG4gPT09IFwiU2V0XCIpIHJldHVybiBBcnJheS5mcm9tKG8pOyBpZiAobiA9PT0gXCJBcmd1bWVudHNcIiB8fCAvXig/OlVpfEkpbnQoPzo4fDE2fDMyKSg/OkNsYW1wZWQpP0FycmF5JC8udGVzdChuKSkgcmV0dXJuIF9hcnJheUxpa2VUb0FycmF5KG8sIG1pbkxlbik7IH1cblxuZnVuY3Rpb24gX2l0ZXJhYmxlVG9BcnJheShpdGVyKSB7IGlmICh0eXBlb2YgU3ltYm9sICE9PSBcInVuZGVmaW5lZFwiICYmIFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoaXRlcikpIHJldHVybiBBcnJheS5mcm9tKGl0ZXIpOyB9XG5cbmZ1bmN0aW9uIF9hcnJheVdpdGhvdXRIb2xlcyhhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgcmV0dXJuIF9hcnJheUxpa2VUb0FycmF5KGFycik7IH1cblxuZnVuY3Rpb24gX2FycmF5TGlrZVRvQXJyYXkoYXJyLCBsZW4pIHsgaWYgKGxlbiA9PSBudWxsIHx8IGxlbiA+IGFyci5sZW5ndGgpIGxlbiA9IGFyci5sZW5ndGg7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gbmV3IEFycmF5KGxlbik7IGkgPCBsZW47IGkrKykgeyBhcnIyW2ldID0gYXJyW2ldOyB9IHJldHVybiBhcnIyOyB9XG5cbi8qKlxuICogVElOIFZhbGlkYXRpb25cbiAqIFZhbGlkYXRlcyBUYXggSWRlbnRpZmljYXRpb24gTnVtYmVycyAoVElOcykgZnJvbSB0aGUgVVMsIEVVIG1lbWJlciBzdGF0ZXMgYW5kIHRoZSBVbml0ZWQgS2luZ2RvbS5cbiAqXG4gKiBFVS1VSzpcbiAqIE5hdGlvbmFsIFRJTiB2YWxpZGl0eSBpcyBjYWxjdWxhdGVkIHVzaW5nIHB1YmxpYyBhbGdvcml0aG1zIGFzIG1hZGUgYXZhaWxhYmxlIGJ5IERHIFRBWFVELlxuICpcbiAqIFNlZSBgaHR0cHM6Ly9lYy5ldXJvcGEuZXUvdGF4YXRpb25fY3VzdG9tcy90aW4vc3BlY3MvRlMtVElOJTIwQWxnb3JpdGhtcy1QdWJsaWMuZG9jeGAgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gKlxuICogVVM6XG4gKiBBbiBFbXBsb3llciBJZGVudGlmaWNhdGlvbiBOdW1iZXIgKEVJTiksIGFsc28ga25vd24gYXMgYSBGZWRlcmFsIFRheCBJZGVudGlmaWNhdGlvbiBOdW1iZXIsXG4gKiAgaXMgdXNlZCB0byBpZGVudGlmeSBhIGJ1c2luZXNzIGVudGl0eS5cbiAqXG4gKiBOT1RFUzpcbiAqICAtIFByZWZpeCA0NyBpcyBiZWluZyByZXNlcnZlZCBmb3IgZnV0dXJlIHVzZVxuICogIC0gUHJlZml4ZXMgMjYsIDI3LCA0NSwgNDYgYW5kIDQ3IHdlcmUgcHJldmlvdXNseSBhc3NpZ25lZCBieSB0aGUgUGhpbGFkZWxwaGlhIGNhbXB1cy5cbiAqXG4gKiBTZWUgYGh0dHA6Ly93d3cuaXJzLmdvdi9CdXNpbmVzc2VzL1NtYWxsLUJ1c2luZXNzZXMtJi1TZWxmLUVtcGxveWVkL0hvdy1FSU5zLWFyZS1Bc3NpZ25lZC1hbmQtVmFsaWQtRUlOLVByZWZpeGVzYFxuICogZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gKi9cbi8vIExvY2FsZSBmdW5jdGlvbnNcblxuLypcbiAqIGJnLUJHIHZhbGlkYXRpb24gZnVuY3Rpb25cbiAqIChFZGluZW4gZ3Jhxb5kYW5za2kgbm9tZXIgKEVHTi/QldCT0J0pLCBwZXJzb25zIG9ubHkpXG4gKiBDaGVja3MgaWYgYmlydGggZGF0ZSAoZmlyc3Qgc2l4IGRpZ2l0cykgaXMgdmFsaWQgYW5kIGNhbGN1bGF0ZXMgY2hlY2sgKGxhc3QpIGRpZ2l0XG4gKi9cbmZ1bmN0aW9uIGJnQmdDaGVjayh0aW4pIHtcbiAgLy8gRXh0cmFjdCBmdWxsIHllYXIsIG5vcm1hbGl6ZSBtb250aCBhbmQgY2hlY2sgYmlydGggZGF0ZSB2YWxpZGl0eVxuICB2YXIgY2VudHVyeV95ZWFyID0gdGluLnNsaWNlKDAsIDIpO1xuICB2YXIgbW9udGggPSBwYXJzZUludCh0aW4uc2xpY2UoMiwgNCksIDEwKTtcblxuICBpZiAobW9udGggPiA0MCkge1xuICAgIG1vbnRoIC09IDQwO1xuICAgIGNlbnR1cnlfeWVhciA9IFwiMjBcIi5jb25jYXQoY2VudHVyeV95ZWFyKTtcbiAgfSBlbHNlIGlmIChtb250aCA+IDIwKSB7XG4gICAgbW9udGggLT0gMjA7XG4gICAgY2VudHVyeV95ZWFyID0gXCIxOFwiLmNvbmNhdChjZW50dXJ5X3llYXIpO1xuICB9IGVsc2Uge1xuICAgIGNlbnR1cnlfeWVhciA9IFwiMTlcIi5jb25jYXQoY2VudHVyeV95ZWFyKTtcbiAgfVxuXG4gIGlmIChtb250aCA8IDEwKSB7XG4gICAgbW9udGggPSBcIjBcIi5jb25jYXQobW9udGgpO1xuICB9XG5cbiAgdmFyIGRhdGUgPSBcIlwiLmNvbmNhdChjZW50dXJ5X3llYXIsIFwiL1wiKS5jb25jYXQobW9udGgsIFwiL1wiKS5jb25jYXQodGluLnNsaWNlKDQsIDYpKTtcblxuICBpZiAoISgwLCBfaXNEYXRlLmRlZmF1bHQpKGRhdGUsICdZWVlZL01NL0REJykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0gLy8gc3BsaXQgZGlnaXRzIGludG8gYW4gYXJyYXkgZm9yIGZ1cnRoZXIgcHJvY2Vzc2luZ1xuXG5cbiAgdmFyIGRpZ2l0cyA9IHRpbi5zcGxpdCgnJykubWFwKGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuIHBhcnNlSW50KGEsIDEwKTtcbiAgfSk7IC8vIENhbGN1bGF0ZSBjaGVja3N1bSBieSBtdWx0aXBseWluZyBkaWdpdHMgd2l0aCBmaXhlZCB2YWx1ZXNcblxuICB2YXIgbXVsdGlwX2xvb2t1cCA9IFsyLCA0LCA4LCA1LCAxMCwgOSwgNywgMywgNl07XG4gIHZhciBjaGVja3N1bSA9IDA7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtdWx0aXBfbG9va3VwLmxlbmd0aDsgaSsrKSB7XG4gICAgY2hlY2tzdW0gKz0gZGlnaXRzW2ldICogbXVsdGlwX2xvb2t1cFtpXTtcbiAgfVxuXG4gIGNoZWNrc3VtID0gY2hlY2tzdW0gJSAxMSA9PT0gMTAgPyAwIDogY2hlY2tzdW0gJSAxMTtcbiAgcmV0dXJuIGNoZWNrc3VtID09PSBkaWdpdHNbOV07XG59XG4vKlxuICogY3MtQ1ogdmFsaWRhdGlvbiBmdW5jdGlvblxuICogKFJvZG7DqSDEjcOtc2xvIChSxIwpLCBwZXJzb25zIG9ubHkpXG4gKiBDaGVja3MgaWYgYmlydGggZGF0ZSAoZmlyc3Qgc2l4IGRpZ2l0cykgaXMgdmFsaWQgYW5kIGRpdmlzaWJpbGl0eSBieSAxMVxuICogTWF0ZXJpYWwgbm90IGluIERHIFRBWFVEIGRvY3VtZW50IHNvdXJjZWQgZnJvbTpcbiAqIC1gaHR0cHM6Ly9sb3JlbmMuaW5mby8zTUEzODEvb3ZlcmVuaS1zcHJhdm5vc3RpLXJvZG5laG8tY2lzbGEuaHRtYFxuICogLWBodHRwczovL3d3dy5tdmNyLmN6L2NsYW5lay9yYWR5LWEtc2x1emJ5LWRva3VtZW50eS1yb2RuZS1jaXNsby5hc3B4YFxuICovXG5cblxuZnVuY3Rpb24gY3NDekNoZWNrKHRpbikge1xuICB0aW4gPSB0aW4ucmVwbGFjZSgvXFxXLywgJycpOyAvLyBFeHRyYWN0IGZ1bGwgeWVhciBmcm9tIFRJTiBsZW5ndGhcblxuICB2YXIgZnVsbF95ZWFyID0gcGFyc2VJbnQodGluLnNsaWNlKDAsIDIpLCAxMCk7XG5cbiAgaWYgKHRpbi5sZW5ndGggPT09IDEwKSB7XG4gICAgaWYgKGZ1bGxfeWVhciA8IDU0KSB7XG4gICAgICBmdWxsX3llYXIgPSBcIjIwXCIuY29uY2F0KGZ1bGxfeWVhcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZ1bGxfeWVhciA9IFwiMTlcIi5jb25jYXQoZnVsbF95ZWFyKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKHRpbi5zbGljZSg2KSA9PT0gJzAwMCcpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IC8vIFRocmVlLXplcm8gc2VyaWFsIG5vdCBhc3NpZ25lZCBiZWZvcmUgMTk1NFxuXG5cbiAgICBpZiAoZnVsbF95ZWFyIDwgNTQpIHtcbiAgICAgIGZ1bGxfeWVhciA9IFwiMTlcIi5jb25jYXQoZnVsbF95ZWFyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlOyAvLyBObyAxOFhYIHllYXJzIHNlZW4gaW4gYW55IG9mIHRoZSByZXNvdXJjZXNcbiAgICB9XG4gIH0gLy8gQWRkIG1pc3NpbmcgemVybyBpZiBuZWVkZWRcblxuXG4gIGlmIChmdWxsX3llYXIubGVuZ3RoID09PSAzKSB7XG4gICAgZnVsbF95ZWFyID0gW2Z1bGxfeWVhci5zbGljZSgwLCAyKSwgJzAnLCBmdWxsX3llYXIuc2xpY2UoMildLmpvaW4oJycpO1xuICB9IC8vIEV4dHJhY3QgbW9udGggZnJvbSBUSU4gYW5kIG5vcm1hbGl6ZVxuXG5cbiAgdmFyIG1vbnRoID0gcGFyc2VJbnQodGluLnNsaWNlKDIsIDQpLCAxMCk7XG5cbiAgaWYgKG1vbnRoID4gNTApIHtcbiAgICBtb250aCAtPSA1MDtcbiAgfVxuXG4gIGlmIChtb250aCA+IDIwKSB7XG4gICAgLy8gTW9udGgtcGx1cy10d2VudHkgd2FzIG9ubHkgaW50cm9kdWNlZCBpbiAyMDA0XG4gICAgaWYgKHBhcnNlSW50KGZ1bGxfeWVhciwgMTApIDwgMjAwNCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIG1vbnRoIC09IDIwO1xuICB9XG5cbiAgaWYgKG1vbnRoIDwgMTApIHtcbiAgICBtb250aCA9IFwiMFwiLmNvbmNhdChtb250aCk7XG4gIH0gLy8gQ2hlY2sgZGF0ZSB2YWxpZGl0eVxuXG5cbiAgdmFyIGRhdGUgPSBcIlwiLmNvbmNhdChmdWxsX3llYXIsIFwiL1wiKS5jb25jYXQobW9udGgsIFwiL1wiKS5jb25jYXQodGluLnNsaWNlKDQsIDYpKTtcblxuICBpZiAoISgwLCBfaXNEYXRlLmRlZmF1bHQpKGRhdGUsICdZWVlZL01NL0REJykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0gLy8gVmVyaWZ5IGRpdmlzaWJpbGl0eSBieSAxMVxuXG5cbiAgaWYgKHRpbi5sZW5ndGggPT09IDEwKSB7XG4gICAgaWYgKHBhcnNlSW50KHRpbiwgMTApICUgMTEgIT09IDApIHtcbiAgICAgIC8vIFNvbWUgbnVtYmVycyB1cCB0byBhbmQgaW5jbHVkaW5nIDE5ODUgYXJlIHN0aWxsIHZhbGlkIGlmXG4gICAgICAvLyBjaGVjayAobGFzdCkgZGlnaXQgZXF1YWxzIDAgYW5kIG1vZHVsbyBvZiBmaXJzdCA5IGRpZ2l0cyBlcXVhbHMgMTBcbiAgICAgIHZhciBjaGVja2RpZ2l0ID0gcGFyc2VJbnQodGluLnNsaWNlKDAsIDkpLCAxMCkgJSAxMTtcblxuICAgICAgaWYgKHBhcnNlSW50KGZ1bGxfeWVhciwgMTApIDwgMTk4NiAmJiBjaGVja2RpZ2l0ID09PSAxMCkge1xuICAgICAgICBpZiAocGFyc2VJbnQodGluLnNsaWNlKDkpLCAxMCkgIT09IDApIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cbi8qXG4gKiBkZS1BVCB2YWxpZGF0aW9uIGZ1bmN0aW9uXG4gKiAoQWJnYWJlbmtvbnRvbnVtbWVyLCBwZXJzb25zL2VudGl0aWVzKVxuICogVmVyaWZ5IFRJTiB2YWxpZGl0eSBieSBjYWxsaW5nIGx1aG5DaGVjaygpXG4gKi9cblxuXG5mdW5jdGlvbiBkZUF0Q2hlY2sodGluKSB7XG4gIHJldHVybiBhbGdvcml0aG1zLmx1aG5DaGVjayh0aW4pO1xufVxuLypcbiAqIGRlLURFIHZhbGlkYXRpb24gZnVuY3Rpb25cbiAqIChTdGV1ZXJpZGVudGlmaWthdGlvbnNudW1tZXIgKFN0ZXVlci1JZE5yLiksIHBlcnNvbnMgb25seSlcbiAqIFRlc3RzIGZvciBzaW5nbGUgZHVwbGljYXRlL3RyaXBsaWNhdGUgdmFsdWUsIHRoZW4gY2FsY3VsYXRlcyBJU08gNzA2NCBjaGVjayAobGFzdCkgZGlnaXRcbiAqIFBhcnRpYWwgaW1wbGVtZW50YXRpb24gb2Ygc3BlYyAoc2FtZSByZXN1bHQgd2l0aCBib3RoIGFsZ29yaXRobXMgYWx3YXlzKVxuICovXG5cblxuZnVuY3Rpb24gZGVEZUNoZWNrKHRpbikge1xuICAvLyBTcGxpdCBkaWdpdHMgaW50byBhbiBhcnJheSBmb3IgZnVydGhlciBwcm9jZXNzaW5nXG4gIHZhciBkaWdpdHMgPSB0aW4uc3BsaXQoJycpLm1hcChmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiBwYXJzZUludChhLCAxMCk7XG4gIH0pOyAvLyBGaWxsIGFycmF5IHdpdGggc3RyaW5ncyBvZiBudW1iZXIgcG9zaXRpb25zXG5cbiAgdmFyIG9jY3VyZW5jZXMgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGRpZ2l0cy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICBvY2N1cmVuY2VzLnB1c2goJycpO1xuXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBkaWdpdHMubGVuZ3RoIC0gMTsgaisrKSB7XG4gICAgICBpZiAoZGlnaXRzW2ldID09PSBkaWdpdHNbal0pIHtcbiAgICAgICAgb2NjdXJlbmNlc1tpXSArPSBqO1xuICAgICAgfVxuICAgIH1cbiAgfSAvLyBSZW1vdmUgZGlnaXRzIHdpdGggb25lIG9jY3VyZW5jZSBhbmQgdGVzdCBmb3Igb25seSBvbmUgZHVwbGljYXRlL3RyaXBsaWNhdGVcblxuXG4gIG9jY3VyZW5jZXMgPSBvY2N1cmVuY2VzLmZpbHRlcihmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiBhLmxlbmd0aCA+IDE7XG4gIH0pO1xuXG4gIGlmIChvY2N1cmVuY2VzLmxlbmd0aCAhPT0gMiAmJiBvY2N1cmVuY2VzLmxlbmd0aCAhPT0gMykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSAvLyBJbiBjYXNlIG9mIHRyaXBsaWNhdGUgdmFsdWUgb25seSB0d28gZGlnaXRzIGFyZSBhbGxvd2VkIG5leHQgdG8gZWFjaCBvdGhlclxuXG5cbiAgaWYgKG9jY3VyZW5jZXNbMF0ubGVuZ3RoID09PSAzKSB7XG4gICAgdmFyIHRyaXBfbG9jYXRpb25zID0gb2NjdXJlbmNlc1swXS5zcGxpdCgnJykubWFwKGZ1bmN0aW9uIChhKSB7XG4gICAgICByZXR1cm4gcGFyc2VJbnQoYSwgMTApO1xuICAgIH0pO1xuICAgIHZhciByZWN1cnJlbnQgPSAwOyAvLyBBbW91bnQgb2YgbmVpZ2hib3VyIG9jY3VyZW5jZXNcblxuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCB0cmlwX2xvY2F0aW9ucy5sZW5ndGggLSAxOyBfaSsrKSB7XG4gICAgICBpZiAodHJpcF9sb2NhdGlvbnNbX2ldICsgMSA9PT0gdHJpcF9sb2NhdGlvbnNbX2kgKyAxXSkge1xuICAgICAgICByZWN1cnJlbnQgKz0gMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocmVjdXJyZW50ID09PSAyKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGFsZ29yaXRobXMuaXNvNzA2NENoZWNrKHRpbik7XG59XG4vKlxuICogZGstREsgdmFsaWRhdGlvbiBmdW5jdGlvblxuICogKENQUi1udW1tZXIgKHBlcnNvbm51bW1lciksIHBlcnNvbnMgb25seSlcbiAqIENoZWNrcyBpZiBiaXJ0aCBkYXRlIChmaXJzdCBzaXggZGlnaXRzKSBpcyB2YWxpZCBhbmQgYXNzaWduZWQgdG8gY2VudHVyeSAoc2V2ZW50aCkgZGlnaXQsXG4gKiBhbmQgY2FsY3VsYXRlcyBjaGVjayAobGFzdCkgZGlnaXRcbiAqL1xuXG5cbmZ1bmN0aW9uIGRrRGtDaGVjayh0aW4pIHtcbiAgdGluID0gdGluLnJlcGxhY2UoL1xcVy8sICcnKTsgLy8gRXh0cmFjdCB5ZWFyLCBjaGVjayBpZiB2YWxpZCBmb3IgZ2l2ZW4gY2VudHVyeSBkaWdpdCBhbmQgYWRkIGNlbnR1cnlcblxuICB2YXIgeWVhciA9IHBhcnNlSW50KHRpbi5zbGljZSg0LCA2KSwgMTApO1xuICB2YXIgY2VudHVyeV9kaWdpdCA9IHRpbi5zbGljZSg2LCA3KTtcblxuICBzd2l0Y2ggKGNlbnR1cnlfZGlnaXQpIHtcbiAgICBjYXNlICcwJzpcbiAgICBjYXNlICcxJzpcbiAgICBjYXNlICcyJzpcbiAgICBjYXNlICczJzpcbiAgICAgIHllYXIgPSBcIjE5XCIuY29uY2F0KHllYXIpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICc0JzpcbiAgICBjYXNlICc5JzpcbiAgICAgIGlmICh5ZWFyIDwgMzcpIHtcbiAgICAgICAgeWVhciA9IFwiMjBcIi5jb25jYXQoeWVhcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB5ZWFyID0gXCIxOVwiLmNvbmNhdCh5ZWFyKTtcbiAgICAgIH1cblxuICAgICAgYnJlYWs7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgaWYgKHllYXIgPCAzNykge1xuICAgICAgICB5ZWFyID0gXCIyMFwiLmNvbmNhdCh5ZWFyKTtcbiAgICAgIH0gZWxzZSBpZiAoeWVhciA+IDU4KSB7XG4gICAgICAgIHllYXIgPSBcIjE4XCIuY29uY2F0KHllYXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBicmVhaztcbiAgfSAvLyBBZGQgbWlzc2luZyB6ZXJvIGlmIG5lZWRlZFxuXG5cbiAgaWYgKHllYXIubGVuZ3RoID09PSAzKSB7XG4gICAgeWVhciA9IFt5ZWFyLnNsaWNlKDAsIDIpLCAnMCcsIHllYXIuc2xpY2UoMildLmpvaW4oJycpO1xuICB9IC8vIENoZWNrIGRhdGUgdmFsaWRpdHlcblxuXG4gIHZhciBkYXRlID0gXCJcIi5jb25jYXQoeWVhciwgXCIvXCIpLmNvbmNhdCh0aW4uc2xpY2UoMiwgNCksIFwiL1wiKS5jb25jYXQodGluLnNsaWNlKDAsIDIpKTtcblxuICBpZiAoISgwLCBfaXNEYXRlLmRlZmF1bHQpKGRhdGUsICdZWVlZL01NL0REJykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0gLy8gU3BsaXQgZGlnaXRzIGludG8gYW4gYXJyYXkgZm9yIGZ1cnRoZXIgcHJvY2Vzc2luZ1xuXG5cbiAgdmFyIGRpZ2l0cyA9IHRpbi5zcGxpdCgnJykubWFwKGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuIHBhcnNlSW50KGEsIDEwKTtcbiAgfSk7XG4gIHZhciBjaGVja3N1bSA9IDA7XG4gIHZhciB3ZWlnaHQgPSA0OyAvLyBNdWx0aXBseSBieSB3ZWlnaHQgYW5kIGFkZCB0byBjaGVja3N1bVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgOTsgaSsrKSB7XG4gICAgY2hlY2tzdW0gKz0gZGlnaXRzW2ldICogd2VpZ2h0O1xuICAgIHdlaWdodCAtPSAxO1xuXG4gICAgaWYgKHdlaWdodCA9PT0gMSkge1xuICAgICAgd2VpZ2h0ID0gNztcbiAgICB9XG4gIH1cblxuICBjaGVja3N1bSAlPSAxMTtcblxuICBpZiAoY2hlY2tzdW0gPT09IDEpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gY2hlY2tzdW0gPT09IDAgPyBkaWdpdHNbOV0gPT09IDAgOiBkaWdpdHNbOV0gPT09IDExIC0gY2hlY2tzdW07XG59XG4vKlxuICogZWwtQ1kgdmFsaWRhdGlvbiBmdW5jdGlvblxuICogKEFyaXRobW9zIEZvcm9sb2dpa291IE1pdHJvb3UgKEFGTS/Okc6mzpwpLCBwZXJzb25zIG9ubHkpXG4gKiBWZXJpZnkgVElOIHZhbGlkaXR5IGJ5IGNhbGN1bGF0aW5nIEFTQ0lJIHZhbHVlIG9mIGNoZWNrIChsYXN0KSBjaGFyYWN0ZXJcbiAqL1xuXG5cbmZ1bmN0aW9uIGVsQ3lDaGVjayh0aW4pIHtcbiAgLy8gc3BsaXQgZGlnaXRzIGludG8gYW4gYXJyYXkgZm9yIGZ1cnRoZXIgcHJvY2Vzc2luZ1xuICB2YXIgZGlnaXRzID0gdGluLnNsaWNlKDAsIDgpLnNwbGl0KCcnKS5tYXAoZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gcGFyc2VJbnQoYSwgMTApO1xuICB9KTtcbiAgdmFyIGNoZWNrc3VtID0gMDsgLy8gYWRkIGRpZ2l0cyBpbiBldmVuIHBsYWNlc1xuXG4gIGZvciAodmFyIGkgPSAxOyBpIDwgZGlnaXRzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgY2hlY2tzdW0gKz0gZGlnaXRzW2ldO1xuICB9IC8vIGFkZCBkaWdpdHMgaW4gb2RkIHBsYWNlc1xuXG5cbiAgZm9yICh2YXIgX2kyID0gMDsgX2kyIDwgZGlnaXRzLmxlbmd0aDsgX2kyICs9IDIpIHtcbiAgICBpZiAoZGlnaXRzW19pMl0gPCAyKSB7XG4gICAgICBjaGVja3N1bSArPSAxIC0gZGlnaXRzW19pMl07XG4gICAgfSBlbHNlIHtcbiAgICAgIGNoZWNrc3VtICs9IDIgKiAoZGlnaXRzW19pMl0gLSAyKSArIDU7XG5cbiAgICAgIGlmIChkaWdpdHNbX2kyXSA+IDQpIHtcbiAgICAgICAgY2hlY2tzdW0gKz0gMjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShjaGVja3N1bSAlIDI2ICsgNjUpID09PSB0aW4uY2hhckF0KDgpO1xufVxuLypcbiAqIGVsLUdSIHZhbGlkYXRpb24gZnVuY3Rpb25cbiAqIChBcml0aG1vcyBGb3JvbG9naWtvdSBNaXRyb291IChBRk0vzpHOps6cKSwgcGVyc29ucy9lbnRpdGllcylcbiAqIFZlcmlmeSBUSU4gdmFsaWRpdHkgYnkgY2FsY3VsYXRpbmcgY2hlY2sgKGxhc3QpIGRpZ2l0XG4gKiBBbGdvcml0aG0gbm90IGluIERHIFRBWFVEIGRvY3VtZW50LSBzb3VyY2VkIGZyb206XG4gKiAtIGBodHRwOi8vZXBpeGVpcmlzaS5nci8lQ0UlOUElQ0UlQTElQ0UlOTklQ0UlQTMlQ0UlOTklQ0UlOUMlQ0UlOTEtJUNFJTk4JUNFJTk1JUNFJTlDJUNFJTkxJUNFJUE0JUNFJTkxLSVDRSVBNiVDRSU5RiVDRSVBMSVDRSU5RiVDRSU5QiVDRSU5RiVDRSU5MyVDRSU5OSVDRSU5MSVDRSVBMy0lQ0UlOUElQ0UlOTElQ0UlOTktJUNFJTlCJUNFJTlGJUNFJTkzJUNFJTk5JUNFJUEzJUNFJUE0JUNFJTk5JUNFJTlBJUNFJTk3JUNFJUEzLzIzNzkxLyVDRSU5MSVDRiU4MSVDRSVCOSVDRSVCOCVDRSVCQyVDRiU4QyVDRiU4Mi0lQ0UlQTYlQ0UlQkYlQ0YlODElQ0UlQkYlQ0UlQkIlQ0UlQkYlQ0UlQjMlQ0UlQjklQ0UlQkElQ0UlQkYlQ0YlOEQtJUNFJTlDJUNFJUI3JUNGJTg0JUNGJTgxJUNGJThFJUNFJUJGJUNGJTg1YFxuICovXG5cblxuZnVuY3Rpb24gZWxHckNoZWNrKHRpbikge1xuICAvLyBzcGxpdCBkaWdpdHMgaW50byBhbiBhcnJheSBmb3IgZnVydGhlciBwcm9jZXNzaW5nXG4gIHZhciBkaWdpdHMgPSB0aW4uc3BsaXQoJycpLm1hcChmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiBwYXJzZUludChhLCAxMCk7XG4gIH0pO1xuICB2YXIgY2hlY2tzdW0gPSAwO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgODsgaSsrKSB7XG4gICAgY2hlY2tzdW0gKz0gZGlnaXRzW2ldICogTWF0aC5wb3coMiwgOCAtIGkpO1xuICB9XG5cbiAgcmV0dXJuIGNoZWNrc3VtICUgMTEgJSAxMCA9PT0gZGlnaXRzWzhdO1xufVxuLypcbiAqIGVuLUdCIHZhbGlkYXRpb24gZnVuY3Rpb24gKHNob3VsZCBnbyBoZXJlIGlmIG5lZWRlZClcbiAqIChOYXRpb25hbCBJbnN1cmFuY2UgTnVtYmVyIChOSU5PKSBvciBVbmlxdWUgVGF4cGF5ZXIgUmVmZXJlbmNlIChVVFIpLFxuICogcGVyc29ucy9lbnRpdGllcyByZXNwZWN0aXZlbHkpXG4gKi9cblxuLypcbiAqIGVuLUlFIHZhbGlkYXRpb24gZnVuY3Rpb25cbiAqIChQZXJzb25hbCBQdWJsaWMgU2VydmljZSBOdW1iZXIgKFBQUyBObyksIHBlcnNvbnMgb25seSlcbiAqIFZlcmlmeSBUSU4gdmFsaWRpdHkgYnkgY2FsY3VsYXRpbmcgY2hlY2sgKHNlY29uZCB0byBsYXN0KSBjaGFyYWN0ZXJcbiAqL1xuXG5cbmZ1bmN0aW9uIGVuSWVDaGVjayh0aW4pIHtcbiAgdmFyIGNoZWNrc3VtID0gYWxnb3JpdGhtcy5yZXZlcnNlTXVsdGlwbHlBbmRTdW0odGluLnNwbGl0KCcnKS5zbGljZSgwLCA3KS5tYXAoZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gcGFyc2VJbnQoYSwgMTApO1xuICB9KSwgOCk7XG5cbiAgaWYgKHRpbi5sZW5ndGggPT09IDkgJiYgdGluWzhdICE9PSAnVycpIHtcbiAgICBjaGVja3N1bSArPSAodGluWzhdLmNoYXJDb2RlQXQoMCkgLSA2NCkgKiA5O1xuICB9XG5cbiAgY2hlY2tzdW0gJT0gMjM7XG5cbiAgaWYgKGNoZWNrc3VtID09PSAwKSB7XG4gICAgcmV0dXJuIHRpbls3XS50b1VwcGVyQ2FzZSgpID09PSAnVyc7XG4gIH1cblxuICByZXR1cm4gdGluWzddLnRvVXBwZXJDYXNlKCkgPT09IFN0cmluZy5mcm9tQ2hhckNvZGUoNjQgKyBjaGVja3N1bSk7XG59IC8vIFZhbGlkIFVTIElSUyBjYW1wdXMgcHJlZml4ZXNcblxuXG52YXIgZW5Vc0NhbXB1c1ByZWZpeCA9IHtcbiAgYW5kb3ZlcjogWycxMCcsICcxMiddLFxuICBhdGxhbnRhOiBbJzYwJywgJzY3J10sXG4gIGF1c3RpbjogWyc1MCcsICc1MyddLFxuICBicm9va2hhdmVuOiBbJzAxJywgJzAyJywgJzAzJywgJzA0JywgJzA1JywgJzA2JywgJzExJywgJzEzJywgJzE0JywgJzE2JywgJzIxJywgJzIyJywgJzIzJywgJzI1JywgJzM0JywgJzUxJywgJzUyJywgJzU0JywgJzU1JywgJzU2JywgJzU3JywgJzU4JywgJzU5JywgJzY1J10sXG4gIGNpbmNpbm5hdGk6IFsnMzAnLCAnMzInLCAnMzUnLCAnMzYnLCAnMzcnLCAnMzgnLCAnNjEnXSxcbiAgZnJlc25vOiBbJzE1JywgJzI0J10sXG4gIGludGVybmV0OiBbJzIwJywgJzI2JywgJzI3JywgJzQ1JywgJzQ2JywgJzQ3J10sXG4gIGthbnNhczogWyc0MCcsICc0NCddLFxuICBtZW1waGlzOiBbJzk0JywgJzk1J10sXG4gIG9nZGVuOiBbJzgwJywgJzkwJ10sXG4gIHBoaWxhZGVscGhpYTogWyczMycsICczOScsICc0MScsICc0MicsICc0MycsICc0NicsICc0OCcsICc2MicsICc2MycsICc2NCcsICc2NicsICc2OCcsICc3MScsICc3MicsICc3MycsICc3NCcsICc3NScsICc3NicsICc3NycsICc4MScsICc4MicsICc4MycsICc4NCcsICc4NScsICc4NicsICc4NycsICc4OCcsICc5MScsICc5MicsICc5MycsICc5OCcsICc5OSddLFxuICBzYmE6IFsnMzEnXVxufTsgLy8gUmV0dXJuIGFuIGFycmF5IG9mIGFsbCBVUyBJUlMgY2FtcHVzIHByZWZpeGVzXG5cbmZ1bmN0aW9uIGVuVXNHZXRQcmVmaXhlcygpIHtcbiAgdmFyIHByZWZpeGVzID0gW107XG5cbiAgZm9yICh2YXIgbG9jYXRpb24gaW4gZW5Vc0NhbXB1c1ByZWZpeCkge1xuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9nb3R3YXJsb3N0L2lzdGFuYnVsL2Jsb2IvbWFzdGVyL2lnbm9yaW5nLWNvZGUtZm9yLWNvdmVyYWdlLm1kI2lnbm9yaW5nLWNvZGUtZm9yLWNvdmVyYWdlLXB1cnBvc2VzXG4gICAgLy8gaXN0YW5idWwgaWdub3JlIGVsc2VcbiAgICBpZiAoZW5Vc0NhbXB1c1ByZWZpeC5oYXNPd25Qcm9wZXJ0eShsb2NhdGlvbikpIHtcbiAgICAgIHByZWZpeGVzLnB1c2guYXBwbHkocHJlZml4ZXMsIF90b0NvbnN1bWFibGVBcnJheShlblVzQ2FtcHVzUHJlZml4W2xvY2F0aW9uXSkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwcmVmaXhlcztcbn1cbi8qXG4gKiBlbi1VUyB2YWxpZGF0aW9uIGZ1bmN0aW9uXG4gKiBWZXJpZnkgdGhhdCB0aGUgVElOIHN0YXJ0cyB3aXRoIGEgdmFsaWQgSVJTIGNhbXB1cyBwcmVmaXhcbiAqL1xuXG5cbmZ1bmN0aW9uIGVuVXNDaGVjayh0aW4pIHtcbiAgcmV0dXJuIGVuVXNHZXRQcmVmaXhlcygpLmluZGV4T2YodGluLnN1YnN0cigwLCAyKSkgIT09IC0xO1xufVxuLypcbiAqIGVzLUVTIHZhbGlkYXRpb24gZnVuY3Rpb25cbiAqIChEb2N1bWVudG8gTmFjaW9uYWwgZGUgSWRlbnRpZGFkIChETkkpXG4gKiBvciBOw7ptZXJvIGRlIElkZW50aWZpY2FjacOzbiBkZSBFeHRyYW5qZXJvIChOSUUpLCBwZXJzb25zIG9ubHkpXG4gKiBWZXJpZnkgVElOIHZhbGlkaXR5IGJ5IGNhbGN1bGF0aW5nIGNoZWNrIChsYXN0KSBjaGFyYWN0ZXJcbiAqL1xuXG5cbmZ1bmN0aW9uIGVzRXNDaGVjayh0aW4pIHtcbiAgLy8gU3BsaXQgY2hhcmFjdGVycyBpbnRvIGFuIGFycmF5IGZvciBmdXJ0aGVyIHByb2Nlc3NpbmdcbiAgdmFyIGNoYXJzID0gdGluLnRvVXBwZXJDYXNlKCkuc3BsaXQoJycpOyAvLyBSZXBsYWNlIGluaXRpYWwgbGV0dGVyIGlmIG5lZWRlZFxuXG4gIGlmIChpc05hTihwYXJzZUludChjaGFyc1swXSwgMTApKSAmJiBjaGFycy5sZW5ndGggPiAxKSB7XG4gICAgdmFyIGxlYWRfcmVwbGFjZSA9IDA7XG5cbiAgICBzd2l0Y2ggKGNoYXJzWzBdKSB7XG4gICAgICBjYXNlICdZJzpcbiAgICAgICAgbGVhZF9yZXBsYWNlID0gMTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ1onOlxuICAgICAgICBsZWFkX3JlcGxhY2UgPSAyO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICB9XG5cbiAgICBjaGFycy5zcGxpY2UoMCwgMSwgbGVhZF9yZXBsYWNlKTsgLy8gRmlsbCB3aXRoIHplcm9zIGlmIHNtYWxsZXIgdGhhbiBwcm9wZXJcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoY2hhcnMubGVuZ3RoIDwgOSkge1xuICAgICAgY2hhcnMudW5zaGlmdCgwKTtcbiAgICB9XG4gIH0gLy8gQ2FsY3VsYXRlIGNoZWNrc3VtIGFuZCBjaGVjayBhY2NvcmRpbmcgdG8gbG9va3VwXG5cblxuICB2YXIgbG9va3VwID0gWydUJywgJ1InLCAnVycsICdBJywgJ0cnLCAnTScsICdZJywgJ0YnLCAnUCcsICdEJywgJ1gnLCAnQicsICdOJywgJ0onLCAnWicsICdTJywgJ1EnLCAnVicsICdIJywgJ0wnLCAnQycsICdLJywgJ0UnXTtcbiAgY2hhcnMgPSBjaGFycy5qb2luKCcnKTtcbiAgdmFyIGNoZWNrc3VtID0gcGFyc2VJbnQoY2hhcnMuc2xpY2UoMCwgOCksIDEwKSAlIDIzO1xuICByZXR1cm4gY2hhcnNbOF0gPT09IGxvb2t1cFtjaGVja3N1bV07XG59XG4vKlxuICogZXQtRUUgdmFsaWRhdGlvbiBmdW5jdGlvblxuICogKElzaWt1a29vZCAoSUspLCBwZXJzb25zIG9ubHkpXG4gKiBDaGVja3MgaWYgYmlydGggZGF0ZSAoY2VudHVyeSBkaWdpdCBhbmQgc2l4IGZvbGxvd2luZykgaXMgdmFsaWQgYW5kIGNhbGN1bGF0ZXMgY2hlY2sgKGxhc3QpIGRpZ2l0XG4gKiBNYXRlcmlhbCBub3QgaW4gREcgVEFYVUQgZG9jdW1lbnQgc291cmNlZCBmcm9tOlxuICogLSBgaHR0cHM6Ly93d3cub2VjZC5vcmcvdGF4L2F1dG9tYXRpYy1leGNoYW5nZS9jcnMtaW1wbGVtZW50YXRpb24tYW5kLWFzc2lzdGFuY2UvdGF4LWlkZW50aWZpY2F0aW9uLW51bWJlcnMvRXN0b25pYS1USU4ucGRmYFxuICovXG5cblxuZnVuY3Rpb24gZXRFZUNoZWNrKHRpbikge1xuICAvLyBFeHRyYWN0IHllYXIgYW5kIGFkZCBjZW50dXJ5XG4gIHZhciBmdWxsX3llYXIgPSB0aW4uc2xpY2UoMSwgMyk7XG4gIHZhciBjZW50dXJ5X2RpZ2l0ID0gdGluLnNsaWNlKDAsIDEpO1xuXG4gIHN3aXRjaCAoY2VudHVyeV9kaWdpdCkge1xuICAgIGNhc2UgJzEnOlxuICAgIGNhc2UgJzInOlxuICAgICAgZnVsbF95ZWFyID0gXCIxOFwiLmNvbmNhdChmdWxsX3llYXIpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICczJzpcbiAgICBjYXNlICc0JzpcbiAgICAgIGZ1bGxfeWVhciA9IFwiMTlcIi5jb25jYXQoZnVsbF95ZWFyKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIGZ1bGxfeWVhciA9IFwiMjBcIi5jb25jYXQoZnVsbF95ZWFyKTtcbiAgICAgIGJyZWFrO1xuICB9IC8vIENoZWNrIGRhdGUgdmFsaWRpdHlcblxuXG4gIHZhciBkYXRlID0gXCJcIi5jb25jYXQoZnVsbF95ZWFyLCBcIi9cIikuY29uY2F0KHRpbi5zbGljZSgzLCA1KSwgXCIvXCIpLmNvbmNhdCh0aW4uc2xpY2UoNSwgNykpO1xuXG4gIGlmICghKDAsIF9pc0RhdGUuZGVmYXVsdCkoZGF0ZSwgJ1lZWVkvTU0vREQnKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSAvLyBTcGxpdCBkaWdpdHMgaW50byBhbiBhcnJheSBmb3IgZnVydGhlciBwcm9jZXNzaW5nXG5cblxuICB2YXIgZGlnaXRzID0gdGluLnNwbGl0KCcnKS5tYXAoZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gcGFyc2VJbnQoYSwgMTApO1xuICB9KTtcbiAgdmFyIGNoZWNrc3VtID0gMDtcbiAgdmFyIHdlaWdodCA9IDE7IC8vIE11bHRpcGx5IGJ5IHdlaWdodCBhbmQgYWRkIHRvIGNoZWNrc3VtXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgY2hlY2tzdW0gKz0gZGlnaXRzW2ldICogd2VpZ2h0O1xuICAgIHdlaWdodCArPSAxO1xuXG4gICAgaWYgKHdlaWdodCA9PT0gMTApIHtcbiAgICAgIHdlaWdodCA9IDE7XG4gICAgfVxuICB9IC8vIERvIGFnYWluIGlmIG1vZHVsbyAxMSBvZiBjaGVja3N1bSBpcyAxMFxuXG5cbiAgaWYgKGNoZWNrc3VtICUgMTEgPT09IDEwKSB7XG4gICAgY2hlY2tzdW0gPSAwO1xuICAgIHdlaWdodCA9IDM7XG5cbiAgICBmb3IgKHZhciBfaTMgPSAwOyBfaTMgPCAxMDsgX2kzKyspIHtcbiAgICAgIGNoZWNrc3VtICs9IGRpZ2l0c1tfaTNdICogd2VpZ2h0O1xuICAgICAgd2VpZ2h0ICs9IDE7XG5cbiAgICAgIGlmICh3ZWlnaHQgPT09IDEwKSB7XG4gICAgICAgIHdlaWdodCA9IDE7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNoZWNrc3VtICUgMTEgPT09IDEwKSB7XG4gICAgICByZXR1cm4gZGlnaXRzWzEwXSA9PT0gMDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY2hlY2tzdW0gJSAxMSA9PT0gZGlnaXRzWzEwXTtcbn1cbi8qXG4gKiBmaS1GSSB2YWxpZGF0aW9uIGZ1bmN0aW9uXG4gKiAoSGVua2lsw7Z0dW5udXMgKEhFVFUpLCBwZXJzb25zIG9ubHkpXG4gKiBDaGVja3MgaWYgYmlydGggZGF0ZSAoZmlyc3Qgc2l4IGRpZ2l0cyBwbHVzIGNlbnR1cnkgc3ltYm9sKSBpcyB2YWxpZFxuICogYW5kIGNhbGN1bGF0ZXMgY2hlY2sgKGxhc3QpIGRpZ2l0XG4gKi9cblxuXG5mdW5jdGlvbiBmaUZpQ2hlY2sodGluKSB7XG4gIC8vIEV4dHJhY3QgeWVhciBhbmQgYWRkIGNlbnR1cnlcbiAgdmFyIGZ1bGxfeWVhciA9IHRpbi5zbGljZSg0LCA2KTtcbiAgdmFyIGNlbnR1cnlfc3ltYm9sID0gdGluLnNsaWNlKDYsIDcpO1xuXG4gIHN3aXRjaCAoY2VudHVyeV9zeW1ib2wpIHtcbiAgICBjYXNlICcrJzpcbiAgICAgIGZ1bGxfeWVhciA9IFwiMThcIi5jb25jYXQoZnVsbF95ZWFyKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnLSc6XG4gICAgICBmdWxsX3llYXIgPSBcIjE5XCIuY29uY2F0KGZ1bGxfeWVhcik7XG4gICAgICBicmVhaztcblxuICAgIGRlZmF1bHQ6XG4gICAgICBmdWxsX3llYXIgPSBcIjIwXCIuY29uY2F0KGZ1bGxfeWVhcik7XG4gICAgICBicmVhaztcbiAgfSAvLyBDaGVjayBkYXRlIHZhbGlkaXR5XG5cblxuICB2YXIgZGF0ZSA9IFwiXCIuY29uY2F0KGZ1bGxfeWVhciwgXCIvXCIpLmNvbmNhdCh0aW4uc2xpY2UoMiwgNCksIFwiL1wiKS5jb25jYXQodGluLnNsaWNlKDAsIDIpKTtcblxuICBpZiAoISgwLCBfaXNEYXRlLmRlZmF1bHQpKGRhdGUsICdZWVlZL01NL0REJykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0gLy8gQ2FsY3VsYXRlIGNoZWNrIGNoYXJhY3RlclxuXG5cbiAgdmFyIGNoZWNrc3VtID0gcGFyc2VJbnQodGluLnNsaWNlKDAsIDYpICsgdGluLnNsaWNlKDcsIDEwKSwgMTApICUgMzE7XG5cbiAgaWYgKGNoZWNrc3VtIDwgMTApIHtcbiAgICByZXR1cm4gY2hlY2tzdW0gPT09IHBhcnNlSW50KHRpbi5zbGljZSgxMCksIDEwKTtcbiAgfVxuXG4gIGNoZWNrc3VtIC09IDEwO1xuICB2YXIgbGV0dGVyc19sb29rdXAgPSBbJ0EnLCAnQicsICdDJywgJ0QnLCAnRScsICdGJywgJ0gnLCAnSicsICdLJywgJ0wnLCAnTScsICdOJywgJ1AnLCAnUicsICdTJywgJ1QnLCAnVScsICdWJywgJ1cnLCAnWCcsICdZJ107XG4gIHJldHVybiBsZXR0ZXJzX2xvb2t1cFtjaGVja3N1bV0gPT09IHRpbi5zbGljZSgxMCk7XG59XG4vKlxuICogZnIvbmwtQkUgdmFsaWRhdGlvbiBmdW5jdGlvblxuICogKE51bcOpcm8gbmF0aW9uYWwgKE4uTi4pLCBwZXJzb25zIG9ubHkpXG4gKiBDaGVja3MgaWYgYmlydGggZGF0ZSAoZmlyc3Qgc2l4IGRpZ2l0cykgaXMgdmFsaWQgYW5kIGNhbGN1bGF0ZXMgY2hlY2sgKGxhc3QgdHdvKSBkaWdpdHNcbiAqL1xuXG5cbmZ1bmN0aW9uIGZyQmVDaGVjayh0aW4pIHtcbiAgLy8gWmVybyBtb250aC9kYXkgdmFsdWUgaXMgYWNjZXB0YWJsZVxuICBpZiAodGluLnNsaWNlKDIsIDQpICE9PSAnMDAnIHx8IHRpbi5zbGljZSg0LCA2KSAhPT0gJzAwJykge1xuICAgIC8vIEV4dHJhY3QgZGF0ZSBmcm9tIGZpcnN0IHNpeCBkaWdpdHMgb2YgVElOXG4gICAgdmFyIGRhdGUgPSBcIlwiLmNvbmNhdCh0aW4uc2xpY2UoMCwgMiksIFwiL1wiKS5jb25jYXQodGluLnNsaWNlKDIsIDQpLCBcIi9cIikuY29uY2F0KHRpbi5zbGljZSg0LCA2KSk7XG5cbiAgICBpZiAoISgwLCBfaXNEYXRlLmRlZmF1bHQpKGRhdGUsICdZWS9NTS9ERCcpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgdmFyIGNoZWNrc3VtID0gOTcgLSBwYXJzZUludCh0aW4uc2xpY2UoMCwgOSksIDEwKSAlIDk3O1xuICB2YXIgY2hlY2tkaWdpdHMgPSBwYXJzZUludCh0aW4uc2xpY2UoOSwgMTEpLCAxMCk7XG5cbiAgaWYgKGNoZWNrc3VtICE9PSBjaGVja2RpZ2l0cykge1xuICAgIGNoZWNrc3VtID0gOTcgLSBwYXJzZUludChcIjJcIi5jb25jYXQodGluLnNsaWNlKDAsIDkpKSwgMTApICUgOTc7XG5cbiAgICBpZiAoY2hlY2tzdW0gIT09IGNoZWNrZGlnaXRzKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG4vKlxuICogZnItRlIgdmFsaWRhdGlvbiBmdW5jdGlvblxuICogKE51bcOpcm8gZmlzY2FsIGRlIHLDqWbDqXJlbmNlIChudW3DqXJvIFNQSSksIHBlcnNvbnMgb25seSlcbiAqIFZlcmlmeSBUSU4gdmFsaWRpdHkgYnkgY2FsY3VsYXRpbmcgY2hlY2sgKGxhc3QgdGhyZWUpIGRpZ2l0c1xuICovXG5cblxuZnVuY3Rpb24gZnJGckNoZWNrKHRpbikge1xuICB0aW4gPSB0aW4ucmVwbGFjZSgvXFxzL2csICcnKTtcbiAgdmFyIGNoZWNrc3VtID0gcGFyc2VJbnQodGluLnNsaWNlKDAsIDEwKSwgMTApICUgNTExO1xuICB2YXIgY2hlY2tkaWdpdHMgPSBwYXJzZUludCh0aW4uc2xpY2UoMTAsIDEzKSwgMTApO1xuICByZXR1cm4gY2hlY2tzdW0gPT09IGNoZWNrZGlnaXRzO1xufVxuLypcbiAqIGZyL2xiLUxVIHZhbGlkYXRpb24gZnVuY3Rpb25cbiAqIChudW3DqXJvIGTigJlpZGVudGlmaWNhdGlvbiBwZXJzb25uZWxsZSwgcGVyc29ucyBvbmx5KVxuICogVmVyaWZ5IGJpcnRoIGRhdGUgdmFsaWRpdHkgYW5kIHJ1biBMdWhuIGFuZCBWZXJob2VmZiBjaGVja3NcbiAqL1xuXG5cbmZ1bmN0aW9uIGZyTHVDaGVjayh0aW4pIHtcbiAgLy8gRXh0cmFjdCBkYXRlIGFuZCBjaGVjayB2YWxpZGl0eVxuICB2YXIgZGF0ZSA9IFwiXCIuY29uY2F0KHRpbi5zbGljZSgwLCA0KSwgXCIvXCIpLmNvbmNhdCh0aW4uc2xpY2UoNCwgNiksIFwiL1wiKS5jb25jYXQodGluLnNsaWNlKDYsIDgpKTtcblxuICBpZiAoISgwLCBfaXNEYXRlLmRlZmF1bHQpKGRhdGUsICdZWVlZL01NL0REJykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0gLy8gUnVuIEx1aG4gY2hlY2tcblxuXG4gIGlmICghYWxnb3JpdGhtcy5sdWhuQ2hlY2sodGluLnNsaWNlKDAsIDEyKSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0gLy8gUmVtb3ZlIEx1aG4gY2hlY2sgZGlnaXQgYW5kIHJ1biBWZXJob2VmZiBjaGVja1xuXG5cbiAgcmV0dXJuIGFsZ29yaXRobXMudmVyaG9lZmZDaGVjayhcIlwiLmNvbmNhdCh0aW4uc2xpY2UoMCwgMTEpKS5jb25jYXQodGluWzEyXSkpO1xufVxuLypcbiAqIGhyLUhSIHZhbGlkYXRpb24gZnVuY3Rpb25cbiAqIChPc29ibmkgaWRlbnRpZmlrYWNpanNraSBicm9qIChPSUIpLCBwZXJzb25zL2VudGl0aWVzKVxuICogVmVyaWZ5IFRJTiB2YWxpZGl0eSBieSBjYWxsaW5nIGlzbzcwNjRDaGVjayhkaWdpdHMpXG4gKi9cblxuXG5mdW5jdGlvbiBockhyQ2hlY2sodGluKSB7XG4gIHJldHVybiBhbGdvcml0aG1zLmlzbzcwNjRDaGVjayh0aW4pO1xufVxuLypcbiAqIGh1LUhVIHZhbGlkYXRpb24gZnVuY3Rpb25cbiAqIChBZMOzYXpvbm9zw610w7MgamVsLCBwZXJzb25zIG9ubHkpXG4gKiBWZXJpZnkgVElOIHZhbGlkaXR5IGJ5IGNhbGN1bGF0aW5nIGNoZWNrIChsYXN0KSBkaWdpdFxuICovXG5cblxuZnVuY3Rpb24gaHVIdUNoZWNrKHRpbikge1xuICAvLyBzcGxpdCBkaWdpdHMgaW50byBhbiBhcnJheSBmb3IgZnVydGhlciBwcm9jZXNzaW5nXG4gIHZhciBkaWdpdHMgPSB0aW4uc3BsaXQoJycpLm1hcChmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiBwYXJzZUludChhLCAxMCk7XG4gIH0pO1xuICB2YXIgY2hlY2tzdW0gPSA4O1xuXG4gIGZvciAodmFyIGkgPSAxOyBpIDwgOTsgaSsrKSB7XG4gICAgY2hlY2tzdW0gKz0gZGlnaXRzW2ldICogKGkgKyAxKTtcbiAgfVxuXG4gIHJldHVybiBjaGVja3N1bSAlIDExID09PSBkaWdpdHNbOV07XG59XG4vKlxuICogbHQtTFQgdmFsaWRhdGlvbiBmdW5jdGlvbiAoc2hvdWxkIGdvIGhlcmUgaWYgbmVlZGVkKVxuICogKEFzbWVucyBrb2RhcywgcGVyc29ucy9lbnRpdGllcyByZXNwZWN0aXZlbHkpXG4gKiBDdXJyZW50IHZhbGlkYXRpb24gY2hlY2sgaXMgYWxpYXMgb2YgZXRFZUNoZWNrLSBzYW1lIGZvcm1hdCBhcHBsaWVzXG4gKi9cblxuLypcbiAqIGl0LUlUIGZpcnN0L2xhc3QgbmFtZSB2YWxpZGl0eSBjaGVja1xuICogQWNjZXB0cyBpdC1JVCBUSU4tZW5jb2RlZCBuYW1lcyBhcyBhIHRocmVlLWVsZW1lbnQgY2hhcmFjdGVyIGFycmF5IGFuZCBjaGVja3MgdGhlaXIgdmFsaWRpdHlcbiAqIER1ZSB0byBsYWNrIG9mIGNsYXJpdHkgYmV0d2VlbiByZXNvdXJjZXMgKFwiQXJlIG9ubHkgSXRhbGlhbiBjb25zb25hbnRzIHVzZWQ/XG4gKiBXaGF0IGhhcHBlbnMgaWYgYSBwZXJzb24gaGFzIFggaW4gdGhlaXIgbmFtZT9cIiBldGMuKSBvbmx5IHR3byB0ZXN0IGNvbmRpdGlvbnNcbiAqIGhhdmUgYmVlbiBpbXBsZW1lbnRlZDpcbiAqIFZvd2VscyBtYXkgb25seSBiZSBmb2xsb3dlZCBieSBvdGhlciB2b3dlbHMgb3IgYW4gWCBjaGFyYWN0ZXJcbiAqIGFuZCBYIGNoYXJhY3RlcnMgYWZ0ZXIgdm93ZWxzIG1heSBvbmx5IGJlIGZvbGxvd2VkIGJ5IG90aGVyIFggY2hhcmFjdGVycy5cbiAqL1xuXG5cbmZ1bmN0aW9uIGl0SXROYW1lQ2hlY2sobmFtZSkge1xuICAvLyB0cnVlIGF0IHRoZSBmaXJzdCBvY2N1cmVuY2Ugb2YgYSB2b3dlbFxuICB2YXIgdm93ZWxmbGFnID0gZmFsc2U7IC8vIHRydWUgYXQgdGhlIGZpcnN0IG9jY3VyZW5jZSBvZiBhbiBYIEFGVEVSIHZvd2VsXG4gIC8vICh0byBwcm9wZXJseSBoYW5kbGUgbGFzdCBuYW1lcyB3aXRoIFggYXMgY29uc29uYW50KVxuXG4gIHZhciB4ZmxhZyA9IGZhbHNlO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgaWYgKCF2b3dlbGZsYWcgJiYgL1tBRUlPVV0vLnRlc3QobmFtZVtpXSkpIHtcbiAgICAgIHZvd2VsZmxhZyA9IHRydWU7XG4gICAgfSBlbHNlIGlmICgheGZsYWcgJiYgdm93ZWxmbGFnICYmIG5hbWVbaV0gPT09ICdYJykge1xuICAgICAgeGZsYWcgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAoaSA+IDApIHtcbiAgICAgIGlmICh2b3dlbGZsYWcgJiYgIXhmbGFnKSB7XG4gICAgICAgIGlmICghL1tBRUlPVV0vLnRlc3QobmFtZVtpXSkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHhmbGFnKSB7XG4gICAgICAgIGlmICghL1gvLnRlc3QobmFtZVtpXSkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cbi8qXG4gKiBpdC1JVCB2YWxpZGF0aW9uIGZ1bmN0aW9uXG4gKiAoQ29kaWNlIGZpc2NhbGUgKFRJTi1JVCksIHBlcnNvbnMgb25seSlcbiAqIFZlcmlmeSBuYW1lLCBiaXJ0aCBkYXRlIGFuZCBjb2RpY2UgY2F0YXN0YWxlIHZhbGlkaXR5XG4gKiBhbmQgY2FsY3VsYXRlIGNoZWNrIGNoYXJhY3Rlci5cbiAqIE1hdGVyaWFsIG5vdCBpbiBERy1UQVhVRCBkb2N1bWVudCBzb3VyY2VkIGZyb206XG4gKiBgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSXRhbGlhbl9maXNjYWxfY29kZWBcbiAqL1xuXG5cbmZ1bmN0aW9uIGl0SXRDaGVjayh0aW4pIHtcbiAgLy8gQ2FwaXRhbGl6ZSBhbmQgc3BsaXQgY2hhcmFjdGVycyBpbnRvIGFuIGFycmF5IGZvciBmdXJ0aGVyIHByb2Nlc3NpbmdcbiAgdmFyIGNoYXJzID0gdGluLnRvVXBwZXJDYXNlKCkuc3BsaXQoJycpOyAvLyBDaGVjayBmaXJzdCBhbmQgbGFzdCBuYW1lIHZhbGlkaXR5IGNhbGxpbmcgaXRJdE5hbWVDaGVjaygpXG5cbiAgaWYgKCFpdEl0TmFtZUNoZWNrKGNoYXJzLnNsaWNlKDAsIDMpKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICghaXRJdE5hbWVDaGVjayhjaGFycy5zbGljZSgzLCA2KSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0gLy8gQ29udmVydCBsZXR0ZXJzIGluIG51bWJlciBzcGFjZXMgYmFjayB0byBudW1iZXJzIGlmIGFueVxuXG5cbiAgdmFyIG51bWJlcl9sb2NhdGlvbnMgPSBbNiwgNywgOSwgMTAsIDEyLCAxMywgMTRdO1xuICB2YXIgbnVtYmVyX3JlcGxhY2UgPSB7XG4gICAgTDogJzAnLFxuICAgIE06ICcxJyxcbiAgICBOOiAnMicsXG4gICAgUDogJzMnLFxuICAgIFE6ICc0JyxcbiAgICBSOiAnNScsXG4gICAgUzogJzYnLFxuICAgIFQ6ICc3JyxcbiAgICBVOiAnOCcsXG4gICAgVjogJzknXG4gIH07XG5cbiAgZm9yICh2YXIgX2k0ID0gMCwgX251bWJlcl9sb2NhdGlvbnMgPSBudW1iZXJfbG9jYXRpb25zOyBfaTQgPCBfbnVtYmVyX2xvY2F0aW9ucy5sZW5ndGg7IF9pNCsrKSB7XG4gICAgdmFyIGkgPSBfbnVtYmVyX2xvY2F0aW9uc1tfaTRdO1xuXG4gICAgaWYgKGNoYXJzW2ldIGluIG51bWJlcl9yZXBsYWNlKSB7XG4gICAgICBjaGFycy5zcGxpY2UoaSwgMSwgbnVtYmVyX3JlcGxhY2VbY2hhcnNbaV1dKTtcbiAgICB9XG4gIH0gLy8gRXh0cmFjdCBtb250aCBhbmQgZGF5LCBhbmQgY2hlY2sgZGF0ZSB2YWxpZGl0eVxuXG5cbiAgdmFyIG1vbnRoX3JlcGxhY2UgPSB7XG4gICAgQTogJzAxJyxcbiAgICBCOiAnMDInLFxuICAgIEM6ICcwMycsXG4gICAgRDogJzA0JyxcbiAgICBFOiAnMDUnLFxuICAgIEg6ICcwNicsXG4gICAgTDogJzA3JyxcbiAgICBNOiAnMDgnLFxuICAgIFA6ICcwOScsXG4gICAgUjogJzEwJyxcbiAgICBTOiAnMTEnLFxuICAgIFQ6ICcxMidcbiAgfTtcbiAgdmFyIG1vbnRoID0gbW9udGhfcmVwbGFjZVtjaGFyc1s4XV07XG4gIHZhciBkYXkgPSBwYXJzZUludChjaGFyc1s5XSArIGNoYXJzWzEwXSwgMTApO1xuXG4gIGlmIChkYXkgPiA0MCkge1xuICAgIGRheSAtPSA0MDtcbiAgfVxuXG4gIGlmIChkYXkgPCAxMCkge1xuICAgIGRheSA9IFwiMFwiLmNvbmNhdChkYXkpO1xuICB9XG5cbiAgdmFyIGRhdGUgPSBcIlwiLmNvbmNhdChjaGFyc1s2XSkuY29uY2F0KGNoYXJzWzddLCBcIi9cIikuY29uY2F0KG1vbnRoLCBcIi9cIikuY29uY2F0KGRheSk7XG5cbiAgaWYgKCEoMCwgX2lzRGF0ZS5kZWZhdWx0KShkYXRlLCAnWVkvTU0vREQnKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSAvLyBDYWxjdWxhdGUgY2hlY2sgY2hhcmFjdGVyIGJ5IGFkZGluZyB1cCBldmVuIGFuZCBvZGQgY2hhcmFjdGVycyBhcyBudW1iZXJzXG5cblxuICB2YXIgY2hlY2tzdW0gPSAwO1xuXG4gIGZvciAodmFyIF9pNSA9IDE7IF9pNSA8IGNoYXJzLmxlbmd0aCAtIDE7IF9pNSArPSAyKSB7XG4gICAgdmFyIGNoYXJfdG9faW50ID0gcGFyc2VJbnQoY2hhcnNbX2k1XSwgMTApO1xuXG4gICAgaWYgKGlzTmFOKGNoYXJfdG9faW50KSkge1xuICAgICAgY2hhcl90b19pbnQgPSBjaGFyc1tfaTVdLmNoYXJDb2RlQXQoMCkgLSA2NTtcbiAgICB9XG5cbiAgICBjaGVja3N1bSArPSBjaGFyX3RvX2ludDtcbiAgfVxuXG4gIHZhciBvZGRfY29udmVydCA9IHtcbiAgICAvLyBNYXBzIG9mIGNoYXJhY3RlcnMgYXQgb2RkIHBsYWNlc1xuICAgIEE6IDEsXG4gICAgQjogMCxcbiAgICBDOiA1LFxuICAgIEQ6IDcsXG4gICAgRTogOSxcbiAgICBGOiAxMyxcbiAgICBHOiAxNSxcbiAgICBIOiAxNyxcbiAgICBJOiAxOSxcbiAgICBKOiAyMSxcbiAgICBLOiAyLFxuICAgIEw6IDQsXG4gICAgTTogMTgsXG4gICAgTjogMjAsXG4gICAgTzogMTEsXG4gICAgUDogMyxcbiAgICBROiA2LFxuICAgIFI6IDgsXG4gICAgUzogMTIsXG4gICAgVDogMTQsXG4gICAgVTogMTYsXG4gICAgVjogMTAsXG4gICAgVzogMjIsXG4gICAgWDogMjUsXG4gICAgWTogMjQsXG4gICAgWjogMjMsXG4gICAgMDogMSxcbiAgICAxOiAwXG4gIH07XG5cbiAgZm9yICh2YXIgX2k2ID0gMDsgX2k2IDwgY2hhcnMubGVuZ3RoIC0gMTsgX2k2ICs9IDIpIHtcbiAgICB2YXIgX2NoYXJfdG9faW50ID0gMDtcblxuICAgIGlmIChjaGFyc1tfaTZdIGluIG9kZF9jb252ZXJ0KSB7XG4gICAgICBfY2hhcl90b19pbnQgPSBvZGRfY29udmVydFtjaGFyc1tfaTZdXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIG11bHRpcGxpZXIgPSBwYXJzZUludChjaGFyc1tfaTZdLCAxMCk7XG4gICAgICBfY2hhcl90b19pbnQgPSAyICogbXVsdGlwbGllciArIDE7XG5cbiAgICAgIGlmIChtdWx0aXBsaWVyID4gNCkge1xuICAgICAgICBfY2hhcl90b19pbnQgKz0gMjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjaGVja3N1bSArPSBfY2hhcl90b19pbnQ7XG4gIH1cblxuICBpZiAoU3RyaW5nLmZyb21DaGFyQ29kZSg2NSArIGNoZWNrc3VtICUgMjYpICE9PSBjaGFyc1sxNV0pIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cbi8qXG4gKiBsdi1MViB2YWxpZGF0aW9uIGZ1bmN0aW9uXG4gKiAoUGVyc29uYXMga29kcyAoUEspLCBwZXJzb25zIG9ubHkpXG4gKiBDaGVjayB2YWxpZGl0eSBvZiBiaXJ0aCBkYXRlIGFuZCBjYWxjdWxhdGUgY2hlY2sgKGxhc3QpIGRpZ2l0XG4gKiBTdXBwb3J0IG9ubHkgZm9yIG9sZCBmb3JtYXQgbnVtYmVycyAobm90IHN0YXJ0aW5nIHdpdGggJzMyJywgaXNzdWVkIGJlZm9yZSAyMDE3LzA3LzAxKVxuICogTWF0ZXJpYWwgbm90IGluIERHIFRBWFVEIGRvY3VtZW50IHNvdXJjZWQgZnJvbTpcbiAqIGBodHRwczovL2Jvb3Qucml0YWthZmlqYS5sdi9mb3J1bXMvaW5kZXgucGhwPy90b3BpYy84ODMxNC1wZXJzb25hcy1rb2RhLWFsZ29yaXRtcy0lQzQlOERla3N1bW1hL2BcbiAqL1xuXG5cbmZ1bmN0aW9uIGx2THZDaGVjayh0aW4pIHtcbiAgdGluID0gdGluLnJlcGxhY2UoL1xcVy8sICcnKTsgLy8gRXh0cmFjdCBkYXRlIGZyb20gVElOXG5cbiAgdmFyIGRheSA9IHRpbi5zbGljZSgwLCAyKTtcblxuICBpZiAoZGF5ICE9PSAnMzInKSB7XG4gICAgLy8gTm8gZGF0ZS9jaGVja3N1bSBjaGVjayBpZiBuZXcgZm9ybWF0XG4gICAgdmFyIG1vbnRoID0gdGluLnNsaWNlKDIsIDQpO1xuXG4gICAgaWYgKG1vbnRoICE9PSAnMDAnKSB7XG4gICAgICAvLyBObyBkYXRlIGNoZWNrIGlmIHVua25vd24gbW9udGhcbiAgICAgIHZhciBmdWxsX3llYXIgPSB0aW4uc2xpY2UoNCwgNik7XG5cbiAgICAgIHN3aXRjaCAodGluWzZdKSB7XG4gICAgICAgIGNhc2UgJzAnOlxuICAgICAgICAgIGZ1bGxfeWVhciA9IFwiMThcIi5jb25jYXQoZnVsbF95ZWFyKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICcxJzpcbiAgICAgICAgICBmdWxsX3llYXIgPSBcIjE5XCIuY29uY2F0KGZ1bGxfeWVhcik7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBmdWxsX3llYXIgPSBcIjIwXCIuY29uY2F0KGZ1bGxfeWVhcik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9IC8vIENoZWNrIGRhdGUgdmFsaWRpdHlcblxuXG4gICAgICB2YXIgZGF0ZSA9IFwiXCIuY29uY2F0KGZ1bGxfeWVhciwgXCIvXCIpLmNvbmNhdCh0aW4uc2xpY2UoMiwgNCksIFwiL1wiKS5jb25jYXQoZGF5KTtcblxuICAgICAgaWYgKCEoMCwgX2lzRGF0ZS5kZWZhdWx0KShkYXRlLCAnWVlZWS9NTS9ERCcpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9IC8vIENhbGN1bGF0ZSBjaGVjayBkaWdpdFxuXG5cbiAgICB2YXIgY2hlY2tzdW0gPSAxMTAxO1xuICAgIHZhciBtdWx0aXBfbG9va3VwID0gWzEsIDYsIDMsIDcsIDksIDEwLCA1LCA4LCA0LCAyXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGluLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgY2hlY2tzdW0gLT0gcGFyc2VJbnQodGluW2ldLCAxMCkgKiBtdWx0aXBfbG9va3VwW2ldO1xuICAgIH1cblxuICAgIHJldHVybiBwYXJzZUludCh0aW5bMTBdLCAxMCkgPT09IGNoZWNrc3VtICUgMTE7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cbi8qXG4gKiBtdC1NVCB2YWxpZGF0aW9uIGZ1bmN0aW9uXG4gKiAoSWRlbnRpdHkgQ2FyZCBOdW1iZXIgb3IgVW5pcXVlIFRheHBheWVyIFJlZmVyZW5jZSwgcGVyc29ucy9lbnRpdGllcylcbiAqIFZlcmlmeSBJZGVudGl0eSBDYXJkIE51bWJlciBzdHJ1Y3R1cmUgKG5vIG90aGVyIHRlc3RzIGZvdW5kKVxuICovXG5cblxuZnVuY3Rpb24gbXRNdENoZWNrKHRpbikge1xuICBpZiAodGluLmxlbmd0aCAhPT0gOSkge1xuICAgIC8vIE5vIHRlc3RzIGZvciBVVFJcbiAgICB2YXIgY2hhcnMgPSB0aW4udG9VcHBlckNhc2UoKS5zcGxpdCgnJyk7IC8vIEZpbGwgd2l0aCB6ZXJvcyBpZiBzbWFsbGVyIHRoYW4gcHJvcGVyXG5cbiAgICB3aGlsZSAoY2hhcnMubGVuZ3RoIDwgOCkge1xuICAgICAgY2hhcnMudW5zaGlmdCgwKTtcbiAgICB9IC8vIFZhbGlkYXRlIGZvcm1hdCBhY2NvcmRpbmcgdG8gbGFzdCBjaGFyYWN0ZXJcblxuXG4gICAgc3dpdGNoICh0aW5bN10pIHtcbiAgICAgIGNhc2UgJ0EnOlxuICAgICAgY2FzZSAnUCc6XG4gICAgICAgIGlmIChwYXJzZUludChjaGFyc1s2XSwgMTApID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHtcbiAgICAgICAgICB2YXIgZmlyc3RfcGFydCA9IHBhcnNlSW50KGNoYXJzLmpvaW4oJycpLnNsaWNlKDAsIDUpLCAxMCk7XG5cbiAgICAgICAgICBpZiAoZmlyc3RfcGFydCA+IDMyMDAwKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIHNlY29uZF9wYXJ0ID0gcGFyc2VJbnQoY2hhcnMuam9pbignJykuc2xpY2UoNSwgNyksIDEwKTtcblxuICAgICAgICAgIGlmIChmaXJzdF9wYXJ0ID09PSBzZWNvbmRfcGFydCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuLypcbiAqIG5sLU5MIHZhbGlkYXRpb24gZnVuY3Rpb25cbiAqIChCdXJnZXJzZXJ2aWNlbnVtbWVyIChCU04pIG9yIFJlY2h0c3BlcnNvbmVuIFNhbWVud2Vya2luZ3N2ZXJiYW5kZW4gSW5mb3JtYXRpZSBOdW1tZXIgKFJTSU4pLFxuICogcGVyc29ucy9lbnRpdGllcyByZXNwZWN0aXZlbHkpXG4gKiBWZXJpZnkgVElOIHZhbGlkaXR5IGJ5IGNhbGN1bGF0aW5nIGNoZWNrIChsYXN0KSBkaWdpdCAodmFyaWFudCBvZiBNT0QgMTEpXG4gKi9cblxuXG5mdW5jdGlvbiBubE5sQ2hlY2sodGluKSB7XG4gIHJldHVybiBhbGdvcml0aG1zLnJldmVyc2VNdWx0aXBseUFuZFN1bSh0aW4uc3BsaXQoJycpLnNsaWNlKDAsIDgpLm1hcChmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiBwYXJzZUludChhLCAxMCk7XG4gIH0pLCA5KSAlIDExID09PSBwYXJzZUludCh0aW5bOF0sIDEwKTtcbn1cbi8qXG4gKiBwbC1QTCB2YWxpZGF0aW9uIGZ1bmN0aW9uXG4gKiAoUG93c3plY2hueSBFbGVrdHJvbmljem55IFN5c3RlbSBFd2lkZW5jamkgTHVkbm/Fm2NpIChQRVNFTClcbiAqIG9yIE51bWVyIGlkZW50eWZpa2FjamkgcG9kYXRrb3dlaiAoTklQKSwgcGVyc29ucy9lbnRpdGllcylcbiAqIFZlcmlmeSBUSU4gdmFsaWRpdHkgYnkgdmFsaWRhdGluZyBiaXJ0aCBkYXRlIChQRVNFTCkgYW5kIGNhbGN1bGF0aW5nIGNoZWNrIChsYXN0KSBkaWdpdFxuICovXG5cblxuZnVuY3Rpb24gcGxQbENoZWNrKHRpbikge1xuICAvLyBOSVBcbiAgaWYgKHRpbi5sZW5ndGggPT09IDEwKSB7XG4gICAgLy8gQ2FsY3VsYXRlIGxhc3QgZGlnaXQgYnkgbXVsdGlwbHlpbmcgd2l0aCBsb29rdXBcbiAgICB2YXIgbG9va3VwID0gWzYsIDUsIDcsIDIsIDMsIDQsIDUsIDYsIDddO1xuICAgIHZhciBfY2hlY2tzdW0gPSAwO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsb29rdXAubGVuZ3RoOyBpKyspIHtcbiAgICAgIF9jaGVja3N1bSArPSBwYXJzZUludCh0aW5baV0sIDEwKSAqIGxvb2t1cFtpXTtcbiAgICB9XG5cbiAgICBfY2hlY2tzdW0gJT0gMTE7XG5cbiAgICBpZiAoX2NoZWNrc3VtID09PSAxMCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiBfY2hlY2tzdW0gPT09IHBhcnNlSW50KHRpbls5XSwgMTApO1xuICB9IC8vIFBFU0VMXG4gIC8vIEV4dHJhY3QgZnVsbCB5ZWFyIHVzaW5nIG1vbnRoXG5cblxuICB2YXIgZnVsbF95ZWFyID0gdGluLnNsaWNlKDAsIDIpO1xuICB2YXIgbW9udGggPSBwYXJzZUludCh0aW4uc2xpY2UoMiwgNCksIDEwKTtcblxuICBpZiAobW9udGggPiA4MCkge1xuICAgIGZ1bGxfeWVhciA9IFwiMThcIi5jb25jYXQoZnVsbF95ZWFyKTtcbiAgICBtb250aCAtPSA4MDtcbiAgfSBlbHNlIGlmIChtb250aCA+IDYwKSB7XG4gICAgZnVsbF95ZWFyID0gXCIyMlwiLmNvbmNhdChmdWxsX3llYXIpO1xuICAgIG1vbnRoIC09IDYwO1xuICB9IGVsc2UgaWYgKG1vbnRoID4gNDApIHtcbiAgICBmdWxsX3llYXIgPSBcIjIxXCIuY29uY2F0KGZ1bGxfeWVhcik7XG4gICAgbW9udGggLT0gNDA7XG4gIH0gZWxzZSBpZiAobW9udGggPiAyMCkge1xuICAgIGZ1bGxfeWVhciA9IFwiMjBcIi5jb25jYXQoZnVsbF95ZWFyKTtcbiAgICBtb250aCAtPSAyMDtcbiAgfSBlbHNlIHtcbiAgICBmdWxsX3llYXIgPSBcIjE5XCIuY29uY2F0KGZ1bGxfeWVhcik7XG4gIH0gLy8gQWRkIGxlYWRpbmcgemVybyB0byBtb250aCBpZiBuZWVkZWRcblxuXG4gIGlmIChtb250aCA8IDEwKSB7XG4gICAgbW9udGggPSBcIjBcIi5jb25jYXQobW9udGgpO1xuICB9IC8vIENoZWNrIGRhdGUgdmFsaWRpdHlcblxuXG4gIHZhciBkYXRlID0gXCJcIi5jb25jYXQoZnVsbF95ZWFyLCBcIi9cIikuY29uY2F0KG1vbnRoLCBcIi9cIikuY29uY2F0KHRpbi5zbGljZSg0LCA2KSk7XG5cbiAgaWYgKCEoMCwgX2lzRGF0ZS5kZWZhdWx0KShkYXRlLCAnWVlZWS9NTS9ERCcpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9IC8vIENhbGN1bGF0ZSBsYXN0IGRpZ2l0IGJ5IG11bGl0cGx5aW5nIHdpdGggb2RkIG9uZS1kaWdpdCBudW1iZXJzIGV4Y2VwdCA1XG5cblxuICB2YXIgY2hlY2tzdW0gPSAwO1xuICB2YXIgbXVsdGlwbGllciA9IDE7XG5cbiAgZm9yICh2YXIgX2k3ID0gMDsgX2k3IDwgdGluLmxlbmd0aCAtIDE7IF9pNysrKSB7XG4gICAgY2hlY2tzdW0gKz0gcGFyc2VJbnQodGluW19pN10sIDEwKSAqIG11bHRpcGxpZXIgJSAxMDtcbiAgICBtdWx0aXBsaWVyICs9IDI7XG5cbiAgICBpZiAobXVsdGlwbGllciA+IDEwKSB7XG4gICAgICBtdWx0aXBsaWVyID0gMTtcbiAgICB9IGVsc2UgaWYgKG11bHRpcGxpZXIgPT09IDUpIHtcbiAgICAgIG11bHRpcGxpZXIgKz0gMjtcbiAgICB9XG4gIH1cblxuICBjaGVja3N1bSA9IDEwIC0gY2hlY2tzdW0gJSAxMDtcbiAgcmV0dXJuIGNoZWNrc3VtID09PSBwYXJzZUludCh0aW5bMTBdLCAxMCk7XG59XG4vKlxuKiBwdC1CUiB2YWxpZGF0aW9uIGZ1bmN0aW9uXG4qIChDYWRhc3RybyBkZSBQZXNzb2FzIEbDrXNpY2FzIChDUEYsIHBlcnNvbnMpXG4qIENhZGFzdHJvIE5hY2lvbmFsIGRlIFBlc3NvYXMgSnVyw61kaWNhcyAoQ05QSiwgZW50aXRpZXMpXG4qIEJvdGggaW5wdXRzIHdpbGwgYmUgdmFsaWRhdGVkXG4qL1xuXG5cbmZ1bmN0aW9uIHB0QnJDaGVjayh0aW4pIHtcbiAgaWYgKHRpbi5sZW5ndGggPT09IDExKSB7XG4gICAgdmFyIF9zdW07XG5cbiAgICB2YXIgcmVtYWluZGVyO1xuICAgIF9zdW0gPSAwO1xuICAgIGlmICggLy8gUmVqZWN0IGtub3duIGludmFsaWQgQ1BGc1xuICAgIHRpbiA9PT0gJzExMTExMTExMTExJyB8fCB0aW4gPT09ICcyMjIyMjIyMjIyMicgfHwgdGluID09PSAnMzMzMzMzMzMzMzMnIHx8IHRpbiA9PT0gJzQ0NDQ0NDQ0NDQ0JyB8fCB0aW4gPT09ICc1NTU1NTU1NTU1NScgfHwgdGluID09PSAnNjY2NjY2NjY2NjYnIHx8IHRpbiA9PT0gJzc3Nzc3Nzc3Nzc3JyB8fCB0aW4gPT09ICc4ODg4ODg4ODg4OCcgfHwgdGluID09PSAnOTk5OTk5OTk5OTknIHx8IHRpbiA9PT0gJzAwMDAwMDAwMDAwJykgcmV0dXJuIGZhbHNlO1xuXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPD0gOTsgaSsrKSB7XG4gICAgICBfc3VtICs9IHBhcnNlSW50KHRpbi5zdWJzdHJpbmcoaSAtIDEsIGkpLCAxMCkgKiAoMTEgLSBpKTtcbiAgICB9XG5cbiAgICByZW1haW5kZXIgPSBfc3VtICogMTAgJSAxMTtcbiAgICBpZiAocmVtYWluZGVyID09PSAxMCkgcmVtYWluZGVyID0gMDtcbiAgICBpZiAocmVtYWluZGVyICE9PSBwYXJzZUludCh0aW4uc3Vic3RyaW5nKDksIDEwKSwgMTApKSByZXR1cm4gZmFsc2U7XG4gICAgX3N1bSA9IDA7XG5cbiAgICBmb3IgKHZhciBfaTggPSAxOyBfaTggPD0gMTA7IF9pOCsrKSB7XG4gICAgICBfc3VtICs9IHBhcnNlSW50KHRpbi5zdWJzdHJpbmcoX2k4IC0gMSwgX2k4KSwgMTApICogKDEyIC0gX2k4KTtcbiAgICB9XG5cbiAgICByZW1haW5kZXIgPSBfc3VtICogMTAgJSAxMTtcbiAgICBpZiAocmVtYWluZGVyID09PSAxMCkgcmVtYWluZGVyID0gMDtcbiAgICBpZiAocmVtYWluZGVyICE9PSBwYXJzZUludCh0aW4uc3Vic3RyaW5nKDEwLCAxMSksIDEwKSkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgaWYgKCAvLyBSZWplY3Qga25vdyBpbnZhbGlkIENOUEpzXG4gIHRpbiA9PT0gJzAwMDAwMDAwMDAwMDAwJyB8fCB0aW4gPT09ICcxMTExMTExMTExMTExMScgfHwgdGluID09PSAnMjIyMjIyMjIyMjIyMjInIHx8IHRpbiA9PT0gJzMzMzMzMzMzMzMzMzMzJyB8fCB0aW4gPT09ICc0NDQ0NDQ0NDQ0NDQ0NCcgfHwgdGluID09PSAnNTU1NTU1NTU1NTU1NTUnIHx8IHRpbiA9PT0gJzY2NjY2NjY2NjY2NjY2JyB8fCB0aW4gPT09ICc3Nzc3Nzc3Nzc3Nzc3NycgfHwgdGluID09PSAnODg4ODg4ODg4ODg4ODgnIHx8IHRpbiA9PT0gJzk5OTk5OTk5OTk5OTk5Jykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBsZW5ndGggPSB0aW4ubGVuZ3RoIC0gMjtcbiAgdmFyIGlkZW50aWZpZXJzID0gdGluLnN1YnN0cmluZygwLCBsZW5ndGgpO1xuICB2YXIgdmVyaWZpY2F0b3JzID0gdGluLnN1YnN0cmluZyhsZW5ndGgpO1xuICB2YXIgc3VtID0gMDtcbiAgdmFyIHBvcyA9IGxlbmd0aCAtIDc7XG5cbiAgZm9yICh2YXIgX2k5ID0gbGVuZ3RoOyBfaTkgPj0gMTsgX2k5LS0pIHtcbiAgICBzdW0gKz0gaWRlbnRpZmllcnMuY2hhckF0KGxlbmd0aCAtIF9pOSkgKiBwb3M7XG4gICAgcG9zIC09IDE7XG5cbiAgICBpZiAocG9zIDwgMikge1xuICAgICAgcG9zID0gOTtcbiAgICB9XG4gIH1cblxuICB2YXIgcmVzdWx0ID0gc3VtICUgMTEgPCAyID8gMCA6IDExIC0gc3VtICUgMTE7XG5cbiAgaWYgKHJlc3VsdCAhPT0gcGFyc2VJbnQodmVyaWZpY2F0b3JzLmNoYXJBdCgwKSwgMTApKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgbGVuZ3RoICs9IDE7XG4gIGlkZW50aWZpZXJzID0gdGluLnN1YnN0cmluZygwLCBsZW5ndGgpO1xuICBzdW0gPSAwO1xuICBwb3MgPSBsZW5ndGggLSA3O1xuXG4gIGZvciAodmFyIF9pMTAgPSBsZW5ndGg7IF9pMTAgPj0gMTsgX2kxMC0tKSB7XG4gICAgc3VtICs9IGlkZW50aWZpZXJzLmNoYXJBdChsZW5ndGggLSBfaTEwKSAqIHBvcztcbiAgICBwb3MgLT0gMTtcblxuICAgIGlmIChwb3MgPCAyKSB7XG4gICAgICBwb3MgPSA5O1xuICAgIH1cbiAgfVxuXG4gIHJlc3VsdCA9IHN1bSAlIDExIDwgMiA/IDAgOiAxMSAtIHN1bSAlIDExO1xuXG4gIGlmIChyZXN1bHQgIT09IHBhcnNlSW50KHZlcmlmaWNhdG9ycy5jaGFyQXQoMSksIDEwKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuLypcbiAqIHB0LVBUIHZhbGlkYXRpb24gZnVuY3Rpb25cbiAqIChOw7ptZXJvIGRlIGlkZW50aWZpY2HDp8OjbyBmaXNjYWwgKE5JRiksIHBlcnNvbnMvZW50aXRpZXMpXG4gKiBWZXJpZnkgVElOIHZhbGlkaXR5IGJ5IGNhbGN1bGF0aW5nIGNoZWNrIChsYXN0KSBkaWdpdCAodmFyaWFudCBvZiBNT0QgMTEpXG4gKi9cblxuXG5mdW5jdGlvbiBwdFB0Q2hlY2sodGluKSB7XG4gIHZhciBjaGVja3N1bSA9IDExIC0gYWxnb3JpdGhtcy5yZXZlcnNlTXVsdGlwbHlBbmRTdW0odGluLnNwbGl0KCcnKS5zbGljZSgwLCA4KS5tYXAoZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gcGFyc2VJbnQoYSwgMTApO1xuICB9KSwgOSkgJSAxMTtcblxuICBpZiAoY2hlY2tzdW0gPiA5KSB7XG4gICAgcmV0dXJuIHBhcnNlSW50KHRpbls4XSwgMTApID09PSAwO1xuICB9XG5cbiAgcmV0dXJuIGNoZWNrc3VtID09PSBwYXJzZUludCh0aW5bOF0sIDEwKTtcbn1cbi8qXG4gKiByby1STyB2YWxpZGF0aW9uIGZ1bmN0aW9uXG4gKiAoQ29kIE51bWVyaWMgUGVyc29uYWwgKENOUCkgb3IgQ29kIGRlIMOubnJlZ2lzdHJhcmUgZmlzY2FsxIMgKENJRiksXG4gKiBwZXJzb25zIG9ubHkpXG4gKiBWZXJpZnkgQ05QIHZhbGlkaXR5IGJ5IGNhbGN1bGF0aW5nIGNoZWNrIChsYXN0KSBkaWdpdCAodGVzdCBub3QgZm91bmQgZm9yIENJRilcbiAqIE1hdGVyaWFsIG5vdCBpbiBERyBUQVhVRCBkb2N1bWVudCBzb3VyY2VkIGZyb206XG4gKiBgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTmF0aW9uYWxfaWRlbnRpZmljYXRpb25fbnVtYmVyI1JvbWFuaWFgXG4gKi9cblxuXG5mdW5jdGlvbiByb1JvQ2hlY2sodGluKSB7XG4gIGlmICh0aW4uc2xpY2UoMCwgNCkgIT09ICc5MDAwJykge1xuICAgIC8vIE5vIHRlc3QgZm91bmQgZm9yIHRoaXMgZm9ybWF0XG4gICAgLy8gRXh0cmFjdCBmdWxsIHllYXIgdXNpbmcgY2VudHVyeSBkaWdpdCBpZiBwb3NzaWJsZVxuICAgIHZhciBmdWxsX3llYXIgPSB0aW4uc2xpY2UoMSwgMyk7XG5cbiAgICBzd2l0Y2ggKHRpblswXSkge1xuICAgICAgY2FzZSAnMSc6XG4gICAgICBjYXNlICcyJzpcbiAgICAgICAgZnVsbF95ZWFyID0gXCIxOVwiLmNvbmNhdChmdWxsX3llYXIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnMyc6XG4gICAgICBjYXNlICc0JzpcbiAgICAgICAgZnVsbF95ZWFyID0gXCIxOFwiLmNvbmNhdChmdWxsX3llYXIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnNSc6XG4gICAgICBjYXNlICc2JzpcbiAgICAgICAgZnVsbF95ZWFyID0gXCIyMFwiLmNvbmNhdChmdWxsX3llYXIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICB9IC8vIENoZWNrIGRhdGUgdmFsaWRpdHlcblxuXG4gICAgdmFyIGRhdGUgPSBcIlwiLmNvbmNhdChmdWxsX3llYXIsIFwiL1wiKS5jb25jYXQodGluLnNsaWNlKDMsIDUpLCBcIi9cIikuY29uY2F0KHRpbi5zbGljZSg1LCA3KSk7XG5cbiAgICBpZiAoZGF0ZS5sZW5ndGggPT09IDgpIHtcbiAgICAgIGlmICghKDAsIF9pc0RhdGUuZGVmYXVsdCkoZGF0ZSwgJ1lZL01NL0REJykpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoISgwLCBfaXNEYXRlLmRlZmF1bHQpKGRhdGUsICdZWVlZL01NL0REJykpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IC8vIENhbGN1bGF0ZSBjaGVjayBkaWdpdFxuXG5cbiAgICB2YXIgZGlnaXRzID0gdGluLnNwbGl0KCcnKS5tYXAoZnVuY3Rpb24gKGEpIHtcbiAgICAgIHJldHVybiBwYXJzZUludChhLCAxMCk7XG4gICAgfSk7XG4gICAgdmFyIG11bHRpcGxpZXJzID0gWzIsIDcsIDksIDEsIDQsIDYsIDMsIDUsIDgsIDIsIDcsIDldO1xuICAgIHZhciBjaGVja3N1bSA9IDA7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG11bHRpcGxpZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjaGVja3N1bSArPSBkaWdpdHNbaV0gKiBtdWx0aXBsaWVyc1tpXTtcbiAgICB9XG5cbiAgICBpZiAoY2hlY2tzdW0gJSAxMSA9PT0gMTApIHtcbiAgICAgIHJldHVybiBkaWdpdHNbMTJdID09PSAxO1xuICAgIH1cblxuICAgIHJldHVybiBkaWdpdHNbMTJdID09PSBjaGVja3N1bSAlIDExO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG4vKlxuICogc2stU0sgdmFsaWRhdGlvbiBmdW5jdGlvblxuICogKFJvZG7DqSDEjcOtc2xvIChSxIwpIG9yIGJlenbDvXpuYW1vdsOpIGlkZW50aWZpa2HEjW7DqSDEjcOtc2xvIChCScSMKSwgcGVyc29ucyBvbmx5KVxuICogQ2hlY2tzIHZhbGlkaXR5IG9mIHByZS0xOTU0IGJpcnRoIG51bWJlcnMgKHJvZG7DqSDEjcOtc2xvKSBvbmx5XG4gKiBEdWUgdG8gdGhlIGludHJvZHVjdGlvbiBvZiB0aGUgcHNldWRvLXJhbmRvbSBCScSMIGl0IGlzIG5vdCBwb3NzaWJsZSB0byB0ZXN0XG4gKiBwb3N0LTE5NTQgYmlydGggbnVtYmVycyB3aXRob3V0IGtub3dpbmcgd2hldGhlciB0aGV5IGFyZSBCScSMIG9yIFLEjCBiZWZvcmVoYW5kXG4gKi9cblxuXG5mdW5jdGlvbiBza1NrQ2hlY2sodGluKSB7XG4gIGlmICh0aW4ubGVuZ3RoID09PSA5KSB7XG4gICAgdGluID0gdGluLnJlcGxhY2UoL1xcVy8sICcnKTtcblxuICAgIGlmICh0aW4uc2xpY2UoNikgPT09ICcwMDAnKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSAvLyBUaHJlZS16ZXJvIHNlcmlhbCBub3QgYXNzaWduZWQgYmVmb3JlIDE5NTRcbiAgICAvLyBFeHRyYWN0IGZ1bGwgeWVhciBmcm9tIFRJTiBsZW5ndGhcblxuXG4gICAgdmFyIGZ1bGxfeWVhciA9IHBhcnNlSW50KHRpbi5zbGljZSgwLCAyKSwgMTApO1xuXG4gICAgaWYgKGZ1bGxfeWVhciA+IDUzKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKGZ1bGxfeWVhciA8IDEwKSB7XG4gICAgICBmdWxsX3llYXIgPSBcIjE5MFwiLmNvbmNhdChmdWxsX3llYXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmdWxsX3llYXIgPSBcIjE5XCIuY29uY2F0KGZ1bGxfeWVhcik7XG4gICAgfSAvLyBFeHRyYWN0IG1vbnRoIGZyb20gVElOIGFuZCBub3JtYWxpemVcblxuXG4gICAgdmFyIG1vbnRoID0gcGFyc2VJbnQodGluLnNsaWNlKDIsIDQpLCAxMCk7XG5cbiAgICBpZiAobW9udGggPiA1MCkge1xuICAgICAgbW9udGggLT0gNTA7XG4gICAgfVxuXG4gICAgaWYgKG1vbnRoIDwgMTApIHtcbiAgICAgIG1vbnRoID0gXCIwXCIuY29uY2F0KG1vbnRoKTtcbiAgICB9IC8vIENoZWNrIGRhdGUgdmFsaWRpdHlcblxuXG4gICAgdmFyIGRhdGUgPSBcIlwiLmNvbmNhdChmdWxsX3llYXIsIFwiL1wiKS5jb25jYXQobW9udGgsIFwiL1wiKS5jb25jYXQodGluLnNsaWNlKDQsIDYpKTtcblxuICAgIGlmICghKDAsIF9pc0RhdGUuZGVmYXVsdCkoZGF0ZSwgJ1lZWVkvTU0vREQnKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuLypcbiAqIHNsLVNJIHZhbGlkYXRpb24gZnVuY3Rpb25cbiAqIChEYXbEjW5hIMWhdGV2aWxrYSwgcGVyc29ucy9lbnRpdGllcylcbiAqIFZlcmlmeSBUSU4gdmFsaWRpdHkgYnkgY2FsY3VsYXRpbmcgY2hlY2sgKGxhc3QpIGRpZ2l0ICh2YXJpYW50IG9mIE1PRCAxMSlcbiAqL1xuXG5cbmZ1bmN0aW9uIHNsU2lDaGVjayh0aW4pIHtcbiAgdmFyIGNoZWNrc3VtID0gMTEgLSBhbGdvcml0aG1zLnJldmVyc2VNdWx0aXBseUFuZFN1bSh0aW4uc3BsaXQoJycpLnNsaWNlKDAsIDcpLm1hcChmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiBwYXJzZUludChhLCAxMCk7XG4gIH0pLCA4KSAlIDExO1xuXG4gIGlmIChjaGVja3N1bSA9PT0gMTApIHtcbiAgICByZXR1cm4gcGFyc2VJbnQodGluWzddLCAxMCkgPT09IDA7XG4gIH1cblxuICByZXR1cm4gY2hlY2tzdW0gPT09IHBhcnNlSW50KHRpbls3XSwgMTApO1xufVxuLypcbiAqIHN2LVNFIHZhbGlkYXRpb24gZnVuY3Rpb25cbiAqIChQZXJzb25udW1tZXIgb3Igc2Ftb3JkbmluZ3NudW1tZXIsIHBlcnNvbnMgb25seSlcbiAqIENoZWNrcyB2YWxpZGl0eSBvZiBiaXJ0aCBkYXRlIGFuZCBjYWxscyBsdWhuQ2hlY2soKSB0byB2YWxpZGF0ZSBjaGVjayAobGFzdCkgZGlnaXRcbiAqL1xuXG5cbmZ1bmN0aW9uIHN2U2VDaGVjayh0aW4pIHtcbiAgLy8gTWFrZSBjb3B5IG9mIFRJTiBhbmQgbm9ybWFsaXplIHRvIHR3by1kaWdpdCB5ZWFyIGZvcm1cbiAgdmFyIHRpbl9jb3B5ID0gdGluLnNsaWNlKDApO1xuXG4gIGlmICh0aW4ubGVuZ3RoID4gMTEpIHtcbiAgICB0aW5fY29weSA9IHRpbl9jb3B5LnNsaWNlKDIpO1xuICB9IC8vIEV4dHJhY3QgZGF0ZSBvZiBiaXJ0aFxuXG5cbiAgdmFyIGZ1bGxfeWVhciA9ICcnO1xuICB2YXIgbW9udGggPSB0aW5fY29weS5zbGljZSgyLCA0KTtcbiAgdmFyIGRheSA9IHBhcnNlSW50KHRpbl9jb3B5LnNsaWNlKDQsIDYpLCAxMCk7XG5cbiAgaWYgKHRpbi5sZW5ndGggPiAxMSkge1xuICAgIGZ1bGxfeWVhciA9IHRpbi5zbGljZSgwLCA0KTtcbiAgfSBlbHNlIHtcbiAgICBmdWxsX3llYXIgPSB0aW4uc2xpY2UoMCwgMik7XG5cbiAgICBpZiAodGluLmxlbmd0aCA9PT0gMTEgJiYgZGF5IDwgNjApIHtcbiAgICAgIC8vIEV4dHJhY3QgZnVsbCB5ZWFyIGZyb20gY2VudGVuYXJpYW4gc3ltYm9sXG4gICAgICAvLyBTaG91bGQgd29yayBqdXN0IGZpbmUgdW50aWwgeWVhciAxMDAwMCBvciBzb1xuICAgICAgdmFyIGN1cnJlbnRfeWVhciA9IG5ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKS50b1N0cmluZygpO1xuICAgICAgdmFyIGN1cnJlbnRfY2VudHVyeSA9IHBhcnNlSW50KGN1cnJlbnRfeWVhci5zbGljZSgwLCAyKSwgMTApO1xuICAgICAgY3VycmVudF95ZWFyID0gcGFyc2VJbnQoY3VycmVudF95ZWFyLCAxMCk7XG5cbiAgICAgIGlmICh0aW5bNl0gPT09ICctJykge1xuICAgICAgICBpZiAocGFyc2VJbnQoXCJcIi5jb25jYXQoY3VycmVudF9jZW50dXJ5KS5jb25jYXQoZnVsbF95ZWFyKSwgMTApID4gY3VycmVudF95ZWFyKSB7XG4gICAgICAgICAgZnVsbF95ZWFyID0gXCJcIi5jb25jYXQoY3VycmVudF9jZW50dXJ5IC0gMSkuY29uY2F0KGZ1bGxfeWVhcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZnVsbF95ZWFyID0gXCJcIi5jb25jYXQoY3VycmVudF9jZW50dXJ5KS5jb25jYXQoZnVsbF95ZWFyKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZnVsbF95ZWFyID0gXCJcIi5jb25jYXQoY3VycmVudF9jZW50dXJ5IC0gMSkuY29uY2F0KGZ1bGxfeWVhcik7XG5cbiAgICAgICAgaWYgKGN1cnJlbnRfeWVhciAtIHBhcnNlSW50KGZ1bGxfeWVhciwgMTApIDwgMTAwKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9IC8vIE5vcm1hbGl6ZSBkYXkgYW5kIGNoZWNrIGRhdGUgdmFsaWRpdHlcblxuXG4gIGlmIChkYXkgPiA2MCkge1xuICAgIGRheSAtPSA2MDtcbiAgfVxuXG4gIGlmIChkYXkgPCAxMCkge1xuICAgIGRheSA9IFwiMFwiLmNvbmNhdChkYXkpO1xuICB9XG5cbiAgdmFyIGRhdGUgPSBcIlwiLmNvbmNhdChmdWxsX3llYXIsIFwiL1wiKS5jb25jYXQobW9udGgsIFwiL1wiKS5jb25jYXQoZGF5KTtcblxuICBpZiAoZGF0ZS5sZW5ndGggPT09IDgpIHtcbiAgICBpZiAoISgwLCBfaXNEYXRlLmRlZmF1bHQpKGRhdGUsICdZWS9NTS9ERCcpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9IGVsc2UgaWYgKCEoMCwgX2lzRGF0ZS5kZWZhdWx0KShkYXRlLCAnWVlZWS9NTS9ERCcpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIGFsZ29yaXRobXMubHVobkNoZWNrKHRpbi5yZXBsYWNlKC9cXFcvLCAnJykpO1xufSAvLyBMb2NhbGUgbG9va3VwIG9iamVjdHNcblxuLypcbiAqIFRheCBpZCByZWdleCBmb3JtYXRzIGZvciB2YXJpb3VzIGxvY2FsZXNcbiAqXG4gKiBXaGVyZSBub3QgZXhwbGljaXRseSBzcGVjaWZpZWQgaW4gREctVEFYVUQgZG9jdW1lbnQgYm90aFxuICogdXBwZXJjYXNlIGFuZCBsb3dlcmNhc2UgbGV0dGVycyBhcmUgYWNjZXB0YWJsZS5cbiAqL1xuXG5cbnZhciB0YXhJZEZvcm1hdCA9IHtcbiAgJ2JnLUJHJzogL15cXGR7MTB9JC8sXG4gICdjcy1DWic6IC9eXFxkezZ9XFwvezAsMX1cXGR7Myw0fSQvLFxuICAnZGUtQVQnOiAvXlxcZHs5fSQvLFxuICAnZGUtREUnOiAvXlsxLTldXFxkezEwfSQvLFxuICAnZGstREsnOiAvXlxcZHs2fS17MCwxfVxcZHs0fSQvLFxuICAnZWwtQ1knOiAvXlswOV1cXGR7N31bQS1aXSQvLFxuICAnZWwtR1InOiAvXihbMC00XXxbNy05XSlcXGR7OH0kLyxcbiAgJ2VuLUdCJzogL15cXGR7MTB9JHxeKD8hR0J8Tkt8VE58WlopKD8hW0RGSVFVVl0pW0EtWl0oPyFbREZJUVVWT10pW0EtWl1cXGR7Nn1bQUJDRCBdJC9pLFxuICAnZW4tSUUnOiAvXlxcZHs3fVtBLVddW0EtSVddezAsMX0kL2ksXG4gICdlbi1VUyc6IC9eXFxkezJ9Wy0gXXswLDF9XFxkezd9JC8sXG4gICdlcy1FUyc6IC9eKFxcZHswLDh9fFtYWVpLTE1dXFxkezd9KVtBLUhKLU5QLVRWLVpdJC9pLFxuICAnZXQtRUUnOiAvXlsxLTZdXFxkezZ9KDAwWzEtOV18MFsxLTldWzAtOV18WzEtNl1bMC05XXsyfXw3MFswLTldfDcxMClcXGQkLyxcbiAgJ2ZpLUZJJzogL15cXGR7Nn1bLStBXVxcZHszfVswLTlBLUZISi1OUFItWV0kL2ksXG4gICdmci1CRSc6IC9eXFxkezExfSQvLFxuICAnZnItRlInOiAvXlswLTNdXFxkezEyfSR8XlswLTNdXFxkXFxzXFxkezJ9KFxcc1xcZHszfSl7M30kLyxcbiAgLy8gQ29uZm9ybXMgYm90aCB0byBvZmZpY2lhbCBzcGVjIGFuZCBwcm92aWRlZCBleGFtcGxlXG4gICdmci1MVSc6IC9eXFxkezEzfSQvLFxuICAnaHItSFInOiAvXlxcZHsxMX0kLyxcbiAgJ2h1LUhVJzogL144XFxkezl9JC8sXG4gICdpdC1JVCc6IC9eW0EtWl17Nn1bTC1OUC1WMC05XXsyfVtBLUVITE1QUlNUXVtMLU5QLVYwLTldezJ9W0EtSUxNWl1bTC1OUC1WMC05XXszfVtBLVpdJC9pLFxuICAnbHYtTFYnOiAvXlxcZHs2fS17MCwxfVxcZHs1fSQvLFxuICAvLyBDb25mb3JtcyBib3RoIHRvIERHIFRBWFVEIHNwZWMgYW5kIG9yaWdpbmFsIHJlc2VhcmNoXG4gICdtdC1NVCc6IC9eXFxkezMsN31bQVBNR0xIQlpdJHxeKFsxLThdKVxcMVxcZHs3fSQvaSxcbiAgJ25sLU5MJzogL15cXGR7OX0kLyxcbiAgJ3BsLVBMJzogL15cXGR7MTAsMTF9JC8sXG4gICdwdC1CUic6IC8oPzpeXFxkezExfSQpfCg/Ol5cXGR7MTR9JCkvLFxuICAncHQtUFQnOiAvXlxcZHs5fSQvLFxuICAncm8tUk8nOiAvXlxcZHsxM30kLyxcbiAgJ3NrLVNLJzogL15cXGR7Nn1cXC97MCwxfVxcZHszLDR9JC8sXG4gICdzbC1TSSc6IC9eWzEtOV1cXGR7N30kLyxcbiAgJ3N2LVNFJzogL14oXFxkezZ9Wy0rXXswLDF9XFxkezR9fCgxOHwxOXwyMClcXGR7Nn1bLStdezAsMX1cXGR7NH0pJC9cbn07IC8vIHRheElkRm9ybWF0IGxvY2FsZSBhbGlhc2VzXG5cbnRheElkRm9ybWF0WydsYi1MVSddID0gdGF4SWRGb3JtYXRbJ2ZyLUxVJ107XG50YXhJZEZvcm1hdFsnbHQtTFQnXSA9IHRheElkRm9ybWF0WydldC1FRSddO1xudGF4SWRGb3JtYXRbJ25sLUJFJ10gPSB0YXhJZEZvcm1hdFsnZnItQkUnXTsgLy8gQWxnb3JpdGhtaWMgdGF4IGlkIGNoZWNrIGZ1bmN0aW9ucyBmb3IgdmFyaW91cyBsb2NhbGVzXG5cbnZhciB0YXhJZENoZWNrID0ge1xuICAnYmctQkcnOiBiZ0JnQ2hlY2ssXG4gICdjcy1DWic6IGNzQ3pDaGVjayxcbiAgJ2RlLUFUJzogZGVBdENoZWNrLFxuICAnZGUtREUnOiBkZURlQ2hlY2ssXG4gICdkay1ESyc6IGRrRGtDaGVjayxcbiAgJ2VsLUNZJzogZWxDeUNoZWNrLFxuICAnZWwtR1InOiBlbEdyQ2hlY2ssXG4gICdlbi1JRSc6IGVuSWVDaGVjayxcbiAgJ2VuLVVTJzogZW5Vc0NoZWNrLFxuICAnZXMtRVMnOiBlc0VzQ2hlY2ssXG4gICdldC1FRSc6IGV0RWVDaGVjayxcbiAgJ2ZpLUZJJzogZmlGaUNoZWNrLFxuICAnZnItQkUnOiBmckJlQ2hlY2ssXG4gICdmci1GUic6IGZyRnJDaGVjayxcbiAgJ2ZyLUxVJzogZnJMdUNoZWNrLFxuICAnaHItSFInOiBockhyQ2hlY2ssXG4gICdodS1IVSc6IGh1SHVDaGVjayxcbiAgJ2l0LUlUJzogaXRJdENoZWNrLFxuICAnbHYtTFYnOiBsdkx2Q2hlY2ssXG4gICdtdC1NVCc6IG10TXRDaGVjayxcbiAgJ25sLU5MJzogbmxObENoZWNrLFxuICAncGwtUEwnOiBwbFBsQ2hlY2ssXG4gICdwdC1CUic6IHB0QnJDaGVjayxcbiAgJ3B0LVBUJzogcHRQdENoZWNrLFxuICAncm8tUk8nOiByb1JvQ2hlY2ssXG4gICdzay1TSyc6IHNrU2tDaGVjayxcbiAgJ3NsLVNJJzogc2xTaUNoZWNrLFxuICAnc3YtU0UnOiBzdlNlQ2hlY2tcbn07IC8vIHRheElkQ2hlY2sgbG9jYWxlIGFsaWFzZXNcblxudGF4SWRDaGVja1snbGItTFUnXSA9IHRheElkQ2hlY2tbJ2ZyLUxVJ107XG50YXhJZENoZWNrWydsdC1MVCddID0gdGF4SWRDaGVja1snZXQtRUUnXTtcbnRheElkQ2hlY2tbJ25sLUJFJ10gPSB0YXhJZENoZWNrWydmci1CRSddOyAvLyBSZWdleGVzIGZvciBsb2NhbGVzIHdoZXJlIGNoYXJhY3RlcnMgc2hvdWxkIGJlIG9taXR0ZWQgYmVmb3JlIGNoZWNraW5nIGZvcm1hdFxuXG52YXIgYWxsc3ltYm9scyA9IC9bLVxcXFxcXC8hQCMkJVxcXiZcXCpcXChcXClcXCtcXD1cXFtcXF1dKy9nO1xudmFyIHNhbml0aXplUmVnZXhlcyA9IHtcbiAgJ2RlLUFUJzogYWxsc3ltYm9scyxcbiAgJ2RlLURFJzogL1tcXC9cXFxcXS9nLFxuICAnZnItQkUnOiBhbGxzeW1ib2xzXG59OyAvLyBzYW5pdGl6ZVJlZ2V4ZXMgbG9jYWxlIGFsaWFzZXNcblxuc2FuaXRpemVSZWdleGVzWydubC1CRSddID0gc2FuaXRpemVSZWdleGVzWydmci1CRSddO1xuLypcbiAqIFZhbGlkYXRvciBmdW5jdGlvblxuICogUmV0dXJuIHRydWUgaWYgdGhlIHBhc3NlZCBzdHJpbmcgaXMgYSB2YWxpZCB0YXggaWRlbnRpZmljYXRpb24gbnVtYmVyXG4gKiBmb3IgdGhlIHNwZWNpZmllZCBsb2NhbGUuXG4gKiBUaHJvdyBhbiBlcnJvciBleGNlcHRpb24gaWYgdGhlIGxvY2FsZSBpcyBub3Qgc3VwcG9ydGVkLlxuICovXG5cbmZ1bmN0aW9uIGlzVGF4SUQoc3RyKSB7XG4gIHZhciBsb2NhbGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6ICdlbi1VUyc7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7IC8vIENvcHkgVElOIHRvIGF2b2lkIHJlcGxhY2VtZW50IGlmIHNhbml0aXplZFxuXG4gIHZhciBzdHJjb3B5ID0gc3RyLnNsaWNlKDApO1xuXG4gIGlmIChsb2NhbGUgaW4gdGF4SWRGb3JtYXQpIHtcbiAgICBpZiAobG9jYWxlIGluIHNhbml0aXplUmVnZXhlcykge1xuICAgICAgc3RyY29weSA9IHN0cmNvcHkucmVwbGFjZShzYW5pdGl6ZVJlZ2V4ZXNbbG9jYWxlXSwgJycpO1xuICAgIH1cblxuICAgIGlmICghdGF4SWRGb3JtYXRbbG9jYWxlXS50ZXN0KHN0cmNvcHkpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKGxvY2FsZSBpbiB0YXhJZENoZWNrKSB7XG4gICAgICByZXR1cm4gdGF4SWRDaGVja1tsb2NhbGVdKHN0cmNvcHkpO1xuICAgIH0gLy8gRmFsbHRocm91Z2g7IG5vdCBhbGwgbG9jYWxlcyBoYXZlIGFsZ29yaXRobWljIGNoZWNrc1xuXG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgbG9jYWxlICdcIi5jb25jYXQobG9jYWxlLCBcIidcIikpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBpc1VSTDtcblxudmFyIF9hc3NlcnRTdHJpbmcgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvYXNzZXJ0U3RyaW5nXCIpKTtcblxudmFyIF9pc0ZRRE4gPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2lzRlFETlwiKSk7XG5cbnZhciBfaXNJUCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vaXNJUFwiKSk7XG5cbnZhciBfbWVyZ2UgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvbWVyZ2VcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfc2xpY2VkVG9BcnJheShhcnIsIGkpIHsgcmV0dXJuIF9hcnJheVdpdGhIb2xlcyhhcnIpIHx8IF9pdGVyYWJsZVRvQXJyYXlMaW1pdChhcnIsIGkpIHx8IF91bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheShhcnIsIGkpIHx8IF9ub25JdGVyYWJsZVJlc3QoKTsgfVxuXG5mdW5jdGlvbiBfbm9uSXRlcmFibGVSZXN0KCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZS5cXG5JbiBvcmRlciB0byBiZSBpdGVyYWJsZSwgbm9uLWFycmF5IG9iamVjdHMgbXVzdCBoYXZlIGEgW1N5bWJvbC5pdGVyYXRvcl0oKSBtZXRob2QuXCIpOyB9XG5cbmZ1bmN0aW9uIF91bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheShvLCBtaW5MZW4pIHsgaWYgKCFvKSByZXR1cm47IGlmICh0eXBlb2YgbyA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIF9hcnJheUxpa2VUb0FycmF5KG8sIG1pbkxlbik7IHZhciBuID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pLnNsaWNlKDgsIC0xKTsgaWYgKG4gPT09IFwiT2JqZWN0XCIgJiYgby5jb25zdHJ1Y3RvcikgbiA9IG8uY29uc3RydWN0b3IubmFtZTsgaWYgKG4gPT09IFwiTWFwXCIgfHwgbiA9PT0gXCJTZXRcIikgcmV0dXJuIEFycmF5LmZyb20obyk7IGlmIChuID09PSBcIkFyZ3VtZW50c1wiIHx8IC9eKD86VWl8SSludCg/Ojh8MTZ8MzIpKD86Q2xhbXBlZCk/QXJyYXkkLy50ZXN0KG4pKSByZXR1cm4gX2FycmF5TGlrZVRvQXJyYXkobywgbWluTGVuKTsgfVxuXG5mdW5jdGlvbiBfYXJyYXlMaWtlVG9BcnJheShhcnIsIGxlbikgeyBpZiAobGVuID09IG51bGwgfHwgbGVuID4gYXJyLmxlbmd0aCkgbGVuID0gYXJyLmxlbmd0aDsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBuZXcgQXJyYXkobGVuKTsgaSA8IGxlbjsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH1cblxuZnVuY3Rpb24gX2l0ZXJhYmxlVG9BcnJheUxpbWl0KGFyciwgaSkgeyBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJ1bmRlZmluZWRcIiB8fCAhKFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoYXJyKSkpIHJldHVybjsgdmFyIF9hcnIgPSBbXTsgdmFyIF9uID0gdHJ1ZTsgdmFyIF9kID0gZmFsc2U7IHZhciBfZSA9IHVuZGVmaW5lZDsgdHJ5IHsgZm9yICh2YXIgX2kgPSBhcnJbU3ltYm9sLml0ZXJhdG9yXSgpLCBfczsgIShfbiA9IChfcyA9IF9pLm5leHQoKSkuZG9uZSk7IF9uID0gdHJ1ZSkgeyBfYXJyLnB1c2goX3MudmFsdWUpOyBpZiAoaSAmJiBfYXJyLmxlbmd0aCA9PT0gaSkgYnJlYWs7IH0gfSBjYXRjaCAoZXJyKSB7IF9kID0gdHJ1ZTsgX2UgPSBlcnI7IH0gZmluYWxseSB7IHRyeSB7IGlmICghX24gJiYgX2lbXCJyZXR1cm5cIl0gIT0gbnVsbCkgX2lbXCJyZXR1cm5cIl0oKTsgfSBmaW5hbGx5IHsgaWYgKF9kKSB0aHJvdyBfZTsgfSB9IHJldHVybiBfYXJyOyB9XG5cbmZ1bmN0aW9uIF9hcnJheVdpdGhIb2xlcyhhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgcmV0dXJuIGFycjsgfVxuXG4vKlxub3B0aW9ucyBmb3IgaXNVUkwgbWV0aG9kXG5cbnJlcXVpcmVfcHJvdG9jb2wgLSBpZiBzZXQgYXMgdHJ1ZSBpc1VSTCB3aWxsIHJldHVybiBmYWxzZSBpZiBwcm90b2NvbCBpcyBub3QgcHJlc2VudCBpbiB0aGUgVVJMXG5yZXF1aXJlX3ZhbGlkX3Byb3RvY29sIC0gaXNVUkwgd2lsbCBjaGVjayBpZiB0aGUgVVJMJ3MgcHJvdG9jb2wgaXMgcHJlc2VudCBpbiB0aGUgcHJvdG9jb2xzIG9wdGlvblxucHJvdG9jb2xzIC0gdmFsaWQgcHJvdG9jb2xzIGNhbiBiZSBtb2RpZmllZCB3aXRoIHRoaXMgb3B0aW9uXG5yZXF1aXJlX2hvc3QgLSBpZiBzZXQgYXMgZmFsc2UgaXNVUkwgd2lsbCBub3QgY2hlY2sgaWYgaG9zdCBpcyBwcmVzZW50IGluIHRoZSBVUkxcbnJlcXVpcmVfcG9ydCAtIGlmIHNldCBhcyB0cnVlIGlzVVJMIHdpbGwgY2hlY2sgaWYgcG9ydCBpcyBwcmVzZW50IGluIHRoZSBVUkxcbmFsbG93X3Byb3RvY29sX3JlbGF0aXZlX3VybHMgLSBpZiBzZXQgYXMgdHJ1ZSBwcm90b2NvbCByZWxhdGl2ZSBVUkxzIHdpbGwgYmUgYWxsb3dlZFxudmFsaWRhdGVfbGVuZ3RoIC0gaWYgc2V0IGFzIGZhbHNlIGlzVVJMIHdpbGwgc2tpcCBzdHJpbmcgbGVuZ3RoIHZhbGlkYXRpb24gKElFIG1heGltdW0gaXMgMjA4MylcblxuKi9cbnZhciBkZWZhdWx0X3VybF9vcHRpb25zID0ge1xuICBwcm90b2NvbHM6IFsnaHR0cCcsICdodHRwcycsICdmdHAnXSxcbiAgcmVxdWlyZV90bGQ6IHRydWUsXG4gIHJlcXVpcmVfcHJvdG9jb2w6IGZhbHNlLFxuICByZXF1aXJlX2hvc3Q6IHRydWUsXG4gIHJlcXVpcmVfcG9ydDogZmFsc2UsXG4gIHJlcXVpcmVfdmFsaWRfcHJvdG9jb2w6IHRydWUsXG4gIGFsbG93X3VuZGVyc2NvcmVzOiBmYWxzZSxcbiAgYWxsb3dfdHJhaWxpbmdfZG90OiBmYWxzZSxcbiAgYWxsb3dfcHJvdG9jb2xfcmVsYXRpdmVfdXJsczogZmFsc2UsXG4gIGFsbG93X2ZyYWdtZW50czogdHJ1ZSxcbiAgYWxsb3dfcXVlcnlfY29tcG9uZW50czogdHJ1ZSxcbiAgdmFsaWRhdGVfbGVuZ3RoOiB0cnVlXG59O1xudmFyIHdyYXBwZWRfaXB2NiA9IC9eXFxbKFteXFxdXSspXFxdKD86OihbMC05XSspKT8kLztcblxuZnVuY3Rpb24gaXNSZWdFeHAob2JqKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSc7XG59XG5cbmZ1bmN0aW9uIGNoZWNrSG9zdChob3N0LCBtYXRjaGVzKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbWF0Y2hlcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBtYXRjaCA9IG1hdGNoZXNbaV07XG5cbiAgICBpZiAoaG9zdCA9PT0gbWF0Y2ggfHwgaXNSZWdFeHAobWF0Y2gpICYmIG1hdGNoLnRlc3QoaG9zdCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gaXNVUkwodXJsLCBvcHRpb25zKSB7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHVybCk7XG5cbiAgaWYgKCF1cmwgfHwgL1tcXHM8Pl0vLnRlc3QodXJsKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICh1cmwuaW5kZXhPZignbWFpbHRvOicpID09PSAwKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgb3B0aW9ucyA9ICgwLCBfbWVyZ2UuZGVmYXVsdCkob3B0aW9ucywgZGVmYXVsdF91cmxfb3B0aW9ucyk7XG5cbiAgaWYgKG9wdGlvbnMudmFsaWRhdGVfbGVuZ3RoICYmIHVybC5sZW5ndGggPj0gMjA4Mykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICghb3B0aW9ucy5hbGxvd19mcmFnbWVudHMgJiYgdXJsLmluY2x1ZGVzKCcjJykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoIW9wdGlvbnMuYWxsb3dfcXVlcnlfY29tcG9uZW50cyAmJiAodXJsLmluY2x1ZGVzKCc/JykgfHwgdXJsLmluY2x1ZGVzKCcmJykpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIHByb3RvY29sLCBhdXRoLCBob3N0LCBob3N0bmFtZSwgcG9ydCwgcG9ydF9zdHIsIHNwbGl0LCBpcHY2O1xuICBzcGxpdCA9IHVybC5zcGxpdCgnIycpO1xuICB1cmwgPSBzcGxpdC5zaGlmdCgpO1xuICBzcGxpdCA9IHVybC5zcGxpdCgnPycpO1xuICB1cmwgPSBzcGxpdC5zaGlmdCgpO1xuICBzcGxpdCA9IHVybC5zcGxpdCgnOi8vJyk7XG5cbiAgaWYgKHNwbGl0Lmxlbmd0aCA+IDEpIHtcbiAgICBwcm90b2NvbCA9IHNwbGl0LnNoaWZ0KCkudG9Mb3dlckNhc2UoKTtcblxuICAgIGlmIChvcHRpb25zLnJlcXVpcmVfdmFsaWRfcHJvdG9jb2wgJiYgb3B0aW9ucy5wcm90b2NvbHMuaW5kZXhPZihwcm90b2NvbCkgPT09IC0xKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9IGVsc2UgaWYgKG9wdGlvbnMucmVxdWlyZV9wcm90b2NvbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSBlbHNlIGlmICh1cmwuc3Vic3RyKDAsIDIpID09PSAnLy8nKSB7XG4gICAgaWYgKCFvcHRpb25zLmFsbG93X3Byb3RvY29sX3JlbGF0aXZlX3VybHMpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBzcGxpdFswXSA9IHVybC5zdWJzdHIoMik7XG4gIH1cblxuICB1cmwgPSBzcGxpdC5qb2luKCc6Ly8nKTtcblxuICBpZiAodXJsID09PSAnJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHNwbGl0ID0gdXJsLnNwbGl0KCcvJyk7XG4gIHVybCA9IHNwbGl0LnNoaWZ0KCk7XG5cbiAgaWYgKHVybCA9PT0gJycgJiYgIW9wdGlvbnMucmVxdWlyZV9ob3N0KSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBzcGxpdCA9IHVybC5zcGxpdCgnQCcpO1xuXG4gIGlmIChzcGxpdC5sZW5ndGggPiAxKSB7XG4gICAgaWYgKG9wdGlvbnMuZGlzYWxsb3dfYXV0aCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChzcGxpdFswXSA9PT0gJycpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBhdXRoID0gc3BsaXQuc2hpZnQoKTtcblxuICAgIGlmIChhdXRoLmluZGV4T2YoJzonKSA+PSAwICYmIGF1dGguc3BsaXQoJzonKS5sZW5ndGggPiAyKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIF9hdXRoJHNwbGl0ID0gYXV0aC5zcGxpdCgnOicpLFxuICAgICAgICBfYXV0aCRzcGxpdDIgPSBfc2xpY2VkVG9BcnJheShfYXV0aCRzcGxpdCwgMiksXG4gICAgICAgIHVzZXIgPSBfYXV0aCRzcGxpdDJbMF0sXG4gICAgICAgIHBhc3N3b3JkID0gX2F1dGgkc3BsaXQyWzFdO1xuXG4gICAgaWYgKHVzZXIgPT09ICcnICYmIHBhc3N3b3JkID09PSAnJykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGhvc3RuYW1lID0gc3BsaXQuam9pbignQCcpO1xuICBwb3J0X3N0ciA9IG51bGw7XG4gIGlwdjYgPSBudWxsO1xuICB2YXIgaXB2Nl9tYXRjaCA9IGhvc3RuYW1lLm1hdGNoKHdyYXBwZWRfaXB2Nik7XG5cbiAgaWYgKGlwdjZfbWF0Y2gpIHtcbiAgICBob3N0ID0gJyc7XG4gICAgaXB2NiA9IGlwdjZfbWF0Y2hbMV07XG4gICAgcG9ydF9zdHIgPSBpcHY2X21hdGNoWzJdIHx8IG51bGw7XG4gIH0gZWxzZSB7XG4gICAgc3BsaXQgPSBob3N0bmFtZS5zcGxpdCgnOicpO1xuICAgIGhvc3QgPSBzcGxpdC5zaGlmdCgpO1xuXG4gICAgaWYgKHNwbGl0Lmxlbmd0aCkge1xuICAgICAgcG9ydF9zdHIgPSBzcGxpdC5qb2luKCc6Jyk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHBvcnRfc3RyICE9PSBudWxsICYmIHBvcnRfc3RyLmxlbmd0aCA+IDApIHtcbiAgICBwb3J0ID0gcGFyc2VJbnQocG9ydF9zdHIsIDEwKTtcblxuICAgIGlmICghL15bMC05XSskLy50ZXN0KHBvcnRfc3RyKSB8fCBwb3J0IDw9IDAgfHwgcG9ydCA+IDY1NTM1KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9IGVsc2UgaWYgKG9wdGlvbnMucmVxdWlyZV9wb3J0KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMuaG9zdF93aGl0ZWxpc3QpIHtcbiAgICByZXR1cm4gY2hlY2tIb3N0KGhvc3QsIG9wdGlvbnMuaG9zdF93aGl0ZWxpc3QpO1xuICB9XG5cbiAgaWYgKCEoMCwgX2lzSVAuZGVmYXVsdCkoaG9zdCkgJiYgISgwLCBfaXNGUUROLmRlZmF1bHQpKGhvc3QsIG9wdGlvbnMpICYmICghaXB2NiB8fCAhKDAsIF9pc0lQLmRlZmF1bHQpKGlwdjYsIDYpKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGhvc3QgPSBob3N0IHx8IGlwdjY7XG5cbiAgaWYgKG9wdGlvbnMuaG9zdF9ibGFja2xpc3QgJiYgY2hlY2tIb3N0KGhvc3QsIG9wdGlvbnMuaG9zdF9ibGFja2xpc3QpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGlzVVVJRDtcblxudmFyIF9hc3NlcnRTdHJpbmcgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvYXNzZXJ0U3RyaW5nXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIHV1aWQgPSB7XG4gIDE6IC9eWzAtOUEtRl17OH0tWzAtOUEtRl17NH0tMVswLTlBLUZdezN9LVswLTlBLUZdezR9LVswLTlBLUZdezEyfSQvaSxcbiAgMjogL15bMC05QS1GXXs4fS1bMC05QS1GXXs0fS0yWzAtOUEtRl17M30tWzAtOUEtRl17NH0tWzAtOUEtRl17MTJ9JC9pLFxuICAzOiAvXlswLTlBLUZdezh9LVswLTlBLUZdezR9LTNbMC05QS1GXXszfS1bMC05QS1GXXs0fS1bMC05QS1GXXsxMn0kL2ksXG4gIDQ6IC9eWzAtOUEtRl17OH0tWzAtOUEtRl17NH0tNFswLTlBLUZdezN9LVs4OUFCXVswLTlBLUZdezN9LVswLTlBLUZdezEyfSQvaSxcbiAgNTogL15bMC05QS1GXXs4fS1bMC05QS1GXXs0fS01WzAtOUEtRl17M30tWzg5QUJdWzAtOUEtRl17M30tWzAtOUEtRl17MTJ9JC9pLFxuICBhbGw6IC9eWzAtOUEtRl17OH0tWzAtOUEtRl17NH0tWzAtOUEtRl17NH0tWzAtOUEtRl17NH0tWzAtOUEtRl17MTJ9JC9pXG59O1xuXG5mdW5jdGlvbiBpc1VVSUQoc3RyLCB2ZXJzaW9uKSB7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7XG4gIHZhciBwYXR0ZXJuID0gdXVpZFshW3VuZGVmaW5lZCwgbnVsbF0uaW5jbHVkZXModmVyc2lvbikgPyB2ZXJzaW9uIDogJ2FsbCddO1xuICByZXR1cm4gISFwYXR0ZXJuICYmIHBhdHRlcm4udGVzdChzdHIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBpc1VwcGVyY2FzZTtcblxudmFyIF9hc3NlcnRTdHJpbmcgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvYXNzZXJ0U3RyaW5nXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gaXNVcHBlcmNhc2Uoc3RyKSB7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7XG4gIHJldHVybiBzdHIgPT09IHN0ci50b1VwcGVyQ2FzZSgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBpc1ZBVDtcbmV4cG9ydHMudmF0TWF0Y2hlcnMgPSB2b2lkIDA7XG5cbnZhciBfYXNzZXJ0U3RyaW5nID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL2Fzc2VydFN0cmluZ1wiKSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciB2YXRNYXRjaGVycyA9IHtcbiAgR0I6IC9eR0IoKFxcZHszfSBcXGR7NH0gKFswLThdWzAtOV18OVswLTZdKSl8KFxcZHs5fSBcXGR7M30pfCgoKEdEWzAtNF0pfChIQVs1LTldKSlbMC05XXsyfSkpJC8sXG4gIElUOiAvXihJVCk/WzAtOV17MTF9JC8sXG4gIE5MOiAvXihOTCk/WzAtOV17OX1CWzAtOV17Mn0kL1xufTtcbmV4cG9ydHMudmF0TWF0Y2hlcnMgPSB2YXRNYXRjaGVycztcblxuZnVuY3Rpb24gaXNWQVQoc3RyLCBjb3VudHJ5Q29kZSkge1xuICAoMCwgX2Fzc2VydFN0cmluZy5kZWZhdWx0KShzdHIpO1xuICAoMCwgX2Fzc2VydFN0cmluZy5kZWZhdWx0KShjb3VudHJ5Q29kZSk7XG5cbiAgaWYgKGNvdW50cnlDb2RlIGluIHZhdE1hdGNoZXJzKSB7XG4gICAgcmV0dXJuIHZhdE1hdGNoZXJzW2NvdW50cnlDb2RlXS50ZXN0KHN0cik7XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGNvdW50cnkgY29kZTogJ1wiLmNvbmNhdChjb3VudHJ5Q29kZSwgXCInXCIpKTtcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGlzVmFyaWFibGVXaWR0aDtcblxudmFyIF9hc3NlcnRTdHJpbmcgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvYXNzZXJ0U3RyaW5nXCIpKTtcblxudmFyIF9pc0Z1bGxXaWR0aCA9IHJlcXVpcmUoXCIuL2lzRnVsbFdpZHRoXCIpO1xuXG52YXIgX2lzSGFsZldpZHRoID0gcmVxdWlyZShcIi4vaXNIYWxmV2lkdGhcIik7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIGlzVmFyaWFibGVXaWR0aChzdHIpIHtcbiAgKDAsIF9hc3NlcnRTdHJpbmcuZGVmYXVsdCkoc3RyKTtcbiAgcmV0dXJuIF9pc0Z1bGxXaWR0aC5mdWxsV2lkdGgudGVzdChzdHIpICYmIF9pc0hhbGZXaWR0aC5oYWxmV2lkdGgudGVzdChzdHIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBpc1doaXRlbGlzdGVkO1xuXG52YXIgX2Fzc2VydFN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9hc3NlcnRTdHJpbmdcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBpc1doaXRlbGlzdGVkKHN0ciwgY2hhcnMpIHtcbiAgKDAsIF9hc3NlcnRTdHJpbmcuZGVmYXVsdCkoc3RyKTtcblxuICBmb3IgKHZhciBpID0gc3RyLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgaWYgKGNoYXJzLmluZGV4T2Yoc3RyW2ldKSA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzLmRlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gbHRyaW07XG5cbnZhciBfYXNzZXJ0U3RyaW5nID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL2Fzc2VydFN0cmluZ1wiKSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIGx0cmltKHN0ciwgY2hhcnMpIHtcbiAgKDAsIF9hc3NlcnRTdHJpbmcuZGVmYXVsdCkoc3RyKTsgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9HdWlkZS9SZWd1bGFyX0V4cHJlc3Npb25zI0VzY2FwaW5nXG5cbiAgdmFyIHBhdHRlcm4gPSBjaGFycyA/IG5ldyBSZWdFeHAoXCJeW1wiLmNvbmNhdChjaGFycy5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpLCBcIl0rXCIpLCAnZycpIDogL15cXHMrL2c7XG4gIHJldHVybiBzdHIucmVwbGFjZShwYXR0ZXJuLCAnJyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IG1hdGNoZXM7XG5cbnZhciBfYXNzZXJ0U3RyaW5nID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL2Fzc2VydFN0cmluZ1wiKSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIG1hdGNoZXMoc3RyLCBwYXR0ZXJuLCBtb2RpZmllcnMpIHtcbiAgKDAsIF9hc3NlcnRTdHJpbmcuZGVmYXVsdCkoc3RyKTtcblxuICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHBhdHRlcm4pICE9PSAnW29iamVjdCBSZWdFeHBdJykge1xuICAgIHBhdHRlcm4gPSBuZXcgUmVnRXhwKHBhdHRlcm4sIG1vZGlmaWVycyk7XG4gIH1cblxuICByZXR1cm4gcGF0dGVybi50ZXN0KHN0cik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IG5vcm1hbGl6ZUVtYWlsO1xuXG52YXIgX21lcmdlID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL21lcmdlXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIGRlZmF1bHRfbm9ybWFsaXplX2VtYWlsX29wdGlvbnMgPSB7XG4gIC8vIFRoZSBmb2xsb3dpbmcgb3B0aW9ucyBhcHBseSB0byBhbGwgZW1haWwgYWRkcmVzc2VzXG4gIC8vIExvd2VyY2FzZXMgdGhlIGxvY2FsIHBhcnQgb2YgdGhlIGVtYWlsIGFkZHJlc3MuXG4gIC8vIFBsZWFzZSBub3RlIHRoaXMgbWF5IHZpb2xhdGUgUkZDIDUzMjEgYXMgcGVyIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzk4MDgzMzIvMTkyMDI0KS5cbiAgLy8gVGhlIGRvbWFpbiBpcyBhbHdheXMgbG93ZXJjYXNlZCwgYXMgcGVyIFJGQyAxMDM1XG4gIGFsbF9sb3dlcmNhc2U6IHRydWUsXG4gIC8vIFRoZSBmb2xsb3dpbmcgY29udmVyc2lvbnMgYXJlIHNwZWNpZmljIHRvIEdNYWlsXG4gIC8vIExvd2VyY2FzZXMgdGhlIGxvY2FsIHBhcnQgb2YgdGhlIEdNYWlsIGFkZHJlc3MgKGtub3duIHRvIGJlIGNhc2UtaW5zZW5zaXRpdmUpXG4gIGdtYWlsX2xvd2VyY2FzZTogdHJ1ZSxcbiAgLy8gUmVtb3ZlcyBkb3RzIGZyb20gdGhlIGxvY2FsIHBhcnQgb2YgdGhlIGVtYWlsIGFkZHJlc3MsIGFzIHRoYXQncyBpZ25vcmVkIGJ5IEdNYWlsXG4gIGdtYWlsX3JlbW92ZV9kb3RzOiB0cnVlLFxuICAvLyBSZW1vdmVzIHRoZSBzdWJhZGRyZXNzIChlLmcuIFwiK2Zvb1wiKSBmcm9tIHRoZSBlbWFpbCBhZGRyZXNzXG4gIGdtYWlsX3JlbW92ZV9zdWJhZGRyZXNzOiB0cnVlLFxuICAvLyBDb252ZXJzdHMgdGhlIGdvb2dsZW1haWwuY29tIGRvbWFpbiB0byBnbWFpbC5jb21cbiAgZ21haWxfY29udmVydF9nb29nbGVtYWlsZG90Y29tOiB0cnVlLFxuICAvLyBUaGUgZm9sbG93aW5nIGNvbnZlcnNpb25zIGFyZSBzcGVjaWZpYyB0byBPdXRsb29rLmNvbSAvIFdpbmRvd3MgTGl2ZSAvIEhvdG1haWxcbiAgLy8gTG93ZXJjYXNlcyB0aGUgbG9jYWwgcGFydCBvZiB0aGUgT3V0bG9vay5jb20gYWRkcmVzcyAoa25vd24gdG8gYmUgY2FzZS1pbnNlbnNpdGl2ZSlcbiAgb3V0bG9va2RvdGNvbV9sb3dlcmNhc2U6IHRydWUsXG4gIC8vIFJlbW92ZXMgdGhlIHN1YmFkZHJlc3MgKGUuZy4gXCIrZm9vXCIpIGZyb20gdGhlIGVtYWlsIGFkZHJlc3NcbiAgb3V0bG9va2RvdGNvbV9yZW1vdmVfc3ViYWRkcmVzczogdHJ1ZSxcbiAgLy8gVGhlIGZvbGxvd2luZyBjb252ZXJzaW9ucyBhcmUgc3BlY2lmaWMgdG8gWWFob29cbiAgLy8gTG93ZXJjYXNlcyB0aGUgbG9jYWwgcGFydCBvZiB0aGUgWWFob28gYWRkcmVzcyAoa25vd24gdG8gYmUgY2FzZS1pbnNlbnNpdGl2ZSlcbiAgeWFob29fbG93ZXJjYXNlOiB0cnVlLFxuICAvLyBSZW1vdmVzIHRoZSBzdWJhZGRyZXNzIChlLmcuIFwiLWZvb1wiKSBmcm9tIHRoZSBlbWFpbCBhZGRyZXNzXG4gIHlhaG9vX3JlbW92ZV9zdWJhZGRyZXNzOiB0cnVlLFxuICAvLyBUaGUgZm9sbG93aW5nIGNvbnZlcnNpb25zIGFyZSBzcGVjaWZpYyB0byBZYW5kZXhcbiAgLy8gTG93ZXJjYXNlcyB0aGUgbG9jYWwgcGFydCBvZiB0aGUgWWFuZGV4IGFkZHJlc3MgKGtub3duIHRvIGJlIGNhc2UtaW5zZW5zaXRpdmUpXG4gIHlhbmRleF9sb3dlcmNhc2U6IHRydWUsXG4gIC8vIFRoZSBmb2xsb3dpbmcgY29udmVyc2lvbnMgYXJlIHNwZWNpZmljIHRvIGlDbG91ZFxuICAvLyBMb3dlcmNhc2VzIHRoZSBsb2NhbCBwYXJ0IG9mIHRoZSBpQ2xvdWQgYWRkcmVzcyAoa25vd24gdG8gYmUgY2FzZS1pbnNlbnNpdGl2ZSlcbiAgaWNsb3VkX2xvd2VyY2FzZTogdHJ1ZSxcbiAgLy8gUmVtb3ZlcyB0aGUgc3ViYWRkcmVzcyAoZS5nLiBcIitmb29cIikgZnJvbSB0aGUgZW1haWwgYWRkcmVzc1xuICBpY2xvdWRfcmVtb3ZlX3N1YmFkZHJlc3M6IHRydWVcbn07IC8vIExpc3Qgb2YgZG9tYWlucyB1c2VkIGJ5IGlDbG91ZFxuXG52YXIgaWNsb3VkX2RvbWFpbnMgPSBbJ2ljbG91ZC5jb20nLCAnbWUuY29tJ107IC8vIExpc3Qgb2YgZG9tYWlucyB1c2VkIGJ5IE91dGxvb2suY29tIGFuZCBpdHMgcHJlZGVjZXNzb3JzXG4vLyBUaGlzIGxpc3QgaXMgbGlrZWx5IGluY29tcGxldGUuXG4vLyBQYXJ0aWFsIHJlZmVyZW5jZTpcbi8vIGh0dHBzOi8vYmxvZ3Mub2ZmaWNlLmNvbS8yMDEzLzA0LzE3L291dGxvb2stY29tLWdldHMtdHdvLXN0ZXAtdmVyaWZpY2F0aW9uLXNpZ24taW4tYnktYWxpYXMtYW5kLW5ldy1pbnRlcm5hdGlvbmFsLWRvbWFpbnMvXG5cbnZhciBvdXRsb29rZG90Y29tX2RvbWFpbnMgPSBbJ2hvdG1haWwuYXQnLCAnaG90bWFpbC5iZScsICdob3RtYWlsLmNhJywgJ2hvdG1haWwuY2wnLCAnaG90bWFpbC5jby5pbCcsICdob3RtYWlsLmNvLm56JywgJ2hvdG1haWwuY28udGgnLCAnaG90bWFpbC5jby51aycsICdob3RtYWlsLmNvbScsICdob3RtYWlsLmNvbS5hcicsICdob3RtYWlsLmNvbS5hdScsICdob3RtYWlsLmNvbS5icicsICdob3RtYWlsLmNvbS5ncicsICdob3RtYWlsLmNvbS5teCcsICdob3RtYWlsLmNvbS5wZScsICdob3RtYWlsLmNvbS50cicsICdob3RtYWlsLmNvbS52bicsICdob3RtYWlsLmN6JywgJ2hvdG1haWwuZGUnLCAnaG90bWFpbC5kaycsICdob3RtYWlsLmVzJywgJ2hvdG1haWwuZnInLCAnaG90bWFpbC5odScsICdob3RtYWlsLmlkJywgJ2hvdG1haWwuaWUnLCAnaG90bWFpbC5pbicsICdob3RtYWlsLml0JywgJ2hvdG1haWwuanAnLCAnaG90bWFpbC5rcicsICdob3RtYWlsLmx2JywgJ2hvdG1haWwubXknLCAnaG90bWFpbC5waCcsICdob3RtYWlsLnB0JywgJ2hvdG1haWwuc2EnLCAnaG90bWFpbC5zZycsICdob3RtYWlsLnNrJywgJ2xpdmUuYmUnLCAnbGl2ZS5jby51aycsICdsaXZlLmNvbScsICdsaXZlLmNvbS5hcicsICdsaXZlLmNvbS5teCcsICdsaXZlLmRlJywgJ2xpdmUuZXMnLCAnbGl2ZS5ldScsICdsaXZlLmZyJywgJ2xpdmUuaXQnLCAnbGl2ZS5ubCcsICdtc24uY29tJywgJ291dGxvb2suYXQnLCAnb3V0bG9vay5iZScsICdvdXRsb29rLmNsJywgJ291dGxvb2suY28uaWwnLCAnb3V0bG9vay5jby5ueicsICdvdXRsb29rLmNvLnRoJywgJ291dGxvb2suY29tJywgJ291dGxvb2suY29tLmFyJywgJ291dGxvb2suY29tLmF1JywgJ291dGxvb2suY29tLmJyJywgJ291dGxvb2suY29tLmdyJywgJ291dGxvb2suY29tLnBlJywgJ291dGxvb2suY29tLnRyJywgJ291dGxvb2suY29tLnZuJywgJ291dGxvb2suY3onLCAnb3V0bG9vay5kZScsICdvdXRsb29rLmRrJywgJ291dGxvb2suZXMnLCAnb3V0bG9vay5mcicsICdvdXRsb29rLmh1JywgJ291dGxvb2suaWQnLCAnb3V0bG9vay5pZScsICdvdXRsb29rLmluJywgJ291dGxvb2suaXQnLCAnb3V0bG9vay5qcCcsICdvdXRsb29rLmtyJywgJ291dGxvb2subHYnLCAnb3V0bG9vay5teScsICdvdXRsb29rLnBoJywgJ291dGxvb2sucHQnLCAnb3V0bG9vay5zYScsICdvdXRsb29rLnNnJywgJ291dGxvb2suc2snLCAncGFzc3BvcnQuY29tJ107IC8vIExpc3Qgb2YgZG9tYWlucyB1c2VkIGJ5IFlhaG9vIE1haWxcbi8vIFRoaXMgbGlzdCBpcyBsaWtlbHkgaW5jb21wbGV0ZVxuXG52YXIgeWFob29fZG9tYWlucyA9IFsncm9ja2V0bWFpbC5jb20nLCAneWFob28uY2EnLCAneWFob28uY28udWsnLCAneWFob28uY29tJywgJ3lhaG9vLmRlJywgJ3lhaG9vLmZyJywgJ3lhaG9vLmluJywgJ3lhaG9vLml0JywgJ3ltYWlsLmNvbSddOyAvLyBMaXN0IG9mIGRvbWFpbnMgdXNlZCBieSB5YW5kZXgucnVcblxudmFyIHlhbmRleF9kb21haW5zID0gWyd5YW5kZXgucnUnLCAneWFuZGV4LnVhJywgJ3lhbmRleC5reicsICd5YW5kZXguY29tJywgJ3lhbmRleC5ieScsICd5YS5ydSddOyAvLyByZXBsYWNlIHNpbmdsZSBkb3RzLCBidXQgbm90IG11bHRpcGxlIGNvbnNlY3V0aXZlIGRvdHNcblxuZnVuY3Rpb24gZG90c1JlcGxhY2VyKG1hdGNoKSB7XG4gIGlmIChtYXRjaC5sZW5ndGggPiAxKSB7XG4gICAgcmV0dXJuIG1hdGNoO1xuICB9XG5cbiAgcmV0dXJuICcnO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVFbWFpbChlbWFpbCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gKDAsIF9tZXJnZS5kZWZhdWx0KShvcHRpb25zLCBkZWZhdWx0X25vcm1hbGl6ZV9lbWFpbF9vcHRpb25zKTtcbiAgdmFyIHJhd19wYXJ0cyA9IGVtYWlsLnNwbGl0KCdAJyk7XG4gIHZhciBkb21haW4gPSByYXdfcGFydHMucG9wKCk7XG4gIHZhciB1c2VyID0gcmF3X3BhcnRzLmpvaW4oJ0AnKTtcbiAgdmFyIHBhcnRzID0gW3VzZXIsIGRvbWFpbl07IC8vIFRoZSBkb21haW4gaXMgYWx3YXlzIGxvd2VyY2FzZWQsIGFzIGl0J3MgY2FzZS1pbnNlbnNpdGl2ZSBwZXIgUkZDIDEwMzVcblxuICBwYXJ0c1sxXSA9IHBhcnRzWzFdLnRvTG93ZXJDYXNlKCk7XG5cbiAgaWYgKHBhcnRzWzFdID09PSAnZ21haWwuY29tJyB8fCBwYXJ0c1sxXSA9PT0gJ2dvb2dsZW1haWwuY29tJykge1xuICAgIC8vIEFkZHJlc3MgaXMgR01haWxcbiAgICBpZiAob3B0aW9ucy5nbWFpbF9yZW1vdmVfc3ViYWRkcmVzcykge1xuICAgICAgcGFydHNbMF0gPSBwYXJ0c1swXS5zcGxpdCgnKycpWzBdO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmdtYWlsX3JlbW92ZV9kb3RzKSB7XG4gICAgICAvLyB0aGlzIGRvZXMgbm90IHJlcGxhY2UgY29uc2VjdXRpdmUgZG90cyBsaWtlIGV4YW1wbGUuLmVtYWlsQGdtYWlsLmNvbVxuICAgICAgcGFydHNbMF0gPSBwYXJ0c1swXS5yZXBsYWNlKC9cXC4rL2csIGRvdHNSZXBsYWNlcik7XG4gICAgfVxuXG4gICAgaWYgKCFwYXJ0c1swXS5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5hbGxfbG93ZXJjYXNlIHx8IG9wdGlvbnMuZ21haWxfbG93ZXJjYXNlKSB7XG4gICAgICBwYXJ0c1swXSA9IHBhcnRzWzBdLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuXG4gICAgcGFydHNbMV0gPSBvcHRpb25zLmdtYWlsX2NvbnZlcnRfZ29vZ2xlbWFpbGRvdGNvbSA/ICdnbWFpbC5jb20nIDogcGFydHNbMV07XG4gIH0gZWxzZSBpZiAoaWNsb3VkX2RvbWFpbnMuaW5kZXhPZihwYXJ0c1sxXSkgPj0gMCkge1xuICAgIC8vIEFkZHJlc3MgaXMgaUNsb3VkXG4gICAgaWYgKG9wdGlvbnMuaWNsb3VkX3JlbW92ZV9zdWJhZGRyZXNzKSB7XG4gICAgICBwYXJ0c1swXSA9IHBhcnRzWzBdLnNwbGl0KCcrJylbMF07XG4gICAgfVxuXG4gICAgaWYgKCFwYXJ0c1swXS5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5hbGxfbG93ZXJjYXNlIHx8IG9wdGlvbnMuaWNsb3VkX2xvd2VyY2FzZSkge1xuICAgICAgcGFydHNbMF0gPSBwYXJ0c1swXS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChvdXRsb29rZG90Y29tX2RvbWFpbnMuaW5kZXhPZihwYXJ0c1sxXSkgPj0gMCkge1xuICAgIC8vIEFkZHJlc3MgaXMgT3V0bG9vay5jb21cbiAgICBpZiAob3B0aW9ucy5vdXRsb29rZG90Y29tX3JlbW92ZV9zdWJhZGRyZXNzKSB7XG4gICAgICBwYXJ0c1swXSA9IHBhcnRzWzBdLnNwbGl0KCcrJylbMF07XG4gICAgfVxuXG4gICAgaWYgKCFwYXJ0c1swXS5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5hbGxfbG93ZXJjYXNlIHx8IG9wdGlvbnMub3V0bG9va2RvdGNvbV9sb3dlcmNhc2UpIHtcbiAgICAgIHBhcnRzWzBdID0gcGFydHNbMF0udG9Mb3dlckNhc2UoKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoeWFob29fZG9tYWlucy5pbmRleE9mKHBhcnRzWzFdKSA+PSAwKSB7XG4gICAgLy8gQWRkcmVzcyBpcyBZYWhvb1xuICAgIGlmIChvcHRpb25zLnlhaG9vX3JlbW92ZV9zdWJhZGRyZXNzKSB7XG4gICAgICB2YXIgY29tcG9uZW50cyA9IHBhcnRzWzBdLnNwbGl0KCctJyk7XG4gICAgICBwYXJ0c1swXSA9IGNvbXBvbmVudHMubGVuZ3RoID4gMSA/IGNvbXBvbmVudHMuc2xpY2UoMCwgLTEpLmpvaW4oJy0nKSA6IGNvbXBvbmVudHNbMF07XG4gICAgfVxuXG4gICAgaWYgKCFwYXJ0c1swXS5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5hbGxfbG93ZXJjYXNlIHx8IG9wdGlvbnMueWFob29fbG93ZXJjYXNlKSB7XG4gICAgICBwYXJ0c1swXSA9IHBhcnRzWzBdLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuICB9IGVsc2UgaWYgKHlhbmRleF9kb21haW5zLmluZGV4T2YocGFydHNbMV0pID49IDApIHtcbiAgICBpZiAob3B0aW9ucy5hbGxfbG93ZXJjYXNlIHx8IG9wdGlvbnMueWFuZGV4X2xvd2VyY2FzZSkge1xuICAgICAgcGFydHNbMF0gPSBwYXJ0c1swXS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cblxuICAgIHBhcnRzWzFdID0gJ3lhbmRleC5ydSc7IC8vIGFsbCB5YW5kZXggZG9tYWlucyBhcmUgZXF1YWwsIDFzdCBwcmVmZXJyZWRcbiAgfSBlbHNlIGlmIChvcHRpb25zLmFsbF9sb3dlcmNhc2UpIHtcbiAgICAvLyBBbnkgb3RoZXIgYWRkcmVzc1xuICAgIHBhcnRzWzBdID0gcGFydHNbMF0udG9Mb3dlckNhc2UoKTtcbiAgfVxuXG4gIHJldHVybiBwYXJ0cy5qb2luKCdAJyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHJ0cmltO1xuXG52YXIgX2Fzc2VydFN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9hc3NlcnRTdHJpbmdcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBydHJpbShzdHIsIGNoYXJzKSB7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7XG5cbiAgaWYgKGNoYXJzKSB7XG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9HdWlkZS9SZWd1bGFyX0V4cHJlc3Npb25zI0VzY2FwaW5nXG4gICAgdmFyIHBhdHRlcm4gPSBuZXcgUmVnRXhwKFwiW1wiLmNvbmNhdChjaGFycy5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpLCBcIl0rJFwiKSwgJ2cnKTtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UocGF0dGVybiwgJycpO1xuICB9IC8vIFVzZSBhIGZhc3RlciBhbmQgbW9yZSBzYWZlIHRoYW4gcmVnZXggdHJpbSBtZXRob2QgaHR0cHM6Ly9ibG9nLnN0ZXZlbmxldml0aGFuLmNvbS9hcmNoaXZlcy9mYXN0ZXItdHJpbS1qYXZhc2NyaXB0XG5cblxuICB2YXIgc3RySW5kZXggPSBzdHIubGVuZ3RoIC0gMTtcblxuICB3aGlsZSAoL1xccy8udGVzdChzdHIuY2hhckF0KHN0ckluZGV4KSkpIHtcbiAgICBzdHJJbmRleCAtPSAxO1xuICB9XG5cbiAgcmV0dXJuIHN0ci5zbGljZSgwLCBzdHJJbmRleCArIDEpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBzdHJpcExvdztcblxudmFyIF9hc3NlcnRTdHJpbmcgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V0aWwvYXNzZXJ0U3RyaW5nXCIpKTtcblxudmFyIF9ibGFja2xpc3QgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2JsYWNrbGlzdFwiKSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIHN0cmlwTG93KHN0ciwga2VlcF9uZXdfbGluZXMpIHtcbiAgKDAsIF9hc3NlcnRTdHJpbmcuZGVmYXVsdCkoc3RyKTtcbiAgdmFyIGNoYXJzID0ga2VlcF9uZXdfbGluZXMgPyAnXFxcXHgwMC1cXFxceDA5XFxcXHgwQlxcXFx4MENcXFxceDBFLVxcXFx4MUZcXFxceDdGJyA6ICdcXFxceDAwLVxcXFx4MUZcXFxceDdGJztcbiAgcmV0dXJuICgwLCBfYmxhY2tsaXN0LmRlZmF1bHQpKHN0ciwgY2hhcnMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB0b0Jvb2xlYW47XG5cbnZhciBfYXNzZXJ0U3RyaW5nID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL2Fzc2VydFN0cmluZ1wiKSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIHRvQm9vbGVhbihzdHIsIHN0cmljdCkge1xuICAoMCwgX2Fzc2VydFN0cmluZy5kZWZhdWx0KShzdHIpO1xuXG4gIGlmIChzdHJpY3QpIHtcbiAgICByZXR1cm4gc3RyID09PSAnMScgfHwgL150cnVlJC9pLnRlc3Qoc3RyKTtcbiAgfVxuXG4gIHJldHVybiBzdHIgIT09ICcwJyAmJiAhL15mYWxzZSQvaS50ZXN0KHN0cikgJiYgc3RyICE9PSAnJztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzLmRlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gdG9EYXRlO1xuXG52YXIgX2Fzc2VydFN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9hc3NlcnRTdHJpbmdcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiB0b0RhdGUoZGF0ZSkge1xuICAoMCwgX2Fzc2VydFN0cmluZy5kZWZhdWx0KShkYXRlKTtcbiAgZGF0ZSA9IERhdGUucGFyc2UoZGF0ZSk7XG4gIHJldHVybiAhaXNOYU4oZGF0ZSkgPyBuZXcgRGF0ZShkYXRlKSA6IG51bGw7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHRvRmxvYXQ7XG5cbnZhciBfaXNGbG9hdCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vaXNGbG9hdFwiKSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIHRvRmxvYXQoc3RyKSB7XG4gIGlmICghKDAsIF9pc0Zsb2F0LmRlZmF1bHQpKHN0cikpIHJldHVybiBOYU47XG4gIHJldHVybiBwYXJzZUZsb2F0KHN0cik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHRvSW50O1xuXG52YXIgX2Fzc2VydFN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9hc3NlcnRTdHJpbmdcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiB0b0ludChzdHIsIHJhZGl4KSB7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7XG4gIHJldHVybiBwYXJzZUludChzdHIsIHJhZGl4IHx8IDEwKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzLmRlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gdHJpbTtcblxudmFyIF9ydHJpbSA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vcnRyaW1cIikpO1xuXG52YXIgX2x0cmltID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9sdHJpbVwiKSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIHRyaW0oc3RyLCBjaGFycykge1xuICByZXR1cm4gKDAsIF9ydHJpbS5kZWZhdWx0KSgoMCwgX2x0cmltLmRlZmF1bHQpKHN0ciwgY2hhcnMpLCBjaGFycyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHVuZXNjYXBlO1xuXG52YXIgX2Fzc2VydFN0cmluZyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vdXRpbC9hc3NlcnRTdHJpbmdcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiB1bmVzY2FwZShzdHIpIHtcbiAgKDAsIF9hc3NlcnRTdHJpbmcuZGVmYXVsdCkoc3RyKTtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC8mcXVvdDsvZywgJ1wiJykucmVwbGFjZSgvJiN4Mjc7L2csIFwiJ1wiKS5yZXBsYWNlKC8mbHQ7L2csICc8JykucmVwbGFjZSgvJmd0Oy9nLCAnPicpLnJlcGxhY2UoLyYjeDJGOy9nLCAnLycpLnJlcGxhY2UoLyYjeDVDOy9nLCAnXFxcXCcpLnJlcGxhY2UoLyYjOTY7L2csICdgJykucmVwbGFjZSgvJmFtcDsvZywgJyYnKTsgLy8gJmFtcDsgcmVwbGFjZW1lbnQgaGFzIHRvIGJlIHRoZSBsYXN0IG9uZSB0byBwcmV2ZW50XG4gIC8vIGJ1Z3Mgd2l0aCBpbnRlcm1lZGlhdGUgc3RyaW5ncyBjb250YWluaW5nIGVzY2FwZSBzZXF1ZW5jZXNcbiAgLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vdmFsaWRhdG9yanMvdmFsaWRhdG9yLmpzL2lzc3Vlcy8xODI3XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuaXNvNzA2NENoZWNrID0gaXNvNzA2NENoZWNrO1xuZXhwb3J0cy5sdWhuQ2hlY2sgPSBsdWhuQ2hlY2s7XG5leHBvcnRzLnJldmVyc2VNdWx0aXBseUFuZFN1bSA9IHJldmVyc2VNdWx0aXBseUFuZFN1bTtcbmV4cG9ydHMudmVyaG9lZmZDaGVjayA9IHZlcmhvZWZmQ2hlY2s7XG5cbi8qKlxuICogQWxnb3JpdGhtaWMgdmFsaWRhdGlvbiBmdW5jdGlvbnNcbiAqIE1heSBiZSB1c2VkIGFzIGlzIG9yIGltcGxlbWVudGVkIGluIHRoZSB3b3JrZmxvdyBvZiBvdGhlciB2YWxpZGF0b3JzLlxuICovXG5cbi8qXG4gKiBJU08gNzA2NCB2YWxpZGF0aW9uIGZ1bmN0aW9uXG4gKiBDYWxsZWQgd2l0aCBhIHN0cmluZyBvZiBudW1iZXJzIChpbmNsLiBjaGVjayBkaWdpdClcbiAqIHRvIHZhbGlkYXRlIGFjY29yZGluZyB0byBJU08gNzA2NCAoTU9EIDExLCAxMCkuXG4gKi9cbmZ1bmN0aW9uIGlzbzcwNjRDaGVjayhzdHIpIHtcbiAgdmFyIGNoZWNrdmFsdWUgPSAxMDtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGggLSAxOyBpKyspIHtcbiAgICBjaGVja3ZhbHVlID0gKHBhcnNlSW50KHN0cltpXSwgMTApICsgY2hlY2t2YWx1ZSkgJSAxMCA9PT0gMCA/IDEwICogMiAlIDExIDogKHBhcnNlSW50KHN0cltpXSwgMTApICsgY2hlY2t2YWx1ZSkgJSAxMCAqIDIgJSAxMTtcbiAgfVxuXG4gIGNoZWNrdmFsdWUgPSBjaGVja3ZhbHVlID09PSAxID8gMCA6IDExIC0gY2hlY2t2YWx1ZTtcbiAgcmV0dXJuIGNoZWNrdmFsdWUgPT09IHBhcnNlSW50KHN0clsxMF0sIDEwKTtcbn1cbi8qXG4gKiBMdWhuIChtb2QgMTApIHZhbGlkYXRpb24gZnVuY3Rpb25cbiAqIENhbGxlZCB3aXRoIGEgc3RyaW5nIG9mIG51bWJlcnMgKGluY2wuIGNoZWNrIGRpZ2l0KVxuICogdG8gdmFsaWRhdGUgYWNjb3JkaW5nIHRvIHRoZSBMdWhuIGFsZ29yaXRobS5cbiAqL1xuXG5cbmZ1bmN0aW9uIGx1aG5DaGVjayhzdHIpIHtcbiAgdmFyIGNoZWNrc3VtID0gMDtcbiAgdmFyIHNlY29uZCA9IGZhbHNlO1xuXG4gIGZvciAodmFyIGkgPSBzdHIubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBpZiAoc2Vjb25kKSB7XG4gICAgICB2YXIgcHJvZHVjdCA9IHBhcnNlSW50KHN0cltpXSwgMTApICogMjtcblxuICAgICAgaWYgKHByb2R1Y3QgPiA5KSB7XG4gICAgICAgIC8vIHN1bSBkaWdpdHMgb2YgcHJvZHVjdCBhbmQgYWRkIHRvIGNoZWNrc3VtXG4gICAgICAgIGNoZWNrc3VtICs9IHByb2R1Y3QudG9TdHJpbmcoKS5zcGxpdCgnJykubWFwKGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgcmV0dXJuIHBhcnNlSW50KGEsIDEwKTtcbiAgICAgICAgfSkucmVkdWNlKGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgcmV0dXJuIGEgKyBiO1xuICAgICAgICB9LCAwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNoZWNrc3VtICs9IHByb2R1Y3Q7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNoZWNrc3VtICs9IHBhcnNlSW50KHN0cltpXSwgMTApO1xuICAgIH1cblxuICAgIHNlY29uZCA9ICFzZWNvbmQ7XG4gIH1cblxuICByZXR1cm4gY2hlY2tzdW0gJSAxMCA9PT0gMDtcbn1cbi8qXG4gKiBSZXZlcnNlIFRJTiBtdWx0aXBsaWNhdGlvbiBhbmQgc3VtbWF0aW9uIGhlbHBlciBmdW5jdGlvblxuICogQ2FsbGVkIHdpdGggYW4gYXJyYXkgb2Ygc2luZ2xlLWRpZ2l0IGludGVnZXJzIGFuZCBhIGJhc2UgbXVsdGlwbGllclxuICogdG8gY2FsY3VsYXRlIHRoZSBzdW0gb2YgdGhlIGRpZ2l0cyBtdWx0aXBsaWVkIGluIHJldmVyc2UuXG4gKiBOb3JtYWxseSB1c2VkIGluIHZhcmlhdGlvbnMgb2YgTU9EIDExIGFsZ29yaXRobWljIGNoZWNrcy5cbiAqL1xuXG5cbmZ1bmN0aW9uIHJldmVyc2VNdWx0aXBseUFuZFN1bShkaWdpdHMsIGJhc2UpIHtcbiAgdmFyIHRvdGFsID0gMDtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGRpZ2l0cy5sZW5ndGg7IGkrKykge1xuICAgIHRvdGFsICs9IGRpZ2l0c1tpXSAqIChiYXNlIC0gaSk7XG4gIH1cblxuICByZXR1cm4gdG90YWw7XG59XG4vKlxuICogVmVyaG9lZmYgdmFsaWRhdGlvbiBoZWxwZXIgZnVuY3Rpb25cbiAqIENhbGxlZCB3aXRoIGEgc3RyaW5nIG9mIG51bWJlcnNcbiAqIHRvIHZhbGlkYXRlIGFjY29yZGluZyB0byB0aGUgVmVyaG9lZmYgYWxnb3JpdGhtLlxuICovXG5cblxuZnVuY3Rpb24gdmVyaG9lZmZDaGVjayhzdHIpIHtcbiAgdmFyIGRfdGFibGUgPSBbWzAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDldLCBbMSwgMiwgMywgNCwgMCwgNiwgNywgOCwgOSwgNV0sIFsyLCAzLCA0LCAwLCAxLCA3LCA4LCA5LCA1LCA2XSwgWzMsIDQsIDAsIDEsIDIsIDgsIDksIDUsIDYsIDddLCBbNCwgMCwgMSwgMiwgMywgOSwgNSwgNiwgNywgOF0sIFs1LCA5LCA4LCA3LCA2LCAwLCA0LCAzLCAyLCAxXSwgWzYsIDUsIDksIDgsIDcsIDEsIDAsIDQsIDMsIDJdLCBbNywgNiwgNSwgOSwgOCwgMiwgMSwgMCwgNCwgM10sIFs4LCA3LCA2LCA1LCA5LCAzLCAyLCAxLCAwLCA0XSwgWzksIDgsIDcsIDYsIDUsIDQsIDMsIDIsIDEsIDBdXTtcbiAgdmFyIHBfdGFibGUgPSBbWzAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDldLCBbMSwgNSwgNywgNiwgMiwgOCwgMywgMCwgOSwgNF0sIFs1LCA4LCAwLCAzLCA3LCA5LCA2LCAxLCA0LCAyXSwgWzgsIDksIDEsIDYsIDAsIDQsIDMsIDUsIDIsIDddLCBbOSwgNCwgNSwgMywgMSwgMiwgNiwgOCwgNywgMF0sIFs0LCAyLCA4LCA2LCA1LCA3LCAzLCA5LCAwLCAxXSwgWzIsIDcsIDksIDMsIDgsIDAsIDYsIDQsIDEsIDVdLCBbNywgMCwgNCwgNiwgOSwgMSwgMywgMiwgNSwgOF1dOyAvLyBDb3B5ICh0byBwcmV2ZW50IHJlcGxhY2VtZW50KSBhbmQgcmV2ZXJzZVxuXG4gIHZhciBzdHJfY29weSA9IHN0ci5zcGxpdCgnJykucmV2ZXJzZSgpLmpvaW4oJycpO1xuICB2YXIgY2hlY2tzdW0gPSAwO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyX2NvcHkubGVuZ3RoOyBpKyspIHtcbiAgICBjaGVja3N1bSA9IGRfdGFibGVbY2hlY2tzdW1dW3BfdGFibGVbaSAlIDhdW3BhcnNlSW50KHN0cl9jb3B5W2ldLCAxMCldXTtcbiAgfVxuXG4gIHJldHVybiBjaGVja3N1bSA9PT0gMDtcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGFzc2VydFN0cmluZztcblxuZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgXCJAYmFiZWwvaGVscGVycyAtIHR5cGVvZlwiOyBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIpIHsgX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9OyB9IGVsc2UgeyBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07IH0gcmV0dXJuIF90eXBlb2Yob2JqKTsgfVxuXG5mdW5jdGlvbiBhc3NlcnRTdHJpbmcoaW5wdXQpIHtcbiAgdmFyIGlzU3RyaW5nID0gdHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJyB8fCBpbnB1dCBpbnN0YW5jZW9mIFN0cmluZztcblxuICBpZiAoIWlzU3RyaW5nKSB7XG4gICAgdmFyIGludmFsaWRUeXBlID0gX3R5cGVvZihpbnB1dCk7XG5cbiAgICBpZiAoaW5wdXQgPT09IG51bGwpIGludmFsaWRUeXBlID0gJ251bGwnO2Vsc2UgaWYgKGludmFsaWRUeXBlID09PSAnb2JqZWN0JykgaW52YWxpZFR5cGUgPSBpbnB1dC5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJFeHBlY3RlZCBhIHN0cmluZyBidXQgcmVjZWl2ZWQgYSBcIi5jb25jYXQoaW52YWxpZFR5cGUpKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB2b2lkIDA7XG5cbnZhciBpbmNsdWRlcyA9IGZ1bmN0aW9uIGluY2x1ZGVzKGFyciwgdmFsKSB7XG4gIHJldHVybiBhcnIuc29tZShmdW5jdGlvbiAoYXJyVmFsKSB7XG4gICAgcmV0dXJuIHZhbCA9PT0gYXJyVmFsO1xuICB9KTtcbn07XG5cbnZhciBfZGVmYXVsdCA9IGluY2x1ZGVzO1xuZXhwb3J0cy5kZWZhdWx0ID0gX2RlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBtZXJnZTtcblxuZnVuY3Rpb24gbWVyZ2UoKSB7XG4gIHZhciBvYmogPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHt9O1xuICB2YXIgZGVmYXVsdHMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHVuZGVmaW5lZDtcblxuICBmb3IgKHZhciBrZXkgaW4gZGVmYXVsdHMpIHtcbiAgICBpZiAodHlwZW9mIG9ialtrZXldID09PSAndW5kZWZpbmVkJykge1xuICAgICAgb2JqW2tleV0gPSBkZWZhdWx0c1trZXldO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IG11bHRpbGluZVJlZ2V4cDtcblxuLyoqXG4gKiBCdWlsZCBSZWdFeHAgb2JqZWN0IGZyb20gYW4gYXJyYXlcbiAqIG9mIG11bHRpcGxlL211bHRpLWxpbmUgcmVnZXhwIHBhcnRzXG4gKlxuICogQHBhcmFtIHtzdHJpbmdbXX0gcGFydHNcbiAqIEBwYXJhbSB7c3RyaW5nfSBmbGFnc1xuICogQHJldHVybiB7b2JqZWN0fSAtIFJlZ0V4cCBvYmplY3RcbiAqL1xuZnVuY3Rpb24gbXVsdGlsaW5lUmVnZXhwKHBhcnRzLCBmbGFncykge1xuICB2YXIgcmVnZXhwQXNTdHJpbmdMaXRlcmFsID0gcGFydHMuam9pbignJyk7XG4gIHJldHVybiBuZXcgUmVnRXhwKHJlZ2V4cEFzU3RyaW5nTGl0ZXJhbCwgZmxhZ3MpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB0b1N0cmluZztcblxuZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgXCJAYmFiZWwvaGVscGVycyAtIHR5cGVvZlwiOyBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIpIHsgX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9OyB9IGVsc2UgeyBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07IH0gcmV0dXJuIF90eXBlb2Yob2JqKTsgfVxuXG5mdW5jdGlvbiB0b1N0cmluZyhpbnB1dCkge1xuICBpZiAoX3R5cGVvZihpbnB1dCkgPT09ICdvYmplY3QnICYmIGlucHV0ICE9PSBudWxsKSB7XG4gICAgaWYgKHR5cGVvZiBpbnB1dC50b1N0cmluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaW5wdXQgPSBpbnB1dC50b1N0cmluZygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpbnB1dCA9ICdbb2JqZWN0IE9iamVjdF0nO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpbnB1dCA9PT0gbnVsbCB8fCB0eXBlb2YgaW5wdXQgPT09ICd1bmRlZmluZWQnIHx8IGlzTmFOKGlucHV0KSAmJiAhaW5wdXQubGVuZ3RoKSB7XG4gICAgaW5wdXQgPSAnJztcbiAgfVxuXG4gIHJldHVybiBTdHJpbmcoaW5wdXQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB3aGl0ZWxpc3Q7XG5cbnZhciBfYXNzZXJ0U3RyaW5nID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91dGlsL2Fzc2VydFN0cmluZ1wiKSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIHdoaXRlbGlzdChzdHIsIGNoYXJzKSB7XG4gICgwLCBfYXNzZXJ0U3RyaW5nLmRlZmF1bHQpKHN0cik7XG4gIHJldHVybiBzdHIucmVwbGFjZShuZXcgUmVnRXhwKFwiW15cIi5jb25jYXQoY2hhcnMsIFwiXStcIiksICdnJyksICcnKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzLmRlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5kZWZhdWx0OyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL2NsaWVudC9pbmRleC50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==