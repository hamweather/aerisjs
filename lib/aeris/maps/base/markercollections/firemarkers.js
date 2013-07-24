define([
  'aeris', 'aeris/aerisapi', 'base/markercollection', 'base/markers/fireicon'
], function(aeris) {

  /**
   * @fileoverview Defines the {aeris.maps.markerCollections.FireMarkers} class.
   */

  aeris.provide('aeris.maps.markerCollections.FireMarkers');


  /**
   * A collection of markers associated with fire data.
   * Data provided by the Aeris API `fires` endpoint
   * @see {@link http://www.hamweather.com/support/documentation/aeris/endpoints/fires|Aeris API Documentation}
   *
   * @param {Object} opt_options Options to pass to the {aeris.maps.markers.Icon} object.
   * @extends aeris.maps.MarkerCollection
   * @constructor
   */
  aeris.maps.markerCollections.FireMarkers = function(opt_options) {
    aeris.maps.MarkerCollection.apply(this, arguments);
  };

  // Extend from MarkerCollection
  aeris.inherits(
    aeris.maps.markerCollections.FireMarkers,
    aeris.maps.MarkerCollection
  );


  /**
   * @override
   */
  aeris.maps.markerCollections.FireMarkers.prototype.fetchMarkerData = function(successCallback, failCallback) {
    aeris.AerisAPI.getInstance().getFireData().
        done(successCallback, this).
        fail(failCallback, this);
  };


  /**
   * @override
   */
  aeris.maps.markerCollections.FireMarkers.prototype.generateMarker =
      function(point, options) {
    var latLon = [point.loc.lat, point.loc.long];
    var marker = new aeris.maps.markers.FireIcon(latLon, options);
    return marker;
  };


  return aeris.maps.markerCollections.FireMarkers;

});
