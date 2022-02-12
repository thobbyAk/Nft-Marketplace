import { useEffect } from 'react'
import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps }) {

  useEffect(()=>{
    if(window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      })
      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      })
  }
  })

  return (
    <div className='bg-sky-900 h-screen'>
    <nav className='border-b p-6 '>
      <p className='text-4xl text-slate-200 font-bold'>Avengers Marketplace</p>
      <div className='flex mt-4'>
        <Link href='/'> 
        <a  className='mr-6 text-gray-400 hover:text-slate-800'>Home</a>
        </Link>
        <Link href='/create-item'> 
        <a  className='mr-6 text-gray-400 hover:text-slate-800'>Sell Digital Assets</a>
        </Link>
        <Link href='/my-assets'> 
        <a  className='mr-6 text-gray-400 hover:text-slate-800'>My Digital Assets</a>
        </Link>
        <Link href='/creator-dashboard'> 
        <a  className='mr-6 text-gray-400 hover:text-slate-800'>Creator Dashboard</a>
        </Link>
      </div>
    </nav>
    <Component {...pageProps} />
  </div>
  )
 
}

export default MyApp
