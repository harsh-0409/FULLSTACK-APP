import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './style.css'
import config from './config.js'

const EmployeeManager = () => {
  const [employees, setEmployees] = useState([])
  const [employee, setEmployee] = useState({
    id: '',
    name: '',
    gender: '',
    department: '',
    role: '',
    email: '',
    password: '',
    contact: '',
    salary: ''
  })
  const [idToFetch, setIdToFetch] = useState('')
  const [fetchedEmployee, setFetchedEmployee] = useState(null)
  const [message, setMessage] = useState('')
  const [editMode, setEditMode] = useState(false)

  const baseUrl = `${config.url}/employeeapi`

  useEffect(() => { fetchAllEmployees() }, [])

  const fetchAllEmployees = async () => {
    try {
      const res = await axios.get(`${baseUrl}/all`)
      setEmployees(res.data)
    } catch (err) {
      setMessage(`Failed to fetch employees: ${err?.response?.data || err.message}`)
    }
  }

  const handleChange = (e) => setEmployee({ ...employee, [e.target.name]: e.target.value })

  const validateForm = (requireId) => {
    const required = ['name','gender','department','role','email','password','contact','salary']
    if (requireId) required.unshift('id')
    for (let key of required) {
      if (!employee[key] || employee[key].toString().trim() === '') {
        setMessage(`Please fill out the ${key} field.`)
        return false
      }
    }
    return true
  }

  const addEmployee = async () => {
    if (!validateForm(false)) return
    try {
      const { id, ...rest } = employee
      const payload = { ...rest, salary: parseFloat(employee.salary) }
      const res = await axios.post(`${baseUrl}/add`, payload)
      setMessage('Employee added successfully.')
      fetchAllEmployees(); resetForm()
      setFetchedEmployee(res.data)
    } catch (err) {
      setMessage(`Error adding employee: ${err?.response?.data || err.message}`)
    }
  }

  const updateEmployee = async () => {
    if (!validateForm(true)) return
    try {
      const payload = { ...employee, salary: parseFloat(employee.salary) }
      await axios.put(`${baseUrl}/update`, payload)
      setMessage('Employee updated successfully.')
      fetchAllEmployees(); resetForm()
    } catch (err) {
      setMessage(`Error updating employee: ${err?.response?.data || err.message}`)
    }
  }

  const deleteEmployee = async (id) => {
    try {
      const res = await axios.delete(`${baseUrl}/delete/${id}`)
      setMessage(res.data)
      fetchAllEmployees()
    } catch (err) {
      setMessage(`Error deleting employee: ${err?.response?.data || err.message}`)
    }
  }

  const getEmployeeById = async () => {
    try {
      const res = await axios.get(`${baseUrl}/get/${idToFetch}`)
      setFetchedEmployee(res.data); setMessage('')
    } catch (err) {
      setFetchedEmployee(null)
      setMessage(`Employee not found: ${err?.response?.data || err.message}`)
    }
  }

  const handleEdit = (emp) => { setEmployee(emp); setEditMode(true); setMessage(`Editing employee with ID ${emp.id}`) }

  const resetForm = () => {
    setEmployee({ id: '', name: '', gender: '', department: '', role: '', email: '', password: '', contact: '', salary: '' })
    setEditMode(false)
  }

  return (
    <div className="student-container">
      {message && (
        <div className={`message-banner ${message.toLowerCase().includes('error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <h2>Employee Management</h2>

      <div id="add">
        <h3>{editMode ? 'Edit Employee' : 'Add Employee'}</h3>
        <div className="form-grid">
          {/* Hide ID input when adding; needed for update */}
          <input type="number" name="id" placeholder="ID" value={employee.id} onChange={handleChange} disabled={!editMode} />
          <input type="text" name="name" placeholder="Name" value={employee.name} onChange={handleChange} />
          <select name="gender" value={employee.gender} onChange={handleChange}>
            <option value="">Select Gender</option>
            <option value="MALE">MALE</option>
            <option value="FEMALE">FEMALE</option>
          </select>
          <input type="text" name="department" placeholder="Department" value={employee.department} onChange={handleChange} />
          <input type="text" name="role" placeholder="Role" value={employee.role} onChange={handleChange} />
          <input type="email" name="email" placeholder="Email" value={employee.email} onChange={handleChange} />
          <input type="password" name="password" placeholder="Password" value={employee.password} onChange={handleChange} />
          <input type="text" name="contact" placeholder="Contact" value={employee.contact} onChange={handleChange} />
          <input type="number" name="salary" placeholder="Salary" value={employee.salary} onChange={handleChange} />
        </div>

        <div className="btn-group">
          {!editMode ? (
            <button className="btn-blue" onClick={addEmployee}>Add Employee</button>
          ) : (
            <>
              <button className="btn-green" onClick={updateEmployee}>Update Employee</button>
              <button className="btn-gray" onClick={resetForm}>Cancel</button>
            </>
          )}
        </div>
      </div>

      <div id="get-by-id">
        <h3>Get Employee By ID</h3>
        <input type="number" value={idToFetch} onChange={(e) => setIdToFetch(e.target.value)} placeholder="Enter ID" />
        <button className="btn-blue" onClick={getEmployeeById}>Fetch</button>
        {fetchedEmployee && (
          <div>
            <h4>Employee Found:</h4>
            <pre>{JSON.stringify(fetchedEmployee, null, 2)}</pre>
          </div>
        )}
      </div>

      <div id="all">
        <h3>All Employees</h3>
        {employees.length === 0 ? (
          <p>No employees found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {Object.keys(employee).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    {Object.keys(employee).map((key) => (
                      <td key={key}>{emp[key]}</td>
                    ))}
                    <td>
                      <div className="action-buttons">
                        <button className="btn-green" onClick={() => handleEdit(emp)}>Edit</button>
                        <button className="btn-red" onClick={() => deleteEmployee(emp.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}

export default EmployeeManager
