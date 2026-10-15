// Boshlang'ich shirinliklar. Qatorlar: [id, emoji, nom, tur, bayramlar, 1 kg narxi, bezak narxi, min kun, 1 kg dagi dona, tavsif]
export const OCC=["Navro'z","To'y","Tug'ilgan kun","Hayit"];
export const FL={Tort:"Vanil,Shokolad,Qulupnay,Karamel",Milliy:"Asal,Yong'oq,Qaymoq",Trend:"Pistachio,Malina,Matcha,Karamel"};
const O=(...a)=>a.join(',');const [N,T,B,H]=OCC;
// [id,emoji,nom,tur,bayramlar,kg narxi,bezak,min kun,1 kg dagi dona,tavsif]
export const SEED=[
['napoleon','🍰','Napoleon torti','Tort',O(B,H),120000,30000,1,8,'Qatlama xamir va yumshoq qaymoq.'],
['medovik','🍯','Asalli tort (Medovik)','Tort',O(B,H,N),110000,25000,1,8,'Asal qatlamlari va smetana kremi.'],
['velvet','❤️','Red Velvet','Tort',O(T,B),160000,40000,2,8,'Qizil biskvit va pishloqli krem.'],
['truffle','🍫','Shokoladli trufel','Tort',O(B),150000,35000,2,8,'Boy shokolad ganashi bilan.'],
['qulupnay','🍓','Qulupnayli tort','Tort',O(B),145000,35000,1,8,'Yangi qulupnay va yengil qaymoq.'],
['mevali','🍑','Mevali tort','Tort',O(T),140000,30000,1,8,'Mavsumiy mevalar va jele bilan.'],
['praga','🍫','Praga torti','Tort',O(H),135000,30000,1,8,'Klassik shokoladli biskvit va krem.'],
['karamel','🍮','Karamelli tort','Tort',O(B),130000,30000,1,8,'Tuzli karamel va vanilli krem.'],
['toy3','💒','To\'y torti (3 qavatli)','Tort',O(T),200000,60000,3,10,'Katta tantana uchun ko\'p qavatli tort.'],
['gul','💐','Gulli krem torti','Tort',O(B),135000,45000,2,8,'Krem gullar bilan bezatilgan nafis tort.'],
['dubai','🥜','Dubay shokoladli torti','Trend',O(B,H),240000,40000,2,8,'Pistachio kreyfi va kunafa xamiri — hozirgi eng mashhur trend.'],
['basque','🧀','Basque cheesecake','Trend',O(B,H),180000,30000,1,8,'Kuydirilgan ustki qismi va yumshoq ichi bor ispancha cheesecake.'],
['tiramisu','☕','Tiramisu','Trend',O(B),170000,30000,1,8,'Kofe va mascarpone kremi.'],
['macaron','🎀','Makaron torti','Trend',O(B),200000,45000,3,8,'Rang-barang makaronlar bilan bezatilgan.'],
['bento','🎁','Bento tort','Trend',O(B),90000,20000,1,4,'Kichik, yozuvli, sovg\'abop tort.'],
['popslar','🍭','Keyk-popslar','Trend',O(B),160000,0,2,24,'Tayoqchadagi shokoladli sharchalar.'],
['mochi','🍡','Mochi','Trend',O(B),180000,0,2,16,'Yumshoq guruch xamirli yapon shirinligi.'],
['brauni','🍫','Brauni','Trend',O(B),130000,15000,1,12,'Shokoladli, ichi yumshoq brauni.'],
['eklyer','🥖','Eklyer','Trend',O(H,B),150000,0,1,10,'Qaymoqli va glazurli fransuz shirinligi.'],
['pavlova','🍓','Pavlova','Trend',O(N),170000,25000,2,8,'Beze asosida qaymoq va mevalar.'],
['chak','🍯','Chak-chak','Milliy',O(N,T,H),90000,20000,1,20,"An'anaviy o'zbek shirinligi: asalli qovurilgan xamir."],
['paxlava','🥮','Paxlava','Milliy',O(T,H,N),140000,25000,1,14,"Yong'oqli, sharbatli qatlama paxlava."],
['nishalda','☁️','Nishalda','Milliy',O(N),80000,15000,1,10,"Navro'z shirinligi: ko'pikli shirin krem."],
['parvarda','🍬','Parvarda','Milliy',O(N,H),70000,15000,1,40,"Qandli, nafis an'anaviy shirinlik."],
['halva','🥜','Yong\'oqli halva','Milliy',O(N,H),95000,15000,1,12,'Kunjut va yong\'oqdan tayyorlangan halva.'],
['navvot','🍬','Navvot','Milliy',O(N,H),85000,0,1,30,'Kristallangan shakar — choy bilan eng yaxshi.'],
['pashmak','☁️','Pashmak (ipsimon halva)','Milliy',O(N,B),110000,0,1,10,'Ipdek ingichka, erib ketadigan halva.'],
['shakarpoya','🍪','Shakarpoya','Milliy',O(H,T),100000,0,1,30,"Yog'li, mo'rt sharq kulchasi."],
['assorti','🎁','Sharqona assorti','Milliy',O(T,N,H),120000,30000,2,25,"Bir nechta milliy shirinlik to'plami."]];
