(function () {
  'use strict';
//======================================================================
// Navigation elements....
//======================================================================
// Top level navigation - select species [primary header nav]
//----------------------------------------------------------------------
  _.m( 'nav:first-of-type ul:first-of-type a, footer p:nth-of-type(2) a, #species a', function(n) {
    n.onclick = function( e ) {
      e.preventDefault();
      if( ! _.s(n.hash, isactive ) ) {
        _.m('main > section, nav:first-of-type ul:nth-of-type(n+2)', dis ); // hide current menu + "page"
        _.s(n.hash, act );                                                  // Show page!
        _.s(n.hash+'-menu', act );                                          // Show new menu if it exists!
        find_active_graph();
      }
    }
  });
//----------------------------------------------------------------------
// Secondary navigation level - select dataset [secondary header nav]
//----------------------------------------------------------------------
  _.m( 'ul.datatabs a', function(n) {
    n.onclick = function( e ) {
      e.preventDefault();
      if( ! _.s(n.hash, isactive ) ) {
        var r = n.hash.split('-');
        _.m(r[0]+' > div > section', dis );   // Hide all sections in this species..
        _.s(n.hash,act);
        find_active_graph();
      }
    }
  });
//----------------------------------------------------------------------
// Ternary navigation level - select view [ data set panel nav ]
//----------------------------------------------------------------------
  _.m('.data section h3 a',function(n){
    n.onclick = function (e) {
      e.preventDefault();
      if( ! _.s(n.hash, isactive ) ) {
        var r = n.hash.split('-');
        _.m(r[0]+'-'+r[1]+' div', dis );
        _.s(n.hash,act);
        find_active_graph();
      }
    }
  });

  function find_active_graph() {    
    var a = _.qs( '.active .active .active .graph' )
    Plotly.relayout( a.id,{width:a.offsetWidth,height:a.offsetHeight});
  }
}());