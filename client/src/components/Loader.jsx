import React from 'react';
import LoadingGif from '../images/loading.mp4';

const Loader = () => {
  return (
    <div className='loader'>
        <div className='loader_image'>
            <img src={LoadingGif} alt=''/>
        </div>
    </div>
  )
}

export default Loader