define([
  'aeris',
  'aeris/promise',
  'jasmine',
  'sinon',
  'jquery',
  'gmaps/route/route',
  'gmaps/route/routerenderer',
  'gmaps/route/routebuilder',
  'aeris/commands/commandmanager',
  'gmaps/route/commands/addwaypointcommand',
  'gmaps/route/commands/removewaypointcommand',
  'mocks/waypoint',
  'gmaps/map',
  'testErrors/untestedspecerror'
], function(
    aeris,
    Promise,
    jasmine,
    sinon,
    $,
    Route,
    RouteRenderer,
    RouteBuilder,
    CommandManager,
    AddWaypointCommand,
    RemoveWaypointCommand,
    MockWaypoint,
    AerisMap,
    UntestedSpecError
) {
  var map, $canvas;

  function getMockWaypoints() {
    return [
      new MockWaypoint(null, true),
      new MockWaypoint(),
      new MockWaypoint()
    ];
  }

  beforeEach(function() {
    $canvas = $('<div id="map-canvas"></div>').appendTo('body');
    map = new AerisMap('map-canvas', {
      center: [44.98, -93.2636],
      zoom: 15
    });


    // Wait for the map to initialize
    waitsFor(function() {
      return map.initialized.state === 'resolved';
    }, 'map to initialize', 1000);
  });

  afterEach(function() {
    map = null;
    $canvas.remove();
  });


  describe('A RouteBuilder', function() {
    it('should require an AerisMap', function() {
      expect(function() {
        new RouteBuilder(null);
      }).toThrowType('InvalidArgumentError');

      new RouteBuilder(map);
    });

    describe('Its Route', function() {

      it('should create a Route', function() {
        spyOn(aeris.maps.gmaps.route.Route.prototype, 'on');

        new RouteBuilder(map);
        // Testing indirectly, because of trouble with
        // Jasmine removing 'on' method when mocking
        // constructor.
        expect(aeris.maps.gmaps.route.Route.prototype.on).toHaveBeenCalled();
      });

      it('should return a route with getRoute()', function() {
        var builder = new RouteBuilder(map);

        expect(builder.getRoute() instanceof aeris.maps.gmaps.route.Route).toEqual(true);
      });

      it('should accept a Route', function() {
        var route = new Route();
        var builder = new RouteBuilder(map, { route: route });

        expect(builder.getRoute()).toEqual(route);
      });

      it('should bind events to its route', function() {
        var route;

        route = new Route();
        spyOn(route, 'on');

        new RouteBuilder(map, { route: route });
        expect(route.on).toHaveBeenCalled();
      });

      it('should set a Route', function() {
        var oldRoute = new Route();
        var builder = new RouteBuilder(map, { route: oldRoute });
        var newRoute = new Route();

        spyOn(newRoute, 'on');
        builder.setRoute(newRoute);
        expect(newRoute.on).toHaveBeenCalled();
      });

      it('should unbind route events', function() {
        var builder;
        var route = new Route();

        spyOn(route, 'on');
        spyOn(route, 'off');

        builder = new RouteBuilder(map, { route: route });

        builder.undelegateEvents();
        expect(route.off.callCount).toEqual(route.on.callCount);
      });

      it('should bind events to a new route, and clean up the old route\'s events', function() {
        var builder;
        var oldRoute = new Route();
        var newRoute = new Route();

        spyOn(oldRoute, 'on');
        spyOn(oldRoute, 'off');
        spyOn(newRoute, 'on');

        builder = new RouteBuilder(map, { route: oldRoute });
        builder.setRoute(newRoute);

        expect(oldRoute.off.callCount).toEqual(oldRoute.on.callCount);
        expect(newRoute.on.callCount).toEqual(oldRoute.on.callCount);
      });
    });

    describe('Its RouteRenderer', function() {
      var route = new Route();
      it('should create a RouteRenderer', function() {
        spyOn(aeris.maps.gmaps.route, 'RouteRenderer').andCallThrough();

        new RouteBuilder(map, { route: route });
        expect(aeris.maps.gmaps.route.RouteRenderer).toHaveBeenCalled();
      });

      it('should accept a RouteRenderer', function() {
        var route = new Route();
        var renderer = new RouteRenderer(map);
        spyOn(aeris.maps.gmaps.route, 'RouteRenderer');

        new RouteBuilder(map, { routeRenderer: renderer, route: route });

        // Check that RouteRendered not called a second time
        expect(aeris.maps.gmaps.route.RouteRenderer).not.toHaveBeenCalled();
      });
    });

    describe('Its AerisMap', function() {

      it('should require an AerisMap', function() {
        expect(function() {
          new RouteBuilder();
        }).toThrowType('InvalidArgumentError');
      });
    });

    describe('Manage Waypoints using commands', function() {
      it('should add a waypoint', function() {
        var builder = new RouteBuilder(map);

        spyOn(AddWaypointCommand.prototype, 'execute').andCallThrough();
        builder.addWaypoint(new MockWaypoint());

        expect(AddWaypointCommand.prototype.execute).toHaveBeenCalled();
      });

      it('should remove a waypoint', function() {
        var waypoints = [
          new MockWaypoint(null, true),
          new MockWaypoint(),
          new MockWaypoint
        ];
        var builder = new RouteBuilder(map, {
          route: new Route(waypoints)
        });

        spyOn(RemoveWaypointCommand.prototype, 'execute').andCallThrough();
        builder.removeWaypoint(waypoints[1]);

        expect(RemoveWaypointCommand.prototype.execute).toHaveBeenCalled();
      });

      it('should reset waypoints', function() {
        var newWaypoints = getMockWaypoints();
        var route = new Route(getMockWaypoints());
        var builder = new RouteBuilder(map, {
          route: route
        });

        spyOn(route, 'reset');

        builder.resetRoute(newWaypoints);
        expect(route.reset).toHaveBeenCalledWith(newWaypoints);
      });

      it('should undo and redo commands, using a CommandManager', function() {
        var builder = new RouteBuilder(map);

        // Mock the addwaypoint command, to limit test scope
        spyOn(AddWaypointCommand.prototype, 'execute').andReturn(new Promise());

        builder.addWaypoint(new MockWaypoint());

        spyOn(CommandManager.prototype, 'undo');
        spyOn(CommandManager.prototype, 'redo');

        builder.undo();
        expect(CommandManager.prototype.undo).toHaveBeenCalled();

        builder.redo();
        expect(CommandManager.prototype.redo).toHaveBeenCalled();
      });
    });

    describe('Delegate route events to RouteRenderer', function() {
      var route, renderer, builder, waypoints;

      beforeEach(function() {
        waypoints = [
          new MockWaypoint({}, true),
          new MockWaypoint(),
          new MockWaypoint()
        ];
        route = new Route();
        renderer = new RouteRenderer(map);
        builder = new RouteBuilder(map, { route: route, routeRenderer: renderer });
      });

      afterEach(function() {
        route = null;
        renderer = null;
        builder = null;
      });

      it('should render an Icon on Route#add', function() {
        var waypoint = new MockWaypoint(null, true);

        spyOn(renderer, 'renderWaypoint');

        route.add(waypoint);
        expect(renderer.renderWaypoint).toHaveBeenCalled();
      });

      it('should remove a waypoint on Route#remove', function() {
        route.add(waypoints[0]);
        route.add(waypoints[1]);
        route.add(waypoints[2]);

        spyOn(renderer, 'eraseWaypoint');
        spyOn(renderer, 'renderWaypoint');

        route.remove(waypoints[1]);

        // Test render this wp
        expect(renderer.eraseWaypoint).toHaveBeenCalled();

        // Test: re-render next wp
        expect(renderer.renderWaypoint).toHaveBeenCalled();
      });

      it('should render an path on adding two or more waypoints', function() {
        var wp1 = new MockWaypoint(null, true);
        var wp2 = new MockWaypoint();
        var wp3 = new MockWaypoint();

        spyOn(renderer, 'renderWaypoint');

        route.add(wp1);
        route.add(wp2);
        route.add(wp3);
        expect(renderer.renderWaypoint.callCount).toEqual(3);
      });

      it('should re-render a route on Route#reset', function() {
        route.add(waypoints[0]);

        spyOn(renderer, 'eraseRoute');
        spyOn(renderer, 'renderRoute');

        route.reset(getMockWaypoints());
        expect(renderer.eraseRoute).toHaveBeenCalledWith(route);
        expect(renderer.renderRoute).toHaveBeenCalledWith(route);
      });
    });
  });
});
