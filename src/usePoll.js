import { useEffect, useRef, useState } from 'react'

// Ma'lumotni har 5 soniyada qayta yuklaydi (ikkinchi qurilmadagi o'zgarishlar avtomatik ko'rinadi)
export default function usePoll(fetcher, deps, ms = 5000) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const f = useRef(fetcher)
  f.current = fetcher
  useEffect(() => {
    let alive = true
    const run = () =>
      f.current()
        .then((d) => { if (alive) { setData(d); setError('') } })
        .catch((e) => { if (alive) setError(e.message) })
    run()
    const t = setInterval(run, ms)
    return () => { alive = false; clearInterval(t) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return [data, error]
}
