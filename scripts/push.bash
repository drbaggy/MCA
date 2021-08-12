#!/bin/bash

DEV=0

SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do
  BASE="$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
done
BASE="$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )"
ROOT="$( dirname "$BASE" )"

echo $ROOT;

#ROOT="$( dirname "$ROOT" )"

## Write out species template pages...
perl $ROOT/scripts/template.pl $DEV

if [ "$DEV" -eq "0" ]; then
   exit;
fi
## Push javascript
for i in mca-graph cookies; do google-closure-compiler --js $ROOT/src/js/$i.js > $ROOT/htdocs/dist/js/$i-min.js; done
for i in mca-graph plotly-gl3d-latest.min cookies; do scp $ROOT/src/js/$i.js $ROOT/htdocs/dist/js/$i.js; done

## Push CSS
for i in cookies mca-chart mca-header-and-footer
do
  scp $ROOT/src/css/$i.css $ROOT/htdocs/dist/css/$i.css
  java -jar /www/utilities/jars/yuicompressor.jar --charset utf-8 $ROOT/src/css/$i.css > $ROOT/htdocs/dist/css/$i-min.css
done

