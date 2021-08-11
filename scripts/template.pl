use strict;
use warnings;
use File::Basename qw(dirname);
use Cwd qw(abs_path);
my $root          = dirname(dirname(abs_path($0)));
my $doc_root      = $root.'/htdocs/';
my $template_file = $root.'/src/species-template.html';
my $template      = q();

my $CONFIG = [
  { 'code' => 'pb', 'name' => 'P. briggsae'    },
  { 'code' => 'pf', 'name' => 'P. falciparum' },
  { 'code' => 'pk', 'name' => 'P. knowlesi'    },
];

open my $fh, q(<), $template_file;
$/=undef;
$template = <$fh>;
close $fh;

foreach ( @{$CONFIG} ) {
  mkdir $doc_root.$_->{'code'} unless -e $doc_root.$_->{'code'};
  print_file( $_->{'code'}, $_->{'name'} );
}

sub expand_template {
  my( $conf, $str ) = @_;
  return $str =~ s{\[\[(\w+)\]\]}{$conf->{$1}}grems;
}

sub print_file {
  my( $code, $name ) = @_;
  my $links = join q( | ),
              map  { sprintf '<a href="/%s/">%s</a>', $_->{'code'}, $_->{'name'} }
              grep { $_->{'code'} ne $code }
              @{$CONFIG};

  open my $fh, q(>), "$doc_root$code/index.html";
  print {$fh} expand_template( { 'code' => $code, 'name' => $name, 'links' => $links }, $template );
  close $fh;
}