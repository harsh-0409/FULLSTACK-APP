import Navbar from './components/Navbar'
import EmployeeManager from './components/EmployeeManager'

function App() {
  return (
    <>
      <Navbar />
      <main className="app-main">
        <EmployeeManager />
      </main>
    </>
  )
}

export default App
