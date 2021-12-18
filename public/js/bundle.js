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
        var loggedIn = Boolean((_c = target.dataset) === null || _c === void 0 ? void 0 : _c.loggedIn);
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
    function Modal(title, type) {
        if (type === void 0) { type = "CREATABLE"; }
        this.type = type;
        this.overlayMarkup = "<div class=\"overlay\"></div>";
        this.modalMarkup = "\n    <div class=\"modal-container\">\n        <div class=\"modal\">\n            <div class=\"modal-top\">\n                <h2 class=\"modal-brand\"></h2>\n                <div class=\"modal-close\"><i class=\"bi bi-x\"></i></div>\n            </div>\n            <div class=\"modal-content\"></div>\n        </div>\n    </div>\n  ";
        this.loadingSpinner = "\n    <div class=\"loading-spinner__dashboard\"><div class=\"loading-spinner\"></div></div>\n  ";
        this.activeTimer = 0;
        document.body.insertAdjacentHTML("afterbegin", this.overlayMarkup);
        document.body.insertAdjacentHTML("afterbegin", this.modalMarkup);
        this.overlay = document.querySelector(".overlay");
        this.modal = document.querySelector(".modal");
        this.modalTitle = document.querySelector(".modal-brand");
        this.modalClose = document.querySelector(".modal-close");
        this.modalContentContainer = document.querySelector(".modal-content");
        this.modalTitle.textContent = title;
        this.modalContentContainer.innerHTML = this.loadingSpinner;
        this.modalClose.addEventListener("click", this.closeHandler.bind(this));
        this.overlay.addEventListener("click", this.closeHandler.bind(this));
        document.addEventListener("keydown", this.keydownHandler.bind(this), {
            once: true,
        });
    }
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
    Modal.prototype.closeHandler = function () {
        this.modal.remove();
        this.overlay.remove();
    };
    Modal.prototype.createError = function (text) {
        var errorEl = document.createElement("p");
        errorEl.classList.add("form-error");
        errorEl.textContent = text;
        return errorEl;
    };
    Modal.prototype.removePrevError = function () {
        if (this.renderedError) {
            this.renderedError.remove();
        }
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
    function OrderModal(orderId) {
        var _this = _super.call(this, "New Order") || this;
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
            var target, res, err_2;
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
                        res = _a.sent();
                        console.log(res);
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
                        this.closeHandler();
                        location.href = "/orders";
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
    function ProductModal(productId) {
        var _this = _super.call(this, "New Product", productId ? "EDITABLE" : "CREATABLE") || this;
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
                        console.log(err_2);
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
    function RewardModal(rewardId) {
        var _this = _super.call(this, "New Reward", rewardId ? "EDITABLE" : "CREATABLE") || this;
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
var Modal_1 = __importDefault(__webpack_require__(/*! ./Modal */ "./client/modals/Modal.ts"));
var StoreModal = (function (_super) {
    __extends(StoreModal, _super);
    function StoreModal(storeId) {
        var _this = _super.call(this, "New Store", storeId ? "EDITABLE" : "CREATABLE") || this;
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
        new Order_1.default(orderCard.dataset.id);
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
        var _this = _super.call(this, "PRODUCT") || this;
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
            products.push("<div></div>");
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
        var _this = _super.call(this, "REWARD") || this;
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
            console.log(reward);
            var date = (0, formatDate_1.default)(reward.createdAt);
            var availability = reward.product.availability;
            return "\n        <a \n        href=\"/stores/".concat(reward.product.store.subUrl, "/").concat(reward.product._id, "?type=reward\"\n        target=\"_blank\" rel=\"noopener noreferrer\"\n        >\n          <div \n           data-id=\"").concat(reward._id, "\"\n           data-type=\"REWARD\"\n           class=\"dashboard-section__card product-card\"\n          >\n              <div class=\"product-card__img\">\n                  <img src=\"").concat(reward.product.photos[0], "\" />\n              </div>\n              <div class=\"product-card__info\">\n                  <div class=\"product-card__top\">\n                      <span class=\"product-card__title\">").concat(reward.product.name, "</span>\n                      <span \n                       class=\"product-card__").concat(availability
                .toLowerCase()
                .replace(/\s/g, "-"), "\"\n                      >\n                       ").concat(availability === "In Stock"
                ? "<i class=\"bi bi-check-lg\"></i>"
                : "<i class=\"bi bi-exclamation-circle\"></i>", "\n                       ").concat(availability, "\n                      </span>\n                  </div>\n                  <span class=\"product-card__store\">").concat(reward.product.store.name, "</span>\n                  \u00B7\n                  <span class=\"product-card__date\">").concat(date, "</span>\n                  <div class=\"product-card__bottom\">\n                      <span class=\"product-card__price\">\n                          ").concat(reward.requiredPoints, " Points\n                      </span>\n                      <button class=\"btn btn-primary card-btn\">Actions</button>\n                  </div>\n              </div>\n          </div>\n        </a>\n      ");
        });
        for (var i = 0; i <= rewards.length % 3; i++) {
            rewards.push("<div></div>");
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
    function Section(type) {
        this.type = type;
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
                new Store_1.default();
                break;
            case "PRODUCT":
                new Product_1.default();
                break;
            case "REWARD":
                new Reward_1.default();
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
                new Store_1.default(card === null || card === void 0 ? void 0 : card.dataset.id);
                break;
            case "PRODUCT":
                new Product_1.default(card === null || card === void 0 ? void 0 : card.dataset.id);
                break;
            case "REWARD":
                new Reward_1.default(card === null || card === void 0 ? void 0 : card.dataset.id);
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
        var _this = _super.call(this, "STORE") || this;
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
            stores.push("<div></div>");
        }
        return stores.join("");
    };
    return StoreSection;
}(Section_1.default));
exports["default"] = StoreSection;


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDM0MsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztTQUM1QjtRQUVELE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBQ0gsbUJBQUM7QUFBRCxDQUFDLENBakV5QyxpQkFBTyxHQWlFaEQ7Ozs7Ozs7O1VDdkVEO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2luZGV4LmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2FkYXB0ZXJzL3hoci5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9heGlvcy5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvQ2FuY2VsLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWxUb2tlbi5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvaXNDYW5jZWwuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9BeGlvcy5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0ludGVyY2VwdG9yTWFuYWdlci5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2J1aWxkRnVsbFBhdGguanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9jcmVhdGVFcnJvci5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2Rpc3BhdGNoUmVxdWVzdC5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2VuaGFuY2VFcnJvci5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL21lcmdlQ29uZmlnLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvc2V0dGxlLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvdHJhbnNmb3JtRGF0YS5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9kZWZhdWx0cy5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9lbnYvZGF0YS5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2JpbmQuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9idWlsZFVSTC5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2NvbWJpbmVVUkxzLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29va2llcy5qcyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc0F4aW9zRXJyb3IuanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc1VSTFNhbWVPcmlnaW4uanMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvcGFyc2VIZWFkZXJzLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvc3ByZWFkLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvdmFsaWRhdG9yLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL3V0aWxzLmpzIiwid2VicGFjazovL3dlYnNpdGUvLi9jbGllbnQvRGFzaGJvYXJkLnRzIiwid2VicGFjazovL3dlYnNpdGUvLi9jbGllbnQvTWFpbi50cyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vY2xpZW50L2hlbHBlcnMvZm9ybWF0RGF0ZS50cyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vY2xpZW50L2luZGV4LnRzIiwid2VicGFjazovL3dlYnNpdGUvLi9jbGllbnQvbW9kYWxzL01vZGFsLnRzIiwid2VicGFjazovL3dlYnNpdGUvLi9jbGllbnQvbW9kYWxzL09yZGVyLnRzIiwid2VicGFjazovL3dlYnNpdGUvLi9jbGllbnQvbW9kYWxzL09yZGVyUHJvZHVjdC50cyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vY2xpZW50L21vZGFscy9Qcm9kdWN0LnRzIiwid2VicGFjazovL3dlYnNpdGUvLi9jbGllbnQvbW9kYWxzL1Jld2FyZC50cyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vY2xpZW50L21vZGFscy9TdG9yZS50cyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vY2xpZW50L3NlY3Rpb25zL0hvbWUudHMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL2NsaWVudC9zZWN0aW9ucy9PcmRlci50cyIsIndlYnBhY2s6Ly93ZWJzaXRlLy4vY2xpZW50L3NlY3Rpb25zL1Byb2R1Y3QudHMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL2NsaWVudC9zZWN0aW9ucy9SZXdhcmQudHMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL2NsaWVudC9zZWN0aW9ucy9TZWN0aW9uLnRzIiwid2VicGFjazovL3dlYnNpdGUvLi9jbGllbnQvc2VjdGlvbnMvU3RvcmUudHMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly93ZWJzaXRlL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9heGlvcycpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHNldHRsZSA9IHJlcXVpcmUoJy4vLi4vY29yZS9zZXR0bGUnKTtcbnZhciBjb29raWVzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2Nvb2tpZXMnKTtcbnZhciBidWlsZFVSTCA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIGJ1aWxkRnVsbFBhdGggPSByZXF1aXJlKCcuLi9jb3JlL2J1aWxkRnVsbFBhdGgnKTtcbnZhciBwYXJzZUhlYWRlcnMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvcGFyc2VIZWFkZXJzJyk7XG52YXIgaXNVUkxTYW1lT3JpZ2luID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbicpO1xudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi4vY29yZS9jcmVhdGVFcnJvcicpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi4vZGVmYXVsdHMnKTtcbnZhciBDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvQ2FuY2VsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24geGhyQWRhcHRlcihjb25maWcpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIGRpc3BhdGNoWGhyUmVxdWVzdChyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgcmVxdWVzdERhdGEgPSBjb25maWcuZGF0YTtcbiAgICB2YXIgcmVxdWVzdEhlYWRlcnMgPSBjb25maWcuaGVhZGVycztcbiAgICB2YXIgcmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcbiAgICB2YXIgb25DYW5jZWxlZDtcbiAgICBmdW5jdGlvbiBkb25lKCkge1xuICAgICAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgICAgICBjb25maWcuY2FuY2VsVG9rZW4udW5zdWJzY3JpYmUob25DYW5jZWxlZCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChjb25maWcuc2lnbmFsKSB7XG4gICAgICAgIGNvbmZpZy5zaWduYWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBvbkNhbmNlbGVkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShyZXF1ZXN0RGF0YSkpIHtcbiAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1snQ29udGVudC1UeXBlJ107IC8vIExldCB0aGUgYnJvd3NlciBzZXQgaXRcbiAgICB9XG5cbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgLy8gSFRUUCBiYXNpYyBhdXRoZW50aWNhdGlvblxuICAgIGlmIChjb25maWcuYXV0aCkge1xuICAgICAgdmFyIHVzZXJuYW1lID0gY29uZmlnLmF1dGgudXNlcm5hbWUgfHwgJyc7XG4gICAgICB2YXIgcGFzc3dvcmQgPSBjb25maWcuYXV0aC5wYXNzd29yZCA/IHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChjb25maWcuYXV0aC5wYXNzd29yZCkpIDogJyc7XG4gICAgICByZXF1ZXN0SGVhZGVycy5BdXRob3JpemF0aW9uID0gJ0Jhc2ljICcgKyBidG9hKHVzZXJuYW1lICsgJzonICsgcGFzc3dvcmQpO1xuICAgIH1cblxuICAgIHZhciBmdWxsUGF0aCA9IGJ1aWxkRnVsbFBhdGgoY29uZmlnLmJhc2VVUkwsIGNvbmZpZy51cmwpO1xuICAgIHJlcXVlc3Qub3Blbihjb25maWcubWV0aG9kLnRvVXBwZXJDYXNlKCksIGJ1aWxkVVJMKGZ1bGxQYXRoLCBjb25maWcucGFyYW1zLCBjb25maWcucGFyYW1zU2VyaWFsaXplciksIHRydWUpO1xuXG4gICAgLy8gU2V0IHRoZSByZXF1ZXN0IHRpbWVvdXQgaW4gTVNcbiAgICByZXF1ZXN0LnRpbWVvdXQgPSBjb25maWcudGltZW91dDtcblxuICAgIGZ1bmN0aW9uIG9ubG9hZGVuZCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBQcmVwYXJlIHRoZSByZXNwb25zZVxuICAgICAgdmFyIHJlc3BvbnNlSGVhZGVycyA9ICdnZXRBbGxSZXNwb25zZUhlYWRlcnMnIGluIHJlcXVlc3QgPyBwYXJzZUhlYWRlcnMocmVxdWVzdC5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkgOiBudWxsO1xuICAgICAgdmFyIHJlc3BvbnNlRGF0YSA9ICFyZXNwb25zZVR5cGUgfHwgcmVzcG9uc2VUeXBlID09PSAndGV4dCcgfHwgIHJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nID9cbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVRleHQgOiByZXF1ZXN0LnJlc3BvbnNlO1xuICAgICAgdmFyIHJlc3BvbnNlID0ge1xuICAgICAgICBkYXRhOiByZXNwb25zZURhdGEsXG4gICAgICAgIHN0YXR1czogcmVxdWVzdC5zdGF0dXMsXG4gICAgICAgIHN0YXR1c1RleHQ6IHJlcXVlc3Quc3RhdHVzVGV4dCxcbiAgICAgICAgaGVhZGVyczogcmVzcG9uc2VIZWFkZXJzLFxuICAgICAgICBjb25maWc6IGNvbmZpZyxcbiAgICAgICAgcmVxdWVzdDogcmVxdWVzdFxuICAgICAgfTtcblxuICAgICAgc2V0dGxlKGZ1bmN0aW9uIF9yZXNvbHZlKHZhbHVlKSB7XG4gICAgICAgIHJlc29sdmUodmFsdWUpO1xuICAgICAgICBkb25lKCk7XG4gICAgICB9LCBmdW5jdGlvbiBfcmVqZWN0KGVycikge1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfSwgcmVzcG9uc2UpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoJ29ubG9hZGVuZCcgaW4gcmVxdWVzdCkge1xuICAgICAgLy8gVXNlIG9ubG9hZGVuZCBpZiBhdmFpbGFibGVcbiAgICAgIHJlcXVlc3Qub25sb2FkZW5kID0gb25sb2FkZW5kO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBMaXN0ZW4gZm9yIHJlYWR5IHN0YXRlIHRvIGVtdWxhdGUgb25sb2FkZW5kXG4gICAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uIGhhbmRsZUxvYWQoKSB7XG4gICAgICAgIGlmICghcmVxdWVzdCB8fCByZXF1ZXN0LnJlYWR5U3RhdGUgIT09IDQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgcmVxdWVzdCBlcnJvcmVkIG91dCBhbmQgd2UgZGlkbid0IGdldCBhIHJlc3BvbnNlLCB0aGlzIHdpbGwgYmVcbiAgICAgICAgLy8gaGFuZGxlZCBieSBvbmVycm9yIGluc3RlYWRcbiAgICAgICAgLy8gV2l0aCBvbmUgZXhjZXB0aW9uOiByZXF1ZXN0IHRoYXQgdXNpbmcgZmlsZTogcHJvdG9jb2wsIG1vc3QgYnJvd3NlcnNcbiAgICAgICAgLy8gd2lsbCByZXR1cm4gc3RhdHVzIGFzIDAgZXZlbiB0aG91Z2ggaXQncyBhIHN1Y2Nlc3NmdWwgcmVxdWVzdFxuICAgICAgICBpZiAocmVxdWVzdC5zdGF0dXMgPT09IDAgJiYgIShyZXF1ZXN0LnJlc3BvbnNlVVJMICYmIHJlcXVlc3QucmVzcG9uc2VVUkwuaW5kZXhPZignZmlsZTonKSA9PT0gMCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmVhZHlzdGF0ZSBoYW5kbGVyIGlzIGNhbGxpbmcgYmVmb3JlIG9uZXJyb3Igb3Igb250aW1lb3V0IGhhbmRsZXJzLFxuICAgICAgICAvLyBzbyB3ZSBzaG91bGQgY2FsbCBvbmxvYWRlbmQgb24gdGhlIG5leHQgJ3RpY2snXG4gICAgICAgIHNldFRpbWVvdXQob25sb2FkZW5kKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIGJyb3dzZXIgcmVxdWVzdCBjYW5jZWxsYXRpb24gKGFzIG9wcG9zZWQgdG8gYSBtYW51YWwgY2FuY2VsbGF0aW9uKVxuICAgIHJlcXVlc3Qub25hYm9ydCA9IGZ1bmN0aW9uIGhhbmRsZUFib3J0KCkge1xuICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCdSZXF1ZXN0IGFib3J0ZWQnLCBjb25maWcsICdFQ09OTkFCT1JURUQnLCByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgbG93IGxldmVsIG5ldHdvcmsgZXJyb3JzXG4gICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24gaGFuZGxlRXJyb3IoKSB7XG4gICAgICAvLyBSZWFsIGVycm9ycyBhcmUgaGlkZGVuIGZyb20gdXMgYnkgdGhlIGJyb3dzZXJcbiAgICAgIC8vIG9uZXJyb3Igc2hvdWxkIG9ubHkgZmlyZSBpZiBpdCdzIGEgbmV0d29yayBlcnJvclxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCdOZXR3b3JrIEVycm9yJywgY29uZmlnLCBudWxsLCByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgdGltZW91dFxuICAgIHJlcXVlc3Qub250aW1lb3V0ID0gZnVuY3Rpb24gaGFuZGxlVGltZW91dCgpIHtcbiAgICAgIHZhciB0aW1lb3V0RXJyb3JNZXNzYWdlID0gY29uZmlnLnRpbWVvdXQgPyAndGltZW91dCBvZiAnICsgY29uZmlnLnRpbWVvdXQgKyAnbXMgZXhjZWVkZWQnIDogJ3RpbWVvdXQgZXhjZWVkZWQnO1xuICAgICAgdmFyIHRyYW5zaXRpb25hbCA9IGNvbmZpZy50cmFuc2l0aW9uYWwgfHwgZGVmYXVsdHMudHJhbnNpdGlvbmFsO1xuICAgICAgaWYgKGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlKSB7XG4gICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSBjb25maWcudGltZW91dEVycm9yTWVzc2FnZTtcbiAgICAgIH1cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcihcbiAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZSxcbiAgICAgICAgY29uZmlnLFxuICAgICAgICB0cmFuc2l0aW9uYWwuY2xhcmlmeVRpbWVvdXRFcnJvciA/ICdFVElNRURPVVQnIDogJ0VDT05OQUJPUlRFRCcsXG4gICAgICAgIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgIC8vIFRoaXMgaXMgb25seSBkb25lIGlmIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50LlxuICAgIC8vIFNwZWNpZmljYWxseSBub3QgaWYgd2UncmUgaW4gYSB3ZWIgd29ya2VyLCBvciByZWFjdC1uYXRpdmUuXG4gICAgaWYgKHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkpIHtcbiAgICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgICAgdmFyIHhzcmZWYWx1ZSA9IChjb25maWcud2l0aENyZWRlbnRpYWxzIHx8IGlzVVJMU2FtZU9yaWdpbihmdWxsUGF0aCkpICYmIGNvbmZpZy54c3JmQ29va2llTmFtZSA/XG4gICAgICAgIGNvb2tpZXMucmVhZChjb25maWcueHNyZkNvb2tpZU5hbWUpIDpcbiAgICAgICAgdW5kZWZpbmVkO1xuXG4gICAgICBpZiAoeHNyZlZhbHVlKSB7XG4gICAgICAgIHJlcXVlc3RIZWFkZXJzW2NvbmZpZy54c3JmSGVhZGVyTmFtZV0gPSB4c3JmVmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWRkIGhlYWRlcnMgdG8gdGhlIHJlcXVlc3RcbiAgICBpZiAoJ3NldFJlcXVlc3RIZWFkZXInIGluIHJlcXVlc3QpIHtcbiAgICAgIHV0aWxzLmZvckVhY2gocmVxdWVzdEhlYWRlcnMsIGZ1bmN0aW9uIHNldFJlcXVlc3RIZWFkZXIodmFsLCBrZXkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiByZXF1ZXN0RGF0YSA9PT0gJ3VuZGVmaW5lZCcgJiYga2V5LnRvTG93ZXJDYXNlKCkgPT09ICdjb250ZW50LXR5cGUnKSB7XG4gICAgICAgICAgLy8gUmVtb3ZlIENvbnRlbnQtVHlwZSBpZiBkYXRhIGlzIHVuZGVmaW5lZFxuICAgICAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1trZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE90aGVyd2lzZSBhZGQgaGVhZGVyIHRvIHRoZSByZXF1ZXN0XG4gICAgICAgICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgdmFsKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQWRkIHdpdGhDcmVkZW50aWFscyB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnLndpdGhDcmVkZW50aWFscykpIHtcbiAgICAgIHJlcXVlc3Qud2l0aENyZWRlbnRpYWxzID0gISFjb25maWcud2l0aENyZWRlbnRpYWxzO1xuICAgIH1cblxuICAgIC8vIEFkZCByZXNwb25zZVR5cGUgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAocmVzcG9uc2VUeXBlICYmIHJlc3BvbnNlVHlwZSAhPT0gJ2pzb24nKSB7XG4gICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9IGNvbmZpZy5yZXNwb25zZVR5cGU7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHByb2dyZXNzIGlmIG5lZWRlZFxuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIC8vIE5vdCBhbGwgYnJvd3NlcnMgc3VwcG9ydCB1cGxvYWQgZXZlbnRzXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25VcGxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJyAmJiByZXF1ZXN0LnVwbG9hZCkge1xuICAgICAgcmVxdWVzdC51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25VcGxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbiB8fCBjb25maWcuc2lnbmFsKSB7XG4gICAgICAvLyBIYW5kbGUgY2FuY2VsbGF0aW9uXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuICAgICAgb25DYW5jZWxlZCA9IGZ1bmN0aW9uKGNhbmNlbCkge1xuICAgICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmVqZWN0KCFjYW5jZWwgfHwgKGNhbmNlbCAmJiBjYW5jZWwudHlwZSkgPyBuZXcgQ2FuY2VsKCdjYW5jZWxlZCcpIDogY2FuY2VsKTtcbiAgICAgICAgcmVxdWVzdC5hYm9ydCgpO1xuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH07XG5cbiAgICAgIGNvbmZpZy5jYW5jZWxUb2tlbiAmJiBjb25maWcuY2FuY2VsVG9rZW4uc3Vic2NyaWJlKG9uQ2FuY2VsZWQpO1xuICAgICAgaWYgKGNvbmZpZy5zaWduYWwpIHtcbiAgICAgICAgY29uZmlnLnNpZ25hbC5hYm9ydGVkID8gb25DYW5jZWxlZCgpIDogY29uZmlnLnNpZ25hbC5hZGRFdmVudExpc3RlbmVyKCdhYm9ydCcsIG9uQ2FuY2VsZWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghcmVxdWVzdERhdGEpIHtcbiAgICAgIHJlcXVlc3REYXRhID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBTZW5kIHRoZSByZXF1ZXN0XG4gICAgcmVxdWVzdC5zZW5kKHJlcXVlc3REYXRhKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG52YXIgQXhpb3MgPSByZXF1aXJlKCcuL2NvcmUvQXhpb3MnKTtcbnZhciBtZXJnZUNvbmZpZyA9IHJlcXVpcmUoJy4vY29yZS9tZXJnZUNvbmZpZycpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkZWZhdWx0Q29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKiBAcmV0dXJuIHtBeGlvc30gQSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqL1xuZnVuY3Rpb24gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdENvbmZpZykge1xuICB2YXIgY29udGV4dCA9IG5ldyBBeGlvcyhkZWZhdWx0Q29uZmlnKTtcbiAgdmFyIGluc3RhbmNlID0gYmluZChBeGlvcy5wcm90b3R5cGUucmVxdWVzdCwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBheGlvcy5wcm90b3R5cGUgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBBeGlvcy5wcm90b3R5cGUsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgY29udGV4dCB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIGNvbnRleHQpO1xuXG4gIC8vIEZhY3RvcnkgZm9yIGNyZWF0aW5nIG5ldyBpbnN0YW5jZXNcbiAgaW5zdGFuY2UuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKGluc3RhbmNlQ29uZmlnKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUluc3RhbmNlKG1lcmdlQ29uZmlnKGRlZmF1bHRDb25maWcsIGluc3RhbmNlQ29uZmlnKSk7XG4gIH07XG5cbiAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG4vLyBDcmVhdGUgdGhlIGRlZmF1bHQgaW5zdGFuY2UgdG8gYmUgZXhwb3J0ZWRcbnZhciBheGlvcyA9IGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRzKTtcblxuLy8gRXhwb3NlIEF4aW9zIGNsYXNzIHRvIGFsbG93IGNsYXNzIGluaGVyaXRhbmNlXG5heGlvcy5BeGlvcyA9IEF4aW9zO1xuXG4vLyBFeHBvc2UgQ2FuY2VsICYgQ2FuY2VsVG9rZW5cbmF4aW9zLkNhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbCcpO1xuYXhpb3MuQ2FuY2VsVG9rZW4gPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWxUb2tlbicpO1xuYXhpb3MuaXNDYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9pc0NhbmNlbCcpO1xuYXhpb3MuVkVSU0lPTiA9IHJlcXVpcmUoJy4vZW52L2RhdGEnKS52ZXJzaW9uO1xuXG4vLyBFeHBvc2UgYWxsL3NwcmVhZFxuYXhpb3MuYWxsID0gZnVuY3Rpb24gYWxsKHByb21pc2VzKSB7XG4gIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XG59O1xuYXhpb3Muc3ByZWFkID0gcmVxdWlyZSgnLi9oZWxwZXJzL3NwcmVhZCcpO1xuXG4vLyBFeHBvc2UgaXNBeGlvc0Vycm9yXG5heGlvcy5pc0F4aW9zRXJyb3IgPSByZXF1aXJlKCcuL2hlbHBlcnMvaXNBeGlvc0Vycm9yJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gYXhpb3M7XG5cbi8vIEFsbG93IHVzZSBvZiBkZWZhdWx0IGltcG9ydCBzeW50YXggaW4gVHlwZVNjcmlwdFxubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGF4aW9zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEEgYENhbmNlbGAgaXMgYW4gb2JqZWN0IHRoYXQgaXMgdGhyb3duIHdoZW4gYW4gb3BlcmF0aW9uIGlzIGNhbmNlbGVkLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtzdHJpbmc9fSBtZXNzYWdlIFRoZSBtZXNzYWdlLlxuICovXG5mdW5jdGlvbiBDYW5jZWwobWVzc2FnZSkge1xuICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xufVxuXG5DYW5jZWwucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gIHJldHVybiAnQ2FuY2VsJyArICh0aGlzLm1lc3NhZ2UgPyAnOiAnICsgdGhpcy5tZXNzYWdlIDogJycpO1xufTtcblxuQ2FuY2VsLnByb3RvdHlwZS5fX0NBTkNFTF9fID0gdHJ1ZTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWw7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDYW5jZWwgPSByZXF1aXJlKCcuL0NhbmNlbCcpO1xuXG4vKipcbiAqIEEgYENhbmNlbFRva2VuYCBpcyBhbiBvYmplY3QgdGhhdCBjYW4gYmUgdXNlZCB0byByZXF1ZXN0IGNhbmNlbGxhdGlvbiBvZiBhbiBvcGVyYXRpb24uXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBleGVjdXRvciBUaGUgZXhlY3V0b3IgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIENhbmNlbFRva2VuKGV4ZWN1dG9yKSB7XG4gIGlmICh0eXBlb2YgZXhlY3V0b3IgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdleGVjdXRvciBtdXN0IGJlIGEgZnVuY3Rpb24uJyk7XG4gIH1cblxuICB2YXIgcmVzb2x2ZVByb21pc2U7XG5cbiAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gcHJvbWlzZUV4ZWN1dG9yKHJlc29sdmUpIHtcbiAgICByZXNvbHZlUHJvbWlzZSA9IHJlc29sdmU7XG4gIH0pO1xuXG4gIHZhciB0b2tlbiA9IHRoaXM7XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcbiAgdGhpcy5wcm9taXNlLnRoZW4oZnVuY3Rpb24oY2FuY2VsKSB7XG4gICAgaWYgKCF0b2tlbi5fbGlzdGVuZXJzKSByZXR1cm47XG5cbiAgICB2YXIgaTtcbiAgICB2YXIgbCA9IHRva2VuLl9saXN0ZW5lcnMubGVuZ3RoO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgdG9rZW4uX2xpc3RlbmVyc1tpXShjYW5jZWwpO1xuICAgIH1cbiAgICB0b2tlbi5fbGlzdGVuZXJzID0gbnVsbDtcbiAgfSk7XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcbiAgdGhpcy5wcm9taXNlLnRoZW4gPSBmdW5jdGlvbihvbmZ1bGZpbGxlZCkge1xuICAgIHZhciBfcmVzb2x2ZTtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgICAgdG9rZW4uc3Vic2NyaWJlKHJlc29sdmUpO1xuICAgICAgX3Jlc29sdmUgPSByZXNvbHZlO1xuICAgIH0pLnRoZW4ob25mdWxmaWxsZWQpO1xuXG4gICAgcHJvbWlzZS5jYW5jZWwgPSBmdW5jdGlvbiByZWplY3QoKSB7XG4gICAgICB0b2tlbi51bnN1YnNjcmliZShfcmVzb2x2ZSk7XG4gICAgfTtcblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9O1xuXG4gIGV4ZWN1dG9yKGZ1bmN0aW9uIGNhbmNlbChtZXNzYWdlKSB7XG4gICAgaWYgKHRva2VuLnJlYXNvbikge1xuICAgICAgLy8gQ2FuY2VsbGF0aW9uIGhhcyBhbHJlYWR5IGJlZW4gcmVxdWVzdGVkXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdG9rZW4ucmVhc29uID0gbmV3IENhbmNlbChtZXNzYWdlKTtcbiAgICByZXNvbHZlUHJvbWlzZSh0b2tlbi5yZWFzb24pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBUaHJvd3MgYSBgQ2FuY2VsYCBpZiBjYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLlxuICovXG5DYW5jZWxUb2tlbi5wcm90b3R5cGUudGhyb3dJZlJlcXVlc3RlZCA9IGZ1bmN0aW9uIHRocm93SWZSZXF1ZXN0ZWQoKSB7XG4gIGlmICh0aGlzLnJlYXNvbikge1xuICAgIHRocm93IHRoaXMucmVhc29uO1xuICB9XG59O1xuXG4vKipcbiAqIFN1YnNjcmliZSB0byB0aGUgY2FuY2VsIHNpZ25hbFxuICovXG5cbkNhbmNlbFRva2VuLnByb3RvdHlwZS5zdWJzY3JpYmUgPSBmdW5jdGlvbiBzdWJzY3JpYmUobGlzdGVuZXIpIHtcbiAgaWYgKHRoaXMucmVhc29uKSB7XG4gICAgbGlzdGVuZXIodGhpcy5yZWFzb24pO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICh0aGlzLl9saXN0ZW5lcnMpIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fbGlzdGVuZXJzID0gW2xpc3RlbmVyXTtcbiAgfVxufTtcblxuLyoqXG4gKiBVbnN1YnNjcmliZSBmcm9tIHRoZSBjYW5jZWwgc2lnbmFsXG4gKi9cblxuQ2FuY2VsVG9rZW4ucHJvdG90eXBlLnVuc3Vic2NyaWJlID0gZnVuY3Rpb24gdW5zdWJzY3JpYmUobGlzdGVuZXIpIHtcbiAgaWYgKCF0aGlzLl9saXN0ZW5lcnMpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGluZGV4ID0gdGhpcy5fbGlzdGVuZXJzLmluZGV4T2YobGlzdGVuZXIpO1xuICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgdGhpcy5fbGlzdGVuZXJzLnNwbGljZShpbmRleCwgMSk7XG4gIH1cbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3QgdGhhdCBjb250YWlucyBhIG5ldyBgQ2FuY2VsVG9rZW5gIGFuZCBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLFxuICogY2FuY2VscyB0aGUgYENhbmNlbFRva2VuYC5cbiAqL1xuQ2FuY2VsVG9rZW4uc291cmNlID0gZnVuY3Rpb24gc291cmNlKCkge1xuICB2YXIgY2FuY2VsO1xuICB2YXIgdG9rZW4gPSBuZXcgQ2FuY2VsVG9rZW4oZnVuY3Rpb24gZXhlY3V0b3IoYykge1xuICAgIGNhbmNlbCA9IGM7XG4gIH0pO1xuICByZXR1cm4ge1xuICAgIHRva2VuOiB0b2tlbixcbiAgICBjYW5jZWw6IGNhbmNlbFxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWxUb2tlbjtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0NhbmNlbCh2YWx1ZSkge1xuICByZXR1cm4gISEodmFsdWUgJiYgdmFsdWUuX19DQU5DRUxfXyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgSW50ZXJjZXB0b3JNYW5hZ2VyID0gcmVxdWlyZSgnLi9JbnRlcmNlcHRvck1hbmFnZXInKTtcbnZhciBkaXNwYXRjaFJlcXVlc3QgPSByZXF1aXJlKCcuL2Rpc3BhdGNoUmVxdWVzdCcpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9tZXJnZUNvbmZpZycpO1xudmFyIHZhbGlkYXRvciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvdmFsaWRhdG9yJyk7XG5cbnZhciB2YWxpZGF0b3JzID0gdmFsaWRhdG9yLnZhbGlkYXRvcnM7XG4vKipcbiAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBpbnN0YW5jZUNvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBBeGlvcyhpbnN0YW5jZUNvbmZpZykge1xuICB0aGlzLmRlZmF1bHRzID0gaW5zdGFuY2VDb25maWc7XG4gIHRoaXMuaW50ZXJjZXB0b3JzID0ge1xuICAgIHJlcXVlc3Q6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKSxcbiAgICByZXNwb25zZTogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpXG4gIH07XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHNwZWNpZmljIGZvciB0aGlzIHJlcXVlc3QgKG1lcmdlZCB3aXRoIHRoaXMuZGVmYXVsdHMpXG4gKi9cbkF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24gcmVxdWVzdChjb25maWcpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIC8vIEFsbG93IGZvciBheGlvcygnZXhhbXBsZS91cmwnWywgY29uZmlnXSkgYSBsYSBmZXRjaCBBUElcbiAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgY29uZmlnID0gYXJndW1lbnRzWzFdIHx8IHt9O1xuICAgIGNvbmZpZy51cmwgPSBhcmd1bWVudHNbMF07XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICB9XG5cbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcblxuICAvLyBTZXQgY29uZmlnLm1ldGhvZFxuICBpZiAoY29uZmlnLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSBjb25maWcubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSBpZiAodGhpcy5kZWZhdWx0cy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gdGhpcy5kZWZhdWx0cy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcubWV0aG9kID0gJ2dldCc7XG4gIH1cblxuICB2YXIgdHJhbnNpdGlvbmFsID0gY29uZmlnLnRyYW5zaXRpb25hbDtcblxuICBpZiAodHJhbnNpdGlvbmFsICE9PSB1bmRlZmluZWQpIHtcbiAgICB2YWxpZGF0b3IuYXNzZXJ0T3B0aW9ucyh0cmFuc2l0aW9uYWwsIHtcbiAgICAgIHNpbGVudEpTT05QYXJzaW5nOiB2YWxpZGF0b3JzLnRyYW5zaXRpb25hbCh2YWxpZGF0b3JzLmJvb2xlYW4pLFxuICAgICAgZm9yY2VkSlNPTlBhcnNpbmc6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbiksXG4gICAgICBjbGFyaWZ5VGltZW91dEVycm9yOiB2YWxpZGF0b3JzLnRyYW5zaXRpb25hbCh2YWxpZGF0b3JzLmJvb2xlYW4pXG4gICAgfSwgZmFsc2UpO1xuICB9XG5cbiAgLy8gZmlsdGVyIG91dCBza2lwcGVkIGludGVyY2VwdG9yc1xuICB2YXIgcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4gPSBbXTtcbiAgdmFyIHN5bmNocm9ub3VzUmVxdWVzdEludGVyY2VwdG9ycyA9IHRydWU7XG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlcXVlc3QuZm9yRWFjaChmdW5jdGlvbiB1bnNoaWZ0UmVxdWVzdEludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIGlmICh0eXBlb2YgaW50ZXJjZXB0b3IucnVuV2hlbiA9PT0gJ2Z1bmN0aW9uJyAmJiBpbnRlcmNlcHRvci5ydW5XaGVuKGNvbmZpZykgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzID0gc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzICYmIGludGVyY2VwdG9yLnN5bmNocm9ub3VzO1xuXG4gICAgcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4udW5zaGlmdChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgdmFyIHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbiA9IFtdO1xuICB0aGlzLmludGVyY2VwdG9ycy5yZXNwb25zZS5mb3JFYWNoKGZ1bmN0aW9uIHB1c2hSZXNwb25zZUludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbi5wdXNoKGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB2YXIgcHJvbWlzZTtcblxuICBpZiAoIXN5bmNocm9ub3VzUmVxdWVzdEludGVyY2VwdG9ycykge1xuICAgIHZhciBjaGFpbiA9IFtkaXNwYXRjaFJlcXVlc3QsIHVuZGVmaW5lZF07XG5cbiAgICBBcnJheS5wcm90b3R5cGUudW5zaGlmdC5hcHBseShjaGFpbiwgcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4pO1xuICAgIGNoYWluID0gY2hhaW4uY29uY2F0KHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbik7XG5cbiAgICBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKGNvbmZpZyk7XG4gICAgd2hpbGUgKGNoYWluLmxlbmd0aCkge1xuICAgICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihjaGFpbi5zaGlmdCgpLCBjaGFpbi5zaGlmdCgpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG5cbiAgdmFyIG5ld0NvbmZpZyA9IGNvbmZpZztcbiAgd2hpbGUgKHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLmxlbmd0aCkge1xuICAgIHZhciBvbkZ1bGZpbGxlZCA9IHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCk7XG4gICAgdmFyIG9uUmVqZWN0ZWQgPSByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi5zaGlmdCgpO1xuICAgIHRyeSB7XG4gICAgICBuZXdDb25maWcgPSBvbkZ1bGZpbGxlZChuZXdDb25maWcpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBvblJlamVjdGVkKGVycm9yKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHRyeSB7XG4gICAgcHJvbWlzZSA9IGRpc3BhdGNoUmVxdWVzdChuZXdDb25maWcpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG4gIH1cblxuICB3aGlsZSAocmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLmxlbmd0aCkge1xuICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4ocmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCksIHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbi5zaGlmdCgpKTtcbiAgfVxuXG4gIHJldHVybiBwcm9taXNlO1xufTtcblxuQXhpb3MucHJvdG90eXBlLmdldFVyaSA9IGZ1bmN0aW9uIGdldFVyaShjb25maWcpIHtcbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcbiAgcmV0dXJuIGJ1aWxkVVJMKGNvbmZpZy51cmwsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKS5yZXBsYWNlKC9eXFw/LywgJycpO1xufTtcblxuLy8gUHJvdmlkZSBhbGlhc2VzIGZvciBzdXBwb3J0ZWQgcmVxdWVzdCBtZXRob2RzXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ29wdGlvbnMnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogKGNvbmZpZyB8fCB7fSkuZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiBkYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gSW50ZXJjZXB0b3JNYW5hZ2VyKCkge1xuICB0aGlzLmhhbmRsZXJzID0gW107XG59XG5cbi8qKlxuICogQWRkIGEgbmV3IGludGVyY2VwdG9yIHRvIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bGZpbGxlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGB0aGVuYCBmb3IgYSBgUHJvbWlzZWBcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHJlamVjdGAgZm9yIGEgYFByb21pc2VgXG4gKlxuICogQHJldHVybiB7TnVtYmVyfSBBbiBJRCB1c2VkIHRvIHJlbW92ZSBpbnRlcmNlcHRvciBsYXRlclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uIHVzZShmdWxmaWxsZWQsIHJlamVjdGVkLCBvcHRpb25zKSB7XG4gIHRoaXMuaGFuZGxlcnMucHVzaCh7XG4gICAgZnVsZmlsbGVkOiBmdWxmaWxsZWQsXG4gICAgcmVqZWN0ZWQ6IHJlamVjdGVkLFxuICAgIHN5bmNocm9ub3VzOiBvcHRpb25zID8gb3B0aW9ucy5zeW5jaHJvbm91cyA6IGZhbHNlLFxuICAgIHJ1bldoZW46IG9wdGlvbnMgPyBvcHRpb25zLnJ1bldoZW4gOiBudWxsXG4gIH0pO1xuICByZXR1cm4gdGhpcy5oYW5kbGVycy5sZW5ndGggLSAxO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYW4gaW50ZXJjZXB0b3IgZnJvbSB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaWQgVGhlIElEIHRoYXQgd2FzIHJldHVybmVkIGJ5IGB1c2VgXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZWplY3QgPSBmdW5jdGlvbiBlamVjdChpZCkge1xuICBpZiAodGhpcy5oYW5kbGVyc1tpZF0pIHtcbiAgICB0aGlzLmhhbmRsZXJzW2lkXSA9IG51bGw7XG4gIH1cbn07XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFsbCB0aGUgcmVnaXN0ZXJlZCBpbnRlcmNlcHRvcnNcbiAqXG4gKiBUaGlzIG1ldGhvZCBpcyBwYXJ0aWN1bGFybHkgdXNlZnVsIGZvciBza2lwcGluZyBvdmVyIGFueVxuICogaW50ZXJjZXB0b3JzIHRoYXQgbWF5IGhhdmUgYmVjb21lIGBudWxsYCBjYWxsaW5nIGBlamVjdGAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggaW50ZXJjZXB0b3JcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gZm9yRWFjaChmbikge1xuICB1dGlscy5mb3JFYWNoKHRoaXMuaGFuZGxlcnMsIGZ1bmN0aW9uIGZvckVhY2hIYW5kbGVyKGgpIHtcbiAgICBpZiAoaCAhPT0gbnVsbCkge1xuICAgICAgZm4oaCk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJjZXB0b3JNYW5hZ2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaXNBYnNvbHV0ZVVSTCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTCcpO1xudmFyIGNvbWJpbmVVUkxzID0gcmVxdWlyZSgnLi4vaGVscGVycy9jb21iaW5lVVJMcycpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgVVJMIGJ5IGNvbWJpbmluZyB0aGUgYmFzZVVSTCB3aXRoIHRoZSByZXF1ZXN0ZWRVUkwsXG4gKiBvbmx5IHdoZW4gdGhlIHJlcXVlc3RlZFVSTCBpcyBub3QgYWxyZWFkeSBhbiBhYnNvbHV0ZSBVUkwuXG4gKiBJZiB0aGUgcmVxdWVzdFVSTCBpcyBhYnNvbHV0ZSwgdGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSByZXF1ZXN0ZWRVUkwgdW50b3VjaGVkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlcXVlc3RlZFVSTCBBYnNvbHV0ZSBvciByZWxhdGl2ZSBVUkwgdG8gY29tYmluZVxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIGZ1bGwgcGF0aFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkRnVsbFBhdGgoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKSB7XG4gIGlmIChiYXNlVVJMICYmICFpc0Fic29sdXRlVVJMKHJlcXVlc3RlZFVSTCkpIHtcbiAgICByZXR1cm4gY29tYmluZVVSTHMoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKTtcbiAgfVxuICByZXR1cm4gcmVxdWVzdGVkVVJMO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vZW5oYW5jZUVycm9yJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBtZXNzYWdlLCBjb25maWcsIGVycm9yIGNvZGUsIHJlcXVlc3QgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBjcmVhdGVkIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZUVycm9yKG1lc3NhZ2UsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgdmFyIGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICByZXR1cm4gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciB0cmFuc2Zvcm1EYXRhID0gcmVxdWlyZSgnLi90cmFuc2Zvcm1EYXRhJyk7XG52YXIgaXNDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvaXNDYW5jZWwnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4uL2RlZmF1bHRzJyk7XG52YXIgQ2FuY2VsID0gcmVxdWlyZSgnLi4vY2FuY2VsL0NhbmNlbCcpO1xuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbmZ1bmN0aW9uIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKSB7XG4gIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICBjb25maWcuY2FuY2VsVG9rZW4udGhyb3dJZlJlcXVlc3RlZCgpO1xuICB9XG5cbiAgaWYgKGNvbmZpZy5zaWduYWwgJiYgY29uZmlnLnNpZ25hbC5hYm9ydGVkKSB7XG4gICAgdGhyb3cgbmV3IENhbmNlbCgnY2FuY2VsZWQnKTtcbiAgfVxufVxuXG4vKipcbiAqIERpc3BhdGNoIGEgcmVxdWVzdCB0byB0aGUgc2VydmVyIHVzaW5nIHRoZSBjb25maWd1cmVkIGFkYXB0ZXIuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHRoYXQgaXMgdG8gYmUgdXNlZCBmb3IgdGhlIHJlcXVlc3RcbiAqIEByZXR1cm5zIHtQcm9taXNlfSBUaGUgUHJvbWlzZSB0byBiZSBmdWxmaWxsZWRcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkaXNwYXRjaFJlcXVlc3QoY29uZmlnKSB7XG4gIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAvLyBFbnN1cmUgaGVhZGVycyBleGlzdFxuICBjb25maWcuaGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzIHx8IHt9O1xuXG4gIC8vIFRyYW5zZm9ybSByZXF1ZXN0IGRhdGFcbiAgY29uZmlnLmRhdGEgPSB0cmFuc2Zvcm1EYXRhLmNhbGwoXG4gICAgY29uZmlnLFxuICAgIGNvbmZpZy5kYXRhLFxuICAgIGNvbmZpZy5oZWFkZXJzLFxuICAgIGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0XG4gICk7XG5cbiAgLy8gRmxhdHRlbiBoZWFkZXJzXG4gIGNvbmZpZy5oZWFkZXJzID0gdXRpbHMubWVyZ2UoXG4gICAgY29uZmlnLmhlYWRlcnMuY29tbW9uIHx8IHt9LFxuICAgIGNvbmZpZy5oZWFkZXJzW2NvbmZpZy5tZXRob2RdIHx8IHt9LFxuICAgIGNvbmZpZy5oZWFkZXJzXG4gICk7XG5cbiAgdXRpbHMuZm9yRWFjaChcbiAgICBbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCcsICdwb3N0JywgJ3B1dCcsICdwYXRjaCcsICdjb21tb24nXSxcbiAgICBmdW5jdGlvbiBjbGVhbkhlYWRlckNvbmZpZyhtZXRob2QpIHtcbiAgICAgIGRlbGV0ZSBjb25maWcuaGVhZGVyc1ttZXRob2RdO1xuICAgIH1cbiAgKTtcblxuICB2YXIgYWRhcHRlciA9IGNvbmZpZy5hZGFwdGVyIHx8IGRlZmF1bHRzLmFkYXB0ZXI7XG5cbiAgcmV0dXJuIGFkYXB0ZXIoY29uZmlnKS50aGVuKGZ1bmN0aW9uIG9uQWRhcHRlclJlc29sdXRpb24ocmVzcG9uc2UpIHtcbiAgICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgIHJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhLmNhbGwoXG4gICAgICBjb25maWcsXG4gICAgICByZXNwb25zZS5kYXRhLFxuICAgICAgcmVzcG9uc2UuaGVhZGVycyxcbiAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICk7XG5cbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH0sIGZ1bmN0aW9uIG9uQWRhcHRlclJlamVjdGlvbihyZWFzb24pIHtcbiAgICBpZiAoIWlzQ2FuY2VsKHJlYXNvbikpIHtcbiAgICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICAgIGlmIChyZWFzb24gJiYgcmVhc29uLnJlc3BvbnNlKSB7XG4gICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YS5jYWxsKFxuICAgICAgICAgIGNvbmZpZyxcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSxcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuaGVhZGVycyxcbiAgICAgICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QocmVhc29uKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFVwZGF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgY29uZmlnLCBlcnJvciBjb2RlLCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyb3IgVGhlIGVycm9yIHRvIHVwZGF0ZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3JlcXVlc3RdIFRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XG4gIGVycm9yLmNvbmZpZyA9IGNvbmZpZztcbiAgaWYgKGNvZGUpIHtcbiAgICBlcnJvci5jb2RlID0gY29kZTtcbiAgfVxuXG4gIGVycm9yLnJlcXVlc3QgPSByZXF1ZXN0O1xuICBlcnJvci5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICBlcnJvci5pc0F4aW9zRXJyb3IgPSB0cnVlO1xuXG4gIGVycm9yLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gU3RhbmRhcmRcbiAgICAgIG1lc3NhZ2U6IHRoaXMubWVzc2FnZSxcbiAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgIC8vIE1pY3Jvc29mdFxuICAgICAgZGVzY3JpcHRpb246IHRoaXMuZGVzY3JpcHRpb24sXG4gICAgICBudW1iZXI6IHRoaXMubnVtYmVyLFxuICAgICAgLy8gTW96aWxsYVxuICAgICAgZmlsZU5hbWU6IHRoaXMuZmlsZU5hbWUsXG4gICAgICBsaW5lTnVtYmVyOiB0aGlzLmxpbmVOdW1iZXIsXG4gICAgICBjb2x1bW5OdW1iZXI6IHRoaXMuY29sdW1uTnVtYmVyLFxuICAgICAgc3RhY2s6IHRoaXMuc3RhY2ssXG4gICAgICAvLyBBeGlvc1xuICAgICAgY29uZmlnOiB0aGlzLmNvbmZpZyxcbiAgICAgIGNvZGU6IHRoaXMuY29kZSxcbiAgICAgIHN0YXR1czogdGhpcy5yZXNwb25zZSAmJiB0aGlzLnJlc3BvbnNlLnN0YXR1cyA/IHRoaXMucmVzcG9uc2Uuc3RhdHVzIDogbnVsbFxuICAgIH07XG4gIH07XG4gIHJldHVybiBlcnJvcjtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbi8qKlxuICogQ29uZmlnLXNwZWNpZmljIG1lcmdlLWZ1bmN0aW9uIHdoaWNoIGNyZWF0ZXMgYSBuZXcgY29uZmlnLW9iamVjdFxuICogYnkgbWVyZ2luZyB0d28gY29uZmlndXJhdGlvbiBvYmplY3RzIHRvZ2V0aGVyLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcxXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnMlxuICogQHJldHVybnMge09iamVjdH0gTmV3IG9iamVjdCByZXN1bHRpbmcgZnJvbSBtZXJnaW5nIGNvbmZpZzIgdG8gY29uZmlnMVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1lcmdlQ29uZmlnKGNvbmZpZzEsIGNvbmZpZzIpIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gIGNvbmZpZzIgPSBjb25maWcyIHx8IHt9O1xuICB2YXIgY29uZmlnID0ge307XG5cbiAgZnVuY3Rpb24gZ2V0TWVyZ2VkVmFsdWUodGFyZ2V0LCBzb3VyY2UpIHtcbiAgICBpZiAodXRpbHMuaXNQbGFpbk9iamVjdCh0YXJnZXQpICYmIHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHRhcmdldCwgc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHt9LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNBcnJheShzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gc291cmNlLnNsaWNlKCk7XG4gICAgfVxuICAgIHJldHVybiBzb3VyY2U7XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29uc2lzdGVudC1yZXR1cm5cbiAgZnVuY3Rpb24gbWVyZ2VEZWVwUHJvcGVydGllcyhwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKGNvbmZpZzFbcHJvcF0sIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29uc2lzdGVudC1yZXR1cm5cbiAgZnVuY3Rpb24gdmFsdWVGcm9tQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfVxuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNvbnNpc3RlbnQtcmV0dXJuXG4gIGZ1bmN0aW9uIGRlZmF1bHRUb0NvbmZpZzIocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29uc2lzdGVudC1yZXR1cm5cbiAgZnVuY3Rpb24gbWVyZ2VEaXJlY3RLZXlzKHByb3ApIHtcbiAgICBpZiAocHJvcCBpbiBjb25maWcyKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmIChwcm9wIGluIGNvbmZpZzEpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIHZhciBtZXJnZU1hcCA9IHtcbiAgICAndXJsJzogdmFsdWVGcm9tQ29uZmlnMixcbiAgICAnbWV0aG9kJzogdmFsdWVGcm9tQ29uZmlnMixcbiAgICAnZGF0YSc6IHZhbHVlRnJvbUNvbmZpZzIsXG4gICAgJ2Jhc2VVUkwnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd0cmFuc2Zvcm1SZXF1ZXN0JzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAndHJhbnNmb3JtUmVzcG9uc2UnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdwYXJhbXNTZXJpYWxpemVyJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAndGltZW91dCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3RpbWVvdXRNZXNzYWdlJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnd2l0aENyZWRlbnRpYWxzJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnYWRhcHRlcic6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3Jlc3BvbnNlVHlwZSc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3hzcmZDb29raWVOYW1lJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAneHNyZkhlYWRlck5hbWUnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdvblVwbG9hZFByb2dyZXNzJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnb25Eb3dubG9hZFByb2dyZXNzJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnZGVjb21wcmVzcyc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ21heENvbnRlbnRMZW5ndGgnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdtYXhCb2R5TGVuZ3RoJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAndHJhbnNwb3J0JzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnaHR0cEFnZW50JzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnaHR0cHNBZ2VudCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ2NhbmNlbFRva2VuJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnc29ja2V0UGF0aCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3Jlc3BvbnNlRW5jb2RpbmcnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd2YWxpZGF0ZVN0YXR1cyc6IG1lcmdlRGlyZWN0S2V5c1xuICB9O1xuXG4gIHV0aWxzLmZvckVhY2goT2JqZWN0LmtleXMoY29uZmlnMSkuY29uY2F0KE9iamVjdC5rZXlzKGNvbmZpZzIpKSwgZnVuY3Rpb24gY29tcHV0ZUNvbmZpZ1ZhbHVlKHByb3ApIHtcbiAgICB2YXIgbWVyZ2UgPSBtZXJnZU1hcFtwcm9wXSB8fCBtZXJnZURlZXBQcm9wZXJ0aWVzO1xuICAgIHZhciBjb25maWdWYWx1ZSA9IG1lcmdlKHByb3ApO1xuICAgICh1dGlscy5pc1VuZGVmaW5lZChjb25maWdWYWx1ZSkgJiYgbWVyZ2UgIT09IG1lcmdlRGlyZWN0S2V5cykgfHwgKGNvbmZpZ1twcm9wXSA9IGNvbmZpZ1ZhbHVlKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGNvbmZpZztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4vY3JlYXRlRXJyb3InKTtcblxuLyoqXG4gKiBSZXNvbHZlIG9yIHJlamVjdCBhIFByb21pc2UgYmFzZWQgb24gcmVzcG9uc2Ugc3RhdHVzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlc29sdmUgQSBmdW5jdGlvbiB0aGF0IHJlc29sdmVzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0IEEgZnVuY3Rpb24gdGhhdCByZWplY3RzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIFRoZSByZXNwb25zZS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSkge1xuICB2YXIgdmFsaWRhdGVTdGF0dXMgPSByZXNwb25zZS5jb25maWcudmFsaWRhdGVTdGF0dXM7XG4gIGlmICghcmVzcG9uc2Uuc3RhdHVzIHx8ICF2YWxpZGF0ZVN0YXR1cyB8fCB2YWxpZGF0ZVN0YXR1cyhyZXNwb25zZS5zdGF0dXMpKSB7XG4gICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gIH0gZWxzZSB7XG4gICAgcmVqZWN0KGNyZWF0ZUVycm9yKFxuICAgICAgJ1JlcXVlc3QgZmFpbGVkIHdpdGggc3RhdHVzIGNvZGUgJyArIHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgIHJlc3BvbnNlLmNvbmZpZyxcbiAgICAgIG51bGwsXG4gICAgICByZXNwb25zZS5yZXF1ZXN0LFxuICAgICAgcmVzcG9uc2VcbiAgICApKTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi8uLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIFRyYW5zZm9ybSB0aGUgZGF0YSBmb3IgYSByZXF1ZXN0IG9yIGEgcmVzcG9uc2VcbiAqXG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IGRhdGEgVGhlIGRhdGEgdG8gYmUgdHJhbnNmb3JtZWRcbiAqIEBwYXJhbSB7QXJyYXl9IGhlYWRlcnMgVGhlIGhlYWRlcnMgZm9yIHRoZSByZXF1ZXN0IG9yIHJlc3BvbnNlXG4gKiBAcGFyYW0ge0FycmF5fEZ1bmN0aW9ufSBmbnMgQSBzaW5nbGUgZnVuY3Rpb24gb3IgQXJyYXkgb2YgZnVuY3Rpb25zXG4gKiBAcmV0dXJucyB7Kn0gVGhlIHJlc3VsdGluZyB0cmFuc2Zvcm1lZCBkYXRhXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdHJhbnNmb3JtRGF0YShkYXRhLCBoZWFkZXJzLCBmbnMpIHtcbiAgdmFyIGNvbnRleHQgPSB0aGlzIHx8IGRlZmF1bHRzO1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgdXRpbHMuZm9yRWFjaChmbnMsIGZ1bmN0aW9uIHRyYW5zZm9ybShmbikge1xuICAgIGRhdGEgPSBmbi5jYWxsKGNvbnRleHQsIGRhdGEsIGhlYWRlcnMpO1xuICB9KTtcblxuICByZXR1cm4gZGF0YTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBub3JtYWxpemVIZWFkZXJOYW1lID0gcmVxdWlyZSgnLi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUnKTtcbnZhciBlbmhhbmNlRXJyb3IgPSByZXF1aXJlKCcuL2NvcmUvZW5oYW5jZUVycm9yJyk7XG5cbnZhciBERUZBVUxUX0NPTlRFTlRfVFlQRSA9IHtcbiAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG5mdW5jdGlvbiBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgdmFsdWUpIHtcbiAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzKSAmJiB1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzWydDb250ZW50LVR5cGUnXSkpIHtcbiAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IHZhbHVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldERlZmF1bHRBZGFwdGVyKCkge1xuICB2YXIgYWRhcHRlcjtcbiAgaWYgKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBGb3IgYnJvd3NlcnMgdXNlIFhIUiBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMveGhyJyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nKSB7XG4gICAgLy8gRm9yIG5vZGUgdXNlIEhUVFAgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL2h0dHAnKTtcbiAgfVxuICByZXR1cm4gYWRhcHRlcjtcbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5U2FmZWx5KHJhd1ZhbHVlLCBwYXJzZXIsIGVuY29kZXIpIHtcbiAgaWYgKHV0aWxzLmlzU3RyaW5nKHJhd1ZhbHVlKSkge1xuICAgIHRyeSB7XG4gICAgICAocGFyc2VyIHx8IEpTT04ucGFyc2UpKHJhd1ZhbHVlKTtcbiAgICAgIHJldHVybiB1dGlscy50cmltKHJhd1ZhbHVlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZS5uYW1lICE9PSAnU3ludGF4RXJyb3InKSB7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIChlbmNvZGVyIHx8IEpTT04uc3RyaW5naWZ5KShyYXdWYWx1ZSk7XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcblxuICB0cmFuc2l0aW9uYWw6IHtcbiAgICBzaWxlbnRKU09OUGFyc2luZzogdHJ1ZSxcbiAgICBmb3JjZWRKU09OUGFyc2luZzogdHJ1ZSxcbiAgICBjbGFyaWZ5VGltZW91dEVycm9yOiBmYWxzZVxuICB9LFxuXG4gIGFkYXB0ZXI6IGdldERlZmF1bHRBZGFwdGVyKCksXG5cbiAgdHJhbnNmb3JtUmVxdWVzdDogW2Z1bmN0aW9uIHRyYW5zZm9ybVJlcXVlc3QoZGF0YSwgaGVhZGVycykge1xuICAgIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgJ0FjY2VwdCcpO1xuICAgIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgJ0NvbnRlbnQtVHlwZScpO1xuXG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQXJyYXlCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQnVmZmVyKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc1N0cmVhbShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNGaWxlKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0Jsb2IoZGF0YSlcbiAgICApIHtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNBcnJheUJ1ZmZlclZpZXcoZGF0YSkpIHtcbiAgICAgIHJldHVybiBkYXRhLmJ1ZmZlcjtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKGRhdGEpKSB7XG4gICAgICBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PXV0Zi04Jyk7XG4gICAgICByZXR1cm4gZGF0YS50b1N0cmluZygpO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNPYmplY3QoZGF0YSkgfHwgKGhlYWRlcnMgJiYgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPT09ICdhcHBsaWNhdGlvbi9qc29uJykpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgcmV0dXJuIHN0cmluZ2lmeVNhZmVseShkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIHRyYW5zZm9ybVJlc3BvbnNlOiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVzcG9uc2UoZGF0YSkge1xuICAgIHZhciB0cmFuc2l0aW9uYWwgPSB0aGlzLnRyYW5zaXRpb25hbCB8fCBkZWZhdWx0cy50cmFuc2l0aW9uYWw7XG4gICAgdmFyIHNpbGVudEpTT05QYXJzaW5nID0gdHJhbnNpdGlvbmFsICYmIHRyYW5zaXRpb25hbC5zaWxlbnRKU09OUGFyc2luZztcbiAgICB2YXIgZm9yY2VkSlNPTlBhcnNpbmcgPSB0cmFuc2l0aW9uYWwgJiYgdHJhbnNpdGlvbmFsLmZvcmNlZEpTT05QYXJzaW5nO1xuICAgIHZhciBzdHJpY3RKU09OUGFyc2luZyA9ICFzaWxlbnRKU09OUGFyc2luZyAmJiB0aGlzLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nO1xuXG4gICAgaWYgKHN0cmljdEpTT05QYXJzaW5nIHx8IChmb3JjZWRKU09OUGFyc2luZyAmJiB1dGlscy5pc1N0cmluZyhkYXRhKSAmJiBkYXRhLmxlbmd0aCkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoc3RyaWN0SlNPTlBhcnNpbmcpIHtcbiAgICAgICAgICBpZiAoZS5uYW1lID09PSAnU3ludGF4RXJyb3InKSB7XG4gICAgICAgICAgICB0aHJvdyBlbmhhbmNlRXJyb3IoZSwgdGhpcywgJ0VfSlNPTl9QQVJTRScpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIC8qKlxuICAgKiBBIHRpbWVvdXQgaW4gbWlsbGlzZWNvbmRzIHRvIGFib3J0IGEgcmVxdWVzdC4gSWYgc2V0IHRvIDAgKGRlZmF1bHQpIGFcbiAgICogdGltZW91dCBpcyBub3QgY3JlYXRlZC5cbiAgICovXG4gIHRpbWVvdXQ6IDAsXG5cbiAgeHNyZkNvb2tpZU5hbWU6ICdYU1JGLVRPS0VOJyxcbiAgeHNyZkhlYWRlck5hbWU6ICdYLVhTUkYtVE9LRU4nLFxuXG4gIG1heENvbnRlbnRMZW5ndGg6IC0xLFxuICBtYXhCb2R5TGVuZ3RoOiAtMSxcblxuICB2YWxpZGF0ZVN0YXR1czogZnVuY3Rpb24gdmFsaWRhdGVTdGF0dXMoc3RhdHVzKSB7XG4gICAgcmV0dXJuIHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwO1xuICB9LFxuXG4gIGhlYWRlcnM6IHtcbiAgICBjb21tb246IHtcbiAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbiwgdGV4dC9wbGFpbiwgKi8qJ1xuICAgIH1cbiAgfVxufTtcblxudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB7fTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB1dGlscy5tZXJnZShERUZBVUxUX0NPTlRFTlRfVFlQRSk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBkZWZhdWx0cztcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBcInZlcnNpb25cIjogXCIwLjI0LjBcIlxufTsiLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYmluZChmbiwgdGhpc0FyZykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcCgpIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gZW5jb2RlKHZhbCkge1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHZhbCkuXG4gICAgcmVwbGFjZSgvJTNBL2dpLCAnOicpLlxuICAgIHJlcGxhY2UoLyUyNC9nLCAnJCcpLlxuICAgIHJlcGxhY2UoLyUyQy9naSwgJywnKS5cbiAgICByZXBsYWNlKC8lMjAvZywgJysnKS5cbiAgICByZXBsYWNlKC8lNUIvZ2ksICdbJykuXG4gICAgcmVwbGFjZSgvJTVEL2dpLCAnXScpO1xufVxuXG4vKipcbiAqIEJ1aWxkIGEgVVJMIGJ5IGFwcGVuZGluZyBwYXJhbXMgdG8gdGhlIGVuZFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIGJhc2Ugb2YgdGhlIHVybCAoZS5nLiwgaHR0cDovL3d3dy5nb29nbGUuY29tKVxuICogQHBhcmFtIHtvYmplY3R9IFtwYXJhbXNdIFRoZSBwYXJhbXMgdG8gYmUgYXBwZW5kZWRcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBmb3JtYXR0ZWQgdXJsXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRVUkwodXJsLCBwYXJhbXMsIHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIGlmICghcGFyYW1zKSB7XG4gICAgcmV0dXJuIHVybDtcbiAgfVxuXG4gIHZhciBzZXJpYWxpemVkUGFyYW1zO1xuICBpZiAocGFyYW1zU2VyaWFsaXplcikge1xuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJhbXNTZXJpYWxpemVyKHBhcmFtcyk7XG4gIH0gZWxzZSBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMocGFyYW1zKSkge1xuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJhbXMudG9TdHJpbmcoKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgcGFydHMgPSBbXTtcblxuICAgIHV0aWxzLmZvckVhY2gocGFyYW1zLCBmdW5jdGlvbiBzZXJpYWxpemUodmFsLCBrZXkpIHtcbiAgICAgIGlmICh2YWwgPT09IG51bGwgfHwgdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodXRpbHMuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgIGtleSA9IGtleSArICdbXSc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWwgPSBbdmFsXTtcbiAgICAgIH1cblxuICAgICAgdXRpbHMuZm9yRWFjaCh2YWwsIGZ1bmN0aW9uIHBhcnNlVmFsdWUodikge1xuICAgICAgICBpZiAodXRpbHMuaXNEYXRlKHYpKSB7XG4gICAgICAgICAgdiA9IHYudG9JU09TdHJpbmcoKTtcbiAgICAgICAgfSBlbHNlIGlmICh1dGlscy5pc09iamVjdCh2KSkge1xuICAgICAgICAgIHYgPSBKU09OLnN0cmluZ2lmeSh2KTtcbiAgICAgICAgfVxuICAgICAgICBwYXJ0cy5wdXNoKGVuY29kZShrZXkpICsgJz0nICsgZW5jb2RlKHYpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcnRzLmpvaW4oJyYnKTtcbiAgfVxuXG4gIGlmIChzZXJpYWxpemVkUGFyYW1zKSB7XG4gICAgdmFyIGhhc2htYXJrSW5kZXggPSB1cmwuaW5kZXhPZignIycpO1xuICAgIGlmIChoYXNobWFya0luZGV4ICE9PSAtMSkge1xuICAgICAgdXJsID0gdXJsLnNsaWNlKDAsIGhhc2htYXJrSW5kZXgpO1xuICAgIH1cblxuICAgIHVybCArPSAodXJsLmluZGV4T2YoJz8nKSA9PT0gLTEgPyAnPycgOiAnJicpICsgc2VyaWFsaXplZFBhcmFtcztcbiAgfVxuXG4gIHJldHVybiB1cmw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgVVJMIGJ5IGNvbWJpbmluZyB0aGUgc3BlY2lmaWVkIFVSTHNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVSTCBUaGUgYmFzZSBVUkxcbiAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGl2ZVVSTCBUaGUgcmVsYXRpdmUgVVJMXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tYmluZWQgVVJMXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29tYmluZVVSTHMoYmFzZVVSTCwgcmVsYXRpdmVVUkwpIHtcbiAgcmV0dXJuIHJlbGF0aXZlVVJMXG4gICAgPyBiYXNlVVJMLnJlcGxhY2UoL1xcLyskLywgJycpICsgJy8nICsgcmVsYXRpdmVVUkwucmVwbGFjZSgvXlxcLysvLCAnJylcbiAgICA6IGJhc2VVUkw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgc3VwcG9ydCBkb2N1bWVudC5jb29raWVcbiAgICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKG5hbWUsIHZhbHVlLCBleHBpcmVzLCBwYXRoLCBkb21haW4sIHNlY3VyZSkge1xuICAgICAgICAgIHZhciBjb29raWUgPSBbXTtcbiAgICAgICAgICBjb29raWUucHVzaChuYW1lICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSk7XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNOdW1iZXIoZXhwaXJlcykpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdleHBpcmVzPScgKyBuZXcgRGF0ZShleHBpcmVzKS50b0dNVFN0cmluZygpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNTdHJpbmcocGF0aCkpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdwYXRoPScgKyBwYXRoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNTdHJpbmcoZG9tYWluKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2RvbWFpbj0nICsgZG9tYWluKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc2VjdXJlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnc2VjdXJlJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZG9jdW1lbnQuY29va2llID0gY29va2llLmpvaW4oJzsgJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZChuYW1lKSB7XG4gICAgICAgICAgdmFyIG1hdGNoID0gZG9jdW1lbnQuY29va2llLm1hdGNoKG5ldyBSZWdFeHAoJyhefDtcXFxccyopKCcgKyBuYW1lICsgJyk9KFteO10qKScpKTtcbiAgICAgICAgICByZXR1cm4gKG1hdGNoID8gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzNdKSA6IG51bGwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKG5hbWUpIHtcbiAgICAgICAgICB0aGlzLndyaXRlKG5hbWUsICcnLCBEYXRlLm5vdygpIC0gODY0MDAwMDApO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudiAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKCkge30sXG4gICAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQoKSB7IHJldHVybiBudWxsOyB9LFxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHt9XG4gICAgICB9O1xuICAgIH0pKClcbik7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgVVJMIGlzIGFic29sdXRlXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgVVJMIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBzcGVjaWZpZWQgVVJMIGlzIGFic29sdXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0Fic29sdXRlVVJMKHVybCkge1xuICAvLyBBIFVSTCBpcyBjb25zaWRlcmVkIGFic29sdXRlIGlmIGl0IGJlZ2lucyB3aXRoIFwiPHNjaGVtZT46Ly9cIiBvciBcIi8vXCIgKHByb3RvY29sLXJlbGF0aXZlIFVSTCkuXG4gIC8vIFJGQyAzOTg2IGRlZmluZXMgc2NoZW1lIG5hbWUgYXMgYSBzZXF1ZW5jZSBvZiBjaGFyYWN0ZXJzIGJlZ2lubmluZyB3aXRoIGEgbGV0dGVyIGFuZCBmb2xsb3dlZFxuICAvLyBieSBhbnkgY29tYmluYXRpb24gb2YgbGV0dGVycywgZGlnaXRzLCBwbHVzLCBwZXJpb2QsIG9yIGh5cGhlbi5cbiAgcmV0dXJuIC9eKFthLXpdW2EtelxcZFxcK1xcLVxcLl0qOik/XFwvXFwvL2kudGVzdCh1cmwpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHBheWxvYWQgaXMgYW4gZXJyb3IgdGhyb3duIGJ5IEF4aW9zXG4gKlxuICogQHBhcmFtIHsqfSBwYXlsb2FkIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgcGF5bG9hZCBpcyBhbiBlcnJvciB0aHJvd24gYnkgQXhpb3MsIG90aGVyd2lzZSBmYWxzZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQXhpb3NFcnJvcihwYXlsb2FkKSB7XG4gIHJldHVybiAodHlwZW9mIHBheWxvYWQgPT09ICdvYmplY3QnKSAmJiAocGF5bG9hZC5pc0F4aW9zRXJyb3IgPT09IHRydWUpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIGhhdmUgZnVsbCBzdXBwb3J0IG9mIHRoZSBBUElzIG5lZWRlZCB0byB0ZXN0XG4gIC8vIHdoZXRoZXIgdGhlIHJlcXVlc3QgVVJMIGlzIG9mIHRoZSBzYW1lIG9yaWdpbiBhcyBjdXJyZW50IGxvY2F0aW9uLlxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICB2YXIgbXNpZSA9IC8obXNpZXx0cmlkZW50KS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gICAgICB2YXIgdXJsUGFyc2luZ05vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICB2YXIgb3JpZ2luVVJMO1xuXG4gICAgICAvKipcbiAgICAqIFBhcnNlIGEgVVJMIHRvIGRpc2NvdmVyIGl0J3MgY29tcG9uZW50c1xuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgVGhlIFVSTCB0byBiZSBwYXJzZWRcbiAgICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAgKi9cbiAgICAgIGZ1bmN0aW9uIHJlc29sdmVVUkwodXJsKSB7XG4gICAgICAgIHZhciBocmVmID0gdXJsO1xuXG4gICAgICAgIGlmIChtc2llKSB7XG4gICAgICAgIC8vIElFIG5lZWRzIGF0dHJpYnV0ZSBzZXQgdHdpY2UgdG8gbm9ybWFsaXplIHByb3BlcnRpZXNcbiAgICAgICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcbiAgICAgICAgICBocmVmID0gdXJsUGFyc2luZ05vZGUuaHJlZjtcbiAgICAgICAgfVxuXG4gICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuXG4gICAgICAgIC8vIHVybFBhcnNpbmdOb2RlIHByb3ZpZGVzIHRoZSBVcmxVdGlscyBpbnRlcmZhY2UgLSBodHRwOi8vdXJsLnNwZWMud2hhdHdnLm9yZy8jdXJsdXRpbHNcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBocmVmOiB1cmxQYXJzaW5nTm9kZS5ocmVmLFxuICAgICAgICAgIHByb3RvY29sOiB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbCA/IHVybFBhcnNpbmdOb2RlLnByb3RvY29sLnJlcGxhY2UoLzokLywgJycpIDogJycsXG4gICAgICAgICAgaG9zdDogdXJsUGFyc2luZ05vZGUuaG9zdCxcbiAgICAgICAgICBzZWFyY2g6IHVybFBhcnNpbmdOb2RlLnNlYXJjaCA/IHVybFBhcnNpbmdOb2RlLnNlYXJjaC5yZXBsYWNlKC9eXFw/LywgJycpIDogJycsXG4gICAgICAgICAgaGFzaDogdXJsUGFyc2luZ05vZGUuaGFzaCA/IHVybFBhcnNpbmdOb2RlLmhhc2gucmVwbGFjZSgvXiMvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0bmFtZTogdXJsUGFyc2luZ05vZGUuaG9zdG5hbWUsXG4gICAgICAgICAgcG9ydDogdXJsUGFyc2luZ05vZGUucG9ydCxcbiAgICAgICAgICBwYXRobmFtZTogKHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nKSA/XG4gICAgICAgICAgICB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZSA6XG4gICAgICAgICAgICAnLycgKyB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBvcmlnaW5VUkwgPSByZXNvbHZlVVJMKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcblxuICAgICAgLyoqXG4gICAgKiBEZXRlcm1pbmUgaWYgYSBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiBhcyB0aGUgY3VycmVudCBsb2NhdGlvblxuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSByZXF1ZXN0VVJMIFRoZSBVUkwgdG8gdGVzdFxuICAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4sIG90aGVyd2lzZSBmYWxzZVxuICAgICovXG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKHJlcXVlc3RVUkwpIHtcbiAgICAgICAgdmFyIHBhcnNlZCA9ICh1dGlscy5pc1N0cmluZyhyZXF1ZXN0VVJMKSkgPyByZXNvbHZlVVJMKHJlcXVlc3RVUkwpIDogcmVxdWVzdFVSTDtcbiAgICAgICAgcmV0dXJuIChwYXJzZWQucHJvdG9jb2wgPT09IG9yaWdpblVSTC5wcm90b2NvbCAmJlxuICAgICAgICAgICAgcGFyc2VkLmhvc3QgPT09IG9yaWdpblVSTC5ob3N0KTtcbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52cyAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9O1xuICAgIH0pKClcbik7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCBub3JtYWxpemVkTmFtZSkge1xuICB1dGlscy5mb3JFYWNoKGhlYWRlcnMsIGZ1bmN0aW9uIHByb2Nlc3NIZWFkZXIodmFsdWUsIG5hbWUpIHtcbiAgICBpZiAobmFtZSAhPT0gbm9ybWFsaXplZE5hbWUgJiYgbmFtZS50b1VwcGVyQ2FzZSgpID09PSBub3JtYWxpemVkTmFtZS50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICBoZWFkZXJzW25vcm1hbGl6ZWROYW1lXSA9IHZhbHVlO1xuICAgICAgZGVsZXRlIGhlYWRlcnNbbmFtZV07XG4gICAgfVxuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuLy8gSGVhZGVycyB3aG9zZSBkdXBsaWNhdGVzIGFyZSBpZ25vcmVkIGJ5IG5vZGVcbi8vIGMuZi4gaHR0cHM6Ly9ub2RlanMub3JnL2FwaS9odHRwLmh0bWwjaHR0cF9tZXNzYWdlX2hlYWRlcnNcbnZhciBpZ25vcmVEdXBsaWNhdGVPZiA9IFtcbiAgJ2FnZScsICdhdXRob3JpemF0aW9uJywgJ2NvbnRlbnQtbGVuZ3RoJywgJ2NvbnRlbnQtdHlwZScsICdldGFnJyxcbiAgJ2V4cGlyZXMnLCAnZnJvbScsICdob3N0JywgJ2lmLW1vZGlmaWVkLXNpbmNlJywgJ2lmLXVubW9kaWZpZWQtc2luY2UnLFxuICAnbGFzdC1tb2RpZmllZCcsICdsb2NhdGlvbicsICdtYXgtZm9yd2FyZHMnLCAncHJveHktYXV0aG9yaXphdGlvbicsXG4gICdyZWZlcmVyJywgJ3JldHJ5LWFmdGVyJywgJ3VzZXItYWdlbnQnXG5dO1xuXG4vKipcbiAqIFBhcnNlIGhlYWRlcnMgaW50byBhbiBvYmplY3RcbiAqXG4gKiBgYGBcbiAqIERhdGU6IFdlZCwgMjcgQXVnIDIwMTQgMDg6NTg6NDkgR01UXG4gKiBDb250ZW50LVR5cGU6IGFwcGxpY2F0aW9uL2pzb25cbiAqIENvbm5lY3Rpb246IGtlZXAtYWxpdmVcbiAqIFRyYW5zZmVyLUVuY29kaW5nOiBjaHVua2VkXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaGVhZGVycyBIZWFkZXJzIG5lZWRpbmcgdG8gYmUgcGFyc2VkXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBIZWFkZXJzIHBhcnNlZCBpbnRvIGFuIG9iamVjdFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBhcnNlSGVhZGVycyhoZWFkZXJzKSB7XG4gIHZhciBwYXJzZWQgPSB7fTtcbiAgdmFyIGtleTtcbiAgdmFyIHZhbDtcbiAgdmFyIGk7XG5cbiAgaWYgKCFoZWFkZXJzKSB7IHJldHVybiBwYXJzZWQ7IH1cblxuICB1dGlscy5mb3JFYWNoKGhlYWRlcnMuc3BsaXQoJ1xcbicpLCBmdW5jdGlvbiBwYXJzZXIobGluZSkge1xuICAgIGkgPSBsaW5lLmluZGV4T2YoJzonKTtcbiAgICBrZXkgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKDAsIGkpKS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhbCA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoaSArIDEpKTtcblxuICAgIGlmIChrZXkpIHtcbiAgICAgIGlmIChwYXJzZWRba2V5XSAmJiBpZ25vcmVEdXBsaWNhdGVPZi5pbmRleE9mKGtleSkgPj0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoa2V5ID09PSAnc2V0LWNvb2tpZScpIHtcbiAgICAgICAgcGFyc2VkW2tleV0gPSAocGFyc2VkW2tleV0gPyBwYXJzZWRba2V5XSA6IFtdKS5jb25jYXQoW3ZhbF0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFyc2VkW2tleV0gPSBwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldICsgJywgJyArIHZhbCA6IHZhbDtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBwYXJzZWQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFN5bnRhY3RpYyBzdWdhciBmb3IgaW52b2tpbmcgYSBmdW5jdGlvbiBhbmQgZXhwYW5kaW5nIGFuIGFycmF5IGZvciBhcmd1bWVudHMuXG4gKlxuICogQ29tbW9uIHVzZSBjYXNlIHdvdWxkIGJlIHRvIHVzZSBgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5YC5cbiAqXG4gKiAgYGBganNcbiAqICBmdW5jdGlvbiBmKHgsIHksIHopIHt9XG4gKiAgdmFyIGFyZ3MgPSBbMSwgMiwgM107XG4gKiAgZi5hcHBseShudWxsLCBhcmdzKTtcbiAqICBgYGBcbiAqXG4gKiBXaXRoIGBzcHJlYWRgIHRoaXMgZXhhbXBsZSBjYW4gYmUgcmUtd3JpdHRlbi5cbiAqXG4gKiAgYGBganNcbiAqICBzcHJlYWQoZnVuY3Rpb24oeCwgeSwgeikge30pKFsxLCAyLCAzXSk7XG4gKiAgYGBgXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzcHJlYWQoY2FsbGJhY2spIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXAoYXJyKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KG51bGwsIGFycik7XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgVkVSU0lPTiA9IHJlcXVpcmUoJy4uL2Vudi9kYXRhJykudmVyc2lvbjtcblxudmFyIHZhbGlkYXRvcnMgPSB7fTtcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcblsnb2JqZWN0JywgJ2Jvb2xlYW4nLCAnbnVtYmVyJywgJ2Z1bmN0aW9uJywgJ3N0cmluZycsICdzeW1ib2wnXS5mb3JFYWNoKGZ1bmN0aW9uKHR5cGUsIGkpIHtcbiAgdmFsaWRhdG9yc1t0eXBlXSA9IGZ1bmN0aW9uIHZhbGlkYXRvcih0aGluZykge1xuICAgIHJldHVybiB0eXBlb2YgdGhpbmcgPT09IHR5cGUgfHwgJ2EnICsgKGkgPCAxID8gJ24gJyA6ICcgJykgKyB0eXBlO1xuICB9O1xufSk7XG5cbnZhciBkZXByZWNhdGVkV2FybmluZ3MgPSB7fTtcblxuLyoqXG4gKiBUcmFuc2l0aW9uYWwgb3B0aW9uIHZhbGlkYXRvclxuICogQHBhcmFtIHtmdW5jdGlvbnxib29sZWFuP30gdmFsaWRhdG9yIC0gc2V0IHRvIGZhbHNlIGlmIHRoZSB0cmFuc2l0aW9uYWwgb3B0aW9uIGhhcyBiZWVuIHJlbW92ZWRcbiAqIEBwYXJhbSB7c3RyaW5nP30gdmVyc2lvbiAtIGRlcHJlY2F0ZWQgdmVyc2lvbiAvIHJlbW92ZWQgc2luY2UgdmVyc2lvblxuICogQHBhcmFtIHtzdHJpbmc/fSBtZXNzYWdlIC0gc29tZSBtZXNzYWdlIHdpdGggYWRkaXRpb25hbCBpbmZvXG4gKiBAcmV0dXJucyB7ZnVuY3Rpb259XG4gKi9cbnZhbGlkYXRvcnMudHJhbnNpdGlvbmFsID0gZnVuY3Rpb24gdHJhbnNpdGlvbmFsKHZhbGlkYXRvciwgdmVyc2lvbiwgbWVzc2FnZSkge1xuICBmdW5jdGlvbiBmb3JtYXRNZXNzYWdlKG9wdCwgZGVzYykge1xuICAgIHJldHVybiAnW0F4aW9zIHYnICsgVkVSU0lPTiArICddIFRyYW5zaXRpb25hbCBvcHRpb24gXFwnJyArIG9wdCArICdcXCcnICsgZGVzYyArIChtZXNzYWdlID8gJy4gJyArIG1lc3NhZ2UgOiAnJyk7XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuICByZXR1cm4gZnVuY3Rpb24odmFsdWUsIG9wdCwgb3B0cykge1xuICAgIGlmICh2YWxpZGF0b3IgPT09IGZhbHNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZm9ybWF0TWVzc2FnZShvcHQsICcgaGFzIGJlZW4gcmVtb3ZlZCcgKyAodmVyc2lvbiA/ICcgaW4gJyArIHZlcnNpb24gOiAnJykpKTtcbiAgICB9XG5cbiAgICBpZiAodmVyc2lvbiAmJiAhZGVwcmVjYXRlZFdhcm5pbmdzW29wdF0pIHtcbiAgICAgIGRlcHJlY2F0ZWRXYXJuaW5nc1tvcHRdID0gdHJ1ZTtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIGZvcm1hdE1lc3NhZ2UoXG4gICAgICAgICAgb3B0LFxuICAgICAgICAgICcgaGFzIGJlZW4gZGVwcmVjYXRlZCBzaW5jZSB2JyArIHZlcnNpb24gKyAnIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdGhlIG5lYXIgZnV0dXJlJ1xuICAgICAgICApXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiB2YWxpZGF0b3IgPyB2YWxpZGF0b3IodmFsdWUsIG9wdCwgb3B0cykgOiB0cnVlO1xuICB9O1xufTtcblxuLyoqXG4gKiBBc3NlcnQgb2JqZWN0J3MgcHJvcGVydGllcyB0eXBlXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtvYmplY3R9IHNjaGVtYVxuICogQHBhcmFtIHtib29sZWFuP30gYWxsb3dVbmtub3duXG4gKi9cblxuZnVuY3Rpb24gYXNzZXJ0T3B0aW9ucyhvcHRpb25zLCBzY2hlbWEsIGFsbG93VW5rbm93bikge1xuICBpZiAodHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9ucyBtdXN0IGJlIGFuIG9iamVjdCcpO1xuICB9XG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMob3B0aW9ucyk7XG4gIHZhciBpID0ga2V5cy5sZW5ndGg7XG4gIHdoaWxlIChpLS0gPiAwKSB7XG4gICAgdmFyIG9wdCA9IGtleXNbaV07XG4gICAgdmFyIHZhbGlkYXRvciA9IHNjaGVtYVtvcHRdO1xuICAgIGlmICh2YWxpZGF0b3IpIHtcbiAgICAgIHZhciB2YWx1ZSA9IG9wdGlvbnNbb3B0XTtcbiAgICAgIHZhciByZXN1bHQgPSB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbGlkYXRvcih2YWx1ZSwgb3B0LCBvcHRpb25zKTtcbiAgICAgIGlmIChyZXN1bHQgIT09IHRydWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9uICcgKyBvcHQgKyAnIG11c3QgYmUgJyArIHJlc3VsdCk7XG4gICAgICB9XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKGFsbG93VW5rbm93biAhPT0gdHJ1ZSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ1Vua25vd24gb3B0aW9uICcgKyBvcHQpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYXNzZXJ0T3B0aW9uczogYXNzZXJ0T3B0aW9ucyxcbiAgdmFsaWRhdG9yczogdmFsaWRhdG9yc1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xuXG4vLyB1dGlscyBpcyBhIGxpYnJhcnkgb2YgZ2VuZXJpYyBoZWxwZXIgZnVuY3Rpb25zIG5vbi1zcGVjaWZpYyB0byBheGlvc1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIEFycmF5XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gQXJyYXksIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5KHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBBcnJheV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIHVuZGVmaW5lZFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSB2YWx1ZSBpcyB1bmRlZmluZWQsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1VuZGVmaW5lZCh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0J1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiAhaXNVbmRlZmluZWQodmFsKSAmJiB2YWwuY29uc3RydWN0b3IgIT09IG51bGwgJiYgIWlzVW5kZWZpbmVkKHZhbC5jb25zdHJ1Y3RvcilcbiAgICAmJiB0eXBlb2YgdmFsLmNvbnN0cnVjdG9yLmlzQnVmZmVyID09PSAnZnVuY3Rpb24nICYmIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlcih2YWwpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5QnVmZmVyKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRm9ybURhdGFcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBGb3JtRGF0YSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRm9ybURhdGEodmFsKSB7XG4gIHJldHVybiAodHlwZW9mIEZvcm1EYXRhICE9PSAndW5kZWZpbmVkJykgJiYgKHZhbCBpbnN0YW5jZW9mIEZvcm1EYXRhKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHZpZXcgb24gYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIHZpZXcgb24gYW4gQXJyYXlCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5QnVmZmVyVmlldyh2YWwpIHtcbiAgdmFyIHJlc3VsdDtcbiAgaWYgKCh0eXBlb2YgQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnKSAmJiAoQXJyYXlCdWZmZXIuaXNWaWV3KSkge1xuICAgIHJlc3VsdCA9IEFycmF5QnVmZmVyLmlzVmlldyh2YWwpO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdCA9ICh2YWwpICYmICh2YWwuYnVmZmVyKSAmJiAodmFsLmJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyaW5nXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJpbmcsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmluZyh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgTnVtYmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBOdW1iZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc051bWJlcih2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdudW1iZXInO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIE9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIHBsYWluIE9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3QodmFsKSB7XG4gIGlmICh0b1N0cmluZy5jYWxsKHZhbCkgIT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIHByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih2YWwpO1xuICByZXR1cm4gcHJvdG90eXBlID09PSBudWxsIHx8IHByb3RvdHlwZSA9PT0gT2JqZWN0LnByb3RvdHlwZTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIERhdGVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIERhdGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0RhdGUodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZpbGVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZpbGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0ZpbGUodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEZpbGVdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJsb2JcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJsb2IsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Jsb2IodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEJsb2JdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGdW5jdGlvbiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJlYW1cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmVhbSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyZWFtKHZhbCkge1xuICByZXR1cm4gaXNPYmplY3QodmFsKSAmJiBpc0Z1bmN0aW9uKHZhbC5waXBlKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFVSTFNlYXJjaFBhcmFtcyBvYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFVSTFNlYXJjaFBhcmFtcyBvYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1VSTFNlYXJjaFBhcmFtcyh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiBVUkxTZWFyY2hQYXJhbXMgIT09ICd1bmRlZmluZWQnICYmIHZhbCBpbnN0YW5jZW9mIFVSTFNlYXJjaFBhcmFtcztcbn1cblxuLyoqXG4gKiBUcmltIGV4Y2VzcyB3aGl0ZXNwYWNlIG9mZiB0aGUgYmVnaW5uaW5nIGFuZCBlbmQgb2YgYSBzdHJpbmdcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIFRoZSBTdHJpbmcgdG8gdHJpbVxuICogQHJldHVybnMge1N0cmluZ30gVGhlIFN0cmluZyBmcmVlZCBvZiBleGNlc3Mgd2hpdGVzcGFjZVxuICovXG5mdW5jdGlvbiB0cmltKHN0cikge1xuICByZXR1cm4gc3RyLnRyaW0gPyBzdHIudHJpbSgpIDogc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgd2UncmUgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnRcbiAqXG4gKiBUaGlzIGFsbG93cyBheGlvcyB0byBydW4gaW4gYSB3ZWIgd29ya2VyLCBhbmQgcmVhY3QtbmF0aXZlLlxuICogQm90aCBlbnZpcm9ubWVudHMgc3VwcG9ydCBYTUxIdHRwUmVxdWVzdCwgYnV0IG5vdCBmdWxseSBzdGFuZGFyZCBnbG9iYWxzLlxuICpcbiAqIHdlYiB3b3JrZXJzOlxuICogIHR5cGVvZiB3aW5kb3cgLT4gdW5kZWZpbmVkXG4gKiAgdHlwZW9mIGRvY3VtZW50IC0+IHVuZGVmaW5lZFxuICpcbiAqIHJlYWN0LW5hdGl2ZTpcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnUmVhY3ROYXRpdmUnXG4gKiBuYXRpdmVzY3JpcHRcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnTmF0aXZlU2NyaXB0JyBvciAnTlMnXG4gKi9cbmZ1bmN0aW9uIGlzU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgKG5hdmlnYXRvci5wcm9kdWN0ID09PSAnUmVhY3ROYXRpdmUnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOYXRpdmVTY3JpcHQnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOUycpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiAoXG4gICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnXG4gICk7XG59XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFuIEFycmF5IG9yIGFuIE9iamVjdCBpbnZva2luZyBhIGZ1bmN0aW9uIGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgYG9iamAgaXMgYW4gQXJyYXkgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBpbmRleCwgYW5kIGNvbXBsZXRlIGFycmF5IGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgJ29iaicgaXMgYW4gT2JqZWN0IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwga2V5LCBhbmQgY29tcGxldGUgb2JqZWN0IGZvciBlYWNoIHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBvYmogVGhlIG9iamVjdCB0byBpdGVyYXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgY2FsbGJhY2sgdG8gaW52b2tlIGZvciBlYWNoIGl0ZW1cbiAqL1xuZnVuY3Rpb24gZm9yRWFjaChvYmosIGZuKSB7XG4gIC8vIERvbid0IGJvdGhlciBpZiBubyB2YWx1ZSBwcm92aWRlZFxuICBpZiAob2JqID09PSBudWxsIHx8IHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRm9yY2UgYW4gYXJyYXkgaWYgbm90IGFscmVhZHkgc29tZXRoaW5nIGl0ZXJhYmxlXG4gIGlmICh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0Jykge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIG9iaiA9IFtvYmpdO1xuICB9XG5cbiAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBhcnJheSB2YWx1ZXNcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG9iai5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2ldLCBpLCBvYmopO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgb2JqZWN0IGtleXNcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgICBmbi5jYWxsKG51bGwsIG9ialtrZXldLCBrZXksIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQWNjZXB0cyB2YXJhcmdzIGV4cGVjdGluZyBlYWNoIGFyZ3VtZW50IHRvIGJlIGFuIG9iamVjdCwgdGhlblxuICogaW1tdXRhYmx5IG1lcmdlcyB0aGUgcHJvcGVydGllcyBvZiBlYWNoIG9iamVjdCBhbmQgcmV0dXJucyByZXN1bHQuXG4gKlxuICogV2hlbiBtdWx0aXBsZSBvYmplY3RzIGNvbnRhaW4gdGhlIHNhbWUga2V5IHRoZSBsYXRlciBvYmplY3QgaW5cbiAqIHRoZSBhcmd1bWVudHMgbGlzdCB3aWxsIHRha2UgcHJlY2VkZW5jZS5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIGBgYGpzXG4gKiB2YXIgcmVzdWx0ID0gbWVyZ2Uoe2ZvbzogMTIzfSwge2ZvbzogNDU2fSk7XG4gKiBjb25zb2xlLmxvZyhyZXN1bHQuZm9vKTsgLy8gb3V0cHV0cyA0NTZcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmoxIE9iamVjdCB0byBtZXJnZVxuICogQHJldHVybnMge09iamVjdH0gUmVzdWx0IG9mIGFsbCBtZXJnZSBwcm9wZXJ0aWVzXG4gKi9cbmZ1bmN0aW9uIG1lcmdlKC8qIG9iajEsIG9iajIsIG9iajMsIC4uLiAqLykge1xuICB2YXIgcmVzdWx0ID0ge307XG4gIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKGlzUGxhaW5PYmplY3QocmVzdWx0W2tleV0pICYmIGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZShyZXN1bHRba2V5XSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZSh7fSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWwuc2xpY2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWw7XG4gICAgfVxuICB9XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgZm9yRWFjaChhcmd1bWVudHNbaV0sIGFzc2lnblZhbHVlKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEV4dGVuZHMgb2JqZWN0IGEgYnkgbXV0YWJseSBhZGRpbmcgdG8gaXQgdGhlIHByb3BlcnRpZXMgb2Ygb2JqZWN0IGIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGEgVGhlIG9iamVjdCB0byBiZSBleHRlbmRlZFxuICogQHBhcmFtIHtPYmplY3R9IGIgVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgZnJvbVxuICogQHBhcmFtIHtPYmplY3R9IHRoaXNBcmcgVGhlIG9iamVjdCB0byBiaW5kIGZ1bmN0aW9uIHRvXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSByZXN1bHRpbmcgdmFsdWUgb2Ygb2JqZWN0IGFcbiAqL1xuZnVuY3Rpb24gZXh0ZW5kKGEsIGIsIHRoaXNBcmcpIHtcbiAgZm9yRWFjaChiLCBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmICh0aGlzQXJnICYmIHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFba2V5XSA9IGJpbmQodmFsLCB0aGlzQXJnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYVtrZXldID0gdmFsO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBhO1xufVxuXG4vKipcbiAqIFJlbW92ZSBieXRlIG9yZGVyIG1hcmtlci4gVGhpcyBjYXRjaGVzIEVGIEJCIEJGICh0aGUgVVRGLTggQk9NKVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZW50IHdpdGggQk9NXG4gKiBAcmV0dXJuIHtzdHJpbmd9IGNvbnRlbnQgdmFsdWUgd2l0aG91dCBCT01cbiAqL1xuZnVuY3Rpb24gc3RyaXBCT00oY29udGVudCkge1xuICBpZiAoY29udGVudC5jaGFyQ29kZUF0KDApID09PSAweEZFRkYpIHtcbiAgICBjb250ZW50ID0gY29udGVudC5zbGljZSgxKTtcbiAgfVxuICByZXR1cm4gY29udGVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzQXJyYXk6IGlzQXJyYXksXG4gIGlzQXJyYXlCdWZmZXI6IGlzQXJyYXlCdWZmZXIsXG4gIGlzQnVmZmVyOiBpc0J1ZmZlcixcbiAgaXNGb3JtRGF0YTogaXNGb3JtRGF0YSxcbiAgaXNBcnJheUJ1ZmZlclZpZXc6IGlzQXJyYXlCdWZmZXJWaWV3LFxuICBpc1N0cmluZzogaXNTdHJpbmcsXG4gIGlzTnVtYmVyOiBpc051bWJlcixcbiAgaXNPYmplY3Q6IGlzT2JqZWN0LFxuICBpc1BsYWluT2JqZWN0OiBpc1BsYWluT2JqZWN0LFxuICBpc1VuZGVmaW5lZDogaXNVbmRlZmluZWQsXG4gIGlzRGF0ZTogaXNEYXRlLFxuICBpc0ZpbGU6IGlzRmlsZSxcbiAgaXNCbG9iOiBpc0Jsb2IsXG4gIGlzRnVuY3Rpb246IGlzRnVuY3Rpb24sXG4gIGlzU3RyZWFtOiBpc1N0cmVhbSxcbiAgaXNVUkxTZWFyY2hQYXJhbXM6IGlzVVJMU2VhcmNoUGFyYW1zLFxuICBpc1N0YW5kYXJkQnJvd3NlckVudjogaXNTdGFuZGFyZEJyb3dzZXJFbnYsXG4gIGZvckVhY2g6IGZvckVhY2gsXG4gIG1lcmdlOiBtZXJnZSxcbiAgZXh0ZW5kOiBleHRlbmQsXG4gIHRyaW06IHRyaW0sXG4gIHN0cmlwQk9NOiBzdHJpcEJPTVxufTtcbiIsImltcG9ydCBTZWN0aW9uIGZyb20gXCIuL3R5cGVzL1NlY3Rpb25cIjtcbmltcG9ydCBIb21lU2VjdGlvbiBmcm9tIFwiLi9zZWN0aW9ucy9Ib21lXCI7XG5pbXBvcnQgT3JkZXJTZWN0aW9uIGZyb20gXCIuL3NlY3Rpb25zL09yZGVyXCI7XG5pbXBvcnQgUHJvZHVjdFNlY3Rpb24gZnJvbSBcIi4vc2VjdGlvbnMvUHJvZHVjdFwiO1xuaW1wb3J0IFJld2FyZFNlY3Rpb24gZnJvbSBcIi4vc2VjdGlvbnMvUmV3YXJkXCI7XG5pbXBvcnQgU3RvcmVTZWN0aW9uIGZyb20gXCIuL3NlY3Rpb25zL1N0b3JlXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERhc2hib2FyZCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMucmVuZGVyRGFzaGJvYXJkKCk7XG5cbiAgICBjb25zdCBzaWRlYmFySXRlbXNDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcbiAgICAgIFwic2lkZWJhckl0ZW1zXCJcbiAgICApISBhcyBIVE1MRGl2RWxlbWVudDtcbiAgICBzaWRlYmFySXRlbXNDb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwiY2xpY2tcIixcbiAgICAgIHRoaXMuc2lkZWJhckNsaWNrSGFuZGxlci5iaW5kKHRoaXMpXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyRGFzaGJvYXJkKHNlY3Rpb24/OiBTZWN0aW9uKSB7XG4gICAgY29uc3QgYWN0aXZlU2VjdGlvbiA9IHNlY3Rpb24gfHwgXCJIT01FXCI7XG5cbiAgICBzd2l0Y2ggKGFjdGl2ZVNlY3Rpb24pIHtcbiAgICAgIGNhc2UgXCJIT01FXCI6XG4gICAgICAgIG5ldyBIb21lU2VjdGlvbigpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJTVE9SRVwiOlxuICAgICAgICBuZXcgU3RvcmVTZWN0aW9uKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIlBST0RVQ1RcIjpcbiAgICAgICAgbmV3IFByb2R1Y3RTZWN0aW9uKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIlJFV0FSRFwiOlxuICAgICAgICBuZXcgUmV3YXJkU2VjdGlvbigpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJPUkRFUlwiOlxuICAgICAgICBuZXcgT3JkZXJTZWN0aW9uKCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJbZGF0YS1zZWN0aW9uXVwiKS5mb3JFYWNoKChlbCkgPT4ge1xuICAgICAgaWYgKCEoZWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHJldHVybjtcblxuICAgICAgaWYgKFxuICAgICAgICBlbC5kYXRhc2V0LnNlY3Rpb24gIT09IGFjdGl2ZVNlY3Rpb24gJiZcbiAgICAgICAgZWwuY2xhc3NMaXN0LmNvbnRhaW5zKFwic2lkZWJhci1pdGVtX19hY3RpdmVcIilcbiAgICAgICkge1xuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKFwic2lkZWJhci1pdGVtX19hY3RpdmVcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChcbiAgICAgICAgZWwuZGF0YXNldC5zZWN0aW9uID09PSBhY3RpdmVTZWN0aW9uICYmXG4gICAgICAgICFlbC5jbGFzc0xpc3QuY29udGFpbnMoXCJzaWRlYmFyLWl0ZW1fX2FjdGl2ZVwiKVxuICAgICAgKSB7XG4gICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoXCJzaWRlYmFyLWl0ZW1fX2FjdGl2ZVwiKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgc2lkZWJhckNsaWNrSGFuZGxlcihlOiBFdmVudCkge1xuICAgIGxldCB0YXJnZXQgPSBlLnRhcmdldCBhcyBIVE1MRWxlbWVudDtcblxuICAgIGlmICghdGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhcInNpZGViYXItaXRlbVwiKSkge1xuICAgICAgdGFyZ2V0ID0gdGFyZ2V0LmNsb3Nlc3QoXCIuc2lkZWJhci1pdGVtXCIpIGFzIEhUTUxFbGVtZW50O1xuICAgICAgaWYgKCF0YXJnZXQpIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzZWN0aW9uRGF0YXNldCA9IHRhcmdldC5kYXRhc2V0LnNlY3Rpb24gYXMgU2VjdGlvbiB8IFwiTlVMTFwiO1xuXG4gICAgaWYgKHNlY3Rpb25EYXRhc2V0ID09PSBcIk5VTExcIikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMucmVuZGVyRGFzaGJvYXJkKHNlY3Rpb25EYXRhc2V0KTtcbiAgfVxufVxuIiwiaW1wb3J0IERhc2hib2FyZCBmcm9tIFwiLi9EYXNoYm9hcmRcIjtcbmltcG9ydCBPcmRlclByb2R1Y3RNb2RhbCBmcm9tIFwiLi9tb2RhbHMvT3JkZXJQcm9kdWN0XCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1haW4ge1xuICBwdWJsaWMgc3RhdGljIHNlbGY6IE1haW47XG4gIHByaXZhdGUgZm9jdXNlZEVsPzogSFRNTEVsZW1lbnQ7XG5cbiAgcHJpdmF0ZSBjb25zdHJ1Y3RvcigpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLmdldEVsZW1lbnRCeUlkKFwiZHJvcGRvd25Ub2dnbGVcIilcbiAgICAgID8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuZHJvcGRvd25Ub2dnbGVIYW5kbGVyLmJpbmQodGhpcykpO1xuXG4gICAgaWYgKGxvY2F0aW9uLnBhdGhuYW1lID09PSBcIi9kYXNoYm9hcmRcIikge1xuICAgICAgbmV3IERhc2hib2FyZCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChsb2NhdGlvbi5wYXRobmFtZSA9PT0gXCIvXCIpIHtcbiAgICAgIGRvY3VtZW50XG4gICAgICAgIC5nZXRFbGVtZW50QnlJZChcImNvbnRhY3RGb3JtXCIpXG4gICAgICAgID8uYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCB0aGlzLmNvbnRhY3RTdWJtaXRIYW5kbGVyLmJpbmQodGhpcykpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGRvY3VtZW50XG4gICAgICAuZ2V0RWxlbWVudEJ5SWQoXCJwcm9kdWN0SW1nc1wiKVxuICAgICAgPy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5jaGFuZ2VBY3RpdmVJbWdIYW5kbGVyLmJpbmQodGhpcykpO1xuXG4gICAgZG9jdW1lbnRcbiAgICAgIC5nZXRFbGVtZW50QnlJZChcIm9yZGVyUHJvZHVjdFwiKVxuICAgICAgPy5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIHRoaXMub3JkZXJQcm9kdWN0SGFuZGxlci5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIHN0YXRpYyBtYWluKCkge1xuICAgIHRoaXMuc2VsZiA9IG5ldyBNYWluKCk7XG4gICAgcmV0dXJuIHRoaXMuc2VsZjtcbiAgfVxuXG4gIHByaXZhdGUgZHJvcGRvd25Ub2dnbGVIYW5kbGVyKCkge1xuICAgIGlmICh0aGlzLmZvY3VzZWRFbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHVzZXJEcm9wZG93blRlbXBsYXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXG4gICAgICBcInVzZXJEcm9wZG93blRlbXBsYXRlXCJcbiAgICApISBhcyBIVE1MVGVtcGxhdGVFbGVtZW50O1xuXG4gICAgdXNlckRyb3Bkb3duVGVtcGxhdGUucGFyZW50RWxlbWVudD8uYXBwZW5kQ2hpbGQoXG4gICAgICB1c2VyRHJvcGRvd25UZW1wbGF0ZS5jb250ZW50LmNsb25lTm9kZSh0cnVlKSBhcyBIVE1MRWxlbWVudFxuICAgICk7XG5cbiAgICB0aGlzLmZvY3VzZWRFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidXNlckRyb3Bkb3duXCIpITtcblxuICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5hdHRhY2hMaXN0ZW5lclRvQm9keSgpLCA1MCk7XG4gIH1cblxuICBwcml2YXRlIGF0dGFjaExpc3RlbmVyVG9Cb2R5KCkge1xuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwiY2xpY2tcIixcbiAgICAgIHRoaXMuY2xvc2VGb2N1c2VkSGFuZGxlci5iaW5kKHRoaXMpLFxuICAgICAgeyBvbmNlOiB0cnVlIH1cbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBjbG9zZUZvY3VzZWRIYW5kbGVyKGU6IEV2ZW50KSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQ7XG5cbiAgICBpZiAodGFyZ2V0LmNsb3Nlc3QoYCMke3RoaXMuZm9jdXNlZEVsIS5pZH1gKSkge1xuICAgICAgdGhpcy5hdHRhY2hMaXN0ZW5lclRvQm9keSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuZm9jdXNlZEVsIS5yZW1vdmUoKTtcbiAgICB0aGlzLmZvY3VzZWRFbCA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHByaXZhdGUgY2hhbmdlQWN0aXZlSW1nSGFuZGxlcihlOiBFdmVudCkge1xuICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0IGFzIEhUTUxJbWFnZUVsZW1lbnQ7XG5cbiAgICBpZiAoIXRhcmdldC5zcmMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBhY3RpdmVJbWdDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcbiAgICAgIFwicHJvZHVjdEFjdGl2ZUltZ1wiXG4gICAgKSBhcyBIVE1MSW1hZ2VFbGVtZW50O1xuXG4gICAgaWYgKHRhcmdldC5zcmMgPT09IGFjdGl2ZUltZ0NvbnRhaW5lci5zcmMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBhY3RpdmVJbWdDb250YWluZXIuaW5uZXJIVE1MID0gdGFyZ2V0Lm91dGVySFRNTDtcbiAgfVxuXG4gIHByaXZhdGUgb3JkZXJQcm9kdWN0SGFuZGxlcihlOiBFdmVudCkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0IGFzIEhUTUxGb3JtRWxlbWVudDtcblxuICAgIGNvbnN0IHByb2R1Y3RJZCA9IHRhcmdldC5kYXRhc2V0Py5pZDtcbiAgICBjb25zdCBvcmRlclR5cGUgPSB0YXJnZXQuZGF0YXNldD8udHlwZTtcbiAgICBjb25zdCBsb2dnZWRJbiA9IEJvb2xlYW4odGFyZ2V0LmRhdGFzZXQ/LmxvZ2dlZEluKTtcbiAgICBjb25zdCBxdWFudGl0eUlucHV0ID0gdGFyZ2V0Py5xdWVyeVNlbGVjdG9yKFxuICAgICAgXCJpbnB1dFtpZD0nb3JkZXJBbW91bnQnXVwiXG4gICAgKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuXG4gICAgaWYgKCFsb2dnZWRJbikge1xuICAgICAgbG9jYXRpb24uaHJlZiA9IFwiL2xvZ2luXCI7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbmV3IE9yZGVyUHJvZHVjdE1vZGFsKFxuICAgICAgb3JkZXJUeXBlISxcbiAgICAgIHByb2R1Y3RJZCEsXG4gICAgICArcXVhbnRpdHlJbnB1dD8udmFsdWUudHJpbSgpIHx8IDFcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBjb250YWN0U3VibWl0SGFuZGxlcihlOiBFdmVudCkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIGNvbnN0IGNvbnRhY3ROYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXG4gICAgICBcImNvbnRhY3ROYW1lXCJcbiAgICApIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgY29uc3QgY29udGFjdEVtYWlsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXG4gICAgICBcImNvbnRhY3RFbWFpbFwiXG4gICAgKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgIGNvbnN0IGNvbnRhY3RTdWJqZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXG4gICAgICBcImNvbnRhY3RTdWJqZWN0XCJcbiAgICApIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgY29uc3QgY29udGFjdE1lc3NhZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcbiAgICAgIFwiY29udGFjdE1lc3NhZ2VcIlxuICAgICkgYXMgSFRNTElucHV0RWxlbWVudDtcblxuICAgIGNvbnN0IGVtYWlsID0gY29udGFjdEVtYWlsLnZhbHVlO1xuICAgIGNvbnN0IHN1YmplY3QgPSBjb250YWN0U3ViamVjdC52YWx1ZTtcbiAgICBjb25zdCBib2R5ID0gY29udGFjdE1lc3NhZ2UudmFsdWU7XG5cbiAgICBjb25zdCB1cmwgPSBgbWFpbHRvOmdhZm91cmlAZ21haWwuY29tP2JjYz0ke2VtYWlsfSZzdWJqZWN0PSR7c3ViamVjdH0mYm9keT0ke2JvZHl9YDtcbiAgICB3aW5kb3cub3Blbih1cmwpO1xuXG4gICAgY29udGFjdE5hbWUudmFsdWUgPSBcIlwiO1xuICAgIGNvbnRhY3RFbWFpbC52YWx1ZSA9IFwiXCI7XG4gICAgY29udGFjdFN1YmplY3QudmFsdWUgPSBcIlwiO1xuICAgIGNvbnRhY3RNZXNzYWdlLnZhbHVlID0gXCJcIjtcbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZm9ybWF0RGF0ZShkYXRlOiBEYXRlKSB7XG4gIGNvbnN0IGRhdGVPYmogPSBuZXcgRGF0ZShkYXRlKTtcbiAgY29uc3QgZGF5ID0gZGF0ZU9iai5nZXREYXRlKCk7XG4gIGNvbnN0IG1vbnRoID0gZGF0ZU9iai50b0xvY2FsZVN0cmluZyhcImVuLXVzXCIsIHsgbW9udGg6IFwic2hvcnRcIiB9KTtcbiAgY29uc3QgeWVhciA9IGRhdGVPYmouZ2V0RnVsbFllYXIoKTtcblxuICByZXR1cm4gYCR7ZGF5fSAke21vbnRofSwgJHt5ZWFyfWA7XG59XG4iLCJpbXBvcnQgTWFpbiBmcm9tIFwiLi9NYWluXCI7XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCAoKSA9PiBNYWluLm1haW4oKSk7XG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBNb2RhbCB7XG4gIHByaXZhdGUgb3ZlcmxheU1hcmt1cCA9IGA8ZGl2IGNsYXNzPVwib3ZlcmxheVwiPjwvZGl2PmA7XG4gIHByaXZhdGUgbW9kYWxNYXJrdXAgPSBgXG4gICAgPGRpdiBjbGFzcz1cIm1vZGFsLWNvbnRhaW5lclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWxcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC10b3BcIj5cbiAgICAgICAgICAgICAgICA8aDIgY2xhc3M9XCJtb2RhbC1icmFuZFwiPjwvaDI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWNsb3NlXCI+PGkgY2xhc3M9XCJiaSBiaS14XCI+PC9pPjwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtY29udGVudFwiPjwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYDtcbiAgcHJpdmF0ZSBsb2FkaW5nU3Bpbm5lciA9IGBcbiAgICA8ZGl2IGNsYXNzPVwibG9hZGluZy1zcGlubmVyX19kYXNoYm9hcmRcIj48ZGl2IGNsYXNzPVwibG9hZGluZy1zcGlubmVyXCI+PC9kaXY+PC9kaXY+XG4gIGA7XG5cbiAgcHJpdmF0ZSBvdmVybGF5OiBIVE1MRWxlbWVudDtcbiAgcHJpdmF0ZSBtb2RhbDogSFRNTEVsZW1lbnQ7XG4gIHByb3RlY3RlZCBtb2RhbFRpdGxlOiBIVE1MRWxlbWVudDtcbiAgcHJpdmF0ZSBtb2RhbENsb3NlOiBIVE1MRWxlbWVudDtcbiAgcHJvdGVjdGVkIG1vZGFsQ29udGVudENvbnRhaW5lcjogSFRNTEVsZW1lbnQ7XG4gIHByb3RlY3RlZCBmb3JtPzogSFRNTEZvcm1FbGVtZW50O1xuICBwcm90ZWN0ZWQgcmVuZGVyZWRFcnJvcj86IEhUTUxFbGVtZW50O1xuICBwcm90ZWN0ZWQgYWN0aXZlVGltZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHRpdGxlOiBzdHJpbmcsXG4gICAgcHJvdGVjdGVkIHR5cGU6IFwiRURJVEFCTEVcIiB8IFwiQ1JFQVRBQkxFXCIgPSBcIkNSRUFUQUJMRVwiXG4gICkge1xuICAgIGRvY3VtZW50LmJvZHkuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYWZ0ZXJiZWdpblwiLCB0aGlzLm92ZXJsYXlNYXJrdXApO1xuICAgIGRvY3VtZW50LmJvZHkuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYWZ0ZXJiZWdpblwiLCB0aGlzLm1vZGFsTWFya3VwKTtcblxuICAgIHRoaXMub3ZlcmxheSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIub3ZlcmxheVwiKSBhcyBIVE1MRWxlbWVudDtcbiAgICB0aGlzLm1vZGFsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5tb2RhbFwiKSBhcyBIVE1MRWxlbWVudDtcbiAgICB0aGlzLm1vZGFsVGl0bGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLm1vZGFsLWJyYW5kXCIpIGFzIEhUTUxFbGVtZW50O1xuICAgIHRoaXMubW9kYWxDbG9zZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubW9kYWwtY2xvc2VcIikgYXMgSFRNTEVsZW1lbnQ7XG4gICAgdGhpcy5tb2RhbENvbnRlbnRDb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgXCIubW9kYWwtY29udGVudFwiXG4gICAgKSBhcyBIVE1MRWxlbWVudDtcblxuICAgIHRoaXMubW9kYWxUaXRsZS50ZXh0Q29udGVudCA9IHRpdGxlO1xuICAgIHRoaXMubW9kYWxDb250ZW50Q29udGFpbmVyLmlubmVySFRNTCA9IHRoaXMubG9hZGluZ1NwaW5uZXI7XG5cbiAgICB0aGlzLm1vZGFsQ2xvc2UuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuY2xvc2VIYW5kbGVyLmJpbmQodGhpcykpO1xuICAgIHRoaXMub3ZlcmxheS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5jbG9zZUhhbmRsZXIuYmluZCh0aGlzKSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5rZXlkb3duSGFuZGxlci5iaW5kKHRoaXMpLCB7XG4gICAgICBvbmNlOiB0cnVlLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBrZXlkb3duSGFuZGxlcihlOiBLZXlib2FyZEV2ZW50KSB7XG4gICAgaWYgKGUua2V5ID09PSBcIkVzY2FwZVwiKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB0aGlzLmNsb3NlSGFuZGxlcigpO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCByZW5kZXIobWFya3VwOiBzdHJpbmcpIHtcbiAgICB0aGlzLm1vZGFsQ29udGVudENvbnRhaW5lci5pbm5lckhUTUwgPSBtYXJrdXA7XG4gICAgaWYgKHRoaXMudHlwZSA9PT0gXCJFRElUQUJMRVwiKSB7XG4gICAgICBkb2N1bWVudFxuICAgICAgICAuZ2V0RWxlbWVudEJ5SWQoXCJkZWxldGVEb2NcIilcbiAgICAgICAgPy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5kZWxldGVIYW5kbGVyLmJpbmQodGhpcykpO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBjbG9zZUhhbmRsZXIoKSB7XG4gICAgdGhpcy5tb2RhbC5yZW1vdmUoKTtcbiAgICB0aGlzLm92ZXJsYXkucmVtb3ZlKCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgY3JlYXRlRXJyb3IodGV4dDogc3RyaW5nKSB7XG4gICAgY29uc3QgZXJyb3JFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgIGVycm9yRWwuY2xhc3NMaXN0LmFkZChcImZvcm0tZXJyb3JcIik7XG4gICAgZXJyb3JFbC50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgcmV0dXJuIGVycm9yRWw7XG4gIH1cblxuICBwcm90ZWN0ZWQgcmVtb3ZlUHJldkVycm9yKCkge1xuICAgIGlmICh0aGlzLnJlbmRlcmVkRXJyb3IpIHtcbiAgICAgIHRoaXMucmVuZGVyZWRFcnJvci5yZW1vdmUoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGRlbGV0ZUhhbmRsZXIoZTogRXZlbnQpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG5cbiAgICAgIGlmICh0aGlzLmFjdGl2ZVRpbWVyKSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5hY3RpdmVUaW1lcik7XG4gICAgICAgIHRhcmdldC50ZXh0Q29udGVudCA9IFwiRGVsZXRlXCI7XG4gICAgICAgIHRhcmdldC5zdHlsZS5vcGFjaXR5ID0gXCIxXCI7XG4gICAgICAgIHRoaXMuYWN0aXZlVGltZXIgPSAwO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGxldCB0aW1lciA9IDM7XG4gICAgICB0YXJnZXQudGV4dENvbnRlbnQgPSBgVW5kby4uLiAke3RpbWVyfWA7XG4gICAgICB0YXJnZXQuc3R5bGUub3BhY2l0eSA9IFwiMC43XCI7XG4gICAgICB0aGlzLmFjdGl2ZVRpbWVyID0gd2luZG93LnNldEludGVydmFsKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKHRpbWVyICE9PSAwKSB7XG4gICAgICAgICAgdGltZXItLTtcbiAgICAgICAgICB0YXJnZXQudGV4dENvbnRlbnQgPSBgVW5kby4uLiAke3RpbWVyfWA7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGFyZ2V0LnRleHRDb250ZW50ID0gXCJEZWxldGluZ1wiO1xuICAgICAgICB0YXJnZXQuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICBhd2FpdCB0aGlzLmRlbGV0ZURvYygpO1xuICAgICAgICB0aGlzLmNsb3NlSGFuZGxlcigpO1xuICAgICAgICBjbGVhckludGVydmFsKHRoaXMuYWN0aXZlVGltZXIpO1xuICAgICAgfSwgMTAwMCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGFzeW5jIGRlbGV0ZURvYygpIHt9XG59XG4iLCJpbXBvcnQgYXhpb3MgZnJvbSBcImF4aW9zXCI7XG5cbmltcG9ydCBNb2RhbCBmcm9tIFwiLi9Nb2RhbFwiO1xuaW1wb3J0IE9yZGVyIGZyb20gXCIuLi90eXBlcy9PcmRlclwiO1xuaW1wb3J0IGZvcm1hdERhdGUgZnJvbSBcIi4uL2hlbHBlcnMvZm9ybWF0RGF0ZVwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPcmRlck1vZGFsIGV4dGVuZHMgTW9kYWwge1xuICBjb25zdHJ1Y3RvcihvcmRlcklkOiBzdHJpbmcpIHtcbiAgICBzdXBlcihcIk5ldyBPcmRlclwiKTtcblxuICAgIHRoaXMubG9hZChvcmRlcklkKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICBkb2N1bWVudFxuICAgICAgICAgIC5nZXRFbGVtZW50QnlJZChcInNldEFzRGVsaXZlcmVkXCIpXG4gICAgICAgICAgPy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5zZXRBc0RlbGl2ZXJlZEhhbmRsZXIuYmluZCh0aGlzKSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKChfKSA9PiB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0pO1xuICB9XG5cbiAgcHJvdGVjdGVkIGFzeW5jIGxvYWQob3JkZXJJZDogc3RyaW5nKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGF4aW9zKHtcbiAgICAgICAgdXJsOiBgL2FwaS92MS9vcmRlcnMvJHtvcmRlcklkfWAsXG4gICAgICAgIG1ldGhvZDogXCJHRVRcIixcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBvcmRlciA9IHJlcy5kYXRhLmRvYyBhcyBPcmRlcjtcblxuICAgICAgdGhpcy5yZW5kZXIoYFxuICAgICAgICA8ZGl2IGNsYXNzPVwib3JkZXItaW5mb19fZ3JvdXBcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwib3JkZXItaW5mb19fZ3JvdXAtdGl0bGVcIj5PcmRlciBJRDogPC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJvcmRlci1pbmZvX19ncm91cC1kZXRhaWxcIj4ke29yZGVyLl9pZH08L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwib3JkZXItaW5mb19fZ3JvdXBcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwib3JkZXItaW5mb19fZ3JvdXAtdGl0bGVcIj5Qcm9kdWN0OiA8L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm9yZGVyLWluZm9fX2dyb3VwLWRldGFpbFwiPiR7b3JkZXIucHJvZHVjdC5uYW1lfTwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJvcmRlci1pbmZvX19ncm91cFwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJvcmRlci1pbmZvX19ncm91cC10aXRsZVwiPkFtb3VudDogPC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJvcmRlci1pbmZvX19ncm91cC1kZXRhaWxcIj4gJHtcbiAgICAgICAgICAgICAgb3JkZXIuYW1vdW50ID09PSAwXG4gICAgICAgICAgICAgICAgPyAxXG4gICAgICAgICAgICAgICAgOiBg4oKsJHtvcmRlci5wcm9kdWN0LnByaWNlfSAmdGltZXM7ICR7b3JkZXIuYW1vdW50fWBcbiAgICAgICAgICAgIH08L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwib3JkZXItaW5mb19fZ3JvdXBcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwib3JkZXItaW5mb19fZ3JvdXAtdGl0bGVcIj5Ub3RhbDogPC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJvcmRlci1pbmZvX19ncm91cC1kZXRhaWxcIj5cbiAgICAgICAgICAgICAgJHtvcmRlci50b3RhbFByaWNlID09PSAwID8gXCJGUkVFXCIgOiBg4oKsJHtvcmRlci50b3RhbFByaWNlfWB9XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwib3JkZXItaW5mb19fZ3JvdXBcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwib3JkZXItaW5mb19fZ3JvdXAtdGl0bGVcIj5CdXllciBFbWFpbDogPC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJvcmRlci1pbmZvX19ncm91cC1kZXRhaWxcIj4ke29yZGVyLmJ1eWVyLmVtYWlsfTwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJvcmRlci1pbmZvX19ncm91cFwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJvcmRlci1pbmZvX19ncm91cC10aXRsZVwiPkRlbGl2ZXJ5IExvY2F0aW9uOiA8L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm9yZGVyLWluZm9fX2dyb3VwLWRldGFpbFwiPiR7b3JkZXIuYnV5ZXJMb2NhdGlvbn08L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwib3JkZXItaW5mb19fZ3JvdXBcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwib3JkZXItaW5mb19fZ3JvdXAtdGl0bGVcIj5EZWxpdmVyeSBUaW1lOiA8L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm9yZGVyLWluZm9fX2dyb3VwLWRldGFpbFwiPiR7XG4gICAgICAgICAgICAgIG9yZGVyLnByb2R1Y3QuZGVsaXZlcnlUaW1lXG4gICAgICAgICAgICB9IERheXM8L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwib3JkZXItaW5mb19fZ3JvdXBcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwib3JkZXItaW5mb19fZ3JvdXAtdGl0bGVcIj5TdWJtaXR0ZWQgQXQ6IDwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwib3JkZXItaW5mb19fZ3JvdXAtZGV0YWlsXCI+JHtmb3JtYXREYXRlKFxuICAgICAgICAgICAgICBvcmRlci5jcmVhdGVkQXRcbiAgICAgICAgICAgICl9PC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgJHtcbiAgICAgICAgICBvcmRlci5zdGF0ZSA9PT0gXCJkZWxpdmVyZWRcIlxuICAgICAgICAgICAgPyBgPGRpdiBjbGFzcz1cIm9yZGVyLWluZm9fX2dyb3VwXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJvcmRlci1pbmZvX19ncm91cC10aXRsZVwiPlN0YXR1czogPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwib3JkZXItaW5mb19fZ3JvdXAtZGV0YWlsXCI+JHtcbiAgICAgICAgICAgICAgICAgIG9yZGVyLnN0YXRlXG4gICAgICAgICAgICAgICAgfSBhdCAke2Zvcm1hdERhdGUob3JkZXIudXBkYXRlZEF0KX08L3NwYW4+XG4gICAgICAgICAgICA8L2Rpdj5gXG4gICAgICAgICAgICA6IFwiXCJcbiAgICAgICAgfVxuICAgICAgICAke1xuICAgICAgICAgIG9yZGVyLnN0YXRlID09PSBcInBlbmRpbmdcIlxuICAgICAgICAgICAgPyBgPGRpdiBjbGFzcz1cIm9yZGVyLWVkaXRfX2NvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgPGJ1dHRvbiBpZD1cInNldEFzRGVsaXZlcmVkXCIgZGF0YS1pZD1cIiR7b3JkZXIuX2lkfVwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCI+U2V0IGFzIGRlbGl2ZXJlZDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+YFxuICAgICAgICAgICAgOiBcIlwiXG4gICAgICAgIH1cbiAgICAgIGApO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgc2V0QXNEZWxpdmVyZWRIYW5kbGVyKGU6IEV2ZW50KSB7XG4gICAgdHJ5IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0IGFzIEhUTUxCdXR0b25FbGVtZW50O1xuICAgICAgdGFyZ2V0LnRleHRDb250ZW50ID0gXCJTZXR0aW5nXCI7XG4gICAgICB0YXJnZXQuZGlzYWJsZWQgPSB0cnVlO1xuXG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBheGlvcyh7XG4gICAgICAgIHVybDogYC9hcGkvdjEvb3JkZXJzLyR7dGFyZ2V0LmRhdGFzZXQuaWR9YCxcbiAgICAgICAgbWV0aG9kOiBcIlBBVENIXCIsXG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIHN0YXRlOiBcImRlbGl2ZXJlZFwiLFxuICAgICAgICB9LFxuICAgICAgfSk7XG5cbiAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG5cbiAgICAgIHRoaXMuY2xvc2VIYW5kbGVyKCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgdGhpcy5jbG9zZUhhbmRsZXIoKTtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIjtcblxuaW1wb3J0IE1vZGFsIGZyb20gXCIuL01vZGFsXCI7XG5pbXBvcnQgUHJvZHVjdCBmcm9tIFwiLi4vdHlwZXMvUHJvZHVjdFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPcmRlclByb2R1Y3RNb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgcHJpdmF0ZSBvcmRlclRvdGFsRWwhOiBIVE1MUGFyYWdyYXBoRWxlbWVudDtcbiAgcHJpdmF0ZSBwcmljZT86IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIG9yZGVyVHlwZTogc3RyaW5nLFxuICAgIHByb2R1Y3RJZDogc3RyaW5nLFxuICAgIHByaXZhdGUgcXVhbnRpdHk6IG51bWJlclxuICApIHtcbiAgICBzdXBlcihcIk5ldyBPcmRlclwiKTtcblxuICAgIHRoaXMubG9hZChwcm9kdWN0SWQpXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMub3JkZXJUb3RhbEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXG4gICAgICAgICAgXCJvcmRlclRvdGFsXCJcbiAgICAgICAgKSBhcyBIVE1MUGFyYWdyYXBoRWxlbWVudDtcblxuICAgICAgICBkb2N1bWVudFxuICAgICAgICAgIC5nZXRFbGVtZW50QnlJZChcIm1vZGFsT3JkZXJBbW91bnRcIilcbiAgICAgICAgICA/LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgICBcImNoYW5nZVwiLFxuICAgICAgICAgICAgdGhpcy5vcmRlckFtb3VudENoYW5nZUhhbmRsZXIuYmluZCh0aGlzKVxuICAgICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5mb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdWJtaXRPcmRlclwiKSBhcyBIVE1MRm9ybUVsZW1lbnQ7XG5cbiAgICAgICAgdGhpcy5mb3JtLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgXCJzdWJtaXRcIixcbiAgICAgICAgICB0aGlzLm9yZGVyU3VibWl0SGFuZGxlci5iaW5kKHRoaXMpXG4gICAgICAgICk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKChfKSA9PiB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0pO1xuICB9XG5cbiAgcHJvdGVjdGVkIGFzeW5jIGxvYWQocHJvZHVjdElkOiBzdHJpbmcpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzID0gYXdhaXQgYXhpb3Moe1xuICAgICAgICB1cmw6IGAvYXBpL3YxL3Byb2R1Y3RzLyR7cHJvZHVjdElkfWAsXG4gICAgICAgIG1ldGhvZDogXCJHRVRcIixcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBwcm9kdWN0ID0gcmVzLmRhdGEuZG9jIGFzIFByb2R1Y3Q7XG5cbiAgICAgIGlmICh0aGlzLm9yZGVyVHlwZSA9PT0gXCJGUkVFXCIpIHtcbiAgICAgICAgdGhpcy5yZW5kZXIoYFxuICAgICAgICAgIDxmb3JtIGlkPVwic3VibWl0T3JkZXJcIiBjbGFzcz1cIm9yZGVyLW1vZGFsXCIgZGF0YS1pZD1cIiR7cHJvZHVjdElkfVwiPlxuICAgICAgICAgICAgPGgzIGNsYXNzPVwib3JkZXItbW9kYWxfX3RpdGxlXCI+JHtwcm9kdWN0Lm5hbWV9PC9oMz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJvcmRlci1tb2RhbF9faW5mb1wiPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm9yZGVyLW1vZGFsX19zaW5nbGUtcHJpY2VcIj5GUkVFPC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1jb250cm9sXCI+XG4gICAgICAgICAgICAgICAgPGxhYmVsPkRlbGl2ZXJ5IExvY2F0aW9uICo8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIG5hbWU9XCJidXllckxvY2F0aW9uXCIgcGxhY2Vob2xkZXI9XCJQdXQgeW91ciBkZWxpdmVyeSBsb2NhdGlvbiBoZXJlLi4uXCIgcmVxdWlyZWQ+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWNvbnRyb2wgb3JkZXItbW9kYWxfX3RvdGFsXCI+XG4gICAgICAgICAgICAgIDxsYWJlbD5Ub3RhbCBQcmljZTwvbGFiZWw+XG4gICAgICAgICAgICAgIDxwIGlkPVwib3JkZXJUb3RhbFwiPkZSRUU8L3A+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cInN1Ym1pdFwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCI+T3JkZXIgTm93PC9idXR0b24+XG4gICAgICAgICAgPC9mb3JtPlxuICAgICAgICBgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnByaWNlID0gcHJvZHVjdC5wcmljZTtcblxuICAgICAgdGhpcy5yZW5kZXIoYFxuICAgICAgICA8Zm9ybSBpZD1cInN1Ym1pdE9yZGVyXCIgY2xhc3M9XCJvcmRlci1tb2RhbFwiIGRhdGEtaWQ9XCIke3Byb2R1Y3RJZH1cIj5cbiAgICAgICAgICA8aDMgY2xhc3M9XCJvcmRlci1tb2RhbF9fdGl0bGVcIj4ke3Byb2R1Y3QubmFtZX08L2gzPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJvcmRlci1tb2RhbF9faW5mb1wiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJvcmRlci1tb2RhbF9fc2luZ2xlLXByaWNlXCI+4oKsJHtwcm9kdWN0LnByaWNlfTwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwib3JkZXItbW9kYWxfX3NpbmdsZS1wcmljZVwiPiZ0aW1lczs8L3NwYW4+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1jb250cm9sIGZvcm0tY29udHJvbF9fbWluaSBvcmRlci1tb2RhbF9fYW1vdW50XCI+XG4gICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cIm9yZGVyQW1vdW50XCI+UXR5OjwvbGFiZWw+XG4gICAgICAgICAgICAgICAgPGlucHV0IGlkPVwibW9kYWxPcmRlckFtb3VudFwiIG5hbWU9XCJvcmRlckFtb3VudFwiIHR5cGU9XCJudW1iZXJcIiBtaW49XCIxXCIgdmFsdWU9XCIke1xuICAgICAgICAgICAgICAgICAgdGhpcy5xdWFudGl0eVxuICAgICAgICAgICAgICAgIH1cIiByZXF1aXJlZD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIj5cbiAgICAgICAgICAgICAgPGxhYmVsPkRlbGl2ZXJ5IExvY2F0aW9uICo8L2xhYmVsPlxuICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBuYW1lPVwiYnV5ZXJMb2NhdGlvblwiIHBsYWNlaG9sZGVyPVwiUHV0IHlvdXIgZGVsaXZlcnkgbG9jYXRpb24gaGVyZS4uLlwiIHJlcXVpcmVkPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWNvbnRyb2wgb3JkZXItbW9kYWxfX3RvdGFsXCI+XG4gICAgICAgICAgICA8bGFiZWw+VG90YWwgUHJpY2U8L2xhYmVsPlxuICAgICAgICAgICAgPHAgaWQ9XCJvcmRlclRvdGFsXCI+4oKsJHtwcm9kdWN0LnByaWNlICogdGhpcy5xdWFudGl0eX08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIj5PcmRlciBOb3c8L2J1dHRvbj5cbiAgICAgICAgPC9mb3JtPlxuICAgIGApO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgb3JkZXJBbW91bnRDaGFuZ2VIYW5kbGVyKGU6IEV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLnByaWNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICB0aGlzLm9yZGVyVG90YWxFbC50ZXh0Q29udGVudCA9IGDigqwke3RoaXMucHJpY2UhICogK3RhcmdldC52YWx1ZX1gO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBvcmRlclN1Ym1pdEhhbmRsZXIoZTogRXZlbnQpIHtcbiAgICB0cnkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICBjb25zdCBhbW91bnRJbnB1dCA9IHRoaXMuZm9ybSEucXVlcnlTZWxlY3RvcihcbiAgICAgICAgYGlucHV0W25hbWU9XCJvcmRlckFtb3VudFwiXWBcbiAgICAgICkgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICAgIGNvbnN0IGJ1eWVyTG9jYXRpb25JbnB1dCA9IHRoaXMuZm9ybSEucXVlcnlTZWxlY3RvcihcbiAgICAgICAgYGlucHV0W25hbWU9XCJidXllckxvY2F0aW9uXCJdYFxuICAgICAgKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgICAgY29uc3Qgc3VibWl0QnRuID0gdGhpcy5mb3JtIS5xdWVyeVNlbGVjdG9yKFxuICAgICAgICBgYnV0dG9uW3R5cGU9XCJzdWJtaXRcIl1gXG4gICAgICApISBhcyBIVE1MQnV0dG9uRWxlbWVudDtcblxuICAgICAgc3VibWl0QnRuLnRleHRDb250ZW50ID0gXCJPcmRlcmluZ1wiO1xuICAgICAgc3VibWl0QnRuLmRpc2FibGVkID0gdHJ1ZTtcblxuICAgICAgYXdhaXQgYXhpb3Moe1xuICAgICAgICB1cmw6IGAvYXBpL3YxL29yZGVycyR7dGhpcy5vcmRlclR5cGUgPT09IFwiRlJFRVwiID8gXCI/dHlwZT1mcmVlXCIgOiBcIlwifWAsXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIHByb2R1Y3Q6IHRoaXMuZm9ybT8uZGF0YXNldC5pZCxcbiAgICAgICAgICBidXllckxvY2F0aW9uOiBidXllckxvY2F0aW9uSW5wdXQudmFsdWUsXG4gICAgICAgICAgYW1vdW50OiArYW1vdW50SW5wdXQ/LnZhbHVlIHx8IDAsXG4gICAgICAgICAgdG90YWxQcmljZTpcbiAgICAgICAgICAgICgrYW1vdW50SW5wdXQ/LnZhbHVlICYmIHRoaXMucHJpY2UhICogK2Ftb3VudElucHV0Py52YWx1ZSkgfHwgMCxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmNsb3NlSGFuZGxlcigpO1xuICAgICAgbG9jYXRpb24uaHJlZiA9IFwiL29yZGVyc1wiO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgIHRoaXMuY2xvc2VIYW5kbGVyKCk7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgYXhpb3MgZnJvbSBcImF4aW9zXCI7XG5cbmltcG9ydCBNb2RhbCBmcm9tIFwiLi9Nb2RhbFwiO1xuaW1wb3J0IFN0b3JlIGZyb20gXCIuLi90eXBlcy9TdG9yZVwiO1xuaW1wb3J0IFByb2R1Y3QgZnJvbSBcIi4uL3R5cGVzL1Byb2R1Y3RcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJvZHVjdE1vZGFsIGV4dGVuZHMgTW9kYWwge1xuICBwcml2YXRlIHNlbGVjdCE6IEhUTUxTZWxlY3RFbGVtZW50O1xuICBwcml2YXRlIHBob3RvSW5wdXRzITogSFRNTERpdkVsZW1lbnQ7XG4gIHByaXZhdGUgcGhvdG9OdW1iZXIgPSAxO1xuXG4gIGNvbnN0cnVjdG9yKHByb2R1Y3RJZD86IHN0cmluZykge1xuICAgIHN1cGVyKFwiTmV3IFByb2R1Y3RcIiwgcHJvZHVjdElkID8gXCJFRElUQUJMRVwiIDogXCJDUkVBVEFCTEVcIik7XG5cbiAgICB0aGlzLmxvYWQocHJvZHVjdElkKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLmZvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLm1vZGFsLWZvcm1cIikgYXMgSFRNTEZvcm1FbGVtZW50O1xuICAgICAgICB0aGlzLnNlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxuICAgICAgICAgIFwic3RvcmVTZWxlY3RcIlxuICAgICAgICApIGFzIEhUTUxTZWxlY3RFbGVtZW50O1xuICAgICAgICB0aGlzLnBob3RvSW5wdXRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXG4gICAgICAgICAgXCJwaG90b0lucHV0c1wiXG4gICAgICAgICkgYXMgSFRNTERpdkVsZW1lbnQ7XG5cbiAgICAgICAgdGhpcy5zZWxlY3RDaGFuZ2VIYW5kbGVyKCk7XG5cbiAgICAgICAgdGhpcy5zZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICBcImNoYW5nZVwiLFxuICAgICAgICAgIHRoaXMuc2VsZWN0Q2hhbmdlSGFuZGxlci5iaW5kKHRoaXMpXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuZm9ybS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIHRoaXMuc3VibWl0SGFuZGxlci5iaW5kKHRoaXMpKTtcbiAgICAgICAgZG9jdW1lbnRcbiAgICAgICAgICAuZ2V0RWxlbWVudEJ5SWQoXCJhZGRQaG90b1wiKSFcbiAgICAgICAgICAuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuYWRkUGhvdG9IYW5kbGVyLmJpbmQodGhpcykpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoXykgPT4ge1xuICAgICAgICByZXR1cm47XG4gICAgICB9KTtcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBsb2FkKHByb2R1Y3RJZD86IHN0cmluZykge1xuICAgIHRyeSB7XG4gICAgICBsZXQgYnV0dG9ucztcbiAgICAgIGxldCBzdG9yZVZhbHVlID0gXCJcIjtcbiAgICAgIGxldCBuYW1lVmFsdWUgPSBcIlwiO1xuICAgICAgbGV0IGRlc2NyaXB0aW9uVmFsdWUgPSBcIlwiO1xuICAgICAgbGV0IHBob3Rvc1ZhbHVlID0gW1wiXCJdO1xuICAgICAgbGV0IHByaWNlVmFsdWUgPSAwO1xuICAgICAgbGV0IGRlbGl2ZXJ5VmFsdWUgPSAwO1xuICAgICAgbGV0IGF2YWlsYWJpbGl0eVZhbHVlID0gXCJcIjtcbiAgICAgIGxldCBmaWRQb2ludHNWYWx1ZSA9IDA7XG4gICAgICBpZiAocHJvZHVjdElkKSB7XG4gICAgICAgIGJ1dHRvbnMgPSBgXG4gICAgICAgIDxidXR0b24gdHlwZT1cInN1Ym1pdFwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCI+RWRpdDwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBpZD1cImRlbGV0ZURvY1wiIGNsYXNzPVwiYnRuIGJ0bi1kYW5nZXJcIj5EZWxldGU8L2J1dHRvbj5cbiAgICAgIGA7XG4gICAgICAgIGNvbnN0IHsgZGF0YSB9ID0gYXdhaXQgYXhpb3Moe1xuICAgICAgICAgIHVybDogYC9hcGkvdjEvcHJvZHVjdHMvJHtwcm9kdWN0SWR9YCxcbiAgICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGRvYyA9IGRhdGEuZG9jIGFzIFByb2R1Y3Q7XG5cbiAgICAgICAgc3RvcmVWYWx1ZSA9IGRvYy5zdG9yZS5faWQ7XG4gICAgICAgIG5hbWVWYWx1ZSA9IGRvYy5uYW1lO1xuICAgICAgICBkZXNjcmlwdGlvblZhbHVlID0gZG9jLmRlc2NyaXB0aW9uO1xuICAgICAgICBwaG90b3NWYWx1ZSA9IGRvYy5waG90b3M7XG4gICAgICAgIHByaWNlVmFsdWUgPSBkb2MucHJpY2U7XG4gICAgICAgIGRlbGl2ZXJ5VmFsdWUgPSBkb2MuZGVsaXZlcnlUaW1lO1xuICAgICAgICBhdmFpbGFiaWxpdHlWYWx1ZSA9IGRvYy5hdmFpbGFiaWxpdHk7XG4gICAgICAgIGZpZFBvaW50c1ZhbHVlID0gZG9jLmZpZFBvaW50cztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJ1dHRvbnMgPSBgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIj5TdWJtaXQ8L2J1dHRvbj5gO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzdG9yZXNSZXMgPSBhd2FpdCBheGlvcyh7XG4gICAgICAgIHVybDogXCIvYXBpL3YxL3N0b3Jlc1wiLFxuICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICAgIHBhcmFtczoge1xuICAgICAgICAgIGFsbDogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBzdG9yZXNEYXRhID0gc3RvcmVzUmVzLmRhdGEuZGF0YSBhcyBbU3RvcmVdO1xuXG4gICAgICBpZiAoIXN0b3Jlc0RhdGEubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMucmVuZGVyKFxuICAgICAgICAgIGBcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1lcnJvclwiPlxuICAgICAgICAgICAgICA8aDM+Tm8gc3RvcmUgd2FzIGNyZWF0ZWQhPC9oMz5cbiAgICAgICAgICAgICAgPGVtPihQbGVhc2UgY3JlYXRlIGEgc3RvcmUgZmlyc3QpPC9lbT5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIGBcbiAgICAgICAgKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ0FOQ0VMXCIpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnJlbmRlcihgXG4gICAgICAgIDxmb3JtIGNsYXNzPVwibW9kYWwtZm9ybVwiIGRhdGEtaWQ9XCIke3Byb2R1Y3RJZCB8fCBcIlwifVwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIj5cbiAgICAgICAgICAgIDxsYWJlbD5TdG9yZTwvbGFiZWw+XG4gICAgICAgICAgICAgIDxzZWxlY3QgaWQ9XCJzdG9yZVNlbGVjdFwiIG5hbWU9XCJzdG9yZVwiPlxuICAgICAgICAgICAgICAgICR7c3RvcmVzRGF0YVxuICAgICAgICAgICAgICAgICAgPy5tYXAoKHN0b3JlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICAgICAgICAgIDxvcHRpb25cbiAgICAgICAgICAgICAgICAgICAgZGF0YS1pZD1cIiR7c3RvcmUuX2lkfVwiXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPVwiJHtzdG9yZS5uYW1lfVwiXG4gICAgICAgICAgICAgICAgICAgICR7c3RvcmUuX2lkID09PSBzdG9yZVZhbHVlID8gXCJzZWxlY3RlZFwiIDogXCJcIn0+XG4gICAgICAgICAgICAgICAgICAgICAgJHtzdG9yZS5uYW1lfVxuICAgICAgICAgICAgICAgICAgICA8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgIGA7XG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgLmpvaW4oXCJcIil9XG4gICAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIj5cbiAgICAgICAgICAgICAgPGxhYmVsPlByb2R1Y3QgTmFtZTwvbGFiZWw+XG4gICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIG5hbWU9XCJuYW1lXCIgdmFsdWU9XCIke1xuICAgICAgICAgICAgICAgIG5hbWVWYWx1ZSB8fCBcIlwiXG4gICAgICAgICAgICAgIH1cIiBwbGFjZWhvbGRlcj1cIlB1dCB0aGUgbmFtZSBoZXJlLi4uXCI+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tY29udHJvbFwiPlxuICAgICAgICAgICAgICA8bGFiZWw+UHJvZHVjdCBEZXNjcmlwdGlvbjwvbGFiZWw+XG4gICAgICAgICAgICAgIDx0ZXh0YXJlYSBcbiAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgIG5hbWU9XCJkZXNjcmlwdGlvblwiXG4gICAgICAgICAgICAgICByb3dzPVwiNlwiXG4gICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlB1dCB0aGUgZGVzY3JpcHRpb24gaGVyZS4uLlwiXG4gICAgICAgICAgICAgID4ke2Rlc2NyaXB0aW9uVmFsdWUgfHwgXCJcIn08L3RleHRhcmVhPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIj5cbiAgICAgICAgICAgICAgPGxhYmVsPlByb2R1Y3QgUGhvdG88L2xhYmVsPlxuICAgICAgICAgICAgICAgIDxkaXYgaWQ9XCJwaG90b0lucHV0c1wiPlxuICAgICAgICAgICAgICAgICAgJHtcbiAgICAgICAgICAgICAgICAgICAgcGhvdG9zVmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAubWFwKChwaG90b1ZhbHVlLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYFxuICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCBcbiAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgdmFsdWU9XCIke3Bob3RvVmFsdWV9XCJcbiAgICAgICAgICAgICAgICAgICAgICBuYW1lPVwicGhvdG8ke2kgKyAxfVwiXG4gICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJQdXQgdGhlIHBob3RvIHVybCBoZXJlLi4uXCJcbiAgICAgICAgICAgICAgICAgICAgICAke2kgPT09IDAgPyBcInJlcXVpcmVkXCIgOiBcIlwifVxuICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgYDtcbiAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgIC5qb2luKFwiXCIpIHx8XG4gICAgICAgICAgICAgICAgICAgIGA8aW5wdXQgXG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgbmFtZT1cInBob3RvMVwiXG4gICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiUHV0IHRoZSBwaG90byB1cmwgaGVyZS4uLlwiXG4gICAgICAgICAgICAgICAgICAgID5gXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiIGlkPVwiYWRkUGhvdG9cIj5OZXcgUGhvdG88L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1jb250cm9sXCI+XG4gICAgICAgICAgICAgIDxsYWJlbD5Qcm9kdWN0IFByaWNlPC9sYWJlbD5cbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgIG5hbWU9XCJwcmljZVwiXG4gICAgICAgICAgICAgICB2YWx1ZT1cIiR7cHJpY2VWYWx1ZX1cIlxuICAgICAgICAgICAgICAgc3RlcD1cIi4wMVwiXG4gICAgICAgICAgICAgICBtaW49XCIxXCJcbiAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiUHV0IHRoZSBwcmljZSB3aXRoIGV1cm9zIGhlcmUuLi5cIlxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tY29udHJvbFwiPlxuICAgICAgICAgICAgICA8bGFiZWw+UHJvZHVjdCBEZWxpdmVyeSBUaW1lPC9sYWJlbD5cbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgIG5hbWU9XCJkZWxpdmVyeVwiXG4gICAgICAgICAgICAgICB2YWx1ZT1cIiR7ZGVsaXZlcnlWYWx1ZX1cIlxuICAgICAgICAgICAgICAgbWluPVwiMVwiXG4gICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlB1dCB0aGUgZGVsaXZlcnkgdGltZSBoZXJlIGFzIG51bWJlciBvZiBkYXlzLi4uXCJcbiAgICAgICAgICAgICAgPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgaWQ9XCJhdmFpbGFiaWxpdHlDaGVja1wiIGNsYXNzPVwiZm9ybS1jb250cm9sXCI+XG4gICAgICAgICAgICAgIDxsYWJlbD5BdmFpbGFiaWxpdHk8L2xhYmVsPlxuICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicmFkaW9cIiBpZD1cImluU3RvY2tcIiBuYW1lPVwiYXZhaWxhYmlsaXR5XCIgdmFsdWU9XCJJbiBTdG9ja1wiICR7XG4gICAgICAgICAgICAgICAgICBhdmFpbGFiaWxpdHlWYWx1ZSA9PT0gXCJPdXQgb2YgU3RvY2tcIiA/IFwiXCIgOiBcImNoZWNrZWRcIlxuICAgICAgICAgICAgICAgIH0+XG4gICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwicmFkaW8tbGFiZWxcIiBmb3I9XCJpblN0b2NrXCI+SW4gU3RvY2s8L2xhYmVsPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInJhZGlvXCIgaWQ9XCJvdXRPZlN0b2NrXCIgbmFtZT1cImF2YWlsYWJpbGl0eVwiIHZhbHVlPVwiT3V0IG9mIFN0b2NrXCIgJHtcbiAgICAgICAgICAgICAgICAgIGF2YWlsYWJpbGl0eVZhbHVlID09PSBcIk91dCBvZiBTdG9ja1wiID8gXCJjaGVja2VkXCIgOiBcIlwiXG4gICAgICAgICAgICAgICAgfT5cbiAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJyYWRpby1sYWJlbFwiIGZvcj1cIm91dE9mU3RvY2tcIj5PdXQgb2YgU3RvY2s8L2xhYmVsPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1jb250cm9sXCI+XG4gICAgICAgICAgICAgIDxsYWJlbD5Qcm9kdWN0IEZpZCBQb2ludHM8L2xhYmVsPlxuICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cIm51bWJlclwiIG5hbWU9XCJmaWRQb2ludHNcIiB2YWx1ZT1cIiR7XG4gICAgICAgICAgICAgICAgZmlkUG9pbnRzVmFsdWUgfHwgXCJcIlxuICAgICAgICAgICAgICB9XCIgcGxhY2Vob2xkZXI9XCJQdXQgdGhlIGZpZCBwb2ludHMgaGVyZS4uLlwiPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLXN1Ym1pdFwiPlxuICAgICAgICAgICAgICAke2J1dHRvbnN9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZm9ybT5cbiAgICBgKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNlbGVjdENoYW5nZUhhbmRsZXIoKSB7XG4gICAgbGV0IHNlbGVjdGVkT3B0aW9uID0gdGhpcy5zZWxlY3Qub3B0aW9uc1t0aGlzLnNlbGVjdC5zZWxlY3RlZEluZGV4XTtcbiAgICBpZiAoIXNlbGVjdGVkT3B0aW9uKSB7XG4gICAgICB0aGlzLnNlbGVjdC5vcHRpb25zWzBdLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgIHNlbGVjdGVkT3B0aW9uID0gdGhpcy5zZWxlY3Qub3B0aW9uc1swXTtcbiAgICB9XG4gICAgdGhpcy5zZWxlY3QuZGF0YXNldC5pZCA9IHNlbGVjdGVkT3B0aW9uLmRhdGFzZXQuaWQ7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHN1Ym1pdEhhbmRsZXIoZTogRXZlbnQpIHtcbiAgICB0cnkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICBjb25zdCBzdG9yZUlucHV0ID0gdGhpcy5mb3JtIS5xdWVyeVNlbGVjdG9yKFxuICAgICAgICBgc2VsZWN0W25hbWU9XCJzdG9yZVwiXWBcbiAgICAgICkgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICAgIGNvbnN0IG5hbWVJbnB1dCA9IHRoaXMuZm9ybSEucXVlcnlTZWxlY3RvcihcbiAgICAgICAgYGlucHV0W25hbWU9XCJuYW1lXCJdYFxuICAgICAgKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgICAgY29uc3QgZGVzY3JpcHRpb25JbnB1dCA9IHRoaXMuZm9ybSEucXVlcnlTZWxlY3RvcihcbiAgICAgICAgYHRleHRhcmVhW25hbWU9XCJkZXNjcmlwdGlvblwiXWBcbiAgICAgICkgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICAgIGNvbnN0IHBob3RvSW5wdXRzID0gQXJyYXkuZnJvbShcbiAgICAgICAgdGhpcy5waG90b0lucHV0cy5xdWVyeVNlbGVjdG9yQWxsKFwiaW5wdXRcIilcbiAgICAgICk7XG4gICAgICBjb25zdCBwcmljZUlucHV0ID0gdGhpcy5mb3JtIS5xdWVyeVNlbGVjdG9yKFxuICAgICAgICBgaW5wdXRbbmFtZT1cInByaWNlXCJdYFxuICAgICAgKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgICAgY29uc3QgZGVsaXZlcnlJbnB1dCA9IHRoaXMuZm9ybSEucXVlcnlTZWxlY3RvcihcbiAgICAgICAgYGlucHV0W25hbWU9XCJkZWxpdmVyeVwiXWBcbiAgICAgICkgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICAgIGNvbnN0IGZpZFBvaW50c0lucHV0ID0gdGhpcy5mb3JtIS5xdWVyeVNlbGVjdG9yKFxuICAgICAgICBgaW5wdXRbbmFtZT1cImZpZFBvaW50c1wiXWBcbiAgICAgICkgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICAgIGNvbnN0IGluU3RvY2tJbnB1dCA9IHRoaXMuZm9ybSEucXVlcnlTZWxlY3RvcihcbiAgICAgICAgYGlucHV0W2lkPVwiaW5TdG9ja1wiXWBcbiAgICAgICkgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICAgIGNvbnN0IHN1Ym1pdEJ0biA9IHRoaXMuZm9ybSEucXVlcnlTZWxlY3RvcihcbiAgICAgICAgYGJ1dHRvblt0eXBlPVwic3VibWl0XCJdYFxuICAgICAgKSEgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG5cbiAgICAgIHN1Ym1pdEJ0bi50ZXh0Q29udGVudCA9IFwiU3VibWl0dGluZ1wiO1xuICAgICAgc3VibWl0QnRuLmRpc2FibGVkID0gdHJ1ZTtcblxuICAgICAgY29uc3QgcHJvZHVjdElkID0gdGhpcy5mb3JtPy5kYXRhc2V0LmlkO1xuICAgICAgYXdhaXQgYXhpb3Moe1xuICAgICAgICB1cmw6XG4gICAgICAgICAgdGhpcy50eXBlID09PSBcIkNSRUFUQUJMRVwiXG4gICAgICAgICAgICA/IFwiL2FwaS92MS9wcm9kdWN0c1wiXG4gICAgICAgICAgICA6IGAvYXBpL3YxL3Byb2R1Y3RzLyR7cHJvZHVjdElkfWAsXG4gICAgICAgIG1ldGhvZDogdGhpcy50eXBlID09PSBcIkNSRUFUQUJMRVwiID8gXCJQT1NUXCIgOiBcIlBBVENIXCIsXG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIHN0b3JlOiBzdG9yZUlucHV0LmRhdGFzZXQuaWQsXG4gICAgICAgICAgbmFtZTogbmFtZUlucHV0LnZhbHVlLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvbklucHV0LnZhbHVlLnRyaW0oKSxcbiAgICAgICAgICBwaG90b3M6IHBob3RvSW5wdXRzXG4gICAgICAgICAgICAuZmlsdGVyKChpbnB1dCkgPT4gaW5wdXQudmFsdWUgIT09IFwiXCIpXG4gICAgICAgICAgICAubWFwKChpbnB1dCkgPT4gaW5wdXQudmFsdWUpLFxuICAgICAgICAgIHByaWNlOiArcHJpY2VJbnB1dC52YWx1ZSxcbiAgICAgICAgICBkZWxpdmVyeVRpbWU6ICtkZWxpdmVyeUlucHV0LnZhbHVlLFxuICAgICAgICAgIGZpZFBvaW50czogK2ZpZFBvaW50c0lucHV0LnZhbHVlLFxuICAgICAgICAgIGF2YWlsYWJpbGl0eTogaW5TdG9ja0lucHV0LmNoZWNrZWQgPyBcIkluIFN0b2NrXCIgOiBcIk91dCBvZiBTdG9ja1wiLFxuICAgICAgICB9LFxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuY2xvc2VIYW5kbGVyKCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgdGhpcy5jbG9zZUhhbmRsZXIoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFkZFBob3RvSGFuZGxlcihlOiBFdmVudCkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBjb25zdCBwcmV2SW5wdXQgPSB0aGlzLnBob3RvSW5wdXRzLmxhc3RFbGVtZW50Q2hpbGQhIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgaWYgKCFwcmV2SW5wdXQ/LnZhbHVlIHx8ICFwcmV2SW5wdXQ/LnZhbHVlLnRyaW0oKSkge1xuICAgICAgcHJldklucHV0LmZvY3VzKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgICsrdGhpcy5waG90b051bWJlcjtcbiAgICBjb25zdCBwaG90b0lucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuICAgIHBob3RvSW5wdXQudHlwZSA9IFwidGV4dFwiO1xuICAgIHBob3RvSW5wdXQubmFtZSA9IGBwaG90byR7dGhpcy5waG90b051bWJlcn1gO1xuICAgIHBob3RvSW5wdXQucGxhY2Vob2xkZXIgPSBcIlB1dCB0aGUgcGhvdG8gdXJsIGhlcmUuLi5cIjtcblxuICAgIHRoaXMucGhvdG9JbnB1dHMuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KFwiYmVmb3JlZW5kXCIsIHBob3RvSW5wdXQpO1xuICB9XG5cbiAgcHJvdGVjdGVkIG92ZXJyaWRlIGFzeW5jIGRlbGV0ZURvYygpIHtcbiAgICBhd2FpdCBheGlvcyh7XG4gICAgICB1cmw6IGAvYXBpL3YxL3Byb2R1Y3RzLyR7dGhpcy5mb3JtPy5kYXRhc2V0LmlkfWAsXG4gICAgICBtZXRob2Q6IFwiREVMRVRFXCIsXG4gICAgfSk7XG4gIH1cbn1cbiIsImltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIjtcblxuaW1wb3J0IE1vZGFsIGZyb20gXCIuL01vZGFsXCI7XG5pbXBvcnQgUmV3YXJkIGZyb20gXCIuLi90eXBlcy9SZXdhcmRcIjtcbmltcG9ydCBQcm9kdWN0IGZyb20gXCIuLi90eXBlcy9Qcm9kdWN0XCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJld2FyZE1vZGFsIGV4dGVuZHMgTW9kYWwge1xuICBwcml2YXRlIHNlbGVjdCE6IEhUTUxTZWxlY3RFbGVtZW50O1xuXG4gIGNvbnN0cnVjdG9yKHJld2FyZElkPzogc3RyaW5nKSB7XG4gICAgc3VwZXIoXCJOZXcgUmV3YXJkXCIsIHJld2FyZElkID8gXCJFRElUQUJMRVwiIDogXCJDUkVBVEFCTEVcIik7XG5cbiAgICB0aGlzLmxvYWQocmV3YXJkSWQpXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMuZm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubW9kYWwtZm9ybVwiKSBhcyBIVE1MRm9ybUVsZW1lbnQ7XG4gICAgICAgIHRoaXMuc2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXG4gICAgICAgICAgXCJwcm9kdWN0U2VsZWN0XCJcbiAgICAgICAgKSBhcyBIVE1MU2VsZWN0RWxlbWVudDtcblxuICAgICAgICB0aGlzLnNlbGVjdENoYW5nZUhhbmRsZXIoKTtcblxuICAgICAgICB0aGlzLnNlbGVjdC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgIFwiY2hhbmdlXCIsXG4gICAgICAgICAgdGhpcy5zZWxlY3RDaGFuZ2VIYW5kbGVyLmJpbmQodGhpcylcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5mb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgdGhpcy5zdWJtaXRIYW5kbGVyLmJpbmQodGhpcykpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoXykgPT4ge1xuICAgICAgICByZXR1cm47XG4gICAgICB9KTtcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBsb2FkKHJld2FyZElkPzogc3RyaW5nKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBidXR0b25zO1xuICAgICAgbGV0IHByb2R1Y3RWYWx1ZSA9IFwiXCI7XG4gICAgICBsZXQgZmlkUG9pbnRzVmFsdWUgPSAwO1xuICAgICAgaWYgKHJld2FyZElkKSB7XG4gICAgICAgIGJ1dHRvbnMgPSBgXG4gICAgICAgIDxidXR0b24gdHlwZT1cInN1Ym1pdFwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCI+RWRpdDwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBpZD1cImRlbGV0ZURvY1wiIGNsYXNzPVwiYnRuIGJ0bi1kYW5nZXJcIj5EZWxldGU8L2J1dHRvbj5cbiAgICAgIGA7XG4gICAgICAgIGNvbnN0IHsgZGF0YSB9ID0gYXdhaXQgYXhpb3Moe1xuICAgICAgICAgIHVybDogYC9hcGkvdjEvcmV3YXJkcy8ke3Jld2FyZElkfWAsXG4gICAgICAgICAgbWV0aG9kOiBcIkdFVFwiLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBkb2MgPSBkYXRhLmRvYyBhcyBSZXdhcmQ7XG5cbiAgICAgICAgcHJvZHVjdFZhbHVlID0gZG9jLnByb2R1Y3QuX2lkO1xuICAgICAgICBmaWRQb2ludHNWYWx1ZSA9IGRvYy5yZXF1aXJlZFBvaW50cztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJ1dHRvbnMgPSBgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIj5TdWJtaXQ8L2J1dHRvbj5gO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwcm9kdWN0c1JlcyA9IGF3YWl0IGF4aW9zKHtcbiAgICAgICAgdXJsOiBcIi9hcGkvdjEvcHJvZHVjdHNcIixcbiAgICAgICAgbWV0aG9kOiBcIkdFVFwiLFxuICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICBhbGw6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICB9KTtcblxuICAgICAgY29uc3QgcHJvZHVjdHNEYXRhID0gcHJvZHVjdHNSZXMuZGF0YS5kYXRhIGFzIFtQcm9kdWN0XTtcblxuICAgICAgaWYgKCFwcm9kdWN0c0RhdGEubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMucmVuZGVyKFxuICAgICAgICAgIGBcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1lcnJvclwiPlxuICAgICAgICAgICAgICA8aDM+Tm8gcHJvZHVjdCB3YXMgY3JlYXRlZCE8L2gzPlxuICAgICAgICAgICAgICA8ZW0+KFBsZWFzZSBjcmVhdGUgYSBwcm9kdWN0IGZpcnN0KTwvZW0+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICBgXG4gICAgICAgICk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNBTkNFTFwiKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5yZW5kZXIoYFxuICAgICAgICA8Zm9ybSBjbGFzcz1cIm1vZGFsLWZvcm1cIiBkYXRhLWlkPVwiJHtyZXdhcmRJZCB8fCBcIlwifVwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIj5cbiAgICAgICAgICAgICAgPGxhYmVsPlByb2R1Y3QgVG8gQmUgUmV3YXJkZWQ8L2xhYmVsPlxuICAgICAgICAgICAgICA8c2VsZWN0IG5hbWU9XCJwcm9kdWN0XCIgaWQ9XCJwcm9kdWN0U2VsZWN0XCI+XG4gICAgICAgICAgICAgICAgJHtwcm9kdWN0c0RhdGFcbiAgICAgICAgICAgICAgICAgID8ubWFwKChwcm9kdWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICAgICAgICAgIDxvcHRpb25cbiAgICAgICAgICAgICAgICAgICAgZGF0YS1pZD1cIiR7cHJvZHVjdC5faWR9XCJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9XCIke3Byb2R1Y3QubmFtZX1cIlxuICAgICAgICAgICAgICAgICAgICAke3Byb2R1Y3QuX2lkID09PSBwcm9kdWN0VmFsdWUgPyBcInNlbGVjdGVkXCIgOiBcIlwifT5cbiAgICAgICAgICAgICAgICAgICAgICAke3Byb2R1Y3QubmFtZX1cbiAgICAgICAgICAgICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICBgO1xuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgIC5qb2luKFwiXCIpfVxuICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1jb250cm9sXCI+XG4gICAgICAgICAgICAgIDxsYWJlbD5SZXF1aXJlZCBGaWQgUG9pbnRzPC9sYWJlbD5cbiAgICAgICAgICAgICAgPGlucHV0IFxuICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICBuYW1lPVwiZmlkUG9pbnRzXCJcbiAgICAgICAgICAgICAgIHZhbHVlPVwiJHtmaWRQb2ludHNWYWx1ZSB8fCBcIlwifVwiXG4gICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlB1dCB0aGUgcmVxdWlyZWQgZmlkIHBvaW50cyBoZXJlLi4uXCI+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tc3VibWl0XCI+XG4gICAgICAgICAgICAgICR7YnV0dG9uc31cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9mb3JtPlxuICAgIGApO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc2VsZWN0Q2hhbmdlSGFuZGxlcigpIHtcbiAgICBsZXQgc2VsZWN0ZWRPcHRpb24gPSB0aGlzLnNlbGVjdC5vcHRpb25zW3RoaXMuc2VsZWN0LnNlbGVjdGVkSW5kZXhdO1xuICAgIGlmICghc2VsZWN0ZWRPcHRpb24pIHtcbiAgICAgIHRoaXMuc2VsZWN0Lm9wdGlvbnNbMF0uc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgc2VsZWN0ZWRPcHRpb24gPSB0aGlzLnNlbGVjdC5vcHRpb25zWzBdO1xuICAgIH1cbiAgICB0aGlzLnNlbGVjdC5kYXRhc2V0LmlkID0gc2VsZWN0ZWRPcHRpb24uZGF0YXNldC5pZDtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgc3VibWl0SGFuZGxlcihlOiBFdmVudCkge1xuICAgIHRyeSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIGNvbnN0IHByb2R1Y3RJbnB1dCA9IHRoaXMuZm9ybSEucXVlcnlTZWxlY3RvcihcbiAgICAgICAgYHNlbGVjdFtuYW1lPVwicHJvZHVjdFwiXWBcbiAgICAgICkgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICAgIGNvbnN0IGZpZFBvaW50c0lucHV0ID0gdGhpcy5mb3JtIS5xdWVyeVNlbGVjdG9yKFxuICAgICAgICBgaW5wdXRbbmFtZT1cImZpZFBvaW50c1wiXWBcbiAgICAgICkgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICAgIGNvbnN0IHN1Ym1pdEJ0biA9IHRoaXMuZm9ybSEucXVlcnlTZWxlY3RvcihcbiAgICAgICAgYGJ1dHRvblt0eXBlPVwic3VibWl0XCJdYFxuICAgICAgKSEgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG5cbiAgICAgIHN1Ym1pdEJ0bi50ZXh0Q29udGVudCA9IFwiU3VibWl0dGluZ1wiO1xuICAgICAgc3VibWl0QnRuLmRpc2FibGVkID0gdHJ1ZTtcblxuICAgICAgY29uc3QgcmV3YXJkSWQgPSB0aGlzLmZvcm0/LmRhdGFzZXQuaWQ7XG5cbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGF4aW9zKHtcbiAgICAgICAgdXJsOlxuICAgICAgICAgIHRoaXMudHlwZSA9PT0gXCJDUkVBVEFCTEVcIlxuICAgICAgICAgICAgPyBcIi9hcGkvdjEvcmV3YXJkc1wiXG4gICAgICAgICAgICA6IGAvYXBpL3YxL3Jld2FyZHMvJHtyZXdhcmRJZH1gLFxuICAgICAgICBtZXRob2Q6IHRoaXMudHlwZSA9PT0gXCJDUkVBVEFCTEVcIiA/IFwiUE9TVFwiIDogXCJQQVRDSFwiLFxuICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBwcm9kdWN0OiBwcm9kdWN0SW5wdXQuZGF0YXNldC5pZCxcbiAgICAgICAgICByZXF1aXJlZFBvaW50czogZmlkUG9pbnRzSW5wdXQudmFsdWUsXG4gICAgICAgIH0sXG4gICAgICB9KTtcblxuICAgICAgY29uc29sZS5sb2cocmVzKTtcblxuICAgICAgdGhpcy5jbG9zZUhhbmRsZXIoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICB0aGlzLmNsb3NlSGFuZGxlcigpO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBvdmVycmlkZSBhc3luYyBkZWxldGVEb2MoKSB7XG4gICAgYXdhaXQgYXhpb3Moe1xuICAgICAgdXJsOiBgL2FwaS92MS9yZXdhcmRzLyR7dGhpcy5mb3JtPy5kYXRhc2V0LmlkfWAsXG4gICAgICBtZXRob2Q6IFwiREVMRVRFXCIsXG4gICAgfSk7XG4gIH1cbn1cbiIsIi8vIGltcG9ydCBpc0FscGhhbnVtZXJpYyBmcm9tIFwiLi4vaGVscGVycy9pc0FscGhhbnVtZXJpY1wiO1xuLy8gaW1wb3J0IGlzSW1hZ2VVcmwgZnJvbSBcIi4uL2hlbHBlcnMvaXNJbWFnZVVybFwiO1xuaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiO1xuXG5pbXBvcnQgTW9kYWwgZnJvbSBcIi4vTW9kYWxcIjtcbmltcG9ydCBTdG9yZSBmcm9tIFwiLi4vdHlwZXMvU3RvcmVcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RvcmVNb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgY29uc3RydWN0b3Ioc3RvcmVJZD86IHN0cmluZykge1xuICAgIHN1cGVyKFwiTmV3IFN0b3JlXCIsIHN0b3JlSWQgPyBcIkVESVRBQkxFXCIgOiBcIkNSRUFUQUJMRVwiKTtcblxuICAgIHRoaXMubG9hZChzdG9yZUlkKS50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMuZm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubW9kYWwtZm9ybVwiKSBhcyBIVE1MRm9ybUVsZW1lbnQ7XG5cbiAgICAgIHRoaXMuZm9ybS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIHRoaXMuc3VibWl0SGFuZGxlci5iaW5kKHRoaXMpKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBsb2FkKHN0b3JlSWQ/OiBzdHJpbmcpIHtcbiAgICB0cnkge1xuICAgICAgbGV0IGJ1dHRvbnM7XG4gICAgICBsZXQgbmFtZVZhbHVlO1xuICAgICAgbGV0IGxvY2F0aW9uVmFsdWU7XG4gICAgICBsZXQgcGF0aFZhbHVlO1xuICAgICAgbGV0IGxvZ29WYWx1ZTtcbiAgICAgIGlmIChzdG9yZUlkKSB7XG4gICAgICAgIGJ1dHRvbnMgPSBgXG4gICAgICAgIDxidXR0b24gdHlwZT1cInN1Ym1pdFwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCI+RWRpdDwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBpZD1cImRlbGV0ZURvY1wiIGNsYXNzPVwiYnRuIGJ0bi1kYW5nZXJcIj5EZWxldGU8L2J1dHRvbj5cbiAgICAgIGA7XG4gICAgICAgIGNvbnN0IHsgZGF0YSB9ID0gYXdhaXQgYXhpb3Moe1xuICAgICAgICAgIHVybDogYC9hcGkvdjEvc3RvcmVzLyR7c3RvcmVJZH1gLFxuICAgICAgICAgIG1ldGhvZDogXCJHRVRcIixcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgZG9jID0gZGF0YS5kb2MgYXMgU3RvcmU7XG5cbiAgICAgICAgbmFtZVZhbHVlID0gZG9jLm5hbWU7XG4gICAgICAgIGxvY2F0aW9uVmFsdWUgPSBkb2MubG9jYXRpb247XG4gICAgICAgIHBhdGhWYWx1ZSA9IGRvYy5zdWJVcmw7XG4gICAgICAgIGxvZ29WYWx1ZSA9IGRvYy5sb2dvO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnV0dG9ucyA9IGA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiPlN1Ym1pdDwvYnV0dG9uPmA7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucmVuZGVyKGBcbiAgICAgIDxmb3JtIGNsYXNzPVwibW9kYWwtZm9ybVwiIGRhdGEtaWQ9XCIke3N0b3JlSWQgfHwgXCJcIn1cIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1jb250cm9sXCI+XG4gICAgICAgICAgICAgIDxsYWJlbD5TdG9yZSBOYW1lICo8L2xhYmVsPlxuICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBuYW1lPVwibmFtZVwiIHZhbHVlPVwiJHtcbiAgICAgICAgICAgICAgICBuYW1lVmFsdWUgfHwgXCJcIlxuICAgICAgICAgICAgICB9XCIgcGxhY2Vob2xkZXI9XCJQdXQgdGhlIG5hbWUgaGVyZS4uLlwiIHJlcXVpcmVkPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIj5cbiAgICAgICAgICAgICAgPGxhYmVsPlN0b3JlIExvY2F0aW9uICo8L2xhYmVsPlxuICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBuYW1lPVwibG9jYXRpb25cIiB2YWx1ZT1cIiR7XG4gICAgICAgICAgICAgICAgbG9jYXRpb25WYWx1ZSB8fCBcIlwiXG4gICAgICAgICAgICAgIH1cIiBwbGFjZWhvbGRlcj1cIlB1dCB0aGUgbG9jYXRpb24gaGVyZS4uLlwiIHJlcXVpcmVkPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIj5cbiAgICAgICAgICAgICAgPGxhYmVsPlN0b3JlIFVybCAqPC9sYWJlbD5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImlucHV0LWdyb3VwXCI+XG4gICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImlubGluZS1maXJzdFwiIHZhbHVlPVwiaHR0cHM6Ly9maWQ3ODYuY29tL3N0b3Jlcy9cIiByZXF1aXJlZCBkaXNhYmxlZD5cbiAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIG5hbWU9XCJwYXRoXCIgdmFsdWU9XCIke1xuICAgICAgICAgICAgICAgICAgICBwYXRoVmFsdWUgfHwgXCJcIlxuICAgICAgICAgICAgICAgICAgfVwiIGNsYXNzPVwiaW5saW5lLXNlY29uZFwiIHBsYWNlaG9sZGVyPVwiUHV0IHRoZSBwYXRoIGhlcmUuLi5cIj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tY29udHJvbFwiPlxuICAgICAgICAgICAgICA8bGFiZWw+U3RvcmUgTG9nbyAqPC9sYWJlbD5cbiAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cImxvZ29cIiB2YWx1ZT1cIiR7XG4gICAgICAgICAgICAgICAgbG9nb1ZhbHVlIHx8IFwiXCJcbiAgICAgICAgICAgICAgfVwiIHBsYWNlaG9sZGVyPVwiUHV0IHRoZSBsb2dvIHVybCBoZXJlLi4uXCIgcmVxdWlyZWQ+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tc3VibWl0XCI+XG4gICAgICAgICAgICAgICR7YnV0dG9uc31cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZm9ybT5cbiAgICBgKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHN1Ym1pdEhhbmRsZXIoZTogRXZlbnQpIHtcbiAgICB0cnkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICBjb25zdCBuYW1lSW5wdXQgPSB0aGlzLmZvcm0hLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgIGBpbnB1dFtuYW1lPVwibmFtZVwiXWBcbiAgICAgICkgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICAgIGNvbnN0IGxvY2F0aW9uSW5wdXQgPSB0aGlzLmZvcm0hLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgIGBpbnB1dFtuYW1lPVwibG9jYXRpb25cIl1gXG4gICAgICApIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgICBjb25zdCBwYXRoSW5wdXQgPSB0aGlzLmZvcm0hLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgIGBpbnB1dFtuYW1lPVwicGF0aFwiXWBcbiAgICAgICkgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICAgIGNvbnN0IGxvZ29JbnB1dCA9IHRoaXMuZm9ybSEucXVlcnlTZWxlY3RvcihcbiAgICAgICAgYGlucHV0W25hbWU9XCJsb2dvXCJdYFxuICAgICAgKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgICAgY29uc3Qgc3VibWl0QnRuID0gdGhpcy5mb3JtIS5xdWVyeVNlbGVjdG9yKFxuICAgICAgICBgYnV0dG9uW3R5cGU9XCJzdWJtaXRcIl1gXG4gICAgICApISBhcyBIVE1MQnV0dG9uRWxlbWVudDtcblxuICAgICAgc3VibWl0QnRuLnRleHRDb250ZW50ID0gXCJTdWJtaXR0aW5nXCI7XG4gICAgICBzdWJtaXRCdG4uZGlzYWJsZWQgPSB0cnVlO1xuXG4gICAgICBjb25zdCBzdG9yZUlkID0gdGhpcy5mb3JtPy5kYXRhc2V0LmlkO1xuICAgICAgYXdhaXQgYXhpb3Moe1xuICAgICAgICB1cmw6IHN0b3JlSWQgPyBgL2FwaS92MS9zdG9yZXMvJHtzdG9yZUlkfWAgOiBcIi9hcGkvdjEvc3RvcmVzXCIsXG4gICAgICAgIG1ldGhvZDogc3RvcmVJZCA/IFwiUEFUQ0hcIiA6IFwiUE9TVFwiLFxuICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBuYW1lOiBuYW1lSW5wdXQudmFsdWUsXG4gICAgICAgICAgbG9jYXRpb246IGxvY2F0aW9uSW5wdXQudmFsdWUsXG4gICAgICAgICAgc3ViVXJsOiBwYXRoSW5wdXQudmFsdWUsXG4gICAgICAgICAgbG9nbzogbG9nb0lucHV0LnZhbHVlLFxuICAgICAgICB9LFxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuY2xvc2VIYW5kbGVyKCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgdGhpcy5jbG9zZUhhbmRsZXIoKTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgYXN5bmMgZGVsZXRlRG9jKCkge1xuICAgIGF3YWl0IGF4aW9zKHtcbiAgICAgIHVybDogYC9hcGkvdjEvc3RvcmVzLyR7dGhpcy5mb3JtPy5kYXRhc2V0LmlkfWAsXG4gICAgICBtZXRob2Q6IFwiREVMRVRFXCIsXG4gICAgfSk7XG4gIH1cblxuICAvLyAgIHByaXZhdGUgdmFsaWRhdGVGb3JtKGlucHV0czogYW55KSB7XG4gIC8vICAgICBpZiAoIWlzQWxwaGFudW1lcmljKGlucHV0cy5wYXRoSW5wdXQudmFsdWUpKSB7XG4gIC8vICAgICAgICAgdGhpcy5yZW1vdmVQcmV2RXJyb3IoKTtcbiAgLy8gICAgICAgICB0aGlzLnJlbmRlcmVkRXJyb3IgPSB0aGlzLmNyZWF0ZUVycm9yKFxuICAvLyAgICAgICAgICAgXCJUaGUgdXJsIHBhdGggbXVzdCBiZSBhbHBoYW51bWVyaWMuXCJcbiAgLy8gICAgICAgICApO1xuICAvLyAgICAgICAgIGlucHV0cy5wYXRoSW5wdXQucGFyZW50RWxlbWVudD8ucGFyZW50RWxlbWVudD8uYXBwZW5kQ2hpbGQodGhpcy5yZW5kZXJlZEVycm9yKTtcbiAgLy8gICAgICAgICBpbnB1dHMucGF0aElucHV0LnN0eWxlLmJvcmRlckNvbG9yID0gXCJyZWRcIjtcbiAgLy8gICAgICAgICByZXR1cm47XG4gIC8vICAgICAgIH1cblxuICAvLyAgICAgICBpZiAoIWlzSW1hZ2VVcmwoaW5wdXRzLmxvZ29JbnB1dC52YWx1ZSkpIHtcbiAgLy8gICAgICAgICB0aGlzLnJlbW92ZVByZXZFcnJvcigpO1xuICAvLyAgICAgICAgIHRoaXMucmVuZGVyZWRFcnJvciA9IHRoaXMuY3JlYXRlRXJyb3IoXCJJbnZhbGlkIGxvZ28gdXJsLlwiKTtcbiAgLy8gICAgICAgICBpbnB1dHMubG9nb0lucHV0LnBhcmVudEVsZW1lbnQ/LnBhcmVudEVsZW1lbnQ/LmFwcGVuZENoaWxkKHRoaXMucmVuZGVyZWRFcnJvcik7XG4gIC8vICAgICAgICAgaW5wdXRzLmxvZ29JbnB1dC5zdHlsZS5ib3JkZXJDb2xvciA9IFwicmVkXCI7XG4gIC8vICAgICAgICAgcmV0dXJuO1xuICAvLyAgICAgICB9XG4gIC8vICAgfVxufVxuIiwiaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiO1xuXG5pbXBvcnQgU2VjdGlvbiBmcm9tIFwiLi9TZWN0aW9uXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhvbWVTZWN0aW9uIGV4dGVuZHMgU2VjdGlvbiB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKFwiSE9NRVwiKTtcblxuICAgIGF4aW9zKHtcbiAgICAgIHVybDogXCIvYXBpL3YxL292ZXJ2aWV3XCIsXG4gICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgfSlcbiAgICAgIC50aGVuKChyZXMpID0+IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IHJlcy5kYXRhLmRhdGE7XG4gICAgICAgIHRoaXMucmVuZGVyKFxuICAgICAgICAgIGBcbiAgICAgICAgICAgICAgPHNlY3Rpb24gY2xhc3M9XCJkYXNoYm9hcmQtc2VjdGlvblwiIGlkPVwiaG9tZVwiPlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRhc2hib2FyZC1zZWN0aW9uX190b3BcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8aDIgY2xhc3M9XCJkYXNoYm9hcmQtc2VjdGlvbl9fdGl0bGVcIj5Ib21lPC9oMj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRhc2hib2FyZC1zZWN0aW9uX19jYXJkc1wiPlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkYXNoYm9hcmQtc2VjdGlvbl9fY2FyZCBob21lLWNhcmQgY2FyZC1yZWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGgzIGNsYXNzPVwiaG9tZS1jYXJkX190aXRsZVwiPlRvdGFsIFN0b3JlczwvaDM+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwiaG9tZS1jYXJkX19jb250ZW50XCI+JHtkYXRhLm51bWJlck9mU3RvcmVzfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGFzaGJvYXJkLXNlY3Rpb25fX2NhcmQgaG9tZS1jYXJkIGNhcmQtYmx1ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8aDMgY2xhc3M9XCJob21lLWNhcmRfX3RpdGxlXCI+VG90YWwgUHJvZHVjdHM8L2gzPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cImhvbWUtY2FyZF9fY29udGVudFwiPiR7ZGF0YS5udW1iZXJPZlByb2R1Y3RzfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGFzaGJvYXJkLXNlY3Rpb25fX2NhcmQgaG9tZS1jYXJkIGNhcmQteWVsbG93XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxoMyBjbGFzcz1cImhvbWUtY2FyZF9fdGl0bGVcIj5Ub3RhbCBPcmRlcnM8L2gzPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cImhvbWUtY2FyZF9fY29udGVudFwiPiR7ZGF0YS5udW1iZXJPZk9yZGVyc308L3A+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICAgIGBcbiAgICAgICAgKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgfSk7XG4gIH1cbn1cbiIsImltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIjtcblxuaW1wb3J0IGZvcm1hdERhdGUgZnJvbSBcIi4uL2hlbHBlcnMvZm9ybWF0RGF0ZVwiO1xuaW1wb3J0IE9yZGVyTW9kYWwgZnJvbSBcIi4uL21vZGFscy9PcmRlclwiO1xuaW1wb3J0IE9yZGVyIGZyb20gXCIuLi90eXBlcy9PcmRlclwiO1xuXG5pbXBvcnQgU2VjdGlvbiBmcm9tIFwiLi9TZWN0aW9uXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9yZGVyU2VjdGlvbiBleHRlbmRzIFNlY3Rpb24ge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihcIk9SREVSXCIpO1xuXG4gICAgYXhpb3Moe1xuICAgICAgdXJsOiBcIi9hcGkvdjEvb3JkZXJzXCIsXG4gICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgfSkudGhlbigocmVzKSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0gcmVzLmRhdGEuZGF0YSBhcyBbT3JkZXJdO1xuXG4gICAgICB0aGlzLnJlbmRlcihcbiAgICAgICAgYFxuICAgICAgICAgIDxzZWN0aW9uIGNsYXNzPVwiZGFzaGJvYXJkLXNlY3Rpb25cIiBpZD1cIm9yZGVyc1wiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGFzaGJvYXJkLXNlY3Rpb25fX3RvcFwiPlxuICAgICAgICAgICAgICAgICAgPGgyIGNsYXNzPVwiZGFzaGJvYXJkLXNlY3Rpb25fX3RpdGxlXCI+TWFuYWdlIE9yZGVyczwvaDI+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGFzaGJvYXJkLXNlY3Rpb25fX292ZXJ2aWV3XCI+PGVtPihUb3RhbDogJHtcbiAgICAgICAgICAgICAgICBkYXRhLmxlbmd0aFxuICAgICAgICAgICAgICB9KTwvZW0+PC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgaWQ9XCJvcmRlckNhcmRzXCIgY2xhc3M9XCJvcmRlci1jYXJkc1wiPlxuICAgICAgICAgICAgICAgICR7dGhpcy5yZW5kZXJPcmRlcihkYXRhKX1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgYFxuICAgICAgKTtcblxuICAgICAgZG9jdW1lbnRcbiAgICAgICAgLmdldEVsZW1lbnRCeUlkKFwib3JkZXJDYXJkc1wiKVxuICAgICAgICA/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLm9yZGVyQ2FyZENsaWNrSGFuZGxlci5iaW5kKHRoaXMpKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyT3JkZXIoZGF0YTogW09yZGVyXSkge1xuICAgIGNvbnN0IG9yZGVycyA9IGRhdGEubWFwKChvcmRlcikgPT4ge1xuICAgICAgY29uc3Qgb3JkZXJEYXRlID0gZm9ybWF0RGF0ZShvcmRlci5jcmVhdGVkQXQpO1xuXG4gICAgICByZXR1cm4gYFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm9yZGVyLWNhcmRcIiBkYXRhLWlkPVwiJHtvcmRlci5faWR9XCI+XG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJiaSBiaS1wZXJzb24tY2lyY2xlXCI+PC9pPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj4ke29yZGVyLmJ1eWVyLnVzZXJuYW1lfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj4ke29yZGVyLnByb2R1Y3QubmFtZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIMK3XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPiR7b3JkZXJEYXRlfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8c3Bhbj4ke1xuICAgICAgICAgICAgICAgICAgb3JkZXIudG90YWxQcmljZSA+IDAgPyBg4oKsJHtvcmRlci50b3RhbFByaWNlfWAgOiBcIkZSRUVcIlxuICAgICAgICAgICAgICAgIH08L3NwYW4+XG4gICAgICAgICAgICAgICAgPHNwYW4+JHtvcmRlci5wcm9kdWN0LmRlbGl2ZXJ5VGltZX0gRGF5cyBEZWxpdmVyeTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm9yZGVyLWNhcmRfXyR7b3JkZXIuc3RhdGV9XCI+JHtvcmRlci5zdGF0ZX08L3NwYW4+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgYDtcbiAgICB9KTtcblxuICAgIHJldHVybiBvcmRlcnMuam9pbihcIlwiKTtcbiAgfVxuXG4gIHByaXZhdGUgb3JkZXJDYXJkQ2xpY2tIYW5kbGVyKGU6IEV2ZW50KSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQ7XG4gICAgY29uc3Qgb3JkZXJDYXJkID0gdGFyZ2V0LmNsb3Nlc3QoXCIub3JkZXItY2FyZFwiKSBhcyBIVE1MRGl2RWxlbWVudDtcbiAgICBpZiAoIW9yZGVyQ2FyZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIG5ldyBPcmRlck1vZGFsKG9yZGVyQ2FyZC5kYXRhc2V0LmlkISk7XG4gIH1cbn1cbiIsImltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIjtcblxuaW1wb3J0IFNlY3Rpb24gZnJvbSBcIi4vU2VjdGlvblwiO1xuaW1wb3J0IFByb2R1Y3QgZnJvbSBcIi4uL3R5cGVzL1Byb2R1Y3RcIjtcbmltcG9ydCBmb3JtYXREYXRlIGZyb20gXCIuLi9oZWxwZXJzL2Zvcm1hdERhdGVcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJvZHVjdFNlY3Rpb24gZXh0ZW5kcyBTZWN0aW9uIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoXCJQUk9EVUNUXCIpO1xuXG4gICAgYXhpb3Moe1xuICAgICAgdXJsOiBcIi9hcGkvdjEvcHJvZHVjdHNcIixcbiAgICAgIG1ldGhvZDogXCJHRVRcIixcbiAgICB9KS50aGVuKChyZXMpID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSByZXMuZGF0YS5kYXRhIGFzIFtQcm9kdWN0XTtcblxuICAgICAgdGhpcy5yZW5kZXIoXG4gICAgICAgIGBcbiAgICAgICAgICA8c2VjdGlvbiBjbGFzcz1cImRhc2hib2FyZC1zZWN0aW9uXCIgaWQ9XCJwcm9kdWN0c1wiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGFzaGJvYXJkLXNlY3Rpb25fX3RvcFwiPlxuICAgICAgICAgICAgICAgICAgPGgyIGNsYXNzPVwiZGFzaGJvYXJkLXNlY3Rpb25fX3RpdGxlXCI+TWFuYWdlIFByb2R1Y3RzPC9oMj5cbiAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIiBpZD1cIm5ld1BST0RVQ1RcIj5OZXcgUHJvZHVjdDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRhc2hib2FyZC1zZWN0aW9uX19vdmVydmlld1wiPjxlbT4oVG90YWw6ICR7XG4gICAgICAgICAgICAgICAgZGF0YS5sZW5ndGhcbiAgICAgICAgICAgICAgfSk8L2VtPjwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGFzaGJvYXJkLXNlY3Rpb25fX2NhcmRzXCI+XG4gICAgICAgICAgICAgICAgICAgICR7dGhpcy5yZW5kZXJQcm9kdWN0KGRhdGEpfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgIGBcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlclByb2R1Y3QoZGF0YTogW1Byb2R1Y3RdKSB7XG4gICAgY29uc3QgcHJvZHVjdHMgPSBkYXRhLm1hcCgocHJvZHVjdCkgPT4ge1xuICAgICAgY29uc3QgZGF0ZSA9IGZvcm1hdERhdGUocHJvZHVjdC5jcmVhdGVkQXQpO1xuICAgICAgY29uc3QgYXZhaWxhYmlsaXR5ID0gcHJvZHVjdC5hdmFpbGFiaWxpdHk7XG4gICAgICByZXR1cm4gYFxuICAgICAgICAgICAgICA8YSBcbiAgICAgICAgICAgICAgICBocmVmPVwiL3N0b3Jlcy8ke3Byb2R1Y3Quc3RvcmUuc3ViVXJsfS8ke3Byb2R1Y3QuX2lkfVwiXG4gICAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiXG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8ZGl2IFxuICAgICAgICAgICAgICAgICBkYXRhLWlkPVwiJHtwcm9kdWN0Ll9pZH1cIlxuICAgICAgICAgICAgICAgICBkYXRhLXR5cGU9XCJQUk9EVUNUXCJcbiAgICAgICAgICAgICAgICAgY2xhc3M9XCJkYXNoYm9hcmQtc2VjdGlvbl9fY2FyZCBwcm9kdWN0LWNhcmRcIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInByb2R1Y3QtY2FyZF9faW1nXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aW1nIHNyYz1cIiR7cHJvZHVjdC5waG90b3NbMF19XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwcm9kdWN0LWNhcmRfX2luZm9cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwcm9kdWN0LWNhcmRfX3RvcFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicHJvZHVjdC1jYXJkX190aXRsZVwiPiR7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9kdWN0Lm5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cInByb2R1Y3QtY2FyZF9fJHthdmFpbGFiaWxpdHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXHMvZywgXCItXCIpfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAke1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2YWlsYWJpbGl0eSA9PT0gXCJJbiBTdG9ja1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGA8aSBjbGFzcz1cImJpIGJpLWNoZWNrLWxnXCI+PC9pPmBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogYDxpIGNsYXNzPVwiYmkgYmktZXhjbGFtYXRpb24tY2lyY2xlXCI+PC9pPmBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAke2F2YWlsYWJpbGl0eX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicHJvZHVjdC1jYXJkX19zdG9yZVwiPiR7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHByb2R1Y3Quc3RvcmUubmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIMK3XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInByb2R1Y3QtY2FyZF9fZGF0ZVwiPiR7ZGF0ZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicHJvZHVjdC1jYXJkX19ib3R0b21cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInByb2R1Y3QtY2FyZF9fcHJpY2VcIj7igqwke1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZHVjdC5wcmljZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeSBjYXJkLWJ0blwiPkFjdGlvbnM8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgIGA7XG4gICAgfSk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBwcm9kdWN0cy5sZW5ndGggJSAzOyBpKyspIHtcbiAgICAgIHByb2R1Y3RzLnB1c2goYDxkaXY+PC9kaXY+YCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb2R1Y3RzLmpvaW4oXCJcIik7XG4gIH1cbn1cbiIsImltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIjtcblxuaW1wb3J0IFNlY3Rpb24gZnJvbSBcIi4vU2VjdGlvblwiO1xuaW1wb3J0IFJld2FyZCBmcm9tIFwiLi4vdHlwZXMvUmV3YXJkXCI7XG5pbXBvcnQgZm9ybWF0RGF0ZSBmcm9tIFwiLi4vaGVscGVycy9mb3JtYXREYXRlXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJld2FyZFNlY3Rpb24gZXh0ZW5kcyBTZWN0aW9uIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoXCJSRVdBUkRcIik7XG5cbiAgICBheGlvcyh7XG4gICAgICB1cmw6IFwiL2FwaS92MS9yZXdhcmRzXCIsXG4gICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgfSkudGhlbigocmVzKSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0gcmVzLmRhdGEuZGF0YSBhcyBbUmV3YXJkXTtcblxuICAgICAgdGhpcy5yZW5kZXIoXG4gICAgICAgIGBcbiAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzPVwiZGFzaGJvYXJkLXNlY3Rpb25cIiBpZD1cInJld2FyZFwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkYXNoYm9hcmQtc2VjdGlvbl9fdG9wXCI+XG4gICAgICAgICAgICAgICAgICAgIDxoMiBjbGFzcz1cImRhc2hib2FyZC1zZWN0aW9uX190aXRsZVwiPk1hbmFnZSBSZXdhcmRzPC9oMj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiIGlkPVwibmV3UkVXQVJEXCI+TmV3IFJld2FyZDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkYXNoYm9hcmQtc2VjdGlvbl9fb3ZlcnZpZXdcIj48ZW0+KFRvdGFsOiAke1xuICAgICAgICAgICAgICAgICAgZGF0YS5sZW5ndGhcbiAgICAgICAgICAgICAgICB9KTwvZW0+PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRhc2hib2FyZC1zZWN0aW9uX19jYXJkc1wiPlxuICAgICAgICAgICAgICAgICAgICAke3RoaXMucmVuZGVyUmV3YXJkKGRhdGEpfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICBgXG4gICAgICApO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJSZXdhcmQoZGF0YTogW1Jld2FyZF0pIHtcbiAgICBjb25zdCByZXdhcmRzID0gZGF0YS5tYXAoKHJld2FyZCkgPT4ge1xuICAgICAgY29uc29sZS5sb2cocmV3YXJkKTtcblxuICAgICAgY29uc3QgZGF0ZSA9IGZvcm1hdERhdGUocmV3YXJkLmNyZWF0ZWRBdCk7XG4gICAgICBjb25zdCBhdmFpbGFiaWxpdHkgPSByZXdhcmQucHJvZHVjdC5hdmFpbGFiaWxpdHk7XG4gICAgICByZXR1cm4gYFxuICAgICAgICA8YSBcbiAgICAgICAgaHJlZj1cIi9zdG9yZXMvJHtyZXdhcmQucHJvZHVjdC5zdG9yZS5zdWJVcmx9LyR7XG4gICAgICAgIHJld2FyZC5wcm9kdWN0Ll9pZFxuICAgICAgfT90eXBlPXJld2FyZFwiXG4gICAgICAgIHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vb3BlbmVyIG5vcmVmZXJyZXJcIlxuICAgICAgICA+XG4gICAgICAgICAgPGRpdiBcbiAgICAgICAgICAgZGF0YS1pZD1cIiR7cmV3YXJkLl9pZH1cIlxuICAgICAgICAgICBkYXRhLXR5cGU9XCJSRVdBUkRcIlxuICAgICAgICAgICBjbGFzcz1cImRhc2hib2FyZC1zZWN0aW9uX19jYXJkIHByb2R1Y3QtY2FyZFwiXG4gICAgICAgICAgPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicHJvZHVjdC1jYXJkX19pbWdcIj5cbiAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPVwiJHtyZXdhcmQucHJvZHVjdC5waG90b3NbMF19XCIgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwcm9kdWN0LWNhcmRfX2luZm9cIj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwcm9kdWN0LWNhcmRfX3RvcFwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicHJvZHVjdC1jYXJkX190aXRsZVwiPiR7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXdhcmQucHJvZHVjdC5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBcbiAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJwcm9kdWN0LWNhcmRfXyR7YXZhaWxhYmlsaXR5XG4gICAgICAgICAgICAgICAgICAgICAgICAgLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxzL2csIFwiLVwiKX1cIlxuICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgJHtcbiAgICAgICAgICAgICAgICAgICAgICAgICBhdmFpbGFiaWxpdHkgPT09IFwiSW4gU3RvY2tcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBgPGkgY2xhc3M9XCJiaSBiaS1jaGVjay1sZ1wiPjwvaT5gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICA6IGA8aSBjbGFzcz1cImJpIGJpLWV4Y2xhbWF0aW9uLWNpcmNsZVwiPjwvaT5gXG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgJHthdmFpbGFiaWxpdHl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInByb2R1Y3QtY2FyZF9fc3RvcmVcIj4ke1xuICAgICAgICAgICAgICAgICAgICByZXdhcmQucHJvZHVjdC5zdG9yZS5uYW1lXG4gICAgICAgICAgICAgICAgICB9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgwrdcbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicHJvZHVjdC1jYXJkX19kYXRlXCI+JHtkYXRlfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwcm9kdWN0LWNhcmRfX2JvdHRvbVwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicHJvZHVjdC1jYXJkX19wcmljZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAke3Jld2FyZC5yZXF1aXJlZFBvaW50c30gUG9pbnRzXG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXByaW1hcnkgY2FyZC1idG5cIj5BY3Rpb25zPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvYT5cbiAgICAgIGA7XG4gICAgfSk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8PSByZXdhcmRzLmxlbmd0aCAlIDM7IGkrKykge1xuICAgICAgcmV3YXJkcy5wdXNoKGA8ZGl2PjwvZGl2PmApO1xuICAgIH1cblxuICAgIHJldHVybiByZXdhcmRzLmpvaW4oXCJcIik7XG4gIH1cbn1cbiIsImltcG9ydCBQcm9kdWN0TW9kYWwgZnJvbSBcIi4uL21vZGFscy9Qcm9kdWN0XCI7XG5pbXBvcnQgUmV3YXJkTW9kYWwgZnJvbSBcIi4uL21vZGFscy9SZXdhcmRcIjtcbmltcG9ydCBTdG9yZU1vZGFsIGZyb20gXCIuLi9tb2RhbHMvU3RvcmVcIjtcbmltcG9ydCBUeXBlU2VjdGlvbiBmcm9tIFwiLi4vdHlwZXMvU2VjdGlvblwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZWN0aW9uIHtcbiAgcHJpdmF0ZSBzZWN0aW9uQ29udGFpbmVyOiBIVE1MRGl2RWxlbWVudDtcbiAgcHJpdmF0ZSBsb2FkaW5nU3Bpbm5lciA9IGBcbiAgICA8ZGl2IGNsYXNzPVwibG9hZGluZy1zcGlubmVyX19kYXNoYm9hcmRcIj48ZGl2IGNsYXNzPVwibG9hZGluZy1zcGlubmVyXCI+PC9kaXY+PC9kaXY+XG4gIGA7XG4gIHByb3RlY3RlZCBjYXJkc0NvbnRhaW5lciE6IEhUTUxEaXZFbGVtZW50O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgdHlwZTogVHlwZVNlY3Rpb24pIHtcbiAgICB0aGlzLnNlY3Rpb25Db250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcbiAgICAgIFwiZGFzaGJvYXJkQ29udGVudFwiXG4gICAgKSBhcyBIVE1MRGl2RWxlbWVudDtcbiAgICB0aGlzLnNlY3Rpb25Db250YWluZXIuaW5uZXJIVE1MID0gdGhpcy5sb2FkaW5nU3Bpbm5lcjtcbiAgfVxuXG4gIHByb3RlY3RlZCByZW5kZXIobWFya3VwOiBzdHJpbmcpIHtcbiAgICB0aGlzLnNlY3Rpb25Db250YWluZXIuaW5uZXJIVE1MID0gbWFya3VwO1xuXG4gICAgdGhpcy5jYXJkc0NvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICBcIi5kYXNoYm9hcmQtc2VjdGlvbl9fY2FyZHNcIlxuICAgICkgYXMgSFRNTERpdkVsZW1lbnQ7XG5cbiAgICB0aGlzLmNhcmRzQ29udGFpbmVyPy5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgXCJjbGlja1wiLFxuICAgICAgdGhpcy5jYXJkQ2xpY2tIYW5kbGVyLmJpbmQodGhpcylcbiAgICApO1xuXG4gICAgaWYgKHRoaXMudHlwZSAhPT0gXCJIT01FXCIgJiYgdGhpcy50eXBlICE9PSBcIk9SREVSXCIpIHtcbiAgICAgIGRvY3VtZW50XG4gICAgICAgIC5nZXRFbGVtZW50QnlJZChgbmV3JHt0aGlzLnR5cGV9YClcbiAgICAgICAgPy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5yZW5kZXJNb2RhbEhhbmRsZXIuYmluZCh0aGlzKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJNb2RhbEhhbmRsZXIoKSB7XG4gICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgIGNhc2UgXCJTVE9SRVwiOlxuICAgICAgICBuZXcgU3RvcmVNb2RhbCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJQUk9EVUNUXCI6XG4gICAgICAgIG5ldyBQcm9kdWN0TW9kYWwoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiUkVXQVJEXCI6XG4gICAgICAgIG5ldyBSZXdhcmRNb2RhbCgpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgY2FyZENsaWNrSGFuZGxlcihlOiBFdmVudCkge1xuICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xuXG4gICAgaWYgKCF0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiY2FyZC1idG5cIikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICBjb25zdCBjYXJkID0gdGFyZ2V0LmNsb3Nlc3QoXCIuZGFzaGJvYXJkLXNlY3Rpb25fX2NhcmRcIikgYXMgSFRNTERpdkVsZW1lbnQ7XG5cbiAgICBzd2l0Y2ggKGNhcmQ/LmRhdGFzZXQudHlwZSkge1xuICAgICAgY2FzZSBcIlNUT1JFXCI6XG4gICAgICAgIG5ldyBTdG9yZU1vZGFsKGNhcmQ/LmRhdGFzZXQuaWQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJQUk9EVUNUXCI6XG4gICAgICAgIG5ldyBQcm9kdWN0TW9kYWwoY2FyZD8uZGF0YXNldC5pZCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIlJFV0FSRFwiOlxuICAgICAgICBuZXcgUmV3YXJkTW9kYWwoY2FyZD8uZGF0YXNldC5pZCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiO1xuXG5pbXBvcnQgU2VjdGlvbiBmcm9tIFwiLi9TZWN0aW9uXCI7XG5pbXBvcnQgU3RvcmUgZnJvbSBcIi4uL3R5cGVzL1N0b3JlXCI7XG5pbXBvcnQgZm9ybWF0RGF0ZSBmcm9tIFwiLi4vaGVscGVycy9mb3JtYXREYXRlXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0b3JlU2VjdGlvbiBleHRlbmRzIFNlY3Rpb24ge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihcIlNUT1JFXCIpO1xuXG4gICAgYXhpb3Moe1xuICAgICAgdXJsOiBcIi9hcGkvdjEvc3RvcmVzXCIsXG4gICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgfSlcbiAgICAgIC50aGVuKChyZXMpID0+IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IHJlcy5kYXRhLmRhdGEgYXMgW1N0b3JlXTtcblxuICAgICAgICB0aGlzLnJlbmRlcihcbiAgICAgICAgICBgXG4gICAgICAgICAgICA8c2VjdGlvbiBjbGFzcz1cImRhc2hib2FyZC1zZWN0aW9uXCIgaWQ9XCJzdG9yZXNcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGFzaGJvYXJkLXNlY3Rpb25fX3RvcFwiPlxuICAgICAgICAgICAgICAgICAgICA8aDIgY2xhc3M9XCJkYXNoYm9hcmQtc2VjdGlvbl9fdGl0bGVcIj5NYW5hZ2UgU3RvcmVzPC9oMj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeVwiIGlkPVwibmV3U1RPUkVcIj5OZXcgU3RvcmU8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGFzaGJvYXJkLXNlY3Rpb25fX292ZXJ2aWV3XCI+PGVtPihUb3RhbDogJHtcbiAgICAgICAgICAgICAgICAgIGRhdGEubGVuZ3RoXG4gICAgICAgICAgICAgICAgfSk8L2VtPjwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkYXNoYm9hcmQtc2VjdGlvbl9fY2FyZHNcIj5cbiAgICAgICAgICAgICAgICAgICAgJHt0aGlzLnJlbmRlclN0b3JlKGRhdGEpfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICAgIGBcbiAgICAgICAgKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyU3RvcmUoZGF0YTogW1N0b3JlXSkge1xuICAgIGNvbnN0IHN0b3JlcyA9IGRhdGEubWFwKChzdG9yZSkgPT4ge1xuICAgICAgY29uc3QgZGF0ZSA9IGZvcm1hdERhdGUoc3RvcmUuY3JlYXRlZEF0KTtcblxuICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgIDxhIGhyZWY9XCIvc3RvcmVzLyR7c3RvcmUuc3ViVXJsfVwiIHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vb3BlbmVyIG5vcmVmZXJyZXJcIj5cbiAgICAgICAgICAgICAgPGRpdiBkYXRhLWlkPVwiJHtzdG9yZS5faWR9XCIgZGF0YS10eXBlPVwiU1RPUkVcIiBjbGFzcz1cImRhc2hib2FyZC1zZWN0aW9uX19jYXJkIHN0b3JlLWNhcmRcIj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdG9yZS1jYXJkX190b3BcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RvcmUtY2FyZF9faW5mb1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInN0b3JlLWNhcmRfX3RpdGxlXCI+JHtzdG9yZS5uYW1lfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJzdG9yZS1jYXJkX19sb2NhdGlvblwiPiR7c3RvcmUubG9jYXRpb259PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICDCt1xuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInN0b3JlLWNhcmRfX2RhdGVcIj4ke2RhdGV9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdG9yZS1jYXJkX19hY3Rpb25zXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXByaW1hcnkgY2FyZC1idG5cIj5BY3Rpb25zPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdG9yZS1jYXJkX19sb2dvXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPGltZyBjbGFzcz1cInN0b3JlLWNhcmRfX2ltZ1wiIHNyYz1cIiR7c3RvcmUubG9nb31cIj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvYT5cbiAgICAgICAgYDtcbiAgICB9KTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IHN0b3Jlcy5sZW5ndGggJSAzOyBpKyspIHtcbiAgICAgIHN0b3Jlcy5wdXNoKGA8ZGl2PjwvZGl2PmApO1xuICAgIH1cblxuICAgIHJldHVybiBzdG9yZXMuam9pbihcIlwiKTtcbiAgfVxufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vY2xpZW50L2luZGV4LnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9