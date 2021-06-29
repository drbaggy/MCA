/*jshint esversion: 6 */

(function () {
  'use strict';
  var FILE_NAME = 'x_samples.json',
      MARGIN    = { l: 5, r: 5, b: 5, t: 5 },
      OPTIONS   = {responsive: true,displayModeBar: true,displaylogo: false};
  load_data('#pf-new');


  function load_data( id ) {
    _.m('.loading', a => a.style.display = 'block');
    var graph, counter, current_gene, time = Date.now();
    Plotly.d3.json( 'data/' + (_.qs(id).dataset.directory) + '/' + FILE_NAME, function(err, graph) {
// Create the hover templates...
      var fetched_time = Date.now() - time;
      counter = 0;
      graph.hover_template      = graph.columns.map( a => a.name+': %{customdata['+(counter++)+']}' ).join('<br>');
      graph.hover_template_expr = graph.hover_template + '<br>Expression: %{text}<extra></extra>';
      graph.hover_template     += '<extra></extra>';
      graph.genes_length        = graph.genes.length;
// Process the data to get the unmapped customdata and gene colours (by stage/day);
      graph.default_text = graph.data.CUSTOMDATA.map( a => '-' );
      graph.visible      = graph.data.CUSTOMDATA.map( a => graph.marker_size );
      graph.customdata   = graph.data.CUSTOMDATA.map( function(a) { counter = 0; return a.map( b => graph.columns[counter++].colours[b][0] ); } );
      graph.colours      = { gene: graph.customdata.map( a => graph.expression_default ) };
      counter = 0;
      graph.columns.forEach( function(a) { graph.colours[ a.name.toLowerCase() ] = graph.data.CUSTOMDATA.map( b => graph.columns[counter].colours[b[counter]][1] ); counter++; });
      function exp_colour(a,mx) {
        var i = Math.floor(a/mx*8);
        var o = a/mx - i/8;
        var p = 1 - o;
        return 'rgb('+ ( graph.expression_colours[i][0]*p+graph.expression_colours[i+1][0]*o ) +','+
                       ( graph.expression_colours[i][1]*p+graph.expression_colours[i+1][1]*o ) +','+
                       ( graph.expression_colours[i][2]*p+graph.expression_colours[i+1][2]*o ) +')';
      }

// Draw graph
      var def = graph.columns[0].name.toLowerCase();
      var points = {
        PC:   [{ x: graph.data.PC[0], y: graph.data.PC[1], z:graph.data.PC[2], mode: 'markers', text: graph.default_text,
                 marker: { size: graph.visible, color: graph.colours[def], line: {width:0} },
                 customdata: graph.customdata, hovertemplate: graph.hover_template, type: 'scatter3d' }],
        UMAP: [{ x: graph.data.UMAP[0], y: graph.data.UMAP[1], z:graph.data.UMAP[2], mode: 'markers', text: graph.default_text,
                 marker: { size: graph.visible, color: graph.colours[def], line: {width:0} },
                 customdata: graph.customdata, hovertemplate: graph.hover_template, type: 'scatter3d' }]
      };
      var process_time = Date.now() - time - fetched_time;
      Plotly.newPlot('pf-new-pca-graph', points.PC, { autosize: true, margin: MARGIN,
        scene: { xaxis: { range: graph.ranges.PC[0], title: 'PC 1' },
                 yaxis: { range: graph.ranges.PC[1], title: 'PC 2' },
                 zaxis: { range: graph.ranges.PC[2], title: 'PC 3' }, }}, OPTIONS );
      Plotly.newPlot('pf-new-umap-graph', points.UMAP, { autosize: true, margin: MARGIN,
        scene: { xaxis: { range: graph.ranges.UMAP[0], title: 'UMAP 1' },
                 yaxis: { range: graph.ranges.UMAP[1], title: 'UMAP 2' },
                 zaxis: { range: graph.ranges.UMAP[2], title: 'UMAP 3' }, }}, OPTIONS );
      var rendered_time = Date.now() - time - fetched_time - process_time;

      var nav   = _.qs('#pf nav');
      var navdd = _.qs(nav,'.input ul');
// Now add actions on change filters....
      function changeFilter( n ) { n.onchange = function(e) {
        var filter_set={};
        // Update filters...
        _.m(nav,'input[type="checkbox"]',a => filter_set[a.value] = a.checked ? 1: 0);
        graph.visible = graph.customdata.map( a => graph.marker_size * filter_set[a[0]] * filter_set[a[1]] );
        Plotly.restyle( 'pf-new-umap-graph', { 'marker.size':[graph.visible] } );
        Plotly.restyle( 'pf-new-pca-graph',  { 'marker.size':[graph.visible] } );
      };}
      _.m(nav,'input[type="checkbox"]', changeFilter);
// Now add actions on change colour set
      function changeColour( n ) { n.onchange = function(e) {
        _.m(nav,'.legend', a => a.style.display = 'none' );
        var tab_name;
        _.s( nav, 'input[type="radio"]:checked', a => tab_name = a.value );
        _.s(nav,'#legend-'+tab_name, a => a.style.display = 'block' );
        Plotly.restyle( 'pf-new-umap-graph',  { 'marker.color': [graph.colours[tab_name]] } );
        Plotly.restyle( 'pf-new-pca-graph',   { 'marker.color': [graph.colours[tab_name]] } );
        return;
      };}

// Now add actions on change gene...
      _.m(nav,'input[type="radio"]',    changeColour);
      function changeGene( n ) { n.onkeyup = function(e) {
        var new_gene = _.qs( nav, '#pf-new-gene' ).value;
        if( ! ( graph.genes.includes(new_gene) ) && new_gene !== '' ) {
          // We need to activate the dropdown...
          _.s(navdd,'', a => a.innerHTML = '');
          var html = '';
          var count = 0;
          for(var i=0; i< graph.genes_length && count < 10; i++ ) {
            if(graph.genes[i].includes(new_gene)) {
              html += '<li>'+graph.genes[i]+'</li>';
              count++;
            }
          }
          _.s(navdd,'', a => a.innerHTML = html);
          return;
        }
        if( new_gene == current_gene ) {
          return;
        }
        if( new_gene === '' ) {
          _.m('.pf-extra-title', a => _.innerText = '');
          current_gene = new_gene;
          graph.colours.gene = graph.data.CUSTOMDATA.map( a => graph.expression_default ); // reset colours
          _.m(nav,'.gradient span',a => a.innerText = '-');
          _.s(nav,'.gradient span.exp-ave', a => a.innerText = '' );
          Plotly.restyle( 'pf-new-umap-graph', { 'marker.color': [graph.colours.gene], 'hovertemplate': graph.hover_template } );
          Plotly.restyle( 'pf-new-pca-graph',  { 'marker.color': [graph.colours.gene], 'hovertemplate': graph.hover_template } );
          return;
        }
        // Here we now have to do another fetch this time of the expression data....
        _.m('.loading', function(a) { a.innerText = 'LOADING DATA FOR '+new_gene; a.style.display = 'block';} );
        var t = Date.now();
        Plotly.d3.json( 'data/' + (_.qs(id).dataset.directory) + '/expression/'+new_gene+'.json', function(err,expdata) {
          var ft = Date.now() - t;
          current_gene = new_gene;
          _.m('.pf-extra-title', a => a.innerText = ' - showing expression for gene: '+new_gene );
          var max_exp  = expdata.max;
          if( max_exp == 0 ) {
            graph.colours.gene = expdata.data.map( a => graph.expression_default );
            _.m(nav,'.gradient span', a => a.innerText = '-');
            _.s(nav,'.gradient span.exp-ave', a => a.innerText = '' );
          } else {
            graph.colours.gene = expdata.data.map( a => exp_colour(a,max_exp) );
            _.s(nav,'.gradient span:first-of-type',  a => a.innerText = '0.00');
            _.s(nav,'.gradient span:nth-of-type(2)', a => a.innerText = Number.parseFloat(max_exp/2).toFixed(2) );
            _.s(nav,'.gradient span:last-of-type',   a => a.innerText = Number.parseFloat(max_exp).toFixed(2) );
          }
          var pt = Date.now() - t;
          Plotly.restyle( 'pf-new-umap-graph', { 'marker.color': [graph.colours.gene], 'text': [expdata.data], 'hovertemplate': graph.hover_template_expr } );
          Plotly.restyle( 'pf-new-pca-graph',  { 'marker.color': [graph.colours.gene], 'text': [expdata.data], 'hovertemplate': graph.hover_template_expr } );
          _.m('.loading',a => a.style.display = 'none');
          var rt = Date.now() - t - ft - pt;
          console.log( 'Fetch: '+(ft/1000)+' sec; Process: '+(pt/1000)+' sec; Render: '+(rt/1000)+' sec; Total: '+((Date.now()-t)/1000)+' sec.' );
        });
      };}
      _.m( nav,'input[type="text"]', changeGene );

      function ddClick( n ) { n.onclick = function(e) {
        _.s(nav,'input[type="text"]', function( a ) {
          a.value = e.target.innerText;
          _.s(navdd,'', b => b.innerHTML='');
          a.onkeyup();
        } );
      };}
      _.s( navdd, '', ddClick);

// Finally remove "shim" over graph...
      _.m('.loading',_ => _.style.display = 'none');
      var post_time = Date.now() - time - fetched_time - rendered_time - process_time;
      console.log( 'Fetch: '+(fetched_time/1000)+' sec; Process: '+(process_time/1000)+' sec; Render: '+(rendered_time/1000)+' sec; Post: '+(post_time/1000)+' sec; Total: '+((Date.now()-time)/1000)+' sec.' );
    });
  }
}());
