define(['aeris', 'base/marker'], function(aeris) {

  /**
   * @fileoverview Representation of an Icon Marker.
   */


  aeris.provide('aeris.maps.markers.Icon');


  /**
   * Create an Icon Marker.
   *
   * @param {string} url URL to the icon
   * @param {number} width Width of the icon
   * @param {number} height Height of the icon
   * @constructor
   * @extends {aeris.maps.Marker}
   */
  aeris.maps.markers.Icon =
      function(position, url, width, height, opt_options) {
    aeris.maps.Marker.call(this, position, opt_options);
    this.strategy.push('Icon');


    /**
     * @override
     */
    this.name = 'Icon';


    /**
     * The URL of the Icon.
     *
     * @type {string}
     */
    this.url = url;


    /**
     * The width of the Icon.
     *
     * @type {number}
     */
    this.width = width;


    /**
     * The height of the Icon.
     *
     * @type {number}
     */
    this.height = height;

  };
  aeris.inherits(aeris.maps.markers.Icon, aeris.maps.Marker);


  return aeris.maps.markers.Icon;

});
