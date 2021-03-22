#!/usr/local/bin/perl

use strict;
use warnings;
use POSIX qw(floor ceil);
use JSON qw(encode_json);
use YAML qw(Dump);

my %graph_data;
my @headers = split /,/;
my $T_COORD = '%0.4f';
my $T_EXPR  = '%0.6f';
my $config = {
  ## Expressed as RGB...
  'expression_colours'  => [[68,1,84],[71,45,123],[59,82,139],[44,114,142],[33,144,140],[39,173,129],[93,200,99],[170,220,50],[170,220,50]],
  ## Colours can be RGB or hex...
  'expression_default'  => '#cccccc',
  'ranges'              => {},
  'marker_size'         => 5,
  'columns' => [
    { 'name' => 'Stage',
      'colours' => [
        ['rings',               '#78C679', 'Rings'],
        ['early trophozoites',  '#FEB24C', 'Trophozoites'],
        ['mid trophozoites',    '#F4CF63', 'Trophozoites'],
        ['late trophozoites',   '#FEEEAA', 'Trophozoites'],
        ['early schizonts',     '#85B1D3', 'Schizonts'],
        ['late schizonts',      '#C9E8F1', 'Schizonts'],
        ['early gametocytes',   '#CAB2D6', 'Gametocytes'],
        ['late gametocytes',    '#6A3D9A', 'Gametocytes'],
      ],
    },
    { 'name' => 'Day',
      'colours' => [
        ['D1',  '#D73027'],
        ['D2',  '#F46D43'],
        ['D3',  '#FDAE61'],
        ['D4',  '#FEE090'],
        ['D6',  '#E0F3F8'],
        ['D8',  '#ABD9E9'],
        ['D10', '#74ADD1'],
      ],
    },
  ],
};
my @map;
my $c=0;
$map[9]  = {map { $_->[0] => $c++ }  @{$config->{'columns'}[0]{'colours'}}};
$c= 0;
$map[12] = {map { $_->[0] => $c++ }  @{$config->{'columns'}[1]{'colours'}}};

my @max;
my @min;
open my $fh,   '<', 'samples.csv';
$_ = <$fh>; ## Remove header...
while(<$fh>) {
  chomp;
  my @v = split m{,};
  foreach(1..6) {
    $max[$_] = $v[$_] unless exists $max[$_] && $max[$_] > $v[$_];
    $min[$_] = $v[$_] unless exists $min[$_] && $min[$_] < $v[$_];
  }
  push @{$graph_data{'PC'  }[$_]}, 1*sprintf $T_COORD,$v[$_+1] foreach 0..2;
  push @{$graph_data{'UMAP'}[$_]}, 1*sprintf $T_COORD,$v[$_+4] foreach 0..2;
  push @{$graph_data{'CUSTOMDATA'}}, [ map { $map[$_]{$v[$_]} } qw(9 12) ];
}
close $fh;

## Update configuration with ranges of the co-ord systems
$config->{'ranges'} = {
  'PC'   => [ map {[floor($min[$_]),ceil $max[$_]]} 1..3 ],
  'UMAP' => [ map {[floor($min[$_]),ceil $max[$_]]} 4..6 ],
};

## Read in expression data and write a file out for each
## gene - keep a record of genes as we are going to add
## this to the data...

open $fh, q(<), 'expression.csv';
$_ = <$fh>;
my @genes;
while(<$fh>) {
  chomp;
  my $max = 0;
  my($name,@values) = split m{,};
  @values = map { 1*sprintf $T_EXPR, $_ } @values;
  foreach(@values) {
    $max = $_ if $max < $_;
  }
  $name=~s{"}{}g;
  $name=~s{-}{_}g;
  push @genes,$name;
  open my $oh, q(>), "expression/$name.json";
  say {$oh} '{"max":',$max,',"data":[',(join q(,),@values), ']}';
  close $oh;
}

close $fh;

my $data = {
  'config' => $config,
  'genes' => \@genes,
  'data'  => \%graph_data
};

open $fh, q(>), 'x_samples.yaml';
print {$fh} Dump($data);
close $fh;

open $fh, q(>), 'x_samples.json';
print {$fh} encode_json($data);
close $fh;

