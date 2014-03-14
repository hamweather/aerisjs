require.config({
  baseUrl: '../',
  //urlArgs: 'cb=' + Math.random(),                   // Cache buster
  paths: {
    jasmine: 'bower_components/jasmine/lib/jasmine-core/jasmine',
    'jasmine-console': 'tests/lib/jasmine-console',
    'jasmine-html': 'bower_components/jasmine/lib/jasmine-core/jasmine-html',
    'jasmine-slow': 'bower_components/jasmine-slow/lib/jasmine-slow',
    sinon: 'bower_components/sinon/index',
    spec: 'tests/spec',
    integration: 'tests/integration',
    mocks: 'tests/mocks',
    matchers: 'tests/lib/matchers',
    testErrors: 'tests/errors',
    testUtils: 'tests/testutils',
    flag: 'tests/flag',
    googlemaps: 'tests/mocks/googlemaps',
    'aeris/maps/strategy': 'src/maps/gmaps'
  },
  shim: {
    jasmine: {
      exports: 'jasmine'
    },
    'jasmine-html': {
      deps: ['jasmine'],
      exports: 'jasmine'
    },
    'jasmine-slow': {
      deps: ['jasmine'],
      exports: 'jasmine'
    },
    'jasmine-console': {
      deps: ['jasmine'],
      exports: 'jasmine'
    },
    'sinon': {
      exports: 'sinon'
    }
  },
  map: {
    'tests/lib/jasmine-modified': {
      jasmine: 'jasmine'
    },
    '*': {
      jasmine: 'tests/lib/jasmine-modified'
    }
  },
  waitSeconds: 3
});
