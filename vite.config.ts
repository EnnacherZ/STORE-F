import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
//import fs from 'fs'; // Node.js File System module


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // server: {
  //   https: {
  //     key: fs.readFileSync('./key.pem'), // Path to your key
  //     cert: fs.readFileSync('./cert.pem'), // Path to your certificate
  //   },
  //   host: 'localhost', // Ensure it listens on localhost
  //   port: 5173, // Or your preferred port
  // },
});
