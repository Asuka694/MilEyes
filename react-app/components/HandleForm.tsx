import React, { useState } from "react";

interface FormInput {
  id: number;
  value: string;
}

export default function HandleForm() {
  const [inputs, setInputs] = useState<FormInput[]>([{ id: 1, value: "" }]);

  const handleInputChange = (id: number, value: string) => {
    const newInputs = inputs.map((input) =>
      input.id === id ? { ...input, value } : input
    );
    setInputs(newInputs);
  };

  const handleAddInput = () => {
    const newInput = { id: inputs.length + 1, value: "" };
    setInputs([...inputs, newInput]);
  };

  const handleSubmit = () => {
    const formData = inputs.reduce(
      (acc, input) => ({ ...acc, [`${input.id}`]: input.value }),
      {}
    );

    const transformedObject = {};

    for (const key in formData) {
      if (key % 2 !== 0) {
        transformedObject[formData[key]] = formData[Number(key) + 1];
      }
    }
    
    const jsonString = JSON.stringify(transformedObject);
    console.log(jsonString);
  };

  return (
    <div>
      {inputs.map((input) => (
        <>
        <input
          className="submitButton"
          key={input.id}
          value={input.value}
          onChange={(e) => handleInputChange(input.id, e.target.value)}
        />
      </>
      ))}
      <button className="submitButton" onClick={handleAddInput}>Add Input</button>
      <button className="submitButton" onClick={handleSubmit}>Submit</button>
    </div>
  );
};