:root{
  --crimson:#C8102E;
  --crimson-dark:#8E0B21;
  --navy:#0A1F3D;
  --navy-2:#0F2A52;
  --sky:#2E86D6;
  --gold:#F0A93A;
  --ivory:#FAF6EE;
  --ink:#16181D;
  --muted:#5B6472;
  --line:rgba(10,31,61,0.12);
  --white:#ffffff;

  --frankfurt:#C8102E;
  --munich:#2E9BCF;
  --berlin:#D9A62E;
  --hamburg:#1E8A72;
  --cologne:#7A2E3B;
  --stuttgart:#3E7C42;
}
*{box-sizing:border-box;}
html{scroll-behavior:smooth;}
body{
  margin:0;
  font-family:'Inter',sans-serif;
  color:var(--ink);
  background:var(--ivory);
  -webkit-font-smoothing:antialiased;
}
h1,h2,h3,.display{
  font-family:'Anton',sans-serif;
  font-weight:400;
  letter-spacing:0.01em;
  text-transform:uppercase;
  line-height:1.02;
  margin:0;
}
.mono{font-family:'IBM Plex Mono',monospace;}
a{color:inherit;text-decoration:none;}
img,svg{display:block;max-width:100%;}
.wrap{max-width:1180px;margin:0 auto;padding:0 32px;}
section{position:relative;}

/* ---------- NAV ---------- */
.nav{
  position:sticky;top:0;z-index:50;
  background:var(--navy);
  border-bottom:3px solid var(--crimson);
}
.nav .wrap{
  display:flex;align-items:center;justify-content:space-between;
  height:72px;
}
.brand{display:flex;align-items:center;gap:10px;color:var(--white);}
.brand .mark{
  width:34px;height:34px;border-radius:50%;
  background:var(--crimson);
  display:flex;align-items:center;justify-content:center;
  font-family:'Anton',sans-serif;font-size:16px;color:var(--white);
  flex-shrink:0;
}
.brand .word{font-family:'Anton',sans-serif;font-size:19px;letter-spacing:0.03em;}
.brand .word span{color:var(--gold);}
.navlinks{display:flex;gap:26px;font-size:14px;font-weight:500;}
.navlinks a{color:rgba(255,255,255,0.78);transition:color .15s;}
.navlinks a:hover, .navlinks a.active{color:var(--white);}
.nav-cta{
  background:var(--crimson);color:var(--white);
  padding:10px 18px;border-radius:3px;font-size:13.5px;font-weight:600;
  letter-spacing:0.02em;
}
.nav-cta:hover{background:var(--crimson-dark);}
@media (max-width:860px){
  .navlinks{display:none;}
  .nav-cta{padding:8px 14px;font-size:12.5px;}
}

/* ---------- PAGE HERO (used on players/gallery inner pages) ---------- */
.page-hero{
  background:linear-gradient(180deg,var(--navy) 0%,var(--navy-2) 100%);
  color:var(--white);
  padding:64px 0 46px;
}
.page-hero .eyebrow{
  font-family:'IBM Plex Mono',monospace;font-size:12.5px;letter-spacing:0.12em;
  color:var(--gold);margin-bottom:16px;font-weight:600;
}
.page-hero h1{font-size:clamp(34px,5vw,54px);color:var(--white);}
.page-hero p.lede{
  font-size:16px;line-height:1.6;color:rgba(255,255,255,0.78);
  max-width:640px;margin:18px 0 0;
}

/* ---------- HERO (home) ---------- */
.hero{
  background:linear-gradient(180deg,var(--navy) 0%,var(--navy-2) 100%);
  color:var(--white);
  padding:88px 0 0;
  overflow:hidden;
}
.hero-inner{
  display:grid;grid-template-columns:1.15fr 0.85fr;gap:56px;align-items:center;
  padding-bottom:64px;
}
.eyebrow{
  font-family:'IBM Plex Mono',monospace;font-size:12.5px;letter-spacing:0.12em;
  color:var(--gold);margin-bottom:22px;font-weight:600;
}
.hero h1{font-size:clamp(48px,7vw,88px);color:var(--white);}
.hero h1 .accent{color:var(--crimson);}
.hero .sub-h{
  font-family:'Anton',sans-serif;font-size:clamp(15px,2vw,20px);
  color:rgba(255,255,255,0.7);letter-spacing:0.06em;margin-top:6px;
}
.hero p.lede{
  font-size:17px;line-height:1.65;color:rgba(255,255,255,0.82);
  max-width:520px;margin:26px 0 34px;
}
.hero-ctas{display:flex;gap:14px;flex-wrap:wrap;}
.btn{
  display:inline-flex;align-items:center;justify-content:center;gap:8px;
  padding:14px 26px;border-radius:3px;font-size:14.5px;font-weight:600;
  letter-spacing:0.02em;border:2px solid transparent;cursor:pointer;
  transition:transform .12s, background .15s, border-color .15s;
  font-family:'Inter',sans-serif;
}
.btn:active{transform:scale(0.98);}
.btn-primary{background:var(--crimson);color:var(--white);}
.btn-primary:hover{background:var(--crimson-dark);}
.btn-ghost{background:transparent;color:var(--white);border-color:rgba(255,255,255,0.35);}
.btn-ghost:hover{border-color:var(--white);}
.btn-navy{background:var(--navy);color:var(--white);}
.btn-navy:hover{background:var(--navy-2);}
.btn-small{padding:8px 16px;font-size:13px;}

.hero-badge{
  align-self:start;justify-self:end;
  border:1px solid rgba(255,255,255,0.18);
  border-radius:6px;padding:22px 22px 18px;
  background:rgba(255,255,255,0.04);
  width:100%;max-width:300px;
}
.hero-badge .label{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.1em;color:rgba(255,255,255,0.55);margin-bottom:14px;}
.hb-row{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.1);font-size:13.5px;}
.hb-row:last-child{border-bottom:none;}
.hb-row .k{color:rgba(255,255,255,0.6);}
.hb-row .v{font-family:'IBM Plex Mono',monospace;color:var(--gold);font-weight:600;}

.ribbon{width:100%;display:block;}
.ribbon-wrap{position:relative;margin-top:10px;}
.peak-nav{
  display:grid;grid-template-columns:repeat(6,1fr);
  max-width:1180px;margin:0 auto;padding:0 32px;
  transform:translateY(-46px);
}
.peak-nav a{
  text-align:center;font-family:'IBM Plex Mono',monospace;
  font-size:11.5px;letter-spacing:0.03em;color:var(--white);
  padding-top:2px;
}
.peak-nav a span{display:block;font-size:9.5px;color:rgba(255,255,255,0.55);margin-top:2px;}
@media (max-width:820px){
  .hero-inner{grid-template-columns:1fr;}
  .hero-badge{justify-self:start;max-width:100%;}
  .peak-nav{display:none;}
}

/* ---------- STAT STRIP ---------- */
.stat-strip{background:var(--crimson);color:var(--white);padding:20px 0;}
.stat-strip .wrap{
  display:flex;justify-content:center;gap:36px;flex-wrap:wrap;
  font-family:'IBM Plex Mono',monospace;font-size:13px;letter-spacing:0.04em;
  font-weight:600;text-align:center;
}
.stat-strip .dot{opacity:0.6;}

/* ---------- SECTION HEADERS ---------- */
.sec-head{max-width:640px;margin-bottom:52px;}
.sec-eyebrow{
  font-family:'IBM Plex Mono',monospace;font-size:12px;letter-spacing:0.1em;
  color:var(--crimson);font-weight:600;margin-bottom:12px;
}
.sec-head h2{font-size:clamp(30px,4vw,44px);color:var(--navy);}
.sec-head p{font-size:16px;color:var(--muted);margin-top:14px;line-height:1.6;}
.sec-head.between{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap;}

/* ---------- ABOUT ---------- */
.about{padding:96px 0 80px;}
.pillars{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
.pillar{background:var(--white);border:1px solid var(--line);border-radius:8px;padding:28px 24px;}
.pillar .num{font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--crimson);font-weight:600;margin-bottom:14px;}
.pillar h3{font-family:'Inter',sans-serif;font-size:17px;font-weight:700;text-transform:none;color:var(--navy);margin-bottom:10px;}
.pillar p{font-size:14.5px;color:var(--muted);line-height:1.65;margin:0;}
@media (max-width:820px){.pillars{grid-template-columns:1fr;}}

/* ---------- FRANCHISES ---------- */
.franchises{padding:80px 0 96px;background:var(--white);border-top:1px solid var(--line);border-bottom:1px solid var(--line);}
.fr-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;}
.fr-card{border-radius:10px;overflow:hidden;background:var(--ivory);border:1px solid var(--line);scroll-margin-top:100px;}
.fr-top{padding:26px 22px 20px;color:var(--white);position:relative;}
.fr-top .fr-city{font-family:'IBM Plex Mono',monospace;font-size:11.5px;letter-spacing:0.08em;opacity:0.8;margin-bottom:6px;}
.fr-top h3{font-family:'Anton',sans-serif;font-size:23px;text-transform:uppercase;color:var(--white);}
.fr-top .icon{position:absolute;top:22px;right:20px;width:34px;height:34px;opacity:0.9;}
.fr-body{padding:18px 22px 24px;}
.fr-body .tag{font-size:14px;font-style:normal;color:var(--navy);font-weight:600;margin-bottom:8px;}
.fr-body p{font-size:13.5px;color:var(--muted);line-height:1.6;margin:0 0 12px;}
.fr-body .fr-link{font-size:12.5px;font-weight:600;color:var(--crimson);}
@media (max-width:900px){.fr-grid{grid-template-columns:1fr 1fr;}}
@media (max-width:600px){.fr-grid{grid-template-columns:1fr;}}

/* ---------- FORMAT TIMELINE ---------- */
.format{padding:96px 0;}
.tl{position:relative;padding-left:36px;}
.tl::before{content:'';position:absolute;left:9px;top:6px;bottom:6px;width:2px;background:var(--line);}
.tl-item{position:relative;margin-bottom:40px;}
.tl-item:last-child{margin-bottom:0;}
.tl-item::before{content:'';position:absolute;left:-36px;top:4px;width:20px;height:20px;border-radius:50%;background:var(--crimson);border:4px solid var(--ivory);}
.tl-item .stage{font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--crimson);font-weight:600;letter-spacing:0.06em;margin-bottom:6px;}
.tl-item h3{font-family:'Inter',sans-serif;text-transform:none;font-size:19px;font-weight:700;color:var(--navy);margin-bottom:8px;}
.tl-item p{font-size:15px;color:var(--muted);line-height:1.65;max-width:640px;margin:0;}

/* ---------- ELIGIBILITY / JOIN ---------- */
.join{padding:96px 0;background:var(--navy);color:var(--white);}
.join .sec-head h2{color:var(--white);}
.join .sec-head p{color:rgba(255,255,255,0.68);}
.join .sec-eyebrow{color:var(--gold);}
.join-grid{display:grid;grid-template-columns:0.9fr 1.1fr;gap:56px;}
.checklist{list-style:none;margin:0;padding:0;}
.checklist li{display:flex;gap:12px;padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.1);font-size:15px;color:rgba(255,255,255,0.88);align-items:flex-start;}
.checklist li:last-child{border-bottom:none;}
.checklist .tick{width:20px;height:20px;border-radius:50%;background:var(--crimson);flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center;}
.checklist .tick svg{width:11px;height:11px;}

.form-card{background:var(--white);border-radius:10px;padding:30px;color:var(--ink);}
.form-card h3{font-family:'Inter',sans-serif;text-transform:none;font-size:18px;font-weight:700;color:var(--navy);margin-bottom:18px;}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;}
.field{display:flex;flex-direction:column;gap:6px;}
.field.full{grid-column:1 / -1;}
.field label{font-size:12.5px;font-weight:600;color:var(--navy);}
.field input,.field select{padding:10px 12px;border:1px solid var(--line);border-radius:5px;font-family:'Inter',sans-serif;font-size:14px;background:var(--ivory);color:var(--ink);}
.field input:focus,.field select:focus{outline:2px solid var(--sky);outline-offset:1px;}
.form-note{font-size:12px;color:var(--muted);margin-top:12px;line-height:1.5;}
.form-msg{margin-top:14px;font-size:13.5px;font-weight:600;padding:10px 12px;border-radius:5px;display:none;}
.form-msg.ok{display:block;background:#E6F4EC;color:#1E7A45;}
.form-msg.err{display:block;background:#FBEAEA;color:var(--crimson-dark);}
@media (max-width:900px){.join-grid{grid-template-columns:1fr;}.frow{grid-template-columns:1fr;}}

/* ---------- PLAYERS PAGE ---------- */
.players-section{padding:64px 0 96px;}
.filter-row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:36px;}
.filter-chip{
  padding:9px 16px;border-radius:20px;border:1px solid var(--line);
  background:var(--white);font-size:13.5px;font-weight:600;color:var(--navy);
  cursor:pointer;transition:background .15s, color .15s, border-color .15s;
}
.filter-chip:hover{border-color:var(--crimson);}
.filter-chip.active{background:var(--navy);color:var(--white);border-color:var(--navy);}
.players-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;}
.player-card{background:var(--white);border:1px solid var(--line);border-radius:10px;overflow:hidden;}
.player-card .photo{width:100%;aspect-ratio:1/1;object-fit:cover;display:block;}
.player-card .info{padding:14px 16px 16px;}
.player-card .p-name{font-size:15px;font-weight:700;color:var(--navy);margin:0 0 4px;}
.player-card .p-role{font-size:12.5px;color:var(--muted);margin:0 0 8px;}
.player-card .p-badge{
  display:inline-block;font-family:'IBM Plex Mono',monospace;font-size:10.5px;
  letter-spacing:0.04em;font-weight:600;color:var(--white);
  padding:3px 8px;border-radius:3px;
}
.empty-note{
  background:var(--white);border:1px dashed var(--line);border-radius:10px;
  padding:40px;text-align:center;color:var(--muted);font-size:14.5px;
}
@media (max-width:980px){.players-grid{grid-template-columns:repeat(3,1fr);}}
@media (max-width:700px){.players-grid{grid-template-columns:repeat(2,1fr);}}
@media (max-width:460px){.players-grid{grid-template-columns:1fr 1fr;}}

/* ---------- GALLERY PAGE ---------- */
.gallery-section{padding:64px 0 96px;}
.gallery-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;}
.g-item{position:relative;border-radius:10px;overflow:hidden;border:1px solid var(--line);cursor:pointer;background:var(--white);}
.g-item img{width:100%;aspect-ratio:3/2;object-fit:cover;display:block;transition:transform .2s;}
.g-item:hover img{transform:scale(1.03);}
.g-cap{padding:10px 14px 14px;}
.g-cap .g-title{font-size:13.5px;font-weight:700;color:var(--navy);margin:0 0 2px;}
.g-cap .g-sub{font-size:12px;color:var(--muted);margin:0;}
@media (max-width:900px){.gallery-grid{grid-template-columns:repeat(2,1fr);}}
@media (max-width:560px){.gallery-grid{grid-template-columns:1fr;}}

.lightbox{
  display:none;position:fixed;inset:0;background:rgba(10,31,61,0.88);
  z-index:200;align-items:center;justify-content:center;padding:24px;
}
.lightbox.open{display:flex;}
.lightbox-inner{max-width:900px;width:100%;}
.lightbox-inner img{width:100%;border-radius:8px;}
.lightbox-cap{color:var(--white);text-align:center;margin-top:14px;font-size:14px;}
.lightbox-close{
  position:absolute;top:22px;right:28px;background:none;border:none;
  color:var(--white);font-size:30px;cursor:pointer;line-height:1;
}

/* ---------- FOOTER ---------- */
footer{background:var(--ink);color:rgba(255,255,255,0.7);padding:56px 0 28px;}
.foot-top{display:flex;justify-content:space-between;gap:40px;flex-wrap:wrap;padding-bottom:36px;border-bottom:1px solid rgba(255,255,255,0.12);}
.foot-brand .word{font-family:'Anton',sans-serif;font-size:20px;color:var(--white);letter-spacing:0.03em;}
.foot-brand p{font-size:13.5px;max-width:320px;margin-top:10px;line-height:1.6;}
.foot-cols{display:flex;gap:56px;flex-wrap:wrap;}
.foot-col h4{font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.45);margin:0 0 12px;font-weight:600;}
.foot-col a,.foot-col p{display:block;font-size:14px;margin-bottom:8px;color:rgba(255,255,255,0.75);}
.foot-bottom{display:flex;justify-content:space-between;align-items:center;padding-top:22px;font-size:12.5px;flex-wrap:wrap;gap:10px;}
.founder-link{color:rgba(255,255,255,0.35);font-size:11.5px;cursor:pointer;background:none;border:none;font-family:inherit;}
.founder-link:hover{color:rgba(255,255,255,0.6);}

/* founder dashboard */
.dash-overlay{display:none;position:fixed;inset:0;background:rgba(10,31,61,0.75);z-index:100;align-items:center;justify-content:center;padding:20px;}
.dash-overlay.open{display:flex;}
.dash-box{background:var(--white);border-radius:10px;max-width:640px;width:100%;max-height:80vh;overflow:auto;padding:28px;color:var(--ink);}
.dash-box h3{font-family:'Inter',sans-serif;text-transform:none;font-size:18px;font-weight:700;color:var(--navy);margin-bottom:6px;}
.dash-box .sub{font-size:13px;color:var(--muted);margin-bottom:18px;}
.dash-close{float:right;background:none;border:none;font-size:20px;cursor:pointer;color:var(--muted);}
table.dash-table{width:100%;border-collapse:collapse;font-size:13px;}
table.dash-table th,table.dash-table td{text-align:left;padding:8px 6px;border-bottom:1px solid var(--line);}
table.dash-table th{color:var(--muted);font-weight:600;font-size:11.5px;text-transform:uppercase;letter-spacing:0.04em;}
