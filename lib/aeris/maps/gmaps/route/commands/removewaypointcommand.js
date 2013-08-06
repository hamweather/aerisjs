/**
 * @fileoverview Defines the RemoveWaypointCommand.
*/
define([
  'aeris',
  'gmaps/route/commands/abstractroutecommand',
  'gmaps/route/route',
  'gmaps/route/waypoint',
  'gmaps/utils',
  'aeris/utils',
  'aeris/promise',
  'aeris/errors/invalidargumenterror'
], function(aeris, AbstractRouteCommand, Route, Waypoint, gUtils, utils, Promise, InvalidArgumentError) {

  aeris.provide('aeris.maps.gmaps.route.commands.RemoveWaypointCommand');


  aeris.maps.gmaps.route.commands.RemoveWaypointCommand = function(route, waypoint) {
    AbstractRouteCommand.apply(this, arguments);

    if (!(waypoint instanceof Waypoint)) {
      throw new InvalidArgumentError('A RemoveWaypointCommand requires a valid Waypoint.');
    }

    // Check that waypoint exists in route
    if (!route.has(waypoint)) {
      throw new InvalidArgumentError('Cannot remove waypoint, as it is not in the specified route.');
    }


    /**
     * The Waypoint being added to the Route.
     *
     * @type {aeris.maps.gmaps.route.Waypoint}
     * @private
     */
    this.waypoint_ = waypoint;
  };

  aeris.inherits(
    aeris.maps.gmaps.route.commands.RemoveWaypointCommand,
    AbstractRouteCommand
  );


  /**
   * @override
   */
  aeris.maps.gmaps.route.commands.RemoveWaypointCommand.prototype.execute_ = function() {
    var self = this;
    var next = this.route_.getNext(this.waypoint_);
    var prev = this.route_.getPrevious(this.waypoint_);
    var subPromise = new Promise();
    var masterPromise = new Promise();

    switch (this.getWaypointPosition_()) {
      // First waypoint in route
      case 0:
        // Remove path from following waypoint
        if (next) {
          next.set({
            path: null,
            distance: 0
          });
        }

        subPromise.resolve();
        break;

      // Middle waypoint in route
      case 1:
        if (this.waypoint_.followDirections) {
          prev.fetchPathTo(next, this.googleDirectionsService_).done(function(res) {
            next.set({
              path: res.path,
              distance: res.distance
            });

            subPromise.resolve();
          }).fail(function() {
            subPromise.reject(arguments);
          });
        }
        else {
          // Not following paths
          next.set({
            path: [prev.getLatLon(), next.getLatLon()],
            followDirections: false,
            distance: prev.calculateDirectDistanceTo(next)
          });

          subPromise.resolve();
        }
        break;

      // Last waypoint in route
      case 2:
        // Nothing much to do here, really.
        subPromise.resolve();
        break;
    }

    // Remove the waypoint once all the data is fetched
    // Then resolve master promise
    subPromise.done(function() {
      this.removeWaypointFromRoute_();
      masterPromise.resolve();
    }, this).fail(function() {
      masterPromise.reject();
    }, this);

    return masterPromise;
  };


  /**
   * Returns position of waypoint in route.
   *
   * @private
   *
   * @param {aeris.maps.gmaps.route.Route=} route Defaults to this.route_.
   * @param {aeris.maps.gmaps.route.Waypoint=} waypoint Defaults to this.waypoint_.
   * @return {number} 0 = first waypoint, 1 = middle waypoint, 2 = last waypoint.
   */
  aeris.maps.gmaps.route.commands.RemoveWaypointCommand.prototype.getWaypointPosition_ = function(route, waypoint) {
    var routeWaypoints;

    route || (route = this.route_);
    waypoint || (waypoint = this.waypoint_);

    routeWaypoints = route.getWaypoints();

    if (routeWaypoints.indexOf(waypoint) === 0) {
      return 0;
    }
    else if (routeWaypoints.indexOf(waypoint) === (routeWaypoints.length - 1)) {
      return 2;
    }
    else {
      return 1;
    }
  };

  /**
   * Removes the waypoint model from the route collection.
   *
   * @param {aeris.maps.gmaps.route.Route=} route Defaults to this.route_.
   * @param {aeris.maps.gmaps.route.Waypoint=} waypoint Defaults to this.route_.
   * @private
   */
  aeris.maps.gmaps.route.commands.RemoveWaypointCommand.prototype.removeWaypointFromRoute_ = function(route, waypoint) {
    route || (route = this.route_);
    waypoint || (waypoint = this.waypoint_);

    route.remove(waypoint);
  };


  return aeris.maps.gmaps.route.commands.RemoveWaypointCommand;
});
