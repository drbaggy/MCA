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
  var pal = [ '#ff0029', '#377eb8', '#66a61e', '#984ea3', '#00d2d5', '#ff7f00', '#af8d00',
              '#7f80cd', '#b3e900', '#c42e60', '#a65628', '#f781bf', '#8dd3c7', '#bebada',
              '#fb8072', '#80b1d3', '#fdb462', '#fccde5', '#bc80bd', '#ffed6f', '#c4eaff',
              '#cf8c00', '#1b9e77', '#d95f02', '#e7298a', '#e6ab02', '#a6761d', '#0097ff',
              '#00d067', '#000000', '#252525', '#525252', '#737373', '#969696', '#bdbdbd',
              '#f43600', '#4ba93b', '#5779bb', '#927acc', '#97ee3f', '#bf3947', '#9f5b00',
              '#f48758', '#8caed6', '#f2b94f', '#eff26e', '#e43872', '#d9b100', '#9d7a00',
              '#698cff', '#d9d9d9', '#00d27e', '#d06800', '#009f82', '#c49200', '#cbe8ff',
              '#fecddf', '#c27eb6', '#8cd2ce', '#c4b8d9', '#f883b0', '#a49100', '#f48800',
              '#27d0df', '#a04a9b' ];


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
  var gene_dropdown  = _.qs('#legend-gene ul');
  var CONFIG = {
    expression: { // Configuration for expression colours....
      def: '#cccccc',
      colours: [[68,1,84],[71,45,123],[59,82,139],[44,114,142],[33,144,140],[39,173,129],[93,200,99],[170,220,50],[253,231,37],[253,231,37]]
    },
    knn: { def: '#cccccc', cluster: '#999999', gene: '#cc0000' },
    filters: {
      'cluster':      [ ['X','#000000' ],       ['Cluster 1', pal[0] ], ['Cluster 2', pal[1] ], ['Cluster 3', pal[2] ],
                        ['Cluster 4', pal[3] ], ['Cluster 5', pal[4] ], ['Cluster 6', pal[5] ], ['Cluster 7', pal[6] ],
                        ['Cluster 8', pal[7] ], ['Cluster 9', pal[8] ], ['Cluster 10',pal[9] ], ['Cluster 11',pal[10]],
                        ['Cluster 12',pal[11]], ['Cluster 13',pal[12]], ['Cluster 14',pal[13]], ['Cluster 15',pal[14]],
                        ['Cluster 16',pal[15]], ['Cluster 17',pal[16]], ['Cluster 18',pal[17]], ['Cluster 19',pal[18]],
                        ['Cluster 20',pal[19]], ['Cluster 21',pal[20]], ['Cluster 22',pal[21]], ['Cluster 23',pal[22]]  ],
      'cluster_2':    [ ['Asexual 1', pal[0] ], ['Asexual 2', pal[1] ], ['Asexual 3' ,pal[2] ], ['Asexual 4', pal[3] ],
                        ['Asexual 5', pal[4] ], ['Asexual 6', pal[5] ], ['Asexual 7' ,pal[6] ], ['Asexual 8', pal[7] ],
                        ['Asexual 9', pal[8] ], ['Asexual 10',pal[9] ], ['Asexual 11',pal[10]], ['Asexual 12',pal[11]],
                        ['Asexual 13',pal[12]], ['Asexual 14',pal[13]], ['Asexual 15',pal[14]], ['Asexual 16',pal[15]],
                        ['Asexual 17',pal[16]], ['Progenitor',pal[17]], ['Female 1',  pal[18]], ['Female 2',  pal[19]],
                        ['Female 3',  pal[20]], ['Male 1',    pal[21]], ['Male 2',    pal[22]]                          ],
      'strain' :      [ [ '3D7',      pal[0] ], [ '7G8',      pal[1] ], [ 'GB4',      pal[2] ], ['Sen-GB4',   pal[3] ],
                        [ 'SenTho011',pal[4] ], [ 'SenTho015',pal[5] ], [ 'SenTho028',pal[6] ]                          ],
      'day':          [ [ 'D1', '#D73027' ],    [ 'D2', '#F46D43' ],    [ 'D3',   '#FDAE61' ],  [ 'D4', '#FEE090' ],
                        [ 'D6', '#E0F3F8' ],    [ 'D8', '#ABD9E9' ],    [ 'D10',  '#74ADD1' ]                           ],
      'technology':   [ [ 'Chromium 10x',  pal[0] ], [ 'SmartSeq2',     pal[1] ]                                        ],
      'sex' :         [ [ 'Asexual_Early', pal[0] ], [ 'Asexual_Late',  pal[1] ], [ 'Bipotential',   pal[2] ],
                        [ 'Female',        pal[3] ], [ 'Male',          pal[4] ]                                        ],
      'host':         [ [ 'mosquito', '#ffa600'   ], [ 'human',    '#bc5090'   ], [ 'mouse',    '#003f5c'   ]           ],
      'stage':        [ [ 'liver',                        '#B6D7A8' ],  [ 'merozoite',                    '#D0E0E3' ],
                        [ 'ring',                         '#A2C4C9' ],  [ 'trophozoite',                  '#45818E' ],
                        [ 'schizont',                     '#134F5C' ],  [ 'gametocyte (developing)',      '#D8C0D8' ],
                        [ 'gametocyte (male)',            '#9370DB' ],  [ 'gametocyte (female)',          '#551A8B' ],
                        [ 'ookinete',                     '#A61C00' ],  [ 'oocyst',                       '#CC4125' ],
                        [ 'sporozoite (oocyst)',          '#E69138' ],  [ 'sporozoite (hemolymph)',       '#FFF2CC' ],
                        [ 'sporozoite (salivary gland)',  '#FFE599' ],  [ 'sporozoite (injected)',        '#F1C232' ],
                        [ 'sporozoite (activated)',       '#BF9000' ]                                                   ]
    },
    filename: 'data.json',
    marker_size: 5,
    margins3d: { l:  5, r: 5, b:  5, t: 5 },
    margins2d: { l: 35, r: 5, b: 35, t: 5 },
    options2d: {responsive: true,displayModeBar: true,displaylogo: false, modeBarButtonsToRemove: ['select2d', 'lasso2d', 'hoverClosestCartesian', 'hoverCompareCartesian' ]},
    options3d: {responsive: true,displayModeBar: true,displaylogo: false, modeBarButtonsToRemove: ['resetCameraLastSave3d', 'hoverClosest3d']}
  };
  CONFIG.filters.cluster_1 = CONFIG.filters.cluster;
  var current_size   = CONFIG.marker_size;
/*######################################################################

  The main script...
  ==================

######################################################################*/

  insert_legend_and_filters();                       // Add additional HTML to the page!
  load_data();                                       // Load data and trigger rendering of graphs

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


  function exp_colour( a, mx, mn ) {
    var i = Math.floor((a-mn)/(mx-mn)*8);
    var o = (a-mn)/(mx-mn) - i/8;
    var p = 1 - o; console.log(a,mx,mn,i);
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
      var e = _.qs( '#legend-'+k+' ul' );
      if( e ) {
        CONFIG.filters[k].forEach( function(a) {
          ht+= '<li><span style="background-color:'+a[1]+'">&nbsp;</span>'+a[0]+'</label>'; e.innerHTML = ht;
        } );
      }
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
    _.act('#colour-by-pseudo');
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
        }
        var col = _.qs('#colour-by-'+a);
        if(col) {
          _.act( col );
          var c=0;
          var vals = current_data.values[a];
          _.m('#legend-'+a+' li',function(x) { if( vals.includes(c.toString()) ) { _.act(x); } else { _.dis(x); } c++; });
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
    t.visible             = current_size;
    t.customdata          = t.data.map( function(a) { counter = 0; return a.map( function( b ) { return b.match(/^\d+$/) ? CONFIG.filters[ t.columns[counter++] ][b][0] : b;} ); } );
    t.colours             = { gene: t.customdata.map( function(a) { return CONFIG.expression.def; } ) };
    counter=0;
    t.columns.forEach( function(a) {
      t.colours[ a ] = t.data.map( function(b) { return b[counter].match(/^\d+$/) ? CONFIG.filters[ a ][b[counter]][1] : b[counter];} );
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
    var expdata = expression_cache[ current_type+'-'+current_gene ]; console.log(expdata);
    var max_exp = expdata.max;
    var min_exp = expdata.min;
    _.qs('.gradient').style.display = 'flex';
    _.act('.input');
    if( max_exp == 0 ) {
      current_data.colours.gene = expdata.data.map( function(a) { return CONFIG.expression.def; } );
      _.m('.gradient span',         function(a) { a.innerText = '-'; } );
      _.s('.gradient span.exp-ave', function(a) { a.innerText = '';  } );
    } else {
      current_data.colours.gene = expdata.data.map( function(a) { return exp_colour(a,max_exp,min_exp); } );
      _.s('.gradient span:first-of-type',  function(a) { a.innerText = Number.parseFloat( min_exp           ).toFixed(2); });
      _.s('.gradient span:nth-of-type(2)', function(a) { a.innerText = Number.parseFloat((min_exp+max_exp)/2).toFixed(2); });
      _.s('.gradient span:last-of-type',   function(a) { a.innerText = Number.parseFloat( max_exp           ).toFixed(2); });
      var t1=0; var t2=0; var t3=0;
      if(current_type=='ch10x') {
        graph.ch10x.cell.colours.gene = expdata.data.map( function(a) { return exp_colour(a,max_exp,min_exp); } );
        t1 = { 'marker.color': [ graph.ch10x.cell.colours.gene ],
               'text'  : [expdata.data],
               'hovertemplate': graph.ch10x.cell.hover_template_expr };
      } else if( current_type=='ss2' ) {
        graph.ss2.cell.colours.gene = expdata.data.map( function(a) { return exp_colour(a,max_exp,min_exp); } );
        t2 = { 'marker.color': [ graph.ss2.cell.colours.gene ],
               'text': [expdata.data],
               'hovertemplate': graph.ss2.cell.hover_template_expr };
      } else { // Additional graph added for pf-ch10x-comp - at some point we may need
               // to make this an arbitrary number of datasets
        graph.extra.cell.colours.gene = expdata.data.map( function(a) { return exp_colour(a,max_exp,min_exp); } );
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
    t.visible             = CONFIG.marker_size;
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
    _.m('.input',     function( a ) {
      _.act(a);
    } );
    _.m('.gradient',  function( a ) {
      a.style.display = 'none';
    } );
    _.m('.gene-name', function( a ) {
      a.innerText = gene_id;
    } );
    if( gene_id == '' || ! current_data.genes.includes( gene_id ) ) {
      current_data.colours.gene = current_data.customdata.map( function(a) {
        return CONFIG.knn.def;
      } );
      _.m('.gene-table', function( a ) {
        a.innerHTML = '';
      } );
    } else {
      var details;
      current_data.customdata.forEach( function(a) { if( gene_id == a[1] ) details = a; } );
      current_data.colours.gene = current_data.customdata.map( function( a ) {
        return a[1]==gene_id ? CONFIG.knn.gene : (a[0]==details[0] ? CONFIG.knn.cluster : CONFIG.knn.def );
      } );
      var table = current_data.table.replace(/\[\[(\d+)\]\]/g, function(match,p1) {
        return details[p1];
      });
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

  function changeFilter( n ) { n.onchange = update_filter; }

  function update_filter(e) {
    var nav = _.qs('main nav');
    var filter_set={};
    // Update filters...
    _.m(nav,'input[type="checkbox"]', function(a) {
      filter_set[a.name+'-'+a.value] = a.checked ? 1: 0;
    } );
    var x1,x2,x3;
    if( has('ch10x-cell') ) {
      x1 = graph.ch10x.cell.visible = graph.ch10x.cell.data.map( function(x) {
        var res = current_size, c=0;
        graph.ch10x.cell.filters.forEach( function(a) {
          return res *= filter_set[ a+'-'+x[c++] ];
        } );
        return res;
      } );
    }
    if( has('ss2-cell') ) {
      x2 = graph.ss2.cell.visible = graph.ss2.cell.data.map( function(x) {
        var res = current_size, c=0;
        graph.ss2.cell.filters.forEach( function(a) {
          return res *= filter_set[ a+'-'+x[c++] ];
        } );
        return res;
      } );
    }
    if( has('extra-cell') ) {
      x3 = graph.extra.cell.visible = graph.extra.cell.data.map( function(x) {
        var res = current_size, c=0;
        graph.extra.cell.filters.forEach( function(a) {
          return res *= filter_set[ a+'-'+x[c++] ];
        } );
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
  }

  function changeSize( n ) {
    var nav = _.qs('main nav');
    n.onchange = function(e) {
      _.m(nav,'#point-size input[type="radio"]:checked', function( a ) { current_size = a.value; } );
      update_filter(e); // We do this as we have to apply the filters in cell view - so we can call this
      var upd = { 'marker.size': current_size };  // For geneviews the marker.size is constant so only have to assign scalar not array.
      update_graphs( 0, 0, upd, upd, 0, upd );
    }
  }

  function changeColour( n ) {
    n.onchange = update_colour;
  }

  function update_colour( ) {
    var nav = _.qs('main nav');
    _.m( nav, '.legend',                            function( a ) { a.style.display = 'none'; } );
    _.s( '#colour-by input[type="radio"]:checked',  function( a ) { current_colour = a.value; } );
    _.s( '#legend-'+current_colour,                 function( a ) { a.style.display = 'block'; } );
    _.m( '#legend-gene .input',                     function( a ) { _.act(a); } );
    _.m( '#legend-gene .gradient',                  function( a ) { _.act(a); a.style.display = 'flex'; } );
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
  }


  // Wrapper to check for data for graph & to activate graph & to update links....
  function graph_set_up( f, k1, k2 ) {
    if(graph.hasOwnProperty(k1)) {
      if( graph[k1].hasOwnProperty(k2) ) {
        _.s('a[href="#'+k1+'-'+k2+'"]', function(a) {
          a.classList.remove('disabled');
        } );
        if(!f) { _.qs('a[href="#'+k1+'-'+k2+'"]').classList.add('active'); current_type=k1; current_view=k2; }
        if(k2=='cell') {
          process_cell_graph( graph[k1][k2] );
          create_cell_chart( k1+'-'+k2, graph[k1][k2] );
        } else {
          process_gene_graph( graph[k1][k2] );
          create_gene_chart( k1+'-'+k2, graph[k1][k2] );
        }
        return f+1;
      }
    }
    return f;
  }

  function geneDropDownClick( n ) { n.onclick = function(e) {
    _.s('main nav input[type="text"]', function( a ) {
      a.value = e.target.innerText;
      _.s(gene_dropdown,'', function( b ) {
        b.innerHTML='';
      } );
      a.onkeyup();
    } );
  };}

  function changeGene( n ) { n.onkeyup = gene_key_up; }

  function gene_key_up( ) {
    var new_gene = _.qs( '#new-gene' ).value;
    if( ! ( current_data.genes.includes(new_gene) ) && new_gene !== '' ) {
      // We need to activate the dropdown...
      _.s(gene_dropdown,'', function(a) { a.innerHTML = ''; } );
      var html = '';
      var count = 0;
      for(var i=0; i< current_data.genes_length && count < 10; i++ ) {
        if(current_data.genes[i].includes(new_gene)) {
          html += '<li>'+current_data.genes[i]+'</li>';
          count++;
        }
      }
      _.s(gene_dropdown,'', function(a) { a.innerHTML = html; } );
      return;
    }
    if( new_gene == current_gene ) {
      return;
    }
    if( new_gene === '' ) {
      _.m('.extra-title', function(a) { a.innerHTML = ''; } );
      current_gene = new_gene;
      var t1 = '', t2 = '', t3 = '', t4 = '', t5 = '', t6 = '';
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
        { 'marker.color': [t1], 'hovertemplate': graph.hasOwnProperty('ch10x') && graph.ch10x.hasOwnProperty('cell') ? graph.ch10x.cell.hover_template : '' },
        { 'marker.color': [t2], 'hovertemplate': graph.hasOwnProperty('ss2')   && graph.ss2.hasOwnProperty('cell')   ? graph.ss2.cell.hover_template   : '' },
        { 'marker.color': [t3] },
        { 'marker.color': [t4] },
        { 'marker.color': [t5], 'hovertemplate': graph.hasOwnProperty('extra') && graph.extra.hasOwnProperty('cell') ? graph.extra.cell.hover_template : '' },
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
  }

  function load_data(  ) {
    _.m('.loading', function(a) {
      a.innerText = 'DOWNLOADING DATA'; a.style.display = 'block';
    } );
    var time = Date.now();                                            // Performance logger
    _.json( '/processed/' + (_.qs("#main").dataset.directory) + '/' + CONFIG.filename, function( t ) {
      graph        = t;                                               // Store in global variable.
      current_gene = t.default_gene;                                  // Store in global variable.
      _.s('#new-gene',  function(a) { a.value = current_gene; } );     // Update the gene dropdown with default value...
      _.m('#int a',     function(a) { a.classList.add('disabled'); } );   // Disable all graph buttons....
      _.m('.loading',   function(a) { a.innerText = 'GENERATING DISPLAYS'; });
      setTimeout(       function()  { render_charts(time); }, 0 );
    });
  }

  function render_charts(time) {
    var fetched_time = Date.now() - time;                           // Record time for log report below
    var f=0;
    f = graph_set_up( f, 'ss2',   'cell' ); f = graph_set_up( f, 'ss2',   'gene' ); // Set up graphs for SmartSeq2
    f = graph_set_up( f, 'ch10x', 'cell' ); f = graph_set_up( f, 'ch10x', 'gene' ); // Set up graphs for chromium 10x
    f = graph_set_up( f, 'extra', 'cell' ); f = graph_set_up( f, 'extra', 'gene' ); // Set up graphs for 3rd set (hacky)
    if(f>1) {                                                       // If more than 1 graph show navigation
      _.s('#graph-nav',function(a) { a.style.display = 'block'; } );
    }
    switch_panel( current_type+'-'+current_view );                  // Display current view
    // Draw graphs....
    var rendered_time = Date.now() - time - fetched_time;           // Record time for log report below
    var nav   = _.qs('main nav');                                   // Get the "options panel" and actions
    _.m(nav,'input[type="checkbox"]', changeFilter);                //  * add actions on change filters....
    _.m(nav,'#colour-by  input[type="radio"]', changeColour);       //  * add actions on change colour set
    _.m(nav,'#point-size input[type="radio"]', changeSize);         //  * add actions on change colour set
    _.m(nav,'input[type="text"]',     changeGene);                  //  * add actions on change gene...
    // Add
    _.s( gene_dropdown, '', geneDropDownClick );                         // "Auto completer" action on gene drop down.
    // Finally remove "shim" over graph...
    _.m('#colour-by-caption, #point-size, #point-size-caption', function(a) {
      a.style.display = 'block';
    } ); // Show colour by caption which we hid while loading
    _.m('.loading', function(a) {
      a.style.display = 'none';
    } );                        // Clear the "loading data" mask
    _.m( '#int a', function( n ) {
      n.onclick = function( e ) {                                   // Add panel switching function to top navigation
        e.preventDefault();
        switch_panel( this.getAttribute('href').replace('#','') );
      };
    } );
    var post_time = Date.now() - time - fetched_time - rendered_time; // Report times to console ...
    console.log( 'Fetch: '+(fetched_time/1000)+' sec; Render: '+(rendered_time/1000)+
            ' sec; Post: '+(post_time/1000)+' sec; Total: '+((Date.now()-time)/1000)+' sec.' );
  }
}(document));

