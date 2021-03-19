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

var xgene = [[68,1,84],[71,45,123],[59,82,139],[44,114,142],[33,144,140],[39,173,129],[93,200,99],[170,220,50],[170,220,50]];
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
  ["D1",  0,"#D73027"],
  ["D2",  1,"#F46D43"],
  ["D3",  2,"#FDAE61"],
  ["D4",  3,"#FEE090"],
  ["D6",  4,"#E0F3F8"],
  ["D8",  5,"#ABD9E9"],
  ["D10", 6,"#74ADD1"],
];
var configuration = {
  marker_size: 5,
  marker_size_orig: 5,
  marker_size_factor: 0
};
var HOVER_TEMPLATE = '<b>%{text}</b><br>Stage: %{customdata[0]}<br>Day: %{customdata[1]}<br><br>Co-ord: (%{x},%{y},%{z})<extra></extra>';
var HOVER_TEMPLATE_GENE = '<b>%{text}</b><br>Stage: %{customdata[0]}<br>Day: %{customdata[1]}<br>Expr.: %{customdata[2]}<br><br>Co-ord: (%{x},%{y},%{z})<extra></extra>';
var colours = { stage: {}, days: {} };
stages.forEach( _ => colours.stage[_[0]] = _[2] );
days.forEach(   _ => colours.days[ _[0]] = _[2] );
load_data('#pf-new');

/*
var settings = {
  filters: { stage:{}, days:{} },
  colour_by:    'stage',
  current_gene: 'PF3D7-0935900',
}
stages.forEach( _ => settings.filters.stage[_[0]] = true );
days.forEach(   _ => settings.filters.days[ _[0]] = true );
*/
function exp_colour(a,mx) {
  if( a==mx ) {
    return 'rgb('+(xgene[8][0])+','+(xgene[8][1])+','+(xgene[8][2])+')';
  }
  var i = Math.floor(a/mx*8);
  var o = a/mx - i/8;
  var p = 1 - o;
  return 'rgb('+ ( xgene[i][0]*p+xgene[i+1][0]*o ) +','+
                 ( xgene[i][1]*p+xgene[i+1][1]*o ) +','+
                 ( xgene[i][2]*p+xgene[i+1][2]*o ) +')';
}

function load_data( id ) {
  var path = '/mca/data/' + (qs(id).dataset.directory) + '/samples.json';
  var plotdata;
  _m('.loading',_ => _.style.display = 'block');
  Plotly.d3.json(path, function(err, plotdata) {
    _m('.loading',_ => _.innerText = 'RENDERING CHROMIUM 10x GRAPHS');
    var active_gene   = 'PF3D7-0935900';
    var colours_day   = plotdata.DAY.map(      function(a) { return colours.days[a]; } );
    var colours_stage = plotdata.STAGE_HR.map( function(a) { return colours.stage[a]; } );
    var c=0;
    var custom = plotdata.DAY.map( _ => [plotdata.STAGE_HR[c++],_] );
    var custom_expression;
    var colours_gene  = 'red';
    var size_filters  = plotdata.STAGE_HR.map( a => 1                        );
    var current_gene  = undefined;
    var last_value    = undefined;
    var current_colouring = 'stage';
    var size_colours  = plotdata.STAGE_HR.map( a => configuration.marker_size_orig );
    var gene_ids = {};
    var dd = aqs('.input ul li');
    dd.forEach( _ => gene_ids[_.innerText]=1 );
    var points_PC = [{
      x:plotdata.PC_1, y: plotdata.PC_2, z:plotdata.PC_3,
      mode: 'markers',
      text: plotdata.CELL_ID,
      marker: { size: [size_colours], color: colours_stage, line: {width:0} },
      customdata: custom,
      hovertemplate: HOVER_TEMPLATE,
      type: 'scatter3d'
    }];
    var points_UMAP = [{
      x:plotdata.UMAP_1, y: plotdata.UMAP_2, z:plotdata.UMAP_3,
      mode: 'markers',
      text: plotdata.CELL_ID,
      marker: { size: [size_colours], color: colours_stage, line: {width:0} },
      customdata: custom,
      hovertemplate: HOVER_TEMPLATE,
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
    }, {responsive:true,displayModeBar: true,displaylogo: false});
    Plotly.newPlot( 'pf-new-umap-graph', points_UMAP, {
      autosize:true,
      margin: { l: 5, r: 5, b: 5, t: 5 },
      scene: {
        xaxis: { range: [ -5,6 ], title: 'UMAP 1' },
        yaxis: { range: [ -3,4 ], title: 'UMAP 2' },
        zaxis: { range: [ -6,3 ], title: 'UMAP 3' }
      }
    }, {responsive: true,displayModeBar: true,displaylogo: false});
    Plotly.restyle( 'pf-new-umap-graph', { 'marker.size':[size_colours] } );
    Plotly.restyle( 'pf-new-pca-graph',  { 'marker.size':[size_colours] } );
    _m('.loading',_ => _.innerText = 'ADDING INTERACTIONS TO GRAPHS');
    var nav = qs('#pf nav');

    function action_changeGene(e) {
      var new_gene = qs( nav, '#pf-new-gene' ).value;
      // Check to see if it is a valid gene name...
      if( ! ( new_gene in gene_ids ) && new_gene !== '' ) {
        if( last_value === new_gene ) {
          return;
        }
        _m(qs('.input ul'),'li[style*=block]',function(_){_.style.display='none';});
        last_value = new_gene;
        var c = 0;
        var nn = dd.length;
        var last;
        for(var i = 0; i < nn; i++ ) {
          var _ = dd[i];
          if( _.innerText.includes(new_gene) ) {
            last = _;
            _.style.display="block";
            c++;
          }
          if(c>9) {
            break;
          }
        }
//        if(c != 1 ) {
          return;
//        }
        last.style.display="none"; // Hide the remaining entry in drop down...
        qs(nav,'#pf-new-gene').value = new_gene = last.innerText; // Set value for gene!
      }
      _m(qs('.input ul'),'li[style*=block]',function(_){_.style.display='none';});

      if( current_gene === new_gene ) {
        if( current_colouring == 'gene' ) {
          Plotly.restyle( 'pf-new-umap-graph', { 'marker.color': [colours_gene] } );
          Plotly.restyle( 'pf-new-pca-graph',  { 'marker.color': [colours_gene] } );
        }
        return;
      }
      if( new_gene === '' ) {
        _m('.pf-extra-title',function(_) { _.innerText = ''; });
        current_gene = new_gene;
        colours_gene = plotdata.STAGE_HR.map( a => '#ccc'                                  );
        size_colours = colours_gene.map(      a => configuration.marker_size_orig          );
        var counter = 0;
        var size_empty  = size_colours.map(   a => size_filters[counter++] * configuration.marker_size_orig          );
        _m('.gradient span',_ => _.innerText = '-');
        if( current_colouring == 'gene' ) {
          Plotly.restyle( 'pf-new-umap-graph', { 'marker.color': [colours_gene], 'marker.size':[size_empty], 'customdata': [custom],  'hovertemplate': HOVER_TEMPLATE } );
          Plotly.restyle( 'pf-new-pca-graph',  { 'marker.color': [colours_gene], 'marker.size':[size_empty], 'customdata': [custom],  'hovertemplate': HOVER_TEMPLATE } );
        } else {
          Plotly.restyle( 'pf-new-umap-graph', { 'marker.size':[size_empty], 'customdata': [custom],  'hovertemplate': HOVER_TEMPLATE } );
          Plotly.restyle( 'pf-new-pca-graph',  { 'marker.size':[size_empty], 'customdata': [custom],  'hovertemplate': HOVER_TEMPLATE } );
        }
        return;
      }
      _m('.loading', function(_) { _.innerText = 'LOADING DATA FOR '+new_gene; _.style.display = 'block'; } );
      Plotly.d3.json( '/mca/data/' + (qs(id).dataset.directory) + '/expression/'+new_gene+'.json', function(err,expdata) {
        current_gene = new_gene;
        _m('.pf-extra-title',function(_) { _.innerText = ' - showing expression for gene: '+new_gene; });
        var max_exp  = expdata.max;
        var counter  = 0;
        if( max_exp == 0 ) {
          colours_gene = expdata.data.map( a => '#ccc'                                  );
          size_colours = expdata.data.map( a => configuration.marker_size_orig          );
          _m('.gradient span',_ => _.innerText = '-');
        } else {
          colours_gene = expdata.data.map( a => exp_colour(a,max_exp)                   );
          size_colours = expdata.data.map( a => configuration.marker_size + a/max_exp*configuration.marker_size_factor );
          _1('.gradient span:first-of-type',_ => _.innerText = '0.0');
          _1('.gradient span:last-of-type', _ => _.innerText = Number.parseFloat(max_exp).toPrecision(2));
        }

        var size     = size_colours.map( a => size_filters[counter++] * a             );
        counter = 0;
        custom_expression = [custom.map( _ => [_[0],_[1],expdata.data[counter++]] )];
        if( current_colouring == 'gene' ) {
          Plotly.restyle( 'pf-new-umap-graph', { 'marker.color': [colours_gene], 'marker.size':[size], 'customdata': custom_expression, 'hovertemplate': HOVER_TEMPLATE_GENE } );
          Plotly.restyle( 'pf-new-pca-graph',  { 'marker.color': [colours_gene], 'marker.size':[size], 'customdata': custom_expression, 'hovertemplate': HOVER_TEMPLATE_GENE } );
        } else {
          Plotly.restyle( 'pf-new-umap-graph', { 'marker.size':[size], 'customdata': custom_expression, 'hovertemplate': HOVER_TEMPLATE_GENE } );
          Plotly.restyle( 'pf-new-pca-graph',  { 'marker.size':[size], 'customdata': custom_expression, 'hovertemplate': HOVER_TEMPLATE_GENE } );
        }
        _m('.loading',_ => _.style.display = 'none');
      });
    };
    function changeGene( n ) {
      n.onkeyup  = action_changeGene;
      n.onchange = action_changeGene;
    };
    function changeGeneDropDown( n ) { n.onclick = function(e) {
      var n = this;
      _m( nav,'input[type="text"]', function( _ ) { _.value = n.innerText; _.onchange(); } );
    }};
    function changeColour( n ) { n.onchange = function(e) {
      if( qs(nav, 'input[type="radio"][value="day"]').checked ) {
        current_colouring = 'day';
        qs('#legend-day').style.display='block';
        qs('#legend-gene').style.display='none';
        qs('#legend-stage').style.display='none';
        Plotly.restyle( 'pf-new-umap-graph',  { 'marker.color': [colours_day]   } );
        Plotly.restyle( 'pf-new-pca-graph',   { 'marker.color': [colours_day]   } );
      } else if( qs(nav, 'input[type="radio"][value="stage"]').checked ) {
        qs('#legend-day').style.display='none';
        qs('#legend-gene').style.display='none';
        qs('#legend-stage').style.display='block';
        current_colouring = 'stage';
        Plotly.restyle( 'pf-new-umap-graph',  { 'marker.color': [colours_stage] } );
        Plotly.restyle( 'pf-new-pca-graph',   { 'marker.color': [colours_stage] } );
      } else {
        qs('#legend-day').style.display='none';
        qs('#legend-gene').style.display='flex';
        qs('#legend-stage').style.display='none';
        current_colouring = 'gene';
        _m( nav,'input[type="text"]', function( _ ) { _.onchange(); } );
        return;
      }
    }};
    function changeFilter( n ) { n.onchange = function(e) {
      var filter_set={};
      _m(nav,'input[type="checkbox"]',function(a){
        filter_set[a.value] = a.checked ? 1: 0;
      });
      var counter = 0;
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
    _m(nav,'.input li',              changeGeneDropDown);
    _m('.svg-container', function(n) { n.classList.add('x11'); n.style="" } );
    _m('.loading',_ => _.style.display = 'none');
  });
//  Plotly.restyle('pf-new-umap-graph', { 'marker.color': [plotdata.DAY.map( function(a) { return colours.days[a]; } )]} );
}
