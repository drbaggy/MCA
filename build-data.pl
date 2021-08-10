use strict;
use Data::Dumper qw(Dumper);
use POSIX qw(floor ceil);
use JSON qw(encode_json);
use Text::CSV qw(csv);
use YAML qw(Dump LoadFile);

$Data::Dumper::Indent = 2;
$Data::Dumper::SortKeys = 1;
$Data::Dumper::Terse = 1;

my %stage_map = (
 'liver',                        0,
 'merozoite',                    1,
 'ring',                         2,
 'trophozoite',                  3,
 'schizont',                     4,
 'gametocyte (developing)',      5,
 'gametocyte (male)',            6,
 'gametocyte (female)',          7,
 'ookinete',                     8,
 'oocyst',                       9,
 'sporozoite (oocyst)',          10,
 'sporozoite (hemolymph)',       11,
 'sporozoite (salivary gland)',  12,
 'sporozoite (injected)',        13,
 'sporozoite (activated)',       14,
);
my %day_map = ('D1',   0,         'D2',   1,
         'D3',   2,         'D4',   3,
         'D6',   4,         'D8',   5,
         'D10',  6,      );
my %host_map = ('mosquito', 0,'human',    1,   'mouse',    2);

foreach my $key (@ARGV) {
  my $struct = LoadFile( 'configs/'.$key.'.yaml' );
  mkdir 'processed'       unless -d 'processed';
  mkdir 'processed/'.$key unless -d 'processed/'.$key;
  foreach my $md ( qw(ss2 ch10x) ) {
    next unless -e "input/$key/$md/data.csv";
    mkdir 'processed/'.$key.'/'.$md        unless -d 'processed/'.$key.'/'.$md;
    mkdir 'processed/'.$key.'/'.$md.'/exp' unless -d 'processed/'.$key.'/'.$md.'/exp';
    parse( "input/$key/$md/data.csv", $struct->{$md}{'cell'} );
    $struct->{$md}{'cell'}{'genes'} = parse_mol( "input/$key/$md/exp.csv",'processed/'.$key.'/'.$md.'/exp' );
  }
  foreach my $md (qw(ss2 10x)) {
    next unless -e "input/$key/$md/knn.csv";
    parse_knn( "input/$key/$md/knn.csv", $struct->{$md}{'gene'} )        if -e "input/$key/$md/knn.csv";
  }
  open my $fh, '>', "processed/$key/data.perl"; print {$fh} Dumper($struct);     close $fh;
  open    $fh, '>', "processed/$key/data.yaml"; print {$fh} Dump($struct);       close $fh;
  open    $fh, '>', "processed/$key/data.json"; print {$fh} encode_json($struct);close$fh;
}

sub parse_mol {
  my( $fn, $key ) = @_;
  open my $fh, q(<), $fn;
  my $head = <$fh>;
  my @genes;
  foreach(<$fh>) {
    chomp;
    my $m = 0;
    my @V = split m{,};
    my $n = shift @V;
    @V = map { 1*sprintf '%0.5f',$_ } @V;
    $m = $m < $_ ? $_ : $m foreach @V;
    #say $m;
    $n=~s{"}{}g;
    $n=~s{-}{_}g;
    push @genes,$n;
    open my $ofh, q(>), "$key/$n.json";
    say {$ofh} '{"max":',$m,',"data":[',(join q(,),@V), ']}';
    close $ofh;
  }
  close $fh;
  return \@genes;
}

sub parse_knn {
  my( $fn, $res ) = @_;
  my $data = csv( in => $fn );
  my @KEYS = @{shift @{$data}};
  my %key_map;
  my $c=0;
  $key_map{$_}=$c++ foreach @KEYS;
  $res->{'knn'}        = [[],[]];
  $res->{'data'}       = [];
  my $x_col = $key_map{ 'KNN_GRAPH_X' };
  my $y_col = $key_map{ 'KNN_GRAPH_Y' };
  my $c_col = $key_map{ 'CLUSTER' };
  my @indexes = map { $key_map{ $_ } } grep { ! /(KNN_GRAPH_|CLUSTER)/ } @KEYS;
  my %clusters;
  my($x0,$y0,$x1,$y1);
  foreach( @{$data} ) {
    my @parts = @{$_};
    my $x = $parts[ $x_col ];
    next if $x eq 'NA';
    push @{ $res->{'knn'}[0] }, 0+sprintf '%0.2f', $x;
    push @{ $res->{'knn'}[1] }, 0+sprintf '%0.2f', my $y = $parts[ $y_col ];

    ## Get max min values.....
    $x0 = $x if !defined $x0 || $x0 > $x;
    $y0 = $y if !defined $x1 || $y0 > $y;
    $x1 = $x if !defined $x1 || $x1 < $x;
    $y1 = $y if !defined $y1 || $y1 < $y;

    my $cluster = $parts[$c_col]; $cluster =~ s{^c}{};
    push @{ $res->{'data'} }, [ map { $_ eq 'NA' || $_ eq 'null' ? '-' : $_ } $cluster, @parts[@indexes] ];
    $clusters{ $cluster }++;
  }
  $res->{'clusters'} = [ sort keys %clusters ];
  $res->{'ranges'} = { 'knn' => [ [floor($x0),ceil($x1)],[floor($y0),ceil($y1)] ] };
}

sub parse {
  my( $fn, $res ) = @_;
  my %r; my %v;
  open my $fh, q(<), $fn;
  my $header = <$fh>;
  chomp $header;
  my %cols;
  my @data;
  while(<$fh>) {
    chomp;
    s/\s+$//;
    my @T = map { $_ eq 'NA' ? undef : $_ } split /,/;
    my ($id,$p1,$p2,$p3,$u1,$u2,$u3,$cl,$st_lr,$st_hr,$str,$day,$host) = @T;
    push @{$cols{'p1'}}, 0 + sprintf '%0.5f', $p1;
    push @{$cols{'p2'}}, 0 + sprintf '%0.5f', $p2;
    push @{$cols{'p3'}}, 0 + sprintf '%0.5f', $p3;
    push @{$cols{'u1'}}, 0 + sprintf '%0.5f', $u1;
    push @{$cols{'u2'}}, 0 + sprintf '%0.5f', $u2;
    push @{$cols{'u3'}}, 0 + sprintf '%0.5f', $u3;
    $r{'p1'}[0] = $p1 unless !defined $p1 || exists $r{'p1'}[0] && $r{'p1'}[0] < $p1;
    $r{'p2'}[0] = $p2 unless !defined $p2 || exists $r{'p2'}[0] && $r{'p2'}[0] < $p2;
    $r{'p3'}[0] = $p3 unless !defined $p3 || exists $r{'p3'}[0] && $r{'p3'}[0] < $p3;
    $r{'u1'}[0] = $u1 unless !defined $u1 || exists $r{'u1'}[0] && $r{'u1'}[0] < $u1;
    $r{'u2'}[0] = $u2 unless !defined $u2 || exists $r{'u2'}[0] && $r{'u2'}[0] < $u2;
    $r{'u3'}[0] = $u3 unless !defined $u3 || exists $r{'u3'}[0] && $r{'u3'}[0] < $u3;
    $r{'p1'}[1] = $p1 unless !defined $p1 || exists $r{'p1'}[1] && $r{'p1'}[1] > $p1;
    $r{'p2'}[1] = $p2 unless !defined $p2 || exists $r{'p2'}[1] && $r{'p2'}[1] > $p2;
    $r{'p3'}[1] = $p3 unless !defined $p3 || exists $r{'p3'}[1] && $r{'p3'}[1] > $p3;
    $r{'u1'}[1] = $u1 unless !defined $u1 || exists $r{'u1'}[1] && $r{'u1'}[1] > $u1;
    $r{'u2'}[1] = $u2 unless !defined $u2 || exists $r{'u2'}[1] && $r{'u2'}[1] > $u2;
    $r{'u3'}[1] = $u3 unless !defined $u3 || exists $r{'u3'}[1] && $r{'u3'}[1] > $u3;
    $v{'st_lr' }{$st_lr}++     if defined $st_lr;
    $v{'stage' }{$stage_map{$st_hr}}++     if defined $st_hr;
    $v{'str'   }{$str}++       if defined $str;
    $v{'day'   }{$day_map{$day}}++       if defined $day;
    $v{'host'  }{$host_map{$host}}++      if defined $host;
    $v{'st'}{$st_lr}{$st_hr}++ if defined $st_lr;
    my @row=();
    foreach(@{$res->{'columns'}}) {
      push @row, $stage_map{$st_hr} if $_ eq 'stage';
      push @row, exists $day_map{$day} ? $day_map{  $day} : $day   if $_ eq 'day';
      push @row, $host_map{$host}   if $_ eq 'host';
    };
    push @data, \@row;
  }
  close $fh;
  if( exists $res->{'pca'} ) {
    $res->{'ranges'}{'pca'} =  [ [ floor( $r{'p1'}[0]), ceil( $r{'p1'}[1]) ],
                                 [ floor( $r{'p2'}[0]), ceil( $r{'p2'}[1]) ] ];
    $res->{'ranges'}{'pca'}[2] = [ floor( $r{'p3'}[0]), ceil( $r{'p3'}[1]) ] if $res->{'pca'} == 3;
    $res->{'pca'} = $res->{'pca'} == 3 ? [ $cols{'p1'},$cols{'p2'},$cols{'p3'} ] : [ $cols{'p1'},$cols{'p2'}];
  }
  if( exists $res->{'umap'} ) {
    $res->{'ranges'}{'umap'} =  [ [ floor( $r{'u1'}[0]), ceil( $r{'u1'}[1]) ],
                                  [ floor( $r{'u2'}[0]), ceil( $r{'u2'}[1]) ] ];
    $res->{'ranges'}{'umap'}[2] = [ floor( $r{'u3'}[0]), ceil( $r{'u3'}[1]) ] if $res->{'umap'} == 3;
    $res->{'umap'} = $res->{'umap'} == 3 ? [ $cols{'u1'},$cols{'u2'},$cols{'u3'} ] : [ $cols{'u1'},$cols{'u2'}];
  }
  $res->{'data'} = \@data;
  foreach my $col (@{$res->{'columns'}}) {
    $res->{'values'}{$col} = [ sort keys %{$v{$col}} ];
  }
}
