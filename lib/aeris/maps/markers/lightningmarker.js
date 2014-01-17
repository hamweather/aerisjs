define([
  'ai/util',
  'ai/config',
  'ai/maps/markers/pointdatamarker'
], function(_, config, PointDataMarker) {
  /**
   * @class aeris.maps.markers.LightningMarker
   * @extends aeris.maps.markers.PointDataMarker
   * @constructor
   */
  var LightningMarker = function(opt_attrs, opt_options) {
    var attrs = _.extend({
      url: config.get('path') + 'assets/lightning_white.png'
    }, opt_attrs);

    PointDataMarker.call(this, attrs, opt_options);
  };
  _.inherits(LightningMarker, PointDataMarker);


  /**
   * @override
   */
  LightningMarker.prototype.lookupTitle_ = function() {
    return 'Lightning';
  };


  return LightningMarker;
});