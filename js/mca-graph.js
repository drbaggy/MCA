(function () {
  var FILE_NAME = 'x_samples.json';
  'use strict';
  var HOVER_TEMPLATE      = 'Stage: %{customdata[0]}<br>Day: %{customdata[1]}<extra></extra>';
  var HOVER_TEMPLATE_GENE = 'Stage: %{customdata[0]}<br>Day: %{customdata[1]}<br>Expr.: %{text2]}<extra></extra>';
  load_data('#pf-new');

  function load_data( id ) {
    _.m('.loading', a => a.style.display = 'block');
    var plotdata;
    Plotly.d3.json( 'data/' + (_.q(id).dataset.directory) + '/'.FILE_NAME, function(err, plotdata) {
      var config = plotdata.config;
/*{
  'expression_colours'  => [[68,1,84],[71,45,123],[59,82,139],[44,114,142],[33,144,140],[39,173,129],[93,200,99],[170,220,50],[170,220,50]],
  'expression_default'  => '#cccccc',
  'ranges'              => {'PC':[[-1,1],[-2,1],[-4,2]],'UMAP':...},
  'marker_size'         => 5,
  'columns' => [{ 'name': 'Stage','colours': [['rings', '#78C679', 'Rings'],...]},
                { 'name': 'Day',  'colours': [['D1',    '#D73047'],...]},
}*/
      console.log(config);
    });
  }
}());