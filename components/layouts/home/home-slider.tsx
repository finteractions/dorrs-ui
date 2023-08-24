import React from 'react'
import Image from 'next/image'

import slide1Img from '../../../public/img/sl.webp'
import slide2Img from '../../../public/img/sl2.webp'
import slide3Img from '../../../public/img/sl3.webp'
import slide4Img from '../../../public/img/sl4.webp'

import SwiperCore, {Autoplay, Pagination} from 'swiper'
import {Swiper, SwiperSlide} from 'swiper/react'

import 'swiper/css'
import 'swiper/css/pagination'

SwiperCore.use([Pagination, Autoplay])

function HomeSlider() {
    return (
        <Swiper
            className="login__slider swiper-container"
            pagination={{
                clickable: true
            }}
            loop={true}
            slidesPerView={1}
            autoplay={{
                delay: 2500,
                disableOnInteraction: false
            }}
        >
            <SwiperSlide>
                <div className="login__slider-item">
                    <Image src={slide1Img} alt="Slide1" priority/>
                    <div className="login__slider-text"></div>
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="login__slider-item">
                    <Image src={slide2Img} alt="Slide2" priority/>
                    <div className="login__slider-text"></div>
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="login__slider-item">
                    <Image src={slide3Img} alt="Slide3" priority/>
                    <div className="login__slider-text"></div>
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="login__slider-item">
                    <Image src={slide4Img} alt="Slide4" priority/>
                    <div className="login__slider-text"></div>
                </div>
            </SwiperSlide>
            <div className="swiper-pagination"/>
        </Swiper>
    )
}

export default HomeSlider
