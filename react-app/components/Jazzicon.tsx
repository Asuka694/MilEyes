import React from "react";
import jazzicon from "@metamask/jazzicon";

function Jazzicon({ diameter, address }: any) {
    // Create a ref to attach the identicon to the DOM element
    const containerRef = React.useRef();

    // Use the jazzicon library to generate the identicon
    React.useEffect(() => {
        if (containerRef.current && address) {
            containerRef.current.innerHTML = "";
            const identicon = jazzicon(
                diameter,
                parseInt(address.slice(2, 10), 16)
            );
            containerRef.current.appendChild(identicon);
        }
    }, [diameter, address]);

    // Render an empty div with the ref to attach the identicon
    return <td ref={containerRef} />;
}

export default Jazzicon;
