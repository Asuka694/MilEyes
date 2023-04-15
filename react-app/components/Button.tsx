import { ButtonHTMLAttributes } from "react";
import { toast } from "react-hot-toast";

type Props = {
    text: string;
    onClick: () => void;
    varient?: "primary" | "secondary";
    icon?: React.ReactNode;
    isLoading?: boolean;
    disabled: boolean;
};

const Button: React.FC<Props> = ({
    text,
    onClick,
    varient = "primary",
    icon,
    isLoading = false,
    disabled,
}) => {
    const getBgColor = () => {
        switch (varient) {
            case "primary":
                return "bg-primary";
            case "secondary":
                return "bg-white";
        }
    };

    return (
        <button
            onClick={() => {
                if (!isLoading) {
                    onClick();
                } else {
                    toast.error("It's loading, please wait...");
                }
            }}
            disabled={disabled}
            className="pushable select-none rounded-sm bg-black border-none p-0 cursor-pointer outline-offset-4"
        >
            <span
                className={`front rounded-sm border-2 border-black text-black font-bold text-base block py-2 px-6 ${getBgColor()}`}
            >
                {isLoading ? (
                    <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    </div>
                ) : (
                    <div className="inline-flex items-center">
                        {icon ?? icon}
                        <span
                            className={`text-white ${icon ? "ml-1" : "ml-0"}`}
                        >
                            {text}
                        </span>
                    </div>
                )}
            </span>
        </button>
    );
};

export default Button;
