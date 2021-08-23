use strict;
use warnings;
use File::Basename qw(dirname);
use Cwd qw(abs_path);
my $root          = dirname(dirname(abs_path($0)));
my $doc_root      = $root.'/htdocs/';
my $template_file = $root.'/src/species-template.html';
my $template      = q();

my $debug = @ARGV ? $ARGV[0] : 1;
my $CONFIG = [
  { 'code' => 'pb', 'name' => 'P. berghei',    'dir' => 'p.berghei'   },
  { 'code' => 'pf', 'name' => 'P. falciparum', 'dir' => 'p.falciparum' },
  { 'code' => 'pk', 'name' => 'P. knowlesi',   'dir' => 'p.knowlesi'  },
  { 'code' => 'pb-ch10x-set1', 'name' => 'P. berghei ch10x set1', 'dir' => 'pb-ch10x-set1' },
  { 'code' => 'pb-ch10x-set2', 'name' => 'P. berghei ch10x set2', 'dir' => 'pb-ch10x-set2' },
  { 'code' => 'pb-ss2-set1',   'name' => 'P. berghei ss2 set1', 'dir' => 'pb-ss2-set1' },
  { 'code' => 'pf-ch10x-set1', 'name' => 'P. falciparum ch10x set1', 'dir' => 'pf-ch10x-set1' },
  { 'code' => 'pf-ch10x-set2', 'name' => 'P. falciparum ch10x set2', 'dir' => 'pf-ch10x-set2' },
  { 'code' => 'pf-ss2-set1',   'name' => 'P. falciparum ss2 set1', 'dir' => 'pf-ss2-set1' },
  { 'code' => 'pk-ch10x-set1', 'name' => 'P. knowlesi ch10x', 'dir' => 'pk-ch10x-set1' },
];

open my $fh, q(<), $template_file;
$/=undef;
$template = <$fh>;
close $fh;

foreach ( @{$CONFIG} ) {
  mkdir $doc_root.$_->{'dir'} unless -e $doc_root.$_->{'dir'};
  print_file( $_->{'code'}, $_->{'name'}, $_->{'dir'} );
}

sub expand_template {
  my( $conf, $str ) = @_;
  return $str =~ s{\[\[(\w+)\]\]}{$conf->{$1}}grems;
}

sub print_file {
  my( $code, $name, $dir ) = @_;
  my $links = join q( | ),
              map  { sprintf '<a href="/%s/">%s</a>', $_->{'dir'}, $_->{'name'} }
              grep { $_->{'code'} ne $code }
              grep { 2 == length $_->{'code'} }
              @{$CONFIG};
  open my $fh, q(>), "$doc_root$dir/index.html";
  print {$fh} expand_template( { 'code' => $code, 'dir' => $dir, 'name' => $name, 'links' => $links, 'debug' => $debug?'':'-min', }, $template );
  close $fh;
}
