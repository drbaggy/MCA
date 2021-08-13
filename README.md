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

and produces

```
htdocs/processed/pf/data.json
htdocs/processed/pf/ch10x/exp/{GENE_ID}.json
htdocs/processed/pf/ss2/exp/{GENE_ID}.json
```

## Building HTML files for displays

The species display files can be updated from a common template file when you build the site the script:

 * `scripts/push.bash`

Rebuilds the species HTML pages from the template and pushes the latest CSS/JS to the main htdocs directory.

## Compiling JS/CSS bundles

By default (for development) the JS/CSS do not get compiled but just copied across from the src/js & src/css directories. For a live production environment a compressed/obfuscated version is also produced and used by the live server. (This uses google_closure_compiler for Javascript and yuicompressor for CSS)

## Future development

 * Convert to a CMS to make headers/footers easier...
