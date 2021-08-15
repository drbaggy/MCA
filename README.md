# Malaria Cell Atlas web views

Demo version: https://mca.curtissmith.me.uk/

## Dependencies

 * **Plotly/3d:** https://github.com/plotly/plotly.js/blob/master/dist/README.md#plotlyjs-gl3d
 * **Sanger cookie code:** 
 * **Sangerized piwik code:** 

## Building json files for displays

Each species (display) has a single json file which contains all the graphing information for up to 6 graphs 2 methods (10x,SS2) x 3 charts (UMAP/PCA/KNN)

Data is collected from the input directory...
```
  input/pf/ch10x/data.csv         input/pf/ss2/data.csv
  input/pf/ch10x/exp.csv          input/pf/ss2/exp.csv
  input/pf/ch10x/knn.csv          input/pf/ss2/knn.csv
```

and the script `scripts/build-data.pl` produces

```
htdocs/processed/pf/data.json
htdocs/processed/pf/ch10x/exp/{GENE_ID}.json
htdocs/processed/pf/ss2/exp/{GENE_ID}.json
```

### File structures.

**data.csv**

This has a fixed format - any changes would require a modification to the build script the columns are:

 * CELL_ID
 * PC_1
 * PC_2
 * PC_3
 * UMAP_1
 * UMAP_2
 * UMAP_3
 * CLUSTER
 * STAGE_LR
 * STAGE_HR
 * STRAIN
 * DAY
 * HOST

Currently the only "required field" is **STAGE_HR**.

**exp.csv**

Each row consists of a gene ID, followed by the expression of the gene in the samples from data.csv. It is assumed that the **order of the samples** in both `data.csv` (rows) and `exp.csv` (columns) are the same.

Currently the script assumes the presence of an `exp.csv` file if a `data.csv` file is present.

**knn.csv**

The format of this file is not fixed - with the exception that:

 * The first column contains the gene id
 * There are three columns - `KNN_GRAPH_X`, `KNN_GRAPH_Y` and `CLUSTER`

Any rows for which these three values are not set are omitted from the processed data set.

**configs/??.yaml**

The final file the script uses is a yaml file in the configs directory. This defines properties of the dataset - and what needs rendering. Here is an example of the file for *P. falciparum*.

```yaml
---
  default_gene: PF3D7_0304600
  ch10x:
    cell:
      columns: [ stage, day ]
      filters: [ stage ]
      pca:     3
      umap:    3
      popup:  'Stage: [[0]]<br />Day: [[1]]'
  ss2:
    cell:
      columns: [ stage, host ]
      filters: [ stage ]
      umap:    2
      popup:  'Stage: [[0]]<br />Host: [[1]]'
    gene:
      knn:    2
      popup:  'Gene ID: [[1]]<br />Gene name: [[5]]<br />Cluster: [[0]]'
      table: |-2

                  <h3>[[1]]</h3>
                  <dl>
                    <dt>Transcript ID</dt> <dd>[[2]]</dd>
                    <dt>Product description</dt> <dd>[[3]]</dd>
                    <dt>Gene type</dt> <dd>[[4]]</dd>
                    <dt>Gene name</dt> <dd>[[5]]</dd>
                    <dt>Cluster</dt> <dd>[[0]]</dd>
                    <dt>Conservation score with <i>P.Berghei</i></dt> <dd>[[6]]</dd>
                    <dt>Conserved female marker</dt> <dd>[[7]]</dd>
                    <dt>Conserved male marker</dt> <dd>[[8]]</dd>
                    <dt>Conserved ookinete marker</dt> <dd>[[9]]</dd>
                    <dt>Conserved sporozoite marker</dt> <dd>[[10]]</dd>
                  </dl>
```

**Notes:**
  * At the top level there is a key `default_gene` which is used to give a default view if colour by gene is selected - make sure that this gene is present in all (up to 4) datasets.
  * There are then are up to 4 separate configs for the 4 view sets SS2/Ch10x & gene/cell
  * Gene config
    * `knn`   - dimension of data (always 2)
    * `popup` - HTML template for on hover popup - the square brackets correspond to the relevant columns in the data set (note KNN columns are not included in the count)
    * `table` - HTML template for the gene info table - (see note above)
  * Cell config
    * `columns`    - array of columns to be extracted from `data.csv` - these are used in the popup/colouring/filtering
    * `filters`    - columns which are to used as filters (and currently to show those that are to be coloured)
    * `pca`        - dimensions of the PCA graph (optional) either 2 or 3.
    * `umap`       - dimensions of the UMAP graph (optional) either 2 or 3.
    * `popup`      - see above

### Running the script

You run the script the directory name you wish to process - so for the three MCA datasets it would be:

```bash
scripts/build-data.pl pb pf pk
```

or some combination thereof.

## Building HTML files for displays

The species display files can be updated from a common template file when you build the site the script:

 * `scripts/push.bash`

Rebuilds the species HTML pages from the template and pushes the latest CSS/JS to the main htdocs directory.

## Compiling JS/CSS bundles

By default (for development) the JS/CSS do not get compiled but just copied across from the src/js & src/css directories. For a live production environment a compressed/obfuscated version is also produced and used by the live server. (This uses `google_closure_compiler` for Javascript and `yuicompressor` for CSS)

## Future development

 * Convert to a CMS to make headers/footers easier...
