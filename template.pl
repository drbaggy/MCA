use strict;

my $CONFIG = [
  { 'code' => 'pb', 'name' => 'P. briggsae'    },
  { 'code' => 'pf', 'name' => 'P. falcipuarum' },
  { 'code' => 'pk', 'name' => 'P. knowlesi'    },
];
print_file( $_->{'code'}, $_->{'name'} ) foreach @{$CONFIG};

sub print_file {
  my( $code, $name ) = @_;
  my $links = join ' | ', map { sprintf '<a href="%s">%s</a>', $_->{'code'}, $_->{'name'} } grep { $_->{'code'} ne $code } @{$CONFIG};

  open my $fh, '>', "$code/index.html";
  printf {$fh}
'<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en-US">
  <head>
    <title>Malaria Cell Atlas</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <meta name="description" content="The Malaria Cell Atlas is an active project led by the Lawniczak lab to provide an interactive data resource of single cell transcriptomic data across the full lifecycle of malaria parasites.">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@sangerinstitute">
    <meta name="twitter:creator" content="www-core (Sanger webteam)">
    <meta name="twitter:title" content="Malaria Cell Atlas - Wellcome Sanger Institute">
    <meta name="twitter:description" content="The Malaria Cell Atlas is an active project led by the Lawniczak lab to provide an interactive data resource of single cell transcriptomic data across the full lifecycle of malaria parasites.">
    <meta name="twitter:image" content="https://www.sanger.ac.uk/wp-content/themes/www_sanger/dist/assets/gfx/og-sanger-logo.png">

    <meta property="og:url" content="https://www.sanger.ac.uk/tool/mca/">
    <meta property="og:type" content="article" />
    <meta property="og:title" content="Malaria Cell Atlas - Wellcome Sanger Institute" />
    <meta property="og:description" content="The Malaria Cell Atlas is an active project led by the Lawniczak lab to provide an interactive data resource of single cell transcriptomic data across the full lifecycle of malaria parasites.">
    <meta property="og:image" content="https://www.sanger.ac.uk/wp-content/themes/www_sanger/dist/assets/gfx/og-sanger-logo.png">
    <meta property="og:locale" content="en_GB" />
    <meta property="og:profile_id" content="sangerinstitute" />
    <link rel="stylesheet" href="/mca/css/mca-header-and-footer.css">
    <link rel="stylesheet" href="/mca/css/mca-chart.css">
    <link rel="stylesheet" href="/mca/css/cookies-min.css">
  </head>
  <body id="body">
    <header><div>
      <div><a href="/mca/"><img height=128 width=128 alt="* Malaria Cell Atlas Logo" src="/mca/gfx/logo.png"></a></div>
      <h1><a href="/mca/"><strong>M</strong>alaria <strong>C</strong>ell <strong>A</strong>tlas</a></h1>
      <nav id="top"><a href="/mca/downloads/">Downloads</a> | <a href="/mca/docs/">Documentation</a> | <a href="/mca/publications/">Publications</a> | <a href="/mca/about/">About</a> | <a href="/mca/contact/">Contact</a></nav>
      <h2><i>%s</i></h2>
      <nav id="spec">Change species: %s</nav>
    </div></header>
    <header><nav id="int">
      <p>Chromium 10x <a href="#ch10x-cell">Cell view</a> <a href="#ch10x-gene">Gene view</a></p>
      <p>SmartSeq2    <a href="#ss2-cell">Cell view</a> <a href="#ss2-gene">Gene view</a></p>
    </nav></header>
    <main id="main" data-directory="%s">
      <section>
<!-- Graph panels... -->
        <section id="ch10x-cell"><!-- chromium 10x graphs... -->
          <h3>Chromium 10x cell view: <span class="gene-name"></span> <a href="#ch10x-cell-pca">PCA</a> <a href="#ch10x-cell-umap" class="active">UMAP</a></h3>
          <div id="ch10x-cell-pca"><h4>Principal Component Analysis<span class="extra-title"></span></h4>
            <p>Prinicipal Component Analysis view of single-cell transcriptomes based on highly variable genes</p>
          </div>
          <div id="ch10x-cell-umap" class="active"><h4>UMAP clustering of cells<span class="extra-title"></span></h4>
            <p>UMAP visualisation of single-cell transcriptomes from across asexual and transmission stages of the parasite</p>
          </div>
        </section>
        <section id="ch10x-gene">
          <h3>Chromium 10x gene view: <span class="gene-name"></span></h3>
          <div id="ch10x-gene-knn"><h4>KNN gene graph</h4><p>k-nearest neighbors (kNN) force-directed graph of highly variable features across cell types</p>
          </div>
        </section>
        <section id="ss2-cell"><!-- smartseq2 graphs... -->
          <h3>SmartSeq2 cell view: <span class="gene-name"></span> <a href="#ss2-pca">PCA</a> <a href="#ss2-umap">UMAP</a></h3>
          <div id="ss2-cell-pca"><h4>Principal Component Analysis<span class="extra-title"></span></h4>
            <p>Prinicipal Component Analysis view of single-cell transcriptomes based on highly variable genes</p>
          </div>
          <div id="ss2-cell-umap" class="active"><h4>UMAP clustering of cells<span class="extra-title"></span></h4>
            <p>UMAP visualisation of single-cell transcriptomes from across asexual and transmission stages of the parasite</p>
          </div>
        </section>
        <section id="ss2-gene">
          <h3>SmartSeq2 gene view: <span class="gene-name"></span></h3>
          <div id="ss2-gene-knn" class="active"><h4>KNN gene graph</h4>
            <p>k-nearest neighbors (kNN) force-directed graph of highly variable features across cell types</p>
          </div>
        </section>
      </section>
<!-- Filters & legends... -->
      <nav>
        <div>
          <div id="filter-stage"><h3>Filter by stage:</h3><ul class="half"  ><li></li></ul></div>
          <div id="filter-day"  ><h3>Filter by day:</h3>  <ul class="narrow"><li></li></ul></div>
          <div id="filter-host" ><h3>Filter by host:</h3> <ul class="narrow"><li></li></ul></div>
        </div>
        <div>
          <h3>Colour by:</h3>
          <ul id="colour-by"><li>
            <label id="colour-by-stage"  ><input checked="checked" type="radio" value="stage"   name="filter"><span>Stage</span></label>
            <label id="colour-by-day"    ><input                   type="radio" value="day"     name="filter"><span>Day</span></label>
            <label id="colour-by-host"   ><input                   type="radio" value="host"    name="filter"><span>Host</span></label>
            <label id="colour-by-cluster"><input                   type="radio" value="cluster" name="filter"><span>Cluster</span></label>
            <label id="colour-by-gene"   ><input                   type="radio" value="gene"    name="filter"><span>Gene</span></label>
          </li></ul>
          <div class="legend" id="legend-stage"><ul></ul></div>
          <div class="legend" id="legend-day"><ul></ul></div>
          <div class="legend" id="legend-host"><ul></ul></div>
          <div class="legend" id="legend-cluster" style="display:none"></div>
          <!-- gene input box and gradient legend -->
          <div id="legend-gene" class="legend" style="display:none">
            <div class="input">
              <div><label for="new-gene">Gene ID:</label><div><input type="text" id="new-gene" value="" /><ul></ul></div></div>
              <div class="expression"><label>Expression:</label></div>
            </div>
            <div class="gradient"><span class="exp-min">-</span><span class="exp-ave"></span><span class="exp-max">-</span><div><p></p><div></div><p></p></div></div>
          </div>
          <div class="gene-table">
          </div>
        </div>
      </nav>
<!-- -->
    </main>

    <footer>
      <div>
      <p>This site is hosted by the <a href="https://www.sanger.ac.uk/">Wellcome Sanger Institute</a></p>
      <p><a href="#cookies">Cookies policy</a> | <a href="#terms">Terms and Conditions</a></p>
      </div>
    </footer>
    <script src="/mca/js/plotly-gl3d-latest.min.js"></script>
    <script src="/mca/js/mca-core.js"></script> <script src="/mca/js/mca-page.js"></script><script src="/mca/js/mca-graph.js"></script>
    <!-- script src="js/mca-gcc.js"></script -->
    <script src="/mca/js/cookies-gcc.js"></script>
    <script src="/mca/piwik.js"></script>
  </body>
</html>
', $name, $links, $code;
  close $fh;
}
