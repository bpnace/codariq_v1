<?php
$raw=@file_get_contents('/var/www/content/blog.json');$data=$raw?json_decode($raw,true):null;
if(!$data||($data['brand']??'')!=='codariq'){http_response_code(503);exit('Der Blog ist vorübergehend nicht verfügbar.');}
$slug=$_GET['slug']??'';if($slug!==''&&!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/D',$slug)){http_response_code(404);exit('Nicht gefunden');}
$article=null;foreach($data['articles'] as $a){if($a['slug']===$slug)$article=$a;}
if($slug!==''&&!$article){http_response_code(404);exit('Beitrag nicht gefunden');}
function e($s){return htmlspecialchars((string)$s,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');}
$title=$article?$article['title']:'Blog';$description=$article?$article['summary']:'Beiträge von CODARIQ.';$canonical='https://codariq.de/blog'.($article?'/'.$article['slug']:'');
header('Content-Type: text/html; charset=utf-8');
?><!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title><?=e($title)?> | CODARIQ</title><meta name="description" content="<?=e($description)?>"><link rel="canonical" href="<?=e($canonical)?>"><link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/clarity-consent.css"><style>html,body{height:auto;min-height:100%;overflow:auto}.blog-shell{max-width:980px;margin:auto;padding:32px 24px;font-family:var(--font-sans)}.blog-nav{display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap;margin-bottom:64px}.blog-shell a{color:var(--accent);text-underline-offset:4px}.blog-shell h1{font-size:clamp(2rem,5vw,3.5rem);line-height:1.15;margin-bottom:24px}.blog-shell h2,.blog-shell h3{margin:32px 0 16px}.blog-shell p,.blog-shell ul,.blog-shell ol{margin:18px 0;line-height:1.85}.blog-shell ul,.blog-shell ol{padding-left:24px}.blog-shell article{max-width:760px}.blog-card{padding:28px 0;border-top:1px solid var(--text-dim)}.blog-card h2{margin:0}.blog-cover{width:100%;height:auto;border-radius:8px;margin:24px 0}.blog-meta{color:var(--text-dim);font-size:.9rem}.blog-footer{margin-top:70px;padding-top:24px;border-top:1px solid var(--text-dim);display:flex;gap:24px}</style><script src="https://cloud.ccm19.de/app.js?apiKey=ca9c0009a731e6e5562d8332ea527ef38cb98c8bb9cce3c1&amp;domain=69fe4855081b12d33000aec2" defer referrerpolicy="origin"></script><link rel="stylesheet" href="/fonts/fonts.css"><?php
$site = 'https://codariq.de';
$organization = ['@type'=>'Organization', '@id'=>$site.'/#organization', 'name'=>'CODARIQ', 'url'=>$site.'/'];
$cover = $article['cover'] ?? '';
$image = $cover !== 'https://cms.codariq.de/sites/default/files/2026-01/hero2.webp'
    && preg_match('~^https://cms\.codariq\.de/sites/default/files/[^?#]+$~D', $cover)
    ? $cover : $site.'/share.webp';
$breadcrumbs = null;
$schema = ['@context'=>'https://schema.org', '@type'=>'CollectionPage', 'url'=>$canonical, 'name'=>$title, 'inLanguage'=>'de'];
if ($article) {
    $schema = ['@context'=>'https://schema.org', '@type'=>'BlogPosting', 'headline'=>$title,
        'description'=>$description, 'url'=>$canonical, 'mainEntityOfPage'=>$canonical,
        'image'=>$image, 'author'=>$organization, 'publisher'=>$organization, 'inLanguage'=>'de'];
    $breadcrumbs = ['@context'=>'https://schema.org', '@type'=>'BreadcrumbList', 'itemListElement'=>[
        ['@type'=>'ListItem','position'=>1,'name'=>'CODARIQ','item'=>$site.'/'],
        ['@type'=>'ListItem','position'=>2,'name'=>'Blog','item'=>$site.'/blog'],
        ['@type'=>'ListItem','position'=>3,'name'=>$title,'item'=>$canonical],
    ]];
    foreach (['date'=>'datePublished', 'changed'=>'dateModified'] as $field=>$property) {
        $timestamp = (int)($article[$field] ?? 0);
        if ($timestamp > 0 && $timestamp <= time()) $schema[$property] = gmdate(DATE_ATOM, $timestamp);
    }
}
?>
<link rel="manifest" href="/manifest.json">
<link rel="icon" href="/favicon.ico">
<meta property="og:site_name" content="CODARIQ">
<meta property="og:locale" content="de_DE">
<meta property="og:type" content="<?=$article?'article':'website'?>">
<meta property="og:title" content="<?=e($title)?>">
<meta property="og:description" content="<?=e($description)?>">
<meta property="og:url" content="<?=e($canonical)?>">
<meta property="og:image" content="<?=e($image)?>">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json"><?=json_encode($schema, JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT|JSON_UNESCAPED_UNICODE|JSON_INVALID_UTF8_SUBSTITUTE)?></script>
<?php if ($breadcrumbs): ?>
<script type="application/ld+json"><?=json_encode($breadcrumbs, JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT|JSON_INVALID_UTF8_SUBSTITUTE)?></script>
<?php endif; ?>

</head><body><main class="blog-shell"><nav class="blog-nav" aria-label="<?=$article?'Brotkrumennavigation':'Blognavigation'?>"><a href="/">CODARIQ</a><a href="/blog">Blog</a><?php if($article): ?><span aria-current="page"><?=e($title)?></span><?php endif; ?></nav>
<?php if($article): ?><article><p class="blog-meta">CODARIQ<?php if(!empty($article['date'])): ?> · <?=e(gmdate('d.m.Y',(int)$article['date']))?><?php endif;?></p><h1><?=e($article['title'])?></h1><p><?=e($article['summary'])?></p><?php if($article['cover']):?><img class="blog-cover" src="<?=e($image)?>" alt="<?=e($article['title'])?>"><?php endif;?><?=$article['body_html']?></article>
<?php else: ?><h1>Blog</h1><?php foreach($data['articles'] as $a):?><article class="blog-card"><h2><a href="/blog/<?=e($a['slug'])?>" data-growth-cta="blog" data-growth-placement="blog_list_title"><?=e($a['title'])?></a></h2><p><?=e($a['summary'])?></p><a href="/blog/<?=e($a['slug'])?>" data-growth-cta="blog" data-growth-placement="blog_list_cta">Beitrag lesen</a></article><?php endforeach;?><?php if(!$data['articles']):?><p>Hier sind derzeit keine Beiträge veröffentlicht.</p><?php endif;?><?php endif;?>
<footer class="blog-footer"><a href="/impressum">Impressum</a><a href="/datenschutz">Datenschutz</a><a href="mailto:kontakt@codariq.de" data-growth-cta="contact" data-growth-placement="footer">Kontakt</a><button type="button" data-ccm19-settings>Cookie-Einstellungen</button></footer></main>  
<script src="/ccm19-consent.js" defer></script><script src="/growth-events.js" defer></script></body></html>
