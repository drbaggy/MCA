
var colours = { stage: {}, days: {} };
stages.forEach( _ => colours.stage[_[0]] = _[2] );
days.forEach(   _ => colours.days[ _[0]] = _[2] );


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
    return 'rgb('+(EXPRESSION_BREAKPOINTS[8][0])+','+(EXPRESSION_BREAKPOINTS[8][1])+','+(EXPRESSION_BREAKPOINTS[8][2])+')';
  }
  var i = Math.floor(a/mx*8);
  var o = a/mx - i/8;
  var p = 1 - o;
  return 'rgb('+ ( EXPRESSION_BREAKPOINTS[i][0]*p+EXPRESSION_BREAKPOINTS[i+1][0]*o ) +','+
                 ( EXPRESSION_BREAKPOINTS[i][1]*p+EXPRESSION_BREAKPOINTS[i+1][1]*o ) +','+
                 ( EXPRESSION_BREAKPOINTS[i][2]*p+EXPRESSION_BREAKPOINTS[i+1][2]*o ) +')';
}

function load_data( id ) {
  var path = 'data/' + (qs(id).dataset.directory) + '/newsamples.json';
  var plotdata;
  _m('.loading',_ => _.style.display = 'block');
  Plotly.d3.json(path, function(err, plotdata) {
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
    var size_colours  = plotdata.STAGE_HR.map( _ => configuration.marker_size_orig );
    var dd = aqs('.input ul', 'li');
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
      if( ! ( plotdata.genes.includes(new_gene) ) && new_gene !== '' ) {
        if( last_value === new_gene ) {
          return;
        }
        _m(qs('.input ul'),'li[style*=block]',function(_){_.style.display='none';});
        last_value = new_gene;
        var c = 0;
        var nn = dd.length;
        var last;
        for(var i = 0; i < nn && c<10; i++ ) {
          var _ = dd[i];
          if( _.innerText.includes(new_gene) ) {
            _.style.display="block";
            c++;
          }
        }
        return;
      }
      // New we either have no gene OR we have a valid gene
      // We want to clear the drop down block....
      _m( qs('.input ul'),'li[style*=block]', _ => _.style.display='none' );

      // We haven't changed gene - in this case we have just changed tab
      // Go to the new gene tab...
      if( current_gene === new_gene ) {
        if( current_colouring == 'gene' ) {
          Plotly.restyle( 'pf-new-umap-graph', { 'marker.color': [colours.gene] } );
          Plotly.restyle( 'pf-new-pca-graph',  { 'marker.color': [colours.gene] } );
        }
        return;
      }

      // We are clearing the gene - so we just reset the colours.gene list...
      if( new_gene === '' ) {
        _m('.pf-extra-title',function(_) { _.innerText = ''; });
        current_gene = new_gene;
        colours.gene = plotdata.data.CUSTOMDATA.map( _ => '#ccc' ); // reset colours
        _m('.gradient span',_ => _.innerText = '-');
        if( current_colouring == 'gene' ) {
          Plotly.restyle( 'pf-new-umap-graph', { 'marker.color': [colours.gene], 'hovertemplate': HOVER_TEMPLATE } );
          Plotly.restyle( 'pf-new-pca-graph',  { 'marker.color': [colours.gene], 'hovertemplate': HOVER_TEMPLATE } );
        } else {
          Plotly.restyle( 'pf-new-umap-graph', { 'hovertemplate': HOVER_TEMPLATE } );
          Plotly.restyle( 'pf-new-pca-graph',  { 'hovertemplate': HOVER_TEMPLATE } );
        }
        return;
      }

      // We have a real gene so have to retrieve the data from the webserver...
      // again we pop-up the window to show that data is being loaded - thankfully that doesn't
      // take to long - data size is approx
      _m('.loading', function(_) {return _.innerText = 'LOADING DATA FOR '+new_gene; _.style.display = 'block'} );
      Plotly.d3.json( 'data/' + (qs(id).dataset.directory) + '/expression/'+new_gene+'.json', function(err,expdata) {
        current_gene = new_gene;
        _m('.pf-extra-title', _ =>  _.innerText = ' - showing expression for gene: '+new_gene );
        var max_exp  = expdata.max;
        if( max_exp == 0 ) {
          colours.gene = expdata.data.map( _ => '#ccc' );
          _m('.gradient span',_ => _.innerText = '-');
        } else {
          colours.gene = expdata.data.map( _ => exp_colour(_,max_exp) );
          _1('.gradient span:first-of-type',_ => _.innerText = '0.0');
          _1('.gradient span:last-of-type', _ => _.innerText = Number.parseFloat(max_exp).toPrecision(2));
        }
        if( current_colouring == 'gene' ) {
          Plotly.restyle( 'pf-new-umap-graph', { 'marker.color': [colours.gene], 'text': [expdata.data], 'hovertemplate': HOVER_TEMPLATE_GENE } );
          Plotly.restyle( 'pf-new-pca-graph',  { 'marker.color': [colours.gene], 'text': [expdata.data], 'hovertemplate': HOVER_TEMPLATE_GENE } );
        } else {
          Plotly.restyle( 'pf-new-umap-graph', { 'text': expdata.data, 'hovertemplate': HOVER_TEMPLATE_GENE } );
          Plotly.restyle( 'pf-new-pca-graph',  { 'text': expdata.data, 'hovertemplate': HOVER_TEMPLATE_GENE } );
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
          Plotly.restyle( 'pf-new-umap-graph', { 'marker.color': [colours_gene], 'marker.size':[size], 'customdata': custom_expression, 'hovertemplate': HOVER_TEMPLATE_GENE } );
          Plotly.restyle( 'pf-new-pca-graph',  { 'marker.color': [colours_gene], 'marker.size':[size], 'customdata': custom_expression, 'hovertemplate': HOVER_TEMPLATE_GENE } );
        } else {
          Plotly.restyle( 'pf-new-umap-graph', { 'marker.size':[size], 'customdata': custom_expression, 'hovertemplate': HOVER_TEMPLATE_GENE } );
          Plotly.restyle( 'pf-new-pca-graph',  { 'marker.size':[size], 'customdata': custom_expression, 'hovertemplate': HOVER_TEMPLATE_GENE } );
        }
        _m('.loading',_ => _.style.display = 'none');
      };
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