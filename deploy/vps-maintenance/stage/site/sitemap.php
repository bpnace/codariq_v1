<?php
header('Content-Type: application/xml; charset=utf-8');
$d=json_decode(@file_get_contents('/var/www/content/blog.json')?:'{}',true);
function xmltext($s){return htmlspecialchars($s,ENT_XML1|ENT_QUOTES,'UTF-8');}
function entry($path,$changed=null){echo '<url><loc>https://codariq.de'.xmltext($path).'</loc>';if(is_numeric($changed)&&(int)$changed>0&&(int)$changed<=time())echo '<lastmod>'.gmdate('Y-m-d\TH:i:s\Z',(int)$changed).'</lastmod>';echo '</url>';}
echo '<?xml version="1.0" encoding="UTF-8"?>';echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
entry('/',filemtime(__DIR__.'/index.html'));entry('/blog');
foreach(($d['articles']??[]) as $a){if(!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/D',$a['slug']??''))continue;entry('/blog/'.$a['slug'],$a['changed']??null);}
foreach(glob(__DIR__.'/pages/*.html')?:[] as $p){$slug=basename($p,'.html');if(preg_match('/^[a-z0-9-]+$/D',$slug))entry('/'.$slug,filemtime($p));}echo '</urlset>';
