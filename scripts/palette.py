# Generates and validates the Kilalao palette: OKLCH -> sRGB, WCAG contrast, colour-vision-deficiency separation.
# Usage: python3 scripts/palette.py palette.json   (prints every check; values are copied into style.css :root)
import math,json,sys
def oklch(L,C,h):
    a=C*math.cos(math.radians(h));b=C*math.sin(math.radians(h))
    l_=L+0.3963377774*a+0.2158037573*b; m_=L-0.1055613458*a-0.0638541728*b; s_=L-0.0894841775*a-1.2914855480*b
    l,m,s=l_**3,m_**3,s_**3
    r=4.0767416621*l-3.3077115913*m+0.2309699292*s; g=-1.2684380046*l+2.6097574011*m-0.3413193965*s; bb=-0.0041960863*l-0.7034186147*m+1.7076147010*s
    def gam(x):
        x=min(1,max(0,x)); return 12.92*x if x<=0.0031308 else 1.055*x**(1/2.4)-0.055
    return tuple(round(gam(v)*255) for v in (r,g,bb))
def inGamut(L,C,h):
    a=C*math.cos(math.radians(h));b=C*math.sin(math.radians(h))
    l_=L+0.3963377774*a+0.2158037573*b; m_=L-0.1055613458*a-0.0638541728*b; s_=L-0.0894841775*a-1.2914855480*b
    l,m,s=l_**3,m_**3,s_**3
    rgb=(4.0767416621*l-3.3077115913*m+0.2309699292*s,-1.2684380046*l+2.6097574011*m-0.3413193965*s,-0.0041960863*l-0.7034186147*m+1.7076147010*s)
    return all(-0.001<=v<=1.001 for v in rgb)
def fit(L,C,h):
    while C>0 and not inGamut(L,C,h): C-=0.002
    return oklch(L,C,h)
hx=lambda c:'#%02x%02x%02x'%c
def lum(c):
    f=lambda v:(v/255)/12.92 if v/255<=0.04045 else ((v/255+0.055)/1.055)**2.4
    r,g,b=map(f,c); return 0.2126*r+0.7152*g+0.0722*b
def cr(a,b):
    la,lb=sorted((lum(a),lum(b)),reverse=True); return (la+0.05)/(lb+0.05)
# Machado 2009 severity 1.0
CVD={'protan':[[0.152286,1.052583,-0.204868],[0.114503,0.786281,0.099216],[-0.003882,-0.048116,1.051998]],
     'deutan':[[0.367322,0.860646,-0.227968],[0.280085,0.672501,0.047413],[-0.011820,0.042940,0.968881]],
     'tritan':[[1.255528,-0.076749,-0.178779],[-0.078411,0.930809,0.147602],[0.004733,0.691367,0.303900]]}
def lin(v):v/=255;return v/12.92 if v<=0.04045 else ((v+0.055)/1.055)**2.4
def sim(c,M):
    l=[lin(v) for v in c]; o=[sum(M[i][j]*l[j] for j in range(3)) for i in range(3)]
    g=lambda x:min(1,max(0,x)); return tuple(round(255*(12.92*g(x) if g(x)<=0.0031308 else 1.055*g(x)**(1/2.4)-0.055)) for x in o)
def toLab(c):
    r,g,b=[lin(v) for v in c]
    l=0.4122214708*r+0.5363325363*g+0.0514459929*b; m=0.2119034982*r+0.6806995451*g+0.1073969566*b; s=0.0883024619*r+0.2817188376*g+0.6299787005*b
    l,m,s=[x**(1/3) for x in (l,m,s)]
    return (0.2104542553*l+0.7936177850*m-0.0040720468*s,1.9779984951*l-2.4285922050*m+0.4505937099*s,0.0259040371*l+0.7827717662*m-0.8086757660*s)
def dE(a,b): return 100*math.dist(toLab(a),toLab(b))

P={}
# Neutrals: warm paper (hue 85), indigo ink (hue 285) – complementary temperature, ink never pure black.
P['paper']=fit(.975,.018,85); P['surface']=fit(.995,.006,85); P['sunken']=fit(.945,.022,80)
P['line']=fit(.895,.03,80); P['line-strong']=fit(.80,.045,75)
P['ink']=fit(.26,.075,285); P['ink-soft']=fit(.38,.07,285); P['muted']=fit(.50,.05,285)
# Brand / primary: grape. Hover: one step lighter.
P['primary']=fit(.50,.21,285); P['primary-hover']=fit(.56,.20,285); P['primary-soft']=fit(.94,.035,285)
# Category hues: 5 hues spread around the wheel, same lightness & chroma so none shouts louder.
# Hue AND lightness both differ, so categories stay apart for colour-blind eyes too.
H={'strategy':(25,.58,.16),'numbers':(85,.85,.16),'patterns':(175,.82,.12),'spatial':(225,.60,.16),'logic':(325,.40,.16)}
for k,(h,L,C) in H.items():
    P[k]=fit(L,C,h); P[k+'-soft']=fit(.945,.04,h); P[k+'-deep']=fit(.44,.13,h)
# Players: Okabe–Ito logic – blue vs orange, also split by lightness so they survive greyscale.
P['p1']=fit(.55,.17,255); P['p2']=fit(.74,.16,55); P['p2-text']=fit(.53,.15,45)
# Semantic
P['success']=P['patterns']; P['danger']=fit(.55,.19,28); P['danger-soft']=P['strategy-soft']; P['highlight']=P['numbers']
out={k:hx(v) for k,v in P.items()}
json.dump(out,open(sys.argv[1],'w'),indent=1)
def row(name,fg,bg,need):
    c=cr(P[fg],P[bg]); print(f"{'PASS' if c>=need else 'FAIL'} {name:42s} {c:5.2f} (need {need})")
print({k:v for k,v in out.items()})
for bg in ['paper','surface','sunken','primary-soft']+[k+'-soft' for k in H]+['numbers','highlight','p2']: row('ink on '+bg,'ink',bg,7 if bg!='p2' else 4.5)
for bg in ['paper','surface']+[k+'-soft' for k in H]: row('muted on '+bg,'muted',bg,4.5)
for fg in ['p1','p2-text','danger','primary']:
    for bg in ['paper','surface']: row(fg+' text on '+bg,fg,bg,4.5)
# Coral is used as text only in headings of 24px or more (WCAG large text).
for bg in ['paper','surface']: row('strategy heading text on '+bg,'strategy',bg,3)
WHITE=(255,255,255); P['white']=WHITE
for bg in ['primary','p1','danger','ink']+[k+'-deep' for k in H]: row('white on '+bg,'white',bg,4.5)
for k in list(H)+['p1','p2','primary']: row(k+' vs surface (UI 3:1)',k,'surface',3) if k not in('numbers','p2','patterns') else row(k+' vs ink border (UI 3:1)',k,'ink',3)
row('line-strong vs surface (disabled border)','line-strong','surface',1.3)
print('\nPlayer separation ΔE(OKLab×100), want ≥ 15:')
print(' normal',round(dE(P['p1'],P['p2']),1),' Lum ratio',round(cr(P['p1'],P['p2']),2))
for n,M in CVD.items(): print(' ',n,round(dE(sim(P['p1'],M),sim(P['p2'],M)),1))
print('\nCategory min pairwise ΔE under CVD:')
cats=list(H)
for n,M in [('normal',None)]+list(CVD.items()):
    s=[(dE(*(P[a],P[b]) if M is None else (sim(P[a],M),sim(P[b],M))),a,b) for i,a in enumerate(cats) for b in cats[i+1:]]
    print(' ',n,[(round(d,1),a,b) for d,a,b in sorted(s)[:2]])
