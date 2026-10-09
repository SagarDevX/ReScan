import Link from 'next/link'

const Navbar = () => {
    return (
        <div className='w-full  md:px-16 py-4 '>
            <Link
                href="/"
                className="text-2xl font-semibold tracking-tight z-100 cursor-pointer"
            >
                ReScan
            </Link>
        </div>
    )
}

export default Navbar