/* jshint ignore:start */
var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.ASSUME_ES5=!1;$jscomp.ASSUME_NO_NATIVE_MAP=!1;$jscomp.ASSUME_NO_NATIVE_SET=!1;$jscomp.defineProperty=$jscomp.ASSUME_ES5||"function"==typeof Object.defineProperties?Object.defineProperty:function(a,d,c){a!=Array.prototype&&a!=Object.prototype&&(a[d]=c.value)};$jscomp.getGlobal=function(a){return"undefined"!=typeof window&&window===a?a:"undefined"!=typeof global&&null!=global?global:a};$jscomp.global=$jscomp.getGlobal(this);$jscomp.SYMBOL_PREFIX="jscomp_symbol_";$jscomp.initSymbol=function(){$jscomp.initSymbol=function(){};$jscomp.global.Symbol||($jscomp.global.Symbol=$jscomp.Symbol)};$jscomp.Symbol=function(){var a=0;return function(d){return $jscomp.SYMBOL_PREFIX+(d||"")+a++}}();$jscomp.initSymbolIterator=function(){$jscomp.initSymbol();var a=$jscomp.global.Symbol.iterator;a||(a=$jscomp.global.Symbol.iterator=$jscomp.global.Symbol("iterator"));"function"!=typeof Array.prototype[a]&&$jscomp.defineProperty(Array.prototype,a,{configurable:!0,writable:!0,value:function(){return $jscomp.arrayIterator(this)}});$jscomp.initSymbolIterator=function(){}};$jscomp.arrayIterator=function(a){var d=0;return $jscomp.iteratorPrototype(function(){return d<a.length?{done:!1,value:a[d++]}:{done:!0}})};$jscomp.iteratorPrototype=function(a){$jscomp.initSymbolIterator();a={next:a};a[$jscomp.global.Symbol.iterator]=function(){return this};return a};$jscomp.polyfill=function(a,d,c,e){if(d){c=$jscomp.global;a=a.split(".");for(e=0;e<a.length-1;e++){var h=a[e];h in c||(c[h]={});c=c[h]}a=a[a.length-1];e=c[a];d=d(e);d!=e&&null!=d&&$jscomp.defineProperty(c,a,{configurable:!0,writable:!0,value:d})}};$jscomp.polyfill("Array.from",function(a){return a?a:function(d,c,a){$jscomp.initSymbolIterator();c=null!=c?c:function(b){return b};var e=[],f=d[Symbol.iterator];if("function"==typeof f)for(d=f.call(d);!(f=d.next()).done;)e.push(c.call(a,f.value));else{f=d.length;for(var b=0;b<f;b++)e.push(c.call(a,d[b]))}return e}},"es6","es3");$jscomp.polyfill("Object.is",function(a){return a?a:function(a,c){return a===c?0!==a||1/a===1/c:a!==a&&c!==c}},"es6","es3");$jscomp.polyfill("Array.prototype.includes",function(a){return a?a:function(a,c){var d=this;d instanceof String&&(d=String(d));var h=d.length;c=c||0;for(0>c&&(c=Math.max(c+h,0));c<h;c++){var f=d[c];if(f===a||Object.is(f,a))return!0}return!1}},"es7","es3");$jscomp.checkStringArgs=function(a,d,c){if(null==a)throw new TypeError("The 'this' value for String.prototype."+c+" must not be null or undefined");if(d instanceof RegExp)throw new TypeError("First argument to String.prototype."+c+" must not be a regular expression");return a+""};$jscomp.polyfill("String.prototype.includes",function(a){return a?a:function(a,c){return-1!==$jscomp.checkStringArgs(this,a,"includes").indexOf(a,c||0)}},"es6","es3");$jscomp.polyfill("Number.parseFloat",function(a){return a||parseFloat},"es6","es3");(function(a,d){a._={qs:function(c,a){"string"===typeof c&&(a=c,c=d);return""==a?c:c.querySelector(a)},qm:function(a,d){"string"===typeof a&&(d=a);return Array.from(document.querySelectorAll(d))},m:function(a,e,h){"string"===typeof a&&(h=e,e=a,a=d);this.qm(a,e).forEach(h)},s:function(a,e,h){"string"===typeof a&&(h=e,e=a,a=d);(a=this.qs(a,e))&&h(a)},dis:function(a){a.classList.remove("active")},act:function(a){a.classList.add("active")},isact:function(a){return a.classList.contains("active")}}})(window,document);(function(){function a(){var a=_.qs(".active .active .active .graph");Plotly.relayout(a.id,{width:a.offsetWidth,height:a.offsetHeight})}_.m("nav:first-of-type ul:first-of-type a, footer p:nth-of-type(2) a, #species a",function(d){d.onclick=function(c){c.preventDefault();_.s(d.hash,_.isact)||(_.m("main > section, nav:first-of-type ul:nth-of-type(n+2)",_.dis),_.s(d.hash,_.act),_.s(d.hash+"-menu",_.act),a())}});_.m("ul.datatabs a",function(d){d.onclick=function(c){c.preventDefault();_.s(d.hash,_.isact)||(c=d.hash.split("-"),_.m(c[0]+" > div > section",_.dis),_.s(d.hash,_.act),a())}});_.m(".data section h3 a",function(d){d.onclick=function(c){c.preventDefault();_.s(d.hash,_.isact)||(c=d.hash.split("-"),_.m(c[0]+"-"+c[1]+" div",_.dis),_.s(d.hash,_.act),a())}})})();(function(){var a={l:5,r:5,b:5,t:5},d={responsive:!0,displayModeBar:!0,displaylogo:!1};(function(c){_.m(".loading",function(a){return a.style.display="block"});var e,h;Plotly.d3.json("data/"+_.qs(c).dataset.directory+"/x_samples.json",function(f,b){e=0;b.hover_template=b.columns.map(function(a){return a.name+": %{customdata["+e++ +"]}"}).join("<br>");b.hover_template_expr=b.hover_template+"<br>Expression: %{text}<extra></extra>";b.hover_template+="<extra></extra>";b.genes_length=b.genes.length;b.default_text=b.data.CUSTOMDATA.map(function(a){return"-"});b.visible=b.data.CUSTOMDATA.map(function(a){return b.marker_size});b.customdata=b.data.CUSTOMDATA.map(function(a){e=0;return a.map(function(a){return b.columns[e++].colours[a][0]})});b.colours={gene:b.customdata.map(function(a){return b.expression_default})};e=0;b.columns.forEach(function(a){b.colours[a.name.toLowerCase()]=b.data.CUSTOMDATA.map(function(a){return b.columns[e].colours[a[e]][1]});e++});f=b.columns[0].name.toLowerCase();var l=[{x:b.data.UMAP[0],y:b.data.UMAP[1],z:b.data.UMAP[2],mode:"markers",text:b.default_text,marker:{size:b.visible,color:b.colours[f],line:{width:0}},customdata:b.customdata,hovertemplate:b.hover_template,type:"scatter3d"}];Plotly.newPlot("pf-new-pca-graph",[{x:b.data.PC[0],y:b.data.PC[1],z:b.data.PC[2],mode:"markers",text:b.default_text,marker:{size:b.visible,color:b.colours[f],line:{width:0}},customdata:b.customdata,hovertemplate:b.hover_template,type:"scatter3d"}],{autosize:!0,margin:a,scene:{xaxis:{range:b.ranges.PC[0],title:"PC 1"},yaxis:{range:b.ranges.PC[1],title:"PC 2"},zaxis:{range:b.ranges.PC[2],title:"PC 3"}}},d);Plotly.newPlot("pf-new-umap-graph",l,{autosize:!0,margin:a,scene:{xaxis:{range:b.ranges.UMAP[0],title:"UMAP 1"},yaxis:{range:b.ranges.UMAP[1],title:"UMAP 2"},zaxis:{range:b.ranges.UMAP[2],title:"UMAP 3"}}},d);var g=_.qs("#pf nav"),k=_.qs(g,".input ul");_.m(g,'input[type="checkbox"]',function(a){a.onchange=function(a){var c={};_.m(g,'input[type="checkbox"]',function(a){return c[a.value]=a.checked?1:0});b.visible=b.customdata.map(function(a){return b.marker_size*c[a[0]]*c[a[1]]});Plotly.restyle("pf-new-umap-graph",{"marker.size":[b.visible]});Plotly.restyle("pf-new-pca-graph",{"marker.size":[b.visible]})}});_.m(g,'input[type="radio"]',function(a){a.onchange=function(a){_.m(g,".legend",function(a){return a.style.display="none"});var c;_.s(g,'input[type="radio"]:checked',function(a){return c=a.value});_.s(g,"#legend-"+c,function(a){return a.style.display="block"});Plotly.restyle("pf-new-umap-graph",{"marker.color":[b.colours[c]]});Plotly.restyle("pf-new-pca-graph",{"marker.color":[b.colours[c]]})}});_.m(g,'input[type="text"]',function(a){a.onkeyup=function(a){var d=_.qs(g,"#pf-new-gene").value;if(b.genes.includes(d)||""===d)d!=h&&(""===d?(_.m(".pf-extra-title",function(a){return _.innerText=""}),h=d,b.colours.gene=b.data.CUSTOMDATA.map(function(a){return b.expression_default}),_.m(g,".gradient span",function(a){return a.innerText="-"}),_.s(g,".gradient span.exp-ave",function(a){return a.innerText=""}),Plotly.restyle("pf-new-umap-graph",{"marker.color":[b.colours.gene],hovertemplate:b.hover_template}),Plotly.restyle("pf-new-pca-graph",{"marker.color":[b.colours.gene],hovertemplate:b.hover_template})):(_.m(".loading",function(a){a.innerText="LOADING DATA FOR "+d;a.style.display="block"}),Plotly.d3.json("data/"+_.qs(c).dataset.directory+"/expression/"+d+".json",function(a,c){h=d;_.m(".pf-extra-title",function(a){return a.innerText=" - showing expression for gene: "+d});var e=c.max;0==e?(b.colours.gene=c.data.map(function(a){return b.expression_default}),_.m(g,".gradient span",function(a){return a.innerText="-"}),_.s(g,".gradient span.exp-ave",function(a){return a.innerText=""})):(b.colours.gene=c.data.map(function(a){var c=Math.floor(a/e*8);a=a/e-c/8;var d=1-a;return"rgb("+(b.expression_colours[c][0]*d+b.expression_colours[c+1][0]*a)+","+(b.expression_colours[c][1]*d+b.expression_colours[c+1][1]*a)+","+(b.expression_colours[c][2]*d+b.expression_colours[c+1][2]*a)+")"}),_.s(g,".gradient span:first-of-type",function(a){return a.innerText="0.00"}),_.s(g,".gradient span:nth-of-type(2)",function(a){return a.innerText=Number.parseFloat(e/2).toFixed(2)}),_.s(g,".gradient span:last-of-type",function(a){return a.innerText=Number.parseFloat(e).toFixed(2)}));Plotly.restyle("pf-new-umap-graph",{"marker.color":[b.colours.gene],text:[c.data],hovertemplate:b.hover_template_expr});Plotly.restyle("pf-new-pca-graph",{"marker.color":[b.colours.gene],text:[c.data],hovertemplate:b.hover_template_expr});_.m(".loading",function(a){return a.style.display="none"})})));else{_.s(k,"",function(a){return a.innerHTML=""});for(var e="",f=a=0;f<b.genes_length&&10>a;f++)b.genes[f].includes(d)&&(e+="<li>"+b.genes[f]+"</li>",a++);_.s(k,"",function(a){return a.innerHTML=e})}}});_.s(k,"",function(a){a.onclick=function(a){_.s(g,'input[type="text"]',function(b){b.value=a.target.innerText;_.s(k,"",function(a){return a.innerHTML=""});b.onkeyup()})}});_.m(".loading",function(a){return a.style.display="none"})})})("#pf-new")})();
/* jshint ignore:end */