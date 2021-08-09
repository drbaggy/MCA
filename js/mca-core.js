(function (w,d) {
  'use strict';
// page navigation
  w._ = {
    qs:  function( el, s )    { if( 'string' === typeof el ) {        s = el; el = d; } return s == '' ? el :  el.querySelector( s ); },
    qm:  function( el, s )    { if( 'string' === typeof el ) {        s = el; el = d; } return Array.from(el.querySelectorAll( s )); },
    m:   function( el, s, f ) { if( 'string' === typeof el ) { f = s; s = el; el = d; } this.qm(el,s).forEach( f ); },
    s:   function( el, s, f ) { if( 'string' === typeof el ) { f = s; s = el; el = d; } var z = this.qs(el,s); if( z ) f( z ); },
    dis: function( n )        { if( 'string' === typeof n ) { n = d.querySelector(n); } if(n) n.classList.remove('active');           },
    act: function( n )        { if( 'string' === typeof n ) { n = d.querySelector(n); } if(n) n.classList.add('active');              },
    isact: function( n )      { if( 'string' === typeof n ) { n = d.querySelector(n); } return n ? n.classList.contains('active' ) : false; }
  };
}(window,document));
