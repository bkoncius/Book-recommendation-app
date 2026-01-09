import { useState, useEffect } from 'react'
import axios from 'axios';
function App() {
  const [message, setMessage] = useState('');

  const fetchAPI = async () =>{
    try {
      const response = await axios.get("http://localhost:5000/api");
      setMessage(response.data.message);
    } catch (error) {
      console.error("Error fetching data:", error)
      setMessage("failed to connect to backend")
    }
  };
    
  useEffect(()=>{
    fetchAPI();

  },[])

  return (
    <>
      <h1>Book recommendation</h1>
      <p>Backend status: {message} </p>
    </>
  )
}

export default App
