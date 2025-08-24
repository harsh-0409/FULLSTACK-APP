import React from 'react'
import './style.css'

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-content">
        <div className="brand">Employee Manager</div>
        <div className="nav-links">
          <a href="#add">Add / Edit</a>
          <a href="#get-by-id">Get by ID</a>
          <a href="#all">All Employees</a>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
