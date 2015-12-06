module.exports = function(config){
  'use strict';

  config.set({

    basePath : './',

    files : [
      'components/angular/angular.js',
      'components/angular-route/angular-route.js',
      'components/angular-resource/angular-resource.js',
      'components/angular-mocks/angular-mocks.js',
      'ts_output_readonly_do_NOT_change_manually/src/*.js'
    ],

    reporters: ['progress', 'coverage'],

    preprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      //'gameLogic.js': ['coverage']
      'ts_output_readonly_do_NOT_change_manually/src/gameLogic.js': ['coverage'],
    },

    // optionally, configure the reporter
    coverageReporter: {
      type : 'html',
      dir : 'coverage/'
    },

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Chrome'],

    plugins : [
            'karma-chrome-launcher',
            'karma-jasmine',
            'karma-coverage'
            ],

  });
};
