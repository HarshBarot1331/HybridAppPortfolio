import { useState } from 'react';
import ProductForm from './components/ProductForm';
import ProductList from './components/ProductList';
import './App.css';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleProductAdded = () => {
   
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1 className="app-title">Inventory Management System</h1>
      </header>
      <main className="app-main">
        <ProductForm onProductAdded={handleProductAdded} />
        <ProductList refreshTrigger={refreshTrigger} />
      </main>
    </div>
  );
}

export default App;


