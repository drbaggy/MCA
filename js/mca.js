'use strict';

// page navigation
function qs( el, s )       { if( 'string' === typeof el ) { s = el; el = document } return el.querySelector( s );                      }
function aqs( el, s )      { if( 'string' === typeof el ) { s = el; el = document } return Array.from(document.querySelectorAll( s )); }
function _m( el, s, f )    { if( 'string' === typeof el ) { f = s; s = el; el = document } aqs(s).forEach( f );                        }
function _1( el, s, f )    { if( 'string' === typeof el ) { f = s; s = el; el = document } var z = qs(s); if( z ) { return f( z ); }   }
function dis( n )      { n.classList.remove('active');                      }
function act( n )      { n.classList.add('active');                         }
function isactive( n ) { return n.classList.contains('active' );            }

//======================================================================
// Navigation elements....
//======================================================================
// Top level navigation - select species [primary header nav]
//----------------------------------------------------------------------
_m( 'nav:first-of-type ul:first-of-type a, footer p:nth-of-type(2) a, #species a', function(n) {
  n.onclick = function( e ) {
    e.preventDefault();
    if( ! _1(n.hash, isactive ) ) {
      _m('main > section, nav:first-of-type ul:nth-of-type(n+2)', dis ); // hide current menu + "page"
      _1(n.hash, act );                                                  // Show page!
      _1(n.hash+'-menu', act );                                          // Show new menu if it exists!
      find_active_graph();
    }
  }
});
//----------------------------------------------------------------------
// Secondary navigation level - select dataset [secondary header nav]
//----------------------------------------------------------------------
_m( 'ul.datatabs a', function(n) {
  n.onclick = function( e ) {
    e.preventDefault();
    if( ! _1(n.hash, isactive ) ) {
      var r = n.hash.split('-');
      _m(r[0]+' > div > section', dis );   // Hide all sections in this species..
      _1(n.hash,act);
      find_active_graph();
    }
  }
});
//----------------------------------------------------------------------
// Ternary navigation level - select view [ data set panel nav ]
//----------------------------------------------------------------------
_m('.data section h3 a',function(n){
  n.onclick = function (e) {
    e.preventDefault();
    if( ! _1(n.hash, isactive ) ) {
      var r = n.hash.split('-');
      _m(r[0]+'-'+r[1]+' div', dis );
      _1(n.hash,act);
      find_active_graph();
    }
  }
});

function find_active_graph() {
  var a = qs( '.active .active .active .graph' )
  Plotly.relayout( a.id,{width:a.offsetWidth,height:a.offsetHeight});
}

function unpack(r, key ) {
  return r.map(function(row) { return row[key]; });
}

var stages = [
  ["rings",               0,"#78C679"],
  ["early trophozoites",  1,"#FEB24C"],
  ["mid trophozoites",    2,"#F4CF63"],
  ["late trophozoites",   3,"#FEEEAA"],
  ["early schizonts",     4,"#85B1D3"],
  ["late schizonts",      5,"#C9E8F1"],
  ["early gametocytes",   6,"#CAB2D6"],
  ["late gametocytes",    7,"#6A3D9A"]
];
var days = [
  ["D1",  0,"#009900"],
  ["D2",  1,"#990000"],
  ["D3",  2,"#000099"],
  ["D4",  3,"#999999"],
  ["D6",  4,"#990099"],
  ["D8",  5,"#009999"],
  ["D10", 6,"#999900"],
];
var colours = { stage: {}, days: {} };
stages.forEach( _ => colours.stage[_[0]] = _[2] );
days.forEach(   _ => colours.days[ _[0]] = _[2] );
load_data('#pf-new');

var configuration = {
  marker_size: 2
};
var settings = {
  filters: { stage:{}, days:{} },
  colour_by:    'stage',
  current_gene: 'PF3D7-0935900',
}
stages.forEach( _ => settings.filters.stage[_[0]] = true );
days.forEach(   _ => settings.filters.days[ _[0]] = true );
console.log( settings );

function load_data( id ) {
  var path = '/mca/data/' + (qs(id).dataset.directory) + '/samples.json';
  var plotdata;

  Plotly.d3.json(path, function(err, plotdata) {
    var active_gene   = 'PF3D7-0935900';
    var colours_day   = plotdata.DAY.map(      function(a) { return colours.days[a]; } );
    var colours_stage = plotdata.STAGE_HR.map( function(a) { return colours.stage[a]; } );
    var colours_gene  = 'red';
    var size_filters  = plotdata.STAGE_HR.map( a => 1                        );
    var current_gene  = '';
    var size_colours  = plotdata.STAGE_HR.map( a => configuration.marker_size );
    var points_PC = [{
      x:plotdata.PC_1, y: plotdata.PC_2, z:plotdata.PC_3,
      mode: 'markers',
      text: plotdata.CELL_ID,
      marker: { size: configuration.marker_size, color: colours_stage, line: {width:0} },
      type: 'scatter3d'
    }];
    var points_UMAP = [{
      x:plotdata.UMAP_1, y: plotdata.UMAP_2, z:plotdata.UMAP_3,
      mode: 'markers',
      text: plotdata.CELL_ID,
      marker: { size: configuration.marker_size, color: colours_stage, line: {width:0} },
      type: 'scatter3d'
    }];
    Plotly.newPlot('pf-new-pca-graph', points_PC, {
      autosize: true,
      margin: { l: 5, r: 5, b: 5, t: 5 },
      scene: {
        xaxis: { range: [ -10,25 ], title: 'PC 1' },
        yaxis: { range: [ -12,29 ], title: 'PC 2' },
        zaxis: { range: [ -23,12 ], title: 'PC 3' }
      }
    }, {responsive:true});
    Plotly.newPlot( 'pf-new-umap-graph', points_UMAP, {
      autosize:true,
      margin: { l: 5, r: 5, b: 5, t: 5 },
      scene: {
        xaxis: { range: [ -5,6 ], title: 'UMAP 1' },
        yaxis: { range: [ -3,4 ], title: 'UMAP 2' },
        zaxis: { range: [ -6,3 ], title: 'UMAP 3' }
      }
    }, {responsive: true});

    var nav = qs('#pf nav');

    function exp_colour(a,mx) {
      var x = 55; var nx = 255-x;
      return 'rgb('+(nx+x*a/mx)+','+(nx*(mx-a)/mx)+','+(nx*(mx-a)/mx)+')';
    }
    function changeGene( n ) { n.onchange = function(e) {
      var new_gene = qs( nav, '#pf-new-gene' ).value;
      if( current_gene == new_gene ) {
        Plotly.restyle( 'pf-new-umap-graph', { 'marker.color': [colours_gene] } );
        Plotly.restyle( 'pf-new-pca-graph',  { 'marker.color': [colours_gene] } );
      } else {
        Plotly.d3.json( '/mca/data/' + (qs(id).dataset.directory) + '/expression/'+new_gene+'.json', function(err,expdata) {
          var max_exp  = expdata.max;
          var counter  = 0;
          colours_gene = expdata.data.map( a => exp_colour(a,max_exp)                   );
          size_colours = expdata.data.map( a => configuration.marker_size + a/max_exp*9 );
          var size     = size_colours.map( a => size_filters[counter++] * a              );
          Plotly.restyle( 'pf-new-umap-graph', { 'marker.color': [colours_gene], 'marker.size':[size] } );
          Plotly.restyle( 'pf-new-pca-graph',  { 'marker.color': [colours_gene], 'marker.size':[size] } );
        });
      }
    }};
    function changeColour( n ) { n.onchange = function(e) {
      if( qs(nav, 'input[type="radio"][value="day"]').checked ) {
        Plotly.restyle( 'pf-new-umap-graph',  { 'marker.color':  [colours_day]   } );
        Plotly.restyle( 'pf-new-pca-graph',   { 'marker.color': [colours_day]   } );
      } else if( qs(nav, 'input[type="radio"][value="stage"]').checked ) {
        Plotly.restyle( 'pf-new-umap-graph',  { 'marker.color':  [colours_stage] } );
        Plotly.restyle( 'pf-new-pca-graph',   { 'marker.color': [colours_stage] } );
      } else {
        var new_gene = qs( nav, '#pf-new-gene' ).value;
        if( current_gene == new_gene ) {
          Plotly.restyle( 'pf-new-umap-graph', { 'marker.color': [colours_gene] } );
          Plotly.restyle( 'pf-new-pca-graph',  { 'marker.color': [colours_gene] } );
        } else {
          Plotly.d3.json( '/mca/data/' + (qs(id).dataset.directory) + '/expression/'+new_gene+'.json', function(err,expdata) {
            var max_exp  = expdata.max;
            var counter  = 0;
            colours_gene = expdata.data.map( a => exp_colour(a,max_exp)                   );
            size_colours = expdata.data.map( a => configuration.marker_size + a/max_exp*9 );
            var size     = size_colours.map( a => size_filters[counter++] * a              );
            Plotly.restyle( 'pf-new-umap-graph', { 'marker.color': [colours_gene], 'marker.size':[size] } );
            Plotly.restyle( 'pf-new-pca-graph',  { 'marker.color': [colours_gene], 'marker.size':[size] } );
          });
        }
      }
    }};
    function changeFilter( n ) { n.onchange = function(e) {
      var filter_set={};
      console.log( aqs('input[type="checkbox"]') );
      _m(nav,'input[type="checkbox"]',function(a){
        filter_set[a.value] = a.checked ? 1: 0;
      });
      var counter = 0;
      console.log(plotdata.DAY);
      size_filters = plotdata.STAGE_HR.map( function(a) { return filter_set[a] * filter_set[plotdata.DAY[counter++]]; } );
      counter = 0;
      var size     = size_colours.map( a => size_filters[counter++] * a              );
      Plotly.restyle( 'pf-new-umap-graph', { 'marker.size':[size] } );
      Plotly.restyle( 'pf-new-pca-graph',  { 'marker.size':[size] } );
      // Update filters...
    }};
    _m(nav,'input[type="radio"]',    changeColour);
    _m(nav,'input[type="checkbox"]', changeFilter);
    _m(nav,'input[type="text"]',     changeGene);
    _m('.svg-container', function(n) { n.classList.add('x11'); n.style="" } );
  });
//  Plotly.restyle('pf-new-umap-graph', { 'marker.color': [plotdata.DAY.map( function(a) { return colours.days[a]; } )]} );
}
