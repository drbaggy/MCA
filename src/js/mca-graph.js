/*jshint esversion: 6 */

(function (d) {
  'use strict';

/*######################################################################

  Support library
  ===============

  "Replacement" for jQuery in less than 1K, wrapper around
  querySelector* functions...

######################################################################*/

  var _ = {
    qs:  function( el, s )    { if( 'string' === typeof el ) {        s = el; el = d; } return s === '' ? el :  el.querySelector( s ); },
    qm:  function( el, s )    { if( 'string' === typeof el ) {        s = el; el = d; } return Array.from(el.querySelectorAll( s )); },
    m:   function( el, s, f ) { if( 'string' === typeof el ) { f = s; s = el; el = d; } this.qm(el,s).forEach( f ); },
    s:   function( el, s, f ) { if( 'string' === typeof el ) { f = s; s = el; el = d; } var z = this.qs(el,s); if( z ) f( z ); },
    dis: function( n )        { if( 'string' === typeof n ) { n = d.querySelector(n); } if(n) n.classList.remove('active');           },
    act: function( n )        { if( 'string' === typeof n ) { n = d.querySelector(n); } if(n) n.classList.add('active');              },
    json:   function(url,callback){
      var h=new XMLHttpRequest();
      h.overrideMimeType('application/json');
      h.open('GET',url);
      h.onreadystatechange=function(){ if(h.readyState==4&&h.status=='200'){callback(JSON.parse(h.responseText));} };
      h.send(null);
   }
  };

/*######################################################################

  Configuration and global variables...
  =====================================

######################################################################*/

  // Whole graph data....
  var graph;
  var expression_cache = {};
  // Store state data....
  var current_data   = '';
  var current_view   = 'cell';
  var current_type   = 'ch10x';
  var current_disp   = 'umap';
  var current_colour = 'stage';
  var current_gene   = '';
  // ....
  var navdd = _.qs('#legend-gene ul');
  var CONFIG = {
    expression: { // Configuration for expression colours....
      def: '#cccccc',
      colours: [[68,1,84],[71,45,123],[59,82,139],[44,114,142],[33,144,140],[39,173,129],[93,200,99],[170,220,50],[253,231,37],[253,231,37]]
    },
    knn: { def: '#cccccc', cluster: '#999999', gene: '#cc0000' },
    filters: {
      'cluster': [ ['X','#000000' ], ['Cluster 1','#267278'], ['Cluster 2','#65338d'], ['Cluster 3','#4770b3'], ['Cluster 4','#d21f75'],
                   ['Cluster 5','#3b3689'], ['Cluster 6','#50aed3'], ['Cluster 7','#48b24f'], ['Cluster 8','#e57438'],
                   ['Cluster 9','#569dd2'], ['Cluster 10','#569d79'], ['Cluster 11','#58595b'], ['Cluster 12','#e4b031'], ['Cluster 13','#84d2f4'],
                   ['Cluster 14','#cad93f'], ['Cluster 15','#f5c8af'], ['Cluster 16','#9ac483'], ['Cluster 17','#9e9ea2'],
                   ['Cluster 18','#275218'], ['Cluster 19','#d07d80'], ['Cluster 20','#ea731a'],
                   ['Cluster 21','#275218'], ['Cluster 22','#d07d80'], ['Cluster 23','#ea731a'] ],
      'cluster_2': [ ['Asexual 1','#267278'], ['Asexual 2','#65338d'], ['Asexual 3','#4770b3'], ['Asexual 4','#d21f75'],
                   ['Asexual 5','#3b3689'], ['Asexual 6','#50aed3'], ['Asexual 7','#48b24f'], ['Asexual 8','#e57438'],
                   ['Asexual 9','#569dd2'], ['Asexual 10','#569d79'], ['Asexual 11','#58595b'], ['Asexual 12','#e4b031'], ['Asexual 13','#84d2    f4'],
                   ['Asexual 14','#cad93f'], ['Asexual 15','#f5c8af'], ['Asexual 16','#9ac483'], ['Asexual 17','#9e9ea2'],
                   ['Progenitor','#275218'], ['Female 1','#d07d80'], ['Female 2','#ea731a'],
                   ['Female 3','#275218'], ['Male 1','#d07d80'], ['Male 2','#ea731a'] ],
      'technology':      [ [ 'Chromium 10x','#ffa600' ], [ 'SmartSeq2', '#003f5c' ] ],
      'sex' :      [ [ 'Asexual_Early', '#267278' ],
                     [ 'Asexual_Late',  '#569d79' ],
                     [ 'Bipotential',   '#ea731a' ],
                     [ 'Female',        '#CC4125' ],
                     [ 'Male',          '#F46D43' ] ],
      'strain' :   [ [ '3D7', '#267278' ],
                     [ '7G8',  '#569d79' ],
                     [ 'GB4',   '#ea731a' ],
                     [ 'Sen-GB4',        '#CC4125' ],
                     [ 'SenTho011',          '#F46D43' ],
                     [ 'SenTho015',          '#ea731a' ],
                     [ 'SenTho028',          '#cad93f' ] ],
      'stage':   [ [ 'liver',                        '#B6D7A8' ], [ 'merozoite',                    '#D0E0E3' ],
                   [ 'ring',                         '#A2C4C9' ], [ 'trophozoite',                  '#45818E' ],
                   [ 'schizont',                     '#134F5C' ], [ 'gametocyte (developing)',      '#D8C0D8' ],
                   [ 'gametocyte (male)',            '#9370DB' ], [ 'gametocyte (female)',          '#551A8B' ],
                   [ 'ookinete',                     '#A61C00' ], [ 'oocyst',                       '#CC4125' ],
                   [ 'sporozoite (oocyst)',          '#E69138' ], [ 'sporozoite (hemolymph)',       '#FFF2CC' ],
                   [ 'sporozoite (salivary gland)',  '#FFE599' ], [ 'sporozoite (injected)',        '#F1C232' ],
                   [ 'sporozoite (activated)',       '#BF9000' ] ],
      'day':     [ [ 'D1', '#D73027' ], [ 'D2', '#F46D43' ], [ 'D3',   '#FDAE61' ], [ 'D4', '#FEE090' ],
                   [ 'D6', '#E0F3F8' ], [ 'D8', '#ABD9E9' ], [ 'D10',  '#74ADD1' ] ],
      'host':    [ [ 'mosquito', '#ffa600' ], [ 'human',    '#bc5090' ], [ 'mouse',    '#003f5c' ] ]
    },
    filename: 'data.json',
    marker_size: 5,
    margins3d: { l: 5, r: 5, b: 5, t: 5 },
    margins2d: { l: 35, r: 5, b: 35, t: 5 },
    options2d: {responsive: true,displayModeBar: true,displaylogo: false, modeBarButtonsToRemove: ['select2d', 'lasso2d', 'hoverClosestCartesian', 'hoverCompareCartesian' ]},
    options3d: {responsive: true,displayModeBar: true,displaylogo: false, modeBarButtonsToRemove: ['resetCameraLastSave3d', 'hoverClosest3d']}
  };
  CONFIG.filters.cluster_1 = CONFIG.filters.cluster;
/*######################################################################

  The main script...
  ==================

######################################################################*/

  insert_legend_and_filters();                       // Add additional HTML to the page!
  load_data();                                       // Load data and trigger rendering of graphs
  // Add click handler to the view navigation bar...
  //_.m( '#int a', n => n.onclick = function( e ) {
  //  e.preventDefault();
  //  switch_panel( this.getAttribute('href').replace('#','') );
  //} );

/*######################################################################

  Helper functions
  ================

  exp_colour( exp, max_exp ) -  return rgb colour to represent
                                expression in stepwise colours
  insert_legend_and_filters() - create graph divs, and add
                                filters/legends for colours/selectors
                                on RHS...
  update_graphs( ch10x_c, ch10x_g, ss2_c, ss2_g ) -
                                update config of graphs by type
                                ch10x-cell, ch10-gene, ....
  has( k ) -                    check to see if the deep-key in
                                "graphs" is defined...
                                k is split on "-" and we then recurse
                                down graphs to see if each node exists

######################################################################*/


  function exp_colour( a, mx ) {
    var i = Math.floor(a/mx*8);
    var o = a/mx - i/8;
    var p = 1 - o;
    return 'rgb('+ ( CONFIG.expression.colours[i][0]*p+CONFIG.expression.colours[i+1][0]*o ) +','+
                   ( CONFIG.expression.colours[i][1]*p+CONFIG.expression.colours[i+1][1]*o ) +','+
                   ( CONFIG.expression.colours[i][2]*p+CONFIG.expression.colours[i+1][2]*o ) +')';
  }


  function insert_legend_and_filters() {
    _.m('main section div', function(a) {
      var id = a.getAttribute('id');
      if( id ) a.insertAdjacentHTML('afterbegin','<div class="graph-wrapper"><div id="'+id+'-graph" class="graph"></div></div>');
    });
    Object.getOwnPropertyNames(CONFIG.filters).forEach(function(k){
      var ht = '';
      //var e = _.qs( '#filter-'+k+' li' );    // We have removed the generate filter code as needed to override too many stylish bits
      //if( e ) {                              // these now need to be in the template...
      //  var c = 0;
      //  CONFIG.filters[k].forEach(a => ht+= '<label><input checked="checked" type="checkbox" name="'+k+'" value="'+(c++)+'"><span>'+a[0]+'</span></label>');
      //  e.innerHTML = ht;
      //}
      var e = _.qs( '#legend-'+k+' ul' );
      if( e ) { CONFIG.filters[k].forEach( function(a) { ht+= '<li><span style="background-color:'+a[1]+'">&nbsp;</span>'+a[0]+'</label>'; e.innerHTML = ht; }  ); }
    });
  }

  function update_graphs( new_ch10x_cell, new_ss2_cell, new_ch10x_gene, new_ss2_gene, new_extra_cell, new_extra_gene ) {
    if( graph.hasOwnProperty('ch10x') ) {
      if( new_ch10x_cell && graph.ch10x.hasOwnProperty('cell') ) {
        if( graph.ch10x.cell.hasOwnProperty('umap') ) Plotly.restyle( 'ch10x-cell-umap-graph', new_ch10x_cell );
        if( graph.ch10x.cell.hasOwnProperty('pca')  ) Plotly.restyle( 'ch10x-cell-pca-graph',  new_ch10x_cell );
      }
      if( new_ch10x_gene && graph.ch10x.hasOwnProperty('gene') ) {
         if( graph.ch10x.gene.hasOwnProperty('knn') ) Plotly.restyle( 'ch10x-gene-knn-graph', new_ch10x_gene );
      }
    }
    if( graph.hasOwnProperty('ss2') ) {
      if( new_ss2_cell && graph.ss2.hasOwnProperty('cell') ) {
        if( graph.ss2.cell.hasOwnProperty('umap') ) Plotly.restyle( 'ss2-cell-umap-graph', new_ss2_cell );
        if( graph.ss2.cell.hasOwnProperty('pca')  ) Plotly.restyle( 'ss2-cell-pca-graph',  new_ss2_cell );
      }
      if( new_ss2_gene && graph.ss2.hasOwnProperty('gene') ) {
         if( graph.ss2.gene.hasOwnProperty('knn') ) Plotly.restyle( 'ss2-gene-knn-graph', new_ss2_gene );
      }
    }
    if( graph.hasOwnProperty('extra') ) {
      if( new_extra_cell && graph.extra.hasOwnProperty('cell') ) {
        if( graph.extra.cell.hasOwnProperty('umap') ) Plotly.restyle( 'extra-cell-umap-graph', new_extra_cell );
        if( graph.extra.cell.hasOwnProperty('pca')  ) Plotly.restyle( 'extra-cell-pca-graph',  new_extra_cell );
      }
      if( new_extra_gene && graph.extra.hasOwnProperty('gene') ) {
         if( graph.extra.gene.hasOwnProperty('knn') ) Plotly.restyle( 'extra-gene-knn-graph', new_extra_gene );
      }
    }
  }

  function has( k ) {
    var parts = k.split('-');
    var t = graph;
    while( parts.length ) {
      if( ! t.hasOwnProperty( parts[0] ) ) return false;
      t = t[parts[0]];
      parts.shift();
    }
    return true;
  }

/***********************************************************************
************************************************************************
**                                                                    **
**    Action functions                                                **
**                                                                    **
************************************************************************
***********************************************************************/


  // Switch panel...... panel_name is "ss2-cell", "ss2-gene", "ch10x-cell" or "ch10x-gene"
  function switch_panel( panel_name ) {
    var t = panel_name.split('-');
    if( graph.hasOwnProperty(t[0]) && graph[t[0]].hasOwnProperty(t[1]) ) { // Check that the graph exists....
      current_type = t[0];
      current_view = t[1];
      current_data = graph[current_type][current_view];
      var __disp = 'knn'; // Temporary as we only update current_dist for cell views!
      if(current_view == 'cell' ) {
        __disp = current_disp = current_data.hasOwnProperty( current_disp ) ? current_disp : current_data.hasOwnProperty( 'umap' ) ? 'umap' : 'pca' ;
        _.m('main h3 a', function(a) { _.dis(a); } );
        _.act('main h3 a[href="#'+current_type+'-'+current_disp+'"]');
      }
      _.m('#int a, nav.header, main section, main section > div', function(a) { a.classList.remove('active'); }); // Switch off all top links and graphs....
      _.qs('a[href="#'+panel_name+'"]').classList.add('active');                       // Turn on nav link and view
      _.qs('#'+panel_name).classList.add('active');            //
      _.qs('#'+panel_name+'-'+__disp).classList.add('active'); //
      Plotly.Plots.resize(panel_name+'-'+__disp+'-graph');
    }
    _.m('main nav div div,.legend, #colour-by label', function(a) { _.dis(a); } ); // Hide all filter blocks...
    _.act('#colour-by-gene'); _.act('#legend-gene'); // Turn on gene colouring....

    if(current_data.hasOwnProperty('columns')) {
      _.m('.gene-table', function( a ) { a.innerHTML = ''; } );
      _.m('.view-type', function( a ) { a.innerHTML = current_disp.toUpperCase(); } );
      current_data.columns.forEach( function(a) {
        var fil = _.qs('#filter-'+a);
        if(fil){
          _.act( fil ); // Now we need to change the filter boxes.....
          var vals = current_data.values[a];
          _.m(fil,'label',function(x) { if( vals.includes(_.qs(x,'input').getAttribute('value')) ) { _.act(x); } else { _.dis(x); } });
          _.m(fil,'li',function(x) {
            var q = _.qm(x,'label.active').length;
            if(q) { x.style.display = 'flex'; } else { x.style.display = 'none'; }
          });
          _.act('#colour-by-'+a);
          var c=0;
          _.m(_.qs('#legend-'+a),'li',function(x) { if( vals.includes(c.toString()) ) { _.act(x); } else { _.dis(x); } c++; });
        }
        //_.act('#legend-'+a);
        _.act('#legend-'+current_colour);
        if( current_colour != 'gene' && ! current_data.columns.includes(current_colour) ) {
          _.qs('#colour-by-stage').click();
        }
      });
// Check that the colour is OK?
    } else { // This is KNN so turn on cluster colouring navigation...
      _.act('#colour-by-cluster');
      if( current_colour != 'gene' ) {
        _.qs('#colour-by-cluster').click();
      }
    }
    if( current_colour == 'gene' ) {// We need to refresh the gene chart!!
      if( current_view == 'gene' ) {
        update_gene_by_gene( current_gene );
      } else {
        update_cell_by_gene( current_gene );
      }
    }
  }

/*##############################################################################

Drawing cell graphs....

  (1) process_cell_graph
  (2) create_cell_graph
  (3) update_cell_by_gene

##############################################################################*/

  function process_cell_graph( t ) {
    var counter;
    t.hover_template      = t.popup.replaceAll('[[','%{customdata[').replaceAll(']]',']}');
    t.hover_template_expr = t.hover_template + '<br>Expression: %{text}<extra></extra>';
    t.hover_template     += '<extra></extra>';
    t.genes_length        = t.genes.length;
    t.current_gene        = '';
    t.default_text        = t.data.map( function(a) { return '-'; } );
    t.visible             = t.data.map( function(a) { return CONFIG.marker_size; } );
    t.customdata          = t.data.map( function(a) { counter = 0; return a.map( function( b ) { return b.match(/^\d+$/) ? CONFIG.filters[ t.columns[counter++] ][b][0] : b;} ); } );
    t.colours             = { gene: t.customdata.map( function(a) { return CONFIG.expression.def; } ) };
    counter=0;
    t.columns.forEach( function(a) {
      t.colours[ a ] = t.data.map( function(b) { return b.match(/^\d+$/) ? CONFIG.filters[ a ][b[counter]][1] : b[counter];} );
      counter++;
    });
  }

  function create_cell_chart( gflag, t ) {
    var def = 'stage';
    t.points = {};
    var flag = 0;
    if( t.hasOwnProperty('pca') ) { flag++;
      if( t.pca.length == 2) { // We have a 2d PCA chart!
        t.points.pca = [{ x: t.pca[0], y: t.pca[1], mode: 'markers', text: t.default_text,
          marker: { size: t.visible, color: t.colours[def], line: {width:0} },
          customdata: t.customdata, hovertemplate: t.hover_template, type: 'scatter'
        }];
        Plotly.newPlot(gflag+'-pca-graph', t.points.pca, { autosize: true, margin: CONFIG.margins2d, hovermode:'closest',
          scene: { xaxis: { range: t.ranges.pca[0], title: 'PC 1' },
                   yaxis: { range: t.ranges.pca[1], title: 'PC 2' }, }}, CONFIG.options2d );
      } else { // We have a 3d PCA chart!
        t.points.pca = [{ x: t.pca[0], y: t.pca[1], z: t.pca[2], mode: 'markers', text: t.default_text,
          marker: { size: t.visible, color: t.colours[def], line: {width:0} },
          customdata: t.customdata, hovertemplate: t.hover_template, type: 'scatter3d'
        }];
        Plotly.newPlot(gflag+'-pca-graph', t.points.pca, { autosize: true, margin: CONFIG.margins3d,
          scene: { xaxis: { range: t.ranges.pca[0], title: 'PC 1' },
                   yaxis: { range: t.ranges.pca[1], title: 'PC 2' },
                   zaxis: { range: t.ranges.pca[2], title: 'PC 3' }, }}, CONFIG.options3d );
      }
    }
    if( t.hasOwnProperty('umap') ) { flag++;
      if( t.umap.length == 2) { // We have a 2d umap chart!
        t.points.umap = [{ x: t.umap[0], y: t.umap[1], mode: 'markers', text: t.default_text,
          marker: { size: t.visible, color: t.colours[def], line: {width:0} },
          customdata: t.customdata, hovertemplate: t.hover_template, type: 'scatter'
        }];
        Plotly.newPlot(gflag+'-umap-graph', t.points.umap, { autosize: true, margin: CONFIG.margins2d, hovermode:'closest',
          scene: { xaxis: { range: t.ranges.umap[0], title: 'UMAP 1' },
                   yaxis: { range: t.ranges.umap[1], title: 'UMAP 2' }, }}, CONFIG.options2d );
      } else { // We have a 3d umap chart!
        t.points.umap = [{ x: t.umap[0], y: t.umap[1], z: t.umap[2], mode: 'markers', text: t.default_text,
          marker: { size: t.visible, color: t.colours[def], line: {width:0} },
          customdata: t.customdata, hovertemplate: t.hover_template, type: 'scatter3d'
        }];
        Plotly.newPlot(gflag+'-umap-graph', t.points.umap, { autosize: true, margin: CONFIG.margins3d,
          scene: { xaxis: { range: t.ranges.umap[0], title: 'UMAP 1' },
                   yaxis: { range: t.ranges.umap[1], title: 'UMAP 2' },
                   zaxis: { range: t.ranges.umap[2], title: 'UMAP 3' }, }}, CONFIG.options3d );
      }
    }
    if( flag < 2 ) {
      _.m('#'+gflag+' h3 a', function(a) { a.style.display = 'none'; } );
    } else {
      _.m('#'+gflag+' h3 a', function(a) {
        a.onclick = function(e) {
          e.preventDefault();
          var r = a.hash.split('-');
          var other = r[1] == 'umap' ? 'pca' : 'umap';
          _.act(a);
          _.dis('a[href="'+r[0]+'-'+other+'"]');
          _.dis(r[0]+'-cell-'+other);
          _.act(r[0]+'-cell-'+r[1]);
          var z = r[0].replace('#','');
          Plotly.Plots.resize(z+'-cell-'+r[1]+'-graph');
          current_disp = r[1];
          _.m('.view-type', function(a) { a.innerHTML = current_disp.toUpperCase(); } );
        };
      });
    }
  }

  function redraw_cell_by_gene( gene_id ) {
    var expdata = expression_cache[ current_type+'-'+current_gene ];
    var max_exp = expdata.max;
    _.qs('.gradient').style.display = 'flex';
    _.act('.input');
    if( max_exp == 0 ) {
      current_data.colours.gene = expdata.data.map( function(a) { return CONFIG.expression.def; } );
      _.m('.gradient span',         function(a) { a.innerText = '-'; } );
      _.s('.gradient span.exp-ave', function(a) { a.innerText = '';  } );
    } else {
      current_data.colours.gene = expdata.data.map( function(a) { return exp_colour(a,max_exp); } );
      _.s('.gradient span:first-of-type',  function(a) { a.innerText = '0.00';                                  });
      _.s('.gradient span:nth-of-type(2)', function(a) { a.innerText = Number.parseFloat(max_exp/2).toFixed(2); });
      _.s('.gradient span:last-of-type',   function(a) { a.innerText = Number.parseFloat(max_exp).toFixed(2);   });
      var t1=0; var t2=0; var t3=0;
      if(current_type=='ch10x') {
        graph.ch10x.cell.colours.gene = expdata.data.map( function(a) { return exp_colour(a,max_exp); } );
        t1 = { 'marker.color': [ graph.ch10x.cell.colours.gene ],
               'text'  : [expdata.data],
               'hovertemplate': graph.ch10x.cell.hover_template_expr };
      } else if( current_type=='ss2' ) {
        graph.ss2.cell.colours.gene = expdata.data.map( function(a) { return exp_colour(a,max_exp); } );
        t2 = { 'marker.color': [ graph.ss2.cell.colours.gene ],
               'text': [expdata.data],
               'hovertemplate': graph.ss2.cell.hover_template_expr };
      } else { // Additional graph added for pf-ch10x-comp - at some point we may need
               // to make this an arbitrary number of datasets
        graph.extra.cell.colours.gene = expdata.data.map( function(a) { return exp_colour(a,max_exp); } );
        t3 = { 'marker.color': [ graph.extra.cell.colours.gene ],
               'text': [expdata.data],
               'hovertemplate': graph.extra.cell.hover_template_expr };
      }
      update_graphs( t1, t2, t3 );
    }
  }

  function update_cell_by_gene( gene_id ) {
    _.m('.gene-name',  function(a) { a.innerText = gene_id; } );
    _.m('.gene-table', function(a) { a.innerHTML = '';      } );
    if( current_data.hasOwnProperty('genes') && current_data.genes.includes( gene_id ) ) {
      current_gene = gene_id;
      if( expression_cache.hasOwnProperty( current_type+'-'+gene_id ) ) {
        redraw_cell_by_gene( gene_id );
      } else {
        _.m('.loading', function(a) { a.innerText = 'LOADING DATA FOR '+gene_id; a.style.display = 'block';} );
        _.json( '/processed/' + (_.qs("#main").dataset.directory) + '/' + current_type +'/exp/'+gene_id+'.json', function(expdata) {
          expression_cache[ current_type+'-'+gene_id ] = expdata;
          _.m('.loading', function(a) { a.style.display = 'none'; });
          redraw_cell_by_gene( gene_id );
        });
      }
    } else {
      // Set colours to default....
    }
  }

/*##############################################################################

Drawing gene graphs....

  (1) process_gene_graph
  (2) create_gene_graph
  (3) update_gene_by_gene

##############################################################################*/


  function process_gene_graph( t ) {
    t.default_text        = t.data.map( function(a) { return '-'; } );
    t.visible             = t.data.map( function(a) { return CONFIG.marker_size; } );
    t.hover_template      = t.popup.replaceAll('[[','%{customdata[').replaceAll(']]',']}');
    t.hover_template     += '<extra></extra>';
    t.customdata          = t.data;
    t.current_gene        = '';
    t.genes               = t.data.map( function(a) { return a[1]; } );
    t.genes_length        = t.data.length;
    t.colours             = { gene: t.customdata.map( function(a) { return CONFIG.expression.def; } ),
                              cluster: t.data.map( function(a) { return CONFIG.filters.cluster[ a[0] ][1]; } ) };
  }
  function create_gene_chart( gflag, t ) {
    t.points = {};
    t.points.knn = [{ x: t.knn[0], y: t.knn[1], mode: 'markers', text: t.default_text,
      marker: { size: t.visible, color: t.colours.cluster, line: {width:0} },
      customdata: t.customdata, hovertemplate: t.hover_template, type: 'scatter'
    }];
    Plotly.newPlot(gflag+'-knn-graph', t.points.knn, { autosize: true, margin: CONFIG.margins, hovermode:'closest',
      scene: { xaxis: { range: t.ranges.knn[0], title: 'KNNx' },
               yaxis: { range: t.ranges.knn[1], title: 'KNNy' }, }}, CONFIG.options2d );
    _.qs('#'+gflag+'-knn-graph').on('plotly_click',function(d) { update_gene_by_gene( d.points[0].customdata[1] ) } );
    return;
  }

  function update_gene_by_gene( gene_id ) {
    _.m('.input',     function( a ) { _.act(a); } );
    _.m('.gradient',  function( a ) { a.style.display = 'none'; } );
    _.m('.gene-name', function( a ) { a.innerText = gene_id; } );
    if( gene_id == '' || ! current_data.genes.includes( gene_id ) ) {
      current_data.colours.gene = current_data.customdata.map( function(a) { return CONFIG.knn.def; } );
      _.m('.gene-table', function( a ) { a.innerHTML = ''; } );
    } else {
      var details;
      current_data.customdata.forEach( function(a) { if( gene_id == a[1] ) details = a; } );
      current_data.colours.gene = current_data.customdata.map( function( a ) {
        return a[1]==gene_id ? CONFIG.knn.gene : (a[0]==details[0] ? CONFIG.knn.cluster : CONFIG.knn.def ); } );
      var table = current_data.table.replace(/\[\[(\d+)\]\]/g, function(match,p1) { return details[p1]; });
      _.m('.gene-table', function( a ) { a.innerHTML = table; } );
    }
    Plotly.restyle( current_type+'-gene-knn-graph', { 'marker.color' : [current_data.colours.gene] } );
  }

/*##############################################################################

Interaction functions

  (1) changeFilter
  (2) create_gene_graph
  (3) update_gene_by_gene

##############################################################################*/

  function changeFilter( n ) { n.onchange = function(e) {
    var nav = _.qs('main nav');
    var filter_set={};
    // Update filters...
    _.m(nav,'input[type="checkbox"]', function(a) { filter_set[a.name+'-'+a.value] = a.checked ? 1: 0; } );
    var x1,x2;
    if( has('ch10x-cell') ) {
      x1=graph.ch10x.cell.visible = graph.ch10x.cell.data.map( function(x) {
        var res = CONFIG.marker_size, c=0;
        graph.ch10x.cell.filters.forEach( function(a) { return res *= filter_set[ a+'-'+x[c++] ]; } );
        return res;
      } );
    }
    if( has('ss2-cell') ) {
      x2=graph.ss2.cell.visible = graph.ss2.cell.data.map( function(x) {
        var res = CONFIG.marker_size, c=0;
        graph.ss2.cell.filters.forEach( function(a) { return res *= filter_set[ a+'-'+x[c++] ]; } );
        return res;
      } );
    }
    if( has('extra-cell') ) {
      x2=graph.extra.cell.visible = graph.extra.cell.data.map( function(x) {
        var res = CONFIG.marker_size, c=0;
        graph.extra.cell.filters.forEach( function(a) { return res *= filter_set[ a+'-'+x[c++] ]; } );
        return res;
      } );
    }
    update_graphs(
      { 'marker.size':[ x1 ] },
      { 'marker.size':[ x2 ] },
      0,
      0,
      { 'marker.size':[ x3 ] }
    );
  }; }

  function changeColour( n ) {
    var nav = _.qs('main nav');
    n.onchange = function(e) {
      _.m(nav,'.legend', function( a ) { a.style.display = 'none'; } );
      _.s(nav, 'input[type="radio"]:checked', function( a ) { current_colour = a.value; } );
      _.s(nav,'#legend-'+current_colour, function( a ) { a.style.display = 'block'; } );
      _.m('#legend-gene .input', function( a ) { _.act(a); } );
      _.m('#legend-gene .gradient', function(a) { _.act(a); a.style.display = 'flex'; } );
      update_graphs(
        { 'marker.color': [ has('ch10x-cell') ? graph.ch10x.cell.colours[current_colour] : [] ] },
        { 'marker.color': [ has('ss2-cell'  ) ? graph.ss2.cell.colours[  current_colour] : [] ] },
        { 'marker.color': [ has('ch10x-gene') ? graph.ch10x.gene.colours[current_colour] : [] ] },
        { 'marker.color': [ has('ss2-gene'  ) ? graph.ss2.gene.colours[  current_colour] : [] ] },
        { 'marker.color': [ has('extra-cell') ? graph.extra.cell.colours[current_colour] : [] ] },
        { 'marker.color': [ has('extra-gene') ? graph.extra.gene.colours[current_colour] : [] ] }
      );
      if( current_colour == 'gene' ) {
        if( current_view == 'gene' ) {
          update_gene_by_gene( current_gene );
        } else {
          update_cell_by_gene( current_gene );
        }
      } else {
        _.m('.gene-table, .gene-name', function(a) { a.innerHTML = ''; } );
      }
      return;
    };
  }


  // Wrapper to check for data for graph & to activate graph & to update links....
  function graph_set_up( f, k1, k2 ) {
    if(graph.hasOwnProperty(k1)) {
      if( graph[k1].hasOwnProperty(k2) ) {
        _.qs('a[href="#'+k1+'-'+k2+'"]').classList.remove('disabled');
        if(f) { _.qs('a[href="#'+k1+'-'+k2+'"]').classList.add('active'); f=0; current_type=k1; current_view=k2; }
        if(k2=='cell') {
          process_cell_graph( graph[k1][k2] );
          create_cell_chart( k1+'-'+k2, graph[k1][k2] );
        } else {
          process_gene_graph( graph[k1][k2] );
          create_gene_chart( k1+'-'+k2, graph[k1][k2] );
        }
        return 1;
      }
    }
    return f;
  }

  function ddClick( n ) { n.onclick = function(e) {
    _.s('main nav input[type="text"]', function( a ) {
      a.value = e.target.innerText;
      _.s(navdd,'', function( b ) { b.innerHTML=''; } );
      a.onkeyup();
    } );
  };}

  function changeGene( n ) { n.onkeyup = function(e) {
    var new_gene = _.qs( '#new-gene' ).value;
    if( ! ( current_data.genes.includes(new_gene) ) && new_gene !== '' ) {
      // We need to activate the dropdown...
      _.s(navdd,'', function(a) { a.innerHTML = ''; } );
      var html = '';
      var count = 0;
      for(var i=0; i< current_data.genes_length && count < 10; i++ ) {
        if(current_data.genes[i].includes(new_gene)) {
          html += '<li>'+current_data.genes[i]+'</li>';
          count++;
        }
      }
      _.s(navdd,'', function(a) { a.innerHTML = html; } );
      return;
    }
    if( new_gene == current_gene ) {
      return;
    }
    if( new_gene === '' ) {
      _.m('.extra-title', function(a) { a.innerHTML = ''; } );
      current_gene = new_gene;
      var t1 = '', t2 = '', t3 = '', t4 = '';
      if( graph.hasOwnProperty('ch10x') && graph.ch10x.hasOwnProperty('cell') ) {
        t1 = graph.ch10x.cell.colours.gene = graph.ch10x.cell.customdata.map( function(a) { return CONFIG.expression.def;}  ); // reset colours
      }
      if( graph.hasOwnProperty('ss2') && graph.ss2.hasOwnProperty('cell') ) {
        t2 = graph.ss2.cell.colours.gene = graph.ss2.cell.customdata.map( function(a) { return CONFIG.expression.def; } ); // reset colours
      }
      if( graph.hasOwnProperty('ch10x') && graph.ch10x.hasOwnProperty('gene') ) {
        t3 = graph.ch10x.gene.colours.gene = graph.ch10x.gene.customdata.map( function(a) { return CONFIG.expression.def; } ); // reset colours
      }
      if( graph.hasOwnProperty('ss2') && graph.ss2.hasOwnProperty('gene') ) {
        t4 = graph.ss2.gene.colours.gene = graph.ss2.gene.customdata.map( function(a) { return CONFIG.knn.def; } ); // reset colours
      }
      if( graph.hasOwnProperty('extra') && graph.extra.hasOwnProperty('cell') ) {
        t5 = graph.extra.cell.colours.gene = graph.ss2.extra.customdata.map( function(a) { return CONFIG.expression.def; } ); // reset colours
      }
      if( graph.hasOwnProperty('extra') && graph.extra.hasOwnProperty('gene') ) {
        t6 = graph.extra.gene.colours.gene = graph.extra.gene.customdata.map( function(a) { return CONFIG.expression.def; } ); // reset colours
      }
      var nav   = _.qs('main nav');
      _.m(nav,'.gradient span',         function(a) { a.innerText = '-'; });
      _.s(nav,'.gradient span.exp-ave', function(a) { a.innerText = '';  });
      update_graphs(
        { 'marker.color': [t1], 'hovertemplate': graph.hasOwnProperty('ch10x') && graph.ch10x.hasOwnProperty('cell') ? graph.ch10x.cell.hover_template : ''},
        { 'marker.color': [t2], 'hovertemplate': graph.hasOwnProperty('ss2')   && graph.ss2.hasOwnProperty('cell')   ? graph.ss2.cell.hover_template   : '' },
        { 'marker.color': [t3] },
        { 'marker.color': [t4] },
        { 'marker.color': [t5], 'hovertemplate': graph.hasOwnProperty('extra')   && graph.extra.hasOwnProperty('cell')   ? graph.extra.cell.hover_template   : '' },
        { 'marker.color': [t6] }
      );
      return;
    }
    // Here we now have to do another fetch this time of the expression data....
    if( current_view == 'gene' ) {
      update_gene_by_gene( new_gene );
    } else {
      update_cell_by_gene( new_gene );
    }
  };}

  function load_data(  ) {
    _.m('.loading', function(a) { a.innerText = 'LOADING DATA'; a.style.display = 'block';} );
    var time = Date.now();
    _.json( '/processed/' + (_.qs("#main").dataset.directory) + '/' + CONFIG.filename, function( t) {
// Create the hover templates...
      graph = t;
      current_gene = t.default_gene;
      _.s('#new-gene', function(a) { a.value = current_gene; } );
      var fetched_time = Date.now() - time;
      // Part 1 processes the cell graph data....
      _.m('#int a', function(a) { a.classList.add('disabled'); } );
      var f=1;
      f = graph_set_up( f, 'ss2',   'cell' ); f = graph_set_up( f, 'ss2',   'gene' );
      f = graph_set_up( f, 'ch10x', 'cell' ); f = graph_set_up( f, 'ch10x', 'gene' );
      f = graph_set_up( f, 'extra', 'cell' ); f = graph_set_up( f, 'extra', 'gene' );
      switch_panel( current_type+'-'+current_view );
      // Draw graphs....
      var rendered_time = Date.now() - time - fetched_time;
      var nav   = _.qs('main nav');
      // We need to indicate which graphs we have....
      _.m(nav,'input[type="checkbox"]', changeFilter); // Now add actions on change filters....
      _.m(nav,'input[type="radio"]',    changeColour); // Now add actions on change colour set
      _.m(nav,'input[type="text"]',     changeGene);   // Now add actions on change gene...
      _.s( navdd, '', ddClick);
      // Finally remove "shim" over graph...
      _.m('.loading', function(a) { a.style.display = 'none'; } );
      var post_time = Date.now() - time - fetched_time - rendered_time;
      _.m('#colour-by-caption', function(a) { a.style.display = 'block'; } );
      _.m( '#int a', function( n ) { n.onclick = function( e ) {
        e.preventDefault();
        switch_panel( this.getAttribute('href').replace('#','') );
      }; } );
      console.log( 'Fetch: '+(fetched_time/1000)+' sec; Render: '+(rendered_time/1000)+' sec; Post: '+(post_time/1000)+' sec; Total: '+((Date.now()-time)/1000)+' sec.' );
    });
  }
}(document));

