import axios from "axios";
import { useState } from "react";

const useRequest = ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState(null);

  const doRequest = async () => {
    try {
      setErrors(null);
      const response = await axios[method](url, body);

      if (onSuccess) {
        onSuccess(response.data); //Success callback other solution to manage routing logic
      }

      return response.data;
    } catch (err) {
      setErrors(
        <div className="alert alert-danger mt-2">
          <h4>Oooops....</h4>
          <ul className="my-0">
            {err.response.data.errors.map((err) => (
              <li key={err.message}> {err.message}</li>
            ))}
          </ul>
        </div>
      );
      // throw err; //Rethrowing the error for sake of routing issue - one solution
    }
  };

  return { doRequest, errors };
};

export default useRequest;
