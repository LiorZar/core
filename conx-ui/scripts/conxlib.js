const conxlib = {};
window.conxlib = conxlib;

conxlib["swatch1"] = `
entity: $1
style: 'display: block; width: 100%; height: 100%'
transition: 0.5
colors:
    - '#FFFFFFFF'
    - '#0000FFFF'
    - '#FF0000FF'
    - '#00000001'
buttons:
    - '#FF8000FF'
    - '#0000FF80'
    - '#FF000080'
    - '#00000040'
css: '{"bn": { "width":"25%", "height":"100%", "border-radius":"1%" }}'
`;

conxlib["swatch2"] = `
entity: $1
style: 'display: block; width: 100%; height: 100%'
transition: 0.5
colors:
    - '#FFFFFF'
    - '#0000FF'
    - '#FF0000'
    - '#000000'
opacity:
    - 1
    - 0.5
    - 0.5
    - 0.25
css: '{"bn": { "width":"25%", "height":"100%", "border-radius":"1%" }}'
`;

conxlib["popup"] = `
style: >-
  text-align: center; position: absolute; z-index: 1; left: 50%; width: 400px;
  padding: 0px 0px 20px 0px; border-radius: 10px; color: #333; background-color: #fff;
  transition: transform 0.5s, top 0.5s;
hstyle: >-
  font-size: 40px;
pstyle: >-
  font-size: 22px; direction: rtl;
openStyle:
  visibility: visible
  top: 50%
  transform: translate(-50%,-50%) scale(1)
closeStyle:
  visibility: hidden
  top: 0%
  transform: translate(-50%,-50%) scale(0.1)
bnStyle:
  backgroundImage: 'linear-gradient( 30deg, #000000 70%, #FFFFFF 100%)'
  color: white
 
  
  
  border-radius: 30px
  width: 100px
  height: 64px
title: הפעלת תרחיש
message: האם אתה בטוח ?  
flip: true
'yes': כן
'no': לא
`;