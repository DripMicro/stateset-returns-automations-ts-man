import { useRef, useEffect } from "react";
import { TextField as PolarisTextField } from "@shopify/polaris";

const TextArea = ({ ...props }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = ref.current;
        const input = element && element.querySelector("input");

        if (input) {
            input.required = props.required;
        }
    }, [ref, props.required]);

    return (
        <div ref={ref}>
            {/* @ts-ignore */}
            <PolarisTextField {...props} />
        </div>
    );
};

export default TextArea;
