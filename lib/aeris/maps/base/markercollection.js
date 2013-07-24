define([
  'aeris', 'aeris/promise', 'aeris/events', 'base/extension/mapextensionobject'
], function(aeris) {

  /**
   * @fileoverview Defines an interface of a MarkerCollection object.
   */

  aeris.provide('aeris.maps.markers.MarkerCollection');


  /**
   * A collection of icon markers ({aeris.maps.markers.Icon})
   *
   * @abstract
   * @param {Object} opt_markerOptions Options to pass on to {aeris.maps.markers.Icon}.
   * @constructor
   */
  aeris.maps.MarkerCollection = function(opt_markerOptions) {

    // Call parent class constructor
    aeris.maps.extension.MapExtensionObject.call(this);
    aeris.Events.call(this);

    /**
     * @type {Array.<aeris.maps.markers.Icon>} Markers belonging to this collection.
     * @private
     */
    this.markers_ = [];


    /**
     * Options to use when instantiating each {aeris.maps.markers.Icon}
     *
     * @type {Object}
     * @protected
     */
    this.markerOptions_ = opt_markerOptions || {};


    /**
     * @type {aeris.Promise} Promise to fetch marker data from the AerisAPI. Resolves with marker data.
     */
    this.initialized = new aeris.Promise();

  };

  // Extend from MapExtensionObject
  aeris.inherits(
      aeris.maps.MarkerCollection,
      aeris.maps.extension.MapExtensionObject
  );

  // Mixin events
  aeris.extend(
    aeris.maps.MarkerCollection.prototype,
    aeris.Events.prototype
  );


  /**
   * Load marker data, then add the markers to the map
   *
   * @override
   */
  aeris.maps.MarkerCollection.prototype.setMap = function(aerisMap) {
    aeris.maps.extension.MapExtensionObject.prototype.setMap.apply(this, arguments);

    this.fetchMarkerData(this.onFetchMarkerSuccess_, this.onFetchMarkerError_);
  };


  /**
   * Successful callback method for fetched markers.
   *
   * @param {Object} data AerisAPI response object for requested markers.
   */
  aeris.maps.MarkerCollection.prototype.onFetchMarkerSuccess_ = function(data) {
    this.clearMarkers();
    this.processMarkers_(data);
    this.renderMarkers();
    this.initialized.resolve(data);
  };


  /**
   * Error callback method for fetched markers.
   *
   * @param {Object} error AerisAPI error response object for requested markers.
   */
  aeris.maps.MarkerCollection.prototype.onFetchMarkerError_ = function(error) {
    this.initialized.reject(error);
  };


  /**
   * Add each marker in the collection to the map
   *
   * @param {Array<aeris.maps.markers.Icon>} opt_markers Optional collection of markers to render.
   *                                                     Defaults to this.markers_.
   */
  aeris.maps.MarkerCollection.prototype.renderMarkers = function(opt_markers) {
    var markers = opt_markers || this.markers_;

    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(this.aerisMap);
    }
  };


  /**
   * Remove each marker in the collection from the map and remove the markers
   * from the collection.
   */
  aeris.maps.MarkerCollection.prototype.clearMarkers = function() {
    for (var i = 0, length = this.markers_.length; i < length; i++) {
      var marker = this.markers_[i];
      marker.remove();
    }
    this.markers_ = [];
  };


  /**
   * Creates {aeris.map.Marker} instances from AerisAPI response data
   *
   * @param {Object} data Response data from the AerisAPI.
   */
  aeris.maps.MarkerCollection.prototype.processMarkers_ = function(data) {
    // Enforce data format
    if (!data.response) {
      throw new Error('Unable to process marker data: unexpected data format');
    }

    for (var i = 0; i < data.response.length; i++) {
      var point = data.response[i];
      var marker = this.generateMarker(point, this.markerOptions_);

      marker.click = this.getOnClick_(marker, point);

      this.markers_.push(marker);
    }
  };


  /**
   * Generate a new marker for the collection using the point information and
   * options.
   *
   * @param {Object} point Point data from the AerisAPI
   * @param {Object} options Additional marker options.
   * @return {aeris.maps.Marker}
   */
  aeris.maps.MarkerCollection.prototype.generateMarker = aeris.abstractMethod;


  /**
   * Fetch data associated with markers from AerisAPI.
   *
   * @method
   * @abstract
   * @param {Function} successCallback Function to execute when marker data
   *     is successfully loaded.
   * @param {Function} failCallback Function to execute when marker data fails
   *     to load.
   * @protected
   */
  aeris.maps.MarkerCollection.prototype.fetchMarkerData = aeris.abstractMethod;


  /**
   * Returns the handler method for a marker's `click` event
   *
   * @param {aeris.maps.markers.Icon} marker Bound marker.
   * @param {Object} data Data associated with marker.
   * @return {Function} onClick Handler.
   * @private
   */
  aeris.maps.MarkerCollection.prototype.getOnClick_ = function(marker, data) {
    var self = this;
    return function() {
      self.trigger('marker:click', marker, data);
    }
  };

  return aeris.maps.MarkerCollection;
});
