define([
  'aeris', 'aeris/aerisapi', 'base/markercollection',
  'base/markers/lightningicon'
], function(aeris) {

  /**
   * @fileoverview Defines the {aeris.maps.markerCollections.LightningMarkers} class.
   */

  aeris.provide('aeris.maps.markerCollections.LightningMarkers');


  /**
   * A collection of markers associated with lightning data.
   * Data provided by the Aeris API `lightning` endpoint
   *
   * @param {Object} opt_options Options to pass to the {aeris.maps.markers.Icon} object.
   * @extends aeris.maps.MarkerCollection
   * @constructor
   */
  aeris.maps.markerCollections.LightningMarkers = function(opt_options) {

    aeris.maps.MarkerCollection.apply(this, arguments);

  };

  // Extend from MarkerCollection
  aeris.inherits(
    aeris.maps.markerCollections.LightningMarkers,
    aeris.maps.MarkerCollection
  );


  /**
   * @override
   */
  aeris.maps.markerCollections.LightningMarkers.prototype.fetchMarkerData =
      function(successCallback, failCallback) {
    this.aerisMap.options.on('bounds:change', function(bounds) {
      aeris.AerisAPI.getInstance().getLightningData(bounds).
          done(successCallback, this).
          fail(failCallback, this);
    }, this);
  };


  /**
   * @overrides
   */
  aeris.maps.markerCollections.LightningMarkers.prototype.generateMarker =
      function(point, options) {
    var latLon = [point.loc.lat, point.loc.long];
    var timestamp = point.ob.timestamp;
    var marker = new aeris.maps.markers.LightningIcon(latLon, timestamp,
                                                      options);
    return marker;
  };


  return aeris.maps.markerCollections.LightningMarkers;

});
