use strict;
use feature qw(say);
$_ = <>;

my $T = '%0.6f';
foreach(<>) {
  chomp;
  my $m = 0;
  my @V = split m{,};
  my $n = shift @V;
  @V = map { 1*sprintf $T,$_ } @V;
  $m = $m < $_ ? $_ : $m foreach @V;
  say $m;
  $n=~s{"}{}g;
  $n=~s{-}{_}g;
  open my $fh, q(>), "expression/$n.json";
  say {$fh} '{"max":',$m,',"data":[',(join q(,),@V), ']}';
  close $fh;
}

