      'use strict'
//var colours = { Gam: 'rgba( 255, 0, 0, 0.1)', ring: 'rgba( 0, 255, 0, 0.1 )', troph: 'rgba( 0, 0, 255, 0.1 )', schizont: 'rgba( 66, 66, 66, 0.1 )' };
var colours = { Gam: 'red', ring: 'blue', troph: 'green', schizont: 'cyan' };
var shapes  = { '7G8': 'x-thin', 'NF54': 'cross-thin' };
Plotly.d3.csv('/mca/data/pf/new/gammetadata.csv', function(err, rows){
  var rows1 = rows.filter(function(row) { return row['Strain'] == '7G8'; });
  var rows2 = rows.filter(function(row) { return row['Strain'] == 'NF54'; });
  rows=[];
  function unpack(r, key ) {
    return r.map(function(row) { return row[key]; });
  }

  var points = [{
    x:unpack(rows1, 'PC_1'), y: unpack(rows1, 'PC_2'), z: unpack(rows1, 'PC_3'),
    mode: 'markers',
    marker: {
      size: 6,
      opacity: 0.01,
      color: unpack(rows1,'Stage').map( function(a) { return colours[a]; } ),
      symbol: 'diamond-tall',
    },
    type: 'scatter3d'
  },{
    x:unpack(rows2, 'PC_1'), y: unpack(rows2, 'PC_2'), z: unpack(rows2, 'PC_3'),
    mode: 'markers',
    marker: {
      size: 6,
      opacity: 0.01,
      color: unpack(rows2,'Stage').map( function(a) { return colours[a]; } ),
      symbol: 'circle',
    },
    type: 'scatter3d'
  }];
  Plotly.newPlot('mydiv', points, {margin: { l: 0, r: 0, b: 0, t: 0 }} );
});
// Main menu to change "pages"....
  if ('NodeList' in window && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function (callback, thisArg) {
      thisArg = thisArg || window;
      for (var i = 0; i < this.length; i++) {
        callback.call(thisArg, this[i], i, this);
      }
    };
  }
      document.querySelectorAll( '#species a, nav ul:first-of-type a' ).forEach(function(n){
        n.addEventListener( 'click', function(e) {
          e.preventDefault();
          var nid = this.hash.substr(1); console.log(nid);
          document.querySelectorAll( 'section' ).forEach(function(t){
            if( t.id === nid ) { t.classList.add( 'active' ); } else { t.classList.remove( 'active' ); }
          });
          document.querySelectorAll( 'nav ul:nth-of-type(n+1)' ).forEach(function(t){
            if( t.id === nid+'-menu' ) { t.classList.add( 'active' ); } else { t.classList.remove( 'active' ); }
          });
        } );
      });
