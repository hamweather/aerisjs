define([
  'aeris/util',
  'aeris/config',
  'mapbuilder/config/context',
  'routebuilder/routeapp/config/context',
  'routebuilder/routebuilder/config/context'
], function(_, config, mapBuilderContext, routeAppContext, routeBuilderContext) {
  /**
   * Dependency Injection / IoC container context
   * for the aeris.builder.routes.RouteAppBuilder.
   *
   * Extends {aeris.builder.maps.config.context}
   *
   * @class aeris.builder.routes.config.context
   * @extends aeris.builder.maps.config.context
   */
  return _.extend({},
    mapBuilderContext,
    {
      builderOptions: {
        create: {
          module: 'routebuilder/options/routebuilderoptions',
          args: [
            null,
            {
              defaults: {
                mapOptions: {
                  zoom: 12,
                  center: [44.98, -93.2636],
                  scrollZoom: true
                },
                route: {
                  path: {
                    strokeColor: '#36648b',
                    strokeOpacity: 0.8,
                    strokeWeight: 3
                  },
                  offPath: {
                    strokeColor: '#dd0000'
                  },
                  waypoint: {
                    url: config.get('path') + 'assets/marker_grey.png',
                    width: 20,
                    height: 20,
                    clickable: true,
                    draggable: true
                  },
                  selectedWaypoint: {
                    url: config.get('path') + 'assets/marker_yellow.png'
                  }
                },
                routeControls: {
                  undo: true,
                  travelModes: ['WALKING', 'DRIVING', 'BICYCLING'],
                  startingPoint: true,
                  distance: true,
                  metric: false
                },
                controls: {
                  layers: false,
                  markers: false,
                  routes: true
                }
              },
              mapObjectTypes: ['layers', 'markers']
            }
          ]
        }
      }
    },
    routeAppContext, routeBuilderContext);
});