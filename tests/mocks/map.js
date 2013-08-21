define(['aeris', 'base/map', 'base/mapoptions'], function(aeris, Map, MapOptions) {


  /**
   * @constructor
   */
  var MockMap = function() {
    var MockMap_ = function() {};
    aeris.inherits(MockMap_, Map);

    var MockMapOptions_ = function() {
      aeris.Events.call(this);
    };
    aeris.inherits(MockMapOptions_, MapOptions);

    var mockMap = new MockMap_();
    mockMap.options = new MockMapOptions_();

    return mockMap;
  };

  return MockMap;

});
