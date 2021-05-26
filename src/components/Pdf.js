import React from "react";

function Pdf({fileName=""}) {
    return (
        <iframe title={fileName} src={fileName} width={`${window.innerWidth}px`} height={`${window.innerHeight}px`}></iframe>
    );
}

export default Pdf;