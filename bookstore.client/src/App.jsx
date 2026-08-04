import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Home from './Pages/Home'
import Register from './Pages/Register'
import Login from './Pages/Login'
import AdminDashboard from './Pages/admin/AdminDashboard'
import Authors from './Pages/admin/Books'
import Books from './Pages/admin/Books'
import Categories from './Pages/admin/Categories'
import Publishers from './Pages/admin/Publishers'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/login' element={<Login/>}/>

        {/* Admin */}
        <Route path='/admin' element={<AdminDashboard/>}/>
        <Route path='/admin/author' element={<Authors/>}/>
        <Route path='/admin/books' element={<Books/>}/>
        <Route path='/admin/categories' element={<Categories/>}/>
        <Route path='/admin/publishers' element={<Publishers/>}/>

      </Routes>
    </>
  )
}

export default App
