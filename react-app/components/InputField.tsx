import { InputHTMLAttributes } from "react";

function InputField({
    label,
    value,
    onChange,
    type,
    placeholder,
    className,
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
    return (
        <div className={className}>
            <label
                htmlFor="first_name"
                className={`block mb-2 font-medium text-gray-500 `}
            >
                {label}
            </label>
            <input
                type={type}
                id="first_name"
                className={`bg-white border border-black text-black text-base focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${className}`}
                placeholder={placeholder ?? ""}
                required
                value={value}
                onChange={onChange}
            />
        </div>
    );
}

export default InputField;
