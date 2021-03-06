define([
  'aeris/util',
  'aeris/errors/validationerror',
  'aeris/viewmodel',
  'aeris/maps/extensions/strategyobject',
  'aeris/promise'
], function(_, ValidationError, ViewModel, StrategyObject, Promise) {
  /**
   * An abstraction for an object to be handled by a map extension.
   *
   * A MapExtensionObject holds meta-data about view being rendered
   * on a map; for example, the color of a polyline, the opacity of
   * a layer, the url endpoint for fetching tile images.
   *
   * A MapExtensionObject creates a strategy, whose job is to render
   * the metadata held by a MapExtObj onto a map. The MapExtObj tells
   * the strategy about itself, then let's the strategy do it's thing.
   *
   * @override
   * @param {Object=} opt_attrs
   * @param {Object=} opt_options
   *
   * @constructor
   *
   * @class aeris.maps.extensions.MapExtensionObject
   * @extends aeris.ViewModel
   * @uses aeris.maps.extensions.StrategyObject
   * @implements aeris.maps.MapObjectInterface
   */
  var MapExtensionObject = function(opt_attrs, opt_options) {
    var attrs = _.defaults(opt_attrs || {}, {
      map: null
    });


    /**
     * Default {aeris.Strategy} implementation
     *
     * @property strategy_
     * @type {aeris.maps.Strategy} Strategy constructor.
     */


    /**
     * An AerisMap that the object is bound to. This is set with setMap.
     *
     * @attribute map
     * @type {aeris.maps.Map}
     * @protected
     */


    /**
     * A name/type for the object.
     *
     * @attribute name
     * @type {string}
     */

    ViewModel.call(this, attrs, opt_options);

    StrategyObject.call(this, _.pick(opt_options || {}, 'strategy'));


    // Trigger map:set/remove events
    this.listenTo(this, {
      'change:map': function(model, value, options) {
        var topic = this.hasMap() ? 'map:set' : 'map:remove';
        this.trigger(topic, model, value, options);
      }
    });
  };
  _.inherits(MapExtensionObject, ViewModel);
  _.extend(MapExtensionObject.prototype, StrategyObject.prototype);


  /**
   * @method validate
   */
  MapExtensionObject.prototype.validate = function(attrs) {
    if (attrs.map !== null && !(attrs.map instanceof aeris.maps.Map)) {
      return new ValidationError('Aeris Map', 'Invalid map object');
    }
  };


  /**
   * @method setMap
   */
  MapExtensionObject.prototype.setMap = function(aerisMap, opt_options) {
    var options = _.defaults(opt_options || {}, {
      validate: true
    });
    this.set('map', aerisMap, options);
  };

  /**
   * @method getMap
   */
  MapExtensionObject.prototype.getMap = function() {
    return this.get('map');
  };


  /**
   * @return {Boolean} Returns true if the layer has a map set.
   * @method hasMap
   */
  MapExtensionObject.prototype.hasMap = function() {
    return this.has('map');
  };


  /**
   * Returns the object view,
   * as rendered by the object's strategy.
   *
   * @throws {Error} If no strategy has been set on the object.
   *
   * @return {*}
   * @method getView
   */
  MapExtensionObject.prototype.getView = function() {
    if (!this.strategy_) {
      throw new Error('Unable to get MapExtensionObject view: ' +
        'no strategy is available for this object.');
    }

    return this.strategy_.getView();
  };


  /**
   * @method destroy
   */
  MapExtensionObject.prototype.destroy = function() {
    this.stopListening();
    this.removeStrategy();
  };


  return MapExtensionObject;

});
