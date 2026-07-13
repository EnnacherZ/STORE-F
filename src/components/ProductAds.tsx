import React from "react";
import "../styles/test.css"
import img1 from "../homecarousel/image.png"
import img2 from "../homecarousel/image (1).png"
import img3 from "../homecarousel/image (2).png"
import img4 from "../homecarousel/image (3).png"

const images =[img1, img2, img3, img4]


const ProductAds : React.FC= () => {
    return(<>
        <div id="carouselExampleCaptions" data-bs-pause= {false} className="carousel carousel-dark slide crs-home" data-bs-ride="carousel" >
            <div className="carousel-indicators crs-home_butts">
                {images.map((_images, i)=>(
                    <button key={i} type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to={`${i}`}  className={i==0?"active":""} aria-current={i==0?"true":"false"} aria-label={`Slide ${i+1}`}></button>
                ))}
            </div>
            <div className="carousel-inner crs-inner-home" >
                {images.map((img, index)=>(
                    <div key = {index} 
                        className={index==0?"carousel-item active crs-item-home":"carousel-item crs-item-home"} 
                        data-bs-interval={`1500`}
                        >
                        <img src={img} className="d-block w-100 crs-img" alt={`Slide ${index + 1}`} />
                    </div>                    
                ))}
            </div>
            <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Previous</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Next</span>
            </button>
        </div>

        
    </>)
}
export default ProductAds