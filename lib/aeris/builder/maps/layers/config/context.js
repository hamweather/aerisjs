/**
 * Context for the Layers module
 *
 * @property aeris.builder.maps.layers.config.context
 * @type {Object}
 */
define({

  LayerState: _.classFactorySpec({
    create: {
      module: 'mapbuilder/core/model/mapobjectstate',
      args: [
        undefined,
        {
          namespace: 'aeris.maps.layers'
        }
      ]
    }
  }),

  layerStateCollection: {
    create: {
      module: 'mapbuilder/core/collection/mapobjectstatecollection',
      args: [
        undefined,
        {
          // use the LayerState model
          model: {$ref: 'LayerState' }
        }
      ]
    }
  },

  layersModule: {
    create: {
      module: 'mapbuilder/core/module/mapobjectmodule',
      args: [{
        appState: { $ref: 'appState' },
        appStateAttr: 'layers',
        moduleState: { $ref: 'layerStateCollection' },

        mapObjectController: { $ref: 'layerViewController' },

        moduleController: { $ref: 'layerControlsController' }
      }]
    },
    init: {
      // Region setter-injection
      setRegion: ['layerControls', { $ref: 'mapAppLayout' }]
    }
  },

  // Controller for Layer MapExtObjs
  layerViewController: {
    create: {
      module: 'mapbuilder/core/controller/mapobjectcollectioncontroller',
      args: [{
        collection: { $ref: 'layerStateCollection' },
        itemViewOptions: {
          appState: { $ref: 'appState' }
        }
      }]
    }
  },

  layerControlsController: {
    create: {
      module: 'application/form/controller/togglecollectioncontroller',
      args: [{
        collection: { $ref: 'layerStateCollection' },
        className: 'aeris-map-controls',
        itemViewOptions: {
          template: { module: 'hbs!mapbuilder/core/view/toggle.html' }
        }
      }]
    }
  }
});