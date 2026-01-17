import { useForm } from "react-hook-form";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router";

function Login() {
  const { register, handleSubmit } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const loggedUser = await login(data);

    if (loggedUser.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>Login</h2>
      <label>
        Email
        <input {...register("email")} />
      </label>
      <label>
        Password
        <input type="password" {...register("password")} />
      </label>

      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
