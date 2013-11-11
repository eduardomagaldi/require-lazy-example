{ main: 
   { parents: [],
     deps: [ 'bower_components/require-lazy/lazy' ],
     index: 0,
     name: 'main',
     bundleDeps: 
      [ { id: 'f1d347ae2b45e97ffdc6d553d7cd1656',
          deps: [ 'bower_components/require-lazy/lazy' ],
          exclusive: true } ],
     excludedDeps: [],
     hash: 'eb057a929cd50d09e1c925bb0e57c155' },
  banana: 
   { parents: [ 'main' ],
     deps: [],
     index: 1,
     name: 'banana',
     bundleDeps: [],
     excludedDeps: [ 'lazy' ],
     hash: '1eade7cae8105a804875d39cd04b8752' },
  maca: 
   { parents: [ 'main' ],
     deps: [],
     index: 2,
     name: 'maca',
     bundleDeps: [],
     excludedDeps: [ 'lazy' ],
     hash: 'b3d3ac66eb3b6bcb311b6f1ac48cd519' } }