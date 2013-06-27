define(['aeris'], function(aeris) {

  /**
   * @fileoverview A lightweight Promise library.
   */


  aeris.provide('aeris.Promise');


  /**
   * Create a lightweight Promise for async related work.
   *
   * @constructor
   */
  aeris.Promise = function() {


    /**
     * The current state of the promise (e.g. pending or resolved).
     *
     * @type {string}
     */
    this.state = 'pending';


    /**
     * An array of arguments to send to the callbacks.
     *
     * @type {Array}
     * @private
     */
    this.arguments_ = null;


    /**
     * An object containing deferred callbacks for
     * resolved and rejected states.
     *
     * @type {{done: Array.<Function>, fail: Array.<Function>, always: Array.<Function>}}
     * @private
     */
    this.deferred_ = {
      resolved: [],
      rejected: []
    };
  };


  /**
   * Ensure a callback is called when the promise is resolved.
   *
   * @param {Function} callback
   */
  aeris.Promise.prototype.done = function(callback) {
    this.bindCallbackToState_('resolved', callback);

    return this;
  };


  /**
   * Ensure a callback is called when the promise is rejected.
   *
   * @param {Function} callback
   */
  aeris.Promise.prototype.fail = function(callback) {
    this.bindCallbackToState_('rejected', callback);

    return this;
  };


  /**
   * Ensure a callback is called when the promise is either resolved or rejected.
   *
   * @param {Function} callback
   */
  aeris.Promise.prototype.always = function(callback) {
    this.done(callback);
    this.fail(callback);

    return this;
  };


  /**
   * Ensure a callback is called when the promise adopts the specified state.
   *
   * @param {'resolved'|'rejected'} state
   * @param {Function} callback
   */
  aeris.Promise.prototype.bindCallbackToState_ = function(state, callback) {
    // If state is already state, immediately invoke callback
    if (this.state === state) {
      callback.apply(this, this.arguments_);
    }
    else {
      this.deferred_[state].push(callback);
    }
  };


  /**
   * Mark a promise is resolved, passing in a variable number of arguments.
   *
   * @param {...*} var_args A variable number of arguments to pass to callbacks.
   */
  aeris.Promise.prototype.resolve = function(var_args) {
    this.adoptState_('resolved', arguments);
  };


  /**
   * Mark a promise is rejected, passing in a variable number of arguments.
   *
   * @param {...*} var_args
   */
  aeris.Promise.prototype.reject = function(var_args) {
    this.adoptState_('rejected', arguments);
  };


  /**
   * Mark a promise with the specified state
   * passing in an array of arguments
   *
   * @param {'resolved'|'rejected'} state The state with which to mark the promise.
   * @param {Array} opt_args An array of responses to send to deferred callbacks.
   * @private
   */
  aeris.Promise.prototype.adoptState_ = function(state, opt_args) {
    var length;
    var callbacks;

    // Enforce state is 'rejected' or 'resolved'
    if (state !== 'rejected' && state !== 'resolved') {
      throw new Error('Invalid promise state: \'' + state + '\'. +' +
                      'Valid states are \'resolved\' and \'rejected\'');
    }

    if (this.state === 'pending') {
      this.state = state;
      this.arguments_ = opt_args;

      // Run all callbacks
      callbacks = this.deferred_[this.state];
      length = callbacks.length;
      for (var i = 0; i < length; i++) {
        callbacks[i].apply(this, this.arguments_);
      }

      // Cleanup callbacks
      for (var cbState in this.deferred_) {
        if (this.deferred_.hasOwnProperty(cbState)) {
          this.deferred_[cbState] = [];
        }
      }
    }
    // Do nothing if promise is already resolved/rejected
  };


  /**
   * Create a master promise from a combination of promises.
   * Master promise is resolved when all component promises are resolved,
   * or rejected when any single component promise is rejected.
   *
   * Master promise responses include:
   *    if resolved:
   *
   * @param {...*} var_args A variable number of promises to wait for or an
   *                        array of promises.
   * @return {aeris.Promise} Master promise.
   */
  aeris.Promise.when = function(var_args) {
    var promises = Array.prototype.slice.call(arguments);
    var masterPromise = new aeris.Promise();
    var masterResponse = [];
    var length;

    // Allow first argument to be array of promises
    if (promises.length == 1 && promises[0] instanceof Array && promises[0][0] instanceof aeris.Promise) {
      promises = promises[0];
    }
    length = promises.length;

    var resolvedCount = 0;
    for (var i = 0; i < promises.length; i++) {
      promises[i].fail(function() {
        masterPromise.reject.apply(masterPromise, arguments);
      });

      promises[i].done(function() {
        var childResponse = Array.prototype.slice.call(arguments);
        masterResponse.push(childResponse);
        resolvedCount++;

        if (resolvedCount >= length) {
          masterPromise.resolve.apply(masterPromise, masterResponse);
        }
      });
    }

    return masterPromise;
  };


  return aeris.Promise;

});
