(function (w,d) {
  'use strict';
// page navigation
  w._ = {
    qs:  function( el, s )        { if( 'string' === typeof el ) {        s = el; el = d } return el.querySelector( s ); },
    q:   function( el, s )        { if( 'string' === typeof el ) {        s = el; el = d } return Array.from(document.querySelectorAll( s )); },
    m:   function _m( el, s, f )  { if( 'string' === typeof el ) { f = s; s = el; el = d } this.qs(s).forEach( f ); },
    s:   function _1( el, s, f )  { if( 'string' === typeof el ) { f = s; s = el; el = d } var z = this.q(s); if( z ) { return f( z ); } },
    dis: function dis( n )        { n.classList.remove('active');           },
    act: function( n )            { n.classList.add('active');              },
    isact: function( n )          { return n.classList.contains('active' ); }
  };
}(window,document));