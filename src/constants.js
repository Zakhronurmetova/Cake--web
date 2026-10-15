// Umumiy o'zgarmaslar va yordamchi funksiyalar
export const OCC = ["Navro'z", "To'y", "Tug'ilgan kun", 'Hayit']
export const OEMO = { "Navro'z": '🌷', "To'y": '💍', "Tug'ilgan kun": '🎂', Hayit: '🌙' }
export const CATS = ['Tort', 'Milliy', 'Trend']
export const DECO = ['Bezaksiz', 'Mevali bezak', 'Gulli krem', 'Shokoladli bezak']
export const KG = [0.5, 1, 1.5, 2, 3, 5]
export const DIA = { 0.5: 14, 1: 18, 1.5: 20, 2: 22, 3: 26, 5: 30 }
export const FLOW = ['Yangi', 'Qabul qilindi', 'Tayyorlanmoqda', 'Tayyor', 'Topshirildi']
export const FL = { Tort: 'Vanil,Shokolad,Qulupnay,Karamel', Milliy: "Asal,Yong'oq,Qaymoq", Trend: 'Pistachio,Malina,Matcha,Karamel' }
export const COLORS = {
  Yangi: 'bg-amber-100 text-amber-800',
  'Qabul qilindi': 'bg-sky-100 text-sky-800',
  Tayyorlanmoqda: 'bg-violet-100 text-violet-800',
  Tayyor: 'bg-emerald-100 text-emerald-800',
  Topshirildi: 'bg-stone-200 text-stone-700',
  'Rad etildi': 'bg-red-100 text-red-700',
  'Bekor qilindi': 'bg-stone-200 text-stone-500',
}

export const fmt = (n) => Number(n).toLocaleString('ru-RU') + " so'm"
export const addDays = (n) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  const p = (x) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
// Bitta shirinlikning hajm variantlari (vazn, dona, diametr, narx)
export const variants = (c) =>
  KG.map((kg) => ({ kg, pcs: Math.max(1, Math.round(kg * (c.pcs || 8))), price: Math.round(kg * c.perKg), dia: DIA[kg] }))
export const sizeText = (c) => {
  const v = variants(c)
  const a = v[0]
  const b = v[v.length - 1]
  return `${a.kg}–${b.kg} kg · ${a.pcs}–${b.pcs} dona` + (c.cat === 'Tort' ? ` · Ø${a.dia}–${b.dia} sm` : '')
}
