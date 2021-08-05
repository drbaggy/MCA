/*jshint esversion: 6 */

(function () {
  'use strict';
  var CONFIG = {
    expression: { // Configuration for expression colours....
      default: '#cccccc',
      colours: [[68,1,84],[71,45,123],[59,82,139],[44,114,142],[33,144,140],[39,173,129],[93,200,99],[170,220,50],[253,231,37],[253,231,37]]
    },
    filters: {
      'cluster': [ ['X','#000000' ], ['Cluster 1','#267278'], ['Cluster 2','#65338d'], ['Cluster 3','#4770b3'], ['Cluster 4','#d21f75'],
                   ['Cluster 5','#3b3689'], ['Cluster 6','#50aed3'], ['Cluster 7','#48b24f'], ['Cluster 8','#e57438'],
                   ['Cluster 9','#569dd2'], ['Cluster 10','#569d79'], ['Cluster 11','#58595b'], ['Cluster 12','#e4b031'], ['Cluster 13','#84d2f4'],
                   ['Cluster 14','#cad93f'], ['Cluster 15','#f5c8af'], ['Cluster 16','#9ac483'], ['Cluster 17','#9e9ea2'] ],
      'stage':   [ [ 'liver',                        '#B6D7A8' ], [ 'merozoite',                    '#D0E0E3' ],
                   [ 'ring',                         '#A2C4C9' ], [ 'trophozoite',                  '#45818E' ],
                   [ 'schizont',                     '#134F5C' ], [ 'gametocyte (developing)',      '#D8C0D8' ],
                   [ 'gametocyte (male)',            '#9370DB' ], [ 'gametocyte (female)',          '#551A8B' ],
                   [ 'ookinete',                     '#A61C00' ], [ 'oocyst',                       '#CC4125' ],
                   [ 'sporozoite (oocyst)',          '#E69138' ], [ 'sporozoite (hemolymph)',       '#FFF2CC' ],
                   [ 'sporozoite (salivary gland)',  '#FFE599' ], [ 'sporozoite (injected)',        '#F1C232' ],
                   [ 'sporozoite (activated)',       '#BF9000' ] ],
      'day':     [ [ 'D1', '#D73027' ], [ 'D2', '#F46D43' ], [ 'D3',   '#FDAE61' ], [ 'D4', '#FEE090' ],
                   [ 'D6', '#E0F3F8' ], [ 'D8', '#ABD9E9' ], [ 'D10',  '#74ADD1' ], ],
      'host':    [ [ 'mosquito', '#ffa600' ], [ 'human',    '#bc5090' ], [ 'mouse',    '#003f5c' ] ]
    },
    filename: 'data.json',
    marker_size: 5,
    margins: { l: 5, r: 5, b: 5, t: 5 },
    options: {responsive: true,displayModeBar: true,displaylogo: false}
  };
  function exp_colour( a, mx ) {
    var i = Math.floor(a/mx*8);
    var o = a/mx - i/8;
    var p = 1 - o;
    return 'rgb('+ ( CONFIG.expression.colours[i][0]*p+CONFIG.expression.colours[i+1][0]*o ) +','+
                   ( CONFIG.expression.colours[i][1]*p+CONFIG.expression.colours[i+1][1]*o ) +','+
                   ( CONFIG.expression.colours[i][2]*p+CONFIG.expression.colours[i+1][2]*o ) +')';
  }
  load_data();


  function process_cell_graph( t ) {
    var counter;
    t.hover_template      = t.popup.replaceAll('[[','%{CUSTOMDATA[').replaceAll(']]',']}');
    t.hover_template_expr = t.hover_template + '<br>Expression: %{text}<extra></extra>';
    t.hover_template     += '<extra></extra>';
    t.genes_length        = t.genes.length;
    t.default_text        = t.data.map( a => '-' );
    t.visible             = t.data.map( a => CONFIG.marker_size );
    t.customdata          = t.data.map( function(a) { counter = 0; return a.map( b => CONFIG.filters[ t.columns[counter++] ][b][0] ); } );
    t.colours             = { gene: t.customdata.map( a => CONFIG.expression.default ) };
    counter=0;
    t.columns.forEach( function(a) {
      t.colours[ a ] = t.data.map( function(b) { return CONFIG.filters[ a ][b[counter]][1];} );
      counter++;
    });
  }
  function process_gene_graph( t ) {
    t.hover_template      = t.popup.replaceAll('[[','%{CUSTOMDATA[').replaceAll(']]',']}');
  }
  function create_cell_chart( gflag, t ) {return;
    var def = 'stage';
    t.points = {};
    if( t.hasOwnProperty('pca') ) {
      if( t.pca.length == 2) { // We have a 2d PCA chart!
        t.points.pca = [{
          x: t.pca[0], y: t.pca[1], mode: 'markers', text: t.default_text,
          marker: { size: t.visible, color: t.colours[def], line: {width:0} },
          customdata: t.customdata, hovertemplate: t.hover_template, type: 'scatter'
        }];
        Plotly.newPlot(gflag+'-pca', t.points.pca, { autosize: true, margin: CONFIG.margins,
          scene: { xaxis: { range: t.ranges.pca[0], title: 'PC 1' },
                   yaxis: { range: t.ranges.pca[1], title: 'PC 2' }, }}, CONFIG.options );
      } else { // We have a 3d PCA chart!
        t.points.pca = [{
          x: t.pca[0], y: t.pca[1], z: t.pca[2], mode: 'markers', text: t.default_text,
          marker: { size: t.visible, color: t.colours[def], line: {width:0} },
          customdata: t.customdata, hovertemplate: t.hover_template, type: 'scatter3d'
        }];
        Plotly.newPlot(gflag+'-pca', t.points.pca, { autosize: true, margin: CONFIG.margins,
          scene: { xaxis: { range: t.ranges.pca[0], title: 'PC 1' },
                   yaxis: { range: t.ranges.pca[1], title: 'PC 2' },
                   zaxis: { range: t.ranges.pca[2], title: 'PC 3' }, }}, CONFIG.options );
      }
    }
    if( t.hasOwnProperty('umap') ) {
      if( t.umap.length == 2) { // We have a 2d umap chart!
        t.points.umap = [{
          x: t.umap[0], y: t.umap[1], mode: 'markers', text: t.default_text,
          marker: { size: t.visible, color: t.colours[def], line: {width:0} },
          customdata: t.customdata, hovertemplate: t.hover_template, type: 'scatter'
        }];
        Plotly.newPlot(gflag+'-umap', t.points.umap, { autosize: true, margin: CONFIG.margins,
          scene: { xaxis: { range: t.ranges.umap[0], title: 'UMAP 1' },
                   yaxis: { range: t.ranges.umap[1], title: 'UMAP 2' }, }}, CONFIG.options );
      } else { // We have a 3d umap chart!
        t.points.umap = [{
          x: t.umap[0], y: t.umap[1], z: t.umap[2], mode: 'markers', text: t.default_text,
          marker: { size: t.visible, color: t.colours[def], line: {width:0} },
          customdata: t.customdata, hovertemplate: t.hover_template, type: 'scatter3d'
        }];
        Plotly.newPlot(gflag+'-umap', t.points.umap, { autosize: true, margin: CONFIG.margins,
          scene: { xaxis: { range: t.ranges.umap[0], title: 'UMAP 1' },
                   yaxis: { range: t.ranges.umap[1], title: 'UMAP 2' },
                   zaxis: { range: t.ranges.umap[2], title: 'UMAP 3' }, }}, CONFIG.options );
      }
    }
  }
  function create_gene_chart( gflag, t ) {
return;
    t.points.knn = [{
      x: t.knn[0], y: t.knn[1], mode: 'markers', text: t.default_text,
      marker: { size: t.visible, color: t.colours['cluster'], line: {width:0} },
      customdata: t.customdata, hovertemplate: t.hover_template, type: 'scatter'
    }];
    Plotly.newPlot(gflag+'-knn', t.points.knn, { autosize: true, margin: CONFIG.margins,
      scene: { xaxis: { range: t.ranges.knn[0], title: 'KNNx' },
               yaxis: { range: t.ranges.knn[1], title: 'KNNy' }, }}, CONFIG.options );
    return;
  }
  function load_data(  ) {
    _.m('.loading', a => a.style.display = 'block');
    var graph, counter, current_gene, time = Date.now();
    Plotly.d3.json( '/mca/processed/' + (_.qs("#main").dataset.directory) + '/' + CONFIG.filename, function(err, graph) {
// Create the hover templates...
      var fetched_time = Date.now() - time;
      // Part 1 processes the cell graph data....
      if(graph.hasOwnProperty('ch10x')) {
        if( graph.ch10x.hasOwnProperty('cell') ) {
          process_cell_graph( graph.ch10x.cell );
          create_cell_chart( 'ch10x', graph.ch10x.cell );
        }
        if( graph.ch10x.hasOwnProperty('gene') ) {
          process_gene_graph( graph.ch10x.gene );
          create_gene_chart( 'ch10x', graph.ch10x.gene );
        }
      }
      if(graph.hasOwnProperty('ss2')) {
        if( graph.ss2.hasOwnProperty('cell') ) {
          process_cell_graph( graph.ss2.cell );
          create_cell_chart( 'ss2', graph.ss2.cell );
        }
        if( graph.ss2.hasOwnProperty('gene') ) {
          process_gene_graph( graph.ss2.gene );
          create_gene_chart( 'ss2', graph.ss2.gene );
        }
      }console.log(graph);
      // Draw graphs....
      var rendered_time = Date.now() - time - fetched_time;
      var nav   = _.qs('nav#id');
      // We need to indicate which graphs we have....

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
      var post_time = Date.now() - time - fetched_time - rendered_time;
      console.log( 'Fetch: '+(fetched_time/1000)+' sec; Render: '+(rendered_time/1000)+' sec; Post: '+(post_time/1000)+' sec; Total: '+((Date.now()-time)/1000)+' sec.' );
    });
  }
}());
