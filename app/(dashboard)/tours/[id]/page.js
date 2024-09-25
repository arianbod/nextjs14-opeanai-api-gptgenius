import TourInfo from '@/components/tours/TourInfo';
import { getSingleTour } from '@/server/action';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react'
import Image from 'next/image';
import axios from 'axios';
const url = `https://api.unsplash.com/search/photos?client_id=${process.env.UNSPLASH_API_KEY}&query=`;


const SingleTourPage = async ({ params }) => {
    const tour = await getSingleTour(params.id)
    console.log(params.id);

    if (!tour) {
        return redirect('/tours')
    }
    const { data } = await axios.get(`${url}${tour.city}`)
    const tourImage = data?.results[0]?.urls?.raw

    return (
        <div>
            <Link href='/tours' className='btn btn-secondary mb-12'>
                back to tours
            </Link>
            <div>
                {tourImage && <Image src={tourImage} width={300} height={300} className='rounded-xl shadow-xl mb-16 h-96 w-96 object-cover' alt={tour.title} priority />
                }     <TourInfo tour={tour} />
            </div>
        </div>
    )
}

export default SingleTourPage