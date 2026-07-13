import React from "react";
import img1 from "../assets/shoes1.png";
import img2 from "../assets/shirts1.png";
import img3 from "../assets/sandals.png";
import img4 from "../assets/pants.png";
import img5 from "../assets/shirts.png";
import img6 from "../assets/shoes.png";
import "../styles/banner.css";

const images = [img1, img2, img3, img6, img4, img5];

const HomeBanner: React.FC = () => {
  return (
    <div
      id="carouselExampleCaptions"
      className="carousel carousel-dark slide bnr-root"
      data-bs-ride="carousel"
    >
      {/* Indicators */}
      <div className="carousel-indicators bnr-indicators">
        {images.map((_img, i) => (
          <button
            key={i}
            type="button"
            data-bs-target="#carouselExampleCaptions"
            data-bs-slide-to={`${i}`}
            className={i === 0 ? "active" : ""}
            aria-current={i === 0 ? "true" : "false"}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Slides */}
      <div className="carousel-inner bnr-inner">
        {images.map((img, index) => (
          <div
            key={index}
            className={`carousel-item bnr-item ${index === 0 ? "active" : ""}`}
            data-bs-interval="3500"
          >
            <img src={img} className="bnr-img" alt={`Slide ${index + 1}`} />
            <div className="bnr-overlay" />
          </div>
        ))}
      </div>

      {/* Controls */}
      <button
        className="carousel-control-prev bnr-ctrl"
        type="button"
        data-bs-target="#carouselExampleCaptions"
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true" />
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next bnr-ctrl"
        type="button"
        data-bs-target="#carouselExampleCaptions"
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon" aria-hidden="true" />
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
};

export default HomeBanner;
