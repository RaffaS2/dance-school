import Link from 'next/link'

async function getData(){
  const res = await fetch('http://localhost:3001')
  const data = await res.json()
  return data
}
async function home() {
  const data = await getData()
  return (
    //teste
    <div className='min-h-screen bg-blue-950 flex items-center justify-center'>
      <h1 className='text-white text-4xl font-bold'>{data.message}</h1>
      <Link href="/dashboard">go to dashboard</Link>
    </div>
  )
}

export default home
