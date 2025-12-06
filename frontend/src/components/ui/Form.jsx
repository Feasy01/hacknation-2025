import { useState } from 'react';

const Form = ({ onSubmit, children, defaultValues = {}, className = '' }) => {
  const [values, setValues] = useState(defaultValues);
  const [errors, setErrors] = useState({});

  const handleChange = (name, value) => setValues((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    const validation = onSubmit?.(values);
    if (validation?.errors) {
      setErrors(validation.errors);
    }
  };

  return (
    <form className={`space-y-4 ${className}`} onSubmit={handleSubmit}>
      {typeof children === 'function' ? children({ values, errors, setValues: handleChange }) : children}
    </form>
  );
};

export default Form;
