import React from "react";
import { Rings } from "react-loader-spinner";
import "../styles/loading.css";

const Loading: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="ld-root">
      <div className="ld-card">
        <div className="ld-spinner-wrap">
          <Rings
            height="80"
            width="80"
            color="#0e92e4"
            ariaLabel="loading"
            wrapperStyle={{ justifyContent: "center", alignItems: "center" }}
          />
        </div>
        <p className="ld-message">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
